import { useState, useCallback, useRef, useEffect } from 'react';
import type { SmartAssState, SmartAssPhase, SmartAssPlayer, SmartAssBroadcast, DieColor } from '../types';
import { INITIAL_STATE } from '../types';
import { CHI_SONO_CARDS, COSA_SONO_CARDS, DOVE_SONO_CARDS, HARD_ASS_CARDS, getCardPath, drawCard } from '../cards';
import { SQUARE_TYPES, KICK_ASS_TARGETS, END_POSITION, START_POSITION, COLOR_TO_CATEGORY } from '../boardPositions';
import { debouncedSaveState } from '../../../lib/roomPersistence';

interface UseSmartAssGameProps {
  playerId: string;
  isHost: boolean;
  roomCode: string | null;
  players: { id: string; name: string; isHost: boolean }[];
  broadcast: (event: SmartAssBroadcast) => void;
  onBroadcast: (callback: (event: SmartAssBroadcast) => void) => void;
}

function getCardsForCategory(cat: string) {
  switch (cat) {
    case 'chi_sono': return CHI_SONO_CARDS;
    case 'cosa_sono': return COSA_SONO_CARDS;
    case 'dove_sono': return DOVE_SONO_CARDS;
    case 'hard_ass': return HARD_ASS_CARDS;
    default: return CHI_SONO_CARDS;
  }
}

function getUsedForCategory(s: SmartAssState, cat: string): number[] {
  switch (cat) {
    case 'chi_sono': return s.usedChiSono;
    case 'cosa_sono': return s.usedCosaSono;
    case 'dove_sono': return s.usedDoveSono;
    case 'hard_ass': return s.usedHardAss;
    default: return [];
  }
}

function withUsedCard(s: SmartAssState, cat: string, idx: number): Partial<SmartAssState> {
  switch (cat) {
    case 'chi_sono': return { usedChiSono: [...s.usedChiSono, idx] };
    case 'cosa_sono': return { usedCosaSono: [...s.usedCosaSono, idx] };
    case 'dove_sono': return { usedDoveSono: [...s.usedDoveSono, idx] };
    case 'hard_ass': return { usedHardAss: [...s.usedHardAss, idx] };
    default: return {};
  }
}

/** Advance narrator, skipping players with the dumbAss flag (and clearing it). */
function advanceNarrator(players: SmartAssPlayer[], currentIndex: number): {
  newIndex: number;
  updatedPlayers: SmartAssPlayer[];
} {
  const updated = players.map(p => ({ ...p }));
  const n = updated.length;
  let idx = (currentIndex + 1) % n;

  for (let attempts = 0; attempts < n; attempts++) {
    if (updated[idx].skipNextNarrator) {
      updated[idx].skipNextNarrator = false;
      idx = (idx + 1) % n;
    } else {
      break;
    }
  }
  return { newIndex: idx, updatedPlayers: updated };
}

