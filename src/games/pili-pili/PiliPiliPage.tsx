import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePiliPiliRoom } from './hooks/usePiliPiliRoom';
import { usePiliPiliGame } from './hooks/usePiliPiliGame';
import PiliPiliCreate from './components/PiliPiliCreate';
import PiliPiliLobby from './components/PiliPiliLobby';
import PiliPiliMission from './components/PiliPiliMission';
import PiliPiliBet from './components/PiliPiliBet';
import PiliPiliPlay from './components/PiliPiliPlay';
import PiliPiliRoundResult from './components/PiliPiliRoundResult';
import PiliPiliResult from './components/PiliPiliResult';

export default function PiliPiliPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
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
  } = usePiliPiliRoom();

  const {
    state,
    myPlayer,
    myHand,
    startGame,
    playCard,
    placeBet,
    nextRound,
    newGame,
  } = usePiliPiliGame({
    playerId,
    isHost,
    players,
    broadcast,
    onBroadcast,
  });

  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  const handleCreateRoom = async (pName: string) => {
    setIsConnecting(true);
    await createRoom(pName);
    setIsConnecting(false);
    setLocalPhase('lobby');
  };

  const handleJoinRoom = async (code: string, pName: string): Promise<boolean> => {
    setIsConnecting(true);
    const success = await joinRoom(code, pName);
    setIsConnecting(false);
    if (success) setLocalPhase('lobby');
    return success;
  };

  return (
    <Layout>
      <div className="container container-md">
        {(currentPhase === 'create' || currentPhase === 'lobby') && (
          <button
            className="btn btn-secondary mb-lg pili-back-btn"
            onClick={() => {
              disconnect();
              navigate('/');
            }}
          >
            <ArrowLeft size={16} />
            Torna ai Giochi
          </button>
        )}

        {currentPhase === 'create' && (
          <PiliPiliCreate
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isConnecting={isConnecting}
          />
        )}

        {currentPhase === 'lobby' && roomCode && (
          <PiliPiliLobby
            roomCode={roomCode}
            players={players}
            isHost={isHost}
            onStartGame={startGame}
          />
        )}

        {currentPhase === 'mission' && (
          <PiliPiliMission mission={state.currentMission} />
        )}

        {currentPhase === 'betting' && (
          <PiliPiliBet
            state={state}
            myPlayer={myPlayer!}
            onBet={placeBet}
          />
        )}

        {currentPhase === 'play' && (
          <PiliPiliPlay
            state={state}
            myPlayer={myPlayer!}
            onPlayCard={playCard}
          />
        )}

        {currentPhase === 'round-result' && (
          <PiliPiliRoundResult
            state={state}
            isHost={isHost}
            onNextRound={nextRound}
          />
        )}

        {currentPhase === 'game-over' && (
          <PiliPiliResult
            state={state}
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
