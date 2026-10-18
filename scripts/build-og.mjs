#!/usr/bin/env node
/**
 * Builds the share cards (1200×630 PNG) shown when a link to the site is
 * posted on LinkedIn, WhatsApp, Slack or X:
 *
 *   npm run og
 *
 * public/og/home.png and home-es.png for the home pages, and
 * public/og/work/<slug>.png and <slug>-es.png for each case study.
 * The copy comes from the same files the site uses (src/data, src/content),
 * and the images are the real world still and project screenshots.
 * Needs network access the first time for the Google Fonts (Geist, JetBrains Mono).
 */
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

import { siteCopy } from '../src/data/site.ts';
import { stops } from '../src/data/stops.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = (relative) => pathToFileURL(path.join(root, relative)).href;
const host = new URL(readFileSync(path.join(root, 'astro.config.mjs'), 'utf8').match(/site: '([^']+)'/)[1]).host;

/** The few frontmatter fields the cards need; values are plain strings or a [list]. */
function frontmatter(relative) {
  const text = readFileSync(path.join(root, relative), 'utf8').split('---')[1];
  const field = (key) => {
    const raw = text.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1]?.trim();
    if (!raw) return undefined;
    if (raw.startsWith('[')) return raw.slice(1, -1).split(',').map((item) => item.trim());
    return raw.replace(/^'(.*)'$/, '$1').replace(/''/g, "'");
  };
  return { title: field('title'), order: Number(field('order')), summary: field('summary'), stack: field('stack'), image: field('image'), live: field('live') };
}

const projects = readdirSync(path.join(root, 'src/content/projects'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const en = frontmatter(`src/content/projects/${name}`);
    const es = frontmatter(`src/content/projects-es/${name}`);
    return { slug: name.replace(/\.md$/, ''), ...en, summaryEs: es.summary };
  })
  .sort((a, b) => a.order - b.order);

const pad = (n) => String(n).padStart(2, '0');
const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const base = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=block" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 1200px; height: 630px; }
    body {
      position: relative; overflow: hidden; background: #0e0f12; color: #ece8df;
      font-family: Geist, sans-serif; -webkit-font-smoothing: antialiased; font-synthesis: none;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .muted { color: #8a8f98; }
    .amber { color: #f2a33a; }
    .content { position: absolute; inset: 64px 72px; display: flex; flex-direction: column; }
    .foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; font-size: 22px; }
    .caret { display: inline-block; width: 0.5ch; height: 0.82em; margin-left: 0.08em; vertical-align: -0.04em; background: #f2a33a; }
    .pill { display: inline-flex; align-items: center; gap: 12px; border: 1px solid rgb(242 163 58 / 0.6); background: rgb(242 163 58 / 0.1); border-radius: 999px; padding: 8px 18px; font-size: 20px; }
    .dot { width: 10px; height: 10px; border-radius: 999px; background: #f2a33a; }
    .tab { display: inline-flex; align-items: center; gap: 12px; background: rgb(236 232 223 / 0.1); padding: 8px 16px; font-size: 18px; }
    .square { width: 10px; height: 10px; background: #f2a33a; }
  </style>`;

function homeCard(lang) {
  const copy = siteCopy[lang];
  const motto = stops[lang].hero.positioning;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8" />${base}
  <style>
    .still { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 64% 50%; }
    .scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(14 15 18 / 0.96) 0%, rgb(14 15 18 / 0.9) 45%, rgb(14 15 18 / 0.15) 85%); }
    h1 { margin-top: 56px; font-size: 84px; line-height: 1; font-weight: 600; letter-spacing: -0.03em; }
    h1 .name { background: linear-gradient(90deg, #ece8df, #8a8f98); -webkit-background-clip: text; color: transparent; }
    .role { margin-top: 16px; font-size: 40px; font-weight: 500; color: rgb(236 232 223 / 0.9); }
    .motto { margin-top: 32px; font-size: 30px; max-width: 640px; }
  </style></head><body>
    <img class="still" src="${file('public/world/0-hello.webp')}" alt="" />
    <div class="scrim"></div>
    <div class="content">
      <span class="tab mono" style="align-self: flex-start"><span class="square"></span>hello.ts</span>
      <h1><span class="name">Daniel Colorado</span><span class="caret"></span></h1>
      <p class="role">${escape(copy.role)}</p>
      <p class="motto">${escape(motto)}</p>
      <div class="foot">
        <span class="pill mono"><span class="dot"></span>${escape(copy.availableNow)}</span>
        <span class="mono muted">${host}${lang === 'es' ? '/es' : ''}</span>
      </div>
    </div>
  </body></html>`;
}

function workCard(project, index, lang) {
  const label = lang === 'es' ? 'Caso de estudio' : 'Case study';
  const summary = lang === 'es' ? project.summaryEs : project.summary;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8" />${base}
  <style>
    .shot { position: absolute; top: 96px; left: 640px; width: 760px; border: 1px solid rgb(236 232 223 / 0.12); background: #0e0f12; }
    .bar { border-bottom: 1px solid rgb(236 232 223 / 0.12); padding: 10px 16px; font-size: 16px; }
    .shot img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
    .fade { position: absolute; inset: 0; background: linear-gradient(90deg, #0e0f12 50%, rgb(14 15 18 / 0) 62%); }
    .content { right: 640px; }
    .kicker { display: flex; align-items: center; gap: 12px; font-size: 20px; }
    h1 { margin-top: 28px; font-size: 68px; line-height: 1.02; font-weight: 600; letter-spacing: -0.03em; text-wrap: balance; }
    .summary { margin-top: 24px; font-size: 25px; line-height: 1.4; color: rgb(236 232 223 / 0.9); text-wrap: pretty; }
    .stack { margin-top: 24px; font-size: 17px; line-height: 1.6; }
    .foot { font-size: 20px; }
  </style></head><body>
    <div class="shot"><div class="bar mono muted">${escape(new URL(project.live).host)}</div><img src="${file(`public${project.image}`)}" alt="" /></div>
    <div class="fade"></div>
    <div class="content">
      <p class="kicker mono muted"><span class="square"></span>${pad(index + 1)} / ${pad(projects.length)} · ${label}</p>
      <h1>${escape(project.title)}</h1>
      <p class="summary">${escape(summary)}</p>
      <p class="stack mono muted">${project.stack.map((item) => `<span style="white-space: nowrap">${escape(item)}</span>`).join(' · ')}</p>
      <div class="foot">
        <span class="mono"><span class="amber">Daniel Colorado</span> <span class="muted">· ${escape(siteCopy[lang].role)}</span></span>
      </div>
    </div>
  </body></html>`;
}

const cards = [
  { out: 'public/og/home.png', html: homeCard('en') },
  { out: 'public/og/home-es.png', html: homeCard('es') },
  ...projects.flatMap((project, i) => [
    { out: `public/og/work/${project.slug}.png`, html: workCard(project, i, 'en') },
    { out: `public/og/work/${project.slug}-es.png`, html: workCard(project, i, 'es') },
  ]),
];

const scratch = mkdtempSync(path.join(os.tmpdir(), 'og-'));
mkdirSync(path.join(root, 'public/og/work'), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [i, card] of cards.entries()) {
    const htmlPath = path.join(scratch, `card-${i}.html`);
    writeFileSync(htmlPath, card.html);
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, card.out), type: 'png' });
    console.log(`Wrote ${card.out}`);
  }
} finally {
  await browser.close();
}
