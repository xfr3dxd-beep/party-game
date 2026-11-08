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
  Image: 1055 × 1491, 8 cards in 2 cols × 4 rows.
  Each card ~509×360 px.
  Internal card layout (% of card):
    - Player name box (header banner): left 30%, top 1.5%, width 48%, height 8%
    - Clue rows (3 gray bars):
        Row 1: top 24%, Row 2: top 37%, Row 3: top 51%  — each height ~11%
        Clue text: left 2%, width 70%
        I box center: left 76.5%, width 7%
        R box center: left 87.5%, width 7%
    - Token circles: top 78%
        Left circle center: left 76.5%
        Right circle center: left 87.5%
*/

const CARDS = [
  { left: 0.9, top: 0.3, width: 48.4, height: 24.2 },
  { left: 50.7, top: 0.3, width: 48.4, height: 24.2 },
  { left: 0.9, top: 25.2, width: 48.4, height: 24.2 },
  { left: 50.7, top: 25.2, width: 48.4, height: 24.2 },
  { left: 0.9, top: 50.1, width: 48.4, height: 24.2 },
  { left: 50.7, top: 50.1, width: 48.4, height: 24.2 },
  { left: 0.9, top: 75.0, width: 48.4, height: 24.2 },
  { left: 50.7, top: 75.0, width: 48.4, height: 24.2 },
];

const LAYOUT = {
  playerName: { left: 30, top: 1.5, width: 48, height: 8 },
  clueRows: [
    { top: 25 },
    { top: 39 },
    { top: 53 },
  ],
  rowHeight: 11,
  clueText: { left: 2, width: 70 },
  iBox: { left: 73, width: 9 },
  rBox: { left: 84.5, width: 9 },
  tokenRow: { top: 78 },
  tokenHeight: 12,
  tokenLeft: { left: 73, width: 10 },
  tokenRight: { left: 85, width: 10 },
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

    // Sort clues ascending by code number, keeping original index
    const sortedEntries = record.code
      .map((num, origIdx) => ({ num, origIdx, clue: record.clues[origIdx] || '' }))
      .sort((a, b) => a.num - b.num);

    const isActiveRound = record.activeTeam === team;

    // Own team: show teamGuess; Opponent round: show opponentGuess (our interception attempt)
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
        {/* Player name in header box */}
        <div style={{
          position: 'absolute',
          left: `${LAYOUT.playerName.left}%`,
          top: `${LAYOUT.playerName.top}%`,
          width: `${LAYOUT.playerName.width}%`,
          height: `${LAYOUT.playerName.height}%`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(0.35rem, 1vw, 0.65rem)',
          fontWeight: 700,
          color: '#333',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {record.activePlayerName}
        </div>

        {/* 3 clue rows with I and R values */}
        {sortedEntries.map((entry, i) => (
          <React.Fragment key={i}>
            {/* Clue text */}
            <div style={{
              position: 'absolute',
              left: `${LAYOUT.clueText.left}%`,
              top: `${LAYOUT.clueRows[i].top}%`,
              width: `${LAYOUT.clueText.width}%`,
              height: `${LAYOUT.rowHeight}%`,
              display: 'flex', alignItems: 'center',
              paddingLeft: '3%',
              fontSize: 'clamp(0.3rem, 0.9vw, 0.6rem)',
              color: '#222',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              <strong style={{ marginRight: '4px', color: '#555', flexShrink: 0 }}>{entry.num}.</strong>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.clue}</span>
            </div>

            {/* I (guess) box — centered in box */}
            <div style={{
              position: 'absolute',
              left: `${LAYOUT.iBox.left}%`,
              top: `${LAYOUT.clueRows[i].top}%`,
              width: `${LAYOUT.iBox.width}%`,
              height: `${LAYOUT.rowHeight}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.35rem, 1vw, 0.65rem)',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: guessCorrect ? '#16a34a' : '#dc2626',
            }}>
              {guessValues[entry.origIdx] ?? ''}
            </div>

            {/* R (real code) box — centered in box */}
            <div style={{
              position: 'absolute',
              left: `${LAYOUT.rBox.left}%`,
              top: `${LAYOUT.clueRows[i].top}%`,
              width: `${LAYOUT.rBox.width}%`,
              height: `${LAYOUT.rowHeight}%`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(0.35rem, 1vw, 0.65rem)',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: '#111',
            }}>
              {entry.num}
            </div>
          </React.Fragment>
        ))}

        {/* Token circles */}
        {record.miscommunication && isActiveRound && (
          <div style={{
            position: 'absolute',
            left: `${LAYOUT.tokenLeft.left}%`,
            top: `${LAYOUT.tokenRow.top}%`,
            width: `${LAYOUT.tokenLeft.width}%`,
            height: `${LAYOUT.tokenHeight}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={TOKEN_MISC} alt="Err" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
          </div>
        )}
        {record.interception && !isActiveRound && (
          <div style={{
            position: 'absolute',
            left: `${LAYOUT.tokenRight.left}%`,
            top: `${LAYOUT.tokenRow.top}%`,
            width: `${LAYOUT.tokenRight.width}%`,
            height: `${LAYOUT.tokenHeight}%`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={TOKEN_INT} alt="Int" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Controls */}
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

      {/* Sheet image with overlaid data */}
      <div style={{
        position: 'relative',
        maxHeight: expanded ? '90vh' : '500px',
        overflow: 'auto',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <img
          src={sheetImg}
          alt={`Scheda ${team === 'bianca' ? 'Bianca' : 'Nera'}`}
          style={{ width: '100%', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 8 }).map((_, i) => renderCardOverlay(i))}
        </div>
      </div>
    </div>
  );
}
