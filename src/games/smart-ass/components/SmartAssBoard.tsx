import React, { useRef, useState } from 'react';
import type { SmartAssState } from '../types';
import {
  BOARD_IMAGE, BOARD_POSITIONS, TOKEN_IMAGES, TOKEN_COLORS, TOKEN_CSS_COLORS,
  DORSO_PATHS, CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_CSS,
  COLOR_TO_CATEGORY, getTokenOffset, END_POSITION,
} from '../boardPositions';
import SmartAssCategoryDie from '../../../components/Dado/SmartAssDado_categoria';
import SmartAssNumberDie from '../../../components/Dado/SmartAssDado_numeror';
import type { SmartAssDieHandle, DieRoll as CategoryDieRoll } from '../../../components/Dado/SmartAssDado_categoria';
import type { SmartAssDieHandle as NumberDieHandle, DieRoll as NumberDieRoll } from '../../../components/Dado/SmartAssDado_numeror';

interface Props {
  state: SmartAssState;
  playerId: string;
  isHost: boolean;
  onAct: (action: string, payload?: any) => void;
}

const NAVY = 'rgba(20, 20, 60, 0.92)';

export default function SmartAssBoard({ state, playerId, isHost, onAct }: Props) {
  const categoryDieRef = useRef<SmartAssDieHandle>(null);
  const numberDieRef = useRef<NumberDieHandle>(null);
  const [showCard, setShowCard] = useState(false);

  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;
  const answerer = state.players.find(p => p.id === state.answeringPlayerId);
  const isAnswerer = state.answeringPlayerId === playerId;
  const hardAssPlayer = state.players.find(p => p.id === state.hardAssPlayerId);
  const isHardAssPlayer = state.hardAssPlayerId === playerId;
  const hardAssReader = state.players.find(p => p.id === state.hardAssReaderId);
  const isHardAssReader = state.hardAssReaderId === playerId;
  const isActiveMover = state.activeMoverId === playerId;
  const winner = state.players.find(p => p.id === state.winnerId);

  // Group tokens by position for offset calculation
  const tokensByPos: Record<number, string[]> = {};
  state.players.forEach(p => {
    const pos = p.position;
    if (!tokensByPos[pos]) tokensByPos[pos] = [];
    tokensByPos[pos].push(p.id);
  });

  const handleCategoryRolled = (roll: CategoryDieRoll) => {
    onAct('category-rolled', { color: roll.color });
  };

  const handleNumberRolled = (roll: NumberDieRoll) => {
    if (state.phase === 'hard-ass-roll') {
      onAct('hard-ass-number-rolled', { value: roll.value });
    } else {
      onAct('number-rolled', { value: roll.value });
    }
  };

  const renderPhaseUI = () => {
    switch (state.phase) {
      case 'narrator-roll':
        return (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem',
              color: TOKEN_CSS_COLORS[narrator?.tokenIndex ?? 0],
            }}>
              🎙️ Narratore: {narrator?.name}
            </div>
            {state.lastDieValue !== null && (
              <div style={{
                marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '999px',
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                fontSize: '0.85rem', color: '#fbbf24', display: 'inline-block',
              }}>
                Ultimo dado: {state.lastDieValue}
              </div>
            )}
            {isNarrator ? (
              <button
                onClick={() => categoryDieRef.current?.roll()}
                style={{
                  padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '999px', border: 'none',
                  cursor: 'pointer', color: '#fff',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ea580c)',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.5)',
                }}
              >
                🎲 Lancia il dado categoria
              </button>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                In attesa che {narrator?.name} lanci il dado categoria...
              </div>
            )}
          </div>
        );

      case 'narrator-reads': {
        const cat = state.currentColor ? COLOR_TO_CATEGORY[state.currentColor] : null;
        return (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            {cat && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.4rem', borderRadius: '999px', marginBottom: '1rem',
                background: CATEGORY_CSS[cat] + '33', border: `2px solid ${CATEGORY_CSS[cat]}`,
                fontSize: '1.2rem', fontWeight: 900, color: CATEGORY_CSS[cat],
              }}>
                {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
              </div>
            )}
            {isNarrator ? (
              <div>
                <div style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Leggi gli indizi ai giocatori!</div>
                <button
                  onClick={() => setShowCard(true)}
                  style={{
                    padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 800, borderRadius: '999px', border: 'none',
                    cursor: 'pointer', color: '#fff', marginBottom: '0.5rem',
                    background: cat ? CATEGORY_CSS[cat] : '#f59e0b',
                  }}
                >
                  👁️ Vedi la carta
                </button>
                <div>
                  <button
                    onClick={() => { setShowCard(false); onAct('card-acknowledged'); }}
                    style={{
                      padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '999px',
                      border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
                      color: '#fff', cursor: 'pointer', marginTop: '0.5rem',
                    }}
                  >
                    ✅ Ho letto gli indizi
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                🗣️ {narrator?.name} sta leggendo gli indizi... Ascolta e rispondi!
              </div>
            )}
          </div>
        );
      }

      case 'select-answerer':
        return (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            {isNarrator ? (
              <>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                  Chi ha risposto correttamente?
                </div>
                {/* Review card button */}
                <button
                  onClick={() => setShowCard(true)}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '999px', marginBottom: '1rem',
                    border: '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                  }}
                >
                  👁️ Rivedi la carta
                </button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                  {state.players.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onAct('select-answerer', { answererId: p.id })}
                      style={{
                        padding: '0.6rem 1.2rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.9rem',
                        background: `linear-gradient(135deg, ${TOKEN_CSS_COLORS[p.tokenIndex]}88, ${TOKEN_CSS_COLORS[p.tokenIndex]})`,
                        color: '#fff', boxShadow: `0 4px 12px ${TOKEN_CSS_COLORS[p.tokenIndex]}44`,
                      }}
                    >
                      {p.name} {p.id === playerId ? '(Tu)' : ''}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => onAct('select-answerer', { answererId: narrator.id })}
                  style={{
                    padding: '0.5rem 1.5rem', borderRadius: '999px',
                    border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  }}
                >
                  Nessuno ha risposto (io avanzo)
                </button>
              </>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                {narrator?.name} sta selezionando chi ha risposto...
              </div>
            )}
          </div>
        );

      case 'answerer-roll':
        return (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: TOKEN_CSS_COLORS[answerer?.tokenIndex ?? 0] }}>
              {answerer?.name} deve lanciare il dado!
            </div>
            {isActiveMover ? (
              <button
                onClick={() => numberDieRef.current?.roll()}
                style={{
                  padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '999px', border: 'none',
                  cursor: 'pointer', color: '#fff',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.5)',
                }}
              >
                🎲 Lancia il dado
              </button>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                In attesa che {answerer?.name} lanci il dado...
              </div>
            )}
          </div>
        );

      case 'hard-ass-card':
        return (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              fontWeight: 900, fontSize: '1.2rem', marginBottom: '1rem',
              color: '#a855f7',
            }}>
              🟣 Hard Ass! {hardAssPlayer?.name} deve rispondere!
            </div>
            {isHardAssReader ? (
              /* The reader sees the card and reads it aloud */
              <>
                <div style={{
                  marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem',
                  color: '#fbbf24',
                }}>
                  📖 Leggi la domanda a voce alta a {hardAssPlayer?.name}!
                </div>
                {state.hardAssCardPath && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img
                      src={state.hardAssCardPath}
                      alt="Hard Ass Card"
                      style={{
                        maxWidth: '100%', maxHeight: '50vh', borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onAct('hard-ass-correct')}
                    style={{
                      padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 900, borderRadius: '999px', border: 'none',
                      cursor: 'pointer', color: '#fff',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      boxShadow: '0 6px 18px rgba(34,197,94,0.4)',
                    }}
                  >
                    ✅ Risposta Corretta
                  </button>
                  <button
                    onClick={() => onAct('hard-ass-incorrect')}
                    style={{
                      padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 900, borderRadius: '999px', border: 'none',
                      cursor: 'pointer', color: '#fff',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      boxShadow: '0 6px 18px rgba(239,68,68,0.4)',
                    }}
                  >
                    ❌ Risposta Sbagliata
                  </button>
                </div>
              </>
            ) : isHardAssPlayer ? (
              /* The player who must answer sees a waiting message */
              <div style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                🧠 Ascolta la domanda da {hardAssReader?.name} e rispondi!
              </div>
            ) : (
              /* Other players see a waiting message */
              <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                📖 {hardAssReader?.name} sta leggendo la domanda a {hardAssPlayer?.name}...
              </div>
            )}
          </div>
        );

      case 'hard-ass-roll':
        return (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: '#22c55e' }}>
              ✅ {hardAssPlayer?.name} ha risposto correttamente! Lancia il dado!
            </div>
            {isHardAssPlayer ? (
              <button
                onClick={() => numberDieRef.current?.roll()}
                style={{
                  padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '999px', border: 'none',
                  cursor: 'pointer', color: '#fff',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 8px 24px rgba(34,197,94,0.5)',
                }}
              >
                🎲 Lancia il dado
              </button>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                In attesa che {hardAssPlayer?.name} lanci il dado...
              </div>
            )}
          </div>
        );

      case 'game-over':
        return (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fbbf24' }}>
              {winner?.name} ha vinto!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
              Ha raggiunto il sedere dell'asino!
            </div>
            {isHost && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onAct('new-game')}
                  style={{
                    padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 800, borderRadius: '999px', border: 'none',
                    cursor: 'pointer', color: '#fff',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 6px 18px rgba(245,158,11,0.4)',
                  }}
                >
                  🔄 Nuova partita
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ color: '#fff' }}>
      <style>{`
        .sab-board { position: relative; width: 100%; max-width: 800px; margin: 0 auto; }
        .sab-board img.sab-bg { width: 100%; height: auto; display: block; border-radius: 16px; }
        .sab-token {
          position: absolute; width: 5%; transform: translate(-50%, -90%);
          z-index: 10; transition: left 0.6s ease, top 0.6s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .sab-token img { width: 100%; height: auto; }
        .sab-token-label {
          position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%);
          font-size: 0.55rem; font-weight: 800; white-space: nowrap;
          background: rgba(0,0,0,0.75); padding: 1px 4px; border-radius: 4px;
        }
        .sab-dorso-row { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
        .sab-dorso { width: 22%; max-width: 140px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .sab-card-overlay {
          position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.9);
          display: flex; align-items: center; justify-content: center; flex-direction: column;
          padding: 1rem; cursor: pointer;
        }
        .sab-card-overlay img {
          max-width: 90%; max-height: 80vh; border-radius: 12px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.6);
        }
        @media (max-width: 600px) {
          .sab-dorso { width: 20%; }
          .sab-token { width: 7%; }
          .sab-token-label { font-size: 0.45rem; bottom: -12px; }
        }
      `}</style>

      {/* Card backs row */}
      <div className="sab-dorso-row">
        <img className="sab-dorso" src={DORSO_PATHS.chi_sono} alt="Chi Sono?" />
        <img className="sab-dorso" src={DORSO_PATHS.cosa_sono} alt="Cosa Sono?" />
        <img className="sab-dorso" src={DORSO_PATHS.dove_sono} alt="Dove Sono?" />
        <img className="sab-dorso" src={DORSO_PATHS.hard_ass} alt="Hard Ass" />
      </div>

      {/* Board with tokens */}
      <div className="sab-board">
        <img className="sab-bg" src={BOARD_IMAGE} alt="Smart Ass Board" />
        {state.players.map(p => {
          const pos = BOARD_POSITIONS[p.position] || BOARD_POSITIONS[0];
          const samePos = tokensByPos[p.position] || [];
          const idxInGroup = samePos.indexOf(p.id);
          const offset = getTokenOffset(idxInGroup, samePos.length);
          return (
            <div
              key={p.id}
              className="sab-token"
              style={{
                left: `${pos.x + offset.dx}%`,
                top: `${pos.y + offset.dy}%`,
              }}
            >
              <img src={TOKEN_IMAGES[p.tokenIndex]} alt={p.name} />
              <div className="sab-token-label" style={{ color: TOKEN_CSS_COLORS[p.tokenIndex] }}>
                {p.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player positions summary */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center',
        margin: '0.75rem 0', padding: '0.5rem',
      }}>
        {state.players.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
            background: p.id === narrator?.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
            border: p.id === narrator?.id ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
            color: TOKEN_CSS_COLORS[p.tokenIndex],
          }}>
            <img src={TOKEN_IMAGES[p.tokenIndex]} alt="" style={{ width: '16px', height: 'auto' }} />
            {p.name}: {p.position >= END_POSITION ? '🏆' : p.position}
            {p.id === narrator?.id && ' 🎙️'}
            {p.skipNextNarrator && ' 💤'}
          </div>
        ))}
      </div>

      {/* Phase-specific UI */}
      <div style={{
        background: NAVY, borderRadius: '20px', padding: '0.5rem',
        border: '1px solid rgba(255,255,255,0.1)', margin: '0 auto', maxWidth: '600px',
      }}>
        {renderPhaseUI()}
      </div>

      {/* Full-screen card overlay (narrator only) */}
      {showCard && state.currentCardPath && isNarrator && (
        <div className="sab-card-overlay" onClick={() => setShowCard(false)}>
          <img src={state.currentCardPath} alt="Card" />
          <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            Tocca per chiudere
          </div>
        </div>
      )}

      {/* Full-screen special event overlay (all players) */}
      {state.lastEvent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: '2rem',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(30,30,70,0.98), rgba(20,20,50,0.98))',
            borderRadius: '24px', padding: '2.5rem 2rem', maxWidth: '420px', width: '90%',
            textAlign: 'center',
            border: '2px solid rgba(255,255,255,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15)',
          }}>
            <div style={{
              fontSize: '3rem', marginBottom: '1rem',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
            }}>
              {state.lastEvent.includes('Kick Ass') ? '⚡' :
               state.lastEvent.includes('Hard Ass') ? '🟣' :
               state.lastEvent.includes('Dumb Ass') ? '💤' : '📢'}
            </div>
            <div style={{
              fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.4,
              color: state.lastEvent.includes('Kick Ass') ? '#fbbf24' :
                     state.lastEvent.includes('Hard Ass') ? '#a855f7' :
                     state.lastEvent.includes('Dumb Ass') ? '#60a5fa' : '#fff',
              marginBottom: '1.5rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}>
              {state.lastEvent}
            </div>
            {isHost && (
              <button
                onClick={() => onAct('dismiss-event')}
                style={{
                  padding: '0.8rem 2.5rem', fontSize: '1rem', fontWeight: 800,
                  borderRadius: '999px', border: 'none', cursor: 'pointer',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                  boxShadow: '0 6px 20px rgba(139,92,246,0.4)',
                }}
              >
                ✅ Continua
              </button>
            )}
            {!isHost && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                In attesa che l'host continui...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dice components (always mounted, controlled via refs) */}
      <SmartAssCategoryDie
        ref={categoryDieRef}
        onRolled={handleCategoryRolled}
        skipSave
        size={140}
      />
      <SmartAssNumberDie
        ref={numberDieRef}
        onRolled={handleNumberRolled}
        skipSave
        size={140}
      />
    </div>
  );
}
