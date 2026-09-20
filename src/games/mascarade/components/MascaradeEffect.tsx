import React, { useState } from 'react';
import { MascaradeState, MascaradePlayer } from '../types';
import { getRoleById } from '../roles';

interface Props {
  state: MascaradeState;
  myPlayer: MascaradePlayer;
  isHost: boolean;
  onImbroglione: (targetId: string) => void;
  onSpyTarget: (targetId: string) => void;
  onSpyDecide: (doSwap: boolean) => void;
  onGuruTarget: (targetId: string) => void;
  onGuruGuess: (roleId: number) => void;
  onGuruDone: () => void;
  onSciamana: (targetId: string) => void;
  onFolle: (t1: string, t2: string, didSwap: boolean) => void;
  onMarionettista: (t1: string, t2: string) => void;
  onPrincipessa: (targetId: string) => void;
  onPrincipessaDone: () => void;
}

export default function MascaradeEffect({ state, myPlayer, isHost, ...actions }: Props) {
  const [target1, setTarget1] = useState<string | null>(null);
  const [folleSwap, setFolleSwap] = useState<boolean | null>(null);
  const activePlayer = state.players.find(p => p.seatIndex === state.turnIndex);
  const others = state.players.filter(p => p.id !== myPlayer.id);
  const phase = state.phase;

  // Helper: player selector grid
  const PlayerGrid = ({ onPick, exclude }: { onPick: (id: string) => void; exclude?: string[] }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginTop: '0.8rem' }}>
      {state.players.filter(p => p.id !== myPlayer.id && !(exclude || []).includes(p.id)).map(p => (
        <button key={p.id} onClick={() => onPick(p.id)} style={{
          padding: '0.5rem 1rem', background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)',
          borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          {p.name} (🪙{p.coins})
        </button>
      ))}
    </div>
  );

  // Imbroglione: choose among tied richest
  if (phase === 'effect-imbroglione') {
    const richestIds: string[] = state.effectData?.richestIds || [];
    const isUser = activePlayer?.id === myPlayer.id;
    return (
      <Wrap title="L'Imbroglione" desc="Scegli da chi rubare 2 monete:">
        {isUser ? (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {richestIds.map(id => {
              const p = state.players.find(pl => pl.id === id)!;
              return (
                <button key={id} onClick={() => actions.onImbroglione(id)} style={btnStyle}>
                  {p.name} (🪙{p.coins})
                </button>
              );
            })}
          </div>
        ) : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
      </Wrap>
    );
  }

  // Spia
  if (phase === 'effect-spy') {
    const isUser = activePlayer?.id === myPlayer.id;
    if (!state.effectTargetId) {
      return (
        <Wrap title="La Spia" desc="Scegli un giocatore per vedere la sua carta:">
          {isUser ? <PlayerGrid onPick={actions.onSpyTarget} /> : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
        </Wrap>
      );
    }
    // Spy has seen cards
    const myRole = state.effectData?.myRole ? getRoleById(state.effectData.myRole) : null;
    const targetRole = state.effectData?.targetRole ? getRoleById(state.effectData.targetRole) : null;
    const target = state.players.find(p => p.id === state.effectTargetId);
    return (
      <Wrap title="La Spia" desc="Hai visto le carte:">
        {isUser && myRole && targetRole ? (
          <>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <CardShow label="La tua carta" role={myRole} />
              <CardShow label={target?.name || ''} role={targetRole} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => actions.onSpyDecide(true)} style={btnStyle}>🔄 Scambia</button>
              <button onClick={() => actions.onSpyDecide(false)} style={{ ...btnStyle, background: '#666' }}>✋ Non scambiare</button>
            </div>
          </>
        ) : <Wait text={`${activePlayer?.name} sta decidendo...`} />}
      </Wrap>
    );
  }

  // Guru
  if (phase === 'effect-guru') {
    const isUser = activePlayer?.id === myPlayer.id;
    const guruData = state.effectData;

    if (!state.effectTargetId) {
      return (
        <Wrap title="Il Guru" desc="Scegli un giocatore che deve indovinare il suo ruolo:">
          {isUser ? <PlayerGrid onPick={actions.onGuruTarget} /> : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
        </Wrap>
      );
    }

    const target = state.players.find(p => p.id === state.effectTargetId)!;
    const isTarget = myPlayer.id === target.id;

    if (guruData?.waitingGuess) {
      return (
        <Wrap title="Il Guru" desc={`${target.name} deve indovinare il suo ruolo:`}>
          {isTarget ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {[...new Set(state.rolesInGame)].map(rId => {
                const r = getRoleById(rId);
                return (
                  <button key={rId} onClick={() => actions.onGuruGuess(rId)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.4rem',
                    background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)',
                    borderRadius: '8px', cursor: 'pointer', color: '#fff', width: '75px',
                  }}>
                    <img src={r.image} alt={r.name} style={{ width: '45px', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.55rem' }}>{r.name}</span>
                  </button>
                );
              })}
            </div>
          ) : <Wait text={`${target.name} sta scegliendo...`} />}
        </Wrap>
      );
    }

    // Guess result
    const guessed = guruData?.guessedRoleId ? getRoleById(guruData.guessedRoleId) : null;
    const actual = guruData?.actualRoleId ? getRoleById(guruData.actualRoleId) : null;
    return (
      <Wrap title="Il Guru — Risultato" desc="">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>{target.name} ha detto: <strong style={{ color: '#d4a843' }}>{guessed?.name}</strong></p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>La sua carta è: <strong style={{ color: guruData?.correct ? '#22c55e' : '#ef4444' }}>{actual?.name}</strong></p>
          {actual && <img src={actual.image} alt={actual.name} style={{ width: '100px', borderRadius: '8px', margin: '0.5rem auto' }} />}
          {guruData?.correct
            ? <p style={{ color: '#22c55e' }}>✓ Ha indovinato! Nessuna penalità.</p>
            : <p style={{ color: '#ef4444' }}>✗ Ha sbagliato! Paga fino a 4🪙 al Guru.</p>}
        </div>
        {isHost && <button onClick={actions.onGuruDone} style={btnStyle}>Continua →</button>}
      </Wrap>
    );
  }

  // Sciamana
  if (phase === 'effect-sciamana') {
    const isUser = activePlayer?.id === myPlayer.id;
    return (
      <Wrap title="La Sciamana" desc="Scegli un giocatore per scambiare tutte le monete:">
        {isUser ? <PlayerGrid onPick={actions.onSciamana} /> : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
      </Wrap>
    );
  }

  // Folle
  if (phase === 'effect-folle') {
    const isUser = activePlayer?.id === myPlayer.id;
    return (
      <Wrap title="Il Folle" desc="Scegli 2 giocatori per scambiare (o fingere) le loro carte:">
        {isUser ? (
          !target1 ? (
            <>
              <p style={{ color: '#d4a843', fontSize: '0.85rem' }}>Scegli il primo giocatore:</p>
              <PlayerGrid onPick={(id) => setTarget1(id)} />
            </>
          ) : (
            <>
              <p style={{ color: '#d4a843', fontSize: '0.85rem' }}>Scegli il secondo giocatore:</p>
              <PlayerGrid onPick={(id) => {
                if (folleSwap === null) setFolleSwap(true); // will ask next
              }} exclude={[target1]} />
              {/* Once both chosen, ask swap/fake */}
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
                {state.players.filter(p => p.id !== myPlayer.id && p.id !== target1).map(p => (
                  <div key={p.id}>
                    <button onClick={() => { actions.onFolle(target1, p.id, true); setTarget1(null); }} style={btnStyle}>
                      🔄 Scambia con {p.name}
                    </button>
                    <button onClick={() => { actions.onFolle(target1, p.id, false); setTarget1(null); }}
                      style={{ ...btnStyle, background: '#666', marginTop: '0.4rem' }}>
                      🎭 Fingi con {p.name}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )
        ) : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
      </Wrap>
    );
  }

  // Marionettista
  if (phase === 'effect-marionettista') {
    const isUser = activePlayer?.id === myPlayer.id;
    return (
      <Wrap title="Il Marionettista" desc="Scegli 2 giocatori. Prendi 1🪙 da entrambi e scambiali di posto:">
        {isUser ? (
          !target1 ? (
            <>
              <p style={{ color: '#d4a843', fontSize: '0.85rem' }}>Scegli il primo giocatore:</p>
              <PlayerGrid onPick={(id) => setTarget1(id)} />
            </>
          ) : (
            <>
              <p style={{ color: '#d4a843', fontSize: '0.85rem' }}>Scegli il secondo giocatore:</p>
              <PlayerGrid onPick={(id) => { actions.onMarionettista(target1, id); setTarget1(null); }} exclude={[target1]} />
            </>
          )
        ) : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
      </Wrap>
    );
  }

  // Principessa
  if (phase === 'effect-principessa') {
    const isUser = activePlayer?.id === myPlayer.id;
    if (!state.effectTargetId) {
      return (
        <Wrap title="La Principessa" desc="Scegli un giocatore che deve mostrare la sua carta a tutti:">
          {isUser ? <PlayerGrid onPick={actions.onPrincipessa} /> : <Wait text={`${activePlayer?.name} sta scegliendo...`} />}
        </Wrap>
      );
    }
    // Show revealed card
    const target = state.players.find(p => p.id === state.effectTargetId)!;
    const revealedRoleId = state.revealedCards[target.id];
    const revealedRole = revealedRoleId ? getRoleById(revealedRoleId) : null;
    const isTarget = myPlayer.id === target.id;
    return (
      <Wrap title="La Principessa" desc={`${target.name} mostra la sua carta${isTarget ? ' (non puoi vederla!)' : ''}:`}>
        {isTarget ? (
          <p style={{ color: '#ef4444', fontSize: '1rem' }}>🙈 Non puoi vedere la tua carta!</p>
        ) : revealedRole ? (
          <div style={{ textAlign: 'center' }}>
            <img src={revealedRole.image} alt={revealedRole.name} style={{ width: '120px', borderRadius: '8px', marginBottom: '0.5rem' }} />
            <p style={{ color: '#d4a843', fontWeight: 700 }}>{revealedRole.name}</p>
          </div>
        ) : null}
        {isHost && <button onClick={actions.onPrincipessaDone} style={{ ...btnStyle, marginTop: '1rem' }}>Continua →</button>}
      </Wrap>
    );
  }

  return null;
}

// Helper components
function Wrap({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <h2 style={{ color: '#d4a843', marginBottom: '0.3rem' }}>{title}</h2>
      {desc && <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', textAlign: 'center' }}>{desc}</p>}
      {children}
    </div>
  );
}

function Wait({ text }: { text: string }) {
  return <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{text}</p>;
}

function CardShow({ label, role }: { label: string; role: any }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={role.image} alt={role.name} style={{ width: '80px', borderRadius: '6px', marginBottom: '0.3rem' }} />
      <div style={{ fontSize: '0.75rem', color: '#d4a843' }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: '#fff' }}>{role.name}</div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.7rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, color: '#fff',
  background: '#d4a843', border: 'none', borderRadius: '10px', cursor: 'pointer',
};
