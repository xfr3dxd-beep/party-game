import React from 'react';
import { DixitState, DixitColor } from '../types';
import { getCardImagePath, CARD_BACK, getRabbitTokenPath, COLOR_HEX, COLOR_LABELS } from '../cards';

interface Props {
  state: DixitState;
  playerId: string;
  isHost: boolean;
  onNextRound: () => void;
  onOpenScoreboard: () => void;
}

export default function DixitScoring({ state, playerId, isHost, onNextRound, onOpenScoreboard }: Props) {
  const narrator = state.players[state.narratorIndex];
  const scores = state.roundScores || [];

  // Build a map: position -> list of voter names
  const votesMap: Record<number, string[]> = {};
  state.votes.forEach(v => {
    if (!votesMap[v.position]) votesMap[v.position] = [];
    const voter = state.players.find(p => p.id === v.voterId);
    if (voter) votesMap[v.position].push(voter.name);
  });

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', color: '#fff' }}>
      <h2 style={{
        fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #e0d4fc 0%, #a78bfa 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Risultati del Round {state.roundNumber}
      </h2>

      {/* Clue reminder */}
      <div style={{
        padding: '0.5rem 1rem', borderRadius: '10px', marginBottom: '1.5rem',
        background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)',
        color: '#c4b5fd', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center',
      }}>
        Indizio: "{state.clue}" — {narrator?.name}
      </div>

      {/* Scoreboard Button */}
      <button onClick={onOpenScoreboard} style={{
        padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.3)',
        background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600,
        cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        🏆 Punteggio Generale
      </button>

      {/* Cards with votes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(state.tableCards.length, 6)}, 1fr)`,
        gap: '0.8rem', maxWidth: '700px', width: '100%', marginBottom: '2rem',
      }}>
        {state.tableCards.sort((a, b) => a.position - b.position).map(tc => {
          const owner = state.players.find(p => p.id === tc.ownerId);
          const isNarratorCard = tc.ownerId === narrator.id;
          const voters = votesMap[tc.position] || [];
          return (
            <div key={tc.position} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              {/* Position */}
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isNarratorCard ? '#7c3aed' : 'rgba(124, 58, 237, 0.2)',
                color: '#fff', fontWeight: 800, fontSize: '0.75rem',
              }}>{tc.position}</div>

              {/* Card */}
              <div style={{
                borderRadius: '8px', overflow: 'hidden',
                border: isNarratorCard ? '3px solid #7c3aed' : '1px solid rgba(124, 58, 237, 0.15)',
                boxShadow: isNarratorCard ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none',
              }}>
                <img src={getCardImagePath(tc.cardId)} alt={`Pos ${tc.position}`}
                  style={{ width: '100%', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }} />
              </div>

              {/* Owner */}
              <div style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: isNarratorCard ? '#a78bfa' : owner?.color ? COLOR_HEX[owner.color] : 'rgba(255,255,255,0.5)',
              }}>
                {isNarratorCard ? `⭐ ${owner?.name}` : owner?.name}
              </div>

              {/* Votes received */}
              {voters.length > 0 && (
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                  Voti: {voters.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score Breakdown */}
      <div style={{
        width: '100%', maxWidth: '500px', background: 'rgba(22, 18, 45, 0.82)',
        borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(124, 58, 237, 0.25)',
        marginBottom: '2rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: '#c4b5fd', textAlign: 'center' }}>
          Punti del Round
        </h3>
        {scores.sort((a, b) => b.pointsGained - a.pointsGained).map(entry => {
          const player = state.players.find(p => p.id === entry.playerId);
          if (!player) return null;
          return (
            <div key={entry.playerId} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.5rem',
              borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
            }}>
              {/* Player color dot */}
              {player.color && (
                <img src={getRabbitTokenPath(player.color)} alt={player.color}
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{player.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{entry.reason}</div>
              </div>
              <div style={{
                fontWeight: 800, fontSize: '1.1rem',
                color: entry.pointsGained > 0 ? '#4ade80' : 'rgba(255,255,255,0.3)',
              }}>
                +{entry.pointsGained}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                → {player.score}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Round Button */}
      {isHost && (
        <button onClick={onNextRound} style={{
          padding: '1rem 3rem', borderRadius: '14px', border: 'none', fontSize: '1.1rem', fontWeight: 800,
          cursor: 'pointer', color: '#1a0833',
          background: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 45%, #5b21b6 100%)',
          boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          ▶ Prossimo Round
        </button>
      )}
      {!isHost && (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          ⏳ In attesa che l'host avanzi al prossimo round...
        </div>
      )}
    </div>
  );
}
