// Wavelength — Game State Machine Hook
// HOST manages authoritative state. Non-host players receive state via sync.

import { useState, useCallback, useRef, useEffect } from 'react';
import type { WavelengthState, WavelengthPhase, WavelengthPlayer, PlayerGuess, WordPair, WavelengthBroadcast } from '../types';
import { getRandomPair } from '../wordPairs';
import { debouncedSaveState } from '../../../lib/roomPersistence';

// Scoring thresholds: [max distance in degrees, points]
// Calibrated to match the fascia_punteggi.png scoring band image
const SOGLIE: [number, number][] = [[4, 4], [12, 3], [20, 2]];

/** Circular distance with 180° period */
function distanza(angolo: number, bersaglio: number): number {
  const d = Math.abs(angolo - bersaglio);
  return Math.min(d, 180 - d);
}

/** Score for a guessing player based on their arrow angle vs target */
function calcolaPunteggio(angolo: number, bersaglio: number): number {
  const d = distanza(angolo, bersaglio);
  for (const [limite, punti] of SOGLIE) {
    if (d <= limite) return punti;
  }
  return 0;
}

/** Random target 0-180 with one decimal */
function bersaglioCasuale(): number {
  return Math.round(Math.random() * 1800) / 10;
}

interface UseWavelengthGameProps {
  playerId: string;
  isHost: boolean;
  roomCode: string | null;
  players: { id: string; name: string; isHost: boolean }[];
  broadcast: (event: WavelengthBroadcast) => void;
  onBroadcast: (callback: (event: WavelengthBroadcast) => void) => void;
}

const INITIAL_STATE: WavelengthState = {
  phase: 'create',
  roomCode: '',
  players: [],
  roundNumber: 0,
  activePlayerId: null,
  currentPair: null,
  customPair: false,
  targetAngle: null,
  clue: '',
  guesses: [],
  activePlayerScore: 0,
  usedPairIndices: [],
  lastUsedCategory: null,
  winScore: 25,
  skipsRemaining: 2,
  winnerId: null,
};

