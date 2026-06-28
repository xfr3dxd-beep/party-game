export type Role = 'civile' | 'undercover' | 'mr_white';

export type GamePhase =
  | 'lobby'
  | 'card_picking'
  | 'review'
  | 'turn_order'
  | 'discussion'
  | 'voting'
  | 'mr_white_guess'
  | 'round_result'
  | 'game_over';

export interface WordSet {
  id: number;
  civile_word: string;
  undercover_word: string;
  mr_white_hint: string;
  category: string | null;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  isEliminated: boolean;
  cardIndex: number | null;
  score: number;
}

export interface RoundInfo {
  roundNumber: number;
  eliminatedPlayerId: string | null;
  eliminatedRole: Role | null;
  mrWhiteGuess: string | null;
  mrWhiteGuessCorrect: boolean | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  wordSet: WordSet | null;
  currentPickIndex: number;
  turnOrder: string[]; // player IDs in random order
  rounds: RoundInfo[];
  currentRound: number;
  votedPlayerId: string | null;
  gameResult: GameResult | null;
}

export interface GameResult {
  winner: 'civile' | 'mr_white';
  pointsAwarded: { playerId: string; playerName: string; role: Role; points: number }[];
  revealedWord: string;
  revealedUndercoverWord: string;
}

export interface RoleConfig {
  civile: number;
  undercover: number;
  mr_white: number;
}
