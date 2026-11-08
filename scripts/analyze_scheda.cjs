// Scheda Compilativa image analysis script using pngjs (pure JS)
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const IMG_PATH = path.join(__dirname, '..', 'public', 'Decrypto', 'Squadra_Bianca', 'Scheda_Compilativa_Bianca_ro1-8.png');
const OUT_PATH = path.join(__dirname, 'scheda_coords.json');

const buf = fs.readFileSync(IMG_PATH);
const png = PNG.sync.read(buf);
const W = png.width;
const H = png.height;
const data = png.data; // RGBA

console.log(`Image size: ${W} x ${H}`);

function getPixel(x, y) {
  const i = (y * W + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
}

function brightness(x, y) {
  const p = getPixel(x, y);
  return (p.r + p.g + p.b) / 3;
}

// ========== STEP 1: Find card boundaries ==========
// Scan for the column split (vertical divider between left and right cards)
const midY = Math.floor(H / 2);
const hProfile = [];
for (let x = 0; x < W; x++) {
  let sum = 0;
  for (let dy = -5; dy <= 5; dy++) {
    sum += brightness(x, Math.min(H - 1, Math.max(0, midY + dy)));
  }
  hProfile.push(sum / 11);
}

// Find column split: minimum brightness in the middle region
let colSplit = Math.floor(W / 2);
let minBr = 999;
for (let x = Math.floor(W * 0.4); x < Math.floor(W * 0.6); x++) {
  if (hProfile[x] < minBr) {
    minBr = hProfile[x];
    colSplit = x;
  }
}
console.log(`Column split at x=${colSplit} (brightness=${minBr.toFixed(1)})`);

// Find row splits: scan a vertical column in the left half
const midX = Math.floor(colSplit / 2);
const vProfile = [];
for (let y = 0; y < H; y++) {
  let sum = 0;
  for (let dx = -5; dx <= 5; dx++) {
    sum += brightness(Math.min(W - 1, Math.max(0, midX + dx)), y);
  }
  vProfile.push(sum / 11);
}

// Find row boundaries using brightness dips
const rowSplits = [];
const threshold = 200;
let inGap = false;
let gapStart = 0;
for (let y = Math.floor(H * 0.1); y < H; y++) {
  if (vProfile[y] < threshold && !inGap) {
    inGap = true;
    gapStart = y;
  } else if (vProfile[y] >= threshold && inGap) {
    inGap = false;
    const mid = Math.floor((gapStart + y) / 2);
    if (rowSplits.length === 0 || mid - rowSplits[rowSplits.length - 1] > H * 0.05) {
      rowSplits.push(mid);
    }
  }
}
console.log(`Row splits at y=${JSON.stringify(rowSplits)}`);

// Build card rows
const yBounds = [0, ...rowSplits, H];
const xBounds = [0, colSplit, W];
console.log(`Y bounds: ${JSON.stringify(yBounds)}, X bounds: ${JSON.stringify(xBounds)}`);

let cardRows;
if (yBounds.length === 5) {
  cardRows = [];
  for (let r = 0; r < 4; r++) {
    cardRows.push({ top: yBounds[r], bottom: yBounds[r + 1] });
  }
} else {
  console.log('  Using equal division for rows');
  const rowH = Math.floor(H / 4);
  cardRows = [];
  for (let r = 0; r < 4; r++) {
    cardRows.push({ top: r * rowH, bottom: (r + 1) * rowH });
  }
}

const cards = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 2; col++) {
    const cardIdx = row * 2 + col;
    const x1 = col === 0 ? xBounds[0] : xBounds[1];
    const x2 = col === 0 ? xBounds[1] : xBounds[2];
    const y1 = cardRows[row].top;
    const y2 = cardRows[row].bottom;
    cards.push({ idx: cardIdx, x1, y1, x2, y2, col, row });
  }
}

