/**
 * Scroll world configuration: the six stops and the five clips between them.
 * The clips are segments BETWEEN stops: clip-k runs from stop k-1 to stop k.
 * Each stop shows a still that is a real frame of the video, so the hand off
 * between a stop and its clips is frame identical:
 *   stop 0 = first frame of clip-1, stops 1-4 = first frame of clip-(k+1),
 *   stop 5 = last frame of clip-5.
 */
export interface WorldStop {
  id: string;
  /** Label in the route rail. */
  label: string;
  /** Filename shown in the editor tab bar. */
  file: string;
  /** 1920×1080 still for desktop, 1280×720 for phones (matches the 720p clips). */
  still: string;
  stillMobile: string;
  /** Horizontal object-position in percent: keeps the subject in view when phones crop the 16:9 frame. */
  focusX: number;
  /** Scroll distance in viewport heights; defaults to `stopScroll`. */
  scroll?: number;
  accent: 'amber' | 'green';
}

const still = (n: number, id: string) => ({
  still: `/world/${n}-${id}.webp`,
  stillMobile: `/world/${n}-${id}-720.webp`,
});

export const world = {
  /** Viewport heights of scroll per stop and per clip. */
  stopScroll: 1.0,
  connScroll: 1.8,
  /** Seconds the camera takes to catch up with the scroll (time constant). */
  smoothing: 0.3,
  /** Seam dissolve, in viewport heights. */
  crossfade: 0.07,
  /** Share of each stop where its text stays fully visible. */
  copyHold: 0.5,

  stops: [
    // The subject on each frame: the desk under the lamp, the notebook and mug, the monitor,
    // the hands on the keyboard, the hands in green light, the phone.
    { id: 'hello', label: 'Hello', file: 'hello.ts', ...still(0, 'hello'), focusX: 64, scroll: 1.4, accent: 'amber' },
    { id: 'about', label: 'About', file: 'README.md', ...still(1, 'about'), focusX: 60, accent: 'amber' },
    { id: 'stack', label: 'Stack', file: 'package.json', ...still(2, 'stack'), focusX: 77, accent: 'amber' },
    { id: 'how-i-work', label: 'How I work', file: 'app.tsx', ...still(3, 'work'), focusX: 72, accent: 'amber' },
    { id: 'testing', label: 'Testing', file: 'app.test.ts', ...still(4, 'tests'), focusX: 70, accent: 'green' },
    { id: 'shipping', label: 'Shipping', file: 'deploy.log', ...still(5, 'ship'), focusX: 73, scroll: 1.5, accent: 'amber' },
  ] satisfies WorldStop[] as WorldStop[],

  connectors: [1, 2, 3, 4, 5].map((k) => `/video/clip-${k}.mp4`),
  connectorsMobile: [1, 2, 3, 4, 5].map((k) => `/video/clip-${k}-720.mp4`),
};

export const accentColor = {
  amber: 'var(--color-amber)',
  green: 'var(--color-green)',
} as const;
