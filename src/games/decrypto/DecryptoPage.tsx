import React, { useState } from 'react';
import Layout from '../../components/Layout';
import RoomCodeBanner from '../../components/RoomCodeBanner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDecryptoRoom } from './hooks/useDecryptoRoom';
import { useDecryptoGame } from './hooks/useDecryptoGame';
import DecryptoCreate from './components/DecryptoCreate';
import DecryptoLobby from './components/DecryptoLobby';
import DecryptoChooseStarter from './components/DecryptoChooseStarter';
import DecryptoGameBoard from './components/DecryptoGameBoard';
import DecryptoClueGiving from './components/DecryptoClueGiving';
import DecryptoGuessing from './components/DecryptoGuessing';
import DecryptoResult from './components/DecryptoResult';
import type { DecryptoTeam } from './types';

export default function DecryptoPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    roomCode, playerId, playerName, players, isHost, isConnected,
    createRoom, joinRoom, broadcast, onBroadcast, disconnect,
  } = useDecryptoRoom();

  const { state, act, devAddBots } = useDecryptoGame({
    playerId, isHost, roomCode, players, broadcast, onBroadcast,
  });

  // DEV ONLY: l'host può "giocare come" un altro giocatore (bot compresi).
  // In produzione DEV è false, quindi effectivePlayerId === playerId sempre.
  const DEV = import.meta.env.DEV;
  const [devAs, setDevAs] = useState<string>('');
  const effectivePlayerId =
    DEV && isHost && devAs && state.players.some(p => p.id === devAs) ? devAs : playerId;

  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;
  const myTeam = state.players.find(p => p.id === effectivePlayerId)?.team || null;
  const hostHasTeam = !!state.players.find(p => p.id === playerId)?.team;

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

  const gamePlayers = state.players.length > 0 ? state.players : players.map(p => ({
    id: p.id, name: p.name, team: null as DecryptoTeam | null,
  }));

  const showBanner = !!roomCode && currentPhase !== 'create' && currentPhase !== 'lobby';

  // Game board shown during actual gameplay (not choose-starter or lobby)
  const inGame = ['clue-giving', 'guessing', 'final-guess', 'game-over'].includes(currentPhase);

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
          <DecryptoCreate onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} isConnecting={isConnecting} />
        )}

        {/* LOBBY */}
        {currentPhase === 'lobby' && roomCode && (
          <DecryptoLobby
            roomCode={roomCode}
            players={gamePlayers}
            playerId={effectivePlayerId}
            isHost={isHost}
            onJoinTeam={(team) => act('join-team', { playerId: effectivePlayerId, team })}
            onStartGame={() => act('start-game')}
          />
        )}

        {/* CHOOSE STARTER — standalone, no game board */}
        {currentPhase === 'choose-starter' && (
          <DecryptoChooseStarter
            isHost={isHost}
            onChoose={(team) => act('choose-starter', { team })}
          />
        )}

        {/* IN-GAME — wrapped in game board (Paroliere + Scheda always visible) */}
        {inGame && myTeam && (
          <DecryptoGameBoard state={state} myTeam={myTeam}>
            {currentPhase === 'clue-giving' && (
              <DecryptoClueGiving
                state={state}
                playerId={effectivePlayerId}
                onSubmitClues={(clues) => act('submit-clues', { clues })}
                onConfirmTurn={() => act('confirm-turn')}
              />
            )}

            {currentPhase === 'guessing' && (
              <DecryptoGuessing
                state={state}
                playerId={effectivePlayerId}
                onSubmitTeamGuess={(guess) => act('submit-team-guess', { guess })}
                onSubmitOpponentGuess={(guess) => act('submit-opponent-guess', { guess })}
              />
            )}

            {(currentPhase === 'final-guess' || currentPhase === 'game-over') && (
              <DecryptoResult
                state={state}
                playerId={effectivePlayerId}
                isHost={isHost}
                onFinalGuess={(words) => act('final-guess', { words })}
                onSkipFinalGuess={() => act('skip-final-guess')}
                onNewGame={() => act('new-game')}
                onGoHome={() => { disconnect(); navigate('/'); }}
              />
            )}
          </DecryptoGameBoard>
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
              disabled={!hostHasTeam} onClick={devAddBots}
              title={hostHasTeam ? '' : 'Prima scegli la tua squadra'}>
              + Aggiungi bot (completa 2 vs 2)
            </button>
          )}
          {!hostHasTeam && (currentPhase === 'create' || currentPhase === 'lobby') && (
            <span style={{ opacity: 0.7 }}>Prima scegli la tua squadra.</span>
          )}
          {state.players.length > 0 && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              Gioca come:
              <select value={effectivePlayerId} onChange={e => setDevAs(e.target.value)}
                style={{ fontSize: 12, padding: 2, color: '#000' }}>
                {state.players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.team ? (p.team === 'bianca' ? '⬜' : '⬛') : ''}{p.id === playerId ? ' (tu)' : ''}
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
