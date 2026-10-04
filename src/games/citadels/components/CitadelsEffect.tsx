import React, { useState } from 'react';
import { CitadelsState, CitadelsPlayer, DistrictCard, BuiltDistrict, CitadelsCharacter } from '../types';
import { getCharacterById, ALL_CHARACTERS } from '../characters';
import { getDistrictById } from '../districts';
import { countBuiltDistricts } from '../gameLogic';
import {
  X,
  Swords,
  Coins,
  Layers,
  Crown,
  Shield,
  Eye,
  Sparkles,
  ArrowRightLeft,
  Compass,
  Palette,
  AlertTriangle,
  Check,
  CheckCircle2,
  Trash2,
  Lock,
  Landmark,
} from 'lucide-react';

interface CitadelsEffectProps {
  state: CitadelsState;
  myPlayer: CitadelsPlayer;
  onAssassinTarget: (rank: number) => void;
  onThiefTarget: (rank: number) => void;
  onWizardSwap: (targetPlayerId: string) => void;
  onWizardDiscard: (cardUids: string[]) => void;
  onEmperorGiveCrown: (targetId: string, paymentType: 'gold' | 'card') => void;
  onWarlordDestroy: (targetId: string, districtUid: string) => void;
  onMarshalSeize: (targetId: string, districtUid: string) => void;
  onDiplomatSwap: (myUid: string, targetId: string, targetUid: string) => void;
  onBlackmailerDecide: (pay: boolean) => void;
  onSpyReveal: (targetId: string, color: string) => void;
  onNavigatorChoose: (choice: 'gold' | 'cards') => void;
  onArtistEmbellish: (districtUids: string[]) => void;
  onVeggenteTake?: () => void;
  onCardinalBuild?: () => void;
  onClose: () => void;
}

const COLOR_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  yellow: { label: 'Nobiliare (Giallo)', bg: 'rgba(243, 156, 18, 0.2)', text: '#ffeaa7', border: '#f39c12', icon: '👑' },
  blue: { label: 'Religioso (Blu)', bg: 'rgba(41, 128, 185, 0.2)', text: '#74b9ff', border: '#2980b9', icon: '⛪' },
  green: { label: 'Commerciale (Verde)', bg: 'rgba(39, 174, 96, 0.2)', text: '#55efc4', border: '#27ae60', icon: '💰' },
  red: { label: 'Militare (Rosso)', bg: 'rgba(192, 57, 43, 0.2)', text: '#ff7675', border: '#c0392b', icon: '⚔️' },
  purple: { label: 'Speciale (Viola)', bg: 'rgba(142, 68, 173, 0.2)', text: '#a29bfe', border: '#8e44ad', icon: '✨' },
};

