import React, { useState } from 'react';
import type { DecryptoPlayer, DecryptoTeam } from '../types';

interface Props {
  roomCode: string;
  players: DecryptoPlayer[];
  playerId: string;
  isHost: boolean;
  onJoinTeam: (team: DecryptoTeam) => void;
  onStartGame: () => void;
}

export default function DecryptoLobby({ roomCode, players, playerId, isHost, onJoinTeam, onStartGame }: Props) {
  const [showRules, setShowRules] = useState(false);

  const bianca = players.filter(p => p.team === 'bianca');
  const nera = players.filter(p => p.team === 'nera');
  const unassigned = players.filter(p => !p.team);
  const myTeam = players.find(p => p.id === playerId)?.team;
  const canStart = bianca.length >= 2 && nera.length >= 2 && unassigned.length === 0;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-md">
        <h2>Codice Stanza</h2>
        <div className="mind-room-code" onClick={() => navigator.clipboard.writeText(roomCode)} title="Copia codice">{roomCode}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button className="mind-help-btn" onClick={() => setShowRules(true)} title="Regole">❓ Regole</button>
      </div>

      {/* Team panels */}
      <div style={{ display: 'flex', gap: '1rem', maxWidth: '700px', margin: '0 auto 1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Squadra Bianca */}
        <div className="glass-panel p-md" style={{ flex: 1, minWidth: '250px', borderTop: '3px solid #e5e7eb' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>⬜ Squadra Bianca</h3>
          {bianca.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.9rem' }}>
              <span style={{ color: '#22c55e' }}>●</span>
              <span>{p.name}</span>
              {p.id === playerId && <span className="text-muted" style={{ fontSize: '0.75rem' }}>(Tu)</span>}
            </div>
          ))}
          {bianca.length === 0 && <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.85rem' }}>Nessun giocatore</p>}
          {myTeam !== 'bianca' && (
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.9rem' }} onClick={() => onJoinTeam('bianca')}>
              Unisciti ⬜
            </button>
          )}
        </div>

        {/* Squadra Nera */}
        <div className="glass-panel p-md" style={{ flex: 1, minWidth: '250px', borderTop: '3px solid #374151' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>⬛ Squadra Nera</h3>
          {nera.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.9rem' }}>
              <span style={{ color: '#22c55e' }}>●</span>
              <span>{p.name}</span>
              {p.id === playerId && <span className="text-muted" style={{ fontSize: '0.75rem' }}>(Tu)</span>}
            </div>
          ))}
          {nera.length === 0 && <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.85rem' }}>Nessun giocatore</p>}
          {myTeam !== 'nera' && (
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.9rem' }} onClick={() => onJoinTeam('nera')}>
              Unisciti ⬛
            </button>
          )}
        </div>
      </div>

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div className="text-center mb-md">
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Giocatori senza squadra: {unassigned.map(p => p.name).join(', ')}
          </p>
        </div>
      )}

      {/* Status */}
      <div className="text-center mb-md">
        {!canStart && (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Servono almeno 2 giocatori per squadra. Tutti devono scegliere una squadra.
          </p>
        )}
      </div>

      {isHost && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <button className="start-game-btn" disabled={!canStart} onClick={onStartGame}>
            Inizia Gioco
          </button>
        </div>
      )}

      {/* Rules modal */}
      {showRules && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content" style={{ textAlign: 'left', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🔐 Decrypto — Regole</h2>
              <button onClick={() => setShowRules(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p><strong>🎯 Obiettivo:</strong> Comunicare codici segreti alla propria squadra senza farsi intercettare dagli avversari.</p>
              <p><strong>📋 Setup:</strong> Ogni squadra ha 4 parole segrete numerate da 1 a 4, visibili solo ai propri membri.</p>
              <p><strong>🔑 Turno:</strong> Il giocatore attivo pesca un codice di 3 numeri (es. 4-2-1) e dà 3 indizi—uno per ogni numero del codice, collegati alle parole segrete.</p>
              <p><strong>🤔 Indovinare:</strong> La propria squadra deve ricostruire il codice. Anche la squadra avversaria tenta di intercettarlo.</p>
              <p><strong>🏆 Token:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                <li><strong>Errata Comunicazione:</strong> La propria squadra sbaglia il codice</li>
                <li><strong>Intercettazione:</strong> La squadra avversaria indovina il codice</li>
              </ul>
              <p><strong>🏁 Fine partita:</strong> 2 Token Intercettazione = vittoria! 2 Token Errata Comunicazione = sconfitta! La squadra che perde può tentare di indovinare le 4 parole avversarie per pareggiare.</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowRules(false)}>
              Ho capito! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
