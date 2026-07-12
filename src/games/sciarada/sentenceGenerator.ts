// Italian Sentence Generator for Sciarada
// Semantic coherence rules:
//   • Only HUMANS do transitive actions (animals never cook/carry/throw)
//   • Animals get verb restrictions (birds fly, fish swim, land animals run/sleep)
//   • Locations match subject habitat (water animals → water places)
//   • Simple structures: S+V+O, S+V+P, joined with "e"
//   • Minimal adjectives

import {
  personNouns, animalNouns, landAnimals, flyingAnimals, waterAnimals,
  objectNouns, placeNouns, landPlaces, waterPlaces,
  adjsFor, objectsForVerb, transitiveVerbs, intransitiveVerbs, reflexiveVerbs,
  adverbs, prepArticle, locationPreps, directionPreps,
  Noun, Adjective, Verb,
} from './wordBanks';

export type WordCount = 4 | 5 | 6 | 7 | 'random';

// ============ HELPERS ============

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickExcluding<T>(arr: T[], ...exclude: T[]): T {
  const filtered = arr.filter(item => !exclude.includes(item));
  return filtered.length > 0 ? pick(filtered) : pick(arr);
}

function pickAdj(n: Noun): Adjective { return pick(adjsFor(n)); }

function adj(a: Adjective, n: Noun): string {
  return n.gender === 'm' ? a.m : a.f;
}

function artNoun(n: Noun): string {
  if (n.article.endsWith("'")) return `${n.article}${n.word}`;
  return `${n.article} ${n.word}`;
}

