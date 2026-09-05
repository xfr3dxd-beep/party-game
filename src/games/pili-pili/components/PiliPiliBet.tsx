import React, { useState, useEffect, useRef } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { isBetValid } from '../gameLogic';
import { getCardImage } from '../missions';

interface PiliPiliBetProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onBet: (bet: number) => void;
  onForceBets: () => void;
}

export default function PiliPiliBet({ state, myPlayer, onBet, onForceBets }: PiliPiliBetProps) {
  const isTimedMode = state.timedBetting;
  const isMyTurn = isTimedMode ? true : state.currentTurnId === myPlayer.id;
  const alreadyBet = myPlayer.bet !== null;
  const [timer, setTimer] = useState<number | null>(null);
  const [showCards, setShowCards] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forcedRef = useRef(false);

  // Timer logic for timed missions
  useEffect(() => {
    if (!isTimedMode || !state.timedBetSeconds) return;

    // 2 second delay, then start countdown
    const delay = setTimeout(() => {
      setTimer(state.timedBetSeconds);

      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Timer expired — force bets for unbet players
            if (!forcedRef.current) {
              forcedRef.current = true;
              onForceBets();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(delay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimedMode, state.timedBetSeconds]);

  // For blind-after-view: hide cards after timer expires
  useEffect(() => {
    if (state.currentMission?.blindAfterView && timer === 0) {
      setShowCards(false);
    }
  }, [timer, state.currentMission?.blindAfterView]);

  const handleBetClick = (betValue: number) => {
    if (!alreadyBet && isBetValid(betValue, 0, false, state.totalTricks, state.currentMission)) {
      onBet(betValue);
    }
  };

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Fase di Scommessa</h2>

      {/* Timer display for timed missions */}
      {isTimedMode && (
        <div style={{ marginBottom: '1rem' }}>
          {timer === null ? (
            <div style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: 700 }}>
              ⏳ Memorizza le tue carte...
            </div>
          ) : timer > 0 ? (
            <div style={{
              color: '#ef4444', fontSize: '2.5rem', fontWeight: 900,
              textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
              animation: 'pulse 1s infinite',
            }}>
              ⏱️ {timer}s
            </div>
          ) : (
            <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 700 }}>
              ⏰ Tempo scaduto!
            </div>
          )}
        </div>
      )}

      {/* Show hand with card images */}
      {state.currentMission?.foreheadCards ? (
        <div style={{ border: '1px solid #ea580c', borderRadius: '8px', display: 'inline-block', padding: '1rem', marginBottom: '1.5rem' }}>
          🙈 Non puoi vedere le tue carte!
        </div>
      ) : (!showCards || (state.currentMission?.blindAfterView && timer === 0)) ? (
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
                height: 'auto', borderRadius: '5px',
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
          {state.players.map(p => {
            const isCurrent = !isTimedMode && p.id === state.currentTurnId;
            return (
              <div key={p.id} style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                background: isCurrent ? 'rgba(234, 88, 12, 0.2)' : 'rgba(255,255,255,0.05)',
                border: isCurrent ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                <div style={{ fontSize: '1.3rem', color: '#ea580c', fontWeight: 700 }}>
                  {p.bet !== null ? p.bet : '?'}
                </div>
              </div>
            );
          })}
        </div>

        {!alreadyBet && isMyTurn ? (
          <div>
            <h4 style={{ marginBottom: '0.8rem' }}>Fai la tua scommessa (0 - {state.totalTricks}):</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {Array.from({ length: state.totalTricks + 1 }).map((_, i) => {
                const valid = isBetValid(i, 0, false, state.totalTricks, state.currentMission);
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
            {state.currentMission?.noZeroBet && (
              <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere 0!</p>
            )}
            {state.currentMission?.noOneBet && (
              <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere 1!</p>
            )}
          </div>
        ) : alreadyBet ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            ✅ Hai scommesso {myPlayer.bet}! In attesa degli altri...
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
