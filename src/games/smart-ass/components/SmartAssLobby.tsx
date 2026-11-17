import React, { useState } from 'react';
import { Copy, Check, Info, Play, HelpCircle } from 'lucide-react';
import type { SmartAssPlayer } from '../types';
import { TOKEN_IMAGES, TOKEN_COLORS, TOKEN_CSS_COLORS, MIN_PLAYERS, MAX_PLAYERS } from '../boardPositions';

interface Props {
  roomCode: string;
  players: SmartAssPlayer[];
  playerId: string;
  isHost: boolean;
  onPickToken: (tokenIndex: number) => void;
  onStartGame: () => void;
}

const NAVY = 'rgba(20, 20, 60, 0.92)';
const ACCENT = '#f59e0b';

export default function SmartAssLobby({ roomCode, players, playerId, isHost, onPickToken, onStartGame }: Props) {
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);

  const myToken = players.find(p => p.id === playerId)?.tokenIndex ?? -1;
  const takenTokens = new Set(players.filter(p => p.tokenIndex >= 0).map(p => p.tokenIndex));
  const allHaveTokens = players.length >= MIN_PLAYERS && players.every(p => p.tokenIndex >= 0);
  const canStart = allHaveTokens && players.length >= MIN_PLAYERS;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let statusKind: 'warn' | 'ok' = 'warn';
  let statusText = '';
  if (players.length < MIN_PLAYERS) {
    statusText = `Servono almeno ${MIN_PLAYERS} giocatori (${players.length}/${MIN_PLAYERS})`;
  } else if (!allHaveTokens) {
    const missing = players.filter(p => p.tokenIndex < 0).length;
    statusText = missing === 1 ? '1 giocatore deve scegliere la pedina' : `${missing} giocatori devono scegliere la pedina`;
  } else {
    statusKind = 'ok';
    statusText = 'Tutti pronti, si può iniziare!';
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', padding: '0.5rem 0 3rem', color: '#fff' }}>
      <style>{`
        .sal-pop { animation: salPop .35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes salPop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .sal-start { transition: transform .15s ease, filter .15s ease; }
        .sal-start:not(:disabled):hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.07); }
        .sal-start:not(:disabled):active { transform: scale(0.98); }
        .sal-token-btn { transition: transform .12s ease, box-shadow .12s ease; cursor: pointer; border: none; background: none; padding: 0; }
        .sal-token-btn:not(:disabled):hover { transform: scale(1.15); }
        .sal-token-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* Header + room code */}
      <div style={{
        background: NAVY, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '32px', padding: '1.4rem 1.2rem', marginBottom: '1.25rem',
        border: '1px solid rgba(245, 158, 11, 0.35)', boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(234,88,12,0.2))',
          border: '1px solid rgba(245, 158, 11, 0.45)', color: '#fbbf24',
          fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem',
        }}>
          🫏 Stanza di Smart Ass
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.45rem' }}>Codice Stanza</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(255,255,255,0.07)', padding: '0.6rem 0.7rem 0.6rem 1.4rem',
          borderRadius: '999px', border: '1.5px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 0 28px rgba(245, 158, 11, 0.25)',
        }}>
          <span onClick={handleCopy} title="Copia codice" style={{
            fontSize: '2.4rem', fontWeight: 900, letterSpacing: '0.3em', fontFamily: 'monospace',
            color: '#fef3c7', textShadow: '0 0 16px rgba(245, 158, 11, 0.5)', marginLeft: '0.15em', cursor: 'pointer',
          }}>{roomCode}</span>
          <button onClick={handleCopy} title="Copia codice" style={{
            background: copied ? 'rgba(34,197,94,0.25)' : 'rgba(245, 158, 11, 0.22)',
            border: `1.5px solid ${copied ? '#22c55e' : 'rgba(245, 158, 11, 0.5)'}`,
            color: copied ? '#4ade80' : '#fbbf24', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <button onClick={() => setShowRules(true)} title="Regole" style={{
          marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(6, 182, 212, 0.18)', border: '1.5px solid rgba(34, 211, 238, 0.45)', color: '#67e8f9',
          padding: '0.45rem 1.1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
        }}>
          <HelpCircle size={16} /> Regole
        </button>
      </div>

      {/* Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem', justifyContent: 'center',
        padding: '0.7rem 1.1rem', borderRadius: '999px', fontSize: '0.88rem', fontWeight: 700, marginBottom: '1.1rem',
        background: statusKind === 'ok' ? 'rgba(16, 185, 129, 0.92)' : 'rgba(245, 158, 11, 0.92)',
        color: statusKind === 'ok' ? '#022c1e' : '#3b2300',
        boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
      }}>
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>{statusText}</span>
      </div>

      {/* Token picker */}
      <div style={{
        background: NAVY, borderRadius: '24px', padding: '1rem', marginBottom: '1.1rem',
        border: '1.5px solid rgba(245, 158, 11, 0.25)',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.7rem', textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
          🎯 Scegli la tua pedina
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
          {TOKEN_IMAGES.map((img, idx) => {
            const taken = takenTokens.has(idx);
            const mine = myToken === idx;
            return (
              <button
                key={idx}
                className="sal-token-btn"
                disabled={taken && !mine}
                onClick={() => onPickToken(idx)}
                title={TOKEN_COLORS[idx]}
                style={{
                  width: '54px', height: '72px', borderRadius: '12px',
                  background: mine ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)',
                  border: mine ? '2.5px solid #fbbf24' : '1.5px solid rgba(255,255,255,0.12)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                  boxShadow: mine ? '0 0 16px rgba(245,158,11,0.4)' : 'none',
                }}
              >
                <img src={img} alt={TOKEN_COLORS[idx]} style={{ width: '32px', height: 'auto', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: TOKEN_CSS_COLORS[idx] }}>{TOKEN_COLORS[idx]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Player list */}
      <div style={{
        background: NAVY, borderRadius: '24px', padding: '1rem', marginBottom: '1.25rem',
        border: '1.5px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>
          👥 Giocatori ({players.length}/{MAX_PLAYERS})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {players.map((p, idx) => {
            const isMe = p.id === playerId;
            const hasToken = p.tokenIndex >= 0;
            return (
              <div key={p.id} className="sal-pop" style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                background: isMe ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)',
                border: isMe ? '1.5px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px', padding: '0.4rem 0.9rem 0.4rem 0.4rem',
                animationDelay: `${idx * 0.05}s`,
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hasToken ? `${TOKEN_CSS_COLORS[p.tokenIndex]}22` : 'rgba(255,255,255,0.1)',
                  border: hasToken ? `2px solid ${TOKEN_CSS_COLORS[p.tokenIndex]}` : '2px dashed rgba(255,255,255,0.25)',
                }}>
                  {hasToken ? (
                    <img src={TOKEN_IMAGES[p.tokenIndex]} alt="" style={{ width: '24px', height: 'auto' }} />
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>?</span>
                  )}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                  {p.name}
                </span>
                {isMe && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', background: ACCENT, padding: '0.15rem 0.55rem', borderRadius: '999px', flexShrink: 0 }}>
                    Tu
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      {isHost ? (
        <div style={{ textAlign: 'center' }}>
          <button className="sal-start" disabled={!canStart} onClick={onStartGame} style={{
            padding: '1.1rem 3.5rem', fontSize: '1.25rem', fontWeight: 900, borderRadius: '999px', border: 'none',
            cursor: canStart ? 'pointer' : 'not-allowed',
            color: canStart ? '#fff' : 'rgba(255,255,255,0.5)',
            background: canStart ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 45%, #ea580c 100%)' : 'rgba(20, 20, 60, 0.55)',
            boxShadow: canStart ? '0 10px 30px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <Play size={22} fill={canStart ? '#fff' : 'none'} />
            <span>Inizia Gioco</span>
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: 'center', margin: '0 auto', maxWidth: '420px', padding: '0.8rem 1.2rem', borderRadius: '999px',
          background: NAVY, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: 700,
        }}>
          ⏳ In attesa che l'host avvii la partita...
        </div>
      )}

      {/* Rules modal */}
      {showRules && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content" style={{ textAlign: 'left', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🫏 Smart Ass — Regole</h2>
              <button onClick={() => setShowRules(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p><strong>🎯 Obiettivo:</strong> Essere il primo giocatore a raggiungere la casella finale sul sedere dell'asino!</p>
              <p><strong>🎲 Turno:</strong> Il narratore lancia il dado categoria per determinare il mazzo (Chi sono? / Cosa sono? / Dove sono?), poi legge gli indizi della carta.</p>
              <p><strong>🗣️ Risposta:</strong> Chiunque può urlare la risposta in qualsiasi momento! Il narratore seleziona chi ha risposto correttamente.</p>
              <p><strong>🔢 Movimento:</strong> Chi risponde correttamente lancia il dado numerico (1-4) e avanza la propria pedina.</p>
              <p><strong>⚡ Caselle speciali:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                <li><strong>Hard Ass:</strong> Pesca una carta Hard Ass. Se rispondi correttamente, lanci il dado e avanzi.</li>
                <li><strong>Kick Ass:</strong> La pedina torna indietro di alcune caselle.</li>
                <li><strong>Dumb Ass:</strong> Salti il prossimo turno come narratore (puoi comunque rispondere).</li>
              </ul>
              <p><strong>🏁 Vittoria:</strong> Il primo a raggiungere la casella "The End" vince!</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowRules(false)}>
              Ho capito! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
