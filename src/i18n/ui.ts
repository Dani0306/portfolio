/**
 * Interface copy in English and Spanish. English lives at /, Spanish at /es/.
 * Facts about me live in src/data/; this file is only labels and microcopy.
 */
export const langs = ['en', 'es'] as const;
export type Lang = (typeof langs)[number];

export const htmlLang: Record<Lang, string> = { en: 'en', es: 'es-CO' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', es: 'es_CO' };

/** The page's language, from its URL. */
export const langFromUrl = (url: URL): Lang => (url.pathname === '/es' || url.pathname.startsWith('/es/') ? 'es' : 'en');

/** A path in the given language: localize('es', '/work/yield') is /es/work/yield. */
export const localize = (lang: Lang, path = '/') => (lang === 'en' ? path : `/es${path === '/' ? '/' : path}`);

/** The same page in the other language. */
export const switchPath = (url: URL, to: Lang) => {
  const bare = url.pathname.replace(/^\/es(?=\/|$)/, '') || '/';
  return localize(to, bare);
};

export const ui = {
  en: {
    skipToContent: 'Skip to content',
    skipIntro: 'Skip intro',
    getInTouch: 'Get in touch',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNav: 'Main',
    home: 'home',
    nav: { work: 'Work', ai: 'AI', about: 'About', experience: 'Experience', contact: 'Contact' },
    langSwitch: { label: 'ES', name: 'Ver en español', hreflang: 'es' },

    copyEmail: 'Copy email',
    copy: 'Copy',
    copyEmailName: 'Copy email address',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    copyFailedLong: 'Copy failed. Select the address instead.',

    availability: 'Availability',
    localTime: (time: string) => `Medellín · ${time}`,
    localTimeSentence: (time: string) => `It is ${time} in Medellín right now.`,
    scroll: 'Scroll',
    stopLabels: { hello: 'Hello', about: 'About', stack: 'Stack', 'how-i-work': 'With AI', testing: 'Testing', shipping: 'Shipping' },
    viewOnGitHub: 'View on GitHub',
    viewFileOnGitHub: (path: string) => `View ${path} on GitHub`,
    liveProjects: 'Live projects',
    liveAt: (title: string, host: string) => `${title}, live at ${host}`,
    lastUpdated: 'last updated ',
    projectsLive: (n: number) => `${n} projects live`,
    downloadResume: 'Download résumé',

    work: {
      title: 'Selected work',
      intro: 'Four projects that are live on Vercel. Each has a case study, the running site and its code.',
      role: 'Role',
      outcome: 'Outcome',
      stack: 'Stack: ',
      caseStudy: 'Case study',
      caseStudyName: (title: string) => `Case study: ${title}`,
      liveSite: 'Live site',
      liveSiteName: (title: string) => `Live site: ${title}`,
      code: 'Code',
      codeName: (title: string) => `Code: ${title}`,
      allRepos: 'Browse all my repos on GitHub',
      homePage: (title: string) => `${title}, home page`,
    },

    activity: {
      title: 'On GitHub',
      intro: 'Every square is a day of commits, pull requests or reviews from the last year.',
      totalLabel: 'contributions in the last year',
      recentLabel: 'in the last eight weeks',
      activeLabel: 'days with contributions',
      scrollLabel: 'Contribution graph, scrolls sideways',
      graph: (total: number) => `Contribution graph: ${total} contributions in the last year`,
      day: (count: number, date: string) => `${count === 0 ? 'No' : count} contribution${count === 1 ? '' : 's'} on ${date}`,
      less: 'Less',
      more: 'More',
      profile: 'See my GitHub profile',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dateLocale: 'en-US',
    },

    experience: { title: 'Experience' },

    contact: {
      title: 'Get in touch',
      body: 'The fastest way to reach me is email.',
      list: 'Ways to reach me',
      email: 'Email',
      resume: 'Résumé',
      resumeValue: 'PDF, one page',
    },

    footer: {
      builtWith: 'Built with Astro',
      source: 'Source on GitHub',
      privacy: 'Privacy: this site sets no cookies and runs no analytics.',
    },

    caseStudy: {
      back: 'All work',
      role: 'Role',
      outcome: 'Outcome',
      stack: 'Stack',
      lastUpdated: 'Last updated',
      next: 'Next project',
      screenshot: (title: string) => `${title}, home page of the live site`,
    },

    notFound: {
      title: 'Page not found',
      error: 'no such file or directory',
      body: 'This page does not exist, or it moved.',
      home: 'Back home',
    },

    command: {
      open: 'Open command menu',
      label: 'Command menu',
      placeholder: 'Type a command or search',
      empty: 'No results',
      hint: 'to navigate',
      groups: { go: 'Go to', projects: 'Projects', actions: 'Actions', links: 'Links' },
      sections: {
        top: 'Top of the page',
        work: 'Selected work',
        about: 'About',
        stack: 'Stack',
        howIWork: 'How I build with AI',
        testing: 'Testing and quality',
        shipping: 'Shipping',
        activity: 'GitHub activity',
        experience: 'Experience',
        contact: 'Contact',
      },
      caseStudy: (title: string) => `${title}, case study`,
      copyEmail: 'Copy email address',
      sendEmail: 'Send me an email',
      downloadResume: 'Download résumé (PDF)',
      github: 'GitHub profile',
      linkedin: 'LinkedIn profile',
      source: 'Source code of this site',
      language: 'Ver en español',
      copied: 'Email copied',
    },
  },

  es: {
    skipToContent: 'Ir al contenido',
    skipIntro: 'Saltar intro',
    getInTouch: 'Escríbeme',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    mainNav: 'Principal',
    home: 'inicio',
    nav: { work: 'Proyectos', ai: 'IA', about: 'Sobre mí', experience: 'Experiencia', contact: 'Contacto' },
    langSwitch: { label: 'EN', name: 'View in English', hreflang: 'en' },

    copyEmail: 'Copiar correo',
    copy: 'Copiar',
    copyEmailName: 'Copiar la dirección de correo',
    copied: 'Copiado',
    copyFailed: 'No se copió',
    copyFailedLong: 'No se pudo copiar. Selecciona la dirección.',

    availability: 'Disponibilidad',
    localTime: (time: string) => `Medellín · ${time}`,
    localTimeSentence: (time: string) => `Hora en Medellín: ${time}`,
    scroll: 'Desliza',
    stopLabels: { hello: 'Hola', about: 'Sobre mí', stack: 'Stack', 'how-i-work': 'Con IA', testing: 'Pruebas', shipping: 'En producción' },
    viewOnGitHub: 'Ver en GitHub',
    viewFileOnGitHub: (path: string) => `Ver ${path} en GitHub`,
    liveProjects: 'Proyectos en producción',
    liveAt: (title: string, host: string) => `${title}, en producción en ${host}`,
    lastUpdated: 'última actualización ',
    projectsLive: (n: number) => `${n} proyectos en producción`,
    downloadResume: 'Descargar CV (en inglés)',

    work: {
      title: 'Proyectos',
      intro: 'Cuatro proyectos en producción en Vercel. Cada uno tiene su caso de estudio, el sitio en vivo y su código.',
      role: 'Rol',
      outcome: 'Resultado',
      stack: 'Stack: ',
      caseStudy: 'Caso de estudio',
      caseStudyName: (title: string) => `Caso de estudio: ${title}`,
      liveSite: 'Sitio en vivo',
      liveSiteName: (title: string) => `Sitio en vivo: ${title}`,
      code: 'Código',
      codeName: (title: string) => `Código: ${title}`,
      allRepos: 'Ver todos mis repositorios en GitHub',
      homePage: (title: string) => `${title}, página de inicio`,
    },

    activity: {
      title: 'En GitHub',
      intro: 'Cada cuadro es un día de commits, pull requests o revisiones del último año.',
      totalLabel: 'contribuciones en el último año',
      recentLabel: 'en las últimas ocho semanas',
      activeLabel: 'días con contribuciones',
      scrollLabel: 'Gráfico de contribuciones, se desplaza de lado',
      graph: (total: number) => `Gráfico de contribuciones: ${total} contribuciones en el último año`,
      day: (count: number, date: string) =>
        count === 0 ? `Sin contribuciones el ${date}` : `${count} contribuci${count === 1 ? 'ón' : 'ones'} el ${date}`,
      less: 'Menos',
      more: 'Más',
      profile: 'Ver mi perfil de GitHub',
      months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      dateLocale: 'es-CO',
    },

    experience: { title: 'Experiencia' },

    contact: {
      title: 'Hablemos',
      body: 'La forma más rápida de contactarme es por correo.',
      list: 'Formas de contactarme',
      email: 'Correo',
      resume: 'CV',
      resumeValue: 'PDF de una página, en inglés',
    },

    footer: {
      builtWith: 'Hecho con Astro',
      source: 'Código en GitHub',
      privacy: 'Privacidad: este sitio no usa cookies ni analítica.',
    },

    caseStudy: {
      back: 'Todos los proyectos',
      role: 'Rol',
      outcome: 'Resultado',
      stack: 'Stack',
      lastUpdated: 'Última actualización',
      next: 'Siguiente proyecto',
      screenshot: (title: string) => `${title}, página de inicio del sitio en vivo`,
    },

    notFound: {
      title: 'Página no encontrada',
      error: 'no existe el archivo o directorio',
      body: 'Esta página no existe o cambió de dirección.',
      home: 'Volver al inicio',
    },

    command: {
      open: 'Abrir el menú de comandos',
      label: 'Menú de comandos',
      placeholder: 'Escribe un comando o busca',
      empty: 'Sin resultados',
      hint: 'para navegar',
      groups: { go: 'Ir a', projects: 'Proyectos', actions: 'Acciones', links: 'Enlaces' },
      sections: {
        top: 'Inicio de la página',
        work: 'Proyectos',
        about: 'Sobre mí',
        stack: 'Stack',
        howIWork: 'Cómo construyo con IA',
        testing: 'Pruebas y calidad',
        shipping: 'En producción',
        activity: 'Actividad en GitHub',
        experience: 'Experiencia',
        contact: 'Contacto',
      },
      caseStudy: (title: string) => `${title}, caso de estudio`,
      copyEmail: 'Copiar la dirección de correo',
      sendEmail: 'Enviarme un correo',
      downloadResume: 'Descargar CV (PDF, en inglés)',
      github: 'Perfil de GitHub',
      linkedin: 'Perfil de LinkedIn',
      source: 'Código de este sitio',
      language: 'View in English',
      copied: 'Correo copiado',
    },
  },
} as const;

export const t = (lang: Lang) => ui[lang];
