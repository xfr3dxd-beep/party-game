import React from 'react';
import { Play, Trophy } from 'lucide-react';
import { Team } from '../types';

interface TeamTransitionProps {
  finishedTeam: Team;
  nextTeam: Team | null; // null if all teams played
  onContinue: () => void;
}

export default function TeamTransition({
  finishedTeam,
  nextTeam,
  onContinue,
}: TeamTransitionProps) {
  return (
    <div className="sciarada-transition animate-fade-in">
      <div className="round-result-icon">⏰</div>

      <h2 className="round-result-title" style={{ color: 'var(--accent-rose-light)' }}>
        Tempo Scaduto!
      </h2>

      <div className="glass-card-static" style={{
        padding: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
          {finishedTeam.name}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
        }}>
          <Trophy size={20} style={{ color: 'var(--accent-amber-light)' }} />
          <span style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--accent-amber-light)',
          }}>
            +{finishedTeam.roundScore}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            punti questo turno
          </span>
        </div>
      </div>

      {nextTeam ? (
        <>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-lg)',
            fontSize: '1.1rem',
          }}>
            Tocca alla squadra <strong style={{ color: 'var(--text-primary)' }}>{nextTeam.name}</strong>!
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={onContinue}
            id="next-team-button"
          >
            <Play size={18} />
            Inizia Turno
          </button>
        </>
      ) : (
        <>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-lg)',
            fontSize: '1.1rem',
          }}>
            Tutte le squadre hanno giocato!
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={onContinue}
            id="show-results-button"
          >
            <Trophy size={18} />
            Vedi Risultati
          </button>
        </>
      )}
    </div>
  );
}
