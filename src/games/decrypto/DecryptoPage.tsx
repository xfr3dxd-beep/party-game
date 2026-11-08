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
import DecryptoRoundResult from './components/DecryptoRoundResult';
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

  const { state, act } = useDecryptoGame({
    playerId, isHost, roomCode, players, broadcast, onBroadcast,
  });

  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;
  const myTeam = state.players.find(p => p.id === playerId)?.team || null;

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

  // Sync room players into game state when in lobby
  const gamePlayers = state.players.length > 0 ? state.players : players.map(p => ({
    id: p.id, name: p.name, team: null as DecryptoTeam | null,
  }));

  const showBanner = !!roomCode && currentPhase !== 'create' && currentPhase !== 'lobby';

  // Determine if we need the game board wrapper
  const inGame = ['clue-giving', 'guessing', 'round-result'].includes(currentPhase);

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
            playerId={playerId}
            isHost={isHost}
            onJoinTeam={(team) => act('join-team', { playerId, team })}
            onStartGame={() => act('start-game')}
          />
        )}

        {/* CHOOSE STARTER */}
        {currentPhase === 'choose-starter' && (
          <DecryptoChooseStarter
            isHost={isHost}
            onChoose={(team) => act('choose-starter', { team })}
          />
        )}

        {/* IN-GAME PHASES (wrapped in game board) */}
        {inGame && myTeam && (
          <DecryptoGameBoard state={state} myTeam={myTeam}>
            {/* Clue giving */}
            {currentPhase === 'clue-giving' && (
              <DecryptoClueGiving
                state={state}
                playerId={playerId}
                onSubmitClues={(clues) => act('submit-clues', { clues })}
              />
            )}

            {/* Guessing */}
            {currentPhase === 'guessing' && (
              <DecryptoGuessing
                state={state}
                playerId={playerId}
                onSubmitTeamGuess={(guess) => act('submit-team-guess', { guess })}
                onSubmitOpponentGuess={(guess) => act('submit-opponent-guess', { guess })}
              />
            )}

            {/* Round result */}
            {currentPhase === 'round-result' && (
              <DecryptoRoundResult
                state={state}
                isHost={isHost}
                onNextRound={() => act('next-round')}
              />
            )}
          </DecryptoGameBoard>
        )}

        {/* FINAL GUESS & GAME OVER */}
        {(currentPhase === 'final-guess' || currentPhase === 'game-over') && (
          <DecryptoResult
            state={state}
            playerId={playerId}
            isHost={isHost}
            onFinalGuess={(words) => act('final-guess', { words })}
            onSkipFinalGuess={() => act('skip-final-guess')}
            onNewGame={() => act('new-game')}
            onGoHome={() => { disconnect(); navigate('/'); }}
          />
        )}
      </div>
    </Layout>
  );
}
