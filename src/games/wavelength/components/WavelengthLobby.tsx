import React, { useState } from 'react';
import { Users, Crown, Copy, Check, Info, Play, HelpCircle, Minus, Plus } from 'lucide-react';

interface WavelengthLobbyProps {
  roomCode: string;
  players: { id: string; name: string; isHost: boolean }[];
  isHost: boolean;
  winScore: number;
  onWinScoreChange: (score: number) => void;
  onStartGame: () => void;
}

// Palette: ciano di Wavelength nella schermata dei giochi + viola/rosa/ambra di base
const CYAN = '#06b6d4';
const CYAN_LIGHT = '#22d3ee';
const NAVY = 'rgba(20, 20, 60, 0.92)';
const MIN_PLAYERS = 2;

// Colori diversi per gli avatar, tondi e vivaci
const AVATARS = [
  'linear-gradient(135deg, #22d3ee, #0891b2)',
  'linear-gradient(135deg, #a78bfa, #6d28d9)',
  'linear-gradient(135deg, #fb7185, #e11d48)',
  'linear-gradient(135deg, #fbbf24, #d97706)',
  'linear-gradient(135deg, #34d399, #059669)',
  'linear-gradient(135deg, #f472b6, #be185d)',
];

export default function WavelengthLobby({ roomCode, players, isHost, winScore, onWinScoreChange, onStartGame }: WavelengthLobbyProps) {
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);

  const canStart = players.length >= MIN_PLAYERS;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stepperBtn = (disabled: boolean): React.CSSProperties => ({
    width: '46px', height: '46px', borderRadius: '50%', border: '1.5px solid rgba(34, 211, 238, 0.5)',
    background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(6, 182, 212, 0.22)',
    color: disabled ? 'rgba(255,255,255,0.25)' : '#67e8f9',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '0.5rem 0 3rem', color: '#fff' }}>
      <style>{`
        .wvl-pop { animation: wvlPop .35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes wvlPop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .wvl-start { transition: transform .15s ease, filter .15s ease; }
        .wvl-start:not(:disabled):hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.07); }
        .wvl-start:not(:disabled):active { transform: scale(0.98); }
        .wvl-step:not(:disabled):hover { transform: scale(1.1); }
        .wvl-step { transition: transform .15s ease; }
      `}</style>

      {/* Header + codice stanza */}
      <div style={{
        background: NAVY, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '32px', padding: '1.4rem 1.2rem', marginBottom: '1.25rem',
        border: '1px solid rgba(6, 182, 212, 0.4)', boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.28), rgba(139,92,246,0.25))',
          border: '1px solid rgba(34, 211, 238, 0.5)', color: '#a5f3fc',
          fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem',
        }}>
          📡 Stanza di Wavelength
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.45rem' }}>Codice Stanza</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(255,255,255,0.07)', padding: '0.6rem 0.7rem 0.6rem 1.4rem',
          borderRadius: '999px', border: '1.5px solid rgba(34, 211, 238, 0.45)',
          boxShadow: '0 0 28px rgba(6, 182, 212, 0.3)',
        }}>
          <span
            onClick={handleCopyCode}
            title="Copia codice"
            style={{
              fontSize: '2.4rem', fontWeight: 900, letterSpacing: '0.3em', fontFamily: 'monospace',
              color: '#cffafe', textShadow: '0 0 16px rgba(6, 182, 212, 0.6)', marginLeft: '0.15em', cursor: 'pointer',
            }}
          >{roomCode}</span>
          <button onClick={handleCopyCode} title="Copia codice" style={{
            background: copied ? 'rgba(34,197,94,0.25)' : 'rgba(6, 182, 212, 0.22)',
            border: `1.5px solid ${copied ? '#22c55e' : 'rgba(34, 211, 238, 0.5)'}`,
            color: copied ? '#4ade80' : CYAN_LIGHT, width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
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
            background: 'rgba(139, 92, 246, 0.2)', border: '1.5px solid rgba(167, 139, 250, 0.5)', color: '#c4b5fd',
            padding: '0.45rem 1.1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
          }}
        >
          <HelpCircle size={16} /> Regole
        </button>
      </div>

      {/* Punti per vincere */}
      <div style={{
        background: NAVY, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '1.1rem 1.2rem', marginBottom: '1.25rem',
        border: '1px solid rgba(245, 158, 11, 0.35)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', color: '#fcd34d', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.7rem' }}>
          🏆 Punti per vincere
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem' }}>
          <button
            className="wvl-step"
            style={stepperBtn(!isHost || winScore <= 5)}
            onClick={() => onWinScoreChange(Math.max(5, winScore - 5))}
            disabled={!isHost || winScore <= 5}
          ><Minus size={20} /></button>
          <div style={{
            minWidth: '96px', textAlign: 'center', fontSize: '2rem', fontWeight: 900, padding: '0.25rem 1rem',
            borderRadius: '999px', background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(244,63,94,0.2))',
            border: '1.5px solid rgba(251, 191, 36, 0.45)', color: '#fff',
          }}>
            {winScore}
          </div>
          <button
            className="wvl-step"
            style={stepperBtn(!isHost || winScore >= 100)}
            onClick={() => onWinScoreChange(Math.min(100, winScore + 5))}
            disabled={!isHost || winScore >= 100}
          ><Plus size={20} /></button>
        </div>
        {!isHost && (
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.6rem' }}>
            Solo l'host può cambiare i punti
          </div>
        )}
      </div>

      {/* Giocatori */}
      <div style={{
        background: NAVY, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '28px', padding: '1.3rem', marginBottom: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)', padding: '0.5rem', borderRadius: '50%',
            color: '#fff', display: 'flex',
          }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Giocatori ({players.length})</h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Minimo {MIN_PLAYERS}</span>
          </div>
        </div>

        {/* Stato */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.55rem', justifyContent: 'center',
          padding: '0.65rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem',
          background: canStart ? 'rgba(16, 185, 129, 0.92)' : 'rgba(245, 158, 11, 0.92)',
          color: canStart ? '#022c1e' : '#3b2300',
        }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            {canStart
              ? 'Ci siamo tutti, si può iniziare!'
              : `Mancano ancora ${MIN_PLAYERS - players.length} giocatori per poter iniziare`}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.65rem' }}>
          {players.map((p, idx) => (
            <div key={p.id} className="wvl-pop" style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: p.isHost ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.06)',
              border: p.isHost ? '1.5px solid rgba(34, 211, 238, 0.55)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px', padding: '0.4rem 0.9rem 0.4rem 0.4rem', minWidth: 0,
              animationDelay: `${idx * 0.05}s`,
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: AVATARS[idx % AVATARS.length], color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem', boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
              }}>
                {(p.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                  {p.name}
                </div>
                {p.isHost && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 800, color: '#67e8f9' }}>
                    <Crown size={11} /> Host
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Slot vuoti */}
          {Array.from({ length: Math.max(0, MIN_PLAYERS - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              border: '2px dashed rgba(255,255,255,0.18)', borderRadius: '999px',
              padding: '0.4rem 0.9rem 0.4rem 0.4rem', opacity: 0.65,
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                border: '2px dashed rgba(255,255,255,0.25)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: 800,
              }}>?</div>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>In attesa…</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avvio */}
      {isHost ? (
        <div style={{ textAlign: 'center' }}>
          <button
            className="wvl-start"
            disabled={!canStart}
            onClick={onStartGame}
            style={{
              padding: '1.1rem 3.5rem', fontSize: '1.25rem', fontWeight: 900, borderRadius: '999px', border: 'none',
              cursor: canStart ? 'pointer' : 'not-allowed',
              color: canStart ? '#fff' : 'rgba(255,255,255,0.5)',
              background: canStart ? 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 40%, #8b5cf6 100%)' : 'rgba(20, 20, 60, 0.55)',
              boxShadow: canStart ? '0 10px 30px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
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

      {showRules && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content" style={{ textAlign: 'left', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                📡 Wavelength — Regole
              </h2>
              <button
                onClick={() => setShowRules(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p><strong>🎯 Obiettivo:</strong> Raggiungere <strong>{winScore} punti</strong> per primi!</p>
              <p><strong>📡 Come si gioca:</strong> Ogni round, un giocatore è il "giocatore attivo". Vede una coppia di opposti e un bersaglio segreto sull'arco (0°-180°). Dà un indizio per aiutare gli altri a indovinare dove si trova il bersaglio.</p>
              <p><strong>🏹 Indovinare:</strong> Gli altri giocatori spostano la propria freccia dove pensano sia il bersaglio e confermano la scelta.</p>
              <p><strong>⭐ Punteggio:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                <li>Entro 4°: <strong>4 punti</strong></li>
                <li>Entro 12°: <strong>3 punti</strong></li>
                <li>Entro 20°: <strong>2 punti</strong></li>
                <li>Oltre: <strong>0 punti</strong></li>
              </ul>
              <p><strong>🎭 Giocatore attivo:</strong> Riceve <strong>1 punto</strong> se almeno la metà degli altri giocatori ha indovinato il bersaglio (ottenendo 2+ punti).</p>
              <p><strong>🔀 Salta coppia:</strong> Il giocatore attivo può saltare la coppia fino a <strong>2 volte</strong> per turno, ottenendo una nuova coppia casuale.</p>
              <p><strong>🔄 Rotazione:</strong> Il giocatore attivo ruota ogni round.</p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setShowRules(false)}
            >
              Ho capito! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
