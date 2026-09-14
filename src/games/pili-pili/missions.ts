import { Mission } from './types';

// All 36 official Pili Pili missions with correct effects and card counts
export const ALL_MISSIONS: Mission[] = [
  // ===== Missioni 1–9 =====
  {
    id: 1,
    name: 'Scambio a sinistra',
    description: 'Dopo aver fatto la propria scommessa, ogni giocatore deve passare una carta della propria mano al giocatore alla propria sinistra.',
    cardsPerPlayer: 3,
    image: '/Pili Pili/Missioni/MISSIONE_01.png',
    swapDirection: 'left',
    swapCount: 1,
    swapTiming: 'after-bet',
  },
  {
    id: 2,
    name: 'Due carte a sinistra',
    description: 'Dopo le scommesse, ciascun giocatore passa 2 carte al giocatore alla propria sinistra.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_02.png',
    swapDirection: 'left',
    swapCount: 2,
    swapTiming: 'after-bet',
  },
  {
    id: 3,
    name: 'Due carte a destra',
    description: 'Dopo le scommesse, ogni giocatore passa 2 carte al giocatore alla propria destra.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_03.png',
    swapDirection: 'right',
    swapCount: 2,
    swapTiming: 'after-bet',
  },
  {
    id: 4,
    name: 'Tre carte a sinistra',
    description: 'Dopo le scommesse, ogni giocatore passa 3 carte alla propria sinistra.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_04.png',
    swapDirection: 'left',
    swapCount: 3,
    swapTiming: 'after-bet',
  },
  {
    id: 5,
    name: 'Tre carte a destra',
    description: 'Dopo le scommesse, ciascun giocatore passa 3 carte alla propria destra.',
    cardsPerPlayer: 7,
    image: '/Pili Pili/Missioni/MISSIONE_05.png',
    swapDirection: 'right',
    swapCount: 3,
    swapTiming: 'after-bet',
  },
  {
    id: 6,
    name: 'Mano completa a destra',
    description: 'Dopo le scommesse, ogni giocatore consegna tutta la propria mano al giocatore alla destra.',
    cardsPerPlayer: 3,
    image: '/Pili Pili/Missioni/MISSIONE_06.png',
    swapDirection: 'right',
    swapCount: -1, // -1 = all cards
    swapTiming: 'after-bet',
  },
  {
    id: 7,
    name: 'Mano completa a sinistra',
    description: 'Dopo le scommesse, ciascun giocatore passa tutte le proprie carte al giocatore alla sinistra.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_07.png',
    swapDirection: 'left',
    swapCount: -1,
    swapTiming: 'after-bet',
  },
  {
    id: 8,
    name: 'Niente scommessa zero',
    description: 'Non è possibile dichiarare 0 prese.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_08.png',
    noZeroBet: true,
  },
  {
    id: 9,
    name: 'Niente scommessa uno',
    description: 'Non è possibile dichiarare 1 presa.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_09.png',
    noOneBet: true,
  },

  // ===== Missioni 10–18 =====
  {
    id: 10,
    name: 'Carta sulla fronte',
    description: 'Ogni giocatore sceglie 1 carta da mostrare a tutti (sulla fronte). Le altre 2 restano coperte. Si scommette dopo aver visto le carte degli altri.',
    cardsPerPlayer: 3,
    image: '/Pili Pili/Missioni/MISSIONE_10.png',
    foreheadCards: true,
    foreheadCount: 1,
  },
  {
    id: 11,
    name: 'Due carte sulla fronte',
    description: 'Ogni giocatore sceglie 2 carte da mostrare a tutti (sulla fronte). Le altre 2 restano coperte. Si scommette dopo aver visto le carte degli altri.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_11.png',
    foreheadCards: true,
    foreheadCount: 2,
  },
  {
    id: 12,
    name: 'Pesca dopo la scommessa',
    description: 'Si parte con 2 carte. Dopo la scommessa, ogni giocatore pesca una carta casuale e la aggiunge alla mano. La scommessa viene valutata sulla mano finale di 3 carte.',
    cardsPerPlayer: 2,
    image: '/Pili Pili/Missioni/MISSIONE_12.png',
    drawAfterBet: 1,
  },
  {
    id: 13,
    name: 'Carte scoperte',
    description: 'Dopo le scommesse, tutti devono tenere le proprie carte scoperte davanti a sé, visibili agli altri.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_13.png',
    openHands: true,
  },
  {
    id: 14,
    name: 'Scommessa riuscita = recupero Pili',
    description: 'Se un giocatore centra esattamente la propria scommessa, può rimuovere un numero di Pili pari al valore della sua scommessa.',
    cardsPerPlayer: 3,
    image: '/Pili Pili/Missioni/MISSIONE_14.png',
    bonusPrecise: true,
    bonusPreciseAmount: 'bet-value',
  },
  {
    id: 15,
    name: 'Gioco simultaneo',
    description: 'A ogni presa, tutti i giocatori scelgono e giocano la carta contemporaneamente.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_15.png',
    simultaneousPlay: true,
  },
  {
    id: 16,
    name: 'Valori invertiti',
    description: "L'ordine dei valori viene completamente ribaltato: 1 è la carta più forte e 55 la più debole.",
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_16.png',
    invertWinner: true,
  },
  {
    id: 17,
    name: 'Solo 3 secondi per guardare',
    description: 'Prima delle scommesse i giocatori hanno appena 3 secondi per osservare le proprie carte.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_17.png',
    timedView: 3,
  },
  {
    id: 18,
    name: 'Evitare prima e ultima presa',
    description: 'Chi conquista la prima e/o l\'ultima presa riceve un Pili di penalità.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_18.png',
    penaltyFirstLast: true,
  },

  // ===== Missioni 19–27 =====
  {
    id: 19,
    name: 'Cinque secondi e poi al buio',
    description: 'I giocatori hanno 5 secondi per guardare le proprie carte; poi le mettono a faccia in giù. Scommesse e prese avvengono senza poterle guardare.',
    cardsPerPlayer: 3,
    image: '/Pili Pili/Missioni/MISSIONE_19.png',
    timedView: 5,
    blindAfterView: true,
  },
  {
    id: 20,
    name: 'Non puoi copiare la scommessa precedente',
    description: 'Ogni giocatore deve dichiarare una scommessa diversa da quella del giocatore precedente.',
    cardsPerPlayer: 4,
    image: '/Pili Pili/Missioni/MISSIONE_20.png',
    noCopyBet: true,
  },
  {
    id: 21,
    name: 'Scegli qualcuno a cui trasferire i Pili',
    description: 'Dopo le scommesse, ogni giocatore sceglie un altro giocatore. Alla fine della manche, ciascuno riceve i propri Pili più quelli del giocatore scelto.',
    cardsPerPlayer: 3,
    image: '/Pili Pili/Missioni/MISSIONE_21.png',
    transferPili: true,
  },
  {
    id: 22,
    name: 'Solo carta più alta o più bassa',
    description: 'Durante ogni presa devi obbligatoriamente giocare la carta più alta oppure la carta più bassa della tua mano.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_22.png',
    mustPlayHighLow: true,
  },
  {
    id: 23,
    name: 'Attenzione ai valori 3–8',
    description: 'Se una presa viene vinta con una carta avente valore da 3 a 8, il vincitore riceve un Pili di penalità.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_23.png',
    penaltyRange: [3, 8],
  },
  {
    id: 24,
    name: 'Attenzione ai valori 33–38',
    description: 'Se una presa viene vinta con una carta compresa tra 33 e 38, il vincitore riceve un Pili.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_24.png',
    penaltyRange: [33, 38],
  },
  {
    id: 25,
    name: 'Attenzione ai valori 47–52',
    description: 'Se una presa viene vinta con una carta compresa tra 47 e 52, il vincitore riceve un Pili di penalità.',
    cardsPerPlayer: 7,
    image: '/Pili Pili/Missioni/MISSIONE_25.png',
    penaltyRange: [47, 52],
  },
  {
    id: 26,
    name: 'Scambio dopo ogni presa',
    description: 'Ogni volta che un giocatore vince una presa, deve scambiare una carta con un giocatore di sua scelta.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_26.png',
    swapAfterTrick: true,
  },
  {
    id: 27,
    name: 'Carte scoperte dopo la scommessa',
    description: 'Una volta concluse tutte le scommesse, ciascun giocatore deve mettere le proprie carte scoperte.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_27.png',
    openHands: true,
  },

  // ===== Missioni 28–36 =====
  {
    id: 28,
    name: 'Scommessa centrata, recuperi Pili',
    description: 'Se il giocatore realizza esattamente la propria scommessa, può eliminare dalla propria penalità un numero di Pili corrispondente alla scommessa effettuata.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_28.png',
    bonusPrecise: true,
    bonusPreciseAmount: 'bet-value',
  },
  {
    id: 29,
    name: 'Tutti insieme',
    description: 'In ogni presa, i giocatori giocano simultaneamente la carta scelta. Vince la carta di valore maggiore.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_29.png',
    simultaneousPlay: true,
  },
  {
    id: 30,
    name: 'Tre secondi per decidere la scommessa',
    description: 'I giocatori possono guardare le proprie carte soltanto per 3 secondi prima della scommessa.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_30.png',
    timedView: 3,
  },
  {
    id: 31,
    name: 'Prima e ultima presa sono pericolose',
    description: 'Chi vince la prima e/o l\'ultima presa riceve un Pili di penalità.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_31.png',
    penaltyFirstLast: true,
  },
  {
    id: 32,
    name: 'Cinque secondi, poi tutto al buio',
    description: 'Si hanno 5 secondi per memorizzare le proprie carte, dopodiché vengono messe coperte. Scommessa e prese avvengono senza poterle guardare.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_32.png',
    timedView: 5,
    blindAfterView: true,
  },
  {
    id: 33,
    name: 'Scommessa sempre diversa',
    description: 'Non puoi dichiarare lo stesso numero di prese dichiarato dal giocatore precedente.',
    cardsPerPlayer: 6,
    image: '/Pili Pili/Missioni/MISSIONE_33.png',
    noCopyBet: true,
  },
  {
    id: 34,
    name: 'Associa un altro giocatore ai tuoi Pili',
    description: 'Dopo le scommesse, ciascuno sceglie un altro giocatore. Al termine, il punteggio Pili viene sommato a quello della persona scelta.',
    cardsPerPlayer: 5,
    image: '/Pili Pili/Missioni/MISSIONE_34.png',
    transferPili: true,
  },
  {
    id: 35,
    name: 'Solo carta più alta o più bassa',
    description: 'In ogni presa devi giocare obbligatoriamente la carta più alta o quella più bassa della tua mano.',
    cardsPerPlayer: 7,
    image: '/Pili Pili/Missioni/MISSIONE_35.png',
    mustPlayHighLow: true,
  },
  {
    id: 36,
    name: 'Scambio con il vincitore della presa',
    description: 'Ogni volta che qualcuno vince una presa, scambia una carta con un giocatore a sua scelta.',
    cardsPerPlayer: 7,
    image: '/Pili Pili/Missioni/MISSIONE_36.png',
    swapAfterTrick: true,
  },
];

