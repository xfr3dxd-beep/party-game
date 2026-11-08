export type DecryptoTeam = 'bianca' | 'nera';

export type DecryptoPhase =
  | 'create'
  | 'lobby'
  | 'choose-starter'
  | 'clue-giving'
  | 'guessing'
  | 'round-result'
  | 'final-guess'
  | 'game-over';

export interface DecryptoPlayer {
  id: string;
  name: string;
  team: DecryptoTeam | null;
}

export interface RoundRecord {
  roundNumber: number;
  activeTeam: DecryptoTeam;
  activePlayerName: string;
  code: number[];       // e.g. [1, 3, 2]
  clues: string[];      // 3 clues in code order
  teamGuess: number[];  // own team's guess
  opponentGuess: number[];
  miscommunication: boolean;
  interception: boolean;
}

export interface DecryptoState {
  phase: DecryptoPhase;
  roomCode: string;
  players: DecryptoPlayer[];

  // Team words (4 each)
  biancaWords: string[];
  neraWords: string[];

  // Code tracking (used code strings like "1.2.3")
  usedBiancaCodes: string[];
  usedNeraCodes: string[];

  // Current round
  roundNumber: number;
  activeTeam: DecryptoTeam;
  activePlayerId: string;
  currentCode: number[];
  currentCodeStr: string;
  clues: string[];
  cluesSubmitted: boolean;

  // Guessing
  teamGuess: number[];
  opponentGuess: number[];
  teamGuessSubmitted: boolean;
  opponentGuessSubmitted: boolean;

  // Tokens
  biancaMiscommunications: number;
  biancaInterceptions: number;
  neraMiscommunications: number;
  neraInterceptions: number;

  // History
  rounds: RoundRecord[];

  // Player order
  startingTeam: DecryptoTeam;
  biancaPlayerOrder: string[];
  neraPlayerOrder: string[];
  biancaTurnIndex: number;
  neraTurnIndex: number;

  // Timer
  timerStartedAt: number | null; // timestamp ms

  // Game over
  winner: DecryptoTeam | 'draw' | null;
  losingTeam: DecryptoTeam | null;
  loseReason: 'miscommunication' | 'interception' | null;

  // Final guess
  finalGuessWords: string[];
  finalGuessCorrect: boolean | null;
}

export type DecryptoBroadcast =
  | { type: 'sync'; payload: DecryptoState }
  | { type: 'action'; action?: string; payload?: any }
  | { type: 'request-sync' };
