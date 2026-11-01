import React, { useState } from 'react';

interface WavelengthLobbyProps {
  roomCode: string;
  players: { id: string; name: string; isHost: boolean }[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function WavelengthLobby({ roomCode, players, isHost, onStartGame }: WavelengthLobbyProps) {
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

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
          className="mind-help-btn"
          onClick={() => setShowRules(true)}
          title="Regole"
        >
          ❓ Regole
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
        <p>Aspettando giocatori... (min. 2)</p>
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

      {showRules && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content" style={{ textAlign: 'left', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                📡 Wavelength — Regole
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
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p><strong>🎯 Obiettivo:</strong> Raggiungere <strong>25 punti</strong> per primi!</p>
              <p><strong>📡 Come si gioca:</strong> Ogni round, un giocatore è il "giocatore attivo". Vede una coppia di opposti e un bersaglio segreto sull'arco (0°-180°). Dà un indizio per aiutare gli altri a indovinare dove si trova il bersaglio.</p>
              <p><strong>🏹 Indovinare:</strong> Gli altri giocatori spostano la propria freccia dove pensano sia il bersaglio e confermano la scelta.</p>
              <p><strong>⭐ Punteggio:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                <li>Entro 3°: <strong>4 punti</strong></li>
                <li>Entro 8°: <strong>3 punti</strong></li>
                <li>Entro 12°: <strong>2 punti</strong></li>
                <li>Oltre: <strong>0 punti</strong></li>
              </ul>
              <p><strong>🎭 Giocatore attivo:</strong> Riceve <strong>1 punto</strong> se almeno la metà degli altri giocatori ha puntato la freccia nel semicerchio corretto (0°-90° o 90°-180°).</p>
              <p><strong>🔄 Rotazione:</strong> Il giocatore attivo ruota ogni round.</p>
            </div>
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
}
