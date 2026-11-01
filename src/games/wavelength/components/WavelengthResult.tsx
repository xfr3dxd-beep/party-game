import React from 'react';
import type { WavelengthState } from '../types';

interface WavelengthResultProps {
  state: WavelengthState;
  isHost: boolean;
  onNewGame: () => void;
  onGoHome: () => void;
}

export default function WavelengthResult({ state, isHost, onNewGame, onGoHome }: WavelengthResultProps) {
  const sortedPlayers = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = state.players.find(p => p.id === state.winnerId);

  return (
    <div className="animate-fade-in text-center">
      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>
        <span className="text-gradient">Partita Terminata!</span>
      </h1>

      {winner && (
        <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>
            🎉 {winner.name} ha vinto con {winner.totalScore} punti!
          </div>
        </div>
      )}

      {/* Final standings */}
      <div className="glass-panel p-lg" style={{ maxWidth: '500px', margin: '1rem auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>Classifica Finale</h3>
        {sortedPlayers.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.6rem 0.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: i === 0 ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
            borderRadius: i === 0 ? '8px' : '0',
          }}>
            <span>
              <span style={{
                fontWeight: 900, marginRight: '0.75rem', fontSize: '1.2rem',
                color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-muted)',
              }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
            </span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>
              {p.totalScore}
            </span>
          </div>
        ))}
      </div>

      {/* Round count */}
      <p className="text-muted" style={{ marginTop: '1rem' }}>
        Partita conclusa in {state.roundNumber} round
      </p>

      {/* Actions */}
      <div style={{ maxWidth: '400px', margin: '1.5rem auto 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isHost && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.1rem' }}
            onClick={onNewGame}
          >
            🔄 Nuova Partita
          </button>
        )}
        <button
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={onGoHome}
        >
          🏠 Torna ai Giochi
        </button>
      </div>
    </div>
  );
}
