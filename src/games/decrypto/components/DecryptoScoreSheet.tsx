import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { DecryptoState, DecryptoTeam, RoundRecord } from '../types';

interface Props {
  state: DecryptoState;
  team: DecryptoTeam;
}

const TOKEN_MISC = '/Decrypto/Token/Token_Errata_Comunicazione.png';
const TOKEN_INT = '/Decrypto/Token/Token_Intercettazione.png';

const SHEET_IMAGES: Record<DecryptoTeam, { page1: string; page2: string }> = {
  bianca: {
    page1: '/Decrypto/Squadra_Bianca/Scheda_Compilativa_Bianca_ro1-8.png',
    page2: '/Decrypto/Squadra_Bianca/Scheda_Compilativa_Bianca_ro9-16.png',
  },
  nera: {
    page1: '/Decrypto/Squadra_Nera/Scheda_Compilativa_Nera_ro1-8.png',
    page2: '/Decrypto/Squadra_Nera/Scheda_Compilativa_Nera_ro9-16.png',
  },
};

// ─── Auto-generated from image analysis (1055×1491) — DO NOT EDIT MANUALLY ───
// All values are percentages of the full image dimensions.
// Clue rows, I boxes, R boxes and tokens are positioned absolutely within the image.
interface Rect { left: number; top: number; width: number; height: number }
interface CardLayout {
  nameBox: Rect;
  rows: { clue: Rect; iBox: Rect; rBox: Rect }[];
  tokens: Rect[];
}