console.log('\n--- Cards detected ---');
cards.forEach(c => console.log(`Card ${c.idx}: (${c.x1},${c.y1}) - (${c.x2},${c.y2}) = ${c.x2 - c.x1}x${c.y2 - c.y1}`));

// ========== STEP 2: Find white boxes (I and R squares) in each card ==========
function findWhiteBoxes(cx1, cy1, cx2, cy2) {
  const cardW = cx2 - cx1;
  const cardH = cy2 - cy1;

  // Search in the right 40% of the card
  const searchX1 = cx1 + Math.floor(cardW * 0.6);
  const searchX2 = cx2 - 2;
  const searchY1 = cy1 + Math.floor(cardH * 0.15);
  const searchY2 = cy2 - Math.floor(cardH * 0.05);

  const maskW = searchX2 - searchX1;
  const maskH = searchY2 - searchY1;
  const mask = new Uint8Array(maskW * maskH);

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      const px = searchX1 + x;
      const py = searchY1 + y;
      const p = getPixel(px, py);
      const br = (p.r + p.g + p.b) / 3;
      const maxC = Math.max(p.r, p.g, p.b);
      const minC = Math.min(p.r, p.g, p.b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
      mask[y * maskW + x] = (br > 235 && sat < 0.08) ? 1 : 0;
    }
  }

  // Connected component analysis (iterative flood fill)
  const labels = new Int32Array(maskW * maskH);
  let nextLabel = 1;
  const components = [];

  function flood(startX, startY, label) {
    const stack = [[startX, startY]];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let count = 0;
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= maskW || y < 0 || y >= maskH) continue;
      const idx = y * maskW + x;
      if (mask[idx] !== 1 || labels[idx] !== 0) continue;
      labels[idx] = label;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return { minX, minY, maxX, maxY, count };
  }

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      const idx = y * maskW + x;
      if (mask[idx] === 1 && labels[idx] === 0) {
        const comp = flood(x, y, nextLabel++);
        const w = comp.maxX - comp.minX + 1;
        const h = comp.maxY - comp.minY + 1;
        const area = comp.count;
        const fillRatio = area / (w * h);
        if (w > 10 && h > 10 && w < cardW * 0.2 && h < cardH * 0.25 &&
          fillRatio > 0.5 && Math.abs(w / h - 1) < 0.8) {
          components.push({
            x: searchX1 + comp.minX,
            y: searchY1 + comp.minY,
            w, h, area, fillRatio,
          });
        }
      }
    }
  }
  return components;
}

// ========== STEP 3: Find gray row stripes in each card ==========
function findRowStripes(cx1, cy1, cx2, cy2) {
  const cardW = cx2 - cx1;
  const cardH = cy2 - cy1;

  const stripes = [];
  let inStripe = false;
  let stripeStart = 0;
  const startY = cy1 + Math.floor(cardH * 0.2);
  const endY = cy2 - Math.floor(cardH * 0.15);

  for (let y = startY; y < endY; y++) {
    let sum = 0;
    const samples = 20;
    for (let i = 0; i < samples; i++) {
      const sx = cx1 + Math.floor(cardW * 0.05) + Math.floor((cardW * 0.6) * i / samples);
      sum += brightness(sx, y);
    }
    const avgBr = sum / samples;
    const isGray = avgBr > 185 && avgBr < 235;

    if (isGray && !inStripe) {
      inStripe = true;
      stripeStart = y;
    } else if (!isGray && inStripe) {
      inStripe = false;
      const h = y - stripeStart;
      if (h > 8) {
        stripes.push({ x: cx1, y: stripeStart, w: Math.floor(cardW * 0.7), h });
      }
    }
  }
  if (inStripe) {
    const h = endY - stripeStart;
    if (h > 8) stripes.push({ x: cx1, y: stripeStart, w: Math.floor(cardW * 0.7), h });
  }
  return stripes;
}

