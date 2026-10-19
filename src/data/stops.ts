import type { Lang } from '../i18n/ui';

/**
 * Copy for the six scroll world stops, in order (filenames live in
 * src/config/world.ts). Built only from my CV and my GitHub repos.
 */

const testsUrl = 'https://github.com/Dani0306/portfolio/tree/main/tests';

const en = {
  hero: {
    positioning: 'You imagine. I build. It ships.',
  },

  about: {
    title: 'About',
    body: [
      'I started programming in 2022, the year I began Software Engineering at IUE, by rebuilding apps I used every day: YouTube, Google and Padlet. That habit stuck. Today I build complete products, from the database to the deploy, and four of them are live.',
      'I use Claude Code and agentic workflows to move fast while keeping every change reviewed and understood. Two years in customer support taught me to listen first and explain clearly, which is how I like to work with a team. Right now I am going deeper into testing, Docker and AWS.',
    ],
    facts: [
      'Software Engineering at Institución Universitaria de Envigado, 2022 to 2027',
      'Spanish native, English C1',
      'Two years in customer support: Zara through Konecta, now Third Way Health',
    ],
  },

  stack: {
    title: 'Stack',
    groups: [
      { label: 'Languages', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
      { label: 'Frontend', items: ['React', 'Next.js', 'Redux', 'Tailwind CSS', 'TanStack Query', 'Vite'] },
      { label: 'Backend', items: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Supabase', 'Firebase', 'MongoDB'] },
      { label: 'Services', items: ['OpenAI API', 'Stripe', 'Paddle', 'Vercel', 'AWS'] },
      {
        label: 'Tools',
        items: ['Git and GitHub', 'GitHub Actions', 'Docker', 'Vitest', 'Playwright', 'Claude Code', 'Agentic development'],
      },
    ],
  },

  howIWork: {
    title: 'I build with AI',
    body: 'I direct Claude Code like a team: it does a lot of the typing, and I decide what gets built and review every change.',
    steps: [
      { title: 'Write the context', body: 'A CLAUDE.md per project: the product, the schema, the data flow and the rules.' },
      { title: 'Give it real tools', body: 'MCP servers, skills and hooks, so it works with real data and checks its own work.' },
      { title: 'Review before it ships', body: 'Strict types, tests and a production build on every change.' },
    ],
    cta: 'See how I build with AI',
  },

  testing: {
    title: 'Testing and quality',
    body: 'This site does not ship on trust. Every push runs through GitHub Actions:',
    checks: [
      'Unit tests with Vitest for the scroll engine',
      'Browser tests with Playwright in Chromium and WebKit, on desktop and phone',
      'An automated WCAG AA contrast check over every scene',
      'Type checking and a production build',
    ],
    link: { label: 'See the tests on GitHub', href: testsUrl },
  },

  shipping: {
    title: 'Shipping',
    body: 'What I build goes live.',
    cta: 'See selected work',
  },
};

const es: typeof en = {
  hero: {
    positioning: 'Tú lo imaginas. Yo lo construyo. Sale a producción.',
  },

  about: {
    title: 'Sobre mí',
    body: [
      'Empecé a programar en 2022, el año en que comencé Ingeniería de Software en la IUE, reconstruyendo aplicaciones que usaba a diario: YouTube, Google y Padlet. Ese hábito se quedó. Hoy construyo productos completos, de la base de datos al despliegue, y cuatro de ellos están en producción.',
      'Uso Claude Code y flujos agénticos para avanzar rápido sin dejar de revisar y entender cada cambio. Dos años en servicio al cliente me enseñaron a escuchar primero y explicar con claridad, y así me gusta trabajar en equipo. Ahora estoy profundizando en pruebas, Docker y AWS.',
    ],
    facts: [
      'Ingeniería de Software en la Institución Universitaria de Envigado, 2022 a 2027',
      'Español nativo, inglés C1',
      'Dos años en servicio al cliente: Zara a través de Konecta, hoy Third Way Health',
    ],
  },

  stack: {
    title: 'Stack',
    groups: [
      { label: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
      { label: 'Frontend', items: ['React', 'Next.js', 'Redux', 'Tailwind CSS', 'TanStack Query', 'Vite'] },
      { label: 'Backend', items: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Supabase', 'Firebase', 'MongoDB'] },
      { label: 'Servicios', items: ['OpenAI API', 'Stripe', 'Paddle', 'Vercel', 'AWS'] },
      {
        label: 'Herramientas',
        items: ['Git y GitHub', 'GitHub Actions', 'Docker', 'Vitest', 'Playwright', 'Claude Code', 'Desarrollo agéntico'],
      },
    ],
  },

  howIWork: {
    title: 'Construyo con IA',
    body: 'Dirijo a Claude Code como a un equipo: escribe buena parte del código, y yo decido qué se construye y reviso cada cambio.',
    steps: [
      { title: 'Escribir el contexto', body: 'Un CLAUDE.md por proyecto: el producto, el esquema, el flujo de datos y las reglas.' },
      { title: 'Darle herramientas reales', body: 'Servidores MCP, skills y hooks, para que trabaje con datos reales y revise su propio trabajo.' },
      { title: 'Revisar antes de publicar', body: 'Tipos estrictos, pruebas y un build de producción en cada cambio.' },
    ],
    cta: 'Ver cómo construyo con IA',
  },

  testing: {
    title: 'Pruebas y calidad',
    body: 'Este sitio no sale a producción por fe. Cada push pasa por GitHub Actions:',
    checks: [
      'Pruebas unitarias con Vitest para el motor de scroll',
      'Pruebas de navegador con Playwright en Chromium y WebKit, en escritorio y celular',
      'Una revisión automática de contraste WCAG AA en cada escena',
      'Revisión de tipos y un build de producción',
    ],
    link: { label: 'Ver las pruebas en GitHub', href: testsUrl },
  },

  shipping: {
    title: 'En producción',
    body: 'Lo que construyo sale a producción.',
    cta: 'Ver proyectos',
  },
};

export const stops: Record<Lang, typeof en> = { en, es };
