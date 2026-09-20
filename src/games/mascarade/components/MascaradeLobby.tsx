import React, { useState, useEffect } from 'react';
import { TABLES, getRoleById, ALL_ROLES } from '../roles';
import { MascaradeRole } from '../types';
import { RoomPlayer } from '../hooks/useMascaradeRoom';
import {
  Users,
  Crown,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  Play,
  Layers,
  X,
  ShieldAlert,
  Info,
  BookOpen,
} from 'lucide-react';

export interface MascaradeLobbyProps {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  onStartGame: (variant: 'A' | 'B') => void;
}

export default function MascaradeLobby({
  roomCode,
  players,
  isHost,
  onStartGame,
}: MascaradeLobbyProps) {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MascaradeRole | null>(null);

  // Default preview player count reflects joined players, clamped to 6-12
  const effectiveCount = Math.min(12, Math.max(6, players.length));
  const [previewCount, setPreviewCount] = useState<number>(effectiveCount);

  // Sync preview count when player count changes (unless host explicitly chose to preview another count)
  useEffect(() => {
    setPreviewCount(Math.min(12, Math.max(6, players.length)));
  }, [players.length]);

  const canStart = players.length >= 6 && players.length <= 12;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get roles in game for the currently previewed player count and selected variant
  const currentRoleIds = TABLES[previewCount]?.[variant] || TABLES[6][variant];
  const roleCards = currentRoleIds.map((id) => getRoleById(id));

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '1.5rem 1rem 3rem 1rem',
        color: '#ffffff',
      }}
    >
      {/* Top Header: Room Code & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            background: 'rgba(212, 168, 67, 0.12)',
            border: '1px solid rgba(212, 168, 67, 0.35)',
            color: '#d4a843',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
          }}
        >
          🎭 Stanza di Mascarade
        </div>

        <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
          Codice Stanza
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(20, 18, 28, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '0.6rem 1.4rem',
            borderRadius: '16px',
            border: '1px solid rgba(212, 168, 67, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              letterSpacing: '0.3em',
              fontFamily: 'monospace',
              color: '#f6d37a',
              textShadow: '0 0 15px rgba(212, 168, 67, 0.4)',
              marginLeft: '0.15em',
            }}
          >
            {roomCode}
          </span>

          <button
            onClick={handleCopyCode}
            title="Copia codice"
            style={{
              background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 168, 67, 0.18)',
              border: `1px solid ${copied ? '#22c55e' : 'rgba(212, 168, 67, 0.4)'}`,
              color: copied ? '#4ade80' : '#d4a843',
              padding: '0.6rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Players, Right = Variant & Roles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* ================= PLAYERS PANEL ================= */}
        <div
          style={{
            background: 'rgba(22, 20, 32, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(212, 168, 67, 0.25)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(212, 168, 67, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'rgba(212, 168, 67, 0.15)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  color: '#d4a843',
                  display: 'flex',
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Giocatori ({players.length}/12)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)' }}>
                  Minimo 6 • Massimo 12
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowRules(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(212, 168, 67, 0.12)',
                border: '1px solid rgba(212, 168, 67, 0.35)',
                color: '#d4a843',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <HelpCircle size={15} />
              Regole
            </button>
          </div>

          {/* Status banner */}
          <div
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background:
                players.length < 6
                  ? 'rgba(245, 158, 11, 0.12)'
                  : players.length > 12
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(34, 197, 94, 0.12)',
              border: `1px solid ${
                players.length < 6
                  ? 'rgba(245, 158, 11, 0.3)'
                  : players.length > 12
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(34, 197, 94, 0.3)'
              }`,
              color:
                players.length < 6
                  ? '#fbbf24'
                  : players.length > 12
                  ? '#f87171'
                  : '#4ade80',
            }}
          >
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              {players.length < 6
                ? `Mancano ancora ${6 - players.length} giocatori per poter iniziare`
                : players.length > 12
                ? 'Stanza piena! Il massimo consentito è 12 giocatori'
                : 'Numero di giocatori ottimale per iniziare!'}
            </span>
          </div>

          {/* Player Badges Grid (12 slots) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.65rem',
              overflowY: 'auto',
              maxHeight: '340px',
              paddingRight: '0.2rem',
            }}
          >
            {players.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  background: 'rgba(30, 27, 44, 0.8)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.5rem',
                  textAlign: 'center',
                  border: p.isHost
                    ? '1.5px solid #d4a843'
                    : '1px solid rgba(212, 168, 67, 0.25)',
                  boxShadow: p.isHost ? '0 0 12px rgba(212, 168, 67, 0.2)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: p.isHost
                      ? 'linear-gradient(135deg, #f5d485, #b8860b)'
                      : 'rgba(212, 168, 67, 0.15)',
                    color: p.isHost ? '#1c1300' : '#d4a843',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  {idx + 1}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={p.name}
                >
                  {p.name}
                </div>

                {p.isHost ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#d4a843',
                      background: 'rgba(212, 168, 67, 0.15)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                    }}
                  >
                    <Crown size={11} /> Host
                  </div>
                ) : (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    Giocatore
                  </div>
                )}
              </div>
            ))}

            {/* Empty slots placeholders */}
            {Array.from({ length: Math.max(0, 12 - players.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  background: 'rgba(15, 14, 24, 0.4)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.5rem',
                  textAlign: 'center',
                  border: '1px dashed rgba(212, 168, 67, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  opacity: 0.55,
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.35)',
                    fontWeight: 600,
                  }}
                >
                  Slot {players.length + i + 1}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.3)' }}>
                  In attesa...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= VARIANT & ROLES PANEL ================= */}
        <div
          style={{
            background: 'rgba(22, 20, 32, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(212, 168, 67, 0.25)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Variant Selector Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(212, 168, 67, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  background: 'rgba(212, 168, 67, 0.15)',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  color: '#d4a843',
                  display: 'flex',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Variante di Gioco
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)' }}>
                  {isHost ? 'Scegli la combinazione di ruoli' : 'Variante impostata dall’host'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAllRoles(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 168, 67, 0.25)',
                color: '#d4a843',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <BookOpen size={14} />
              Tutti i ruoli
            </button>
          </div>

          {/* Variant Toggle Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            {/* Variant A */}
            <div
              onClick={() => isHost && setVariant('A')}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                cursor: isHost ? 'pointer' : 'default',
                background:
                  variant === 'A'
                    ? 'rgba(212, 168, 67, 0.18)'
                    : 'rgba(15, 14, 24, 0.5)',
                border:
                  variant === 'A'
                    ? '2px solid #d4a843'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow:
                  variant === 'A' ? '0 0 16px rgba(212, 168, 67, 0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.2rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: variant === 'A' ? '#f6d37a' : '#ffffff',
                  }}
                >
                  Variante A
                </span>
                {variant === 'A' && (
                  <span
                    style={{
                      background: '#d4a843',
                      color: '#1a1200',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                Equilibrata & Dinamica
              </div>
            </div>

            {/* Variant B */}
            <div
              onClick={() => isHost && setVariant('B')}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                cursor: isHost ? 'pointer' : 'default',
                background:
                  variant === 'B'
                    ? 'rgba(212, 168, 67, 0.18)'
                    : 'rgba(15, 14, 24, 0.5)',
                border:
                  variant === 'B'
                    ? '2px solid #d4a843'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow:
                  variant === 'B' ? '0 0 16px rgba(212, 168, 67, 0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.2rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: variant === 'B' ? '#f6d37a' : '#ffffff',
                  }}
                >
                  Variante B
                </span>
                {variant === 'B' && (
                  <span
                    style={{
                      background: '#d4a843',
                      color: '#1a1200',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                Tattica & Intrighi
              </div>
            </div>
          </div>

          {/* Role Preview Filter / Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d4a843' }}>
              Ruoli in gioco ({roleCards.length} carte per {previewCount} giocatori):
            </div>

            {/* Quick selector for previewing player counts */}
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginRight: '2px' }}>
                Simula:
              </span>
              {[6, 8, 10, 12].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setPreviewCount(cnt)}
                  style={{
                    background:
                      previewCount === cnt
                        ? '#d4a843'
                        : 'rgba(255, 255, 255, 0.08)',
                    color: previewCount === cnt ? '#1c1300' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '0.15rem 0.4rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Role Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
              gap: '0.6rem',
              overflowY: 'auto',
              maxHeight: '270px',
              paddingRight: '0.2rem',
            }}
          >
            {roleCards.map((role, idx) => (
              <div
                key={`${role.id}-${idx}`}
                onClick={() => setSelectedRole(role)}
                style={{
                  background: 'rgba(15, 14, 24, 0.7)',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 168, 67, 0.3)',
                  padding: '0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#d4a843';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(212, 168, 67, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '0.4rem',
                    background: '#0d0c13',
                  }}
                >
                  <img
                    src={role.image}
                    alt={role.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/Mascarade/Dorso.png';
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f6d37a',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={role.name}
                >
                  {role.name}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.45)',
              textAlign: 'center',
              marginTop: '0.6rem',
            }}
          >
            💡 Tocca una carta per visualizzarne la descrizione e il potere
          </div>
        </div>
      </div>

      {/* ================= ACTION SECTION ================= */}
      {isHost ? (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => onStartGame(variant)}
            disabled={!canStart}
            style={{
              padding: '1.1rem 3.5rem',
              fontSize: '1.25rem',
              fontWeight: 800,
              borderRadius: '16px',
              border: 'none',
              cursor: canStart ? 'pointer' : 'not-allowed',
              color: canStart ? '#1a1200' : 'rgba(255, 255, 255, 0.4)',
              background: canStart
                ? 'linear-gradient(135deg, #f5d485 0%, #d4a843 45%, #b8860b 100%)'
                : 'rgba(60, 50, 40, 0.4)',
              boxShadow: canStart
                ? '0 8px 30px rgba(212, 168, 67, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
            }}
            onMouseDown={(e) => {
              if (canStart) e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              if (canStart) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Play size={22} fill={canStart ? '#1a1200' : 'none'} />
            <span>Inizia Partita (Variante {variant})</span>
          </button>

          {!canStart && (
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                marginTop: '0.85rem',
              }}
            >
              {players.length < 6
                ? `Servono da 6 a 12 giocatori per iniziare (attualmente: ${players.length})`
                : `Troppi giocatori per iniziare (massimo 12, attualmente: ${players.length})`}
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: 'rgba(22, 20, 32, 0.65)',
            borderRadius: '16px',
            border: '1px solid rgba(212, 168, 67, 0.2)',
            maxWidth: '500px',
            margin: '1rem auto 0 auto',
          }}
        >
          <div
            style={{
              fontSize: '1.8rem',
              marginBottom: '0.5rem',
              animation: 'pulse 2s infinite ease-in-out',
            }}
          >
            ⏳
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f6d37a', marginBottom: '0.35rem' }}>
            In attesa dell'Host...
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.88rem' }}>
            L'host sta configurando la partita (Variante {variant}) con {players.length}/12 giocatori.
          </div>
        </div>
      )}

      {/* ================= MODAL: ROLE DETAILS ================= */}
      {selectedRole && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedRole(null)}
        >
          <div
            style={{
              background: 'rgba(24, 21, 35, 0.95)',
              borderRadius: '20px',
              border: '1px solid rgba(212, 168, 67, 0.4)',
              boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 168, 67, 0.2)',
              maxWidth: '380px',
              width: '100%',
              padding: '1.75rem',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRole(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: '140px',
                height: '190px',
                margin: '0 auto 1.25rem auto',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid rgba(212, 168, 67, 0.5)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
              }}
            >
              <img
                src={selectedRole.image}
                alt={selectedRole.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/Mascarade/Dorso.png';
                }}
              />
            </div>

            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#f6d37a',
                marginBottom: '0.4rem',
              }}
            >
              {selectedRole.name}
            </h3>

            <div
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.7rem',
                borderRadius: '12px',
                background: 'rgba(212, 168, 67, 0.15)',
                border: '1px solid rgba(212, 168, 67, 0.3)',
                color: '#d4a843',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Tipo: {selectedRole.effectType}
            </div>

            <p
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                margin: '0 0 1.5rem 0',
              }}
            >
              {selectedRole.description}
            </p>

            <button
              onClick={() => setSelectedRole(null)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #f5d485 0%, #d4a843 100%)',
                color: '#1a1200',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: ALL ROLES ENCYCLOPEDIA ================= */}
      {showAllRoles && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowAllRoles(false)}
        >
          <div
            style={{
              background: 'rgba(24, 21, 35, 0.96)',
              borderRadius: '20px',
              border: '1px solid rgba(212, 168, 67, 0.4)',
              boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8)',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid rgba(212, 168, 67, 0.2)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={22} color="#d4a843" />
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#f6d37a' }}>
                  Tutti i Ruoli di Mascarade ({ALL_ROLES.length})
                </h2>
              </div>
              <button
                onClick={() => setShowAllRoles(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
                paddingRight: '0.5rem',
              }}
            >
              {ALL_ROLES.map((role) => (
                <div
                  key={role.id}
                  style={{
                    background: 'rgba(15, 14, 24, 0.65)',
                    borderRadius: '12px',
                    border: '1px solid rgba(212, 168, 67, 0.2)',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={role.image}
                    alt={role.name}
                    style={{
                      width: '75px',
                      height: '105px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      marginBottom: '0.5rem',
                      border: '1px solid rgba(212, 168, 67, 0.3)',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/Mascarade/Dorso.png';
                    }}
                  />
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#f6d37a',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {role.name}
                  </div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {role.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAllRoles(false)}
              style={{
                marginTop: '1.25rem',
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #f5d485 0%, #d4a843 100%)',
                color: '#1a1200',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: GAME RULES ================= */}
      {showRules && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowRules(false)}
        >
          <div
            style={{
              background: 'rgba(24, 21, 35, 0.96)',
              borderRadius: '20px',
              border: '1px solid rgba(212, 168, 67, 0.4)',
              boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8)',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(212, 168, 67, 0.2)',
                paddingBottom: '0.75rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f6d37a' }}>
                🎭 Regole di Mascarade
              </h2>
              <button
                onClick={() => setShowRules(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                overflowY: 'auto',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                paddingRight: '0.5rem',
              }}
            >
              <p>
                <strong style={{ color: '#d4a843' }}>🎯 Obiettivo:</strong> Il primo giocatore che
                accumula <strong>13 monete d'oro</strong> vince la partita! (Se un giocatore ha il
                Baro, può vincere con 10 monete).
              </p>

              <div
                style={{
                  height: '1px',
                  background: 'rgba(212, 168, 67, 0.2)',
                  margin: '0.75rem 0',
                }}
              />

              <p>
                <strong style={{ color: '#d4a843' }}>🔀 I Primi 4 Turni:</strong> All'inizio della
                partita, ognuno guarda la propria carta. Nei primi 4 turni i giocatori sono{' '}
                <strong>obbligati a scambiare</strong> (o fingere di scambiare) la propria carta con
                un altro giocatore sotto il tavolo per confondere i ruoli!
              </p>

              <div
                style={{
                  height: '1px',
                  background: 'rgba(212, 168, 67, 0.2)',
                  margin: '0.75rem 0',
                }}
              />

              <p>
                <strong style={{ color: '#d4a843' }}>⚡ Le 3 Azioni nel tuo Turno:</strong>
              </p>
              <ol style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                <li>
                  <strong>Guardare la propria carta:</strong> Guarda segretamente il tuo ruolo a
                  faccia in giù.
                </li>
                <li>
                  <strong>Scambiare le carte:</strong> Prendi la tua carta e quella di un altro
                  giocatore sotto il tavolo. Puoi scambiarle realmente o fingere, poi rimettile a
                  posto.
                </li>
                <li>
                  <strong>Dichiarare un Ruolo:</strong> Annuncia quale personaggio sei per usare il
                  suo potere! Non devi necessariamente avere la carta per farlo...
                </li>
              </ol>

              <div
                style={{
                  height: '1px',
                  background: 'rgba(212, 168, 67, 0.2)',
                  margin: '0.75rem 0',
                }}
              />

              <p>
                <strong style={{ color: '#d4a843' }}>⚔️ La Contestazione:</strong> Quando dichiari un
                ruolo, gli altri giocatori a turno possono dire <em>"Non è vero, sono io!"</em>. Se
                qualcuno contesta:
              </p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                <li>Tutti i contendenti rivelano le loro carte contemporaneamente.</li>
                <li>Chi possiede davvero il ruolo ne esegue immediatamente il potere.</li>
                <li>Chi ha mentito o si è sbagliato paga 1 moneta di penale al Tribunale (piatto)!</li>
              </ul>
            </div>

            <button
              onClick={() => setShowRules(false)}
              style={{
                marginTop: '1.25rem',
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #f5d485 0%, #d4a843 100%)',
                color: '#1a1200',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Ho capito! 🎭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
