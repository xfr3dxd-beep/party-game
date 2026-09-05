export type PiliPiliPhase = 'create' | 'lobby' | 'mission' | 'betting' | 'swapping' | 'play' | 'trick-result' | 'swap-after-trick' | 'round-result' | 'game-over';

export interface Mission {
  id: number;
  name: string;
  description: string;
  cardsPerPlayer: number;
  image: string;
  swapDirection?: 'left' | 'right';
  swapCount?: number;
  swapTiming?: 'after-bet';
  noZeroBet?: boolean;
  noOneBet?: boolean;
  noCopyBet?: boolean;
  foreheadCards?: boolean;
  openHands?: boolean;
  timedView?: number;
  blindAfterView?: boolean;
  invertWinner?: boolean;
  simultaneousPlay?: boolean;
  mustPlayHighLow?: boolean;
  penaltyFirstLast?: boolean;
  penaltyRange?: [number, number];
  bonusPrecise?: boolean;
  bonusPreciseAmount?: 'bet-value' | number;
  swapAfterTrick?: boolean;
  transferPili?: boolean;
  drawAfterBet?: number;
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
  // Swap tracking
  swapSelections: Record<string, number[]>;
  swapTrickWinnerId: string | null;
  swapTrickTargetId: string | null;
  swapTrickWinnerCard: number | null;
  swapTrickTargetCard: number | null;
  // Trick result
  lastTrickCards: PlayedCard[];
  lastTrickWinnerId: string | null;
  // Timer betting
  timedBetting: boolean;
  timedBetSeconds: number;
  // Extra deck for drawAfterBet
  extraDeck: number[];
}

export interface PiliPiliBroadcast {
  type: 'sync' | 'action';
  action?: string;
  payload?: any;
}
