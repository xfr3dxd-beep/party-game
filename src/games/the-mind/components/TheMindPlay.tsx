import React from 'react';
import { TheMindState, TheMindCard } from '../types';

interface TheMindPlayProps {
  state: TheMindState;
  myHand: TheMindCard[];
  playerId: string;
  onPlayCard: (card: TheMindCard) => void;
  onRequestShuriken: () => void;
}

const TheMindPlay: React.FC<TheMindPlayProps> = ({
  state,
  myHand,
  playerId,
  onPlayCard,
  onRequestShuriken,
}) => {
  const topWhite = state.whitePile.length > 0 ? state.whitePile[state.whitePile.length - 1] : null;
  const topRed = state.redPile.length > 0 ? state.redPile[state.redPile.length - 1] : null;

  return (
    <div className="mind-play">
      <div className="mind-hud">
        <div className="hud-left">
          Livello {state.level}/{state.totalLevels}
        </div>
        <div className="hud-center">
          {state.roomCode}
        </div>
        <div className="hud-right">
          ❤️ × {state.lives} | ⭐ × {state.stars}
        </div>
      </div>

      {state.isBlindLevel && (
        <div className="mind-blind-indicator">
          Livello Cieco! Le carte giocate sono coperte.
        </div>
      )}

      <div className="mind-pile-area">
        <div className={`pile white-pile ${topWhite === null ? 'empty' : ''}`} style={topWhite === null ? { border: '2px dashed #ccc' } : {}}>
          {topWhite !== null && (
            <div key={topWhite} className="mind-pile-card white">
              {topWhite}
            </div>
          )}
        </div>

        {state.mode === 'extreme' && (
          <div className={`pile red-pile ${topRed === null ? 'empty' : ''}`} style={topRed === null ? { border: '2px dashed #ccc' } : {}}>
            {topRed !== null && (
              <div key={topRed} className="mind-pile-card red">
                {topRed}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mind-hand-container">
        <div className="mind-hand">
          {myHand.map((card, idx) => (
            <div
              key={`${card.deck}-${card.value}-${idx}`}
              className={`mind-card ${card.deck}`}
              onClick={() => onPlayCard(card)}
            >
              {card.value}
            </div>
          ))}
        </div>
      </div>

      <button
        className="mind-shuriken-fab"
        onClick={onRequestShuriken}
        disabled={state.stars === 0}
      >
        ⭐ Usa Shuriken
      </button>
    </div>
  );
};

export default TheMindPlay;
