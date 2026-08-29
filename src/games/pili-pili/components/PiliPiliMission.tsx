import React from 'react';
import { Mission } from '../types';

interface PiliPiliMissionProps {
  mission: Mission | null;
}

export default function PiliPiliMission({ mission }: PiliPiliMissionProps) {
  if (!mission) return null;

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="mb-lg" style={{ color: '#ea580c' }}>Nuova Missione!</h2>
      
      <div className="pili-mission-card p-xl text-center" style={{ 
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
        border: '2px solid #ea580c',
        borderRadius: '16px',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(234, 88, 12, 0.3)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{mission.name}</h3>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.5' }}>
          {mission.description}
        </p>
        
        <div className="mt-xl text-muted">
          <em>Preparatevi a scommettere...</em>
        </div>
      </div>
    </div>
  );
}
