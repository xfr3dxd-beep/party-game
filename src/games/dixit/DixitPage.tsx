import React, { useState } from 'react';
import Layout from '../../components/Layout';
import RoomCodeBanner from '../../components/RoomCodeBanner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDixitRoom } from './hooks/useDixitRoom';
import { useDixitGame } from './hooks/useDixitGame';
import DixitCreate from './components/DixitCreate';
import DixitLobby from './components/DixitLobby';
import DixitColorSelect from './components/DixitColorSelect';
import DixitNarratorPick from './components/DixitNarratorPick';
import DixitOthersPick from './components/DixitOthersPick';
import DixitVoting from './components/DixitVoting';
import DixitScoring from './components/DixitScoring';
import DixitScoreboard from './components/DixitScoreboard';
import DixitResult from './components/DixitResult';
import DixitCardZoom from './components/DixitCardZoom';

export default function DixitPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [zoomCardId, setZoomCardId] = useState<number | null>(null);

  const {
    roomCode, playerId, players, isHost, isConnected,
    createRoom, joinRoom, broadcast, onBroadcast, disconnect,
  } = useDixitRoom();

  const game = useDixitGame({ playerId, isHost, roomCode, players, broadcast, onBroadcast });
  const { state, myPlayer, narrator, isNarrator } = game;

  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  const handleCreate = async (name: string) => {
    setIsConnecting(true); await createRoom(name); setIsConnecting(false); setLocalPhase('lobby');
  };
  const handleJoin = async (code: string, name: string): Promise<boolean> => {
    setIsConnecting(true); const ok = await joinRoom(code, name); setIsConnecting(false);
    if (ok) setLocalPhase('lobby'); return ok;
  };

  // Show persistent scoreboard button during gameplay phases
  const showScoreboardBtn = ['narrator-pick', 'others-pick', 'voting', 'scoring', 'game-over'].includes(currentPhase);

  // Show lobby code banner during gameplay (not in create/lobby)
  const showBanner = roomCode && currentPhase !== 'create' && currentPhase !== 'lobby';

  return (
    <Layout>
      {showBanner && <RoomCodeBanner roomCode={roomCode!} />}
      <div className="container container-md" style={showBanner ? { paddingTop: '2.5rem' } : undefined}>
        {(currentPhase === 'create' || currentPhase === 'lobby') && (
          <button className="btn btn-secondary mb-lg" onClick={() => { disconnect(); navigate('/'); }}>
            <ArrowLeft size={16} /> Torna ai Giochi
          </button>
        )}

        {currentPhase === 'create' && (
          <DixitCreate onCreateRoom={handleCreate} onJoinRoom={handleJoin} isConnecting={isConnecting} />
        )}

        {currentPhase === 'lobby' && roomCode && (
          <DixitLobby roomCode={roomCode} players={players} isHost={isHost} onStartGame={game.startGame} />
        )}

        {currentPhase === 'color-select' && (
          <DixitColorSelect state={state} playerId={playerId} onSelectColor={game.selectColor} />
        )}

        {currentPhase === 'narrator-pick' && (
          <DixitNarratorPick state={state} playerId={playerId} onNarratorPick={game.narratorPick}
            onZoomCard={setZoomCardId} />
        )}

        {currentPhase === 'others-pick' && (
          <DixitOthersPick state={state} playerId={playerId} onPlayerPick={game.playerPick}
            onDiscardCards={game.discardCards} onZoomCard={setZoomCardId} />
        )}

        {currentPhase === 'voting' && (
          <DixitVoting state={state} playerId={playerId} onVote={game.vote}
            onOpenScoreboard={() => setScoreboardOpen(true)} onZoomCard={setZoomCardId} />
        )}

        {currentPhase === 'scoring' && (
          <DixitScoring state={state} playerId={playerId} isHost={isHost}
            onNextRound={game.nextRound} onOpenScoreboard={() => setScoreboardOpen(true)}
            onZoomCard={setZoomCardId} />
        )}

        {currentPhase === 'game-over' && (
          <DixitResult state={state} isHost={isHost}
            onRematch={game.rematch} onGoHome={() => { disconnect(); navigate('/'); }} />
        )}

        {/* Persistent scoreboard floating button — always visible during gameplay */}
        {showScoreboardBtn && (
          <button
            onClick={() => setScoreboardOpen(true)}
            style={{
              position: 'fixed', bottom: '20px', right: '20px', zIndex: 50,
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #c4b5fd, #7c3aed)',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.5)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', color: '#fff',
              transition: 'transform 0.2s ease',
            }}
            title="Punteggio Conigli"
          >
            🏆
          </button>
        )}

        {/* Card zoom overlay */}
        <DixitCardZoom cardId={zoomCardId} onClose={() => setZoomCardId(null)} />

        {/* Scoreboard overlay */}
        <DixitScoreboard state={state} isOpen={scoreboardOpen} onClose={() => setScoreboardOpen(false)} />
      </div>
    </Layout>
  );
}
