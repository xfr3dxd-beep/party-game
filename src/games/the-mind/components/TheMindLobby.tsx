import React from 'react';
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
    </div>
  );
};

export default TheMindLobby;
