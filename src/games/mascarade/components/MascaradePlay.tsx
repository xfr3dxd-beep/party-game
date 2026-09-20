import React, { useState } from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getRoleById, getCardBack } from '../roles';

interface Props {
  state: MascaradeState;
  myPlayer: MascaradePlayer;
  isMyTurn: boolean;
  isForcedSwap: boolean;
  activePlayer: MascaradePlayer | undefined;
  rolesSheetOpen: boolean;
  onOpenRoles: () => void;
  onActionLook: () => void;
  onActionSwap: (targetId: string) => void;
  onActionDeclare: (roleId: number) => void;
}

export default function MascaradePlay({
  state, myPlayer, isMyTurn, isForcedSwap, activePlayer,
  rolesSheetOpen, onOpenRoles, onActionLook, onActionSwap, onActionDeclare,
}: Props) {
  const [pickingSwap, setPickingSwap] = useState(false);
  const [pickingDeclare, setPickingDeclare] = useState(false);
  const sorted = [...state.players].sort((a, b) => a.seatIndex - b.seatIndex);

  return (
    <div style={{ minHeight: '85vh', padding: '1rem', position: 'relative' }}>
      {/* Top bar: Round info + roles button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          Turno {state.turnCount} {isForcedSwap && <span style={{ color: '#d4a843' }}>• Scambio obbligatorio</span>}
        </div>
        <button onClick={onOpenRoles} style={{
          background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.4)',
          color: '#d4a843', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
        }}>📜 Ruoli</button>
      </div>

      {/* Table: players in circle */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center',
        marginBottom: '1.5rem', padding: '1rem',
        background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(212,168,67,0.15)',
      }}>
        {sorted.map(p => {
          const isActive = p.seatIndex === state.turnIndex;
          const isMe = p.id === myPlayer.id;
          return (
            <div key={p.id} onClick={() => {
              if (pickingSwap && !isMe) { onActionSwap(p.id); setPickingSwap(false); }
            }} style={{
              textAlign: 'center', padding: '0.5rem', borderRadius: '10px', minWidth: '80px',
              background: isActive ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.03)',
              border: isActive ? '2px solid #d4a843' : isMe ? '2px solid rgba(100,180,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
              cursor: pickingSwap && !isMe ? 'pointer' : 'default',
              opacity: pickingSwap && isMe ? 0.5 : 1,
            }}>
              <img src={getCardBack()} alt="card" style={{ width: '45px', borderRadius: '4px', marginBottom: '0.3rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#d4a843' : '#fff' }}>
                {p.name} {isMe && '(Tu)'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#d4a843' }}>🪙 {p.coins}</div>
              {isActive && <div style={{ fontSize: '0.6rem', color: '#d4a843', marginTop: '2px' }}>⭐ Turno</div>}
            </div>
          );
        })}
      </div>

      {/* Pot */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,168,67,0.1)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid rgba(212,168,67,0.3)' }}>
          <img src="/Mascarade/Pot.jpg" alt="Pot" style={{ width: '40px', borderRadius: '6px' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d4a843' }}>Tribunale: 🪙 {state.pot}</span>
        </div>
      </div>

      {/* My info */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Le tue monete: </span>
        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#d4a843' }}>🪙 {myPlayer.coins}</span>
      </div>

      {/* Actions */}
      {isMyTurn && state.phase === 'play' && !pickingSwap && !pickingDeclare && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#d4a843', marginBottom: '0.3rem' }}>
            {isForcedSwap ? '🔄 Devi fare uno scambio (o fingere)' : '🎭 Scegli la tua azione'}
          </div>
          {!isForcedSwap && (
            <button onClick={onActionLook} style={btnStyle('#3b82f6')}>
              👁️ Guarda la tua carta
            </button>
          )}
          <button onClick={() => setPickingSwap(true)} style={btnStyle('#d4a843')}>
            🔄 Scambia (o fingi) con un giocatore
          </button>
          {!isForcedSwap && (
            <button onClick={() => setPickingDeclare(true)} style={btnStyle('#ef4444')}>
              🎭 Dichiara un ruolo
            </button>
          )}
        </div>
      )}

      {/* Picking swap target */}
      {pickingSwap && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#d4a843', marginBottom: '0.5rem' }}>👆 Tocca un giocatore per scambiare</p>
          <button onClick={() => setPickingSwap(false)} style={btnStyle('#666')}>Annulla</button>
        </div>
      )}

      {/* Picking role to declare */}
      {pickingDeclare && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#d4a843', marginBottom: '0.5rem' }}>🎭 Scegli quale ruolo dichiarare:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {[...new Set(state.rolesInGame)].map(rId => {
              const role = getRoleById(rId);
              return (
                <button key={rId} onClick={() => { onActionDeclare(rId); setPickingDeclare(false); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem',
                    background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)',
                    borderRadius: '8px', cursor: 'pointer', color: '#fff', width: '80px',
                  }}>
                  <img src={role.image} alt={role.name} style={{ width: '50px', borderRadius: '4px', marginBottom: '0.2rem' }} />
                  <span style={{ fontSize: '0.6rem' }}>{role.name}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setPickingDeclare(false)} style={btnStyle('#666')}>Annulla</button>
        </div>
      )}

      {/* Not my turn */}
      {!isMyTurn && state.phase === 'play' && activePlayer && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
          <em>È il turno di {activePlayer.name}...</em>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '0.7rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#fff',
  background: bg, border: 'none', borderRadius: '10px', cursor: 'pointer', minWidth: '250px',
});
