import React, { useState } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { getCardImage, getPiliImage, getCardBack } from '../missions';

interface PiliPiliPlayProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onPlayCard: (card: number) => void;
}

export default function PiliPiliPlay({ state, myPlayer, onPlayCard }: PiliPiliPlayProps) {
  const isSimultaneous = !!state.currentMission?.simultaneousPlay;
  const isMyTurn = isSimultaneous ? !state.simultaneousCards[myPlayer.id] : state.currentTurnId === myPlayer.id;
  const [showMission, setShowMission] = useState(false);
  const [selectedSimCard, setSelectedSimCard] = useState<number | null>(null);

  // For mustPlayHighLow: only lowest and highest are playable
  const playableCards = (() => {
    if (!state.currentMission?.mustPlayHighLow) return myPlayer.hand;
    if (myPlayer.hand.length <= 2) return myPlayer.hand;
    const sorted = [...myPlayer.hand].sort((a, b) => a - b);
    return [sorted[0], sorted[sorted.length - 1]];
  })();

  const canPlay = (card: number) => isMyTurn && playableCards.includes(card);

  const handlePlay = (card: number) => {
    if (isSimultaneous) {
      setSelectedSimCard(card);
    } else if (canPlay(card)) {
      onPlayCard(card);
    }
  };

  const confirmSimultaneous = () => {
    if (selectedSimCard !== null) {
      onPlayCard(selectedSimCard);
      setSelectedSimCard(null);
    }
  };

  // How many have chosen in simultaneous mode
  const simChosen = Object.keys(state.simultaneousCards).length;

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', minHeight: '85vh',
      backgroundImage: 'url("/Pili Pili/Table Game/Table Game.jpg")',
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: '16px', overflow: 'hidden', position: 'relative',
      margin: '-1rem', padding: '1rem',
    }}>

      {/* Top-left: mission thumbnail */}
      {state.currentMission && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
          <img src={state.currentMission.image} alt={state.currentMission.name}
            onClick={() => setShowMission(true)}
            style={{
              width: '80px', height: 'auto', borderRadius: '8px', cursor: 'pointer',
              border: '2px solid rgba(234,88,12,0.6)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }} />
          <div style={{ fontSize: '0.6rem', color: '#fff', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.8)', marginTop: '2px' }}>
            #{state.currentMission.id}
          </div>
        </div>
      )}

      {/* Bottom-left: Pili count */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <img src={getPiliImage()} alt="Pili" style={{ width: '70px', height: 'auto', borderRadius: '6px', border: '2px solid rgba(239,68,68,0.6)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444', textShadow: '0 1px 4px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '2px 8px' }}>
          🌶️ {myPlayer.pilis}
        </div>
      </div>

      {/* Players info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.8rem', paddingTop: '0.3rem' }}>
        {state.players.map(p => {
          const isTurn = !isSimultaneous && state.currentTurnId === p.id;
          const isMe = p.id === myPlayer.id;
          const hasChosen = isSimultaneous && !!state.simultaneousCards[p.id];
          return (
            <div key={p.id} style={{
              background: isTurn ? 'rgba(234,88,12,0.35)' : isMe ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)', borderRadius: '10px',
              border: isTurn ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.15)',
              textAlign: 'center', minWidth: '85px', padding: '0.4rem 0.6rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: isMe ? '#fbbf24' : '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {p.name} {hasChosen ? '✅' : ''}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>🎯{p.bet} ✅{p.tricksWon}</div>
              <div style={{ fontSize: '0.7rem', color: '#f87171' }}>🌶️ {p.pilis}</div>
            </div>
          );
        })}
      </div>

      {/* Open hands: show all players' cards (missions 13, 27) */}
      {state.allHandsVisible && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {state.players.filter(p => p.id !== myPlayer.id).map(p => (
            <div key={p.id} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.3rem 0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.2rem' }}>{p.name}</div>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {p.hand.map((c, i) => (
                  <img key={i} src={getCardImage(c)} alt={`${c}`} style={{ width: '35px', height: 'auto', borderRadius: '3px' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forehead revealed cards (missions 10, 11) */}
      {Object.keys(state.foreheadRevealed).length > 0 && !state.allHandsVisible && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {Object.entries(state.foreheadRevealed).filter(([id]) => id !== myPlayer.id).map(([pid, cards]) => {
            const name = state.players.find(p => p.id === pid)?.name || '';
            return (
              <div key={pid} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.3rem 0.5rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.2rem' }}>{name} (fronte)</div>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {cards.map((c, i) => (
                    <img key={i} src={getCardImage(c)} alt={`${c}`} style={{ width: '35px', height: 'auto', borderRadius: '3px', border: '1px solid #fbbf24' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Play field */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', marginBottom: '0.8rem',
        background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(2px)',
        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', minHeight: '250px',
      }}>
        <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700, marginBottom: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          Presa {state.trickNumber + 1}/{state.totalTricks}
          {isSimultaneous && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>⚡ Giocata simultanea</span>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', minHeight: '140px' }}>
          {state.currentTrick.map((played, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', marginBottom: '0.3rem', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {state.players.find(p => p.id === played.playerId)?.name}
              </div>
              <img src={getCardImage(played.card)} alt={`${played.card}`} style={{
                width: '85px', height: 'auto', borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.2)',
              }} />
            </div>
          ))}
          {state.currentTrick.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '1.1rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              Tavolo vuoto
            </div>
          )}
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isSimultaneous ? (
            <div style={{ color: '#fbbf24', fontSize: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {state.simultaneousCards[myPlayer.id] ? `✅ Carta scelta! (${simChosen}/${state.players.length})` : '🔥 Scegli la tua carta!'}
            </div>
          ) : isMyTurn ? (
            <div style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: 700, textShadow: '0 2px 6px rgba(0,0,0,0.6)', animation: 'pulse 1.5s infinite' }}>
              🔥 È il tuo turno!
              {state.currentMission?.mustPlayHighLow && <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>⚠️ Solo la carta più alta o più bassa!</div>}
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              Turno di {state.players.find(p => p.id === state.currentTurnId)?.name}...
            </div>
          )}
        </div>
      </div>

      {/* My hand */}
      <div style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          Le tue carte:
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {myPlayer.hand.map((card, i) => {
            const isPlayable = canPlay(card);
            const isSelected = selectedSimCard === card;
            const isBlind = state.blindPlay;
            return (
              <button key={i}
                onClick={() => { if (isPlayable && !state.simultaneousCards[myPlayer.id]) handlePlay(card); }}
                disabled={!isPlayable || !!state.simultaneousCards[myPlayer.id]}
                style={{
                  padding: 0, border: 'none', background: 'none',
                  cursor: isPlayable ? 'pointer' : 'default',
                  transform: isSelected ? 'translateY(-18px) scale(1.08)' : isPlayable ? 'translateY(-8px)' : 'none',
                  transition: 'transform 0.2s, filter 0.2s',
                  opacity: isPlayable ? 1 : 0.5,
                  filter: isPlayable ? 'none' : 'grayscale(0.3)',
                }}
                onMouseEnter={e => { if (isPlayable) (e.currentTarget as HTMLElement).style.transform = 'translateY(-18px) scale(1.08)'; }}
                onMouseLeave={e => { if (isPlayable && !isSelected) (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; }}
              >
                <img
                  src={isBlind ? getCardBack() : getCardImage(card)}
                  alt={isBlind ? 'Coperta' : `Carta ${card}`}
                  style={{
                    width: myPlayer.hand.length > 6 ? '65px' : '80px',
                    height: 'auto', borderRadius: '8px',
                    boxShadow: isSelected ? '0 8px 24px rgba(234,88,12,0.5)' : isPlayable ? '0 8px 24px rgba(234,88,12,0.4), 0 4px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.3)',
                    border: isSelected ? '3px solid #ea580c' : isPlayable ? '2px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Simultaneous confirm button */}
        {isSimultaneous && selectedSimCard !== null && !state.simultaneousCards[myPlayer.id] && (
          <button onClick={confirmSimultaneous} style={{
            marginTop: '1rem', padding: '0.7rem 2rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #ea580c, #dc2626)',
            border: 'none', borderRadius: '10px', cursor: 'pointer',
          }}>
            Conferma Carta ✅
          </button>
        )}
      </div>

      {/* Mission fullscreen modal */}
      {showMission && state.currentMission && (
        <div onClick={() => setShowMission(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', cursor: 'pointer',
        }}>
          <img src={state.currentMission.image} alt={state.currentMission.name} style={{
            maxWidth: '90vw', maxHeight: '60vh', borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(234,88,12,0.5)', border: '2px solid rgba(234,88,12,0.5)', marginBottom: '1rem',
          }} />
          <h3 style={{ color: '#fbbf24', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            Missione #{state.currentMission.id}: {state.currentMission.name}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
            {state.currentMission.description}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '1.5rem' }}>Tocca per chiudere</p>
        </div>
      )}
    </div>
  );
}
