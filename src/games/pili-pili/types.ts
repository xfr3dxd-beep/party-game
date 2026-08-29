export type PiliPiliPhase = 'create' | 'lobby' | 'mission' | 'betting' | 'play' | 'round-result' | 'game-over';

export interface Mission {
  id: number;
  name: string;
  description: string;
  cardsPerPlayer: number; // 3-8
  invertWinner?: boolean;
  blindBet?: boolean;
  swapDirection?: 'left' | 'right' | null;
  doubleFirst?: boolean;
  doubleLast?: boolean;
  doublePenalty?: boolean;
  triplePenalty?: boolean;
  noPenalty?: boolean;
  bonusPrecise?: boolean;
  noZeroBet?: boolean;
  openHands?: boolean;
  onlyEven?: boolean;
  onlyOdd?: boolean;
  jokerInPlay?: boolean;
}

export interface PlayedCard {
  playerId: string;
  card: number;
}

export interface PiliPiliPlayer {
  id: string;
  name: string;
  hand: number[];
  pilis: number;
  bet: number | null;
  tricksWon: number;
}

export interface PiliPiliState {
  phase: PiliPiliPhase;
  roomCode: string;
  players: PiliPiliPlayer[];
  currentMission: Mission | null;
  roundNumber: number;
  currentTrick: PlayedCard[];
  trickNumber: number;
  totalTricks: number;
  leadPlayerId: string | null;
  currentTurnId: string | null;
  usedMissionIds: number[];
  dealerId: string | null;
}

export interface PiliPiliBroadcast {
  type: 'sync' | 'action';
  action?: string;
  payload?: any;
}
