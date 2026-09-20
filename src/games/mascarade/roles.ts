import { MascaradeRole } from './types';

export const ALL_ROLES: MascaradeRole[] = [
  { id: 1, name: 'Il Re', description: 'Guadagna 2 monete dalla banca.', image: '/Mascarade/Re.jpg', effectType: 'gain' },
  { id: 2, name: "L'Imperatrice", description: 'Guadagna 3 monete dalla banca.', image: '/Mascarade/Imperatrice.jpg', effectType: 'gain' },
  { id: 3, name: "L'Imbroglione", description: 'Prende 2 monete dal giocatore più ricco. In caso di parità, sceglie da chi rubarle.', image: '/Mascarade/Imbroglione.jpg', effectType: 'steal' },
  { id: 4, name: 'Il Giudice', description: 'Prende per sé tutte le monete accumulatesi sul piatto del Tribunale.', image: '/Mascarade/Giudice.jpg', effectType: 'pot' },
  { id: 5, name: 'Il Mecenate', description: 'Prende 3 monete; i due vicini prendono 1 moneta ciascuno.', image: '/Mascarade/Mecenate.jpg', effectType: 'gain' },
  { id: 6, name: 'La Vedova', description: 'Prende monete fino ad avere esattamente 10.', image: '/Mascarade/Vedova.jpg', effectType: 'gain' },
  { id: 7, name: 'Il Contadino', description: 'Prende 1 moneta. Se nella contestazione entrambi i Contadini vengono rivelati, entrambi prendono 2 monete ciascuno.', image: '/Mascarade/Contadino.jpg', effectType: 'gain' },
  { id: 8, name: 'Il Contadino', description: 'Prende 1 moneta. Se nella contestazione entrambi i Contadini vengono rivelati, entrambi prendono 2 monete ciascuno.', image: '/Mascarade/Contadino.jpg', effectType: 'gain' },
  { id: 9, name: 'Il Ladro', description: 'Ruba 1 moneta dal giocatore alla sua destra e 1 dal giocatore alla sua sinistra.', image: '/Mascarade/Ladro.jpg', effectType: 'steal' },
  { id: 10, name: 'La Spia', description: 'Guardi segretamente la tua carta e quella di un altro giocatore, poi puoi decidere se scambiarle.', image: '/Mascarade/Spia.jpg', effectType: 'spy' },
  { id: 11, name: 'Il Guru', description: 'Scegli un giocatore. Deve dichiarare quale personaggio pensa di avere; poi rivela la carta: se sbaglia paga fino a 4 monete al Guru.', image: '/Mascarade/Guru.jpg', effectType: 'guru' },
  { id: 12, name: 'La Sciamana', description: 'Scegli un giocatore e scambia tutte le tue monete con le sue.', image: '/Mascarade/Sciamana.jpg', effectType: 'swap-coins' },
  { id: 13, name: 'Il Folle', description: 'Prende 1 moneta dalla Banca e fa scambiare (o fingere) le carte di due altri giocatori a sua scelta.', image: '/Mascarade/Folle.jpg', effectType: 'folle' },
  { id: 14, name: 'Il Marionettista', description: 'Prende 1 moneta da 2 giocatori scelti, poi li costringe a scambiarsi di posto al tavolo (le carte restano dove sono).', image: '/Mascarade/Marionettista.png', effectType: 'marionettista' },
  { id: 15, name: 'Il Baro', description: 'Se possiede 10 o più monete, vince immediatamente la partita.', image: '/Mascarade/Baro.png', effectType: 'baro' },
  { id: 16, name: 'La Mendicante', description: 'In senso orario da sinistra, ogni giocatore più ricco di lei deve darle 1 moneta, fino a che non è più ricca.', image: '/Mascarade/Mendicante.jpg', effectType: 'mendicante' },
  { id: 17, name: 'La Principessa', description: 'Guadagna 2 monete dalla banca. Poi sceglie un giocatore che mostra la propria carta a tutti, senza poterla guardare lui stesso.', image: '/Mascarade/Principessa.jpg', effectType: 'principessa' },
];

// Table configs: which role IDs are used per player count per variant
export const TABLES: Record<number, Record<'A' | 'B', number[]>> = {
  6: {
    A: [3, 4, 5, 17, 12, 15],
    B: [2, 4, 16, 1, 6, 9],
  },
  7: {
    A: [3, 13, 2, 4, 5, 12, 9],
    B: [3, 4, 16, 17, 1, 15, 6],
  },
  8: {
    A: [3, 10, 4, 17, 1, 12, 15, 9],
    B: [3, 4, 14, 16, 7, 8, 17, 6],
  },
  9: {
    A: [3, 10, 2, 4, 5, 17, 12, 15, 9],
    B: [11, 4, 14, 5, 16, 7, 8, 17, 6],
  },
  10: {
    A: [3, 10, 2, 4, 5, 17, 12, 15, 6, 9],
    B: [3, 11, 4, 5, 16, 7, 8, 17, 12, 6],
  },
  11: {
    A: [3, 13, 2, 4, 14, 5, 7, 8, 17, 12, 9],
    B: [3, 10, 11, 4, 14, 5, 7, 8, 17, 12, 15],
  },
  12: {
    A: [3, 13, 11, 4, 5, 16, 7, 8, 17, 12, 15, 6],
    B: [3, 10, 11, 2, 4, 14, 5, 7, 8, 17, 12, 15],
  },
};

export function getRoleById(id: number): MascaradeRole {
  return ALL_ROLES.find(r => r.id === id) || ALL_ROLES[0];
}

export function getRolesForGame(playerCount: number, variant: 'A' | 'B'): number[] {
  const count = Math.min(Math.max(playerCount, 6), 12);
  return TABLES[count]?.[variant] || TABLES[6].A;
}

export function getCardBack(): string {
  return '/Mascarade/Dorso.png';
}

export function getPotImage(): string {
  return '/Mascarade/Pot.jpg';
}
