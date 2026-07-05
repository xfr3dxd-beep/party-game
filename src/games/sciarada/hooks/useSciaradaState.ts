import { useState, useCallback, useRef, useEffect } from 'react';
import { SciaradaState, SciaradaPhase, Team, GameConfig, WordCount } from '../types';
import { generateSentence } from '../sentenceGenerator';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const initialConfig: GameConfig = {
  timerSeconds: 60,
  wordCount: 4,
};

const initialState: SciaradaState = {
  phase: 'lobby',
  teams: [],
  config: initialConfig,
  currentTeamIndex: 0,
  currentSentence: '',
  timeRemaining: 60,
  roundNumber: 1,
  teamsPlayedThisRound: 0,
};

export function useSciaradaState() {
  const [state, setState] = useState<SciaradaState>(initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start the game from lobby
  const startGame = useCallback((teamNames: string[], config: GameConfig) => {
    const teams: Team[] = teamNames.map(name => ({
      id: generateId(),
      name,
      score: 0,
      roundScore: 0,
    }));

    const sentence = generateSentence(config.wordCount);

    setState({
      phase: 'ready',
      teams,
      config,
      currentTeamIndex: 0,
      currentSentence: sentence,
      timeRemaining: config.timerSeconds,
      roundNumber: 1,
      teamsPlayedThisRound: 0,
    });
  }, []);

  // Start the timer for the current team
  const startPlaying = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'playing',
      timeRemaining: prev.config.timerSeconds,
      currentSentence: generateSentence(prev.config.wordCount),
    }));

    // Start countdown
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up!
          stopTimer();
          return {
            ...prev,
            timeRemaining: 0,
            phase: 'time_up',
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);
  }, [stopTimer]);

  // Mark sentence as correct (+1 point, new sentence)
  const markCorrect = useCallback(() => {
    setState(prev => {
      const updatedTeams = [...prev.teams];
      updatedTeams[prev.currentTeamIndex] = {
        ...updatedTeams[prev.currentTeamIndex],
        score: updatedTeams[prev.currentTeamIndex].score + 1,
        roundScore: updatedTeams[prev.currentTeamIndex].roundScore + 1,
      };

      return {
        ...prev,
        teams: updatedTeams,
        currentSentence: generateSentence(prev.config.wordCount),
      };
    });
  }, []);

  // Skip sentence (new sentence, no points)
  const skipSentence = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSentence: generateSentence(prev.config.wordCount),
    }));
  }, []);

  // Move to next team or round summary
  const nextTeam = useCallback(() => {
    stopTimer();

    setState(prev => {
      const teamsPlayed = prev.teamsPlayedThisRound + 1;

      // All teams have played this round
      if (teamsPlayed >= prev.teams.length) {
        return {
          ...prev,
          phase: 'round_summary',
          teamsPlayedThisRound: teamsPlayed,
        };
      }

      // Next team's turn
      const nextIndex = (prev.currentTeamIndex + 1) % prev.teams.length;
      return {
        ...prev,
        phase: 'ready',
        currentTeamIndex: nextIndex,
        teamsPlayedThisRound: teamsPlayed,
        timeRemaining: prev.config.timerSeconds,
        currentSentence: generateSentence(prev.config.wordCount),
      };
    });
  }, [stopTimer]);

  // Start next round (keep teams + cumulative scores)
  const nextRound = useCallback(() => {
    stopTimer();

    setState(prev => {
      const resetTeams = prev.teams.map(t => ({
        ...t,
        roundScore: 0,
      }));

      return {
        ...prev,
        phase: 'ready',
        teams: resetTeams,
        currentTeamIndex: 0,
        teamsPlayedThisRound: 0,
        roundNumber: prev.roundNumber + 1,
        timeRemaining: prev.config.timerSeconds,
        currentSentence: generateSentence(prev.config.wordCount),
      };
    });
  }, [stopTimer]);

  // Reset everything back to lobby
  const newGame = useCallback(() => {
    stopTimer();
    setState(initialState);
  }, [stopTimer]);

  return {
    state,
    startGame,
    startPlaying,
    markCorrect,
    skipSentence,
    nextTeam,
    nextRound,
    newGame,
  };
}
