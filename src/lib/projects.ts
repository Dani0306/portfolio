import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

import type { Lang } from '../i18n/ui';

export interface Project {
  slug: string;
  data: CollectionEntry<'projects'>['data'];
  /** The entry whose Markdown body is the case study in the requested language. */
  entry: CollectionEntry<'projects'> | CollectionEntry<'projectsEs'>;
}

/** Selected work in order, with summary, role, outcome and case study in the requested language. */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  return Promise.all(
    projects.map(async (project) => {
      if (lang === 'en') return { slug: project.id, data: project.data, entry: project };
      const es = await getEntry('projectsEs', project.id);
      if (!es) throw new Error(`Missing Spanish copy for project "${project.id}" in src/content/projects-es/`);
      return { slug: project.id, data: { ...project.data, ...es.data }, entry: es };
    }),
  );
}
