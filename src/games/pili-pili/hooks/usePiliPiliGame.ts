import { useState, useEffect, useCallback } from 'react';
import { PiliPiliState, PiliPiliBroadcast, PiliPiliPlayer, PlayedCard } from '../types';
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

  const syncState = useCallback((newState: PiliPiliState) => {
    setState(newState);
    if (isHost) {
      broadcast({ type: 'sync', payload: newState });
    }
  }, [isHost, broadcast]);

  useEffect(() => {
    if (isHost && state.phase === 'create' && players.length > 0) {
      // Initialize players
      const newPlayers = players.map(p => {
        const existing = state.players.find(ep => ep.id === p.id);
        return existing || {
          id: p.id,
          name: p.name,
          hand: [],
          pilis: 0,
          bet: null,
          tricksWon: 0,
        };
      });
      if (newPlayers.length !== state.players.length) {
        syncState({ ...state, players: newPlayers });
      }
    }
  }, [isHost, players, state.phase, state.players, syncState]);

  useEffect(() => {
    onBroadcast((event) => {
      if (!isHost && event.type === 'sync') {
        setState(event.payload);
      } else if (isHost && event.type === 'action') {
        handleClientAction(event.action!, event.payload);
      }
    });
  }, [onBroadcast, isHost]);

  const handleClientAction = (action: string, payload: any) => {
    if (!isHost) return;
    
    let newState = { ...state };
    
    if (action === 'start') {
      newState = startRound(newState);
    } else if (action === 'bet') {
      const { pId, bet } = payload;
      const pIndex = newState.players.findIndex(p => p.id === pId);
      if (pIndex !== -1 && newState.currentTurnId === pId) {
        newState.players[pIndex].bet = bet;
        
        // Next better
        newState.currentTurnId = getNextPlayerId(newState.players, pId);
        
        // If everyone bet, go to play phase
        if (newState.players.every(p => p.bet !== null)) {
          newState.phase = 'play';
          newState.currentTurnId = getNextPlayerId(newState.players, newState.dealerId!);
          newState.leadPlayerId = newState.currentTurnId;
          newState.currentTrick = [];
        }
        syncState(newState);
      }
    } else if (action === 'play') {
      const { pId, card } = payload;
      if (newState.currentTurnId === pId) {
        const pIndex = newState.players.findIndex(p => p.id === pId);
        
        // Remove card from hand
        newState.players[pIndex].hand = newState.players[pIndex].hand.filter(c => c !== card);
        
        // Add to trick
        newState.currentTrick.push({ playerId: pId, card });
        
        if (newState.currentTrick.length === newState.players.length) {
          // Trick is complete
          const winnerId = resolveTrick(newState.currentTrick, newState.currentMission?.invertWinner);
          const wIndex = newState.players.findIndex(p => p.id === winnerId);
          newState.players[wIndex].tricksWon += 1;
          
          newState.trickNumber += 1;
          
          if (newState.trickNumber >= newState.totalTricks) {
            // Round over
            newState.phase = 'round-result';
            newState.players = newState.players.map(p => {
              const diff = Math.abs((p.bet || 0) - p.tricksWon);
              let piliPenalty = diff;
              
              let newPilis = p.pilis + piliPenalty;
              if (diff === 0 && newState.currentMission?.bonusPrecise) {
                const removeAmount = newState.currentMission.bonusPreciseAmount === 'bet-value' ? (p.bet || 0) : 1;
                newPilis = Math.max(0, newPilis - removeAmount);
              }
              
              return { ...p, pilis: newPilis };
            });
            
            // Check game over
            if (newState.players.some(p => p.pilis >= 7)) {
              newState.phase = 'game-over';
            }
          } else {
            newState.leadPlayerId = winnerId;
            newState.currentTurnId = winnerId;
            newState.currentTrick = [];
          }
        } else {
          // Next player
          newState.currentTurnId = getNextPlayerId(newState.players, pId);
        }
        
        syncState(newState);
      }
    } else if (action === 'next-round') {
      newState = startRound(newState);
    } else if (action === 'new-game') {
      newState = { ...initialState, players: newState.players.map(p => ({ ...p, pilis: 0, bet: null, hand: [], tricksWon: 0 })), roomCode: newState.roomCode, dealerId: null };
      newState = startRound(newState);
    }
  };

  const startRound = (currentState: PiliPiliState) => {
    let st = { ...currentState };
    st.roundNumber += 1;
    st.dealerId = st.dealerId ? getNextPlayerId(st.players, st.dealerId) : st.players[0].id;
    
    const mission = drawMission(st.usedMissionIds);
    st.currentMission = mission;
    st.usedMissionIds.push(mission.id);
    
    st.players = dealCards(st.players, mission.cardsPerPlayer, !!mission.jokerInPlay);
    st.totalTricks = mission.cardsPerPlayer;
    st.trickNumber = 0;
    st.currentTrick = [];
    st.phase = 'mission'; // Host will show mission, then wait to proceed to betting
    
    // Auto proceed to betting after showing mission
    st.phase = 'betting';
    st.currentTurnId = getNextPlayerId(st.players, st.dealerId); // Player after dealer bets first
    
    syncState(st);
    return st;
  };

  const startGame = () => {
    if (!isHost) {
      broadcast({ type: 'action', action: 'start' });
    } else {
      startRound(state);
    }
  };

  const playCard = (card: number) => {
    if (isHost) {
      handleClientAction('play', { pId: playerId, card });
    } else {
      broadcast({ type: 'action', action: 'play', payload: { pId: playerId, card } });
    }
  };

  const placeBet = (bet: number) => {
    if (isHost) {
      handleClientAction('bet', { pId: playerId, bet });
    } else {
      broadcast({ type: 'action', action: 'bet', payload: { pId: playerId, bet } });
    }
  };

  const nextRound = () => {
    if (isHost) {
      handleClientAction('next-round', null);
    } else {
      broadcast({ type: 'action', action: 'next-round' });
    }
  };
  
  const newGame = () => {
    if (isHost) {
      handleClientAction('new-game', null);
    } else {
      broadcast({ type: 'action', action: 'new-game' });
    }
  }

  const myPlayer = state.players.find(p => p.id === playerId);
  const myHand = myPlayer?.hand || [];

  return {
    state,
    myPlayer,
    myHand,
    startGame,
    playCard,
    placeBet,
    nextRound,
    newGame
  };
}
