import { PlayedCard, Mission, PiliPiliPlayer } from './types';
import { getRandomMission } from './missions';

export const JOKER_VALUE = 56;

export function getNextPlayerId(players: PiliPiliPlayer[], currentId: string): string {
  const currentIndex = players.findIndex(p => p.id === currentId);
  if (currentIndex === -1) return players[0].id;
  return players[(currentIndex + 1) % players.length].id;
}

export function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function drawMission(usedIds: number[]): Mission {
  return getRandomMission(usedIds);
}

export function dealCards(players: PiliPiliPlayer[], cardsPerPlayer: number, includeJoker: boolean): PiliPiliPlayer[] {
  let deck = Array.from({ length: 55 }, (_, i) => i + 1);
  if (includeJoker) {
    deck.push(JOKER_VALUE);
  }
  deck = shuffle(deck);

  return players.map(p => {
    const hand = deck.splice(0, cardsPerPlayer).sort((a, b) => a - b);
    return { ...p, hand, bet: null, tricksWon: 0 };
  });
}

export function resolveTrick(trick: PlayedCard[], invertWinner: boolean = false): string {
  let winner = trick[0];

  for (let i = 1; i < trick.length; i++) {
    const card = trick[i];
    if (card.card === JOKER_VALUE) {
      return card.playerId; // Joker always wins
    }
    if (winner.card === JOKER_VALUE) {
      continue; // Winner is Joker, skip
    }

    if (invertWinner) {
      if (card.card < winner.card) {
        winner = card;
      }
    } else {
      if (card.card > winner.card) {
        winner = card;
      }
    }
  }

  return winner.playerId;
}

export function isBetValid(
  bet: number,
  totalBets: number,
  _isLastToBet: boolean,
  _totalTricks: number,
  mission: Mission | null
): boolean {
  if (mission?.noZeroBet && bet === 0) return false;
  if (mission?.noOneBet && bet === 1) return false;
  return true;
}
