import React, { useState } from 'react';
import { PiliPiliState, PiliPiliPlayer } from '../types';
import { getCardImage, getPiliImage } from '../missions';

interface PiliPiliPlayProps {
  state: PiliPiliState;
  myPlayer: PiliPiliPlayer;
  onPlayCard: (card: number) => void;
}

export default function PiliPiliPlay({ state, myPlayer, onPlayCard }: PiliPiliPlayProps) {
  const isMyTurn = state.currentTurnId === myPlayer.id;
  const [showMission, setShowMission] = useState(false);

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '85vh',
      backgroundImage: 'url("/Pili Pili/Table Game/Table Game.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      margin: '-1rem',
      padding: '1rem',
    }}>

      {/* Top-left: current mission thumbnail */}
      {state.currentMission && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
        }}>
          <img
            src={state.currentMission.image}
            alt={state.currentMission.name}
            title={`Missione: ${state.currentMission.name}`}
            onClick={() => setShowMission(true)}
            style={{
              width: '80px',
              height: 'auto',
              borderRadius: '8px',
              border: '2px solid rgba(234, 88, 12, 0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              cursor: 'pointer',
            }}
          />
          <div style={{
            fontSize: '0.6rem',
            color: '#fff',
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            marginTop: '2px',
          }}>
            #{state.currentMission.id}
          </div>
        </div>
      )}

      {/* Bottom-left: Pili count with image */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}>
        <img
          src={getPiliImage()}
          alt="Pili"
          style={{
            width: '70px',
            height: 'auto',
            borderRadius: '6px',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        />
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 900,
          color: '#ef4444',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '6px',
          padding: '2px 8px',
        }}>
          🌶️ {myPlayer.pilis}
        </div>
      </div>

      {/* Top - Players info bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        marginBottom: '0.8rem',
        paddingTop: '0.3rem',
      }}>
        {state.players.map(p => {
          const isTurn = state.currentTurnId === p.id;
          const isMe = p.id === myPlayer.id;
          return (
            <div key={p.id} style={{
              background: isTurn
                ? 'rgba(234, 88, 12, 0.35)'
                : isMe
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)',
              borderRadius: '10px',
              border: isTurn ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.15)',
              textAlign: 'center',
              minWidth: '85px',
              padding: '0.4rem 0.6rem',
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: isMe ? '#fbbf24' : '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}>
                {p.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                🎯{p.bet} ✅{p.tricksWon}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#f87171' }}>🌶️ {p.pilis}</div>
            </div>
          );
        })}
      </div>

      {/* Middle - Play field */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        marginBottom: '0.8rem',
        background: 'rgba(0,0,0,0.12)',
        backdropFilter: 'blur(2px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: '250px',
      }}>
        <div style={{
          fontSize: '0.9rem',
          color: '#fbbf24',
          fontWeight: 700,
          marginBottom: '1rem',
          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
        }}>
          Presa {state.trickNumber + 1}/{state.totalTricks}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-end',
          minHeight: '140px',
        }}>
          {state.currentTrick.map((played, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.7rem',
                marginBottom: '0.3rem',
                color: 'rgba(255,255,255,0.7)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}>
                {state.players.find(p => p.id === played.playerId)?.name}
              </div>
              <img
                src={getCardImage(played.card)}
                alt={`Carta ${played.card}`}
                style={{
                  width: '85px',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
            </div>
          ))}
          {state.currentTrick.length === 0 && (
            <div style={{
              color: 'rgba(255,255,255,0.4)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              Tavolo vuoto
            </div>
          )}
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isMyTurn ? (
            <div style={{
              color: '#fbbf24',
              fontSize: '1.2rem',
              fontWeight: 700,
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              animation: 'pulse 1.5s infinite',
            }}>
              🔥 È il tuo turno! Gioca una carta.
            </div>
          ) : (
            <div style={{
              color: 'rgba(255,255,255,0.6)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              Turno di {state.players.find(p => p.id === state.currentTurnId)?.name}...
            </div>
          )}
        </div>
      </div>

      {/* Bottom - My hand with card images */}
      <div style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
        <div style={{
          fontSize: '0.85rem',
          marginBottom: '0.5rem',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 600,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>
          Le tue carte:
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          {myPlayer.hand.map((card, i) => (
            <button
              key={i}
              onClick={() => { if (isMyTurn) onPlayCard(card); }}
              disabled={!isMyTurn}
              style={{
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: isMyTurn ? 'pointer' : 'default',
                transform: isMyTurn ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.2s, filter 0.2s, box-shadow 0.2s',
                opacity: isMyTurn ? 1 : 0.7,
                filter: isMyTurn ? 'none' : 'grayscale(0.3)',
              }}
              onMouseEnter={(e) => {
                if (isMyTurn) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-18px) scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (isMyTurn) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                }
              }}
            >
              <img
                src={getCardImage(card)}
                alt={`Carta ${card}`}
                style={{
                  width: myPlayer.hand.length > 6 ? '65px' : '80px',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: isMyTurn
                    ? '0 8px 24px rgba(234, 88, 12, 0.4), 0 4px 8px rgba(0,0,0,0.3)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
                  border: isMyTurn ? '2px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </button>
          ))}
        </div>
      </div>
      {/* Mission fullscreen modal */}
      {showMission && state.currentMission && (
        <div
          onClick={() => setShowMission(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', cursor: 'pointer',
          }}
        >
          <img
            src={state.currentMission.image}
            alt={state.currentMission.name}
            style={{
              maxWidth: '90vw', maxHeight: '60vh', borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(234, 88, 12, 0.5)',
              border: '2px solid rgba(234, 88, 12, 0.5)',
              marginBottom: '1rem',
            }}
          />
          <h3 style={{ color: '#fbbf24', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            Missione #{state.currentMission.id}: {state.currentMission.name}
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.8)', fontSize: '1rem', textAlign: 'center',
            maxWidth: '400px', lineHeight: 1.5,
          }}>
            {state.currentMission.description}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            Tocca per chiudere
          </p>
        </div>
      )}
    </div>
  );
}
