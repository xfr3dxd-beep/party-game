import React, { useState } from 'react';
import { DixitState } from '../types';
import { getCardImagePath, CARD_BACK, getVotingTokenPath, COLOR_HEX, BOARD_FACCIA } from '../cards';
import { Eye } from 'lucide-react';

interface Props {
  state: DixitState;
  playerId: string;
  onVote: (position: number) => void;
  onOpenScoreboard: () => void;
  onZoomCard: (cardId: number) => void;
}

export default function DixitVoting({ state, playerId, onVote, onOpenScoreboard, onZoomCard }: Props) {
  const myPlayer = state.players.find(p => p.id === playerId);
  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;
  const [selectedPos, setSelectedPos] = useState<number | null>(null);

  if (!myPlayer) return null;

  const myCardPositions = state.tableCards.filter(tc => tc.ownerId === playerId).map(tc => tc.position);
  const waitingFor = state.players.filter(p => p.id !== narrator.id && !p.hasVoted);
  const sorted = [...state.tableCards].sort((a, b) => a.position - b.position);

  const handleVote = () => {
    if (selectedPos !== null) onVote(selectedPos);
  };

  // Card slot positions on the faccia board image (6 slots in a row)
  // Percentage from left edge for each slot 1–6
  const facciaSlotsX = [13.5, 27.5, 41.5, 55.5, 69.5, 83.5];

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0.5rem', color: '#fff' }}>
      {/* Clue Banner */}
      <div style={{
        padding: '0.7rem 1.5rem', borderRadius: '14px', marginBottom: '0.8rem', textAlign: 'center',
        background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)',
        maxWidth: '500px', width: '100%',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Indizio: {narrator?.name}
        </div>
        <div style={{ color: '#e0d4fc', fontSize: '1.15rem', fontWeight: 800, fontStyle: 'italic' }}>"{state.clue}"</div>
      </div>

      {/* Scoreboard Button */}
      <button onClick={onOpenScoreboard} style={{
        padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.3)',
        background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600,
        cursor: 'pointer', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
      }}>
        🏆 Punteggio
      </button>

      {/* ===== BOARD (faccia) with face-up cards ===== */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '650px', marginBottom: '1rem',
        borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.2)',
      }}>
        <img src={BOARD_FACCIA} alt="Tabellone" style={{ width: '100%', display: 'block' }} />

        {/* Overlay cards on the faccia slots */}
        {sorted.map(tc => {
          const slotIdx = tc.position - 1; // 0-based
          if (slotIdx < 0 || slotIdx >= facciaSlotsX.length) return null;
          const isMyCard = myCardPositions.includes(tc.position);
          const isSelected = selectedPos === tc.position;
          const canSelect = !isNarrator && !myPlayer.hasVoted && !isMyCard;

          return (
            <div key={tc.position}
              onClick={() => canSelect && setSelectedPos(tc.position)}
              style={{
                position: 'absolute',
                top: '10%', left: `${facciaSlotsX[slotIdx]}%`,
                width: '14%', transform: 'translateX(-50%)',
                cursor: canSelect ? 'pointer' : 'default',
                opacity: isMyCard && !isNarrator ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}>
              {/* Position number */}
              <div style={{
                position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)',
                width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? '#7c3aed' : 'rgba(0,0,0,0.7)',
                color: '#fff', fontWeight: 800, fontSize: '0.75rem', zIndex: 5,
                border: isSelected ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.3)',
              }}>{tc.position}</div>

              {/* Card image */}
              <div style={{
                borderRadius: '5px', overflow: 'hidden',
                border: isSelected ? '3px solid #7c3aed' : isMyCard ? '2px dashed rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isSelected ? '0 0 16px rgba(124, 58, 237, 0.6)' : '0 2px 8px rgba(0,0,0,0.4)',
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
                  color: '#a78bfa', borderRadius: '50%', width: '20px', height: '20px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}><Eye size={10} /></button>

              {isMyCard && !isNarrator && (
                <div style={{ textAlign: 'center', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>La tua</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Voting Section */}
      {isNarrator ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🎭</div>
          Sei il narratore — attendi che gli altri votino.
          {waitingFor.length > 0 && (
            <div style={{ marginTop: '0.2rem', fontSize: '0.75rem' }}>In attesa di: {waitingFor.map(p => p.name).join(', ')}</div>
          )}
        </div>
      ) : myPlayer.hasVoted ? (
        <div style={{ textAlign: 'center', color: '#4ade80', fontSize: '0.9rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>✅</div>
          Voto inviato!
          {waitingFor.length > 0 && (
            <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>In attesa di: {waitingFor.map(p => p.name).join(', ')}</div>
          )}
        </div>
      ) : (
        <>
          {/* Voting Tokens */}
          {myPlayer.color && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.4rem', textAlign: 'center' }}>
                I tuoi token di voto:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {sorted.map(tc => {
                  const isMyCard = myCardPositions.includes(tc.position);
                  const isSelected = selectedPos === tc.position;
                  if (isMyCard) return null;
                  return (
                    <div key={tc.position} onClick={() => setSelectedPos(tc.position)}
                      style={{
                        cursor: 'pointer', borderRadius: '8px', overflow: 'hidden',
                        border: isSelected ? `3px solid ${COLOR_HEX[myPlayer.color!]}` : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: isSelected ? `0 0 12px ${COLOR_HEX[myPlayer.color!]}80` : 'none',
                        transform: isSelected ? 'scale(1.1)' : 'none',
                        transition: 'all 0.2s ease',
                      }}>
                      <img src={getVotingTokenPath(myPlayer.color!, tc.position)}
                        alt={`Token ${tc.position}`}
                        style={{ width: '48px', height: '48px', objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={handleVote} disabled={selectedPos === null}
            style={{
              padding: '0.8rem 2.5rem', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 700,
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
