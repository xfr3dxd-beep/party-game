import React from 'react';
import { MascaradeState } from '../types';
import { getRoleById } from '../roles';

interface Props {
  state: MascaradeState;
  isHost: boolean;
  onRematch: () => void;
  onGoHome: () => void;
}

export default function MascaradeResult({ state, isHost, onRematch, onGoHome }: Props) {
  const winner = state.players.find(p => p.id === state.winnerId);
  const sorted = [...state.players].sort((a, b) => b.coins - a.coins);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <h1 style={{ color: '#d4a843', fontSize: '2rem', marginBottom: '0.5rem' }}>🎭 Partita Finita!</h1>

      {winner && (
        <div style={{
          textAlign: 'center', marginBottom: '1.5rem', padding: '1.5rem',
          background: 'rgba(212,168,67,0.15)', borderRadius: '16px', border: '2px solid #d4a843',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👑</div>
          <h2 style={{ color: '#d4a843', marginBottom: '0.3rem' }}>{winner.name} vince!</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Con 🪙 {winner.coins} monete — {getRoleById(winner.roleId).name}
          </p>
        </div>
      )}

      <div style={{
        width: '100%', maxWidth: '400px', background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem',
      }}>
        <h3 style={{ color: '#d4a843', marginBottom: '0.5rem', textAlign: 'center' }}>Classifica Finale</h3>
        {sorted.map((p, i) => {
          const role = getRoleById(p.roleId);
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem',
              borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <span style={{ fontSize: '1rem', width: '24px', textAlign: 'center', color: i === 0 ? '#d4a843' : 'rgba(255,255,255,0.5)' }}>
                {i === 0 ? '👑' : `${i + 1}.`}
              </span>
              <img src={role.image} alt={role.name} style={{ width: '35px', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: p.id === state.winnerId ? '#d4a843' : '#fff', fontSize: '0.9rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{role.name}</div>
              </div>
              <span style={{ color: '#d4a843', fontWeight: 700 }}>🪙 {p.coins}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {isHost && (
          <button onClick={onRematch} style={{
            padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
            background: '#d4a843', border: 'none', borderRadius: '10px', cursor: 'pointer',
          }}>🔄 Rivincita</button>
        )}
        <button onClick={onGoHome} style={{
          padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
          background: '#666', border: 'none', borderRadius: '10px', cursor: 'pointer',
        }}>🏠 Home</button>
      </div>
    </div>
  );
}
