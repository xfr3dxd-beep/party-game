// Sciarada Game Types

export type WordCount = 4 | 5 | 6 | 7 | 'random';

export type SciaradaPhase = 
  | 'lobby'           // Team setup + settings
  | 'ready'           // "Ready?" screen before team's turn
  | 'playing'         // Active gameplay with timer
  | 'time_up'         // Time's up transition
  | 'round_summary';  // After all teams played

export interface Team {
  id: string;
  name: string;
  score: number;        // Cumulative score across all rounds
  roundScore: number;   // Score in current round only
}

export interface GameConfig {
  timerSeconds: number;  // 60, 90, or 120
  wordCount: WordCount;
}

export interface SciaradaState {
  phase: SciaradaPhase;
  teams: Team[];
  config: GameConfig;
  currentTeamIndex: number;
  currentSentence: string;
  timeRemaining: number;
  roundNumber: number;
  teamsPlayedThisRound: number; // How many teams have played this round
}
