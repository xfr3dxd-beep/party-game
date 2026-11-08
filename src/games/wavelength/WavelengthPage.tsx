import React, { useState } from 'react';
import Layout from '../../components/Layout';
import RoomCodeBanner from '../../components/RoomCodeBanner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWavelengthRoom } from './hooks/useWavelengthRoom';
import { useWavelengthGame } from './hooks/useWavelengthGame';
import WavelengthCreate from './components/WavelengthCreate';
import WavelengthLobby from './components/WavelengthLobby';
import WavelengthActivePlayer from './components/WavelengthActivePlayer';
import WavelengthGuess from './components/WavelengthGuess';
import WavelengthScoring from './components/WavelengthScoring';
import WavelengthResult from './components/WavelengthResult';

export default function WavelengthPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);
  const [winScore, setWinScore] = useState(25);

  const {
    roomCode,
    playerId,
    playerName,
    players,
    isHost,
    isConnected,
    createRoom,
    joinRoom,
    broadcast,
    onBroadcast,
    disconnect,
  } = useWavelengthRoom();

  const {
    state,
    act,
  } = useWavelengthGame({
    playerId,
    isHost,
    roomCode,
    players,
    broadcast,
    onBroadcast,
  });

  // Derive phase: once game is started use game state, otherwise local phase
  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  const handleCreateRoom = async (playerName: string) => {
    setIsConnecting(true);
    await createRoom(playerName);
    setIsConnecting(false);
    setLocalPhase('lobby');
  };

  const handleJoinRoom = async (code: string, playerName: string): Promise<boolean> => {
    setIsConnecting(true);
    const success = await joinRoom(code, playerName);
    setIsConnecting(false);
    if (success) setLocalPhase('lobby');
    return success;
  };

  const handleStartGame = () => {
    if (roomCode) {
      act('start', { roomCode, winScore });
    }
  };

  // Is this player the active player?
  const isActivePlayer = state.activePlayerId === playerId;

  // Show lobby code banner during gameplay (not in create/lobby)
  const showBanner = !!roomCode && currentPhase !== 'create' && currentPhase !== 'lobby';

  return (
    <Layout>
      {showBanner && <RoomCodeBanner roomCode={roomCode!} />}
      <div className="container container-md" style={showBanner ? { paddingTop: '2.5rem' } : undefined}>
        {/* Back button in create/lobby */}
        {(currentPhase === 'create' || currentPhase === 'lobby') && (
          <button
            className="btn btn-secondary mb-lg"
            onClick={() => {
              disconnect();
              navigate('/');
            }}
          >
            <ArrowLeft size={16} />
            Torna ai Giochi
          </button>
        )}

        {/* Create / Join */}
        {currentPhase === 'create' && (
          <WavelengthCreate
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isConnecting={isConnecting}
          />
        )}

        {/* Lobby */}
        {currentPhase === 'lobby' && roomCode && (
          <WavelengthLobby
            roomCode={roomCode}
            players={players}
            isHost={isHost}
            winScore={winScore}
            onWinScoreChange={setWinScore}
            onStartGame={handleStartGame}
          />
        )}

        {/* Active Player phase */}
        {currentPhase === 'active-player' && isActivePlayer && (
          <WavelengthActivePlayer
            state={state}
            onPickRandomPair={() => act('pick-random-pair')}
            onPickCustomPair={(e1, e2) => act('pick-custom-pair', { extreme1: e1, extreme2: e2 })}
            onSubmitClue={(clue) => act('submit-clue', { clue })}
            onSkipPair={() => act('skip-pair')}
          />
        )}

        {/* Non-active player waiting during active-player phase */}
        {currentPhase === 'active-player' && !isActivePlayer && (
          <WavelengthGuess
            state={state}
            playerId={playerId}
            onSubmitGuess={(angle) => act('submit-guess', { playerId, angle })}
          />
        )}

        {/* Guessing phase */}
        {currentPhase === 'guessing' && !isActivePlayer && (
          <WavelengthGuess
            state={state}
            playerId={playerId}
            onSubmitGuess={(angle) => act('submit-guess', { playerId, angle })}
          />
        )}

        {/* Active player during guessing phase: waiting */}
        {currentPhase === 'guessing' && isActivePlayer && (
          <div className="animate-fade-in text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ fontWeight: 800 }}>Indizio inviato!</h2>
            <p className="text-muted mb-md">
              In attesa che tutti posizionino la freccia...
            </p>
            <div className="glass-panel p-md" style={{ maxWidth: '350px', margin: '0 auto' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Il tuo indizio: <strong style={{ color: '#000000' }}>"{state.clue}"</strong>
              </div>
              {state.players.filter(p => p.id !== state.activePlayerId).map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem',
                }}>
                  <span>{p.name}</span>
                  <span>{state.guesses.some(g => g.playerId === p.id) ? '✓' : '...'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scoring */}
        {currentPhase === 'scoring' && (
          <WavelengthScoring
            state={state}
            isHost={isHost}
            onNextRound={() => act('next-round')}
          />
        )}

        {/* Game Over */}
        {currentPhase === 'game-over' && (
          <WavelengthResult
            state={state}
            isHost={isHost}
            onNewGame={() => act('new-game')}
            onGoHome={() => {
              disconnect();
              navigate('/');
            }}
          />
        )}
      </div>
    </Layout>
  );
}
