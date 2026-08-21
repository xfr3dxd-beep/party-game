import React, { useEffect } from 'react';

interface TheMindLevelCompleteProps {
  level: number;
  totalLevels: number;
  rewardLife: boolean;
  rewardStar: boolean;
  isHost: boolean;
  onNextLevel: () => void;
}

const TheMindLevelComplete: React.FC<TheMindLevelCompleteProps> = ({
  level,
  totalLevels,
  rewardLife,
  rewardStar,
  isHost,
  onNextLevel,
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
