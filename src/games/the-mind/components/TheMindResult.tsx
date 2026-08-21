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
    <div className={`mind-game-over ${won ? 'win' : 'lose'}`}>
      <h1 className="mind-result-text">
        {won ? 'VITTORIA! 🧠' : 'Game Over 💀'}
      </h1>
      
      <div className="stats">
        <p>Livello raggiunto: {level}/{totalLevels}</p>
        <p>Modalità: {mode === 'classic' ? 'Classic' : 'Extreme'}</p>
      </div>

      <div className="actions">
        {isHost && (
          <button className="new-game-btn" onClick={onNewGame}>
            Nuova Partita
          </button>
        )}
        <button className="go-home-btn" onClick={onGoHome}>
          Torna ai Giochi
        </button>
      </div>
    </div>
  );
};

export default TheMindResult;
