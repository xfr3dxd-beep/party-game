import React, { useState } from 'react';
import { TheMindState, TheMindCard, TheMindMode } from '../types';

interface TheMindPlayProps {
  state: TheMindState;
  myHand: TheMindCard[];
  playerId: string;
  onPlayCard: (card: TheMindCard) => void;
  onRequestShuriken: () => void;
}

// Generate dynamic card styles based on value and deck
function getCardStyle(card: TheMindCard, mode: TheMindMode): React.CSSProperties {
  const maxVal = mode === 'classic' ? 100 : 50;
  const ratio = Math.max(0, Math.min(1, (card.value - 1) / (maxVal - 1)));

  if (card.deck === 'white') {
    // Blue gradient: light cyan → deep ocean blue
    const h = 195 + ratio * 25;         // 195 → 220
    const s = 75 + ratio * 15;          // 75% → 90%
    const l = 68 - ratio * 45;          // 68% → 23%
    const bgFrom = `hsl(${h}, ${s}%, ${l}%)`;
    const bgTo = `hsl(${h + 10}, ${s + 5}%, ${Math.max(l - 12, 10)}%)`;
    const glowColor = `hsla(${h}, ${s}%, ${l + 20}%, 0.4)`;
    const borderColor = `hsla(${h}, ${s}%, ${l + 30}%, 0.5)`;

    return {
      background: `linear-gradient(145deg, ${bgFrom} 0%, ${bgTo} 100%)`,
      color: '#fff',
      textShadow: ratio > 0.6 ? '0 0 8px rgba(100,180,255,0.5)' : '0 1px 2px rgba(0,0,0,0.3)',
      boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px ${glowColor}`,
      border: `1px solid ${borderColor}`,
    };
  } else {
    // Red gradient: soft pink → dark crimson + fire glow
    const h = 355 - ratio * 15;         // 355 → 340
    const s = 75 + ratio * 15;          // 75% → 90%
    const l = 65 - ratio * 40;          // 65% → 25%
    const bgFrom = `hsl(${h}, ${s}%, ${l}%)`;
    const bgTo = `hsl(${h - 10}, ${s + 5}%, ${Math.max(l - 15, 10)}%)`;
    const fireGlow = ratio > 0.5 ? `0 0 ${8 + ratio * 12}px hsla(20, 100%, 50%, ${0.3 + ratio * 0.3})` : '';
    const borderColor = `hsla(${h}, ${s}%, ${l + 30}%, 0.5)`;

    return {
      background: `linear-gradient(145deg, ${bgFrom} 0%, ${bgTo} 100%)`,
      color: '#fff',
      textShadow: ratio > 0.5 ? '0 0 10px rgba(255,100,50,0.6)' : '0 1px 2px rgba(0,0,0,0.3)',
      boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px hsla(${h},${s}%,${l+20}%,0.4)${fireGlow ? ', ' + fireGlow : ''}`,
      border: `1px solid ${borderColor}`,
    };
  }
}

// Get pile card style for the top card on the pile
function getPileCardStyle(value: number, deck: 'white' | 'red', mode: TheMindMode): React.CSSProperties {
  const card: TheMindCard = { value, deck };
  const base = getCardStyle(card, mode);
  return {
    ...base,
    fontSize: '2rem',
    fontWeight: 800,
  };
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

  // Background image based on mode
  const bgImage = state.mode === 'extreme'
    ? '/The mind extreme.png'
    : '/The mind.png';

  return (
    <div
      className="mind-play"
      style={{
        backgroundImage: `url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Dark overlay for readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Content on top */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HUD */}
        <div className="mind-hud">
          <div className="mind-hud-section">
            Livello {state.level}/{state.totalLevels}
          </div>
          <div className="mind-hud-section" style={{ fontSize: '0.85rem', letterSpacing: '0.1em', opacity: 0.8 }}>
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

        {/* Pile area */}
        <div className="mind-pile-area">
          <div className="mind-pile mind-pile-white">
            <span className="mind-pile-label">⬆ ASC</span>
            {topWhite !== null ? (
              <div
                key={topWhite}
                className="mind-pile-card"
                style={getPileCardStyle(topWhite, 'white', state.mode)}
              >
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
                <div
                  key={topRed}
                  className="mind-pile-card"
                  style={getPileCardStyle(topRed, 'red', state.mode)}
                >
                  {topRed}
                </div>
              ) : (
                <div className="mind-pile-empty">—</div>
              )}
            </div>
          )}
        </div>

        {/* Player hand */}
        <div className="mind-hand-container">
          <div className="mind-hand" style={{
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
          }}>
            {myHand.map((card, idx) => {
              const cardSize = myHand.length > 8 ? 'sm' : myHand.length > 5 ? 'md' : 'lg';
              const sizes = {
                sm: { w: '55px', h: '82px', fs: '1.2rem' },
                md: { w: '65px', h: '97px', fs: '1.4rem' },
                lg: { w: '75px', h: '112px', fs: '1.6rem' },
              };
              const s = sizes[cardSize];
              const dynamicStyle = getCardStyle(card, state.mode);

              return (
                <div
                  key={`${card.deck}-${card.value}-${idx}`}
                  className={`mind-card-v2 ${card.deck}`}
                  style={{
                    ...dynamicStyle,
                    width: s.w,
                    height: s.h,
                    fontSize: s.fs,
                  }}
                  onClick={() => onPlayCard(card)}
                >
                  <span className="mind-card-value">{card.value}</span>
                  {/* Decorative corner marks */}
                  <span className="mind-card-corner top-left">{card.value}</span>
                  <span className="mind-card-corner bottom-right">{card.value}</span>
                  {/* Fire embers for red cards with high values */}
                  {card.deck === 'red' && card.value > 30 && (
                    <div className="mind-card-ember" />
                  )}
                </div>
              );
            })}
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
                {state.mode === 'extreme'
                  ? 'Ogni giocatore sceglierà quale carta scartare. Gli altri dovranno accettare.'
                  : 'Ogni giocatore scarterà la carta più bassa. Gli altri giocatori dovranno accettare.'}
              </p>
              <div className="mind-shuriken-actions">
                <button className="btn btn-primary" onClick={handleShurikenConfirm}>
                  ✅ Proponi
                </button>
                <button className="btn btn-secondary" onClick={() => setShowShurikenConfirm(false)}>
                  ❌ Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheMindPlay;
