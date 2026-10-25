// ===== Dixit Card & Asset Paths =====

import { DixitColor } from './types';

// Cards with uppercase "Carta_" prefix
const UPPERCASE_CARDS = new Set<number>();
for (let i = 1; i <= 61; i++) UPPERCASE_CARDS.add(i);
[78, 80, 152, 236].forEach(n => UPPERCASE_CARDS.add(n));

// Missing card numbers (gaps in the file sequence)
const MISSING_CARDS = new Set([191, 196, 296, 313, 409]);

// All valid card IDs (1–410 minus gaps = 405 cards)
export const ALL_CARD_IDS: number[] = [];
for (let i = 1; i <= 410; i++) {
  if (!MISSING_CARDS.has(i)) ALL_CARD_IDS.push(i);
}

/** Get the image path for a given card number */
export function getCardImagePath(cardId: number): string {
  if (cardId === 84) return '/Dixit/Carte/carta_84.png';
  const prefix = UPPERCASE_CARDS.has(cardId) ? 'Carta' : 'carta';
  return `/Dixit/Carte/${prefix}_${cardId}.jpg`;
}

export const CARD_BACK = '/Dixit/Carte/carta_dorso.jpg';

// Board images
export const BOARD_DORSO = '/Dixit/Tabellone da gioco/Tabellone da gioco (dorso).png';
export const BOARD_FACCIA = '/Dixit/Tabellone da gioco/Tabellone da gioco (faccia).png';
export const SCOREBOARD_IMAGE = '/Dixit/Tabellone da gioco/Tabellone punteggio conigli.png';

// Available colors
export const COLORS: DixitColor[] = ['rosso', 'giallo', 'blu', 'bianco', 'rosa', 'verde'];

export const COLOR_LABELS: Record<DixitColor, string> = {
  rosso: 'Rosso',
  giallo: 'Giallo',
  blu: 'Blu',
  bianco: 'Bianco',
  rosa: 'Rosa',
  verde: 'Verde',
};

export const COLOR_HEX: Record<DixitColor, string> = {
  rosso: '#ef4444',
  giallo: '#eab308',
  blu: '#3b82f6',
  bianco: '#e5e5e5',
  rosa: '#ec4899',
  verde: '#22c55e',
};

/** Rabbit token image */
export function getRabbitTokenPath(color: DixitColor): string {
  return `/Dixit/Token/Token coniglio/coniglio_${color}.png`;
}

/** Voting token image (numbered, colored) */
export function getVotingTokenPath(color: DixitColor, num: number): string {
  return `/Dixit/Token/Token votazione/Coniglio ${color}/Token votazione ${color} ${num}.png`;
}

export const VOTING_TOKEN_BACK = '/Dixit/Token/Token votazione/Token votazione Dorso/Token votazione dorso.png';
