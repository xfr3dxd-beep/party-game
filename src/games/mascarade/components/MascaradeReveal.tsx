import React from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getRoleById } from '../roles';

interface Props {
  state: MascaradeState;
  isHost: boolean;
  onResolve: () => void;
}

export default function MascaradeReveal({ state, isHost, onResolve }: Props) {
  const activePlayer = state.players.find(p => p.seatIndex === state.turnIndex)!;
  const declaredRole = getRoleById(state.declaredRoleId!);
  const revealEntries = Object.entries(state.revealedCards);
  const holder = revealEntries.find(([_, rId]) => rId === state.declaredRoleId);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>⚔️ Contestazione!</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', textAlign: 'center' }}>
        {activePlayer.name} ha dichiarato <strong style={{ color: '#d4a843' }}>{declaredRole.name}</strong>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {revealEntries.map(([pId, roleId]) => {
          const player = state.players.find(p => p.id === pId)!;
          const role = getRoleById(roleId);
          const isHolder = roleId === state.declaredRoleId;
          return (
            <div key={pId} style={{
              textAlign: 'center', padding: '0.8rem', borderRadius: '12px',
              background: isHolder ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.05)',
              border: isHolder ? '2px solid #d4a843' : '1px solid rgba(255,255,255,0.1)',
            }}>
              <img src={role.image} alt={role.name} style={{ width: '80px', borderRadius: '6px', marginBottom: '0.3rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isHolder ? '#d4a843' : '#fff' }}>{player.name}</div>
              <div style={{ fontSize: '0.7rem', color: isHolder ? '#d4a843' : 'rgba(255,255,255,0.5)' }}>{role.name}</div>
              {isHolder && <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '0.2rem' }}>✓ Ha il ruolo! +🪙 effetto attivo</div>}
            </div>
          );
        })}
      </div>

      {holder ? (
        <p style={{ color: '#22c55e', textAlign: 'center', marginBottom: '1rem' }}>
          🎉 {state.players.find(p => p.id === holder[0])?.name} ha il ruolo e usa l'effetto!
        </p>
      ) : (
        <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>
          ❌ Nessuno ha {declaredRole.name}. Nessun effetto!
        </p>
      )}

      {isHost && (
        <button onClick={onResolve} style={{
          padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
          background: '#d4a843', border: 'none', borderRadius: '10px', cursor: 'pointer',
        }}>
          Continua →
        </button>
      )}
    </div>
  );
}
