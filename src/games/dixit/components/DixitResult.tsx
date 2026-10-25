import React from 'react';
import { DixitState } from '../types';
import { getRabbitTokenPath, COLOR_HEX, COLOR_LABELS } from '../cards';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface Props {
  state: DixitState;
  isHost: boolean;
  onRematch: () => void;
  onGoHome: () => void;
}

export default function DixitResult({ state, isHost, onRematch, onGoHome }: Props) {
  const winners = state.winners || [];
  const winnerPlayers = state.players.filter(p => winners.includes(p.id));
  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: '#fff' }}>
      {/* Trophy Animation */}
      <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>🏆</div>

      <h1 style={{
        fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #e0d4fc 0%, #a78bfa 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Fine della Partita!
      </h1>

      {/* Winners */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {winnerPlayers.map(w => (
          <div key={w.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            padding: '1.25rem 1.5rem', borderRadius: '16px',
            background: 'rgba(124, 58, 237, 0.2)', border: '2px solid #7c3aed',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
          }}>
            {w.color && (
              <img src={getRabbitTokenPath(w.color)} alt={w.color}
                style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
            )}
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{w.name}</div>
            <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.1rem' }}>{w.score} punti</div>
            <div style={{
              padding: '0.2rem 0.8rem', borderRadius: '8px', background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '0.75rem', fontWeight: 700,
            }}>
              🎉 VINCITORE{winnerPlayers.length > 1 ? '' : ''}!
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div style={{
        width: '100%', maxWidth: '450px', background: 'rgba(22, 18, 45, 0.82)',
        borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(124, 58, 237, 0.25)',
        marginBottom: '2rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: '#c4b5fd', textAlign: 'center' }}>
          Classifica Finale
        </h3>
        {sorted.map((player, rank) => (
          <div key={player.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.5rem',
            borderBottom: rank < sorted.length - 1 ? '1px solid rgba(124, 58, 237, 0.1)' : 'none',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: rank === 0 ? '#7c3aed' : rank === 1 ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.1)',
              color: '#fff', fontWeight: 800, fontSize: '0.75rem',
            }}>
              {rank + 1}
            </div>
            {player.color && (
              <img src={getRabbitTokenPath(player.color)} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            )}
            <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>{player.name}</div>
            <div style={{
              fontWeight: 800, fontSize: '1.1rem',
              color: winners.includes(player.id) ? '#4ade80' : '#c4b5fd',
            }}>{player.score}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {isHost && (
          <button onClick={onRematch} style={{
            padding: '0.9rem 2rem', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', color: '#1a0833',
            background: 'linear-gradient(135deg, #c4b5fd, #7c3aed)',
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <RotateCcw size={18} /> Rivincita
          </button>
        )}
        <button onClick={onGoHome} style={{
          padding: '0.9rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
          cursor: 'pointer', color: '#a78bfa',
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Home size={18} /> Torna alla Home
        </button>
      </div>
    </div>
  );
}
