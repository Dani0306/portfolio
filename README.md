# Daniel Colorado · Portfolio

Personal site built with Astro and Tailwind CSS. The home page is a scroll world: a camera walks through a developer's desk at night as you scroll, with six stops of content along the way.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `localhost:4321` (`npx astro dev --background` runs it detached) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the build locally |
| `npm run check` | Type check (`astro check`) |
| `npm test` | Unit tests for the scroll engine (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright: desktop Chromium, desktop WebKit, phone) against the production build |
| `npm run contrast` | WCAG AA check of the text over every stop's still |
| `npm run og` | Rebuilds the share cards in `public/og/` from the site copy (run after changing a title, summary or the motto) |
| `npm run resume` | Rebuilds `public/resume.pdf` |
| `npm run videos` | Re-encodes the clip masters into the web versions in `public/journey/web/` (needs ffmpeg) |

CI (`.github/workflows/ci.yml`) runs the type check, unit tests, contrast check, build and browser tests on every push and pull request.

## How the scroll world works

```
src/config/world.ts            stops (ids, filenames, stills, crop points, accent), clips, timing
src/data/                      copy for the stops and contact details
src/content/projects/          Selected work cards (facts from each GitHub repo)
src/components/world/          ScrollWorld (copy + mount), Stop (one stop, readable without JavaScript)
src/scripts/scroll-world.js    the scrub engine from the scroll-world skill, as an ES module
public/video/                  clip-1 … clip-5 (1080p) and clip-1-720 … clip-5-720 (phones)
public/world/                  one still per stop, extracted from the clips
```

- The six stops have no clip of their own: each shows a still that is a real frame of the video (stop 0 = first frame of clip-1, stops 1–4 = first frame of clip-(k+1), stop 5 = last frame of clip-5). The five clips play between the stops, so every hand off is frame identical and each stop's text only shows while the camera is at that stop.
- The engine loads each clip as a Blob, scrubs `currentTime` from the scroll, crossfades the seams (0.07 of a screen) and serves the 720p clips on phones. It is a lightly adapted copy of the skill's `scrub-engine.js`; the header of `scroll-world.js` lists every change.
- Without JavaScript the stops render as six full screen sections over their stills. With `prefers-reduced-motion` no video loads and the stills swap as you scroll.
- `focusX` per stop keeps the subject in view when a phone crops the 16:9 frame.

## Replacing a clip

1. Put the new master in `public/journey/clips/` (same name, 16:9).
2. `npm run videos -- --only 03` re-encodes it (H.264, a keyframe on every frame, no audio).
3. Copy `public/journey/web/03-1080.mp4` and `03-720.mp4` to `public/video/clip-3.mp4` and `clip-3-720.mp4`.
4. Re-extract the stills next to it (first frame of clip-3 for stop 2, and so on) as WebP into `public/world/`, then run `npm run contrast`.

Keyframe masters are kept in `design/journey-keyframes/`, which is not deployed.

## Content still pending

Everything marked `[PENDING]` on the page needs a real answer: role and availability, About text, my process and a code snippet, CI, each project's summary, role, outcome and screenshot, job dates, the résumé file and this repo's URL.
