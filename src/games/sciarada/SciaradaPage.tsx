import React from 'react';
import Layout from '../../components/Layout';
import { useSciaradaState } from './hooks/useSciaradaState';
import SciaradaLobby from './components/SciaradaLobby';
import SciaradaPlay from './components/SciaradaPlay';
import TeamTransition from './components/TeamTransition';
import SciaradaResult from './components/SciaradaResult';
import { ArrowLeft, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SciaradaPage() {
  const navigate = useNavigate();
  const {
    state,
    startGame,
    startPlaying,
    markCorrect,
    skipSentence,
    nextTeam,
    nextRound,
    newGame,
  } = useSciaradaState();

  const renderPhase = () => {
    switch (state.phase) {
      case 'lobby':
        return <SciaradaLobby onStartGame={startGame} />;

      case 'ready': {
        const currentTeam = state.teams[state.currentTeamIndex];
        return (
          <div className="sciarada-transition animate-fade-in">
            <div className="round-result-icon">🎭</div>
            <h2 className="round-result-title" style={{ color: 'var(--accent-cyan-light)' }}>
              Preparati!
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              marginBottom: 'var(--space-xl)',
            }}>
              Tocca alla squadra{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{currentTeam.name}</strong>
            </p>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginBottom: 'var(--space-xl)',
            }}>
              Round {state.roundNumber} • {state.config.timerSeconds} secondi
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={startPlaying}
              id="start-turn-button"
            >
              <Play size={18} />
              Inizia!
            </button>
          </div>
        );
      }

      case 'playing': {
        const currentTeam = state.teams[state.currentTeamIndex];
        return (
          <SciaradaPlay
            teamName={currentTeam.name}
            sentence={state.currentSentence}
            timeRemaining={state.timeRemaining}
            timerTotal={state.config.timerSeconds}
            onCorrect={markCorrect}
            onSkip={skipSentence}
          />
        );
      }

      case 'time_up': {
        const finishedTeam = state.teams[state.currentTeamIndex];
        const nextTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
        const allPlayed = state.teamsPlayedThisRound + 1 >= state.teams.length;
        const nextTeamObj = allPlayed ? null : state.teams[nextTeamIndex];

        return (
          <TeamTransition
            finishedTeam={finishedTeam}
            nextTeam={nextTeamObj}
            onContinue={nextTeam}
          />
        );
      }

      case 'round_summary':
        return (
          <SciaradaResult
            teams={state.teams}
            roundNumber={state.roundNumber}
            onNextRound={nextRound}
            onNewGame={newGame}
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

        {renderPhase()}
      </div>
    </Layout>
  );
}
