// Italian Word Banks for Sciarada Sentence Generator
// Every noun is tagged with a category so the generator can assign
// semantically coherent roles (subjects vs objects vs locations).

export type NounCategory = 'person' | 'animal' | 'object' | 'food' | 'place' | 'concept';

export interface Noun {
  word: string;
  gender: 'm' | 'f';
  article: string;      // definite: il, la, lo, l'
  articleIndef: string;  // indefinite: un, una, uno, un'
  cat: NounCategory;
}

export interface Adjective {
  m: string;
  f: string;
  /** If true this adjective only makes sense for animate beings (person/animal) */
  animate?: boolean;
  /** If true this adjective only makes sense for inanimate things */
  inanimate?: boolean;
}

// objectPool defines which noun categories a transitive verb can take:
//   'food'     = only food nouns (mangia, cucina)
//   'object'   = physical objects (lancia, rompe)
//   'thing'    = object + food + concept (cerca, trova)
//   'animate'  = person + animal (insegue, abbraccia)
//   'any'      = everything except places (guarda, fotografa)
export type ObjectPool = 'food' | 'object' | 'thing' | 'animate' | 'any';

export interface Verb {
  present: string;
  gerund: string;
  pastPart: string;
  pastPartF: string;
  infinitive: string;
  type: 'transitive' | 'intransitive';
  objectPool?: ObjectPool; // only for transitive verbs
}

export interface ReflexiveVerb {
  present: string;
  gerund: string;
  infinitive: string;
}

