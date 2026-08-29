import React from 'react';
import { PiliPiliState } from '../types';

interface PiliPiliRoundResultProps {
  state: PiliPiliState;
  isHost: boolean;
  onNextRound: () => void;
}

export default function PiliPiliRoundResult({ state, isHost, onNextRound }: PiliPiliRoundResultProps) {
  return (
    <div className="animate-fade-in text-center">
      <h2 className="mb-xl" style={{ fontSize: '2.5rem', color: '#ea580c' }}>Fine Round {state.roundNumber}</h2>
      
      <div className="glass-panel p-xl mx-auto mb-xl" style={{ maxWidth: '600px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th className="p-sm text-muted">Giocatore</th>
              <th className="p-sm text-muted text-center">Scommessa</th>
              <th className="p-sm text-muted text-center">Prese</th>
              <th className="p-sm text-muted text-center">Pili 🌶️</th>
            </tr>
          </thead>
          <tbody>
            {state.players.sort((a,b) => a.pilis - b.pilis).map(p => {
              const diff = Math.abs((p.bet || 0) - p.tricksWon);
              const isPerfect = diff === 0;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="p-sm" style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="p-sm text-center">{p.bet}</td>
                  <td className="p-sm text-center" style={{ color: isPerfect ? '#10b981' : (p.tricksWon > (p.bet || 0) ? '#3b82f6' : '#ef4444') }}>
                    {p.tricksWon}
                  </td>
                  <td className="p-sm text-center" style={{ fontWeight: 'bold', color: '#ef4444' }}>
                    {p.pilis}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {isHost ? (
        <button className="btn btn-primary btn-lg" onClick={onNextRound} style={{ background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', border: 'none' }}>
          Prossimo Round
        </button>
      ) : (
        <p className="text-muted" style={{ fontSize: '1.2rem' }}>
          In attesa che l'host inizi il prossimo round...
        </p>
      )}
    </div>
  );
}