export function useWavelengthGame({
  playerId,
  isHost,
  roomCode,
  players,
  broadcast,
  onBroadcast,
}: UseWavelengthGameProps) {
  const [state, setState] = useState<WavelengthState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const syncState = useCallback((newState: WavelengthState) => {
    setState(newState);
    broadcast({ type: 'sync', payload: newState });
    if (roomCode && newState.phase !== 'create') debouncedSaveState(roomCode, newState);
  }, [broadcast, roomCode]);

  // Load saved state from DB when host rejoins
  useEffect(() => {
    if (!isHost || !roomCode || stateRef.current.phase !== 'create') return;
    (async () => {
      const { loadRoom } = await import('../../../lib/roomPersistence');
      const room = await loadRoom(roomCode);
      if (room?.state && room.phase === 'playing') {
        stateRef.current = room.state;
        setState(room.state);
        broadcast({ type: 'sync', payload: room.state });
      }
    })();
  }, [isHost, roomCode, broadcast]);

  // ---- HOST: Start the game ----
  const startGame = useCallback((roomCode: string, winScore?: number) => {
    if (!isHost) return;

    const gamePlayers: WavelengthPlayer[] = players.map(p => ({
      id: p.id,
      name: p.name,
      totalScore: 0,
    }));

    const newState: WavelengthState = {
      phase: 'active-player',
      roomCode,
      players: gamePlayers,
      roundNumber: 1,
      activePlayerId: gamePlayers[0].id, // first player starts
      currentPair: null,
      customPair: false,
      targetAngle: null,
      clue: '',
      guesses: [],
      activePlayerScore: 0,
      usedPairIndices: [],
      lastUsedCategory: null,
      winScore: winScore ?? 25,
      skipsRemaining: 2,
      winnerId: null,
    };

    syncState(newState);
  }, [isHost, players, syncState]);

  // ---- HOST: Pick random pair ----
  const handlePickRandomPair = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    const result = getRandomPair(s.usedPairIndices, s.lastUsedCategory);
    if (!result) return; // pool exhausted

    const target = bersaglioCasuale();

    syncState({
      ...s,
      currentPair: result.pair,
      customPair: false,
      targetAngle: target,
      usedPairIndices: [...s.usedPairIndices, result.index],
      lastUsedCategory: result.pair.category,
    });
  }, [isHost, syncState]);

  // ---- HOST: Pick custom pair ----
  const handlePickCustomPair = useCallback((extreme1: string, extreme2: string) => {
    if (!isHost) return;
    const s = stateRef.current;
    const target = bersaglioCasuale();
    const pair: WordPair = { category: 'Personalizzata', extreme1, extreme2 };

    syncState({
      ...s,
      currentPair: pair,
      customPair: true,
      targetAngle: target,
    });
  }, [isHost, syncState]);

  // ---- HOST: Skip pair (max 2 per turn) ----
  const handleSkipPair = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.skipsRemaining <= 0) return;

    const result = getRandomPair(s.usedPairIndices, s.lastUsedCategory);
    if (!result) return;

    const target = bersaglioCasuale();

    syncState({
      ...s,
      currentPair: result.pair,
      customPair: false,
      targetAngle: target,
      usedPairIndices: [...s.usedPairIndices, result.index],
      lastUsedCategory: result.pair.category,
      skipsRemaining: s.skipsRemaining - 1,
      clue: '',
    });
  }, [isHost, syncState]);

  // ---- HOST: Submit clue ----
  const handleSubmitClue = useCallback((clueText: string) => {
    if (!isHost) return;
    const s = stateRef.current;

    syncState({
      ...s,
      phase: 'guessing',
      clue: clueText,
    });
  }, [isHost, syncState]);

  // ---- HOST: Submit guess ----
  const handleSubmitGuess = useCallback((guessPlayerId: string, angle: number) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'guessing') return;
    // Prevent duplicate guesses
    if (s.guesses.some(g => g.playerId === guessPlayerId)) return;

    const score = calcolaPunteggio(angle, s.targetAngle!);
    const newGuess: PlayerGuess = { playerId: guessPlayerId, angle, score };
    const newGuesses = [...s.guesses, newGuess];

    // Check if all non-active players have guessed
    const nonActivePlayers = s.players.filter(p => p.id !== s.activePlayerId);
    const allGuessed = nonActivePlayers.every(p =>
      newGuesses.some(g => g.playerId === p.id)
    );

    if (allGuessed) {
      // Active player gets +1 if >= 50% of guessers scored 2+ points (hit the target zone)
      const hitCount = newGuesses.filter(g => g.score >= 2).length;
      const threshold = Math.ceil(nonActivePlayers.length / 2);
      const activeScore = hitCount >= threshold ? 1 : 0;

      // Update player scores
      const updatedPlayers = s.players.map(p => {
        if (p.id === s.activePlayerId) {
          return { ...p, totalScore: p.totalScore + activeScore };
        }
        const guess = newGuesses.find(g => g.playerId === p.id);
        if (guess) {
          return { ...p, totalScore: p.totalScore + guess.score };
        }
        return p;
      });

      // Check for winner using configurable winScore
      const winner = updatedPlayers.find(p => p.totalScore >= s.winScore);

      syncState({
        ...s,
        phase: winner ? 'game-over' : 'scoring',
        guesses: newGuesses,
        activePlayerScore: activeScore,
        players: updatedPlayers,
        winnerId: winner ? winner.id : null,
      });
    } else {
      syncState({
        ...s,
        guesses: newGuesses,
      });
    }
  }, [isHost, syncState]);

  // ---- HOST: Next round ----
  const handleNextRound = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;

    // Rotate active player: next in array (wraps around)
    const currentIdx = s.players.findIndex(p => p.id === s.activePlayerId);
    const nextIdx = (currentIdx + 1) % s.players.length;

    syncState({
      ...s,
      phase: 'active-player',
      roundNumber: s.roundNumber + 1,
      activePlayerId: s.players[nextIdx].id,
      currentPair: null,
      customPair: false,
      targetAngle: null,
      clue: '',
      guesses: [],
      activePlayerScore: 0,
      skipsRemaining: 2,
    });
  }, [isHost, syncState]);

  // ---- HOST: New game ----
  const handleNewGame = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...INITIAL_STATE,
      phase: 'lobby' as WavelengthPhase,
      roomCode: s.roomCode,
      players: s.players.map(p => ({ ...p, totalScore: 0 })),
      winScore: s.winScore,
    });
  }, [isHost, syncState]);

  // ---- Listen for broadcast events ----
  useEffect(() => {
    onBroadcast((event: WavelengthBroadcast) => {
      if (isHost) {
        if (event.type === 'action') {
          switch (event.action) {
            case 'start':
              startGame(event.payload.roomCode, event.payload.winScore);
              break;
            case 'pick-random-pair':
              handlePickRandomPair();
              break;
            case 'pick-custom-pair':
              handlePickCustomPair(event.payload.extreme1, event.payload.extreme2);
              break;
            case 'submit-clue':
              handleSubmitClue(event.payload.clue);
              break;
            case 'submit-guess':
              handleSubmitGuess(event.payload.playerId, event.payload.angle);
              break;
            case 'skip-pair':
              handleSkipPair();
              break;
            case 'next-round':
              handleNextRound();
              break;
            case 'new-game':
              handleNewGame();
              break;
          }
        } else if (event.type === 'request-sync') {
          if (stateRef.current.phase !== 'create') {
            broadcast({ type: 'sync', payload: stateRef.current });
          }
        }
      } else {
        if (event.type === 'sync') {
          setState(event.payload);
        }
      }
    });
  }, [isHost, startGame, handlePickRandomPair, handlePickCustomPair, handleSubmitClue, handleSubmitGuess, handleSkipPair, handleNextRound, handleNewGame, onBroadcast, broadcast]);

  // ---- Player actions (broadcast to host) ----
  const act = useCallback((action: string, payload?: any) => {
    const msg: WavelengthBroadcast = { type: 'action', action, payload };
    if (isHost) {
      // Process locally
      switch (action) {
        case 'start':
          startGame(payload.roomCode, payload.winScore);
          break;
        case 'pick-random-pair':
          handlePickRandomPair();
          break;
        case 'pick-custom-pair':
          handlePickCustomPair(payload.extreme1, payload.extreme2);
          break;
        case 'submit-clue':
          handleSubmitClue(payload.clue);
          break;
        case 'submit-guess':
          handleSubmitGuess(payload.playerId, payload.angle);
          break;
        case 'skip-pair':
          handleSkipPair();
          break;
        case 'next-round':
          handleNextRound();
          break;
        case 'new-game':
          handleNewGame();
          break;
      }
    } else {
      broadcast(msg);
    }
  }, [isHost, broadcast, startGame, handlePickRandomPair, handlePickCustomPair, handleSubmitClue, handleSubmitGuess, handleSkipPair, handleNextRound, handleNewGame]);

  return {
    state,
    act,
    setState,
  };
}
