import React, { useState } from 'react';
import { Plus, Minus, X, Play, Users, Timer, Type } from 'lucide-react';
import { GameConfig, WordCount } from '../types';

interface SciaradaLobbyProps {
  onStartGame: (teamNames: string[], config: GameConfig) => void;
}

const TIMER_MIN = 30;
const TIMER_MAX = 300;
const TIMER_STEP = 30;

function formatTimer(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (sec === 0) {
    return min === 1 ? '1 Minuto' : `${min} Minuti`;
  }
  return `${min} Min ${sec}s`;
}

const wordCountOptions: { value: WordCount; label: string }[] = [
  { value: 4, label: '4 Parole' },
  { value: 5, label: '5 Parole' },
  { value: 6, label: '6 Parole' },
  { value: 7, label: '7 Parole' },
  { value: 'random', label: '🎲 Casuale' },
];

export default function SciaradaLobby({ onStartGame }: SciaradaLobbyProps) {
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [wordCount, setWordCount] = useState<WordCount>(4);

  const addTeam = () => {
    const trimmed = newTeamName.trim();
    if (trimmed && !teamNames.includes(trimmed)) {
      setTeamNames([...teamNames, trimmed]);
      setNewTeamName('');
    }
  };

  const removeTeam = (index: number) => {
    setTeamNames(teamNames.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTeam();
    }
  };

  const canStart = teamNames.length >= 2;

  const handleStart = () => {
    if (canStart) {
      onStartGame(teamNames, { timerSeconds, wordCount });
    }
  };

  return (
    <div className="lobby-setup animate-fade-in">
      <div className="lobby-header">
        <h1 className="lobby-title">🎭 Sciarade</h1>
        <p className="lobby-subtitle">Prepara le squadre e inizia a mimare!</p>
      </div>

      {/* Team Names */}
      <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-md)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Users size={16} />
          Squadre ({teamNames.length})
        </p>

        <div className="player-list">
          {teamNames.map((name, index) => (
            <div key={index} className="player-item" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="player-item-number">{index + 1}</div>
              <span className="player-item-name">{name}</span>
              <button
                className="player-item-remove"
                onClick={() => removeTeam(index)}
                aria-label={`Rimuovi ${name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-sm mt-md">
          <input
            type="text"
            className="input-field"
            placeholder="Nome squadra..."
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={handleKeyPress}
            maxLength={20}
            id="team-name-input"
          />
          <button
            className="btn btn-primary"
            onClick={addTeam}
            disabled={!newTeamName.trim()}
            id="add-team-button"
          >
            <Plus size={16} />
            Aggiungi
          </button>
        </div>

        {teamNames.length < 2 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
            Servono almeno 2 squadre per giocare
          </p>
        )}
      </div>

      {/* Timer Selection */}
      <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-md)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Timer size={16} />
          Tempo per Turno
        </p>

        <div className="sciarada-stepper">
          <button
            className="btn sciarada-stepper-btn"
            onClick={() => setTimerSeconds(Math.max(TIMER_MIN, timerSeconds - TIMER_STEP))}
            disabled={timerSeconds <= TIMER_MIN}
            id="timer-minus"
          >
            <Minus size={20} />
          </button>
          <span className="sciarada-stepper-value">
            {formatTimer(timerSeconds)}
          </span>
          <button
            className="btn sciarada-stepper-btn"
            onClick={() => setTimerSeconds(Math.min(TIMER_MAX, timerSeconds + TIMER_STEP))}
            disabled={timerSeconds >= TIMER_MAX}
            id="timer-plus"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Word Count Selection */}
      <div className="glass-card-static" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-md)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Type size={16} />
          Parole per Frase
        </p>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
          Conta solo le parole con 4+ lettere (articoli e preposizioni non contano)
        </p>

        <div className="sciarada-option-grid wide">
          {wordCountOptions.map(opt => (
            <button
              key={String(opt.value)}
              className={`sciarada-option-btn ${wordCount === opt.value ? 'active' : ''}`}
              onClick={() => setWordCount(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        className="btn btn-primary btn-lg btn-block"
        onClick={handleStart}
        disabled={!canStart}
        id="start-sciarada-button"
      >
        <Play size={18} />
        Inizia Partita
      </button>
    </div>
  );
}
