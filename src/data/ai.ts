import type { Lang } from '../i18n/ui';

/**
 * "How I build with AI": how I direct AI to build apps, automate processes
 * and turn ideas into products. The files on the workbench are verbatim
 * excerpts from my public repos, with their real line numbers. The lab lists
 * projects I am building next; they are labeled as not shipped, never shown
 * as finished work.
 */

export interface ExcerptLine {
  n: number;
  text: string;
}

export interface Job {
  id: 'build' | 'automate' | 'ideas';
  label: string;
  summary: string;
  file: {
    project: string;
    path: string;
    url: string;
    /** Wrap long Markdown lines; code keeps its own line breaks. */
    wrap: boolean;
    /** Runs of consecutive lines; a gap is drawn between runs. */
    runs: ExcerptLine[][];
  };
  /** Review comments pinned to a line number of the excerpt. */
  comments: { line: number; text: string }[];
}

const classly = {
  project: 'Classly',
  path: 'CLAUDE.md',
  url: 'https://github.com/Dani0306/Classly/blob/main/CLAUDE.md',
  wrap: true,
  runs: [
    [
      { n: 1, text: '# CLAUDE.md' },
      { n: 2, text: '' },
      {
        n: 3,
        text: 'This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It aims to describe the whole app (product, schema, data flow, conventions) so a new session can work without re-exploring.',
      },
    ],
    [{ n: 228, text: '- Any new AI feature must call `consumeAiCredit` before the model call and `refundAiCredit` on failure.' }],
  ],
};

const yieldReminders = {
  project: 'Yield',
  path: 'supabase/migrations/20261005200000_add_match_reminders.sql',
  url: 'https://github.com/Dani0306/yield/blob/main/supabase/migrations/20261005200000_add_match_reminders.sql',
  wrap: false,
  runs: [
    [
      { n: 1, text: '-- Email reminders 10 minutes before a selected match kicks off.' },
      { n: 2, text: '-- Every minute pg_cron checks for a due reminder and, only when there is' },
      { n: 3, text: '-- one, calls the send-reminders Edge Function, which sends the email' },
      { n: 4, text: '-- through Resend (supabase/functions/send-reminders).' },
    ],
    [
      { n: 80, text: '-- Every minute; the request is only made when a reminder is due.' },
      { n: 81, text: 'select cron.schedule(' },
      { n: 82, text: "  'match-reminders'," },
      { n: 83, text: "  '* * * * *'," },
    ],
  ],
};

const forest = {
  project: 'Forest Media Récords',
  path: 'CLAUDE.md',
  url: 'https://github.com/Dani0306/forestmediarecords/blob/main/CLAUDE.md',
  wrap: true,
  runs: [
    [
      { n: 15, text: '## Project knowledge: the `docs/` Obsidian vault' },
      { n: 16, text: '' },
      {
        n: 17,
        text: "`docs/` is the team's Obsidian vault and the project's memory. Start a session by reading `docs/Home.md`, then `docs/Project/Roadmap.md` and `docs/Project/Open questions.md`. Vault rules live in `docs/CLAUDE.md`.",
      },
      { n: 18, text: '' },
      {
        n: 19,
        text: "**Keep the vault updated as we build.** After a meaningful change: update the affected `docs/Features/` note, add a `docs/Decisions/` note for durable choices, append a log bullet to today's `docs/Daily/YYYY-MM-DD.md`, and update the roadmap or open questions.",
      },
    ],
    [
      {
        n: 56,
        text: '- Never invent events, dates, venues, release titles, streaming stats, testimonials, bios or social links. The site is live (since 2026-10-10 it carries no sample content): leave a section empty (it has an empty state) rather than add placeholder items. `sample: true` still exists for a clearly tagged exception.',
      },
    ],
  ],
};

