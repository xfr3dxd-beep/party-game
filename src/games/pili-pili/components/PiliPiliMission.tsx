import React from 'react';
import { Mission } from '../types';

interface PiliPiliMissionProps {
  mission: Mission | null;
  isHost: boolean;
  onProceed: () => void;
}

export default function PiliPiliMission({ mission, isHost, onProceed }: PiliPiliMissionProps) {
  if (!mission) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '1rem' }}>
      <h2 style={{ color: '#ea580c', marginBottom: '1rem', fontSize: '1.6rem' }}>🎴 Missione #{mission.id}</h2>

      {/* Mission card image */}
      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(234, 88, 12, 0.4), 0 0 60px rgba(234, 88, 12, 0.15)',
        maxWidth: '320px',
        width: '100%',
        marginBottom: '1.5rem',
        border: '2px solid rgba(234, 88, 12, 0.5)',
      }}>
        <img
          src={mission.image}
          alt={mission.name}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Mission name and description */}
      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>{mission.name}</h3>
      <p style={{
        fontSize: '1rem',
        lineHeight: 1.5,
        textAlign: 'center',
        maxWidth: '400px',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
      }}>
        {mission.description}
      </p>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        🃏 {mission.cardsPerPlayer} carte a testa
      </div>

      {/* Proceed button */}
      {isHost ? (
        <button
          onClick={onProceed}
          style={{
            padding: '0.8rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.3)',
          }}
        >
          Inizia Scommesse →
        </button>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          <em>In attesa dell'host...</em>
        </div>
      )}
    </div>
  );
}
