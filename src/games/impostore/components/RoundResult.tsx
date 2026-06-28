import React from 'react';
import { ArrowRight, RotateCcw, SkipForward, Trophy } from 'lucide-react';
import { GameResult, Player } from '../types';

interface RoundResultProps {
  result: GameResult | null;
  players: Player[];
  eliminatedPlayerId: string | null;
  isGameOver: boolean;
  onContinue: () => void;
  onNewGame: () => void;
  onNextRound: () => void;
}

export default function RoundResult({
  result,
  players,
  eliminatedPlayerId,
  isGameOver,
  onContinue,
  onNewGame,
  onNextRound,
}: RoundResultProps) {
  const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);

  if (isGameOver && result) {
    const mrWhiteWins = result.winner === 'mr_white';

    // Calculate cumulative scores (current score + points from this round)
    const leaderboard = [...players]
      .map(p => {
        const awarded = result.pointsAwarded.find(a => a.playerId === p.id);
        return {
          name: p.name,
          totalScore: p.score + (awarded?.points ?? 0),
          roundPoints: awarded?.points ?? 0,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    const hasMultipleRounds = players.some(p => p.score > 0);

    return (
      <div className="round-result animate-fade-in">
        <div className="round-result-icon">
          {mrWhiteWins ? '🕵️' : '🎉'}
        </div>
        <h2 className="round-result-title" style={{
          color: mrWhiteWins ? 'var(--accent-rose-light)' : 'var(--accent-green-light)',
        }}>
          {mrWhiteWins ? 'Mr. White Vince!' : 'I Civili Vincono!'}
        </h2>
        <p className="round-result-message">
          {mrWhiteWins
            ? 'Mr. White ha indovinato la parola dei Civili!'
            : 'Mr. White è stato scoperto e non ha indovinato la parola!'
          }
        </p>

        <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
            Le parole di questa partita
          </p>
          <div className="flex gap-lg justify-center" style={{ flexWrap: 'wrap' }}>
            <div>
              <span className="card-role civile" style={{ marginBottom: '4px', display: 'inline-block' }}>Civile</span>
              <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{result.revealedWord}</p>
            </div>
            <div>
              <span className="card-role undercover" style={{ marginBottom: '4px', display: 'inline-block' }}>Undercover</span>
              <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{result.revealedUndercoverWord}</p>
            </div>
          </div>
        </div>

        <div className="points-awarded">
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Punti Assegnati
          </p>
          {result.pointsAwarded.map(award => (
            <div key={award.playerId} className="points-row">
              <span className="points-row-name">
                {award.playerName}
                <span className={`card-role ${award.role === 'mr_white' ? 'mr-white' : award.role}`} style={{ marginLeft: '8px' }}>
                  {award.role === 'mr_white' ? 'Mr. White' : award.role === 'civile' ? 'Civile' : 'Undercover'}
                </span>
              </span>
              <span className={`points-row-value ${award.points === 0 ? 'zero' : ''}`}>
                +{award.points} pt
              </span>
            </div>
          ))}
        </div>

        {/* Cumulative Leaderboard */}
        {(hasMultipleRounds || true) && (
          <div className="glass-card-static mt-xl" style={{ padding: 'var(--space-lg)' }}>
            <p style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-md)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}>
              <Trophy size={16} />
              Classifica Totale
            </p>
            {leaderboard.map((entry, index) => (
              <div key={index} className="points-row" style={{
                background: index === 0 ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.75rem',
              }}>
                <span className="points-row-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: index === 0 ? '1.2rem' : '0.9rem',
                    width: '1.5rem',
                    textAlign: 'center',
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  {entry.name}
                </span>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: index === 0 ? 'var(--accent-amber-light)' : 'var(--text-primary)',
                }}>
                  {entry.totalScore} pt
                  {entry.roundPoints > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-green-light)', marginLeft: '4px' }}>
                      (+{entry.roundPoints})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-md mt-xl" style={{ flexDirection: 'column' }}>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={onNextRound}
            id="next-round-button"
          >
            <SkipForward size={18} />
            Prossimo Round
          </button>
          <button
            className="btn btn-secondary btn-block"
            onClick={onNewGame}
            id="new-game-button"
          >
            <RotateCcw size={18} />
            Nuova Partita
          </button>
        </div>
      </div>
    );
  }

  // Non-game-over round result (eliminated a non-mr-white player)
  return (
    <div className="round-result animate-fade-in">
      <div className="round-result-icon">❌</div>
      <h2 className="round-result-title">
        {eliminatedPlayer?.name} Eliminato!
      </h2>
      <p className="round-result-message">
        {eliminatedPlayer?.role === 'undercover' ? (
          <>Era un <span className="card-role undercover">Undercover</span>! La partita continua...</>
        ) : (
          <>Era un <span className="card-role civile">Civile</span>! Attenzione, l'impostore è ancora in gioco!</>
        )}
      </p>

      <button
        className="btn btn-primary btn-lg"
        onClick={onContinue}
        id="continue-round-button"
      >
        Continua
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
