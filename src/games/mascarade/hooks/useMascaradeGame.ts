import { useState, useEffect, useCallback, useRef } from 'react';
import { MascaradeState, MascaradeBroadcast, MascaradePlayer, MascaradePhase } from '../types';
import { RoomPlayer } from './useMascaradeRoom';
import { dealRoles, nextSeat, giveFromBank, payToPot, checkWin, getRichest, resolveMendicante, swapCards, swapSeats, swapCoins, getLeftNeighbor, getRightNeighbor } from '../gameLogic';
import { getRoleById } from '../roles';

interface Props {
  playerId: string;
  isHost: boolean;
  players: RoomPlayer[];
  broadcast: (e: MascaradeBroadcast) => void;
  onBroadcast: (cb: (e: MascaradeBroadcast) => void) => void;
}

const empty: MascaradeState = {
  phase: 'create', roomCode: '', players: [], variant: 'A', rolesInGame: [],
  pot: 0, turnIndex: 0, turnCount: 0, currentAction: null,
  swapTargetId: null, swapDidSwap: null,
  declaredRoleId: null, challenges: [], revealedCards: {},
  effectTargetId: null, effectSecondTargetId: null, effectData: null,
  introIndex: 0, winnerId: null,
};

export function useMascaradeGame({ playerId, isHost, players, broadcast, onBroadcast }: Props) {
  const [state, setState] = useState<MascaradeState>(empty);
  const stRef = useRef(state);
  const bcRef = useRef(broadcast);
  useEffect(() => { bcRef.current = broadcast; }, [broadcast]);

  const sync = useCallback((s: MascaradeState) => {
    stRef.current = s; setState(s);
    bcRef.current({ type: 'sync', payload: s });
  }, []);

  // Helper: advance turn, check win
  const advanceTurn = (s: MascaradeState): MascaradeState => {
    const w = checkWin(s.players);
    if (w) { s.winnerId = w; s.phase = 'game-over'; return s; }
    s.turnCount += 1;
    s.turnIndex = nextSeat(s.turnIndex, s.players.length);
    s.currentAction = null; s.swapTargetId = null; s.swapDidSwap = null;
    s.declaredRoleId = null; s.challenges = []; s.revealedCards = {};
    s.effectTargetId = null; s.effectSecondTargetId = null; s.effectData = null;
    s.phase = 'play';
    return s;
  };

  // Apply role effect for the player who uses it
  const applyEffect = (s: MascaradeState, roleId: number, userId: string): MascaradeState => {
    const role = getRoleById(roleId);
    const user = s.players.find(p => p.id === userId)!;

    switch (roleId) {
      case 1: // Re: +2
        s.players = giveFromBank(userId, 2, s.players);
        return advanceTurn(s);

      case 2: // Imperatrice: +3
        s.players = giveFromBank(userId, 3, s.players);
        return advanceTurn(s);

      case 3: { // Imbroglione: steal 2 from richest
        const richest = getRichest(s.players.filter(p => p.id !== userId));
        if (richest.length === 1) {
          const actual = Math.min(2, richest[0].coins);
          s.players = s.players.map(p => {
            if (p.id === richest[0].id) return { ...p, coins: p.coins - actual };
            if (p.id === userId) return { ...p, coins: p.coins + actual };
            return p;
          });
          return advanceTurn(s);
        } else {
          // Tie: user must choose
          s.effectData = { richestIds: richest.map(r => r.id) };
          s.phase = 'effect-imbroglione';
          return s;
        }
      }

      case 4: // Giudice: take pot
        s.players = giveFromBank(userId, s.pot, s.players);
        s.pot = 0;
        return advanceTurn(s);

      case 5: { // Mecenate: +3, neighbors +1
        s.players = giveFromBank(userId, 3, s.players);
        const left = getLeftNeighbor(user.seatIndex, s.players);
        const right = getRightNeighbor(user.seatIndex, s.players);
        s.players = giveFromBank(left.id, 1, s.players);
        s.players = giveFromBank(right.id, 1, s.players);
        return advanceTurn(s);
      }

      case 6: { // Vedova: set to 10
        const needed = Math.max(0, 10 - user.coins);
        s.players = giveFromBank(userId, needed, s.players);
        return advanceTurn(s);
      }

      case 7:
      case 8: { // Contadino
        // Check if both contadini were revealed in a challenge
        const revealed = Object.values(s.revealedCards);
        const bothRevealed = revealed.filter(r => r === 7 || r === 8).length >= 2;
        if (bothRevealed) {
          // Both get 2 coins
          const contadiniIds = Object.entries(s.revealedCards)
            .filter(([_, r]) => r === 7 || r === 8)
            .map(([id]) => id);
          for (const cId of contadiniIds) {
            s.players = giveFromBank(cId, 2, s.players);
          }
        } else {
          s.players = giveFromBank(userId, 1, s.players);
        }
        return advanceTurn(s);
      }

      case 9: { // Ladro: steal 1 left, 1 right
        const left = getLeftNeighbor(user.seatIndex, s.players);
        const right = getRightNeighbor(user.seatIndex, s.players);
        const stealLeft = Math.min(1, left.coins);
        const stealRight = Math.min(1, right.coins);
        s.players = s.players.map(p => {
          if (p.id === left.id) return { ...p, coins: p.coins - stealLeft };
          if (p.id === right.id) return { ...p, coins: p.coins - stealRight };
          if (p.id === userId) return { ...p, coins: p.coins + stealLeft + stealRight };
          return p;
        });
        return advanceTurn(s);
      }

      case 10: // Spia: need to pick target, view cards
        s.phase = 'effect-spy';
        return s;

      case 11: // Guru: pick target
        s.phase = 'effect-guru';
        return s;

      case 12: // Sciamana: pick target to swap coins
        s.phase = 'effect-sciamana';
        return s;

      case 13: // Folle: +1, pick 2 players to swap cards
        s.players = giveFromBank(userId, 1, s.players);
        s.phase = 'effect-folle';
        return s;

      case 14: // Marionettista: pick 2 players
        s.phase = 'effect-marionettista';
        return s;

      case 15: { // Baro: win if >= 10
        if (user.coins >= 10) {
          s.winnerId = userId; s.phase = 'game-over';
        } else {
          // Nothing happens, effect wasted
          return advanceTurn(s);
        }
        return s;
      }

      case 16: // Mendicante
        s.players = resolveMendicante(userId, s.players);
        return advanceTurn(s);

      case 17: // Principessa: +2, pick target to reveal
        s.players = giveFromBank(userId, 2, s.players);
        s.phase = 'effect-principessa';
        return s;

      default:
        return advanceTurn(s);
    }
  };

  const proc = useCallback((action: string, payload: any) => {
    if (!isHost) return;
    const s = { ...stRef.current };

    if (action === 'start') {
      const variant = payload?.variant || 'A';
      const customRoles: number[] | undefined = payload?.customRoles;
      let result;
      if (customRoles && customRoles.length > 0) {
        // Custom or random mode: use provided role IDs directly
        const shuffled = [...customRoles].sort(() => Math.random() - 0.5);
        result = {
          players: players.map((p, i) => ({
            id: p.id, name: p.name, roleId: shuffled[i],
            coins: 6, seatIndex: i, hasViewedCard: false, hasIntroduced: false,
          })),
          rolesInGame: customRoles,
        };
      } else {
        result = dealRoles(players, players.length, variant);
      }
      const starter = Math.floor(Math.random() * players.length);
      const ns: MascaradeState = {
        ...empty,
        phase: 'view-card',
        roomCode: s.roomCode,
        variant,
        players: result.players,
        rolesInGame: result.rolesInGame,
        pot: 0,
        turnIndex: starter,
        turnCount: 0,
        introIndex: starter,
      };
      sync(ns);

    } else if (action === 'viewed-card') {
      const pId = payload.pId;
      s.players = s.players.map(p => p.id === pId ? { ...p, hasViewedCard: true } : p);
      if (s.players.every(p => p.hasViewedCard)) {
        s.phase = 'introductions'; s.introIndex = s.turnIndex;
      }
      sync(s);

    } else if (action === 'intro-done') {
      const pId = payload.pId;
      s.players = s.players.map(p => p.id === pId ? { ...p, hasIntroduced: true } : p);
      if (s.players.every(p => p.hasIntroduced)) {
        s.phase = 'play'; s.turnCount = 1;
      } else {
        s.introIndex = nextSeat(s.introIndex, s.players.length);
      }
      sync(s);

    } else if (action === 'action-look') {
      // Player looks at own card — they see it client-side, then pass turn
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'action-swap') {
      s.swapTargetId = payload.targetId;
      s.phase = 'swap-choice';
      sync(s);

    } else if (action === 'swap-decide') {
      const didSwap = payload.didSwap;
      if (didSwap) {
        const activePlayer = s.players.find(p => p.seatIndex === s.turnIndex)!;
        s.players = swapCards(activePlayer.id, s.swapTargetId!, s.players);
      }
      s.swapDidSwap = didSwap;
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'action-declare') {
      s.declaredRoleId = payload.roleId;
      s.challenges = [];
      s.phase = 'challenge-vote';
      sync(s);

    } else if (action === 'challenge-vote') {
      const { pId, challenged } = payload;
      if (s.challenges.find(c => c.playerId === pId)) return; // already voted
      s.challenges = [...s.challenges, { playerId: pId, challenged }];
      const activePlayer = s.players.find(p => p.seatIndex === s.turnIndex)!;
      const otherPlayers = s.players.filter(p => p.id !== activePlayer.id);

      if (s.challenges.length === otherPlayers.length) {
        const challengers = s.challenges.filter(c => c.challenged);
        if (challengers.length === 0) {
          // No challenge: effect activates (player doesn't reveal card)
          const ns = applyEffect(s, s.declaredRoleId!, activePlayer.id);
          sync(ns);
        } else {
          // Challenge! All challengers + declarer pay 1 coin to pot, reveal cards
          const revealIds = [activePlayer.id, ...challengers.map(c => c.playerId)];
          for (const rId of revealIds) {
            const r = payToPot(rId, 1, s.players);
            s.players = r.players; s.pot += r.potAdd;
          }
          s.revealedCards = {};
          for (const rId of revealIds) {
            const p = s.players.find(pl => pl.id === rId)!;
            s.revealedCards[rId] = p.roleId;
          }
          s.phase = 'reveal-cards';
          sync(s);
        }
      } else {
        sync(s);
      }

    } else if (action === 'resolve-reveal') {
      // After reveal: find who has the declared role
      const declaredId = s.declaredRoleId!;
      const holders = Object.entries(s.revealedCards).filter(([_, rId]) => rId === declaredId);
      const activePlayer = s.players.find(p => p.seatIndex === s.turnIndex)!;

      if (holders.length > 0) {
        const holderId = holders[0][0];
        // Holder gets their coin back
        s.players = giveFromBank(holderId, 1, s.players);
        // Holder uses the effect
        const ns = applyEffect(s, declaredId, holderId);
        sync(ns);
      } else {
        // Nobody has it: no effect, coins stay in pot
        const ns = advanceTurn(s);
        sync(ns);
      }

    } else if (action === 'effect-imbroglione-choose') {
      const targetId = payload.targetId;
      const activeId = payload.userId;
      const target = s.players.find(p => p.id === targetId)!;
      const actual = Math.min(2, target.coins);
      s.players = s.players.map(p => {
        if (p.id === targetId) return { ...p, coins: p.coins - actual };
        if (p.id === activeId) return { ...p, coins: p.coins + actual };
        return p;
      });
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'effect-spy-target') {
      s.effectTargetId = payload.targetId;
      s.effectData = {
        myRole: s.players.find(p => p.id === payload.userId)!.roleId,
        targetRole: s.players.find(p => p.id === payload.targetId)!.roleId,
      };
      sync(s); // spy sees cards client-side

    } else if (action === 'effect-spy-decide') {
      if (payload.doSwap) {
        s.players = swapCards(payload.userId, s.effectTargetId!, s.players);
      }
      s.effectData = null;
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'effect-guru-target') {
      s.effectTargetId = payload.targetId;
      s.effectData = { guruId: payload.userId, waitingGuess: true };
      sync(s);

    } else if (action === 'effect-guru-guess') {
      const targetId = s.effectTargetId!;
      const guruId = s.effectData.guruId;
      const target = s.players.find(p => p.id === targetId)!;
      const guessedRoleId = payload.guessedRoleId;
      const actualRoleId = target.roleId;
      s.revealedCards = { [targetId]: actualRoleId };
      s.effectData = { ...s.effectData, guessedRoleId, actualRoleId, correct: guessedRoleId === actualRoleId, waitingGuess: false };

      if (guessedRoleId !== actualRoleId) {
        // Wrong: pay up to 4 coins to guru
        const actual = Math.min(4, target.coins);
        s.players = s.players.map(p => {
          if (p.id === targetId) return { ...p, coins: p.coins - actual };
          if (p.id === guruId) return { ...p, coins: p.coins + actual };
          return p;
        });
      }
      sync(s);

    } else if (action === 'effect-guru-done') {
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'effect-sciamana-target') {
      s.players = swapCoins(payload.userId, payload.targetId, s.players);
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'effect-folle-targets') {
      const { target1Id, target2Id, didSwap } = payload;
      if (didSwap) {
        s.players = swapCards(target1Id, target2Id, s.players);
      }
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'effect-marionettista-targets') {
      const { target1Id, target2Id, userId } = payload;
      // Take 1 coin from each (if they have)
      for (const tId of [target1Id, target2Id]) {
        const t = s.players.find(p => p.id === tId)!;
        const actual = Math.min(1, t.coins);
        s.players = s.players.map(p => {
          if (p.id === tId) return { ...p, coins: p.coins - actual };
          if (p.id === userId) return { ...p, coins: p.coins + actual };
          return p;
        });
      }
      // Swap seats
      s.players = swapSeats(target1Id, target2Id, s.players);
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'effect-principessa-target') {
      s.effectTargetId = payload.targetId;
      const target = s.players.find(p => p.id === payload.targetId)!;
      s.revealedCards = { [payload.targetId]: target.roleId };
      s.effectData = { revealedTo: 'all-except-target' };
      sync(s);

    } else if (action === 'effect-principessa-done') {
      s.revealedCards = {};
      s.effectData = null;
      const ns = advanceTurn(s);
      sync(ns);

    } else if (action === 'rematch') {
      // Go back to lobby with same players, host picks A/B again
      const lobbyPlayers = s.players.map(p => ({
        ...p, roleId: 0, coins: 6, hasViewedCard: false, hasIntroduced: false,
      }));
      sync({
        ...empty, phase: 'lobby', roomCode: s.roomCode,
        players: lobbyPlayers,
      });

    } else if (action === 'new-game') {
      sync({ ...empty, phase: 'create' });
    }
  }, [isHost, players, sync]);

  useEffect(() => {
    onBroadcast((ev) => {
      if (!isHost && ev.type === 'sync') { setState(ev.payload); stRef.current = ev.payload; }
      else if (isHost && ev.type === 'action') proc(ev.action!, ev.payload);
    });
  }, [onBroadcast, isHost, proc]);

  const act = useCallback((a: string, p?: any) => {
    if (isHost) proc(a, p); else bcRef.current({ type: 'action', action: a, payload: p });
  }, [isHost, proc]);

  const my = state.players.find(p => p.id === playerId);
  const activePlayer = state.players.find(p => p.seatIndex === state.turnIndex);
  const isMyTurn = activePlayer?.id === playerId;
  const isForcedSwap = state.turnCount >= 1 && state.turnCount <= 4;

  return {
    state, myPlayer: my, activePlayer, isMyTurn, isForcedSwap,
    startGame: useCallback((variant: 'A' | 'B', customRoles?: number[]) => act('start', { variant, customRoles }), [act]),
    viewedCard: useCallback(() => act('viewed-card', { pId: playerId }), [act, playerId]),
    introDone: useCallback(() => act('intro-done', { pId: playerId }), [act, playerId]),
    actionLook: useCallback(() => act('action-look', { pId: playerId }), [act, playerId]),
    actionSwap: useCallback((targetId: string) => act('action-swap', { targetId }), [act]),
    swapDecide: useCallback((didSwap: boolean) => act('swap-decide', { didSwap }), [act]),
    actionDeclare: useCallback((roleId: number) => act('action-declare', { roleId }), [act]),
    challengeVote: useCallback((challenged: boolean) => act('challenge-vote', { pId: playerId, challenged }), [act, playerId]),
    resolveReveal: useCallback(() => act('resolve-reveal'), [act]),
    effectImbroglione: useCallback((targetId: string) => act('effect-imbroglione-choose', { targetId, userId: playerId }), [act, playerId]),
    effectSpyTarget: useCallback((targetId: string) => act('effect-spy-target', { targetId, userId: playerId }), [act, playerId]),
    effectSpyDecide: useCallback((doSwap: boolean) => act('effect-spy-decide', { doSwap, userId: playerId }), [act, playerId]),
    effectGuruTarget: useCallback((targetId: string) => act('effect-guru-target', { targetId, userId: playerId }), [act, playerId]),
    effectGuruGuess: useCallback((guessedRoleId: number) => act('effect-guru-guess', { guessedRoleId, pId: playerId }), [act, playerId]),
    effectGuruDone: useCallback(() => act('effect-guru-done'), [act]),
    effectSciamana: useCallback((targetId: string) => act('effect-sciamana-target', { targetId, userId: playerId }), [act, playerId]),
    effectFolle: useCallback((t1: string, t2: string, didSwap: boolean) => act('effect-folle-targets', { target1Id: t1, target2Id: t2, didSwap }), [act]),
    effectMarionettista: useCallback((t1: string, t2: string) => act('effect-marionettista-targets', { target1Id: t1, target2Id: t2, userId: playerId }), [act, playerId]),
    effectPrincipessa: useCallback((targetId: string) => act('effect-principessa-target', { targetId, userId: playerId }), [act, playerId]),
    effectPrincipessaDone: useCallback(() => act('effect-principessa-done'), [act]),
    rematch: useCallback(() => act('rematch'), [act]),
    newGame: useCallback(() => act('new-game'), [act]),
  };
}
