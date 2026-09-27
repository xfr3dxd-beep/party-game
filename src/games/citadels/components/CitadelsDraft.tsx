import React, { useState } from 'react';
import { CitadelsState } from '../types';
import { getCharacterById, CHAR_BACK } from '../characters';
import { Crown, Hourglass, CheckCircle2, Shield, Sparkles, EyeOff, ArrowRight, Check } from 'lucide-react';

interface CitadelsDraftProps {
  state: CitadelsState;
  playerId: string;
  onPickCharacter: (charId: number) => void;
}

export default function CitadelsDraft({ state, playerId, onPickCharacter }: CitadelsDraftProps) {
  const [selectedCharId, setSelectedCharId] = useState<number | null>(null);
  const [hoveredCharId, setHoveredCharId] = useState<number | null>(null);

  const draft = state.draftState;

  if (!draft) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1520',
        color: '#c9a84c',
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: '1.2rem',
      }}>
        <Hourglass className="animate-spin" style={{ marginRight: '0.5rem', width: 24, height: 24 }} />
        Preparazione della fase di scelta...
      </div>
    );
  }

  const currentPickerId = draft.pickOrder[draft.currentPickerIndex];
  const currentPicker = state.players.find(p => p.id === currentPickerId);
  const isMyTurn = currentPickerId === playerId;
  const crownHolder = state.players.find(p => p.id === state.crownHolderId);

  // Remaining characters to pick from (only shown if isMyTurn)
  const remainingChars = isMyTurn
    ? draft.remainingIds.map(id => getCharacterById(id)).sort((a, b) => a.rank - b.rank)
    : [];

  // Face-up discarded cards
  const faceUpChars = (draft.faceUpIds || []).map(id => getCharacterById(id)).sort((a, b) => a.rank - b.rank);

  const handleConfirmPick = () => {
    if (selectedCharId !== null) {
      onPickCharacter(selectedCharId);
      setSelectedCharId(null);
    }
  };

  const getColorDetails = (color: string | null) => {
    switch (color) {
      case 'yellow':
        return { label: 'Nobile (Oro)', bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#fde047' };
      case 'blue':
        return { label: 'Religioso', bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#93c5fd' };
      case 'green':
        return { label: 'Commerciale', bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#86efac' };
      case 'red':
        return { label: 'Militare', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#fca5a5' };
      default:
        return { label: 'Speciale', bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#d8b4fe' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #261f30 0%, #1a1520 60%, #0d0a12 100%)',
      color: '#e8e0d5',
      fontFamily: "'Cinzel', 'Georgia', serif",
      padding: '1.25rem 1rem 3rem 1rem',
      boxSizing: 'border-box',
    }}>
      {/* Top Header Banner */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 1.5rem auto',
        background: 'linear-gradient(180deg, rgba(42, 33, 53, 0.9) 0%, rgba(26, 21, 32, 0.95) 100%)',
        border: '1px solid #3d344d',
        borderBottom: '2px solid #c9a84c',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
              color: '#1a1520',
              fontWeight: 900,
              fontSize: '0.8rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Round {state.roundNumber}
            </span>
            <h1 style={{
              margin: 0,
              fontSize: '1.4rem',
              color: '#c9a84c',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            }}>
              Fase di Scelta dei Personaggi
            </h1>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#a89cae', marginTop: '0.3rem' }}>
            Ogni sovrano sceglie in segreto il personaggio da impersonare per questo round.
          </div>
        </div>

        {crownHolder && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(201, 168, 76, 0.12)',
            border: '1px solid rgba(201, 168, 76, 0.35)',
            padding: '0.5rem 0.9rem',
            borderRadius: '8px',
          }}>
            <Crown style={{ width: 20, height: 20, color: '#c9a84c' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Detentore della Corona
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {crownHolder.name} {crownHolder.id === playerId && '(Tu)'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Pick Order Track */}
        <div style={{
          background: 'rgba(26, 21, 32, 0.8)',
          border: '1px solid #3d344d',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.8rem',
            fontSize: '0.85rem',
            color: '#c9a84c',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            <Shield style={{ width: 16, height: 16 }} />
            Ordine di Scelta
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}>
            {draft.pickOrder.map((pId, idx) => {
              const p = state.players.find(pl => pl.id === pId);
              const hasPicked = draft.picks[pId] !== undefined;
              const isCurrent = pId === currentPickerId;
              const isMe = pId === playerId;
              const isCrown = pId === state.crownHolderId;

              return (
                <React.Fragment key={pId}>
                  <div style={{
                    minWidth: '135px',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    background: isCurrent
                      ? 'linear-gradient(180deg, rgba(201, 168, 76, 0.25) 0%, rgba(201, 168, 76, 0.08) 100%)'
                      : hasPicked
                      ? 'rgba(34, 197, 94, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent
                      ? '2px solid #c9a84c'
                      : hasPicked
                      ? '1px solid rgba(34, 197, 94, 0.4)'
                      : '1px solid #3d344d',
                    boxShadow: isCurrent ? '0 0 14px rgba(201, 168, 76, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}>
                      <span style={{ fontSize: '0.7rem', color: '#8f8395' }}>#{idx + 1}</span>
                      {isCrown && <Crown style={{ width: 14, height: 14, color: '#c9a84c' }} />}
                    </div>

                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: isCurrent || isMe ? 700 : 500,
                      color: isCurrent ? '#fbe495' : isMe ? '#e8e0d5' : '#c3bac7',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {p?.name || 'Giocatore'} {isMe && '(Tu)'}
                    </div>

                    <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {hasPicked ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.7rem',
                          color: '#4ade80',
                          fontWeight: 600,
                        }}>
                          <CheckCircle2 style={{ width: 12, height: 12 }} /> Scelto
                        </span>
                      ) : isCurrent ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.7rem',
                          color: '#c9a84c',
                          fontWeight: 700,
                        }}>
                          <Sparkles style={{ width: 12, height: 12 }} /> Sceglie ora
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.7rem',
                          color: '#7e7383',
                        }}>
                          <Hourglass style={{ width: 12, height: 12 }} /> In attesa
                        </span>
                      )}
                    </div>
                  </div>

                  {idx < draft.pickOrder.length - 1 && (
                    <ArrowRight style={{ width: 14, height: 14, color: '#4a3f55', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Table Cards Display (Face-down & Face-up) */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(32, 24, 41, 0.9) 0%, rgba(22, 17, 28, 0.95) 100%)',
          border: '1px solid #3d344d',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
            paddingBottom: '0.6rem',
            marginBottom: '1rem',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1rem',
              color: '#c9a84c',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Shield style={{ width: 18, height: 18 }} />
              Carte Scartate sul Tavolo
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#8f8395' }}>
              Rimosse dal mazzo per questo round
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Face-Down Card */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#c9a84c', marginBottom: '0.4rem', fontWeight: 600 }}>
                1 Carta a Faccia in Giù (Segreta)
              </div>
              <div style={{
                position: 'relative',
                width: '105px',
                height: '155px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid #5a4b69',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                background: '#120e17',
              }}>
                <img
                  src={CHAR_BACK}
                  alt="Carta Coperta"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(10, 8, 14, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: '50%',
                    padding: '0.4rem',
                    border: '1px solid rgba(201,168,76,0.4)',
                  }}>
                    <EyeOff style={{ width: 18, height: 18, color: '#c9a84c' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Face-Up Cards (if any) */}
            {faceUpChars.length > 0 ? (
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontSize: '0.75rem', color: '#c9a84c', marginBottom: '0.4rem', fontWeight: 600 }}>
                  {faceUpChars.length} {faceUpChars.length === 1 ? 'Carta a Faccia in Su (Scartata)' : 'Carte a Faccia in Su (Scartate)'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                  {faceUpChars.map(c => {
                    const colorStyle = getColorDetails(c.incomeColor);
                    return (
                      <div
                        key={c.id}
                        style={{
                          width: '115px',
                          background: 'rgba(15, 11, 20, 0.85)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #4a3e5c',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          position: 'relative',
                        }}
                      >
                        <div style={{ position: 'relative', height: '120px' }}>
                          <img
                            src={c.image}
                            alt={c.nameIt}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid #c9a84c',
                            color: '#c9a84c',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            padding: '1px 5px',
                          }}>
                            {c.rank}
                          </div>
                        </div>
                        <div style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {c.nameIt}
                          </div>
                          <div style={{
                            fontSize: '0.65rem',
                            color: colorStyle.text,
                            marginTop: '2px',
                          }}>
                            {colorStyle.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1,
                alignSelf: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed #3d344d',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#8f8395',
              }}>
                Nessuna carta scoperta sul tavolo (partita a 6+ giocatori).
              </div>
            )}
          </div>
        </div>

        {/* Picker Area: MY TURN or WAITING */}
        {isMyTurn ? (
          <div style={{
            background: 'linear-gradient(180deg, rgba(38, 28, 48, 0.95) 0%, rgba(23, 17, 30, 0.98) 100%)',
            border: '2px solid #c9a84c',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 0 30px rgba(201, 168, 76, 0.25)',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              gap: '1rem',
              borderBottom: '1px solid rgba(201, 168, 76, 0.3)',
              paddingBottom: '0.9rem',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
                  color: '#1a1200',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}>
                  <Sparkles style={{ width: 14, height: 14 }} /> Tocca a te!
                </div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  color: '#fce59f',
                  fontWeight: 700,
                }}>
                  Scegli il tuo Personaggio
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#b8abc0', marginTop: '0.2rem' }}>
                  Scegli 1 carta da tenere per questo round. Le carte rimanenti saranno passate al prossimo giocatore.
                </div>
              </div>

              {selectedCharId !== null && (
                <button
                  onClick={handleConfirmPick}
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c 0%, #d8b458 50%, #9a761c 100%)',
                    color: '#161100',
                    border: '1px solid #ffe285',
                    borderRadius: '10px',
                    padding: '0.75rem 1.6rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(201, 168, 76, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.15s ease, filter 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
                >
                  <Check style={{ width: 20, height: 20 }} />
                  Conferma: {getCharacterById(selectedCharId).nameIt}
                </button>
              )}
            </div>

            {/* Character Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: '1.25rem',
            }}>
              {remainingChars.map(c => {
                const isSelected = selectedCharId === c.id;
                const isHovered = hoveredCharId === c.id;
                const colorDetails = getColorDetails(c.incomeColor);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCharId(c.id)}
                    onMouseEnter={() => setHoveredCharId(c.id)}
                    onMouseLeave={() => setHoveredCharId(null)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(180deg, #2d243b 0%, #1c1527 100%)'
                        : 'linear-gradient(180deg, #1f1828 0%, #15101c 100%)',
                      border: isSelected
                        ? '2px solid #c9a84c'
                        : isHovered
                        ? '1px solid #8c73aa'
                        : '1px solid #3d344d',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: isSelected ? 'translateY(-6px)' : isHovered ? 'translateY(-3px)' : 'none',
                      boxShadow: isSelected
                        ? '0 10px 24px rgba(201, 168, 76, 0.45)'
                        : isHovered
                        ? '0 8px 18px rgba(0, 0, 0, 0.6)'
                        : '0 4px 12px rgba(0, 0, 0, 0.4)',
                      transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    {/* Character Card Image */}
                    <div style={{ position: 'relative', width: '100%', height: '190px', background: '#0e0b12' }}>
                      <img
                        src={c.image}
                        alt={c.nameIt}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          transform: isSelected || isHovered ? 'scale(1.03)' : 'scale(1)',
                        }}
                      />

                      {/* Rank Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'linear-gradient(135deg, #2a2035 0%, #140e1c 100%)',
                        border: '2px solid #c9a84c',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <span style={{ fontSize: '0.65rem', color: '#a89cae', textTransform: 'uppercase' }}>Rango</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fbe495' }}>{c.rank}</span>
                      </div>

                      {/* Selected Checkmark overlay */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#c9a84c',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                        }}>
                          <Check style={{ width: 16, height: 16, color: '#1a1200', strokeWidth: 3 }} />
                        </div>
                      )}

                      {/* Color/Income tag */}
                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: colorDetails.bg,
                        border: `1px solid ${colorDetails.border}`,
                        color: colorDetails.text,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backdropFilter: 'blur(4px)',
                      }}>
                        {colorDetails.label}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(201, 168, 76, 0.15)',
                    }}>
                      <div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isSelected ? '#fbe495' : '#fff',
                          marginBottom: '0.2rem',
                        }}>
                          {c.nameIt}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8f8395', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                          {c.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#c8bfcf',
                          lineHeight: '1.35',
                          marginBottom: '0.8rem',
                        }}>
                          {c.effectTextIt}
                        </div>
                      </div>

                      {/* Single Click/Tap action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPickCharacter(c.id);
                        }}
                        style={{
                          width: '100%',
                          background: isSelected
                            ? 'linear-gradient(135deg, #c9a84c, #8b6914)'
                            : 'rgba(201, 168, 76, 0.15)',
                          color: isSelected ? '#1a1200' : '#c9a84c',
                          border: isSelected ? 'none' : '1px solid rgba(201, 168, 76, 0.4)',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(201, 168, 76, 0.3)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(201, 168, 76, 0.15)';
                          }
                        }}
                      >
                        {isSelected ? '✓ Scegli Questo' : 'Scegli'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Waiting Screen */
          <div style={{
            background: 'linear-gradient(180deg, rgba(30, 24, 38, 0.95) 0%, rgba(18, 14, 23, 0.98) 100%)',
            border: '1px solid #3d344d',
            borderTop: '2px solid #8b6914',
            borderRadius: '16px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(201, 168, 76, 0.1)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              marginBottom: '1rem',
            }}>
              <Hourglass style={{ width: 32, height: 32, color: '#c9a84c' }} className="animate-pulse" />
            </div>

            <h2 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.4rem',
              color: '#fbe495',
              fontWeight: 700,
            }}>
              In attesa di {currentPicker?.name || 'un giocatore'}...
            </h2>

            <p style={{
              maxWidth: '520px',
              margin: '0 auto 1.5rem auto',
              fontSize: '0.9rem',
              color: '#a89cae',
              lineHeight: '1.5',
            }}>
              La scelta delle carte avviene a turno ed è rigorosamente segreta. Quando toccherà a te, riceverai la mano di carte tra cui scegliere.
            </p>

            {/* Hand of hidden cards being picked */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid #3d344d',
              padding: '0.6rem 1.25rem',
              borderRadius: '30px',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#c9a84c', fontWeight: 600 }}>
                Carte in mano al giocatore attivo:
              </span>
              <span style={{
                background: '#c9a84c',
                color: '#1a1520',
                fontWeight: 900,
                fontSize: '0.8rem',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {draft.remainingIds.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
