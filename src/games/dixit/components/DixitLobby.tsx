import React, { useState } from 'react';
import { Users, Crown, Copy, Check, Info, Play } from 'lucide-react';
import { RoomPlayer } from '../hooks/useDixitRoom';

export interface DixitLobbyProps {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function DixitLobby({ roomCode, players, isHost, onStartGame }: DixitLobbyProps) {
  const [copied, setCopied] = useState(false);
  const accent = '#7c3aed';
  const accentLight = '#a78bfa';

  const canStart = players.length >= 3 && players.length <= 6;

  const handleCopy = () => {
    if (navigator.clipboard) { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem 3rem', color: '#fff' }}>
      {/* Room Code Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '20px',
          background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.35)',
          color: accentLight, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem',
        }}>
          🐇 Stanza di Dixit
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>Codice Stanza</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(20, 18, 40, 0.85)', backdropFilter: 'blur(16px)', padding: '0.6rem 1.4rem',
          borderRadius: '16px', border: '1px solid rgba(124, 58, 237, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <span style={{
            fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.3em', fontFamily: 'monospace',
            color: '#c4b5fd', textShadow: '0 0 15px rgba(124, 58, 237, 0.4)', marginLeft: '0.15em',
          }}>{roomCode}</span>
          <button onClick={handleCopy} title="Copia codice" style={{
            background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(124, 58, 237, 0.18)',
            border: `1px solid ${copied ? '#22c55e' : 'rgba(124, 58, 237, 0.4)'}`,
            color: copied ? '#4ade80' : accentLight, padding: '0.6rem', borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Players Panel */}
      <div style={{
        background: 'rgba(22, 18, 45, 0.82)', backdropFilter: 'blur(16px)', borderRadius: '20px', padding: '1.5rem',
        border: '1px solid rgba(124, 58, 237, 0.25)', boxShadow: '0 12px 35px rgba(0,0,0,0.5)', marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(124, 58, 237, 0.15)' }}>
          <div style={{ background: 'rgba(124, 58, 237, 0.15)', padding: '0.45rem', borderRadius: '10px', color: accentLight, display: 'flex' }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Giocatori ({players.length}/6)</h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Minimo 3 • Massimo 6</span>
          </div>
        </div>

        {/* Status */}
        <div style={{
          padding: '0.65rem 0.9rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: players.length < 3 ? 'rgba(245,158,11,0.12)' : players.length > 6 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)',
          border: `1px solid ${players.length < 3 ? 'rgba(245,158,11,0.3)' : players.length > 6 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          color: players.length < 3 ? '#fbbf24' : players.length > 6 ? '#f87171' : '#4ade80',
        }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            {players.length < 3 ? `Mancano ancora ${3 - players.length} giocatori per poter iniziare`
              : players.length > 6 ? 'Stanza piena! Il massimo consentito è 6 giocatori'
              : 'Numero di giocatori ottimale per iniziare!'}
          </span>
        </div>

        {/* Player Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
          {players.map((p, idx) => (
            <div key={p.id} style={{
              background: 'rgba(30, 27, 50, 0.8)', borderRadius: '10px', padding: '0.65rem 0.5rem', textAlign: 'center',
              border: p.isHost ? `1.5px solid ${accent}` : '1px solid rgba(124, 58, 237, 0.25)',
              boxShadow: p.isHost ? '0 0 12px rgba(124, 58, 237, 0.2)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: p.isHost ? `linear-gradient(135deg, #c4b5fd, #5b21b6)` : 'rgba(124, 58, 237, 0.15)',
                color: p.isHost ? '#fff' : accentLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem',
              }}>{idx + 1}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                {p.name}
              </div>
              {p.isHost ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 700,
                  color: accentLight, background: 'rgba(124, 58, 237, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '6px',
                }}><Crown size={11} /> Host</div>
              ) : (
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Giocatore</div>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              background: 'rgba(15, 14, 30, 0.4)', borderRadius: '10px', padding: '0.65rem 0.5rem', textAlign: 'center',
              border: '1px dashed rgba(124, 58, 237, 0.18)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.25rem', opacity: 0.55,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Slot {players.length + i + 1}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>In attesa...</div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      {isHost ? (
        <div style={{ textAlign: 'center' }}>
          <button onClick={onStartGame} disabled={!canStart} style={{
            padding: '1.1rem 3.5rem', fontSize: '1.25rem', fontWeight: 800, borderRadius: '16px', border: 'none',
            cursor: canStart ? 'pointer' : 'not-allowed',
            color: canStart ? '#1a0833' : 'rgba(255,255,255,0.4)',
            background: canStart ? `linear-gradient(135deg, #c4b5fd 0%, ${accent} 45%, #5b21b6 100%)` : 'rgba(60, 40, 80, 0.4)',
            boxShadow: canStart ? '0 8px 30px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <Play size={22} fill={canStart ? '#1a0833' : 'none'} />
            <span>Inizia Partita</span>
          </button>
          {!canStart && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.85rem' }}>
              {players.length < 3 ? `Servono da 3 a 6 giocatori (attualmente: ${players.length})` : `Troppi giocatori (max 6, attualmente: ${players.length})`}
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
          ⏳ In attesa che l'host avvii la partita...
        </div>
      )}
    </div>
  );
}
