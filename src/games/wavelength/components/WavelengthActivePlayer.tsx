import React, { useState } from 'react';
import type { WavelengthState } from '../types';

// Calibrated values — DO NOT MODIFY
const CX = 0.4974;
const CY = 0.7451;

// Image paths
const ARC_IMG = '/Wavelenght/Arco (giocatore di turno)/Arco_wavelenght.png';
const FASCIA_IMG = '/Wavelenght/Arco (giocatore di turno)/fascia_punteggi.png';

interface WavelengthActivePlayerProps {
  state: WavelengthState;
  onPickRandomPair: () => void;
  onPickCustomPair: (extreme1: string, extreme2: string) => void;
  onSubmitClue: (clue: string) => void;
  onSkipPair: () => void;
}

function ArcWithScoring({ bersaglio }: { bersaglio: number }) {
  const stileFascia = (extra: number): React.CSSProperties => ({
    position: 'absolute', inset: 0, width: '100%', height: '100%', maxWidth: 'none',
    transformOrigin: `${CX * 100}% ${CY * 100}%`,
    transform: `rotate(${bersaglio - 90 + extra}deg)`,
    pointerEvents: 'none',
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 800, userSelect: 'none', margin: '0 auto' }}>
      <img src={ARC_IMG} alt="" draggable={false}
           style={{ width: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                    clipPath: `inset(0 0 ${(1 - CY) * 100}% 0)` }}>
        <img src={FASCIA_IMG} alt="" draggable={false} style={stileFascia(0)} />
        <img src={FASCIA_IMG} alt="" draggable={false} style={stileFascia(180)} />
        <img src={FASCIA_IMG} alt="" draggable={false} style={stileFascia(-180)} />
      </div>
    </div>
  );
}

export default function WavelengthActivePlayer({
  state,
  onPickRandomPair,
  onPickCustomPair,
  onSubmitClue,
  onSkipPair,
}: WavelengthActivePlayerProps) {
  const [customMode, setCustomMode] = useState(false);
  const [custom1, setCustom1] = useState('');
  const [custom2, setCustom2] = useState('');
  const [clue, setClue] = useState('');

  const hasPair = state.currentPair !== null;
  const hasTarget = state.targetAngle !== null;

  // Step 1: Choose pair
  if (!hasPair) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-lg">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📡</div>
          <h2 style={{ fontWeight: 800 }}>Sei il giocatore attivo!</h2>
          <p className="text-muted">Scegli una coppia di opposti per questo round.</p>
        </div>

        <div className="glass-panel p-lg" style={{ maxWidth: '450px', margin: '0 auto' }}>
          {!customMode ? (
            <>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.75rem', fontSize: '1.1rem' }}
                onClick={onPickRandomPair}
              >
                🎲 Coppia Casuale
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setCustomMode(true)}
              >
                ✏️ Coppia Personalizzata
              </button>
            </>
          ) : (
            <>
              <div className="mb-md">
                <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                  Estremo 1 (es. "Caldo")
                </label>
                <input
                  type="text"
                  className="input"
                  value={custom1}
                  onChange={(e) => setCustom1(e.target.value)}
                  placeholder="Inserisci il primo estremo..."
                  maxLength={60}
                />
              </div>
              <div className="mb-md">
                <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                  Estremo 2 (es. "Freddo")
                </label>
                <input
                  type="text"
                  className="input"
                  value={custom2}
                  onChange={(e) => setCustom2(e.target.value)}
                  placeholder="Inserisci il secondo estremo..."
                  maxLength={60}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.5rem' }}
                onClick={() => {
                  if (custom1.trim() && custom2.trim()) {
                    onPickCustomPair(custom1.trim(), custom2.trim());
                  }
                }}
                disabled={!custom1.trim() || !custom2.trim()}
              >
                ✅ Conferma Coppia
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setCustomMode(false)}
              >
                ← Torna indietro
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Step 2: See arc with scoring + enter clue
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
        {!state.customPair && (
          <div className="text-center mt-sm">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              Categoria: {state.currentPair!.category}
            </span>
          </div>
        )}
      </div>

      {/* Skip button */}
      {state.skipsRemaining > 0 && (
        <div style={{ maxWidth: '500px', margin: '0 auto 0.75rem', textAlign: 'center' }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem' }}
            onClick={() => {
              setClue('');
              onSkipPair();
            }}
          >
            🔀 Salta coppia ({state.skipsRemaining} rimast{state.skipsRemaining === 1 ? 'o' : 'i'})
          </button>
        </div>
      )}

      {/* Arc with scoring zones */}
      {hasTarget && <ArcWithScoring bersaglio={state.targetAngle!} />}

      {/* Clue input */}
      <div className="glass-panel p-lg mt-md" style={{ maxWidth: '500px', margin: '1rem auto 0' }}>
        <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
          Scrivi il tuo indizio:
        </label>
        <input
          type="text"
          className="input"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Il tuo indizio..."
          style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}
        />
        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '1.1rem' }}
          onClick={() => {
            if (clue.trim()) onSubmitClue(clue.trim());
          }}
          disabled={!clue.trim()}
        >
          📨 Invia Indizio
        </button>
      </div>
    </div>
  );
}