export function useSmartAssGame({
  playerId, isHost, roomCode, players, broadcast, onBroadcast,
}: UseSmartAssGameProps) {
  const [state, setState] = useState<SmartAssState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;
  const playersRef = useRef(players);
  playersRef.current = players;

  const syncState = useCallback((newState: SmartAssState) => {
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

  // Sync room players into state (lobby phase)
  useEffect(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'create' && s.phase !== 'lobby') return;
    if (players.length === 0) return;
    const humans: SmartAssPlayer[] = players.map(rp => {
      const existing = s.players.find(sp => sp.id === rp.id);
      return existing || { id: rp.id, name: rp.name, tokenIndex: -1, position: START_POSITION, skipNextNarrator: false };
    });
    const bots = s.players.filter(p => p.id.startsWith('bot-'));
    const merged = [...humans, ...bots];
    const changed = merged.length !== s.players.length ||
      merged.some((p, i) => p.id !== s.players[i]?.id || p.name !== s.players[i]?.name);
    if (changed) {
      const newState = { ...s, players: merged };
      stateRef.current = newState;
      setState(newState);
      broadcast({ type: 'sync', payload: newState });
    }
  }, [isHost, players, broadcast]);

  // ---- DEV ONLY: add bots to fill the lobby ----
  // First click fills to minimum (2), subsequent clicks add 1 bot at a time.
  const devAddBots = useCallback(() => {
    if (!import.meta.env.DEV || !isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'create' && s.phase !== 'lobby') return;
    const existing = s.players.length;
    if (existing >= 12) return; // MAX_PLAYERS
    const usedTokens = new Set(s.players.filter(p => p.tokenIndex >= 0).map(p => p.tokenIndex));
    let botCount = s.players.filter(p => p.id.startsWith('bot-')).length;
    // How many to add: fill to minimum (2) first, then 1 at a time
    const target = existing < 2 ? 2 : existing + 1;
    const added: SmartAssPlayer[] = [];
    for (let i = existing; i < target && i < 12; i++) {
      botCount++;
      let tokenIdx = 0;
      while (usedTokens.has(tokenIdx)) tokenIdx++;
      usedTokens.add(tokenIdx);
      added.push({
        id: `bot-${Date.now()}-${botCount}`,
        name: `Bot ${botCount}`,
        tokenIndex: tokenIdx,
        position: START_POSITION,
        skipNextNarrator: false,
      });
    }
    if (added.length === 0) return;
    syncState({ ...s, players: [...s.players, ...added] });
  }, [isHost, syncState]);

  // ---- PICK TOKEN ----
  const handlePickToken = useCallback((pid: string, tokenIndex: number) => {
    if (!isHost) return;
    const s = stateRef.current;
    const taken = s.players.some(p => p.id !== pid && p.tokenIndex === tokenIndex);
    if (taken) return;
    const updated = s.players.map(p =>
      p.id === pid ? { ...p, tokenIndex } : p
    );
    // Also add from room players if not in state yet
    if (!updated.some(p => p.id === pid)) {
      const rp = playersRef.current.find(p => p.id === pid);
      if (rp) updated.push({ id: rp.id, name: rp.name, tokenIndex, position: START_POSITION, skipNextNarrator: false });
    }
    syncState({ ...s, players: updated });
  }, [isHost, syncState]);

  // ---- START GAME ----
  const handleStartGame = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    // Pick a random starting narrator
    const narratorIndex = Math.floor(Math.random() * s.players.length);
    // All players start at START (position 1)
    const players = s.players.map(p => ({ ...p, position: START_POSITION }));
    syncState({
      ...s,
      phase: 'narrator-roll',
      players,
      narratorIndex,
      currentColor: null,
      currentCardPath: null,
      answeringPlayerId: null,
      lastDieValue: null,
      hardAssCardPath: null,
      hardAssPlayerId: null,
      hardAssReaderId: null,
      winnerId: null,
      activeMoverId: null,
      lastEvent: null,
      isTiebreaker: false,
    });
  }, [isHost, syncState]);

  // ---- CATEGORY ROLLED ----
  const handleCategoryRolled = useCallback((color: DieColor) => {
    if (!isHost) return;
    const s = stateRef.current;
    const category = COLOR_TO_CATEGORY[color];
    const cards = getCardsForCategory(category);
    const used = getUsedForCategory(s, category);
    const drawn = drawCard(cards, used);
    if (!drawn) return; // no cards left (very unlikely)

    const cardPath = getCardPath(category, drawn.filename);
    syncState({
      ...s,
      phase: 'narrator-reads',
      currentColor: color,
      currentCardPath: cardPath,
      ...withUsedCard(s, category, drawn.index),
    });
  }, [isHost, syncState]);

  // ---- CARD ACKNOWLEDGED (narrator finished reading) ----
  const handleCardAcknowledged = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({ ...s, phase: 'select-answerer' });
  }, [isHost, syncState]);

  // ---- SELECT ANSWERER ----
  const handleSelectAnswerer = useCallback((answererId: string) => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...s,
      phase: 'answerer-roll',
      answeringPlayerId: answererId,
      activeMoverId: answererId,
      lastDieValue: null,
      isTiebreaker: false,
    });
  }, [isHost, syncState]);

  // ---- TIEBREAKER: draw Hard Ass card for narrator ----
  const handleTiebreaker = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    const cards = HARD_ASS_CARDS;
    const used = s.usedHardAss;
    const drawn = drawCard(cards, used);
    if (!drawn) return;
    const cardPath = getCardPath('hard_ass', drawn.filename);
    syncState({
      ...s,
      phase: 'tiebreaker-card',
      currentCardPath: cardPath,
      isTiebreaker: true,
      usedHardAss: [...used, drawn.index],
    });
  }, [isHost, syncState]);

  // ---- TIEBREAKER ACKNOWLEDGED (narrator read the tiebreaker card) ----
  const handleTiebreakerAcknowledged = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({ ...s, phase: 'select-answerer' });
  }, [isHost, syncState]);

  // ---- PROCESS MOVE: handles movement + special squares ----
  const processMove = useCallback((s: SmartAssState, moverId: string, dieValue: number): SmartAssState => {
    const playerIdx = s.players.findIndex(p => p.id === moverId);
    if (playerIdx < 0) return s;
    const player = s.players[playerIdx];
    let newPos = Math.min(player.position + dieValue, END_POSITION);
    const updated = s.players.map((p, i) =>
      i === playerIdx ? { ...p, position: newPos } : p
    );

    // Check for END
    if (newPos >= END_POSITION) {
      return { ...s, players: updated, phase: 'game-over', winnerId: moverId, lastDieValue: dieValue, lastEvent: null };
    }

    // Check special square
    const squareType = SQUARE_TYPES[newPos];

    if (squareType === 'kick-ass') {
      const target = KICK_ASS_TARGETS[newPos] || newPos;
      const kicked = updated.map((p, i) =>
        i === playerIdx ? { ...p, position: target } : p
      );
      newPos = target;
      // Check the target square
      const targetType = SQUARE_TYPES[target];
      if (targetType === 'hard-ass') {
        // Draw Hard Ass card
        const hardCards = HARD_ASS_CARDS;
        const usedHard = s.usedHardAss;
        const drawn = drawCard(hardCards, usedHard);
        if (drawn) {
          // The reader is the next player after the one who landed on Hard Ass
          const moverIdx = kicked.findIndex(p => p.id === moverId);
          const readerId = kicked[(moverIdx + 1) % kicked.length].id;
          return {
            ...s,
            players: kicked,
            phase: 'hard-ass-card',
            hardAssPlayerId: moverId,
            hardAssReaderId: readerId,
            hardAssCardPath: getCardPath('hard_ass', drawn.filename),
            lastDieValue: dieValue,
            usedHardAss: [...usedHard, drawn.index],
            lastEvent: `⚡ Kick Ass! ${player.name} torna alla casella ${target} → Hard Ass!`,
          };
        }
      }
      // If target is normal or no hard ass card available, next turn
      const { newIndex, updatedPlayers } = advanceNarrator(kicked, s.narratorIndex);
      return {
        ...s,
        players: updatedPlayers,
        phase: 'narrator-roll',
        narratorIndex: newIndex,
        currentColor: null,
        currentCardPath: null,
        answeringPlayerId: null,
        lastDieValue: dieValue,
        hardAssCardPath: null,
        hardAssPlayerId: null,
        hardAssReaderId: null,
        activeMoverId: null,
        lastEvent: `⚡ Kick Ass! ${player.name} torna alla casella ${target}!`,
      };
    }

    if (squareType === 'hard-ass') {
      const hardCards = HARD_ASS_CARDS;
      const usedHard = s.usedHardAss;
      const drawn = drawCard(hardCards, usedHard);
      if (drawn) {
        // The reader is the next player after the one who landed on Hard Ass
        const moverIdx = updated.findIndex(p => p.id === moverId);
        const readerId = updated[(moverIdx + 1) % updated.length].id;
        return {
          ...s,
          players: updated,
          phase: 'hard-ass-card',
          hardAssPlayerId: moverId,
          hardAssReaderId: readerId,
          hardAssCardPath: getCardPath('hard_ass', drawn.filename),
          lastDieValue: dieValue,
          usedHardAss: [...usedHard, drawn.index],
          lastEvent: `🟣 ${player.name} è finito su Hard Ass!`,
        };
      }
    }

    if (squareType === 'dumb-ass') {
      const dumbed = updated.map((p, i) =>
        i === playerIdx ? { ...p, skipNextNarrator: true } : p
      );
      const { newIndex, updatedPlayers } = advanceNarrator(dumbed, s.narratorIndex);
      return {
        ...s,
        players: updatedPlayers,
        phase: 'narrator-roll',
        narratorIndex: newIndex,
        currentColor: null,
        currentCardPath: null,
        answeringPlayerId: null,
        lastDieValue: dieValue,
        hardAssCardPath: null,
        hardAssPlayerId: null,
        hardAssReaderId: null,
        activeMoverId: null,
        lastEvent: `💤 Dumb Ass! ${player.name} salterà il prossimo turno da narratore!`,
      };
    }

    // Normal square → next turn
    const { newIndex, updatedPlayers } = advanceNarrator(updated, s.narratorIndex);
    return {
      ...s,
      players: updatedPlayers,
      phase: 'narrator-roll',
      narratorIndex: newIndex,
      currentColor: null,
      currentCardPath: null,
      answeringPlayerId: null,
      lastDieValue: dieValue,
      hardAssCardPath: null,
      hardAssPlayerId: null,
      hardAssReaderId: null,
      activeMoverId: null,
      lastEvent: null,
    };
  }, []);

  // ---- NUMBER ROLLED (answerer die) ----
  const handleNumberRolled = useCallback((value: number) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (!s.activeMoverId) return;
    const newState = processMove(s, s.activeMoverId, value);
    syncState(newState);
  }, [isHost, syncState, processMove]);

  // ---- HARD ASS CORRECT ----
  const handleHardAssCorrect = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...s,
      phase: 'hard-ass-roll',
      activeMoverId: s.hardAssPlayerId,
    });
  }, [isHost, syncState]);

  // ---- HARD ASS INCORRECT ----
  const handleHardAssIncorrect = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    const { newIndex, updatedPlayers } = advanceNarrator(s.players, s.narratorIndex);
    syncState({
      ...s,
      players: updatedPlayers,
      phase: 'narrator-roll',
      narratorIndex: newIndex,
      currentColor: null,
      currentCardPath: null,
      answeringPlayerId: null,
      hardAssCardPath: null,
      hardAssPlayerId: null,
      hardAssReaderId: null,
      activeMoverId: null,
    });
  }, [isHost, syncState]);

  // ---- HARD ASS NUMBER ROLLED ----
  const handleHardAssNumberRolled = useCallback((value: number) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (!s.hardAssPlayerId) return;
    const newState = processMove(s, s.hardAssPlayerId, value);
    syncState(newState);
  }, [isHost, syncState, processMove]);

  // ---- DISMISS EVENT ----
  const handleDismissEvent = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({ ...s, lastEvent: null });
  }, [isHost, syncState]);

  // ---- NEW GAME ----
  const handleNewGame = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...INITIAL_STATE,
      phase: 'lobby' as SmartAssPhase,
      roomCode: s.roomCode,
      players: s.players.map(p => ({ ...p, position: START_POSITION, skipNextNarrator: false })),
    });
  }, [isHost, syncState]);

  // ---- BROADCAST LISTENER ----
  useEffect(() => {
    onBroadcast((event: SmartAssBroadcast) => {
      if (isHost) {
        if (event.type === 'action') {
          const { action, payload } = event;
          switch (action) {
            case 'pick-token': handlePickToken(payload.playerId, payload.tokenIndex); break;
            case 'start-game': handleStartGame(); break;
            case 'category-rolled': handleCategoryRolled(payload.color); break;
            case 'card-acknowledged': handleCardAcknowledged(); break;
            case 'select-answerer': handleSelectAnswerer(payload.answererId); break;
            case 'number-rolled': handleNumberRolled(payload.value); break;
            case 'hard-ass-correct': handleHardAssCorrect(); break;
            case 'hard-ass-incorrect': handleHardAssIncorrect(); break;
            case 'hard-ass-number-rolled': handleHardAssNumberRolled(payload.value); break;
            case 'tiebreaker': handleTiebreaker(); break;
            case 'tiebreaker-acknowledged': handleTiebreakerAcknowledged(); break;
            case 'dismiss-event': handleDismissEvent(); break;
            case 'new-game': handleNewGame(); break;
          }
        } else if (event.type === 'request-sync') {
          if (stateRef.current.phase !== 'create') broadcast({ type: 'sync', payload: stateRef.current });
        }
      } else {
        if (event.type === 'sync') setState(event.payload);
      }
    });
  }, [isHost, onBroadcast, broadcast, handlePickToken, handleStartGame,
      handleCategoryRolled, handleCardAcknowledged, handleSelectAnswerer,
      handleNumberRolled, handleHardAssCorrect, handleHardAssIncorrect,
      handleHardAssNumberRolled, handleTiebreaker, handleTiebreakerAcknowledged,
      handleDismissEvent, handleNewGame]);

  // ---- ACT (called by components) ----
  const act = useCallback((action: string, payload?: any) => {
    const msg: SmartAssBroadcast = { type: 'action', action, payload };
    if (isHost) {
      switch (action) {
        case 'pick-token': handlePickToken(payload.playerId, payload.tokenIndex); break;
        case 'start-game': handleStartGame(); break;
        case 'category-rolled': handleCategoryRolled(payload.color); break;
        case 'card-acknowledged': handleCardAcknowledged(); break;
        case 'select-answerer': handleSelectAnswerer(payload.answererId); break;
        case 'number-rolled': handleNumberRolled(payload.value); break;
        case 'hard-ass-correct': handleHardAssCorrect(); break;
        case 'hard-ass-incorrect': handleHardAssIncorrect(); break;
        case 'hard-ass-number-rolled': handleHardAssNumberRolled(payload.value); break;
        case 'tiebreaker': handleTiebreaker(); break;
        case 'tiebreaker-acknowledged': handleTiebreakerAcknowledged(); break;
        case 'dismiss-event': handleDismissEvent(); break;
        case 'new-game': handleNewGame(); break;
      }
    } else {
      broadcast(msg);
    }
  }, [isHost, broadcast, handlePickToken, handleStartGame,
      handleCategoryRolled, handleCardAcknowledged, handleSelectAnswerer,
      handleNumberRolled, handleHardAssCorrect, handleHardAssIncorrect,
      handleHardAssNumberRolled, handleTiebreaker, handleTiebreakerAcknowledged,
      handleDismissEvent, handleNewGame]);

  return { state, act, setState, devAddBots };
}
