import React from 'react';
import { RoomPlayer } from '../hooks/usePiliPiliRoom';
import { Users, HelpCircle } from 'lucide-react';

interface PiliPiliLobbyProps {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function PiliPiliLobby({ roomCode, players, isHost, onStartGame }: PiliPiliLobbyProps) {
  const canStart = players.length >= 2 && players.length <= 8;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-xl">
        <h2 className="mb-sm">Codice Stanza</h2>
        <div className="pili-room-code" style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '0.2em', color: '#ea580c' }}>
          {roomCode}
        </div>
      </div>

      <div className="glass-panel p-lg mb-xl pili-lobby-panel" style={{ background: 'rgba(255, 237, 213, 0.1)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
        <div className="d-flex justify-between items-center mb-md">
          <h3 className="d-flex items-center gap-sm m-0">
            <Users size={24} color="#ea580c" />
            Giocatori ({players.length}/8)
          </h3>
          <button className="btn btn-icon" title="Regole" style={{ color: '#ea580c' }}>
            <HelpCircle size={24} />
          </button>
        </div>

        <div className="pili-players-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {players.map(p => (
            <div key={p.id} className="pili-player-badge p-sm" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              {p.isHost && <div style={{ fontSize: '0.8rem', color: '#ea580c' }}>Host</div>}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="pili-player-badge p-sm" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', opacity: 0.5 }}>
              <div style={{ color: 'var(--text-muted)' }}>In attesa...</div>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <div className="text-center">
          <button
            className="btn btn-primary btn-lg"
            onClick={onStartGame}
            disabled={!canStart}
            style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', border: 'none' }}
          >
            Inizia Partita
          </button>
          {!canStart && (
            <p className="text-muted mt-sm">Servono da 2 a 8 giocatori</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted" style={{ fontSize: '1.2rem' }}>
            In attesa dell'host per iniziare...
          </p>
        </div>
      )}
    </div>
  );
}
