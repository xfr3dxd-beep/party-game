import React from 'react';

interface ShurikenModalProps {
  proposerName: string;
  players: { id: string; name: string }[];
  votes: Record<string, boolean>;
  myPlayerId: string;
  onVote: (accept: boolean) => void;
}

export default function ShurikenModal({
  proposerName,
  players,
  votes,
  myPlayerId,
  onVote
}: ShurikenModalProps) {
  const hasVoted = votes[myPlayerId] !== undefined;
  const totalVotes = Object.keys(votes).length;
  const totalPlayers = players.length;
  const progressPercent = totalPlayers > 0 ? (totalVotes / totalPlayers) * 100 : 0;

  return (
    <div className="mind-shuriken-modal">
      <div className="mind-shuriken-content">
        <div className="mind-shuriken-icon">⭐</div>
        <h2>{proposerName} propone di usare una Stella!</h2>
        <p>Tutti devono accettare. Ogni giocatore scarta la carta più bassa.</p>
        
        <div className="mind-shuriken-progress">
          <div 
            className="mind-shuriken-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <ul className="mind-shuriken-voters">
          {players.map(p => {
            const votedYes = votes[p.id] === true;
            return (
              <li key={p.id} className="mind-shuriken-voter">
                <span>{p.name}</span>
                <span>{votes[p.id] !== undefined ? (votedYes ? '✓' : '✗') : 'In attesa...'}</span>
              </li>
            );
          })}
        </ul>

        {!hasVoted ? (
          <div className="mind-shuriken-actions">
            <button className="btn btn-secondary" onClick={() => onVote(false)}>Rifiuta</button>
            <button className="btn btn-primary" onClick={() => onVote(true)}>Accetta</button>
          </div>
        ) : (
          <div className="mind-shuriken-status">
            Hai accettato ✓
          </div>
        )}
      </div>
    </div>
  );
}
