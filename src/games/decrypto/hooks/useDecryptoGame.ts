import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  DecryptoState, DecryptoPhase, DecryptoPlayer, DecryptoTeam,
  RoundRecord, DecryptoBroadcast,
} from '../types';
import { drawCode } from '../codes';
import { loadWords, drawWords } from '../words';
import { debouncedSaveState } from '../../../lib/roomPersistence';

interface UseDecryptoGameProps {
  playerId: string;
  isHost: boolean;
  roomCode: string | null;
  players: { id: string; name: string; isHost: boolean }[];
  broadcast: (event: DecryptoBroadcast) => void;
  onBroadcast: (callback: (event: DecryptoBroadcast) => void) => void;
}

const INITIAL_STATE: DecryptoState = {
  phase: 'create',
  roomCode: '',
  players: [],
  biancaWords: [],
  neraWords: [],
  usedBiancaCodes: [],
  usedNeraCodes: [],
  roundNumber: 0,
  activeTeam: 'bianca',
  activePlayerId: '',
  currentCode: [],
  currentCodeStr: '',
  clues: [],
  cluesSubmitted: false,
  teamGuess: [],
  opponentGuess: [],
  teamGuessSubmitted: false,
  opponentGuessSubmitted: false,
  biancaMiscommunications: 0,
  biancaInterceptions: 0,
  neraMiscommunications: 0,
  neraInterceptions: 0,
  rounds: [],
  startingTeam: 'bianca',
  biancaPlayerOrder: [],
  neraPlayerOrder: [],
  biancaTurnIndex: 0,
  neraTurnIndex: 0,
  timerStartedAt: null,
  winner: null,
  losingTeam: null,
  loseReason: null,
  finalGuessWords: [],
  finalGuessCorrect: null,
};

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function getOpponent(team: DecryptoTeam): DecryptoTeam {
  return team === 'bianca' ? 'nera' : 'bianca';
}

/** Helper: set up next round fields on a state object */
function setupNextRound(s: DecryptoState): Partial<DecryptoState> | null {
  const nextTeam = getOpponent(s.activeTeam);
  const usedCodes = nextTeam === 'bianca' ? s.usedBiancaCodes : s.usedNeraCodes;
  const drawn = drawCode(usedCodes);
  if (!drawn) return null;

  let bTurn = s.biancaTurnIndex;
  let nTurn = s.neraTurnIndex;
  if (nextTeam === 'bianca') bTurn++; else nTurn++;

  const order = nextTeam === 'bianca' ? s.biancaPlayerOrder : s.neraPlayerOrder;
  const idx = nextTeam === 'bianca' ? bTurn : nTurn;

  return {
    phase: 'clue-giving' as DecryptoPhase,
    roundNumber: s.roundNumber + 1,
    activeTeam: nextTeam,
    activePlayerId: order[idx % order.length],
    currentCode: drawn.code,
    currentCodeStr: drawn.codeStr,
    clues: [], cluesSubmitted: false,
    teamGuess: [], opponentGuess: [],
    teamGuessSubmitted: false, opponentGuessSubmitted: false,
    usedBiancaCodes: nextTeam === 'bianca' ? [...s.usedBiancaCodes, drawn.codeStr] : s.usedBiancaCodes,
    usedNeraCodes: nextTeam === 'nera' ? [...s.usedNeraCodes, drawn.codeStr] : s.usedNeraCodes,
    biancaTurnIndex: bTurn,
    neraTurnIndex: nTurn,
    timerStartedAt: null, // Timer starts when player confirms
  };
}