export default function CitadelsEffect({
  state,
  myPlayer,
  onAssassinTarget,
  onThiefTarget,
  onWizardSwap,
  onWizardDiscard,
  onEmperorGiveCrown,
  onWarlordDestroy,
  onMarshalSeize,
  onDiplomatSwap,
  onBlackmailerDecide,
  onSpyReveal,
  onNavigatorChoose,
  onArtistEmbellish,
  onVeggenteTake,
  onCardinalBuild,
  onClose,
}: CitadelsEffectProps) {
  // Local states for complex interactive effects
  const [wizardMode, setWizardMode] = useState<'swap' | 'discard'>('swap');
  const [wizardSelectedCards, setWizardSelectedCards] = useState<string[]>([]);

  // Emperor state
  const [emperorTargetId, setEmperorTargetId] = useState<string | null>(null);
  const [emperorPaymentType, setEmperorPaymentType] = useState<'gold' | 'card'>('gold');

  // Diplomat state
  const [diplomatMyUid, setDiplomatMyUid] = useState<string | null>(null);
  const [diplomatTargetPlayerId, setDiplomatTargetPlayerId] = useState<string | null>(null);
  const [diplomatTargetUid, setDiplomatTargetUid] = useState<string | null>(null);

  // Spy state
  const [spyTargetId, setSpyTargetId] = useState<string | null>(null);
  const [spyColor, setSpyColor] = useState<string>('yellow');

  // Artist state
  const [artistSelectedUids, setArtistSelectedUids] = useState<string[]>([]);

  const isBlackmailerDecide =
    state.effectContext?.type === 'blackmailer-decide' &&
    state.effectContext.data?.targetId === myPlayer.id;

  const character = myPlayer.characterId ? getCharacterById(myPlayer.characterId) : null;
  const otherPlayers = state.players.filter((p: CitadelsPlayer) => p.id !== myPlayer.id);

  // Helper to toggle card selection
  const toggleCardSelection = (uid: string, list: string[], setList: (arr: string[]) => void, max?: number) => {
    if (list.includes(uid)) {
      setList(list.filter((id) => id !== uid));
    } else {
      if (max && list.length >= max) return;
      setList([...list, uid]);
    }
  };

  // Determine which character header image & title to render
  const headerImage = isBlackmailerDecide
    ? '/Citadels/Personaggi %2B token/Ricattatore.jpg'
    : character?.image || '/Citadels/Dorso carte personaggio.png';

  const headerTitle = isBlackmailerDecide
    ? 'Minaccia del Ricattatore!'
    : character?.nameIt || 'Effetto Personaggio';

  const headerRank = isBlackmailerDecide ? 2 : character?.rank;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 3, 10, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBlackmailerDecide) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #221a2c 0%, #15101c 100%)',
          border: '2px solid #c9a84c',
          borderRadius: '18px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(201, 168, 76, 0.25)',
          color: '#f4ede2',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Modal Close Button (hidden during forced blackmailer decision) */}
        {!isBlackmailerDecide && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fae596',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201, 168, 76, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)')}
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Top Banner with Character Portrait */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(90deg, rgba(201, 168, 76, 0.15) 0%, rgba(30, 20, 40, 0.5) 100%)',
            borderBottom: '1px solid rgba(201, 168, 76, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #c9a84c',
              boxShadow: '0 4px 16px rgba(201, 168, 76, 0.35)',
              flexShrink: 0,
              background: '#0d0a12',
            }}
          >
            <img src={headerImage} alt={headerTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {headerRank !== undefined && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  background: '#c9a84c',
                  color: '#1a1520',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  padding: '2px 5px',
                  borderBottomRightRadius: '6px',
                }}
              >
                {headerRank}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#c9a84c',
                fontWeight: 700,
              }}
            >
              Abilità Speciale
            </span>
            <h2
              style={{
                margin: '2px 0 0 0',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.01em',
              }}
            >
              {headerTitle}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'rgba(244, 237, 226, 0.75)', marginTop: '2px' }}>
              {isBlackmailerDecide
                ? 'Prendi una decisione critica per proteggere il tuo oro'
                : character?.effectTextIt}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* ============================================================== */}
          {/* 1. BLACKMAILER DECISION                                        */}
          {/* ============================================================== */}
          {isBlackmailerDecide && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  maxWidth: '560px',
                  margin: '0 auto 1.5rem auto',
                  padding: '1.25rem',
                  background: 'rgba(231, 76, 60, 0.1)',
                  border: '1px solid #e74c3c',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={20} color="#e74c3c" />
                  <span style={{ fontWeight: 800, color: '#ff7675', fontSize: '1rem' }}>
                    Attenzione: Sei stato Ricattato!
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(244, 237, 226, 0.85)', lineHeight: 1.5 }}>
                  Il Ricattatore ti ha assegnato un segnalino minaccia. Puoi pagare la metà del tuo oro per disinnescare la minaccia in modo sicuro.
                  Se rifiuti di pagare e il segnalino si rivela essere <strong>VERO</strong>, perderai <strong>TUTTO</strong> il tuo oro a favore del Ricattatore!
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginTop: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: '#ffd54f' }}>Tuo oro: 🪙 {myPlayer.gold}</span>
                  <span style={{ color: '#55efc4' }}>
                    Prezzo riscatto: 🪙 {Math.floor(myPlayer.gold / 2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onBlackmailerDecide(true)}
                  style={{
                    padding: '0.85rem 1.75rem',
                    background: 'linear-gradient(135deg, #27ae60 0%, #1e824c 100%)',
                    border: '1px solid #55efc4',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(39, 174, 96, 0.4)',
                  }}
                >
                  🛡️ Paga Metà Oro ({Math.floor(myPlayer.gold / 2)} 🪙)
                </button>

                <button
                  onClick={() => onBlackmailerDecide(false)}
                  style={{
                    padding: '0.85rem 1.75rem',
                    background: 'linear-gradient(135deg, #c0392b 0%, #962d22 100%)',
                    border: '1px solid #ff7675',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(192, 57, 43, 0.4)',
                  }}
                >
                  🎲 Rischia (Non Pagare)
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. ASSASSINO (Rank 1, ID 1)                                    */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 1 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Seleziona quale rango assassinare (rango 2-9 presenti in partita). Il giocatore con quel personaggio salterà interamente il turno:
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {state.characterPool
                  .map((cId: number) => getCharacterById(cId))
                  .filter((c: CitadelsCharacter) => c.rank >= 2)
                  .sort((a: CitadelsCharacter, b: CitadelsCharacter) => a.rank - b.rank)
                  .map((targetChar: CitadelsCharacter) => (
                    <div
                      key={targetChar.id}
                      onClick={() => onAssassinTarget(targetChar.rank)}
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#1a1424',
                        border: '2px solid rgba(201, 168, 76, 0.35)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                        textAlign: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.borderColor = '#e74c3c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.35)';
                      }}
                    >
                      <div style={{ position: 'relative', height: '120px', width: '100%', overflow: 'hidden' }}>
                        <img
                          src={targetChar.image}
                          alt={targetChar.nameIt}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            background: '#c9a84c',
                            color: '#1a1520',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            borderBottomRightRadius: '6px',
                          }}
                        >
                          Rango {targetChar.rank}
                        </div>
                      </div>
                      <div style={{ padding: '0.65rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                          {targetChar.nameIt}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssassinTarget(targetChar.rank);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            background: 'linear-gradient(135deg, #c0392b, #8b1e15)',
                            border: '1px solid #ff7675',
                            borderRadius: '6px',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          🗡️ Assassina
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. LADRO (Rank 2, ID 4)                                        */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 4 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Nomina un personaggio di rango 3-9 da derubare (non puoi derubare il rango 1 o il personaggio assassinato). Quando verrà chiamato, ruberai tutto il suo oro:
              </p>

              {state.assassinatedRank && (
                <div
                  style={{
                    padding: '0.5rem 0.8rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    background: 'rgba(192, 57, 43, 0.2)',
                    border: '1px solid #c0392b',
                    fontSize: '0.8rem',
                    color: '#ff7675',
                  }}
                >
                  ⚠️ Rango {state.assassinatedRank} è stato assassinato e non può essere derubato.
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {state.characterPool
                  .map((cId: number) => getCharacterById(cId))
                  .filter((c: CitadelsCharacter) => c.rank >= 3 && c.rank !== state.assassinatedRank)
                  .sort((a: CitadelsCharacter, b: CitadelsCharacter) => a.rank - b.rank)
                  .map((targetChar: CitadelsCharacter) => (
                    <div
                      key={targetChar.id}
                      onClick={() => onThiefTarget(targetChar.rank)}
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#1a1424',
                        border: '2px solid rgba(201, 168, 76, 0.35)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                        textAlign: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.borderColor = '#f39c12';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.35)';
                      }}
                    >
                      <div style={{ position: 'relative', height: '120px', width: '100%', overflow: 'hidden' }}>
                        <img
                          src={targetChar.image}
                          alt={targetChar.nameIt}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            background: '#c9a84c',
                            color: '#1a1520',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            borderBottomRightRadius: '6px',
                          }}
                        >
                          Rango {targetChar.rank}
                        </div>
                      </div>
                      <div style={{ padding: '0.65rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                          {targetChar.nameIt}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onThiefTarget(targetChar.rank);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            background: 'linear-gradient(135deg, #f39c12, #b7791f)',
                            border: '1px solid #ffd54f',
                            borderRadius: '6px',
                            color: '#1a1520',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          💰 Deruba
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. MAGO (Rank 3, ID 7)                                         */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 7 && (
            <div>
              {/* Wizard Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.4rem',
                  borderRadius: '10px',
                }}
              >
                <button
                  onClick={() => setWizardMode('swap')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: wizardMode === 'swap' ? 'rgba(201, 168, 76, 0.25)' : 'transparent',
                    border: wizardMode === 'swap' ? '1px solid #c9a84c' : '1px solid transparent',
                    borderRadius: '8px',
                    color: wizardMode === 'swap' ? '#fae596' : 'rgba(255,255,255,0.6)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowRightLeft size={16} /> Scambia Mano con Giocatore
                </button>
                <button
                  onClick={() => setWizardMode('discard')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: wizardMode === 'discard' ? 'rgba(201, 168, 76, 0.25)' : 'transparent',
                    border: wizardMode === 'discard' ? '1px solid #c9a84c' : '1px solid transparent',
                    borderRadius: '8px',
                    color: wizardMode === 'discard' ? '#fae596' : 'rgba(255,255,255,0.6)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={16} /> Scarta e Ripesca dal Mazzo
                </button>
              </div>

              {wizardMode === 'swap' ? (
                <div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'rgba(244, 237, 226, 0.75)' }}>
                    Scegli un giocatore con cui scambiare l&apos;intera mano di carte. Attualmente tu possiedi {myPlayer.hand.length} carte:
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    {otherPlayers.map((player: CitadelsPlayer) => (
                      <div
                        key={player.id}
                        style={{
                          padding: '1rem',
                          background: '#1a1424',
                          border: '1px solid rgba(201, 168, 76, 0.3)',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{player.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#a29bfe', marginTop: '3px' }}>
                            🃏 {player.hand.length} carte in mano
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#ffd54f' }}>
                            🪙 {player.gold} oro • 🏰 {countBuiltDistricts(player)} quartieri
                          </div>
                        </div>

                        <button
                          onClick={() => onWizardSwap(player.id)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            background: 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                            border: '1px solid #fae596',
                            borderRadius: '8px',
                            color: '#1a1520',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Scambia Mano
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'rgba(244, 237, 226, 0.75)' }}>
                    Seleziona le carte dalla tua mano che desideri scartare. Verranno messe in fondo al mazzo e ne pescherai lo stesso numero:
                  </p>

                  {myPlayer.hand.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.5)' }}>
                      Non hai carte in mano da scartare.
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                          gap: '0.75rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        {myPlayer.hand.map((card: DistrictCard) => {
                          const district = getDistrictById(card.districtId);
                          const isSelected = wizardSelectedCards.includes(card.uid);
                          return (
                            <div
                              key={card.uid}
                              onClick={() =>
                                toggleCardSelection(card.uid, wizardSelectedCards, setWizardSelectedCards)
                              }
                              style={{
                                borderRadius: '10px',
                                overflow: 'hidden',
                                background: '#1a1424',
                                border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.15)'}`,
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ height: '95px', width: '100%', overflow: 'hidden' }}>
                                <img
                                  src={district.image}
                                  alt={district.nameIt}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                                  {district.nameIt}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#ffd54f' }}>🪙 {district.cost}</div>
                              </div>
                              {isSelected && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: '#e74c3c',
                                    borderRadius: '50%',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  ✓
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => onWizardDiscard(wizardSelectedCards)}
                          disabled={wizardSelectedCards.length === 0}
                          style={{
                            padding: '0.75rem 2rem',
                            background:
                              wizardSelectedCards.length === 0
                                ? 'rgba(255,255,255,0.08)'
                                : 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                            border: '1px solid #fae596',
                            borderRadius: '10px',
                            color: wizardSelectedCards.length === 0 ? 'rgba(255,255,255,0.4)' : '#1a1520',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            cursor: wizardSelectedCards.length === 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Scarta {wizardSelectedCards.length} Carte e Ripesca
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. IMPERATORE (Rank 4, ID 11)                                  */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 11 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                L&apos;Imperatore toglie la corona e la cede a un altro giocatore a sua scelta. Il giocatore scelto deve darti 1 oro o 1 carta:
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fae596', display: 'block', marginBottom: '0.5rem' }}>
                  1. Scegli il giocatore a cui cedere la Corona:
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {otherPlayers.map((player: CitadelsPlayer) => {
                    const isSelected = emperorTargetId === player.id;
                    return (
                      <div
                        key={player.id}
                        onClick={() => setEmperorTargetId(player.id)}
                        style={{
                          padding: '0.85rem',
                          background: isSelected ? 'rgba(201, 168, 76, 0.25)' : '#1a1424',
                          border: `2px solid ${isSelected ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{player.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                          🪙 {player.gold} oro • 🃏 {player.hand.length} carte
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {emperorTargetId && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fae596', display: 'block', marginBottom: '0.5rem' }}>
                    2. Scegli la forma di pagamento da pretendere:
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setEmperorPaymentType('gold')}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: emperorPaymentType === 'gold' ? 'rgba(243, 156, 18, 0.3)' : 'rgba(0,0,0,0.3)',
                        border: `2px solid ${emperorPaymentType === 'gold' ? '#f39c12' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: '#ffd54f',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      🪙 Pretendi 1 Oro
                    </button>
                    <button
                      onClick={() => setEmperorPaymentType('card')}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: emperorPaymentType === 'card' ? 'rgba(142, 68, 173, 0.3)' : 'rgba(0,0,0,0.3)',
                        border: `2px solid ${emperorPaymentType === 'card' ? '#8e44ad' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: '#d29bfe',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      🃏 Pretendi 1 Carta
                    </button>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    if (emperorTargetId) {
                      onEmperorGiveCrown(emperorTargetId, emperorPaymentType);
                    }
                  }}
                  disabled={!emperorTargetId}
                  style={{
                    padding: '0.85rem 2rem',
                    background: !emperorTargetId
                      ? 'rgba(255,255,255,0.08)'
                      : 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                    border: '1px solid #fae596',
                    borderRadius: '10px',
                    color: !emperorTargetId ? 'rgba(255,255,255,0.4)' : '#1a1520',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: !emperorTargetId ? 'not-allowed' : 'pointer',
                  }}
                >
                  👑 Consegna Corona
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. CONDOTTIERO (Rank 8, ID 22)                                 */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 22 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Puoi distruggere 1 quartiere di un avversario pagando alla banca il suo costo meno 1 moneta.
                (Non puoi attaccare città con 7+ quartieri, il Vescovo o il Mastio):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {otherPlayers.map((targetPlayer: CitadelsPlayer) => {
                  const isImmune7 = countBuiltDistricts(targetPlayer) >= 7;
                  const isBishop = targetPlayer.characterId === 13;
                  const isProtected = isImmune7 || isBishop;

                  return (
                    <div
                      key={targetPlayer.id}
                      style={{
                        padding: '1rem',
                        background: '#181220',
                        border: '1px solid rgba(201, 168, 76, 0.25)',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          paddingBottom: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                            {targetPlayer.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#fae596' }}>
                            ({countBuiltDistricts(targetPlayer)}/7 quartieri)
                          </span>
                        </div>

                        {isProtected && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#ff7675',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <Shield size={14} />
                            {isImmune7 ? 'Città completata (Immune)' : 'Protetto dal Vescovo'}
                          </div>
                        )}
                      </div>

                      {targetPlayer.builtDistricts.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                          Nessun quartiere costruito.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '0.65rem',
                          }}
                        >
                          {targetPlayer.builtDistricts.map((bd: BuiltDistrict) => {
                            const district = getDistrictById(bd.districtId);
                            const isMastio = bd.districtId === 512;
                            // Grande Muraglia adds 1 cost to destruction
                            const wallBonus =
                              targetPlayer.builtDistricts.some((b: BuiltDistrict) => b.districtId === 509) && bd.districtId !== 509
                                ? 1
                                : 0;
                            const destroyCost = Math.max(0, district.cost - 1 + wallBonus);
                            const canAfford = myPlayer.gold >= destroyCost;
                            const canDestroy = !isProtected && !isMastio && canAfford;

                            return (
                              <div
                                key={bd.uid}
                                style={{
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#100c16',
                                  border: `1px solid ${canDestroy ? 'rgba(192, 57, 43, 0.6)' : 'rgba(255,255,255,0.1)'}`,
                                  opacity: canDestroy ? 1 : 0.6,
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <div style={{ height: '80px', width: '100%', overflow: 'hidden' }}>
                                  <img
                                    src={district.image}
                                    alt={district.nameIt}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                                <div style={{ padding: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#fff', marginBottom: '2px' }}>
                                    {district.nameIt}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#ffd54f', marginBottom: '6px' }}>
                                    Costo: {destroyCost}🪙
                                  </div>

                                  <div style={{ marginTop: 'auto' }}>
                                    {canDestroy ? (
                                      <button
                                        onClick={() => onWarlordDestroy(targetPlayer.id, bd.uid)}
                                        style={{
                                          width: '100%',
                                          padding: '0.35rem',
                                          background: 'linear-gradient(135deg, #c0392b, #8b1e15)',
                                          border: 'none',
                                          borderRadius: '4px',
                                          color: '#fff',
                                          fontWeight: 800,
                                          fontSize: '0.7rem',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Distruggi
                                      </button>
                                    ) : (
                                      <div
                                        style={{
                                          fontSize: '0.65rem',
                                          color: 'rgba(255,255,255,0.4)',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {isMastio ? 'Mastio immune' : !canAfford ? 'Oro insuff.' : 'Protetto'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. MARESCIALLO (Rank 8, ID 23)                                 */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 23 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Il Maresciallo può requisire 1 quartiere di costo ≤3 pagandone il costo al proprietario.
                (Non puoi attaccare città con 7+ quartieri, il Vescovo o il Mastio):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {otherPlayers.map((targetPlayer: CitadelsPlayer) => {
                  const isImmune7 = countBuiltDistricts(targetPlayer) >= 7;
                  const isBishop = targetPlayer.characterId === 13;
                  const isProtected = isImmune7 || isBishop;

                  return (
                    <div
                      key={targetPlayer.id}
                      style={{
                        padding: '1rem',
                        background: '#181220',
                        border: '1px solid rgba(201, 168, 76, 0.25)',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          paddingBottom: '0.5rem',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                          {targetPlayer.name} ({countBuiltDistricts(targetPlayer)}/7 quartieri)
                        </span>
                        {isProtected && (
                          <div style={{ color: '#ff7675', fontSize: '0.75rem', fontWeight: 700 }}>
                            <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Immune
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                          gap: '0.65rem',
                        }}
                      >
                        {targetPlayer.builtDistricts.map((bd: BuiltDistrict) => {
                          const district = getDistrictById(bd.districtId);
                          const isMastio = bd.districtId === 512;
                          const wallBonus =
                            targetPlayer.builtDistricts.some((b: BuiltDistrict) => b.districtId === 509) && bd.districtId !== 509
                              ? 1
                              : 0;
                          const seizeCost = district.cost + wallBonus;
                          const isCostValid = district.cost <= 3;
                          const canAfford = myPlayer.gold >= seizeCost;
                          const canSeize = !isProtected && !isMastio && isCostValid && canAfford;

                          return (
                            <div
                              key={bd.uid}
                              style={{
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: '#100c16',
                                border: `1px solid ${canSeize ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                                opacity: canSeize ? 1 : 0.6,
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <div style={{ height: '80px', width: '100%', overflow: 'hidden' }}>
                                <img
                                  src={district.image}
                                  alt={district.nameIt}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ padding: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#fff' }}>
                                  {district.nameIt}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#ffd54f', marginBottom: '6px' }}>
                                  Costo: {seizeCost}🪙
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                  {canSeize ? (
                                    <button
                                      onClick={() => onMarshalSeize(targetPlayer.id, bd.uid)}
                                      style={{
                                        width: '100%',
                                        padding: '0.35rem',
                                        background: 'linear-gradient(135deg, #c9a84c, #8c681e)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#1a1520',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Requisici
                                    </button>
                                  ) : (
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                                      {!isCostValid ? 'Costo > 3' : isMastio ? 'Immune' : !canAfford ? 'Oro insuff.' : 'Protetto'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 8. DIPLOMATICO (Rank 8, ID 24)                                 */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 24 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Seleziona 1 tuo quartiere e 1 quartiere di un avversario da scambiare. Pagherai la differenza di costo in oro se il quartiere acquisito costa di più:
              </p>

              {/* Step 1: Select My District */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fae596', display: 'block', marginBottom: '0.5rem' }}>
                  1. Scegli il tuo quartiere da cedere:
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.6rem',
                  }}
                >
                  {myPlayer.builtDistricts.map((bd: BuiltDistrict) => {
                    const district = getDistrictById(bd.districtId);
                    const isSelected = diplomatMyUid === bd.uid;
                    return (
                      <div
                        key={bd.uid}
                        onClick={() => setDiplomatMyUid(bd.uid)}
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: isSelected ? 'rgba(201, 168, 76, 0.3)' : '#100c16',
                          border: `2px solid ${isSelected ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ height: '70px', width: '100%', overflow: 'hidden' }}>
                          <img src={district.image} alt={district.nameIt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '0.4rem', textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>{district.nameIt}</div>
                          <div style={{ fontSize: '0.68rem', color: '#ffd54f' }}>🪙 {district.cost}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Target District */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fae596', display: 'block', marginBottom: '0.5rem' }}>
                  2. Scegli il quartiere avversario da ricevere:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {otherPlayers.map((player: CitadelsPlayer) => {
                    const isImmune = countBuiltDistricts(player) >= 7 || player.characterId === 13;
                    if (isImmune) return null;

                    return (
                      <div key={player.id} style={{ padding: '0.75rem', background: '#16111f', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>
                          {player.name}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                          {player.builtDistricts.map((bd: BuiltDistrict) => {
                            const district = getDistrictById(bd.districtId);
                            const isSelected = diplomatTargetUid === bd.uid;
                            const isMastio = bd.districtId === 512;
                            if (isMastio) return null;

                            return (
                              <div
                                key={bd.uid}
                                onClick={() => {
                                  setDiplomatTargetPlayerId(player.id);
                                  setDiplomatTargetUid(bd.uid);
                                }}
                                style={{
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: isSelected ? 'rgba(85, 239, 196, 0.25)' : '#100c16',
                                  border: `2px solid ${isSelected ? '#55efc4' : 'rgba(255,255,255,0.1)'}`,
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ height: '70px', width: '100%', overflow: 'hidden' }}>
                                  <img src={district.image} alt={district.nameIt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '0.4rem', textAlign: 'center' }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>{district.nameIt}</div>
                                  <div style={{ fontSize: '0.68rem', color: '#ffd54f' }}>🪙 {district.cost}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Swap */}
              {diplomatMyUid && diplomatTargetUid && diplomatTargetPlayerId && (
                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                  {(() => {
                    const myBd = myPlayer.builtDistricts.find((b: BuiltDistrict) => b.uid === diplomatMyUid);
                    const targetPlayer = state.players.find((p: CitadelsPlayer) => p.id === diplomatTargetPlayerId);
                    const targetBd = targetPlayer?.builtDistricts.find((b: BuiltDistrict) => b.uid === diplomatTargetUid);
                    if (!myBd || !targetBd) return null;

                    const myCost = getDistrictById(myBd.districtId).cost;
                    const targetCost = getDistrictById(targetBd.districtId).cost;
                    const diff = Math.max(0, targetCost - myCost);
                    const canAfford = myPlayer.gold >= diff;

                    return (
                      <button
                        onClick={() => onDiplomatSwap(diplomatMyUid, diplomatTargetPlayerId, diplomatTargetUid)}
                        disabled={!canAfford}
                        style={{
                          padding: '0.85rem 2rem',
                          background: canAfford
                            ? 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)'
                            : 'rgba(255,255,255,0.08)',
                          border: '1px solid #fae596',
                          borderRadius: '10px',
                          color: canAfford ? '#1a1520' : 'rgba(255,255,255,0.4)',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                        }}
                      >
                        🤝 Esegui Scambio (Differenza: {diff} 🪙)
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 9. SPIA (Rank 2, ID 6)                                         */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 6 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Scegli un giocatore e un colore. Esaminerai la sua mano: per ogni carta di quel colore, guadagnerai 1 oro e pescherai 1 carta dal mazzo!
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fae596', display: 'block', marginBottom: '0.5rem' }}>
                  1. Scegli il giocatore da spiare:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {otherPlayers.map((player: CitadelsPlayer) => {
                    const isSelected = spyTargetId === player.id;
                    return (
                      <div
                        key={player.id}
                        onClick={() => setSpyTargetId(player.id)}
                        style={{
                          padding: '0.85rem',
                          background: isSelected ? 'rgba(201, 168, 76, 0.25)' : '#1a1424',
                          border: `2px solid ${isSelected ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{player.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                          🃏 {player.hand.length} carte in mano
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fae596', display: 'block', marginBottom: '0.5rem' }}>
                  2. Scegli il colore di quartiere da cercare:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.65rem' }}>
                  {['yellow', 'blue', 'green', 'red'].map((colorKey) => {
                    const cInfo = COLOR_CONFIG[colorKey];
                    const isSelected = spyColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        onClick={() => setSpyColor(colorKey)}
                        style={{
                          padding: '0.75rem',
                          background: isSelected ? cInfo.bg : 'rgba(0,0,0,0.3)',
                          border: `2px solid ${isSelected ? cInfo.border : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          color: cInfo.text,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{cInfo.icon}</span>
                        <span>{cInfo.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    if (spyTargetId) {
                      onSpyReveal(spyTargetId, spyColor);
                    }
                  }}
                  disabled={!spyTargetId}
                  style={{
                    padding: '0.85rem 2rem',
                    background: !spyTargetId
                      ? 'rgba(255,255,255,0.08)'
                      : 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                    border: '1px solid #fae596',
                    borderRadius: '10px',
                    color: !spyTargetId ? 'rgba(255,255,255,0.4)' : '#1a1520',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: !spyTargetId ? 'not-allowed' : 'pointer',
                  }}
                >
                  🔍 Spia Mano
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 10. NAVIGATORE (Rank 7, ID 21)                                 */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 21 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'rgba(244, 237, 226, 0.85)' }}>
                Il Navigatore raccoglie un ingente carico dalla sua spedizione. Scegli se ottenere <strong>4 Oro</strong> o <strong>4 Carte</strong>.
                <br />
                <span style={{ color: '#e74c3c', fontSize: '0.85rem' }}>
                  Nota: Se utilizzi questa abilità, NON potrai costruire alcun quartiere in questo turno!
                </span>
              </p>

              <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigatorChoose('gold')}
                  style={{
                    padding: '1.5rem 2rem',
                    background: 'linear-gradient(135deg, rgba(230, 184, 0, 0.3) 0%, rgba(184, 134, 11, 0.15) 100%)',
                    border: '2px solid #e6b800',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    color: '#ffd54f',
                    minWidth: '220px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🪙</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>4 Oro</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    Aggiungi 4 monete al tuo tesoro
                  </div>
                </button>

                <button
                  onClick={() => onNavigatorChoose('cards')}
                  style={{
                    padding: '1.5rem 2rem',
                    background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.3) 0%, rgba(75, 30, 100, 0.15) 100%)',
                    border: '2px solid #8e44ad',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    color: '#d29bfe',
                    minWidth: '220px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🃏</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>4 Carte</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    Pesca 4 carte distretto dal mazzo
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CARDINALE (Rank 5, ID 15)                                      */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 15 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'rgba(244, 237, 226, 0.85)' }}>
                Il Cardinale può costruire un distretto pagando parte del costo con <strong>carte</strong> date
                a un altro giocatore, il quale è obbligato a scambiare <strong>1 oro per carta ricevuta</strong>.
              </p>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'rgba(201,168,76,0.7)' }}>
                Non puoi dare più carte del costo del distretto, né più del numero di ori del giocatore scelto.
              </p>
              <button
                onClick={() => { if (onCardinalBuild) onCardinalBuild(); }}
                disabled={!onCardinalBuild}
                style={{
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: onCardinalBuild ? 'pointer' : 'not-allowed',
                  background: onCardinalBuild ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.1)',
                  color: onCardinalBuild ? '#fff' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: onCardinalBuild ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                }}
              >
                ⛪ Costruisci con Carte (Cardinale)
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* VEGGENTE (Rank 3, ID 9)                                        */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 9 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'rgba(244, 237, 226, 0.85)' }}>
                La Veggente pesca <strong>1 carta a caso</strong> dalla mano di ciascun giocatore.
                Poi dovrà restituire <strong>1 carta</strong> ad ognuno di essi, scelta tra tutte le carte in mano.
              </p>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'rgba(201,168,76,0.7)' }}>
                Può anche costruire fino a 2 distretti per turno.
              </p>
              <button
                onClick={() => { if (onVeggenteTake) onVeggenteTake(); }}
                disabled={!onVeggenteTake}
                style={{
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: onVeggenteTake ? 'pointer' : 'not-allowed',
                  background: onVeggenteTake ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.1)',
                  color: onVeggenteTake ? '#fff' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: onVeggenteTake ? '0 4px 15px rgba(168, 85, 247, 0.4)' : 'none',
                }}
              >
                🔮 Pesca Carte dagli Altri Giocatori
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* 11. ARTISTA (Rank 9, ID 26)                                    */}
          {/* ============================================================== */}
          {!isBlackmailerDecide && character?.id === 26 && (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'rgba(244, 237, 226, 0.8)' }}>
                Puoi abbellire fino a 2 quartieri già costruiti nella tua città piazzando 1 oro su ciascuno (costo: 1 oro per quartiere).
                Ogni moneta varrà +1 punto extra a fine partita:
              </p>

              {myPlayer.builtDistricts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.5)' }}>
                  Non hai ancora quartieri costruiti nella tua città da abbellire.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {myPlayer.builtDistricts.map((bd: BuiltDistrict) => {
                      const district = getDistrictById(bd.districtId);
                      const isSelected = artistSelectedUids.includes(bd.uid);
                      return (
                        <div
                          key={bd.uid}
                          onClick={() =>
                            toggleCardSelection(bd.uid, artistSelectedUids, setArtistSelectedUids, 2)
                          }
                          style={{
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: '#1a1424',
                            border: `2px solid ${isSelected ? '#f39c12' : 'rgba(255,255,255,0.15)'}`,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ height: '90px', width: '100%', overflow: 'hidden' }}>
                            <img src={district.image} alt={district.nameIt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{district.nameIt}</div>
                            <div style={{ fontSize: '0.7rem', color: '#ffd54f' }}>
                              Abbellimenti: {bd.artisanCoins || 0} 🪙
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#f39c12',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#1a1520',
                                fontWeight: 900,
                                fontSize: '0.75rem',
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    {(() => {
                      const cost = artistSelectedUids.length;
                      const canAfford = myPlayer.gold >= cost;
                      return (
                        <button
                          onClick={() => onArtistEmbellish(artistSelectedUids)}
                          disabled={cost === 0 || !canAfford}
                          style={{
                            padding: '0.75rem 2rem',
                            background:
                              cost === 0 || !canAfford
                                ? 'rgba(255,255,255,0.08)'
                                : 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                            border: '1px solid #fae596',
                            borderRadius: '10px',
                            color: cost === 0 || !canAfford ? 'rgba(255,255,255,0.4)' : '#1a1520',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            cursor: cost === 0 || !canAfford ? 'not-allowed' : 'pointer',
                          }}
                        >
                          🎨 Abbellisci {cost} Quartieri (Costo: {cost} 🪙)
                        </button>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 12. OTHER PASSIVE / AUTOMATIC CHARACTERS                       */}
          {/* ============================================================== */}
          {!isBlackmailerDecide &&
            character &&
            ![1, 4, 7, 11, 22, 23, 24, 6, 21, 26].includes(character.id) && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1rem', color: 'rgba(244, 237, 226, 0.9)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  L&apos;abilità di <strong>{character.nameIt}</strong> viene applicata automaticamente durante le varie fasi del round:
                </div>
                <div
                  style={{
                    maxWidth: '520px',
                    margin: '0 auto 1.5rem auto',
                    padding: '1rem',
                    background: 'rgba(201, 168, 76, 0.1)',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '10px',
                    color: '#fae596',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {character.effectTextIt}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.5rem',
                    background: 'linear-gradient(135deg, #c9a84c, #8c681e)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#1a1520',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Ho Capito
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
