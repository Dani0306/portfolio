#!/usr/bin/env node
/**
 * Checks WCAG AA contrast for the scroll world text over every stop's still.
 *
 *   node scripts/check-contrast.mjs
 *
 * For each still and viewport it reproduces the crop (object-fit: cover + the
 * stop's focusX), lays the same scrim the page uses on top, and measures the
 * brightest background pixels under the text area. A text color passes when
 * it reaches 4.5:1 against the 99th percentile of that area.
 * Keep the scrim numbers in sync with the scroll world block in src/styles/global.css.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANVAS = [0x0e, 0x0f, 0x12];

// Same order and focusX as src/config/world.ts.
const stops = [
  { name: '0-hello', focusX: 64, label: '#f2a33a' },
  { name: '1-about', focusX: 60, label: '#f2a33a' },
  { name: '2-stack', focusX: 77, label: '#f2a33a' },
  { name: '3-work', focusX: 72, label: '#f2a33a' },
  { name: '4-tests', focusX: 70, label: '#3fb950' },
  { name: '5-ship', focusX: 73, label: '#f2a33a' },
];

/** Piecewise linear scrim opacity at t (0..1) for stops [[t, alpha], …]. */
function scrimAlpha(stops, t) {
  const last = stops.length - 1;
  if (t >= stops[last][0]) return stops[last][1];
  let i = 0;
  while (t > stops[i + 1][0]) i++;
  const [t0, a0] = stops[i];
  const [t1, a1] = stops[i + 1];
  return a0 + ((a1 - a0) * (t - t0)) / (t1 - t0);
}

// Desktop: left to right. Phones: bottom to top.
const desktopScrim = [[0, 0.95], [0.5, 0.92], [0.9, 0]];
const mobileScrim = [[0, 0.95], [0.65, 0.92], [0.95, 0]];

const viewports = [
  // Text column: 64px from the left, up to 680px wide (hero), vertically centered.
  { name: 'desktop 1440×900', width: 1440, height: 900, still: '', area: { x: 64, w: 680, y: 0.15, h: 0.7 }, scrim: (x) => scrimAlpha(desktopScrim, x / 1440) },
  { name: 'desktop 1920×1080', width: 1920, height: 1080, still: '', area: { x: 64, w: 680, y: 0.15, h: 0.7 }, scrim: (x) => scrimAlpha(desktopScrim, x / 1920) },
  // Phones: copy at the bottom with 16px gutters, over the 720p still.
  { name: 'mobile 390×844', width: 390, height: 844, still: '-720', area: { x: 16, w: 358, y: 0.35, h: 0.55 }, scrim: (_, y) => scrimAlpha(mobileScrim, 1 - y / 844) },
];

const texts = [
  { name: 'ink', color: '#ece8df', alpha: 1 },
  { name: 'ink/90 (body)', color: '#ece8df', alpha: 0.9 },
  { name: 'muted', color: '#8a8f98', alpha: 1 },
  { name: 'accent', color: null, alpha: 1 },
];

const hex = (value) => [1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16));
const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (top, bottom, alpha) => top.map((t, i) => t * alpha + bottom[i] * (1 - alpha));

async function renderCover(file, focusX, width, height) {
  const image = sharp(path.join(root, 'public/world', file));
  const { width: iw, height: ih } = await image.metadata();
  const scale = Math.max(width / iw, height / ih);
  const sw = Math.round(iw * scale);
  const sh = Math.round(ih * scale);
  const left = Math.round((sw - width) * (focusX / 100));
  const top = Math.round((sh - height) * 0.5);
  return image.resize(sw, sh).extract({ left, top, width, height }).removeAlpha().raw().toBuffer();
}

let failures = 0;

for (const viewport of viewports) {
  console.log(`\n${viewport.name}`);
  for (const stop of stops) {
    const file = `${stop.name}${viewport.still}.webp`;
    const pixels = await renderCover(file, stop.focusX, viewport.width, viewport.height);
    const { x, w } = viewport.area;
    const y0 = Math.round(viewport.area.y * viewport.height);
    const y1 = Math.round((viewport.area.y + viewport.area.h) * viewport.height);

    const backgrounds = [];
    for (let py = y0; py < y1; py += 2) {
      for (let px = x; px < Math.min(x + w, viewport.width); px += 2) {
        const o = (py * viewport.width + px) * 3;
        const under = [pixels[o], pixels[o + 1], pixels[o + 2]];
        const composite = mix(CANVAS, under, viewport.scrim(px, py));
        backgrounds.push({ color: composite, l: luminance(composite) });
      }
    }
    backgrounds.sort((a, b) => a.l - b.l);
    const worst = backgrounds[Math.floor(backgrounds.length * 0.99)].color;

    const results = texts.map((text) => {
      const base = hex(text.color ?? stop.label);
      const shown = mix(base, worst, text.alpha);
      const ratio = contrast(shown, worst);
      if (ratio < 4.5) failures++;
      return `${text.name} ${ratio.toFixed(2)}${ratio < 4.5 ? ' FAIL' : ''}`;
    });
    console.log(`  ${file.padEnd(16)} ${results.join('  ·  ')}`);
  }
}

console.log(failures ? `\n${failures} pairing(s) below 4.5:1.` : '\nAll pairings pass AA (4.5:1).');
process.exit(failures ? 1 : 0);
