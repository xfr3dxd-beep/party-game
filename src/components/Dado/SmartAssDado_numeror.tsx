'use client';

/**
 * SmartAssDie — d12 animato (dodecaedro in CSS 3D) per il gioco Smart Ass.
 *
 * - Il dado è "libero": vive in un overlay a schermo intero con sfondo
 *   trasparente e non intercetta i click, quindi la schermata di gioco resta
 *   visibile e utilizzabile mentre il dado rotola. Poi svanisce da solo.
 * - 12 facce, solo i numeri 1-2-3-4, ciascuno 3 volte (mai due uguali adiacenti).
 * - Faccia scelta con crypto.getRandomValues (senza bias); a fine animazione
 *   il risultato viene inviato al server con una POST JSON.
 *
 * Uso: tieni un ref al componente e chiama ref.current.roll() dal tuo pulsante.
 * Nessuna dipendenza oltre a React / ReactDOM.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/* -------------------------------------------------------------------------- */
/*  Tipi pubblici                                                             */
/* -------------------------------------------------------------------------- */

export type DieValue = 1 | 2 | 3 | 4;

export interface DieRoll {
  /** Numero uscito (1-4). */
  value: DieValue;
  /** Indice della faccia (0-11) su cui si è fermato il dado. */
  face: number;
  /** ISO timestamp del lancio. */
  rolledAt: string;
}

export interface SmartAssDieHandle {
  /** Lancia il dado (ignorato se è già in corso un lancio o un salvataggio). */
  roll: () => void;
}

export interface SmartAssDieProps {
  /** Endpoint che riceve la POST col risultato. Default: /api/smart-ass/roll */
  endpoint?: string;
  /** Identificativi opzionali, inviati al server insieme al risultato. */
  gameId?: string;
  playerId?: string;
  /** Diametro approssimativo del dado in px. Default: 180 */
  size?: number;
  /** Dove si ferma il dado, in frazioni dello schermo. Default: centro {x:.5, y:.5} */
  landing?: { x: number; y: number };
  /** Millisecondi in cui il dado resta visibile dopo il salvataggio. Default: 1400 */
  holdMs?: number;
  /** Mostra un pulsante "Lancia il dado" integrato (utile per i test). Default: false */
  showButton?: boolean;
  /** Blocca il lancio (es. non è il turno del giocatore). */
  disabled?: boolean;
  /** Chiamata appena il dado si ferma, prima del salvataggio. */
  onRolled?: (roll: DieRoll) => void;
  /** Chiamata quando il server ha confermato il salvataggio. */
  onSaved?: (roll: DieRoll) => void;
  /** Chiamata quando il dado è svanito dallo schermo. */
  onClosed?: () => void;
  /** Salta il salvataggio POST (usa onRolled per il risultato). Default: false */
  skipSave?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Geometria del dodecaedro                                                  */
/* -------------------------------------------------------------------------- */

type V3 = [number, number, number];
type Quat = [number, number, number, number]; // [w, x, y, z]

const PHI = (1 + Math.sqrt(5)) / 2;

const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const normalize = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Le 20 vertici di un dodecaedro. */
const VERTICES: V3[] = (() => {
  const v: V3[] = [];
  for (const a of [1, -1]) {
    for (const b of [1, -1]) {
      for (const c of [1, -1]) v.push([a, b, c]);
      v.push([0, a / PHI, b * PHI]);
      v.push([a / PHI, b * PHI, 0]);
      v.push([a * PHI, 0, b / PHI]);
    }
  }
  return v;
})();

/** Le 12 normali (una per faccia pentagonale). */
const FACE_NORMALS: V3[] = (() => {
  const n: V3[] = [];
  for (const a of [1, -1]) {
    for (const b of [1, -1]) {
      n.push(normalize([0, a * PHI, b]));
      n.push(normalize([a, 0, b * PHI]));
      n.push(normalize([a * PHI, b, 0]));
    }
  }
  return n;
})();

interface FaceBasis {
  x: V3;
  y: V3;
  z: V3;
}

/**
 * Per ogni faccia calcola una base (x, y, z) con z = normale uscente e
 * "su" allineato a un vertice reale del pentagono: così le facce combaciano
 * perfettamente lungo gli spigoli.
 */
const FACE_BASES: FaceBasis[] = FACE_NORMALS.map((n) => {
  const max = Math.max(...VERTICES.map((v) => dot(v, n)));
  const v0 = VERTICES.find((v) => Math.abs(dot(v, n) - max) < 1e-6) as V3;
  const up = normalize(sub(v0, scale(n, dot(v0, n))));
  const y = scale(up, -1); // in CSS l'asse y punta verso il basso
  const z = n;
  const x = cross(y, z);
  return { x, y, z };
});

/** Rapporto tra distanza centro→faccia e raggio circoscritto del pentagono. */
const INRADIUS_RATIO = (() => {
  const n = FACE_NORMALS[0];
  const max = Math.max(...VERTICES.map((v) => dot(v, n)));
  const v0 = VERTICES.find((v) => Math.abs(dot(v, n) - max) < 1e-6) as V3;
  const p = sub(v0, scale(n, dot(v0, n)));
  return max / Math.hypot(p[0], p[1], p[2]);
})();

/**
 * Assegna 1-4 alle 12 facce: ogni numero esattamente 3 volte e, se possibile,
 * mai due facce adiacenti con lo stesso numero.
 */
const FACE_VALUES: DieValue[] = (() => {
  const adj = FACE_NORMALS.map((a) =>
    FACE_NORMALS.map((b) => {
      const d = dot(a, b);
      return d > 0.1 && d < 0.99; // facce che condividono uno spigolo
    }),
  );
  const counts = [0, 0, 0, 0];
  const cur: number[] = Array(12).fill(0);
  let best: number[] = [];
  let bestCost = Infinity;

  const dfs = (i: number, cost: number): void => {
    if (cost >= bestCost) return;
    if (i === 12) {
      best = [...cur];
      bestCost = cost;
      return;
    }
    for (let v = 0; v < 4; v++) {
      if (counts[v] >= 3) continue;
      let add = 0;
      for (let j = 0; j < i; j++) if (adj[i][j] && cur[j] === v) add++;
      cur[i] = v;
      counts[v]++;
      dfs(i + 1, cost + add);
      counts[v]--;
    }
  };
  dfs(0, 0);
  return best.map((v) => (v + 1) as DieValue);
})();

/* -------------------------------------------------------------------------- */
/*  Quaternioni (per un'animazione fluida e un arresto esatto sulla faccia)   */
/* -------------------------------------------------------------------------- */

const qMul = (a: Quat, b: Quat): Quat => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
];
const qConj = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];
const qNorm = (q: Quat): Quat => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};
const qAxisAngle = (axis: V3, angle: number): Quat => {
  const s = Math.sin(angle / 2);
  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
};