export function useDecryptoGame({
  playerId, isHost, roomCode, players, broadcast, onBroadcast,
}: UseDecryptoGameProps) {
  const [state, setState] = useState<DecryptoState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;
  const playersRef = useRef(players);
  playersRef.current = players;

  const syncState = useCallback((newState: DecryptoState) => {
    setState(newState);
    broadcast({ type: 'sync', payload: newState });
    if (roomCode && newState.phase !== 'create') debouncedSaveState(roomCode, newState);
  }, [broadcast, roomCode]);

  // Load saved state
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

  // ---- SYNC ROOM PLAYERS INTO STATE (lobby phase) ----
  useEffect(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'create' && s.phase !== 'lobby') return;
    if (players.length === 0) return;
    const merged: DecryptoPlayer[] = players.map(rp => {
      const existing = s.players.find(sp => sp.id === rp.id);
      return existing || { id: rp.id, name: rp.name, team: null };
    });
    const changed = merged.length !== s.players.length ||
      merged.some((p, i) => p.id !== s.players[i]?.id || p.name !== s.players[i]?.name);
    if (changed) {
      const newState = { ...s, players: merged };
      stateRef.current = newState;
      setState(newState);
      broadcast({ type: 'sync', payload: newState });
    }
  }, [isHost, players, broadcast]);

  // ---- JOIN TEAM ----
  const handleJoinTeam = useCallback((pid: string, team: DecryptoTeam) => {
    if (!isHost) return;
    const s = stateRef.current;
    let found = false;
    const updated = s.players.map(p => {
      if (p.id === pid) { found = true; return { ...p, team }; }
      return p;
    });
    if (!found) {
      const rp = playersRef.current.find(p => p.id === pid);
      if (rp) updated.push({ id: rp.id, name: rp.name, team });
    }
    syncState({ ...s, players: updated });
  }, [isHost, syncState]);

  // ---- START GAME ----
  const handleStartGame = useCallback(async () => {
    if (!isHost) return;
    const s = stateRef.current;
    const pool = await loadWords();
    const allWords = drawWords(pool, 8);
    syncState({
      ...s,
      phase: 'choose-starter',
      biancaWords: allWords.slice(0, 4),
      neraWords: allWords.slice(4, 8),
      biancaPlayerOrder: [...s.players.filter(p => p.team === 'bianca').map(p => p.id)].sort(() => Math.random() - 0.5),
      neraPlayerOrder: [...s.players.filter(p => p.team === 'nera').map(p => p.id)].sort(() => Math.random() - 0.5),
      biancaTurnIndex: 0,
      neraTurnIndex: 0,
    });
  }, [isHost, syncState]);

  // ---- CHOOSE STARTER ----
  const handleChooseStarter = useCallback((team: DecryptoTeam) => {
    if (!isHost) return;
    const s = stateRef.current;
    const usedCodes = team === 'bianca' ? s.usedBiancaCodes : s.usedNeraCodes;
    const drawn = drawCode(usedCodes);
    if (!drawn) return;
    const playerOrder = team === 'bianca' ? s.biancaPlayerOrder : s.neraPlayerOrder;
    const turnIndex = team === 'bianca' ? s.biancaTurnIndex : s.neraTurnIndex;
    syncState({
      ...s,
      phase: 'clue-giving',
      startingTeam: team,
      activeTeam: team,
      activePlayerId: playerOrder[turnIndex % playerOrder.length],
      roundNumber: 1,
      currentCode: drawn.code, currentCodeStr: drawn.codeStr,
      clues: [], cluesSubmitted: false,
      teamGuess: [], opponentGuess: [],
      teamGuessSubmitted: false, opponentGuessSubmitted: false,
      usedBiancaCodes: team === 'bianca' ? [...s.usedBiancaCodes, drawn.codeStr] : s.usedBiancaCodes,
      usedNeraCodes: team === 'nera' ? [...s.usedNeraCodes, drawn.codeStr] : s.usedNeraCodes,
      timerStartedAt: null, // Timer starts when player confirms
    });
  }, [isHost, syncState]);

  // ---- CONFIRM TURN (active player presses start → timer begins) ----
  const handleConfirmTurn = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'clue-giving' || s.timerStartedAt) return;
    syncState({ ...s, timerStartedAt: Date.now() });
  }, [isHost, syncState]);

  // ---- SUBMIT CLUES ----
  const handleSubmitClues = useCallback((clueList: string[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...s,
      clues: clueList, cluesSubmitted: true,
      phase: 'guessing',
      timerStartedAt: null,
    });
  }, [isHost, syncState]);

  // ---- SUBMIT TEAM GUESS ----
  const handleSubmitTeamGuess = useCallback((guess: number[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    const newState = { ...s, teamGuess: guess, teamGuessSubmitted: true };
    if (newState.opponentGuessSubmitted) resolveRound(newState);
    else syncState(newState);
  }, [isHost, syncState]);

  // ---- SUBMIT OPPONENT GUESS ----
  const handleSubmitOpponentGuess = useCallback((guess: number[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    const newState = { ...s, opponentGuess: guess, opponentGuessSubmitted: true };
    if (newState.teamGuessSubmitted) resolveRound(newState);
    else syncState(newState);
  }, [isHost, syncState]);

  // ---- RESOLVE ROUND (skip round-result, go directly to next round or game end) ----
  const resolveRound = useCallback((s: DecryptoState) => {
    const miscommunication = !arraysEqual(s.teamGuess, s.currentCode);
    const interception = arraysEqual(s.opponentGuess, s.currentCode);
    const activePlayerName = s.players.find(p => p.id === s.activePlayerId)?.name || '?';

    const record: RoundRecord = {
      roundNumber: s.roundNumber, activeTeam: s.activeTeam, activePlayerName,
      code: s.currentCode, clues: s.clues,
      teamGuess: s.teamGuess, opponentGuess: s.opponentGuess,
      miscommunication, interception,
    };

    let bm = s.biancaMiscommunications, bi = s.biancaInterceptions;
    let nm = s.neraMiscommunications, ni = s.neraInterceptions;
    if (miscommunication) { if (s.activeTeam === 'bianca') bm++; else nm++; }
    if (interception) { const opp = getOpponent(s.activeTeam); if (opp === 'bianca') bi++; else ni++; }

    let winner: DecryptoTeam | 'draw' | null = null;
    let losingTeam: DecryptoTeam | null = null;
    let loseReason: 'miscommunication' | 'interception' | null = null;

    if (bi >= 2) { winner = 'bianca'; losingTeam = 'nera'; loseReason = 'interception'; }
    else if (ni >= 2) { winner = 'nera'; losingTeam = 'bianca'; loseReason = 'interception'; }
    if (bm >= 2) { losingTeam = 'bianca'; winner = 'nera'; loseReason = 'miscommunication'; }
    else if (nm >= 2) { losingTeam = 'nera'; winner = 'bianca'; loseReason = 'miscommunication'; }

    const updated: DecryptoState = {
      ...s,
      rounds: [...s.rounds, record],
      biancaMiscommunications: bm, biancaInterceptions: bi,
      neraMiscommunications: nm, neraInterceptions: ni,
      winner, losingTeam, loseReason, timerStartedAt: null,
    };

    if (winner || losingTeam) {
      // Game ends → final-guess
      syncState({ ...updated, phase: 'final-guess' });
    } else {
      // Continue → next round immediately (no round-result screen)
      const next = setupNextRound(updated);
      if (!next) return;
      syncState({ ...updated, ...next });
    }
  }, [syncState]);

  // ---- AUTO-SKIP: if 90s timer expires during clue-giving, skip round ----
  useEffect(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'clue-giving' || !s.timerStartedAt) return;

    const elapsed = Date.now() - s.timerStartedAt;
    const remaining = 90000 - elapsed;

    const doSkip = () => {
      const cur = stateRef.current;
      if (cur.phase !== 'clue-giving' || cur.cluesSubmitted) return;
      const next = setupNextRound(cur);
      if (!next) return;
      syncState({ ...cur, ...next });
    };

    if (remaining <= 0) { doSkip(); return; }

    const timeout = setTimeout(doSkip, remaining);
    return () => clearTimeout(timeout);
  }, [isHost, state.phase, state.timerStartedAt, syncState]);

  // ---- SUBMIT FINAL GUESS ----
  const handleFinalGuess = useCallback((words: string[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (!s.losingTeam || !s.winner) return;
    const winnerWords = s.winner === 'bianca' ? s.biancaWords : s.winner === 'nera' ? s.neraWords : [];
    const correct = winnerWords.length === 4 && words.length === 4 &&
      words.every((w, i) => w.trim().toLowerCase() === winnerWords[i].trim().toLowerCase());
    syncState({ ...s, phase: 'game-over', finalGuessWords: words, finalGuessCorrect: correct, winner: correct ? 'draw' : s.winner });
  }, [isHost, syncState]);

  // ---- SKIP FINAL GUESS ----
  const handleSkipFinalGuess = useCallback(() => {
    if (!isHost) return;
    syncState({ ...stateRef.current, phase: 'game-over', finalGuessCorrect: false });
  }, [isHost, syncState]);

  // ---- NEW GAME ----
  const handleNewGame = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({ ...INITIAL_STATE, phase: 'lobby' as DecryptoPhase, roomCode: s.roomCode, players: s.players.map(p => ({ ...p, team: p.team })) });
  }, [isHost, syncState]);

  // ---- BROADCAST LISTENER ----
  useEffect(() => {
    onBroadcast((event: DecryptoBroadcast) => {
      if (isHost) {
        if (event.type === 'action') {
          const { action, payload } = event;
          switch (action) {
            case 'join-team': handleJoinTeam(payload.playerId, payload.team); break;
            case 'start-game': handleStartGame(); break;
            case 'choose-starter': handleChooseStarter(payload.team); break;
            case 'confirm-turn': handleConfirmTurn(); break;
            case 'submit-clues': handleSubmitClues(payload.clues); break;
            case 'submit-team-guess': handleSubmitTeamGuess(payload.guess); break;
            case 'submit-opponent-guess': handleSubmitOpponentGuess(payload.guess); break;
            case 'final-guess': handleFinalGuess(payload.words); break;
            case 'skip-final-guess': handleSkipFinalGuess(); break;
            case 'new-game': handleNewGame(); break;
          }
        } else if (event.type === 'request-sync') {
          if (stateRef.current.phase !== 'create') broadcast({ type: 'sync', payload: stateRef.current });
        }
      } else {
        if (event.type === 'sync') setState(event.payload);
      }
    });
  }, [isHost, onBroadcast, broadcast, handleJoinTeam, handleStartGame, handleChooseStarter,
      handleConfirmTurn, handleSubmitClues, handleSubmitTeamGuess, handleSubmitOpponentGuess,
      handleFinalGuess, handleSkipFinalGuess, handleNewGame]);

  // ---- ACT ----
  const act = useCallback((action: string, payload?: any) => {
    const msg: DecryptoBroadcast = { type: 'action', action, payload };
    if (isHost) {
      switch (action) {
        case 'join-team': handleJoinTeam(payload.playerId, payload.team); break;
        case 'start-game': handleStartGame(); break;
        case 'choose-starter': handleChooseStarter(payload.team); break;
        case 'confirm-turn': handleConfirmTurn(); break;
        case 'submit-clues': handleSubmitClues(payload.clues); break;
        case 'submit-team-guess': handleSubmitTeamGuess(payload.guess); break;
        case 'submit-opponent-guess': handleSubmitOpponentGuess(payload.guess); break;
        case 'final-guess': handleFinalGuess(payload.words); break;
        case 'skip-final-guess': handleSkipFinalGuess(); break;
        case 'new-game': handleNewGame(); break;
      }
    } else {
      broadcast(msg);
    }
  }, [isHost, broadcast, handleJoinTeam, handleStartGame, handleChooseStarter,
      handleConfirmTurn, handleSubmitClues, handleSubmitTeamGuess, handleSubmitOpponentGuess,
      handleFinalGuess, handleSkipFinalGuess, handleNewGame]);

  return { state, act, setState };
}
