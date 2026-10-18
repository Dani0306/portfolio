import { describe, expect, it } from 'vitest';

import { buildSegments, copyOpacity, easeToward, focusAt, lingerEase } from './scroll-world.js';

const sections = ['a', 'b', 'c'].map((id, i) => ({
  id,
  still: `/${id}.webp`,
  stillMobile: `/${id}-720.webp`,
  focusX: 40 + i * 10,
}));

describe('buildSegments', () => {
  it('interleaves stops and the clips between them', () => {
    const segments = buildSegments(sections, ['/1.mp4', '/2.mp4'], ['/1-720.mp4', '/2-720.mp4'], 0.9, 1);
    expect(segments.map((s) => s.kind)).toEqual(['dive', 'conn', 'dive', 'conn', 'dive']);
    expect(segments.map((s) => s.w)).toEqual([0.9, 1, 0.9, 1, 0.9]);
    expect(segments[1]).toMatchObject({ clip: '/1.mp4', clipM: '/1-720.mp4', si: 0 });
  });

  it('gives stops without a clip no video, so they hold their still', () => {
    const segments = buildSegments(sections, ['/1.mp4', '/2.mp4']);
    expect(segments.filter((s) => s.kind === 'dive').every((s) => s.clip === undefined)).toBe(true);
  });

  it('uses the stop scroll override', () => {
    const segments = buildSegments([{ ...sections[0], scroll: 1.3 }, sections[1]], ['/1.mp4'], [], 0.9, 1);
    expect(segments[0].w).toBe(1.3);
    expect(segments[2].w).toBe(0.9);
  });

  it('pans a clip from one stop focus to the next', () => {
    const segments = buildSegments(sections, ['/1.mp4', '/2.mp4']);
    expect(segments[0].focus).toEqual([40, 40]);
    expect(segments[1].focus).toEqual([40, 50]);
    expect(segments[3].focus).toEqual([50, 60]);
  });

  it('crossfades two stops directly when a clip is missing', () => {
    const segments = buildSegments(sections, ['/1.mp4', null]);
    expect(segments.map((s) => s.kind)).toEqual(['dive', 'conn', 'dive', 'dive']);
  });
});

describe('focusAt', () => {
  it('interpolates and clamps', () => {
    expect(focusAt([40, 60], 0)).toBe(40);
    expect(focusAt([40, 60], 0.5)).toBe(50);
    expect(focusAt([40, 60], 2)).toBe(60);
  });
});

describe('easeToward', () => {
  it('closes the same share of the gap per second at any frame rate', () => {
    let at60 = 0;
    for (let i = 0; i < 60; i++) at60 = easeToward(at60, 1000, 1 / 60, 0.3);
    let at120 = 0;
    for (let i = 0; i < 120; i++) at120 = easeToward(at120, 1000, 1 / 120, 0.3);
    expect(at60).toBeCloseTo(at120, 6);
    expect(at60).toBeCloseTo(1000 * (1 - Math.exp(-1 / 0.3)), 6);
  });

  it('snaps on big jumps, when off, and when within half a pixel', () => {
    expect(easeToward(0, 5000, 1 / 60, 0.3, 1800)).toBe(5000);
    expect(easeToward(0, 500, 1 / 60, 0)).toBe(500);
    expect(easeToward(499.8, 500, 1 / 60, 0.3)).toBe(500);
  });
});

describe('lingerEase', () => {
  it('keeps the seam frames fixed and never runs backwards', () => {
    for (const L of [0, 0.3, 0.6]) {
      expect(lingerEase(0, L)).toBeCloseTo(0);
      expect(lingerEase(1, L)).toBeCloseTo(1);
      let previous = -Infinity;
      for (let x = 0; x <= 1; x += 0.05) {
        const y = lingerEase(x, L);
        expect(y).toBeGreaterThanOrEqual(previous);
        previous = y;
      }
    }
  });
});

describe('copyOpacity', () => {
  it('shows a middle stop only inside its own segment, fully across the hold', () => {
    expect(copyOpacity(2, 6, 0, false, false, 0.5)).toBe(0);
    expect(copyOpacity(2, 6, 1, false, false, 0.5)).toBe(0);
    for (const pr of [0.25, 0.4, 0.5, 0.6, 0.75]) expect(copyOpacity(2, 6, pr, false, false, 0.5)).toBe(1);
    expect(copyOpacity(2, 6, 0.5, true, false, 0.5)).toBe(0);
    expect(copyOpacity(2, 6, 0.5, false, true, 0.5)).toBe(0);
  });

  it('greets on landing and keeps the last stop up at the end', () => {
    expect(copyOpacity(0, 6, 0, false, false, 0.5)).toBe(1);
    expect(copyOpacity(0, 6, 1, false, true, 0.5)).toBe(0);
    expect(copyOpacity(5, 6, 0, true, false, 0.5)).toBe(0);
    expect(copyOpacity(5, 6, 1, false, true, 0.5)).toBe(1);
  });

  it('matches the original curves without a hold', () => {
    expect(copyOpacity(2, 6, 0.5, false, false)).toBe(1);
    expect(copyOpacity(2, 6, 0.25, false, false)).toBeCloseTo(0.5);
    expect(copyOpacity(0, 6, 0.62, false, false)).toBe(0);
  });
});
