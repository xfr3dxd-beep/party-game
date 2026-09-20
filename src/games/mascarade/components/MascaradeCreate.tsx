import React, { useState } from 'react';
import { User, KeyRound, Sparkles, AlertCircle, Loader2, Users, Crown } from 'lucide-react';

export interface MascaradeCreateProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => Promise<boolean>;
  isConnecting: boolean;
}

export default function MascaradeCreate({
  onCreateRoom,
  onJoinRoom,
  isConnecting,
}: MascaradeCreateProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Inserisci il tuo nome per continuare');
      return;
    }
    setError('');
    onCreateRoom(name.trim());
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Inserisci il tuo nome');
      return;
    }
    if (code.length !== 4) {
      setError('Il codice stanza deve essere composto da 4 lettere');
      return;
    }
    setError('');
    const success = await onJoinRoom(code.toUpperCase(), name.trim());
    if (!success) {
      setError('Stanza non trovata o host non raggiungibile. Verifica il codice.');
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        color: '#ffffff',
      }}
    >
      {/* Title & Theme Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            fontSize: '4.5rem',
            lineHeight: 1,
            marginBottom: '0.75rem',
            filter: 'drop-shadow(0 6px 16px rgba(212, 168, 67, 0.4))',
            animation: 'pulse 3s infinite ease-in-out',
          }}
        >
          🎭
        </div>

        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #fff2cc 0%, #d4a843 50%, #b8860b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 8px rgba(212, 168, 67, 0.35))',
          }}
        >
          Mascarade
        </h1>

        <p
          style={{
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '1rem',
            maxWidth: '380px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Bluff, deduzione e colpi di scena. Indossa una maschera e accumula 13 monete per vincere!
        </p>
      </div>

      {/* Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          padding: '0.35rem',
          background: 'rgba(20, 18, 28, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '14px',
          border: '1px solid rgba(212, 168, 67, 0.25)',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <button
          onClick={() => {
            setTab('create');
            setError('');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.6rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: tab === 'create' ? '#1c1300' : 'rgba(255, 255, 255, 0.7)',
            background:
              tab === 'create'
                ? 'linear-gradient(135deg, #f3cf7a 0%, #d4a843 50%, #b8860b 100%)'
                : 'transparent',
            boxShadow:
              tab === 'create'
                ? '0 4px 15px rgba(212, 168, 67, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : 'none',
          }}
        >
          <Crown size={18} color={tab === 'create' ? '#1c1300' : 'rgba(255, 255, 255, 0.6)'} />
          Crea Stanza
        </button>

        <button
          onClick={() => {
            setTab('join');
            setError('');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.6rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: tab === 'join' ? '#1c1300' : 'rgba(255, 255, 255, 0.7)',
            background:
              tab === 'join'
                ? 'linear-gradient(135deg, #f3cf7a 0%, #d4a843 50%, #b8860b 100%)'
                : 'transparent',
            boxShadow:
              tab === 'join'
                ? '0 4px 15px rgba(212, 168, 67, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : 'none',
          }}
        >
          <Users size={18} color={tab === 'join' ? '#1c1300' : 'rgba(255, 255, 255, 0.6)'} />
          Unisciti
        </button>
      </div>

      {/* Main Glass Form Panel */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(22, 20, 32, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          border: '1px solid rgba(212, 168, 67, 0.3)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Name input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#d4a843',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.45rem',
              letterSpacing: '0.02em',
            }}
          >
            <User size={15} />
            Il tuo nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                tab === 'create' ? handleCreate() : handleJoin();
              }
            }}
            placeholder="Come vuoi farti chiamare?"
            maxLength={20}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              background: 'rgba(10, 8, 16, 0.65)',
              border: '1px solid rgba(212, 168, 67, 0.35)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#d4a843';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 168, 67, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.35)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Room Code (if join tab) */}
        {tab === 'join' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#d4a843',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.45rem',
                letterSpacing: '0.02em',
              }}
            >
              <KeyRound size={15} />
              Codice Stanza
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoin();
              }}
              placeholder="ABCD"
              maxLength={4}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'rgba(10, 8, 16, 0.65)',
                border: '1px solid rgba(212, 168, 67, 0.35)',
                borderRadius: '10px',
                color: '#f8d374',
                fontSize: '1.6rem',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '0.35em',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#d4a843';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 168, 67, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.35)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 0.9rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={tab === 'create' ? handleCreate : handleJoin}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            color: '#1a1200',
            background: isConnecting
              ? 'rgba(212, 168, 67, 0.4)'
              : 'linear-gradient(135deg, #f5d485 0%, #d4a843 45%, #b8860b 100%)',
            boxShadow: isConnecting
              ? 'none'
              : '0 6px 22px rgba(212, 168, 67, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            transition: 'transform 0.15s ease, filter 0.15s ease',
          }}
          onMouseDown={(e) => {
            if (!isConnecting) e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            if (!isConnecting) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isConnecting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Connessione in corso...</span>
            </>
          ) : tab === 'create' ? (
            <>
              <Sparkles size={20} />
              <span>Crea Nuova Stanza</span>
            </>
          ) : (
            <>
              <span>🎭 Entra nella Mascherata</span>
            </>
          )}
        </button>

        {/* Player Count & Details Info */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(212, 168, 67, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: '0.8rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ color: '#d4a843', fontWeight: 700 }}>6 - 12</div>
            <div>Giocatori</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(212, 168, 67, 0.2)' }} />
          <div>
            <div style={{ color: '#d4a843', fontWeight: 700 }}>13 Monete</div>
            <div>Per Vincere</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(212, 168, 67, 0.2)' }} />
          <div>
            <div style={{ color: '#d4a843', fontWeight: 700 }}>Bluff</div>
            <div>& Segreti</div>
          </div>
        </div>
      </div>
    </div>
  );
}
