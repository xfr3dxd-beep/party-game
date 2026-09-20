import React from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getRoleById } from '../roles';

interface Props {
  state: MascaradeState;
  myPlayer: MascaradePlayer;
  onVote: (challenged: boolean) => void;
}

export default function MascaradeChallenge({ state, myPlayer, onVote }: Props) {
  const activePlayer = state.players.find(p => p.seatIndex === state.turnIndex)!;
  const declaredRole = getRoleById(state.declaredRoleId!);
  const isActive = myPlayer.id === activePlayer.id;
  const alreadyVoted = state.challenges.some(c => c.playerId === myPlayer.id);
  const otherCount = state.players.length - 1;
  const votedCount = state.challenges.length;

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#d4a843', marginBottom: '0.5rem' }}>🎭 Dichiarazione</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', textAlign: 'center', fontSize: '1.05rem' }}>
        <strong style={{ color: '#d4a843' }}>{activePlayer.name}</strong> dichiara di essere:
      </p>

      <div style={{
        textAlign: 'center', marginBottom: '1.5rem', padding: '1rem',
        background: 'rgba(212,168,67,0.1)', borderRadius: '12px', border: '1px solid rgba(212,168,67,0.3)',
      }}>
        <img src={declaredRole.image} alt={declaredRole.name} style={{ width: '120px', borderRadius: '8px', marginBottom: '0.5rem' }} />
        <h3 style={{ color: '#d4a843', marginBottom: '0.3rem' }}>{declaredRole.name}</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', maxWidth: '300px' }}>{declaredRole.description}</p>
      </div>

      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Voti: {votedCount}/{otherCount}
      </div>

      {isActive ? (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
          In attesa che gli altri decidano se contestare...
        </p>
      ) : alreadyVoted ? (
        <p style={{ color: '#d4a843' }}>✓ Hai votato. In attesa degli altri...</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => onVote(true)} style={{
            padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
            background: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer',
          }}>
            ⚔️ Contesta (1🪙)
          </button>
          <button onClick={() => onVote(false)} style={{
            padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
            background: '#666', border: 'none', borderRadius: '10px', cursor: 'pointer',
          }}>
            ✋ Passa
          </button>
        </div>
      )}

      {/* Show who has voted */}
      {state.challenges.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {state.challenges.map(c => {
            const p = state.players.find(pl => pl.id === c.playerId)!;
            return (
              <span key={c.playerId} style={{
                padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
                background: c.challenged ? 'rgba(239,68,68,0.2)' : 'rgba(100,100,100,0.2)',
                color: c.challenged ? '#ef4444' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${c.challenged ? 'rgba(239,68,68,0.3)' : 'rgba(100,100,100,0.3)'}`,
              }}>
                {p.name}: {c.challenged ? '⚔️' : '✋'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
