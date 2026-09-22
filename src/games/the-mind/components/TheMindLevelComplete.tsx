import React, { useEffect } from 'react';
import { TheMindCard } from '../types';

interface TheMindLevelCompleteProps {
  level: number;
  totalLevels: number;
  rewardLife: boolean;
  rewardStar: boolean;
  isHost: boolean;
  onNextLevel: () => void;
  lastPlayedCard?: TheMindCard | null;
  lastPlayedByName?: string;
}

const TheMindLevelComplete: React.FC<TheMindLevelCompleteProps> = ({
  level,
  totalLevels,
  rewardLife,
  rewardStar,
  isHost,
  onNextLevel,
  lastPlayedCard,
  lastPlayedByName,
}) => {
  useEffect(() => {
    if (!isHost) {
      const timer = setTimeout(() => {
        onNextLevel();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHost, onNextLevel]);

  return (
    <div className="mind-level-complete">
      <h2>Livello Completato!</h2>
      <div className="mind-level-number">
        {level}
      </div>

      {/* Last played card */}
      {lastPlayedCard && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          margin: '0.5rem 0',
        }}>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Ultima carta:</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '42px', height: '56px', borderRadius: '8px', fontWeight: 900, fontSize: '1.1rem',
            background: lastPlayedCard.deck === 'white'
              ? 'linear-gradient(145deg, hsl(210,80%,55%), hsl(220,85%,35%))'
              : 'linear-gradient(145deg, hsl(350,80%,55%), hsl(340,85%,30%))',
            color: '#fff', boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            {lastPlayedCard.value}
          </span>
          {lastPlayedByName && (
            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
              {lastPlayedByName}
            </span>
          )}
        </div>
      )}
      
      <div className="rewards">
        {rewardLife && <div className="mind-reward">+❤️ Vita extra!</div>}
        {rewardStar && <div className="mind-reward">+⭐ Stella extra!</div>}
      </div>

      {isHost && (
        <button className="next-level-btn" onClick={onNextLevel}>
          Prossimo Livello
        </button>
      )}
    </div>
  );
};

export default TheMindLevelComplete;
