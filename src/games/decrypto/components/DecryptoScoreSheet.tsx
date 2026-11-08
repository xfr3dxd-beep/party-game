import React, { useState } from 'react';
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
    nameBox: { left: 11.943, top: 0.201, width: 26.351, height: 2.482 },
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
    nameBox: { left: 60.948, top: 0.201, width: 28.531, height: 2.482 },
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
    nameBox: { left: 11.943, top: 25.151, width: 26.351, height: 2.482 },
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
    nameBox: { left: 60.948, top: 25.151, width: 28.531, height: 2.482 },
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
    nameBox: { left: 11.943, top: 50.101, width: 26.351, height: 2.482 },
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
    nameBox: { left: 60.948, top: 50.101, width: 28.531, height: 2.482 },
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
    nameBox: { left: 11.943, top: 75.05, width: 26.351, height: 2.482 },
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
    nameBox: { left: 60.948, top: 75.05, width: 28.531, height: 2.482 },
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

// Debug mode: set to true to show red outlines on all overlays
const DEBUG_OUTLINES = false;
const debugStyle = DEBUG_OUTLINES ? { outline: '1px solid red' } : {};

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
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);

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
          fontSize: '0.9cqw',
          fontWeight: 700, color: '#222',
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
              {/* Clue word — black text */}
              <div style={absStyle(row.clue, {
                display: 'flex', alignItems: 'center',
                paddingLeft: '0.5%',
                fontSize: '0.75cqw',
                color: '#111', fontWeight: 600,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              })}>
                <strong style={{ marginRight: '2px', flexShrink: 0 }}>{entry.num}.</strong>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.clue}</span>
              </div>

              {/* I box — black number, centered */}
              <div style={absStyle(row.iBox, {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1cqw',
                fontWeight: 800, fontFamily: 'monospace',
                color: '#111',
              })}>
                {guessValues[entry.origIdx] ?? ''}
              </div>

              {/* R box — green number, centered */}
              <div style={absStyle(row.rBox, {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1cqw',
                fontWeight: 800, fontFamily: 'monospace',
                color: '#16a34a',
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          📋 Scheda — {team === 'bianca' ? 'Bianca' : 'Nera'}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            onClick={() => setPage(page === 1 ? 2 : 1)}>
            {page === 1 ? 'R.9-16 →' : '← R.1-8'}
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            onClick={() => setExpanded(!expanded)}>
            {expanded ? '↙ Riduci' : '↗ Espandi'}
          </button>
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        containerType: 'inline-size' as React.CSSProperties['containerType'],
        maxHeight: expanded ? '90vh' : '500px',
        overflow: 'auto',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <img src={sheetImg}
          alt={`Scheda ${team === 'bianca' ? 'Bianca' : 'Nera'}`}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
        {/* All overlays use absolute positioning within the same container */}
        {Array.from({ length: 8 }).map((_, i) => renderCardOverlay(i))}
      </div>
    </div>
  );
}
