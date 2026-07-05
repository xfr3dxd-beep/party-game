// Italian Sentence Generator for Sciarada
// Template-based generation with gender agreement and varied structures

import {
  nouns, adjectives, transitiveVerbs, intransitiveVerbs, reflexiveVerbs,
  adverbs, prepArticle, locationPreps, directionPreps,
  Noun, Adjective, Verb, ReflexiveVerb,
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

function adj(a: Adjective, n: Noun): string {
  return n.gender === 'm' ? a.m : a.f;
}

function artNoun(n: Noun): string {
  // Handle l' which needs no space
  if (n.article.endsWith("'")) return `${n.article}${n.word}`;
  return `${n.article} ${n.word}`;
}

function artIndefNoun(n: Noun): string {
  if (n.articleIndef.endsWith("'")) return `${n.articleIndef}${n.word}`;
  return `${n.articleIndef} ${n.word}`;
}

function prepArtNoun(prep: string, n: Noun): string {
  const contracted = prepArticle(prep, n);
  // If contracted ends with ' (like dell'), attach word directly
  if (contracted.endsWith("'")) return `${contracted}${n.word}`;
  return `${contracted} ${n.word}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============ TEMPLATE TYPES ============
type TemplateFn = () => string;

// ============ 4-WORD TEMPLATES ============
// 4 significant words (4+ letters each)

const templates4: TemplateFn[] = [
  // SVO: "Il cane veloce corre nel deserto"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(intransitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const prep = pick(locationPreps);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v.present} ${prepArtNoun(prep, n2)}`);
  },

  // Transitive: "Il cuoco prepara la torta"
  () => {
    const n1 = pick(nouns);
    const v = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a1 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${v.present} ${artNoun(n2)} ${adj(a1, n2)}`);
  },

  // Gerund + location: "Camminando nel bosco, trova il tesoro"
  () => {
    const v1 = pick(intransitiveVerbs);
    const n1 = pick(nouns);
    const v2 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const prep = pick(locationPreps);
    return capitalize(`${v1.gerund} ${prepArtNoun(prep, n1)}, ${v2.present} ${artNoun(n2)}`);
  },

  // Relative clause: "Il ragazzo che canta sorride"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(intransitiveVerbs);
    const v2 = pickExcluding(intransitiveVerbs, v1);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} che ${v1.present} ${v2.present}`);
  },

  // Exclamation: "Che bella torta nel forno antico!"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const prep = pick(locationPreps);
    return `Che ${adj(a1, n1)} ${n1.word} ${prepArtNoun(prep, n2)} ${adj(a2, n2)}!`;
  },

  // Reflexive: "Il gatto si nasconde sotto il tavolo"
  () => {
    const n1 = pick(nouns);
    const rv = pick(reflexiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const dir = pick(directionPreps);
    return capitalize(`${artNoun(n1)} si ${rv.present} ${dir} ${artNoun(n2)}`);
  },

  // Comparative: "Il leone è più veloce della tartaruga"
  () => {
    const n1 = pick(nouns);
    const n2 = pickExcluding(nouns, n1);
    const a1 = pick(adjectives);
    const prep = pick(locationPreps);
    return capitalize(`${artNoun(n1)} è più ${adj(a1, n1)} ${prepArtNoun('di', n2)}`);
  },

  // Passive: "La torta viene preparata dalla nonna"
  () => {
    const n1 = pick(nouns);
    const v = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const pp = n1.gender === 'm' ? v.pastPart : v.pastPartF;
    return capitalize(`${artNoun(n1)} viene ${pp} ${prepArtNoun('da', n2)}`);
  },

  // Direction: "Il cavaliere corre verso il castello"
  () => {
    const n1 = pick(nouns);
    const v = pick(intransitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a1 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v.present} verso ${artNoun(n2)}`);
  },

  // With adverb: "La volpe cammina silenziosamente nella foresta"
  () => {
    const n1 = pick(nouns);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n2 = pickExcluding(nouns, n1);
    return capitalize(`${artNoun(n1)} ${v.present} ${adv} ${prepArtNoun('in', n2)}`);
  },

  // Temporal: "Ogni notte il lupo corre nella foresta"
  () => {
    const n1 = pick(nouns);
    const v = pick(intransitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const temporal = pick(['ogni sera', 'ogni notte', 'ogni mattina', 'ogni giorno']);
    return capitalize(`${temporal}, ${artNoun(n1)} ${v.present} ${prepArtNoun('in', n2)}`);
  },

  // Senza: "Senza la spada, il cavaliere trema"
  () => {
    const n1 = pick(nouns);
    const n2 = pickExcluding(nouns, n1);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    return capitalize(`senza ${artNoun(n1)}, ${artNoun(n2)} ${v.present} ${adv}`);
  },
];

// ============ 5-WORD TEMPLATES ============

const templates5: TemplateFn[] = [
  // SVO + adverb: "La ragazza bella canta dolcemente nella chiesa"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n2 = pickExcluding(nouns, n1);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v.present} ${adv} ${prepArtNoun('in', n2)}`);
  },

  // Mentre (compound): "Il cuoco cucina la torta mentre il gatto dorme"
  () => {
    const n1 = pick(nouns);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const n3 = pickExcluding(nouns, n1, n2);
    const v2 = pick(intransitiveVerbs);
    return capitalize(`${artNoun(n1)} ${v1.present} ${artNoun(n2)} mentre ${artNoun(n3)} ${v2.present}`);
  },

  // Relative + object: "Il ragazzo che suona la chitarra sorride alla ragazza"
  () => {
    const n1 = pick(nouns);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const v2 = pick(intransitiveVerbs);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${artNoun(n1)} che ${v1.present} ${artNoun(n2)} ${v2.present} ${prepArtNoun('a', n3)}`);
  },

  // Gerund + adj: "Camminando nel bosco incantato, il cavaliere trova il tesoro"
  () => {
    const v1 = pick(intransitiveVerbs);
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const v2 = pick(transitiveVerbs);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${v1.gerund} ${prepArtNoun('in', n1)} ${adj(a1, n1)}, ${artNoun(n2)} ${v2.present} ${artNoun(n3)}`);
  },

  // Reflexive + location + adj: "Il pirata si arrampica sulla torre antica"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const rv = pick(reflexiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} si ${rv.present} ${prepArtNoun('su', n2)} ${adj(a2, n2)}`);
  },

  // Double adjective: "Il leone grande e coraggioso corre nel deserto"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const a2 = pickExcluding(adjectives, a1);
    const v = pick(intransitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} e ${adj(a2, n1)} ${v.present} ${prepArtNoun('in', n2)}`);
  },

  // Purpose: "Il cuoco cucina la torta per sorprendere la principessa"
  () => {
    const n1 = pick(nouns);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const v2 = pickExcluding(transitiveVerbs, v1);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${artNoun(n1)} ${v1.present} ${artNoun(n2)} per ${v2.infinitive} ${artNoun(n3)}`);
  },

  // Passive + adj: "La corona dorata viene trovata nella grotta oscura"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(transitiveVerbs);
    const pp = n1.gender === 'm' ? v.pastPart : v.pastPartF;
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} viene ${pp} ${prepArtNoun('in', n2)} ${adj(a2, n2)}`);
  },

  // Comparative + location: "Il delfino è più agile della tartaruga nell'oceano"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const n3 = pickExcluding(nouns, n1, n2);
    const prep = pick(locationPreps);
    return capitalize(`${artNoun(n1)} è più ${adj(a1, n1)} ${prepArtNoun('di', n2)} ${prepArtNoun(prep, n3)}`);
  },

  // Exclamation + verb: "Che bello spettacolo guardare il tramonto dalla collina!"
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const n3 = pickExcluding(nouns, n1, n2);
    return `Che ${adj(a1, n1)} ${n1.word} ${v.infinitive} ${artNoun(n2)} ${prepArtNoun('da', n3)}!`;
  },

  // "mentre si" compound reflexive
  () => {
    const n1 = pick(nouns);
    const v1 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n2 = pickExcluding(nouns, n1);
    const rv = pick(reflexiveVerbs);
    return capitalize(`${artNoun(n1)} ${v1.present} ${adv} mentre ${artNoun(n2)} si ${rv.present}`);
  },

  // Temporal + transitive: "Ogni mattina la nonna prepara la minestra nel castello"
  () => {
    const temporal = pick(['ogni mattina', 'ogni sera', 'ogni giorno']);
    const n1 = pick(nouns);
    const v = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${temporal}, ${artNoun(n1)} ${v.present} ${artNoun(n2)} ${prepArtNoun('in', n3)}`);
  },
];

