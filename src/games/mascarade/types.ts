// ===== Mascarade Types =====

export interface MascaradeRole {
  id: number;
  name: string;
  description: string;
  image: string;
  effectType: string;
}

export interface MascaradePlayer {
  id: string;
  name: string;
  roleId: number;       // the card they currently hold
  coins: number;
  seatIndex: number;    // position around the table (for clockwise)
  hasViewedCard: boolean;
  hasIntroduced: boolean;
}

export interface PlayedChallenge {
  playerId: string;
  challenged: boolean; // true = contesta, false = passa
}

export type MascaradePhase =
  | 'create' | 'lobby'
  | 'view-card'         // everyone looks at their card once
  | 'introductions'     // each player announces name+role+effect
  | 'play'              // main game - active player chooses action
  | 'swap-target'       // picking who to swap with
  | 'swap-choice'       // secret: swap or fake
  | 'look-card'         // looking at own card
  | 'declare-role'      // picking a role to declare
  | 'challenge-vote'    // others vote contesta/passa
  | 'reveal-cards'      // revealing cards after challenge
  | 'effect-resolution' // resolving role effect (may need UI)
  | 'effect-spy'        // Spia: view 2 cards, choose swap
  | 'effect-guru'       // Guru: target guesses role
  | 'effect-folle'      // Folle: pick 2 players to swap
  | 'effect-marionettista' // pick 2 players to swap seats
  | 'effect-imbroglione'  // choose richest if tie
  | 'effect-principessa'  // choose target to reveal
  | 'effect-sciamana'     // choose target for coin swap
  | 'effect-mendicante'   // resolving mendicante clockwise
  | 'game-over';

export interface MascaradeState {
  phase: MascaradePhase;
  roomCode: string;
  players: MascaradePlayer[];
  variant: 'A' | 'B';
  rolesInGame: number[];     // role IDs in this game
  pot: number;               // coins from challenges
  turnIndex: number;         // index in players[] whose turn it is
  turnCount: number;         // how many turns have passed (1-4 = forced swap)
  currentAction: string | null;

  // Swap
  swapTargetId: string | null;
  swapDidSwap: boolean | null; // true=swapped, false=faked, null=not decided

  // Declaration
  declaredRoleId: number | null;
  challenges: PlayedChallenge[];
  revealedCards: Record<string, number>; // playerId -> roleId revealed

  // Effect resolution
  effectTargetId: string | null;
  effectSecondTargetId: string | null;
  effectData: any; // generic data for complex effects

  // Intro
  introIndex: number; // which player is introducing

  // Win
  winnerId: string | null;
}

export interface MascaradeBroadcast {
  type: string;
  action?: string;
  payload?: any;
}
