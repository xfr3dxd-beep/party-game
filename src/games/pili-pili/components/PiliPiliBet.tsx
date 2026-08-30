import React from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { isBetValid } from '../gameLogic';
import { getCardImage } from '../missions';

interface PiliPiliBetProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onBet: (bet: number) => void;
}

export default function PiliPiliBet({ state, myPlayer, onBet }: PiliPiliBetProps) {
  const isMyTurn = state.currentTurnId === myPlayer.id;

  const totalBets = state.players.reduce((sum, p) => sum + (p.bet || 0), 0);
  const bettersSoFar = state.players.filter(p => p.bet !== null).length;
  const isLastToBet = bettersSoFar === state.players.length - 1;

  const handleBetClick = (betValue: number) => {
    if (isMyTurn && isBetValid(betValue, totalBets, isLastToBet, state.totalTricks, state.currentMission)) {
      onBet(betValue);
    }
  };

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Fase di Scommessa</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Quante prese farai?</p>

      {/* Show hand with card images */}
      {state.currentMission?.foreheadCards ? (
        <div style={{ border: '1px solid #ea580c', borderRadius: '8px', display: 'inline-block', padding: '1rem', marginBottom: '1.5rem' }}>
          🙈 Non puoi vedere le tue carte! Sono sulla tua fronte.
        </div>
      ) : state.currentMission?.blindAfterView ? (
        <div style={{ border: '1px solid #ea580c', borderRadius: '8px', display: 'inline-block', padding: '1rem', marginBottom: '1.5rem' }}>
          🙈 Carte nascoste! Dovevi memorizzarle.
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {myPlayer.hand.map((card, i) => (
            <img
              key={i}
              src={getCardImage(card)}
              alt={`Carta ${card}`}
              style={{
                width: myPlayer.hand.length > 6 ? '50px' : '62px',
                height: 'auto',
                borderRadius: '5px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      )}

      {/* Bets overview */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem', background: 'rgba(255, 237, 213, 0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.8rem' }}>Scommesse:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {state.players.map(p => (
            <div key={p.id} style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: p.id === state.currentTurnId ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255,255,255,0.05)',
              border: p.id === state.currentTurnId ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
              <div style={{ fontSize: '1.3rem', color: '#ea580c', fontWeight: 700 }}>
                {p.bet !== null ? p.bet : '?'}
              </div>
            </div>
          ))}
        </div>

        {isMyTurn ? (
          <div>
            <h4 style={{ marginBottom: '0.8rem' }}>Fai la tua scommessa (0 - {state.totalTricks}):</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {Array.from({ length: state.totalTricks + 1 }).map((_, i) => {
                const valid = isBetValid(i, totalBets, isLastToBet, state.totalTricks, state.currentMission);
                return (
                  <button
                    key={i}
                    disabled={!valid}
                    onClick={() => handleBetClick(i)}
                    style={{
                      width: '48px', height: '48px', padding: 0,
                      fontSize: '1.2rem', fontWeight: 700, color: '#fff',
                      background: valid ? 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' : 'rgba(100,100,100,0.3)',
                      border: 'none', borderRadius: '10px',
                      cursor: valid ? 'pointer' : 'not-allowed',
                      opacity: valid ? 1 : 0.4,
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
            {isLastToBet && (
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Il totale delle scommesse non può essere uguale a {state.totalTricks}.
              </p>
            )}
            {state.currentMission?.noZeroBet && (
              <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere 0!</p>
            )}
            {state.currentMission?.noOneBet && (
              <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere 1!</p>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            In attesa che {state.players.find(p => p.id === state.currentTurnId)?.name} scommetta...
          </div>
        )}
      </div>
    </div>
  );
}
