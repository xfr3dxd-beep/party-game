import { useState, useEffect, useCallback, useRef } from 'react';
import { PiliPiliState, PiliPiliBroadcast, PiliPiliPlayer, PlayedCard } from '../types';
import { RoomPlayer } from './usePiliPiliRoom';
import { dealCards, drawMission, getNextPlayerId, resolveTrick, shuffle, JOKER_VALUE } from '../gameLogic';

interface UsePiliPiliGameProps {
  playerId: string;
  isHost: boolean;
  players: RoomPlayer[];
  broadcast: (event: PiliPiliBroadcast) => void;
  onBroadcast: (cb: (event: PiliPiliBroadcast) => void) => void;
}

const initialState: PiliPiliState = {
  phase: 'create',
  roomCode: '',
  players: [],
  currentMission: null,
  roundNumber: 0,
  currentTrick: [],
  trickNumber: 0,
  totalTricks: 0,
  leadPlayerId: null,
  currentTurnId: null,
  usedMissionIds: [],
  dealerId: null,
  swapSelections: {},
  swapTrickWinnerId: null,
  swapTrickTargetId: null,
  swapTrickWinnerCard: null,
  swapTrickTargetCard: null,
  lastTrickCards: [],
  lastTrickWinnerId: null,
  timedBetting: false,
  timedBetSeconds: 0,
  extraDeck: [],
};

