import React from 'react';
import { CitadelsState, CitadelsPlayer } from '../types';
import { getCharacterById, getCharactersByRank, CROWN_IMAGE, COIN_IMAGE } from '../characters';
import { getDistrictById } from '../districts';
import {
  Crown,
  HelpCircle,
  Scroll,
  Eye,
  Coins,
  Layers,
  Sparkles,
  Skull,
  Shield,
  AlertTriangle,
  Megaphone,
  CheckCircle,
} from 'lucide-react';

export interface CitadelsBoardProps {
  state: CitadelsState;
  playerId: string;
  onOpenRules: () => void;
  onOpenCharacterRef: () => void;
  onViewCity: (playerId: string) => void;
  isHost?: boolean;
  onCallNextRank?: () => void;
}

export default function CitadelsBoard({
  state,
  playerId,
  onOpenRules,
  onOpenCharacterRef,
  onViewCity,
  isHost,
  onCallNextRank,
}: CitadelsBoardProps) {
  const isHostUser = isHost ?? (state.players.length > 0 && state.players[0].id === playerId);
  const activePlayer = state.players.find(p => p.id === state.activePlayerId);
  const isMyTurn = state.activePlayerId === playerId;

  // Determine current character being called
  const currentCharId = state.currentRank > 0
    ? state.characterPool.find(id => getCharacterById(id).rank === state.currentRank)
    : null;
  const currentChar = currentCharId
    ? getCharacterById(currentCharId)
    : state.currentRank > 0
    ? getCharactersByRank(state.currentRank)[0]
    : null;

  // All ranks in current game pool
  const ranksInGame = state.characterPool
    .map(id => getCharacterById(id).rank)
    .sort((a, b) => a - b);

  const getDistrictColorHex = (color: string) => {
    switch (color) {
      case 'yellow': return '#eab308';
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      case 'red': return '#ef4444';
      case 'purple': return '#a855f7';
      default: return '#9ca3af';
    }
  };

  const getIncomeColorLabel = (color: string | null) => {
    switch (color) {
      case 'yellow': return 'Nobile • Introito Giallo (+1 oro/distretto)';
      case 'blue': return 'Religioso • Introito Blu (+1 oro/distretto)';
      case 'green': return 'Commerciale • Introito Verde (+1 oro/distretto)';
      case 'red': return 'Militare • Introito Rosso (+1 oro/distretto)';
      default: return 'Speciale • Nessun introito da colore';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #261f30 0%, #1a1520 60%, #0d0a12 100%)',
      color: '#e8e0d5',
      fontFamily: "'Cinzel', 'Georgia', serif",
      padding: '1rem',
      boxSizing: 'border-box',
    }}>
      {/* Top Bar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 1.25rem auto',
        background: 'linear-gradient(180deg, rgba(42, 33, 53, 0.95) 0%, rgba(26, 21, 32, 0.98) 100%)',
        border: '1px solid #3d344d',
        borderBottom: '2px solid #c9a84c',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        {/* Left: Round & Game Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
            color: '#1a1520',
            fontWeight: 900,
            fontSize: '0.85rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}>
            Round {state.roundNumber}
          </div>

          <div style={{
            background: 'rgba(201, 168, 76, 0.12)',
            border: '1px solid rgba(201, 168, 76, 0.35)',
            padding: '0.3rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fbe495',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <Shield style={{ width: 14, height: 14, color: '#c9a84c' }} />
            {state.currentRank > 0 ? (
              <span>Rango Attuale: <strong style={{ color: '#fff' }}>{state.currentRank}</strong></span>
            ) : (
              <span>Chiamata dei Personaggi</span>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8rem',
            color: '#a89cae',
          }}>
            <span>🃏 Mazzo: <strong style={{ color: '#fff' }}>{state.districtDeck.length}</strong></span>
            <span>•</span>
            <span>🗑️ Scarti: <strong style={{ color: '#fff' }}>{state.discardPile.length}</strong></span>
            {state.firstTo7PlayerId && (
              <>
                <span>•</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>🏁 Ultimo Round!</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Rules & Reference Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onOpenRules}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              color: '#fbe495',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.2)';
              e.currentTarget.style.borderColor = '#c9a84c';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)';
            }}
          >
            <HelpCircle style={{ width: 16, height: 16, color: '#c9a84c' }} />
            Regole
          </button>

          <button
            onClick={onOpenCharacterRef}
            style={{
              background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(139, 105, 20, 0.25) 100%)',
              border: '1px solid #c9a84c',
              color: '#fbe495',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201, 168, 76, 0.4) 0%, rgba(139, 105, 20, 0.4) 100%)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(139, 105, 20, 0.25) 100%)';
            }}
          >
            <Scroll style={{ width: 16, height: 16, color: '#c9a84c' }} />
            Personaggi
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Call Progress Track (1 to 8/9) */}
        <div style={{
          background: 'rgba(26, 21, 32, 0.75)',
          border: '1px solid #3d344d',
          borderRadius: '10px',
          padding: '0.6rem 0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: '#a89cae',
            textTransform: 'uppercase',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            marginRight: '0.25rem',
          }}>
            Ranghi:
          </span>

          {ranksInGame.map(r => {
            const isCalled = state.calledRanks.includes(r);
            const isCurrent = state.currentRank === r;
            const isAssassinated = state.assassinatedRank === r;
            const isRobbed = state.robbedRank === r;
            const charForRank = state.characterPool
              .map(id => getCharacterById(id))
              .find(c => c.rank === r);

            return (
              <div
                key={r}
                title={`${charForRank?.nameIt || 'Rango ' + r}${isAssassinated ? ' (Assassinato)' : ''}${isRobbed ? ' (Derubato)' : ''}`}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  position: 'relative',
                  background: isCurrent
                    ? 'linear-gradient(135deg, #c9a84c, #8b6914)'
                    : isCalled
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(20, 16, 26, 0.8)',
                  color: isCurrent
                    ? '#1a1520'
                    : isCalled
                    ? '#6e6375'
                    : '#c3bac7',
                  border: isCurrent
                    ? '2px solid #ffe285'
                    : isCalled
                    ? '1px solid #2e2638'
                    : '1px solid #4a3e5c',
                  boxShadow: isCurrent ? '0 0 12px rgba(201, 168, 76, 0.6)' : 'none',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                {r}
                {isAssassinated && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    width: '14px',
                    height: '14px',
                    fontSize: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    💀
                  </span>
                )}
                {isRobbed && !isAssassinated && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#eab308',
                    borderRadius: '50%',
                    width: '14px',
                    height: '14px',
                    fontSize: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    💰
                  </span>
                )}
                {isCalled && !isCurrent && (
                  <span style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#4ade80',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Center Area: Current Character Being Called */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(34, 26, 43, 0.95) 0%, rgba(20, 15, 26, 0.98) 100%)',
          border: '2px solid #3d344d',
          borderTop: '2px solid #c9a84c',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}>
          {currentChar ? (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Large Character Portrait */}
              <div style={{
                position: 'relative',
                width: '160px',
                height: '235px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #c9a84c',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(201, 168, 76, 0.25)',
                background: '#0d0a12',
                flexShrink: 0,
              }}>
                <img
                  src={currentChar.image}
                  alt={currentChar.nameIt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: 'rgba(0, 0, 0, 0.85)',
                  border: '1.5px solid #c9a84c',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{ fontSize: '0.65rem', color: '#c9a84c', textTransform: 'uppercase' }}>Rango</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{currentChar.rank}</span>
                </div>
              </div>

              {/* Character Details & Turn Status */}
              <div style={{ flex: '1 1 320px', maxWidth: '650px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: '#c9a84c',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 700,
                  marginBottom: '0.3rem',
                }}>
                  <Shield style={{ width: 14, height: 14 }} />
                  Personaggio di Turno
                </div>

                <h2 style={{
                  margin: '0 0 0.2rem 0',
                  fontSize: '1.8rem',
                  color: '#fbe495',
                  fontWeight: 700,
                  textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                }}>
                  {currentChar.nameIt}
                  <span style={{ fontSize: '1rem', color: '#8f8395', fontWeight: 400, marginLeft: '0.6rem', fontStyle: 'italic' }}>
                    ({currentChar.name})
                  </span>
                </h2>

                <div style={{
                  display: 'inline-block',
                  background: currentChar.incomeColor ? `${getDistrictColorHex(currentChar.incomeColor)}22` : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${currentChar.incomeColor ? getDistrictColorHex(currentChar.incomeColor) : '#5a4b69'}`,
                  color: currentChar.incomeColor ? getDistrictColorHex(currentChar.incomeColor) : '#c3bac7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem',
                }}>
                  {getIncomeColorLabel(currentChar.incomeColor)}
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  color: '#d6cddc',
                  lineHeight: '1.45',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid #3d344d',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}>
                  <strong style={{ color: '#c9a84c' }}>Abilità: </strong>
                  {currentChar.effectTextIt}
                </div>

                {/* Status Badges: Assassinated / Robbed / Active Player */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {state.assassinatedRank === currentChar.rank && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}>
                      <Skull style={{ width: 20, height: 20, color: '#ef4444' }} />
                      Questo personaggio è stato ASSASSINATO! Il turno viene saltato.
                    </div>
                  )}

                  {state.robbedRank === currentChar.rank && (
                    <div style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid #eab308',
                      color: '#fef08a',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}>
                      <Coins style={{ width: 20, height: 20, color: '#eab308' }} />
                      Questo personaggio è DERUBATO! Il Ladro ruberà il suo oro all'inizio del turno.
                    </div>
                  )}

                  {/* Active Player Indicator */}
                  {activePlayer ? (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.2) 0%, rgba(139, 105, 20, 0.1) 100%)',
                      border: '2px solid #c9a84c',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 0 20px rgba(201, 168, 76, 0.35)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Sparkles style={{ width: 20, height: 20, color: '#c9a84c' }} />
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Giocatore in Turno
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                            {activePlayer.name} {isMyTurn && <span style={{ color: '#c9a84c' }}>(TU)</span>}
                          </div>
                        </div>
                      </div>

                      {isMyTurn && (
                        <span style={{
                          background: '#c9a84c',
                          color: '#1a1520',
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          textTransform: 'uppercase',
                        }}>
                          Tocca a te!
                        </span>
                      )}
                    </div>
                  ) : state.assassinatedRank !== currentChar.rank ? (
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#a89cae',
                      fontStyle: 'italic',
                      padding: '0.4rem 0',
                    }}>
                      In attesa che il possessore del personaggio si palesi...
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            /* Rank 0 / Waiting to start calls */
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(201, 168, 76, 0.1)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                marginBottom: '1rem',
              }}>
                <Crown style={{ width: 30, height: 30, color: '#c9a84c' }} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#fbe495', fontSize: '1.5rem', fontWeight: 700 }}>
                Inizio della Chiamata dei Personaggi
              </h2>
              <p style={{ margin: '0 auto', maxWidth: '500px', fontSize: '0.9rem', color: '#a89cae' }}>
                I ranghi dal Rango 1 al Rango {ranksInGame[ranksInGame.length - 1] || 8} verranno chiamati in ordine crescente.
              </p>
            </div>
          )}

          {/* Host 'Chiama Prossimo Rango' Button */}
          {state.phase === 'turn-call' && isHostUser && !state.activePlayerId && onCallNextRank && (
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(201, 168, 76, 0.25)',
              textAlign: 'center',
            }}>
              <button
                onClick={onCallNextRank}
                style={{
                  padding: '0.85rem 2.25rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #c9a84c 0%, #e0bc5a 50%, #8b6914 100%)',
                  color: '#1a1200',
                  border: '1px solid #ffe285',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(201, 168, 76, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.filter = 'brightness(1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Megaphone style={{ width: 22, height: 22 }} />
                Chiama Prossimo Rango
              </button>
            </div>
          )}
        </div>

        {/* Players Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
          padding: '0 0.25rem',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            color: '#c9a84c',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Crown style={{ width: 18, height: 18 }} />
            I Sovrani e le Cittadelle ({state.players.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#8f8395' }}>
            Clicca su un giocatore per esplorare i suoi distretti
          </span>
        </div>

        {/* Players Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1rem',
        }}>
          {state.players.map(p => {
            const isActive = p.id === state.activePlayerId;
            const isMe = p.id === playerId;
            const hasCrown = p.hasCrown || p.id === state.crownHolderId;

            // Check if player is assassinated this round
            const isAssassinated =
              !p.isAlive ||
              (state.assassinatedRank !== null &&
                p.characterId !== null &&
                getCharacterById(p.characterId).rank === state.assassinatedRank &&
                (state.currentRank >= state.assassinatedRank || state.calledRanks.includes(state.assassinatedRank)));

            // Color breakdown of built districts
            const colorCounts: Record<string, number> = {
              yellow: 0,
              blue: 0,
              green: 0,
              red: 0,
              purple: 0,
            };

            p.builtDistricts.forEach(bd => {
              const d = getDistrictById(bd.districtId);
              if (d && colorCounts[d.color] !== undefined) {
                colorCounts[d.color]++;
              }
            });

            return (
              <div
                key={p.id}
                onClick={() => onViewCity(p.id)}
                style={{
                  background: isActive
                    ? 'linear-gradient(180deg, rgba(46, 35, 59, 0.95) 0%, rgba(28, 22, 36, 0.98) 100%)'
                    : 'linear-gradient(180deg, rgba(28, 22, 36, 0.9) 0%, rgba(18, 14, 24, 0.95) 100%)',
                  border: isActive
                    ? '2px solid #c9a84c'
                    : isMe
                    ? '1.5px solid rgba(201, 168, 76, 0.5)'
                    : '1px solid #3d344d',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: isActive
                    ? '0 0 22px rgba(201, 168, 76, 0.4), 0 8px 16px rgba(0,0,0,0.5)'
                    : '0 4px 14px rgba(0, 0, 0, 0.35)',
                  cursor: 'pointer',
                  position: 'relative',
                  opacity: isAssassinated ? 0.5 : 1,
                  filter: isAssassinated ? 'grayscale(0.7)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#c9a84c';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = isMe ? 'rgba(201, 168, 76, 0.5)' : '#3d344d';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Active Player Glow Badge */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
                    color: '#1a1200',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}>
                    ⭐ In Turno
                  </div>
                )}

                {/* Header: Name + Crown + Assassinated notice */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.6rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    {hasCrown && (
                      <span title="Detentore della Corona">
                        <img
                          src={CROWN_IMAGE}
                          alt="Corona"
                          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        />
                      </span>
                    )}
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: isActive ? '#fbe495' : isMe ? '#fff' : '#e0d8e6',
                      textDecoration: isAssassinated ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {p.name}
                    </span>
                    {isMe && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#c9a84c',
                        background: 'rgba(201, 168, 76, 0.15)',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        fontWeight: 700,
                      }}>
                        Tu
                      </span>
                    )}
                  </div>

                  {isAssassinated && (
                    <span style={{
                      fontSize: '0.7rem',
                      color: '#ef4444',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}>
                      <Skull style={{ width: 12, height: 12 }} />
                      Morto
                    </span>
                  )}
                </div>

                {/* Resources: Gold & Hand Cards */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '0.75rem',
                  border: '1px solid #362d42',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <img
                      src={COIN_IMAGE}
                      alt="Moneta"
                      style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbe495' }}>
                      {p.gold}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#a89cae' }}>oro</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers style={{ width: 16, height: 16, color: '#a855f7' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                      {p.hand.length}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#a89cae' }}>carte</span>
                  </div>
                </div>

                {/* Built Districts Summary & Color Indicators */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#c9a84c', fontWeight: 700 }}>
                      Distretti Costruiti ({p.builtDistricts.length}/7)
                    </span>
                  </div>

                  {/* Color dots / pills */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    minHeight: '28px',
                  }}>
                    {p.builtDistricts.length > 0 ? (
                      p.builtDistricts.map((bd, i) => {
                        const d = getDistrictById(bd.districtId);
                        const hex = d ? getDistrictColorHex(d.color) : '#888';
                        return (
                          <div
                            key={bd.uid || i}
                            title={`${d?.nameIt || 'Distretto'} (Costo: ${d?.cost || '?'})`}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              background: hex,
                              border: '1px solid rgba(0,0,0,0.5)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#1a1200',
                            }}
                          >
                            {d?.cost}
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#7e7383', fontStyle: 'italic' }}>
                        Nessun distretto costruito
                      </span>
                    )}
                  </div>
                </div>

                {/* Threat Tokens if any */}
                {(p.magistrateToken || p.blackmailerToken) && (
                  <div style={{
                    marginBottom: '0.6rem',
                    display: 'flex',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                  }}>
                    {p.magistrateToken && (
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}>
                        ⚠️ Minaccia Magistrato
                      </span>
                    )}
                    {p.blackmailerToken && (
                      <span style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        color: '#fde047',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}>
                        ⚠️ Ricattatore {p.blackmailerPaid ? '(Pagato)' : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* View City Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCity(p.id);
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(201, 168, 76, 0.12)',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    color: '#fbe495',
                    borderRadius: '6px',
                    padding: '0.45rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(201, 168, 76, 0.25)';
                    e.currentTarget.style.borderColor = '#c9a84c';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(201, 168, 76, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)';
                  }}
                >
                  <Eye style={{ width: 14, height: 14 }} />
                  Visualizza Città
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
