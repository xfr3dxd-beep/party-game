import React, { useEffect } from 'react';
import { CitadelsPlayer, BuiltDistrict } from '../types';
import { getDistrictById } from '../districts';
import { X, Building2, Coins, Library, Sparkles, ShieldAlert } from 'lucide-react';

export interface CitadelsCityProps {
  player: CitadelsPlayer;
  isOpen: boolean;
  onClose: () => void;
}

export function CitadelsCity({ player, isOpen, onClose }: CitadelsCityProps) {
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

  if (!isOpen || !player) return null;

  const builtDistricts: BuiltDistrict[] = player.builtDistricts || [];

  const getColorInfo = (color: string) => {
    switch (color) {
      case 'blue':
        return { label: 'Religioso', dotColor: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' };
      case 'yellow':
        return { label: 'Nobiliare', dotColor: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' };
      case 'green':
        return { label: 'Commerciale', dotColor: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)' };
      case 'red':
        return { label: 'Militare', dotColor: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
      case 'purple':
        return { label: 'Unico (Viola)', dotColor: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' };
      default:
        return { label: 'Distretto', dotColor: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.4)' };
    }
  };

  // Calculate base district score + bonuses in city
  const totalBasePoints = builtDistricts.reduce((sum: number, bd: BuiltDistrict) => {
    const d = getDistrictById(bd.districtId);
    return sum + (d ? d.cost : 0) + (bd.artisanCoins || 0) + (bd.museumCards || 0);
  }, 0);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="citadels-city-title"
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
        .citadels-city-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .citadels-city-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .citadels-city-scroll::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.35);
          border-radius: 4px;
        }
        .citadels-city-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.65);
        }
        .citadels-card-hover {
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .citadels-card-hover:hover {
          transform: translateY(-3px);
          border-color: rgba(201, 168, 76, 0.55) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(201, 168, 76, 0.2) !important;
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
          maxWidth: '860px',
          maxHeight: '90vh',
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
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🏰</span>
            <div>
              <h2
                id="citadels-city-title"
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#c9a84c',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                }}
              >
                Città di {player.name}
              </h2>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255, 255, 255, 0.65)',
                  marginTop: '2px',
                  display: 'flex',
                  gap: '0.8rem',
                  alignItems: 'center',
                }}
              >
                <span>
                  {builtDistricts.length} {builtDistricts.length === 1 ? 'quartiere costruito' : 'quartieri costruiti'}
                </span>
                <span>•</span>
                <span style={{ color: '#c9a84c', fontWeight: 600 }}>
                  ~{totalBasePoints} pt base
                </span>
                <span>•</span>
                <span>🪙 {player.gold} oro in riserva</span>
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

        {/* Content: Grid or Empty State */}
        <div
          className="citadels-city-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
          }}
        >
          {builtDistricts.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'rgba(30, 24, 38, 0.4)',
                border: '1px dashed #3d334a',
                borderRadius: '14px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201, 168, 76, 0.1)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#c9a84c',
                }}
              >
                <Building2 size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.4rem 0', color: '#c9a84c', fontSize: '1.15rem', fontWeight: 700 }}>
                Nessun distretto costruito
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', maxWidth: '380px' }}>
                {player.name} non ha ancora eretto alcun quartiere nella propria città.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '1rem',
              }}
            >
              {builtDistricts.map((bd: BuiltDistrict, idx: number) => {
                const district = getDistrictById(bd.districtId);
                if (!district) return null;
                const colorInfo = getColorInfo(district.color);
                const isMuseo = district.id === 515;

                return (
                  <div
                    key={bd.uid || `${bd.districtId}-${idx}`}
                    className="citadels-card-hover"
                    style={{
                      backgroundColor: 'rgba(30, 24, 38, 0.95)',
                      border: '1px solid #3d334a',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {/* District Image (Full Card) */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', backgroundColor: '#14101a', overflow: 'hidden' }}>
                      <img
                        src={district.image}
                        alt={district.nameIt}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/Citadels/Dorso distretti.png';
                        }}
                      />

                      {/* Cost Badge in Top-Right of Card Image */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(20, 16, 25, 0.88)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid #c9a84c',
                          borderRadius: '12px',
                          padding: '0.15rem 0.45rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          color: '#c9a84c',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        <span>🪙</span>
                        <span>{district.cost}</span>
                      </div>
                    </div>

                    {/* District Details */}
                    <div
                      style={{
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        flex: 1,
                        backgroundColor: 'rgba(25, 19, 32, 0.98)',
                        borderTop: '1px solid #3d334a',
                      }}
                    >
                      {/* Name & Color Indicator Dot */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            minWidth: '10px',
                            borderRadius: '50%',
                            backgroundColor: colorInfo.dotColor,
                            boxShadow: `0 0 6px ${colorInfo.dotColor}`,
                            display: 'inline-block',
                          }}
                          title={colorInfo.label}
                        />
                        <span
                          style={{
                            fontWeight: 700,
                            color: '#ffffff',
                            fontSize: '0.92rem',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={district.nameIt}
                        >
                          {district.nameIt}
                        </span>
                      </div>

                      {/* Color Category Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: colorInfo.dotColor, fontWeight: 600 }}>
                          {colorInfo.label}
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.55)' }}>
                          Costo: {district.cost}
                        </span>
                      </div>

                      {/* Artisan Coins Indicator (if any) */}
                      {bd.artisanCoins > 0 && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            backgroundColor: 'rgba(201, 168, 76, 0.2)',
                            border: '1px solid #c9a84c',
                            borderRadius: '6px',
                            padding: '0.2rem 0.45rem',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            color: '#c9a84c',
                            marginTop: '0.1rem',
                          }}
                        >
                          <span>🪙</span>
                          <span>+{bd.artisanCoins} {bd.artisanCoins === 1 ? 'Moneta Artista' : 'Monete Artista'} (+{bd.artisanCoins} pt)</span>
                        </div>
                      )}

                      {/* Museum Cards Count (if it's a Museo) */}
                      {(isMuseo || bd.museumCards > 0) && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            backgroundColor: 'rgba(168, 85, 247, 0.2)',
                            border: '1px solid #c084fc',
                            borderRadius: '6px',
                            padding: '0.2rem 0.45rem',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            color: '#e9d5ff',
                            marginTop: '0.1rem',
                          }}
                        >
                          <Library size={12} color="#c084fc" />
                          <span>{bd.museumCards} {bd.museumCards === 1 ? 'carta nel Museo' : 'carte nel Museo'} (+{bd.museumCards} pt)</span>
                        </div>
                      )}

                      {/* Viola / Unique District Effect Text */}
                      {district.effectTextIt && (
                        <div
                          style={{
                            marginTop: '0.2rem',
                            paddingTop: '0.35rem',
                            borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                            fontSize: '0.72rem',
                            lineHeight: '1.3',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontStyle: 'italic',
                          }}
                        >
                          {district.effectTextIt}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.8rem 1.4rem',
            borderTop: '1px solid #3d334a',
            backgroundColor: 'rgba(20, 16, 25, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Totale edifici: <strong style={{ color: '#c9a84c' }}>{builtDistricts.length}</strong>
          </div>

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

export default CitadelsCity;
