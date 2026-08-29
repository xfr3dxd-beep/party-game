import React, { useState } from 'react';
import { TheMindMode } from '../types';

interface TheMindLobbyProps {
  roomCode: string;
  players: { id: string; name: string; isHost: boolean }[];
  isHost: boolean;
  mode: TheMindMode;
  onModeChange: (mode: TheMindMode) => void;
  onStartGame: () => void;
}

const TheMindLobby: React.FC<TheMindLobbyProps> = ({
  roomCode,
  players,
  isHost,
  mode,
  onModeChange,
  onStartGame,
}) => {
  const [showRules, setShowRules] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <div className="mind-lobby">
      <h2>Codice Stanza</h2>
      <div className="mind-room-code" onClick={handleCopyCode} title="Copia codice">
        {roomCode}
      </div>

      <div className="mind-mode-toggle">
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === 'classic'}
            onChange={() => onModeChange('classic')}
            disabled={!isHost}
          />
          Classic
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === 'extreme'}
            onChange={() => onModeChange('extreme')}
            disabled={!isHost}
          />
          Extreme
        </label>

        <button
          className="mind-help-btn"
          onClick={() => setShowRules(true)}
          title="Regole"
        >
          ❓
        </button>
      </div>

      <div className="mind-player-list">
        <h3>Giocatori:</h3>
        {players.map((p) => (
          <div key={p.id} className="mind-player-item">
            <span className="connected-dot" style={{ color: 'green' }}>●</span>
            <span className="player-name">{p.name}</span>
            {p.isHost && <span className="host-badge">(Host)</span>}
          </div>
        ))}
      </div>

      <div className="mind-lobby-status">
        <p>Aspettando giocatori... (min. 2, max. 4)</p>
      </div>

      {isHost && (
        <button
          className="start-game-btn"
          disabled={players.length < 2}
          onClick={onStartGame}
        >
          Inizia Gioco
        </button>
      )}

      {/* Rules overlay */}
      {showRules && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content" style={{ textAlign: 'left', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                {mode === 'classic' ? '📘 The Mind — Regole' : '🔥 The Mind Extreme — Regole'}
              </h2>
              <button
                onClick={() => setShowRules(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {mode === 'classic' ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <p><strong>🃏 Carte:</strong> Numerate da <strong>1 a 100</strong></p>
                <p><strong>🤫 Regola d'oro:</strong> Nessuno può parlare o fare segnali!</p>
                <p><strong>⬆ Come si gioca:</strong> Giocate le carte dal valore più basso al più alto sul mazzo ascendente. Dovete sincronizzarvi senza comunicare!</p>
                <p><strong>💥 Conflitto:</strong> Se qualcuno gioca una carta e un altro giocatore aveva una carta con valore più basso → si perde una vita ❤️ e le carte più basse vengono scartate.</p>
                <p><strong>⭐ Stella:</strong> Tutti scartano la carta più bassa dalla propria mano. Tutti i giocatori devono accettare.</p>
                <p><strong>🏆 Vittoria:</strong> Completate tutti i livelli! Ogni livello aggiunge più carte in mano.</p>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <p><strong>🃏 Due mazzi:</strong> <span style={{color:'#60a5fa'}}>Blu (1-50)</span> ascendente ⬆ e <span style={{color:'#f87171'}}>Rosso (50-1)</span> discendente ⬇</p>
                <p><strong>🤫 Regola d'oro:</strong> Nessuno può parlare o fare segnali!</p>
                <p><strong>⬆⬇ Come si gioca:</strong> Carte blu dal basso verso l'alto e carte rosse dall'alto verso il basso. Due pile separate!</p>
                <p><strong>💥 Conflitto Blu:</strong> Se giochi una carta blu e qualcuno ne ha una con valore più basso → conflitto! Si perde una vita ❤️</p>
                <p><strong>💥 Conflitto Rosso:</strong> Se giochi una carta rossa e qualcuno ne ha una con valore più alto → conflitto! Si perde una vita ❤️</p>
                <p><strong>⭐ Stella:</strong> Ogni giocatore sceglie se scartare la carta blu più bassa OPPURE la carta rossa più alta. Tutti devono accettare.</p>
                <p><strong>🏆 Vittoria:</strong> Completate tutti i livelli!</p>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setShowRules(false)}
            >
              Ho capito! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheMindLobby;
