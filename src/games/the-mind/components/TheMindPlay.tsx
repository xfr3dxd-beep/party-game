import React, { useState } from 'react';
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
  const [showShurikenConfirm, setShowShurikenConfirm] = useState(false);

  const topWhite = state.whitePile.length > 0 ? state.whitePile[state.whitePile.length - 1] : null;
  const topRed = state.redPile.length > 0 ? state.redPile[state.redPile.length - 1] : null;

  const handleShurikenConfirm = () => {
    setShowShurikenConfirm(false);
    onRequestShuriken();
  };

  return (
    <div className="mind-play">
      <div className="mind-hud">
        <div className="mind-hud-section">
          Livello {state.level}/{state.totalLevels}
        </div>
        <div className="mind-hud-section" style={{ fontSize: '0.85rem', letterSpacing: '0.1em', opacity: 0.7 }}>
          {state.roomCode}
        </div>
        <div className="mind-hud-section">
          <span className="mind-hud-item">❤️ {state.lives}</span>
          <span className="mind-hud-item">⭐ {state.stars}</span>
        </div>
      </div>

      {state.isBlindLevel && (
        <div className="mind-blind-indicator" style={{ textAlign: 'center', margin: '0.5rem 0' }}>
          🙈 Livello Cieco!
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

      {/* Shuriken FAB */}
      <button
        className="mind-shuriken-fab"
        onClick={() => setShowShurikenConfirm(true)}
        disabled={state.stars === 0}
        title="Usa Shuriken"
      >
        ⭐
      </button>

      {/* Shuriken confirmation dialog */}
      {showShurikenConfirm && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Usare una Stella?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Ogni giocatore scarterà la carta più bassa. Gli altri giocatori dovranno accettare.
            </p>
            <div className="mind-shuriken-actions">
              <button
                className="btn btn-primary"
                onClick={handleShurikenConfirm}
              >
                ✅ Proponi
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowShurikenConfirm(false)}
              >
                ❌ Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheMindPlay;
