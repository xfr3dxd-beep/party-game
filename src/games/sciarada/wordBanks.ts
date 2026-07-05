// Italian Word Banks for Sciarada Sentence Generator

export interface Noun {
  word: string;
  gender: 'm' | 'f';
  article: string;      // definite article: il, la, lo, l'
  articleIndef: string;  // indefinite: un, una, uno, un'
}

export interface Adjective {
  m: string;  // masculine form
  f: string;  // feminine form
}

export interface Verb {
  present: string;       // 3rd person singular present
  gerund: string;        // gerundio
  pastPart: string;      // participio passato (masculine)
  pastPartF: string;     // participio passato (feminine)
  infinitive: string;    // infinito
  type: 'transitive' | 'intransitive';
}

export interface ReflexiveVerb {
  present: string;
  gerund: string;
  infinitive: string;
}

// ============ NOUNS (~160) ============
export const nouns: Noun[] = [
  // Persone
  { word: 'ragazzo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'ragazza', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'bambino', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'bambina', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'uomo', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'donna', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'nonno', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'nonna', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'dottore', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'maestro', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'maestra', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'pittore', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'cantante', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'cuoco', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'contadino', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'pescatore', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'cavaliere', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'principe', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'principessa', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'soldato', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'pirata', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'capitano', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'musicista', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'artista', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'astronauta', gender: 'm', article: "l'", articleIndef: 'un' },
  // Animali
  { word: 'cane', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'gatto', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'cavallo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'leone', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'tigre', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'elefante', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'scimmia', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'serpente', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'aquila', gender: 'f', article: "l'", articleIndef: "un'" },
  { word: 'delfino', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'pappagallo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'coniglio', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'farfalla', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'tartaruga', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'pinguino', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'coccodrillo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'lupo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'orso', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'volpe', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'balena', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'topo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'rana', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'gallina', gender: 'f', article: 'la', articleIndef: 'una' },
  // Oggetti
  { word: 'libro', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'chitarra', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'spada', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'corona', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'bottiglia', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'telescopio', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'orologio', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'ombrello', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'violino', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'pallone', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'bicicletta', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'candela', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'pentola', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'cappello', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'specchio', gender: 'm', article: 'lo', articleIndef: 'uno' },
  { word: 'quadro', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'martello', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'tesoro', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'bandiera', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'lanterna', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'diamante', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'scatola', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'macchina', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'tamburo', gender: 'm', article: 'il', articleIndef: 'un' },
  // Cibo
  { word: 'torta', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'pizza', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'mela', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'formaggio', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'gelato', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'cioccolato', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'pane', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'minestra', gender: 'f', article: 'la', articleIndef: 'una' },
  // Natura / Luoghi
  { word: 'montagna', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'spiaggia', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'foresta', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'deserto', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'fiume', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'cascata', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'vulcano', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'giardino', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'castello', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'palazzo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'villaggio', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'mercato', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'ponte', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'fontana', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'torre', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'grotta', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'isola', gender: 'f', article: "l'", articleIndef: "un'" },
  { word: 'oceano', gender: 'm', article: "l'", articleIndef: 'un' },
  { word: 'bosco', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'prato', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'sentiero', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'lago', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'chiesa', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'stella', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'luna', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'tempesta', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'nuvola', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'collina', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'tramonto', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'arcobaleno', gender: 'm', article: "l'", articleIndef: 'un' },
  // Concetti
  { word: 'festa', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'avventura', gender: 'f', article: "l'", articleIndef: "un'" },
  { word: 'viaggio', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'battaglia', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'segreto', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'mistero', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'sogno', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'canzone', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'ricetta', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'storia', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'sorpresa', gender: 'f', article: 'la', articleIndef: 'una' },
  { word: 'miracolo', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'concerto', gender: 'm', article: 'il', articleIndef: 'un' },
  { word: 'spettacolo', gender: 'm', article: 'lo', articleIndef: 'uno' },
];

// ============ ADJECTIVES (~70) ============
export const adjectives: Adjective[] = [
  { m: 'bello', f: 'bella' }, { m: 'brutto', f: 'brutta' },
  { m: 'grande', f: 'grande' }, { m: 'piccolo', f: 'piccola' },
  { m: 'veloce', f: 'veloce' }, { m: 'lento', f: 'lenta' },
  { m: 'furbo', f: 'furba' }, { m: 'coraggioso', f: 'coraggiosa' },
  { m: 'misterioso', f: 'misteriosa' }, { m: 'antico', f: 'antica' },
  { m: 'magico', f: 'magica' }, { m: 'selvaggio', f: 'selvaggia' },
  { m: 'gigante', f: 'gigante' }, { m: 'spaventoso', f: 'spaventosa' },
  { m: 'elegante', f: 'elegante' }, { m: 'silenzioso', f: 'silenziosa' },
  { m: 'rumoroso', f: 'rumorosa' }, { m: 'profondo', f: 'profonda' },
  { m: 'luminoso', f: 'luminosa' }, { m: 'oscuro', f: 'oscura' },
  { m: 'dolce', f: 'dolce' }, { m: 'pesante', f: 'pesante' },
  { m: 'leggero', f: 'leggera' }, { m: 'strano', f: 'strana' },
  { m: 'famoso', f: 'famosa' }, { m: 'incredibile', f: 'incredibile' },
  { m: 'invisibile', f: 'invisibile' }, { m: 'colorato', f: 'colorata' },
  { m: 'dorato', f: 'dorata' }, { m: 'pericoloso', f: 'pericolosa' },
  { m: 'fortunato', f: 'fortunata' }, { m: 'generoso', f: 'generosa' },
  { m: 'saggio', f: 'saggia' }, { m: 'simpatico', f: 'simpatica' },
  { m: 'curioso', f: 'curiosa' }, { m: 'avventuroso', f: 'avventurosa' },
  { m: 'potente', f: 'potente' }, { m: 'splendido', f: 'splendida' },
  { m: 'enorme', f: 'enorme' }, { m: 'prezioso', f: 'preziosa' },
  { m: 'gentile', f: 'gentile' }, { m: 'allegro', f: 'allegra' },
  { m: 'affamato', f: 'affamata' }, { m: 'stanco', f: 'stanca' },
  { m: 'felice', f: 'felice' }, { m: 'arrabbiato', f: 'arrabbiata' },
  { m: 'timido', f: 'timida' }, { m: 'orgoglioso', f: 'orgogliosa' },
  { m: 'pigro', f: 'pigra' }, { m: 'agile', f: 'agile' },
  { m: 'astuto', f: 'astuta' }, { m: 'gigantesco', f: 'gigantesca' },
  { m: 'ghiacciato', f: 'ghiacciata' }, { m: 'infuocato', f: 'infuocata' },
  { m: 'nascosto', f: 'nascosta' }, { m: 'incantato', f: 'incantata' },
  { m: 'dispettoso', f: 'dispettosa' }, { m: 'buffo', f: 'buffa' },
  { m: 'peloso', f: 'pelosa' }, { m: 'profumato', f: 'profumata' },
  { m: 'robusto', f: 'robusta' }, { m: 'minuscolo', f: 'minuscola' },
];

// ============ VERBS ============
export const transitiveVerbs: Verb[] = [
  { present: 'mangia', gerund: 'mangiando', pastPart: 'mangiato', pastPartF: 'mangiata', infinitive: 'mangiare', type: 'transitive' },
  { present: 'guarda', gerund: 'guardando', pastPart: 'guardato', pastPartF: 'guardata', infinitive: 'guardare', type: 'transitive' },
  { present: 'costruisce', gerund: 'costruendo', pastPart: 'costruito', pastPartF: 'costruita', infinitive: 'costruire', type: 'transitive' },
  { present: 'dipinge', gerund: 'dipingendo', pastPart: 'dipinto', pastPartF: 'dipinta', infinitive: 'dipingere', type: 'transitive' },
  { present: 'porta', gerund: 'portando', pastPart: 'portato', pastPartF: 'portata', infinitive: 'portare', type: 'transitive' },
  { present: 'cerca', gerund: 'cercando', pastPart: 'cercato', pastPartF: 'cercata', infinitive: 'cercare', type: 'transitive' },
  { present: 'trova', gerund: 'trovando', pastPart: 'trovato', pastPartF: 'trovata', infinitive: 'trovare', type: 'transitive' },
  { present: 'prepara', gerund: 'preparando', pastPart: 'preparato', pastPartF: 'preparata', infinitive: 'preparare', type: 'transitive' },
  { present: 'legge', gerund: 'leggendo', pastPart: 'letto', pastPartF: 'letta', infinitive: 'leggere', type: 'transitive' },
  { present: 'scrive', gerund: 'scrivendo', pastPart: 'scritto', pastPartF: 'scritta', infinitive: 'scrivere', type: 'transitive' },
  { present: 'lancia', gerund: 'lanciando', pastPart: 'lanciato', pastPartF: 'lanciata', infinitive: 'lanciare', type: 'transitive' },
  { present: 'apre', gerund: 'aprendo', pastPart: 'aperto', pastPartF: 'aperta', infinitive: 'aprire', type: 'transitive' },
  { present: 'raccoglie', gerund: 'raccogliendo', pastPart: 'raccolto', pastPartF: 'raccolta', infinitive: 'raccogliere', type: 'transitive' },
  { present: 'insegue', gerund: 'inseguendo', pastPart: 'inseguito', pastPartF: 'inseguita', infinitive: 'inseguire', type: 'transitive' },
  { present: 'abbraccia', gerund: 'abbracciando', pastPart: 'abbracciato', pastPartF: 'abbracciata', infinitive: 'abbracciare', type: 'transitive' },
  { present: 'suona', gerund: 'suonando', pastPart: 'suonato', pastPartF: 'suonata', infinitive: 'suonare', type: 'transitive' },
  { present: 'cucina', gerund: 'cucinando', pastPart: 'cucinato', pastPartF: 'cucinata', infinitive: 'cucinare', type: 'transitive' },
  { present: 'accarezza', gerund: 'accarezzando', pastPart: 'accarezzato', pastPartF: 'accarezzata', infinitive: 'accarezzare', type: 'transitive' },
  { present: 'rompe', gerund: 'rompendo', pastPart: 'rotto', pastPartF: 'rotta', infinitive: 'rompere', type: 'transitive' },
  { present: 'pulisce', gerund: 'pulendo', pastPart: 'pulito', pastPartF: 'pulita', infinitive: 'pulire', type: 'transitive' },
  { present: 'nasconde', gerund: 'nascondendo', pastPart: 'nascosto', pastPartF: 'nascosta', infinitive: 'nascondere', type: 'transitive' },
  { present: 'disegna', gerund: 'disegnando', pastPart: 'disegnato', pastPartF: 'disegnata', infinitive: 'disegnare', type: 'transitive' },
  { present: 'solleva', gerund: 'sollevando', pastPart: 'sollevato', pastPartF: 'sollevata', infinitive: 'sollevare', type: 'transitive' },
  { present: 'colpisce', gerund: 'colpendo', pastPart: 'colpito', pastPartF: 'colpita', infinitive: 'colpire', type: 'transitive' },
  { present: 'ruba', gerund: 'rubando', pastPart: 'rubato', pastPartF: 'rubata', infinitive: 'rubare', type: 'transitive' },
  { present: 'salva', gerund: 'salvando', pastPart: 'salvato', pastPartF: 'salvata', infinitive: 'salvare', type: 'transitive' },
  { present: 'fotografa', gerund: 'fotografando', pastPart: 'fotografato', pastPartF: 'fotografata', infinitive: 'fotografare', type: 'transitive' },
  { present: 'spinge', gerund: 'spingendo', pastPart: 'spinto', pastPartF: 'spinta', infinitive: 'spingere', type: 'transitive' },
  { present: 'vende', gerund: 'vendendo', pastPart: 'venduto', pastPartF: 'venduta', infinitive: 'vendere', type: 'transitive' },
  { present: 'chiude', gerund: 'chiudendo', pastPart: 'chiuso', pastPartF: 'chiusa', infinitive: 'chiudere', type: 'transitive' },
];

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
  { present: 'rotola', gerund: 'rotolando', pastPart: 'rotolato', pastPartF: 'rotolata', infinitive: 'rotolare', type: 'intransitive' },
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
  { present: 'striscia', gerund: 'strisciando', pastPart: 'strisciato', pastPartF: 'strisciata', infinitive: 'strisciare', type: 'intransitive' },
];

export const reflexiveVerbs: ReflexiveVerb[] = [
  { present: 'nasconde', gerund: 'nascondendo', infinitive: 'nascondersi' },
  { present: 'sveglia', gerund: 'svegliando', infinitive: 'svegliarsi' },
  { present: 'arrampica', gerund: 'arrampicando', infinitive: 'arrampicarsi' },
  { present: 'tuffa', gerund: 'tuffando', infinitive: 'tuffarsi' },
  { present: 'traveste', gerund: 'travestendo', infinitive: 'travestirsi' },
  { present: 'addormenta', gerund: 'addormentando', infinitive: 'addormentarsi' },
  { present: 'allena', gerund: 'allenando', infinitive: 'allenarsi' },
  { present: 'pettina', gerund: 'pettinando', infinitive: 'pettinarsi' },
  { present: 'prepara', gerund: 'preparando', infinitive: 'prepararsi' },
  { present: 'trasforma', gerund: 'trasformando', infinitive: 'trasformarsi' },
  { present: 'lancia', gerund: 'lanciando', infinitive: 'lanciarsi' },
  { present: 'inchina', gerund: 'inchinando', infinitive: 'inchinarsi' },
];

// ============ ADVERBS (~30) ============
export const adverbs: string[] = [
  'lentamente', 'velocemente', 'silenziosamente', 'rumorosamente',
  'dolcemente', 'furiosamente', 'elegantemente', 'goffamente',
  'allegramente', 'tristemente', 'misteriosamente', 'coraggiosamente',
  'timidamente', 'orgogliosamente', 'disperatamente', 'pazientemente',
  'energicamente', 'pigramente', 'ferocemente', 'teneramente',
  'nervosamente', 'freneticamente', 'maestosamente', 'appassionatamente',
  'segretamente', 'improvvisamente', 'continuamente', 'intensamente',
  'distrattamente', 'ridicolmente',
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