const MEASURED_CARDS: CardLayout[] = [
  { // Card 0
    nameBox: { left: 22.370, top: 1.677, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 1.439, top: 7.378, width: 37.697, height: 2.75 }, iBox: { left: 40.095, top: 7.378, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 7.445, width: 3.128, height: 2.683 } },
      { clue: { left: 1.439, top: 11.469, width: 37.697, height: 2.75 }, iBox: { left: 40.095, top: 11.469, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 11.469, width: 3.128, height: 2.75 } },
      { clue: { left: 1.439, top: 15.56, width: 37.697, height: 2.75 }, iBox: { left: 40.095, top: 15.56, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 15.56, width: 3.128, height: 2.75 } },
    ],
    tokens: [
      { left: 39.431, top: 20.255, width: 3.886, height: 2.683 },
      { left: 44.739, top: 20.255, width: 3.033, height: 2.683 },
    ],
  },
  { // Card 1
    nameBox: { left: 71.611, top: 1.677, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 49.523, top: 7.445, width: 38.725, height: 2.75 }, iBox: { left: 89.289, top: 7.445, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 7.445, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 11.469, width: 38.725, height: 2.75 }, iBox: { left: 89.289, top: 11.469, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 11.469, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 15.56, width: 38.725, height: 2.75 }, iBox: { left: 89.289, top: 15.56, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 15.56, width: 3.886, height: 2.75 } },
    ],
    tokens: [
      { left: 88.72, top: 20.389, width: 3.886, height: 2.75 },
      { left: 93.839, top: 20.389, width: 3.886, height: 2.75 },
    ],
  },
  { // Card 2
    nameBox: { left: 22.370, top: 26.526, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 1.439, top: 32.193, width: 37.697, height: 2.75 }, iBox: { left: 40.095, top: 32.193, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 32.193, width: 3.128, height: 2.75 } },
      { clue: { left: 1.439, top: 36.284, width: 37.697, height: 2.683 }, iBox: { left: 40.095, top: 36.284, width: 3.791, height: 2.683 }, rBox: { left: 44.645, top: 36.284, width: 3.128, height: 2.683 } },
      { clue: { left: 1.439, top: 40.309, width: 37.697, height: 2.75 }, iBox: { left: 40.095, top: 40.309, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 40.309, width: 3.128, height: 2.75 } },
    ],
    tokens: [
      { left: 39.431, top: 45.137, width: 3.886, height: 2.683 },
      { left: 44.645, top: 45.137, width: 3.128, height: 2.683 },
    ],
  },
  { // Card 3
    nameBox: { left: 71.611, top: 26.492, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 49.523, top: 32.193, width: 38.725, height: 2.75 }, iBox: { left: 89.289, top: 32.193, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 32.193, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 36.217, width: 38.725, height: 2.683 }, iBox: { left: 89.289, top: 36.217, width: 3.791, height: 2.683 }, rBox: { left: 93.839, top: 36.217, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 40.241, width: 38.725, height: 2.75 }, iBox: { left: 89.289, top: 40.241, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 40.241, width: 3.886, height: 2.75 } },
    ],
    tokens: [
      { left: 88.72, top: 45.003, width: 3.886, height: 2.75 },
      { left: 93.839, top: 45.003, width: 3.886, height: 2.75 },
    ],
  },
  { // Card 4
    nameBox: { left: 22.227, top: 51.375, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 1.439, top: 57.143, width: 37.602, height: 2.75 }, iBox: { left: 40, top: 57.143, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 57.143, width: 3.128, height: 2.75 } },
      { clue: { left: 1.439, top: 61.234, width: 37.602, height: 2.75 }, iBox: { left: 40, top: 61.234, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 61.234, width: 3.128, height: 2.683 } },
      { clue: { left: 1.439, top: 65.325, width: 37.507, height: 2.75 }, iBox: { left: 39.905, top: 65.325, width: 3.886, height: 2.75 }, rBox: { left: 44.645, top: 65.325, width: 3.128, height: 2.75 } },
    ],
    tokens: [
      { left: 39.431, top: 70.02, width: 3.886, height: 2.683 },
      { left: 44.645, top: 70.02, width: 3.128, height: 2.683 },
    ],
  },
  { // Card 5
    nameBox: { left: 71.469, top: 51.408, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 49.523, top: 57.21, width: 38.63, height: 2.75 }, iBox: { left: 89.194, top: 57.21, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 57.21, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 61.234, width: 38.63, height: 2.75 }, iBox: { left: 89.194, top: 61.234, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 61.234, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 65.325, width: 38.536, height: 2.75 }, iBox: { left: 89.1, top: 65.325, width: 3.886, height: 2.75 }, rBox: { left: 93.839, top: 65.325, width: 3.886, height: 2.75 } },
    ],
    tokens: [
      { left: 88.72, top: 70.087, width: 3.791, height: 2.75 },
      { left: 93.839, top: 70.087, width: 3.791, height: 2.75 },
    ],
  },
  { // Card 6
    nameBox: { left: 22.227, top: 76.392, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 1.439, top: 82.16, width: 37.602, height: 2.75 }, iBox: { left: 40, top: 82.16, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 82.16, width: 3.128, height: 2.75 } },
      { clue: { left: 1.439, top: 86.251, width: 37.602, height: 2.683 }, iBox: { left: 40, top: 86.251, width: 3.791, height: 2.683 }, rBox: { left: 44.645, top: 86.251, width: 3.128, height: 2.683 } },
      { clue: { left: 1.439, top: 90.275, width: 37.602, height: 2.75 }, iBox: { left: 40, top: 90.275, width: 3.791, height: 2.75 }, rBox: { left: 44.645, top: 90.275, width: 3.128, height: 2.75 } },
    ],
    tokens: [
      { left: 39.431, top: 95.104, width: 3.886, height: 2.683 },
      { left: 44.645, top: 95.104, width: 3.128, height: 2.683 },
    ],
  },
  { // Card 7
    nameBox: { left: 71.469, top: 76.392, width: 18.389, height: 2.414 },
    rows: [
      { clue: { left: 49.523, top: 82.16, width: 38.536, height: 2.75 }, iBox: { left: 89.1, top: 82.16, width: 3.886, height: 2.75 }, rBox: { left: 93.839, top: 82.16, width: 3.886, height: 2.75 } },
      { clue: { left: 49.523, top: 86.184, width: 38.63, height: 2.75 }, iBox: { left: 89.194, top: 86.184, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 86.184, width: 3.791, height: 2.75 } },
      { clue: { left: 49.523, top: 90.208, width: 38.63, height: 2.75 }, iBox: { left: 89.194, top: 90.208, width: 3.791, height: 2.75 }, rBox: { left: 93.839, top: 90.208, width: 3.886, height: 2.75 } },
    ],
    tokens: [
      { left: 88.72, top: 94.97, width: 3.791, height: 2.75 },
      { left: 93.839, top: 94.97, width: 3.886, height: 2.75 },
    ],
  },
];
// ─── End of auto-generated positions ───

// ─── Dimensioni testo (in cqw = % della larghezza della scheda) ───
// Le righe sono alte ~3.9cqw: un font di ~2.2cqw occupa circa il 55-60% dell'altezza.
const FONT_NAME = '2.1cqw';  // nome giocatore
const FONT_CLUE = '2.2cqw';  // parola indizio
const FONT_BOX  = '2.4cqw';  // numeri nelle caselle I / R

// nameBox rimisurato (template matching sul campo bianco, mediana su bianca/nera e pagine 1-2).
// ─── Colori del testo sulla scheda (cambia qui) ───
const COLOR_NAME = '#000';   // nome giocatore (campo bianco)
const COLOR_I = '#000';      // numeri nelle caselle I (bianche)
const COLOR_R = '#16a34a';   // numeri nelle caselle R (verde)
// Parole indizio: dipendono dallo sfondo delle righe (chiare sulla scheda bianca, scure sulla nera)
const COLOR_CLUE: Record<DecryptoTeam, string> = { bianca: '#000', nera: '#f1f5f9' };

