import React from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';

interface Props {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onSelect: (targetId: string) => void;
}

export default function PiliPiliTransferSelect({ state, myPlayer, onSelect }: Props) {
  const done = !!state.piliTransferTargets[myPlayer.id];
  const submitted = Object.keys(state.piliTransferTargets).length;

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔗 Scegli un Giocatore</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {state.currentMission?.name}
      </p>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Alla fine del round, guadagnerai i tuoi Pili + i Pili guadagnati dal giocatore scelto!
      </p>

      {!done ? (
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {state.players.map(p => (
            <button key={p.id} onClick={() => onSelect(p.id)}
              style={{
                padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
                background: p.id === myPlayer.id
                  ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                  : 'linear-gradient(135deg, #ea580c, #dc2626)',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                minWidth: '100px',
              }}>
              {p.name} {p.id === myPlayer.id ? '(Tu)' : ''}
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>🌶️ {p.pilis}</div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', padding: '2rem' }}>
          ✅ Giocatore scelto! In attesa degli altri...
        </div>
      )}

      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        {submitted}/{state.players.length} giocatori pronti
      </div>
    </div>
  );
}
