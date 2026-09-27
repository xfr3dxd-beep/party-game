import React, { useState } from 'react';
import { CitadelsState, CitadelsPlayer, DistrictCard, BuiltDistrict } from '../types';
import { getCharacterById } from '../characters';
import { getDistrictById } from '../districts';
import { canBuild, hasBuiltDistrict, countBuiltDistricts } from '../gameLogic';
import {
  Coins,
  Layers,
  Hammer,
  Crown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Swords,
  Landmark,
  FlaskConical,
  Anvil,
  Scroll,
} from 'lucide-react';

interface CitadelsTurnProps {
  state: CitadelsState;
  myPlayer: CitadelsPlayer;
  isMyTurn: boolean;
  onGatherGold: () => void;
  onGatherCards: () => void;
  onPickDrawnCard: (cardUid: string) => void;
  onBuildDistrict: (cardUid: string) => void;
  onEndTurn: () => void;
  onCollectIncome: () => void;
  onTakeCrown: () => void;
  onUseEffect: () => void;
  onUseFucina: () => void;
  onUseLaboratorio: (cardUid: string) => void;
  onMuseoTuck: (cardUid: string) => void;
}

const DISTRICT_COLORS: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  blue: { label: 'Religioso', bg: 'rgba(41, 128, 185, 0.2)', text: '#74b9ff', border: '#2980b9', icon: '⛪' },
  green: { label: 'Commerciale', bg: 'rgba(39, 174, 96, 0.2)', text: '#55efc4', border: '#27ae60', icon: '💰' },
  yellow: { label: 'Nobiliare', bg: 'rgba(243, 156, 18, 0.2)', text: '#ffeaa7', border: '#f39c12', icon: '👑' },
  red: { label: 'Militare', bg: 'rgba(192, 57, 43, 0.2)', text: '#ff7675', border: '#c0392b', icon: '⚔️' },
  purple: { label: 'Speciale', bg: 'rgba(142, 68, 173, 0.2)', text: '#a29bfe', border: '#8e44ad', icon: '✨' },
};

