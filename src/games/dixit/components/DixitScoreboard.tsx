import React from 'react';
import { DixitState } from '../types';
import { SCOREBOARD_IMAGE, getRabbitTokenPath, COLOR_HEX, COLOR_LABELS } from '../cards';
import { X } from 'lucide-react';

interface Props {
  state: DixitState;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Percentage-based positions (x%, y%) for each stone 1–30 on the scoreboard image.
 * The path follows: bottom row (1-9), right column (10-16), top row (17-23),
 * left column (24-26), then center tree platforms (27-30).
 */
const STONE_POSITIONS: Record<number, { x: number; y: number }> = {
  // Bottom row, left to right
  1:  { x: 5,  y: 79 },
  2:  { x: 5,  y: 92 },
  3:  { x: 16, y: 92 },
  4:  { x: 26, y: 92 },
  5:  { x: 37, y: 92 },
  6:  { x: 48, y: 92 },
  7:  { x: 58, y: 92 },
  8:  { x: 69, y: 92 },
  9:  { x: 79, y: 92 },
  // Right column, bottom to top
  10: { x: 90, y: 86 },
  11: { x: 90, y: 74 },
  12: { x: 90, y: 64 },
  13: { x: 90, y: 54 },
  14: { x: 90, y: 44 },
  15: { x: 87, y: 33 },
  16: { x: 82, y: 24 },
  // Top row, right to left
  17: { x: 72, y: 15 },
  18: { x: 61, y: 12 },
  19: { x: 52, y: 10 },
  20: { x: 42, y: 10 },
  21: { x: 30, y: 12 },
  22: { x: 19, y: 15 },
  23: { x: 8,  y: 18 },
  // Left column, top to bottom
  24: { x: 5,  y: 32 },
  25: { x: 5,  y: 46 },
  26: { x: 5,  y: 60 },
  // Center tree platforms
  27: { x: 30, y: 65 },
  28: { x: 30, y: 50 },
  29: { x: 38, y: 38 },
  30: { x: 52, y: 38 },
};

export default function DixitScoreboard({ state, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  // Group players by score for stacking on same position
  const scoreGroups: Record<number, typeof state.players> = {};
  state.players.forEach(p => {
    const pos = Math.min(Math.max(p.score, 0), 30); // clamp to 0-30
    if (!scoreGroups[pos]) scoreGroups[pos] = [];
    scoreGroups[pos].push(p);
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.94)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowY: 'auto', padding: '1rem',
    }}>
      {/* Close Button */}
      <button onClick={onClose} style={{
        position: 'fixed', top: '1rem', right: '1rem', zIndex: 1010,
        background: 'rgba(124, 58, 237, 0.3)', border: '1px solid rgba(124, 58, 237, 0.5)',
        color: '#a78bfa', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={24} />
      </button>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c4b5fd', marginBottom: '1rem', marginTop: '0.5rem' }}>
        🏆 Tabellone Punteggio
      </h2>

      {/* Board with positioned tokens */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '650px', marginBottom: '1.5rem',
        borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(124, 58, 237, 0.3)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      }}>
        <img src={SCOREBOARD_IMAGE} alt="Tabellone Punteggio"
          style={{ width: '100%', display: 'block' }}
        />

        {/* Render rabbit tokens at their score positions */}
        {Object.entries(scoreGroups).map(([scoreStr, playersAtPos]) => {
          const score = parseInt(scoreStr);
          // Score 0 means the player hasn't scored yet — place them just before position 1
          const posData = score === 0
            ? { x: 0, y: 85 } // off-board start area
            : STONE_POSITIONS[score];

          if (!posData) return null;

          return playersAtPos.map((player, stackIdx) => {
            if (!player.color) return null;
            // Stack multiple tokens: offset horizontally when on the same space
            const offsetX = playersAtPos.length > 1 ? (stackIdx - (playersAtPos.length - 1) / 2) * 4 : 0;
            const offsetY = playersAtPos.length > 1 ? stackIdx * -3 : 0;

            return (
              <img
                key={player.id}
                src={getRabbitTokenPath(player.color)}
                alt={`${player.name}: ${player.score} pt`}
                title={`${player.name}: ${player.score} pt`}
                style={{
                  position: 'absolute',
                  left: `${posData.x + offsetX}%`,
                  top: `${posData.y + offsetY}%`,
                  width: '6%',
                  maxWidth: '42px',
                  objectFit: 'contain',
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
                  transition: 'left 0.6s ease, top 0.6s ease',
                  zIndex: 5 + stackIdx,
                }}
              />
            );
          });
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
                  : 'linear-gradient(90deg, #a78bfa, #7c3aed)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