const en = {
  title: 'How I build with AI',
  lead: 'I do not ask AI for answers and paste them. I direct it like a team: I write the context it works from, give it the tools it needs and check every change before it ships. That is how one person builds complete apps, automates the slow parts of a process and turns an idea into something people use.',
  jobsLabel: 'What I use AI for',
  openFile: (path: string) => `Open ${path} on GitHub`,
  gap: (from: number, to: number) => `Lines ${from} to ${to} left out`,
  commentBy: 'Comment by Daniel',
  jobs: [
    {
      id: 'build',
      label: 'Build apps',
      summary:
        'Every project starts with a CLAUDE.md: the product, the schema, the data flow and the rules. Claude Code reads it at the start of each session, so it builds inside the app instead of guessing.',
      file: classly,
      comments: [
        { line: 3, text: 'Context first. One file describes the whole app, so a new session never starts from zero.' },
        { line: 228, text: 'Rules, not hopes. Every AI feature charges a credit before the call and refunds it if the call fails.' },
      ],
    },
    {
      id: 'automate',
      label: 'Automate processes',
      summary:
        'Repetitive work goes to the system itself. In Yield, the database checks every minute for a match about to start and emails the reminder, with no server to keep running.',
      file: yieldReminders,
      comments: [
        { line: 2, text: 'The database is the scheduler: pg_cron runs inside Postgres, so nothing else has to stay awake.' },
        { line: 83, text: 'Every minute, but it only calls out when a reminder is due. That keeps the whole thing on free plans.' },
      ],
    },
    {
      id: 'ideas',
      label: 'Ideas into products',
      summary:
        'An idea becomes a product when its decisions outlive a single session. Forest Media Récords keeps a vault of notes that Claude Code reads first and updates after every meaningful change.',
      file: forest,
      comments: [
        { line: 19, text: 'Memory that outlives the chat. Every change leaves a note, so the next session knows what was decided and why.' },
        { line: 56, text: 'Guardrails. The agent never invents content: an empty state beats a fake event.' },
      ],
    },
  ] satisfies Job[] as Job[],

  toolkit: {
    title: 'The toolkit',
    headers: { tool: 'Tool', use: 'What it does for me', where: 'Where' },
    rows: [
      { tool: 'Claude Code', use: 'Plans, writes and refactors with me, inside the repo.', where: 'Every project' },
      { tool: 'CLAUDE.md', use: 'Product, schema, data flow and rules, written once and read every session.', where: 'Classly, Yield, Forest Media Récords' },
      { tool: 'MCP servers', use: 'Real access to tools, like the Supabase database, instead of copy and paste.', where: 'Classly' },
      { tool: 'Skills, hooks and subagents', use: 'Reusable know how, and automatic checks after every edit.', where: 'Forest Media Récords, this site' },
      { tool: 'OpenAI API', use: 'AI inside the products: quizzes, summaries, diagrams and a visitor assistant.', where: 'Classly, Forest Media Récords' },
      { tool: 'Scripts and CI', use: 'The slow parts run themselves: the résumé PDF, share cards, contrast and browser tests.', where: 'This site' },
    ],
  },

  lab: {
    title: 'In the lab',
    note: 'Projects I am building next. None of them is shipped yet; each one moves to Selected work, with a live link, the day it is.',
    status: 'In the lab',
    stackLabel: 'Planned stack: ',
    items: [
      {
        name: 'Inbox triage agent',
        body: 'Reads a shared inbox, sorts every email by intent and drafts the reply for a person to approve. Nothing is sent without that approval.',
        stack: ['Next.js', 'Claude API', 'Gmail API', 'Supabase'],
      },
      {
        name: 'Documents to data',
        body: 'Turns invoices and PDFs into clean rows in a spreadsheet, and flags every field it is not sure about for a quick human check.',
        stack: ['Next.js', 'Vision model', 'Supabase', 'Google Sheets API'],
      },
      {
        name: 'WhatsApp booking assistant',
        body: 'Lets a small business take bookings, answer the common questions and send reminders on WhatsApp, around the clock.',
        stack: ['Node.js', 'WhatsApp Business API', 'OpenAI API', 'Supabase'],
      },
      {
        name: 'Brief to prototype',
        body: 'A Claude Code workflow that turns a one page brief into a context file, a plan and a working prototype with tests, deployed for review.',
        stack: ['Claude Code', 'Next.js', 'Playwright', 'Vercel'],
      },
    ],
  },

  cta: {
    title: 'Have a process that eats hours every week?',
    body: 'Tell me how it works today, and I will show you which parts can run on their own.',
  },
};

