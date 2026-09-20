import React from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getRoleById } from '../roles';
import { Eye, Check, Clock, Sparkles } from 'lucide-react';

interface Props {
  state: MascaradeState;
  myPlayer: MascaradePlayer;
  onViewed: () => void;
}

export default function MascaradeViewCard({ state, myPlayer, onViewed }: Props) {
  const role = getRoleById(myPlayer.roleId);
  const alreadyViewed = myPlayer.hasViewedCard;
  const viewedCount = state.players.filter(p => p.hasViewedCard).length;
  const totalPlayers = state.players.length;

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      color: '#fff',
    }}>
      {/* Header Phase Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.9rem',
        borderRadius: '20px',
        background: 'rgba(212, 168, 67, 0.15)',
        border: '1px solid rgba(212, 168, 67, 0.4)',
        color: '#d4a843',
        fontSize: '0.85rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        <Eye size={16} />
        Visione della Carta
      </div>

      <h2 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#d4a843',
        margin: '0 0 0.4rem 0',
        textAlign: 'center',
        textShadow: '0 2px 12px rgba(212, 168, 67, 0.25)',
      }}>
        Memorizza il tuo Ruolo
      </h2>

      <p style={{
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.7)',
        margin: '0 0 1.5rem 0',
        textAlign: 'center',
        maxWidth: '420px',
        lineHeight: 1.4,
      }}>
        Questa è l'unica occasione per guardare liberamente la tua carta prima degli scambi.
      </p>

      {/* Main Glassmorphism Card Frame */}
      <div style={{
        background: 'rgba(20, 16, 28, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 168, 67, 0.35)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 168, 67, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '360px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          width: '140px',
          height: '60px',
          background: 'rgba(212, 168, 67, 0.2)',
          filter: 'blur(30px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* Card Image */}
        <div style={{
          position: 'relative',
          marginBottom: '1.2rem',
          borderRadius: '12px',
          padding: '4px',
          background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.6), rgba(184, 134, 11, 0.2))',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        }}>
          <img
            src={role.image}
            alt={role.name}
            style={{
              width: '150px',
              height: 'auto',
              borderRadius: '8px',
              display: 'block',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Role Name */}
        <h3 style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#d4a843',
          margin: '0 0 0.5rem 0',
          letterSpacing: '0.02em',
        }}>
          {role.name}
        </h3>

        {/* Role Description Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(212, 168, 67, 0.15)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '0.5rem',
        }}>
          <p style={{
            fontSize: '0.88rem',
            lineHeight: 1.45,
            color: 'rgba(255, 255, 255, 0.85)',
            margin: 0,
          }}>
            {role.description}
          </p>
        </div>

        {/* Action Button or Waiting Status */}
        {!alreadyViewed ? (
          <button
            onClick={onViewed}
            style={{
              marginTop: '1.2rem',
              width: '100%',
              padding: '0.85rem 1.5rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#1a1408',
              background: 'linear-gradient(135deg, #f5d77f 0%, #d4a843 50%, #b8860b 100%)',
              border: '1px solid rgba(255, 230, 150, 0.6)',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(212, 168, 67, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <Check size={20} strokeWidth={2.5} />
            Ho visto la mia carta ✓
          </button>
        ) : (
          <div style={{
            marginTop: '1.2rem',
            width: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(212, 168, 67, 0.25)',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#d4a843',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
            }}>
              <Clock size={16} />
              In attesa degli altri...
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.75)',
              marginBottom: '0.65rem',
            }}>
              Hanno visto: <strong style={{ color: '#d4a843' }}>{viewedCount}</strong> di <strong style={{ color: '#fff' }}>{totalPlayers}</strong> giocatori
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '5px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '0.8rem',
            }}>
              <div style={{
                width: `${totalPlayers > 0 ? Math.round((viewedCount / totalPlayers) * 100) : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #b8860b, #d4a843, #f5d77f)',
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Players Status Chips */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              justifyContent: 'center',
            }}>
              {state.players.map(p => {
                const isMe = p.id === myPlayer.id;
                const hasViewed = p.hasViewedCard;
                return (
                  <span
                    key={p.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '14px',
                      fontSize: '0.72rem',
                      background: hasViewed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: hasViewed ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: hasViewed ? '#4ade80' : 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {hasViewed ? <Check size={11} strokeWidth={2.5} /> : <Clock size={11} />}
                    {p.name} {isMe && '(Tu)'}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