function prepArtNoun(prep: string, n: Noun): string {
  const contracted = prepArticle(prep, n);
  if (contracted.endsWith("'")) return `${contracted}${n.word}`;
  return `${contracted} ${n.word}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============ SEMANTIC PICKERS ============

// Basic animal verbs (any land animal can do these)
const basicAnimalVerbs = intransitiveVerbs.filter(v =>
  ['corre', 'cammina', 'dorme', 'salta', 'trema', 'sbadiglia'].includes(v.present)
);
const flyVerbs = intransitiveVerbs.filter(v => v.present === 'vola');
const swimVerbs = intransitiveVerbs.filter(v =>
  ['nuota', 'galleggia'].includes(v.present)
);

/**
 * Pick a coherent subject + intransitive verb pair.
 * Handles: birds fly, fish swim, animals don't talk/explore/navigate.
 */
function pickSV(): { s: Noun; v: Verb } {
  // 50/50 person vs animal
  if (Math.random() < 0.5) {
    // Person — can do any intransitive verb
    return { s: pick(personNouns), v: pick(intransitiveVerbs) };
  }
  // Animal — restricted verbs
  const roll = Math.random();
  if (roll < 0.15 && flyingAnimals.length > 0) {
    // Flying animal
    const s = pick(flyingAnimals);
    const v = pick([...basicAnimalVerbs, ...flyVerbs]);
    return { s, v };
  }
  if (roll < 0.3 && waterAnimals.length > 0) {
    // Water animal
    const s = pick(waterAnimals);
    const v = pick([...basicAnimalVerbs, ...swimVerbs]);
    return { s, v };
  }
  // Land animal
  const s = pick(landAnimals);
  return { s, v: pick(basicAnimalVerbs) };
}

/**
 * Pick a coherent subject + transitive verb + compatible object.
 * ALWAYS uses a person subject (animals don't do transitive actions).
 */
function pickSVO(): { s: Noun; v: Verb; o: Noun } {
  const s = pick(personNouns);
  const v = pick(transitiveVerbs);
  const o = pick(objectsForVerb(v));
  return { s, v, o };
}

/** Non-animate transitive verb + object (for passive voice) */
function pickPassive(): { v: Verb; o: Noun } {
  const pool = transitiveVerbs.filter(v => v.objectPool !== 'animate');
  const v = pick(pool);
  return { v, o: pick(objectsForVerb(v)) };
}

/**
 * Pick a location that makes sense for the subject.
 * Water animals → water places, others → land places.
 */
function placeFor(s: Noun): Noun {
  if (s.cat === 'animal') {
    const isWater = waterAnimals.some(w => w.word === s.word);
    if (isWater) return pick(waterPlaces);
  }
  return pick(landPlaces);
}

/** Any place (when no subject context) */
const anyPlace = () => pick(placeNouns);

type Fn = () => string;

// ============ 4-WORD TEMPLATES ============

const t4: Fn[] = [
  // "Il cavaliere coraggioso corre nel bosco"
  () => {
    const { s, v } = pickSV(); const a = pickAdj(s); const p = placeFor(s);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "Il cuoco cucina la torta nel castello"
  () => {
    const { s, v, o } = pickSVO(); const p = placeFor(s);
    return cap(`${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "La volpe corre velocemente nella foresta"
  () => {
    const { s, v } = pickSV(); const adv = pick(adverbs); const p = placeFor(s);
    return cap(`${artNoun(s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il gatto si nasconde sotto il ponte"
  () => {
    const s = pick([...personNouns, ...landAnimals]);
    const rv = pick(reflexiveVerbs); const dir = pick(directionPreps); const p = placeFor(s);
    return cap(`${artNoun(s)} si ${rv.present} ${dir} ${artNoun(p)}`);
  },
  // "Il leone è più veloce della volpe"
  () => {
    const s1 = pick([...personNouns, ...animalNouns]);
    const s2 = pickExcluding([...personNouns, ...animalNouns], s1);
    const a = pickAdj(s1);
    return cap(`${artNoun(s1)} è più ${adj(a, s1)} ${prepArtNoun('di', s2)}`);
  },
  // "La torta viene cucinata dal cuoco"
  () => {
    const { v, o } = pickPassive(); const s = pick(personNouns);
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return cap(`${artNoun(o)} viene ${pp} ${prepArtNoun('da', s)}`);
  },
  // "Il ragazzo cerca il tesoro dorato"
  () => {
    const { s, v, o } = pickSVO(); const a = pickAdj(o);
    return cap(`${artNoun(s)} ${v.present} ${artNoun(o)} ${adj(a, o)}`);
  },
  // "Ogni notte il lupo corre nel bosco"
  () => {
    const t = pick(['ogni sera', 'ogni notte', 'ogni mattina', 'ogni giorno']);
    const { s, v } = pickSV(); const p = placeFor(s);
    return cap(`${t}, ${artNoun(s)} ${v.present} ${prepArtNoun('in', p)}`);
  },
  // "Senza la spada il cavaliere trema"
  () => {
    const o = pick(objectNouns); const { s, v } = pickSV(); const adv = pick(adverbs);
    return cap(`senza ${artNoun(o)}, ${artNoun(s)} ${v.present} ${adv}`);
  },
  // "Il cavaliere veloce corre verso il castello"
  () => {
    const { s, v } = pickSV(); const a = pickAdj(s); const p = placeFor(s);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} verso ${artNoun(p)}`);
  },
];

// ============ 5-WORD TEMPLATES ============

const t5: Fn[] = [
  // "Il cuoco cucina la torta e il gatto dorme"
  () => {
    const { s: s1, v: v1, o } = pickSVO();
    const { s: s2, v: v2 } = pickSV();
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present}`);
  },
  // "Il cavaliere coraggioso trova il tesoro nel castello"
  () => {
    const { s, v, o } = pickSVO(); const a = pickAdj(s); const p = placeFor(s);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${artNoun(o)} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "La volpe corre velocemente nella foresta oscura"
  () => {
    const { s, v } = pickSV(); const adv = pick(adverbs); const p = placeFor(s); const a = pickAdj(p);
    return cap(`${artNoun(s)} ${v.present} ${adv} ${prepArtNoun('in', p)} ${adj(a, p)}`);
  },
  // "Il lupo veloce corre e il gatto dorme"
  () => {
    const { s: s1, v: v1 } = pickSV(); const a = pickAdj(s1);
    const { s: s2, v: v2 } = pickSV();
    return cap(`${artNoun(s1)} ${adj(a, s1)} ${v1.present} e ${artNoun(s2)} ${v2.present}`);
  },
  // "Ogni mattina la nonna cucina la torta nel giardino"
  () => {
    const t = pick(['ogni mattina', 'ogni sera', 'ogni giorno']);
    const { s, v, o } = pickSVO(); const p = placeFor(s);
    return cap(`${t}, ${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun('in', p)}`);
  },
  // "Il ragazzo corre nel bosco e il lupo dorme"
  () => {
    const { s: s1, v: v1 } = pickSV(); const p = placeFor(s1);
    const { s: s2, v: v2 } = pickSV();
    return cap(`${artNoun(s1)} ${v1.present} ${prepArtNoun('in', p)} e ${artNoun(s2)} ${v2.present}`);
  },
  // "Il soldato porta la spada verso il castello"
  () => {
    const { s, v, o } = pickSVO(); const p = placeFor(s);
    return cap(`${artNoun(s)} ${v.present} ${artNoun(o)} verso ${artNoun(p)}`);
  },
  // "Il delfino è più agile della tartaruga nell'oceano"
  () => {
    const s1 = pick([...personNouns, ...animalNouns]);
    const s2 = pickExcluding([...personNouns, ...animalNouns], s1);
    const a = pickAdj(s1); const p = placeFor(s1);
    return cap(`${artNoun(s1)} è più ${adj(a, s1)} ${prepArtNoun('di', s2)} ${prepArtNoun('in', p)}`);
  },
  // "Il pirata furbo si arrampica sulla torre antica"
  () => {
    const s = pick([...personNouns, ...landAnimals]);
    const a1 = pickAdj(s); const rv = pick(reflexiveVerbs); const p = placeFor(s); const a2 = pickAdj(p);
    return cap(`${artNoun(s)} ${adj(a1, s)} si ${rv.present} ${prepArtNoun('su', p)} ${adj(a2, p)}`);
  },
];

// ============ 6-WORD TEMPLATES ============

const t6: Fn[] = [
  // "Il ragazzo trova il tesoro e la ragazza corre nel bosco"
  () => {
    const { s: s1, v: v1, o } = pickSVO();
    const { s: s2, v: v2 } = pickSV(); const p = placeFor(s2);
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present} ${prepArtNoun('in', p)}`);
  },
  // "Il cavaliere coraggioso corre velocemente nel bosco incantato"
  () => {
    const { s, v } = pickSV(); const a = pickAdj(s); const adv = pick(adverbs); const p = placeFor(s); const a2 = pickAdj(p);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${adv} ${prepArtNoun('in', p)} ${adj(a2, p)}`);
  },
  // "Il cuoco cucina la torta e il ragazzo cerca il tesoro"
  () => {
    const { s: s1, v: v1, o: o1 } = pickSVO();
    const { s: s2, v: v2, o: o2 } = pickSVO();
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o1)} e ${artNoun(s2)} ${v2.present} ${artNoun(o2)}`);
  },
  // "Senza la lanterna il soldato coraggioso trema lentamente"
  () => {
    const o = pick(objectNouns); const { s, v } = pickSV(); const a = pickAdj(s); const adv = pick(adverbs);
    return cap(`senza ${artNoun(o)}, ${artNoun(s)} ${adj(a, s)} ${v.present} ${adv}`);
  },
  // "Ogni sera il pittore porta la corona nel castello antico"
  () => {
    const t = pick(['ogni mattina', 'ogni sera', 'durante la notte']);
    const { s, v, o } = pickSVO(); const p = placeFor(s); const a = pickAdj(p);
    return cap(`${t}, ${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun('in', p)} ${adj(a, p)}`);
  },
  // "Il pirata trova il tesoro dorato e balla furiosamente"
  () => {
    const { s, v: v1, o } = pickSVO(); const a = pickAdj(o);
    const v2 = pick(intransitiveVerbs); const adv = pick(adverbs);
    return cap(`${artNoun(s)} ${v1.present} ${artNoun(o)} ${adj(a, o)} e ${v2.present} ${adv}`);
  },
  // "La spada antica viene trovata dal cavaliere nel castello"
  () => {
    const { v, o } = pickPassive(); const a = pickAdj(o); const s = pick(personNouns); const p = placeFor(s);
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return cap(`${artNoun(o)} ${adj(a, o)} viene ${pp} ${prepArtNoun('da', s)} ${prepArtNoun('in', p)}`);
  },
  // "Il cavaliere coraggioso cerca il tesoro nel castello"
  () => {
    const { s, v, o } = pickSVO(); const a = pickAdj(s); const p = placeFor(s);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${artNoun(o)} ${prepArtNoun(pick(locationPreps), p)}`);
  },
];

// ============ 7-WORD TEMPLATES ============

const t7: Fn[] = [
  // "Il cuoco cucina la torta e la principessa corre velocemente nel bosco"
  () => {
    const { s: s1, v: v1, o } = pickSVO();
    const { s: s2, v: v2 } = pickSV(); const adv = pick(adverbs); const p = placeFor(s2);
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il pirata coraggioso trova il tesoro e balla furiosamente nel castello"
  () => {
    const { s, v: v1, o } = pickSVO(); const a = pickAdj(s);
    const v2 = pick(intransitiveVerbs); const adv = pick(adverbs); const p = placeFor(s);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v1.present} ${artNoun(o)} e ${v2.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il ragazzo cerca il tesoro e la ragazza porta la corona nel castello"
  () => {
    const { s: s1, v: v1, o: o1 } = pickSVO();
    const { s: s2, v: v2, o: o2 } = pickSVO(); const p = placeFor(s2);
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o1)} e ${artNoun(s2)} ${v2.present} ${artNoun(o2)} ${prepArtNoun('in', p)}`);
  },
  // "Ogni mattina il nonno cucina la torta e il gatto dorme nel giardino"
  () => {
    const t = pick(['ogni mattina', 'ogni sera', 'durante la notte', 'al tramonto']);
    const { s: s1, v: v1, o } = pickSVO();
    const { s: s2, v: v2 } = pickSV(); const p = placeFor(s2);
    return cap(`${t}, ${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present} ${prepArtNoun('in', p)}`);
  },
  // "Senza la spada dorata il soldato coraggioso cammina lentamente nel deserto"
  () => {
    const o = pick(objectNouns); const a1 = pickAdj(o);
    const { s, v } = pickSV(); const a2 = pickAdj(s);
    const adv = pick(adverbs); const p = placeFor(s);
    return cap(`senza ${artNoun(o)} ${adj(a1, o)}, ${artNoun(s)} ${adj(a2, s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il cavaliere corre nel bosco e il pirata cerca il tesoro dorato"
  () => {
    const { s: s1, v: v1 } = pickSV(); const p = placeFor(s1);
    const { s: s2, v: v2, o } = pickSVO(); const a = pickAdj(o);
    return cap(`${artNoun(s1)} ${v1.present} ${prepArtNoun('in', p)} e ${artNoun(s2)} ${v2.present} ${artNoun(o)} ${adj(a, o)}`);
  },
  // "Il lupo coraggioso è più veloce della volpe e corre nel deserto"
  () => {
    const s1 = pick([...personNouns, ...landAnimals]);
    const a1 = pickAdj(s1);
    const pool = adjsFor(s1).filter(a => a !== a1);
    const a2 = pool.length > 0 ? pick(pool) : a1;
    const s2 = pickExcluding([...personNouns, ...animalNouns], s1);
    const v = pick(basicAnimalVerbs); const p = placeFor(s1);
    return cap(`${artNoun(s1)} ${adj(a1, s1)} è più ${adj(a2, s1)} ${prepArtNoun('di', s2)} e ${v.present} ${prepArtNoun('in', p)}`);
  },
  // "La corona dorata viene trovata dal cavaliere coraggioso nel castello antico"
  () => {
    const { v, o } = pickPassive(); const a1 = pickAdj(o);
    const s = pick(personNouns); const a2 = pickAdj(s);
    const p = placeFor(s); const a3 = pickAdj(p);
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return cap(`${artNoun(o)} ${adj(a1, o)} viene ${pp} ${prepArtNoun('da', s)} ${adj(a2, s)} ${prepArtNoun('in', p)} ${adj(a3, p)}`);
  },
];

// ============ MAIN GENERATOR ============

const templateMap: Record<number, Fn[]> = { 4: t4, 5: t5, 6: t6, 7: t7 };

export function generateSentence(wordCount: WordCount): string {
  const count = wordCount === 'random' ? pick([4, 5, 6, 7] as const) : wordCount;
  return pick(templateMap[count])();
}