// ============ NOUNS ============
export const nouns: Noun[] = [
  // ---- Persone ----
  { word: 'ragazzo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'ragazza', gender: 'f', article: 'la', articleIndef: 'una', cat: 'person' },
  { word: 'bambino', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'bambina', gender: 'f', article: 'la', articleIndef: 'una', cat: 'person' },
  { word: 'uomo', gender: 'm', article: "l'", articleIndef: 'un', cat: 'person' },
  { word: 'donna', gender: 'f', article: 'la', articleIndef: 'una', cat: 'person' },
  { word: 'nonno', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'nonna', gender: 'f', article: 'la', articleIndef: 'una', cat: 'person' },
  { word: 'dottore', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'maestro', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'maestra', gender: 'f', article: 'la', articleIndef: 'una', cat: 'person' },
  { word: 'pittore', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'cantante', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'cuoco', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'contadino', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'pescatore', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'cavaliere', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'principe', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'principessa', gender: 'f', article: 'la', articleIndef: 'una', cat: 'person' },
  { word: 'soldato', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'pirata', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'capitano', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'musicista', gender: 'm', article: 'il', articleIndef: 'un', cat: 'person' },
  { word: 'artista', gender: 'm', article: "l'", articleIndef: 'un', cat: 'person' },
  { word: 'astronauta', gender: 'm', article: "l'", articleIndef: 'un', cat: 'person' },

  // ---- Animali ----
  { word: 'cane', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'gatto', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'cavallo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'leone', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'tigre', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'elefante', gender: 'm', article: "l'", articleIndef: 'un', cat: 'animal' },
  { word: 'scimmia', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'serpente', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'aquila', gender: 'f', article: "l'", articleIndef: "un'", cat: 'animal' },
  { word: 'delfino', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'pappagallo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'coniglio', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'farfalla', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'tartaruga', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'pinguino', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'coccodrillo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'lupo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'orso', gender: 'm', article: "l'", articleIndef: 'un', cat: 'animal' },
  { word: 'volpe', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'balena', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'topo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'animal' },
  { word: 'rana', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },
  { word: 'gallina', gender: 'f', article: 'la', articleIndef: 'una', cat: 'animal' },

  // ---- Oggetti ----
  { word: 'libro', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'chitarra', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'spada', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'corona', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'bottiglia', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'telescopio', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'orologio', gender: 'm', article: "l'", articleIndef: 'un', cat: 'object' },
  { word: 'ombrello', gender: 'm', article: "l'", articleIndef: 'un', cat: 'object' },
  { word: 'violino', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'pallone', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'bicicletta', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'candela', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'pentola', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'cappello', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'specchio', gender: 'm', article: 'lo', articleIndef: 'uno', cat: 'object' },
  { word: 'quadro', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'martello', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'tesoro', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'bandiera', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'lanterna', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'diamante', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },
  { word: 'scatola', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'macchina', gender: 'f', article: 'la', articleIndef: 'una', cat: 'object' },
  { word: 'tamburo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'object' },

  // ---- Cibo ----
  { word: 'torta', gender: 'f', article: 'la', articleIndef: 'una', cat: 'food' },
  { word: 'pizza', gender: 'f', article: 'la', articleIndef: 'una', cat: 'food' },
  { word: 'mela', gender: 'f', article: 'la', articleIndef: 'una', cat: 'food' },
  { word: 'formaggio', gender: 'm', article: 'il', articleIndef: 'un', cat: 'food' },
  { word: 'gelato', gender: 'm', article: 'il', articleIndef: 'un', cat: 'food' },
  { word: 'cioccolato', gender: 'm', article: 'il', articleIndef: 'un', cat: 'food' },
  { word: 'pane', gender: 'm', article: 'il', articleIndef: 'un', cat: 'food' },
  { word: 'minestra', gender: 'f', article: 'la', articleIndef: 'una', cat: 'food' },

  // ---- Luoghi ----
  { word: 'montagna', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'spiaggia', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'foresta', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'deserto', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'fiume', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'cascata', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'vulcano', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'giardino', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'castello', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'palazzo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'villaggio', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'mercato', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'ponte', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'fontana', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'torre', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'grotta', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'isola', gender: 'f', article: "l'", articleIndef: "un'", cat: 'place' },
  { word: 'oceano', gender: 'm', article: "l'", articleIndef: 'un', cat: 'place' },
  { word: 'bosco', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'prato', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'sentiero', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'lago', gender: 'm', article: 'il', articleIndef: 'un', cat: 'place' },
  { word: 'chiesa', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },
  { word: 'collina', gender: 'f', article: 'la', articleIndef: 'una', cat: 'place' },

  // ---- Concetti / Natura ----
  { word: 'stella', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'luna', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'tempesta', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'nuvola', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'tramonto', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'arcobaleno', gender: 'm', article: "l'", articleIndef: 'un', cat: 'concept' },
  { word: 'festa', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'avventura', gender: 'f', article: "l'", articleIndef: "un'", cat: 'concept' },
  { word: 'viaggio', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'battaglia', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'segreto', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'mistero', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'sogno', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'canzone', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'ricetta', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'storia', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'sorpresa', gender: 'f', article: 'la', articleIndef: 'una', cat: 'concept' },
  { word: 'miracolo', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'concerto', gender: 'm', article: 'il', articleIndef: 'un', cat: 'concept' },
  { word: 'spettacolo', gender: 'm', article: 'lo', articleIndef: 'uno', cat: 'concept' },
];

// ---- Filtered sub-arrays for quick access ----
/** Nouns that can be sentence subjects (people & animals) */
export const subjectNouns = nouns.filter(n => n.cat === 'person' || n.cat === 'animal');
/** Nouns that can be direct objects of transitive verbs */
export const objectNouns = nouns.filter(n => n.cat === 'object' || n.cat === 'food' || n.cat === 'concept');
/** Nouns that work as locations (prep + art + noun) */
export const placeNouns = nouns.filter(n => n.cat === 'place');
/** Only person nouns (for human-specific verbs like cucinare, scrivere) */
export const personNouns = nouns.filter(n => n.cat === 'person');

// ============ ADJECTIVES ============
// animate = only for living beings (affamato, stanco, furbo…)
// inanimate = only for things/places (antico, ghiacciato…)
// neither = works for anything (grande, bello…)
export const adjectives: Adjective[] = [
  // Universal
  { m: 'bello', f: 'bella' }, { m: 'brutto', f: 'brutta' },
  { m: 'grande', f: 'grande' }, { m: 'piccolo', f: 'piccola' },
  { m: 'enorme', f: 'enorme' }, { m: 'minuscolo', f: 'minuscola' },
  { m: 'misterioso', f: 'misteriosa' }, { m: 'strano', f: 'strana' },
  { m: 'famoso', f: 'famosa' }, { m: 'incredibile', f: 'incredibile' },
  { m: 'splendido', f: 'splendida' }, { m: 'magico', f: 'magica' },
  { m: 'prezioso', f: 'preziosa' }, { m: 'potente', f: 'potente' },
  { m: 'luminoso', f: 'luminosa' }, { m: 'oscuro', f: 'oscura' },
  { m: 'colorato', f: 'colorata' }, { m: 'gigantesco', f: 'gigantesca' },
  { m: 'nascosto', f: 'nascosta' }, { m: 'profumato', f: 'profumata' },
  // Animate-only
  { m: 'veloce', f: 'veloce', animate: true },
  { m: 'lento', f: 'lenta', animate: true },
  { m: 'furbo', f: 'furba', animate: true },
  { m: 'coraggioso', f: 'coraggiosa', animate: true },
  { m: 'elegante', f: 'elegante', animate: true },
  { m: 'silenzioso', f: 'silenziosa', animate: true },
  { m: 'rumoroso', f: 'rumorosa', animate: true },
  { m: 'dolce', f: 'dolce', animate: true },
  { m: 'selvaggio', f: 'selvaggia', animate: true },
  { m: 'spaventoso', f: 'spaventosa', animate: true },
  { m: 'leggero', f: 'leggera', animate: true },
  { m: 'pericoloso', f: 'pericolosa', animate: true },
  { m: 'fortunato', f: 'fortunata', animate: true },
  { m: 'generoso', f: 'generosa', animate: true },
  { m: 'saggio', f: 'saggia', animate: true },
  { m: 'simpatico', f: 'simpatica', animate: true },
  { m: 'curioso', f: 'curiosa', animate: true },
  { m: 'avventuroso', f: 'avventurosa', animate: true },
  { m: 'gentile', f: 'gentile', animate: true },
  { m: 'allegro', f: 'allegra', animate: true },
  { m: 'affamato', f: 'affamata', animate: true },
  { m: 'stanco', f: 'stanca', animate: true },
  { m: 'felice', f: 'felice', animate: true },
  { m: 'arrabbiato', f: 'arrabbiata', animate: true },
  { m: 'timido', f: 'timida', animate: true },
  { m: 'orgoglioso', f: 'orgogliosa', animate: true },
  { m: 'pigro', f: 'pigra', animate: true },
  { m: 'agile', f: 'agile', animate: true },
  { m: 'astuto', f: 'astuta', animate: true },
  { m: 'dispettoso', f: 'dispettosa', animate: true },
  { m: 'buffo', f: 'buffa', animate: true },
  { m: 'peloso', f: 'pelosa', animate: true },
  { m: 'robusto', f: 'robusta', animate: true },
  // Inanimate-only
  { m: 'antico', f: 'antica', inanimate: true },
  { m: 'dorato', f: 'dorata', inanimate: true },
  { m: 'ghiacciato', f: 'ghiacciata', inanimate: true },
  { m: 'infuocato', f: 'infuocata', inanimate: true },
  { m: 'incantato', f: 'incantata', inanimate: true },
  { m: 'dimenticato', f: 'dimenticata', inanimate: true },
  { m: 'profondo', f: 'profonda', inanimate: true },
  { m: 'pesante', f: 'pesante', inanimate: true },
  { m: 'invisibile', f: 'invisibile', inanimate: true },
  { m: 'gigante', f: 'gigante', inanimate: true },
];

/** Get adjectives appropriate for a noun */
export function adjsFor(n: Noun): Adjective[] {
  const isAnimate = n.cat === 'person' || n.cat === 'animal';
  return adjectives.filter(a => {
    if (a.animate && !isAnimate) return false;
    if (a.inanimate && isAnimate) return false;
    return true;
  });
}

// ============ VERBS ============
export const transitiveVerbs: Verb[] = [
  // food verbs → only food
  { present: 'mangia', gerund: 'mangiando', pastPart: 'mangiato', pastPartF: 'mangiata', infinitive: 'mangiare', type: 'transitive', objectPool: 'food' },
  { present: 'cucina', gerund: 'cucinando', pastPart: 'cucinato', pastPartF: 'cucinata', infinitive: 'cucinare', type: 'transitive', objectPool: 'food' },
  { present: 'prepara', gerund: 'preparando', pastPart: 'preparato', pastPartF: 'preparata', infinitive: 'preparare', type: 'transitive', objectPool: 'food' },
  // physical verbs → any physical object (lancia il pallone, rompe lo specchio, etc.)
  { present: 'lancia', gerund: 'lanciando', pastPart: 'lanciato', pastPartF: 'lanciata', infinitive: 'lanciare', type: 'transitive', objectPool: 'object' },
  { present: 'solleva', gerund: 'sollevando', pastPart: 'sollevato', pastPartF: 'sollevata', infinitive: 'sollevare', type: 'transitive', objectPool: 'object' },
  { present: 'spinge', gerund: 'spingendo', pastPart: 'spinto', pastPartF: 'spinta', infinitive: 'spingere', type: 'transitive', objectPool: 'object' },
  { present: 'rompe', gerund: 'rompendo', pastPart: 'rotto', pastPartF: 'rotta', infinitive: 'rompere', type: 'transitive', objectPool: 'object' },
  { present: 'pulisce', gerund: 'pulendo', pastPart: 'pulito', pastPartF: 'pulita', infinitive: 'pulire', type: 'transitive', objectPool: 'object' },
  { present: 'colpisce', gerund: 'colpendo', pastPart: 'colpito', pastPartF: 'colpita', infinitive: 'colpire', type: 'transitive', objectPool: 'object' },
  { present: 'distrugge', gerund: 'distruggendo', pastPart: 'distrutto', pastPartF: 'distrutta', infinitive: 'distruggere', type: 'transitive', objectPool: 'object' },
  // animate verbs → only people/animals
  { present: 'insegue', gerund: 'inseguendo', pastPart: 'inseguito', pastPartF: 'inseguita', infinitive: 'inseguire', type: 'transitive', objectPool: 'animate' },
  { present: 'abbraccia', gerund: 'abbracciando', pastPart: 'abbracciato', pastPartF: 'abbracciata', infinitive: 'abbracciare', type: 'transitive', objectPool: 'animate' },
  { present: 'accarezza', gerund: 'accarezzando', pastPart: 'accarezzato', pastPartF: 'accarezzata', infinitive: 'accarezzare', type: 'transitive', objectPool: 'animate' },
  { present: 'salva', gerund: 'salvando', pastPart: 'salvato', pastPartF: 'salvata', infinitive: 'salvare', type: 'transitive', objectPool: 'animate' },
  // thing verbs → objects + food + concepts (universal "handling" verbs)
  { present: 'cerca', gerund: 'cercando', pastPart: 'cercato', pastPartF: 'cercata', infinitive: 'cercare', type: 'transitive', objectPool: 'thing' },
  { present: 'trova', gerund: 'trovando', pastPart: 'trovato', pastPartF: 'trovata', infinitive: 'trovare', type: 'transitive', objectPool: 'thing' },
  { present: 'raccoglie', gerund: 'raccogliendo', pastPart: 'raccolto', pastPartF: 'raccolta', infinitive: 'raccogliere', type: 'transitive', objectPool: 'thing' },
  { present: 'nasconde', gerund: 'nascondendo', pastPart: 'nascosto', pastPartF: 'nascosta', infinitive: 'nascondere', type: 'transitive', objectPool: 'thing' },
  { present: 'ruba', gerund: 'rubando', pastPart: 'rubato', pastPartF: 'rubata', infinitive: 'rubare', type: 'transitive', objectPool: 'thing' },
  { present: 'porta', gerund: 'portando', pastPart: 'portato', pastPartF: 'portata', infinitive: 'portare', type: 'transitive', objectPool: 'thing' },
  { present: 'vende', gerund: 'vendendo', pastPart: 'venduto', pastPartF: 'venduta', infinitive: 'vendere', type: 'transitive', objectPool: 'thing' },
  { present: 'prende', gerund: 'prendendo', pastPart: 'preso', pastPartF: 'presa', infinitive: 'prendere', type: 'transitive', objectPool: 'thing' },
  { present: 'mostra', gerund: 'mostrando', pastPart: 'mostrato', pastPartF: 'mostrata', infinitive: 'mostrare', type: 'transitive', objectPool: 'thing' },
  { present: 'tocca', gerund: 'toccando', pastPart: 'toccato', pastPartF: 'toccata', infinitive: 'toccare', type: 'transitive', objectPool: 'thing' },
  // any verbs → anything (looking/observing)
  { present: 'guarda', gerund: 'guardando', pastPart: 'guardato', pastPartF: 'guardata', infinitive: 'guardare', type: 'transitive', objectPool: 'any' },
  { present: 'fotografa', gerund: 'fotografando', pastPart: 'fotografato', pastPartF: 'fotografata', infinitive: 'fotografare', type: 'transitive', objectPool: 'any' },
  { present: 'osserva', gerund: 'osservando', pastPart: 'osservato', pastPartF: 'osservata', infinitive: 'osservare', type: 'transitive', objectPool: 'any' },
];

/** Get compatible object nouns for a transitive verb */
export function objectsForVerb(v: Verb): Noun[] {
  const pool = v.objectPool || 'thing';
  switch (pool) {
    case 'food':    return nouns.filter(n => n.cat === 'food');
    case 'object':  return nouns.filter(n => n.cat === 'object');
    case 'thing':   return nouns.filter(n => n.cat === 'object' || n.cat === 'food' || n.cat === 'concept');
    case 'animate': return nouns.filter(n => n.cat === 'person' || n.cat === 'animal');
    case 'any':     return nouns.filter(n => n.cat !== 'place');
  }
}

export const intransitiveVerbs: Verb[] = [
  { present: 'cammina', gerund: 'camminando', pastPart: 'camminato', pastPartF: 'camminata', infinitive: 'camminare', type: 'intransitive' },
  { present: 'corre', gerund: 'correndo', pastPart: 'corso', pastPartF: 'corsa', infinitive: 'correre', type: 'intransitive' },
  { present: 'dorme', gerund: 'dormendo', pastPart: 'dormito', pastPartF: 'dormita', infinitive: 'dormire', type: 'intransitive' },
  { present: 'vola', gerund: 'volando', pastPart: 'volato', pastPartF: 'volata', infinitive: 'volare', type: 'intransitive' },
  { present: 'nuota', gerund: 'nuotando', pastPart: 'nuotato', pastPartF: 'nuotata', infinitive: 'nuotare', type: 'intransitive' },
  { present: 'balla', gerund: 'ballando', pastPart: 'ballato', pastPartF: 'ballata', infinitive: 'ballare', type: 'intransitive' },
  { present: 'salta', gerund: 'saltando', pastPart: 'saltato', pastPartF: 'saltata', infinitive: 'saltare', type: 'intransitive' },
  { present: 'canta', gerund: 'cantando', pastPart: 'cantato', pastPartF: 'cantata', infinitive: 'cantare', type: 'intransitive' },
  { present: 'sorride', gerund: 'sorridendo', pastPart: 'sorriso', pastPartF: 'sorrisa', infinitive: 'sorridere', type: 'intransitive' },
  { present: 'piange', gerund: 'piangendo', pastPart: 'pianto', pastPartF: 'pianta', infinitive: 'piangere', type: 'intransitive' },
  { present: 'ride', gerund: 'ridendo', pastPart: 'riso', pastPartF: 'risa', infinitive: 'ridere', type: 'intransitive' },
  { present: 'urla', gerund: 'urlando', pastPart: 'urlato', pastPartF: 'urlata', infinitive: 'urlare', type: 'intransitive' },
  { present: 'scivola', gerund: 'scivolando', pastPart: 'scivolato', pastPartF: 'scivolata', infinitive: 'scivolare', type: 'intransitive' },
  { present: 'trema', gerund: 'tremando', pastPart: 'tremato', pastPartF: 'tremata', infinitive: 'tremare', type: 'intransitive' },
  { present: 'passeggia', gerund: 'passeggiando', pastPart: 'passeggiato', pastPartF: 'passeggiata', infinitive: 'passeggiare', type: 'intransitive' },
  { present: 'fischia', gerund: 'fischiando', pastPart: 'fischiato', pastPartF: 'fischiata', infinitive: 'fischiare', type: 'intransitive' },
  { present: 'esplora', gerund: 'esplorando', pastPart: 'esplorato', pastPartF: 'esplorata', infinitive: 'esplorare', type: 'intransitive' },
  { present: 'combatte', gerund: 'combattendo', pastPart: 'combattuto', pastPartF: 'combattuta', infinitive: 'combattere', type: 'intransitive' },
  { present: 'sogna', gerund: 'sognando', pastPart: 'sognato', pastPartF: 'sognata', infinitive: 'sognare', type: 'intransitive' },
  { present: 'naviga', gerund: 'navigando', pastPart: 'navigato', pastPartF: 'navigata', infinitive: 'navigare', type: 'intransitive' },
  { present: 'galleggia', gerund: 'galleggiando', pastPart: 'galleggiato', pastPartF: 'galleggiata', infinitive: 'galleggiare', type: 'intransitive' },
  { present: 'medita', gerund: 'meditando', pastPart: 'meditato', pastPartF: 'meditata', infinitive: 'meditare', type: 'intransitive' },
  { present: 'sbadiglia', gerund: 'sbadigliando', pastPart: 'sbadigliato', pastPartF: 'sbadigliata', infinitive: 'sbadigliare', type: 'intransitive' },
];

export const reflexiveVerbs: ReflexiveVerb[] = [
  { present: 'nasconde', gerund: 'nascondendo', infinitive: 'nascondersi' },
  { present: 'sveglia', gerund: 'svegliando', infinitive: 'svegliarsi' },
  { present: 'arrampica', gerund: 'arrampicando', infinitive: 'arrampicarsi' },
  { present: 'tuffa', gerund: 'tuffando', infinitive: 'tuffarsi' },
  { present: 'traveste', gerund: 'travestendo', infinitive: 'travestirsi' },
  { present: 'addormenta', gerund: 'addormentando', infinitive: 'addormentarsi' },
  { present: 'allena', gerund: 'allenando', infinitive: 'allenarsi' },
  { present: 'prepara', gerund: 'preparando', infinitive: 'prepararsi' },
  { present: 'trasforma', gerund: 'trasformando', infinitive: 'trasformarsi' },
  { present: 'lancia', gerund: 'lanciando', infinitive: 'lanciarsi' },
  { present: 'inchina', gerund: 'inchinando', infinitive: 'inchinarsi' },
];

// ============ ADVERBS ============
export const adverbs: string[] = [
  'lentamente', 'velocemente', 'silenziosamente', 'rumorosamente',
  'dolcemente', 'furiosamente', 'elegantemente', 'goffamente',
  'allegramente', 'tristemente', 'misteriosamente', 'coraggiosamente',
  'timidamente', 'orgogliosamente', 'disperatamente', 'pazientemente',
  'energicamente', 'pigramente', 'ferocemente', 'teneramente',
  'nervosamente', 'freneticamente', 'maestosamente', 'appassionatamente',
  'segretamente', 'improvvisamente', 'continuamente', 'intensamente',
  'distrattamente',
];

// ============ PREPOSITION HELPERS ============
export function prepArticle(prep: string, noun: Noun): string {
  const art = noun.article;
  const contractions: Record<string, Record<string, string>> = {
    'di': { 'il': 'del', 'lo': 'dello', "l'": "dell'", 'la': 'della' },
    'a': { 'il': 'al', 'lo': 'allo', "l'": "all'", 'la': 'alla' },
    'da': { 'il': 'dal', 'lo': 'dallo', "l'": "dall'", 'la': 'dalla' },
    'in': { 'il': 'nel', 'lo': 'nello', "l'": "nell'", 'la': 'nella' },
    'su': { 'il': 'sul', 'lo': 'sullo', "l'": "sull'", 'la': 'sulla' },
  };
  if (contractions[prep] && contractions[prep][art]) {
    return contractions[prep][art];
  }
  return `${prep} ${art}`;
}

export const locationPreps = ['in', 'su', 'a', 'da'];
export const directionPreps = ['verso', 'attraverso', 'lungo', 'dietro', 'sopra', 'sotto', 'dentro'];
