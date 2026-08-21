// The Mind — Game State Machine Hook
// Used by the HOST to manage the authoritative game state.
// Non-host players receive state via broadcast sync events.

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  TheMindState, TheMindMode, TheMindPhase, TheMindPlayer,
  TheMindCard, TheMindBroadcast, ConflictInfo, ShurikenVote,
} from '../types';
import {
  getPlayerConfig, getLevelConfig, dealCards,
  validatePlay, checkLevelComplete,
  executeShurikenClassic, executeShurikenExtreme,
  removeCardFromHand,
} from '../gameLogic';

interface UseTheMindGameProps {
  playerId: string;
  isHost: boolean;
  players: { id: string; name: string; isHost: boolean }[];
  broadcast: (event: TheMindBroadcast) => void;
  onBroadcast: (callback: (event: TheMindBroadcast) => void) => void;
}

const INITIAL_STATE: TheMindState = {
  phase: 'create',
  mode: 'classic',
  roomCode: '',
  level: 0,
  totalLevels: 0,
  lives: 0,
  maxLives: 0,
  stars: 0,
  players: [],
  whitePile: [],
  redPile: [],
  isBlindLevel: false,
  conflict: null,
  shurikenVote: null,
  won: false,
};

export function useTheMindGame({
  playerId,
  isHost,
  players,
  broadcast,
  onBroadcast,
}: UseTheMindGameProps) {
  const [state, setState] = useState<TheMindState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Sync state and broadcast to all players
  const syncState = useCallback((newState: TheMindState) => {
    setState(newState);
    broadcast({ type: 'sync', state: newState });
  }, [broadcast]);

  // ---- HOST: Start the game ----
  const startGame = useCallback((mode: TheMindMode, roomCode: string) => {
    if (!isHost) return;
    const playerCount = players.length;
    const config = getPlayerConfig(playerCount);
    const levelConfig = getLevelConfig(1, playerCount, mode);

    const gamePlayers: TheMindPlayer[] = players.map(p => ({
      id: p.id,
      name: p.name,
      hand: [],
      isHost: p.isHost,
      isConnected: true,
    }));

    // Deal cards for level 1
    const dealtPlayers = dealCards(gamePlayers, 1, mode);

    const newState: TheMindState = {
      phase: 'playing',
      mode,
      roomCode,
      level: 1,
      totalLevels: config.totalLevels,
      lives: config.startingLives,
      maxLives: config.startingLives + 1,
      stars: config.startingStars,
      players: dealtPlayers,
      whitePile: [],
      redPile: [],
      isBlindLevel: levelConfig.isBlind,
      conflict: null,
      shurikenVote: null,
      won: false,
    };

    syncState(newState);
  }, [isHost, players, syncState]);

  // ---- HOST: Handle card play ----
  const handlePlay = useCallback((cardPlayerId: string, card: TheMindCard) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'playing') return;

    const result = validatePlay(card, s.whitePile, s.redPile, s.players, cardPlayerId);

    if (!result.valid && result.conflictCards.length > 0) {
      // Conflict! Lose a life
      const newLives = s.lives - 1;

      // Per rules: discard the played card + all cards lower than it from ALL players
      // removeCardFromHand already handles this: removes the card from the player
      // AND strips all lower white (or higher red) cards from everyone
      const updatedPlayers = removeCardFromHand(s.players, cardPlayerId, card);

      // Add the played card to the pile (conflict cards go to discard, not pile)
      const newWhitePile = card.deck === 'white'
        ? [...s.whitePile, card.value]
        : [...s.whitePile];
      const newRedPile = card.deck === 'red'
        ? [...s.redPile, card.value]
        : [...s.redPile];

      const conflict: ConflictInfo = {
        playedCard: card,
        playerId: cardPlayerId,
        lowerCards: result.conflictCards,
      };

      if (newLives <= 0) {
        // Game over
        syncState({
          ...s,
          phase: 'game-over',
          lives: 0,
          players: updatedPlayers,
          whitePile: newWhitePile,
          redPile: newRedPile,
          conflict,
          won: false,
        });
      } else {
        // Show conflict, then resume playing the SAME level
        syncState({
          ...s,
          phase: 'conflict',
          lives: newLives,
          players: updatedPlayers,
          whitePile: newWhitePile,
          redPile: newRedPile,
          conflict,
        });
      }
    } else {
      // Valid play
      let updatedPlayers = removeCardFromHand(s.players, cardPlayerId, card);
      const newWhitePile = card.deck === 'white'
        ? [...s.whitePile, card.value]
        : s.whitePile;
      const newRedPile = card.deck === 'red'
        ? [...s.redPile, card.value]
        : s.redPile;

      // Check level complete
      if (checkLevelComplete(updatedPlayers)) {
        const levelCfg = getLevelConfig(s.level, s.players.length, s.mode);
        let newLives = s.lives;
        let newStars = s.stars;
        if (levelCfg.rewardLife) newLives = Math.min(newLives + 1, s.maxLives);
        if (levelCfg.rewardStar) newStars += 1;

        if (s.level >= s.totalLevels) {
          // Won the game!
          syncState({
            ...s,
            phase: 'game-over',
            players: updatedPlayers,
            whitePile: newWhitePile,
            redPile: newRedPile,
            lives: newLives,
            stars: newStars,
            won: true,
          });
        } else {
          syncState({
            ...s,
            phase: 'level-complete',
            players: updatedPlayers,
            whitePile: newWhitePile,
            redPile: newRedPile,
            lives: newLives,
            stars: newStars,
            conflict: null,
          });
        }
      } else {
        syncState({
          ...s,
          players: updatedPlayers,
          whitePile: newWhitePile,
          redPile: newRedPile,
        });
      }
    }
  }, [isHost, syncState]);

  // ---- HOST: Resume after conflict ----
  const resumeAfterConflict = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    if (checkLevelComplete(s.players)) {
      const levelCfg = getLevelConfig(s.level, s.players.length, s.mode);
      let newLives = s.lives;
      let newStars = s.stars;
      if (levelCfg.rewardLife) newLives = Math.min(newLives + 1, s.maxLives);
      if (levelCfg.rewardStar) newStars += 1;

      if (s.level >= s.totalLevels) {
        syncState({ ...s, phase: 'game-over', lives: newLives, stars: newStars, won: true, conflict: null });
      } else {
        syncState({ ...s, phase: 'level-complete', lives: newLives, stars: newStars, conflict: null });
      }
    } else {
      syncState({ ...s, phase: 'playing', conflict: null });
    }
  }, [isHost, syncState]);

  // ---- HOST: Advance to next level ----
  const nextLevel = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    const newLevel = s.level + 1;
    const levelConfig = getLevelConfig(newLevel, s.players.length, s.mode);

    const gamePlayers: TheMindPlayer[] = s.players.map(p => ({
      ...p,
      hand: [],
    }));

    const dealtPlayers = dealCards(gamePlayers, newLevel, s.mode);

    syncState({
      ...s,
      phase: 'playing',
      level: newLevel,
      players: dealtPlayers,
      whitePile: [],
      redPile: [],
      isBlindLevel: levelConfig.isBlind,
      conflict: null,
      shurikenVote: null,
    });
  }, [isHost, syncState]);

  // ---- HOST: Propose shuriken ----
  const proposeShuriken = useCallback((proposerId: string) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (s.phase !== 'playing' || s.stars <= 0) return;

    const votes: Record<string, boolean> = {};
    // Proposer auto-accepts
    s.players.forEach(p => {
      votes[p.id] = p.id === proposerId;
    });

    syncState({
      ...s,
      phase: 'shuriken-vote',
      shurikenVote: { proposerId, votes },
    });
  }, [isHost, syncState]);

  // ---- HOST: Handle shuriken vote ----
  const handleShurikenVote = useCallback((voterId: string, accept: boolean) => {
    if (!isHost) return;
    const s = stateRef.current;
    if (!s.shurikenVote) return;

    const newVotes = { ...s.shurikenVote.votes, [voterId]: accept };

    // Check if anyone declined
    const declined = Object.values(newVotes).some(v => v === false && newVotes[voterId] !== undefined);
    // Actually check: if this voter declined, cancel
    if (!accept) {
      syncState({
        ...s,
        phase: 'playing',
        shurikenVote: null,
      });
      return;
    }

    // Check if all voted
    const allVoted = s.players.every(p => newVotes[p.id] === true);

    if (allVoted) {
      // Execute shuriken
      const result = s.mode === 'extreme'
        ? executeShurikenExtreme(s.players)
        : executeShurikenClassic(s.players);

      syncState({
        ...s,
        phase: 'playing',
        stars: s.stars - 1,
        players: result.players,
        shurikenVote: null,
      });
    } else {
      // Update votes, keep waiting
      syncState({
        ...s,
        shurikenVote: { ...s.shurikenVote, votes: newVotes },
      });
    }
  }, [isHost, syncState]);

  // ---- HOST: New game ----
  const newGame = useCallback(() => {
    if (!isHost) return;
    const s = stateRef.current;
    syncState({
      ...INITIAL_STATE,
      phase: 'lobby' as TheMindPhase,
      roomCode: s.roomCode,
      players: s.players.map(p => ({ ...p, hand: [] })),
    });
  }, [isHost, syncState]);

  // ---- Listen for broadcast events ----
  useEffect(() => {
    onBroadcast((event: TheMindBroadcast) => {
      if (isHost) {
        // Host handles player actions
        switch (event.type) {
          case 'play':
            handlePlay(event.playerId, event.card);
            break;
          case 'shuriken:propose':
            proposeShuriken(event.playerId);
            break;
          case 'shuriken:vote':
            handleShurikenVote(event.playerId, event.accept);
            break;
          case 'next-level':
            nextLevel();
            break;
        }
      } else {
        // Non-host receives state sync
        if (event.type === 'sync') {
          setState(event.state);
        }
      }
    });
  }, [isHost, handlePlay, proposeShuriken, handleShurikenVote, nextLevel, onBroadcast]);

  // ---- Player actions (sends broadcast, doesn't modify state directly) ----
  const playCard = useCallback((card: TheMindCard) => {
    if (isHost) {
      handlePlay(playerId, card);
    } else {
      broadcast({ type: 'play', playerId, card });
    }
  }, [isHost, playerId, broadcast, handlePlay]);

  const requestShuriken = useCallback(() => {
    if (isHost) {
      proposeShuriken(playerId);
    } else {
      broadcast({ type: 'shuriken:propose', playerId });
    }
  }, [isHost, playerId, broadcast, proposeShuriken]);

  const voteShuriken = useCallback((accept: boolean) => {
    if (isHost) {
      handleShurikenVote(playerId, accept);
    } else {
      broadcast({ type: 'shuriken:vote', playerId, accept });
    }
  }, [isHost, playerId, broadcast, handleShurikenVote]);

  const requestNextLevel = useCallback(() => {
    if (isHost) {
      nextLevel();
    } else {
      broadcast({ type: 'next-level' });
    }
  }, [isHost, broadcast, nextLevel]);

  // Get this player's hand from state
  const myHand = state.players.find(p => p.id === playerId)?.hand ?? [];

  return {
    state,
    myHand,
    startGame,
    playCard,
    requestShuriken,
    voteShuriken,
    resumeAfterConflict,
    requestNextLevel,
    newGame,
    setState, // for non-host direct sync
  };
}
