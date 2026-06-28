import React from 'react';
import { ArrowRight, Shuffle } from 'lucide-react';
import { Player } from '../types';

interface TurnOrderProps {
  players: Player[];
  turnOrder: string[];
  onContinue: () => void;
}

export default function TurnOrder({ players, turnOrder, onContinue }: TurnOrderProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-xl">
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>
          <Shuffle size={40} style={{ color: 'var(--accent-purple-light)', margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <span className="text-gradient">Ordine di Gioco</span>
        </h2>
        <p className="text-muted mt-sm">
          Ecco l'ordine casuale in cui i giocatori parleranno
        </p>
      </div>

      <div className="turn-order-list">
        {turnOrder.map((playerId, index) => {
          const player = players.find(p => p.id === playerId);
          if (!player) return null;

          return (
            <div
              key={playerId}
              className={`turn-order-item ${player.isEliminated ? 'eliminated' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="turn-order-number">{index + 1}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{player.name}</span>
              {player.isEliminated && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>Eliminato</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-xl">
        <button
          className="btn btn-primary btn-lg"
          onClick={onContinue}
          id="start-discussion-button"
        >
          Inizia Discussione
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
