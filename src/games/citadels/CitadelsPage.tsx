// Citadels — Phase Router Page

import React, { useState } from 'react';
import { useCitadelsRoom } from './hooks/useCitadelsRoom';
import { useCitadelsGame } from './hooks/useCitadelsGame';
import { getDistrictById } from './districts';
import CitadelsCreate from './components/CitadelsCreate';
import CitadelsLobby from './components/CitadelsLobby';
import CitadelsDraft from './components/CitadelsDraft';
import CitadelsBoard from './components/CitadelsBoard';
import CitadelsTurn from './components/CitadelsTurn';
import CitadelsEffect from './components/CitadelsEffect';
import CitadelsScoring from './components/CitadelsScoring';
import CitadelsCharacterRef from './components/CitadelsCharacterRef';
import CitadelsCity from './components/CitadelsCity';
import { useNavigate } from 'react-router-dom';

export default function CitadelsPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);

  const room = useCitadelsRoom();
  const game = useCitadelsGame({
    playerId: room.playerId,
    isHost: room.isHost,
    players: room.players,
    broadcast: room.broadcast,
    onBroadcast: room.onBroadcast,
  });

  const [showCharRef, setShowCharRef] = useState(false);
  const [viewCityPlayerId, setViewCityPlayerId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showEffect, setShowEffect] = useState(false);

  const { state, myPlayer } = game;
  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  const handleCreate = async (name: string) => {
    setIsConnecting(true); await room.createRoom(name); setIsConnecting(false); setLocalPhase('lobby');
  };
  const handleJoin = async (code: string, name: string): Promise<boolean> => {
    setIsConnecting(true); const ok = await room.joinRoom(code, name); setIsConnecting(false);
    if (ok) setLocalPhase('lobby'); return ok;
  };

  // Create / Join
  if (currentPhase === 'create') {
    return (
      <CitadelsCreate
        onCreateRoom={handleCreate}
        onJoinRoom={handleJoin}
        isConnecting={isConnecting}
      />
    );
  }

  // Lobby
  if (currentPhase === 'lobby') {
    return (
      <CitadelsLobby
        roomCode={room.roomCode!}
        players={room.players}
        isHost={room.isHost}
        onStartGame={game.startGame}
      />
    );
  }

  const viewCityPlayer = viewCityPlayerId ? state.players.find(p => p.id === viewCityPlayerId) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1520 0%, #0d0a12 100%)',
      color: '#fff',
      position: 'relative',
    }}>
      {/* Draft phase */}
      {currentPhase === 'draft' && (
        <CitadelsDraft
          state={state}
          playerId={room.playerId}
          onPickCharacter={game.pickCharacter}
        />
      )}

      {/* Main game: turn-call / turn-action / effect-active */}
      {(currentPhase === 'turn-call' || currentPhase === 'turn-action' || currentPhase === 'effect-active') && (
        <>
          <CitadelsBoard
            state={state}
            playerId={room.playerId}
            onOpenRules={() => setShowRules(true)}
            onOpenCharacterRef={() => setShowCharRef(true)}
            onViewCity={(pId) => setViewCityPlayerId(pId)}
          />

          {/* Host calls next rank */}
          {currentPhase === 'turn-call' && room.isHost && !state.activePlayerId && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <button onClick={game.callNextRank} style={{
                padding: '0.8rem 2rem', fontSize: '1.1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
                color: '#1a1200', border: 'none', borderRadius: '12px', cursor: 'pointer',
              }}>
                📢 Chiama Prossimo Rango
              </button>
            </div>
          )}

          {/* Active player turn UI */}
          {(currentPhase === 'turn-action') && myPlayer && game.isMyTurn && (
            <CitadelsTurn
              state={state}
              myPlayer={myPlayer}
              isMyTurn={game.isMyTurn}
              onGatherGold={game.gatherGold}
              onGatherCards={game.gatherCards}
              onPickDrawnCard={game.pickDrawnCard}
              onBuildDistrict={game.buildDistrict}
              onEndTurn={game.endTurn}
              onCollectIncome={game.collectIncome}
              onTakeCrown={game.takeCrown}
              onUseEffect={() => setShowEffect(true)}
              onUseFucina={game.useFucina}
              onUseLaboratorio={game.useLaboratorio}
              onMuseoTuck={game.museoTuck}
            />
          )}

          {/* Effect modal */}
          {showEffect && myPlayer && (
            <CitadelsEffect
              state={state}
              myPlayer={myPlayer}
              onAssassinTarget={(r) => { game.assassinTarget(r); setShowEffect(false); }}
              onThiefTarget={(r) => { game.thiefTarget(r); setShowEffect(false); }}
              onWizardSwap={(id) => { game.wizardSwap(id); setShowEffect(false); }}
              onWizardDiscard={(uids) => { game.wizardDiscard(uids); setShowEffect(false); }}
              onEmperorGiveCrown={(id, t) => { game.emperorGiveCrown(id, t); setShowEffect(false); }}
              onWarlordDestroy={(id, uid) => { game.warlordDestroy(id, uid); setShowEffect(false); }}
              onMarshalSeize={(id, uid) => { game.marshalSeize(id, uid); setShowEffect(false); }}
              onDiplomatSwap={(a, b, c) => { game.diplomatSwap(a, b, c); setShowEffect(false); }}
              onBlackmailerDecide={(pay) => { game.blackmailerDecide(pay); setShowEffect(false); }}
              onSpyReveal={(id, c) => { game.spyReveal(id, c); setShowEffect(false); }}
              onNavigatorChoose={(c) => { game.navigatorChoose(c); setShowEffect(false); }}
              onArtistEmbellish={(uids) => { game.artistEmbellish(uids); setShowEffect(false); }}
              onClose={() => setShowEffect(false)}
            />
          )}

          {/* Blackmailer decision (forced, not voluntary) */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'blackmailer-decide' && myPlayer && state.effectContext.data.targetId === myPlayer.id && (
            <CitadelsEffect
              state={state}
              myPlayer={myPlayer}
              onAssassinTarget={() => {}}
              onThiefTarget={() => {}}
              onWizardSwap={() => {}}
              onWizardDiscard={() => {}}
              onEmperorGiveCrown={() => {}}
              onWarlordDestroy={() => {}}
              onMarshalSeize={() => {}}
              onDiplomatSwap={() => {}}
              onBlackmailerDecide={game.blackmailerDecide}
              onSpyReveal={() => {}}
              onNavigatorChoose={() => {}}
              onArtistEmbellish={() => {}}
              onClose={() => {}}
            />
          )}

          {/* Pick drawn card */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'pick-card-from-drawn' && state.drawnCards && myPlayer && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}>
              <h3 style={{ color: '#c9a84c', marginBottom: '1rem' }}>Scegli una carta da tenere</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {state.drawnCards.map(card => {
                  const d = getDistrictById(card.districtId);
                  return (
                    <div key={card.uid} onClick={() => game.pickDrawnCard(card.uid)} style={{
                      cursor: 'pointer', borderRadius: '8px', overflow: 'hidden',
                      border: '2px solid rgba(201,168,76,0.4)', width: '100px',
                      transition: 'all 0.15s',
                    }}>
                      <img src={d?.image || ''} alt={d?.nameIt || ''} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.3rem', textAlign: 'center', background: 'rgba(26,21,32,0.9)', fontSize: '0.7rem' }}>
                        <div style={{ fontWeight: 700, color: '#c9a84c' }}>{d?.nameIt}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)' }}>💰 {d?.cost}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Game Over */}
      {currentPhase === 'game-over' && (
        <CitadelsScoring
          state={state}
          isHost={room.isHost}
          onRematch={game.rematch}
          onGoHome={() => { room.disconnect(); navigate('/'); }}
        />
      )}

      {/* Character reference modal */}
      <CitadelsCharacterRef
        characterPool={state.characterPool}
        isOpen={showCharRef}
        onClose={() => setShowCharRef(false)}
      />

      {/* City view modal */}
      {viewCityPlayer && (
        <CitadelsCity
          player={viewCityPlayer}
          isOpen={true}
          onClose={() => setViewCityPlayerId(null)}
        />
      )}
    </div>
  );
}
