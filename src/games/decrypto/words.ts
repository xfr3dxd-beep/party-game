let cachedWords: string[] | null = null;

export async function loadWords(): Promise<string[]> {
  if (cachedWords) return cachedWords;
  const res = await fetch('/Decrypto/Parole_Decrypto.csv');
  const text = await res.text();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  // Skip header "Italiano"
  cachedWords = lines.slice(1);
  return cachedWords;
}

/** Draw `count` random words from the pool (no duplicates) */
export function drawWords(pool: string[], count: number): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
