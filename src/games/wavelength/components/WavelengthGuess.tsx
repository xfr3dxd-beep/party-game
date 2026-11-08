import React, { useRef, useState } from 'react';
import type { WavelengthState } from '../types';

// Calibrated values — DO NOT MODIFY
const CX = 0.4974;
const CY = 0.7451;
const SCALA = 0.1076;
const PERNO = { x: 0.4988, y: 0.8328 };

// Image paths
const ARC_IMG = '/Wavelenght/Arco (giocatori non di turno)/Arco_wavelenght.png';
const ARROW_IMG = '/Wavelenght/Arco (giocatori non di turno)/freccia_nuova_trasparente.png';

interface WavelengthGuessProps {
  state: WavelengthState;
  playerId: string;
  onSubmitGuess: (angle: number) => void;
}

export default function WavelengthGuess({ state, playerId, onSubmitGuess }: WavelengthGuessProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [angolo, setAngolo] = useState(90);
  const [bloccato, setBloccato] = useState(false);

  const hasGuessed = state.guesses.some(g => g.playerId === playerId);
  const activePlayer = state.players.find(p => p.id === state.activePlayerId);
  const totalGuessers = state.players.filter(p => p.id !== state.activePlayerId).length;
  const guessCount = state.guesses.length;

  function aggiorna(e: React.PointerEvent) {
    if (bloccato || hasGuessed) return;
    const r = ref.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + CX * r.width);
    const dy = (r.top + CY * r.height) - e.clientY;
    const g = 180 - Math.atan2(dy, dx) * 180 / Math.PI;
    setAngolo(Math.min(Math.max(g, 0), 180));
  }

  // Waiting state: active player is still writing clue
  if (state.phase === 'active-player') {
    return (
      <div className="animate-fade-in text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{ fontWeight: 800 }}>
          {activePlayer?.name || 'Il giocatore attivo'} sta scegliendo...
        </h2>
        <p className="text-muted">Attendi che il giocatore attivo scelga la coppia e scriva l'indizio.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Word pair display */}
      <div className="glass-panel p-md mb-md" style={{ maxWidth: '600px', margin: '0 auto 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>
              {state.currentPair!.extreme1}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>↔</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>
              {state.currentPair!.extreme2}
            </span>
          </div>
        </div>
      </div>

      {/* Clue from active player */}
      <div className="text-center mb-md">
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Indizio di {activePlayer?.name}:</span>
        <div style={{
          fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem',
          color: '#000000',
        }}>
          "{state.clue}"
        </div>
      </div>

      {/* Arc with movable arrow (NO scoring zones) */}
      {!hasGuessed ? (
        <>
          <div
            ref={ref}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); aggiorna(e); }}
            onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) aggiorna(e); }}
            style={{
              position: 'relative', width: '100%', maxWidth: 800,
              containerType: 'inline-size', touchAction: 'none', userSelect: 'none',
              margin: '0 auto',
            }}
          >
            <img src={ARC_IMG} alt="" draggable={false}
                 style={{ width: '100%', display: 'block' }} />

            <div style={{
              position: 'absolute', left: `${CX * 100}%`, top: `${CY * 100}%`,
              width: 0, height: 0, transform: `rotate(${angolo - 90}deg)`,
            }}>
              <img src={ARROW_IMG} alt="" draggable={false}
                   style={{
                     position: 'absolute', left: 0, top: 0,
                     width: `${SCALA * 100}cqw`, maxWidth: 'none',
                     transform: `translate(${-PERNO.x * 100}%, ${-PERNO.y * 100}%)`,
                     pointerEvents: 'none',
                   }} />
            </div>
          </div>

          <div style={{ maxWidth: '400px', margin: '1rem auto 0', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem' }}
              disabled={bloccato}
              onClick={() => {
                setBloccato(true);
                onSubmitGuess(angolo);
              }}
            >
              ✅ Conferma Posizione
            </button>
          </div>
        </>
      ) : (
        <div className="text-center" style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ color: 'var(--accent-green-light)' }}>Hai confermato la tua scelta!</h3>
          <p className="text-muted">
            In attesa degli altri giocatori... ({guessCount}/{totalGuessers})
          </p>

          {/* Show who has guessed */}
          <div style={{ marginTop: '1rem', maxWidth: '300px', margin: '1rem auto' }}>
            {state.players.filter(p => p.id !== state.activePlayerId).map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem',
              }}>
                <span>{p.name}</span>
                <span>{state.guesses.some(g => g.playerId === p.id) ? '✓' : '...'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
