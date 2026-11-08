import React from 'react';
import type { DecryptoTeam } from '../types';

interface Props {
  isHost: boolean;
  onChoose: (team: DecryptoTeam) => void;
}

export default function DecryptoChooseStarter({ isHost, onChoose }: Props) {
  const handleRandom = () => {
    const team: DecryptoTeam = Math.random() < 0.5 ? 'bianca' : 'nera';
    onChoose(team);
  };

  return (
    <div className="animate-fade-in text-center">
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎲</div>
      <h2 style={{ fontWeight: 800, marginBottom: '1rem' }}>Chi inizia?</h2>

      {isHost ? (
        <div className="glass-panel p-lg" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p className="text-muted mb-md" style={{ fontSize: '0.9rem' }}>Scegli quale squadra inizia per prima:</p>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem', fontSize: '1.05rem' }}
            onClick={handleRandom}>
            🎲 Casuale
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '1rem' }}
              onClick={() => onChoose('bianca')}>
              ⬜ Bianca
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '1rem' }}
              onClick={() => onChoose('nera')}>
              ⬛ Nera
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted">L'host sta scegliendo quale squadra inizia...</p>
      )}
    </div>
  );
}
