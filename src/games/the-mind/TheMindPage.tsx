import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheMindRoom } from './hooks/useTheMindRoom';
import { useTheMindGame } from './hooks/useTheMindGame';
import TheMindCreate from './components/TheMindCreate';
import TheMindLobby from './components/TheMindLobby';
import TheMindPlay from './components/TheMindPlay';
import TheMindLevelComplete from './components/TheMindLevelComplete';
import TheMindResult from './components/TheMindResult';
import ShurikenModal from './components/ShurikenModal';
import { TheMindMode } from './types';
import { getLevelConfig } from './gameLogic';

export default function TheMindPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [mode, setMode] = useState<TheMindMode>('classic');
  const [isConnecting, setIsConnecting] = useState(false);

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
  } = useTheMindRoom();

  const {
    state,
    myHand,
    startGame,
    playCard,
    requestShuriken,
    voteShuriken,
    resumeAfterConflict,
    requestNextLevel,
    newGame,
  } = useTheMindGame({
    playerId,
    isHost,
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
      startGame(mode, roomCode);
    }
  };

  // Compute level config for rewards display
  const levelConfig = state.level > 0
    ? getLevelConfig(state.level, state.players.length, state.mode)
    : null;

  return (
    <Layout>
      <div className="container container-md">
        {/* Back button in create/lobby */}
        {(currentPhase === 'create' || currentPhase === 'lobby') && (
          <button
            className="btn btn-secondary mb-lg"
            onClick={() => {
              disconnect();
              navigate('/');
            }}
            id="back-to-home"
          >
            <ArrowLeft size={16} />
            Torna ai Giochi
          </button>
        )}

        {/* Create / Join */}
        {currentPhase === 'create' && (
          <TheMindCreate
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isConnecting={isConnecting}
          />
        )}

        {/* Lobby */}
        {currentPhase === 'lobby' && roomCode && (
          <TheMindLobby
            roomCode={roomCode}
            players={players}
            isHost={isHost}
            mode={mode}
            onModeChange={setMode}
            onStartGame={handleStartGame}
          />
        )}

        {/* Playing / Conflict / Shuriken-vote */}
        {(currentPhase === 'playing' || currentPhase === 'conflict' || currentPhase === 'shuriken-vote') && (
          <>
            <TheMindPlay
              state={state}
              myHand={myHand}
              playerId={playerId}
              onPlayCard={playCard}
              onRequestShuriken={requestShuriken}
            />

            {/* Shuriken vote modal */}
            {currentPhase === 'shuriken-vote' && state.shurikenVote && (
              <ShurikenModal
                proposerName={state.players.find(p => p.id === state.shurikenVote!.proposerId)?.name || 'Un giocatore'}
                players={state.players}
                votes={state.shurikenVote.votes}
                myPlayerId={playerId}
                onVote={voteShuriken}
              />
            )}

            {/* Conflict overlay */}
            {currentPhase === 'conflict' && state.conflict && (
              <>
                <div className="mind-conflict-flash" />
                <div className="mind-shuriken-modal">
                  <div className="mind-shuriken-content">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
                    <h2 style={{ color: 'var(--accent-rose-light)', marginBottom: '0.5rem' }}>Conflitto!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {state.players.find(p => p.id === state.conflict!.playerId)?.name || 'Qualcuno'} ha giocato <strong>{state.conflict.playedCard.value}</strong>,
                      ma c'erano carte più basse:
                    </p>
                    <div className="mind-conflict-cards">
                      {state.conflict.lowerCards.map((lc, i) => (
                        <div key={i} className={`mind-card ${lc.card.deck}`} style={{ width: '60px', height: '90px', fontSize: '1.4rem', cursor: 'default' }}>
                          {lc.card.value}
                        </div>
                      ))}
                    </div>
                    <p style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                      ❤️ Vite rimaste: {state.lives}
                    </p>
                    {isHost && (
                      <button className="btn btn-primary mt-md" onClick={resumeAfterConflict}>
                        Continua
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Level complete */}
        {currentPhase === 'level-complete' && (
          <TheMindLevelComplete
            level={state.level}
            totalLevels={state.totalLevels}
            rewardLife={levelConfig?.rewardLife ?? false}
            rewardStar={levelConfig?.rewardStar ?? false}
            isHost={isHost}
            onNextLevel={requestNextLevel}
          />
        )}

        {/* Game over */}
        {currentPhase === 'game-over' && (
          <TheMindResult
            won={state.won}
            level={state.level}
            totalLevels={state.totalLevels}
            mode={state.mode}
            isHost={isHost}
            onNewGame={newGame}
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
