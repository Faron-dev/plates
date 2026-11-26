// Draws the Plates icon set from one description of the mark: a loaded bar seen from the side.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/opt/npm-tools/node_modules/');
const sharp = require('sharp');
const YELLOW = '#F7C600', INK = '#16191C';
const out = process.argv[2] || new URL('../icons-src/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

// The mark in its own 392 x 320 box.
function mark(fill) {
  const r = (x, y, w, h, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
  return [
    r(0, 142, 160, 36, 18),      // bar
    r(126, 112, 30, 96, 8),      // collar
    r(166, 0, 64, 320, 18),      // big plate
    r(242, 0, 64, 320, 18),      // big plate
    r(318, 48, 48, 224, 16),     // smaller plate
    r(362, 134, 30, 52, 10)      // end of the sleeve
  ].join('');
}
const MW = 392, MH = 320;
function svg(size, { bg, fill, scale, radius = 0 }) {
  const s = size * scale / MW, tx = (size - MW * s) / 2 - size * 0.035, ty = (size - MH * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (bg ? `<rect width="${size}" height="${size}" rx="${radius * size}" fill="${bg}"/>` : '') +
    `<g transform="translate(${tx} ${ty}) scale(${s})">${mark(fill)}</g></svg>`;
}
const jobs = [
  ['icon-192.png', 192, { bg: YELLOW, fill: INK, scale: 0.68, radius: 0.2 }],
  ['icon-512.png', 512, { bg: YELLOW, fill: INK, scale: 0.68, radius: 0.2 }],
  ['maskable-192.png', 192, { bg: YELLOW, fill: INK, scale: 0.6 }],
  ['maskable-512.png', 512, { bg: YELLOW, fill: INK, scale: 0.6 }],
  ['mono-512.png', 512, { bg: null, fill: '#FFFFFF', scale: 0.66 }],
  ['apple-touch-icon.png', 180, { bg: YELLOW, fill: INK, scale: 0.66 }]
];
for (const [name, size, o] of jobs) {
  const s = svg(size, o);
  await sharp(Buffer.from(s), { density: 72 }).resize(size, size).png({ compressionLevel: 9 }).toFile(out + name);
}
writeFileSync(out + 'mark.svg', svg(512, { bg: YELLOW, fill: INK, scale: 0.68, radius: 0.2 }));
console.log('icons written to', out);
