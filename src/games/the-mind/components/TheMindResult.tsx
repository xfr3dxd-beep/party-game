import React from 'react';
import { TheMindMode } from '../types';

interface TheMindResultProps {
  won: boolean;
  level: number;
  totalLevels: number;
  mode: TheMindMode;
  isHost: boolean;
  onNewGame: () => void;
  onGoHome: () => void;
}

const TheMindResult: React.FC<TheMindResultProps> = ({
  won,
  level,
  totalLevels,
  mode,
  isHost,
  onNewGame,
  onGoHome,
}) => {
  return (
    <div className={`mind-game-over ${won ? 'win' : 'lose'} animate-fade-in`}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
        {won ? '🧠' : '💀'}
      </div>
      <h1 className="mind-result-text">
        {won ? 'VITTORIA!' : 'Game Over'}
      </h1>

      <div style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.2rem' }}>Livello raggiunto: <strong>{level}/{totalLevels}</strong></p>
        <p>Modalità: {mode === 'classic' ? 'Classic' : 'Extreme'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        {/* Restart button — always visible, host triggers it */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '300px' }}
          onClick={onNewGame}
        >
          🔄 {won ? 'Gioca Ancora' : 'Ricomincia'}
        </button>

        <button
          className="btn btn-secondary"
          style={{ width: '100%', maxWidth: '300px' }}
          onClick={onGoHome}
        >
          🏠 Torna ai Giochi
        </button>
      </div>
    </div>
  );
};

export default TheMindResult;
