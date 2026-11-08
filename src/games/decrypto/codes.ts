// All 24 permutations of 3 from {1,2,3,4}
export const ALL_CODES: string[] = [];
for (let a = 1; a <= 4; a++) {
  for (let b = 1; b <= 4; b++) {
    for (let c = 1; c <= 4; c++) {
      if (a !== b && a !== c && b !== c) {
        ALL_CODES.push(`${a}.${b}.${c}`);
      }
    }
  }
}

/** Draw a random code not yet used */
export function drawCode(usedCodes: string[]): { code: number[]; codeStr: string } | null {
  const remaining = ALL_CODES.filter(c => !usedCodes.includes(c));
  if (remaining.length === 0) return null;
  const idx = Math.floor(Math.random() * remaining.length);
  const codeStr = remaining[idx];
  const code = codeStr.split('.').map(Number);
  return { code, codeStr };
}

/** Get the image path for a code card */
export function getCodeImagePath(team: 'bianca' | 'nera', codeStr: string): string {
  if (team === 'bianca') {
    return `/Decrypto/Squadra_Bianca/Codici_Bianco/Codici_Bianco_${codeStr}.png`;
  }
  return `/Decrypto/Squadra_Nera/Codici_Nera/Codici_Nera_${codeStr}.png`;
}
