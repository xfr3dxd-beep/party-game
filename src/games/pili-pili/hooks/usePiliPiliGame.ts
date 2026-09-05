import { useState, useEffect, useCallback, useRef } from 'react';
import { PiliPiliState, PiliPiliBroadcast, PiliPiliPlayer } from '../types';
import { RoomPlayer } from './usePiliPiliRoom';
import { dealCards, drawMission, getNextPlayerId, resolveTrick } from '../gameLogic';

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

  // Helper: get left neighbor
  const getLeftNeighbor = (pList: PiliPiliPlayer[], pId: string): string => {
    const idx = pList.findIndex(p => p.id === pId);
    return pList[(idx + 1) % pList.length].id;
  };

  // Helper: get right neighbor
  const getRightNeighbor = (pList: PiliPiliPlayer[], pId: string): string => {
    const idx = pList.findIndex(p => p.id === pId);
    return pList[(idx - 1 + pList.length) % pList.length].id;
  };

  // Execute directional swap (missions 1-7): move selected cards left or right
  const executeDirectionalSwap = (st: PiliPiliState): PiliPiliState => {
    const mission = st.currentMission;
    if (!mission || !mission.swapDirection) return st;

    const direction = mission.swapDirection;
    const newPlayers = st.players.map(p => ({ ...p, hand: [...p.hand] }));

    // Collect cards each player is giving
    const giving: Record<string, number[]> = {};
    for (const p of newPlayers) {
      const selectedCards = st.swapSelections[p.id] || [];
      giving[p.id] = selectedCards;
      // Remove given cards from hand
      p.hand = p.hand.filter(c => !selectedCards.includes(c));
    }

    // Add received cards
    for (const p of newPlayers) {
      const neighborId = direction === 'left'
        ? getRightNeighbor(newPlayers, p.id)  // I receive from my right neighbor (they pass left to me)
        : getLeftNeighbor(newPlayers, p.id);   // I receive from my left neighbor (they pass right to me)
      const receivedCards = giving[neighborId] || [];
      p.hand = [...p.hand, ...receivedCards].sort((a, b) => a - b);
    }

    return { ...st, players: newPlayers, swapSelections: {} };
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
      st.swapSelections = {};
      st.swapTrickWinnerId = null;
      st.swapTrickTargetId = null;
      st.swapTrickWinnerCard = null;
      st.swapTrickTargetCard = null;
      st.phase = 'mission';
      st.currentTurnId = null;
      syncState(st);

    } else if (action === 'proceed-to-betting') {
      st.phase = 'betting';
      st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
      syncState(st);

    } else if (action === 'bet') {
      const { pId, bet } = payload;
      const pIndex = st.players.findIndex(p => p.id === pId);
      if (pIndex === -1 || st.currentTurnId !== pId) return;
      st.players = [...st.players];
      st.players[pIndex] = { ...st.players[pIndex], bet };

      if (st.players.every(p => p.bet !== null)) {
        // All bets placed — check if mission requires swapping
        const mission = st.currentMission;
        if (mission && mission.swapDirection && mission.swapTiming === 'after-bet') {
          // Missions 1-7: need players to select cards to swap
          const swapCount = mission.swapCount!;
          if (swapCount === -1) {
            // Swap ALL cards — auto-select everything, no UI needed
            const selections: Record<string, number[]> = {};
            for (const p of st.players) {
              selections[p.id] = [...p.hand];
            }
            st.swapSelections = selections;
            // Execute swap immediately
            const swapped = executeDirectionalSwap(st);
            Object.assign(st, { players: swapped.players, swapSelections: {} });
            // Go to play
            st.phase = 'play';
            st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
            st.leadPlayerId = st.currentTurnId;
            st.currentTrick = [];
          } else {
            // Need each player to choose N cards — go to swap phase
            st.phase = 'swapping';
            st.swapSelections = {};
            // currentTurnId not needed — all players pick simultaneously
          }
        } else {
          // No swap — go directly to play
          st.phase = 'play';
          st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
          st.leadPlayerId = st.currentTurnId;
          st.currentTrick = [];
        }
      } else {
        st.currentTurnId = getNextPlayerId(st.players, pId);
      }
      syncState(st);

    } else if (action === 'swap-select') {
      // Player selected cards to swap (missions 1-5)
      const { pId, cards } = payload;
      st.swapSelections = { ...st.swapSelections, [pId]: cards };

      // Check if all players submitted
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
      st.players[pIndex] = {
        ...st.players[pIndex],
        hand: st.players[pIndex].hand.filter(c => c !== card),
      };
      st.currentTrick = [...st.currentTrick, { playerId: pId, card }];

      if (st.currentTrick.length === st.players.length) {
        // Trick complete
        const winnerId = resolveTrick(st.currentTrick, st.currentMission?.invertWinner);
        const wIndex = st.players.findIndex(p => p.id === winnerId);
        st.players[wIndex] = { ...st.players[wIndex], tricksWon: st.players[wIndex].tricksWon + 1 };
        st.trickNumber += 1;

        // Check penalty for first/last trick (missions 18, 31)
        if (st.currentMission?.penaltyFirstLast) {
          if (st.trickNumber === 1 || st.trickNumber === st.totalTricks) {
            st.players[wIndex] = { ...st.players[wIndex], pilis: st.players[wIndex].pilis + 1 };
          }
        }

        // Check penalty for card range (missions 23, 24, 25)
        if (st.currentMission?.penaltyRange) {
          const [lo, hi] = st.currentMission.penaltyRange;
          const winningCard = st.currentTrick.find(c => c.playerId === winnerId)?.card || 0;
          if (winningCard >= lo && winningCard <= hi) {
            st.players[wIndex] = { ...st.players[wIndex], pilis: st.players[wIndex].pilis + 1 };
          }
        }

        if (st.trickNumber >= st.totalTricks) {
          // Round over
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
          // Missions 26, 36: winner must swap a card with someone
          // Check if winner has cards left
          if (st.players[wIndex].hand.length > 0) {
            st.swapTrickWinnerId = winnerId;
            st.swapTrickTargetId = null;
            st.swapTrickWinnerCard = null;
            st.swapTrickTargetCard = null;
            st.phase = 'swap-after-trick';
            st.currentTrick = [];
          } else {
            // No cards to swap, continue
            st.leadPlayerId = winnerId;
            st.currentTurnId = winnerId;
            st.currentTrick = [];
          }
        } else {
          st.leadPlayerId = winnerId;
          st.currentTurnId = winnerId;
          st.currentTrick = [];
        }
      } else {
        st.currentTurnId = getNextPlayerId(st.players, pId);
      }
      syncState(st);

    } else if (action === 'swap-trick-target') {
      // Winner chose who to swap with (missions 26, 36)
      const { targetId } = payload;
      st.swapTrickTargetId = targetId;
      syncState(st);

    } else if (action === 'swap-trick-card') {
      // A player chose which card to give in the swap
      const { pId, card } = payload;
      if (pId === st.swapTrickWinnerId) {
        st.swapTrickWinnerCard = card;
      } else if (pId === st.swapTrickTargetId) {
        st.swapTrickTargetCard = card;
      }

      // Both chose? Execute swap
      if (st.swapTrickWinnerCard !== null && st.swapTrickTargetCard !== null) {
        const winnerId = st.swapTrickWinnerId!;
        const targetId = st.swapTrickTargetId!;
        st.players = st.players.map(p => {
          if (p.id === winnerId) {
            const newHand = p.hand.filter(c => c !== st.swapTrickWinnerCard);
            newHand.push(st.swapTrickTargetCard!);
            return { ...p, hand: newHand.sort((a, b) => a - b) };
          } else if (p.id === targetId) {
            const newHand = p.hand.filter(c => c !== st.swapTrickTargetCard);
            newHand.push(st.swapTrickWinnerCard!);
            return { ...p, hand: newHand.sort((a, b) => a - b) };
          }
          return p;
        });

        // Continue to next trick
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

  const startGame = useCallback(() => {
    if (isHost) processAction('start', null);
    else broadcastRef.current({ type: 'action', action: 'start' });
  }, [isHost, processAction]);

  const proceedToBetting = useCallback(() => {
    if (isHost) processAction('proceed-to-betting', null);
    else broadcastRef.current({ type: 'action', action: 'proceed-to-betting' });
  }, [isHost, processAction]);

  const placeBet = useCallback((bet: number) => {
    if (isHost) processAction('bet', { pId: playerId, bet });
    else broadcastRef.current({ type: 'action', action: 'bet', payload: { pId: playerId, bet } });
  }, [isHost, playerId, processAction]);

  const playCard = useCallback((card: number) => {
    if (isHost) processAction('play', { pId: playerId, card });
    else broadcastRef.current({ type: 'action', action: 'play', payload: { pId: playerId, card } });
  }, [isHost, playerId, processAction]);

  const swapSelect = useCallback((cards: number[]) => {
    if (isHost) processAction('swap-select', { pId: playerId, cards });
    else broadcastRef.current({ type: 'action', action: 'swap-select', payload: { pId: playerId, cards } });
  }, [isHost, playerId, processAction]);

  const swapTrickTarget = useCallback((targetId: string) => {
    if (isHost) processAction('swap-trick-target', { targetId });
    else broadcastRef.current({ type: 'action', action: 'swap-trick-target', payload: { targetId } });
  }, [isHost, processAction]);

  const swapTrickCard = useCallback((card: number) => {
    if (isHost) processAction('swap-trick-card', { pId: playerId, card });
    else broadcastRef.current({ type: 'action', action: 'swap-trick-card', payload: { pId: playerId, card } });
  }, [isHost, playerId, processAction]);

  const nextRound = useCallback(() => {
    if (isHost) processAction('next-round', null);
    else broadcastRef.current({ type: 'action', action: 'next-round' });
  }, [isHost, processAction]);

  const newGame = useCallback(() => {
    if (isHost) processAction('new-game', null);
    else broadcastRef.current({ type: 'action', action: 'new-game' });
  }, [isHost, processAction]);

  const myPlayer = state.players.find(p => p.id === playerId);

  return {
    state,
    myPlayer,
    myHand: myPlayer?.hand || [],
    startGame,
    proceedToBetting,
    playCard,
    placeBet,
    swapSelect,
    swapTrickTarget,
    swapTrickCard,
    nextRound,
    newGame,
  };
}
