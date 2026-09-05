import React from 'react';
import { PiliPiliState } from '../types';
import { getCardImage } from '../missions';

interface PiliPiliTrickResultProps {
  state: PiliPiliState;
  isHost: boolean;
  onDismiss: () => void;
}

export default function PiliPiliTrickResult({ state, isHost, onDismiss }: PiliPiliTrickResultProps) {
  const winnerName = state.players.find(p => p.id === state.lastTrickWinnerId)?.name || '';

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', padding: '1rem',
      backgroundImage: 'url("/Pili Pili/Table Game/Table Game.jpg")',
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: '16px', margin: '-1rem', position: 'relative',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%',
        textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
          🏆 Presa {state.trickNumber}/{state.totalTricks}
        </h2>
        <p style={{ color: '#ea580c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          {winnerName} vince!
        </p>

        {/* All played cards with player names */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {state.lastTrickCards.map((played, i) => {
            const playerName = state.players.find(p => p.id === played.playerId)?.name || '';
            const isWinner = played.playerId === state.lastTrickWinnerId;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.8rem', marginBottom: '0.4rem',
                  color: isWinner ? '#fbbf24' : 'rgba(255,255,255,0.7)',
                  fontWeight: isWinner ? 700 : 400,
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}>
                  {playerName} {isWinner ? '👑' : ''}
                </div>
                <img
                  src={getCardImage(played.card)}
                  alt={`Carta ${played.card}`}
                  style={{
                    width: '80px', height: 'auto', borderRadius: '8px',
                    border: isWinner ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: isWinner ? '0 0 20px rgba(251, 191, 36, 0.5)' : '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Extra penalty info */}
        {state.currentMission?.penaltyFirstLast && (state.trickNumber === 1 || state.trickNumber === state.totalTricks) && (
          <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            ⚠️ {winnerName} riceve un Pili extra (prima/ultima presa)!
          </p>
        )}
        {state.currentMission?.penaltyRange && (() => {
          const [lo, hi] = state.currentMission.penaltyRange!;
          const winCard = state.lastTrickCards.find(c => c.playerId === state.lastTrickWinnerId)?.card || 0;
          if (winCard >= lo && winCard <= hi) {
            return (
              <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                ⚠️ {winnerName} riceve un Pili extra (carta {winCard} nel range {lo}-{hi})!
              </p>
            );
          }
          return null;
        })()}

        {isHost ? (
          <button
            onClick={onDismiss}
            style={{
              padding: '0.7rem 2rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
              background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
            }}
          >
            {state.trickNumber >= state.totalTricks ? 'Vedi Risultati' : 'Prossima Presa →'}
          </button>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In attesa dell'host...</p>
        )}
      </div>
    </div>
  );
}
