import React, { useState } from 'react';
import { DixitState } from '../types';
import { getCardImagePath, CARD_BACK, BOARD_DORSO, BOARD_FACCIA } from '../cards';
import { getCardsToPlay, MAX_DISCARDS_PER_TURN } from '../gameLogic';
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

  const discardsUsed = myPlayer.discardsUsed || 0;
  const discardsRemaining = MAX_DISCARDS_PER_TURN - discardsUsed;
  const canDiscard = discardsRemaining > 0;

  const toggleCard = (cardId: number) => {
    if (discardMode) return;
    setSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(c => c !== cardId);
      if (prev.length >= cardsNeeded) return prev;
      return [...prev, cardId];
    });
  };

  const toggleDiscard = (cardId: number) => {
    setDiscardSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(c => c !== cardId);
      if (prev.length >= 2) return prev; // max 2 per use
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

  // Board layout logic
  const playedCount = state.tableCards.length;
  const totalPlayers = state.players.length;
  const needsDualBoard = totalPlayers > 6;

  // Non-narrator cards (exclude narrator's card at index 0)
  const nonNarratorCards = state.tableCards.slice(1);

  // Dorso board slot positions
  const bottomSlotX = [14, 30.5, 47, 63.5, 80];
  const bottomSlotOrder = [2, 1, 3, 0, 4]; // center→outward fill

  // For 7+ players: first board shows narrator + first 5 others, second board shows remaining
  const firstBoardCards = nonNarratorCards.slice(0, 5);
  const secondBoardCards = needsDualBoard ? nonNarratorCards.slice(5) : [];

  // Faccia board slot positions (for second board)
  const facciaSlotsX = [16, 29.5, 43, 56.5, 70, 83.5];

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

      {/* ===== BOARD 1 (dorso) — narrator card + first 5 others ===== */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '650px', marginBottom: needsDualBoard ? '0.5rem' : '1rem',
        borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.2)',
      }}>
        <img src={BOARD_DORSO} alt="Tabellone" style={{ width: '100%', display: 'block' }} />

        {/* Narrator card (top slot) */}
        {playedCount >= 1 && (
          <img src={CARD_BACK} alt="Carta narratore"
            style={{
              position: 'absolute',
              top: '4%', left: '48.5%', transform: 'translateX(-50%)',
              width: '12.5%', borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }} />
        )}

        {/* Non-narrator cards — first 5, center outward */}
        {(() => {
          const filledSlots: number[] = [];
          for (let i = 0; i < firstBoardCards.length && i < 5; i++) {
            filledSlots.push(bottomSlotOrder[i]);
          }
          return filledSlots.map((slotIdx, i) => (
            <img key={i} src={CARD_BACK} alt="Carta giocatore"
              style={{
                position: 'absolute',
                bottom: '5%', left: `${bottomSlotX[slotIdx]}%`,
                width: '12.5%', borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }} />
          ));
        })()}
      </div>

      {/* ===== BOARD 2 (faccia) — remaining cards for 7+ players ===== */}
      {needsDualBoard && (
        <div style={{
          position: 'relative', width: '100%', maxWidth: '650px', marginBottom: '1rem',
          borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(124, 58, 237, 0.2)',
        }}>
          <img src={BOARD_FACCIA} alt="Tabellone 2" style={{ width: '100%', display: 'block' }} />

          {/* Cards on second board — up to 6 slots */}
          {secondBoardCards.map((_, i) => {
            if (i >= 6) return null;
            return (
              <img key={i} src={CARD_BACK} alt="Carta giocatore"
                style={{
                  position: 'absolute',
                  top: '18%', left: `${facciaSlotsX[i]}%`, transform: 'translateX(-50%)',
                  width: '12%', borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }} />
            );
          })}
        </div>
      )}

      {/* Status */}
      <div style={{
        fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', textAlign: 'center',
      }}>
        Carte sul tavolo: {playedCount}/{totalPlayers}
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

          {/* Toggle discard mode — show remaining uses */}
          {!discardMode && (
            <button onClick={() => { setDiscardMode(true); setSelected([]); }}
              disabled={!canDiscard}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                background: canDiscard ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.03)',
                color: canDiscard ? '#f87171' : 'rgba(248,113,113,0.4)',
                fontSize: '0.8rem', fontWeight: 600,
                cursor: canDiscard ? 'pointer' : 'not-allowed',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
              <Trash2 size={14} /> Scarta carte ({discardsRemaining}/{MAX_DISCARDS_PER_TURN} rimasti)
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
