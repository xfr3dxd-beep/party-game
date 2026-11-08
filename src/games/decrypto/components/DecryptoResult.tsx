import React, { useState } from 'react';
import type { DecryptoState, DecryptoTeam } from '../types';

interface Props {
  state: DecryptoState;
  playerId: string;
  isHost: boolean;
  onFinalGuess: (words: string[]) => void;
  onSkipFinalGuess: () => void;
  onNewGame: () => void;
  onGoHome: () => void;
}

export default function DecryptoResult({ state, playerId, isHost, onFinalGuess, onSkipFinalGuess, onNewGame, onGoHome }: Props) {
  const [guessWords, setGuessWords] = useState(['', '', '', '']);

  // ---- FINAL GUESS PHASE ----
  if (state.phase === 'final-guess' && state.losingTeam) {
    const myTeam = state.players.find(p => p.id === playerId)?.team;
    const isLosingTeam = myTeam === state.losingTeam;
    const winnerLabel = state.winner === 'bianca' ? '⬜ Bianca' : '⬛ Nera';
    const loserLabel = state.losingTeam === 'bianca' ? '⬜ Bianca' : '⬛ Nera';

    const reasonText = state.loseReason === 'miscommunication'
      ? `La ${loserLabel} ha accumulato 2 Errate Comunicazioni!`
      : `La ${winnerLabel} ha ottenuto 2 Intercettazioni!`;

    // Only the losing team's next player can guess
    const losingPlayers = state.players.filter(p => p.team === state.losingTeam);
    const canGuess = isLosingTeam && losingPlayers.length > 0;

    if (canGuess) {
      return (
        <div className="animate-fade-in">
          <div className="text-center mb-md">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
            <h2 style={{ fontWeight: 800, color: '#ef4444' }}>Ultima Possibilità!</h2>
            <p className="text-muted">{reasonText}</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Indovina tutte e 4 le parole avversarie per pareggiare!
            </p>
          </div>

          <div className="glass-panel p-lg" style={{ maxWidth: '450px', margin: '0 auto' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Parola #{i + 1}:
                </label>
                <input
                  type="text" className="input"
                  value={guessWords[i]}
                  onChange={e => { const w = [...guessWords]; w[i] = e.target.value; setGuessWords(w); }}
                  placeholder={`Parola ${i + 1}...`}
                  maxLength={60}
                />
              </div>
            ))}
            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.05rem', marginBottom: '0.5rem' }}
              onClick={() => onFinalGuess(guessWords.map(w => w.trim()))}
              disabled={guessWords.some(w => !w.trim())}
            >
              🎯 Conferma
            </button>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onSkipFinalGuess}>
              Salta tentativo
            </button>
          </div>
        </div>
      );
    }

    // Non-losing team waits
    return (
      <div className="animate-fade-in text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{ fontWeight: 800 }}>{reasonText}</h2>
        <p className="text-muted">La {loserLabel} sta tentando di indovinare le vostre 4 parole...</p>
      </div>
    );
  }

  // ---- GAME OVER ----
  const winnerLabel = state.winner === 'bianca' ? '⬜ Squadra Bianca'
    : state.winner === 'nera' ? '⬛ Squadra Nera'
    : '🤝 Pareggio';

  return (
    <div className="animate-fade-in text-center">
      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
        {state.winner === 'draw' ? '🤝' : '🏆'}
      </div>
      <h2 style={{ fontWeight: 900, fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        {state.winner === 'draw' ? 'Pareggio!' : `${winnerLabel} vince!`}
      </h2>

      {state.loseReason && state.losingTeam && (
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          {state.loseReason === 'miscommunication'
            ? `La ${state.losingTeam === 'bianca' ? '⬜ Bianca' : '⬛ Nera'} ha accumulato 2 Errate Comunicazioni.`
            : `La ${state.winner === 'bianca' ? '⬜ Bianca' : '⬛ Nera'} ha ottenuto 2 Intercettazioni.`}
        </p>
      )}

      {state.finalGuessCorrect === true && (
        <div className="glass-panel p-md mb-md" style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
          <p style={{ color: '#22c55e', fontWeight: 700 }}>
            🎯 La squadra perdente ha indovinato tutte le 4 parole! Pareggio!
          </p>
        </div>
      )}

      {state.finalGuessCorrect === false && state.finalGuessWords.length > 0 && (
        <div className="glass-panel p-md mb-md" style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
          <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem' }}>
            ❌ Tentativo finale sbagliato!
          </p>
        </div>
      )}

      {/* Reveal all words */}
      <div style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto 1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="glass-panel p-md" style={{ flex: 1, minWidth: '220px', borderTop: '3px solid #e5e7eb' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>⬜ Parole Bianca</h4>
          {state.biancaWords.map((w, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0.25rem 0', fontWeight: 700 }}>
              <span className="text-muted">{i + 1}.</span> {w}
            </div>
          ))}
        </div>
        <div className="glass-panel p-md" style={{ flex: 1, minWidth: '220px', borderTop: '3px solid #374151' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>⬛ Parole Nera</h4>
          {state.neraWords.map((w, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0.25rem 0', fontWeight: 700 }}>
              <span className="text-muted">{i + 1}.</span> {w}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
        {isHost && (
          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} onClick={onNewGame}>
            🔄 Gioca Ancora
          </button>
        )}
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onGoHome}>
          🏠 Torna ai Giochi
        </button>
      </div>
    </div>
  );
}
