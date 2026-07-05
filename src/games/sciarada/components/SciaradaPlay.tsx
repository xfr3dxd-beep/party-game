import React from 'react';
import { Check, SkipForward } from 'lucide-react';

interface SciaradaPlayProps {
  teamName: string;
  sentence: string;
  timeRemaining: number;
  timerTotal: number;
  onCorrect: () => void;
  onSkip: () => void;
}

export default function SciaradaPlay({
  teamName,
  sentence,
  timeRemaining,
  timerTotal,
  onCorrect,
  onSkip,
}: SciaradaPlayProps) {
  const progress = (timeRemaining / timerTotal) * 100;
  const isLow = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div className="sciarada-play animate-fade-in">
      {/* Team Name */}
      <div className="sciarada-team-banner">
        <span className="sciarada-team-label">Turno di</span>
        <span className="sciarada-team-name">{teamName}</span>
      </div>

      {/* Sentence */}
      <div className="sciarada-sentence-card">
        <p className="sciarada-sentence">{sentence}</p>
      </div>

      {/* Action Buttons */}
      <div className="sciarada-actions">
        <button
          className="btn sciarada-btn-correct"
          onClick={onCorrect}
          id="correct-button"
        >
          <Check size={22} />
          Corretto!
        </button>
        <button
          className="btn sciarada-btn-skip"
          onClick={onSkip}
          id="skip-button"
        >
          <SkipForward size={22} />
          Salta
        </button>
      </div>

      {/* Timer Bar */}
      <div className="sciarada-timer-container">
        <div className="sciarada-timer-bar">
          <div
            className={`sciarada-timer-fill ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`sciarada-timer-text ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}>
          {timeRemaining}s
        </span>
      </div>
    </div>
  );
}
