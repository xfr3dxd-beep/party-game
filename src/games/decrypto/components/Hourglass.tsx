import React, { useState, useEffect, useRef } from 'react';

interface Props {
  durationSeconds: number;
  startedAt: number | null; // timestamp ms
}

// ─── Immagini (in Public/Decrypto/Clessidra/) ───
const HOURGLASS_IMG = '/Decrypto/Clessidra/Clessidra.png';            // cornice + vetro (PNG trasparente)
const GLASS_MASK = '/Decrypto/Clessidra/Clessidra_vetro_mask.png';    // sagoma dell'interno del vetro: la sabbia viene ritagliata da questa

// Larghezza della clessidra in pixel (l'altezza segue le proporzioni dell'immagine)
const HOURGLASS_WIDTH = 86;

// ─── Geometria dell'immagine Clessidra.png (380×661 px) ───
// Servono per far scendere la sabbia: tutte le Y sono in pixel dell'immagine.
const IMG_W = 380;
const IMG_H = 661;
const GLASS_TOP = 121;    // Y dove inizia l'interno della bolla alta
const GLASS_NECK = 315.6; // Y del collo (punto più stretto)
const GLASS_BOTTOM = 526; // Y dove finisce l'interno della bolla bassa
const STREAM_X = 190.5;   // X del centro (filo di sabbia)
const STREAM_W = 8;       // spessore del filo di sabbia

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
  const sandColor = isWarning ? '#ef4444' : '#fbbf24';

  // Sabbia nella bolla alta: la superficie scende verso il collo
  const topSurface = GLASS_TOP + progress * (GLASS_NECK - GLASS_TOP);
  // Sabbia nella bolla bassa: la superficie sale dal fondo verso il collo
  const bottomSurface = GLASS_BOTTOM - progress * (GLASS_BOTTOM - GLASS_NECK);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      {/* Clessidra: sabbia (dietro) + immagine con cornice e vetro trasparente (davanti) */}
      <div style={{
        position: 'relative', width: `${HOURGLASS_WIDTH}px`, aspectRatio: `${IMG_W} / ${IMG_H}`,
        filter: isExpired ? 'grayscale(1)' : undefined,
      }}>
        {/* Strato sabbia, ritagliato con la sagoma dell'interno del vetro */}
        <div style={{
          position: 'absolute', inset: 0,
          WebkitMaskImage: `url(${GLASS_MASK})`, maskImage: `url(${GLASS_MASK})`,
          WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        }}>
          <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`} preserveAspectRatio="none"
               style={{ width: '100%', height: '100%', display: 'block' }}>
            {/* Sand in top (shrinks) */}
            {!isExpired && (
              <rect x="0" y={topSurface} width={IMG_W} height={GLASS_NECK + 6 - topSurface}
                    fill={sandColor} opacity="0.85">
                <animate attributeName="opacity" values="0.85;0.65;0.85" dur="2s" repeatCount="indefinite" />
              </rect>
            )}

            {/* Sand in bottom (grows) */}
            <rect x="0" y={bottomSurface} width={IMG_W} height={GLASS_BOTTOM + 6 - bottomSurface}
                  fill={sandColor} opacity="0.85" />

            {/* Falling sand stream: dal collo fino alla superficie della sabbia sotto */}
            {!isExpired && startedAt && (
              <rect x={STREAM_X - STREAM_W / 2} y={GLASS_NECK - 10} width={STREAM_W}
                    height={Math.max(0, bottomSurface - (GLASS_NECK - 10))}
                    fill={sandColor} opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.4;0.7" dur="0.8s" repeatCount="indefinite" />
              </rect>
            )}
          </svg>
        </div>

        {/* Cornice + vetro */}
        <img src={HOURGLASS_IMG} alt="Clessidra"
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      </div>

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