// Cryptographically better random number [0, max)
function secureRandom(max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

// Fisher-Yates shuffle (unbiased)
function fisherYates<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomMission(usedIds: number[]): Mission {
  const available = ALL_MISSIONS.filter(m => !usedIds.includes(m.id));
  if (available.length === 0) {
    return ALL_MISSIONS[secureRandom(ALL_MISSIONS.length)];
  }
  return available[secureRandom(available.length)];
}

// Draw 1-3 missions for Spicy Mode (no repeats in same draw)
export function drawSpicyMissions(): Mission[] {
  const count = secureRandom(3) + 1; // 1, 2, or 3
  const shuffled = fisherYates(ALL_MISSIONS);
  return shuffled.slice(0, count);
}

// Merge multiple missions into one combined mission for Spicy Mode
export function mergeMissions(missions: Mission[]): Mission {
  if (missions.length === 1) return missions[0];
  const merged: Mission = {
    id: -1,
    name: missions.map(m => m.name).join(' + '),
    description: missions.map(m => `#${m.id}: ${m.description}`).join('\n'),
    cardsPerPlayer: Math.max(...missions.map(m => m.cardsPerPlayer)),
    image: missions[0].image,
  };
  // Card Reveal: timers (lowest wins), overridden by openHands
  const timedMs = missions.filter(m => m.timedView);
  const hasOpen = missions.some(m => m.openHands);
  if (timedMs.length > 0 && !hasOpen) {
    merged.timedView = Math.min(...timedMs.map(m => m.timedView!));
    merged.blindAfterView = true;
  }
  // Pre-betting: forehead
  const fhMs = missions.filter(m => m.foreheadCards);
  if (fhMs.length > 0) {
    merged.foreheadCards = true;
    merged.foreheadCount = Math.max(...fhMs.map(m => m.foreheadCount || 1));
  }
  // Betting: restrictions
  if (missions.some(m => m.noZeroBet)) merged.noZeroBet = true;
  if (missions.some(m => m.noOneBet)) merged.noOneBet = true;
  if (missions.some(m => m.noCopyBet)) merged.noCopyBet = true;
  // Post-betting: swaps (most cards wins) & transfers
  const swMs = missions.filter(m => m.swapDirection && m.swapTiming === 'after-bet');
  if (swMs.length > 0) {
    const best = swMs.reduce((a, b) => ((b.swapCount === -1 ? 999 : (b.swapCount || 0)) > (a.swapCount === -1 ? 999 : (a.swapCount || 0)) ? b : a));
    merged.swapDirection = best.swapDirection;
    merged.swapCount = best.swapCount;
    merged.swapTiming = 'after-bet';
  }
  if (missions.some(m => m.transferPili)) merged.transferPili = true;
  // Card Actions: draw
  const drMs = missions.filter(m => m.drawAfterBet);
  if (drMs.length > 0) merged.drawAfterBet = Math.max(...drMs.map(m => m.drawAfterBet!));
  // Playing Cards
  if (missions.some(m => m.invertWinner)) merged.invertWinner = true;
  if (missions.some(m => m.simultaneousPlay)) merged.simultaneousPlay = true;
  if (missions.some(m => m.mustPlayHighLow)) merged.mustPlayHighLow = true;
  if (hasOpen) merged.openHands = true;
  // Trick-taking: bonuses & penalties
  if (missions.some(m => m.bonusPrecise)) {
    merged.bonusPrecise = true;
    merged.bonusPreciseAmount = missions.find(m => m.bonusPrecise)?.bonusPreciseAmount;
  }
  if (missions.some(m => m.penaltyFirstLast)) merged.penaltyFirstLast = true;
  const rgMs = missions.filter(m => m.penaltyRange);
  if (rgMs.length > 0) merged.penaltyRange = [Math.min(...rgMs.map(m => m.penaltyRange![0])), Math.max(...rgMs.map(m => m.penaltyRange![1]))];
  if (missions.some(m => m.swapAfterTrick)) merged.swapAfterTrick = true;
  return merged;
}

// Get card image path by value (1-55 = numbered, 56 = jolly)
export function getCardImage(value: number): string {
  if (value === 56) return '/Pili Pili/Carte/jolly.jpg';
  const padded = value.toString().padStart(2, '0');
  return `/Pili Pili/Carte/carta_${padded}.png`;
}

export function getPiliImage(): string { return '/Pili Pili/Carte/Pili.png'; }
export function getCardBack(): string { return '/Pili Pili/Carte/Dorso.jpg'; }
