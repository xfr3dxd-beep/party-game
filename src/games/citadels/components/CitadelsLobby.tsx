import React, { useState, useMemo } from 'react';
import {
  Crown,
  Users,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  Play,
  Castle,
  Shuffle,
  Info,
  X,
  Shield,
  Coins,
  Layers,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  PRESETS,
  GamePreset,
  randomViola,
  ALL_VIOLA,
  randomCharacters,
  getDistrictById,
} from '../districts';
import {
  ALL_CHARACTERS,
  getCharacterById,
  getCharactersByRank,
} from '../characters';
import { RoomPlayer } from '../hooks/useCitadelsRoom';
import { CitadelsCharacter, CitadelsDistrict, DistrictColor } from '../types';

export interface CitadelsLobbyProps {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  onStartGame: (characterPool: number[], violaPool: number[], presetName: string) => void;
}

const COLOR_NAMES: Record<DistrictColor, string> = {
  yellow: 'Nobiliare (Giallo)',
  blue: 'Religioso (Blu)',
  green: 'Commerciale (Verde)',
  red: 'Militare (Rosso)',
  purple: 'Unico (Viola)',
};

const COLOR_HEX: Record<DistrictColor, string> = {
  yellow: '#eab308',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#a855f7',
};

export default function CitadelsLobby({
  roomCode,
  players,
  isHost,
  onStartGame,
}: CitadelsLobbyProps) {
  // Preset selection: id of one of the 6 named presets, or 'random', or 'custom'
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ambitious');
  const [copied, setCopied] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [activeRulesTab, setActiveRulesTab] = useState<'overview' | 'characters' | 'districts' | 'scoring'>('overview');

  // Modal to inspect character or district in detail
  const [detailModal, setDetailModal] = useState<{
    type: 'character' | 'district';
    data: CitadelsCharacter | CitadelsDistrict;
  } | null>(null);

  // Custom preset state
  const [customChars, setCustomChars] = useState<Record<number, number>>(() => {
    // Default to rank 1-9 characters from 'ambitious' preset
    const amb = PRESETS[0];
    const initial: Record<number, number> = {};
    amb.characters.forEach((charId) => {
      const char = getCharacterById(charId);
      if (char) initial[char.rank] = char.id;
    });
    // Ensure all 9 ranks have a fallback
    for (let r = 1; r <= 9; r++) {
      if (!initial[r]) {
        const charsInRank = getCharactersByRank(r);
        if (charsInRank.length > 0) initial[r] = charsInRank[0].id;
      }
    }
    return initial;
  });

  const [customViola, setCustomViola] = useState<number[]>(() => [...PRESETS[0].viola]);
  const [violaFilter, setViolaFilter] = useState<'all' | 'selected' | 'unselected'>('all');

  // Random preview state (generated once or refreshed)
  const [randomPreview, setRandomPreview] = useState<{ characters: number[]; viola: number[] }>(() => ({
    characters: randomCharacters(players.length >= 8),
    viola: randomViola(),
  }));

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshRandomPreview = () => {
    setRandomPreview({
      characters: randomCharacters(players.length >= 8),
      viola: randomViola(),
    });
  };

  const hasEnoughPlayers = players.length >= 4 && players.length <= 9;
  const includeRank9 = players.length >= 8;

  // Validation for Custom preset
  const customRanksComplete = useMemo(() => {
    const maxRank = includeRank9 ? 9 : 8;
    for (let r = 1; r <= maxRank; r++) {
      if (!customChars[r]) return false;
    }
    return true;
  }, [customChars, includeRank9]);

  const customViolaComplete = customViola.length === 14;

  const canStart =
    hasEnoughPlayers &&
    isHost &&
    (selectedPresetId !== 'custom' || (customRanksComplete && customViolaComplete));

  const handleStart = () => {
    if (!canStart) return;

    if (selectedPresetId === 'random') {
      const charPool = randomCharacters(includeRank9);
      const violaPool = randomViola();
      onStartGame(charPool, violaPool, 'Casuale');
    } else if (selectedPresetId === 'custom') {
      const maxRank = includeRank9 ? 9 : 8;
      const charPool: number[] = [];
      for (let r = 1; r <= maxRank; r++) {
        charPool.push(customChars[r]);
      }
      onStartGame(charPool, [...customViola], 'Personalizzata');
    } else {
      const preset = PRESETS.find((p) => p.id === selectedPresetId);
      if (!preset) return;
      const charPool = includeRank9 ? preset.characters : preset.characters.slice(0, 8);
      onStartGame(charPool, preset.viola, preset.nameIt);
    }
  };

  const toggleViolaSelection = (id: number) => {
    if (customViola.includes(id)) {
      setCustomViola((prev) => prev.filter((v) => v !== id));
    } else {
      if (customViola.length >= 14) return;
      setCustomViola((prev) => [...prev, id]);
    }
  };

  const selectCharacterForRank = (rank: number, charId: number) => {
    setCustomChars((prev) => ({
      ...prev,
      [rank]: charId,
    }));
  };

  // Find currently selected preset object
  const currentNamedPreset = PRESETS.find((p) => p.id === selectedPresetId);

  // Characters to display in the preview section
  const displayedCharacterIds = useMemo(() => {
    if (selectedPresetId === 'random') {
      return randomPreview.characters;
    }
    if (selectedPresetId === 'custom') {
      const maxRank = includeRank9 ? 9 : 8;
      const ids: number[] = [];
      for (let r = 1; r <= maxRank; r++) {
        if (customChars[r]) ids.push(customChars[r]);
      }
      return ids;
    }
    if (currentNamedPreset) {
      return currentNamedPreset.characters;
    }
    return [];
  }, [selectedPresetId, randomPreview.characters, customChars, includeRank9, currentNamedPreset]);

  // Viola districts to display in preview section
  const displayedViolaIds = useMemo(() => {
    if (selectedPresetId === 'random') {
      return randomPreview.viola;
    }
    if (selectedPresetId === 'custom') {
      return customViola;
    }
    if (currentNamedPreset) {
      return currentNamedPreset.viola;
    }
    return [];
  }, [selectedPresetId, randomPreview.viola, customViola, currentNamedPreset]);

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 1rem 3.5rem 1rem',
        color: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ================= HEADER SECTION ================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.1rem',
            borderRadius: '20px',
            background: 'rgba(201, 168, 76, 0.12)',
            border: '1px solid rgba(201, 168, 76, 0.35)',
            color: '#c9a84c',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem',
          }}
        >
          🏰 Sala d&apos;Attesa Citadels
        </div>

        <div style={{ color: 'rgba(235, 230, 245, 0.65)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
          Codice Stanza
        </div>

        {/* Room Code Banner with Copy Button & Rules Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(26, 21, 32, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '0.6rem 1.4rem',
            borderRadius: '16px',
            border: '1px solid rgba(201, 168, 76, 0.35)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55)',
          }}
        >
          <span
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              letterSpacing: '0.3em',
              fontFamily: 'monospace',
              color: '#fae596',
              textShadow: '0 0 16px rgba(201, 168, 76, 0.45)',
              marginLeft: '0.15em',
            }}
          >
            {roomCode}
          </span>

          <button
            onClick={handleCopyCode}
            title="Copia codice stanza"
            style={{
              background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(201, 168, 76, 0.18)',
              border: `1px solid ${copied ? '#22c55e' : 'rgba(201, 168, 76, 0.4)'}`,
              color: copied ? '#4ade80' : '#c9a84c',
              padding: '0.65rem',
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

          <button
            onClick={() => setShowRules(true)}
            title="Regole del gioco"
            style={{
              background: 'rgba(201, 168, 76, 0.12)',
              border: '1px solid rgba(201, 168, 76, 0.35)',
              color: '#c9a84c',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
            }}
          >
            <HelpCircle size={18} />
            <span>Regole</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ================= LEFT COLUMN: PLAYERS & START ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Players Panel */}
          <div
            style={{
              background: 'rgba(26, 21, 32, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '18px',
              padding: '1.4rem',
              border: '1px solid rgba(201, 168, 76, 0.28)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(201, 168, 76, 0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    background: 'rgba(201, 168, 76, 0.15)',
                    padding: '0.45rem',
                    borderRadius: '10px',
                    color: '#c9a84c',
                    display: 'flex',
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    Giocatori ({players.length}/9)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(235, 230, 245, 0.55)' }}>
                    Minimo 4 • Massimo 9
                  </span>
                </div>
              </div>
            </div>

            {/* Player Count Status Alert */}
            <div
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background:
                  players.length < 4
                    ? 'rgba(245, 158, 11, 0.14)'
                    : players.length > 9
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(34, 197, 94, 0.14)',
                border: `1px solid ${
                  players.length < 4
                    ? 'rgba(245, 158, 11, 0.35)'
                    : players.length > 9
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(34, 197, 94, 0.35)'
                }`,
                color:
                  players.length < 4
                    ? '#fbbf24'
                    : players.length > 9
                    ? '#f87171'
                    : '#4ade80',
                lineHeight: 1.4,
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                {players.length < 4
                  ? `In attesa di giocatori... Mancano ancora ${4 - players.length} giocatori per iniziare`
                  : players.length > 9
                  ? 'Stanza piena! Il massimo consentito è 9 giocatori'
                  : includeRank9
                  ? `Pronti! Con ${players.length} giocatori è attivo anche il Rango 9 (Regina / Artista / Tassatore)!`
                  : `Pronti! Con ${players.length} giocatori si gioca con i Ranghi da 1 a 8.`}
              </span>
            </div>

            {/* Player Badges List */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.55rem',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '0.2rem',
              }}
            >
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: p.isHost ? 'rgba(38, 30, 48, 0.85)' : 'rgba(20, 16, 26, 0.75)',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    border: p.isHost
                      ? '1.5px solid #c9a84c'
                      : '1px solid rgba(201, 168, 76, 0.2)',
                    boxShadow: p.isHost ? '0 0 12px rgba(201, 168, 76, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: p.isHost
                          ? 'linear-gradient(135deg, #fae596, #9a7828)'
                          : 'rgba(201, 168, 76, 0.15)',
                        color: p.isHost ? '#1a1520' : '#c9a84c',
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
                        fontSize: '0.92rem',
                        color: '#ffffff',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={p.name}
                    >
                      {p.name}
                    </div>
                  </div>

                  {p.isHost && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'rgba(201, 168, 76, 0.2)',
                        color: '#fae596',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Crown size={12} />
                      Host
                    </div>
                  )}
                </div>
              ))}

              {/* Empty placeholder slots up to 4 players */}
              {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(15, 12, 20, 0.4)',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    border: '1px dashed rgba(201, 168, 76, 0.2)',
                    color: 'rgba(235, 230, 245, 0.35)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1px dashed rgba(201, 168, 76, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    {players.length + i + 1}
                  </div>
                  <span>In attesa...</span>
                </div>
              ))}
            </div>

            {/* Rank 9 notice */}
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(201, 168, 76, 0.15)',
                fontSize: '0.75rem',
                color: 'rgba(235, 230, 245, 0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Castle size={14} color="#c9a84c" />
              <span>
                {includeRank9
                  ? '8+ Giocatori: Rango 9 abilitato nel mazzo personaggi!'
                  : 'Rango 9 (Regina/Artista/Tassatore) si attiva con 8 o 9 giocatori.'}
              </span>
            </div>
          </div>

          {/* Start Game Action Card */}
          <div
            style={{
              background: 'rgba(26, 21, 32, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '18px',
              padding: '1.25rem',
              border: '1px solid rgba(201, 168, 76, 0.28)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
            }}
          >
            {isHost ? (
              <>
                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: canStart ? 'pointer' : 'not-allowed',
                    color: '#1a1520',
                    background: canStart
                      ? 'linear-gradient(135deg, #fae596 0%, #c9a84c 50%, #9a7828 100%)'
                      : 'rgba(201, 168, 76, 0.25)',
                    boxShadow: canStart
                      ? '0 6px 20px rgba(201, 168, 76, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseDown={(e) => {
                    if (canStart) e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    if (canStart) e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Play size={22} fill="#1a1520" />
                  <span>Inizia Partita</span>
                </button>

                {!hasEnoughPlayers && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#fbbf24',
                      textAlign: 'center',
                      marginTop: '0.65rem',
                    }}
                  >
                    Servono almeno 4 giocatori per avviare il regno
                  </div>
                )}

                {hasEnoughPlayers && selectedPresetId === 'custom' && !customViolaComplete && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#f87171',
                      textAlign: 'center',
                      marginTop: '0.65rem',
                    }}
                  >
                    Devi selezionare esattamente 14 distretti viola (attuali: {customViola.length})
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  color: 'rgba(235, 230, 245, 0.7)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#c9a84c',
                    fontWeight: 700,
                  }}
                >
                  <Crown size={16} />
                  In attesa dell&apos;Host
                </div>
                <span>L&apos;host sta configurando il preset e avvierà la partita.</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PRESET SELECTOR & CARD VIEWER ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Preset Selector Panel */}
          <div
            style={{
              background: 'rgba(26, 21, 32, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '18px',
              padding: '1.5rem',
              border: '1px solid rgba(201, 168, 76, 0.28)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Layers size={20} color="#c9a84c" />
                  Selettore Preset & Configurazione
                </h3>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.8rem',
                    color: 'rgba(235, 230, 245, 0.6)',
                  }}
                >
                  Scegli tra i 6 preset tematici ufficiali, generazione casuale o composizione personalizzata
                </p>
              </div>

              {!isHost && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#c9a84c',
                    background: 'rgba(201, 168, 76, 0.1)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(201, 168, 76, 0.25)',
                  }}
                >
                  Solo l&apos;host può modificare il preset
                </div>
              )}
            </div>

            {/* Presets Horizontal Chips / Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (isHost) setSelectedPresetId(preset.id);
                    }}
                    disabled={!isHost}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(201, 168, 76, 0.3) 0%, rgba(201, 168, 76, 0.12) 100%)'
                        : 'rgba(18, 14, 24, 0.7)',
                      border: isSelected
                        ? '1.5px solid #c9a84c'
                        : '1px solid rgba(201, 168, 76, 0.2)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.5rem',
                      cursor: isHost ? 'pointer' : 'default',
                      textAlign: 'center',
                      color: isSelected ? '#fae596' : 'rgba(255, 255, 255, 0.75)',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(201, 168, 76, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{preset.nameIt}</div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: isSelected ? 'rgba(250, 229, 150, 0.7)' : 'rgba(255, 255, 255, 0.45)',
                        marginTop: '0.15rem',
                      }}
                    >
                      {preset.name}
                    </div>
                  </button>
                );
              })}

              {/* Casuale (Random) */}
              <button
                onClick={() => {
                  if (isHost) setSelectedPresetId('random');
                }}
                disabled={!isHost}
                style={{
                  background:
                    selectedPresetId === 'random'
                      ? 'linear-gradient(135deg, rgba(201, 168, 76, 0.3) 0%, rgba(201, 168, 76, 0.12) 100%)'
                      : 'rgba(18, 14, 24, 0.7)',
                  border:
                    selectedPresetId === 'random'
                      ? '1.5px solid #c9a84c'
                      : '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.5rem',
                  cursor: isHost ? 'pointer' : 'default',
                  textAlign: 'center',
                  color: selectedPresetId === 'random' ? '#fae596' : 'rgba(255, 255, 255, 0.75)',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPresetId === 'random' ? '0 0 12px rgba(201, 168, 76, 0.25)' : 'none',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Shuffle size={13} />
                  Casuale
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: selectedPresetId === 'random' ? 'rgba(250, 229, 150, 0.7)' : 'rgba(255, 255, 255, 0.45)',
                    marginTop: '0.15rem',
                  }}
                >
                  Mix a sorte
                </div>
              </button>

              {/* Personalizzata (Custom) */}
              <button
                onClick={() => {
                  if (isHost) setSelectedPresetId('custom');
                }}
                disabled={!isHost}
                style={{
                  background:
                    selectedPresetId === 'custom'
                      ? 'linear-gradient(135deg, rgba(201, 168, 76, 0.3) 0%, rgba(201, 168, 76, 0.12) 100%)'
                      : 'rgba(18, 14, 24, 0.7)',
                  border:
                    selectedPresetId === 'custom'
                      ? '1.5px solid #c9a84c'
                      : '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.5rem',
                  cursor: isHost ? 'pointer' : 'default',
                  textAlign: 'center',
                  color: selectedPresetId === 'custom' ? '#fae596' : 'rgba(255, 255, 255, 0.75)',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPresetId === 'custom' ? '0 0 12px rgba(201, 168, 76, 0.25)' : 'none',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Personalizzata</div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: selectedPresetId === 'custom' ? 'rgba(250, 229, 150, 0.7)' : 'rgba(255, 255, 255, 0.45)',
                    marginTop: '0.15rem',
                  }}
                >
                  Scegli ranghi & viola
                </div>
              </button>
            </div>

            {/* Preset Details / Description Banner */}
            {selectedPresetId !== 'custom' && selectedPresetId !== 'random' && currentNamedPreset && (
              <div
                style={{
                  background: 'rgba(18, 14, 24, 0.8)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(201, 168, 76, 0.25)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fae596', fontWeight: 800 }}>
                    {currentNamedPreset.nameIt}
                    <span style={{ fontSize: '0.8rem', color: 'rgba(235, 230, 245, 0.5)', fontWeight: 500, marginLeft: '0.6rem' }}>
                      ({currentNamedPreset.name})
                    </span>
                  </h4>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(201, 168, 76, 0.15)',
                      color: '#c9a84c',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    Preset Ufficiale
                  </span>
                </div>
                <p style={{ margin: '0.45rem 0 0 0', color: 'rgba(235, 230, 245, 0.8)', fontSize: '0.88rem' }}>
                  {currentNamedPreset.description}
                </p>
              </div>
            )}

            {/* Random Preset Banner */}
            {selectedPresetId === 'random' && (
              <div
                style={{
                  background: 'rgba(18, 14, 24, 0.8)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(201, 168, 76, 0.25)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fae596', fontWeight: 800 }}>
                    🎲 Composizione Casuale
                  </h4>
                  <p style={{ margin: '0.35rem 0 0 0', color: 'rgba(235, 230, 245, 0.8)', fontSize: '0.85rem' }}>
                    All&apos;avvio della partita il gioco estrarrà 1 personaggio casuale per ciascun rango e 14 distretti viola a caso tra tutti i 30 disponibili.
                  </p>
                </div>

                {isHost && (
                  <button
                    onClick={handleRefreshRandomPreview}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(201, 168, 76, 0.15)',
                      border: '1px solid rgba(201, 168, 76, 0.35)',
                      color: '#fae596',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={14} />
                    Nuova Anteprima
                  </button>
                )}
              </div>
            )}

            {/* Custom Preset Controls */}
            {selectedPresetId === 'custom' && (
              <div
                style={{
                  background: 'rgba(18, 14, 24, 0.8)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(201, 168, 76, 0.25)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fae596', fontWeight: 800 }}>
                    🛠️ Composizione Personalizzata
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setCustomViola(randomViola())}
                      disabled={!isHost}
                      style={{
                        background: 'rgba(201, 168, 76, 0.15)',
                        border: '1px solid rgba(201, 168, 76, 0.35)',
                        color: '#fae596',
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: isHost ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Shuffle size={13} />
                      14 Viola a Caso
                    </button>
                    <button
                      onClick={() => setCustomViola([])}
                      disabled={!isHost}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#fca5a5',
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: isHost ? 'pointer' : 'default',
                      }}
                    >
                      Svuota Viola
                    </button>
                  </div>
                </div>

                <p style={{ margin: '0.45rem 0 0 0', color: 'rgba(235, 230, 245, 0.8)', fontSize: '0.85rem' }}>
                  Seleziona 1 personaggio per ogni rango e seleziona esattamente 14 distretti viola su 30.
                </p>

                {/* Custom status badge */}
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: customRanksComplete ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: `1px solid ${customRanksComplete ? '#22c55e' : '#f59e0b'}`,
                      color: customRanksComplete ? '#4ade80' : '#fbbf24',
                      fontWeight: 700,
                    }}
                  >
                    Ranghi: {includeRank9 ? '9/9' : '8/8'} configurati
                  </span>

                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: customViolaComplete ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${customViolaComplete ? '#22c55e' : '#ef4444'}`,
                      color: customViolaComplete ? '#4ade80' : '#f87171',
                      fontWeight: 700,
                    }}
                  >
                    Viola Selezionati: {customViola.length} / 14
                  </span>
                </div>
              </div>
            )}

            {/* ================= CHARACTERS GRID (FOR PRESETS / RANDOM) ================= */}
            {selectedPresetId !== 'custom' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fae596' }}>
                    🎭 Personaggi in Gioco ({displayedCharacterIds.length})
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(235, 230, 245, 0.5)' }}>
                    Clicca su una carta per dettagli
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                    gap: '0.65rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {displayedCharacterIds.map((charId) => {
                    const char = getCharacterById(charId);
                    if (!char) return null;
                    const isRank9 = char.rank === 9;
                    const isDimmed = isRank9 && !includeRank9;

                    return (
                      <div
                        key={char.id}
                        onClick={() => setDetailModal({ type: 'character', data: char })}
                        style={{
                          background: 'rgba(18, 14, 24, 0.85)',
                          borderRadius: '12px',
                          border: isDimmed
                            ? '1px dashed rgba(201, 168, 76, 0.2)'
                            : '1.5px solid rgba(201, 168, 76, 0.35)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          opacity: isDimmed ? 0.45 : 1,
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(201, 168, 76, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Rank Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#c9a84c',
                            color: '#1a1520',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                          }}
                        >
                          {char.rank}
                        </div>

                        {/* Income Color Dot if applicable */}
                        {char.incomeColor && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: COLOR_HEX[char.incomeColor],
                              border: '1.5px solid #ffffff',
                              zIndex: 2,
                            }}
                            title={`Bonus oro: ${COLOR_NAMES[char.incomeColor]}`}
                          />
                        )}

                        {/* Character Artwork */}
                        <div
                          style={{
                            width: '100%',
                            height: '110px',
                            position: 'relative',
                            background: '#0e0b13',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={char.image}
                            alt={char.nameIt}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top center',
                            }}
                          />
                        </div>

                        {/* Name Bar */}
                        <div
                          style={{
                            padding: '0.4rem 0.35rem',
                            textAlign: 'center',
                            background: 'rgba(26, 21, 32, 0.95)',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              color: '#fae596',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {char.nameIt}
                          </div>
                          <div
                            style={{
                              fontSize: '0.62rem',
                              color: 'rgba(235, 230, 245, 0.45)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {char.name}
                          </div>
                        </div>

                        {isDimmed && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              left: 0,
                              right: 0,
                              background: 'rgba(0,0,0,0.85)',
                              color: '#fbbf24',
                              fontSize: '0.55rem',
                              textAlign: 'center',
                              padding: '1px 2px',
                              fontWeight: 700,
                            }}
                          >
                            Solo con 8+ giocatori
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= CUSTOM MODE: 9 RANKS PICKER ================= */}
            {selectedPresetId === 'custom' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', fontWeight: 800, color: '#fae596' }}>
                  👑 Selezione Personaggi per ciascun Rango
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {Array.from({ length: 9 }).map((_, rankIdx) => {
                    const rank = rankIdx + 1;
                    const isRank9 = rank === 9;
                    const options = getCharactersByRank(rank);
                    const selectedCharId = customChars[rank];

                    return (
                      <div
                        key={rank}
                        style={{
                          background: 'rgba(18, 14, 24, 0.75)',
                          borderRadius: '12px',
                          padding: '0.75rem 0.9rem',
                          border: '1px solid rgba(201, 168, 76, 0.2)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.6rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#c9a84c',
                                color: '#1a1520',
                                fontWeight: 900,
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {rank}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fae596' }}>
                              Rango {rank}
                            </span>
                          </div>

                          {isRank9 && !includeRank9 && (
                            <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontStyle: 'italic' }}>
                              (Incluso se ci saranno 8 o 9 giocatori)
                            </span>
                          )}
                        </div>

                        {/* 3 Options for this rank */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '0.5rem',
                          }}
                        >
                          {options.map((char) => {
                            const isChosen = selectedCharId === char.id;
                            return (
                              <div
                                key={char.id}
                                onClick={() => {
                                  if (isHost) selectCharacterForRank(rank, char.id);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.6rem',
                                  background: isChosen
                                    ? 'rgba(201, 168, 76, 0.22)'
                                    : 'rgba(26, 21, 32, 0.65)',
                                  borderRadius: '10px',
                                  padding: '0.45rem 0.6rem',
                                  border: isChosen
                                    ? '1.5px solid #c9a84c'
                                    : '1px solid rgba(201, 168, 76, 0.15)',
                                  cursor: isHost ? 'pointer' : 'default',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isChosen ? '0 0 10px rgba(201, 168, 76, 0.25)' : 'none',
                                }}
                              >
                                <img
                                  src={char.image}
                                  alt={char.nameIt}
                                  style={{
                                    width: '38px',
                                    height: '48px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(201, 168, 76, 0.3)',
                                  }}
                                />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontWeight: 800,
                                      fontSize: '0.82rem',
                                      color: isChosen ? '#fae596' : '#ffffff',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {char.nameIt}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.68rem',
                                      color: 'rgba(235, 230, 245, 0.5)',
                                      lineHeight: 1.2,
                                      maxHeight: '2.4em',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {char.effectTextIt}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailModal({ type: 'character', data: char });
                                  }}
                                  title="Dettagli personaggio"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(201, 168, 76, 0.7)',
                                    cursor: 'pointer',
                                    padding: '0.2rem',
                                  }}
                                >
                                  <Eye size={15} />
                                </button>

                                {isChosen && <CheckCircle2 size={16} color="#c9a84c" style={{ flexShrink: 0 }} />}
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

            {/* ================= VIOLA (PURPLE) DISTRICTS SECTION ================= */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fae596' }}>
                    🔮 Distretti Viola Inclusi ({displayedViolaIds.length}/14)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(235, 230, 245, 0.5)' }}>
                    {selectedPresetId === 'custom'
                      ? 'Clicca sui distretti per selezionarne esattamente 14'
                      : 'Distretti unici con abilità speciali inclusi nel mazzo'}
                  </span>
                </div>

                {selectedPresetId === 'custom' && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => setViolaFilter('all')}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: violaFilter === 'all' ? '#c9a84c' : 'rgba(201, 168, 76, 0.15)',
                        color: violaFilter === 'all' ? '#1a1520' : '#fae596',
                      }}
                    >
                      Tutti (30)
                    </button>
                    <button
                      onClick={() => setViolaFilter('selected')}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: violaFilter === 'selected' ? '#c9a84c' : 'rgba(201, 168, 76, 0.15)',
                        color: violaFilter === 'selected' ? '#1a1520' : '#fae596',
                      }}
                    >
                      Scelti ({customViola.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Cards Grid: In preset/random, show only the 14 viola; in custom, show list based on filter */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.65rem',
                }}
              >
                {(selectedPresetId === 'custom'
                  ? ALL_VIOLA.filter((v) => {
                      if (violaFilter === 'selected') return customViola.includes(v.id);
                      if (violaFilter === 'unselected') return !customViola.includes(v.id);
                      return true;
                    })
                  : displayedViolaIds.map((id) => getDistrictById(id)).filter(Boolean)
                ).map((dist) => {
                  if (!dist) return null;
                  const isSelectedInCustom = customViola.includes(dist.id);
                  const isCustomMode = selectedPresetId === 'custom';

                  return (
                    <div
                      key={dist.id}
                      onClick={() => {
                        if (isCustomMode && isHost) {
                          toggleViolaSelection(dist.id);
                        } else {
                          setDetailModal({ type: 'district', data: dist });
                        }
                      }}
                      style={{
                        background:
                          isCustomMode && isSelectedInCustom
                            ? 'rgba(201, 168, 76, 0.22)'
                            : 'rgba(18, 14, 24, 0.85)',
                        borderRadius: '12px',
                        border:
                          isCustomMode && isSelectedInCustom
                            ? '1.5px solid #c9a84c'
                            : '1px solid rgba(201, 168, 76, 0.25)',
                        padding: '0.6rem',
                        cursor: isCustomMode && !isHost ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease',
                        boxShadow:
                          isCustomMode && isSelectedInCustom
                            ? '0 0 10px rgba(201, 168, 76, 0.3)'
                            : 'none',
                        position: 'relative',
                      }}
                    >
                      {/* Top Bar with Cost & Select Check */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            background: 'rgba(201, 168, 76, 0.25)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '6px',
                            color: '#fae596',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                          }}
                        >
                          <Coins size={12} />
                          {dist.cost} oro
                        </div>

                        {isCustomMode && isSelectedInCustom && (
                          <CheckCircle2 size={16} color="#c9a84c" />
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModal({ type: 'district', data: dist });
                          }}
                          title="Espandi dettagli"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(201, 168, 76, 0.7)',
                            cursor: 'pointer',
                            padding: '0.1rem',
                          }}
                        >
                          <Eye size={13} />
                        </button>
                      </div>

                      {/* District Image Thumbnail */}
                      <div
                        style={{
                          width: '100%',
                          height: '75px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0e0b13',
                          border: '1px solid rgba(201, 168, 76, 0.2)',
                        }}
                      >
                        <img
                          src={dist.image}
                          alt={dist.nameIt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>

                      {/* District Title & Text */}
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            color: isCustomMode && isSelectedInCustom ? '#fae596' : '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {dist.nameIt}
                        </div>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: 'rgba(235, 230, 245, 0.55)',
                            lineHeight: 1.25,
                            maxHeight: '2.5em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '0.15rem',
                          }}
                        >
                          {dist.effectTextIt}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RULES MODAL ================= */}
      {showRules && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setShowRules(false)}
        >
          <div
            style={{
              background: '#1a1520',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.75rem',
              color: '#ffffff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(201, 168, 76, 0.25)',
                paddingBottom: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={22} color="#c9a84c" />
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fae596' }}>
                  Regolamento di Citadels
                </h3>
              </div>
              <button
                onClick={() => setShowRules(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'overview', label: 'Panoramica' },
                  { id: 'characters', label: 'Ranghi Personaggi' },
                  { id: 'districts', label: 'Distretti & Colori' },
                  { id: 'scoring', label: 'Punti Vittoria' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRulesTab(tab.id)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeRulesTab === tab.id ? '#c9a84c' : 'rgba(201, 168, 76, 0.12)',
                    color: activeRulesTab === tab.id ? '#1a1520' : '#fae596',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeRulesTab === 'overview' && (
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(235, 230, 245, 0.85)' }}>
                <h4 style={{ color: '#fae596', margin: '0 0 0.5rem 0' }}>🏰 Obiettivo</h4>
                <p style={{ margin: '0 0 1rem 0' }}>
                  Ogni giocatore compete per costruire la città più magnifica e prestigiosa. Il gioco termina alla fine del round in cui un giocatore costruisce il suo <strong>7° quartiere</strong> (o 8° in varianti classiche).
                </p>

                <h4 style={{ color: '#fae596', margin: '0 0 0.5rem 0' }}>🔄 Svolgimento del Round</h4>
                <ol style={{ paddingLeft: '1.2rem', margin: '0 0 1rem 0' }}>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Scelta dei Personaggi (Draft):</strong> Il possessore della Corona guarda le carte personaggio rimaste, ne sceglie segretamente una e passa il mazzo al giocatore alla sua sinistra.
                  </li>
                  <li style={{ marginBottom: '0.4rem' }}>
                    <strong>Chiamata dei Personaggi:</strong> La Corona chiama i personaggi in ordine di rango, dal Rango 1 (Assassino / Magistrato / Strega) fino al Rango 8 o 9.
                  </li>
                  <li>
                    <strong>Turno del Giocatore:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                      <li><strong>Risorse:</strong> Raccogli 2 monete d&apos;oro OPPURE pesca 2 carte distretto e scegline 1 da tenere.</li>
                      <li><strong>Abilità:</strong> Usa il potere speciale del tuo personaggio (una volta per turno).</li>
                      <li><strong>Costruzione:</strong> Puoi costruire 1 quartiere dalla tua mano pagandone il costo in oro.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            )}

            {activeRulesTab === 'characters' && (
              <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'rgba(235, 230, 245, 0.85)' }}>
                <p style={{ margin: '0 0 1rem 0' }}>
                  Ci sono 27 personaggi divisi in 9 ranghi (3 opzioni per rango). In ogni partita si gioca con esattamente 1 personaggio per ogni rango:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 1:</strong> Assassino, Magistrato, Strega (Eliminazione e sabotaggio)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 2:</strong> Ladro, Ricattatore, Spia (Furto di risorse)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 3:</strong> Mago, Stregone, Veggente (Manipolazione carte)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 4 (Nobiliare):</strong> Re, Imperatore, Patrizio (Corona + Oro/Carte Gialle)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 5 (Religioso):</strong> Vescovo, Abate, Cardinale (Protezione + Oro/Carte Blu)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 6 (Commerciale):</strong> Mercante, Alchimista, Negoziante (Oro verde + Economia)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 7:</strong> Architetto, Studioso, Navigatore (Accelerazione pesca e costruzioni)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 8 (Militare):</strong> Condottiero, Maresciallo, Diplomatico (Distruzione e conquista)
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fae596' }}>Rango 9 (8+ giocatori):</strong> Regina, Artista, Tassatore (Bonus supplementari)
                  </div>
                </div>
              </div>
            )}

            {activeRulesTab === 'districts' && (
              <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'rgba(235, 230, 245, 0.85)' }}>
                <p style={{ margin: '0 0 1rem 0' }}>
                  I quartieri hanno un valore in punti vittoria pari al loro costo di costruzione e si dividono in 5 colori:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLOR_HEX.yellow }} />
                    <strong>Nobiliare (Giallo):</strong> Produce entrate con i personaggi di Rango 4.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLOR_HEX.blue }} />
                    <strong>Religioso (Blu):</strong> Produce entrate con i personaggi di Rango 5.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLOR_HEX.green }} />
                    <strong>Commerciale (Verde):</strong> Produce entrate con i personaggi di Rango 6.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLOR_HEX.red }} />
                    <strong>Militare (Rosso):</strong> Produce entrate con i personaggi di Rango 8.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLOR_HEX.purple }} />
                    <strong>Unico (Viola):</strong> Ognuno ha un potere unico e permanente descritto sulla carta!
                  </div>
                </div>
              </div>
            )}

            {activeRulesTab === 'scoring' && (
              <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(235, 230, 245, 0.85)' }}>
                <h4 style={{ color: '#fae596', margin: '0 0 0.5rem 0' }}>🏆 Punti a Fine Partita</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                  <li><strong>Valore quartieri:</strong> Somma dei costi di tutti i quartieri costruiti nella propria città.</li>
                  <li><strong>Bonus tutti i colori (+3 punti):</strong> Se possiedi almeno un quartiere di ciascuno dei 5 colori (giallo, blu, verde, rosso, viola).</li>
                  <li><strong>Primo a completare (+4 punti):</strong> Il primo giocatore che ha piazzato il 7° quartiere in questo round.</li>
                  <li><strong>Altri a completare (+2 punti):</strong> Ogni altro giocatore che è riuscito a costruire il 7° quartiere nello stesso round.</li>
                  <li><strong>Abilità delle carte viola:</strong> Punti extra assegnati dai distretti viola (es. Museo, Pozzo dei Desideri, Basilica, Statua, ecc.).</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CARD DETAIL MODAL (LIGHTBOX) ================= */}
      {detailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1rem',
          }}
          onClick={() => setDetailModal(null)}
        >
          <div
            style={{
              background: '#1a1520',
              border: '1.5px solid rgba(201, 168, 76, 0.45)',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header with close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(201, 168, 76, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#c9a84c" />
                <span style={{ fontWeight: 800, color: '#fae596', fontSize: '0.95rem' }}>
                  {detailModal.type === 'character' ? 'Carta Personaggio' : 'Carta Quartiere'}
                </span>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image */}
            <div
              style={{
                width: '100%',
                height: '240px',
                background: '#0d0a12',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={detailModal.data.image}
                alt={detailModal.data.nameIt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fae596' }}>
                  {detailModal.data.nameIt}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'rgba(235, 230, 245, 0.5)' }}>
                  ({detailModal.data.name})
                </span>
              </div>

              {/* Character Details */}
              {detailModal.type === 'character' && (
                <div>
                  {(() => {
                    const char = detailModal.data as CitadelsCharacter;
                    return (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <span
                            style={{
                              background: '#c9a84c',
                              color: '#1a1520',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                            }}
                          >
                            Rango {char.rank}
                          </span>

                          {char.incomeColor && (
                            <span
                              style={{
                                background: `${COLOR_HEX[char.incomeColor]}25`,
                                border: `1px solid ${COLOR_HEX[char.incomeColor]}`,
                                color: COLOR_HEX[char.incomeColor],
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                              }}
                            >
                              Bonus: {COLOR_NAMES[char.incomeColor]}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.85rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(201, 168, 76, 0.2)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            color: 'rgba(235, 230, 245, 0.9)',
                          }}
                        >
                          {char.effectTextIt}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* District Details */}
              {detailModal.type === 'district' && (
                <div>
                  {(() => {
                    const dist = detailModal.data as CitadelsDistrict;
                    return (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <span
                            style={{
                              background: 'rgba(201, 168, 76, 0.25)',
                              color: '#fae596',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Coins size={13} /> Costo: {dist.cost} Oro
                          </span>

                          <span
                            style={{
                              background: `${COLOR_HEX[dist.color]}25`,
                              border: `1px solid ${COLOR_HEX[dist.color]}`,
                              color: COLOR_HEX[dist.color],
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                            }}
                          >
                            {COLOR_NAMES[dist.color]}
                          </span>
                        </div>

                        {dist.effectTextIt && (
                          <div
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              padding: '0.85rem',
                              borderRadius: '10px',
                              border: '1px solid rgba(201, 168, 76, 0.2)',
                              fontSize: '0.88rem',
                              lineHeight: 1.5,
                              color: 'rgba(235, 230, 245, 0.9)',
                            }}
                          >
                            {dist.effectTextIt}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
