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
  Image layout (1055 x 1491):
  - 8 round cards in a 2-column × 4-row grid
  - Each card has:
      • Header bar with "ROUND XX" text — player name in the long box next to DECRYPTO logo
      • Row with "I" and "R" column headers
      • 3 clue rows: a wide clue text area, then a small I box, then a small R box
      • Token row at bottom with 2 circles

  Grid positions (percentage-based):
  - Left column: ~1% to ~49%
  - Right column: ~51% to ~99%
  - Row heights (each card): ~24.5% of total height, with ~0.5% gaps
  - Card 1 (Round 1): top ~0.5%, card 2 (Round 2): top ~0.5% (right col), etc.

  Within each card (percentages relative to the card):
  - Header (player name box): top ~4%, height ~12%, left ~5%, width ~58%
  - "ROUND XX" line: top ~16%, height ~8%
  - Clue row 1: top ~26%, row 2: ~38%, row 3: ~51%, each height ~11%
  - Clue text: left ~2%, width ~72%
  - I box: left ~76%, width ~10%
  - R box: left ~88%, width ~10%
  - Token circles: top ~76%, left circle: ~76%, right circle: ~88%
*/

// Each round card position (% of full image)
const CARDS = [
  // Row 0 (rounds 1-2)
  { left: 1.0, top: 0.3, width: 48.0, height: 24.0 },    // left col
  { left: 51.0, top: 0.3, width: 48.0, height: 24.0 },   // right col
  // Row 1 (rounds 3-4)
  { left: 1.0, top: 25.3, width: 48.0, height: 24.0 },
  { left: 51.0, top: 25.3, width: 48.0, height: 24.0 },
  // Row 2 (rounds 5-6)
  { left: 1.0, top: 50.3, width: 48.0, height: 24.0 },
  { left: 51.0, top: 50.3, width: 48.0, height: 24.0 },
  // Row 3 (rounds 7-8)
  { left: 1.0, top: 75.3, width: 48.0, height: 24.0 },
  { left: 51.0, top: 75.3, width: 48.0, height: 24.0 },
];

// Positions within a card (% of card dimensions)
const CARD_LAYOUT = {
  // Player name — the long rectangular box after "DECRYPTO" robot in the header
  playerName: { left: 32, top: 2, width: 52, height: 10 },
  // 3 clue rows — text area (the wide gray bars)
  clueRows: [
    { top: 30, height: 12 },
    { top: 44, height: 12 },
    { top: 58, height: 12 },
  ],
  clueText: { left: 3, width: 71 },
  // I (hypothesized) boxes
  iBoxes: [
    { left: 77, top: 30, width: 9, height: 12 },
    { left: 77, top: 44, width: 9, height: 12 },
    { left: 77, top: 58, width: 9, height: 12 },
  ],
  // R (real) boxes
  rBoxes: [
    { left: 89, top: 30, width: 9, height: 12 },
    { left: 89, top: 44, width: 9, height: 12 },
    { left: 89, top: 58, width: 9, height: 12 },
  ],
  // Token circles
  tokenLeft: { left: 74, top: 78, width: 11, height: 13 },
  tokenRight: { left: 87, top: 78, width: 11, height: 13 },
};

