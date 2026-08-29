import React from 'react';
import { PiliPiliState } from '../types';
import { Trophy, Home, RotateCcw } from 'lucide-react';

interface PiliPiliResultProps {
  state: PiliPiliState;
  isHost: boolean;
  onNewGame: () => void;
  onGoHome: () => void;
}

export default function PiliPiliResult({ state, isHost, onNewGame, onGoHome }: PiliPiliResultProps) {
  // Sort players by fewest pilis (winner first)
  const sortedPlayers = [...state.players].sort((a, b) => a.pilis - b.pilis);
  const winner = sortedPlayers[0];

  return (
    <div className="animate-fade-in text-center">
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏆</div>
      <h1 className="mb-sm text-gradient" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3rem' }}>
        Fine Partita!
      </h1>
      
      <p className="text-xl mb-xl">
        <strong style={{ color: '#fbbf24', fontSize: '2rem' }}>{winner.name}</strong> vince!
      </p>

      <div className="glass-panel p-xl mx-auto mb-xl" style={{ maxWidth: '500px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
        <h3 className="mb-lg" style={{ color: '#ea580c' }}>Classifica Finale</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedPlayers.map((p, index) => (
            <div key={p.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
              border: index === 0 ? '1px solid #fbbf24' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: index === 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                  #{index + 1}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.name}</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>
                {p.pilis} 🌶️
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {isHost && (
          <button className="btn btn-primary" onClick={onNewGame} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>
            <RotateCcw size={20} />
            Gioca Ancora
          </button>
        )}
        <button className="btn btn-secondary" onClick={onGoHome}>
          <Home size={20} />
          Torna alla Home
        </button>
      </div>
    </div>
  );
}
