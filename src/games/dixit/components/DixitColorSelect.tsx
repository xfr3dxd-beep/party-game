import React from 'react';
import { DixitState, DixitColor } from '../types';
import { COLORS, COLOR_LABELS, COLOR_HEX, getRabbitTokenPath } from '../cards';

interface Props {
  state: DixitState;
  playerId: string;
  onSelectColor: (color: string) => void;
}

export default function DixitColorSelect({ state, playerId, onSelectColor }: Props) {
  const myPlayer = state.players.find(p => p.id === playerId);
  const takenColors = state.players.filter(p => p.color && p.id !== playerId).map(p => p.color!);
  const myColor = myPlayer?.color;
  const allSelected = state.players.every(p => p.color !== null);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: '#fff' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #e0d4fc 0%, #a78bfa 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Scegli il tuo Coniglio
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '2rem', textAlign: 'center' }}>
        Seleziona il colore del tuo token coniglio
      </p>

      {/* Color Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '420px', width: '100%', marginBottom: '2rem' }}>
        {COLORS.map(color => {
          const isTaken = takenColors.includes(color);
          const isMine = myColor === color;
          const hex = COLOR_HEX[color];
          return (
            <button key={color} onClick={() => !isTaken && onSelectColor(color)} disabled={isTaken && !isMine}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                padding: '1rem 0.5rem', borderRadius: '16px', border: 'none', cursor: isTaken && !isMine ? 'not-allowed' : 'pointer',
                background: isMine ? `rgba(${hexToRgb(hex)}, 0.25)` : isTaken ? 'rgba(30,27,50,0.4)' : 'rgba(30,27,50,0.8)',
                borderWidth: '2px', borderStyle: 'solid',
                borderColor: isMine ? hex : 'rgba(124, 58, 237, 0.2)',
                boxShadow: isMine ? `0 0 20px rgba(${hexToRgb(hex)}, 0.4)` : 'none',
                opacity: isTaken && !isMine ? 0.35 : 1,
                transition: 'all 0.2s ease',
              }}>
              <img src={getRabbitTokenPath(color)} alt={COLOR_LABELS[color]}
                style={{ width: '64px', height: '64px', objectFit: 'contain', filter: isTaken && !isMine ? 'grayscale(1)' : 'none' }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isMine ? hex : '#fff' }}>
                {COLOR_LABELS[color]}
              </span>
              {isMine && <span style={{ fontSize: '0.7rem', color: hex, fontWeight: 700 }}>✓ Selezionato</span>}
              {isTaken && !isMine && (
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                  {state.players.find(p => p.color === color)?.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {myColor && !allSelected && (
        <div style={{
          padding: '0.75rem 1.5rem', borderRadius: '12px',
          background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)',
          color: '#a78bfa', fontSize: '0.9rem', textAlign: 'center',
        }}>
          ⏳ In attesa che tutti scelgano il colore...
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            {state.players.filter(p => p.color).length}/{state.players.length} pronti
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
