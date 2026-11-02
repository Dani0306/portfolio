@AGENTS.md

## Claude Code

- AGENTS.md above is the source of truth for commands, layout and conventions. Put shared guidance there, and only Claude specific notes in this file.
- Start the dev server with `astro dev --background`, not as a foreground command, and check it with `astro dev status` / `astro dev logs`.
- Before reporting UI work as done, run `npm run check && npm test && npm run contrast`, and `npm run test:e2e` if you touched the scroll world, sections or routes. State plainly anything you could not run.
- For UI changes, read [PRODUCT.md](PRODUCT.md) first. `.claude/skills/landing-page-design` and the `impeccable` skill apply to visual work here; `.impeccable/surfaces/` holds the direction contract for the AI section.
- Keep every English edit mirrored in Spanish in the same change.
- Do not commit `dist/`, `.astro/`, `test-results/` or Playwright output (already gitignored), and do not hand edit generated files (`public/resume.pdf`, `resume/resume.html`, `public/og/*`).
- Ask before adding dependencies, new images or video, or any claim about Daniel that is not already in `src/data/`, `src/content/` or `PRODUCT.md`.
