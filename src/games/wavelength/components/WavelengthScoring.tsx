import React from 'react';
import type { WavelengthState } from '../types';

// Calibrated values — DO NOT MODIFY
const CX = 0.4974;
const CY = 0.7451;

// Image paths
const ARC_IMG = '/Wavelenght/Arco (giocatore di turno)/Arco_wavelenght.png';
const FASCIA_IMG = '/Wavelenght/Arco (giocatore di turno)/fascia_punteggi.png';

interface WavelengthScoringProps {
  state: WavelengthState;
  isHost: boolean;
  onNextRound: () => void;
}

/** Map score → color for the guess dots */
function scoreColor(score: number): string {
  if (score === 4) return '#22c55e';
  if (score === 3) return '#84cc16';
  if (score === 2) return '#eab308';
  return '#ef4444';
}

export default function WavelengthScoring({ state, isHost, onNextRound }: WavelengthScoringProps) {
  const activePlayer = state.players.find(p => p.id === state.activePlayerId);
  const sortedPlayers = [...state.players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-md">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
        <h2 style={{ fontWeight: 800 }}>Risultati del Round {state.roundNumber}</h2>
      </div>

      {/* Word pair */}
      <div className="glass-panel p-md mb-md" style={{ maxWidth: '600px', margin: '0 auto 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa' }}>
              {state.currentPair!.extreme1}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>↔</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>
              {state.currentPair!.extreme2}
            </span>
          </div>
        </div>
        <div className="text-center mt-sm">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Indizio: <strong style={{ color: '#000000' }}>"{state.clue}"</strong>
          </span>
        </div>
      </div>

      {/* Arc with scoring zones revealed + guess dots */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 800, userSelect: 'none', margin: '0 auto' }}>
        <img src={ARC_IMG} alt="" draggable={false}
             style={{ width: '100%', display: 'block' }} />

        {/* Scoring band */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                      clipPath: `inset(0 0 ${(1 - CY) * 100}% 0)` }}>
          {[0, 180, -180].map(extra => (
            <img key={extra} src={FASCIA_IMG} alt="" draggable={false}
                 style={{
                   position: 'absolute', inset: 0, width: '100%', height: '100%', maxWidth: 'none',
                   transformOrigin: `${CX * 100}% ${CY * 100}%`,
                   transform: `rotate(${state.targetAngle! - 90 + extra}deg)`,
                   pointerEvents: 'none',
                 }} />
          ))}
        </div>

        {/* Guess markers */}
        {state.guesses.map((g, i) => {
          const rad = (g.angle) * Math.PI / 180;
          // Position on the arc: 0° = left, 180° = right
          const radius = 0.38; // fraction of container width
          const x = CX - radius * Math.cos(rad);
          const y = CY - radius * Math.sin(rad);
          const player = state.players.find(p => p.id === g.playerId);
          return (
            <div key={g.playerId} style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              textAlign: 'center',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: scoreColor(g.score),
                border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}>
                {g.score}
              </div>
              <div style={{
                fontSize: '0.6rem', color: 'white', fontWeight: 700,
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap', marginTop: '2px',
              }}>
                {player?.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Round scores */}
      <div className="glass-panel p-md mt-md" style={{ maxWidth: '500px', margin: '1rem auto' }}>
        <h3 style={{ marginBottom: '0.75rem', textAlign: 'center' }}>Punteggi del Round</h3>

        {/* Active player score */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ fontWeight: 700 }}>
            🎭 {activePlayer?.name} <span className="text-muted" style={{ fontSize: '0.8rem' }}>(attivo)</span>
          </span>
          <span style={{
            fontWeight: 800,
            color: state.activePlayerScore > 0 ? '#22c55e' : '#ef4444',
          }}>
            +{state.activePlayerScore}
          </span>
        </div>

        {/* Guessing players scores */}
        {state.guesses.map(g => {
          const player = state.players.find(p => p.id === g.playerId);
          return (
            <div key={g.playerId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span>{player?.name}</span>
              <span style={{ fontWeight: 800, color: scoreColor(g.score) }}>
                +{g.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* Overall standings */}
      <div className="glass-panel p-md" style={{ maxWidth: '500px', margin: '1rem auto' }}>
        <h3 style={{ marginBottom: '0.75rem', textAlign: 'center' }}>🏆 Classifica</h3>
        {sortedPlayers.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span>
              <span style={{ fontWeight: 800, marginRight: '0.5rem', color: i === 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                {i + 1}.
              </span>
              {p.name}
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              {p.totalScore} <span className="text-muted" style={{ fontSize: '0.8rem' }}>/ {state.winScore}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Next round button */}
      {isHost && (
        <div style={{ maxWidth: '400px', margin: '1.5rem auto 0', textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.1rem' }}
            onClick={onNextRound}
          >
            ▶ Prossimo Round
          </button>
        </div>
      )}
    </div>
  );
}
