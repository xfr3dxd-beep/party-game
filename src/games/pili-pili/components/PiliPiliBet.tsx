import React, { useState } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { isBetValid } from '../gameLogic';

interface PiliPiliBetProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onBet: (bet: number) => void;
}

export default function PiliPiliBet({ state, myPlayer, onBet }: PiliPiliBetProps) {
  const isMyTurn = state.currentTurnId === myPlayer.id;
  
  // Calculate total bets so far
  const totalBets = state.players.reduce((sum, p) => sum + (p.bet || 0), 0);
  
  // Check if I am the last to bet
  const bettersSoFar = state.players.filter(p => p.bet !== null).length;
  const isLastToBet = bettersSoFar === state.players.length - 1;

  const handleBetClick = (betValue: number) => {
    if (isMyTurn && isBetValid(betValue, totalBets, isLastToBet, state.totalTricks)) {
      onBet(betValue);
    }
  };

  const getCardColor = (value: number) => {
    if (value === 56) return 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)';
    return 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)';
  };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="mb-sm">Fase di Scommessa</h2>
      <p className="text-muted mb-lg">Quante prese farai?</p>
      
      {state.currentMission?.blindBet ? (
        <div className="mb-lg p-md" style={{ border: '1px solid #ea580c', borderRadius: '8px', display: 'inline-block' }}>
          Scommessa alla cieca! Le tue carte sono nascoste.
        </div>
      ) : (
        <div className="pili-hand mb-xl" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {myPlayer.hand.map((card, i) => (
            <div key={i} style={{
              width: '60px', height: '90px', 
              background: getCardColor(card),
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 'bold', color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {card === 56 ? 'J' : card}
            </div>
          ))}
        </div>
      )}
      
      <div className="glass-panel p-lg mb-xl" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255, 237, 213, 0.05)' }}>
        <h3 className="mb-md">Scommesse:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {state.players.map(p => (
            <div key={p.id} style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              background: p.id === state.currentTurnId ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255,255,255,0.05)',
              border: p.id === state.currentTurnId ? '1px solid #ea580c' : '1px solid transparent'
            }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '1.2rem', color: '#ea580c' }}>
                {p.bet !== null ? p.bet : '?'}
              </div>
            </div>
          ))}
        </div>
        
        {isMyTurn ? (
          <div>
            <h4 className="mb-md">Fai la tua scommessa (0 - {state.totalTricks}):</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {Array.from({ length: state.totalTricks + 1 }).map((_, i) => {
                const valid = isBetValid(i, totalBets, isLastToBet, state.totalTricks);
                return (
                  <button
                    key={i}
                    className="btn btn-primary"
                    disabled={!valid}
                    onClick={() => handleBetClick(i)}
                    style={{ 
                      width: '50px', height: '50px', padding: 0, 
                      fontSize: '1.2rem',
                      background: valid ? 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' : 'gray',
                      border: 'none',
                      opacity: valid ? 1 : 0.5
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
            {isLastToBet && (
              <p className="mt-sm text-muted" style={{ fontSize: '0.9rem' }}>
                Non puoi scommettere un valore che faccia {state.totalTricks} totali.
              </p>
            )}
          </div>
        ) : (
          <div className="text-muted" style={{ fontSize: '1.2rem' }}>
            In attesa che {state.players.find(p => p.id === state.currentTurnId)?.name} scommetta...
          </div>
        )}
      </div>
    </div>
  );
}
