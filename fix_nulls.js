const fs = require('fs');
let s = fs.readFileSync('src/lib/products.ts', 'utf8');

const replacements = [
  ['single-core-pvc-1-0', 35],
  ['single-core-pvc-1-5', 55],
  ['single-core-pvc-2-5', 55],
  ['single-core-pvc-4', 95],
  ['single-core-pvc-6', 140],
  ['single-core-pvc-10', 220],
  ['single-core-pvc-16', 350],
  ['single-core-pvc-25', 480],
  ['single-core-pvc-35', 720],
  ['single-core-pvc-50', 1100],
];

let changed = 0;
for (const [slug, price] of replacements) {
  // Find the specific price: null inside the block for this slug
  const startIdx = s.indexOf(`slug: "${slug}",`);
  if (startIdx < 0) {
    console.log('Not found:', slug);
    continue;
  }
  const blockEnd = s.indexOf('  },', startIdx + 1);
  const before = s.substring(0, startIdx);
  const after = s.substring(startIdx);
  // Replace price: null with price: <val> in the block range
  const blockStr = s.substring(startIdx, blockEnd);
  if (blockStr.includes('price: null')) {
    const updatedBlock = blockStr.replace('price: null', `price: ${price}`);
    s = before + updatedBlock + s.substring(blockEnd);
    changed++;
    console.log('Fixed:', slug, '->', price);
  } else {
    console.log('No price: null in block:', slug);
  }
}
fs.writeFileSync('src/lib/products.ts', s, 'utf8');
console.log('Done, changed:', changed);