export default function CitadelsTurn({
  state,
  myPlayer,
  isMyTurn,
  onGatherGold,
  onGatherCards,
  onPickDrawnCard,
  onBuildDistrict,
  onEndTurn,
  onCollectIncome,
  onTakeCrown,
  onUseEffect,
  onUseFucina,
  onUseLaboratorio,
  onMuseoTuck,
}: CitadelsTurnProps) {
  // Only visible when isMyTurn is true
  if (!isMyTurn) return null;

  const [specialMode, setSpecialMode] = useState<'none' | 'laboratorio' | 'museo'>('none');
  const [fucinaUsed, setFucinaUsed] = useState(false);
  const [incomeCollected, setIncomeCollected] = useState(false);

  const character = myPlayer.characterId ? getCharacterById(myPlayer.characterId) : null;

  // District specials owned
  const hasFucina = hasBuiltDistrict(myPlayer, 508);
  const hasLaboratorio = hasBuiltDistrict(myPlayer, 511);
  const hasMuseo = hasBuiltDistrict(myPlayer, 515);
  const hasMinieraOro = hasBuiltDistrict(myPlayer, 513);
  const hasOsservatorio = hasBuiltDistrict(myPlayer, 518);
  const hasBiblioteca = hasBuiltDistrict(myPlayer, 503);
  const hasFabbrica = hasBuiltDistrict(myPlayer, 507);

  // Income computation
  let incomeAmount = 0;
  if (character?.incomeColor) {
    const matchingCount = myPlayer.builtDistricts.filter(
      (bd: BuiltDistrict) => getDistrictById(bd.districtId).color === character.incomeColor
    ).length;
    // Mercante (16) gets +1 extra gold
    incomeAmount = matchingCount + (character.id === 16 ? 1 : 0);
  }

  // Draw amounts
  const goldGain = hasMinieraOro ? 3 : 2;
  const cardDrawCount = character?.id === 20 ? 7 : (hasOsservatorio ? 3 : 2);

  const handleFucina = () => {
    onUseFucina();
    setFucinaUsed(true);
  };

  const handleIncome = () => {
    onCollectIncome();
    setIncomeCollected(true);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1120px',
        margin: '1.5rem auto',
        padding: '1.25rem',
        background: 'linear-gradient(180deg, #1e1728 0%, #130f1a 100%)',
        border: '2px solid #c9a84c',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: '#f4ede2',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Banner: Active Character & Player Status */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(201, 168, 76, 0.3)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          {character && (
            <div
              style={{
                position: 'relative',
                width: '58px',
                height: '58px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #c9a84c',
                boxShadow: '0 4px 12px rgba(201, 168, 76, 0.3)',
                flexShrink: 0,
                background: '#0d0a12',
              }}
            >
              <img
                src={character.image}
                alt={character.nameIt}
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
                  padding: '2px 5px',
                  borderBottomRightRadius: '6px',
                }}
              >
                {character.rank}
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#c9a84c',
                  fontWeight: 700,
                }}
              >
                Il Tuo Turno
              </span>
              {myPlayer.hasCrown && (
                <span
                  style={{
                    background: 'rgba(201, 168, 76, 0.2)',
                    border: '1px solid #c9a84c',
                    color: '#fae596',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Crown size={11} color="#fae596" /> Corona
                </span>
              )}
            </div>
            <h2
              style={{
                margin: '2px 0 0 0',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '0.02em',
              }}
            >
              {character?.nameIt || 'Personaggio'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'rgba(244, 237, 226, 0.7)', marginTop: '2px' }}>
              {character?.effectTextIt}
            </div>
          </div>
        </div>

        {/* Player Stats Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '10px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fae596',
            }}
          >
            <Coins size={16} color="#c9a84c" />
            <span>{myPlayer.gold} Oro</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            <Layers size={16} color="#a29bfe" />
            <span>{myPlayer.hand.length} Carte</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            <Hammer size={16} color="#55efc4" />
            <span>
              Costruzioni: {myPlayer.buildsUsed}/{myPlayer.maxBuilds}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            <Landmark size={16} color="#ffd54f" />
            <span>Città: {countBuiltDistricts(myPlayer)}/7</span>
          </div>
        </div>
      </div>

      {/* Action Bar: Character Power, Income, Crown, Special Districts, End Turn */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          alignItems: 'center',
          marginBottom: '1.25rem',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '0.75rem',
          borderRadius: '12px',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        }}
      >
        {/* Character Effect Button */}
        {!myPlayer.hasUsedEffect && (
          <button
            onClick={onUseEffect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              background: 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
              border: '1px solid #fae596',
              borderRadius: '8px',
              color: '#1a1520',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(201, 168, 76, 0.35)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            <Swords size={16} />
            ⚔️ Usa Effetto
          </button>
        )}

        {/* Character Income Button */}
        {character?.incomeColor && (
          <button
            onClick={handleIncome}
            disabled={incomeCollected || incomeAmount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              background:
                incomeCollected || incomeAmount === 0
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'linear-gradient(135deg, rgba(230, 184, 0, 0.25) 0%, rgba(201, 168, 76, 0.1) 100%)',
              border: `1px solid ${incomeCollected || incomeAmount === 0 ? 'rgba(255,255,255,0.1)' : '#f39c12'}`,
              borderRadius: '8px',
              color: incomeCollected || incomeAmount === 0 ? 'rgba(255,255,255,0.4)' : '#ffd54f',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: incomeCollected || incomeAmount === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Coins size={15} />
            💰 Riscuoti Reddito {incomeAmount > 0 ? `(+${incomeAmount}🪙)` : '(0)'}
            {incomeCollected && ' ✓'}
          </button>
        )}

        {/* Crown button for rank 4 */}
        {character?.rank === 4 && !myPlayer.hasCrown && (
          <button
            onClick={onTakeCrown}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              background: 'linear-gradient(135deg, #e6b800 0%, #b8860b 100%)',
              border: '1px solid #ffd54f',
              borderRadius: '8px',
              color: '#1a1520',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(230, 184, 0, 0.35)',
            }}
          >
            <Crown size={15} />
            👑 Prendi Corona
          </button>
        )}

        {/* Special District: Fucina */}
        {hasFucina && (
          <button
            onClick={handleFucina}
            disabled={fucinaUsed || myPlayer.gold < 2}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.9rem',
              background:
                fucinaUsed || myPlayer.gold < 2
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(142, 68, 173, 0.25)',
              border: `1px solid ${fucinaUsed || myPlayer.gold < 2 ? 'rgba(255,255,255,0.1)' : '#8e44ad'}`,
              borderRadius: '8px',
              color: fucinaUsed || myPlayer.gold < 2 ? 'rgba(255,255,255,0.4)' : '#d29bfe',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: fucinaUsed || myPlayer.gold < 2 ? 'not-allowed' : 'pointer',
            }}
          >
            <Anvil size={15} />
            🔨 Fucina (2🪙 → 3🃏)
            {fucinaUsed && ' ✓'}
          </button>
        )}

        {/* Special District: Laboratorio */}
        {hasLaboratorio && (
          <button
            onClick={() => setSpecialMode(specialMode === 'laboratorio' ? 'none' : 'laboratorio')}
            disabled={myPlayer.hand.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.9rem',
              background:
                specialMode === 'laboratorio'
                  ? 'rgba(142, 68, 173, 0.5)'
                  : myPlayer.hand.length === 0
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(142, 68, 173, 0.25)',
              border: `1px solid ${specialMode === 'laboratorio' ? '#d29bfe' : '#8e44ad'}`,
              borderRadius: '8px',
              color: myPlayer.hand.length === 0 ? 'rgba(255,255,255,0.4)' : '#d29bfe',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: myPlayer.hand.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <FlaskConical size={15} />
            🧪 Laboratorio (Scarta 1🃏 → 2🪙)
            {specialMode === 'laboratorio' && ' (Attivo)'}
          </button>
        )}

        {/* Special District: Museo */}
        {hasMuseo && (
          <button
            onClick={() => setSpecialMode(specialMode === 'museo' ? 'none' : 'museo')}
            disabled={myPlayer.hand.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.9rem',
              background:
                specialMode === 'museo'
                  ? 'rgba(142, 68, 173, 0.5)'
                  : myPlayer.hand.length === 0
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(142, 68, 173, 0.25)',
              border: `1px solid ${specialMode === 'museo' ? '#d29bfe' : '#8e44ad'}`,
              borderRadius: '8px',
              color: myPlayer.hand.length === 0 ? 'rgba(255,255,255,0.4)' : '#d29bfe',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: myPlayer.hand.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Scroll size={15} />
            🏛️ Museo (Conserva 1🃏)
            {specialMode === 'museo' && ' (Attivo)'}
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* End Turn Button */}
        <button
          onClick={onEndTurn}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.25rem',
            background: 'linear-gradient(135deg, #27ae60 0%, #1e824c 100%)',
            border: '1px solid #55efc4',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(39, 174, 96, 0.35)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
        >
          <CheckCircle2 size={16} />
          ✅ Fine Turno
        </button>
      </div>

      {/* Special Mode Active Notice */}
      {specialMode !== 'none' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            borderRadius: '10px',
            background: 'rgba(142, 68, 173, 0.25)',
            border: '1px solid #ba68c8',
            color: '#f4ede2',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#ba68c8" />
            <span>
              {specialMode === 'laboratorio'
                ? '🧪 Clicca su una carta della tua mano qui sotto per scartarla e ottenere 2 Oro.'
                : '🏛️ Clicca su una carta della tua mano qui sotto per conservarla sotto il Museo (+1 punto a fine partita).'}
            </span>
          </div>
          <button
            onClick={() => setSpecialMode('none')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
            }}
          >
            <X size={14} /> Annulla
          </button>
        </div>
      )}

      {/* Drawn Cards Choice (if state.drawnCards exists) */}
      {state.drawnCards && state.drawnCards.length > 0 && (
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(201, 168, 76, 0.1)',
            border: '2px dashed #c9a84c',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Sparkles size={20} color="#fae596" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fae596', fontWeight: 800 }}>
              Scegli 1 carta da tenere
            </h3>
          </div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'rgba(244, 237, 226, 0.8)' }}>
            Le altre carte verranno riposte in fondo al mazzo dei distretti.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {state.drawnCards.map((card: DistrictCard) => {
              const district = getDistrictById(card.districtId);
              const colorInfo = DISTRICT_COLORS[district.color] || DISTRICT_COLORS.purple;
              return (
                <div
                  key={card.uid}
                  onClick={() => onPickDrawnCard(card.uid)}
                  style={{
                    width: '150px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#1a1520',
                    border: '2px solid rgba(201, 168, 76, 0.6)',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.6)',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#fae596';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.6)';
                  }}
                >
                  <div style={{ height: '120px', width: '100%', overflow: 'hidden', background: '#0d0a12' }}>
                    <img
                      src={district.image}
                      alt={district.nameIt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '2px' }}>
                      {district.nameIt}
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: colorInfo.bg,
                        color: colorInfo.text,
                        border: `1px solid ${colorInfo.border}`,
                        marginBottom: '4px',
                      }}
                    >
                      {colorInfo.icon} {colorInfo.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffd54f' }}>
                      Costo: 🪙 {district.cost}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPickDrawnCard(card.uid);
                      }}
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        padding: '0.4rem',
                        background: 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#1a1520',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Tieni Questa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 1: Resource Gathering (if !myPlayer.hasGathered) */}
      {!myPlayer.hasGathered && (
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '14px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c9a84c',
                fontWeight: 700,
              }}
            >
              Fase 1 del Turno
            </span>
            <h3 style={{ margin: '3px 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Raccolta Risorse
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(244, 237, 226, 0.75)' }}>
              Scegli se accumulare oro dal tesoro oppure pescare nuove carte distretto per ampliare la tua mano:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            {/* Gather Gold Button */}
            <button
              onClick={onGatherGold}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 1rem',
                background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(140, 104, 30, 0.15) 100%)',
                border: '2px solid #c9a84c',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#fae596',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#fae596';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#c9a84c';
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🪙</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                🪙 Prendi {goldGain} Oro
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(250, 229, 150, 0.8)' }}>
                {hasMinieraOro ? "Include +1 oro bonus della Miniera d'Oro" : 'Aggiungi 2 monete alla tua riserva'}
              </div>
            </button>

            {/* Gather Cards Button */}
            <button
              onClick={onGatherCards}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 1rem',
                background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.25) 0%, rgba(75, 30, 100, 0.15) 100%)',
                border: '2px solid #8e44ad',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#d29bfe',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#d29bfe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#8e44ad';
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>🃏</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                🃏 Pesca {cardDrawCount} Carte
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(210, 155, 254, 0.85)' }}>
                {hasBiblioteca
                  ? 'Grazie alla Biblioteca tieni TUTTE le carte!'
                  : `Ne peschi ${cardDrawCount} e ne scegli 1 da tenere`}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Hand & Building */}
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.85rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Hammer size={18} color="#c9a84c" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                La tua Mano & Edificazione
              </h3>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'rgba(244, 237, 226, 0.7)' }}>
              {!myPlayer.hasGathered
                ? 'Raccogli prima le risorse per poter costruire quartieri in questo turno.'
                : myPlayer.buildsUsed >= myPlayer.maxBuilds
                ? 'Hai utilizzato tutte le costruzioni disponibili per questo turno.'
                : 'Clicca su un quartiere per edificarlo nella tua città:'}
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#c9a84c', fontWeight: 700 }}>
            {myPlayer.hand.length} {myPlayer.hand.length === 1 ? 'carta' : 'carte'} disponibili
          </div>
        </div>

        {myPlayer.hand.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.9rem',
            }}
          >
            Non hai carte distretto in mano. Raccogli carte o usa le abilità speciali per acquisirne.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {myPlayer.hand.map((card: DistrictCard) => {
              const district = getDistrictById(card.districtId);
              const colorInfo = DISTRICT_COLORS[district.color] || DISTRICT_COLORS.purple;
              const buildCheck = canBuild(myPlayer, card, state);

              // Fabbrica discount on viola
              let effectiveCost = district.cost;
              if (district.isUnique && hasFabbrica) {
                effectiveCost = Math.max(0, district.cost - 1);
              }

              // Special actions mode handling
              if (specialMode === 'laboratorio') {
                return (
                  <div
                    key={card.uid}
                    onClick={() => {
                      onUseLaboratorio(card.uid);
                      setSpecialMode('none');
                    }}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'rgba(142, 68, 173, 0.15)',
                      border: '2px solid #8e44ad',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                      <img src={district.image} alt={district.nameIt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '0.6rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{district.nameIt}</div>
                      <button
                        style={{
                          marginTop: '0.4rem',
                          width: '100%',
                          padding: '0.35rem',
                          background: 'linear-gradient(135deg, #8e44ad, #6c3483)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Scarta (+2 🪙)
                      </button>
                    </div>
                  </div>
                );
              }

              if (specialMode === 'museo') {
                return (
                  <div
                    key={card.uid}
                    onClick={() => {
                      onMuseoTuck(card.uid);
                      setSpecialMode('none');
                    }}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'rgba(142, 68, 173, 0.15)',
                      border: '2px solid #ba68c8',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                      <img src={district.image} alt={district.nameIt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '0.6rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{district.nameIt}</div>
                      <button
                        style={{
                          marginTop: '0.4rem',
                          width: '100%',
                          padding: '0.35rem',
                          background: 'linear-gradient(135deg, #ba68c8, #8e44ad)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Metti nel Museo
                      </button>
                    </div>
                  </div>
                );
              }

              // Normal building mode
              const isScuderie = district.id === 525;
              const hasRemainingBuilds = myPlayer.buildsUsed < myPlayer.maxBuilds || isScuderie;
              const isEligibleToBuild = myPlayer.hasGathered && hasRemainingBuilds && buildCheck.ok;

              return (
                <div
                  key={card.uid}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#181220',
                    border: `2px solid ${isEligibleToBuild ? colorInfo.border : 'rgba(255, 255, 255, 0.1)'}`,
                    opacity: isEligibleToBuild ? 1 : 0.65,
                    boxShadow: isEligibleToBuild ? '0 6px 18px rgba(0,0,0,0.5)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isEligibleToBuild) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isEligibleToBuild) {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Card Image */}
                  <div style={{ position: 'relative', height: '115px', width: '100%', overflow: 'hidden', background: '#0a080f' }}>
                    <img
                      src={district.image}
                      alt={district.nameIt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Cost Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(26, 21, 32, 0.9)',
                        border: '1px solid #c9a84c',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        color: '#ffd54f',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      <span>🪙</span>
                      <span>{effectiveCost}</span>
                      {hasFabbrica && district.isUnique && district.cost > 0 && (
                        <span style={{ fontSize: '0.65rem', color: '#55efc4', textDecoration: 'line-through' }}>
                          {district.cost}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div style={{ padding: '0.65rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>
                        {district.nameIt}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: colorInfo.bg,
                        color: colorInfo.text,
                        border: `1px solid ${colorInfo.border}`,
                        marginBottom: '6px',
                        alignSelf: 'flex-start',
                      }}
                    >
                      <span>{colorInfo.icon}</span>
                      <span>{colorInfo.label}</span>
                    </div>

                    {district.effectTextIt && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'rgba(244, 237, 226, 0.75)',
                          lineHeight: 1.3,
                          marginBottom: '8px',
                          flex: 1,
                        }}
                      >
                        {district.effectTextIt}
                      </div>
                    )}

                    {/* Build Button or Reason */}
                    <div style={{ marginTop: 'auto' }}>
                      {isEligibleToBuild ? (
                        <button
                          onClick={() => onBuildDistrict(card.uid)}
                          style={{
                            width: '100%',
                            padding: '0.45rem',
                            background: 'linear-gradient(135deg, #c9a84c 0%, #8c681e 100%)',
                            border: '1px solid #fae596',
                            borderRadius: '6px',
                            color: '#1a1520',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'filter 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                        >
                          <Hammer size={12} /> Costruisci (-{effectiveCost}🪙)
                        </button>
                      ) : (
                        <div
                          style={{
                            padding: '0.35rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '0.68rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                          }}
                        >
                          <AlertCircle size={11} />
                          <span>
                            {!myPlayer.hasGathered
                              ? 'Raccogli prima'
                              : !hasRemainingBuilds
                              ? 'Limite raggiunto'
                              : buildCheck.reason || 'Non edificabile'}
                          </span>
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
    </div>
  );
}
