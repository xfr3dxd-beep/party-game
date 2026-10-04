// Citadels — Phase Router Page

import React, { useState } from 'react';
import { useCitadelsRoom } from './hooks/useCitadelsRoom';
import { useCitadelsGame } from './hooks/useCitadelsGame';
import { getDistrictById } from './districts';
import { getCharacterById } from './characters';
import CitadelsCreate from './components/CitadelsCreate';
import CitadelsLobby from './components/CitadelsLobby';
import CitadelsDraft from './components/CitadelsDraft';
import CitadelsBoard from './components/CitadelsBoard';
import CitadelsTurn from './components/CitadelsTurn';
import CitadelsEffect from './components/CitadelsEffect';
import CitadelsScoring from './components/CitadelsScoring';
import CitadelsCharacterRef from './components/CitadelsCharacterRef';
import CitadelsCity from './components/CitadelsCity';
import { useNavigate } from 'react-router-dom';
import { DistrictCard } from './types';

export default function CitadelsPage() {
  const navigate = useNavigate();
  const [localPhase, setLocalPhase] = useState<'create' | 'lobby'>('create');
  const [isConnecting, setIsConnecting] = useState(false);

  const room = useCitadelsRoom();
  const game = useCitadelsGame({
    playerId: room.playerId,
    isHost: room.isHost,
    players: room.players,
    broadcast: room.broadcast,
    onBroadcast: room.onBroadcast,
  });

  const [showCharRef, setShowCharRef] = useState(false);
  const [viewCityPlayerId, setViewCityPlayerId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [infoCard, setInfoCard] = useState<any>(null);
  const [showCardinal, setShowCardinal] = useState(false);
  const [cardSelDistrict, setCardSelDistrict] = useState<string | null>(null);
  const [cardSelTarget, setCardSelTarget] = useState<string | null>(null);
  const [cardSelCards, setCardSelCards] = useState<string[]>([]);

  const { state, myPlayer } = game;
  const currentPhase = state.phase !== 'create' ? state.phase : localPhase;

  const handleCreate = async (name: string) => {
    setIsConnecting(true); await room.createRoom(name); setIsConnecting(false); setLocalPhase('lobby');
  };
  const handleJoin = async (code: string, name: string): Promise<boolean> => {
    setIsConnecting(true); const ok = await room.joinRoom(code, name); setIsConnecting(false);
    if (ok) setLocalPhase('lobby'); return ok;
  };

  // Create / Join
  if (currentPhase === 'create') {
    return (
      <CitadelsCreate
        onCreateRoom={handleCreate}
        onJoinRoom={handleJoin}
        isConnecting={isConnecting}
      />
    );
  }

  // Lobby
  if (currentPhase === 'lobby') {
    return (
      <CitadelsLobby
        roomCode={room.roomCode!}
        players={room.players}
        isHost={room.isHost}
        onStartGame={game.startGame}
      />
    );
  }

  const viewCityPlayer = viewCityPlayerId ? state.players.find(p => p.id === viewCityPlayerId) : null;

  // ---- Hand Viewer (always accessible during draft and gameplay) ----
  const HandViewer = () => {
    if (!showHand || !myPlayer) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem',
        overflow: 'auto',
      }} onClick={() => setShowHand(false)}>
        <div onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#c9a84c', margin: 0 }}>🃏 La Tua Mano ({myPlayer.hand.length} carte)</h3>
            <button onClick={() => setShowHand(false)} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer',
            }}>✕</button>
          </div>
          {myPlayer.hand.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Nessuna carta in mano</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
              {myPlayer.hand.map(card => {
                const d = getDistrictById(card.districtId);
                const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };
                return (
                  <div key={card.uid} onClick={() => setInfoCard(d)} style={{
                    borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${colorMap[d.color] || '#555'}`,
                    background: 'rgba(26,21,32,0.95)',
                  }}>
                    <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.7rem' }}>
                      <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)' }}>🪙 {d.cost}</div>
                      {d.isUnique && d.effectTextIt && (
                        <div style={{ color: 'rgba(168,85,247,0.7)', fontSize: '0.6rem', marginTop: '2px' }}>{d.effectTextIt}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Player's own city */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(201,168,76,0.3)', paddingTop: '1rem' }}>
            <h3 style={{ color: '#c9a84c', margin: '0 0 0.8rem 0' }}>🏰 La Tua Città ({myPlayer.builtDistricts.length} distretti)</h3>
            {myPlayer.builtDistricts.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Nessun distretto costruito</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
                {myPlayer.builtDistricts.map(bd => {
                  const d = getDistrictById(bd.districtId);
                  const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };
                  return (
                    <div key={bd.uid} onClick={() => setInfoCard(d)} style={{
                      borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                      border: `2px solid ${colorMap[d.color] || '#555'}`,
                      background: 'rgba(26,21,32,0.95)',
                      position: 'relative',
                    }}>
                      <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.7rem' }}>
                        <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)' }}>🪙 {d.cost}</div>
                      </div>
                      {bd.artisanCoins > 0 && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', background: '#c9a84c', color: '#1a1200', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+{bd.artisanCoins}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---- Floating Hand Button ----
  const HandButton = () => (
    <button onClick={() => setShowHand(true)} style={{
      position: 'fixed', bottom: '20px', left: '20px', zIndex: 50,
      width: '52px', height: '52px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
      color: '#1a1200', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} title="La tua mano">
      🃏
      {myPlayer && myPlayer.hand.length > 0 && (
        <span style={{
          position: 'absolute', top: '-4px', right: '-4px',
          background: '#ef4444', color: '#fff', borderRadius: '50%',
          width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{myPlayer.hand.length}</span>
      )}
    </button>
  );

  // ---- Player Info Bar (shown during draft and gameplay) ----
  const PlayerInfoBar = () => (
    <div style={{
      display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center',
      padding: '0.5rem', background: 'rgba(26,21,32,0.8)',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
    }}>
      {state.players.map(p => (
        <div key={p.id} onClick={() => setViewCityPlayerId(p.id)} style={{
          padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer',
          background: p.id === room.playerId ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${p.hasCrown ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
          fontSize: '0.75rem', minWidth: '80px', textAlign: 'center',
        }}>
          <div style={{ fontWeight: 700, color: p.hasCrown ? '#c9a84c' : '#e8e0d5' }}>
            {p.hasCrown && '👑 '}{p.name}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            <span>🪙{p.gold}</span>
            <span>🃏{p.hand.length}</span>
            <span>🏠{p.builtDistricts.length}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // ---- Spy Reveal Modal ----
  const SpyRevealModal = () => {
    if (!state.effectContext || state.effectContext.type !== 'spy-reveal' || !myPlayer) return null;
    const { targetPlayerId, color, targetHand, matchCount } = state.effectContext.data;
    const targetName = state.players.find(p => p.id === targetPlayerId)?.name || '';
    const colorNames: Record<string, string> = { blue: 'Blu', green: 'Verde', yellow: 'Giallo', red: 'Rosso' };
    const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };
    const isActive = state.activePlayerId === myPlayer.id;

    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 150,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}>
        <h3 style={{ color: '#c9a84c', marginBottom: '0.5rem' }}>🕵️ Mano di {targetName}</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
          Colore scelto: <strong style={{ color: colorMap[color] }}>{colorNames[color] || color}</strong> — 
          <strong style={{ color: '#c9a84c' }}> {matchCount}</strong> {matchCount === 1 ? 'carta trovata' : 'carte trovate'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {(targetHand as DistrictCard[]).map((card: DistrictCard) => {
            const d = getDistrictById(card.districtId);
            const isMatch = d.color === color;
            return (
              <div key={card.uid} style={{
                borderRadius: '8px', overflow: 'hidden', width: '90px', position: 'relative',
                border: `2px solid ${isMatch ? colorMap[color] : 'rgba(255,255,255,0.15)'}`,
                opacity: isMatch ? 1 : 0.5,
                boxShadow: isMatch ? `0 0 12px ${colorMap[color]}40` : 'none',
              }}>
                <button onClick={(e) => { e.stopPropagation(); setInfoCard(d); }} style={{
                  position: 'absolute', top: '3px', right: '3px', zIndex: 2,
                  background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.5)',
                  color: '#c9a84c', borderRadius: '50%', width: '22px', height: '22px',
                  fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>ℹ️</button>
                <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                <div style={{ padding: '0.25rem', textAlign: 'center', background: 'rgba(26,21,32,0.9)', fontSize: '0.65rem' }}>
                  <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>🪙 {d.cost}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
          Ricompensa: <strong style={{ color: '#c9a84c' }}>+{matchCount} 🪙 +{matchCount} 🃏</strong>
        </p>
        {isActive && (
          <button onClick={game.spyConfirm} style={{
            padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
            color: '#1a1200', border: 'none', borderRadius: '12px',
          }}>✅ Conferma e Riscuoti</button>
        )}
      </div>
    );
  };

  // ---- Veggente Return Modal ----
  const VeggenteReturnModal = () => {
    if (!state.effectContext || state.effectContext.type !== 'veggente-return' || !myPlayer) return null;
    const isActive = state.activePlayerId === myPlayer.id;
    if (!isActive) return null;

    const { takenFrom, totalToReturn } = state.effectContext.data;
    const [assignments, setAssignments] = React.useState<Record<string, string>>({});
    const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };

    const assignedUids = new Set(Object.values(assignments));
    const allAssigned = Object.keys(assignments).length === totalToReturn;

    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 150,
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', overflow: 'auto',
      }}>
        <h3 style={{ color: '#c9a84c', marginBottom: '0.3rem' }}>🔮 Restituisci Carte</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
          Hai pescato {totalToReturn} carte. Scegli 1 carta dalla tua mano per ciascun giocatore.
        </p>

        {(takenFrom as { playerId: string; playerName: string }[]).map(({ playerId, playerName }) => {
          const selectedUid = assignments[playerId] || null;
          return (
            <div key={playerId} style={{ marginBottom: '1rem', width: '100%', maxWidth: '600px' }}>
              <div style={{ fontWeight: 700, color: '#e8e0d5', marginBottom: '0.4rem' }}>
                → Carta per {playerName}: {selectedUid ? '✅' : '❓'}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {myPlayer.hand.map(card => {
                  const d = getDistrictById(card.districtId);
                  const isSelected = selectedUid === card.uid;
                  const isUsed = assignedUids.has(card.uid) && !isSelected;
                  return (
                    <div key={card.uid} onClick={() => {
                      if (isUsed) return;
                      setAssignments(prev => ({ ...prev, [playerId]: card.uid }));
                    }} style={{
                      width: '70px', borderRadius: '6px', overflow: 'hidden', cursor: isUsed ? 'not-allowed' : 'pointer',
                      border: `2px solid ${isSelected ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                      opacity: isUsed ? 0.3 : 1,
                      boxShadow: isSelected ? '0 0 8px rgba(201,168,76,0.5)' : 'none',
                      position: 'relative',
                    }}>
                      <button onClick={(e) => { e.stopPropagation(); setInfoCard(d); }} style={{
                        position: 'absolute', top: '2px', right: '2px', zIndex: 2,
                        background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.5)',
                        color: '#c9a84c', borderRadius: '50%', width: '20px', height: '20px',
                        fontSize: '0.55rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>ℹ️</button>
                      <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '85px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.2rem', textAlign: 'center', background: 'rgba(26,21,32,0.9)', fontSize: '0.6rem' }}>
                        <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button disabled={!allAssigned} onClick={() => {
          const arr = Object.entries(assignments).map(([playerId, cardUid]) => ({ playerId, cardUid }));
          game.veggenteReturn(arr);
        }} style={{
          padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: allAssigned ? 'pointer' : 'not-allowed',
          background: allAssigned ? 'linear-gradient(135deg, #c9a84c, #8b6914)' : 'rgba(255,255,255,0.1)',
          color: allAssigned ? '#1a1200' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '12px',
          marginTop: '0.5rem',
        }}>✅ Conferma Restituzione ({Object.keys(assignments).length}/{totalToReturn})</button>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1520 0%, #0d0a12 100%)',
      color: '#fff',
      position: 'relative',
    }}>
      {/* Draft phase — show player info bar + draft + hand button */}
      {currentPhase === 'draft' && (
        <>
          <PlayerInfoBar />
          <CitadelsDraft
            state={state}
            playerId={room.playerId}
            onPickCharacter={game.pickCharacter}
          />
        </>
      )}

      {/* Main game: turn-call / turn-action / effect-active */}
      {(currentPhase === 'turn-call' || currentPhase === 'turn-action' || currentPhase === 'effect-active') && (
        <>
          <CitadelsBoard
            state={state}
            playerId={room.playerId}
            onOpenRules={() => setShowRules(true)}
            onOpenCharacterRef={() => setShowCharRef(true)}
            onViewCity={(pId) => setViewCityPlayerId(pId)}
          />

          {/* Host calls next rank */}
          {currentPhase === 'turn-call' && room.isHost && !state.activePlayerId && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <button onClick={game.callNextRank} style={{
                padding: '0.8rem 2rem', fontSize: '1.1rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
                color: '#1a1200', border: 'none', borderRadius: '12px', cursor: 'pointer',
              }}>
                📢 Chiama Prossimo Rango
              </button>
            </div>
          )}

          {/* Active player turn UI */}
          {(currentPhase === 'turn-action') && myPlayer && game.isMyTurn && (
            <CitadelsTurn
              state={state}
              myPlayer={myPlayer}
              isMyTurn={game.isMyTurn}
              onGatherGold={game.gatherGold}
              onGatherCards={game.gatherCards}
              onPickDrawnCard={game.pickDrawnCard}
              onBuildDistrict={game.buildDistrict}
              onEndTurn={game.endTurn}
              onCollectIncome={game.collectIncome}
              onCollectIncomeChoice={game.collectIncomeChoice}
              onTakeCrown={game.takeCrown}
              onUseEffect={() => setShowEffect(true)}
              onUseFucina={game.useFucina}
              onUseLaboratorio={game.useLaboratorio}
              onMuseoTuck={game.museoTuck}
              onCovoBuild={game.covoBuild}
            />
          )}

          {/* Effect modal */}
          {showEffect && myPlayer && (
            <CitadelsEffect
              state={state}
              myPlayer={myPlayer}
              onAssassinTarget={(r) => { game.assassinTarget(r); setShowEffect(false); }}
              onThiefTarget={(r) => { game.thiefTarget(r); setShowEffect(false); }}
              onWizardSwap={(id) => { game.wizardSwap(id); setShowEffect(false); }}
              onWizardDiscard={(uids) => { game.wizardDiscard(uids); setShowEffect(false); }}
              onEmperorGiveCrown={(id, t) => { game.emperorGiveCrown(id, t); setShowEffect(false); }}
              onWarlordDestroy={(id, uid) => { game.warlordDestroy(id, uid); setShowEffect(false); }}
              onMarshalSeize={(id, uid) => { game.marshalSeize(id, uid); setShowEffect(false); }}
              onDiplomatSwap={(a, b, c) => { game.diplomatSwap(a, b, c); setShowEffect(false); }}
              onBlackmailerDecide={(pay) => { game.blackmailerDecide(pay); setShowEffect(false); }}
              onSpyReveal={(id, c) => { game.spyPick(id, c); setShowEffect(false); }}
              onNavigatorChoose={(c) => { game.navigatorChoose(c); setShowEffect(false); }}
              onArtistEmbellish={(uids) => { game.artistEmbellish(uids); setShowEffect(false); }}
              onVeggenteTake={() => { game.veggenteTake(); setShowEffect(false); }}
              onCardinalBuild={() => { setShowEffect(false); setCardSelDistrict(null); setCardSelTarget(null); setCardSelCards([]); setShowCardinal(true); }}
              onMagistrateAssign={(assignments) => { game.magistrateAssign(assignments); setShowEffect(false); }}
              onSorcererLook={(targetId) => { game.sorcererLook(targetId); setShowEffect(false); }}
              onClose={() => setShowEffect(false)}
            />
          )}

          {/* Blackmailer decision */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'blackmailer-decide' && myPlayer && state.effectContext.data.targetId === myPlayer.id && (
            <CitadelsEffect
              state={state}
              myPlayer={myPlayer}
              onAssassinTarget={() => {}} onThiefTarget={() => {}} onWizardSwap={() => {}}
              onWizardDiscard={() => {}} onEmperorGiveCrown={() => {}} onWarlordDestroy={() => {}}
              onMarshalSeize={() => {}} onDiplomatSwap={() => {}}
              onBlackmailerDecide={game.blackmailerDecide}
              onSpyReveal={() => {}} onNavigatorChoose={() => {}} onArtistEmbellish={() => {}}
              onClose={() => {}}
            />
          )}

          {/* Spy reveal hand modal */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'spy-reveal' && <SpyRevealModal />}

          {/* Veggente return cards modal */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'veggente-return' && <VeggenteReturnModal />}

          {/* Sorcerer look modal — shows target's hand, pick card to build */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'sorcerer-look' && myPlayer && state.activePlayerId === myPlayer.id && (() => {
            const { targetPlayerId, targetHand } = state.effectContext.data;
            const targetName = state.players.find(p => p.id === targetPlayerId)?.name || '?';
            const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };
            return (
              <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', overflow: 'auto',
              }}>
                <div style={{ maxWidth: '600px', width: '100%' }}>
                  <h3 style={{ color: '#a855f7', marginBottom: '0.5rem' }}>🔮 Mano di {targetName}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Clicca su un distretto per costruirlo nella tua città (paghi il costo, ignora duplicati, non consuma la costruzione del turno).
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {(targetHand as DistrictCard[]).map((card: DistrictCard) => {
                      const d = getDistrictById(card.districtId);
                      const canAfford = myPlayer.gold >= d.cost;
                      return (
                        <div key={card.uid} style={{
                          borderRadius: '8px', overflow: 'hidden', width: '90px', position: 'relative',
                          border: `2px solid ${canAfford ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          opacity: canAfford ? 1 : 0.5,
                        }}>
                          <button onClick={(e) => { e.stopPropagation(); setInfoCard(d); }} style={{
                            position: 'absolute', top: '3px', right: '3px', zIndex: 2,
                            background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(168,85,247,0.5)',
                            color: '#a855f7', borderRadius: '50%', width: '22px', height: '22px',
                            fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>ℹ️</button>
                          <div onClick={() => { if (canAfford) game.sorcererBuild(targetPlayerId, card.uid); }} style={{ cursor: canAfford ? 'pointer' : 'not-allowed' }}>
                            <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                            <div style={{ padding: '0.25rem', textAlign: 'center', background: 'rgba(26,21,32,0.9)', fontSize: '0.65rem' }}>
                              <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                              <div style={{ color: canAfford ? 'rgba(255,255,255,0.6)' : '#ef4444' }}>🪙 {d.cost} {!canAfford && '(no oro)'}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => game.sorcererBuild(targetPlayerId, '')} style={{
                    width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#e8e0d5',
                    borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
                  }}>❌ Non costruire (annulla)</button>
                </div>
              </div>
            );
          })()}

          {/* Pick drawn card — only shown to the active player */}
          {currentPhase === 'effect-active' && state.effectContext?.type === 'pick-card-from-drawn' && state.drawnCards && myPlayer && state.activePlayerId === myPlayer.id && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}>
              <h3 style={{ color: '#c9a84c', marginBottom: '1rem' }}>Scegli una carta da tenere</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {state.drawnCards.map(card => {
                  const d = getDistrictById(card.districtId);
                  return (
                    <div key={card.uid} style={{
                      borderRadius: '8px', overflow: 'hidden', position: 'relative',
                      border: '2px solid rgba(201,168,76,0.4)', width: '110px',
                    }}>
                      <button onClick={(e) => { e.stopPropagation(); setInfoCard(d); }} style={{
                        position: 'absolute', top: '4px', right: '4px', zIndex: 2,
                        background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.5)',
                        color: '#c9a84c', borderRadius: '50%', width: '24px', height: '24px',
                        fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>ℹ️</button>
                      <div onClick={() => game.pickDrawnCard(card.uid)} style={{ cursor: 'pointer' }}>
                        <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                        <div style={{ padding: '0.3rem', textAlign: 'center', background: 'rgba(26,21,32,0.9)', fontSize: '0.7rem' }}>
                          <div style={{ fontWeight: 700, color: '#c9a84c' }}>{d.nameIt}</div>
                          <div style={{ color: 'rgba(255,255,255,0.6)' }}>🪙 {d.cost}</div>
                          {d.isUnique && <div style={{ color: 'rgba(168,85,247,0.7)', fontSize: '0.6rem' }}>✨ Unico</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Game Over */}
      {currentPhase === 'game-over' && (
        <CitadelsScoring
          state={state}
          isHost={room.isHost}
          onRematch={game.rematch}
          onGoHome={() => { room.disconnect(); navigate('/'); }}
        />
      )}

      {/* Floating hand button — always visible during draft and gameplay */}
      {myPlayer && (currentPhase === 'draft' || currentPhase === 'turn-call' || currentPhase === 'turn-action' || currentPhase === 'effect-active') && (
        <HandButton />
      )}

      {/* Hand viewer modal */}
      <HandViewer />

      {/* Character reference modal */}
      <CitadelsCharacterRef
        characterPool={state.characterPool}
        isOpen={showCharRef}
        onClose={() => setShowCharRef(false)}
      />

      {/* City view modal */}
      {viewCityPlayer && (
        <CitadelsCity
          player={viewCityPlayer}
          isOpen={true}
          onClose={() => setViewCityPlayerId(null)}
        />
      )}

      {/* Info Card Overlay — large view of any district card */}
      {infoCard && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={() => setInfoCard(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: '320px', width: '100%', background: 'rgba(26,21,32,0.98)',
            borderRadius: '16px', overflow: 'hidden',
            border: '2px solid #c9a84c', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          }}>
            <img src={infoCard.image} alt={infoCard.nameIt} style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#c9a84c', margin: 0, fontSize: '1.1rem' }}>{infoCard.nameIt}</h3>
                <span style={{
                  background: 'rgba(201,168,76,0.2)', color: '#c9a84c', padding: '0.2rem 0.6rem',
                  borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem',
                }}>🪙 {infoCard.cost}</span>
              </div>
              {(() => {
                const colorNames: Record<string, string> = { blue: 'Religioso', green: 'Commerciale', yellow: 'Nobiliare', red: 'Militare', purple: 'Unico' };
                const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };
                return (
                  <span style={{ fontSize: '0.8rem', color: colorMap[infoCard.color], fontWeight: 600 }}>
                    {colorNames[infoCard.color] || infoCard.color}
                  </span>
                );
              })()}
              {infoCard.isUnique && infoCard.effectTextIt && (
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '0.8rem', lineHeight: '1.4' }}>
                  {infoCard.effectTextIt}
                </p>
              )}
              <button onClick={() => setInfoCard(null)} style={{
                width: '100%', marginTop: '1rem', padding: '0.6rem',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
              }}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* Cardinal Build Modal */}
      {showCardinal && myPlayer && myPlayer.characterId === 15 && (() => {
        const colorMap: Record<string, string> = { blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', red: '#ef4444', purple: '#a855f7' };
        const districtCard = cardSelDistrict ? myPlayer.hand.find(c => c.uid === cardSelDistrict) : null;
        const district = districtCard ? getDistrictById(districtCard.districtId) : null;
        const cost = district?.cost || 0;
        const target = cardSelTarget ? state.players.find(p => p.id === cardSelTarget) : null;
        const maxCards = Math.min(cost, target?.gold || 0);
        const goldFromOwn = cost - cardSelCards.length;
        const canConfirm = cardSelDistrict && cardSelTarget && cardSelCards.length <= maxCards && goldFromOwn <= myPlayer.gold;

        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200,
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', overflow: 'auto',
          }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#c9a84c', margin: 0 }}>⛪ Costruzione del Cardinale</h3>
                <button onClick={() => setShowCardinal(false)} style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer',
                }}>✕</button>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                1. Scegli il distretto da costruire:
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {myPlayer.hand.map(card => {
                  const d = getDistrictById(card.districtId);
                  const isSel = cardSelDistrict === card.uid;
                  return (
                    <div key={card.uid} onClick={() => { setCardSelDistrict(card.uid); setCardSelCards([]); }} style={{
                      width: '75px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                      border: `2px solid ${isSel ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: isSel ? '0 0 8px rgba(201,168,76,0.5)' : 'none',
                    }}>
                      <button onClick={(e) => { e.stopPropagation(); setInfoCard(d); }} style={{
                        position: 'absolute', top: '2px', right: '2px', zIndex: 2,
                        background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.5)',
                        color: '#c9a84c', borderRadius: '50%', width: '20px', height: '20px',
                        fontSize: '0.55rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>ℹ️</button>
                      <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.2rem', textAlign: 'center', fontSize: '0.6rem', background: 'rgba(26,21,32,0.9)' }}>
                        <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)' }}>🪙{d.cost}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cardSelDistrict && (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    2. Scegli il giocatore a cui dare carte (costo: 🪙{cost}):
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {state.players.filter(p => p.id !== myPlayer.id && p.gold > 0).map(p => (
                      <button key={p.id} onClick={() => { setCardSelTarget(p.id); setCardSelCards([]); }} style={{
                        padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                        background: cardSelTarget === p.id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${cardSelTarget === p.id ? '#c9a84c' : 'rgba(255,255,255,0.15)'}`,
                        color: '#e8e0d5', fontSize: '0.85rem',
                      }}>
                        {p.name} (🪙{p.gold})
                      </button>
                    ))}
                  </div>
                </>
              )}

              {cardSelDistrict && cardSelTarget && (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    3. Scegli carte da dare (max {maxCards}). Ogni carta = 1🪙 dal giocatore. Tu paghi i restanti 🪙{goldFromOwn} dal tuo oro.
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {myPlayer.hand.filter(c => c.uid !== cardSelDistrict).map(card => {
                      const d = getDistrictById(card.districtId);
                      const isSel = cardSelCards.includes(card.uid);
                      return (
                        <div key={card.uid} onClick={() => {
                          if (isSel) setCardSelCards(cardSelCards.filter(u => u !== card.uid));
                          else if (cardSelCards.length < maxCards) setCardSelCards([...cardSelCards, card.uid]);
                        }} style={{
                          width: '70px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                          border: `2px solid ${isSel ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                          opacity: isSel ? 1 : 0.7,
                        }}>
                          <button onClick={(e) => { e.stopPropagation(); setInfoCard(d); }} style={{
                            position: 'absolute', top: '2px', right: '2px', zIndex: 2,
                            background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.5)',
                            color: '#c9a84c', borderRadius: '50%', width: '20px', height: '20px',
                            fontSize: '0.55rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>ℹ️</button>
                          <img src={d.image} alt={d.nameIt} style={{ width: '100%', height: '85px', objectFit: 'cover' }} />
                          <div style={{ padding: '0.15rem', textAlign: 'center', fontSize: '0.55rem', background: 'rgba(26,21,32,0.9)' }}>
                            <div style={{ fontWeight: 700, color: colorMap[d.color] || '#c9a84c' }}>{d.nameIt}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', padding: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ color: '#c9a84c' }}>Riepilogo:</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Costruisci: <strong>{district?.nameIt}</strong> (🪙{cost}) | 
                      Dai {cardSelCards.length} carte a {target?.name} → ricevi 🪙{cardSelCards.length} | 
                      Paghi dal tuo oro: 🪙{goldFromOwn}
                    </div>
                  </div>

                  <button disabled={!canConfirm} onClick={() => {
                    game.cardinalBuild(cardSelDistrict!, cardSelTarget!, cardSelCards);
                    setShowCardinal(false);
                  }} style={{
                    width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: 700,
                    cursor: canConfirm ? 'pointer' : 'not-allowed',
                    background: canConfirm ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.1)',
                    color: canConfirm ? '#fff' : 'rgba(255,255,255,0.3)',
                    border: 'none', borderRadius: '12px',
                  }}>⛪ Costruisci con il Cardinale</button>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
