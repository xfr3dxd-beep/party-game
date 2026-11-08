import React from 'react';
import type { DecryptoState } from '../types';

const TOKEN_MISC = '/Decrypto/Token/Token_Errata_Comunicazione.png';
const TOKEN_INT = '/Decrypto/Token/Token_Intercettazione.png';

interface Props {
  state: DecryptoState;
  isHost: boolean;
  onNextRound: () => void;
}

export default function DecryptoRoundResult({ state, isHost, onNextRound }: Props) {
  const lastRound = state.rounds[state.rounds.length - 1];
  if (!lastRound) return null;

  const activeTeamLabel = lastRound.activeTeam === 'bianca' ? '⬜ Bianca' : '⬛ Nera';
  const opponentTeamLabel = lastRound.activeTeam === 'bianca' ? '⬛ Nera' : '⬜ Bianca';

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-md">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
        <h2 style={{ fontWeight: 800 }}>Risultati — Round {lastRound.roundNumber}</h2>
      </div>

      {/* Code reveal */}
      <div className="glass-panel p-md mb-md" style={{ maxWidth: '500px', margin: '0 auto 1rem', textAlign: 'center' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Codice di {lastRound.activePlayerName} ({activeTeamLabel}):
        </p>
        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.3em', marginBottom: '0.75rem' }}>
          {lastRound.code.join(' - ')}
        </div>

        {/* Clues */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {lastRound.code.map((num, i) => (
            <div key={i} style={{
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.85rem',
            }}>
              <strong>#{num}:</strong> "{lastRound.clues[i]}"
            </div>
          ))}
        </div>
      </div>

      {/* Guesses comparison */}
      <div style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto 1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Own team guess */}
        <div className="glass-panel p-md" style={{
          flex: 1, minWidth: '220px', textAlign: 'center',
          borderTop: lastRound.miscommunication ? '3px solid #ef4444' : '3px solid #22c55e',
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {activeTeamLabel} (propria squadra)
          </p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            {lastRound.teamGuess.join(' - ')}
          </div>
          {lastRound.miscommunication ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <img src={TOKEN_MISC} alt="" style={{ width: 28, height: 28 }} />
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>Errata Comunicazione!</span>
            </div>
          ) : (
            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>✅ Corretto!</span>
          )}
        </div>

        {/* Opponent guess */}
        <div className="glass-panel p-md" style={{
          flex: 1, minWidth: '220px', textAlign: 'center',
          borderTop: lastRound.interception ? '3px solid #22c55e' : '3px solid #ef4444',
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {opponentTeamLabel} (avversari)
          </p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            {lastRound.opponentGuess.join(' - ')}
          </div>
          {lastRound.interception ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <img src={TOKEN_INT} alt="" style={{ width: 28, height: 28 }} />
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>Intercettazione!</span>
            </div>
          ) : (
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>❌ Sbagliato</span>
          )}
        </div>
      </div>

      {/* Token summary */}
      <div className="glass-panel p-md mb-md" style={{ maxWidth: '500px', margin: '0 auto 1rem' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.95rem' }}>🏷️ Riepilogo Token</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>⬜ Bianca</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.25rem' }}>
              <span title="Errate Comunicazioni" style={{ fontSize: '0.8rem' }}>
                <img src={TOKEN_MISC} alt="" style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> {state.biancaMiscommunications}/2
              </span>
              <span title="Intercettazioni" style={{ fontSize: '0.8rem' }}>
                <img src={TOKEN_INT} alt="" style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> {state.biancaInterceptions}/2
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>⬛ Nera</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.25rem' }}>
              <span title="Errate Comunicazioni" style={{ fontSize: '0.8rem' }}>
                <img src={TOKEN_MISC} alt="" style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> {state.neraMiscommunications}/2
              </span>
              <span title="Intercettazioni" style={{ fontSize: '0.8rem' }}>
                <img src={TOKEN_INT} alt="" style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> {state.neraInterceptions}/2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next round */}
      {isHost && (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} onClick={onNextRound}>
            ▶ Prossimo Round
          </button>
        </div>
      )}
    </div>
  );
}
