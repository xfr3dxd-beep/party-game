import React, { useState } from 'react';

interface PiliPiliCreateProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (code: string, playerName: string) => Promise<boolean>;
  isConnecting: boolean;
}

export default function PiliPiliCreate({ onCreateRoom, onJoinRoom, isConnecting }: PiliPiliCreateProps) {
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
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🌶️</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>
          <span className="text-gradient" style={{ background: 'linear-gradient(90deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pili Pili</span>
        </h1>
        <p className="text-muted mt-sm">
          Fai la tua previsione e vinci le prese!
        </p>
      </div>

      <div className="pili-mode-toggle mb-lg" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('create'); setError(''); }}
        >
          Crea Stanza
        </button>
        <button
          className={`btn ${tab === 'join' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('join'); setError(''); }}
        >
          Unisciti
        </button>
      </div>

      <div className="glass-panel p-lg" style={{ maxWidth: '400px', margin: '0 auto', background: 'rgba(255, 237, 213, 0.1)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
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
          />
        </div>

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
            />
          </div>
        )}

        {error && (
          <div className="text-center mb-md" style={{ color: '#ef4444' }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', border: 'none' }}
          onClick={tab === 'create' ? handleCreate : handleJoin}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connessione...' : tab === 'create' ? '🎮 Crea Stanza' : '🚪 Unisciti'}
        </button>
      </div>
    </div>
  );
}
