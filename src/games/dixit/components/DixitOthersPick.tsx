import React, { useState } from 'react';
import { DixitState } from '../types';
import { getCardImagePath, CARD_BACK } from '../cards';
import { getCardsToPlay } from '../gameLogic';

interface Props {
  state: DixitState;
  playerId: string;
  onPlayerPick: (cardIds: number[]) => void;
}

export default function DixitOthersPick({ state, playerId, onPlayerPick }: Props) {
  const myPlayer = state.players.find(p => p.id === playerId);
  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;
  const [selected, setSelected] = useState<number[]>([]);
  const cardsNeeded = getCardsToPlay(state.players.length);

  if (!myPlayer) return null;

  const toggleCard = (cardId: number) => {
    setSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(c => c !== cardId);
      if (prev.length >= cardsNeeded) return prev;
      return [...prev, cardId];
    });
  };

  const handleSubmit = () => {
    if (selected.length === cardsNeeded) onPlayerPick(selected);
  };

  const waitingFor = state.players.filter(p => p.id !== narrator.id && !p.hasPlayed);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', color: '#fff' }}>
      {/* Clue Banner */}
      <div style={{
        padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', textAlign: 'center',
        background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)',
        maxWidth: '500px', width: '100%',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Indizio del Narratore ({narrator?.name}):
        </div>
        <div style={{ color: '#e0d4fc', fontSize: '1.4rem', fontWeight: 800, fontStyle: 'italic' }}>
          "{state.clue}"
        </div>
      </div>

      {isNarrator ? (
        /* Narrator waits */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>⏳</div>
          <h2 style={{ color: '#a78bfa', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Gli altri giocatori stanno scegliendo le loro carte...
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            {waitingFor.length > 0 ? `In attesa di: ${waitingFor.map(p => p.name).join(', ')}` : 'Tutti pronti!'}
          </div>
        </div>
      ) : myPlayer.hasPlayed ? (
        /* Already played */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Carta inviata!
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            {waitingFor.length > 0 ? `In attesa di: ${waitingFor.map(p => p.name).join(', ')}` : 'Tutti pronti!'}
          </div>
        </div>
      ) : (
        /* Pick cards */
        <>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem', color: '#c4b5fd', textAlign: 'center' }}>
            {cardsNeeded > 1 ? `Scegli ${cardsNeeded} carte` : 'Scegli una carta'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {cardsNeeded > 1
              ? `Scegli ${cardsNeeded} carte dalla tua mano che possano confondere gli altri giocatori.`
              : 'Scegli una carta dalla tua mano che possa confondere gli altri giocatori.'}
          </p>

          {/* Hand */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem', maxWidth: '700px' }}>
            {myPlayer.hand.map(cardId => {
              const isSelected = selected.includes(cardId);
              return (
                <div key={cardId} onClick={() => toggleCard(cardId)}
                  style={{
                    width: '110px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: isSelected ? '3px solid #7c3aed' : '2px solid rgba(124, 58, 237, 0.2)',
                    boxShadow: isSelected ? '0 0 20px rgba(124, 58, 237, 0.5)' : 'none',
                    transform: isSelected ? 'translateY(-8px) scale(1.05)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                  <img src={getCardImagePath(cardId)} alt={`Carta ${cardId}`} style={{ width: '100%', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = CARD_BACK; }} />
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%',
                      background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.75rem',
                    }}>✓</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={selected.length !== cardsNeeded}
            style={{
              padding: '0.9rem 2.5rem', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 700,
              cursor: selected.length === cardsNeeded ? 'pointer' : 'not-allowed',
              color: '#fff',
              background: selected.length === cardsNeeded ? 'linear-gradient(135deg, #c4b5fd, #7c3aed)' : 'rgba(124, 58, 237, 0.2)',
              boxShadow: selected.length === cardsNeeded ? '0 6px 20px rgba(124, 58, 237, 0.4)' : 'none',
            }}>
            Invia {cardsNeeded > 1 ? 'carte' : 'carta'} ({selected.length}/{cardsNeeded})
          </button>
        </>
      )}
    </div>
  );
}
