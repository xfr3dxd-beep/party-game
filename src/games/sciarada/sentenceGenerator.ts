// Italian Sentence Generator for Sciarada
// Uses semantic noun categories to guarantee grammatical & logical coherence:
//   • Subjects are always animate (person / animal)
//   • Objects are things (object / food / concept)
//   • Locations are places
//   • Adjectives match the noun's animate/inanimate nature
//   • Gender agreement is enforced everywhere

import {
  subjectNouns, objectNouns, placeNouns, personNouns,
  adjectives, adjsFor, transitiveVerbs, intransitiveVerbs, reflexiveVerbs,
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

/** Pick a random adjective that fits the noun's category */
function pickAdj(n: Noun): Adjective {
  return pick(adjsFor(n));
}

/** Pick an adjective different from another */
function pickAdj2(n: Noun, exclude: Adjective): Adjective {
  const valid = adjsFor(n).filter(a => a !== exclude);
  return valid.length > 0 ? pick(valid) : exclude;
}

/** Get the gendered adjective form for a noun */
function adj(a: Adjective, n: Noun): string {
  return n.gender === 'm' ? a.m : a.f;
}

/** "il cane" or "l'uomo" (handles elision) */
function artNoun(n: Noun): string {
  if (n.article.endsWith("'")) return `${n.article}${n.word}`;
  return `${n.article} ${n.word}`;
}

/** "nel bosco" or "nell'oceano" (preposition + article contraction) */
function prepArtNoun(prep: string, n: Noun): string {
  const contracted = prepArticle(prep, n);
  if (contracted.endsWith("'")) return `${contracted}${n.word}`;
  return `${contracted} ${n.word}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Shorthand pickers for semantic roles
const subj = () => pick(subjectNouns);          // animate subject
const subjNot = (...ex: Noun[]) => pickExcluding(subjectNouns, ...ex);
const obj = () => pick(objectNouns);            // thing / food / concept
const objNot = (...ex: Noun[]) => pickExcluding(objectNouns, ...ex);
const place = () => pick(placeNouns);           // location
const placeNot = (...ex: Noun[]) => pickExcluding(placeNouns, ...ex);
const person = () => pick(personNouns);         // human only

type TemplateFn = () => string;

// ============ 4-WORD TEMPLATES ============

const templates4: TemplateFn[] = [
  // "Il cane veloce corre nel bosco"
  () => {
    const s = subj(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const p = place();
    return capitalize(`${artNoun(s)} ${adj(a, s)} ${v.present} ${prepArtNoun(pick(locationPreps), p)}`);
  },
  // "Il cuoco prepara la torta dorata"
  () => {
    const s = subj(); const v = pick(transitiveVerbs); const o = obj(); const a = pickAdj(o);
    return capitalize(`${artNoun(s)} ${v.present} ${artNoun(o)} ${adj(a, o)}`);
  },
  // "Camminando nel bosco, trova il tesoro"
  () => {
    const v1 = pick(intransitiveVerbs); const p = place(); const v2 = pick(transitiveVerbs); const o = obj();
    return capitalize(`${v1.gerund} ${prepArtNoun(pick(locationPreps), p)}, ${v2.present} ${artNoun(o)}`);
  },
  // "Il ragazzo furbo che canta sorride"
  () => {
    const s = subj(); const a = pickAdj(s); const v1 = pick(intransitiveVerbs); const v2 = pickExcluding(intransitiveVerbs, v1);
    return capitalize(`${artNoun(s)} ${adj(a, s)} che ${v1.present} ${v2.present}`);
  },
  // "Che bella torta nel forno antico!" (objects/places only)
  () => {
    const o = obj(); const a1 = pickAdj(o); const p = place(); const a2 = pickAdj(p);
    return `Che ${adj(a1, o)} ${o.word} ${prepArtNoun(pick(locationPreps), p)} ${adj(a2, p)}!`;
  },
  // "Il gatto si nasconde sotto il ponte"
  () => {
    const s = subj(); const rv = pick(reflexiveVerbs); const p = place();
    return capitalize(`${artNoun(s)} si ${rv.present} ${pick(directionPreps)} ${artNoun(p)}`);
  },
  // "Il leone è più veloce della tartaruga"
  () => {
    const s1 = subj(); const s2 = subjNot(s1); const a = pickAdj(s1);
    return capitalize(`${artNoun(s1)} è più ${adj(a, s1)} ${prepArtNoun('di', s2)}`);
  },
  // "La torta viene preparata dal cuoco" (passive — object as grammatical subject)
  () => {
    const o = obj(); const v = pick(transitiveVerbs); const s = subj();
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return capitalize(`${artNoun(o)} viene ${pp} ${prepArtNoun('da', s)}`);
  },
  // "Il cavaliere coraggioso corre verso il castello"
  () => {
    const s = subj(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const p = place();
    return capitalize(`${artNoun(s)} ${adj(a, s)} ${v.present} verso ${artNoun(p)}`);
  },
  // "La volpe cammina silenziosamente nella foresta"
  () => {
    const s = subj(); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place();
    return capitalize(`${artNoun(s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Ogni notte il lupo corre nella foresta"
  () => {
    const s = subj(); const v = pick(intransitiveVerbs); const p = place();
    const temporal = pick(['ogni sera', 'ogni notte', 'ogni mattina', 'ogni giorno']);
    return capitalize(`${temporal}, ${artNoun(s)} ${v.present} ${prepArtNoun('in', p)}`);
  },
  // "Senza la spada, il cavaliere trema"
  () => {
    const o = obj(); const s = subj(); const v = pick(intransitiveVerbs); const adv = pick(adverbs);
    return capitalize(`senza ${artNoun(o)}, ${artNoun(s)} ${v.present} ${adv}`);
  },
];

// ============ 5-WORD TEMPLATES ============

const templates5: TemplateFn[] = [
  // "La ragazza allegra canta dolcemente nella chiesa"
  () => {
    const s = subj(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place();
    return capitalize(`${artNoun(s)} ${adj(a, s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il cuoco cucina la torta mentre il gatto dorme"
  () => {
    const s1 = subj(); const v1 = pick(transitiveVerbs); const o = obj(); const s2 = subjNot(s1); const v2 = pick(intransitiveVerbs);
    return capitalize(`${artNoun(s1)} ${v1.present} ${artNoun(o)} mentre ${artNoun(s2)} ${v2.present}`);
  },
  // "Il ragazzo che suona la chitarra sorride alla nonna"
  () => {
    const s = subj(); const v1 = pick(transitiveVerbs); const o = obj(); const v2 = pick(intransitiveVerbs); const s2 = subjNot(s);
    return capitalize(`${artNoun(s)} che ${v1.present} ${artNoun(o)} ${v2.present} ${prepArtNoun('a', s2)}`);
  },
  // "Camminando nel bosco incantato, il cavaliere trova il tesoro"
  () => {
    const v1 = pick(intransitiveVerbs); const p = place(); const a = pickAdj(p); const s = subj(); const v2 = pick(transitiveVerbs); const o = obj();
    return capitalize(`${v1.gerund} ${prepArtNoun('in', p)} ${adj(a, p)}, ${artNoun(s)} ${v2.present} ${artNoun(o)}`);
  },
  // "Il pirata furbo si arrampica sulla torre antica"
  () => {
    const s = subj(); const a1 = pickAdj(s); const rv = pick(reflexiveVerbs); const p = place(); const a2 = pickAdj(p);
    return capitalize(`${artNoun(s)} ${adj(a1, s)} si ${rv.present} ${prepArtNoun('su', p)} ${adj(a2, p)}`);
  },
  // "Il leone grande e coraggioso corre nel deserto"
  () => {
    const s = subj(); const a1 = pickAdj(s); const a2 = pickAdj2(s, a1); const v = pick(intransitiveVerbs); const p = place();
    return capitalize(`${artNoun(s)} ${adj(a1, s)} e ${adj(a2, s)} ${v.present} ${prepArtNoun('in', p)}`);
  },
  // "Il cuoco cucina la torta per sorprendere la principessa"
  () => {
    const s = person(); const v1 = pick(transitiveVerbs); const o = obj(); const v2 = pickExcluding(transitiveVerbs, v1); const s2 = subjNot(s);
    return capitalize(`${artNoun(s)} ${v1.present} ${artNoun(o)} per ${v2.infinitive} ${artNoun(s2)}`);
  },
  // "La corona dorata viene trovata nella grotta oscura"
  () => {
    const o = obj(); const a1 = pickAdj(o); const v = pick(transitiveVerbs); const p = place(); const a2 = pickAdj(p);
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return capitalize(`${artNoun(o)} ${adj(a1, o)} viene ${pp} ${prepArtNoun('in', p)} ${adj(a2, p)}`);
  },
  // "Il delfino è più agile della tartaruga nell'oceano"
  () => {
    const s1 = subj(); const a = pickAdj(s1); const s2 = subjNot(s1); const p = place();
    return capitalize(`${artNoun(s1)} è più ${adj(a, s1)} ${prepArtNoun('di', s2)} ${prepArtNoun('in', p)}`);
  },
  // "Che bello spettacolo guardare il tramonto dalla collina!"
  () => {
    const o1 = obj(); const a = pickAdj(o1); const v = pick(transitiveVerbs); const o2 = objNot(o1); const p = place();
    return `Che ${adj(a, o1)} ${o1.word} ${v.infinitive} ${artNoun(o2)} ${prepArtNoun('da', p)}!`;
  },
  // "Il lupo corre velocemente mentre la volpe si nasconde"
  () => {
    const s1 = subj(); const v1 = pick(intransitiveVerbs); const adv = pick(adverbs); const s2 = subjNot(s1); const rv = pick(reflexiveVerbs);
    return capitalize(`${artNoun(s1)} ${v1.present} ${adv} mentre ${artNoun(s2)} si ${rv.present}`);
  },
  // "Ogni mattina la nonna prepara la minestra nel castello"
  () => {
    const temporal = pick(['ogni mattina', 'ogni sera', 'ogni giorno']);
    const s = person(); const v = pick(transitiveVerbs); const o = obj(); const p = place();
    return capitalize(`${temporal}, ${artNoun(s)} ${v.present} ${artNoun(o)} ${prepArtNoun('in', p)}`);
  },
];

// ============ 6-WORD TEMPLATES ============

const templates6: TemplateFn[] = [
  // "Il cavaliere coraggioso cammina lentamente nel bosco incantato"
  () => {
    const s = subj(); const a1 = pickAdj(s); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place(); const a2 = pickAdj(p);
    return capitalize(`${artNoun(s)} ${adj(a1, s)} ${v.present} ${adv} ${prepArtNoun('in', p)} ${adj(a2, p)}`);
  },
  // "Il ragazzo allegro trova la spada mentre la ragazza balla"
  () => {
    const s1 = subj(); const a = pickAdj(s1); const v1 = pick(transitiveVerbs); const o = obj(); const s2 = subjNot(s1); const v2 = pick(intransitiveVerbs);
    return capitalize(`${artNoun(s1)} ${adj(a, s1)} ${v1.present} ${artNoun(o)} mentre ${artNoun(s2)} ${v2.present}`);
  },
  // "Il pirata che trova la corona dorata sorride allegramente"
  () => {
    const s = subj(); const v1 = pick(transitiveVerbs); const o = obj(); const a = pickAdj(o); const v2 = pick(intransitiveVerbs); const adv = pick(adverbs);
    return capitalize(`${artNoun(s)} che ${v1.present} ${artNoun(o)} ${adj(a, o)} ${v2.present} ${adv}`);
  },
  // "Correndo nella foresta oscura, il lupo coraggioso si nasconde"
  () => {
    const v1 = pick(intransitiveVerbs); const p = place(); const a1 = pickAdj(p); const s = subj(); const a2 = pickAdj(s); const rv = pick(reflexiveVerbs);
    return capitalize(`${v1.gerund} ${prepArtNoun('in', p)} ${adj(a1, p)}, ${artNoun(s)} ${adj(a2, s)} si ${rv.present}`);
  },
  // "La spada antica viene trovata dal cavaliere coraggioso nel castello"
  () => {
    const o = obj(); const a1 = pickAdj(o); const v = pick(transitiveVerbs); const s = subj(); const a2 = pickAdj(s); const p = place();
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return capitalize(`${artNoun(o)} ${adj(a1, o)} viene ${pp} ${prepArtNoun('da', s)} ${adj(a2, s)} ${prepArtNoun('in', p)}`);
  },
  // "Il maestro generoso prepara la sorpresa preziosa per il cantante"
  () => {
    const s = person(); const a1 = pickAdj(s); const v = pick(transitiveVerbs); const o = obj(); const a2 = pickAdj(o); const s2 = subjNot(s);
    return capitalize(`${artNoun(s)} ${adj(a1, s)} ${v.present} ${artNoun(o)} ${adj(a2, o)} per ${artNoun(s2)}`);
  },
  // "Senza la lanterna magica, il soldato coraggioso trema lentamente"
  () => {
    const o = obj(); const a1 = pickAdj(o); const s = subj(); const a2 = pickAdj(s); const v = pick(intransitiveVerbs); const adv = pick(adverbs);
    return capitalize(`senza ${artNoun(o)} ${adj(a1, o)}, ${artNoun(s)} ${adj(a2, s)} ${v.present} ${adv}`);
  },
  // "Ogni sera, il pittore allegro dipinge lentamente nel giardino incantato"
  () => {
    const temporal = pick(['ogni mattina', 'ogni sera', 'durante la notte']);
    const s = person(); const a = pickAdj(s); const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place(); const a2 = pickAdj(p);
    return capitalize(`${temporal}, ${artNoun(s)} ${adj(a, s)} ${v.present} ${adv} ${prepArtNoun('in', p)} ${adj(a2, p)}`);
  },
  // "Il pirata trova il tesoro dorato e balla furiosamente"
  () => {
    const s = subj(); const v1 = pick(transitiveVerbs); const o = obj(); const a = pickAdj(o); const v2 = pick(intransitiveVerbs); const adv = pick(adverbs);
    return capitalize(`${artNoun(s)} ${v1.present} ${artNoun(o)} ${adj(a, o)} e ${v2.present} ${adv}`);
  },
  // "Il leone coraggioso è più veloce della tartaruga nel deserto"
  () => {
    const s1 = subj(); const a1 = pickAdj(s1); const a2 = pickAdj2(s1, a1); const s2 = subjNot(s1); const p = place();
    return capitalize(`${artNoun(s1)} ${adj(a1, s1)} è più ${adj(a2, s1)} ${prepArtNoun('di', s2)} ${prepArtNoun('in', p)}`);
  },
];

// ============ 7-WORD TEMPLATES ============

const templates7: TemplateFn[] = [
  // "Il cuoco allegro prepara la torta mentre la principessa elegante balla"
  () => {
    const s1 = subj(); const a1 = pickAdj(s1); const v1 = pick(transitiveVerbs); const o = obj();
    const s2 = subjNot(s1); const a2 = pickAdj(s2); const v2 = pick(intransitiveVerbs); const adv = pick(adverbs);
    return capitalize(`${artNoun(s1)} ${adj(a1, s1)} ${v1.present} ${artNoun(o)} mentre ${artNoun(s2)} ${adj(a2, s2)} ${v2.present} ${adv}`);
  },
  // "Camminando nella foresta oscura, il cavaliere coraggioso trova la spada magica"
  () => {
    const v1 = pick(intransitiveVerbs); const p = place(); const a1 = pickAdj(p);
    const s = subj(); const a2 = pickAdj(s); const v2 = pick(transitiveVerbs); const o = obj(); const a3 = pickAdj(o);
    return capitalize(`${v1.gerund} ${prepArtNoun('in', p)} ${adj(a1, p)}, ${artNoun(s)} ${adj(a2, s)} ${v2.present} ${artNoun(o)} ${adj(a3, o)}`);
  },
  // "Il ragazzo furbo che porta la corona corre velocemente nel castello"
  () => {
    const s = subj(); const a1 = pickAdj(s); const v1 = pick(transitiveVerbs); const o = obj();
    const v2 = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place();
    return capitalize(`${artNoun(s)} ${adj(a1, s)} che ${v1.present} ${artNoun(o)} ${v2.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Il maestro generoso prepara la torta preziosa per sorprendere il bambino allegro"
  () => {
    const s = person(); const a1 = pickAdj(s); const v1 = pick(transitiveVerbs); const o = obj(); const a2 = pickAdj(o);
    const v2 = pickExcluding(transitiveVerbs, v1); const s2 = subjNot(s); const a3 = pickAdj(s2);
    return capitalize(`${artNoun(s)} ${adj(a1, s)} ${v1.present} ${artNoun(o)} ${adj(a2, o)} per ${v2.infinitive} ${artNoun(s2)} ${adj(a3, s2)}`);
  },
  // "La corona dorata viene trovata lentamente dal cavaliere coraggioso nel castello"
  () => {
    const o = obj(); const a1 = pickAdj(o); const v = pick(transitiveVerbs); const adv = pick(adverbs);
    const s = subj(); const a2 = pickAdj(s); const p = place();
    const pp = o.gender === 'm' ? v.pastPart : v.pastPartF;
    return capitalize(`${artNoun(o)} ${adj(a1, o)} viene ${pp} ${adv} ${prepArtNoun('da', s)} ${adj(a2, s)} ${prepArtNoun('in', p)}`);
  },
  // "Il pirata coraggioso trova il tesoro dorato e balla furiosamente nel castello"
  () => {
    const s = subj(); const a1 = pickAdj(s); const v1 = pick(transitiveVerbs); const o = obj();
    const v2 = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place(); const a2 = pickAdj(p);
    return capitalize(`${artNoun(s)} ${adj(a1, s)} ${v1.present} ${artNoun(o)} e ${v2.present} ${adv} ${prepArtNoun('in', p)} ${adj(a2, p)}`);
  },
  // "Ogni mattina, il nonno allegro prepara la minestra preziosa nel giardino"
  () => {
    const temporal = pick(['ogni mattina', 'ogni sera', 'durante la notte', 'al tramonto']);
    const s = person(); const a1 = pickAdj(s); const v = pick(transitiveVerbs); const o = obj(); const a2 = pickAdj(o); const p = place();
    return capitalize(`${temporal}, ${artNoun(s)} ${adj(a1, s)} ${v.present} ${artNoun(o)} ${adj(a2, o)} ${prepArtNoun('in', p)}`);
  },
  // "Senza la spada dorata, il soldato coraggioso cammina lentamente nel deserto"
  () => {
    const o = obj(); const a1 = pickAdj(o); const s = subj(); const a2 = pickAdj(s);
    const v = pick(intransitiveVerbs); const adv = pick(adverbs); const p = place();
    return capitalize(`senza ${artNoun(o)} ${adj(a1, o)}, ${artNoun(s)} ${adj(a2, s)} ${v.present} ${adv} ${prepArtNoun('in', p)}`);
  },
  // "Che bella avventura trovare la corona nascosta nella grotta profonda!"
  () => {
    const o1 = obj(); const a1 = pickAdj(o1); const v = pick(transitiveVerbs);
    const o2 = objNot(o1); const a2 = pickAdj(o2); const p = place(); const a3 = pickAdj(p);
    return `Che ${adj(a1, o1)} ${o1.word} ${v.infinitive} ${artNoun(o2)} ${adj(a2, o2)} ${prepArtNoun('in', p)} ${adj(a3, p)}!`;
  },
  // "Il leone coraggioso è più veloce della tartaruga e corre nel deserto arido"
  () => {
    const s1 = subj(); const a1 = pickAdj(s1); const a2 = pickAdj2(s1, a1); const s2 = subjNot(s1);
    const v = pick(intransitiveVerbs); const p = place(); const a3 = pickAdj(p);
    return capitalize(`${artNoun(s1)} ${adj(a1, s1)} è più ${adj(a2, s1)} ${prepArtNoun('di', s2)} e ${v.present} ${prepArtNoun('in', p)} ${adj(a3, p)}`);
  },
];

// ============ MAIN GENERATOR ============

const templateMap: Record<number, TemplateFn[]> = {
  4: templates4,
  5: templates5,
  6: templates6,
  7: templates7,
};

export function generateSentence(wordCount: WordCount): string {
  const count = wordCount === 'random'
    ? pick([4, 5, 6, 7] as const)
    : wordCount;
  const templates = templateMap[count];
  return pick(templates)();
}
