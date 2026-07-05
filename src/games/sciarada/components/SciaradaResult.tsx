import React from 'react';
import { RotateCcw, SkipForward, Trophy } from 'lucide-react';
import { Team } from '../types';

interface SciaradaResultProps {
  teams: Team[];
  roundNumber: number;
  onNextRound: () => void;
  onNewGame: () => void;
}

export default function SciaradaResult({
  teams,
  roundNumber,
  onNextRound,
  onNewGame,
}: SciaradaResultProps) {
  const leaderboard = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="round-result animate-fade-in">
      <div className="round-result-icon">🏆</div>

      <h2 className="round-result-title" style={{ color: 'var(--accent-amber-light)' }}>
        Fine Round {roundNumber}
      </h2>

      <p className="round-result-message">
        Ecco i risultati di questo round!
      </p>

      {/* Round Scores */}
      <div className="points-awarded">
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-sm)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Punti Round {roundNumber}
        </p>
        {teams.map(team => (
          <div key={team.id} className="points-row">
            <span className="points-row-name">{team.name}</span>
            <span className={`points-row-value ${team.roundScore === 0 ? 'zero' : ''}`}>
              +{team.roundScore} pt
            </span>
          </div>
        ))}
      </div>

      {/* Cumulative Leaderboard */}
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
        {leaderboard.map((team, index) => (
          <div key={team.id} className="points-row" style={{
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
              {team.name}
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: index === 0 ? 'var(--accent-amber-light)' : 'var(--text-primary)',
            }}>
              {team.score} pt
              {team.roundScore > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-green-light)', marginLeft: '4px' }}>
                  (+{team.roundScore})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-md mt-xl" style={{ flexDirection: 'column' }}>
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={onNextRound}
          id="sciarada-next-round"
        >
          <SkipForward size={18} />
          Prossimo Round
        </button>
        <button
          className="btn btn-secondary btn-block"
          onClick={onNewGame}
          id="sciarada-new-game"
        >
          <RotateCcw size={18} />
          Nuova Partita
        </button>
      </div>
    </div>
  );
}
