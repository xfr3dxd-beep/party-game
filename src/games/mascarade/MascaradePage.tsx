import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMascaradeRoom } from './hooks/useMascaradeRoom';
import { useMascaradeGame } from './hooks/useMascaradeGame';
import MascaradeCreate from './components/MascaradeCreate';
import MascaradeLobby from './components/MascaradeLobby';
import MascaradeViewCard from './components/MascaradeViewCard';
import MascaradeIntro from './components/MascaradeIntro';
import MascaradePlay from './components/MascaradePlay';
import MascaradeSwap from './components/MascaradeSwap';
import MascaradeChallenge from './components/MascaradeChallenge';
import MascaradeReveal from './components/MascaradeReveal';
import MascaradeEffect from './components/MascaradeEffect';
import MascaradeRoles from './components/MascaradeRoles';
import MascaradeResult from './components/MascaradeResult';
import { getRoleById } from './roles';

export default function MascaradePage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);

  const {
    roomCode, playerId, players, isHost, isConnected,
    createRoom, joinRoom, broadcast, onBroadcast, disconnect,
  } = useMascaradeRoom();

  const game = useMascaradeGame({ playerId, isHost, roomCode, players, broadcast, onBroadcast });
  const { state, myPlayer, activePlayer, isMyTurn, isForcedSwap } = game;

  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  const handleCreate = async (name: string) => {
    setIsConnecting(true); await createRoom(name); setIsConnecting(false); setLocalPhase('lobby');
  };
  const handleJoin = async (code: string, name: string): Promise<boolean> => {
    setIsConnecting(true); const ok = await joinRoom(code, name); setIsConnecting(false);
    if (ok) setLocalPhase('lobby'); return ok;
  };

  const effectPhases = [
    'effect-resolution', 'effect-spy', 'effect-guru', 'effect-folle',
    'effect-marionettista', 'effect-imbroglione', 'effect-principessa', 'effect-sciamana', 'effect-mendicante',
  ];

  return (
    <Layout>
      <div className="container container-md">
        {(currentPhase === 'create' || currentPhase === 'lobby') && (
          <button className="btn btn-secondary mb-lg" onClick={() => { disconnect(); navigate('/'); }}>
            <ArrowLeft size={16} /> Torna ai Giochi
          </button>
        )}

        {currentPhase === 'create' && (
          <MascaradeCreate onCreateRoom={handleCreate} onJoinRoom={handleJoin} isConnecting={isConnecting} />
        )}

        {currentPhase === 'lobby' && roomCode && (
          <MascaradeLobby roomCode={roomCode} players={players} isHost={isHost} onStartGame={game.startGame} />
        )}

        {currentPhase === 'view-card' && myPlayer && (
          <MascaradeViewCard state={state} myPlayer={myPlayer} onViewed={game.viewedCard} />
        )}

        {currentPhase === 'introductions' && myPlayer && (
          <MascaradeIntro state={state} myPlayer={myPlayer} onIntroDone={game.introDone} />
        )}

        {currentPhase === 'play' && myPlayer && (
          <MascaradePlay
            state={state} myPlayer={myPlayer} isMyTurn={isMyTurn} isForcedSwap={isForcedSwap}
            activePlayer={activePlayer} rolesSheetOpen={rolesOpen}
            onOpenRoles={() => setRolesOpen(true)}
            onActionLook={game.actionLook}
            onActionSwap={game.actionSwap}
            onActionDeclare={game.actionDeclare}
          />
        )}

        {(currentPhase === 'swap-choice') && myPlayer && (
          <MascaradeSwap state={state} myPlayer={myPlayer} onDecide={game.swapDecide} />
        )}

        {currentPhase === 'look-card' && myPlayer && (() => {
          const isViewer = activePlayer?.id === myPlayer.id;
          const myRole = isViewer ? getRoleById(myPlayer.roleId) : null;
          return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <h2 style={{ color: '#d4a843', marginBottom: '0.5rem' }}>👁️ Guarda la tua carta</h2>
              {isViewer && myRole ? (
                <>
                  <img src={myRole.image} alt={myRole.name} style={{ width: '140px', borderRadius: '10px', marginBottom: '0.8rem', boxShadow: '0 0 20px rgba(212,168,67,0.4)' }} />
                  <p style={{ color: '#d4a843', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.3rem' }}>{myRole.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '300px' }}>{myRole.description}</p>
                  <button onClick={game.lookDone} style={{
                    padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, color: '#fff',
                    background: '#d4a843', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  }}>OK, ho visto ✓</button>
                </>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                  {activePlayer?.name} sta guardando la sua carta...
                </p>
              )}
            </div>
          );
        })()}

        {currentPhase === 'challenge-vote' && myPlayer && (
          <MascaradeChallenge state={state} myPlayer={myPlayer} onVote={game.challengeVote} />
        )}

        {currentPhase === 'reveal-cards' && (
          <MascaradeReveal state={state} isHost={isHost} onResolve={game.resolveReveal} />
        )}

        {effectPhases.includes(currentPhase) && myPlayer && (
          <MascaradeEffect
            state={state} myPlayer={myPlayer} isHost={isHost}
            onImbroglione={game.effectImbroglione}
            onSpyTarget={game.effectSpyTarget}
            onSpyDecide={game.effectSpyDecide}
            onGuruTarget={game.effectGuruTarget}
            onGuruGuess={game.effectGuruGuess}
            onGuruDone={game.effectGuruDone}
            onSciamana={game.effectSciamana}
            onFolle={game.effectFolle}
            onMarionettista={game.effectMarionettista}
            onPrincipessa={game.effectPrincipessa}
            onPrincipessaDone={game.effectPrincipessaDone}
          />
        )}

        {currentPhase === 'game-over' && (
          <MascaradeResult state={state} isHost={isHost} onRematch={game.rematch} onGoHome={() => { disconnect(); navigate('/'); }} />
        )}

        {/* Roles reference sheet - always accessible */}
        <MascaradeRoles rolesInGame={state.rolesInGame} isOpen={rolesOpen} onClose={() => setRolesOpen(false)} />
      </div>
    </Layout>
  );
}
