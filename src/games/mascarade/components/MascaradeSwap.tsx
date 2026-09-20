import React from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getCardBack } from '../roles';

interface Props {
  state: MascaradeState;
  myPlayer: MascaradePlayer;
  onDecide: (didSwap: boolean) => void;
}

export default function MascaradeSwap({ state, myPlayer, onDecide }: Props) {
  const activePlayer = state.players.find(p => p.seatIndex === state.turnIndex)!;
  const target = state.players.find(p => p.id === state.swapTargetId)!;
  const isActivePlayer = myPlayer.id === activePlayer.id;

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#d4a843', marginBottom: '1rem' }}>🔄 Scambio</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', textAlign: 'center' }}>
        {activePlayer.name} scambia (o finge) con {target.name}
      </p>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={getCardBack()} alt="card" style={{ width: '100px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }} />
          <div style={{ color: '#d4a843', fontSize: '0.85rem', marginTop: '0.3rem' }}>{activePlayer.name}</div>
        </div>
        <div style={{ fontSize: '2rem', color: '#d4a843' }}>⇄</div>
        <div style={{ textAlign: 'center' }}>
          <img src={getCardBack()} alt="card" style={{ width: '100px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }} />
          <div style={{ color: '#d4a843', fontSize: '0.85rem', marginTop: '0.3rem' }}>{target.name}</div>
        </div>
      </div>

      {isActivePlayer ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => onDecide(true)} style={{
            padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
            background: '#d4a843', border: 'none', borderRadius: '10px', cursor: 'pointer',
          }}>
            🔄 Scambia
          </button>
          <button onClick={() => onDecide(false)} style={{
            padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
            background: '#666', border: 'none', borderRadius: '10px', cursor: 'pointer',
          }}>
            🎭 Fingi
          </button>
        </div>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
          {activePlayer.name} sta decidendo...
        </p>
      )}
    </div>
  );
}
