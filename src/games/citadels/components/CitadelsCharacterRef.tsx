import React, { useEffect } from 'react';
import { CitadelsCharacter } from '../types';
import { getCharacterById } from '../characters';
import { X, Scroll, Coins, Sparkles } from 'lucide-react';

export interface CitadelsCharacterRefProps {
  characterPool: number[];
  isOpen: boolean;
  onClose: () => void;
}

export function CitadelsCharacterRef({ characterPool, isOpen, onClose }: CitadelsCharacterRefProps) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Retrieve and sort characters by rank (1-9)
  const characters: CitadelsCharacter[] = (characterPool || [])
    .map((id: number) => getCharacterById(id))
    .filter(Boolean)
    .sort((a: CitadelsCharacter, b: CitadelsCharacter) => a.rank - b.rank);

  const getRankTheme = (rank: number, incomeColor: string | null) => {
    switch (incomeColor) {
      case 'yellow':
        return { label: 'Nobiliare', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.45)' };
      case 'blue':
        return { label: 'Religioso', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.45)' };
      case 'green':
        return { label: 'Commerciale', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.45)' };
      case 'red':
        return { label: 'Militare', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.45)' };
      default:
        return { label: 'Speciale', color: '#c9a84c', bg: 'rgba(201, 168, 76, 0.12)', border: 'rgba(201, 168, 76, 0.35)' };
    }
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="citadels-char-ref-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .citadels-char-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .citadels-char-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .citadels-char-scroll::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.35);
          border-radius: 4px;
        }
        .citadels-char-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.65);
        }
      `}</style>

      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #241c2c 0%, #1a1520 100%)',
          border: '1px solid rgba(201, 168, 76, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(201, 168, 76, 0.15)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.1rem 1.4rem',
            borderBottom: '1px solid #3d334a',
            backgroundColor: 'rgba(201, 168, 76, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📜</span>
            <div>
              <h2
                id="citadels-char-ref-title"
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#c9a84c',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                }}
              >
                📜 Personaggi in Gioco
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>
                9 personaggi disponibili ordinati per rango di chiamata
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(201, 168, 76, 0.12)',
              border: '1px solid rgba(201, 168, 76, 0.35)',
              color: '#c9a84c',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.12)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Character List */}
        <div
          className="citadels-char-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {characters.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontStyle: 'italic',
              }}
            >
              Nessun personaggio selezionato.
            </div>
          ) : (
            characters.map((char: CitadelsCharacter) => {
              const theme = getRankTheme(char.rank, char.incomeColor);

              return (
                <div
                  key={char.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1rem',
                    backgroundColor: 'rgba(30, 24, 38, 0.85)',
                    border: '1px solid #3d334a',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3d334a';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Rank Badge */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: '10px',
                      backgroundColor: theme.bg,
                      border: `1.5px solid ${theme.border}`,
                      color: theme.color,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.4)',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', lineHeight: 1, opacity: 0.8 }}>
                      Rango
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {char.rank}
                    </span>
                  </div>

                  {/* Character Image (Exactly 60px) */}
                  <img
                    src={char.image}
                    alt={char.nameIt}
                    style={{
                      width: '60px',
                      height: '60px',
                      minWidth: '60px',
                      maxWidth: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid rgba(201, 168, 76, 0.35)',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                      flexShrink: 0,
                      backgroundColor: '#14101a',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/Citadels/Dorso carte personaggio.png';
                    }}
                  />

                  {/* Character Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#c9a84c',
                          fontSize: '1.1rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {char.nameIt}
                      </span>

                      {char.incomeColor && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: theme.color,
                            backgroundColor: theme.bg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '10px',
                            padding: '0.1rem 0.45rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Coins size={11} />
                          Rendita {theme.label}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        lineHeight: '1.4',
                        color: 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      {char.effectTextIt}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.8rem 1.4rem',
            borderTop: '1px solid #3d334a',
            backgroundColor: 'rgba(20, 16, 25, 0.8)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.4rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#c9a84c',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(201, 168, 76, 0.15)';
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default CitadelsCharacterRef;
