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

/*
  Image: 1055 × 1491 — 8 round cards in 2 cols × 4 rows.
  Each card ≈ 509 × 358 px.

  Card internal layout (% of card):
    Player name: in header banner box
    ROUND XX line with I and R headers
    3 clue rows (gray bars) each with I and R small squares to the right
    Token row at bottom with 2 circles

  The 6 squares: 3 under I + 3 under R
  The 4 lines: player name + 3 clue word lines
*/

// Card grid positions (% of full 1055×1491 image)
const CARDS = [
  { left: 1.1, top: 0.4, width: 48.2, height: 24.0 },   // Round 1
  { left: 50.7, top: 0.4, width: 48.2, height: 24.0 },  // Round 2
  { left: 1.1, top: 25.2, width: 48.2, height: 24.0 },  // Round 3
  { left: 50.7, top: 25.2, width: 48.2, height: 24.0 }, // Round 4
  { left: 1.1, top: 50.0, width: 48.2, height: 24.0 },  // Round 5
  { left: 50.7, top: 50.0, width: 48.2, height: 24.0 }, // Round 6
  { left: 1.1, top: 74.8, width: 48.2, height: 24.0 },  // Round 7
  { left: 50.7, top: 74.8, width: 48.2, height: 24.0 }, // Round 8
];

// Internal card layout (% of card)
// Measured from the Scheda image: each card ~509×358 px
const L = {
  // Player name — in header banner between robots
  name: { left: 28, top: 1, width: 50, height: 9 },
  // 3 clue rows — the gray bars where clue words go
  rows: [
    { top: 24 },   // row 1
    { top: 38 },   // row 2
    { top: 52 },   // row 3
  ],
  rowH: 11,
  // Clue text area (the wide gray bar)
  clue: { left: 2, width: 69 },
  // I squares — center-aligned under "I" header
  iBox: { left: 74.5, width: 7.5 },
  // R squares — center-aligned under "R" header  
  rBox: { left: 85.5, width: 7.5 },
  // Token row
  tokenTop: 78,
  tokenH: 13,
  tokL: { left: 74, width: 8.5 },
  tokR: { left: 85, width: 8.5 },
};

export default function DecryptoScoreSheet({ state, team }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);

  const sheetImg = page === 1 ? SHEET_IMAGES[team].page1 : SHEET_IMAGES[team].page2;
  const startIdx = page === 1 ? 0 : 8;

  const renderCardOverlay = (cardIdx: number) => {
    const record: RoundRecord | undefined = state.rounds[startIdx + cardIdx];
    const card = CARDS[cardIdx];
    if (!record) return null;

    // Sort clues ascending by code number, keeping original index for I mapping
    const sortedEntries = record.code
      .map((num, origIdx) => ({ num, origIdx, clue: record.clues[origIdx] || '' }))
      .sort((a, b) => a.num - b.num);

    const isActiveRound = record.activeTeam === team;
    const guessValues = isActiveRound ? record.teamGuess : record.opponentGuess;

    return (
      <div key={cardIdx} style={{
        position: 'absolute',
        left: `${card.left}%`, top: `${card.top}%`,
        width: `${card.width}%`, height: `${card.height}%`,
      }}>
        {/* Player name */}
        <div style={{
          position: 'absolute',
          left: `${L.name.left}%`, top: `${L.name.top}%`,
          width: `${L.name.width}%`, height: `${L.name.height}%`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(0.3rem, 0.9vw, 0.6rem)',
          fontWeight: 700, color: '#222',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {record.activePlayerName}
        </div>

        {/* 3 clue rows */}
        {sortedEntries.map((entry, i) => (
          <React.Fragment key={i}>
            {/* Clue word — black text */}
            <div style={{
              position: 'absolute',
              left: `${L.clue.left}%`, top: `${L.rows[i].top}%`,
              width: `${L.clue.width}%`, height: `${L.rowH}%`,
              display: 'flex', alignItems: 'center',
              paddingLeft: '3%',
              fontSize: 'clamp(0.25rem, 0.85vw, 0.55rem)',
              color: '#111', fontWeight: 600,
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              <strong style={{ marginRight: '3px', flexShrink: 0 }}>{entry.num}.</strong>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.clue}</span>
            </div>

            {/* I box — black number, centered in square */}
            <div style={{
              position: 'absolute',
              left: `${L.iBox.left}%`, top: `${L.rows[i].top}%`,
              width: `${L.iBox.width}%`, height: `${L.rowH}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.35rem, 1vw, 0.7rem)',
              fontWeight: 800, fontFamily: 'monospace',
              color: '#111',
            }}>
              {guessValues[entry.origIdx] ?? ''}
            </div>

            {/* R box — green number, centered in square */}
            <div style={{
              position: 'absolute',
              left: `${L.rBox.left}%`, top: `${L.rows[i].top}%`,
              width: `${L.rBox.width}%`, height: `${L.rowH}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.35rem, 1vw, 0.7rem)',
              fontWeight: 800, fontFamily: 'monospace',
              color: '#16a34a',
            }}>
              {entry.num}
            </div>
          </React.Fragment>
        ))}

        {/* Token circles */}
        {record.miscommunication && isActiveRound && (
          <div style={{
            position: 'absolute',
            left: `${L.tokL.left}%`, top: `${L.tokenTop}%`,
            width: `${L.tokL.width}%`, height: `${L.tokenH}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={TOKEN_MISC} alt="Err" style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
          </div>
        )}
        {record.interception && !isActiveRound && (
          <div style={{
            position: 'absolute',
            left: `${L.tokR.left}%`, top: `${L.tokenTop}%`,
            width: `${L.tokR.width}%`, height: `${L.tokenH}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={TOKEN_INT} alt="Int" style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
          </div>
        )}
      </div>
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
        maxHeight: expanded ? '90vh' : '500px',
        overflow: 'auto',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <img src={sheetImg}
          alt={`Scheda ${team === 'bianca' ? 'Bianca' : 'Nera'}`}
          style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 8 }).map((_, i) => renderCardOverlay(i))}
        </div>
      </div>
    </div>
  );
}
