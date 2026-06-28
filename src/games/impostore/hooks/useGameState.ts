import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { GameState, GamePhase, Player, Role, RoleConfig, WordSet, RoundInfo } from '../types';
import { buildGameResult } from '../scoring';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const initialState: GameState = {
  phase: 'lobby',
  players: [],
  wordSet: null,
  currentPickIndex: 0,
  turnOrder: [],
  rounds: [],
  currentRound: 0,
  votedPlayerId: null,
  gameResult: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const setPhase = useCallback((phase: GamePhase) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  // Fetch a random word set from Supabase
  const fetchRandomWordSet = useCallback(async (): Promise<WordSet | null> => {
    // Get the count of word sets
    const { count } = await supabase
      .from('word_sets')
      .select('*', { count: 'exact', head: true });

    if (!count || count === 0) return null;

    // Pick a random offset
    const randomOffset = Math.floor(Math.random() * count);

    const { data } = await supabase
      .from('word_sets')
      .select('*')
      .range(randomOffset, randomOffset)
      .single();

    return data;
  }, []);

  // Start the game: assign roles and fetch word set
  const startGame = useCallback(async (playerNames: string[], roleConfig: RoleConfig) => {
    const wordSet = await fetchRandomWordSet();
    if (!wordSet) {
      alert('Errore: nessun set di parole trovato nel database!');
      return;
    }

    // Create role array based on config
    const roles: Role[] = [
      ...Array(roleConfig.civile).fill('civile'),
      ...Array(roleConfig.undercover).fill('undercover'),
      ...Array(roleConfig.mr_white).fill('mr_white'),
    ];

    // Shuffle roles
    const shuffledRoles = shuffleArray(roles);

    // Create players with assigned roles
    const players: Player[] = playerNames.map((name, index) => ({
      id: generateId(),
      name,
      role: shuffledRoles[index],
      isEliminated: false,
      cardIndex: null,
      score: 0,
    }));

    // Shuffle card positions (indices 0..n-1)
    const cardPositions = shuffleArray(Array.from({ length: players.length }, (_, i) => i));

    setState({
      ...initialState,
      phase: 'card_picking',
      players,
      wordSet,
      currentPickIndex: 0,
    });
  }, [fetchRandomWordSet]);

  // Player picks a card
  const pickCard = useCallback((playerIndex: number, cardIndex: number) => {
    setState(prev => {
      const updatedPlayers = [...prev.players];
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        cardIndex,
      };

      const allPicked = updatedPlayers.every(p => p.cardIndex !== null);

      return {
        ...prev,
        players: updatedPlayers,
        currentPickIndex: prev.currentPickIndex + 1,
        phase: allPicked ? 'review' : 'card_picking',
      };
    });
  }, []);

  // Move to turn order phase
  const showTurnOrder = useCallback(() => {
    setState(prev => {
      const activePlayers = prev.players.filter(p => !p.isEliminated);
      const turnOrder = shuffleArray(activePlayers.map(p => p.id));

      return {
        ...prev,
        phase: 'turn_order',
        turnOrder,
      };
    });
  }, []);

  // Move to discussion
  const startDiscussion = useCallback(() => {
    setPhase('discussion');
  }, [setPhase]);

  // Move to voting
  const startVoting = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'voting', votedPlayerId: null }));
  }, []);

  // Eliminate a player via voting
  const eliminatePlayer = useCallback((playerId: string) => {
    setState(prev => {
      const player = prev.players.find(p => p.id === playerId);
      if (!player) return prev;

      const updatedPlayers = prev.players.map(p =>
        p.id === playerId ? { ...p, isEliminated: true } : p
      );

      const newRound: RoundInfo = {
        roundNumber: prev.currentRound + 1,
        eliminatedPlayerId: playerId,
        eliminatedRole: player.role,
        mrWhiteGuess: null,
        mrWhiteGuessCorrect: null,
      };

      const updatedRounds = [...prev.rounds, newRound];

      // If Mr. White is eliminated, go to guess phase
      if (player.role === 'mr_white') {
        return {
          ...prev,
          players: updatedPlayers,
          rounds: updatedRounds,
          currentRound: prev.currentRound + 1,
          phase: 'mr_white_guess',
          votedPlayerId: playerId,
        };
      }

      // Check if all non-civile players are eliminated (game over)
      const remainingMrWhite = updatedPlayers.filter(
        p => p.role === 'mr_white' && !p.isEliminated
      );

      if (remainingMrWhite.length === 0) {
        // All Mr. White eliminated (shouldn't happen without guess phase, but safety check)
        const gameResult = buildGameResult(updatedPlayers, updatedRounds, false, prev.wordSet!);
        return {
          ...prev,
          players: updatedPlayers,
          rounds: updatedRounds,
          currentRound: prev.currentRound + 1,
          phase: 'game_over',
          gameResult,
        };
      }

      // Continue to next discussion round - regenerate turn order
      const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
      const newTurnOrder = shuffleArray(activePlayers.map(p => p.id));

      // Check if only Mr. White and one other player remain (game over - civile loses some points but game ends)
      if (activePlayers.length <= 2) {
        // Mr. White survived to the end — Mr. White wins by default
        const gameResult = buildGameResult(updatedPlayers, updatedRounds, true, prev.wordSet!);
        return {
          ...prev,
          players: updatedPlayers,
          rounds: updatedRounds,
          currentRound: prev.currentRound + 1,
          phase: 'game_over',
          gameResult,
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        rounds: updatedRounds,
        currentRound: prev.currentRound + 1,
        turnOrder: newTurnOrder,
        phase: 'round_result',
        votedPlayerId: playerId,
      };
    });
  }, []);

  // Mr. White submits guess
  const submitMrWhiteGuess = useCallback((guess: string) => {
    setState(prev => {
      const isCorrect = guess.trim().toLowerCase() === prev.wordSet?.civile_word.toLowerCase();

      // Update the last round with the guess
      const updatedRounds = [...prev.rounds];
      const lastRound = updatedRounds[updatedRounds.length - 1];
      updatedRounds[updatedRounds.length - 1] = {
        ...lastRound,
        mrWhiteGuess: guess,
        mrWhiteGuessCorrect: isCorrect,
      };

      const gameResult = buildGameResult(prev.players, updatedRounds, isCorrect, prev.wordSet!);

      return {
        ...prev,
        rounds: updatedRounds,
        phase: 'game_over',
        gameResult,
      };
    });
  }, []);

  // Show round result (non-mr-white elimination)
  const continueAfterResult = useCallback(() => {
    setState(prev => {
      const activePlayers = prev.players.filter(p => !p.isEliminated);
      const newTurnOrder = shuffleArray(activePlayers.map(p => p.id));

      return {
        ...prev,
        phase: 'discussion',
        turnOrder: newTurnOrder,
        votedPlayerId: null,
      };
    });
  }, []);

  // Apply points and reset for new game
  const newGame = useCallback(() => {
    setState(prev => {
      // Apply points from game result to players
      const updatedPlayers = prev.players.map(p => {
        const awarded = prev.gameResult?.pointsAwarded.find(a => a.playerId === p.id);
        return {
          ...p,
          score: p.score + (awarded?.points ?? 0),
          isEliminated: false,
          cardIndex: null,
        };
      });

      return {
        ...initialState,
        phase: 'lobby',
        players: [], // Clear for new lobby setup but we keep leaderboard separately
      };
    });
  }, []);

  // Get cumulative scores across games (for leaderboard)
  const getLeaderboard = useCallback(() => {
    return [...state.players]
      .map(p => {
        const awarded = state.gameResult?.pointsAwarded.find(a => a.playerId === p.id);
        return {
          ...p,
          score: p.score + (awarded?.points ?? 0),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [state.players, state.gameResult]);

  // Get the word a player should see based on their role
  const getPlayerWord = useCallback((player: Player): { word: string; hint?: string } => {
    if (!state.wordSet) return { word: '' };

    switch (player.role) {
      case 'civile':
        return { word: state.wordSet.civile_word };
      case 'undercover':
        return { word: state.wordSet.undercover_word };
      case 'mr_white':
        return { word: 'Sei Mr. White!', hint: state.wordSet.mr_white_hint };
    }
  }, [state.wordSet]);

  return {
    state,
    startGame,
    pickCard,
    showTurnOrder,
    startDiscussion,
    startVoting,
    eliminatePlayer,
    submitMrWhiteGuess,
    continueAfterResult,
    newGame,
    getLeaderboard,
    getPlayerWord,
    setPhase,
  };
}
