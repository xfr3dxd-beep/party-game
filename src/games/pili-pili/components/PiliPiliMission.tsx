import React from 'react';
import { Mission, PiliPiliState } from '../types';

interface PiliPiliMissionProps {
  mission: Mission | null;
  state: PiliPiliState;
  isHost: boolean;
  onProceed: () => void;
  onAutoProceedTimed: () => void;
}

export default function PiliPiliMission({ mission, state, isHost, onProceed, onAutoProceedTimed }: PiliPiliMissionProps) {
  if (!mission) return null;

  const isTimed = !!mission.timedView;
  const isSpicy = state.spicyMode;
  const drawnMissions = state.drawnMissions || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '1rem' }}>
      {isSpicy && drawnMissions.length > 1 ? (
        <>
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '1.6rem' }}>
            🌶️ Spicy Round! — {drawnMissions.length} Missioni
          </h2>

          {/* Show all drawn mission cards */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {drawnMissions.map((m, i) => (
              <div key={i} style={{ textAlign: 'center', maxWidth: '200px' }}>
                <div style={{
                  borderRadius: '12px', overflow: 'hidden',
                  boxShadow: '0 6px 24px rgba(239, 68, 68, 0.4)',
                  border: '2px solid rgba(239, 68, 68, 0.5)', marginBottom: '0.5rem',
                }}>
                  <img src={m.image} alt={m.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem', color: '#fbbf24' }}>#{m.id} {m.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.description}</p>
              </div>
            ))}
          </div>

          {/* Merged effects summary */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px', padding: '0.8rem 1.2rem', marginBottom: '1rem', maxWidth: '450px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.3rem' }}>Effetti combinati:</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              🃏 {mission.cardsPerPlayer} carte a testa
              {mission.noZeroBet && ' • ❌ No scommessa 0'}
              {mission.noOneBet && ' • ❌ No scommessa 1'}
              {mission.noCopyBet && ' • ❌ No copiare scommessa'}
              {mission.swapDirection && ` • 🔄 Scambio ${mission.swapCount === -1 ? 'tutte' : mission.swapCount} carte a ${mission.swapDirection === 'left' ? 'sinistra' : 'destra'}`}
              {mission.invertWinner && ' • 🔃 Carta più bassa vince'}
              {mission.simultaneousPlay && ' • ⚡ Giocata simultanea'}
              {mission.mustPlayHighLow && ' • 📐 Solo carta più alta/bassa'}
              {mission.penaltyFirstLast && ' • ⚠️ Penalità prima/ultima presa'}
              {mission.penaltyRange && ` • ⚠️ Penalità carte ${mission.penaltyRange[0]}-${mission.penaltyRange[1]}`}
              {mission.bonusPrecise && ' • ⭐ Bonus scommessa esatta'}
              {mission.openHands && ' • 👁️ Carte scoperte'}
              {mission.timedView && ` • ⏱️ ${mission.timedView}s per guardare`}
              {mission.foreheadCards && ` • 🙈 ${mission.foreheadCount} carta/e sulla fronte`}
              {mission.drawAfterBet && ` • 📥 Pesca ${mission.drawAfterBet} carta/e`}
              {mission.transferPili && ' • 🔗 Trasferimento Pili'}
              {mission.swapAfterTrick && ' • 🔄 Scambio dopo presa'}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ color: isSpicy ? '#ef4444' : '#ea580c', marginBottom: '1rem', fontSize: '1.6rem' }}>
            {isSpicy ? '🌶️' : '🎴'} Missione #{mission.id}
          </h2>

          <div style={{
            borderRadius: '16px', overflow: 'hidden',
            boxShadow: `0 8px 32px rgba(${isSpicy ? '239, 68, 68' : '234, 88, 12'}, 0.4), 0 0 60px rgba(${isSpicy ? '239, 68, 68' : '234, 88, 12'}, 0.15)`,
            maxWidth: '320px', width: '100%', marginBottom: '1.5rem',
            border: `2px solid rgba(${isSpicy ? '239, 68, 68' : '234, 88, 12'}, 0.5)`,
          }}>
            <img src={mission.image} alt={mission.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>{mission.name}</h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.5, textAlign: 'center', maxWidth: '400px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {mission.description}
          </p>
        </>
      )}

      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        🃏 {mission.cardsPerPlayer} carte a testa
        {isTimed && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>⏱️ {mission.timedView}s per guardare</span>}
      </div>

      {isHost ? (
        isTimed ? (
          <button onClick={onAutoProceedTimed} style={{
            padding: '0.8rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none', borderRadius: '12px', cursor: 'pointer',
          }}>
            ⏱️ Inizia Timer Scommesse →
          </button>
        ) : (
          <button onClick={onProceed} style={{
            padding: '0.8rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#fff',
            background: isSpicy ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #ea580c, #dc2626)',
            border: 'none', borderRadius: '12px', cursor: 'pointer',
          }}>
            Inizia Scommesse →
          </button>
        )
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}><em>In attesa dell'host...</em></div>
      )}
    </div>
  );
}