// Debug mode: set to true to show red outlines on all overlays
const DEBUG_OUTLINES = false;
const debugStyle = DEBUG_OUTLINES ? { outline: '1px solid red' } : {};

// ─── Dimensione della scheda nell'overlay ───
// A zoom 100% la scheda è larga quanto lo schermo (max 1000px) ma MAI meno di SHEET_MIN_PX:
// su telefono è quindi più larga dello schermo e si scorre (anche in orizzontale) invece di rimpicciolire il testo.
// Con i pulsanti +/− o il pizzico a due dita si ingrandisce ancora.
const SHEET_MIN_PX = 640;
const SHEET_MAX_PX = 1000;
const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2];
const DEFAULT_ZOOM_IDX = 0;

/** Inline style helper for an absolutely-positioned overlay element */
function absStyle(rect: Rect, extra?: React.CSSProperties): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
    ...debugStyle,
    ...extra,
  };
}

export default function DecryptoScoreSheet({ state, team }: Props) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_ZOOM_IDX);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const zoom = ZOOM_STEPS[zoomIdx];

  // Alla apertura mostra la pagina del round più recente (R.1-8 oppure R.9-16)
  const openSheet = () => {
    setPage(state.rounds.length > 8 ? 2 : 1);
    setZoomIdx(DEFAULT_ZOOM_IDX);
    setOpen(true);
  };

  // Mentre la scheda è aperta: Esc per chiudere e blocco dello scroll della pagina sotto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // All'apertura (e al cambio pagina) porta la vista sull'ultimo round compilato,
  // così su telefono non devi cercarlo trascinando la scheda.
  useEffect(() => {
    if (!open) return;
    const scroller = scrollRef.current;
    const sheet = sheetRef.current;
    if (!scroller || !sheet) return;
    const idx = state.rounds.length - 1 - (page === 1 ? 0 : 8);
    if (idx < 0 || idx > 7) { scroller.scrollTo({ top: 0, left: 0 }); return; }
    const card = MEASURED_CARDS[idx];
    const sheetRect = sheet.getBoundingClientRect();
    const scrollRect = scroller.getBoundingClientRect();
    const sheetLeft = sheetRect.left - scrollRect.left + scroller.scrollLeft;
    const sheetTop = sheetRect.top - scrollRect.top + scroller.scrollTop;
    const cx = sheetLeft + sheetRect.width * ((idx % 2 === 0 ? 25 : 75) / 100);
    const cy = sheetTop + sheetRect.height * ((card.nameBox.top + 11) / 100);
    scroller.scrollTo({
      left: Math.max(0, cx - scroller.clientWidth / 2),
      top: Math.max(0, cy - scroller.clientHeight / 2),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  const sheetImg = page === 1 ? SHEET_IMAGES[team].page1 : SHEET_IMAGES[team].page2;
  const startIdx = page === 1 ? 0 : 8;

  const renderCardOverlay = (cardIdx: number) => {
    const record: RoundRecord | undefined = state.rounds[startIdx + cardIdx];
    const layout = MEASURED_CARDS[cardIdx];
    if (!record) return null;

    // Sort clues ascending by code number, keeping original index for I mapping
    const sortedEntries = record.code
      .map((num, origIdx) => ({ num, origIdx, clue: record.clues[origIdx] || '' }))
      .sort((a, b) => a.num - b.num);

    const isActiveRound = record.activeTeam === team;
    const guessValues = isActiveRound ? record.teamGuess : record.opponentGuess;

    return (
      <React.Fragment key={cardIdx}>
        {/* Player name */}
        <div style={absStyle(layout.nameBox, {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: FONT_NAME,
          fontWeight: 700, color: COLOR_NAME,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        })}>
          {record.activePlayerName}
        </div>

        {/* 3 clue rows */}
        {sortedEntries.map((entry, i) => {
          const row = layout.rows[i];
          if (!row) return null;
          return (
            <React.Fragment key={`${cardIdx}-row-${i}`}>
              {/* Clue word — nero su scheda bianca, chiaro su scheda nera */}
              <div style={absStyle(row.clue, {
                display: 'flex', alignItems: 'center',
                paddingLeft: '1%',
                fontSize: FONT_CLUE,
                lineHeight: 1,
                color: COLOR_CLUE[team], fontWeight: 600,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              })}>
                <strong style={{ marginRight: '0.4cqw', flexShrink: 0 }}>{entry.num}.</strong>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.clue}</span>
              </div>

              {/* I box — black number, centered */}
              <div style={absStyle(row.iBox, {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: FONT_BOX,
                lineHeight: 1,
                fontWeight: 800, fontFamily: 'monospace',
                color: COLOR_I,
              })}>
                {guessValues[entry.origIdx] ?? ''}
              </div>

              {/* R box — green number, centered */}
              <div style={absStyle(row.rBox, {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: FONT_BOX,
                lineHeight: 1,
                fontWeight: 800, fontFamily: 'monospace',
                color: COLOR_R,
              })}>
                {entry.num}
              </div>
            </React.Fragment>
          );
        })}

        {/* Token circles */}
        {record.miscommunication && isActiveRound && layout.tokens[0] && (
          <div style={absStyle(layout.tokens[0], {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          })}>
            <img src={TOKEN_MISC} alt="Err" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
        )}
        {record.interception && !isActiveRound && layout.tokens[1] && (
          <div style={absStyle(layout.tokens[1], {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          })}>
            <img src={TOKEN_INT} alt="Int" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
        )}
      </React.Fragment>
    );
  };

  const teamLabel = team === 'bianca' ? 'Bianca' : 'Nera';

  return (
    <>
      {/* Unico elemento sempre visibile in pagina: il pulsante */}
      <button
        className="btn btn-secondary"
        onClick={openSheet}
        style={{ width: '100%', maxWidth: '360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
      >
        <span style={{ fontSize: '1.1rem' }}>📋</span> Scheda compilativa
      </button>

      {/* Overlay a schermo intero (portal su body per stare sopra a tutto il tavolo) */}
      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Scheda compilativa ${teamLabel}`}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.94)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Barra superiore FISSA: resta sempre visibile mentre scorri la scheda */}
          <div style={{
            flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: '0.5rem', padding: '2.5rem 0.75rem 0.5rem', flexWrap: 'wrap', // 2.5rem = spazio del banner CODICE LOBBY, che sta sopra all'overlay
            background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              📋 Scheda — {teamLabel}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                onClick={() => setPage(page === 1 ? 2 : 1)}>
                {page === 1 ? 'R.9-16 →' : '← R.1-8'}
              </button>
              <button className="btn btn-secondary" aria-label="Riduci"
                style={{ padding: '0.2rem 0.7rem', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}
                disabled={zoomIdx === 0}
                onClick={() => setZoomIdx(i => Math.max(0, i - 1))}>
                −
              </button>
              <button className="btn btn-secondary" aria-label="Ingrandisci"
                style={{ padding: '0.2rem 0.7rem', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}
                disabled={zoomIdx === ZOOM_STEPS.length - 1}
                onClick={() => setZoomIdx(i => Math.min(ZOOM_STEPS.length - 1, i + 1))}>
                +
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Chiudi scheda"
                style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', borderRadius: '50%', width: '34px', height: '34px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Area scorrevole (verticale + orizzontale). Click sullo sfondo = chiudi. */}
          <div
            ref={scrollRef}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
            style={{
              flex: '1 1 auto', minHeight: 0, overflow: 'auto', display: 'flex',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}
          >
            {/* margin:auto = centrata se più piccola dell'area, senza tagliare il lato sinistro/alto quando è più grande */}
            <div style={{ margin: 'auto', padding: '0.75rem', flex: '0 0 auto' }}>
              {/* La scheda. Le % degli overlay e le unità cqw si riferiscono a QUESTO elemento
                  (immagine 1055×1491, tutte e 4 le pagine hanno le stesse proporzioni). */}
              <div
                ref={sheetRef}
                style={{
                  position: 'relative',
                  width: `calc(max(min(100vw - 1.5rem, ${SHEET_MAX_PX}px), ${SHEET_MIN_PX}px) * ${zoom})`,
                  aspectRatio: '1055 / 1491',
                  containerType: 'inline-size' as React.CSSProperties['containerType'],
                  borderRadius: '8px', overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                }}
              >
                <img src={sheetImg}
                  alt={`Scheda ${teamLabel}`}
                  style={{ width: '100%', height: '100%', display: 'block' }} />
                {Array.from({ length: 8 }).map((_, i) => renderCardOverlay(i))}
              </div>

              {/* Pulsante in fondo alla scheda: si raggiunge scorrendo fino alla fine.
                  Resta ancorato al bordo sinistro dello schermo anche se la scheda è più larga (sticky). */}
              <div style={{
                position: 'sticky', left: '0.75rem',
                width: 'calc(100vw - 1.5rem)', maxWidth: '100%',
                display: 'flex', justifyContent: 'center',
                padding: '1rem 0 calc(1rem + env(safe-area-inset-bottom, 0px))',
              }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setOpen(false)}
                  style={{ width: '100%', maxWidth: '320px', fontSize: '1.05rem', fontWeight: 700, padding: '0.75rem 1rem' }}
                >
                  ✕ Chiudi scheda
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
