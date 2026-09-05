import React from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { getCardImage } from '../missions';

interface PiliPiliSwapTrickProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onPickTarget: (targetId: string) => void;
  onPickCard: (card: number) => void;
}

export default function PiliPiliSwapTrick({ state, myPlayer, onPickTarget, onPickCard }: PiliPiliSwapTrickProps) {
  const winnerId = state.swapTrickWinnerId;
  const targetId = state.swapTrickTargetId;
  const isWinner = myPlayer.id === winnerId;
  const isTarget = myPlayer.id === targetId;
  const winnerName = state.players.find(p => p.id === winnerId)?.name || '';
  const targetName = state.players.find(p => p.id === targetId)?.name || '';

  // Step 1: Winner picks target player
  if (!targetId && isWinner) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
        <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔄 Scambio dopo presa</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Hai vinto la presa! Scegli con chi scambiare una carta:
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {state.players.filter(p => p.id !== myPlayer.id && p.hand.length > 0).map(p => (
            <button
              key={p.id}
              onClick={() => onPickTarget(p.id)}
              style={{
                padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1b: Not winner, waiting for target selection
  if (!targetId && !isWinner) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔄 Scambio dopo presa</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {winnerName} sta scegliendo con chi scambiare...
        </p>
      </div>
    );
  }

  // Step 2: Both winner and target pick a card to give
  if (targetId) {
    const iNeedToPickCard = (isWinner && state.swapTrickWinnerCard === null) || (isTarget && state.swapTrickTargetCard === null);
    const iAlreadyPicked = (isWinner && state.swapTrickWinnerCard !== null) || (isTarget && state.swapTrickTargetCard !== null);

    if (iNeedToPickCard) {
      return (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
          <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔄 Scegli carta da dare</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Scambio tra <strong>{winnerName}</strong> e <strong>{targetName}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Seleziona una carta da cedere:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {myPlayer.hand.map((card, i) => (
              <button
                key={i}
                onClick={() => onPickCard(card)}
                style={{
                  padding: 0, border: 'none', background: 'none', cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px) scale(1.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <img
                  src={getCardImage(card)}
                  alt={`Carta ${card}`}
                  style={{
                    width: '70px', height: 'auto', borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(234, 88, 12, 0.3)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (iAlreadyPicked) {
      return (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔄 Scambio in corso</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            ✅ Carta scelta! In attesa dell'altro giocatore...
          </p>
        </div>
      );
    }

    // Not involved in the swap
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: '#ea580c', marginBottom: '0.5rem' }}>🔄 Scambio in corso</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {winnerName} e {targetName} stanno scambiando una carta...
        </p>
      </div>
    );
  }

  return null;
}
