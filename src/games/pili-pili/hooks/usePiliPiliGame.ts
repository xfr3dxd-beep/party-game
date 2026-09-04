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

  // Initialize players when they join
  useEffect(() => {
    if (isHost && stateRef.current.phase === 'create' && players.length > 0) {
      const newPlayers: PiliPiliPlayer[] = players.map(p => {
        const existing = stateRef.current.players.find(ep => ep.id === p.id);
        return existing || {
          id: p.id,
          name: p.name,
          hand: [],
          pilis: 0,
          bet: null,
          tricksWon: 0,
        };
      });
      if (newPlayers.length !== stateRef.current.players.length) {
        syncState({ ...stateRef.current, players: newPlayers });
      }
    }
  }, [isHost, players, syncState]);

  // Process actions from host perspective
  const processAction = useCallback((action: string, payload: any) => {
    if (!isHost) return;

    const st = { ...stateRef.current };

    if (action === 'start' || action === 'next-round') {
      // Start a new round: Mission → show mission screen
      st.roundNumber += 1;
      st.dealerId = st.dealerId ? getNextPlayerId(st.players, st.dealerId) : st.players[0].id;

      const mission = drawMission(st.usedMissionIds);
      st.currentMission = mission;
      st.usedMissionIds = [...st.usedMissionIds, mission.id];

      // Deal cards
      st.players = dealCards(st.players, mission.cardsPerPlayer, !!mission.jokerInPlay);
      st.totalTricks = mission.cardsPerPlayer;
      st.trickNumber = 0;
      st.currentTrick = [];

      // Phase 1: Show mission card
      st.phase = 'mission';
      st.currentTurnId = null;
      syncState(st);

    } else if (action === 'proceed-to-betting') {
      // After mission is shown, move to betting
      st.phase = 'betting';
      st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
      syncState(st);

    } else if (action === 'bet') {
      const { pId, bet } = payload;
      const pIndex = st.players.findIndex(p => p.id === pId);
      if (pIndex === -1 || st.currentTurnId !== pId) return;

      st.players = [...st.players];
      st.players[pIndex] = { ...st.players[pIndex], bet };

      // Check if everyone has bet
      if (st.players.every(p => p.bet !== null)) {
        st.phase = 'play';
        st.currentTurnId = getNextPlayerId(st.players, st.dealerId!);
        st.leadPlayerId = st.currentTurnId;
        st.currentTrick = [];
      } else {
        st.currentTurnId = getNextPlayerId(st.players, pId);
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
        // Trick complete — resolve winner
        const winnerId = resolveTrick(st.currentTrick, st.currentMission?.invertWinner);
        const wIndex = st.players.findIndex(p => p.id === winnerId);
        st.players[wIndex] = { ...st.players[wIndex], tricksWon: st.players[wIndex].tricksWon + 1 };

        st.trickNumber += 1;

        if (st.trickNumber >= st.totalTricks) {
          // Round over — calculate penalties
          st.players = st.players.map(p => {
            const diff = Math.abs((p.bet || 0) - p.tricksWon);
            let newPilis = p.pilis + diff;

            // Bonus: exact bet removes Pilis
            if (diff === 0 && st.currentMission?.bonusPrecise) {
              const removeAmount = st.currentMission.bonusPreciseAmount === 'bet-value' ? (p.bet || 0) : 1;
              newPilis = Math.max(0, newPilis - removeAmount);
            }

            // Penalty for first/last trick (handled per-trick above if needed)
            return { ...p, pilis: newPilis };
          });

          // Check game over
          if (st.players.some(p => p.pilis >= 7)) {
            st.phase = 'game-over';
          } else {
            st.phase = 'round-result';
          }
        } else {
          // Next trick
          st.leadPlayerId = winnerId;
          st.currentTurnId = winnerId;
          st.currentTrick = [];
        }
      } else {
        // Next player in this trick
        st.currentTurnId = getNextPlayerId(st.players, pId);
      }

      syncState(st);

    } else if (action === 'new-game') {
      const resetPlayers = st.players.map(p => ({ ...p, pilis: 0, bet: null, hand: [] as number[], tricksWon: 0 }));
      const newSt: PiliPiliState = {
        ...initialState,
        players: resetPlayers,
        roomCode: st.roomCode,
        dealerId: null,
      };
      // Start first round immediately
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

  // Listen for broadcasts
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

  // === Player actions ===
  const startGame = useCallback(() => {
    if (isHost) {
      processAction('start', null);
    } else {
      broadcastRef.current({ type: 'action', action: 'start' });
    }
  }, [isHost, processAction]);

  const proceedToBetting = useCallback(() => {
    if (isHost) {
      processAction('proceed-to-betting', null);
    } else {
      broadcastRef.current({ type: 'action', action: 'proceed-to-betting' });
    }
  }, [isHost, processAction]);

  const placeBet = useCallback((bet: number) => {
    if (isHost) {
      processAction('bet', { pId: playerId, bet });
    } else {
      broadcastRef.current({ type: 'action', action: 'bet', payload: { pId: playerId, bet } });
    }
  }, [isHost, playerId, processAction]);

  const playCard = useCallback((card: number) => {
    if (isHost) {
      processAction('play', { pId: playerId, card });
    } else {
      broadcastRef.current({ type: 'action', action: 'play', payload: { pId: playerId, card } });
    }
  }, [isHost, playerId, processAction]);

  const nextRound = useCallback(() => {
    if (isHost) {
      processAction('next-round', null);
    } else {
      broadcastRef.current({ type: 'action', action: 'next-round' });
    }
  }, [isHost, processAction]);

  const newGame = useCallback(() => {
    if (isHost) {
      processAction('new-game', null);
    } else {
      broadcastRef.current({ type: 'action', action: 'new-game' });
    }
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
    nextRound,
    newGame,
  };
}
