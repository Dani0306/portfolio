#!/usr/bin/env node
/**
 * Builds the résumé: public/resume.pdf (and resume/resume.html to preview it).
 *
 *   npm run resume
 *
 * All content lives in `resume` below. Facts only: it comes from my CV, my
 * GitHub repos and what is on the site. The layout follows a two column
 * template: details and skills on the left, a timeline on the right.
 * The phone number is left out because this PDF is public on the site.
 * Needs network access the first time for the Google Fonts (Oswald, Lato).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const resume = {
  name: 'Daniel Andrés Colorado Sánchez',
  title: 'Full Stack Developer',
  location: 'Medellín, Colombia',
  email: 'danielcolorado.dev@gmail.com',
  github: 'github.com/Dani0306',
  linkedin: 'linkedin.com/in/daniel-colorado',
  availability: ['Available now', 'Remote, hybrid, on site or relocation', 'COT (UTC−5)'],

  profile:
    'Full stack developer and Software Engineering student at IUE, building web apps with React, Next.js, Node.js, Supabase and MongoDB, with production apps live on Vercel such as Classly, an AI study platform with paid plans. Strong command of AI tools through Claude Code: I automate development work and everyday processes with agentic workflows, custom skills, hooks and MCP integrations, an approach that fits almost any team or task, and I review every change. Customer support and back office work gave me strong communication and problem solving skills. Native Spanish, C1 English.',

  skills: [
    { label: 'Languages', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    { label: 'Frontend', items: ['React', 'Next.js', 'Redux', 'Tailwind CSS', 'TanStack Query', 'Vite'] },
    { label: 'Backend', items: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Supabase', 'Firebase', 'MongoDB'] },
    { label: 'Services', items: ['OpenAI API', 'Stripe', 'Paddle', 'Vercel', 'AWS'] },
    { label: 'Tools', items: ['Git and GitHub', 'GitHub Actions', 'Docker', 'Vitest', 'Playwright'] },
    {
      label: 'AI and automation',
      items: ['Claude Code', 'Agentic workflows', 'AI process automation', 'Custom skills and hooks', 'MCP servers', 'Context engineering'],
    },
  ],

  languages: [
    { name: 'Spanish', level: 'Native' },
    { name: 'English', level: 'C1, advanced' },
  ],

  employment: [
    {
      role: 'Back Office Agent',
      place: 'Third Way Health',
      when: 'October 2026 — Present',
      points: [],
    },
    {
      role: 'Customer Service Representative',
      place: 'Zara, through Konecta Multienlace',
      when: '1 yr 8 mo',
      points: [
        'Handled inbound and outbound calls and chats to resolve customer requests and order issues.',
        'Consistently met monthly productivity, adherence and quality targets.',
      ],
    },
  ],

  projects: [
    {
      name: 'Classly',
      kind: 'AI study platform',
      link: 'classly-kappa.vercel.app',
      stack: 'Next.js · TypeScript · Supabase · OpenAI API · Paddle',
      points: [
        'Students organize classes, save notes and generate AI quizzes, summaries and diagrams, with files attached to each class.',
        'Google sign in, Postgres and Storage on Supabase, monthly AI usage limits per plan enforced in the database, and a Pro plan billed through Paddle.',
      ],
    },
    {
      name: 'TaskGenius',
      kind: 'AI powered project organizer',
      link: 'task-genius-chi.vercel.app',
      stack: 'Next.js · TypeScript · Supabase · OpenAI API',
      points: [
        'Manage team tasks and personal projects, with AI generated improvement suggestions and a built in AI assistant for support and app information.',
      ],
    },
    {
      name: 'Students App',
      kind: 'Grade management platform',
      link: 'github.com/Dani0306/Students-App',
      stack: 'React · Vite · TanStack Query · Node.js · Express · MongoDB',
      points: [
        'University style system where students and teachers manage courses, subjects and grades, with an AI assistant, JWT authentication and role based access control.',
      ],
    },
    {
      name: 'Forest Media Récords and Grupo Autos Colorado',
      kind: 'Production websites',
      link: 'forestmediarecords.com · grupo-autos-colorado.vercel.app',
      stack: 'Next.js · TypeScript · Tailwind CSS',
      points: [
        'Websites for a Medellín music company that develops emerging artists, and for a family car dealership in Colombia.',
      ],
    },
  ],

  education: [
    {
      title: 'Software Engineering',
      place: 'Institución Universitaria de Envigado (IUE)',
      when: '2022 — 2027, in progress',
      note: 'Focus on full stack web development with JavaScript and TypeScript.',
    },
    { title: 'High School Diploma', place: 'Colegio Nazaret, Bello', when: '2021', note: '' },
  ],
};

// ---- Icons: Phosphor (regular), the same set the site uses. ----
const icon = (name) =>
  readFileSync(path.join(root, 'node_modules/@phosphor-icons/core/assets/regular', `${name}.svg`), 'utf8').replace(
    '<svg',
    '<svg aria-hidden="true" class="icon"',
  );

const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const link = (text) => `<a href="https://${esc(text)}">${esc(text)}</a>`;

const section = (iconName, title, body) => `
  <section class="block">
    <h2>${icon(iconName)}<span>${esc(title)}</span></h2>
    <div class="timeline">${body}</div>
  </section>`;

const entry = ({ heading, sub, when, points = [], note = '' }) => `
  <article class="entry">
    <h3>${heading}</h3>
    ${sub ? `<p class="sub">${sub}</p>` : ''}
    ${when ? `<p class="when">${esc(when)}</p>` : ''}
    ${note ? `<p class="note">${esc(note)}</p>` : ''}
    ${points.length ? `<ul>${points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
  </article>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(resume.name)} · Résumé</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Oswald:wght@400;500&display=block" rel="stylesheet" />
<style>
  @page { size: Letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { font-family: Lato, sans-serif; font-size: 9.2pt; line-height: 1.36; color: #1f2023; font-synthesis: none; }
  a { color: inherit; text-decoration: none; }
  .page { width: 8.5in; min-height: 11in; padding: 0.42in 0.55in 0.36in; }
  .icon { width: 1.05em; height: 1.05em; flex: none; }

  header { text-align: center; }
  header h1 { font-family: Oswald, sans-serif; font-weight: 500; font-size: 25pt; letter-spacing: 0.06em; text-transform: uppercase; margin: 0; line-height: 1.15; }
  header .meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px 18px; margin-top: 8px; font-size: 8.6pt; letter-spacing: 0.04em; text-transform: uppercase; }
  header .meta span { display: inline-flex; align-items: center; gap: 5px; }

  .columns { display: grid; grid-template-columns: 1.95in 1fr; gap: 0.38in; margin-top: 0.22in; }

  aside { text-align: center; }
  aside h2 { font-family: Oswald, sans-serif; font-weight: 500; font-size: 11pt; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 7px; }
  aside h2::before, aside h2::after { content: '◦'; margin: 0 7px; font-size: 9pt; }
  aside .group { margin-bottom: 13px; }
  aside p { margin: 0 0 2px; }
  aside a { text-decoration: underline; text-underline-offset: 2px; }
  .skill { margin-bottom: 6px; }
  .skill strong { display: block; font-size: 8.4pt; letter-spacing: 0.05em; text-transform: uppercase; color: #5b5f66; font-weight: 700; }
  .skill span { display: block; padding-bottom: 5px; border-bottom: 2px solid #1f2023; }
  .available { font-weight: 700; }

  main h2 { display: flex; align-items: center; gap: 12px; font-family: Oswald, sans-serif; font-weight: 500; font-size: 12pt; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 6px -1.6em; }
  main h2 .icon { width: 1.1em; height: 1.1em; }
  main .block { margin-bottom: 11px; padding-left: 1.6em; }
  .timeline { border-left: 1.5px solid #1f2023; padding-left: 14px; margin-left: -1.05em; }
  .entry { position: relative; margin-bottom: 7px; }
  .entry::before { content: ''; position: absolute; left: calc(-14px - 4.5px); top: 4px; width: 6px; height: 6px; border: 1.5px solid #1f2023; border-radius: 50%; background: #fff; }
  .entry h3 { font-size: 10pt; margin: 0; font-weight: 700; }
  .entry .sub { margin: 1px 0 0; color: #3b3e44; }
  .entry .when { margin: 1px 0 0; color: #7a7e86; }
  .entry .note { margin: 2px 0 0; font-style: normal; color: #3b3e44; }
  .entry ul { margin: 3px 0 0; padding-left: 14px; }
  .entry li { margin-bottom: 1px; }
  .profile { margin: 0; }
</style>
</head>
<body>
<div class="page">
  <header>
    <h1>${esc(resume.name)}</h1>
    <div class="meta">
      <span>${esc(resume.title)}</span>
      <span>${icon('map-pin')}${esc(resume.location)}</span>
    </div>
  </header>

  <div class="columns">
    <aside>
      <div class="group">
        <h2>Details</h2>
        <p>${esc(resume.location)}</p>
        <p><a href="mailto:${esc(resume.email)}">${esc(resume.email)}</a></p>
        <p>${link(resume.github)}</p>
        <p>${link(resume.linkedin)}</p>
      </div>
      <div class="group">
        <h2>Availability</h2>
        ${resume.availability.map((a, i) => `<p${i === 0 ? ' class="available"' : ''}>${esc(a)}</p>`).join('')}
      </div>
      <div class="group">
        <h2>Skills</h2>
        ${resume.skills.map((g) => `<div class="skill"><strong>${esc(g.label)}</strong><span>${g.items.map(esc).join(', ')}</span></div>`).join('')}
      </div>
      <div class="group">
        <h2>Languages</h2>
        ${resume.languages.map((l) => `<p><strong>${esc(l.name)}</strong> · ${esc(l.level)}</p>`).join('')}
      </div>
    </aside>

    <main>
      ${section('user', 'Profile', `<p class="profile">${esc(resume.profile)}</p>`)}
      ${section(
        'briefcase',
        'Employment history',
        resume.employment.map((e) => entry({ heading: `${esc(e.role)} at ${esc(e.place)}`, when: e.when, points: e.points })).join(''),
      )}
      ${section(
        'code',
        'Projects',
        resume.projects
          .map((p) =>
            entry({
              heading: `${esc(p.name)} <span class="when">· ${esc(p.kind)}</span>`,
              sub: `${p.link.split(' · ').map(link).join(' · ')} &nbsp;|&nbsp; ${esc(p.stack)}`,
              points: p.points,
            }),
          )
          .join(''),
      )}
      ${section(
        'graduation-cap',
        'Education',
        resume.education.map((e) => entry({ heading: `${esc(e.title)}, ${esc(e.place)}`, when: e.when, note: e.note })).join(''),
      )}
    </main>
  </div>
</div>
</body>
</html>`;

const htmlPath = path.join(root, 'resume', 'resume.html');
const pdfPath = path.join(root, 'public', 'resume.pdf');
mkdirSync(path.dirname(htmlPath), { recursive: true });
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const pages = await page.evaluate(() => Math.ceil(document.querySelector('.page').scrollHeight / (11 * 96)));
  await page.pdf({ path: pdfPath, format: 'Letter', printBackground: true, preferCSSPageSize: true });
  console.log(`Wrote ${path.relative(root, pdfPath)} (${pages} page${pages > 1 ? 's' : ''}) and ${path.relative(root, htmlPath)}.`);
  if (pages > 1) console.warn('The résumé runs past one page; trim the content or the spacing.');
} finally {
  await browser.close();
}
