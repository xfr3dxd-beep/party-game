import { Player, Role, RoundInfo, GameResult, WordSet } from './types';

/**
 * Calculate points for all players at the end of a game.
 *
 * Scoring rules:
 * - If Mr. White is eliminated and guesses WRONG:
 *   - Civile: 7 - (rounds where Mr. White was NOT eliminated) = 7 - (roundNumber - 1)
 *   - Undercover: 3 points if eliminated before Mr. White. +2 if Mr. White reached round 3
 *   - Mr. White: 0 + 1 per round survived (roundNumber - 1)
 *
 * - If Mr. White is eliminated and guesses CORRECT (Mr. White wins):
 *   - Mr. White: 10 + 1 per round survived
 *   - Civile: 0
 *   - Undercover: 3 if eliminated before Mr. White, +2 if Mr. White reached round 3
 */
export function calculatePoints(
  players: Player[],
  rounds: RoundInfo[],
  mrWhiteWins: boolean
): { playerId: string; playerName: string; role: Role; points: number }[] {
  const mrWhiteRound = rounds.findIndex(r => r.eliminatedRole === 'mr_white');
  const mrWhiteEliminatedAtRound = mrWhiteRound !== -1 ? mrWhiteRound + 1 : rounds.length;
  const mrWhiteReachedRound3 = mrWhiteEliminatedAtRound >= 3;

  return players.map(player => {
    let points = 0;

    switch (player.role) {
      case 'civile':
        if (!mrWhiteWins) {
          // Civile wins: 7 points minus 1 for each round Mr. White survived
          points = Math.max(0, 7 - (mrWhiteEliminatedAtRound - 1));
        } else {
          // Mr. White wins: civile gets 0
          points = 0;
        }
        break;

      case 'undercover':
        // Undercover gets points only if eliminated before Mr. White
        if (player.isEliminated) {
          const undercoverEliminatedRound = rounds.findIndex(
            r => r.eliminatedPlayerId === player.id
          );
          if (undercoverEliminatedRound !== -1 && undercoverEliminatedRound < mrWhiteRound) {
            points = 3;
          }
        }
        // Bonus if Mr. White reached round 3
        if (mrWhiteReachedRound3 && points > 0) {
          points += 2;
        }
        break;

      case 'mr_white':
        if (mrWhiteWins) {
          // Mr. White guessed correctly: 10 + 1 per round survived
          points = 10 + (mrWhiteEliminatedAtRound - 1);
        } else {
          // Mr. White lost: 1 point per round survived
          points = mrWhiteEliminatedAtRound - 1;
        }
        break;
    }

    return {
      playerId: player.id,
      playerName: player.name,
      role: player.role,
      points,
    };
  });
}

export function buildGameResult(
  players: Player[],
  rounds: RoundInfo[],
  mrWhiteWins: boolean,
  wordSet: WordSet
): GameResult {
  const pointsAwarded = calculatePoints(players, rounds, mrWhiteWins);

  return {
    winner: mrWhiteWins ? 'mr_white' : 'civile',
    pointsAwarded,
    revealedWord: wordSet.civile_word,
    revealedUndercoverWord: wordSet.undercover_word,
  };
}
