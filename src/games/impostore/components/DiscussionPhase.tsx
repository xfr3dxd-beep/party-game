import React from 'react';
import { MessageCircle, Vote, Eye } from 'lucide-react';
import { Player } from '../types';

interface DiscussionPhaseProps {
  players: Player[];
  turnOrder: string[];
  currentRound: number;
  getPlayerWord: (player: Player) => { word: string; hint?: string };
  onStartVoting: () => void;
}

export default function DiscussionPhase({
  players,
  turnOrder,
  currentRound,
  getPlayerWord,
  onStartVoting,
}: DiscussionPhaseProps) {
  const [revealedPlayer, setRevealedPlayer] = React.useState<string | null>(null);

  const activePlayers = players.filter(p => !p.isEliminated);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-xl">
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>
          <MessageCircle size={40} style={{ color: 'var(--accent-cyan-light)', margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <span className="text-gradient">Discussione — Round {currentRound + 1}</span>
        </h2>
        <p className="text-muted mt-sm">
          Ogni giocatore descrive la propria parola. Scoprite l'impostore!
        </p>
      </div>

      {/* Turn Order */}
      <div className="turn-order-list">
        {turnOrder.map((playerId, index) => {
          const player = players.find(p => p.id === playerId);
          if (!player || player.isEliminated) return null;

          return (
            <div
              key={playerId}
              className="turn-order-item"
              style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
            >
              <span className="turn-order-number">{index + 1}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{player.name}</span>
              <button
                className="btn-icon"
                onClick={() => setRevealedPlayer(prev => prev === playerId ? null : playerId)}
                title="Rivedi la tua parola"
                style={{ width: '36px', height: '36px' }}
              >
                <Eye size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Revealed word popup */}
      {revealedPlayer && (() => {
        const player = players.find(p => p.id === revealedPlayer);
        if (!player) return null;
        const wordInfo = getPlayerWord(player);

        return (
          <div className="modal-overlay" onClick={() => setRevealedPlayer(null)}>
            <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>
                Parola di {player.name}
              </h3>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--accent-purple-light)',
                marginBottom: 'var(--space-sm)',
              }}>
                {wordInfo.word}
              </div>
              {wordInfo.hint && (
                <p style={{ color: 'var(--accent-amber-light)', fontStyle: 'italic' }}>
                  Indizio: {wordInfo.hint}
                </p>
              )}
              <button
                className="btn btn-secondary mt-lg"
                onClick={() => setRevealedPlayer(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        );
      })()}

      {/* Eliminated players */}
      {players.filter(p => p.isEliminated).length > 0 && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <p style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textAlign: 'center',
            marginBottom: 'var(--space-sm)',
          }}>
            Eliminati
          </p>
          <div className="flex gap-sm justify-center" style={{ flexWrap: 'wrap' }}>
            {players.filter(p => p.isEliminated).map(p => (
              <span key={p.id} style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(244, 63, 94, 0.1)',
                color: 'var(--accent-rose)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'line-through',
              }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-xl">
        <button
          className="btn btn-danger btn-lg"
          onClick={onStartVoting}
          id="start-voting-button"
        >
          <Vote size={18} />
          Inizia Votazione
        </button>
      </div>
    </div>
  );
}
