import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container">
        <div className="text-center animate-fade-in">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>
            <span className="text-gradient">Scegli il tuo gioco</span>
          </h1>
          <p className="text-muted mt-sm" style={{ fontSize: '1.1rem' }}>
            Seleziona un gioco e divertiti con i tuoi amici!
          </p>
        </div>

        <div className="game-grid">
          {/* Impostore Card */}
          <div
            className="game-card animate-slide-in"
            onClick={() => navigate('/impostore')}
            id="game-card-impostore"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="game-card-badge badge-live">Giocabile</span>
            <div className="game-card-icon impostore">
              🕵️
            </div>
            <h2 className="game-card-title">Impostore</h2>
            <p className="game-card-desc">
              Scopri chi è l'impostore! Parole segrete, ruoli nascosti e tanta strategia.
              Civili, Undercover e Mr. White si sfidano in una battaglia di astuzia.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '0.5rem',
            }}>
              <span className="card-role civile">Civile</span>
              <span className="card-role undercover">Undercover</span>
              <span className="card-role mr-white">Mr. White</span>
            </div>
          </div>

          {/* Sciarade Card */}
          <div
            className="game-card animate-slide-in"
            onClick={() => navigate('/sciarada')}
            id="game-card-sciarade"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="game-card-badge badge-live">Giocabile</span>
            <div className="game-card-icon sciarade">
              🎭
            </div>
            <h2 className="game-card-title">Sciarade</h2>
            <p className="game-card-desc">
              Il classico gioco delle sciarade in versione digitale!
              Mima le frasi italiane e sfida le altre squadre a tempo.
            </p>
          </div>

          {/* The Mind Card */}
          <div
            className="game-card animate-slide-in"
            onClick={() => navigate('/the-mind')}
            id="game-card-the-mind"
            style={{ animationDelay: '0.3s' }}
          >
            <span className="game-card-badge badge-live">Giocabile</span>
            <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3.5rem' }}>
              🧠
            </div>
            <h2 className="game-card-title">The Mind</h2>
            <p className="game-card-desc">
              Gioca le carte in ordine crescente senza parlare!
              Sincronizzati con il tuo team in tempo reale, ognuno dal proprio telefono.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '0.5rem',
            }}>
              <span className="mind-players-badge">👥 2-4 giocatori</span>
              <span className="mind-players-badge">📱 Multiplayer online</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '0.5rem',
            }}>
              <span className="card-role civile">Classic</span>
              <span className="card-role undercover">Extreme</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
