'use client';
/*
  WavelengthIndizio.jsx  (vista di chi dà l'indizio)
  - Richiede React/Next.js. Se il sito usa altro, adattare mantenendo i valori.
  - Immagini da mettere in public/: Arco_wavelenght.png e fascia_punteggi.png
  - CX, CY sono calibrati: NON modificarli. fascia_punteggi.png ha la stessa tela
    dell'arco (1699 x 926) e il suo perno coincide con CX, CY.
  - Il bersaglio (0-180) deve essere UNO SOLO per round, uguale per tutti i giocatori:
    va generato una volta (server o seed condiviso) e passato come prop.
*/

// Valori calibrati (stessi di Wavelength.jsx)
const CX = 0.4974;
const CY = 0.7451;

// Soglie: [distanza massima in gradi, punti]. Devono coincidere con il PNG.
export const SOGLIE = [[3, 4], [8, 3], [12, 2]];

// Distanza circolare con periodo 180°: ciò che esce da un lato riappare dall'altro.
export function distanza(angolo, bersaglio) {
  const d = Math.abs(angolo - bersaglio);
  return Math.min(d, 180 - d);
}

// Punteggio di un giocatore dato l'angolo della sua freccia
export function punteggio(angolo, bersaglio) {
  const d = distanza(angolo, bersaglio);
  for (const [limite, punti] of SOGLIE) if (d <= limite) return punti;
  return 0;
}

// Bersaglio casuale 0-180 (da chiamare UNA volta per round, non a ogni render)
export function bersaglioCasuale() {
  return Math.round(Math.random() * 1800) / 10;
}

export default function WavelengthIndizio({ bersaglio }) {
  const stileFascia = (extra) => ({
    position: 'absolute', inset: 0, width: '100%', height: '100%', maxWidth: 'none',
    transformOrigin: `${CX * 100}% ${CY * 100}%`,
    transform: `rotate(${bersaglio - 90 + extra}deg)`,
    pointerEvents: 'none',
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 800, userSelect: 'none' }}>
      <img src="/Arco_wavelenght.png" alt="" draggable={false}
           style={{ width: '100%', display: 'block' }} />

      {/* ritaglio sulla linea orizzontale del perno: si vede solo 0°-180° */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                    clipPath: `inset(0 0 ${(1 - CY) * 100}% 0)` }}>
        <img src="/fascia_punteggi.png" alt="" draggable={false} style={stileFascia(0)} />
        {/* copie ruotate di ±180°: mostrano la parte che esce da un lato e riappare dall'altro */}
        <img src="/fascia_punteggi.png" alt="" draggable={false} style={stileFascia(180)} />
        <img src="/fascia_punteggi.png" alt="" draggable={false} style={stileFascia(-180)} />
      </div>
    </div>
  );
}
