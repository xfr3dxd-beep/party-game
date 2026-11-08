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
const DORSO_BIANCA = '/Decrypto/Squadra_Bianca/Dorso_Codici_Bianco.png';
const DORSO_NERA = '/Decrypto/Squadra_Nera/Dorso_Codici_Nera.png';
const TOKEN_MISC = '/Decrypto/Token/Token_Errata_Comunicazione.png';
const TOKEN_INT = '/Decrypto/Token/Token_Intercettazione.png';

export default function DecryptoGameBoard({ state, myTeam, children }: Props) {
  const teamWords = myTeam === 'bianca' ? state.biancaWords : state.neraWords;

  return (
    <div>
      {/* 1. Word board at top — 4 red boxes in horizontal row */}
      <div style={{ maxWidth: '700px', margin: '0 auto 1rem', position: 'relative' }}>
        <img src={PAROLIERE[myTeam]} alt="Paroliere" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
        {/* Overlay words centered in each of the 4 red display boxes */}
        <div style={{
          position: 'absolute',
          top: '5%', left: '3%', right: '9%', height: '56%',
          display: 'flex',
          alignItems: 'center',
        }}>
          {teamWords.map((w, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900,
              fontSize: 'clamp(0.45rem, 1.5vw, 0.95rem)',
              color: '#ff3333',
              textShadow: '0 0 8px rgba(255,50,50,0.8), 0 0 16px rgba(255,0,0,0.5)',
              textAlign: 'center', lineHeight: 1.15,
              padding: '0 4%',
              overflow: 'hidden',
              wordBreak: 'break-word',
              maxHeight: '100%',
            }}>
              {w}
            </div>
          ))}
        </div>
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
