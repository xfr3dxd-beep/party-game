import React, { useState } from 'react';
import { DixitState, DixitColor } from '../types';
import { getCardImagePath, CARD_BACK, getVotingTokenPath, COLOR_HEX, BOARD_FACCIA } from '../cards';

interface Props {
  state: DixitState;
  playerId: string;
  onVote: (position: number) => void;
  onOpenScoreboard: () => void;
}

export default function DixitVoting({ state, playerId, onVote, onOpenScoreboard }: Props) {
  const myPlayer = state.players.find(p => p.id === playerId);
  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;
  const [selectedPos, setSelectedPos] = useState<number | null>(null);

  if (!myPlayer) return null;

  // Find which positions are owned by the current player (can't vote for own card)
  const myCardPositions = state.tableCards.filter(tc => tc.ownerId === playerId).map(tc => tc.position);
  const waitingFor = state.players.filter(p => p.id !== narrator.id && !p.hasVoted);

  const handleVote = () => {
    if (selectedPos !== null) onVote(selectedPos);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', color: '#fff' }}>
      {/* Clue Banner */}
      <div style={{
        padding: '0.8rem 1.5rem', borderRadius: '14px', marginBottom: '1rem', textAlign: 'center',
        background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)',
        maxWidth: '500px', width: '100%',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Indizio: {narrator?.name}
        </div>
        <div style={{ color: '#e0d4fc', fontSize: '1.2rem', fontWeight: 800, fontStyle: 'italic' }}>"{state.clue}"</div>
      </div>

      {/* Scoreboard Button */}
      <button onClick={onOpenScoreboard} style={{
        padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.3)',
        background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600,
        cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        🏆 Punteggio
      </button>

      {/* Board with cards */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '650px', marginBottom: '1.5rem',
      }}>
        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(state.tableCards.length, 6)}, 1fr)`,
          gap: '0.6rem', padding: '0.5rem',
        }}>
          {state.tableCards
            .sort((a, b) => a.position - b.position)
            .map(tc => {
              const isMyCard = myCardPositions.includes(tc.position);
              const isSelected = selectedPos === tc.position;
              const canSelect = !isNarrator && !myPlayer.hasVoted && !isMyCard;
              return (
                <div key={tc.position} onClick={() => canSelect && setSelectedPos(tc.position)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                    cursor: canSelect ? 'pointer' : 'default',
                    opacity: isMyCard && !isNarrator ? 0.5 : 1,
                  }}>
                  {/* Position number */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? '#7c3aed' : 'rgba(124, 58, 237, 0.2)',
                    color: isSelected ? '#fff' : '#a78bfa', fontWeight: 800, fontSize: '0.85rem',
                    border: isSelected ? '2px solid #a78bfa' : '1px solid rgba(124, 58, 237, 0.3)',
                  }}>{tc.position}</div>

                  {/* Card */}
                  <div style={{
                    borderRadius: '8px', overflow: 'hidden',
                    border: isSelected ? '3px solid #7c3aed' : isMyCard ? '2px dashed rgba(255,255,255,0.2)' : '2px solid rgba(124, 58, 237, 0.15)',
                    boxShadow: isSelected ? '0 0 20px rgba(124, 58, 237, 0.5)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    <img src={getCardImagePath(tc.cardId)} alt={`Posizione ${tc.position}`}
                      style={{ width: '100%', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }}
                    />
                  </div>

                  {isMyCard && !isNarrator && (
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>La tua</div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Voting Section */}
      {isNarrator ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎭</div>
          Sei il narratore — attendi che gli altri votino.
          {waitingFor.length > 0 && (
            <div style={{ marginTop: '0.3rem', fontSize: '0.8rem' }}>
              In attesa di: {waitingFor.map(p => p.name).join(', ')}
            </div>
          )}
        </div>
      ) : myPlayer.hasVoted ? (
        <div style={{ textAlign: 'center', color: '#4ade80', fontSize: '0.95rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          Voto inviato!
          {waitingFor.length > 0 && (
            <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              In attesa di: {waitingFor.map(p => p.name).join(', ')}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Voting Tokens */}
          {myPlayer.color && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                I tuoi token di voto:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {state.tableCards.sort((a, b) => a.position - b.position).map(tc => {
                  const isMyCard = myCardPositions.includes(tc.position);
                  const isSelected = selectedPos === tc.position;
                  if (isMyCard) return null;
                  return (
                    <div key={tc.position} onClick={() => setSelectedPos(tc.position)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px', overflow: 'hidden',
                        border: isSelected ? `3px solid ${COLOR_HEX[myPlayer.color!]}` : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: isSelected ? `0 0 15px rgba(${hexToRgb(COLOR_HEX[myPlayer.color!])}, 0.5)` : 'none',
                        transform: isSelected ? 'scale(1.1)' : 'none',
                        transition: 'all 0.2s ease',
                      }}>
                      <img src={getVotingTokenPath(myPlayer.color!, tc.position)}
                        alt={`Token ${tc.position}`}
                        style={{ width: '52px', height: '52px', objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={handleVote} disabled={selectedPos === null}
            style={{
              padding: '0.9rem 2.5rem', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 700,
              cursor: selectedPos !== null ? 'pointer' : 'not-allowed', color: '#fff',
              background: selectedPos !== null ? 'linear-gradient(135deg, #c4b5fd, #7c3aed)' : 'rgba(124, 58, 237, 0.2)',
              boxShadow: selectedPos !== null ? '0 6px 20px rgba(124, 58, 237, 0.4)' : 'none',
            }}>
            Conferma Voto
          </button>
        </>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
