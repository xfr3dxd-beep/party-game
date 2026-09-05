export type PiliPiliPhase = 'create' | 'lobby' | 'mission' | 'betting' | 'swapping' | 'play' | 'swap-after-trick' | 'round-result' | 'game-over';

export interface Mission {
  id: number;
  name: string;
  description: string;
  cardsPerPlayer: number;
  image: string;
  // Card swap effects
  swapDirection?: 'left' | 'right';
  swapCount?: number; // -1 = all cards
  swapTiming?: 'after-bet';
  // Betting restrictions
  noZeroBet?: boolean;
  noOneBet?: boolean;
  noCopyBet?: boolean;
  // Card visibility
  foreheadCards?: boolean; // can't see own cards until after bet
  openHands?: boolean; // all cards visible after betting
  timedView?: number; // seconds to view cards before betting
  blindAfterView?: boolean; // cards hidden after timed view
  // Gameplay modifiers
  invertWinner?: boolean; // lowest card wins
  simultaneousPlay?: boolean; // all play at once
  mustPlayHighLow?: boolean; // must play highest or lowest only
  // Penalty modifiers
  penaltyFirstLast?: boolean; // penalty for first/last trick winner
  penaltyRange?: [number, number]; // penalty if trick won with card in range
  // Bonus
  bonusPrecise?: boolean; // exact bet = remove Pilis
  bonusPreciseAmount?: 'bet-value' | number; // how many Pilis to remove
  // Post-trick effects
  swapAfterTrick?: boolean; // winner swaps a card with someone
  // Pili transfer
  transferPili?: boolean; // choose another player, add their Pilis to yours
  // Draw extra card
  drawAfterBet?: number; // draw N cards after betting
  // Legacy/unused kept for compatibility
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
  swapSelections: Record<string, number[]>; // playerId -> cards they chose to pass
  swapTrickWinnerId: string | null; // for swap-after-trick: who won
  swapTrickTargetId: string | null; // who they chose to swap with
  swapTrickWinnerCard: number | null; // card winner gives
  swapTrickTargetCard: number | null; // card target gives
}

export interface PiliPiliBroadcast {
  type: 'sync' | 'action';
  action?: string;
  payload?: any;
}
