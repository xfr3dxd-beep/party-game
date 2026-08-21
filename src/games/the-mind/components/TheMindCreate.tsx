import React, { useState } from 'react';

interface TheMindCreateProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (code: string, playerName: string) => Promise<boolean>;
  isConnecting: boolean;
}

export default function TheMindCreate({ onCreateRoom, onJoinRoom, isConnecting }: TheMindCreateProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) { setError('Inserisci il tuo nome'); return; }
    setError('');
    onCreateRoom(name.trim());
  };

  const handleJoin = async () => {
    if (!name.trim()) { setError('Inserisci il tuo nome'); return; }
    if (code.length !== 4) { setError('Il codice deve essere di 4 lettere'); return; }
    setError('');
    const success = await onJoinRoom(code.toUpperCase(), name.trim());
    if (!success) setError('Stanza non trovata. Controlla il codice.');
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-lg">
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🧠</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>
          <span className="text-gradient">The Mind</span>
        </h1>
        <p className="text-muted mt-sm">
          Gioca le carte in ordine crescente... senza parlare!
        </p>
      </div>

      {/* Tab Selector */}
      <div className="mind-mode-toggle mb-lg">
        <button
          className={`mind-mode-btn ${tab === 'create' ? 'active' : ''}`}
          onClick={() => { setTab('create'); setError(''); }}
        >
          Crea Stanza
        </button>
        <button
          className={`mind-mode-btn ${tab === 'join' ? 'active' : ''}`}
          onClick={() => { setTab('join'); setError(''); }}
        >
          Unisciti
        </button>
      </div>

      <div className="glass-panel p-lg" style={{ maxWidth: '400px', margin: '0 auto' }}>
        {/* Name input */}
        <div className="mb-md">
          <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
            Il tuo nome
          </label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Inserisci il tuo nome..."
            maxLength={20}
            id="mind-player-name"
          />
        </div>

        {/* Join: Code input */}
        {tab === 'join' && (
          <div className="mb-md">
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
              Codice stanza
            </label>
            <input
              type="text"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
              placeholder="ABCD"
              maxLength={4}
              style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.5rem', fontFamily: 'monospace' }}
              id="mind-room-code-input"
            />
          </div>
        )}

        {error && (
          <div className="text-center mb-md" style={{ color: 'var(--accent-rose)' }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={tab === 'create' ? handleCreate : handleJoin}
          disabled={isConnecting}
          id="mind-submit-btn"
        >
          {isConnecting ? 'Connessione...' : tab === 'create' ? '🎮 Crea Stanza' : '🚪 Unisciti'}
        </button>
      </div>
    </div>
  );
}