// ============ 6-WORD TEMPLATES ============

const templates6: TemplateFn[] = [
  // Full SVO + adv + location + adj
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v.present} ${adv} ${prepArtNoun('in', n2)} ${adj(a2, n2)}`);
  },

  // Mentre compound + adjectives
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const n3 = pickExcluding(nouns, n1, n2);
    const a2 = pick(adjectives);
    const v2 = pick(intransitiveVerbs);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${artNoun(n2)} mentre ${artNoun(n3)} ${adj(a2, n3)} ${v2.present}`);
  },

  // Relative clause + adverb + location
  () => {
    const n1 = pick(nouns);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a1 = pick(adjectives);
    const v2 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    return capitalize(`${artNoun(n1)} che ${v1.present} ${artNoun(n2)} ${adj(a1, n2)} ${v2.present} ${adv}`);
  },

  // Gerund + reflexive + adj
  () => {
    const v1 = pick(intransitiveVerbs);
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const rv = pick(reflexiveVerbs);
    return capitalize(`${v1.gerund} ${prepArtNoun('in', n1)} ${adj(a1, n1)}, ${artNoun(n2)} ${adj(a2, n2)} si ${rv.present}`);
  },

  // Passive + agent + location
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(transitiveVerbs);
    const pp = n1.gender === 'm' ? v.pastPart : v.pastPartF;
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} viene ${pp} ${prepArtNoun('da', n2)} ${adj(a2, n2)} ${prepArtNoun('in', n3)}`);
  },

  // Purpose + adj
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const v2 = pick(transitiveVerbs);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${artNoun(n2)} ${adj(a2, n2)} per ${v2.infinitive} ${artNoun(n3)}`);
  },

  // Senza + adj + consequence
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    return capitalize(`senza ${artNoun(n1)} ${adj(a1, n1)}, ${artNoun(n2)} ${adj(a2, n2)} ${v.present} ${adv}`);
  },

  // Temporal + compound
  () => {
    const temporal = pick(['ogni mattina', 'ogni sera', 'durante la notte']);
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    return capitalize(`${temporal}, ${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${adv} ${prepArtNoun('in', n2)} ${adj(a2, n2)}`);
  },

  // Double action: "Il pirata trova il tesoro dorato e balla furiosamente"
  () => {
    const n1 = pick(nouns);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a1 = pick(adjectives);
    const v2 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    return capitalize(`${artNoun(n1)} ${v1.present} ${artNoun(n2)} ${adj(a1, n2)} e ${v2.present} ${adv}`);
  },

  // Comparative + context
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const n3 = pickExcluding(nouns, n1, n2);
    const prep = pick(locationPreps);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} è più ${adj(a2, n1)} ${prepArtNoun('di', n2)} ${prepArtNoun(prep, n3)}`);
  },
];

// ============ 7-WORD TEMPLATES ============

const templates7: TemplateFn[] = [
  // Full SVO + mentre + SVO
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const n3 = pickExcluding(nouns, n1, n2);
    const a2 = pick(adjectives);
    const v2 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${artNoun(n2)} mentre ${artNoun(n3)} ${adj(a2, n3)} ${v2.present} ${adv}`);
  },

  // Gerund + full scene
  () => {
    const v1 = pick(intransitiveVerbs);
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const v2 = pick(transitiveVerbs);
    const n3 = pickExcluding(nouns, n1, n2);
    const a3 = pick(adjectives);
    return capitalize(`${v1.gerund} ${prepArtNoun('in', n1)} ${adj(a1, n1)}, ${artNoun(n2)} ${adj(a2, n2)} ${v2.present} ${artNoun(n3)} ${adj(a3, n3)}`);
  },

  // Relative + adverb + location + adj
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const v2 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} che ${v1.present} ${artNoun(n2)} ${v2.present} ${adv} ${prepArtNoun('in', n3)}`);
  },

  // Purpose + double adj
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const v2 = pick(transitiveVerbs);
    const n3 = pickExcluding(nouns, n1, n2);
    const a3 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${artNoun(n2)} ${adj(a2, n2)} per ${v2.infinitive} ${artNoun(n3)} ${adj(a3, n3)}`);
  },

  // Passive + adverb + location + adj
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(transitiveVerbs);
    const pp = n1.gender === 'm' ? v.pastPart : v.pastPartF;
    const adv = pick(adverbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} viene ${pp} ${adv} ${prepArtNoun('da', n2)} ${adj(a2, n2)} ${prepArtNoun('in', n3)}`);
  },

  // Double action + location + adj
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const v2 = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n3 = pickExcluding(nouns, n1, n2);
    const a2 = pick(adjectives);
    return capitalize(`${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${artNoun(n2)} e ${v2.present} ${adv} ${prepArtNoun('in', n3)} ${adj(a2, n3)}`);
  },

  // Temporal + compound
  () => {
    const temporal = pick(['ogni mattina', 'ogni sera', 'durante la notte', 'al tramonto']);
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v1 = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const n3 = pickExcluding(nouns, n1, n2);
    const v2 = pick(intransitiveVerbs);
    return capitalize(`${temporal}, ${artNoun(n1)} ${adj(a1, n1)} ${v1.present} ${artNoun(n2)} ${adj(a2, n2)} ${prepArtNoun('in', n3)} e ${v2.present}`);
  },

  // Senza + elaborate
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n3 = pickExcluding(nouns, n1, n2);
    return capitalize(`senza ${artNoun(n1)} ${adj(a1, n1)}, ${artNoun(n2)} ${adj(a2, n2)} ${v.present} ${adv} ${prepArtNoun('in', n3)}`);
  },

  // Exclamation elaborate
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const v = pick(transitiveVerbs);
    const n2 = pickExcluding(nouns, n1);
    const a2 = pick(adjectives);
    const n3 = pickExcluding(nouns, n1, n2);
    const a3 = pick(adjectives);
    return `Che ${adj(a1, n1)} ${n1.word} ${v.infinitive} ${artNoun(n2)} ${adj(a2, n2)} ${prepArtNoun('in', n3)} ${adj(a3, n3)}!`;
  },

  // Comparative + action
  () => {
    const n1 = pick(nouns);
    const a1 = pick(adjectives);
    const n2 = pickExcluding(nouns, n1);
    const v = pick(intransitiveVerbs);
    const adv = pick(adverbs);
    const n3 = pickExcluding(nouns, n1, n2);
    const a2 = pick(adjectives);
    return capitalize(`${artNoun(n1)} è più ${adj(a1, n1)} ${prepArtNoun('di', n2)} e ${v.present} ${adv} ${prepArtNoun('in', n3)} ${adj(a2, n3)}`);
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
  const template = pick(templates);
  return template();
}
