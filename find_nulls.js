const fs = require('fs');
const s = fs.readFileSync('src/lib/products.ts', 'utf8');
const regex = /slug: "([^"]+)"[\s\S]{0,400}price: null/g;
let m, count = 0;
while ((m = regex.exec(s)) !== null) {
  count++;
  const snippet = s.substring(Math.max(0, m.index - 200), m.index + 200);
  const nameMatch = snippet.match(/name: "([^"]+)"/);
  console.log('#' + count, 'SKU:', m[1], '| Name:', nameMatch ? nameMatch[1].substring(0, 60) : 'unknown');
}
console.log('Total remaining null-price items:', count);
