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
    description: 'Prima della scommessa il giocatore non può guardare la propria carta: la tiene sulla fronte. La scopre solo dopo aver effettuato la scommessa.',
    cardsPerPlayer: 1,
    image: '/Pili Pili/Missioni/MISSIONE_10.png',
    foreheadCards: true,
  },
  {
    id: 11,
    name: 'Due carte sulla fronte',
    description: 'Prima della scommessa non si possono guardare le carte: vengono tenute sulla fronte. Dopo la scommessa si possono vedere.',
    cardsPerPlayer: 2,
    image: '/Pili Pili/Missioni/MISSIONE_11.png',
    foreheadCards: true,
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

export function getRandomMission(usedIds: number[]): Mission {
  const available = ALL_MISSIONS.filter(m => !usedIds.includes(m.id));
  if (available.length === 0) {
    // All missions used — reset and pick any
    return ALL_MISSIONS[Math.floor(Math.random() * ALL_MISSIONS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Get card image path by value (1-55 = numbered, 56 = jolly)
export function getCardImage(value: number): string {
  if (value === 56) return '/Pili Pili/Carte/jolly.jpg';
  const padded = value.toString().padStart(2, '0');
  return `/Pili Pili/Carte/carta_${padded}.png`;
}

// Get Pili token image
export function getPiliImage(): string {
  return '/Pili Pili/Carte/Pili.jpg';
}
