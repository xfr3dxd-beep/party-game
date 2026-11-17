const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'public', 'Smart Ass', 'Carte_Smart_Ass');
const outDir = path.join(__dirname, '..', 'src', 'games', 'smart-ass');
const outFile = path.join(outDir, 'cards.ts');

const cats = [
  ['carte_chi_sono', 'CHI_SONO_CARDS'],
  ['carte_cosa_sono', 'COSA_SONO_CARDS'],
  ['carte_dove_sono', 'DOVE_SONO_CARDS'],
  ['carte_hard_ass', 'HARD_ASS_CARDS'],
];

let lines = [];
lines.push('// Auto-generated card filename lists for Smart Ass');
lines.push('');
lines.push("const BASE = '/Smart Ass/Carte_Smart_Ass';");
lines.push('');

for (const [dir, name] of cats) {
  const dirPath = path.join(baseDir, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png')).sort();
  lines.push('export const ' + name + ': string[] = [');
  for (let i = 0; i < files.length; i++) {
    const comma = i < files.length - 1 ? ',' : '';
    lines.push("  '" + files[i] + "'" + comma);
  }
  lines.push('];');
  lines.push('');
}

lines.push("export type CardCategory = 'chi_sono' | 'cosa_sono' | 'dove_sono' | 'hard_ass';");
lines.push('');
lines.push('const FOLDERS: Record<CardCategory, string> = {');
lines.push("  chi_sono: 'carte_chi_sono',");
lines.push("  cosa_sono: 'carte_cosa_sono',");
lines.push("  dove_sono: 'carte_dove_sono',");
lines.push("  hard_ass: 'carte_hard_ass',");
lines.push('};');
lines.push('');
lines.push('export function getCardPath(category: CardCategory, filename: string): string {');
lines.push("  return BASE + '/' + FOLDERS[category] + '/' + filename;");
lines.push('}');
lines.push('');
lines.push('export function drawCard(cards: string[], usedIndices: number[]): { index: number; filename: string } | null {');
lines.push('  const available = cards.map((_, i) => i).filter(i => !usedIndices.includes(i));');
lines.push('  if (available.length === 0) return null;');
lines.push('  const idx = available[Math.floor(Math.random() * available.length)];');
lines.push('  return { index: idx, filename: cards[idx] };');
lines.push('}');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log('Generated ' + outFile);
