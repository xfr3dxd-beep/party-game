import React, { useState } from 'react';
import type { DecryptoState, DecryptoTeam } from '../types';
import { getCodeImagePath } from '../codes';

interface Props {
  state: DecryptoState;
  playerId: string;
  onSubmitClues: (clues: string[]) => void;
  onConfirmTurn: () => void;
}

const PAROLIERE: Record<DecryptoTeam, string> = {
  bianca: '/Decrypto/Squadra_Bianca/Paroliere_Squadra_Bianca.png',
  nera: '/Decrypto/Squadra_Nera/Paroliere_Squadra_Nera.png',
};

export default function DecryptoClueGiving({ state, playerId, onSubmitClues, onConfirmTurn }: Props) {
  const [clues, setClues] = useState(['', '', '']);
  const isActive = state.activePlayerId === playerId;
  const myTeam = state.players.find(p => p.id === playerId)?.team;
  const activeTeam = state.activeTeam;
  const activePlayer = state.players.find(p => p.id === state.activePlayerId);
  const teamWords = activeTeam === 'bianca' ? state.biancaWords : state.neraWords;
  const teamLabel = activeTeam === 'bianca' ? '⬜ Bianca' : '⬛ Nera';

  // ---- TURN ANNOUNCEMENT (before timer starts) ----
  if (!state.timerStartedAt) {
    return (
      <div className="animate-fade-in text-center">
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔑</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
          Turno di {activePlayer?.name || '...'}!
        </h2>
        <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
          Squadra {teamLabel} — Round {state.roundNumber}
        </p>
        {isActive ? (
          <div style={{ maxWidth: '350px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Sei il crittografo! Premi per iniziare il tuo turno.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
              onClick={onConfirmTurn}>
              ▶ Inizia Turno
            </button>
          </div>
        ) : (
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            In attesa che {activePlayer?.name} inizi il turno...
          </p>
        )}
      </div>
    );
  }

  // ---- ACTIVE PLAYER: code + words + clue inputs ----
  if (isActive && myTeam === activeTeam) {
    const codeImgPath = getCodeImagePath(activeTeam, state.currentCodeStr);

    return (
      <div className="animate-fade-in">
        <div className="text-center mb-md">
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>🔑 Sei il crittografo!</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Dai 3 indizi collegati alle parole segrete, nell'ordine del codice.
          </p>
        </div>

        {/* Code card — centered */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="glass-panel p-md" style={{ textAlign: 'center', display: 'inline-block' }}>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Il tuo codice segreto:</p>
            <img src={codeImgPath} alt="Codice" style={{ width: '220px', maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
          </div>
        </div>

        {/* Words display */}
        <div className="glass-panel p-md mb-md" style={{ maxWidth: '500px', margin: '0 auto 1rem' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>Le tue parole segrete:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {teamWords.map((w, i) => (
              <div key={i} style={{
                background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)',
                borderRadius: '8px', padding: '0.5rem', textAlign: 'center', fontWeight: 700,
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i + 1}.</span>{' '}
                <span style={{ fontSize: '1rem' }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clue inputs */}
        <div className="glass-panel p-lg" style={{ maxWidth: '450px', margin: '0 auto' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem', textAlign: 'center' }}>
            Scrivi un indizio per ogni numero del codice:
          </p>
          {state.currentCode.map((num, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Indizio per <span style={{ color: '#ef4444' }}>#{num}</span> ({teamWords[num - 1]}):
              </label>
              <input type="text" className="input" value={clues[i]}
                onChange={e => { const c = [...clues]; c[i] = e.target.value; setClues(c); }}
                placeholder={`Indizio ${i + 1}...`} maxLength={60} />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.05rem', marginTop: '0.5rem' }}
            onClick={() => onSubmitClues(clues.map(c => c.trim()))}
            disabled={clues.some(c => !c.trim())}>
            📨 Invia Indizi
          </button>
        </div>
      </div>
    );
  }

  // ---- NON-ACTIVE PLAYERS: waiting ----
  return (
    <div className="animate-fade-in text-center">
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <h2 style={{ fontWeight: 800 }}>
        {activePlayer?.name || 'Il crittografo'} sta scrivendo gli indizi...
      </h2>
      <p className="text-muted">
        Squadra {teamLabel} — Round {state.roundNumber}
      </p>
    </div>
  );
}
