import { expect, type Page } from '@playwright/test';

export interface Segment {
  kind: 'stop' | 'clip';
  /** Stop index, or the clip number (1 to 5). */
  i: number;
  start: number;
  end: number;
}

/** Scroll position where each stop and clip starts and ends, laid out like the engine does. */
export function segments(page: Page): Promise<Segment[]> {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-world]')!;
    const config = JSON.parse(root.dataset.config ?? '{}');
    const vh = window.innerHeight;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const list: { kind: 'stop' | 'clip'; i: number; start: number; end: number }[] = [];
    let off = 0;
    config.stops.forEach((stop: { scroll?: number }, i: number) => {
      const w = stop.scroll ?? config.stopScroll;
      list.push({ kind: 'stop', i, start: top + off * vh, end: top + (off + w) * vh });
      off += w;
      if (i < config.stops.length - 1) {
        list.push({ kind: 'clip', i: i + 1, start: top + off * vh, end: top + (off + config.connScroll) * vh });
        off += config.connScroll;
      }
    });
    return list;
  });
}

/** Where a stop's text is fully shown: the first and last stops hold at their ends. */
export function stopAnchor(seg: Segment, last: number): number {
  if (seg.i === 0) return seg.start;
  if (seg.i === last) return seg.end;
  return (seg.start + seg.end) / 2;
}

export async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
}

export const copyOpacity = (page: Page, id: string) =>
  page.evaluate((stop) => Number(document.querySelector<HTMLElement>(`[data-stop="${stop}"]`)!.style.opacity), id);

/** Wait until the stop's text is fully shown (the engine eases toward the scroll position). */
export async function expectStopShown(page: Page, id: string) {
  await expect.poll(() => copyOpacity(page, id), { timeout: 5000 }).toBe(1);
}

export const canPlayH264 = (page: Page) =>
  page.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"') !== '');

/** Collects console errors and uncaught exceptions for the whole test. */
/** Chromium logs this when a navigation starts before the previous page transition ends; it is not a page error. */
const BENIGN = /^Transition was aborted because of invalid state/;

export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !BENIGN.test(message.text())) errors.push(message.text());
  });
  page.on('pageerror', (error) => {
    if (!BENIGN.test(error.message)) errors.push(error.message);
  });
  return errors;
}
