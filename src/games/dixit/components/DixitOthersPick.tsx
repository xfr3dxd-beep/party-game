import React, { useState } from 'react';
import { DixitState } from '../types';
import { getCardImagePath, CARD_BACK, BOARD_DORSO } from '../cards';
import { getCardsToPlay } from '../gameLogic';
import { Eye, Trash2 } from 'lucide-react';

interface Props {
  state: DixitState;
  playerId: string;
  onPlayerPick: (cardIds: number[]) => void;
  onDiscardCards: (cardIds: number[]) => void;
  onZoomCard: (cardId: number) => void;
}

export default function DixitOthersPick({ state, playerId, onPlayerPick, onDiscardCards, onZoomCard }: Props) {
  const myPlayer = state.players.find(p => p.id === playerId);
  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;
  const [selected, setSelected] = useState<number[]>([]);
  const [discardMode, setDiscardMode] = useState(false);
  const [discardSelected, setDiscardSelected] = useState<number[]>([]);
  const cardsNeeded = getCardsToPlay(state.players.length);

  if (!myPlayer) return null;

  const toggleCard = (cardId: number) => {
    if (discardMode) return; // don't select for play in discard mode
    setSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(c => c !== cardId);
      if (prev.length >= cardsNeeded) return prev;
      return [...prev, cardId];
    });
  };

  const toggleDiscard = (cardId: number) => {
    setDiscardSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(c => c !== cardId);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, cardId];
    });
  };

  const handleSubmit = () => {
    if (selected.length === cardsNeeded) onPlayerPick(selected);
  };

  const handleDiscard = () => {
    if (discardSelected.length > 0) {
      onDiscardCards(discardSelected);
      setDiscardSelected([]);
      setDiscardMode(false);
    }
  };

  const waitingFor = state.players.filter(p => p.id !== narrator.id && !p.hasPlayed);

  // ---- Board View: show dorso with face-down cards appearing ----
  // Narrator's card is always placed (index 0 in tableCards).
  // Others' cards appear as they play them.
  const playedCount = state.tableCards.length; // includes narrator's card
  // The non-narrator slots: center outward. Bottom row has 5 slots.
  // The order: center slot first, then left, right, far-left, far-right.
  // Bottom slot positions (percentage from left of the board image):
  // Dorso layout: top slot = narrator (center), bottom 5 slots = others
  // Slots indexed 0-4 from center outward: 2, 1, 3, 0, 4
  const bottomSlotOrder = [2, 1, 3, 0, 4]; // center→outward fill order
  const nonNarratorCards = state.tableCards.slice(1); // exclude narrator's card

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0.5rem', color: '#fff' }}>
      {/* Clue Banner */}
      <div style={{
        padding: '0.8rem 1.5rem', borderRadius: '14px', marginBottom: '1rem', textAlign: 'center',
        background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)',
        maxWidth: '500px', width: '100%',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Indizio del Narratore ({narrator?.name}):
        </div>
        <div style={{ color: '#e0d4fc', fontSize: '1.3rem', fontWeight: 800, fontStyle: 'italic' }}>"{state.clue}"</div>
      </div>

      {/* ===== BOARD VIEW (dorso) — cards appearing progressively ===== */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '650px', marginBottom: '1rem',
        borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.2)',
      }}>
        <img src={BOARD_DORSO} alt="Tabellone" style={{ width: '100%', display: 'block' }} />

        {/* Narrator card (top slot) */}
        {playedCount >= 1 && (
          <img src={CARD_BACK} alt="Carta narratore"
            style={{
              position: 'absolute',
              top: '2%', left: '50%', transform: 'translateX(-50%)',
              width: '14%', borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }} />
        )}

        {/* Non-narrator cards (bottom row, center outward) */}
        {(() => {
          // Bottom row slot positions (% from left edge of image)
          const bottomSlotX = [14.5, 28, 41.5, 55, 68.5]; // 5 slots equally spaced
          const filledSlots: number[] = [];
          // Fill from center outward
          for (let i = 0; i < nonNarratorCards.length && i < 5; i++) {
            filledSlots.push(bottomSlotOrder[i]);
          }
          return filledSlots.map((slotIdx, i) => (
            <img key={i} src={CARD_BACK} alt="Carta giocatore"
              style={{
                position: 'absolute',
                bottom: '5%', left: `${bottomSlotX[slotIdx]}%`,
                width: '14%', borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }} />
          ));
        })()}
      </div>

      {/* Status */}
      <div style={{
        fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', textAlign: 'center',
      }}>
        Carte sul tavolo: {playedCount}/{state.players.length}
        {waitingFor.length > 0 && ` — In attesa di: ${waitingFor.map(p => p.name).join(', ')}`}
      </div>

      {isNarrator ? (
        /* Narrator waits */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'pulse 2s infinite' }}>⏳</div>
          <h3 style={{ color: '#a78bfa', fontSize: '1.1rem', fontWeight: 700 }}>
            Gli altri giocatori stanno scegliendo...
          </h3>
        </div>
      ) : myPlayer.hasPlayed ? (
        /* Already played */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: 700 }}>Carta inviata!</h3>
        </div>
      ) : (
        /* ===== PICK CARDS (with discard option) ===== */
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c4b5fd', margin: 0 }}>
              {discardMode ? 'Scegli carte da scartare (max 2)' : cardsNeeded > 1 ? `Scegli ${cardsNeeded} carte` : 'Scegli una carta'}
            </h2>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: '0.8rem', textAlign: 'center', maxWidth: '420px' }}>
            {discardMode
              ? 'Seleziona fino a 2 carte da rimuovere dal gioco. Pescherai carte nuove dal mazzo.'
              : 'Scegli una carta che possa confondere gli altri. Puoi anche scartarne prima.'}
          </p>

          {/* Toggle discard mode */}
          {!discardMode && (
            <button onClick={() => { setDiscardMode(true); setSelected([]); }}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
              <Trash2 size={14} /> Scarta carte (max 2)
            </button>
          )}

          {/* Hand */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', justifyContent: 'center', marginBottom: '1.2rem', maxWidth: '700px' }}>
            {myPlayer.hand.map(cardId => {
              const isSelected = selected.includes(cardId);
              const isDiscardSelected = discardSelected.includes(cardId);
              const highlight = discardMode ? isDiscardSelected : isSelected;
              const borderColor = discardMode
                ? (isDiscardSelected ? '#ef4444' : 'rgba(239,68,68,0.2)')
                : (isSelected ? '#7c3aed' : 'rgba(124, 58, 237, 0.2)');

              return (
                <div key={cardId}
                  onClick={() => discardMode ? toggleDiscard(cardId) : toggleCard(cardId)}
                  style={{
                    width: '100px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: `${highlight ? 3 : 2}px solid ${borderColor}`,
                    boxShadow: highlight
                      ? `0 0 18px ${discardMode ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.5)'}`
                      : 'none',
                    transform: highlight ? 'translateY(-6px) scale(1.04)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                  {/* Eye zoom */}
                  <button onClick={e => { e.stopPropagation(); onZoomCard(cardId); }}
                    style={{
                      position: 'absolute', top: '3px', right: '3px', zIndex: 2,
                      background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(124,58,237,0.5)',
                      color: '#a78bfa', borderRadius: '50%', width: '22px', height: '22px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}><Eye size={11} /></button>
                  <img src={getCardImagePath(cardId)} alt={`Carta ${cardId}`} style={{ width: '100%', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }} />
                  {/* Selection badge */}
                  {isSelected && !discardMode && (
                    <div style={{
                      position: 'absolute', top: '3px', left: '3px', width: '22px', height: '22px', borderRadius: '50%',
                      background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.7rem',
                    }}>✓</div>
                  )}
                  {isDiscardSelected && discardMode && (
                    <div style={{
                      position: 'absolute', top: '3px', left: '3px', width: '22px', height: '22px', borderRadius: '50%',
                      background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.7rem',
                    }}>✕</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          {discardMode ? (
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => { setDiscardMode(false); setDiscardSelected([]); }}
                style={{
                  padding: '0.7rem 1.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer',
                }}>Annulla</button>
              <button onClick={handleDiscard} disabled={discardSelected.length === 0}
                style={{
                  padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', fontSize: '0.9rem', fontWeight: 700,
                  cursor: discardSelected.length > 0 ? 'pointer' : 'not-allowed', color: '#fff',
                  background: discardSelected.length > 0 ? 'linear-gradient(135deg, #fca5a5, #ef4444)' : 'rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                <Trash2 size={16} /> Scarta {discardSelected.length} carta{discardSelected.length !== 1 ? 'e' : ''}
              </button>
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={selected.length !== cardsNeeded}
              style={{
                padding: '0.8rem 2.5rem', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 700,
                cursor: selected.length === cardsNeeded ? 'pointer' : 'not-allowed', color: '#fff',
                background: selected.length === cardsNeeded ? 'linear-gradient(135deg, #c4b5fd, #7c3aed)' : 'rgba(124, 58, 237, 0.2)',
                boxShadow: selected.length === cardsNeeded ? '0 6px 20px rgba(124, 58, 237, 0.4)' : 'none',
              }}>
              Invia {cardsNeeded > 1 ? 'carte' : 'carta'} ({selected.length}/{cardsNeeded})
            </button>
          )}
        </>
      )}
    </div>
  );
}
