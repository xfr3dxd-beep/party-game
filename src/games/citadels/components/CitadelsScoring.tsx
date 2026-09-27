import React, { useState } from 'react';
import { CitadelsState, CitadelsPlayer, ScoreBreakdown } from '../types';
import { getCharacterById, CROWN_IMAGE } from '../characters';
import { getDistrictById } from '../districts';
import { calculateScore } from '../gameLogic';
import { Crown, Trophy, ChevronDown, ChevronUp, RotateCcw, Home, Sparkles, Building2, Palette, Award, Coins } from 'lucide-react';

export interface CitadelsScoringProps {
  state: CitadelsState;
  isHost: boolean;
  onRematch: () => void;
  onGoHome: () => void;
}

interface PlayerScoreEntry {
  player: CitadelsPlayer;
  score: {
    total: number;
    breakdown: ScoreBreakdown;
  };
}

export function CitadelsScoring({ state, isHost, onRematch, onGoHome }: CitadelsScoringProps) {
  // Compute scores for each player (using state.scores or fallback to calculateScore)
  const playersWithScores: PlayerScoreEntry[] = (state.players || []).map((player: CitadelsPlayer) => {
    const scoreData = state.scores?.[player.id] ?? calculateScore(player, state);
    return {
      player,
      score: scoreData,
    };
  });

  // Sort by total score descending; tiebreak by district costs then gold
  playersWithScores.sort((a: PlayerScoreEntry, b: PlayerScoreEntry) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    if (b.score.breakdown.districtCosts !== a.score.breakdown.districtCosts) {
      return b.score.breakdown.districtCosts - a.score.breakdown.districtCosts;
    }
    return b.player.gold - a.player.gold;
  });

  const winner: PlayerScoreEntry | undefined = playersWithScores[0];

  // Expanded breakdown toggle per player (winner open by default)
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => {
    if (winner) {
      return { [winner.player.id]: true };
    }
    return {};
  });

  const toggleExpand = (playerId: string) => {
    setExpandedMap(prev => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { label: '1°', color: '#c9a84c', bg: 'rgba(201, 168, 76, 0.25)', border: '#c9a84c' };
    if (index === 1) return { label: '2°', color: '#d1d5db', bg: 'rgba(209, 213, 219, 0.2)', border: '#9ca3af' };
    if (index === 2) return { label: '3°', color: '#d97706', bg: 'rgba(217, 119, 6, 0.2)', border: '#b45309' };
    return { label: `${index + 1}°`, color: 'rgba(255, 255, 255, 0.65)', bg: 'rgba(255, 255, 255, 0.05)', border: '#3d334a' };
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1520',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at top, #2b1f3a 0%, #1a1520 70%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Celebration Header & Winner Banner */}
        {winner && (
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              padding: '2rem 1.5rem',
              backgroundColor: 'rgba(35, 26, 45, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '2px solid #c9a84c',
              borderRadius: '20px',
              boxShadow: '0 0 35px rgba(201, 168, 76, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(201, 168, 76, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Sparkles size={24} color="#c9a84c" />
              <img
                src={CROWN_IMAGE}
                alt="Corona"
                style={{
                  width: '54px',
                  height: '54px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 10px rgba(201, 168, 76, 0.6))',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Sparkles size={24} color="#c9a84c" />
            </div>

            <div
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#c9a84c',
                fontWeight: 700,
                marginBottom: '0.3rem',
              }}
            >
              Vittoria Regale
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              {winner.player.name}
            </h1>

            <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'center', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: 'rgba(201, 168, 76, 0.2)',
                  border: '1px solid #c9a84c',
                  color: '#c9a84c',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '20px',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                }}
              >
                🏆 {winner.score.total} Punti
              </span>

              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Building2 size={16} color="#c9a84c" />
                {winner.player.builtDistricts.length} quartieri eretti
              </span>

              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Coins size={16} color="#c9a84c" />
                {winner.player.gold} oro residuo
              </span>
            </div>
          </div>
        )}

        {/* Leaderboard Section */}
        <div
          style={{
            backgroundColor: 'rgba(26, 21, 32, 0.9)',
            border: '1px solid #3d334a',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.1rem 1.4rem',
              borderBottom: '1px solid #3d334a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(201, 168, 76, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} color="#c9a84c" />
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#c9a84c',
                  letterSpacing: '0.5px',
                }}
              >
                Classifica Finale
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Tocca un giocatore per i dettagli
            </span>
          </div>

          {/* List of Players */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {playersWithScores.map(({ player, score }: PlayerScoreEntry, index: number) => {
              const badge = getRankBadge(index);
              const isExpanded = !!expandedMap[player.id];
              const isFirst = index === 0;

              return (
                <div
                  key={player.id}
                  style={{
                    borderBottom: index < playersWithScores.length - 1 ? '1px solid #2d2438' : 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {/* Player Summary Row */}
                  <div
                    onClick={() => toggleExpand(player.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(player.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'rgba(201, 168, 76, 0.05)' : 'transparent',
                    }}
                  >
                    {/* Rank Badge */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        flexShrink: 0,
                      }}
                    >
                      {badge.label}
                    </div>

                    {/* Player Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: isFirst ? '#c9a84c' : '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {player.name}
                        </span>

                        {player.hasCrown && (
                          <span
                            title="Custode della Corona"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(201, 168, 76, 0.15)',
                              border: '1px solid rgba(201, 168, 76, 0.4)',
                              borderRadius: '6px',
                              padding: '0.1rem 0.4rem',
                              color: '#c9a84c',
                            }}
                          >
                            👑 Corona
                          </span>
                        )}

                        {state.firstTo7PlayerId === player.id && (
                          <span
                            title="Primo a raggiungere 7 distretti"
                            style={{
                              fontSize: '0.7rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              borderRadius: '6px',
                              padding: '0.1rem 0.4rem',
                              color: '#60a5fa',
                            }}
                          >
                            ⭐ 7 Distretti
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.55)',
                          marginTop: '2px',
                          display: 'flex',
                          gap: '0.8rem',
                        }}
                      >
                        <span>{player.builtDistricts.length} quartieri</span>
                        <span>🪙 {player.gold} oro</span>
                        <span>🃏 {player.hand.length} carte</span>
                      </div>
                    </div>

                    {/* Total Score & Toggle Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '1.3rem',
                          color: isFirst ? '#c9a84c' : '#ffffff',
                        }}
                      >
                        {score.total}{' '}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
                          pt
                        </span>
                      </span>

                      <div
                        style={{
                          color: 'rgba(255, 255, 255, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Breakdown Drawer */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0.9rem 1.25rem 1.25rem 1.25rem',
                        backgroundColor: 'rgba(15, 12, 20, 0.75)',
                        borderTop: '1px dashed #3d334a',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: '#c9a84c',
                          fontWeight: 700,
                          marginBottom: '0.2rem',
                        }}
                      >
                        Dettaglio Punteggio
                      </div>

                      {/* District Costs */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          padding: '0.35rem 0',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={16} color="#c9a84c" />
                          <span>Costo Distretti</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>
                          {score.breakdown.districtCosts} pts
                        </span>
                      </div>

                      {/* Color Diversity (+3 pts if applicable) */}
                      {score.breakdown.colorDiversity > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            padding: '0.35rem 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Palette size={16} color="#4ade80" />
                            <span>Diversità Colori (5 colori diversi)</span>
                          </div>
                          <span style={{ fontWeight: 700, color: '#4ade80' }}>
                            +{score.breakdown.colorDiversity} pts
                          </span>
                        </div>
                      )}

                      {/* First to 7 Districts (+4 or +2) */}
                      {score.breakdown.firstTo7Bonus > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            padding: '0.35rem 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={16} color="#60a5fa" />
                            <span>
                              {score.breakdown.firstTo7Bonus === 4
                                ? 'Primo a 7 Distretti'
                                : 'Completamento 7 Distretti'}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: '#60a5fa' }}>
                            +{score.breakdown.firstTo7Bonus} pts
                          </span>
                        </div>
                      )}

                      {/* Viola Bonuses listed individually */}
                      {score.breakdown.violaBonuses && score.breakdown.violaBonuses.length > 0 ? (
                        score.breakdown.violaBonuses.map((bonus: { name: string; points: number }, bIdx: number) => (
                          <div
                            key={`${bonus.name}-${bIdx}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.9rem',
                              padding: '0.35rem 0',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: '#c084fc', fontSize: '1rem', lineHeight: 1 }}>✨</span>
                              <span style={{ color: '#e9d5ff' }}>Bonus Viola: {bonus.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: '#c084fc' }}>
                              +{bonus.points} pts
                            </span>
                          </div>
                        ))
                      ) : null}

                      {/* Total in Bold */}
                      <div
                        style={{
                          marginTop: '0.4rem',
                          paddingTop: '0.6rem',
                          borderTop: '1px solid #3d334a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#c9a84c' }}>
                          Punteggio Totale
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#c9a84c' }}>
                          {score.total} pts
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {isHost && (
            <button
              type="button"
              onClick={onRematch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.8rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#1a1520',
                background: 'linear-gradient(135deg, #e4c875 0%, #c9a84c 60%, #a28330 100%)',
                border: '1px solid #f2da96',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(201, 168, 76, 0.4)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(201, 168, 76, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(201, 168, 76, 0.4)';
              }}
            >
              <RotateCcw size={20} />
              <span>🔄 Rivincita</span>
            </button>
          )}

          <button
            type="button"
            onClick={onGoHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.8rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#c9a84c',
              background: 'rgba(201, 168, 76, 0.12)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.12)';
            }}
          >
            <Home size={20} />
            <span>🏠 Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CitadelsScoring;
