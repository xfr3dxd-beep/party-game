// ===== Dixit Types =====

export type DixitColor = 'rosso' | 'giallo' | 'blu' | 'bianco' | 'rosa' | 'verde';

export interface DixitPlayer {
  id: string;
  name: string;
  color: DixitColor | null;
  score: number;
  hand: number[];            // card IDs in hand
  playedCardIds: number[];   // cards played this round (1 normally, 2 in 3-player non-narrator)
  hasPlayed: boolean;
  hasVoted: boolean;
}

export interface TableCard {
  cardId: number;
  ownerId: string;
  position: number;          // 1-based position on board after shuffle
}

export interface DixitVote {
  voterId: string;
  position: number;          // board position voted for (1-based)
}

export interface RoundScoreEntry {
  playerId: string;
  pointsGained: number;
  reason: string;
}

export type DixitPhase =
  | 'create'
  | 'lobby'
  | 'color-select'
  | 'narrator-pick'
  | 'others-pick'
  | 'voting'
  | 'scoring'
  | 'game-over';

export interface DixitState {
  phase: DixitPhase;
  roomCode: string;
  players: DixitPlayer[];
  deck: number[];
  discardPile: number[];
  narratorIndex: number;     // index in players[] of current narrator
  clue: string;
  tableCards: TableCard[];   // shuffled cards on the board
  votes: DixitVote[];
  roundNumber: number;
  roundScores: RoundScoreEntry[] | null;
  winners: string[] | null;  // player IDs who reached 30+
}

export type DixitBroadcast =
  | { type: 'sync'; payload: DixitState }
  | { type: 'action'; action?: string; payload?: any }
  | { type: 'request-sync' };