/** Matrice 3x3 (righe) → quaternione. */
const qFromRows = (r: [V3, V3, V3]): Quat => {
  const [m00, m01, m02] = r[0];
  const [m10, m11, m12] = r[1];
  const [m20, m21, m22] = r[2];
  const tr = m00 + m11 + m22;
  let q: Quat;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    q = [0.25 * s, (m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s];
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = [(m21 - m12) / s, 0.25 * s, (m01 + m10) / s, (m02 + m20) / s];
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = [(m02 - m20) / s, (m01 + m10) / s, 0.25 * s, (m12 + m21) / s];
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = [(m10 - m01) / s, (m02 + m20) / s, (m12 + m21) / s, 0.25 * s];
  }
  return qNorm(q);
};

/** Quaternione → matrice 3x3 (righe). */
const qToRows = (q: Quat): [V3, V3, V3] => {
  const [w, x, y, z] = q;
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
  ];
};

/**
 * Orientamento del dado che porta la faccia `i` di fronte allo spettatore,
 * con il numero dritto. R * F = I  →  R = F^T (le righe sono x, y, z).
 */
const FACE_TARGETS: Quat[] = FACE_BASES.map((b) => qFromRows([b.x, b.y, b.z]));

const rowsToMatrix3d = (m: [V3, V3, V3]): string =>
  `matrix3d(${m[0][0]},${m[1][0]},${m[2][0]},0,` +
  `${m[0][1]},${m[1][1]},${m[2][1]},0,` +
  `${m[0][2]},${m[1][2]},${m[2][2]},0,0,0,0,1)`;

/* -------------------------------------------------------------------------- */
/*  Utilità                                                                   */
/* -------------------------------------------------------------------------- */

/** Faccia casuale 0-11, uniforme e senza bias (rejection sampling). */
function randomFace(): number {
  const buf = new Uint8Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= 252); // 252 = 12 * 21
  return buf[0] % 12;
}

