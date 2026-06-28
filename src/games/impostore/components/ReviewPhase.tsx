import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Player } from '../types';

interface ReviewPhaseProps {
  players: Player[];
  getPlayerWord: (player: Player) => { word: string; hint?: string };
  onContinue: () => void;
}

export default function ReviewPhase({ players, getPlayerWord, onContinue }: ReviewPhaseProps) {
  const [revealedPlayer, setRevealedPlayer] = useState<string | null>(null);

  const toggleReveal = (playerId: string) => {
    setRevealedPlayer(prev => prev === playerId ? null : playerId);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-xl">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <span className="text-gradient">Rivedi la tua carta</span>
        </h2>
        <p className="text-muted mt-sm">
          Premi l'icona dell'occhio per rileggere la tua parola
        </p>
      </div>

      <div className="review-cards">
        {players.map(player => {
          const isRevealed = revealedPlayer === player.id;
          const wordInfo = getPlayerWord(player);

          return (
            <div key={player.id} className="review-card">
              <div className="review-card-name">{player.name}</div>
              <div className={`review-card-word ${isRevealed ? '' : 'hidden'}`}>
                {isRevealed ? (
                  <>
                    {wordInfo.word}
                    {wordInfo.hint && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-amber-light)',
                        fontStyle: 'italic',
                        marginTop: '4px',
                      }}>
                        {wordInfo.hint}
                      </div>
                    )}
                  </>
                ) : (
                  '• • •'
                )}
              </div>
              <button
                className="btn-icon mt-sm"
                onClick={() => toggleReveal(player.id)}
                title={isRevealed ? 'Nascondi' : 'Mostra'}
                style={{ margin: '0.5rem auto 0' }}
              >
                {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-xl">
        <button
          className="btn btn-primary btn-lg"
          onClick={onContinue}
          id="continue-to-turns-button"
        >
          Continua
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
