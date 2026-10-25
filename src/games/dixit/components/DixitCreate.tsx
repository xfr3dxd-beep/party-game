import React, { useState } from 'react';
import { User, KeyRound, Sparkles, AlertCircle, Loader2, Users, Crown } from 'lucide-react';

export interface DixitCreateProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => Promise<boolean>;
  isConnecting: boolean;
}

export default function DixitCreate({ onCreateRoom, onJoinRoom, isConnecting }: DixitCreateProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const accent = '#7c3aed';
  const accentLight = '#a78bfa';
  const accentGlow = 'rgba(124, 58, 237, 0.4)';

  const handleCreate = () => {
    if (!name.trim()) { setError('Inserisci il tuo nome per continuare'); return; }
    setError(''); onCreateRoom(name.trim());
  };
  const handleJoin = async () => {
    if (!name.trim()) { setError('Inserisci il tuo nome'); return; }
    if (code.length !== 4) { setError('Il codice stanza deve essere composto da 4 lettere'); return; }
    setError('');
    const success = await onJoinRoom(code.toUpperCase(), name.trim());
    if (!success) setError('Stanza non trovata o host non raggiungibile. Verifica il codice.');
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: '#fff' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: '0.75rem', filter: `drop-shadow(0 6px 16px ${accentGlow})`, animation: 'pulse 3s infinite ease-in-out' }}>
          🐇
        </div>
        <h1 style={{
          fontSize: '2.8rem', fontWeight: 900, letterSpacing: '0.08em', margin: '0 0 0.5rem 0', textTransform: 'uppercase',
          background: `linear-gradient(135deg, #e0d4fc 0%, ${accentLight} 50%, ${accent} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 2px 8px ${accentGlow})`,
        }}>
          Dixit
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.5 }}>
          Sogni, indizi e immaginazione. Racconta la tua storia e indovina quella degli altri!
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.6rem', padding: '0.35rem',
        background: 'rgba(20, 18, 40, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '14px', border: `1px solid rgba(124, 58, 237, 0.25)`, marginBottom: '1.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
        {(['create', 'join'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.6rem', borderRadius: '10px', border: 'none',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease',
            color: tab === t ? '#1a0833' : 'rgba(255,255,255,0.7)',
            background: tab === t ? `linear-gradient(135deg, #c4b5fd 0%, ${accent} 50%, #5b21b6 100%)` : 'transparent',
            boxShadow: tab === t ? `0 4px 15px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.3)` : 'none',
          }}>
            {t === 'create' ? <><Crown size={18} /> Crea Stanza</> : <><Users size={18} /> Unisciti</>}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{
        width: '100%', maxWidth: '420px', background: 'rgba(22, 18, 45, 0.82)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '20px',
        padding: '2rem 1.75rem', border: `1px solid rgba(124, 58, 237, 0.3)`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Name */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: accentLight, fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.45rem' }}>
            <User size={15} /> Il tuo nome
          </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') tab === 'create' ? handleCreate() : handleJoin(); }}
            placeholder="Come vuoi farti chiamare?" maxLength={20}
            style={{
              width: '100%', padding: '0.85rem 1rem', background: 'rgba(10, 8, 24, 0.65)',
              border: `1px solid rgba(124, 58, 237, 0.35)`, borderRadius: '10px', color: '#fff',
              fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Code */}
        {tab === 'join' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: accentLight, fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.45rem' }}>
              <KeyRound size={15} /> Codice Stanza
            </label>
            <input type="text" value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
              onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }}
              placeholder="ABCD" maxLength={4}
              style={{
                width: '100%', padding: '0.85rem 1rem', background: 'rgba(10, 8, 24, 0.65)',
                border: `1px solid rgba(124, 58, 237, 0.35)`, borderRadius: '10px', color: '#c4b5fd',
                fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.35em',
                fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase',
              }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.9rem', borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5',
            fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.4,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} /> <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button onClick={tab === 'create' ? handleCreate : handleJoin} disabled={isConnecting}
          style={{
            width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', fontSize: '1.05rem', fontWeight: 800,
            cursor: isConnecting ? 'not-allowed' : 'pointer', color: '#1a0833',
            background: isConnecting ? 'rgba(124, 58, 237, 0.4)' : `linear-gradient(135deg, #c4b5fd 0%, ${accent} 45%, #5b21b6 100%)`,
            boxShadow: isConnecting ? 'none' : `0 6px 22px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          }}>
          {isConnecting ? (
            <><Loader2 size={20} className="animate-spin" /> Connessione in corso...</>
          ) : tab === 'create' ? (
            <><Sparkles size={20} /> Crea Nuova Stanza</>
          ) : (
            <>🐇 Entra nella Partita</>
          )}
        </button>

        {/* Info Footer */}
        <div style={{
          marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(124, 58, 237, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', textAlign: 'center',
        }}>
          <div><div style={{ color: accentLight, fontWeight: 700 }}>3 - 6</div><div>Giocatori</div></div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(124, 58, 237, 0.2)' }} />
          <div><div style={{ color: accentLight, fontWeight: 700 }}>30 Punti</div><div>Per Vincere</div></div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(124, 58, 237, 0.2)' }} />
          <div><div style={{ color: accentLight, fontWeight: 700 }}>Sogni</div><div>& Indizi</div></div>
        </div>
      </div>
    </div>
  );
}
