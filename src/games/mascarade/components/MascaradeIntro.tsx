import React from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getRoleById } from '../roles';
import { Check, Volume2, User, Clock, Sparkles } from 'lucide-react';

interface Props {
  state: MascaradeState;
  myPlayer: MascaradePlayer;
  onIntroDone: () => void;
}

export default function MascaradeIntro({ state, myPlayer, onIntroDone }: Props) {
  const introducingPlayer = state.players.find(p => p.seatIndex === state.introIndex) || state.players[0];
  const isIntroducer = introducingPlayer ? introducingPlayer.id === myPlayer.id : false;
  const role = introducingPlayer ? getRoleById(introducingPlayer.roleId) : null;
  const totalPlayers = state.players.length;
  const introducedCount = state.players.filter(p => p.hasIntroduced).length;
  const sortedPlayers = [...state.players].sort((a, b) => a.seatIndex - b.seatIndex);

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
      {/* Header Phase Badge */}
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
        <Volume2 size={16} />
        Presentazione dei Ruoli
      </div>

      <h2 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#d4a843',
        margin: '0 0 0.4rem 0',
        textAlign: 'center',
        textShadow: '0 2px 12px rgba(212, 168, 67, 0.25)',
      }}>
        {isIntroducer ? 'È il tuo turno di presentarti' : `Presentazione di ${introducingPlayer?.name || '...'}`}
      </h2>

      <p style={{
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.7)',
        margin: '0 0 1.2rem 0',
        textAlign: 'center',
        maxWidth: '440px',
        lineHeight: 1.4,
      }}>
        {isIntroducer
          ? 'Annuncia a voce alta a tutti i giocatori il tuo nome e il ruolo della tua carta.'
          : 'Ascolta con attenzione la carta annunciata prima che inizino i giochi di inganno.'}
      </p>

      {/* Main Glassmorphism Presentation Box */}
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
        {/* Ambient Top Glow */}
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

        {/* Presenting Player Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '20px',
          background: 'rgba(212, 168, 67, 0.2)',
          border: '1px solid #d4a843',
          color: '#d4a843',
          fontWeight: 700,
          fontSize: '0.95rem',
          marginBottom: '1rem',
        }}>
          <User size={16} />
          <span>{introducingPlayer?.name}</span>
          {isIntroducer && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Tu)</span>}
        </div>

        {/* Role Card Image */}
        {role && (
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
        )}

        {/* Role Name */}
        {role && (
          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#d4a843',
            margin: '0 0 0.5rem 0',
            letterSpacing: '0.02em',
          }}>
            {role.name}
          </h3>
        )}

        {/* Role Description */}
        {role && (
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
        )}

        {/* Action Button for introducer OR Status message for others */}
        {isIntroducer ? (
          <button
            onClick={onIntroDone}
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
            Fatto ✓
          </button>
        ) : (
          <div style={{
            marginTop: '1.2rem',
            width: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(212, 168, 67, 0.25)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#d4a843',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}>
              <Volume2 size={16} />
              Presentazione di {introducingPlayer?.name}...
            </div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              In attesa che confermi la presentazione
            </span>
          </div>
        )}
      </div>

      {/* Seated Players Order Tracker */}
      <div style={{
        marginTop: '1.5rem',
        maxWidth: '440px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.55)',
          marginBottom: '0.5rem',
        }}>
          Presentazioni completate: <strong style={{ color: '#d4a843' }}>{introducedCount}</strong> / {totalPlayers}
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          justifyContent: 'center',
        }}>
          {sortedPlayers.map(p => {
            const isCurrent = p.seatIndex === state.introIndex;
            const hasDone = p.hasIntroduced;
            const isMe = p.id === myPlayer.id;

            return (
              <span
                key={p.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '14px',
                  fontSize: '0.73rem',
                  background: isCurrent
                    ? 'rgba(212, 168, 67, 0.25)'
                    : hasDone
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isCurrent
                    ? '1px solid #d4a843'
                    : hasDone
                    ? '1px solid rgba(34, 197, 94, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isCurrent
                    ? '#d4a843'
                    : hasDone
                    ? '#4ade80'
                    : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                {hasDone ? (
                  <Check size={11} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Volume2 size={11} />
                ) : (
                  <Clock size={11} />
                )}
                {p.name} {isMe && '(Tu)'}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
