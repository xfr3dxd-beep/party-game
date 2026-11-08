import React, { useState, useEffect, useRef } from 'react';

interface Props {
  durationSeconds: number;
  startedAt: number | null; // timestamp ms
}

export default function Hourglass({ durationSeconds, startedAt }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) { setRemaining(durationSeconds); return; }
    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setRemaining(Math.max(0, Math.ceil(durationSeconds - elapsed)));
    };
    tick();
    intervalRef.current = setInterval(tick, 250);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startedAt, durationSeconds]);

  const progress = startedAt ? Math.min(1, (Date.now() - startedAt) / (durationSeconds * 1000)) : 0;
  const isExpired = remaining <= 0 && startedAt !== null;
  const isWarning = remaining <= 10 && remaining > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      {/* Hourglass SVG */}
      <svg width="60" height="80" viewBox="0 0 60 80" style={{ filter: isExpired ? 'grayscale(1)' : undefined }}>
        {/* Frame */}
        <rect x="8" y="2" width="44" height="4" rx="2" fill="#94a3b8" />
        <rect x="8" y="74" width="44" height="4" rx="2" fill="#94a3b8" />
        <line x1="12" y1="6" x2="12" y2="74" stroke="#94a3b8" strokeWidth="2" />
        <line x1="48" y1="6" x2="48" y2="74" stroke="#94a3b8" strokeWidth="2" />

        {/* Top bulb glass */}
        <path d="M14,8 Q14,35 30,40 Q46,35 46,8 Z" fill="rgba(148,163,184,0.15)" stroke="#64748b" strokeWidth="1" />
        {/* Bottom bulb glass */}
        <path d="M14,72 Q14,45 30,40 Q46,45 46,72 Z" fill="rgba(148,163,184,0.15)" stroke="#64748b" strokeWidth="1" />

        {/* Sand in top (shrinks) */}
        {!isExpired && (
          <clipPath id="topClip">
            <path d="M14,8 Q14,35 30,40 Q46,35 46,8 Z" />
          </clipPath>
        )}
        {!isExpired && (
          <rect x="14" y={8 + progress * 32} width="32" height={32 - progress * 32}
                fill={isWarning ? '#ef4444' : '#fbbf24'} clipPath="url(#topClip)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.6;0.8" dur="2s" repeatCount="indefinite" />
          </rect>
        )}

        {/* Sand in bottom (grows) */}
        <clipPath id="bottomClip">
          <path d="M14,72 Q14,45 30,40 Q46,45 46,72 Z" />
        </clipPath>
        <rect x="14" y={72 - progress * 32} width="32" height={progress * 32}
              fill={isWarning ? '#ef4444' : '#fbbf24'} clipPath="url(#bottomClip)" opacity="0.8" />

        {/* Falling sand stream */}
        {!isExpired && startedAt && (
          <line x1="30" y1="38" x2="30" y2={42 + progress * 28} stroke={isWarning ? '#ef4444' : '#fbbf24'} strokeWidth="2" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="0.8s" repeatCount="indefinite" />
          </line>
        )}
      </svg>

      {/* Timer text */}
      <div style={{
        fontSize: '1.3rem',
        fontWeight: 800,
        fontFamily: 'monospace',
        color: isExpired ? '#ef4444' : isWarning ? '#ef4444' : '#fbbf24',
        animation: isWarning ? 'pulse 0.5s ease-in-out infinite' : undefined,
      }}>
        {isExpired ? '⏰ Tempo!' : `${remaining}s`}
      </div>
    </div>
  );
}
