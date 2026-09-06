import React, { useState } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { getCardImage } from '../missions';

interface Props {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onSelect: (cards: number[]) => void;
}

export default function PiliPiliForeheadSelect({ state, myPlayer, onSelect }: Props) {
  const count = state.currentMission?.foreheadCount || 1;
  const [selected, setSelected] = useState<number[]>([]);
  const done = !!state.foreheadSelectDone[myPlayer.id];

  const toggle = (c: number) => {
    if (done) return;
    if (selected.includes(c)) setSelected(selected.filter(x => x !== c));
    else if (selected.length < count) setSelected([...selected, c]);
  };

  const submitted = Object.keys(state.foreheadSelectDone).length;

  // Show other players' revealed cards
  const othersRevealed = Object.entries(state.foreheadRevealed).filter(([id]) => id !== myPlayer.id);

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🙈 Carte sulla Fronte</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Scegli {count} carta{count > 1 ? 'e' : ''} da mostrare a tutti gli altri giocatori.
      </p>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        Le altre carte resteranno coperte e si giocano normalmente.
      </p>

      {!done ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {myPlayer.hand.map((card, i) => {
              const isSel = selected.includes(card);
              return (
                <button key={i} onClick={() => toggle(card)} style={{
                  padding: 0, border: 'none', background: 'none', cursor: 'pointer',
                  transform: isSel ? 'translateY(-12px) scale(1.05)' : 'none', transition: 'transform 0.2s',
                }}>
                  <img src={getCardImage(card)} alt={`${card}`} style={{
                    width: '70px', height: 'auto', borderRadius: '6px',
                    border: isSel ? '3px solid #ea580c' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isSel ? '0 8px 24px rgba(234,88,12,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                  }} />
                </button>
              );
            })}
          </div>
          <button onClick={() => { if (selected.length === count) onSelect(selected); }}
            disabled={selected.length !== count}
            style={{
              padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
              background: selected.length === count ? 'linear-gradient(135deg, #ea580c, #dc2626)' : 'rgba(100,100,100,0.3)',
              border: 'none', borderRadius: '10px', cursor: selected.length === count ? 'pointer' : 'not-allowed',
              opacity: selected.length === count ? 1 : 0.5,
            }}>
            Conferma ({selected.length}/{count})
          </button>
        </>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', padding: '2rem' }}>
          ✅ Carte scelte! In attesa degli altri...
        </div>
      )}

      {/* Show others' revealed cards */}
      {othersRevealed.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem' }}>Carte visibili degli altri:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {othersRevealed.map(([pid, cards]) => {
              const name = state.players.find(p => p.id === pid)?.name || '';
              return (
                <div key={pid} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>{name}</div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {cards.map((c, i) => (
                      <img key={i} src={getCardImage(c)} alt={`${c}`} style={{
                        width: '50px', height: 'auto', borderRadius: '4px',
                        border: '2px solid #fbbf24', boxShadow: '0 2px 8px rgba(251,191,36,0.3)',
                      }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        {submitted}/{state.players.length} giocatori pronti
      </div>
    </div>
  );
}