// ========== STEP 4: Find token circles ==========
function findTokenCircles(cx1, cy1, cx2, cy2) {
  const cardW = cx2 - cx1;
  const cardH = cy2 - cy1;

  const searchX1 = cx1 + Math.floor(cardW * 0.6);
  const searchX2 = cx2 - 2;
  const searchY1 = cy1 + Math.floor(cardH * 0.7);
  const searchY2 = cy2 - 2;

  const maskW = searchX2 - searchX1;
  const maskH = searchY2 - searchY1;
  const mask = new Uint8Array(maskW * maskH);

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      const p = getPixel(searchX1 + x, searchY1 + y);
      const br = (p.r + p.g + p.b) / 3;
      mask[y * maskW + x] = (br > 230) ? 1 : 0;
    }
  }

  const labels = new Int32Array(maskW * maskH);
  let nextLabel = 1;
  const circles = [];

  function flood(startX, startY, label) {
    const stack = [[startX, startY]];
    let minX = startX, maxX = startX, minY = startY, maxY = startY, count = 0;
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= maskW || y < 0 || y >= maskH) continue;
      const idx = y * maskW + x;
      if (mask[idx] !== 1 || labels[idx] !== 0) continue;
      labels[idx] = label;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return { minX, minY, maxX, maxY, count };
  }

  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) {
      const idx = y * maskW + x;
      if (mask[idx] === 1 && labels[idx] === 0) {
        const comp = flood(x, y, nextLabel++);
        const w = comp.maxX - comp.minX + 1;
        const h = comp.maxY - comp.minY + 1;
        const fillRatio = comp.count / (w * h);
        if (w > 10 && h > 10 && fillRatio > 0.5 && Math.abs(w / h - 1) < 0.5) {
          circles.push({
            x: searchX1 + comp.minX,
            y: searchY1 + comp.minY,
            w, h, fillRatio,
          });
        }
      }
    }
  }
  return circles;
}

// ========== STEP 5: Also find the header/name area for each card ==========
// The header has a "DECRYPTO" banner and a player name box
function findNameBox(cx1, cy1, cx2, cy2) {
  const cardW = cx2 - cx1;
  const cardH = cy2 - cy1;
  // The name box is near the top of the card, roughly the top 15%
  // It's typically in the center-right of the banner
  // For now we'll define it based on card dimensions
  return {
    x: cx1 + Math.floor(cardW * 0.25),
    y: cy1 + Math.floor(cardH * 0.01),
    w: Math.floor(cardW * 0.55),
    h: Math.floor(cardH * 0.10),
  };
}

// ========== STEP 6: Process all cards ==========
const result = { imageWidth: W, imageHeight: H, cards: [] };

