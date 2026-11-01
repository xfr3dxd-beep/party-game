'use client';
import { useRef, useState } from 'react';

// Valori calibrati
const CX = 0.4974, CY = 0.7451;
const SCALA = 0.1076;                 // larghezza freccia / larghezza arco
const PERNO = { x: 0.4988, y: 0.8328 }; // centro dell'anello nel PNG freccia

export default function Wavelength({ onConfirm }) {
  const ref = useRef(null);
  const [angolo, setAngolo] = useState(90);
  const [bloccato, setBloccato] = useState(false);

  function aggiorna(e) {
    if (bloccato) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + CX * r.width);
    const dy = (r.top + CY * r.height) - e.clientY;
    const g = 180 - Math.atan2(dy, dx) * 180 / Math.PI;
    setAngolo(Math.min(Math.max(g, 0), 180));
  }

  return (
    <div>
      <div
        ref={ref}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); aggiorna(e); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) aggiorna(e); }}
        style={{ position: 'relative', width: '100%', maxWidth: 800,
                 containerType: 'inline-size', touchAction: 'none', userSelect: 'none' }}
      >
        <img src="/Arco_wavelenght.png" alt="" draggable={false}
             style={{ width: '100%', display: 'block' }} />

        {/* ancora nel punto di rotazione: ruota l'ancora, la freccia segue */}
        <div style={{ position: 'absolute', left: `${CX * 100}%`, top: `${CY * 100}%`,
                      width: 0, height: 0, transform: `rotate(${angolo - 90}deg)` }}>
          <img src="/freccia_nuova_trasparente.png" alt="" draggable={false}
               style={{ position: 'absolute', left: 0, top: 0,
                        width: `${SCALA * 100}cqw`, maxWidth: 'none',
                        transform: `translate(${-PERNO.x * 100}%, ${-PERNO.y * 100}%)`,
                        pointerEvents: 'none' }} />
        </div>
      </div>

      <button disabled={bloccato}
              onClick={() => { setBloccato(true); onConfirm?.(angolo); }}>
        Conferma
      </button>
    </div>
  );
}