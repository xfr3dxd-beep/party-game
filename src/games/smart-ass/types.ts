export interface SmartAssPlayer {
  id: string;
  name: string;
  tokenIndex: number;        // 0-11, which donkey token
  position: number;          // 0 = on START, 1-16 = board squares, 17 = END
  skipNextNarrator: boolean;  // Dumb Ass effect
}

export type SmartAssPhase =
  | 'create'
  | 'lobby'
  | 'narrator-roll'
  | 'narrator-reads'
  | 'select-answerer'
  | 'answerer-roll'
  | 'hard-ass-card'
  | 'hard-ass-roll'
  | 'game-over';

export type DieColor = 'orange' | 'blue' | 'teal';

export interface SmartAssState {
  phase: SmartAssPhase;
  roomCode: string;
  players: SmartAssPlayer[];

  // Turn management
  narratorIndex: number;
  currentColor: DieColor | null;
  currentCardPath: string | null;
  answeringPlayerId: string | null;
  lastDieValue: number | null;

  // Card tracking (used card indices to avoid repeats)
  usedChiSono: number[];
  usedCosaSono: number[];
  usedDoveSono: number[];
  usedHardAss: number[];

  // Hard Ass handling
  hardAssCardPath: string | null;
  hardAssPlayerId: string | null;

  // Winner
  winnerId: string | null;

  // Active mover (player who needs to roll / move)
  activeMoverId: string | null;
}

export type SmartAssBroadcast =
  | { type: 'sync'; payload: SmartAssState }
  | { type: 'action'; action?: string; payload?: any }
  | { type: 'request-sync' };

// Initial empty state
export const INITIAL_STATE: SmartAssState = {
  phase: 'create',
  roomCode: '',
  players: [],
  narratorIndex: 0,
  currentColor: null,
  currentCardPath: null,
  answeringPlayerId: null,
  lastDieValue: null,
  usedChiSono: [],
  usedCosaSono: [],
  usedDoveSono: [],
  usedHardAss: [],
  hardAssCardPath: null,
  hardAssPlayerId: null,
  winnerId: null,
  activeMoverId: null,
};
