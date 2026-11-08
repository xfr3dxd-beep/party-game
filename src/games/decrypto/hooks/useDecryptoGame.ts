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
    // Only sync during create/lobby — once the game starts, players are locked
    if (s.phase !== 'create' && s.phase !== 'lobby') return;
    if (players.length === 0) return;

    // Merge: keep existing team assignments, add new players
    const merged: DecryptoPlayer[] = players.map(rp => {
      const existing = s.players.find(sp => sp.id === rp.id);
      return existing || { id: rp.id, name: rp.name, team: null };
    });

    // Only sync if something actually changed
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
    // If player not in state yet, add them from room players
    if (!found) {
      const rp = playersRef.current.find(p => p.id === pid);
      if (rp) updated.push({ id: rp.id, name: rp.name, team });
    }
    syncState({ ...s, players: updated });
  }, [isHost, syncState]);

  // ---- START GAME (draw words, go to choose-starter) ----
  const handleStartGame = useCallback(async () => {
    if (!isHost) return;
    const s = stateRef.current;
    const pool = await loadWords();
    const allWords = drawWords(pool, 8);
    const biancaWords = allWords.slice(0, 4);
    const neraWords = allWords.slice(4, 8);

    const biancaPlayers = s.players.filter(p => p.team === 'bianca').map(p => p.id);
    const neraPlayers = s.players.filter(p => p.team === 'nera').map(p => p.id);

    // Shuffle player orders
    const shuffledBianca = [...biancaPlayers].sort(() => Math.random() - 0.5);
    const shuffledNera = [...neraPlayers].sort(() => Math.random() - 0.5);

    syncState({
      ...s,
      phase: 'choose-starter',
      biancaWords,
      neraWords,
      biancaPlayerOrder: shuffledBianca,
      neraPlayerOrder: shuffledNera,
      biancaTurnIndex: 0,
      neraTurnIndex: 0,
    });
  }, [isHost, syncState]);

  // ---- CHOOSE STARTER ----
  const handleChooseStarter = useCallback((team: DecryptoTeam) => {
    if (!isHost) return;
    const s = stateRef.current;
    // Draw code for starting team
    const usedCodes = team === 'bianca' ? s.usedBiancaCodes : s.usedNeraCodes;
    const drawn = drawCode(usedCodes);
    if (!drawn) return;

    const playerOrder = team === 'bianca' ? s.biancaPlayerOrder : s.neraPlayerOrder;
    const turnIndex = team === 'bianca' ? s.biancaTurnIndex : s.neraTurnIndex;
    const activeId = playerOrder[turnIndex % playerOrder.length];

    const newUsedBianca = team === 'bianca' ? [...s.usedBiancaCodes, drawn.codeStr] : s.usedBiancaCodes;
    const newUsedNera = team === 'nera' ? [...s.usedNeraCodes, drawn.codeStr] : s.usedNeraCodes;

    syncState({
      ...s,
      phase: 'clue-giving',
      startingTeam: team,
      activeTeam: team,
      activePlayerId: activeId,
      roundNumber: 1,
      currentCode: drawn.code,
      currentCodeStr: drawn.codeStr,
      clues: [],
      cluesSubmitted: false,
      teamGuess: [],
      opponentGuess: [],
      teamGuessSubmitted: false,
      opponentGuessSubmitted: false,
      usedBiancaCodes: newUsedBianca,
      usedNeraCodes: newUsedNera,
      timerStartedAt: Date.now(),
    });
  }, [isHost, syncState]);

  // ---- SUBMIT CLUES ----
  const handleSubmitClues = useCallback((clueList: string[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...s,
      clues: clueList,
      cluesSubmitted: true,
      phase: 'guessing',
      timerStartedAt: null,
    });
  }, [isHost, syncState]);

  // ---- SUBMIT TEAM GUESS ----
  const handleSubmitTeamGuess = useCallback((guess: number[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    const newState = { ...s, teamGuess: guess, teamGuessSubmitted: true };
    if (newState.opponentGuessSubmitted) {
      resolveRound(newState);
    } else {
      syncState(newState);
    }
  }, [isHost, syncState]);

  // ---- SUBMIT OPPONENT GUESS ----
  const handleSubmitOpponentGuess = useCallback((guess: number[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    const newState = { ...s, opponentGuess: guess, opponentGuessSubmitted: true };
    if (newState.teamGuessSubmitted) {
      resolveRound(newState);
    } else {
      syncState(newState);
    }
  }, [isHost, syncState]);

  // ---- RESOLVE ROUND ----
  const resolveRound = useCallback((s: DecryptoState) => {
    const miscommunication = !arraysEqual(s.teamGuess, s.currentCode);
    const interception = arraysEqual(s.opponentGuess, s.currentCode);

    const activePlayerName = s.players.find(p => p.id === s.activePlayerId)?.name || '?';

    const record: RoundRecord = {
      roundNumber: s.roundNumber,
      activeTeam: s.activeTeam,
      activePlayerName,
      code: s.currentCode,
      clues: s.clues,
      teamGuess: s.teamGuess,
      opponentGuess: s.opponentGuess,
      miscommunication,
      interception,
    };

    let bm = s.biancaMiscommunications;
    let bi = s.biancaInterceptions;
    let nm = s.neraMiscommunications;
    let ni = s.neraInterceptions;

    // Miscommunication goes to active team
    if (miscommunication) {
      if (s.activeTeam === 'bianca') bm++;
      else nm++;
    }
    // Interception goes to opposing team
    if (interception) {
      const opponent = getOpponent(s.activeTeam);
      if (opponent === 'bianca') bi++;
      else ni++;
    }

    // Check for game end
    let winner: DecryptoTeam | 'draw' | null = null;
    let losingTeam: DecryptoTeam | null = null;
    let loseReason: 'miscommunication' | 'interception' | null = null;
    let nextPhase: DecryptoPhase = 'round-result';

    // 2 interceptions = that team wins
    if (bi >= 2) { winner = 'bianca'; losingTeam = 'nera'; loseReason = 'interception'; nextPhase = 'final-guess'; }
    else if (ni >= 2) { winner = 'nera'; losingTeam = 'bianca'; loseReason = 'interception'; nextPhase = 'final-guess'; }
    // 2 miscommunications = that team loses
    if (bm >= 2) { losingTeam = 'bianca'; winner = 'nera'; loseReason = 'miscommunication'; nextPhase = 'final-guess'; }
    else if (nm >= 2) { losingTeam = 'nera'; winner = 'bianca'; loseReason = 'miscommunication'; nextPhase = 'final-guess'; }

    syncState({
      ...s,
      phase: nextPhase,
      rounds: [...s.rounds, record],
      biancaMiscommunications: bm,
      biancaInterceptions: bi,
      neraMiscommunications: nm,
      neraInterceptions: ni,
      winner,
      losingTeam,
      loseReason,
      timerStartedAt: null,
    });
  }, [syncState]);

  // ---- NEXT ROUND ----
  const handleNextRound = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;

    const nextTeam = getOpponent(s.activeTeam);
    const usedCodes = nextTeam === 'bianca' ? s.usedBiancaCodes : s.usedNeraCodes;
    const drawn = drawCode(usedCodes);
    if (!drawn) return;

    // Advance turn index for the next team
    let newBiancaTurn = s.biancaTurnIndex;
    let newNeraTurn = s.neraTurnIndex;
    if (nextTeam === 'bianca') newBiancaTurn++;
    else newNeraTurn++;

    const playerOrder = nextTeam === 'bianca' ? s.biancaPlayerOrder : s.neraPlayerOrder;
    const turnIndex = nextTeam === 'bianca' ? newBiancaTurn : newNeraTurn;
    const activeId = playerOrder[turnIndex % playerOrder.length];

    const newUsedBianca = nextTeam === 'bianca' ? [...s.usedBiancaCodes, drawn.codeStr] : s.usedBiancaCodes;
    const newUsedNera = nextTeam === 'nera' ? [...s.usedNeraCodes, drawn.codeStr] : s.usedNeraCodes;

    syncState({
      ...s,
      phase: 'clue-giving',
      roundNumber: s.roundNumber + 1,
      activeTeam: nextTeam,
      activePlayerId: activeId,
      currentCode: drawn.code,
      currentCodeStr: drawn.codeStr,
      clues: [],
      cluesSubmitted: false,
      teamGuess: [],
      opponentGuess: [],
      teamGuessSubmitted: false,
      opponentGuessSubmitted: false,
      usedBiancaCodes: newUsedBianca,
      usedNeraCodes: newUsedNera,
      biancaTurnIndex: newBiancaTurn,
      neraTurnIndex: newNeraTurn,
      timerStartedAt: Date.now(),
    });
  }, [isHost, syncState]);

  // ---- AUTO-SKIP: if 90s timer expires during clue-giving, skip this round ----
  useEffect(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'clue-giving' || !s.timerStartedAt) return;

    const elapsed = Date.now() - s.timerStartedAt;
    const remaining = 90000 - elapsed;

    if (remaining <= 0) {
      // Already expired — skip immediately
      // Re-use handleNextRound logic inline to avoid stale closure
      const cur = stateRef.current;
      if (cur.phase !== 'clue-giving') return;
      const nextTeam = getOpponent(cur.activeTeam);
      const usedCodes = nextTeam === 'bianca' ? cur.usedBiancaCodes : cur.usedNeraCodes;
      const drawn = drawCode(usedCodes);
      if (!drawn) return;
      let bTurn = cur.biancaTurnIndex;
      let nTurn = cur.neraTurnIndex;
      if (nextTeam === 'bianca') bTurn++; else nTurn++;
      const order = nextTeam === 'bianca' ? cur.biancaPlayerOrder : cur.neraPlayerOrder;
      const idx = nextTeam === 'bianca' ? bTurn : nTurn;
      syncState({
        ...cur,
        phase: 'clue-giving',
        roundNumber: cur.roundNumber + 1,
        activeTeam: nextTeam,
        activePlayerId: order[idx % order.length],
        currentCode: drawn.code, currentCodeStr: drawn.codeStr,
        clues: [], cluesSubmitted: false,
        teamGuess: [], opponentGuess: [],
        teamGuessSubmitted: false, opponentGuessSubmitted: false,
        usedBiancaCodes: nextTeam === 'bianca' ? [...cur.usedBiancaCodes, drawn.codeStr] : cur.usedBiancaCodes,
        usedNeraCodes: nextTeam === 'nera' ? [...cur.usedNeraCodes, drawn.codeStr] : cur.usedNeraCodes,
        biancaTurnIndex: bTurn, neraTurnIndex: nTurn,
        timerStartedAt: Date.now(),
      });
      return;
    }

    const timeout = setTimeout(() => {
      const cur = stateRef.current;
      if (cur.phase !== 'clue-giving' || cur.cluesSubmitted) return;
      const nextTeam = getOpponent(cur.activeTeam);
      const usedCodes = nextTeam === 'bianca' ? cur.usedBiancaCodes : cur.usedNeraCodes;
      const drawn = drawCode(usedCodes);
      if (!drawn) return;
      let bTurn = cur.biancaTurnIndex;
      let nTurn = cur.neraTurnIndex;
      if (nextTeam === 'bianca') bTurn++; else nTurn++;
      const order = nextTeam === 'bianca' ? cur.biancaPlayerOrder : cur.neraPlayerOrder;
      const idx = nextTeam === 'bianca' ? bTurn : nTurn;
      syncState({
        ...cur,
        phase: 'clue-giving',
        roundNumber: cur.roundNumber + 1,
        activeTeam: nextTeam,
        activePlayerId: order[idx % order.length],
        currentCode: drawn.code, currentCodeStr: drawn.codeStr,
        clues: [], cluesSubmitted: false,
        teamGuess: [], opponentGuess: [],
        teamGuessSubmitted: false, opponentGuessSubmitted: false,
        usedBiancaCodes: nextTeam === 'bianca' ? [...cur.usedBiancaCodes, drawn.codeStr] : cur.usedBiancaCodes,
        usedNeraCodes: nextTeam === 'nera' ? [...cur.usedNeraCodes, drawn.codeStr] : cur.usedNeraCodes,
        biancaTurnIndex: bTurn, neraTurnIndex: nTurn,
        timerStartedAt: Date.now(),
      });
    }, remaining);

    return () => clearTimeout(timeout);
  }, [isHost, state.phase, state.timerStartedAt, syncState]);

  // ---- SUBMIT FINAL GUESS ----
  const handleFinalGuess = useCallback((words: string[]) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (!s.losingTeam || !s.winner) return;

    // The losing team guesses the winner team's 4 words
    const winnerWords = s.winner === 'bianca' ? s.biancaWords : s.winner === 'nera' ? s.neraWords : [];
    const correct = winnerWords.length === 4 &&
      words.length === 4 &&
      words.every((w, i) => w.trim().toLowerCase() === winnerWords[i].trim().toLowerCase());

    syncState({
      ...s,
      phase: 'game-over',
      finalGuessWords: words,
      finalGuessCorrect: correct,
      winner: correct ? 'draw' : s.winner,
    });
  }, [isHost, syncState]);

  // ---- SKIP FINAL GUESS ----
  const handleSkipFinalGuess = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({ ...s, phase: 'game-over', finalGuessCorrect: false });
  }, [isHost, syncState]);

  // ---- NEW GAME ----
  const handleNewGame = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...INITIAL_STATE,
      phase: 'lobby' as DecryptoPhase,
      roomCode: s.roomCode,
      players: s.players.map(p => ({ ...p, team: p.team })),
    });
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
            case 'submit-clues': handleSubmitClues(payload.clues); break;
            case 'submit-team-guess': handleSubmitTeamGuess(payload.guess); break;
            case 'submit-opponent-guess': handleSubmitOpponentGuess(payload.guess); break;
            case 'next-round': handleNextRound(); break;
            case 'final-guess': handleFinalGuess(payload.words); break;
            case 'skip-final-guess': handleSkipFinalGuess(); break;
            case 'new-game': handleNewGame(); break;
          }
        } else if (event.type === 'request-sync') {
          if (stateRef.current.phase !== 'create') {
            broadcast({ type: 'sync', payload: stateRef.current });
          }
        }
      } else {
        if (event.type === 'sync') setState(event.payload);
      }
    });
  }, [isHost, onBroadcast, broadcast, handleJoinTeam, handleStartGame, handleChooseStarter,
      handleSubmitClues, handleSubmitTeamGuess, handleSubmitOpponentGuess,
      handleNextRound, handleFinalGuess, handleSkipFinalGuess, handleNewGame]);

  // ---- ACT (local or broadcast) ----
  const act = useCallback((action: string, payload?: any) => {
    const msg: DecryptoBroadcast = { type: 'action', action, payload };
    if (isHost) {
      switch (action) {
        case 'join-team': handleJoinTeam(payload.playerId, payload.team); break;
        case 'start-game': handleStartGame(); break;
        case 'choose-starter': handleChooseStarter(payload.team); break;
        case 'submit-clues': handleSubmitClues(payload.clues); break;
        case 'submit-team-guess': handleSubmitTeamGuess(payload.guess); break;
        case 'submit-opponent-guess': handleSubmitOpponentGuess(payload.guess); break;
        case 'next-round': handleNextRound(); break;
        case 'final-guess': handleFinalGuess(payload.words); break;
        case 'skip-final-guess': handleSkipFinalGuess(); break;
        case 'new-game': handleNewGame(); break;
      }
    } else {
      broadcast(msg);
    }
  }, [isHost, broadcast, handleJoinTeam, handleStartGame, handleChooseStarter,
      handleSubmitClues, handleSubmitTeamGuess, handleSubmitOpponentGuess,
      handleNextRound, handleFinalGuess, handleSkipFinalGuess, handleNewGame]);

  return { state, act, setState };
}
