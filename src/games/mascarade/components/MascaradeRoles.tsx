import React, { useEffect, useMemo } from 'react';
import { X, Scroll } from 'lucide-react';
import { MascaradeRole } from '../types';
import { getRoleById } from '../roles';

export interface MascaradeRolesProps {
  rolesInGame: number[];
  isOpen: boolean;
  onClose: () => void;
}

interface DisplayedRole {
  role: MascaradeRole;
  count: number;
}

export function MascaradeRoles({ rolesInGame, isOpen, onClose }: MascaradeRolesProps) {
  // Listen for Escape key to close modal
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

  // Aggregate and deduplicate roles while keeping track of count (e.g. Contadino x2)
  const roleList = useMemo<DisplayedRole[]>(() => {
    if (!rolesInGame || !Array.isArray(rolesInGame) || rolesInGame.length === 0) {
      return [];
    }

    const map = new Map<string, DisplayedRole>();

    for (const id of rolesInGame) {
      const role = getRoleById(id);
      if (!role) continue;

      const existing = map.get(role.name);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(role.name, { role, count: 1 });
      }
    }

    return Array.from(map.values());
  }, [rolesInGame]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mascarade-roles-title"
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
        .mascarade-roles-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .mascarade-roles-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .mascarade-roles-scroll::-webkit-scrollbar-thumb {
          background: rgba(212, 168, 67, 0.35);
          border-radius: 4px;
        }
        .mascarade-roles-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 168, 67, 0.65);
        }
        .mascarade-role-item {
          transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
        }
        .mascarade-role-item:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 168, 67, 0.45) !important;
          background-color: rgba(212, 168, 67, 0.08) !important;
        }
      `}</style>

      {/* Glass Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(20, 16, 12, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 168, 67, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 168, 67, 0.15)',
          width: '100%',
          maxWidth: '820px',
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
            borderBottom: '1px solid rgba(212, 168, 67, 0.25)',
            background: 'rgba(212, 168, 67, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>📜</span>
            <div>
              <h2
                id="mascarade-roles-title"
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#d4a843',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 8px rgba(212, 168, 67, 0.25)',
                }}
              >
                Guida ai Ruoli
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                {roleList.length} {roleList.length === 1 ? 'ruolo attivo' : 'ruoli attivi'} nella partita
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
              background: 'rgba(212, 168, 67, 0.15)',
              border: '1px solid rgba(212, 168, 67, 0.4)',
              color: '#d4a843',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Role Grid */}
        <div
          className="mascarade-roles-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '0.9rem',
            alignContent: 'start',
          }}
        >
          {roleList.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.95rem',
                fontStyle: 'italic',
              }}
            >
              Nessun ruolo presente nella partita.
            </div>
          ) : (
            roleList.map(({ role, count }) => (
              <div
                key={role.id}
                className="mascarade-role-item"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 168, 67, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                {/* Role Thumbnail Image */}
                <img
                  src={role.image}
                  alt={role.name}
                  style={{
                    width: '60px',
                    minWidth: '60px',
                    maxWidth: '60px',
                    height: 'auto',
                    aspectRatio: '3/4',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 168, 67, 0.35)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/Mascarade/Dorso.png';
                  }}
                />

                {/* Role Name and Description */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: '#d4a843',
                        fontSize: '1.05rem',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {role.name}
                    </span>

                    {count > 1 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#d4a843',
                          background: 'rgba(212, 168, 67, 0.2)',
                          border: '1px solid rgba(212, 168, 67, 0.45)',
                          borderRadius: '12px',
                          padding: '0.1rem 0.45rem',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.3',
                        }}
                      >
                        x{count}
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
                    {role.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1.4rem',
            borderTop: '1px solid rgba(212, 168, 67, 0.2)',
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.45rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#d4a843',
              background: 'rgba(212, 168, 67, 0.15)',
              border: '1px solid rgba(212, 168, 67, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

// Standalone trigger button helper if needed
export function MascaradeRolesButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(212, 168, 67, 0.2)',
        border: '1px solid rgba(212, 168, 67, 0.4)',
        color: '#d4a843',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease',
      }}
    >
      <Scroll size={16} />
      <span>Ruoli</span>
    </button>
  );
}

export default MascaradeRoles;
