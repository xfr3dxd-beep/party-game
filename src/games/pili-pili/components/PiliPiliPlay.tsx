import React from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { getCardImage } from '../missions';

interface PiliPiliPlayProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onPlayCard: (card: number) => void;
}

export default function PiliPiliPlay({ state, myPlayer, onPlayCard }: PiliPiliPlayProps) {
  const isMyTurn = state.currentTurnId === myPlayer.id;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>

      {/* Top - Players info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {state.players.map(p => {
          const isTurn = state.currentTurnId === p.id;
          return (
            <div key={p.id} style={{
              background: isTurn ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              border: isTurn ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center', minWidth: '90px', padding: '0.4rem 0.6rem',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                🎯{p.bet} ✅{p.tricksWon}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>🌶️ {p.pilis}</div>
            </div>
          );
        })}
      </div>

      {/* Middle - Play field with cards on table */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '1rem', marginBottom: '1rem',
        background: 'rgba(0,0,0,0.2)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)', minHeight: '200px',
      }}>
        <div style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 600, marginBottom: '0.8rem' }}>
          Presa {state.trickNumber}/{state.totalTricks}
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
          {state.currentTrick.map((played, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                {state.players.find(p => p.id === played.playerId)?.name}
              </div>
              <img
                src={getCardImage(played.card)}
                alt={`Carta ${played.card}`}
                style={{
                  width: '70px', height: 'auto',
                  borderRadius: '6px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
            </div>
          ))}
          {state.currentTrick.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tavolo vuoto</div>
          )}
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isMyTurn ? (
            <div style={{ color: '#ea580c', fontSize: '1.1rem', fontWeight: 600 }}>È il tuo turno! Gioca una carta.</div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              Turno di {state.players.find(p => p.id === state.currentTurnId)?.name}...
            </div>
          )}
        </div>
      </div>

      {/* Bottom - My hand with card images */}
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Le tue carte:</h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {myPlayer.hand.map((card, i) => (
            <button
              key={i}
              onClick={() => { if (isMyTurn) onPlayCard(card); }}
              disabled={!isMyTurn}
              style={{
                padding: 0, border: 'none', background: 'none',
                cursor: isMyTurn ? 'pointer' : 'default',
                transform: isMyTurn ? 'translateY(-6px)' : 'none',
                transition: 'transform 0.2s, filter 0.2s',
                opacity: isMyTurn ? 1 : 0.7,
                filter: isMyTurn ? 'none' : 'grayscale(0.3)',
              }}
            >
              <img
                src={getCardImage(card)}
                alt={`Carta ${card}`}
                style={{
                  width: myPlayer.hand.length > 6 ? '55px' : '68px',
                  height: 'auto',
                  borderRadius: '6px',
                  boxShadow: isMyTurn ? '0 6px 20px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(0,0,0,0.2)',
                  border: isMyTurn ? '2px solid rgba(234, 88, 12, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
