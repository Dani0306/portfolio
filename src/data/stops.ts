/**
 * Copy for the six scroll world stops, in order (filenames live in
 * src/config/world.ts). Built only from my CV and my GitHub repos.
 */
export const hero = {
  positioning: 'You imagine. I build. It ships.',
};

export const about = {
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
};

export const stack = {
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
};

export const howIWork = {
  title: 'How I work',
  body: 'Small steps, each one checked before the next. Claude Code does a lot of the typing; I decide what gets built and review every change.',
  steps: [
    {
      title: 'Write the context first',
      body: 'Each project has a CLAUDE.md that describes the product, the schema and the data flow, so every session starts knowing the app.',
    },
    {
      title: 'Build one feature at a time',
      body: 'One server action per job, with the database reachable through an MCP server, so changes stay small and easy to review.',
    },
    {
      title: 'Check it before it ships',
      body: 'Strict TypeScript, ESLint and a production build on every change, then a deploy on Vercel.',
    },
  ],
  /** Copied verbatim from the repo; `from` is the first line number in the file. */
  snippet: {
    project: 'Classly',
    path: 'actions/classes/createClass.ts',
    url: 'https://github.com/Dani0306/Classly/blob/main/actions/classes/createClass.ts#L7-L30',
    from: 14,
    code: [
      'if (!user) throw new Error("Unauthorized");',
      '',
      'const { data, error } = await supabase',
      '  .from("classes")',
      '  .insert({ ...newClass, user_id: user.id })',
      '  .select()',
      '  .single();',
    ],
  },
};

export const testing = {
  title: 'Testing and quality',
  body: 'This site does not ship on trust. Every push runs through GitHub Actions:',
  checks: [
    'Unit tests with Vitest for the scroll engine',
    'Browser tests with Playwright in Chromium and WebKit, on desktop and phone',
    'An automated WCAG AA contrast check over every scene',
    'Type checking and a production build',
  ],
  link: { label: 'See the tests on GitHub', href: 'https://github.com/Dani0306/portfolio/tree/main/tests' },
};

export const shipping = {
  title: 'Shipping',
  body: 'What I build goes live.',
  cta: 'See selected work',
};
