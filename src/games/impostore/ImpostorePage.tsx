import React from 'react';
import Layout from '../../components/Layout';
import { useGameState } from './hooks/useGameState';
import LobbySetup from './components/LobbySetup';
import CardTable from './components/CardTable';
import ReviewPhase from './components/ReviewPhase';
import TurnOrder from './components/TurnOrder';
import DiscussionPhase from './components/DiscussionPhase';
import VotingPhase from './components/VotingPhase';
import MrWhiteGuess from './components/MrWhiteGuess';
import RoundResult from './components/RoundResult';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const phaseLabels: Record<string, string> = {
  lobby: 'Lobby',
  card_picking: 'Carte',
  review: 'Rivedi',
  turn_order: 'Ordine',
  discussion: 'Discussione',
  voting: 'Votazione',
  mr_white_guess: 'Mr. White',
  round_result: 'Risultato',
  game_over: 'Fine',
};

const phaseOrder = ['lobby', 'card_picking', 'review', 'turn_order', 'discussion', 'voting', 'game_over'];

export default function ImpostorePage() {
  const navigate = useNavigate();
  const {
    state,
    startGame,
    pickCard,
    showTurnOrder,
    startDiscussion,
    startVoting,
    eliminatePlayer,
    submitMrWhiteGuess,
    continueAfterResult,
    newGame,
    nextRound,
    getPlayerWord,
  } = useGameState();

  const currentPhaseIndex = phaseOrder.indexOf(state.phase);

  const renderPhase = () => {
    switch (state.phase) {
      case 'lobby':
        return <LobbySetup onStartGame={startGame} />;

      case 'card_picking':
        return (
          <CardTable
            players={state.players}
            currentPickIndex={state.currentPickIndex}
            onPickCard={pickCard}
            getPlayerWord={getPlayerWord}
          />
        );

      case 'review':
        return (
          <ReviewPhase
            players={state.players}
            getPlayerWord={getPlayerWord}
            onContinue={showTurnOrder}
          />
        );

      case 'turn_order':
        return (
          <TurnOrder
            players={state.players}
            turnOrder={state.turnOrder}
            onContinue={startDiscussion}
          />
        );

      case 'discussion':
        return (
          <DiscussionPhase
            players={state.players}
            turnOrder={state.turnOrder}
            currentRound={state.currentRound}
            getPlayerWord={getPlayerWord}
            onStartVoting={startVoting}
          />
        );

      case 'voting':
        return (
          <VotingPhase
            players={state.players}
            onEliminate={eliminatePlayer}
          />
        );

      case 'mr_white_guess': {
        const mrWhitePlayer = state.players.find(p => p.id === state.votedPlayerId);
        return (
          <MrWhiteGuess
            playerName={mrWhitePlayer?.name ?? 'Mr. White'}
            onSubmitGuess={submitMrWhiteGuess}
          />
        );
      }

      case 'round_result':
        return (
          <RoundResult
            result={state.gameResult}
            players={state.players}
            eliminatedPlayerId={state.votedPlayerId}
            isGameOver={false}
            onContinue={continueAfterResult}
            onNewGame={newGame}
            onNextRound={nextRound}
          />
        );

      case 'game_over':
        return (
          <RoundResult
            result={state.gameResult}
            players={state.players}
            eliminatedPlayerId={state.votedPlayerId}
            isGameOver={true}
            onContinue={continueAfterResult}
            onNewGame={newGame}
            onNextRound={nextRound}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container container-md">
        {/* Back button */}
        {state.phase === 'lobby' && (
          <button
            className="btn btn-secondary mb-lg"
            onClick={() => navigate('/')}
            id="back-to-home"
          >
            <ArrowLeft size={16} />
            Torna ai Giochi
          </button>
        )}

        {/* Phase Indicator */}
        {state.phase !== 'lobby' && (
          <div className="phase-indicator">
            {phaseOrder.filter(p => p !== 'lobby').map((phase, index) => {
              const phaseIdx = phaseOrder.indexOf(phase);
              const isActive = state.phase === phase ||
                (phase === 'game_over' && ['mr_white_guess', 'round_result', 'game_over'].includes(state.phase));
              const isCompleted = currentPhaseIndex > phaseIdx;

              return (
                <React.Fragment key={phase}>
                  {index > 0 && <div className="phase-connector" />}
                  <div className={`phase-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    {isCompleted ? '✓' : ''} {phaseLabels[phase] || phase}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {renderPhase()}
      </div>
    </Layout>
  );
}
