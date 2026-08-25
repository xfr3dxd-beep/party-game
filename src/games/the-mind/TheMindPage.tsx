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
    chooseShurikenDeck,
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

        {/* Playing / Conflict / Shuriken-vote / Shuriken-choose */}
        {(currentPhase === 'playing' || currentPhase === 'conflict' || currentPhase === 'shuriken-vote' || currentPhase === 'shuriken-choose') && (
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

            {/* Shuriken choose modal (Extreme only) */}
            {currentPhase === 'shuriken-choose' && state.shurikenVote && (() => {
              const choices = state.shurikenVote.choices || {};
              const hasChosen = choices[playerId] !== undefined;
              const myWhiteCards = myHand.filter(c => c.deck === 'white');
              const myRedCards = myHand.filter(c => c.deck === 'red');
              const lowestWhite = myWhiteCards.length > 0 ? myWhiteCards[0].value : null;
              const highestRed = myRedCards.length > 0 ? myRedCards[0].value : null;

              return (
                <div className="mind-shuriken-modal">
                  <div className="mind-shuriken-content">
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Scegli quale carta scartare</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      Scarta la carta blu più bassa oppure la carta rossa più alta.
                    </p>

                    {!hasChosen ? (
                      <div className="mind-shuriken-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                        {lowestWhite !== null && (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => chooseShurikenDeck('white')}
                          >
                            ⬆ Scarta Blu più bassa ({lowestWhite})
                          </button>
                        )}
                        {highestRed !== null && (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', background: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' }}
                            onClick={() => chooseShurikenDeck('red')}
                          >
                            ⬇ Scarta Rossa più alta ({highestRed})
                          </button>
                        )}
                        {lowestWhite === null && highestRed === null && (
                          <p style={{ color: 'var(--text-muted)' }}>Non hai carte da scartare.</p>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--accent-green-light)' }}>
                        Hai scelto ✓ — In attesa degli altri...
                      </p>
                    )}

                    {/* Show who has chosen */}
                    <div style={{ marginTop: '1rem' }}>
                      {state.players.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <span>{p.name}</span>
                          <span>{choices[p.id] ? '✓' : '...'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

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
                      ma c'erano carte {state.conflict.playedCard.deck === 'white' ? 'più basse' : 'più alte'}:
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
