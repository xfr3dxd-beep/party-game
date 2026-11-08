export type WavelengthPhase = 'create' | 'lobby' | 'active-player' | 'guessing' | 'scoring' | 'game-over';

export interface WordPair {
  category: string;
  extreme1: string;
  extreme2: string;
}

export interface PlayerGuess {
  playerId: string;
  angle: number;
  score: number;
}

export interface WavelengthPlayer {
  id: string;
  name: string;
  totalScore: number;
}

export interface WavelengthState {
  phase: WavelengthPhase;
  roomCode: string;
  players: WavelengthPlayer[];
  // Round data
  roundNumber: number;
  activePlayerId: string | null;
  // Word pair
  currentPair: WordPair | null;
  customPair: boolean;
  // Arc / target
  targetAngle: number | null; // 0-180, only active player sees this
  clue: string;
  // Guesses
  guesses: PlayerGuess[];
  // Active player score
  activePlayerScore: number;
  // Pool tracking
  usedPairIndices: number[];
  lastUsedCategory: string | null;
  // Win condition
  winScore: number;
  // Skip tracking
  skipsRemaining: number;
  // Winner
  winnerId: string | null;
}

export type WavelengthBroadcast =
  | { type: 'sync'; payload: WavelengthState }
  | { type: 'action'; action?: string; payload?: any }
  | { type: 'request-sync' };
