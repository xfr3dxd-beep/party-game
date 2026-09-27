// Citadels — All 84 District Cards + 6 Presets

import { CitadelsDistrict, DistrictCard } from './types';

// ---- STANDARD DISTRICTS ----

// Blue (Religious) - 11 cards total
const TEMPIO: CitadelsDistrict =     { id: 101, name: 'Temple', nameIt: 'Tempio', color: 'blue', cost: 1, copies: 3, image: '/Citadels/Distretti/Tempio (blu).jpg', isUnique: false };
const CHIESA: CitadelsDistrict =     { id: 102, name: 'Church', nameIt: 'Chiesa', color: 'blue', cost: 2, copies: 3, image: '/Citadels/Distretti/Chiesa (blu).jpg', isUnique: false };
const MONASTERO: CitadelsDistrict =  { id: 103, name: 'Monastery', nameIt: 'Monastero', color: 'blue', cost: 3, copies: 3, image: '/Citadels/Distretti/Monastero (blu).jpg', isUnique: false };
const CATTEDRALE: CitadelsDistrict = { id: 104, name: 'Cathedral', nameIt: 'Cattedrale', color: 'blue', cost: 5, copies: 2, image: '/Citadels/Distretti/Cattedrale (blu).jpg', isUnique: false };

// Yellow (Noble) - 12 cards total
const MANIERO: CitadelsDistrict =    { id: 201, name: 'Manor', nameIt: 'Maniero', color: 'yellow', cost: 3, copies: 5, image: '/Citadels/Distretti/Maniero (giallo).jpg', isUnique: false };
const CASTELLO: CitadelsDistrict =   { id: 202, name: 'Castle', nameIt: 'Castello', color: 'yellow', cost: 4, copies: 4, image: '/Citadels/Distretti/Castello (giallo).jpg', isUnique: false };
const PALAZZO: CitadelsDistrict =    { id: 203, name: 'Palace', nameIt: 'Palazzo', color: 'yellow', cost: 5, copies: 3, image: '/Citadels/Distretti/Palazzo (giallo).jpg', isUnique: false };

// Green (Commercial) - 20 cards total
const TAVERNA: CitadelsDistrict =    { id: 301, name: 'Tavern', nameIt: 'Taverna', color: 'green', cost: 1, copies: 5, image: '/Citadels/Distretti/Taverna (verde).jpg', isUnique: false };
const MERCATO: CitadelsDistrict =    { id: 302, name: 'Market', nameIt: 'Mercato', color: 'green', cost: 2, copies: 4, image: '/Citadels/Distretti/Mercato (verde).jpg', isUnique: false };
const EMPORIO: CitadelsDistrict =    { id: 303, name: 'Trading Post', nameIt: 'Emporio', color: 'green', cost: 2, copies: 3, image: '/Citadels/Distretti/Emporio (verde).jpg', isUnique: false };
const MOLO: CitadelsDistrict =       { id: 304, name: 'Wharf', nameIt: 'Molo', color: 'green', cost: 3, copies: 3, image: '/Citadels/Distretti/Molo (verde).jpg', isUnique: false };
const PORTO: CitadelsDistrict =      { id: 305, name: 'Harbor', nameIt: 'Porto', color: 'green', cost: 4, copies: 3, image: '/Citadels/Distretti/Porto (verde).jpg', isUnique: false };
const MUNICIPIO: CitadelsDistrict =  { id: 306, name: 'Town Hall', nameIt: 'Municipio', color: 'green', cost: 5, copies: 2, image: '/Citadels/Distretti/Municipio (verde).jpg', isUnique: false };

// Red (Military) - 11 cards total
const TORRE_GUARDIA: CitadelsDistrict = { id: 401, name: 'Watchtower', nameIt: 'Torre di Guardia', color: 'red', cost: 1, copies: 3, image: '/Citadels/Distretti/Torre di guardia (rossa).jpg', isUnique: false };
const PRIGIONE: CitadelsDistrict =      { id: 402, name: 'Prison', nameIt: 'Prigione', color: 'red', cost: 2, copies: 3, image: '/Citadels/Distretti/Prigione (rossa).png', isUnique: false };
const CASERMA: CitadelsDistrict =       { id: 403, name: 'Barracks', nameIt: 'Caserma', color: 'red', cost: 3, copies: 3, image: '/Citadels/Distretti/Caserma (rossa).jpg', isUnique: false };
const FORTEZZA: CitadelsDistrict =      { id: 404, name: 'Fortress', nameIt: 'Fortezza', color: 'red', cost: 5, copies: 2, image: '/Citadels/Distretti/Fortezza (rossa).jpg', isUnique: false };

