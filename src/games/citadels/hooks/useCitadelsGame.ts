// Citadels — Game State Machine Hook (Host-authoritative)

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  CitadelsState, CitadelsPlayer, CitadelsBroadcast, DistrictCard,
  DraftState, EffectContext, TaxEntry, BuiltDistrict, ScoreBreakdown,
} from '../types';
import { getCharacterById, ALL_CHARACTERS } from '../characters';
import { getDistrictById, buildDeck, randomViola, PRESETS, ALL_VIOLA } from '../districts';
import {
  createInitialState, setupDraft, pickCharacter, assignCharacters,
  getCallOrder, findPlayerByCharacter, countDistrictsByColor,
  hasBuiltDistrict, countBuiltDistricts, checkGameEnd, calculateScore,
  shuffle, drawCards, returnToBottom, canBuild,
} from '../gameLogic';
import { RoomPlayer } from './useCitadelsRoom';

interface UseCitadelsGameProps {
  playerId: string;
  isHost: boolean;
  players: RoomPlayer[];
  broadcast: (event: CitadelsBroadcast) => void;
  onBroadcast: (callback: (event: CitadelsBroadcast) => void) => void;
}

export function useCitadelsGame({ playerId, isHost, players, broadcast, onBroadcast }: UseCitadelsGameProps) {
  const [state, setState] = useState<CitadelsState>(createInitialState());
  const stRef = useRef(state);
  stRef.current = state;

  const sync = useCallback((s: CitadelsState) => {
    stRef.current = s;
    setState(s);
    broadcast({ type: 'sync', state: s });
  }, [broadcast]);

  // Use a ref for proc so broadcast handler always calls latest version
  const procRef = useRef<(action: string, payload: any) => void>(() => {});

  // Listen for broadcast events
  useEffect(() => {
    onBroadcast((event) => {
      if (event.type === 'sync') {
        // All players receive state sync from host
        stRef.current = event.state;
        setState(event.state);
      } else if (event.type === 'action') {
        // Host processes action events from all players
        procRef.current(event.action, event.payload);
      }
    });
  }, [onBroadcast]);

  // ---- ACTION PROCESSOR ----
  const proc: (action: string, payload: any) => void = useCallback((action: string, payload: any): void => {
    if (!isHost) return;
    const s = { ...stRef.current };

    // ========== LOBBY -> START ==========
    if (action === 'start') {
      const { characterPool, violaPool, presetName } = payload;
      const deck = buildDeck(violaPool);
      const initialHand = 4; // each player starts with 4 cards

      // Deal initial hands
      let deckCopy = [...deck];
      const gamePlayers: CitadelsPlayer[] = players.map((p, i) => {
        const hand = deckCopy.slice(0, initialHand);
        deckCopy = deckCopy.slice(initialHand);
        return {
          id: p.id, name: p.name, seatIndex: i,
          gold: 2, hand, builtDistricts: [],
          characterId: null, hasCrown: i === 0, // first player gets crown initially
          hasGathered: false, buildsUsed: 0, maxBuilds: 1,
          hasUsedEffect: false, goldSpentThisTurn: 0,
          isAlive: true, isBewitched: false,
          magistrateToken: null, blackmailerToken: null, blackmailerPaid: false,
        };
      });

      // Random crown holder
      const crownIdx = Math.floor(Math.random() * gamePlayers.length);
      gamePlayers.forEach((p, i) => { p.hasCrown = i === crownIdx; });

      const ns: CitadelsState = {
        ...createInitialState(),
        phase: 'draft',
        roomCode: s.roomCode,
        players: gamePlayers,
        characterPool,
        violaPool,
        presetName,
        districtDeck: deckCopy,
        discardPile: [],
        roundNumber: 1,
        crownHolderId: gamePlayers[crownIdx].id,
        draftState: setupDraft(characterPool, gamePlayers.length, gamePlayers[crownIdx].id, gamePlayers),
      };
      sync(ns);
    }

    // ========== DRAFT: PICK CHARACTER ==========
    else if (action === 'pick-character') {
      const { pId, charId } = payload;
      if (!s.draftState || s.draftState.phase !== 'picking') return;
      const currentPicker = s.draftState.pickOrder[s.draftState.currentPickerIndex];
      if (pId !== currentPicker) return;

      const newDraft = pickCharacter(s.draftState, pId, charId, s.players.length);

      // Handle 9-player special: if 8th picked, 9th gets the remaining card
      if (s.players.length === 9 && Object.keys(newDraft.picks).length === 8) {
        const ninthPlayer = newDraft.pickOrder[8];
        const remaining = newDraft.remainingIds[0];
        if (remaining && ninthPlayer) {
          newDraft.picks[ninthPlayer] = remaining;
          newDraft.remainingIds = [];
          newDraft.phase = 'done';
        }
      }

      if (newDraft.phase === 'done') {
        // Assign characters
        const newPlayers = assignCharacters(s.players, newDraft);
        // Set up turn calling
        const callOrder = getCallOrder(s.characterPool, newPlayers);
        const ns: CitadelsState = {
          ...s,
          draftState: newDraft,
          players: newPlayers,
          phase: 'turn-call',
          currentRank: 0,
          calledRanks: [],
          assassinatedRank: null,
          robbedRank: null,
          bewitchedRank: null,
          taxPool: [],
          effectContext: null,
          drawnCards: null,
        };
        sync(ns);
      } else {
        sync({ ...s, draftState: newDraft });
      }
    }

    // ========== CALL NEXT RANK ==========
    else if (action === 'call-next-rank') {
      const callOrder = getCallOrder(s.characterPool, s.players);
      const calledSoFar = s.calledRanks;
      const nextChar = callOrder.find(cId => !calledSoFar.includes(getCharacterById(cId).rank));

      if (!nextChar) {
        // All ranks called — end round
        resolveRoundEnd(s);
        return;
      }

      const charInfo = getCharacterById(nextChar);
      const rank = charInfo.rank;
      const player = findPlayerByCharacter(s.players, nextChar);

      // Check if this rank was assassinated
      if (s.assassinatedRank === rank) {
        // Skip turn, but if rank 4, reveal at round end (handled in resolveRoundEnd)
        const ns = {
          ...s,
          calledRanks: [...s.calledRanks, rank],
          currentRank: rank,
        };
        // Auto-advance to next
        sync(ns);
        // Immediately call next
        setTimeout(() => proc('call-next-rank', {}), 800);
        return;
      }

      if (!player) {
        // Nobody has this character (it was face-down/face-up)
        const ns = { ...s, calledRanks: [...s.calledRanks, rank], currentRank: rank };
        sync(ns);
        setTimeout(() => proc('call-next-rank', {}), 500);
        return;
      }

      // Apply robbery if this rank was robbed
      let updatedPlayers = [...s.players];
      if (s.robbedRank === rank) {
        const thief = updatedPlayers.find(p => {
          const ch = p.characterId ? getCharacterById(p.characterId) : null;
          return ch && ch.rank === 2;
        });
        if (thief) {
          const stolenGold = player.gold;
          updatedPlayers = updatedPlayers.map(p => {
            if (p.id === player.id) return { ...p, gold: 0 };
            if (p.id === thief.id) return { ...p, gold: p.gold + stolenGold };
            return p;
          });
        }
      }

      // Apply blackmail check
      if (player.blackmailerToken) {
        // Player needs to decide: pay or keep — set up effect context
        const ns: CitadelsState = {
          ...s,
          players: updatedPlayers,
          calledRanks: [...s.calledRanks, rank],
          currentRank: rank,
          activePlayerId: player.id,
          phase: 'effect-active',
          effectContext: { type: 'blackmailer-decide', data: { targetId: player.id } },
        };
        sync(ns);
        return;
      }

      // Check if bewitched
      if (s.bewitchedRank === rank) {
        // Bewitched player gathers resources, then witch takes over
        const ns: CitadelsState = {
          ...s,
          players: updatedPlayers,
          calledRanks: [...s.calledRanks, rank],
          currentRank: rank,
          activePlayerId: player.id,
          phase: 'turn-action',
          effectContext: { type: 'bewitched-gather', data: { targetId: player.id } },
        };
        // Reset turn state for this player
        const resetPlayers = ns.players.map(p =>
          p.id === player.id ? { ...p, hasGathered: false, buildsUsed: 0, maxBuilds: 1, hasUsedEffect: false, goldSpentThisTurn: 0 } : p
        );
        sync({ ...ns, players: resetPlayers });
        return;
      }

      // Normal turn
      const resetPlayers = updatedPlayers.map(p => {
        if (p.id === player.id) {
          // Determine max builds based on character
          let maxBuilds = 1;
          if (charInfo.id === 19) maxBuilds = 3; // Architetto
          if (charInfo.id === 9 || charInfo.id === 20) maxBuilds = 2; // Veggente, Studioso
          return { ...p, hasGathered: false, buildsUsed: 0, maxBuilds, hasUsedEffect: false, goldSpentThisTurn: 0 };
        }
        return p;
      });

      const ns: CitadelsState = {
        ...s,
        players: resetPlayers,
        calledRanks: [...s.calledRanks, rank],
        currentRank: rank,
        activePlayerId: player.id,
        phase: 'turn-action',
        effectContext: null,
        drawnCards: null,
      };
      sync(ns);
    }

    // ========== GATHER RESOURCES ==========
    else if (action === 'gather-gold') {
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p || p.hasGathered) return;

      let goldAmount = 2;
      // Miniera d'Oro (513)
      if (hasBuiltDistrict(p, 513)) goldAmount += 1;

      // Navigator doubles: handled separately via 'navigator-gather'

      const ns = {
        ...s,
        players: s.players.map(pl => pl.id === p.id ? { ...pl, gold: pl.gold + goldAmount, hasGathered: true } : pl),
      };
      sync(ns);
    }

    else if (action === 'gather-cards') {
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p || p.hasGathered) return;

      let drawCount = 2;
      // Osservatorio (518): draw 3 instead of 2
      if (hasBuiltDistrict(p, 518)) drawCount = 3;
      // Studioso (20): draw 7
      if (p.characterId === 20) drawCount = 7;

      const { drawn, remaining } = drawCards(s.districtDeck, drawCount);

      // Biblioteca (503): keep all
      if (hasBuiltDistrict(p, 503)) {
        const ns = {
          ...s,
          districtDeck: remaining,
          players: s.players.map(pl => pl.id === p.id ? { ...pl, hand: [...pl.hand, ...drawn], hasGathered: true } : pl),
        };
        sync(ns);
      } else {
        // Must choose 1 to keep, rest go to bottom
        // Architetto (19): keep 1, draw 2 extra after
        const ns: CitadelsState = {
          ...s,
          districtDeck: remaining,
          drawnCards: drawn,
          phase: 'effect-active',
          effectContext: { type: 'pick-card-from-drawn', data: { playerId: p.id, keepCount: 1 } },
        };
        sync(ns);
      }
    }

    else if (action === 'pick-drawn-card') {
      const { cardUid } = payload;
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p || !s.drawnCards) return;

      const kept = s.drawnCards.find(c => c.uid === cardUid)!;
      const discarded = s.drawnCards.filter(c => c.uid !== cardUid);
      let newDeck = returnToBottom(s.districtDeck, discarded);

      let extraCards: DistrictCard[] = [];
      // Architetto (19): after picking, draw 2 extra (no condition)
      if (p.characterId === 19) {
        const { drawn: extra, remaining } = drawCards(newDeck, 2);
        extraCards = extra;
        newDeck = remaining;
      }

      const ns = {
        ...s,
        districtDeck: newDeck,
        drawnCards: null,
        phase: 'turn-action' as const,
        effectContext: null,
        players: s.players.map(pl => pl.id === p.id
          ? { ...pl, hand: [...pl.hand, kept, ...extraCards], hasGathered: true }
          : pl
        ),
      };
      sync(ns as CitadelsState);
    }

    // ========== BUILD DISTRICT ==========
    else if (action === 'build-district') {
      const { cardUid } = payload;
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p) return;

      const card = p.hand.find(c => c.uid === cardUid);
      if (!card) return;

      const district = getDistrictById(card.districtId);
      const check = canBuild(p, card, s);
      if (!check.ok) return;

      let cost = district.cost;
      if (district.isUnique && hasBuiltDistrict(p, 507)) cost = Math.max(0, cost - 1);

      // Check if Scuderie (525) — doesn't count toward build limit
      const isScuderie = district.id === 525;

      // Check build limit
      if (!isScuderie && p.buildsUsed >= p.maxBuilds) return;

      // Tassatore tax: if Tassatore (27) is in the game, add 1 to tax pool
      let newTaxPool = [...s.taxPool];
      const hasTassatore = s.characterPool.includes(27);
      if (hasTassatore && !isScuderie) {
        // Only if Tassatore is not this player's character
        const tassatorePlayer = s.players.find(pl => pl.characterId === 27);
        if (tassatorePlayer && tassatorePlayer.id !== p.id) {
          if (p.gold >= cost + 1) {
            newTaxPool.push({ playerId: p.id, amount: 1 });
            cost += 0; // Tax is separate, deducted from gold separately
          }
        }
      }

      // Deduct gold + tax
      let taxAmount = 0;
      if (hasTassatore) {
        const tassatorePlayer = s.players.find(pl => pl.characterId === 27);
        if (tassatorePlayer && tassatorePlayer.id !== p.id && !isScuderie) taxAmount = 1;
      }

      const totalCost = cost + taxAmount;
      if (p.gold < totalCost) return;

      const newBuilt: BuiltDistrict = {
        uid: card.uid, districtId: card.districtId, artisanCoins: 0, museumCards: 0,
      };

      // Patrizio (12): draw a card when building
      let extraDraw: DistrictCard[] = [];
      let newDeck = s.districtDeck;
      if (p.characterId === 12) {
        const { drawn, remaining } = drawCards(s.districtDeck, 1);
        extraDraw = drawn;
        newDeck = remaining;
      }

      // Magistrato token check
      let magistrateSteal = false;
      if (p.magistrateToken === 'real') {
        magistrateSteal = true;
      }

      const updatedPlayers = s.players.map(pl => {
        if (pl.id === p.id) {
          return {
            ...pl,
            gold: pl.gold - totalCost,
            goldSpentThisTurn: pl.goldSpentThisTurn + cost,
            hand: pl.hand.filter(c => c.uid !== cardUid),
            builtDistricts: magistrateSteal ? pl.builtDistricts : [...pl.builtDistricts, newBuilt],
            buildsUsed: isScuderie ? pl.buildsUsed : pl.buildsUsed + 1,
            magistrateToken: null,
          };
        }
        // If magistrate steals, give district to magistrate
        if (magistrateSteal && pl.characterId && getCharacterById(pl.characterId).rank === 1 && pl.characterId === 2) {
          return {
            ...pl,
            builtDistricts: [...pl.builtDistricts, newBuilt],
          };
        }
        return pl;
      });

      // If magistrate stole, refund gold to builder
      let finalPlayers = updatedPlayers;
      if (magistrateSteal) {
        finalPlayers = finalPlayers.map(pl => pl.id === p.id ? { ...pl, gold: pl.gold + cost } : pl);
      }

      // Add extra drawn card (Patrizio)
      if (extraDraw.length > 0) {
        finalPlayers = finalPlayers.map(pl =>
          pl.id === p.id ? { ...pl, hand: [...pl.hand, ...extraDraw] } : pl
        );
      }

      // Check game end trigger
      const builder = finalPlayers.find(pl => pl.id === p.id)!;
      let gameEndTriggered = s.gameEndTriggered;
      let firstTo7 = s.firstTo7PlayerId;
      if (!gameEndTriggered && countBuiltDistricts(builder) >= 7) {
        gameEndTriggered = true;
        firstTo7 = p.id;
      }

      sync({
        ...s,
        players: finalPlayers,
        districtDeck: newDeck,
        taxPool: newTaxPool,
        gameEndTriggered,
        firstTo7PlayerId: firstTo7,
        gameEndRound: gameEndTriggered && !s.gameEndTriggered ? s.roundNumber : s.gameEndRound,
      });
    }

    // ========== CARDINAL BUILD (pay with cards given to another player) ==========
    else if (action === 'cardinal-build') {
      const { cardUid, targetPlayerId, cardUidsToGive } = payload;
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!p || !target || p.characterId !== 15) return;

      const card = p.hand.find(c => c.uid === cardUid);
      if (!card) return;
      const district = getDistrictById(card.districtId);
      const cost = district.cost;

      // Cards to give (each = 1 gold from target)
      const cardsToGive = cardUidsToGive.length;
      if (cardsToGive > cost || cardsToGive > target.gold) return;

      const goldFromOwn = cost - cardsToGive;
      if (p.gold < goldFromOwn) return;

      // Validate all card uids exist in hand (excluding the district being built)
      const handWithoutBuilt = p.hand.filter(c => c.uid !== cardUid);
      const givenCards = cardUidsToGive.map((uid: string) => handWithoutBuilt.find(c => c.uid === uid)).filter(Boolean) as DistrictCard[];
      if (givenCards.length !== cardsToGive) return;

      const newBuilt: BuiltDistrict = {
        uid: card.uid, districtId: card.districtId, artisanCoins: 0, museumCards: 0,
      };

      const givenUidSet = new Set(cardUidsToGive as string[]);
      const updatedPlayers = s.players.map(pl => {
        if (pl.id === p.id) {
          return {
            ...pl,
            gold: pl.gold - goldFromOwn,
            goldSpentThisTurn: pl.goldSpentThisTurn + cost,
            hand: pl.hand.filter(c => c.uid !== cardUid && !givenUidSet.has(c.uid)),
            builtDistricts: [...pl.builtDistricts, newBuilt],
            buildsUsed: pl.buildsUsed + 1,
            hasUsedEffect: true,
          };
        }
        if (pl.id === targetPlayerId) {
          return {
            ...pl,
            gold: pl.gold - cardsToGive,
            hand: [...pl.hand, ...givenCards],
          };
        }
        return pl;
      });

      // Check game end
      const builder = updatedPlayers.find(pl => pl.id === p.id)!;
      let gameEndTriggered = s.gameEndTriggered;
      let firstTo7 = s.firstTo7PlayerId;
      if (!gameEndTriggered && countBuiltDistricts(builder) >= 7) {
        gameEndTriggered = true;
        firstTo7 = p.id;
      }

      sync({
        ...s,
        players: updatedPlayers,
        gameEndTriggered,
        firstTo7PlayerId: firstTo7,
        gameEndRound: gameEndTriggered && !s.gameEndTriggered ? s.roundNumber : s.gameEndRound,
      });
    }

    // ========== END TURN ==========
    else if (action === 'end-turn') {
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p) return;

      let updatedPlayers = [...s.players];

      // Alchimista (17): refund gold spent on building
      if (p.characterId === 17) {
        updatedPlayers = updatedPlayers.map(pl =>
          pl.id === p.id ? { ...pl, gold: pl.gold + pl.goldSpentThisTurn } : pl
        );
      }

      // Ospizio (517): if 0 gold at end of turn, gain 1
      const playerAfter = updatedPlayers.find(pl => pl.id === p.id)!;
      if (hasBuiltDistrict(playerAfter, 517) && playerAfter.gold === 0) {
        updatedPlayers = updatedPlayers.map(pl =>
          pl.id === p.id ? { ...pl, gold: pl.gold + 1 } : pl
        );
      }

      // Parco (519): if 0 cards at end of turn, draw 2
      let newDeck = s.districtDeck;
      const playerFinal = updatedPlayers.find(pl => pl.id === p.id)!;
      if (hasBuiltDistrict(playerFinal, 519) && playerFinal.hand.length === 0) {
        const { drawn, remaining } = drawCards(newDeck, 2);
        newDeck = remaining;
        updatedPlayers = updatedPlayers.map(pl =>
          pl.id === p.id ? { ...pl, hand: [...pl.hand, ...drawn] } : pl
        );
      }

      sync({
        ...s,
        players: updatedPlayers,
        districtDeck: newDeck,
        activePlayerId: null,
        phase: 'turn-call',
        effectContext: null,
      });

      // Auto-call next rank
      setTimeout(() => proc('call-next-rank', {}), 500);
    }

    // ========== CHARACTER INCOME ==========
    else if (action === 'collect-income') {
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p || !p.characterId) return;

      const char = getCharacterById(p.characterId);
      if (!char.incomeColor) return;

      let color = char.incomeColor;
      // Scuola di Magia (524) counts as chosen color
      // For simplicity, handled via separate action 'set-magic-school-color'

      const count = countDistrictsByColor(p, color);
      if (count === 0) return;

      // Some chars get gold, some get cards, some choose
      // Abate (14): gold or card per blue
      // Patrizio (12): gold or card per yellow
      // Others: gold per color

      let goldIncome = count;
      // Mercante (16): +1 extra gold
      if (char.id === 16) goldIncome += 1;

      const updatedPlayers = s.players.map(pl =>
        pl.id === p.id ? { ...pl, gold: pl.gold + goldIncome } : pl
      );
      sync({ ...s, players: updatedPlayers });
    }

    // ========== EFFECT: ASSASSIN ==========
    else if (action === 'assassin-target') {
      const { targetRank } = payload;
      sync({ ...s, assassinatedRank: targetRank, phase: 'turn-action' });
    }

    // ========== EFFECT: THIEF ==========
    else if (action === 'thief-target') {
      const { targetRank } = payload;
      // Can't target rank 1 or assassinated rank
      if (targetRank === 1 || targetRank === s.assassinatedRank) return;
      sync({ ...s, robbedRank: targetRank, phase: 'turn-action' });
    }

    // ========== EFFECT: WIZARD (SWAP HANDS) ==========
    else if (action === 'wizard-swap') {
      const { targetPlayerId } = payload;
      const wizard = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!wizard || !target) return;

      const updatedPlayers = s.players.map(pl => {
        if (pl.id === wizard.id) return { ...pl, hand: [...target.hand] };
        if (pl.id === target.id) return { ...pl, hand: [...wizard.hand] };
        return pl;
      });
      sync({ ...s, players: updatedPlayers, phase: 'turn-action', effectContext: null });
    }

    // ========== EFFECT: WIZARD (DISCARD & REDRAW) ==========
    else if (action === 'wizard-discard') {
      const { cardUids } = payload as { cardUids: string[] };
      const wizard = s.players.find(pl => pl.id === s.activePlayerId);
      if (!wizard) return;

      const discarded = wizard.hand.filter(c => cardUids.includes(c.uid));
      const remaining = wizard.hand.filter(c => !cardUids.includes(c.uid));
      let newDeck = returnToBottom(s.districtDeck, discarded);
      const { drawn, remaining: deckAfter } = drawCards(newDeck, discarded.length);

      const updatedPlayers = s.players.map(pl =>
        pl.id === wizard.id ? { ...pl, hand: [...remaining, ...drawn] } : pl
      );
      sync({ ...s, players: updatedPlayers, districtDeck: deckAfter, phase: 'turn-action', effectContext: null });
    }

    // ========== EFFECT: KING / CROWN ==========
    else if (action === 'take-crown') {
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p) return;
      const updatedPlayers = s.players.map(pl => ({
        ...pl, hasCrown: pl.id === p.id,
      }));
      sync({ ...s, players: updatedPlayers, crownHolderId: p.id });
    }

    // ========== EFFECT: EMPEROR (GIVE CROWN) ==========
    else if (action === 'emperor-give-crown') {
      const { targetPlayerId, paymentType } = payload;
      const emperor = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!emperor || !target || target.id === emperor.id) return;

      let updatedPlayers = s.players.map(pl => ({
        ...pl, hasCrown: pl.id === targetPlayerId,
      }));

      // Target pays emperor 1 gold or 1 card
      if (paymentType === 'gold' && target.gold > 0) {
        updatedPlayers = updatedPlayers.map(pl => {
          if (pl.id === target.id) return { ...pl, gold: pl.gold - 1 };
          if (pl.id === emperor.id) return { ...pl, gold: pl.gold + 1 };
          return pl;
        });
      } else if (paymentType === 'card' && target.hand.length > 0) {
        const cardToGive = target.hand[0]; // first card
        updatedPlayers = updatedPlayers.map(pl => {
          if (pl.id === target.id) return { ...pl, hand: pl.hand.slice(1) };
          if (pl.id === emperor.id) return { ...pl, hand: [...pl.hand, cardToGive] };
          return pl;
        });
      }

      sync({ ...s, players: updatedPlayers, crownHolderId: targetPlayerId, phase: 'turn-action', effectContext: null });
    }

    // ========== EFFECT: WARLORD (DESTROY DISTRICT) ==========
    else if (action === 'warlord-destroy') {
      const { targetPlayerId, districtUid } = payload;
      const warlord = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!warlord || !target) return;

      // Can't target player with 7+ districts
      if (countBuiltDistricts(target) >= 7) return;

      const bd = target.builtDistricts.find(b => b.uid === districtUid);
      if (!bd) return;

      const district = getDistrictById(bd.districtId);
      let destroyCost = district.cost - 1; // Warlord pays cost-1

      // Mastio (512): immune
      if (bd.districtId === 512) return;
      // Vescovo (13): immune to rank 8
      if (target.characterId === 13) return;

      // Grande Muraglia (509): +1 cost
      if (hasBuiltDistrict(target, 509) && bd.districtId !== 509) destroyCost += 1;

      if (warlord.gold < destroyCost) return;

      const updatedPlayers = s.players.map(pl => {
        if (pl.id === warlord.id) return { ...pl, gold: pl.gold - destroyCost };
        if (pl.id === target.id) return { ...pl, builtDistricts: pl.builtDistricts.filter(b => b.uid !== districtUid) };
        return pl;
      });

      // Destroyed district goes to discard
      const discarded: DistrictCard = { uid: bd.uid, districtId: bd.districtId };

      sync({
        ...s,
        players: updatedPlayers,
        discardPile: [...s.discardPile, discarded],
        phase: 'turn-action',
        effectContext: null,
      });
    }

    // ========== EFFECT: MARSHAL (SEIZE DISTRICT) ==========
    else if (action === 'marshal-seize') {
      const { targetPlayerId, districtUid } = payload;
      const marshal = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!marshal || !target) return;

      if (countBuiltDistricts(target) >= 7) return;
      if (target.characterId === 13) return; // Vescovo immune

      const bd = target.builtDistricts.find(b => b.uid === districtUid);
      if (!bd) return;

      const district = getDistrictById(bd.districtId);
      if (district.cost > 3) return;
      if (bd.districtId === 512) return; // Mastio immune

      let seizeCost = district.cost;
      if (hasBuiltDistrict(target, 509) && bd.districtId !== 509) seizeCost += 1;
      if (marshal.gold < seizeCost) return;

      const updatedPlayers = s.players.map(pl => {
        if (pl.id === marshal.id) return {
          ...pl, gold: pl.gold - seizeCost,
          builtDistricts: [...pl.builtDistricts, bd],
        };
        if (pl.id === target.id) return {
          ...pl, gold: pl.gold + seizeCost,
          builtDistricts: pl.builtDistricts.filter(b => b.uid !== districtUid),
        };
        return pl;
      });

      sync({ ...s, players: updatedPlayers, phase: 'turn-action', effectContext: null });
    }

    // ========== EFFECT: DIPLOMAT (SWAP DISTRICTS) ==========
    else if (action === 'diplomat-swap') {
      const { myDistrictUid, targetPlayerId, targetDistrictUid } = payload;
      const diplomat = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!diplomat || !target) return;

      if (countBuiltDistricts(target) >= 7) return;
      if (target.characterId === 13) return;

      const myBd = diplomat.builtDistricts.find(b => b.uid === myDistrictUid);
      const targetBd = target.builtDistricts.find(b => b.uid === targetDistrictUid);
      if (!myBd || !targetBd) return;
      if (targetBd.districtId === 512) return; // Mastio immune

      const myDist = getDistrictById(myBd.districtId);
      const targetDist = getDistrictById(targetBd.districtId);
      const diff = targetDist.cost - myDist.cost;
      const payment = diff > 0 ? diff : 0;

      if (diplomat.gold < payment) return;

      const updatedPlayers = s.players.map(pl => {
        if (pl.id === diplomat.id) return {
          ...pl,
          gold: pl.gold - payment,
          builtDistricts: pl.builtDistricts.map(b => b.uid === myDistrictUid ? targetBd : b),
        };
        if (pl.id === target.id) return {
          ...pl,
          builtDistricts: pl.builtDistricts.map(b => b.uid === targetDistrictUid ? myBd : b),
        };
        return pl;
      });

      sync({ ...s, players: updatedPlayers, phase: 'turn-action', effectContext: null });
    }

    // ========== EFFECT: BLACKMAILER DECIDE ==========
    else if (action === 'blackmailer-decide') {
      const { pId, pay } = payload;
      const player = s.players.find(pl => pl.id === pId);
      if (!player) return;

      let updatedPlayers = [...s.players];

      if (pay) {
        const halfGold = Math.floor(player.gold / 2);
        updatedPlayers = updatedPlayers.map(pl =>
          pl.id === pId ? { ...pl, gold: pl.gold - halfGold, blackmailerPaid: true, blackmailerToken: null } : pl
        );
      }

      // Reveal token
      if (!pay && player.blackmailerToken === 'real') {
        // All gold goes to blackmailer
        const blackmailer = updatedPlayers.find(pl => {
          const ch = pl.characterId ? getCharacterById(pl.characterId) : null;
          return ch && ch.rank === 2 && (ch.id === 5);
        });
        if (blackmailer) {
          const stolenGold = player.gold;
          updatedPlayers = updatedPlayers.map(pl => {
            if (pl.id === pId) return { ...pl, gold: 0, blackmailerToken: null };
            if (pl.id === blackmailer.id) return { ...pl, gold: pl.gold + stolenGold };
            return pl;
          });
        }
      } else if (!pay) {
        // Fake token, nothing happens
        updatedPlayers = updatedPlayers.map(pl =>
          pl.id === pId ? { ...pl, blackmailerToken: null } : pl
        );
      }

      // Continue to player's normal turn
      const charId = player.characterId;
      const charInfo = charId ? getCharacterById(charId) : null;
      let maxBuilds = 1;
      if (charInfo) {
        if (charInfo.id === 19) maxBuilds = 3;
        if (charInfo.id === 9 || charInfo.id === 20) maxBuilds = 2;
      }

      const resetPlayers = updatedPlayers.map(p =>
        p.id === pId ? { ...p, hasGathered: false, buildsUsed: 0, maxBuilds, hasUsedEffect: false, goldSpentThisTurn: 0 } : p
      );

      sync({
        ...s,
        players: resetPlayers,
        activePlayerId: pId,
        phase: 'turn-action',
        effectContext: null,
      });
    }

    // ========== EFFECT: SPY (step 1: pick target+color, reveal hand) ==========
    else if (action === 'spy-pick') {
      const { targetPlayerId, color } = payload;
      const spy = s.players.find(pl => pl.id === s.activePlayerId);
      const target = s.players.find(pl => pl.id === targetPlayerId);
      if (!spy || !target) return;

      const matchingCards = target.hand.filter(c => getDistrictById(c.districtId).color === color);
      const count = matchingCards.length;

      // Show target's full hand + matching count in effect context
      sync({
        ...s,
        phase: 'effect-active',
        effectContext: {
          type: 'spy-reveal',
          data: {
            targetPlayerId,
            color,
            targetHand: target.hand, // full hand revealed to spy
            matchCount: count,
          },
        },
      });
    }

    // ========== EFFECT: SPY (step 2: confirm, collect reward) ==========
    else if (action === 'spy-confirm') {
      const spy = s.players.find(pl => pl.id === s.activePlayerId);
      if (!spy || !s.effectContext || s.effectContext.type !== 'spy-reveal') return;

      const { matchCount } = s.effectContext.data;

      let newDeck = s.districtDeck;
      let extraCards: DistrictCard[] = [];
      if (matchCount > 0) {
        const { drawn, remaining } = drawCards(newDeck, matchCount);
        extraCards = drawn;
        newDeck = remaining;
      }

      const updatedPlayers = s.players.map(pl =>
        pl.id === spy.id ? { ...pl, gold: pl.gold + matchCount, hand: [...pl.hand, ...extraCards], hasUsedEffect: true } : pl
      );

      sync({ ...s, players: updatedPlayers, districtDeck: newDeck, phase: 'turn-action', effectContext: null });
    }

    // ========== NAVIGATOR ==========
    else if (action === 'navigator-choose') {
      const { choice } = payload; // 'gold' or 'cards'
      const nav = s.players.find(pl => pl.id === s.activePlayerId);
      if (!nav) return;

      if (choice === 'gold') {
        const updatedPlayers = s.players.map(pl =>
          pl.id === nav.id ? { ...pl, gold: pl.gold + 4, maxBuilds: 0 } : pl // can't build
        );
        sync({ ...s, players: updatedPlayers, phase: 'turn-action', effectContext: null });
      } else {
        const { drawn, remaining } = drawCards(s.districtDeck, 4);
        const updatedPlayers = s.players.map(pl =>
          pl.id === nav.id ? { ...pl, hand: [...pl.hand, ...drawn], maxBuilds: 0 } : pl
        );
        sync({ ...s, players: updatedPlayers, districtDeck: remaining, phase: 'turn-action', effectContext: null });
      }
    }

    // ========== VEGGENTE (step 1: take 1 random card from each other player) ==========
    else if (action === 'veggente-take') {
      const veggente = s.players.find(pl => pl.id === s.activePlayerId);
      if (!veggente) return;

      const takenFrom: { playerId: string; card: DistrictCard }[] = [];
      let updatedPlayers = [...s.players];

      for (const pl of updatedPlayers) {
        if (pl.id === veggente.id || pl.hand.length === 0) continue;
        // Pick random card from this player's hand
        const randIdx = Math.floor(Math.random() * pl.hand.length);
        const card = pl.hand[randIdx];
        takenFrom.push({ playerId: pl.id, card });
      }

      // Remove cards from other players, add to veggente
      const takenCards = takenFrom.map(t => t.card);
      updatedPlayers = updatedPlayers.map(pl => {
        if (pl.id === veggente.id) {
          return { ...pl, hand: [...pl.hand, ...takenCards] };
        }
        const taken = takenFrom.find(t => t.playerId === pl.id);
        if (taken) {
          return { ...pl, hand: pl.hand.filter(c => c.uid !== taken.card.uid) };
        }
        return pl;
      });

      // Show effect context for step 2
      sync({
        ...s,
        players: updatedPlayers,
        phase: 'effect-active',
        effectContext: {
          type: 'veggente-return',
          data: {
            takenFrom: takenFrom.map(t => ({ playerId: t.playerId, playerName: s.players.find(p => p.id === t.playerId)?.name || '' })),
            totalToReturn: takenFrom.length,
          },
        },
      });
    }

    // ========== VEGGENTE (step 2: choose cards to return, 1 per player taken from) ==========
    else if (action === 'veggente-return') {
      const { assignments } = payload as { assignments: { playerId: string; cardUid: string }[] };
      const veggente = s.players.find(pl => pl.id === s.activePlayerId);
      if (!veggente || !s.effectContext || s.effectContext.type !== 'veggente-return') return;

      const { totalToReturn } = s.effectContext.data;
      if (assignments.length !== totalToReturn) return;

      let updatedPlayers = [...s.players];
      for (const { playerId, cardUid } of assignments) {
        const card = updatedPlayers.find(p => p.id === veggente.id)!.hand.find(c => c.uid === cardUid);
        if (!card) continue;
        updatedPlayers = updatedPlayers.map(pl => {
          if (pl.id === veggente.id) return { ...pl, hand: pl.hand.filter(c => c.uid !== cardUid) };
          if (pl.id === playerId) return { ...pl, hand: [...pl.hand, card] };
          return pl;
        });
      }

      updatedPlayers = updatedPlayers.map(pl =>
        pl.id === veggente.id ? { ...pl, hasUsedEffect: true } : pl
      );

      sync({ ...s, players: updatedPlayers, phase: 'turn-action', effectContext: null });
    }

    // ========== MUSEO (TUCK CARD) ==========
    else if (action === 'museo-tuck') {
      const { cardUid } = payload;
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p) return;

      const card = p.hand.find(c => c.uid === cardUid);
      if (!card) return;

      const updatedPlayers = s.players.map(pl => {
        if (pl.id !== p.id) return pl;
        return {
          ...pl,
          hand: pl.hand.filter(c => c.uid !== cardUid),
          builtDistricts: pl.builtDistricts.map(bd =>
            bd.districtId === 515 ? { ...bd, museumCards: bd.museumCards + 1 } : bd
          ),
        };
      });
      sync({ ...s, players: updatedPlayers });
    }

    // ========== FUCINA (PAY 2 GOLD, DRAW 3) ==========
    else if (action === 'use-fucina') {
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p || p.gold < 2) return;

      const { drawn, remaining } = drawCards(s.districtDeck, 3);
      const updatedPlayers = s.players.map(pl =>
        pl.id === p.id ? { ...pl, gold: pl.gold - 2, hand: [...pl.hand, ...drawn] } : pl
      );
      sync({ ...s, players: updatedPlayers, districtDeck: remaining });
    }

    // ========== LABORATORIO (DISCARD 1, GET 2 GOLD) ==========
    else if (action === 'use-laboratorio') {
      const { cardUid } = payload;
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p) return;

      const card = p.hand.find(c => c.uid === cardUid);
      if (!card) return;

      const updatedPlayers = s.players.map(pl =>
        pl.id === p.id ? { ...pl, gold: pl.gold + 2, hand: pl.hand.filter(c => c.uid !== cardUid) } : pl
      );
      const newDeck = returnToBottom(s.districtDeck, [card]);
      sync({ ...s, players: updatedPlayers, districtDeck: newDeck });
    }

    // ========== ARTISTA (EMBELLISH) ==========
    else if (action === 'artist-embellish') {
      const { districtUids } = payload as { districtUids: string[] }; // max 2
      const p = s.players.find(pl => pl.id === s.activePlayerId);
      if (!p) return;

      const cost = districtUids.length;
      if (p.gold < cost) return;

      const updatedPlayers = s.players.map(pl => {
        if (pl.id !== p.id) return pl;
        return {
          ...pl,
          gold: pl.gold - cost,
          builtDistricts: pl.builtDistricts.map(bd =>
            districtUids.includes(bd.uid) ? { ...bd, artisanCoins: bd.artisanCoins + 1 } : bd
          ),
        };
      });
      sync({ ...s, players: updatedPlayers, phase: 'turn-action', effectContext: null });
    }

    // ========== REMATCH ==========
    else if (action === 'rematch') {
      const resetPlayers = s.players.map(p => ({
        ...p,
        gold: 2,
        hand: [],
        builtDistricts: [],
        characterId: null,
        hasCrown: false,
        hasGathered: false,
        buildsUsed: 0,
        maxBuilds: 1,
        hasUsedEffect: false,
        goldSpentThisTurn: 0,
        isAlive: true,
        isBewitched: false,
        magistrateToken: null,
        blackmailerToken: null,
        blackmailerPaid: false,
      }));
      sync({
        ...createInitialState(),
        phase: 'lobby',
        roomCode: s.roomCode,
        players: resetPlayers,
      });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, sync, players]);

  // Keep procRef in sync
  procRef.current = proc;

  // ========== ROUND END ==========
  const resolveRoundEnd = useCallback((s: CitadelsState) => {
    // Check if assassinated rank 4 needs to reveal for crown
    let updatedPlayers = [...s.players];
    const rank4Ids = [10, 11, 12];
    const assassinatedChar = s.assassinatedRank ? s.characterPool.find(cId => getCharacterById(cId).rank === s.assassinatedRank) : null;

    if (assassinatedChar && rank4Ids.includes(assassinatedChar)) {
      const player = findPlayerByCharacter(updatedPlayers, assassinatedChar);
      if (player) {
        if (assassinatedChar === 10 || assassinatedChar === 12) {
          // Re / Patrizio: take crown even if dead
          updatedPlayers = updatedPlayers.map(pl => ({ ...pl, hasCrown: pl.id === player.id }));
        } else if (assassinatedChar === 11) {
          // Imperatore: crown goes to player on left
          const seatIdx = player.seatIndex;
          const nextSeat = (seatIdx + 1) % updatedPlayers.length;
          const nextPlayer = updatedPlayers.find(pl => pl.seatIndex === nextSeat);
          if (nextPlayer) {
            updatedPlayers = updatedPlayers.map(pl => ({ ...pl, hasCrown: pl.id === nextPlayer.id }));
          }
        }
      }
    }

    // Find crown holder
    const crownHolder = updatedPlayers.find(pl => pl.hasCrown);
    const crownHolderId = crownHolder ? crownHolder.id : s.crownHolderId;

    // Check game end
    if (s.gameEndTriggered) {
      // Calculate scores
      const scores: Record<string, { total: number; breakdown: ScoreBreakdown }> = {};
      for (const p of updatedPlayers) {
        scores[p.id] = calculateScore(p, { ...s, players: updatedPlayers });
      }
      sync({
        ...s,
        players: updatedPlayers,
        crownHolderId,
        phase: 'game-over',
        scores,
      });
      return;
    }

    // Start new round
    const newRound = s.roundNumber + 1;
    const newDraft = setupDraft(s.characterPool, updatedPlayers.length, crownHolderId, updatedPlayers);

    sync({
      ...s,
      players: updatedPlayers,
      crownHolderId,
      roundNumber: newRound,
      phase: 'draft',
      draftState: newDraft,
      currentRank: 0,
      calledRanks: [],
      assassinatedRank: null,
      robbedRank: null,
      bewitchedRank: null,
      taxPool: [],
      activePlayerId: null,
      effectContext: null,
      drawnCards: null,
    });
  }, [sync]);

  // ---- Derived values ----
  const myPlayer = state.players.find(p => p.id === playerId) || null;
  const activePlayer = state.activePlayerId ? state.players.find(p => p.id === state.activePlayerId) || null : null;
  const isMyTurn = state.activePlayerId === playerId;

  const act = useCallback((action: string, payload: any = {}) => {
    // Broadcast the action — host will pick it up and process it
    broadcast({ type: 'action', action, payload });
    // Host also processes locally (broadcast doesn't echo back to sender)
    if (isHost) proc(action, payload);
  }, [broadcast, isHost, proc]);

  return {
    state,
    myPlayer,
    activePlayer,
    isMyTurn,
    startGame: useCallback((characterPool: number[], violaPool: number[], presetName: string) =>
      act('start', { characterPool, violaPool, presetName }), [act]),
    pickCharacter: useCallback((charId: number) =>
      act('pick-character', { pId: playerId, charId }), [act, playerId]),
    callNextRank: useCallback(() => act('call-next-rank'), [act]),
    gatherGold: useCallback(() => act('gather-gold'), [act]),
    gatherCards: useCallback(() => act('gather-cards'), [act]),
    pickDrawnCard: useCallback((cardUid: string) => act('pick-drawn-card', { cardUid }), [act]),
    buildDistrict: useCallback((cardUid: string) => act('build-district', { cardUid }), [act]),
    endTurn: useCallback(() => act('end-turn'), [act]),
    collectIncome: useCallback(() => act('collect-income'), [act]),
    takeCrown: useCallback(() => act('take-crown'), [act]),
    // Effects
    assassinTarget: useCallback((rank: number) => act('assassin-target', { targetRank: rank }), [act]),
    thiefTarget: useCallback((rank: number) => act('thief-target', { targetRank: rank }), [act]),
    wizardSwap: useCallback((targetPlayerId: string) => act('wizard-swap', { targetPlayerId }), [act]),
    wizardDiscard: useCallback((cardUids: string[]) => act('wizard-discard', { cardUids }), [act]),
    emperorGiveCrown: useCallback((targetPlayerId: string, paymentType: 'gold' | 'card') =>
      act('emperor-give-crown', { targetPlayerId, paymentType }), [act]),
    warlordDestroy: useCallback((targetPlayerId: string, districtUid: string) =>
      act('warlord-destroy', { targetPlayerId, districtUid }), [act]),
    marshalSeize: useCallback((targetPlayerId: string, districtUid: string) =>
      act('marshal-seize', { targetPlayerId, districtUid }), [act]),
    diplomatSwap: useCallback((myDistrictUid: string, targetPlayerId: string, targetDistrictUid: string) =>
      act('diplomat-swap', { myDistrictUid, targetPlayerId, targetDistrictUid }), [act]),
    blackmailerDecide: useCallback((pay: boolean) =>
      act('blackmailer-decide', { pId: playerId, pay }), [act, playerId]),
    spyPick: useCallback((targetPlayerId: string, color: string) =>
      act('spy-pick', { targetPlayerId, color }), [act]),
    spyConfirm: useCallback(() => act('spy-confirm'), [act]),
    navigatorChoose: useCallback((choice: 'gold' | 'cards') =>
      act('navigator-choose', { choice }), [act]),
    veggenteTake: useCallback(() => act('veggente-take'), [act]),
    veggenteReturn: useCallback((assignments: { playerId: string; cardUid: string }[]) =>
      act('veggente-return', { assignments }), [act]),
    cardinalBuild: useCallback((cardUid: string, targetPlayerId: string, cardUidsToGive: string[]) =>
      act('cardinal-build', { cardUid, targetPlayerId, cardUidsToGive }), [act]),
    museoTuck: useCallback((cardUid: string) => act('museo-tuck', { cardUid }), [act]),
    useFucina: useCallback(() => act('use-fucina'), [act]),
    useLaboratorio: useCallback((cardUid: string) => act('use-laboratorio', { cardUid }), [act]),
    artistEmbellish: useCallback((districtUids: string[]) =>
      act('artist-embellish', { districtUids }), [act]),
    rematch: useCallback(() => act('rematch'), [act]),
  };
}
