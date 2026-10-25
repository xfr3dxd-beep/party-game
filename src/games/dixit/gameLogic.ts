// ===== Dixit Game Logic =====

import { DixitPlayer, TableCard, DixitVote, RoundScoreEntry } from './types';
import { ALL_CARD_IDS } from './cards';

/** Fisher-Yates shuffle */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Create a full shuffled deck of all 405 cards */
export function createDeck(): number[] {
  return shuffleArray([...ALL_CARD_IDS]);
}

/** Deal `count` cards from the deck */
export function dealCards(deck: number[], count: number): { dealt: number[]; remaining: number[] } {
  return { dealt: deck.slice(0, count), remaining: deck.slice(count) };
}

/** Hand size depends on player count */
export function getHandSize(playerCount: number): number {
  return playerCount === 3 ? 7 : 6;
}

/** How many cards each non-narrator plays per round */
export function getCardsToPlay(playerCount: number): number {
  return playerCount === 3 ? 2 : 1;
}

/** Total cards on the board per round */
export function getTotalBoardCards(playerCount: number): number {
  if (playerCount === 3) return 1 + 2 * 2; // narrator 1 + 2 others × 2 = 5
  return playerCount; // narrator 1 + (N-1) others × 1 = N
}

/** Shuffle table cards and assign 1-based positions */
export function shuffleTableCards(cards: TableCard[]): TableCard[] {
  const shuffled = shuffleArray(cards);
  return shuffled.map((c, i) => ({ ...c, position: i + 1 }));
}

/** Calculate round scores per the Dixit rules */
export function calculateScores(
  narratorId: string,
  tableCards: TableCard[],
  votes: DixitVote[],
  players: DixitPlayer[],
): RoundScoreEntry[] {
  const narratorCard = tableCards.find(tc => tc.ownerId === narratorId)!;
  const narratorPos = narratorCard.position;

  const correctVoters = votes.filter(v => v.position === narratorPos);
  const incorrectVoters = votes.filter(v => v.position !== narratorPos);
  const totalVoters = votes.length;

  // Accumulate points per player
  const pts: Record<string, { points: number; reasons: string[] }> = {};
  players.forEach(p => { pts[p.id] = { points: 0, reasons: [] }; });

  const allCorrect = correctVoters.length === totalVoters;
  const noneCorrect = correctVoters.length === 0;

  if (allCorrect || noneCorrect) {
    // Narrator 0, others +2
    players.forEach(p => {
      if (p.id !== narratorId) {
        pts[p.id].points += 2;
        pts[p.id].reasons.push(allCorrect ? 'Tutti hanno indovinato (+2)' : 'Nessuno ha indovinato (+2)');
      } else {
        pts[p.id].reasons.push(allCorrect ? 'Tutti hanno indovinato (0 pt)' : 'Nessuno ha indovinato (0 pt)');
      }
    });
  } else {
    // Partial — narrator +3, correct guessers +3
    pts[narratorId].points += 3;
    pts[narratorId].reasons.push('Indizio riuscito (+3)');
    correctVoters.forEach(v => {
      pts[v.voterId].points += 3;
      pts[v.voterId].reasons.push('Carta del narratore indovinata (+3)');
    });
  }

  // Bonus: each wrong vote gives +1 to the card owner (if not narrator)
  incorrectVoters.forEach(v => {
    const votedCard = tableCards.find(tc => tc.position === v.position);
    if (votedCard && votedCard.ownerId !== narratorId) {
      pts[votedCard.ownerId].points += 1;
      const voterName = players.find(p => p.id === v.voterId)?.name || '?';
      pts[votedCard.ownerId].reasons.push(`Voto ricevuto da ${voterName} (+1)`);
    }
  });

  return players.map(p => ({
    playerId: p.id,
    pointsGained: pts[p.id].points,
    reason: pts[p.id].reasons.join('; ') || 'Nessun punto',
  }));
}

/** Check if any player has reached 30 points, return winner IDs */
export function checkWinners(players: DixitPlayer[]): string[] | null {
  const winners = players.filter(p => p.score >= 30);
  return winners.length > 0 ? winners.map(w => w.id) : null;
}