const STANDARD_DISTRICTS: CitadelsDistrict[] = [
  TEMPIO, CHIESA, MONASTERO, CATTEDRALE,
  MANIERO, CASTELLO, PALAZZO,
  TAVERNA, MERCATO, EMPORIO, MOLO, PORTO, MUNICIPIO,
  TORRE_GUARDIA, PRIGIONE, CASERMA, FORTEZZA,
];

// ---- UNIQUE VIOLA DISTRICTS (30 total, 14 used per game) ----

export const ALL_VIOLA: CitadelsDistrict[] = [
  { id: 501, name: 'Armory', nameIt: 'Armeria', color: 'purple', cost: 3, copies: 1, image: '/Citadels/Distretti/Armeria (viola).jpg', isUnique: true, effectTextIt: 'Distruggi l\'Armeria per distruggere 1 quartiere a tua scelta.' },
  { id: 502, name: 'Basilica', nameIt: 'Basilica', color: 'purple', cost: 4, copies: 1, image: '/Citadels/Distretti/Basilica (viola).jpg', isUnique: true, effectTextIt: 'A fine partita segna 1 punto extra per ogni quartiere con costo dispari.' },
  { id: 503, name: 'Library', nameIt: 'Biblioteca', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Biblioteca (viola).jpg', isUnique: true, effectTextIt: 'Se raccogli carte, tieni TUTTE le carte pescate.' },
  { id: 504, name: 'Capitol', nameIt: 'Campidoglio', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Campidoglio (viola).jpg', isUnique: true, effectTextIt: 'A fine partita, se hai 3+ quartieri dello stesso colore, segna 3 punti extra.' },
  { id: 505, name: 'Quarry', nameIt: 'Cava', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Cava (viola).jpg', isUnique: true, effectTextIt: 'Puoi costruire quartieri con lo stesso nome di altri già in città.' },
  { id: 506, name: 'Thieves\' Den', nameIt: 'Covo dei Ladri', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Covo dei ladri (viola).png', isUnique: true, effectTextIt: 'Puoi pagare parte del costo con carte invece di oro (1 carta = 1 oro).' },
  { id: 507, name: 'Factory', nameIt: 'Fabbrica', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Fabbrica (viola).jpg', isUnique: true, effectTextIt: 'Paghi 1 oro in meno per costruire altri quartieri Unici (viola).' },
  { id: 508, name: 'Smithy', nameIt: 'Fucina', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Fucina (viola).jpg', isUnique: true, effectTextIt: 'Una volta per turno paga 2 oro per pescare 3 carte.' },
  { id: 509, name: 'Great Wall', nameIt: 'Grande Muraglia', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Grande muraglia (viola).png', isUnique: true, effectTextIt: 'Il rango 8 deve pagare 1 oro in più per usare la sua abilità sui tuoi quartieri.' },
  { id: 510, name: 'Scaffold', nameIt: 'Impalcatura', color: 'purple', cost: 3, copies: 1, image: '/Citadels/Distretti/Impalcatura (viola).jpg', isUnique: true, effectTextIt: 'Distruggi l\'Impalcatura per costruire 1 quartiere gratuitamente.' },
  { id: 511, name: 'Laboratory', nameIt: 'Laboratorio', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Laboratorio (viola).jpg', isUnique: true, effectTextIt: 'Una volta per turno, scarta 1 carta per prendere 2 oro.' },
  { id: 512, name: 'Keep', nameIt: 'Mastio', color: 'purple', cost: 3, copies: 1, image: '/Citadels/Distretti/Rocca (viola).jpg', isUnique: true, effectTextIt: 'Il rango 8 non può usare la sua abilità sul Mastio.' },
  { id: 513, name: 'Gold Mine', nameIt: 'Miniera d\'Oro', color: 'purple', cost: 6, copies: 1, image: "/Citadels/Distretti/Miniera d'oro (viola).jpg", isUnique: true, effectTextIt: 'Se scegli oro come risorsa, prendi 1 oro extra.' },
  { id: 514, name: 'Monument', nameIt: 'Monumento', color: 'purple', cost: 4, copies: 1, image: '/Citadels/Distretti/Monumento (viola).jpg', isUnique: true, effectTextIt: 'Non puoi costruirlo se hai 5+ quartieri. Conta come 2 quartieri per la città.' },
  { id: 515, name: 'Museum', nameIt: 'Museo', color: 'purple', cost: 4, copies: 1, image: '/Citadels/Distretti/Museo (viola).jpg', isUnique: true, effectTextIt: 'Una volta per turno metti 1 carta sotto il Museo. A fine partita 1 punto per ogni carta sotto.' },
  { id: 516, name: 'Necropolis', nameIt: 'Necropoli', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Necropoli (viola).jpg', isUnique: true, effectTextIt: 'Costruiscila distruggendo 1 quartiere della tua città invece di pagare il costo.' },
  { id: 517, name: 'Poorhouse', nameIt: 'Ospizio', color: 'purple', cost: 4, copies: 1, image: '/Citadels/Distretti/Ospizio (viola).jpg', isUnique: true, effectTextIt: 'Se a fine turno non hai oro, prendi 1 oro.' },
  { id: 518, name: 'Observatory', nameIt: 'Osservatorio', color: 'purple', cost: 4, copies: 1, image: '/Citadels/Distretti/Osservatorio (viola).jpg', isUnique: true, effectTextIt: 'Se peschi carte, pesca 3 invece di 2 (scartane 2, tieni 1).' },
  { id: 519, name: 'Park', nameIt: 'Parco', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Parco (viola).jpg', isUnique: true, effectTextIt: 'Se a fine turno non hai carte in mano, pesca 2 carte.' },
  { id: 520, name: 'Dragon Gate', nameIt: 'Porta dei Draghi', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Porta dei Draghi (viola).jpg', isUnique: true, effectTextIt: 'A fine partita segna 2 punti extra.' },
  { id: 521, name: 'Wishing Well', nameIt: 'Pozzo dei Desideri', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Pozzo dei desideri (viola).jpg', isUnique: true, effectTextIt: 'A fine partita 1 punto extra per ogni quartiere viola costruito (incluso sé stesso).' },
  { id: 522, name: 'Haunted Quarter', nameIt: 'Quartiere Stregato', color: 'purple', cost: 2, copies: 1, image: '/Citadels/Distretti/Quartiere stregato (viola).jpg', isUnique: true, effectTextIt: 'A fine partita conta come 1 tipo di quartiere a tua scelta.' },
  { id: 523, name: 'Map Room', nameIt: 'Sala delle Mappe', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Sala delle mappe (viola).jpg', isUnique: true, effectTextIt: 'A fine partita 1 punto extra per ogni carta in mano.' },
  { id: 524, name: 'School of Magic', nameIt: 'Scuola di Magia', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Scuola di Magia (viola).jpg', isUnique: true, effectTextIt: 'Per le abilità che danno risorse in base al colore, conta come il colore che scegli ad ogni inizio turno.' },
  { id: 525, name: 'Stables', nameIt: 'Scuderie', color: 'purple', cost: 2, copies: 1, image: '/Citadels/Distretti/Scuderie (viola).jpg', isUnique: true, effectTextIt: 'Costruire le Scuderie non conta per il limite di costruzione a turno.' },
  { id: 526, name: 'Statue', nameIt: 'Statua', color: 'purple', cost: 3, copies: 1, image: '/Citadels/Distretti/Statua (viola).jpg', isUnique: true, effectTextIt: 'Se a fine partita hai la corona, 5 punti extra.' },
  { id: 527, name: 'Theater', nameIt: 'Teatro', color: 'purple', cost: 6, copies: 1, image: '/Citadels/Distretti/Teatro (viola).jpg', isUnique: true, effectTextIt: 'Alla fine di ogni fase di scelta, puoi scambiare il tuo personaggio con quello di un avversario.' },
  { id: 528, name: 'Imperial Treasury', nameIt: 'Tesoreria Imperiale', color: 'purple', cost: 5, copies: 1, image: '/Citadels/Distretti/Tesoreria imperiale (viola).jpg', isUnique: true, effectTextIt: 'A fine partita 1 punto extra per ogni oro nella tua riserva.' },
  { id: 529, name: 'Ivory Tower', nameIt: 'Torre d\'Avorio', color: 'purple', cost: 5, copies: 1, image: "/Citadels/Distretti/Torre d'avorio (viola).jpg", isUnique: true, effectTextIt: 'Se a fine partita è l\'unico quartiere viola in città, 5 punti extra.' },
  { id: 530, name: 'Secret Vault', nameIt: 'Volta Segreta', color: 'purple', cost: 0, copies: 1, image: '/Citadels/Distretti/Volta segreta (viola).jpg', isUnique: true, effectTextIt: 'Non può essere costruita. A fine partita rivelala dalla mano per 3 punti extra.' },
];

export const ALL_DISTRICTS: CitadelsDistrict[] = [...STANDARD_DISTRICTS, ...ALL_VIOLA];

export function getDistrictById(id: number): CitadelsDistrict {
  return ALL_DISTRICTS.find(d => d.id === id)!;
}

// ---- PRESETS ----

// Character name -> id map
const C: Record<string, number> = {
  Assassino: 1, Magistrato: 2, Strega: 3,
  Ladro: 4, Ricattatore: 5, Spia: 6,
  Mago: 7, Stregone: 8, Veggente: 9,
  Re: 10, Imperatore: 11, Patrizio: 12,
  Vescovo: 13, Abate: 14, Cardinale: 15,
  Mercante: 16, Alchimista: 17, Negoziante: 18,
  Architetto: 19, Studioso: 20, Navigatore: 21,
  Condottiero: 22, Maresciallo: 23, Diplomatico: 24,
  Regina: 25, Artista: 26, Tassatore: 27,
};

// Viola name -> id map
const V: Record<string, number> = {
  Armeria: 501, Basilica: 502, Biblioteca: 503, Campidoglio: 504,
  Cava: 505, CovoLadri: 506, Fabbrica: 507, Fucina: 508,
  GrandeMuraglia: 509, Impalcatura: 510, Laboratorio: 511, Mastio: 512,
  MinieraOro: 513, Monumento: 514, Museo: 515, Necropoli: 516,
  Ospizio: 517, Osservatorio: 518, Parco: 519, PortaDraghi: 520,
  PozzoDesideri: 521, QuartiereStregato: 522, SalaMappe: 523,
  ScuolaMagia: 524, Scuderie: 525, Statua: 526, Teatro: 527,
  TesoreriaImperiale: 528, TorreAvorio: 529, VoltaSegreta: 530,
};

export interface GamePreset {
  id: string;
  name: string;
  nameIt: string;
  description: string;
  characters: number[];  // 9 character ids (one per rank)
  viola: number[];       // 14 viola district ids
}

export const PRESETS: GamePreset[] = [
  {
    id: 'ambitious', name: 'Ambitious Aristocrats', nameIt: 'Aristocratici Ambiziosi',
    description: 'Focus: costruire più quartieri a turno',
    characters: [C.Magistrato, C.Ladro, C.Stregone, C.Patrizio, C.Vescovo, C.Mercante, C.Architetto, C.Maresciallo, C.Regina],
    viola: [V.Campidoglio, V.Fabbrica, V.Impalcatura, V.GrandeMuraglia, V.QuartiereStregato, V.Mastio, V.Necropoli, V.Parco, V.Ospizio, V.Cava, V.ScuolaMagia, V.Scuderie, V.Statua, V.CovoLadri],
  },
  {
    id: 'cunning', name: 'Cunning Agents', nameIt: 'Agenti Astuti',
    description: 'Focus: bluff e caos',
    characters: [C.Strega, C.Ricattatore, C.Mago, C.Imperatore, C.Abate, C.Alchimista, C.Architetto, C.Condottiero, C.Tassatore],
    viola: [V.Armeria, V.Basilica, V.PortaDraghi, V.MinieraOro, V.Mastio, V.Monumento, V.Museo, V.Necropoli, V.Parco, V.Ospizio, V.Cava, V.VoltaSegreta, V.Fucina, V.Teatro],
  },
  {
    id: 'illustrious', name: 'Illustrious Emissaries', nameIt: 'Emissari Illustri',
    description: 'Focus: difesa e risorse alternative',
    characters: [C.Strega, C.Spia, C.Veggente, C.Imperatore, C.Vescovo, C.Mercante, C.Studioso, C.Diplomatico, C.Artista],
    viola: [V.Fabbrica, V.Impalcatura, V.GrandeMuraglia, V.QuartiereStregato, V.TorreAvorio, V.Mastio, V.Biblioteca, V.Museo, V.Osservatorio, V.Parco, V.Ospizio, V.Cava, V.ScuolaMagia, V.Fucina],
  },
  {
    id: 'devious', name: 'Devious Dignitaries', nameIt: 'Dignitari Subdoli',
    description: 'Focus: bluff e scambi',
    characters: [C.Magistrato, C.Ricattatore, C.Stregone, C.Re, C.Abate, C.Alchimista, C.Navigatore, C.Maresciallo, C.Regina],
    viola: [V.PortaDraghi, V.Fabbrica, V.Impalcatura, V.QuartiereStregato, V.Laboratorio, V.Necropoli, V.Parco, V.Ospizio, V.VoltaSegreta, V.Fucina, V.Scuderie, V.Teatro, V.CovoLadri, V.PozzoDesideri],
  },
  {
    id: 'tenacious', name: 'Tenacious Delegates', nameIt: 'Delegati Tenaci',
    description: 'Focus: combo personaggi e sinergie viola',
    characters: [C.Assassino, C.Spia, C.Veggente, C.Re, C.Cardinale, C.Mercante, C.Studioso, C.Diplomatico, C.Artista],
    viola: [V.Basilica, V.Campidoglio, V.QuartiereStregato, V.TesoreriaImperiale, V.Laboratorio, V.Biblioteca, V.SalaMappe, V.Osservatorio, V.ScuolaMagia, V.VoltaSegreta, V.Fucina, V.Scuderie, V.Statua, V.PozzoDesideri],
  },
  {
    id: 'vicious', name: 'Vicious Nobles', nameIt: 'Nobili Spietati',
    description: 'Focus: guerra totale, molto aggressivo',
    characters: [C.Assassino, C.Ladro, C.Mago, C.Patrizio, C.Cardinale, C.Mercante, C.Navigatore, C.Condottiero, C.Tassatore],
    viola: [V.Armeria, V.Basilica, V.PortaDraghi, V.MinieraOro, V.TesoreriaImperiale, V.TorreAvorio, V.Laboratorio, V.SalaMappe, V.Monumento, V.Museo, V.ScuolaMagia, V.Statua, V.CovoLadri, V.PozzoDesideri],
  },
];

// ---- DECK BUILDER ----

/** Build a shuffled district deck from 54 standard cards + 14 selected viola cards */
export function buildDeck(violaIds: number[]): DistrictCard[] {
  const cards: DistrictCard[] = [];
  let uid = 0;

  // Add standard districts (expanded by copies)
  for (const d of STANDARD_DISTRICTS) {
    for (let i = 0; i < d.copies; i++) {
      cards.push({ uid: `d-${uid++}`, districtId: d.id });
    }
  }

  // Add selected viola cards (1 copy each)
  for (const vid of violaIds) {
    cards.push({ uid: `d-${uid++}`, districtId: vid });
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

/** Pick random characters (1 per rank) */
export function randomCharacters(includeRank9: boolean): number[] {
  const result: number[] = [];
  const maxRank = includeRank9 ? 9 : 8;
  for (let r = 1; r <= maxRank; r++) {
    const options = [r * 3 - 2, r * 3 - 1, r * 3]; // ids for this rank
    // For rank 9: ids 25, 26, 27
    const pick = options[Math.floor(Math.random() * 3)];
    result.push(pick);
  }
  return result;
}

/** Pick 14 random viola from all 30 */
export function randomViola(): number[] {
  const ids = ALL_VIOLA.map(v => v.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 14);
}
