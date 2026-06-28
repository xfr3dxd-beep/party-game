import React, { useState } from 'react';
import { Player } from '../types';

interface CardTableProps {
  players: Player[];
  currentPickIndex: number;
  onPickCard: (playerIndex: number, cardIndex: number) => void;
  getPlayerWord: (player: Player) => { word: string; hint?: string };
}

export default function CardTable({ players, currentPickIndex, onPickCard, getPlayerWord }: CardTableProps) {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [pickedCards, setPickedCards] = useState<Map<number, number>>(new Map()); // cardIndex -> playerIndex

  const currentPlayer = currentPickIndex < players.length ? players[currentPickIndex] : null;

  const handleCardClick = (cardIndex: number) => {
    // If this card is already picked, do nothing
    if (pickedCards.has(cardIndex)) return;

    // If a card is currently flipped (being read), do nothing
    if (flippedCard !== null) return;

    // If no current player, do nothing
    if (!currentPlayer) return;

    // Flip the card
    setFlippedCard(cardIndex);
    setRevealedCards(prev => new Set(prev).add(cardIndex));
  };

  const handleCardRead = () => {
    if (flippedCard === null || !currentPlayer) return;

    // Mark card as picked by current player
    const newPickedCards = new Map(pickedCards);
    newPickedCards.set(flippedCard, currentPickIndex);
    setPickedCards(newPickedCards);

    // Unflip the card
    setFlippedCard(null);

    // Notify parent
    onPickCard(currentPickIndex, flippedCard);
  };

  const playerWord = currentPlayer ? getPlayerWord(currentPlayer) : null;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-xl">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {currentPlayer ? (
            <>Tocca a <span className="text-gradient">{currentPlayer.name}</span></>
          ) : (
            <span className="text-gradient">Tutte le carte sono state scelte!</span>
          )}
        </h2>
        {currentPlayer && (
          <p className="text-muted mt-sm">Scegli una carta dalla tavola</p>
        )}
      </div>

      <div className="card-table">
        {players.map((_, cardIndex) => {
          const isPicked = pickedCards.has(cardIndex);
          const isFlipped = flippedCard === cardIndex;
          const pickerIndex = pickedCards.get(cardIndex);
          const picker = pickerIndex !== undefined ? players[pickerIndex] : null;

          // When this card is flipped, show the CURRENT player's word (not tied to card position)
          return (
            <div
              key={cardIndex}
              className={`game-playing-card ${isPicked ? 'picked' : ''} ${isFlipped ? 'flipped' : ''}`}
              onClick={() => !isPicked && !isFlipped && handleCardClick(cardIndex)}
            >
              <div className="game-playing-card-inner">
                <div className="game-playing-card-front">
                  {isPicked ? (
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                      {picker?.name}
                    </span>
                  ) : (
                    <span className="card-question-mark">?</span>
                  )}
                </div>
                <div className="game-playing-card-back" onClick={e => { e.stopPropagation(); handleCardRead(); }}>
                  {playerWord && (
                    <>
                      <div className="card-word">{playerWord.word}</div>
                      {playerWord.hint && (
                        <div style={{
                          marginTop: 'var(--space-sm)',
                          fontSize: '0.8rem',
                          color: 'var(--accent-amber-light)',
                          fontStyle: 'italic',
                        }}>
                          Indizio: {playerWord.hint}
                        </div>
                      )}
                      <p style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                        marginTop: 'var(--space-sm)',
                      }}>
                        Tocca per confermare
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
