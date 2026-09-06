import React, { useState, useEffect, useRef } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { isBetValid } from '../gameLogic';
import { getCardImage, getCardBack } from '../missions';

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
  const [cardsHidden, setCardsHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forcedRef = useRef(false);

  // Timer for timed missions (19, 32): 4 seconds, no delay
  useEffect(() => {
    if (!isTimedMode || !state.timedBetSeconds) return;
    forcedRef.current = false;

    // Start timer immediately (with 2s delay from game hook was removed, now we do it with 0 delay and the timer IS the view time)
    setTimer(state.timedBetSeconds);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCardsHidden(true);
          if (!forcedRef.current) { forcedRef.current = true; onForceBets(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimedMode, state.timedBetSeconds]);

  // For blindAfterView: hide cards when timer expires
  useEffect(() => {
    if (state.currentMission?.blindAfterView && timer === 0) setCardsHidden(true);
  }, [timer, state.currentMission?.blindAfterView]);

  const handleBet = (v: number) => {
    if (!alreadyBet) {
      // noCopyBet check
      if (state.currentMission?.noCopyBet && state.previousBetValue !== null && v === state.previousBetValue) return;
      if (isBetValid(v, 0, false, state.totalTricks, state.currentMission)) onBet(v);
    }
  };

  const isBetDisabled = (v: number) => {
    if (state.currentMission?.noZeroBet && v === 0) return true;
    if (state.currentMission?.noOneBet && v === 1) return true;
    if (state.currentMission?.noCopyBet && state.previousBetValue !== null && v === state.previousBetValue) return true;
    return false;
  };

  return (
    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Fase di Scommessa</h2>

      {/* Timer for timed missions */}
      {isTimedMode && (
        <div style={{ marginBottom: '1rem' }}>
          {timer !== null && timer > 0 ? (
            <div style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 20px rgba(239,68,68,0.5)', animation: 'pulse 1s infinite' }}>
              ⏱️ {timer}s
            </div>
          ) : timer === 0 ? (
            <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 700 }}>⏰ Tempo scaduto!</div>
          ) : null}
        </div>
      )}

      {/* Show my hand */}
      {state.currentMission?.foreheadCards ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ border: '1px solid #ea580c', borderRadius: '8px', display: 'inline-block', padding: '1rem', marginBottom: '0.5rem' }}>
            🙈 Le tue carte sulla fronte sono visibili solo agli altri!
          </div>
          {/* Show non-forehead cards (hidden ones the player CAN see) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {myPlayer.hand.map((card, i) => {
              const isRevealed = (state.foreheadRevealed[myPlayer.id] || []).includes(card);
              return (
                <img key={i}
                  src={isRevealed ? getCardBack() : getCardImage(card)}
                  alt={isRevealed ? 'Fronte' : `${card}`}
                  style={{
                    width: '55px', height: 'auto', borderRadius: '5px',
                    border: isRevealed ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.3)', opacity: isRevealed ? 0.6 : 1,
                  }} />
              );
            })}
          </div>
          {/* Show OTHER players' forehead cards */}
          {Object.entries(state.foreheadRevealed).filter(([id]) => id !== myPlayer.id).length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.5rem' }}>Carte visibili degli altri:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
                {Object.entries(state.foreheadRevealed).filter(([id]) => id !== myPlayer.id).map(([pid, cards]) => (
                  <div key={pid} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.2rem' }}>{state.players.find(p => p.id === pid)?.name}</div>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      {cards.map((c, i) => <img key={i} src={getCardImage(c)} alt={`${c}`} style={{ width: '45px', borderRadius: '4px', border: '1px solid #fbbf24' }} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : cardsHidden ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {myPlayer.hand.map((_, i) => (
            <img key={i} src={getCardBack()} alt="Coperta" style={{ width: '55px', height: 'auto', borderRadius: '5px', boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {myPlayer.hand.map((card, i) => (
            <img key={i} src={getCardImage(card)} alt={`${card}`} style={{
              width: myPlayer.hand.length > 6 ? '50px' : '62px', height: 'auto', borderRadius: '5px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>
      )}

      {/* Open hands: show all players' cards (missions 13, 27) */}
      {state.currentMission?.openHands && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.5rem' }}>📖 Carte di tutti i giocatori:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
            {state.players.filter(p => p.id !== myPlayer.id).map(p => (
              <div key={p.id} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.4rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.2rem' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {p.hand.map((c, i) => <img key={i} src={getCardImage(c)} alt={`${c}`} style={{ width: '40px', borderRadius: '3px' }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bets overview */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem', background: 'rgba(255,237,213,0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.8rem' }}>Scommesse:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {state.players.map(p => {
            const isCurrent = !isTimedMode && p.id === state.currentTurnId;
            return (
              <div key={p.id} style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                background: isCurrent ? 'rgba(234,88,12,0.2)' : 'rgba(255,255,255,0.05)',
                border: isCurrent ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                <div style={{ fontSize: '1.3rem', color: '#ea580c', fontWeight: 700 }}>{p.bet !== null ? p.bet : '?'}</div>
              </div>
            );
          })}
        </div>

        {!alreadyBet && isMyTurn ? (
          <div>
            <h4 style={{ marginBottom: '0.8rem' }}>Fai la tua scommessa (0 - {state.totalTricks}):</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {Array.from({ length: state.totalTricks + 1 }).map((_, i) => {
                const disabled = isBetDisabled(i);
                return (
                  <button key={i} disabled={disabled} onClick={() => handleBet(i)} style={{
                    width: '48px', height: '48px', padding: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff',
                    background: !disabled ? 'linear-gradient(135deg, #ea580c, #dc2626)' : 'rgba(100,100,100,0.3)',
                    border: 'none', borderRadius: '10px', cursor: !disabled ? 'pointer' : 'not-allowed', opacity: !disabled ? 1 : 0.4,
                  }}>
                    {i}
                  </button>
                );
              })}
            </div>
            {state.currentMission?.noZeroBet && <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere 0!</p>}
            {state.currentMission?.noOneBet && <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere 1!</p>}
            {state.currentMission?.noCopyBet && state.previousBetValue !== null && (
              <p style={{ marginTop: '0.3rem', color: '#ea580c', fontSize: '0.85rem' }}>⚠️ Non puoi scommettere {state.previousBetValue} (uguale al precedente)!</p>
            )}
          </div>
        ) : alreadyBet ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>✅ Hai scommesso {myPlayer.bet}! In attesa degli altri...</div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>In attesa che {state.players.find(p => p.id === state.currentTurnId)?.name} scommetta...</div>
        )}
      </div>
    </div>
  );
}
