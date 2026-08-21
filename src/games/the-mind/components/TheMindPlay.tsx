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
        <div className="mind-pile mind-pile-white">
          <span className="mind-pile-label">⬆ ASC</span>
          {topWhite !== null ? (
            <div key={topWhite} className="mind-pile-card">
              {topWhite}
            </div>
          ) : (
            <div className="mind-pile-empty">—</div>
          )}
        </div>

        {state.mode === 'extreme' && (
          <div className="mind-pile mind-pile-red">
            <span className="mind-pile-label">⬇ DESC</span>
            {topRed !== null ? (
              <div key={topRed} className="mind-pile-card">
                {topRed}
              </div>
            ) : (
              <div className="mind-pile-empty">—</div>
            )}
          </div>
        )}
      </div>

      <div className="mind-hand-container">
        <div className="mind-hand" style={{
          flexWrap: 'wrap',
          gap: '0.4rem',
          justifyContent: 'center',
        }}>
          {myHand.map((card, idx) => (
            <div
              key={`${card.deck}-${card.value}-${idx}`}
              className={`mind-card ${card.deck}`}
              style={{
                width: myHand.length > 8 ? '55px' : myHand.length > 5 ? '65px' : '75px',
                height: myHand.length > 8 ? '80px' : myHand.length > 5 ? '95px' : '110px',
                fontSize: myHand.length > 8 ? '1.2rem' : myHand.length > 5 ? '1.5rem' : '1.7rem',
              }}
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
        title="Usa Shuriken"
      >
        ⭐
      </button>
    </div>
  );
};

export default TheMindPlay;
