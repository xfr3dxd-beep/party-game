import React, { useState } from 'react';
import { RoomPlayer } from '../hooks/usePiliPiliRoom';
import { Users } from 'lucide-react';

interface PiliPiliLobbyProps {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function PiliPiliLobby({ roomCode, players, isHost, onStartGame }: PiliPiliLobbyProps) {
  const [showRules, setShowRules] = useState(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={24} color="#ea580c" />
            Giocatori ({players.length}/8)
          </h3>
          <button
            className="mind-help-btn"
            onClick={() => setShowRules(true)}
            title="Regole"
            style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}
          >
            ❓
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

      {/* Rules overlay */}
      {showRules && (
        <div className="mind-shuriken-modal">
          <div className="mind-shuriken-content" style={{ textAlign: 'left', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🌶️ Pili Pili — Regole</h2>
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

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <p><strong>🎯 Obiettivo:</strong> Indovina quante prese farai! Chi sbaglia riceve <strong>Pili 🌶️</strong> (penalità). Vince chi ne ha meno.</p>

              <p style={{ fontWeight: 700, color: '#ea580c', marginTop: '0.8rem', marginBottom: '0.3rem' }}>Come si gioca un round:</p>

              <p><strong>1. 🎴 Missione:</strong> Si rivela una carta missione che cambia le regole del round (es: carte invertite, scommesse al buio, scambio carte...).</p>

              <p><strong>2. 🃏 Distribuzione:</strong> Ogni giocatore riceve le carte indicate dalla missione.</p>

              <p><strong>3. 🔄 Azioni speciali:</strong> Se la missione lo richiede (es: scambia una carta col vicino).</p>

              <p><strong>4. 🎯 Scommesse:</strong> A turno, ogni giocatore dichiara quante prese pensa di vincere. Il totale delle scommesse <strong>NON può essere uguale</strong> al numero di prese disponibili.</p>

              <p><strong>5. ⚔️ Prese:</strong> Si giocano le carte una alla volta. La carta più alta vince la presa (salvo missioni speciali). Chi vince inizia la presa successiva.</p>

              <p><strong>6. 🌶️ Penalità:</strong> Chi non indovina la propria scommessa riceve tanti Pili quante prese di differenza. Alcune missioni raddoppiano o triplicano!</p>

              <p style={{ fontWeight: 700, color: '#ea580c', marginTop: '0.8rem', marginBottom: '0.3rem' }}>Fine del gioco:</p>

              <p><strong>💀 Game Over:</strong> Quando un giocatore raggiunge <strong>7 Pili</strong>. Vince chi ne ha di meno!</p>

              <p><strong>🃏 Jolly:</strong> Batte qualsiasi carta. Appare in alcune missioni.</p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', border: 'none' }}
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
