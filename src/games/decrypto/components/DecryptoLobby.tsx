import React, { useState } from 'react';
import { Copy, Check, Info, Play, Users, HelpCircle } from 'lucide-react';
import type { DecryptoPlayer, DecryptoTeam } from '../types';

interface Props {
  roomCode: string;
  players: DecryptoPlayer[];
  playerId: string;
  isHost: boolean;
  onJoinTeam: (team: DecryptoTeam) => void;
  onStartGame: () => void;
}

// Palette presa dalla schermata di scelta dei giochi (viola / ciano / rosa) + rosso di Decrypto
const ACCENT = '#f43f5e';
const ACCENT_LIGHT = '#fb7185';
const NAVY = 'rgba(20, 20, 60, 0.92)';

interface TeamTheme {
  key: DecryptoTeam;
  title: string;
  emoji: string;
  banner: string;
  bannerText: string;
  glow: string;
  border: string;
  avatar: string;
  avatarText: string;
  button: string;
  buttonText: string;
  buttonShadow: string;
  soft: string;
}

const TEAMS: TeamTheme[] = [
  {
    key: 'bianca',
    title: 'Squadra Bianca',
    emoji: '⬜',
    banner: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 55%, #22d3ee 100%)',
    bannerText: '#0c2a4a',
    glow: 'rgba(34, 211, 238, 0.45)',
    border: 'rgba(125, 211, 252, 0.55)',
    avatar: 'linear-gradient(135deg, #ffffff, #7dd3fc)',
    avatarText: '#0c2a4a',
    button: 'linear-gradient(135deg, #ffffff 0%, #67e8f9 60%, #06b6d4 100%)',
    buttonText: '#06304a',
    buttonShadow: '0 8px 22px rgba(6, 182, 212, 0.45)',
    soft: 'rgba(34, 211, 238, 0.12)',
  },
  {
    key: 'nera',
    title: 'Squadra Nera',
    emoji: '⬛',
    banner: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 55%, #1e1b4b 100%)',
    bannerText: '#ffffff',
    glow: 'rgba(139, 92, 246, 0.5)',
    border: 'rgba(167, 139, 250, 0.55)',
    avatar: 'linear-gradient(135deg, #a78bfa, #4c1d95)',
    avatarText: '#ffffff',
    button: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 55%, #5b21b6 100%)',
    buttonText: '#ffffff',
    buttonShadow: '0 8px 22px rgba(139, 92, 246, 0.5)',
    soft: 'rgba(139, 92, 246, 0.14)',
  },
];

const MIN_PER_TEAM = 2;

