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

// ─── Sfondo del tavolo (Public/Decrypto/Sfondo_Tavolo.webp, 1477×1065 px) ───
// Tutto il tavolo è un "palcoscenico" con le STESSE proporzioni dell'immagine: così cornici e componenti
// restano allineati a qualsiasi larghezza dello schermo. Le posizioni qui sotto sono in pixel dell'immagine
// originale (1477×1065) e vengono convertite in percentuali / cqw (cqw = 1% della larghezza del tavolo).
const SFONDO = '/Decrypto/Sfondo_Tavolo.webp';
const SFONDO_W = 1477;
const SFONDO_H = 1065;
const TAVOLO_MAX_PX = 820;            // larghezza massima del tavolo su schermi grandi
const pctX = (x: number) => `${(x / SFONDO_W) * 100}%`;
const pctY = (y: number) => `${(y / SFONDO_H) * 100}%`;
const cqw = (x: number) => `${(x / SFONDO_W) * 100}cqw`;

// Aperture delle due cornici in alto (misurate sui pixel dello sfondo): dentro vanno i dorsi.
// center = centro dell'apertura; contentW = larghezza a cui portare il dorso (poco meno dell'apertura, così la cornice resta visibile).
// bbox = [x0, y0, x1, y1] della parte opaca del PNG del dorso (esclude i margini trasparenti).
const FRAME_CY = 180;
const DORSI = {
  bianca: { src: DORSO_BIANCA, alt: 'Dorso Bianca', imgW: 1246, imgH: 1263, bbox: [55, 48, 1204, 1214], cx: 529, cy: FRAME_CY, contentW: 148 },
  nera:   { src: DORSO_NERA,   alt: 'Dorso Nera',   imgW: 1116, imgH: 1182, bbox: [2, 6, 1109, 1178],   cx: 948.5, cy: FRAME_CY, contentW: 146 },
};

function dorsoStyle(d: typeof DORSI.bianca): React.CSSProperties {
  const s = d.contentW / (d.bbox[2] - d.bbox[0]);   // scala PNG → pixel dello sfondo
  const left = d.cx - ((d.bbox[0] + d.bbox[2]) / 2) * s;
  const top = d.cy - ((d.bbox[1] + d.bbox[3]) / 2) * s;
  return { position: 'absolute', left: pctX(left), top: pctY(top), width: pctX(d.imgW * s), height: pctY(d.imgH * s) };
}

// Posizioni degli altri elementi sul tavolo (pixel dello sfondo)
const CLESSIDRA = { cx: 739, top: 98, width: 160 };        // tra le due cornici (timer incluso)
const CONTATORE_ERRATE = { cx: 275, cy: FRAME_CY };         // a sinistra della cornice Bianca
const CONTATORE_INTERC = { cx: 1202, cy: FRAME_CY };        // a destra della cornice Nera
const TOKEN_SIZE = 96;                                      // lato dei token
const PAROLIERE_BOX = { cx: 739, top: 490, width: 1340 };   // il paroliere è appoggiato sul tavolo, sopra la parte bassa del logo

const labelFont = 'clamp(0.6rem, 1.6cqw, 0.85rem)';

export default function DecryptoGameBoard({ state, myTeam, children }: Props) {
  const teamWords = myTeam === 'bianca' ? state.biancaWords : state.neraWords;

  return (
    <div>
      {/* 1. TAVOLO: sfondo + dorsi nelle cornici + clessidra + contatori + paroliere */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: `${TAVOLO_MAX_PX}px`, margin: '0 auto 0.75rem',
        aspectRatio: `${SFONDO_W} / ${SFONDO_H}`,
        backgroundImage: `url(${SFONDO})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
        containerType: 'inline-size' as React.CSSProperties['containerType'],
        borderRadius: '2cqw',
      }}>
        {/* Dorsi dentro le due cornici in alto */}
        <img src={DORSI.bianca.src} alt={DORSI.bianca.alt} style={dorsoStyle(DORSI.bianca)} />
        <img src={DORSI.nera.src} alt={DORSI.nera.alt} style={dorsoStyle(DORSI.nera)} />

        {/* Contatore Errate (Bianca, a sinistra) */}
        <div style={{
          position: 'absolute', left: pctX(CONTATORE_ERRATE.cx), top: pctY(CONTATORE_ERRATE.cy),
          transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap',
        }}>
          <img src={TOKEN_MISC} alt="Errata" style={{ width: cqw(TOKEN_SIZE), height: cqw(TOKEN_SIZE), minWidth: '26px', minHeight: '26px' }} />
          <div style={{ fontSize: labelFont, color: '#e6ecf5', marginTop: '2px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Errate: <strong style={{ color: state.biancaMiscommunications >= 2 ? '#ef4444' : 'inherit' }}>
              {state.biancaMiscommunications}/2
            </strong>
          </div>
        </div>

        {/* Contatore Intercettazioni (Nera, a destra) */}
        <div style={{
          position: 'absolute', left: pctX(CONTATORE_INTERC.cx), top: pctY(CONTATORE_INTERC.cy),
          transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap',
        }}>
          <img src={TOKEN_INT} alt="Intercettazione" style={{ width: cqw(TOKEN_SIZE), height: cqw(TOKEN_SIZE), minWidth: '26px', minHeight: '26px' }} />
          <div style={{ fontSize: labelFont, color: '#e6ecf5', marginTop: '2px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Intercett.: <strong style={{ color: state.neraInterceptions >= 2 ? '#22c55e' : 'inherit' }}>
              {state.neraInterceptions}/2
            </strong>
          </div>
        </div>

        {/* Clessidra (90 secondi) al centro, tra le due cornici */}
        <div style={{ position: 'absolute', left: pctX(CLESSIDRA.cx), top: pctY(CLESSIDRA.top), transform: 'translateX(-50%)' }}>
          <Hourglass
            durationSeconds={90}
            startedAt={state.timerStartedAt}
            width={cqw(CLESSIDRA.width)}
            fontSize="clamp(0.8rem, 3.2cqw, 1.3rem)"
          />
        </div>

        {/* Paroliere — le 4 parole sono centrate sui 4 display rossi (misurati sui pixel) */}
        <div style={{
          position: 'absolute', left: pctX(PAROLIERE_BOX.cx - PAROLIERE_BOX.width / 2), top: pctY(PAROLIERE_BOX.top),
          width: pctX(PAROLIERE_BOX.width), aspectRatio: `${PAROLIERE_W} / ${PAROLIERE_H}`,
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
      </div>

      {/* 2. Round e squadra di turno */}
      <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--bg-tertiary)', marginBottom: '0.5rem' }}>
        Round {state.roundNumber} — {state.activeTeam === 'bianca' ? '⬜ Bianca' : '⬛ Nera'}
      </div>

      {/* 3. Scheda Compilativa — pulsante sempre visibile sotto il tavolo; la scheda si apre in overlay a schermo intero */}
      <div style={{ maxWidth: '600px', margin: '0 auto 1rem', display: 'flex', justifyContent: 'center' }}>
        <DecryptoScoreSheet state={state} team={myTeam} />
      </div>

      {/* 4. Phase-specific content */}
      <div style={{ marginTop: '1rem' }}>
        {children}
      </div>
    </div>
  );
}
