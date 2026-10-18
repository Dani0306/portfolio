import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Selected work. Facts only: each entry comes from the project's GitHub repo
 * (description, live URL, package.json, CLAUDE.md and decision notes) and its
 * live site. The Markdown body is the English case study.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    role: z.string(),
    outcome: z.string(),
    stack: z.array(z.string()),
    live: z.url(),
    repo: z.url(),
    /** A real capture of the live site in public/projects/; never generated. */
    image: z.string(),
  }),
});

/** Spanish copy for each project, matched by filename; the body is the Spanish case study. */
const projectsEs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects-es' }),
  schema: z.object({
    summary: z.string(),
    role: z.string(),
    outcome: z.string(),
  }),
});

export const collections = { projects, projectsEs };
