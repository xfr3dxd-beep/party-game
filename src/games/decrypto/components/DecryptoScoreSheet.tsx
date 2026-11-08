import React, { useState } from 'react';
import type { DecryptoState, DecryptoTeam, RoundRecord } from '../types';

interface Props {
  state: DecryptoState;
  team: DecryptoTeam;
}

const TOKEN_MISC = '/Decrypto/Token/Token_Errata_Comunicazione.png';
const TOKEN_INT = '/Decrypto/Token/Token_Intercettazione.png';

export default function DecryptoScoreSheet({ state, team }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);

  // Filter rounds relevant to this sheet
  // Each team's sheet shows ALL rounds (both teams play in alternating rounds)
  const startIdx = page === 1 ? 0 : 8;
  const endIdx = page === 1 ? 8 : 16;
  const roundsSlice = state.rounds.slice(startIdx, endIdx);

  const teamColor = team === 'bianca' ? '#e5e7eb' : '#374151';
  const teamBg = team === 'bianca' ? 'rgba(229,231,235,0.08)' : 'rgba(55,65,81,0.15)';
  const teamLabel = team === 'bianca' ? 'Squadra Bianca' : 'Squadra Nera';

  const renderRoundRow = (roundIdx: number) => {
    const globalRound = startIdx + roundIdx + 1;
    const record: RoundRecord | undefined = roundsSlice[roundIdx];

    // Sort clues by code order for display (ascending by real code number)
    let sortedClues: { num: number; clue: string }[] = [];
    if (record) {
      sortedClues = record.code.map((num, i) => ({ num, clue: record.clues[i] || '' }));
      sortedClues.sort((a, b) => a.num - b.num);
    }

    // Which team's guess is "I" and which is the opponent?
    const isActiveRound = record?.activeTeam === team;

    return (
      <tr key={roundIdx} style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: record ? (isActiveRound ? teamBg : 'rgba(255,255,255,0.02)') : 'transparent',
      }}>
        {/* Round number */}
        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.8rem', padding: '0.4rem 0.25rem', color: 'var(--text-muted)' }}>
          {globalRound}
        </td>
        {/* Player name */}
        <td style={{ fontSize: '0.75rem', padding: '0.4rem 0.25rem', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record?.activePlayerName || '—'}
        </td>
        {/* Clues (sorted ascending by number) */}
        <td style={{ fontSize: '0.7rem', padding: '0.4rem 0.25rem' }}>
          {sortedClues.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {sortedClues.map((c, i) => (
                <span key={i} style={{ color: 'var(--text-secondary)' }}>
                  <strong>{c.num}.</strong> {c.clue}
                </span>
              ))}
            </div>
          ) : '—'}
        </td>
        {/* I (hypothesized) — own team's guess */}
        <td style={{ textAlign: 'center', fontSize: '0.8rem', padding: '0.4rem 0.25rem', fontFamily: 'monospace' }}>
          {record ? (
            <span style={{ color: isActiveRound
              ? (record.miscommunication ? '#ef4444' : '#22c55e')
              : (record.interception ? '#22c55e' : '#ef4444')
            }}>
              {isActiveRound
                ? record.teamGuess.join('-')
                : record.opponentGuess.join('-')
              }
            </span>
          ) : '—'}
        </td>
        {/* R (real) */}
        <td style={{ textAlign: 'center', fontSize: '0.8rem', padding: '0.4rem 0.25rem', fontFamily: 'monospace', fontWeight: 700 }}>
          {record ? record.code.join('-') : '—'}
        </td>
        {/* Tokens */}
        <td style={{ textAlign: 'center', padding: '0.4rem 0.25rem' }}>
          {record && record.miscommunication && isActiveRound && (
            <img src={TOKEN_MISC} alt="Err" style={{ width: 18, height: 18, verticalAlign: 'middle' }} />
          )}
          {record && record.interception && !isActiveRound && (
            <img src={TOKEN_INT} alt="Int" style={{ width: 18, height: 18, verticalAlign: 'middle' }} />
          )}
        </td>
      </tr>
    );
  };

  const content = (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: '12px',
      border: `2px solid ${teamColor}`,
      padding: '0.75rem',
      maxHeight: expanded ? '90vh' : '400px',
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>
          📋 Scheda — {teamLabel}
        </h4>
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

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${teamColor}` }}>
            <th style={{ padding: '0.3rem 0.25rem', textAlign: 'center', width: '30px' }}>#</th>
            <th style={{ padding: '0.3rem 0.25rem', textAlign: 'left', width: '70px' }}>👤</th>
            <th style={{ padding: '0.3rem 0.25rem', textAlign: 'left' }}>Indizi</th>
            <th style={{ padding: '0.3rem 0.25rem', textAlign: 'center', width: '50px' }}>I</th>
            <th style={{ padding: '0.3rem 0.25rem', textAlign: 'center', width: '50px' }}>R</th>
            <th style={{ padding: '0.3rem 0.25rem', textAlign: 'center', width: '30px' }}>🏷</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => renderRoundRow(i))}
        </tbody>
      </table>
    </div>
  );

  return content;
}
