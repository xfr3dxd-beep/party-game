import React from 'react';
import { DixitState } from '../types';
import { getCardImagePath, CARD_BACK, getRabbitTokenPath, COLOR_HEX, BOARD_FACCIA } from '../cards';
import { Eye } from 'lucide-react';

interface Props {
  state: DixitState;
  playerId: string;
  isHost: boolean;
  onNextRound: () => void;
  onOpenScoreboard: () => void;
  onZoomCard: (cardId: number) => void;
}

export default function DixitScoring({ state, playerId, isHost, onNextRound, onOpenScoreboard, onZoomCard }: Props) {
  const narrator = state.players[state.narratorIndex];
  const scores = state.roundScores || [];
  const sorted = [...state.tableCards].sort((a, b) => a.position - b.position);

  // Build vote map: position → voter names
  const votesMap: Record<number, string[]> = {};
  state.votes.forEach(v => {
    if (!votesMap[v.position]) votesMap[v.position] = [];
    const voter = state.players.find(p => p.id === v.voterId);
    if (voter) votesMap[v.position].push(voter.name);
  });

  // Card slot positions on the faccia board
  const facciaSlotsX = [13.5, 27.5, 41.5, 55.5, 69.5, 83.5];

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0.5rem', color: '#fff' }}>
      <h2 style={{
        fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #e0d4fc 0%, #a78bfa 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Risultati Round {state.roundNumber}
      </h2>

      {/* Clue */}
      <div style={{
        padding: '0.4rem 1rem', borderRadius: '10px', marginBottom: '0.8rem',
        background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)',
        color: '#c4b5fd', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center',
      }}>
        Indizio: "{state.clue}" — {narrator?.name}
      </div>

      <button onClick={onOpenScoreboard} style={{
        padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.3)',
        background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600,
        cursor: 'pointer', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
      }}>
        🏆 Punteggio Generale
      </button>

      {/* ===== BOARD (faccia) with results ===== */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '650px', marginBottom: '1.2rem',
        borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.2)',
      }}>
        <img src={BOARD_FACCIA} alt="Tabellone" style={{ width: '100%', display: 'block' }} />

        {sorted.map(tc => {
          const slotIdx = tc.position - 1;
          if (slotIdx < 0 || slotIdx >= facciaSlotsX.length) return null;
          const isNarratorCard = tc.ownerId === narrator.id;
          const owner = state.players.find(p => p.id === tc.ownerId);
          const voters = votesMap[tc.position] || [];

          return (
            <div key={tc.position} style={{
              position: 'absolute', top: '8%', left: `${facciaSlotsX[slotIdx]}%`,
              width: '14%', transform: 'translateX(-50%)',
            }}>
              {/* Position number */}
              <div style={{
                position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isNarratorCard ? '#7c3aed' : 'rgba(0,0,0,0.7)',
                color: '#fff', fontWeight: 800, fontSize: '0.7rem', zIndex: 5,
                border: isNarratorCard ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.3)',
              }}>{tc.position}</div>

              {/* Card */}
              <div style={{
                borderRadius: '5px', overflow: 'hidden',
                border: isNarratorCard ? '3px solid #7c3aed' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isNarratorCard ? '0 0 14px rgba(124,58,237,0.5)' : '0 2px 6px rgba(0,0,0,0.4)',
              }}>
                <img src={getCardImagePath(tc.cardId)} alt={`Pos ${tc.position}`}
                  style={{ width: '100%', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }} />
              </div>

              {/* Eye zoom */}
              <button onClick={e => { e.stopPropagation(); onZoomCard(tc.cardId); }}
                style={{
                  position: 'absolute', bottom: '4px', right: '4px', zIndex: 6,
                  background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(124,58,237,0.5)',
                  color: '#a78bfa', borderRadius: '50%', width: '18px', height: '18px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}><Eye size={9} /></button>

              {/* Owner name */}
              <div style={{
                textAlign: 'center', fontSize: '0.5rem', fontWeight: 700, marginTop: '2px',
                color: isNarratorCard ? '#a78bfa' : owner?.color ? COLOR_HEX[owner.color] : 'rgba(255,255,255,0.5)',
              }}>
                {isNarratorCard ? `⭐ ${owner?.name}` : owner?.name}
              </div>

              {/* Votes */}
              {voters.length > 0 && (
                <div style={{ textAlign: 'center', fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
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
        borderRadius: '16px', padding: '1rem', border: '1px solid rgba(124, 58, 237, 0.25)',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 800, color: '#c4b5fd', textAlign: 'center' }}>
          Punti del Round
        </h3>
        {scores.sort((a, b) => b.pointsGained - a.pointsGained).map(entry => {
          const player = state.players.find(p => p.id === entry.playerId);
          if (!player) return null;
          return (
            <div key={entry.playerId} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.4rem',
              borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
            }}>
              {player.color && (
                <img src={getRabbitTokenPath(player.color)} alt={player.color}
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{player.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{entry.reason}</div>
              </div>
              <div style={{
                fontWeight: 800, fontSize: '1rem',
                color: entry.pointsGained > 0 ? '#4ade80' : 'rgba(255,255,255,0.3)',
              }}>
                +{entry.pointsGained}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>→ {player.score}</div>
            </div>
          );
        })}
      </div>

      {/* Next Round */}
      {isHost ? (
        <button onClick={onNextRound} style={{
          padding: '0.9rem 2.5rem', borderRadius: '14px', border: 'none', fontSize: '1.05rem', fontWeight: 800,
          cursor: 'pointer', color: '#1a0833',
          background: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 45%, #5b21b6 100%)',
          boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          ▶ Prossimo Round
        </button>
      ) : (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          ⏳ In attesa che l'host avanzi al prossimo round...
        </div>
      )}
    </div>
  );
}
