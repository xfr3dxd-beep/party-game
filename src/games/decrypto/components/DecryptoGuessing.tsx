import React, { useState } from 'react';
import type { DecryptoState, DecryptoTeam } from '../types';

interface Props {
  state: DecryptoState;
  playerId: string;
  onSubmitTeamGuess: (guess: number[]) => void;
  onSubmitOpponentGuess: (guess: number[]) => void;
}

export default function DecryptoGuessing({ state, playerId, onSubmitTeamGuess, onSubmitOpponentGuess }: Props) {
  const [guess, setGuess] = useState<number[]>([0, 0, 0]);
  const myTeam = state.players.find(p => p.id === playerId)?.team;
  const isActivePlayer = state.activePlayerId === playerId;
  const isOwnTeam = myTeam === state.activeTeam;
  const opponent = state.activeTeam === 'bianca' ? 'nera' : 'bianca';

  // Active player just waits
  if (isActivePlayer) {
    return (
      <div className="animate-fade-in text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{ fontWeight: 800 }}>Indizi inviati!</h2>
        <p className="text-muted mb-md">In attesa che entrambe le squadre rispondano...</p>
        <div className="glass-panel p-md" style={{ maxWidth: '350px', margin: '0 auto' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>I tuoi indizi:</p>
          {state.clues.map((c, i) => (
            <div key={i} style={{ fontSize: '1rem', fontWeight: 700, padding: '0.2rem 0' }}>
              {i + 1}. "{c}"
            </div>
          ))}
        </div>
        <div className="text-muted mt-md" style={{ fontSize: '0.85rem' }}>
          {state.teamGuessSubmitted ? '✅ La tua squadra ha risposto' : '⏳ La tua squadra sta discutendo...'}<br />
          {state.opponentGuessSubmitted ? '✅ Avversari hanno risposto' : '⏳ Avversari stanno discutendo...'}
        </div>
      </div>
    );
  }

  const alreadySubmitted = isOwnTeam ? state.teamGuessSubmitted : state.opponentGuessSubmitted;

  if (alreadySubmitted) {
    return (
      <div className="animate-fade-in text-center">
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
        <h3 style={{ color: 'var(--accent-green-light)' }}>
          {isOwnTeam ? 'La tua squadra ha risposto!' : 'La tua squadra ha tentato l\'intercettazione!'}
        </h3>
        <p className="text-muted">In attesa dell'altra squadra...</p>
        <div className="text-muted mt-md" style={{ fontSize: '0.85rem' }}>
          {state.teamGuessSubmitted ? '✅ Squadra attiva ha risposto' : '⏳ Squadra attiva sta discutendo...'}<br />
          {state.opponentGuessSubmitted ? '✅ Squadra avversaria ha risposto' : '⏳ Squadra avversaria sta discutendo...'}
        </div>
      </div>
    );
  }

  const canSubmit = guess.every(g => g >= 1 && g <= 4);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-md">
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>
          {isOwnTeam ? '🔍 Decodifica il codice!' : '🕵️ Intercetta il codice!'}
        </h2>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          {isOwnTeam
            ? 'Ricostruisci il codice della tua squadra.'
            : 'Prova a intercettare il codice avversario!'}
        </p>
      </div>

      {/* Clues display */}
      <div className="glass-panel p-md mb-md" style={{ maxWidth: '450px', margin: '0 auto 1rem' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          Indizi del crittografo:
        </p>
        {state.clues.map((c, i) => (
          <div key={i} style={{
            fontSize: '1.1rem', fontWeight: 700, padding: '0.4rem 0',
            borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : undefined,
            textAlign: 'center',
          }}>
            {i + 1}. <span style={{ color: '#fbbf24' }}>"{c}"</span>
          </div>
        ))}
      </div>

      {/* Guess inputs */}
      <div className="glass-panel p-lg" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.75rem' }}>
          Assegna un numero (1-4) a ogni indizio:
        </p>
        {state.clues.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{c}"
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>→</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => { const g = [...guess]; g[i] = n; setGuess(g); }}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: guess[i] === n ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.15)',
                    background: guess[i] === n ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                    color: guess[i] === n ? '#3b82f6' : 'var(--text-secondary)',
                    fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '1.05rem', marginTop: '0.5rem' }}
          onClick={() => isOwnTeam ? onSubmitTeamGuess(guess) : onSubmitOpponentGuess(guess)}
          disabled={!canSubmit}
        >
          {isOwnTeam ? '🔓 Conferma Decodifica' : '🕵️ Conferma Intercettazione'}
        </button>
      </div>
    </div>
  );
}
