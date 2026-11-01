import React, { useState } from 'react';

interface RoomCodeBannerProps {
  roomCode: string;
}

export default function RoomCodeBanner({ roomCode }: RoomCodeBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, rgba(15,12,25,0.95) 0%, rgba(25,20,40,0.95) 100%)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.6rem', padding: '0.35rem 1rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    }}>
      <span style={{
        fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)',
        fontWeight: 600, letterSpacing: '0.03em',
      }}>
        CODICE LOBBY:
      </span>
      <span style={{
        fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.2em',
        fontFamily: 'monospace',
        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {roomCode}
      </span>
      <button
        onClick={handleCopy}
        style={{
          background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '6px', padding: '0.2rem 0.5rem',
          color: copied ? '#22c55e' : 'rgba(255,255,255,0.7)',
          fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {copied ? '✓ Copiato' : '📋 Copia'}
      </button>
    </div>
  );
}
