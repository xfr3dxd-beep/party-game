// Citadels — All 27 Characters

import { CitadelsCharacter } from './types';

export const ALL_CHARACTERS: CitadelsCharacter[] = [
  // ---- RANK 1 ----
  {
    id: 1, rank: 1, name: 'Assassin', nameIt: 'Assassino',
    image: '/Citadels/Personaggi %2B token/Assassino.png',
    incomeColor: null,
    effectTextIt: 'Nomina un personaggio: questo viene assassinato e salta il turno per questo round.',
  },
  {
    id: 2, rank: 1, name: 'Magistrate', nameIt: 'Magistrato',
    image: '/Citadels/Personaggi %2B token/Magistrato.png',
    incomeColor: null,
    effectTextIt: 'Assegna 3 segnalini minaccia (1 vero, 2 falsi). Se un giocatore col segnalino vero costruisce, il Magistrato ruba il distretto e la banca restituisce i soldi.',
  },
  {
    id: 3, rank: 1, name: 'Witch', nameIt: 'Strega',
    image: '/Citadels/Personaggi %2B token/Strega.png',
    incomeColor: null,
    effectTextIt: 'Nomina un personaggio. Raccoglie le risorse base e il turno termina. Quando il personaggio scelto si rivela, la Strega prende il suo effetto, carte, oro e costruisce nella propria città.',
  },
  // ---- RANK 2 ----
  {
    id: 4, rank: 2, name: 'Thief', nameIt: 'Ladro',
    image: '/Citadels/Personaggi %2B token/Ladro.jpg',
    incomeColor: null,
    effectTextIt: 'Nomina un personaggio (non rango 1 o assassinato). Quando viene chiamato, il Ladro ruba tutto il suo oro.',
  },
  {
    id: 5, rank: 2, name: 'Blackmailer', nameIt: 'Ricattatore',
    image: '/Citadels/Personaggi %2B token/Ricattatore.jpg',
    incomeColor: null,
    effectTextIt: 'Assegna 2 segnalini minaccia a 2 personaggi. Quando chiamati, possono pagare metà oro (arrotondato per difetto) o rischiare. Se è il segnalino vero e non hanno pagato, tutto il loro oro va al Ricattatore.',
  },
  {
    id: 6, rank: 2, name: 'Spy', nameIt: 'Spia',
    image: '/Citadels/Personaggi %2B token/Spia.jpg',
    incomeColor: null,
    effectTextIt: 'Sceglie un giocatore e un colore. Guarda la mano del giocatore: per ogni carta del colore scelto, ottiene 1 oro e 1 carta dal mazzo.',
  },
  // ---- RANK 3 ----
  {
    id: 7, rank: 3, name: 'Wizard', nameIt: 'Mago',
    image: '/Citadels/Personaggi %2B token/Mago.jpg',
    incomeColor: null,
    effectTextIt: 'Scambia l\'intera mano con un altro giocatore, OPPURE scarta carte e ripesca lo stesso numero dal mazzo.',
  },
  {
    id: 8, rank: 3, name: 'Sorcerer', nameIt: 'Stregone',
    image: '/Citadels/Personaggi %2B token/Stregone.jpg',
    incomeColor: null,
    effectTextIt: 'Guarda la mano di un giocatore. Sceglie un distretto e lo costruisce pagando il costo (può duplicare nomi). Non scala il counter costruzioni.',
  },
  {
    id: 9, rank: 3, name: 'Seer', nameIt: 'Veggente',
    image: '/Citadels/Personaggi %2B token/Veggente.jpg',
    incomeColor: null,
    effectTextIt: 'Pesca 1 carta a caso dalla mano di ogni giocatore. Poi restituisce 1 carta a ognuno. Può costruire fino a 2 distretti per turno.',
  },
  // ---- RANK 4 (Nobles - Yellow) ----
  {
    id: 10, rank: 4, name: 'King', nameIt: 'Re',
    image: '/Citadels/Personaggi %2B token/Re.jpg',
    incomeColor: 'yellow',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto giallo costruito. Prende immediatamente la corona.',
  },
  {
    id: 11, rank: 4, name: 'Emperor', nameIt: 'Imperatore',
    image: '/Citadels/Personaggi %2B token/Imperatore.jpg',
    incomeColor: 'yellow',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto giallo. Toglie la corona al possessore e la cede a un altro giocatore, che deve dare 1 oro o 1 carta.',
  },
  {
    id: 12, rank: 4, name: 'Patrician', nameIt: 'Patrizio',
    image: '/Citadels/Personaggi %2B token/Patrizio.png',
    incomeColor: 'yellow',
    effectTextIt: 'Incassa 1 oro o 1 carta extra per ogni distretto giallo. Ogni volta che costruisce, pesca 1 carta. Ottiene la corona.',
  },
  // ---- RANK 5 (Religious - Blue) ----
  {
    id: 13, rank: 5, name: 'Bishop', nameIt: 'Vescovo',
    image: '/Citadels/Personaggi %2B token/Vescovo.jpg',
    incomeColor: 'blue',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto blu. I suoi distretti sono immuni dagli effetti del rango 8.',
  },
  {
    id: 14, rank: 5, name: 'Abbot', nameIt: 'Abate',
    image: '/Citadels/Personaggi %2B token/Abate.jpg',
    incomeColor: 'blue',
    effectTextIt: 'Incassa 1 oro o 1 carta extra per ogni distretto blu. Il giocatore più ricco al tavolo deve dargli 1 oro.',
  },
  {
    id: 15, rank: 5, name: 'Cardinal', nameIt: 'Cardinale',
    image: '/Citadels/Personaggi %2B token/Cardinale.png',
    incomeColor: 'blue',
    effectTextIt: 'Incassa 1 carta extra per ogni distretto blu. Se non ha abbastanza oro per costruire, può prendere l\'oro mancante da un giocatore dandogli carte in cambio.',
  },
  // ---- RANK 6 (Commercial - Green) ----
  {
    id: 16, rank: 6, name: 'Merchant', nameIt: 'Mercante',
    image: '/Citadels/Personaggi %2B token/Mercante.jpg',
    incomeColor: 'green',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto verde. Inoltre incassa 1 oro extra supplementare.',
  },
  {
    id: 17, rank: 6, name: 'Alchemist', nameIt: 'Alchimista',
    image: '/Citadels/Personaggi %2B token/Alchimista.jpg',
    incomeColor: null,
    effectTextIt: 'Alla fine del turno, riprende tutto l\'oro speso per costruire distretti in questo turno.',
  },
  {
    id: 18, rank: 6, name: 'Shopkeeper', nameIt: 'Negoziante',
    image: '/Citadels/Personaggi %2B token/Negoziante.jpg',
    incomeColor: 'green',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto verde. Può costruire distretti verdi in modo illimitato oltre alla costruzione base.',
  },
  // ---- RANK 7 ----
  {
    id: 19, rank: 7, name: 'Architect', nameIt: 'Architetto',
    image: '/Citadels/Personaggi %2B token/Architetto.jpg',
    incomeColor: null,
    effectTextIt: 'Pesca 2 carte extra quando sceglie di pescare. Può costruire fino a 3 distretti per turno.',
  },
  {
    id: 20, rank: 7, name: 'Scholar', nameIt: 'Studioso',
    image: '/Citadels/Personaggi %2B token/Studioso.jpg',
    incomeColor: null,
    effectTextIt: 'Se pesca carte, ne pesca 7 e ne tiene 1. Può costruire fino a 2 distretti per turno.',
  },
  {
    id: 21, rank: 7, name: 'Navigator', nameIt: 'Navigatore',
    image: '/Citadels/Personaggi %2B token/Navigatore.jpg',
    incomeColor: null,
    effectTextIt: 'Ottiene 4 oro extra o 4 carte extra. Se raddoppia le risorse, non può costruire in questo turno.',
  },
  // ---- RANK 8 (Military - Red) ----
  {
    id: 22, rank: 8, name: 'Warlord', nameIt: 'Condottiero',
    image: '/Citadels/Personaggi %2B token/Condottiero.jpg',
    incomeColor: 'red',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto rosso. Può distruggere 1 distretto di un altro giocatore pagandone il costo alla banca (non chi ha 7 distretti).',
  },
  {
    id: 23, rank: 8, name: 'Marshal', nameIt: 'Maresciallo',
    image: '/Citadels/Personaggi %2B token/Maresciallo.jpg',
    incomeColor: 'red',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto rosso. Può rubare 1 distretto di costo ≤3 pagandone il costo al proprietario (non chi ha 7 distretti).',
  },
  {
    id: 24, rank: 8, name: 'Diplomat', nameIt: 'Diplomatico',
    image: '/Citadels/Personaggi %2B token/Diplomatico.jpg',
    incomeColor: 'red',
    effectTextIt: 'Incassa 1 oro extra per ogni distretto rosso. Può scambiare un proprio distretto con uno di un altro giocatore, pagando la differenza se il ricevuto costa di più (non chi ha 7 distretti).',
  },
  // ---- RANK 9 (Optional) ----
  {
    id: 25, rank: 9, name: 'Queen', nameIt: 'Regina',
    image: '/Citadels/Personaggi %2B token/Regina.jpg',
    incomeColor: null,
    effectTextIt: 'Ottiene 3 oro extra se è seduta accanto al giocatore col segnalino corona (se non è stato assassinato).',
  },
  {
    id: 26, rank: 9, name: 'Artist', nameIt: 'Artista',
    image: '/Citadels/Personaggi %2B token/Artista.jpg',
    incomeColor: null,
    effectTextIt: 'Può abbellire fino a 2 distretti mettendo 1 oro su ciascuno. Le monete danno +1 punto a fine partita.',
  },
  {
    id: 27, rank: 9, name: 'Tax Collector', nameIt: 'Tassatore',
    image: '/Citadels/Personaggi %2B token/Tassatore.jpg',
    incomeColor: null,
    effectTextIt: 'Ogni giocatore che costruisce un distretto paga 1 oro extra al Tassatore. Quando viene chiamato, riscuote le monete.',
  },
];

export function getCharacterById(id: number): CitadelsCharacter {
  return ALL_CHARACTERS.find(c => c.id === id)!;
}

export function getCharactersByRank(rank: number): CitadelsCharacter[] {
  return ALL_CHARACTERS.filter(c => c.rank === rank);
}

// Crown image
export const CROWN_IMAGE = '/Citadels/Personaggi %2B token/Token Corona.png';
export const COIN_IMAGE = '/Citadels/Personaggi %2B token/Token Moneta.png';
export const CHAR_BACK = '/Citadels/Dorso carte personaggio.png';
export const DISTRICT_BACK = '/Citadels/Dorso distretti.png';
