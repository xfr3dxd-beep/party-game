import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MrWhiteGuessProps {
  playerName: string;
  onSubmitGuess: (guess: string) => void;
}

export default function MrWhiteGuess({ playerName, onSubmitGuess }: MrWhiteGuessProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmitGuess(guess.trim());
    }
  };

  return (
    <div className="mr-white-guess glass-card-static animate-scale-in">
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎯</div>
      <h2 className="mr-white-title">Mr. White Eliminato!</h2>
      <p className="mr-white-subtitle">
        <strong>{playerName}</strong> era Mr. White!<br />
        Ha un'ultima possibilità: indovinare la parola dei Civili.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input mr-white-input"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Scrivi la parola..."
          autoFocus
          maxLength={50}
          id="mr-white-guess-input"
        />
        <button
          type="submit"
          className="btn btn-danger btn-lg btn-block mt-lg"
          disabled={!guess.trim()}
          id="mr-white-guess-submit"
        >
          <Send size={18} />
          Conferma Risposta
        </button>
      </form>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        marginTop: 'var(--space-lg)',
        fontStyle: 'italic',
      }}>
        ⚠️ Hai un solo tentativo!
      </p>
    </div>
  );
}