export function usePiliPiliGame({ playerId, isHost, players, broadcast, onBroadcast }: UsePiliPiliGameProps) {
  const [state, setState] = useState<PiliPiliState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const broadcastRef = useRef(broadcast);
  broadcastRef.current = broadcast;

  const syncState = useCallback((newState: PiliPiliState) => {
    setState(newState);
    stateRef.current = newState;
    if (isHost) {
      broadcastRef.current({ type: 'sync', payload: newState });
    }
  }, [isHost]);

  useEffect(() => {
    if (isHost && stateRef.current.phase === 'create' && players.length > 0) {
      const newPlayers: PiliPiliPlayer[] = players.map(p => {
        const existing = stateRef.current.players.find(ep => ep.id === p.id);
        return existing || { id: p.id, name: p.name, hand: [], pilis: 0, bet: null, tricksWon: 0 };
      });
      if (newPlayers.length !== stateRef.current.players.length) {
        syncState({ ...stateRef.current, players: newPlayers });
      }
    }
  }, [isHost, players, syncState]);

  const getLeftNeighbor = (pList: PiliPiliPlayer[], pId: string): string => {
    const idx = pList.findIndex(p => p.id === pId);
    return pList[(idx + 1) % pList.length].id;
  };
  const getRightNeighbor = (pList: PiliPiliPlayer[], pId: string): string => {
    const idx = pList.findIndex(p => p.id === pId);
    return pList[(idx - 1 + pList.length) % pList.length].id;
  };

  const executeDirectionalSwap = (st: PiliPiliState): PiliPiliState => {
    const mission = st.currentMission;
    if (!mission || !mission.swapDirection) return st;
    const direction = mission.swapDirection;
    const newPlayers = st.players.map(p => ({ ...p, hand: [...p.hand] }));
    const giving: Record<string, number[]> = {};
    for (const p of newPlayers) {
      giving[p.id] = st.swapSelections[p.id] || [];
      p.hand = p.hand.filter(c => !giving[p.id].includes(c));
    }
    for (const p of newPlayers) {
      const neighborId = direction === 'left'
        ? getRightNeighbor(newPlayers, p.id)
        : getLeftNeighbor(newPlayers, p.id);
      p.hand = [...p.hand, ...(giving[neighborId] || [])].sort((a, b) => a - b);
    }
    return { ...st, players: newPlayers, swapSelections: {} };
  };

  // After trick: go to trick-result or handle special phases
  const afterTrickComplete = (st: PiliPiliState, winnerId: string): PiliPiliState => {
    const wIndex = st.players.findIndex(p => p.id === winnerId);
    st.players[wIndex] = { ...st.players[wIndex], tricksWon: st.players[wIndex].tricksWon + 1 };
    st.trickNumber += 1;

    // Penalty for first/last trick (missions 18, 31)
    if (st.currentMission?.penaltyFirstLast) {
      if (st.trickNumber === 1 || st.trickNumber === st.totalTricks) {
        st.players[wIndex] = { ...st.players[wIndex], pilis: st.players[wIndex].pilis + 1 };
      }
    }

    // Penalty for card range (missions 23, 24, 25)
    if (st.currentMission?.penaltyRange) {
      const [lo, hi] = st.currentMission.penaltyRange;
      const winningCard = st.currentTrick.find(c => c.playerId === winnerId)?.card || 0;
      if (winningCard >= lo && winningCard <= hi) {
        st.players[wIndex] = { ...st.players[wIndex], pilis: st.players[wIndex].pilis + 1 };
      }
    }

    // Save trick result for display
    st.lastTrickCards = [...st.currentTrick];
    st.lastTrickWinnerId = winnerId;
    st.phase = 'trick-result';
    return st;
  };

  // Called after trick-result is dismissed
  const afterTrickResultDismissed = (st: PiliPiliState): PiliPiliState => {
    const winnerId = st.lastTrickWinnerId!;

    if (st.trickNumber >= st.totalTricks) {
      // Round over — calculate penalties
      st.players = st.players.map(p => {
        const diff = Math.abs((p.bet || 0) - p.tricksWon);
        let newPilis = p.pilis + diff;
        if (diff === 0 && st.currentMission?.bonusPrecise) {
          const removeAmount = st.currentMission.bonusPreciseAmount === 'bet-value' ? (p.bet || 0) : 1;
          newPilis = Math.max(0, newPilis - removeAmount);
        }
        return { ...p, pilis: newPilis };
      });
      st.phase = st.players.some(p => p.pilis >= 7) ? 'game-over' : 'round-result';
      st.currentTrick = [];
    } else if (st.currentMission?.swapAfterTrick) {
      // Missions 26, 36: winner must swap a card
      const wIndex = st.players.findIndex(p => p.id === winnerId);
      if (st.players[wIndex].hand.length > 0) {
        st.swapTrickWinnerId = winnerId;
        st.swapTrickTargetId = null;
        st.swapTrickWinnerCard = null;
        st.swapTrickTargetCard = null;
        st.phase = 'swap-after-trick';
        st.currentTrick = [];
      } else {
        st.leadPlayerId = winnerId;
        st.currentTurnId = winnerId;
        st.currentTrick = [];
        st.phase = 'play';
      }
    } else {
      st.leadPlayerId = winnerId;
      st.currentTurnId = winnerId;
      st.currentTrick = [];
      st.phase = 'play';
    }
    return st;
  };

  // Transition from bet phase to play (handles drawAfterBet, swaps, etc.)
  const afterAllBetsPlaced = (st: PiliPiliState): PiliPiliState => {
    const mission = st.currentMission;

    // Mission 12: draw extra cards after bet
    if (mission?.drawAfterBet && st.extraDeck.length > 0) {
      st.players = st.players.map(p => {
        const drawn = st.extraDeck.splice(0, mission.drawAfterBet!);
        return { ...p, hand: [...p.hand, ...drawn].sort((a, b) => a - b) };
      });
      // Update totalTricks since hand size changed
      st.totalTricks = st.players[0].hand.length;
    }

    // Check for directional swaps (missions 1-7)
    if (mission && mission.swapDirection && mission.swapTiming === 'after-bet') {
      const swapCount = mission.swapCount!;
      if (swapCount === -1) {
        // Swap ALL — auto
        const selections: Record<string, number[]> = {};
        for (const p of st.players) selections[p.id] = [...p.hand];
        st.swapSelections = selections;
        const swapped = executeDirectionalSwap(st);
        Object.assign(st, { players: swapped.players, swapSelections: {} });
        st.phase = 'play';
        st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
        st.leadPlayerId = st.currentTurnId;
        st.currentTrick = [];
      } else {
        st.phase = 'swapping';
        st.swapSelections = {};
      }
    } else {
      st.phase = 'play';
      st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
      st.leadPlayerId = st.currentTurnId;
      st.currentTrick = [];
    }
    return st;
  };

  const processAction = useCallback((action: string, payload: any) => {
    if (!isHost) return;
    const st = { ...stateRef.current };

    if (action === 'start' || action === 'next-round') {
      st.roundNumber += 1;
      st.dealerId = st.dealerId ? getNextPlayerId(st.players, st.dealerId) : st.players[0].id;
      const mission = drawMission(st.usedMissionIds);
      st.currentMission = mission;
      st.usedMissionIds = [...st.usedMissionIds, mission.id];
      st.players = dealCards(st.players, mission.cardsPerPlayer, !!mission.jokerInPlay);
      st.totalTricks = mission.cardsPerPlayer;
      st.trickNumber = 0;
      st.currentTrick = [];
      st.lastTrickCards = [];
      st.lastTrickWinnerId = null;
      st.swapSelections = {};
      st.swapTrickWinnerId = null;
      st.swapTrickTargetId = null;
      st.swapTrickWinnerCard = null;
      st.swapTrickTargetCard = null;
      st.timedBetting = false;
      st.timedBetSeconds = 0;

      // Prepare extra deck for drawAfterBet missions
      if (mission.drawAfterBet) {
        const usedCards = st.players.flatMap(p => p.hand);
        let remaining = Array.from({ length: 55 }, (_, i) => i + 1).filter(c => !usedCards.includes(c));
        remaining = shuffle(remaining);
        st.extraDeck = remaining;
      } else {
        st.extraDeck = [];
      }

      // Check if timed mission — skip mission screen proceed button
      if (mission.timedView) {
        st.timedBetting = true;
        st.timedBetSeconds = mission.timedView;
      }

      st.phase = 'mission';
      st.currentTurnId = null;
      syncState(st);

    } else if (action === 'proceed-to-betting') {
      st.phase = 'betting';
      st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
      syncState(st);

    } else if (action === 'auto-proceed-timed') {
      // For timed missions: go straight to betting with simultaneous mode
      st.phase = 'betting';
      st.currentTurnId = null; // null = everyone bets simultaneously
      syncState(st);

    } else if (action === 'bet') {
      const { pId, bet } = payload;
      const pIndex = st.players.findIndex(p => p.id === pId);
      if (pIndex === -1) return;
      if (st.players[pIndex].bet !== null) return; // already bet

      st.players = [...st.players];
      st.players[pIndex] = { ...st.players[pIndex], bet };

      if (st.players.every(p => p.bet !== null)) {
        const result = afterAllBetsPlaced(st);
        syncState(result);
      } else {
        // Sequential: advance turn. Simultaneous: keep null
        if (st.currentTurnId !== null) {
          st.currentTurnId = getNextPlayerId(st.players, pId);
        }
        syncState(st);
      }

    } else if (action === 'force-bets') {
      // Timer expired — force remaining players to max bet
      st.players = st.players.map(p => {
        if (p.bet === null) {
          return { ...p, bet: st.totalTricks };
        }
        return p;
      });
      const result = afterAllBetsPlaced(st);
      syncState(result);

    } else if (action === 'swap-select') {
      const { pId, cards } = payload;
      st.swapSelections = { ...st.swapSelections, [pId]: cards };
      if (Object.keys(st.swapSelections).length === st.players.length) {
        const swapped = executeDirectionalSwap(st);
        Object.assign(st, { players: swapped.players, swapSelections: {} });
        st.phase = 'play';
        st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
        st.leadPlayerId = st.currentTurnId;
        st.currentTrick = [];
      }
      syncState(st);

    } else if (action === 'play') {
      const { pId, card } = payload;
      if (st.currentTurnId !== pId) return;
      const pIndex = st.players.findIndex(p => p.id === pId);
      st.players = [...st.players];
      st.players[pIndex] = { ...st.players[pIndex], hand: st.players[pIndex].hand.filter(c => c !== card) };
      st.currentTrick = [...st.currentTrick, { playerId: pId, card }];

      if (st.currentTrick.length === st.players.length) {
        const winnerId = resolveTrick(st.currentTrick, st.currentMission?.invertWinner);
        const result = afterTrickComplete(st, winnerId);
        syncState(result);
      } else {
        st.currentTurnId = getNextPlayerId(st.players, pId);
        syncState(st);
      }

    } else if (action === 'dismiss-trick-result') {
      const result = afterTrickResultDismissed(st);
      syncState(result);

    } else if (action === 'swap-trick-target') {
      st.swapTrickTargetId = payload.targetId;
      syncState(st);

    } else if (action === 'swap-trick-card') {
      const { pId, card } = payload;
      if (pId === st.swapTrickWinnerId) st.swapTrickWinnerCard = card;
      else if (pId === st.swapTrickTargetId) st.swapTrickTargetCard = card;

      if (st.swapTrickWinnerCard !== null && st.swapTrickTargetCard !== null) {
        const winnerId = st.swapTrickWinnerId!;
        const targetId = st.swapTrickTargetId!;
        st.players = st.players.map(p => {
          if (p.id === winnerId) {
            const h = p.hand.filter(c => c !== st.swapTrickWinnerCard);
            h.push(st.swapTrickTargetCard!);
            return { ...p, hand: h.sort((a, b) => a - b) };
          } else if (p.id === targetId) {
            const h = p.hand.filter(c => c !== st.swapTrickTargetCard);
            h.push(st.swapTrickWinnerCard!);
            return { ...p, hand: h.sort((a, b) => a - b) };
          }
          return p;
        });
        st.phase = 'play';
        st.leadPlayerId = winnerId;
        st.currentTurnId = winnerId;
        st.swapTrickWinnerId = null;
        st.swapTrickTargetId = null;
        st.swapTrickWinnerCard = null;
        st.swapTrickTargetCard = null;
      }
      syncState(st);

    } else if (action === 'new-game') {
      const resetPlayers = st.players.map(p => ({ ...p, pilis: 0, bet: null, hand: [] as number[], tricksWon: 0 }));
      const newSt: PiliPiliState = { ...initialState, players: resetPlayers, roomCode: st.roomCode };
      newSt.roundNumber = 1;
      newSt.dealerId = newSt.players[0].id;
      const mission = drawMission([]);
      newSt.currentMission = mission;
      newSt.usedMissionIds = [mission.id];
      newSt.players = dealCards(newSt.players, mission.cardsPerPlayer, !!mission.jokerInPlay);
      newSt.totalTricks = mission.cardsPerPlayer;
      if (mission.timedView) { newSt.timedBetting = true; newSt.timedBetSeconds = mission.timedView; }
      if (mission.drawAfterBet) {
        const used = newSt.players.flatMap(p => p.hand);
        newSt.extraDeck = shuffle(Array.from({ length: 55 }, (_, i) => i + 1).filter(c => !used.includes(c)));
      }
      newSt.phase = 'mission';
      syncState(newSt);
    }
  }, [isHost, syncState]);

  useEffect(() => {
    onBroadcast((event) => {
      if (!isHost && event.type === 'sync') {
        setState(event.payload);
        stateRef.current = event.payload;
      } else if (isHost && event.type === 'action') {
        processAction(event.action!, event.payload);
      }
    });
  }, [onBroadcast, isHost, processAction]);

  const act = useCallback((action: string, payload?: any) => {
    if (isHost) processAction(action, payload);
    else broadcastRef.current({ type: 'action', action, payload });
  }, [isHost, processAction]);

  const myPlayer = state.players.find(p => p.id === playerId);

  return {
    state, myPlayer, myHand: myPlayer?.hand || [],
    startGame: useCallback(() => act('start'), [act]),
    proceedToBetting: useCallback(() => act('proceed-to-betting'), [act]),
    autoProceedTimed: useCallback(() => act('auto-proceed-timed'), [act]),
    placeBet: useCallback((bet: number) => act('bet', { pId: playerId, bet }), [act, playerId]),
    forceBets: useCallback(() => act('force-bets'), [act]),
    playCard: useCallback((card: number) => act('play', { pId: playerId, card }), [act, playerId]),
    dismissTrickResult: useCallback(() => act('dismiss-trick-result'), [act]),
    swapSelect: useCallback((cards: number[]) => act('swap-select', { pId: playerId, cards }), [act, playerId]),
    swapTrickTarget: useCallback((targetId: string) => act('swap-trick-target', { targetId }), [act]),
    swapTrickCard: useCallback((card: number) => act('swap-trick-card', { pId: playerId, card }), [act, playerId]),
    nextRound: useCallback(() => act('next-round'), [act]),
    newGame: useCallback(() => act('new-game'), [act]),
  };
}