for (const card of cards) {
  const boxes = findWhiteBoxes(card.x1, card.y1, card.x2, card.y2);
  const stripes = findRowStripes(card.x1, card.y1, card.x2, card.y2);
  const tokens = findTokenCircles(card.x1, card.y1, card.x2, card.y2);
  const nameBox = findNameBox(card.x1, card.y1, card.x2, card.y2);

  // Sort boxes by Y then X
  boxes.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

  // Group boxes into pairs (I, R) by Y proximity
  const boxPairs = [];
  let i = 0;
  while (i < boxes.length) {
    if (i + 1 < boxes.length && Math.abs(boxes[i].y - boxes[i + 1].y) < 20) {
      const left = boxes[i].x < boxes[i + 1].x ? boxes[i] : boxes[i + 1];
      const right = boxes[i].x < boxes[i + 1].x ? boxes[i + 1] : boxes[i];
      boxPairs.push({ I: left, R: right });
      i += 2;
    } else {
      i++;
    }
  }

  tokens.sort((a, b) => a.x - b.x);

  const cardData = {
    cardIndex: card.idx,
    bounds: {
      x: card.x1, y: card.y1, w: card.x2 - card.x1, h: card.y2 - card.y1,
      pct: {
        left: +(card.x1 / W * 100).toFixed(3),
        top: +(card.y1 / H * 100).toFixed(3),
        width: +((card.x2 - card.x1) / W * 100).toFixed(3),
        height: +((card.y2 - card.y1) / H * 100).toFixed(3),
      }
    },
    nameBox: {
      x: nameBox.x, y: nameBox.y, w: nameBox.w, h: nameBox.h,
      pct: {
        left: +(nameBox.x / W * 100).toFixed(3),
        top: +(nameBox.y / H * 100).toFixed(3),
        width: +(nameBox.w / W * 100).toFixed(3),
        height: +(nameBox.h / H * 100).toFixed(3),
      }
    },
    stripes: stripes.map(s => ({
      x: s.x, y: s.y, w: s.w, h: s.h,
      pct: {
        left: +(s.x / W * 100).toFixed(3),
        top: +(s.y / H * 100).toFixed(3),
        width: +(s.w / W * 100).toFixed(3),
        height: +(s.h / H * 100).toFixed(3),
      }
    })),
    boxPairs: boxPairs.map((pair, idx) => ({
      row: idx,
      I: {
        x: pair.I.x, y: pair.I.y, w: pair.I.w, h: pair.I.h,
        pct: {
          left: +(pair.I.x / W * 100).toFixed(3),
          top: +(pair.I.y / H * 100).toFixed(3),
          width: +(pair.I.w / W * 100).toFixed(3),
          height: +(pair.I.h / H * 100).toFixed(3),
        }
      },
      R: {
        x: pair.R.x, y: pair.R.y, w: pair.R.w, h: pair.R.h,
        pct: {
          left: +(pair.R.x / W * 100).toFixed(3),
          top: +(pair.R.y / H * 100).toFixed(3),
          width: +(pair.R.w / W * 100).toFixed(3),
          height: +(pair.R.h / H * 100).toFixed(3),
        }
      },
    })),
    tokens: tokens.map(t => ({
      x: t.x, y: t.y, w: t.w, h: t.h,
      pct: {
        left: +(t.x / W * 100).toFixed(3),
        top: +(t.y / H * 100).toFixed(3),
        width: +(t.w / W * 100).toFixed(3),
        height: +(t.h / H * 100).toFixed(3),
      }
    })),
  };
  result.cards.push(cardData);
}

// Print results
console.log('\n=== DETECTED LAYOUT ===\n');
for (const card of result.cards) {
  console.log(`\nCard ${card.cardIndex} — bounds: (${card.bounds.x},${card.bounds.y}) ${card.bounds.w}x${card.bounds.h}  [${card.bounds.pct.left}%,${card.bounds.pct.top}% ${card.bounds.pct.width}%x${card.bounds.pct.height}%]`);
  console.log(`  Name box: (${card.nameBox.x},${card.nameBox.y}) ${card.nameBox.w}x${card.nameBox.h} → left:${card.nameBox.pct.left}% top:${card.nameBox.pct.top}%`);
  console.log(`  Stripes (${card.stripes.length}):`);
  card.stripes.forEach((s, i) => console.log(`    Row ${i}: (${s.x},${s.y}) ${s.w}x${s.h} → left:${s.pct.left}% top:${s.pct.top}% w:${s.pct.width}% h:${s.pct.height}%`));
  console.log(`  Box pairs (${card.boxPairs.length}):`);
  card.boxPairs.forEach(p => console.log(`    Row ${p.row}: I=(${p.I.x},${p.I.y}) ${p.I.w}x${p.I.h} → left:${p.I.pct.left}% top:${p.I.pct.top}%  |  R=(${p.R.x},${p.R.y}) ${p.R.w}x${p.R.h} → left:${p.R.pct.left}% top:${p.R.pct.top}%`));
  console.log(`  Tokens (${card.tokens.length}):`);
  card.tokens.forEach((t, i) => console.log(`    Token ${i}: (${t.x},${t.y}) ${t.w}x${t.h} → left:${t.pct.left}% top:${t.pct.top}%`));
}

fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log(`\nSaved to ${OUT_PATH}`);
