import React, { useState } from 'react';
import { Vote, Check } from 'lucide-react';
import { Player } from '../types';

interface VotingPhaseProps {
  players: Player[];
  onEliminate: (playerId: string) => void;
}

export default function VotingPhase({ players, onEliminate }: VotingPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const activePlayers = players.filter(p => !p.isEliminated);

  const handleVote = () => {
    if (selectedId && !confirmed) {
      setConfirmed(true);
    }
  };

  const handleConfirmEliminate = () => {
    if (selectedId) {
      onEliminate(selectedId);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-xl">
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>
          <Vote size={40} style={{ color: 'var(--accent-rose-light)', margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <span className="text-gradient">Votazione</span>
        </h2>
        <p className="text-muted mt-sm">
          {confirmed
            ? 'Conferma l\'eliminazione del giocatore'
            : 'Seleziona il giocatore da eliminare'
          }
        </p>
      </div>

      <div className="voting-grid">
        {activePlayers.map(player => (
          <div
            key={player.id}
            className={`voting-card ${selectedId === player.id ? 'selected' : ''}`}
            onClick={() => !confirmed && setSelectedId(player.id)}
          >
            <div className="voting-card-avatar">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="voting-card-name">{player.name}</div>
            {selectedId === player.id && (
              <Check
                size={16}
                style={{
                  color: 'var(--accent-rose)',
                  marginTop: '0.25rem',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-xl">
        {!confirmed ? (
          <button
            className="btn btn-danger btn-lg"
            onClick={handleVote}
            disabled={!selectedId}
            id="vote-button"
          >
            <Vote size={18} />
            Vota per Eliminare
          </button>
        ) : (
          <div className="animate-scale-in">
            <p style={{ marginBottom: 'var(--space-md)', fontWeight: 600, color: 'var(--accent-rose-light)' }}>
              Sei sicuro di voler eliminare <strong>{activePlayers.find(p => p.id === selectedId)?.name}</strong>?
            </p>
            <div className="flex gap-md justify-center">
              <button
                className="btn btn-secondary"
                onClick={() => { setConfirmed(false); setSelectedId(null); }}
              >
                Annulla
              </button>
              <button
                className="btn btn-danger btn-lg"
                onClick={handleConfirmEliminate}
                id="confirm-eliminate-button"
              >
                Conferma Eliminazione
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
