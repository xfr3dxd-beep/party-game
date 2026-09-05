import React, { useState } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { getCardImage } from '../missions';

interface PiliPiliSwapProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onSwapSelect: (cards: number[]) => void;
}

export default function PiliPiliSwap({ state, myPlayer, onSwapSelect }: PiliPiliSwapProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const mission = state.currentMission!;
  const swapCount = mission.swapCount || 1;
  const direction = mission.swapDirection === 'left' ? 'sinistra' : 'destra';
  const alreadySubmitted = !!state.swapSelections[myPlayer.id];

  const toggleCard = (card: number) => {
    if (alreadySubmitted) return;
    if (selected.includes(card)) {
      setSelected(selected.filter(c => c !== card));
    } else if (selected.length < swapCount) {
      setSelected([...selected, card]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === swapCount) {
      onSwapSelect(selected);
    }
  };

  // Count how many players have submitted
  const submitted = Object.keys(state.swapSelections).length;

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔄 Scambio Carte</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        {mission.name}
      </p>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Scegli <strong style={{ color: '#ea580c' }}>{swapCount}</strong> carta{swapCount > 1 ? 'e' : ''} da passare a {direction}
      </p>

      {!alreadySubmitted ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {myPlayer.hand.map((card, i) => {
              const isSelected = selected.includes(card);
              return (
                <button
                  key={i}
                  onClick={() => toggleCard(card)}
                  style={{
                    padding: 0, border: 'none', background: 'none', cursor: 'pointer',
                    transform: isSelected ? 'translateY(-12px) scale(1.05)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                >
                  <img
                    src={getCardImage(card)}
                    alt={`Carta ${card}`}
                    style={{
                      width: '70px', height: 'auto', borderRadius: '6px',
                      boxShadow: isSelected ? '0 8px 24px rgba(234, 88, 12, 0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                      border: isSelected ? '3px solid #ea580c' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selected.length !== swapCount}
            style={{
              padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
              background: selected.length === swapCount ? 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' : 'rgba(100,100,100,0.3)',
              border: 'none', borderRadius: '10px',
              cursor: selected.length === swapCount ? 'pointer' : 'not-allowed',
              opacity: selected.length === swapCount ? 1 : 0.5,
            }}
          >
            Conferma Scambio ({selected.length}/{swapCount})
          </button>
        </>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', padding: '2rem' }}>
          ✅ Carte selezionate! In attesa degli altri...
        </div>
      )}

      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        {submitted}/{state.players.length} giocatori pronti
      </div>
    </div>
  );
}
