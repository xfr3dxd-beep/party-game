// The Mind — Type Definitions

export type TheMindMode = 'classic' | 'extreme';

export type TheMindPhase =
  | 'create'        // create or join a room
  | 'lobby'         // waiting for players
  | 'playing'       // active gameplay
  | 'level-complete'// brief celebration
  | 'conflict'      // someone played out of order
  | 'shuriken-vote' // voting on using a throwing star
  | 'shuriken-choose' // extreme: each player picks which card to discard
  | 'game-over';    // win or lose

export type DeckColor = 'white' | 'red';

export interface TheMindCard {
  value: number;
  deck: DeckColor; // 'white' = ascending, 'red' = descending (extreme only)
}

export interface TheMindPlayer {
  id: string;
  name: string;
  hand: TheMindCard[];
  isHost: boolean;
  isConnected: boolean;
}

export interface ConflictInfo {
  playedCard: TheMindCard;
  playerId: string;
  lowerCards: { playerId: string; card: TheMindCard }[];
}

export interface ShurikenVote {
  proposerId: string;
  votes: Record<string, boolean>; // playerId -> accepted
  choices?: Record<string, DeckColor>; // extreme: playerId -> which deck to discard from
}

export interface TheMindState {
  phase: TheMindPhase;
  mode: TheMindMode;
  roomCode: string;
  level: number;
  totalLevels: number;
  lives: number;
  maxLives: number;
  stars: number;
  players: TheMindPlayer[];
  // Piles
  whitePile: number[];    // ascending pile (classic + extreme)
  redPile: number[];      // descending pile (extreme only)
  isBlindLevel: boolean;  // extreme: cards played face-down
  // Conflict
  conflict: ConflictInfo | null;
  // Shuriken
  shurikenVote: ShurikenVote | null;
  // Result
  won: boolean;
}

// ---- Broadcast event types ----

export interface SyncEvent {
  type: 'sync';
  state: TheMindState;
}

export interface PlayEvent {
  type: 'play';
  playerId: string;
  card: TheMindCard;
}

export interface ShurikenProposeEvent {
  type: 'shuriken:propose';
  playerId: string;
}

export interface ShurikenVoteEvent {
  type: 'shuriken:vote';
  playerId: string;
  accept: boolean;
}

export interface ConflictEvent {
  type: 'conflict';
  conflict: ConflictInfo;
  livesRemaining: number;
}

export interface StartGameEvent {
  type: 'start';
  mode: TheMindMode;
}

export interface NextLevelEvent {
  type: 'next-level';
}

export interface ShurikenChooseEvent {
  type: 'shuriken:choose';
  playerId: string;
  deckChoice: DeckColor; // 'white' = discard lowest white, 'red' = discard highest red
}

export type TheMindBroadcast =
  | SyncEvent
  | PlayEvent
  | ShurikenProposeEvent
  | ShurikenVoteEvent
  | ShurikenChooseEvent
  | ConflictEvent
  | StartGameEvent
  | NextLevelEvent;

// ---- Level config ----

export interface LevelConfig {
  cardsPerPlayer: number;
  isBlind: boolean;       // extreme only
  rewardLife: boolean;    // earn a life after this level
  rewardStar: boolean;    // earn a star after this level
}
