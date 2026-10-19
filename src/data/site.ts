import type { Lang } from '../i18n/ui';

/** Facts about me used across the site. Nothing here should be invented. */
export const site = {
  name: 'Daniel Colorado',
  location: 'Medellín, Colombia',
  timeZone: 'America/Bogota',
  email: 'danielcolorado.dev@gmail.com',
  github: 'https://github.com/Dani0306',
  githubUser: 'Dani0306',
  linkedin: 'https://www.linkedin.com/in/daniel-colorado',
  resume: '/resume.pdf',
  repo: 'https://github.com/Dani0306/portfolio',
};

/** The same facts, worded per language. Recruiters filter on availability first, so the start date leads. */
export const siteCopy = {
  en: {
    role: 'Full stack developer',
    availableNow: 'Available now',
    availability: ['Remote, hybrid, on site or relocation'],
    timeZoneNote: 'COT (UTC−5)',
    title: 'Daniel Colorado | Full stack developer, available now',
    description:
      'Full stack developer in Medellín, Colombia, available now. I build web apps with React, Next.js, Node.js, Supabase and MongoDB, and use Claude Code for agentic development.',
  },
  es: {
    role: 'Desarrollador full stack',
    availableNow: 'Disponible ya',
    availability: ['Remoto, híbrido, presencial o reubicación'],
    timeZoneNote: 'COT (UTC−5)',
    title: 'Daniel Colorado | Desarrollador full stack, disponible ya',
    description:
      'Desarrollador full stack en Medellín, Colombia, disponible ya. Construyo aplicaciones web con React, Next.js, Node.js, Supabase y MongoDB, y uso Claude Code para desarrollo agéntico.',
  },
} satisfies Record<Lang, unknown>;

export const nav = [
  { key: 'work', hash: '#work' },
  { key: 'ai', hash: '#ai' },
  { key: 'about', hash: '#about' },
  { key: 'experience', hash: '#experience' },
  { key: 'contact', hash: '#contact' },
] as const;
