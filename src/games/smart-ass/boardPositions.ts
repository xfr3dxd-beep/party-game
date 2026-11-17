// Board positions as percentage coordinates on the board image.
// Square 0 = START position, Squares 1-16 = track, Square 17 = END (donkey's butt target).

export const BOARD_POSITIONS: { x: number; y: number }[] = [
  { x: 50, y: 91 },   // 0: START
  { x: 50, y: 91 },   // 1: START (same visual as 0)
  { x: 36, y: 86 },   // 2
  { x: 23, y: 74 },   // 3
  { x: 13, y: 59 },   // 4: HARD ASS
  { x: 12, y: 43 },   // 5
  { x: 18, y: 29 },   // 6
  { x: 25, y: 15 },   // 7: KICK ASS → goes to 4
  { x: 36, y: 7 },    // 8
  { x: 47, y: 4 },    // 9: DUMB ASS
  { x: 59, y: 7 },    // 10
  { x: 70, y: 14 },   // 11: HARD ASS
  { x: 79, y: 27 },   // 12
  { x: 84, y: 42 },   // 13: DUMB ASS
  { x: 85, y: 56 },   // 14
  { x: 80, y: 69 },   // 15: KICK ASS → goes to 12
  { x: 72, y: 80 },   // 16
  { x: 56, y: 36 },   // 17: END (donkey's butt target)
];

// Special square types
export type SquareType = 'normal' | 'start' | 'hard-ass' | 'kick-ass' | 'dumb-ass' | 'end';

export const SQUARE_TYPES: SquareType[] = [
  'start',      // 0
  'start',      // 1: START
  'normal',     // 2
  'normal',     // 3
  'hard-ass',   // 4: HARD ASS
  'normal',     // 5
  'normal',     // 6
  'kick-ass',   // 7: KICK ASS → goes to 4
  'normal',     // 8
  'dumb-ass',   // 9: DUMB ASS
  'normal',     // 10
  'hard-ass',   // 11: HARD ASS
  'normal',     // 12
  'dumb-ass',   // 13: DUMB ASS
  'normal',     // 14
  'kick-ass',   // 15: KICK ASS → goes to 12
  'normal',     // 16
  'end',        // 17: END
];

// Kick Ass targets
export const KICK_ASS_TARGETS: Record<number, number> = {
  7: 4,    // Kick Ass at 7 → Hard Ass at 4
  15: 12,  // Kick Ass at 15 → square 12
};

// Board image path
export const BOARD_IMAGE = '/Smart Ass/Tavolo_da_gioco_Smart_Ass.jpg';

// Token images and colour labels
export const TOKEN_IMAGES: string[] = [
  '/Smart Ass/pedine_smart_ass/pedina_01_rosso.png',
  '/Smart Ass/pedine_smart_ass/pedina_02_arancione.png',
  '/Smart Ass/pedine_smart_ass/pedina_03_giallo.png',
  '/Smart Ass/pedine_smart_ass/pedina_04_verde.png',
  '/Smart Ass/pedine_smart_ass/pedina_05_turchese.png',
  '/Smart Ass/pedine_smart_ass/pedina_06_azzurro.png',
  '/Smart Ass/pedine_smart_ass/pedina_07_blu.png',
  '/Smart Ass/pedine_smart_ass/pedina_08_viola.png',
  '/Smart Ass/pedine_smart_ass/pedina_09_magenta.png',
  '/Smart Ass/pedine_smart_ass/pedina_10_rosa.png',
  '/Smart Ass/pedine_smart_ass/pedina_11_marrone.png',
  '/Smart Ass/pedine_smart_ass/pedina_12_grigio.png',
];

export const TOKEN_COLORS: string[] = [
  'Rosso', 'Arancione', 'Giallo', 'Verde', 'Turchese', 'Azzurro',
  'Blu', 'Viola', 'Magenta', 'Rosa', 'Marrone', 'Grigio',
];

export const TOKEN_CSS_COLORS: string[] = [
  '#dc2626', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#38bdf8',
  '#3b82f6', '#8b5cf6', '#d946ef', '#f472b6', '#92400e', '#6b7280',
];

// Card back (dorso) images
export const DORSO_PATHS: Record<string, string> = {
  chi_sono: '/Smart Ass/Carte_Smart_Ass/Dorso_chi_sono/dorso Chi sono_ Smart Ass.png',
  cosa_sono: '/Smart Ass/Carte_Smart_Ass/Dorso_cosa_sono/dorso Cosa sono_ Smart Ass.png',
  dove_sono: '/Smart Ass/Carte_Smart_Ass/Dorso_dove_sono/dorso Dove sono_ Smart Assi.png',
  hard_ass: '/Smart Ass/Carte_Smart_Ass/Dorso_hard_ass/dorso Hard Ass_ Smart Assi.png',
};

// Category die colour → card category
export const COLOR_TO_CATEGORY: Record<string, 'chi_sono' | 'cosa_sono' | 'dove_sono'> = {
  orange: 'chi_sono',
  blue: 'cosa_sono',
  teal: 'dove_sono',
};

export const CATEGORY_LABELS: Record<string, string> = {
  chi_sono: 'Chi Sono?',
  cosa_sono: 'Cosa Sono?',
  dove_sono: 'Dove Sono?',
  hard_ass: 'Hard Ass',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  chi_sono: '🟠',
  cosa_sono: '🔵',
  dove_sono: '🟢',
  hard_ass: '🟣',
};

export const CATEGORY_CSS: Record<string, string> = {
  chi_sono: '#f76302',
  cosa_sono: '#0156c6',
  dove_sono: '#01a9a9',
  hard_ass: '#9333ea',
};

export const END_POSITION = 17;
export const START_POSITION = 1;
export const MAX_TRACK = 16;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;

/** Offset tokens that share the same square so they don't overlap. */
export function getTokenOffset(index: number, total: number): { dx: number; dy: number } {
  if (total <= 1) return { dx: 0, dy: 0 };
  const angle = (2 * Math.PI * index) / total;
  const radius = total <= 4 ? 2 : 2.8;
  return { dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) * 0.6 };
}
