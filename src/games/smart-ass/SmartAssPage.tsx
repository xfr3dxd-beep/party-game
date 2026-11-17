import React, { useState } from 'react';
import Layout from '../../components/Layout';
import RoomCodeBanner from '../../components/RoomCodeBanner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSmartAssRoom } from './hooks/useSmartAssRoom';
import { useSmartAssGame } from './hooks/useSmartAssGame';
import SmartAssCreate from './components/SmartAssCreate';
import SmartAssLobby from './components/SmartAssLobby';
import SmartAssBoard from './components/SmartAssBoard';

export default function SmartAssPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    roomCode, playerId, playerName, players, isHost, isConnected,
    createRoom, joinRoom, broadcast, onBroadcast, disconnect,
  } = useSmartAssRoom();

  const { state, act, devAddBots } = useSmartAssGame({
    playerId, isHost, roomCode, players, broadcast, onBroadcast,
  });

  // DEV ONLY: l'host può "giocare come" un altro giocatore (bot compresi).
  // In produzione DEV è false, quindi effectivePlayerId === playerId sempre.
  const DEV = import.meta.env.DEV;
  const [devAs, setDevAs] = useState<string>('');
  const effectivePlayerId =
    DEV && isHost && devAs && state.players.some(p => p.id === devAs) ? devAs : playerId;

  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  // Check if host has a token selected (needed to enable "add bots" button)
  const hostHasToken = state.players.some(p => p.id === playerId && p.tokenIndex >= 0);

  const handleCreateRoom = async (name: string) => {
    setIsConnecting(true);
    await createRoom(name);
    setIsConnecting(false);
    setLocalPhase('lobby');
  };

  const handleJoinRoom = async (code: string, name: string): Promise<boolean> => {
    setIsConnecting(true);
    const success = await joinRoom(code, name);
    setIsConnecting(false);
    if (success) setLocalPhase('lobby');
    return success;
  };

  // Build lobby player list from game state or room presence
  const gamePlayers = state.players.length > 0 ? state.players : players.map(p => ({
    id: p.id, name: p.name, tokenIndex: -1, position: 1, skipNextNarrator: false,
  }));

  const showBanner = !!roomCode && currentPhase !== 'create' && currentPhase !== 'lobby';

  // In-game phases (everything after lobby)
  const inGame = !['create', 'lobby'].includes(currentPhase);

  return (
    <Layout>
      {showBanner && <RoomCodeBanner roomCode={roomCode!} />}
      <div className="container container-md" style={showBanner ? { paddingTop: '2.5rem' } : undefined}>
        {/* Back button */}
        {(currentPhase === 'create' || currentPhase === 'lobby') && (
          <button className="btn btn-secondary mb-lg" onClick={() => { disconnect(); navigate('/'); }}>
            <ArrowLeft size={16} /> Torna ai Giochi
          </button>
        )}

        {/* CREATE */}
        {currentPhase === 'create' && (
          <SmartAssCreate onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} isConnecting={isConnecting} />
        )}

        {/* LOBBY */}
        {currentPhase === 'lobby' && roomCode && (
          <SmartAssLobby
            roomCode={roomCode}
            players={gamePlayers}
            playerId={effectivePlayerId}
            isHost={isHost}
            onPickToken={(tokenIndex) => act('pick-token', { playerId: effectivePlayerId, tokenIndex })}
            onStartGame={() => act('start-game')}
          />
        )}

        {/* IN-GAME */}
        {inGame && (
          <SmartAssBoard
            state={state}
            playerId={effectivePlayerId}
            isHost={isHost}
            onAct={(action, payload) => act(action, payload)}
          />
        )}
      </div>

      {/* ───── PANNELLO DEV (visibile solo con npm run dev, solo per l'host) ───── */}
      {DEV && isHost && roomCode && (
        <div style={{
          position: 'fixed', left: 8, bottom: 8, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', color: '#fff', border: '1px solid #f59e0b',
          borderRadius: 8, padding: '8px 10px', fontSize: 12, display: 'flex',
          flexDirection: 'column', gap: 6, maxWidth: 240,
        }}>
          <strong style={{ color: '#f59e0b' }}>🧪 DEV</strong>
          {(currentPhase === 'create' || currentPhase === 'lobby') && (
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }}
              disabled={!hostHasToken} onClick={devAddBots}
              title={hostHasToken ? '' : 'Prima scegli la tua pedina'}>
              + Aggiungi bot (completa 2 giocatori)
            </button>
          )}
          {!hostHasToken && (currentPhase === 'create' || currentPhase === 'lobby') && (
            <span style={{ opacity: 0.7 }}>Prima scegli la tua pedina.</span>
          )}
          {state.players.length > 0 && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              Gioca come:
              <select value={effectivePlayerId} onChange={e => setDevAs(e.target.value)}
                style={{ fontSize: 12, padding: 2, color: '#000' }}>
                {state.players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.id === playerId ? ' (tu)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </Layout>
  );
}
