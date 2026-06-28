import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { GameResult, Player } from '../types';

interface RoundResultProps {
  result: GameResult | null;
  players: Player[];
  eliminatedPlayerId: string | null;
  isGameOver: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

export default function RoundResult({
  result,
  players,
  eliminatedPlayerId,
  isGameOver,
  onContinue,
  onNewGame,
}: RoundResultProps) {
  const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);

  if (isGameOver && result) {
    const mrWhiteWins = result.winner === 'mr_white';

    return (
      <div className="round-result animate-fade-in">
        <div className="round-result-icon">
          {mrWhiteWins ? '🕵️' : '🎉'}
        </div>
        <h2 className="round-result-title" style={{
          color: mrWhiteWins ? 'var(--accent-rose-light)' : 'var(--accent-green-light)',
        }}>
          {mrWhiteWins ? 'Mr. White Vince!' : 'I Civili Vincono!'}
        </h2>
        <p className="round-result-message">
          {mrWhiteWins
            ? 'Mr. White ha indovinato la parola dei Civili!'
            : 'Mr. White è stato scoperto e non ha indovinato la parola!'
          }
        </p>

        <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
            Le parole di questa partita
          </p>
          <div className="flex gap-lg justify-center" style={{ flexWrap: 'wrap' }}>
            <div>
              <span className="card-role civile" style={{ marginBottom: '4px', display: 'inline-block' }}>Civile</span>
              <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{result.revealedWord}</p>
            </div>
            <div>
              <span className="card-role undercover" style={{ marginBottom: '4px', display: 'inline-block' }}>Undercover</span>
              <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{result.revealedUndercoverWord}</p>
            </div>
          </div>
        </div>

        <div className="points-awarded">
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Punti Assegnati
          </p>
          {result.pointsAwarded.map(award => (
            <div key={award.playerId} className="points-row">
              <span className="points-row-name">
                {award.playerName}
                <span className={`card-role ${award.role === 'mr_white' ? 'mr-white' : award.role}`} style={{ marginLeft: '8px' }}>
                  {award.role === 'mr_white' ? 'Mr. White' : award.role === 'civile' ? 'Civile' : 'Undercover'}
                </span>
              </span>
              <span className={`points-row-value ${award.points === 0 ? 'zero' : ''}`}>
                +{award.points} pt
              </span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg btn-block mt-xl"
          onClick={onNewGame}
          id="new-game-button"
        >
          <RotateCcw size={18} />
          Nuova Partita
        </button>
      </div>
    );
  }

  // Non-game-over round result (eliminated a non-mr-white player)
  return (
    <div className="round-result animate-fade-in">
      <div className="round-result-icon">❌</div>
      <h2 className="round-result-title">
        {eliminatedPlayer?.name} Eliminato!
      </h2>
      <p className="round-result-message">
        {eliminatedPlayer?.role === 'undercover' ? (
          <>Era un <span className="card-role undercover">Undercover</span>! La partita continua...</>
        ) : (
          <>Era un <span className="card-role civile">Civile</span>! Attenzione, l'impostore è ancora in gioco!</>
        )}
      </p>

      <button
        className="btn btn-primary btn-lg"
        onClick={onContinue}
        id="continue-round-button"
      >
        Continua
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
