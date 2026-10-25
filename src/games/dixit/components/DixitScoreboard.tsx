import React from 'react';
import { DixitState, DixitColor } from '../types';
import { SCOREBOARD_IMAGE, getRabbitTokenPath, COLOR_HEX, COLOR_LABELS } from '../cards';
import { X } from 'lucide-react';

interface Props {
  state: DixitState;
  isOpen: boolean;
  onClose: () => void;
}

export default function DixitScoreboard({ state, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  // Sort players by score descending for the leaderboard
  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  // The scoreboard image is a linear track of 30 spaces.
  // We'll show the image as background and render a table of positions below it.
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto', padding: '1rem',
    }}>
      {/* Close Button */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
        background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.4)',
        color: '#a78bfa', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={24} />
      </button>

      <h2 style={{
        fontSize: '1.5rem', fontWeight: 800, color: '#c4b5fd', marginBottom: '1rem', marginTop: '0.5rem',
      }}>
        🏆 Tabellone Punteggio
      </h2>

      {/* Scoreboard Image */}
      <div style={{
        width: '100%', maxWidth: '700px', marginBottom: '1.5rem', position: 'relative',
        borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(124, 58, 237, 0.3)',
      }}>
        <img src={SCOREBOARD_IMAGE} alt="Tabellone Punteggio"
          style={{ width: '100%', display: 'block' }}
        />
        {/* Overlay rabbit tokens on the board
            The board is a linear track, so we position tokens as percentages along its width.
            This is approximate — positions might need fine-tuning. */}
        {state.players.filter(p => p.color).map((player, idx) => {
          const pct = Math.min(player.score / 30, 1) * 90 + 5; // 5% to 95% horizontal
          const stackOffset = idx * 18; // vertical offset to stack tokens on same position
          return (
            <img key={player.id}
              src={getRabbitTokenPath(player.color!)}
              alt={player.name}
              title={`${player.name}: ${player.score} pt`}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                bottom: `${10 + stackOffset}%`,
                width: '32px', height: '32px',
                objectFit: 'contain',
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
                transform: 'translateX(-50%)',
                transition: 'left 0.5s ease',
              }}
            />
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div style={{
        width: '100%', maxWidth: '500px', background: 'rgba(22, 18, 45, 0.9)',
        borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(124, 58, 237, 0.25)',
      }}>
        {sorted.map((player, rank) => (
          <div key={player.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.5rem',
            borderBottom: rank < sorted.length - 1 ? '1px solid rgba(124, 58, 237, 0.1)' : 'none',
          }}>
            {/* Rank */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: rank === 0 ? '#7c3aed' : 'rgba(124, 58, 237, 0.15)',
              color: '#fff', fontWeight: 800, fontSize: '0.8rem',
            }}>
              {rank + 1}
            </div>

            {/* Rabbit */}
            {player.color && (
              <img src={getRabbitTokenPath(player.color)} alt={player.color}
                style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            )}

            {/* Name */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{player.name}</div>
              {player.color && (
                <div style={{ fontSize: '0.7rem', color: COLOR_HEX[player.color] }}>{COLOR_LABELS[player.color]}</div>
              )}
            </div>

            {/* Score */}
            <div style={{
              fontWeight: 800, fontSize: '1.3rem',
              color: player.score >= 30 ? '#4ade80' : '#c4b5fd',
            }}>
              {player.score}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>/30</div>

            {/* Progress bar */}
            <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(124, 58, 237, 0.15)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${Math.min(100, (player.score / 30) * 100)}%`,
                background: player.score >= 30
                  ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                  : `linear-gradient(90deg, #a78bfa, #7c3aed)`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