const es: typeof en = {
  title: 'Cómo construyo con IA',
  lead: 'No le pido respuestas a la IA para copiarlas y pegarlas. La dirijo como a un equipo: escribo el contexto con el que trabaja, le doy las herramientas que necesita y reviso cada cambio antes de publicarlo. Así una sola persona construye aplicaciones completas, automatiza las partes lentas de un proceso y convierte una idea en algo que la gente usa.',
  jobsLabel: 'Para qué uso la IA',
  openFile: (path: string) => `Abrir ${path} en GitHub`,
  gap: (from: number, to: number) => `Se omiten las líneas ${from} a ${to}`,
  commentBy: 'Comentario de Daniel',
  jobs: [
    {
      id: 'build',
      label: 'Construir aplicaciones',
      summary:
        'Cada proyecto empieza con un CLAUDE.md: el producto, el esquema, el flujo de datos y las reglas. Claude Code lo lee al iniciar cada sesión, así construye dentro de la aplicación en vez de adivinar.',
      file: classly,
      comments: [
        { line: 3, text: 'Primero el contexto. Un archivo describe toda la aplicación, así una sesión nueva nunca empieza de cero.' },
        { line: 228, text: 'Reglas, no deseos. Cada función de IA cobra un crédito antes de la llamada y lo devuelve si la llamada falla.' },
      ],
    },
    {
      id: 'automate',
      label: 'Automatizar procesos',
      summary:
        'El trabajo repetitivo lo hace el propio sistema. En Yield, la base de datos revisa cada minuto si un partido está por empezar y envía el recordatorio por correo, sin un servidor que mantener encendido.',
      file: yieldReminders,
      comments: [
        { line: 2, text: 'La base de datos es el programador de tareas: pg_cron corre dentro de Postgres, así nada más tiene que estar despierto.' },
        { line: 83, text: 'Cada minuto, pero solo hace la llamada cuando hay un recordatorio pendiente. Así todo cabe en planes gratuitos.' },
      ],
    },
    {
      id: 'ideas',
      label: 'De la idea al producto',
      summary:
        'Una idea se vuelve producto cuando sus decisiones sobreviven a una sola sesión. Forest Media Récords guarda un vault de notas que Claude Code lee primero y actualiza después de cada cambio importante.',
      file: forest,
      comments: [
        { line: 19, text: 'Memoria que sobrevive al chat. Cada cambio deja una nota, así la siguiente sesión sabe qué se decidió y por qué.' },
        { line: 56, text: 'Límites claros. El agente nunca inventa contenido: un estado vacío es mejor que un evento falso.' },
      ],
    },
  ],

  toolkit: {
    title: 'Las herramientas',
    headers: { tool: 'Herramienta', use: 'Qué hace por mí', where: 'Dónde' },
    rows: [
      { tool: 'Claude Code', use: 'Planea, escribe y refactoriza conmigo, dentro del repositorio.', where: 'Todos los proyectos' },
      { tool: 'CLAUDE.md', use: 'Producto, esquema, flujo de datos y reglas, escritos una vez y leídos en cada sesión.', where: 'Classly, Yield, Forest Media Récords' },
      { tool: 'Servidores MCP', use: 'Acceso real a herramientas, como la base de datos de Supabase, en vez de copiar y pegar.', where: 'Classly' },
      { tool: 'Skills, hooks y subagentes', use: 'Conocimiento reutilizable y revisiones automáticas después de cada edición.', where: 'Forest Media Récords, este sitio' },
      { tool: 'OpenAI API', use: 'IA dentro de los productos: quizzes, resúmenes, diagramas y un asistente para visitantes.', where: 'Classly, Forest Media Récords' },
      { tool: 'Scripts y CI', use: 'Las partes lentas se hacen solas: el CV en PDF, las tarjetas para compartir y las pruebas de contraste y de navegador.', where: 'Este sitio' },
    ],
  },

  lab: {
    title: 'En el laboratorio',
    note: 'Proyectos que voy a construir. Ninguno está en producción todavía; cada uno pasa a Proyectos, con su enlace en vivo, el día que lo esté.',
    status: 'En el laboratorio',
    stackLabel: 'Stack previsto: ',
    items: [
      {
        name: 'Agente para la bandeja de entrada',
        body: 'Lee una bandeja de correo compartida, clasifica cada mensaje según su intención y redacta la respuesta para que una persona la apruebe. Nada se envía sin esa aprobación.',
        stack: ['Next.js', 'Claude API', 'Gmail API', 'Supabase'],
      },
      {
        name: 'De documentos a datos',
        body: 'Convierte facturas y PDF en filas limpias de una hoja de cálculo, y marca cada campo del que no está seguro para una revisión rápida.',
        stack: ['Next.js', 'Modelo de visión', 'Supabase', 'Google Sheets API'],
      },
      {
        name: 'Asistente de reservas por WhatsApp',
        body: 'Permite a un pequeño negocio recibir reservas, responder las preguntas frecuentes y enviar recordatorios por WhatsApp, a cualquier hora.',
        stack: ['Node.js', 'WhatsApp Business API', 'OpenAI API', 'Supabase'],
      },
      {
        name: 'Del brief al prototipo',
        body: 'Un flujo con Claude Code que convierte un brief de una página en un archivo de contexto, un plan y un prototipo funcional con pruebas, desplegado para revisión.',
        stack: ['Claude Code', 'Next.js', 'Playwright', 'Vercel'],
      },
    ],
  },

  cta: {
    title: '¿Tienes un proceso que se come horas cada semana?',
    body: 'Cuéntame cómo funciona hoy y te muestro qué partes pueden hacerse solas.',
  },
};

export const ai: Record<Lang, typeof en> = { en, es };
