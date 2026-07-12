// Italian Sentence Generator for Sciarada
// SIMPLE structures: S+V+O, S+V+P, joined with "e" for compound
// NO "mentre", NO "che" relative clauses
// Minimal adjectives (0-1 per clause)

import {
  subjectNouns, objectNouns, placeNouns, personNouns,
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

// ---- Semantic pickers ----
const S = () => pick(subjectNouns);
const S2 = (...ex: Noun[]) => pickExcluding(subjectNouns, ...ex);
const P = () => pick(placeNouns);
const Per = () => pick(personNouns);

/** Pick transitive verb + compatible object */
function VO(): { v: Verb; o: Noun } {
  const v = pick(transitiveVerbs);
  return { v, o: pick(objectsForVerb(v)) };
}

/** Pick non-animate transitive verb + object (for passive) */
function VOpassive(): { v: Verb; o: Noun } {
  const pool = transitiveVerbs.filter(v => v.objectPool !== 'animate');
  const v = pick(pool);
  return { v, o: pick(objectsForVerb(v)) };
}

type Fn = () => string;

// ============ 4-WORD TEMPLATES ============
// Simple: S V P, S V O, S V adv P

const t4: Fn[] = [
  // "Il cavaliere coraggioso corre nel bosco"
  () => {
    const s = S(); const v = pick(intransitiveVerbs); const p = P();
    const a = pickAdj(s);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "Il cuoco cucina la torta nel castello"
  () => {
    const s = S(); const { v, o } = VO(); const p = P();
    return cap(`${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "La volpe corre velocemente nella foresta"
  () => {
    const s = S(); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = P();
    return cap(`${artNoun(s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il gatto si nasconde sotto il ponte"
  () => {
    const s = S(); const rv = pick(reflexiveVerbs); const dir = pick(directionPreps); const p = P();
    return cap(`${artNoun(s)} si ${rv.present} ${dir} ${artNoun(p)}`);
  },
  // "Il leone è più veloce della tartaruga"
  () => {
    const s1 = S(); const s2 = S2(s1); const a = pickAdj(s1);
    return cap(`${artNoun(s1)} è più ${adj(a, s1)} ${prepArtNoun('di', s2)}`);
  },
  // "La torta viene cucinata dal cuoco"
  () => {
    const { v, o } = VOpassive(); const s = S();
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return cap(`${artNoun(o)} viene ${pp} ${prepArtNoun('da', s)}`);
  },
  // "Il ragazzo cerca il tesoro dorato"
  () => {
    const s = S(); const { v, o } = VO(); const a = pickAdj(o);
    return cap(`${artNoun(s)} ${v.present} ${artNoun(o)} ${adj(a, o)}`);
  },
  // "Ogni notte il lupo corre nel bosco"
  () => {
    const t = pick(['ogni sera', 'ogni notte', 'ogni mattina', 'ogni giorno']);
    const s = S(); const v = pick(intransitiveVerbs); const p = P();
    return cap(`${t}, ${artNoun(s)} ${v.present} ${prepArtNoun('in', p)}`);
  },
  // "Senza la spada il cavaliere trema"
  () => {
    const o = pick(objectNouns); const s = S(); const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    return cap(`senza ${artNoun(o)}, ${artNoun(s)} ${v.present} ${adv}`);
  },
  // "Il cavaliere veloce corre verso il castello"
  () => {
    const s = S(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const p = P();
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} verso ${artNoun(p)}`);
  },
];

// ============ 5-WORD TEMPLATES ============
// S V O e S V, S V O P, S adj V adv P

const t5: Fn[] = [
  // "Il cuoco cucina la torta e il gatto dorme"
  () => {
    const s1 = S(); const { v: v1, o } = VO(); const s2 = S2(s1); const v2 = pick(intransitiveVerbs);
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present}`);
  },
  // "Il cavaliere coraggioso trova il tesoro nel castello"
  () => {
    const s = S(); const a = pickAdj(s); const { v, o } = VO(); const p = P();
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${artNoun(o)} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "La volpe corre velocemente nella foresta oscura"
  () => {
    const s = S(); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = P(); const a = pickAdj(p);
    return cap(`${artNoun(s)} ${v.present} ${adv} ${prepArtNoun('in', p)} ${adj(a, p)}`);
  },
  // "Il pirata furbo si arrampica sulla torre antica"
  () => {
    const s = S(); const a1 = pickAdj(s); const rv = pick(reflexiveVerbs); const p = P(); const a2 = pickAdj(p);
    return cap(`${artNoun(s)} ${adj(a1, s)} si ${rv.present} ${prepArtNoun('su', p)} ${adj(a2, p)}`);
  },
  // "Il lupo veloce corre e il gatto dorme"
  () => {
    const s1 = S(); const a = pickAdj(s1); const v1 = pick(intransitiveVerbs); const s2 = S2(s1); const v2 = pick(intransitiveVerbs);
    return cap(`${artNoun(s1)} ${adj(a, s1)} ${v1.present} e ${artNoun(s2)} ${v2.present}`);
  },
  // "Ogni mattina la nonna cucina la torta nel giardino"
  () => {
    const t = pick(['ogni mattina', 'ogni sera', 'ogni giorno']);
    const s = Per(); const { v, o } = VO(); const p = P();
    return cap(`${t}, ${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun('in', p)}`);
  },
  // "Il ragazzo corre nel bosco e il lupo dorme"
  () => {
    const s1 = S(); const v1 = pick(intransitiveVerbs); const p = P(); const s2 = S2(s1); const v2 = pick(intransitiveVerbs);
    return cap(`${artNoun(s1)} ${v1.present} ${prepArtNoun('in', p)} e ${artNoun(s2)} ${v2.present}`);
  },
  // "Il soldato porta la spada verso il castello"
  () => {
    const s = S(); const { v, o } = VO(); const p = P();
    return cap(`${artNoun(s)} ${v.present} ${artNoun(o)} verso ${artNoun(p)}`);
  },
  // "Il delfino è più veloce della tartaruga nell'oceano"
  () => {
    const s1 = S(); const a = pickAdj(s1); const s2 = S2(s1); const p = P();
    return cap(`${artNoun(s1)} è più ${adj(a, s1)} ${prepArtNoun('di', s2)} ${prepArtNoun('in', p)}`);
  },
];

// ============ 6-WORD TEMPLATES ============
// S V O e S V P, S adj V O P adj

const t6: Fn[] = [
  // "Il ragazzo trova il tesoro e la ragazza corre nel bosco"
  () => {
    const s1 = S(); const { v: v1, o } = VO(); const s2 = S2(s1); const v2 = pick(intransitiveVerbs); const p = P();
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present} ${prepArtNoun('in', p)}`);
  },
  // "Il cavaliere coraggioso corre velocemente nel bosco incantato"
  () => {
    const s = S(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = P(); const a2 = pickAdj(p);
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${adv} ${prepArtNoun('in', p)} ${adj(a2, p)}`);
  },
  // "Il cuoco cucina la torta e il ragazzo cerca il tesoro"
  () => {
    const s1 = S(); const { v: v1, o: o1 } = VO(); const s2 = S2(s1); const { v: v2, o: o2 } = VO();
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o1)} e ${artNoun(s2)} ${v2.present} ${artNoun(o2)}`);
  },
  // "Senza la lanterna il soldato coraggioso trema lentamente"
  () => {
    const o = pick(objectNouns); const s = S(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const adv = pick(adverbs);
    return cap(`senza ${artNoun(o)}, ${artNoun(s)} ${adj(a, s)} ${v.present} ${adv}`);
  },
  // "Ogni sera il pittore porta la corona nel castello antico"
  () => {
    const t = pick(['ogni mattina', 'ogni sera', 'durante la notte']);
    const s = Per(); const { v, o } = VO(); const p = P(); const a = pickAdj(p);
    return cap(`${t}, ${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun('in', p)} ${adj(a, p)}`);
  },
  // "Il pirata trova il tesoro dorato e balla furiosamente"
  () => {
    const s = S(); const { v: v1, o } = VO(); const a = pickAdj(o); const v2 = pick(intransitiveVerbs); const adv = pick(adverbs);
    return cap(`${artNoun(s)} ${v1.present} ${artNoun(o)} ${adj(a, o)} e ${v2.present} ${adv}`);
  },
  // "La spada antica viene trovata dal cavaliere nel castello"
  () => {
    const { v, o } = VOpassive(); const a = pickAdj(o); const s = S(); const p = P();
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return cap(`${artNoun(o)} ${adj(a, o)} viene ${pp} ${prepArtNoun('da', s)} ${prepArtNoun('in', p)}`);
  },
  // "Il cavaliere coraggioso cerca il tesoro nel castello"
  () => {
    const s = S(); const a = pickAdj(s); const { v, o } = VO(); const p = P();
    return cap(`${artNoun(s)} ${adj(a, s)} ${v.present} ${artNoun(o)} ${prepArtNoun(pick(locationPreps), p)}`);
  },
];

// ============ 7-WORD TEMPLATES ============
// Full compounds with "e"

const t7: Fn[] = [
  // "Il cuoco cucina la torta e la principessa corre nel bosco"
  () => {
    const s1 = S(); const { v: v1, o } = VO(); const s2 = S2(s1); const v2 = pick(intransitiveVerbs); const p = P();
    const adv = pick(adverbs);
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il pirata coraggioso trova il tesoro dorato e balla furiosamente nel castello"
  () => {
    const s = S(); const a1 = pickAdj(s); const { v: v1, o } = VO();
    const v2 = pick(intransitiveVerbs); const adv = pick(adverbs); const p = P();
    return cap(`${artNoun(s)} ${adj(a1, s)} ${v1.present} ${artNoun(o)} e ${v2.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il ragazzo cerca il tesoro e la ragazza porta la corona nel castello"
  () => {
    const s1 = S(); const { v: v1, o: o1 } = VO(); const s2 = S2(s1); const { v: v2, o: o2 } = VO(); const p = P();
    return cap(`${artNoun(s1)} ${v1.present} ${artNoun(o1)} e ${artNoun(s2)} ${v2.present} ${artNoun(o2)} ${prepArtNoun('in', p)}`);
  },
  // "Ogni mattina il nonno cucina la torta e il gatto dorme nel giardino"
  () => {
    const t = pick(['ogni mattina', 'ogni sera', 'durante la notte', 'al tramonto']);
    const s1 = Per(); const { v: v1, o } = VO(); const s2 = S2(s1); const v2 = pick(intransitiveVerbs); const p = P();
    return cap(`${t}, ${artNoun(s1)} ${v1.present} ${artNoun(o)} e ${artNoun(s2)} ${v2.present} ${prepArtNoun('in', p)}`);
  },
  // "Senza la spada dorata il soldato coraggioso cammina lentamente nel deserto"
  () => {
    const o = pick(objectNouns); const a1 = pickAdj(o); const s = S(); const a2 = pickAdj(s);
    const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = P();
    return cap(`senza ${artNoun(o)} ${adj(a1, o)}, ${artNoun(s)} ${adj(a2, s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il cavaliere corre nel bosco e il pirata cerca il tesoro dorato"
  () => {
    const s1 = S(); const v1 = pick(intransitiveVerbs); const p = P();
    const s2 = S2(s1); const { v: v2, o } = VO(); const a = pickAdj(o);
    return cap(`${artNoun(s1)} ${v1.present} ${prepArtNoun('in', p)} e ${artNoun(s2)} ${v2.present} ${artNoun(o)} ${adj(a, o)}`);
  },
  // "Il lupo coraggioso è più veloce della volpe e corre nel deserto"
  () => {
    const s1 = S(); const a1 = pickAdj(s1); const a2 = pick(adjsFor(s1).filter(a => a !== a1));
    const s2 = S2(s1); const v = pick(intransitiveVerbs); const p = P();
    return cap(`${artNoun(s1)} ${adj(a1, s1)} è più ${adj(a2 || a1, s1)} ${prepArtNoun('di', s2)} e ${v.present} ${prepArtNoun('in', p)}`);
  },
  // "La corona dorata viene trovata dal cavaliere coraggioso nel castello antico"
  () => {
    const { v, o } = VOpassive(); const a1 = pickAdj(o); const s = S(); const a2 = pickAdj(s); const p = P(); const a3 = pickAdj(p);
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
