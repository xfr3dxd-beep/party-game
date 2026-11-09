import React from 'react';
import type { DecryptoState, DecryptoTeam } from '../types';
import Hourglass from './Hourglass';
import DecryptoScoreSheet from './DecryptoScoreSheet';

interface Props {
  state: DecryptoState;
  myTeam: DecryptoTeam;
  children: React.ReactNode; // Phase-specific content
}

const PAROLIERE: Record<DecryptoTeam, string> = {
  bianca: '/Decrypto/Squadra_Bianca/Paroliere_Squadra_Bianca.png',
  nera: '/Decrypto/Squadra_Nera/Paroliere_Squadra_Nera.png',
};
// ─── Misure dei display rossi nei due paroliere (immagini 2138×735 px) ───
// xs = [x iniziale, x finale] dei 4 display; cy = centro verticale; h = altezza display.
// Le due immagini hanno display in posizioni diverse, quindi hanno misure separate.
const PAROLIERE_W = 2138;
const PAROLIERE_H = 735;
const PAROLIERE_DISPLAYS: Record<DecryptoTeam, { cy: number; h: number; xs: [number, number][] }> = {
  bianca: { cy: 221, h: 220, xs: [[192, 572], [655, 1031], [1111, 1487], [1567, 1950]] },
  nera:   { cy: 225, h: 225, xs: [[185, 603], [688, 1074], [1163, 1547], [1633, 2008]] },
};
const PAROLIERE_FONT_MAX = 2.6; // dimensione massima del testo (cqw = % larghezza paroliere)
const PAROLIERE_FILL = 0.84;    // quanta larghezza del display può occupare la parola
const CHAR_WIDTH = 0.62;        // larghezza media di un carattere in grassetto (in em)

const DORSO_BIANCA = '/Decrypto/Squadra_Bianca/Dorso_Codici_Bianco.png';
const DORSO_NERA = '/Decrypto/Squadra_Nera/Dorso_Codici_Nera.png';
const TOKEN_MISC = '/Decrypto/Token/Token_Errata_Comunicazione.png';
const TOKEN_INT = '/Decrypto/Token/Token_Intercettazione.png';

export default function DecryptoGameBoard({ state, myTeam, children }: Props) {
  const teamWords = myTeam === 'bianca' ? state.biancaWords : state.neraWords;

  return (
    <div>
      {/* 1. Paroliere — le 4 parole sono centrate sui 4 display rossi (misurati sui pixel) */}
      <div style={{
        maxWidth: '700px', margin: '0 auto 1rem', position: 'relative',
        containerType: 'inline-size' as React.CSSProperties['containerType'],
      }}>
        <img src={PAROLIERE[myTeam]} alt="Paroliere" style={{ width: '100%', display: 'block' }} />
        {teamWords.map((w, i) => {
          const cfg = PAROLIERE_DISPLAYS[myTeam];
          const [x0, x1] = cfg.xs[i];
          const boxW = ((x1 - x0) / PAROLIERE_W) * 100;          // larghezza display in cqw
          const fontCqw = Math.min(
            PAROLIERE_FONT_MAX,
            (boxW * PAROLIERE_FILL) / (Math.max(w.length, 1) * CHAR_WIDTH),  // si rimpicciolisce se la parola è lunga
          );
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${(x0 / PAROLIERE_W) * 100}%`,
              top: `${((cfg.cy - cfg.h / 2) / PAROLIERE_H) * 100}%`,
              width: `${boxW}%`,
              height: `${(cfg.h / PAROLIERE_H) * 100}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: `${fontCqw}cqw`, lineHeight: 1,
              color: '#fff', whiteSpace: 'nowrap', textAlign: 'center',
              textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)',
            }}>
              {w}
            </div>
          );
        })}
      </div>

      {/* 2. Shared visual layout: Dorso + Hourglass + Dorso */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        {/* Left: Dorso Bianca + Token Errata below */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100px' }}>
          <img src={DORSO_BIANCA} alt="Dorso Bianca" style={{ width: '100%', borderRadius: '8px' }} />
          <div style={{ textAlign: 'center' }}>
            <img src={TOKEN_MISC} alt="Errata" style={{ width: '36px', height: '36px' }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Errate: <strong style={{ color: state.biancaMiscommunications >= 2 ? '#ef4444' : 'inherit' }}>
                {state.biancaMiscommunications}/2
              </strong>
            </div>
          </div>
        </div>

        {/* Center: Hourglass — 90 seconds, only during clue-giving */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Hourglass durationSeconds={90} startedAt={state.timerStartedAt} />
          <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Round {state.roundNumber} — {state.activeTeam === 'bianca' ? '⬜ Bianca' : '⬛ Nera'}
          </div>
        </div>

        {/* Right: Dorso Nera + Token Intercettazione below */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100px' }}>
          <img src={DORSO_NERA} alt="Dorso Nera" style={{ width: '100%', borderRadius: '8px' }} />
          <div style={{ textAlign: 'center' }}>
            <img src={TOKEN_INT} alt="Intercettazione" style={{ width: '36px', height: '36px' }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Intercett.: <strong style={{ color: state.neraInterceptions >= 2 ? '#22c55e' : 'inherit' }}>
                {state.neraInterceptions}/2
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scheda Compilativa — ALWAYS visible for all players */}
      <div style={{ maxWidth: '600px', margin: '0 auto 1rem' }}>
        <DecryptoScoreSheet state={state} team={myTeam} />
      </div>

      {/* 4. Phase-specific content */}
      <div style={{ marginTop: '1rem' }}>
        {children}
      </div>
    </div>
  );
}