function randomAxis(): V3 {
  const a = Math.random() * Math.PI * 2;
  const z = Math.random() * 2 - 1;
  const r = Math.sqrt(1 - z * z);
  return [r * Math.cos(a), r * Math.sin(a), z];
}

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3.4);

const LIGHT = normalize([-0.35, -0.55, 0.75]);

const PENTAGON_CLIP = `polygon(${[0, 1, 2, 3, 4]
  .map((k) => {
    const a = ((90 + 72 * k) * Math.PI) / 180;
    return `${(50 + 50 * Math.cos(a)).toFixed(2)}% ${(50 - 50 * Math.sin(a)).toFixed(2)}%`;
  })
  .join(', ')})`;

/* -------------------------------------------------------------------------- */
/*  Componente                                                                */
/* -------------------------------------------------------------------------- */

type Phase = 'idle' | 'rolling' | 'saving' | 'saved' | 'error';

const FADE_MS = 450;

const SmartAssDie = forwardRef<SmartAssDieHandle, SmartAssDieProps>(function SmartAssDie(
  {
    endpoint = '/api/smart-ass/roll',
    gameId,
    playerId,
    size = 180,
    landing = { x: 0.5, y: 0.5 },
    holdMs = 1400,
    showButton = false,
    disabled = false,
    onRolled,
    onSaved,
    onClosed,
    skipSave = false,
  },
  ref,
) {
  const [mounted, setMounted] = useState(false); // il portal esiste solo sul client
  const [phase, setPhase] = useState<Phase>('idle');
  const [shown, setShown] = useState(false);
  const [roll, setRoll] = useState<DieRoll | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const dieRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quatRef = useRef<Quat>(FACE_TARGETS[0]);
  const rafRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef(true);

  const circumR = size * 0.3; // raggio circoscritto di ogni pentagono
  const apothem = circumR * INRADIUS_RATIO; // distanza centro→faccia

  const faceTransforms = useMemo(
    () =>
      FACE_BASES.map(
        ({ x, y, z }) =>
          `matrix3d(${x[0]},${x[1]},${x[2]},0,` +
          `${y[0]},${y[1]},${y[2]},0,` +
          `${z[0]},${z[1]},${z[2]},0,` +
          `${z[0] * apothem},${z[1] * apothem},${z[2] * apothem},1)`,
      ),
    [apothem],
  );

  const initialTransform = useMemo(() => rowsToMatrix3d(qToRows(FACE_TARGETS[0])), []);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  /** Applica orientazione + ombreggiatura direttamente al DOM (60 fps, niente re-render). */
  const applyPose = useCallback((q: Quat) => {
    const m = qToRows(q);
    if (dieRef.current) dieRef.current.style.transform = rowsToMatrix3d(m);
    for (let i = 0; i < 12; i++) {
      const el = faceRefs.current[i];
      if (!el) continue;
      const n = FACE_NORMALS[i];
      const wn: V3 = [dot(m[0], n), dot(m[1], n), dot(m[2], n)];
      const lit = Math.max(0, dot(wn, LIGHT));
      el.style.setProperty('--shade', (0.5 * (1 - lit)).toFixed(3));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setMounted(true);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (mounted) applyPose(quatRef.current);
  }, [mounted, applyPose]);

  /** Fa svanire il dado e torna allo stato iniziale. */
  const close = useCallback(() => {
    clearTimers();
    setShown(false);
    timersRef.current.push(
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('idle');
        onClosed?.();
      }, FADE_MS),
    );
  }, [onClosed]);

  const save = useCallback(
    async (r: DieRoll) => {
      if (skipSave) {
        setPhase('saved');
        onSaved?.(r);
        clearTimers();
        timersRef.current.push(window.setTimeout(close, holdMs));
        return;
      }
      setPhase('saving');
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...r, gameId, playerId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!mountedRef.current) return;
        setPhase('saved');
        onSaved?.(r);
        clearTimers();
        timersRef.current.push(window.setTimeout(close, holdMs));
      } catch {
        if (mountedRef.current) setPhase('error');
      }
    },
    [endpoint, gameId, playerId, onSaved, close, holdMs, skipSave],
  );

  const throwDie = useCallback(() => {
    if (phase === 'rolling' || phase === 'saving' || disabled) return;

    clearTimers();
    cancelAnimationFrame(rafRef.current);

    const face = randomFace();
    const target = FACE_TARGETS[face];
    const start = quatRef.current;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 350 : 2800;

    // Rotazione "pulita" start → target, più un tumbling extra che si annulla
    // esattamente a fine animazione.
    let delta = qMul(target, qConj(start));
    if (delta[0] < 0) delta = [-delta[0], -delta[1], -delta[2], -delta[3]];
    const sinHalf = Math.hypot(delta[1], delta[2], delta[3]);
    const baseAngle = 2 * Math.atan2(sinHalf, delta[0]);
    const baseAxis: V3 =
      sinHalf > 1e-6
        ? [delta[1] / sinHalf, delta[2] / sinHalf, delta[3] / sinHalf]
        : [0, 1, 0];
    const tumbleAxis = randomAxis();
    const tumbleTurns = reduced ? 0 : 2 + Math.floor(Math.random() * 2); // 2-3 giri

    // Il dado entra da un lato (fuori schermo) e si ferma sul punto di arrivo.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const fromLeft = Math.random() < 0.5;
    const startX = reduced
      ? 0
      : fromLeft
        ? -(vw * landing.x + size * 1.2)
        : vw * (1 - landing.x) + size * 1.2;
    const startY = reduced ? 0 : (Math.random() * 0.36 - 0.18) * vh;
    const hopHeight = size * 0.55;

    setRoll(null);
    setShown(true);
    setPhase('rolling');
    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOut(t);

      const q = qNorm(
        qMul(
          qAxisAngle(tumbleAxis, Math.PI * 2 * tumbleTurns * e),
          qMul(qAxisAngle(baseAxis, baseAngle * e), start),
        ),
      );
      applyPose(q);

      const x = startX * (1 - e);
      const y = startY * (1 - e);
      if (stageRef.current) {
        stageRef.current.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      }

      // Rimbalzi: l'altezza decresce fino a zero esattamente a fine animazione.
      const h = reduced
        ? 0
        : hopHeight * Math.pow(1 - t, 1.5) * Math.abs(Math.sin(Math.PI * 2.5 * t));
      if (hopRef.current) hopRef.current.style.transform = `translateY(${-h}px)`;
      if (shadowRef.current) {
        const k = h / hopHeight;
        shadowRef.current.style.transform = `scale(${1 - k * 0.4})`;
        shadowRef.current.style.opacity = String(0.38 - k * 0.2);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      quatRef.current = target;
      applyPose(target);

      const result: DieRoll = {
        value: FACE_VALUES[face],
        face,
        rolledAt: new Date().toISOString(),
      };
      setRoll(result);
      onRolled?.(result);
      void save(result);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [phase, disabled, size, landing.x, applyPose, onRolled, save]);

  useImperativeHandle(ref, () => ({ roll: throwDie }), [throwDie]);

  const busy = phase === 'rolling' || phase === 'saving';
  const settled = roll !== null && phase !== 'rolling';

  const overlay = (
    <div className="sa-overlay" data-on={shown ? 'true' : 'false'}>
      <style>{CSS}</style>

      <div
        ref={stageRef}
        className="sa-stage"
        style={{
          left: `${landing.x * 100}%`,
          top: `${landing.y * 100}%`,
          width: size * 1.5,
          height: size * 1.5,
          transform: `translate(-50%, -50%) translate(${-9999}px, 0)`,
          ['--sa-s' as string]: `${size}px`,
        }}
      >
        <div ref={shadowRef} className="sa-shadow" />
        <div ref={hopRef} className="sa-hop">
          <div className="sa-tilt">
            <div ref={dieRef} className="sa-body" style={{ transform: initialTransform }}>
              {FACE_VALUES.map((value, i) => (
                <div
                  key={i}
                  className="sa-face"
                  data-win={settled && roll?.face === i ? 'true' : undefined}
                  style={{
                    width: circumR * 2,
                    height: circumR * 2,
                    margin: `${-circumR}px 0 0 ${-circumR}px`,
                    transform: faceTransforms[i],
                  }}
                >
                  <div
                    ref={(el) => {
                      faceRefs.current[i] = el;
                    }}
                    className="sa-face__in"
                    style={{ fontSize: circumR * 0.95 }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {phase === 'error' && roll && (
          <div className="sa-panel">
            <span>Salvataggio non riuscito</span>
            <button type="button" className="sa-btn sa-btn--sm" onClick={() => void save(roll)}>
              Riprova
            </button>
            <button type="button" className="sa-btn sa-btn--ghost sa-btn--sm" onClick={throwDie}>
              Rilancia
            </button>
            <button type="button" className="sa-btn sa-btn--ghost sa-btn--sm" onClick={close}>
              Chiudi
            </button>
          </div>
        )}
      </div>

      <p className="sa-sr" role="status" aria-live="polite">
        {roll ? `Dado a dodici facce: è uscito il ${roll.value}.` : ''}
        {phase === 'saved' ? ' Risultato salvato.' : ''}
      </p>
    </div>
  );

  return (
    <>
      {showButton && (
        <div className="sa-trigger">
          <style>{CSS}</style>
          <button type="button" className="sa-btn" onClick={throwDie} disabled={busy || disabled}>
            {busy ? 'Il dado rotola…' : 'Lancia il dado'}
          </button>
        </div>
      )}
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
});

export default SmartAssDie;

/* -------------------------------------------------------------------------- */
/*  Stili (self-contained: nessun CSS esterno richiesto)                      */
/* -------------------------------------------------------------------------- */

const CSS = `
.sa-overlay, .sa-trigger {
  --sa-edge: #f2b632;
  --sa-edge-win: #fff3c4;
  --sa-ink: #fff1c9;
  --sa-fill-a: #6b3fb8;
  --sa-fill-b: #3a1f6e;
  --sa-accent: #f2b632;
  --sa-accent-ink: #2a1450;
  font-family: ui-rounded, 'Arial Rounded MT Bold', 'Nunito', system-ui, sans-serif;
}
.sa-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  pointer-events: none; /* la schermata di gioco resta cliccabile */
  opacity: 0;
  visibility: hidden;
  transition: opacity ${FADE_MS}ms ease, visibility 0s ${FADE_MS}ms;
}
.sa-overlay[data-on='true'] {
  opacity: 1;
  visibility: visible;
  transition: opacity 120ms ease, visibility 0s;
}
.sa-stage {
  position: absolute;
  perspective: calc(var(--sa-s) * 5);
  perspective-origin: 50% 50%;
}
.sa-shadow {
  position: absolute;
  left: 50%;
  top: calc(50% + var(--sa-s) * 0.5);
  width: calc(var(--sa-s) * 0.75);
  height: calc(var(--sa-s) * 0.14);
  margin-left: calc(var(--sa-s) * -0.375);
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(20 8 48 / 0.7), rgb(20 8 48 / 0));
  opacity: 0.38;
}
.sa-hop {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--sa-s);
  height: var(--sa-s);
  margin: calc(var(--sa-s) * -0.5) 0 0 calc(var(--sa-s) * -0.5);
  transform-style: preserve-3d;
}
.sa-tilt {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateX(-14deg) rotateY(9deg);
}
.sa-body {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
.sa-face {
  position: absolute;
  left: 50%;
  top: 50%;
  background: var(--sa-edge);
  clip-path: ${PENTAGON_CLIP};
  backface-visibility: hidden;
}
.sa-face__in {
  position: absolute;
  inset: 3.2%;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: ${PENTAGON_CLIP};
  background: radial-gradient(circle at 50% 40%, var(--sa-fill-a), var(--sa-fill-b));
  color: var(--sa-ink);
  font-weight: 800;
  line-height: 1;
  user-select: none;
}
.sa-face__in::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(14 6 36 / var(--shade, 0));
  pointer-events: none;
}
.sa-face[data-win='true'] { background: var(--sa-edge-win); }
.sa-face[data-win='true'] .sa-face__in { color: #ffffff; }

.sa-panel {
  position: absolute;
  left: 50%;
  top: calc(50% + var(--sa-s) * 0.68);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 14px;
  background: #2a1450;
  color: #fff1c9;
  font-size: 0.9rem;
  white-space: nowrap;
  pointer-events: auto; /* solo il pannello errore è cliccabile */
}

.sa-btn {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 0.75em 1.6em;
  font: inherit;
  font-weight: 700;
  color: var(--sa-accent-ink);
  background: var(--sa-accent);
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}
.sa-btn--sm { padding: 0.4em 0.9em; font-size: 0.85rem; }
.sa-btn--ghost { background: transparent; color: inherit; text-decoration: underline; }
.sa-btn:hover:not(:disabled) { filter: brightness(1.06); }
.sa-btn:active:not(:disabled) { transform: scale(0.97); }
.sa-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.sa-btn:focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }

.sa-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .sa-btn { transition: none; }
}
`;
