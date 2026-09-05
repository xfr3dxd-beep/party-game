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
import PiliPiliSwap from './components/PiliPiliSwap';
import PiliPiliPlay from './components/PiliPiliPlay';
import PiliPiliTrickResult from './components/PiliPiliTrickResult';
import PiliPiliSwapTrick from './components/PiliPiliSwapTrick';
import PiliPiliRoundResult from './components/PiliPiliRoundResult';
import PiliPiliResult from './components/PiliPiliResult';

export default function PiliPiliPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    roomCode, playerId, playerName, players, isHost, isConnected,
    createRoom, joinRoom, broadcast, onBroadcast, disconnect,
  } = usePiliPiliRoom();

  const {
    state, myPlayer, myHand,
    startGame, proceedToBetting, autoProceedTimed,
    playCard, placeBet, forceBets, dismissTrickResult,
    swapSelect, swapTrickTarget, swapTrickCard,
    nextRound, newGame,
  } = usePiliPiliGame({ playerId, isHost, players, broadcast, onBroadcast });

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
          <button className="btn btn-secondary mb-lg pili-back-btn" onClick={() => { disconnect(); navigate('/'); }}>
            <ArrowLeft size={16} /> Torna ai Giochi
          </button>
        )}

        {currentPhase === 'create' && (
          <PiliPiliCreate onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} isConnecting={isConnecting} />
        )}

        {currentPhase === 'lobby' && roomCode && (
          <PiliPiliLobby roomCode={roomCode} players={players} isHost={isHost} onStartGame={startGame} />
        )}

        {currentPhase === 'mission' && (
          <PiliPiliMission
            mission={state.currentMission}
            isHost={isHost}
            onProceed={proceedToBetting}
            onAutoProceedTimed={autoProceedTimed}
          />
        )}

        {currentPhase === 'betting' && myPlayer && (
          <PiliPiliBet state={state} myPlayer={myPlayer} onBet={placeBet} onForceBets={forceBets} />
        )}

        {currentPhase === 'swapping' && myPlayer && (
          <PiliPiliSwap state={state} myPlayer={myPlayer} onSwapSelect={swapSelect} />
        )}

        {currentPhase === 'play' && myPlayer && (
          <PiliPiliPlay state={state} myPlayer={myPlayer} onPlayCard={playCard} />
        )}

        {currentPhase === 'trick-result' && (
          <PiliPiliTrickResult state={state} isHost={isHost} onDismiss={dismissTrickResult} />
        )}

        {currentPhase === 'swap-after-trick' && myPlayer && (
          <PiliPiliSwapTrick state={state} myPlayer={myPlayer} onPickTarget={swapTrickTarget} onPickCard={swapTrickCard} />
        )}

        {currentPhase === 'round-result' && (
          <PiliPiliRoundResult state={state} isHost={isHost} onNextRound={nextRound} />
        )}

        {currentPhase === 'game-over' && (
          <PiliPiliResult state={state} isHost={isHost} onNewGame={newGame} onGoHome={() => { disconnect(); navigate('/'); }} />
        )}
      </div>
    </Layout>
  );
}
