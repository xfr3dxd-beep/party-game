import React, { useState } from 'react';
import { Plus, X, Play, Users } from 'lucide-react';
import { RoleConfig } from '../types';

interface LobbySetupProps {
  onStartGame: (playerNames: string[], roleConfig: RoleConfig) => void;
}

export default function LobbySetup({ onStartGame }: LobbySetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [roleConfig, setRoleConfig] = useState<RoleConfig>({
    civile: 3,
    undercover: 1,
    mr_white: 1,
  });

  const totalRoles = roleConfig.civile + roleConfig.undercover + roleConfig.mr_white;
  const isValid = playerNames.length >= 3 && totalRoles === playerNames.length && roleConfig.mr_white >= 1;

  const addPlayer = () => {
    const trimmed = newName.trim();
    if (trimmed && !playerNames.includes(trimmed)) {
      setPlayerNames([...playerNames, trimmed]);
      setNewName('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPlayer();
    }
  };

  const updateRole = (role: keyof RoleConfig, delta: number) => {
    setRoleConfig(prev => ({
      ...prev,
      [role]: Math.max(role === 'mr_white' ? 1 : 0, prev[role] + delta),
    }));
  };

  return (
    <div className="lobby-setup animate-fade-in">
      <div className="lobby-header">
        <h1 className="lobby-title">🕵️ Impostore</h1>
        <p className="lobby-subtitle">Aggiungi i giocatori e configura i ruoli</p>
      </div>

      {/* Add Player */}
      <div className="glass-card-static" style={{ padding: 'var(--space-lg)' }}>
        <label className="input-label">
          <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Aggiungi Giocatore
        </label>
        <div className="flex gap-sm">
          <input
            type="text"
            className="input"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome del giocatore..."
            maxLength={20}
            id="player-name-input"
          />
          <button
            className="btn btn-primary"
            onClick={addPlayer}
            disabled={!newName.trim()}
            id="add-player-button"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Player List */}
      {playerNames.length > 0 && (
        <div className="player-list mt-lg">
          {playerNames.map((name, index) => (
            <div
              key={index}
              className="player-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="player-item-number">{index + 1}</span>
              <span className="player-item-name">{name}</span>
              <button
                className="player-item-remove"
                onClick={() => removePlayer(index)}
                aria-label={`Rimuovi ${name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Role Configuration */}
      {playerNames.length >= 3 && (
        <div className="animate-slide-in">
          <label className="input-label mt-xl" style={{ textAlign: 'center' }}>
            Configurazione Ruoli ({totalRoles}/{playerNames.length})
          </label>

          <div className="role-config">
            <div className="role-counter">
              <span className="role-counter-label civile">Civili</span>
              <div className="role-counter-controls">
                <button
                  className="role-counter-btn"
                  onClick={() => updateRole('civile', -1)}
                  disabled={roleConfig.civile <= 0}
                >−</button>
                <span className="role-counter-value">{roleConfig.civile}</span>
                <button
                  className="role-counter-btn"
                  onClick={() => updateRole('civile', 1)}
                >+</button>
              </div>
            </div>

            <div className="role-counter">
              <span className="role-counter-label undercover">Undercover</span>
              <div className="role-counter-controls">
                <button
                  className="role-counter-btn"
                  onClick={() => updateRole('undercover', -1)}
                  disabled={roleConfig.undercover <= 0}
                >−</button>
                <span className="role-counter-value">{roleConfig.undercover}</span>
                <button
                  className="role-counter-btn"
                  onClick={() => updateRole('undercover', 1)}
                >+</button>
              </div>
            </div>

            <div className="role-counter">
              <span className="role-counter-label mr-white">Mr. White</span>
              <div className="role-counter-controls">
                <button
                  className="role-counter-btn"
                  onClick={() => updateRole('mr_white', -1)}
                  disabled={roleConfig.mr_white <= 1}
                >−</button>
                <span className="role-counter-value">{roleConfig.mr_white}</span>
                <button
                  className="role-counter-btn"
                  onClick={() => updateRole('mr_white', 1)}
                >+</button>
              </div>
            </div>
          </div>

          {totalRoles !== playerNames.length && (
            <p style={{
              textAlign: 'center',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginTop: 'var(--space-sm)',
            }}>
              ⚠️ Il totale dei ruoli ({totalRoles}) deve essere uguale al numero di giocatori ({playerNames.length})
            </p>
          )}
        </div>
      )}

      {/* Start Button */}
      <button
        className="btn btn-primary btn-lg btn-block mt-xl"
        onClick={() => onStartGame(playerNames, roleConfig)}
        disabled={!isValid}
        id="start-game-button"
      >
        <Play size={20} />
        Inizia Partita
      </button>

      {playerNames.length < 3 && playerNames.length > 0 && (
        <p className="text-muted text-center mt-sm" style={{ fontSize: '0.85rem' }}>
          Servono almeno 3 giocatori per iniziare
        </p>
      )}
    </div>
  );
}