export default function DecryptoScoreSheet({ state, team }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);

  const sheetImg = page === 1 ? SHEET_IMAGES[team].page1 : SHEET_IMAGES[team].page2;
  const startIdx = page === 1 ? 0 : 8;

  const renderCardOverlay = (cardIdx: number) => {
    const globalRound = startIdx + cardIdx + 1;
    const record: RoundRecord | undefined = state.rounds[startIdx + cardIdx];
    const card = CARDS[cardIdx];
    if (!record) return null;

    // Sort clues by code number ascending for display
    const sortedClues: { num: number; clue: string }[] = record.code
      .map((num, i) => ({ num, clue: record.clues[i] || '' }))
      .sort((a, b) => a.num - b.num);

    const isActiveRound = record.activeTeam === team;

    // Guess values to show: if this is our active round, show our team's guess; 
    // if opponent's round, show our interception attempt
    const guessValues = isActiveRound ? record.teamGuess : record.opponentGuess;
    const guessCorrect = isActiveRound ? !record.miscommunication : record.interception;

    return (
      <div key={cardIdx} style={{
        position: 'absolute',
        left: `${card.left}%`,
        top: `${card.top}%`,
        width: `${card.width}%`,
        height: `${card.height}%`,
      }}>
        {/* Player name */}
        <div style={{
          position: 'absolute',
          left: `${CARD_LAYOUT.playerName.left}%`,
          top: `${CARD_LAYOUT.playerName.top}%`,
          width: `${CARD_LAYOUT.playerName.width}%`,
          height: `${CARD_LAYOUT.playerName.height}%`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(0.4rem, 1.2vw, 0.75rem)',
          fontWeight: 700,
          color: '#333',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {record.activePlayerName}
        </div>

        {/* 3 clue rows */}
        {sortedClues.map((c, i) => (
          <React.Fragment key={i}>
            {/* Clue text */}
            <div style={{
              position: 'absolute',
              left: `${CARD_LAYOUT.clueText.left}%`,
              top: `${CARD_LAYOUT.clueRows[i].top}%`,
              width: `${CARD_LAYOUT.clueText.width}%`,
              height: `${CARD_LAYOUT.clueRows[i].height}%`,
              display: 'flex', alignItems: 'center',
              paddingLeft: '2%',
              fontSize: 'clamp(0.35rem, 1.1vw, 0.7rem)',
              color: '#222',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              <strong style={{ marginRight: '3px', color: '#555' }}>{c.num}.</strong> {c.clue}
            </div>

            {/* I (guess) box */}
            <div style={{
              position: 'absolute',
              left: `${CARD_LAYOUT.iBoxes[i].left}%`,
              top: `${CARD_LAYOUT.iBoxes[i].top}%`,
              width: `${CARD_LAYOUT.iBoxes[i].width}%`,
              height: `${CARD_LAYOUT.iBoxes[i].height}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.4rem, 1.2vw, 0.75rem)',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: guessCorrect ? '#16a34a' : '#dc2626',
            }}>
              {guessValues[i] ?? ''}
            </div>

            {/* R (real) box */}
            <div style={{
              position: 'absolute',
              left: `${CARD_LAYOUT.rBoxes[i].left}%`,
              top: `${CARD_LAYOUT.rBoxes[i].top}%`,
              width: `${CARD_LAYOUT.rBoxes[i].width}%`,
              height: `${CARD_LAYOUT.rBoxes[i].height}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.4rem, 1.2vw, 0.75rem)',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: '#111',
            }}>
              {record.code[i] ?? ''}
            </div>
          </React.Fragment>
        ))}

        {/* Token circles */}
        {record.miscommunication && isActiveRound && (
          <div style={{
            position: 'absolute',
            left: `${CARD_LAYOUT.tokenLeft.left}%`,
            top: `${CARD_LAYOUT.tokenLeft.top}%`,
            width: `${CARD_LAYOUT.tokenLeft.width}%`,
            height: `${CARD_LAYOUT.tokenLeft.height}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={TOKEN_MISC} alt="Err" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
        )}
        {record.interception && !isActiveRound && (
          <div style={{
            position: 'absolute',
            left: `${CARD_LAYOUT.tokenRight.left}%`,
            top: `${CARD_LAYOUT.tokenRight.top}%`,
            width: `${CARD_LAYOUT.tokenRight.width}%`,
            height: `${CARD_LAYOUT.tokenRight.height}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={TOKEN_INT} alt="Int" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          onClick={() => setPage(page === 1 ? 2 : 1)}>
          {page === 1 ? 'R.9-16 →' : '← R.1-8'}
        </button>
        <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? '↙ Riduci' : '↗ Espandi'}
        </button>
      </div>

      {/* Sheet image with overlaid data */}
      <div style={{
        position: 'relative',
        maxHeight: expanded ? '90vh' : '500px',
        overflow: 'auto',
      }}>
        <img
          src={sheetImg}
          alt={`Scheda ${team === 'bianca' ? 'Bianca' : 'Nera'} - Rounds ${page === 1 ? '1-8' : '9-16'}`}
          style={{ width: '100%', display: 'block', borderRadius: '8px' }}
        />
        {/* Overlay all round data on top of the image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 8 }).map((_, i) => renderCardOverlay(i))}
        </div>
      </div>
    </div>
  );
}
