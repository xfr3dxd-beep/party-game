import React from 'react';
import { getCardImagePath } from '../cards';
import { X } from 'lucide-react';

interface Props {
  cardId: number | null;
  onClose: () => void;
}

/** Full-screen overlay showing a single Dixit card enlarged */
export default function DixitCardZoom({ cardId, onClose }: Props) {
  if (cardId === null) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', cursor: 'pointer',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', maxWidth: '380px', width: '100%',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '-12px', right: '-12px', zIndex: 10,
          background: 'rgba(124, 58, 237, 0.8)', border: '2px solid #a78bfa',
          color: '#fff', borderRadius: '50%', width: '36px', height: '36px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <X size={18} />
        </button>

        {/* Card image */}
        <img
          src={getCardImagePath(cardId)}
          alt={`Carta ${cardId}`}
          style={{
            width: '100%', borderRadius: '12px',
            border: '2px solid rgba(124, 58, 237, 0.5)',
            boxShadow: '0 12px 40px rgba(124, 58, 237, 0.4)',
          }}
        />
      </div>
    </div>
  );
}
