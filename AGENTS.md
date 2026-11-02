# Portfolio

Personal site of Daniel Colorado (danielcolorado.dev): a bilingual (English at `/`, Spanish at `/es/`) one page Astro site. The home page is a "scroll world": scrolling scrubs through five video clips of a developer's desk at night, with six stops of copy between them, followed by the AI, Work, Activity, Experience and Contact sections. Static output, deployed on Vercel.

Read [PRODUCT.md](PRODUCT.md) before changing copy, structure or design. It holds the audience, positioning and principles. [README.md](README.md) has the scroll world internals and the clip replacement steps.

## Stack

Astro 7, Tailwind CSS 4 (via `@tailwindcss/vite`, tokens in `@theme` inside `src/styles/global.css`), TypeScript strict, Vitest, Playwright. Node >= 22.22. Fonts (Geist, JetBrains Mono) come from the Astro `fonts` config, not a `<link>`. There is no UI framework: everything is `.astro` plus plain scripts.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. It serves on `localhost:4321`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run check` | `astro check` type check |
| `npm test` | Vitest unit tests (`src/**/*.test.{js,ts}`) |
| `npm run test:e2e` | Playwright against a fresh production build on port 4322 (Chromium, WebKit, Pixel 7) |
| `npm run contrast` | WCAG AA check of the text over every stop's still |
| `npm run build` | Production build into `dist/` |
| `npm run og` | Rebuild share cards in `public/og/` |
| `npm run resume` | Rebuild `public/resume.pdf` and `resume/resume.html` |
| `npm run videos` | Re-encode clip masters with ffmpeg into `public/journey/web/` |

CI (`.github/workflows/ci.yml`) runs check, test, contrast and test:e2e on every push. Run the same before calling work done. Run a single e2e file with `npx playwright test tests/e2e/ai.spec.ts`.

## Layout

```
src/pages/                 index.astro, es/index.astro, work/[slug].astro, es/work/[slug].astro, 404.astro
src/components/HomePage.astro   the whole home page; both languages render it
src/components/sections/   AI, Work, Activity, Experience, Contact
src/components/world/      ScrollWorld (copy + mount), Stop (one stop)
src/components/            Header, Footer, CommandMenu, CaseStudy, Icon, ...
src/config/world.ts        stops (ids, filenames, stills, focusX, accent), clips, scroll timing
src/data/                  site.ts (facts), stops.ts (stop copy), ai.ts (AI workbench excerpts)
src/i18n/ui.ts             interface labels, language helpers (langFromUrl, localize, switchPath, t)
src/content/projects/      case studies in English (collection `projects`)
src/content/projects-es/   Spanish copy, matched by filename (collection `projectsEs`)
src/lib/                   projects.ts, github.ts, contributions.ts (build time GitHub reads)
src/scripts/               scroll-world.js (scrub engine), copy-email.ts, local-time.ts
public/video, public/world clips and stills the page serves; public/journey and design/ are masters, not deployed
scripts/                   build-og, build-resume, check-contrast, optimize-videos (Node, not part of the Astro build)
tests/e2e/                 Playwright specs; helpers.ts lays out scroll positions like the engine does
```

## Conventions

- **Language comes from the URL.** Components call `langFromUrl(Astro.url)` and `t(lang)`; there are no per language component copies. Build links with `localize(lang, path)`.
- **Everything user facing exists in both languages.** `src/data/stops.ts` is typed `Record<Lang, typeof en>`, so a missing Spanish key fails `astro check`. `ui` in `src/i18n/ui.ts` and `src/data/ai.ts` are not enforced that way, so mirror keys by hand. A new project needs a file in both `src/content/projects/` and `src/content/projects-es/` with the same filename, or `getProjects('es')` throws at build.
- **Facts live in data files, not in components.** Contact details and links are in `src/data/site.ts`; do not hardcode them in markup.
- **Truthful content only.** Every claim must be backed by a live site, repo or file. Nothing is invented. Unshipped work is labeled "In the lab". Project screenshots are real captures, and no new images or video are generated.
- **Copy style:** no hyphens inside sentences and no AI cliches. Motto: "You imagine. I build. It ships."
- **Design:** dark editor world. Canvas `#0e0f12`, ink `#ece8df`, amber accent (green on the testing stop), Geist for text, JetBrains Mono only for code, paths and status. Use the tokens from `global.css` rather than raw colors. Extend this look; do not introduce a new visual identity.
- **Works without JavaScript.** The `js` class on `<html>` switches the scroll world from six static sections to the scrubbed version. Keep stop copy as real HTML and honor `prefers-reduced-motion`.
- **Build time network reads fail soft.** `lastPush`, `getContributions` return `null` on any error, and the UI leaves that piece out. Keep that behavior; a build must not depend on the network. Set `GITHUB_TOKEN` to avoid API rate limits.

## Scroll world invariants

- Clip k runs from stop k-1 to stop k. Each stop's still is a real frame of the video (stop 0 = first frame of clip-1, stops 1 to 4 = first frame of clip-(k+1), stop 5 = last frame of clip-5), so hand offs are frame identical.
- `focusX` in `src/config/world.ts` keeps the subject visible when a phone crops the 16:9 frame.
- The stop list is duplicated in `scripts/check-contrast.mjs` (names, focusX, label colors). Update both when changing a stop, and keep the scrim numbers there in sync with the scroll world block in `global.css`.
- Stop ids appear in `src/i18n/ui.ts` (`stopLabels`), `src/data/stops.ts` and `tests/e2e/world.spec.ts`.
- Clips must be encoded with a keyframe on every frame (`npm run videos` does it) or backward scrubbing stutters.
- `src/scripts/scroll-world.js` is an adapted copy of an external skill's engine; its header lists every local change. Add new changes there with a `site:` note.

## Generated files

`public/resume.pdf`, `resume/resume.html` and `public/og/*` are outputs. Edit `scripts/build-resume.mjs` or the site copy and re-run `npm run resume` / `npm run og`; do not edit the outputs by hand. Both scripts launch Playwright's Chromium and need network the first time for Google Fonts. The résumé omits the phone number on purpose because the PDF is public.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
