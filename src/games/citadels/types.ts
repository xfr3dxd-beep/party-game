// Citadels — Type Definitions

export type CitadelsPhase =
  | 'create'
  | 'lobby'
  | 'draft'
  | 'turn-call'
  | 'turn-action'
  | 'effect-active'
  | 'round-end'
  | 'game-over';

export type DistrictColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

// ---- Character ----

export interface CitadelsCharacter {
  id: number;       // 1-27
  rank: number;     // 1-9
  name: string;     // English
  nameIt: string;   // Italian
  image: string;
  incomeColor: DistrictColor | null; // color for income bonus
  effectTextIt: string;
}

// ---- District ----

export interface CitadelsDistrict {
  id: number;
  name: string;
  nameIt: string;
  color: DistrictColor;
  cost: number;
  copies: number;   // how many in a standard deck (1 for unique viola)
  image: string;
  isUnique: boolean;
  effectTextIt?: string;
}

// ---- Card instances (in deck/hand) ----

export interface DistrictCard {
  uid: string;       // unique instance id
  districtId: number;
}

// ---- Built district ----

export interface BuiltDistrict {
  uid: string;          // instance uid
  districtId: number;
  artisanCoins: number; // coins placed by Artista
  museumCards: number;   // cards tucked under (Museo)
}

// ---- Player ----

export interface CitadelsPlayer {
  id: string;
  name: string;
  seatIndex: number;
  gold: number;
  hand: DistrictCard[];
  builtDistricts: BuiltDistrict[];
  characterId: number | null;  // assigned character this round
  hasCrown: boolean;
  // Turn state
  hasGathered: boolean;        // has taken resources this turn
  buildsUsed: number;          // how many districts built this turn
  maxBuilds: number;           // max builds allowed (default 1)
  hasUsedEffect: boolean;
  goldSpentThisTurn: number;   // for Alchimista
  // Status
  isAlive: boolean;            // false if assassinated
  isBewitched: boolean;        // true if targeted by Strega
  // Magistrato threat tokens: null = no token, 'real' | 'fake'
  magistrateToken: 'real' | 'fake' | null;
  // Ricattatore threat tokens
  blackmailerToken: 'real' | 'fake' | null;
  blackmailerPaid: boolean;    // did they pay to remove it
}

// ---- Draft State ----

export interface DraftState {
  faceDownId: number;             // character id face-down on table
  faceUpIds: number[];            // character ids face-up on table
  remainingIds: number[];         // characters still available to pick
  currentPickerIndex: number;     // index into pick order
  pickOrder: string[];            // player ids in pick order (starting from crown holder, clockwise)
  picks: Record<string, number>; // playerId -> characterId
  phase: 'picking' | 'done';
}

// ---- Effect context for interactive effects ----

export interface EffectContext {
  type: string;
  data: any;
}

// ---- Tassatore tax pool ----

export interface TaxEntry {
  playerId: string;
  amount: number;
}

// ---- Game State ----

export interface CitadelsState {
  phase: CitadelsPhase;
  roomCode: string;
  players: CitadelsPlayer[];

  // Game config
  characterPool: number[];   // 9 character ids chosen for this game
  violaPool: number[];       // 14 viola district ids chosen
  presetName: string;        // preset name or 'custom' / 'random'

  // Deck
  districtDeck: DistrictCard[];
  discardPile: DistrictCard[];

  // Draft
  draftState: DraftState | null;

  // Round state
  roundNumber: number;
  crownHolderId: string;     // player who has the crown
  currentRank: number;       // which rank is being called (1-9)
  activePlayerId: string | null;
  calledRanks: number[];     // ranks already called this round

  // Effect state
  assassinatedRank: number | null;
  robbedRank: number | null;
  bewitchedRank: number | null;
  taxPool: TaxEntry[];       // Tassatore pool
  effectContext: EffectContext | null;

  // Resource gathering
  drawnCards: DistrictCard[] | null; // cards drawn for pick-1 choice

  // Game end
  firstTo7PlayerId: string | null;
  gameEndTriggered: boolean;
  gameEndRound: number;

  // Scores (filled at game-over)
  scores: Record<string, { total: number; breakdown: ScoreBreakdown }> | null;
}

// ---- Scoring ----

export interface ScoreBreakdown {
  districtCosts: number;
  colorDiversity: number;     // 3 if all 5 colors
  firstTo7Bonus: number;      // 4 or 2
  violaBonuses: { name: string; points: number }[];
}

// ---- Broadcast ----

export type CitadelsBroadcast =
  | { type: 'sync'; state: CitadelsState }
  | { type: 'action'; action: string; payload: any };
