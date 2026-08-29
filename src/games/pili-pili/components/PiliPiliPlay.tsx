import React from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';

interface PiliPiliPlayProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onPlayCard: (card: number) => void;
}

export default function PiliPiliPlay({ state, myPlayer, onPlayCard }: PiliPiliPlayProps) {
  const isMyTurn = state.currentTurnId === myPlayer.id;

  const getCardColor = (value: number) => {
    if (value === 56) return 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)';
    return 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)';
  };

  return (
    <div className="animate-fade-in flex flex-col h-full" style={{ minHeight: '70vh' }}>
      
      {/* Top area - Other players info */}
      <div className="mb-md" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {state.players.map(p => {
          const isTurn = state.currentTurnId === p.id;
          return (
            <div key={p.id} className="p-sm" style={{ 
              background: isTurn ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255,255,255,0.05)',
              borderRadius: '8px', 
              border: isTurn ? '1px solid #ea580c' : '1px solid transparent',
              textAlign: 'center', minWidth: '100px'
            }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Scom: <strong style={{color: '#ea580c'}}>{p.bet}</strong> | Pres: <strong>{p.tricksWon}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>🌶️ {p.pilis}</div>
            </div>
          );
        })}
      </div>

      {/* Middle area - Play field */}
      <div className="flex-1 flex flex-col items-center justify-center p-xl mb-md glass-panel" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="mb-lg" style={{ color: '#ea580c' }}>Tavolo</h3>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', minHeight: '150px', alignItems: 'center' }}>
          {state.currentTrick.map((played, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                {state.players.find(p => p.id === played.playerId)?.name}
              </div>
              <div style={{
                width: '80px', height: '120px', 
                background: getCardColor(played.card),
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 'bold', color: 'white',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                {played.card === 56 ? 'J' : played.card}
              </div>
            </div>
          ))}
          {state.currentTrick.length === 0 && (
            <div className="text-muted" style={{ fontStyle: 'italic' }}>Tavolo vuoto</div>
          )}
        </div>
        
        <div className="mt-xl text-center">
          {isMyTurn ? (
            <div style={{ color: '#ea580c', fontSize: '1.2rem', fontWeight: 600 }}>È il tuo turno! Gioca una carta.</div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              Turno di {state.players.find(p => p.id === state.currentTurnId)?.name}...
            </div>
          )}
        </div>
      </div>

      {/* Bottom area - My hand */}
      <div className="text-center">
        <h4 className="mb-sm">Le tue carte:</h4>
        <div className="pili-hand" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {myPlayer.hand.map((card, i) => (
            <button
              key={i}
              onClick={() => {
                if (isMyTurn) onPlayCard(card);
              }}
              disabled={!isMyTurn}
              style={{
                width: '70px', height: '100px', 
                background: getCardColor(card),
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: 'none',
                cursor: isMyTurn ? 'pointer' : 'default',
                transform: isMyTurn ? 'translateY(-10px)' : 'none',
                transition: 'transform 0.2s',
                opacity: isMyTurn ? 1 : 0.8
              }}
            >
              {card === 56 ? 'J' : card}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}