export default function DecryptoLobby({ roomCode, players, playerId, isHost, onJoinTeam, onStartGame }: Props) {
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);

  const bianca = players.filter(p => p.team === 'bianca');
  const nera = players.filter(p => p.team === 'nera');
  const unassigned = players.filter(p => !p.team);
  const myTeam = players.find(p => p.id === playerId)?.team;
  const canStart = bianca.length >= 2 && nera.length >= 2 && unassigned.length === 0;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Messaggio di stato (stesse condizioni di avvio di prima)
  let statusKind: 'warn' | 'ok' = 'warn';
  let statusText = '';
  if (unassigned.length > 0) {
    statusText = unassigned.length === 1
      ? '1 giocatore deve ancora scegliere una squadra'
      : `${unassigned.length} giocatori devono ancora scegliere una squadra`;
  } else if (bianca.length < MIN_PER_TEAM || nera.length < MIN_PER_TEAM) {
    statusText = 'Servono almeno 2 giocatori per squadra';
  } else {
    statusKind = 'ok';
    statusText = 'Squadre pronte, si può iniziare!';
  }

  const renderTeam = (team: TeamTheme, members: DecryptoPlayer[]) => {
    const isMine = myTeam === team.key;
    const emptySlots = Math.max(0, MIN_PER_TEAM - members.length);

    return (
      <div
        key={team.key}
        className="dcl-team"
        style={{
          background: NAVY,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '28px',
          border: `2px solid ${isMine ? team.border : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isMine ? `0 12px 36px rgba(0,0,0,0.35), 0 0 28px ${team.glow}` : '0 12px 30px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#fff',
        }}
      >
        {/* Banner colorato */}
        <div style={{
          background: team.banner, color: team.bannerText, padding: '0.9rem 1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{team.emoji}</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: team.bannerText }}>{team.title}</h3>
          </div>
          <span style={{
            background: 'rgba(0,0,0,0.18)', color: team.bannerText, borderRadius: '999px',
            padding: '0.2rem 0.7rem', fontSize: '0.8rem', fontWeight: 800,
          }}>
            {members.length} {members.length === 1 ? 'giocatore' : 'giocatori'}
          </span>
        </div>

        {/* Giocatori */}
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
          {members.map((p, idx) => {
            const isMe = p.id === playerId;
            return (
              <div
                key={p.id}
                className="dcl-pop"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  background: isMe ? team.soft : 'rgba(255,255,255,0.06)',
                  border: isMe ? `1.5px solid ${team.border}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px', padding: '0.4rem 0.9rem 0.4rem 0.4rem',
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: team.avatar, color: team.avatarText,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                }}>
                  {(p.name || '?').charAt(0).toUpperCase()}
                </div>
                <span style={{
                  fontWeight: 700, fontSize: '0.95rem', flex: 1, minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }} title={p.name}>{p.name}</span>
                {isMe && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 800, color: '#fff', background: ACCENT,
                    padding: '0.15rem 0.55rem', borderRadius: '999px', flexShrink: 0,
                  }}>Tu</span>
                )}
              </div>
            );
          })}

          {/* Slot vuoti */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${team.key}-${i}`} style={{
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              border: '2px dashed rgba(255,255,255,0.18)', borderRadius: '999px',
              padding: '0.4rem 0.9rem 0.4rem 0.4rem', opacity: 0.65,
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                border: '2px dashed rgba(255,255,255,0.25)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: 800,
              }}>?</div>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>In attesa di un giocatore…</span>
            </div>
          ))}

          {/* Azione */}
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            {isMine ? (
              <div style={{
                textAlign: 'center', padding: '0.7rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.9rem',
                background: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid rgba(16, 185, 129, 0.4)', color: '#34d399',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}>
                <Check size={16} /> Sei in questa squadra
              </div>
            ) : (
              <button
                className="dcl-join"
                onClick={() => onJoinTeam(team.key)}
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  fontWeight: 900, fontSize: '1rem', background: team.button, color: team.buttonText,
                  boxShadow: team.buttonShadow,
                }}
              >
                Unisciti {team.emoji}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', padding: '0.5rem 0 3rem', color: '#fff' }}>
      <style>{`
        .dcl-teams { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.1rem; }
        @media (max-width: 640px) { .dcl-teams { grid-template-columns: 1fr; } }
        .dcl-join { transition: transform .15s ease, filter .15s ease; }
        .dcl-join:hover { transform: translateY(-2px) scale(1.02); filter: brightness(1.06); }
        .dcl-join:active { transform: scale(0.98); }
        .dcl-team { transition: transform .25s ease, box-shadow .25s ease; }
        .dcl-team:hover { transform: translateY(-3px); }
        .dcl-pop { animation: dclPop .35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes dclPop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .dcl-start { transition: transform .15s ease, filter .15s ease; }
        .dcl-start:not(:disabled):hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.07); }
        .dcl-start:not(:disabled):active { transform: scale(0.98); }
      `}</style>

      {/* Header + codice stanza */}
      <div style={{
        background: NAVY, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '32px', padding: '1.4rem 1.2rem', marginBottom: '1.25rem',
        border: '1px solid rgba(244, 63, 94, 0.35)', boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(244,63,94,0.25), rgba(245,158,11,0.2))',
          border: '1px solid rgba(244, 63, 94, 0.45)', color: '#fda4af',
          fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem',
        }}>
          🔐 Stanza di Decrypto
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.45rem' }}>Codice Stanza</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(255,255,255,0.07)', padding: '0.6rem 0.7rem 0.6rem 1.4rem',
          borderRadius: '999px', border: '1.5px solid rgba(244, 63, 94, 0.4)',
          boxShadow: '0 0 28px rgba(244, 63, 94, 0.25)',
        }}>
          <span
            onClick={handleCopy}
            title="Copia codice"
            style={{
              fontSize: '2.4rem', fontWeight: 900, letterSpacing: '0.3em', fontFamily: 'monospace',
              color: '#fecdd3', textShadow: '0 0 16px rgba(244, 63, 94, 0.5)', marginLeft: '0.15em', cursor: 'pointer',
            }}
          >{roomCode}</span>
          <button onClick={handleCopy} title="Copia codice" style={{
            background: copied ? 'rgba(34,197,94,0.25)' : 'rgba(244, 63, 94, 0.22)',
            border: `1.5px solid ${copied ? '#22c55e' : 'rgba(244, 63, 94, 0.5)'}`,
            color: copied ? '#4ade80' : ACCENT_LIGHT, width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <button
          onClick={() => setShowRules(true)}
          title="Regole"
          style={{
            marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(6, 182, 212, 0.18)', border: '1.5px solid rgba(34, 211, 238, 0.45)', color: '#67e8f9',
            padding: '0.45rem 1.1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
          }}
        >
          <HelpCircle size={16} /> Regole
        </button>
      </div>

      {/* Stato */}
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

      {/* Le due squadre nello stesso schermo */}
      <div className="dcl-teams" style={{ marginBottom: '1.1rem' }}>
        {renderTeam(TEAMS[0], bianca)}
        {renderTeam(TEAMS[1], nera)}
      </div>

      {/* Giocatori senza squadra */}
      {unassigned.length > 0 && (
        <div style={{
          background: NAVY, borderRadius: '24px', padding: '1rem 1.1rem', marginBottom: '1.25rem',
          border: '1.5px dashed rgba(255,255,255,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '0.9rem' }}>
            <Users size={16} /> Senza squadra
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {unassigned.map(p => (
              <span key={p.id} className="dcl-pop" style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,0.25), rgba(245,158,11,0.22))',
                border: '1px solid rgba(251, 113, 133, 0.45)', color: '#fff',
                padding: '0.35rem 0.9rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem',
              }}>
                {p.name}{p.id === playerId ? ' (Tu)' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Avvio */}
      {isHost ? (
        <div style={{ textAlign: 'center' }}>
          <button
            className="dcl-start"
            disabled={!canStart}
            onClick={onStartGame}
            style={{
              padding: '1.1rem 3.5rem', fontSize: '1.25rem', fontWeight: 900, borderRadius: '999px', border: 'none',
              cursor: canStart ? 'pointer' : 'not-allowed',
              color: canStart ? '#fff' : 'rgba(255,255,255,0.5)',
              background: canStart ? 'linear-gradient(135deg, #fb7185 0%, #f43f5e 45%, #f59e0b 100%)' : 'rgba(20, 20, 60, 0.55)',
              boxShadow: canStart ? '0 10px 30px rgba(244, 63, 94, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            }}
          >
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
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🔐 Decrypto — Regole</h2>
              <button onClick={() => setShowRules(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p><strong>🎯 Obiettivo:</strong> Comunicare codici segreti alla propria squadra senza farsi intercettare dagli avversari.</p>
              <p><strong>📋 Setup:</strong> Ogni squadra ha 4 parole segrete numerate da 1 a 4, visibili solo ai propri membri.</p>
              <p><strong>🔑 Turno:</strong> Il giocatore attivo pesca un codice di 3 numeri (es. 4-2-1) e dà 3 indizi—uno per ogni numero del codice, collegati alle parole segrete.</p>
              <p><strong>🤔 Indovinare:</strong> La propria squadra deve ricostruire il codice. Anche la squadra avversaria tenta di intercettarlo.</p>
              <p><strong>🏆 Token:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                <li><strong>Errata Comunicazione:</strong> La propria squadra sbaglia il codice</li>
                <li><strong>Intercettazione:</strong> La squadra avversaria indovina il codice</li>
              </ul>
              <p><strong>🏁 Fine partita:</strong> 2 Token Intercettazione = vittoria! 2 Token Errata Comunicazione = sconfitta! La squadra che perde può tentare di indovinare le 4 parole avversarie per pareggiare.</p>
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
