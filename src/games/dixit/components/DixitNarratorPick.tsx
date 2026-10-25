import React, { useState } from 'react';
import { DixitState } from '../types';
import { getCardImagePath, CARD_BACK } from '../cards';
import { Send, Eye } from 'lucide-react';

interface Props {
  state: DixitState;
  playerId: string;
  onNarratorPick: (cardId: number, clue: string) => void;
  onZoomCard: (cardId: number) => void;
}

export default function DixitNarratorPick({ state, playerId, onNarratorPick, onZoomCard }: Props) {
  const myPlayer = state.players.find(p => p.id === playerId);
  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [clue, setClue] = useState('');

  if (!myPlayer) return null;

  const handleSubmit = () => {
    if (selectedCard !== null && clue.trim()) {
      onNarratorPick(selectedCard, clue.trim());
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', color: '#fff' }}>
      {/* Round Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '20px',
        background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)',
        color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem',
      }}>
        📖 Round {state.roundNumber} — {isNarrator ? 'Sei il Narratore!' : `Narratore: ${narrator?.name}`}
      </div>

      {isNarrator ? (
        <>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', color: '#c4b5fd' }}>
            Scegli una carta e dai un indizio
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '400px' }}>
            Seleziona una carta dalla tua mano e scrivi un indizio che la descriva. Non deve essere troppo facile né troppo difficile!
          </p>

          {/* Hand */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem', maxWidth: '700px',
          }}>
            {myPlayer.hand.map(cardId => (
              <div key={cardId} onClick={() => setSelectedCard(cardId)}
                style={{
                  width: '110px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                  border: selectedCard === cardId ? '3px solid #7c3aed' : '2px solid rgba(124, 58, 237, 0.2)',
                  boxShadow: selectedCard === cardId ? '0 0 20px rgba(124, 58, 237, 0.5)' : 'none',
                  transform: selectedCard === cardId ? 'translateY(-8px) scale(1.05)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {/* Eye zoom button */}
                <button onClick={e => { e.stopPropagation(); onZoomCard(cardId); }}
                  style={{
                    position: 'absolute', top: '4px', right: '4px', zIndex: 2,
                    background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(124,58,237,0.5)',
                    color: '#a78bfa', borderRadius: '50%', width: '24px', height: '24px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0,
                  }}><Eye size={13} /></button>
                <img src={getCardImagePath(cardId)} alt={`Carta ${cardId}`}
                  style={{ width: '100%', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }}
                />
              </div>
            ))}
          </div>

          {/* Clue Input */}
          {selectedCard !== null && (
            <div style={{ width: '100%', maxWidth: '420px', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                ✨ Il tuo indizio:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={clue} onChange={e => setClue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="Scrivi il tuo indizio..."
                  maxLength={100}
                  style={{
                    flex: 1, padding: '0.85rem 1rem', background: 'rgba(10, 8, 24, 0.65)',
                    border: '1px solid rgba(124, 58, 237, 0.35)', borderRadius: '10px',
                    color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button onClick={handleSubmit} disabled={!clue.trim()}
                  style={{
                    padding: '0.85rem 1.2rem', borderRadius: '10px', border: 'none', cursor: clue.trim() ? 'pointer' : 'not-allowed',
                    background: clue.trim() ? 'linear-gradient(135deg, #c4b5fd, #7c3aed)' : 'rgba(124, 58, 237, 0.2)',
                    color: '#fff', display: 'flex', alignItems: 'center',
                  }}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>🤔</div>
          <h2 style={{ color: '#a78bfa', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {narrator?.name} sta scegliendo una carta...
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            Attendi mentre il narratore sceglie una carta e scrive un indizio.
          </p>

          {/* Show own hand (preview only) */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>La tua mano:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {myPlayer.hand.map(cardId => (
                <div key={cardId} style={{ width: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.15)', opacity: 0.7, position: 'relative' }}>
                  <button onClick={e => { e.stopPropagation(); onZoomCard(cardId); }}
                    style={{
                      position: 'absolute', top: '3px', right: '3px', zIndex: 2,
                      background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(124,58,237,0.5)',
                      color: '#a78bfa', borderRadius: '50%', width: '22px', height: '22px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0,
                    }}><Eye size={11} /></button>
                  <img src={getCardImagePath(cardId)} alt={`Carta ${cardId}`} style={{ width: '100%', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
