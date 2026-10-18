import { expect, test } from '@playwright/test';

import { canPlayH264, expectStopShown, scrollToY, segments, stopAnchor, watchErrors } from './helpers';

test('phones get the 720p clips and keep the copy clear of the rail and hint', async ({ page }) => {
  const errors = watchErrors(page);
  const clips: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4')) clips.push(request.url().split('/').pop()!);
  });
  await page.goto('/');
  test.skip(!(await canPlayH264(page)), 'This browser build cannot decode H.264');

  for (const seg of await segments(page)) {
    await scrollToY(page, seg.kind === 'stop' ? stopAnchor(seg, 5) : (seg.start + seg.end) / 2);
    if (seg.kind === 'stop') await expectStopShown(page, ['hello', 'about', 'stack', 'how-i-work', 'testing', 'shipping'][seg.i]);
  }
  await expect.poll(() => clips.length).toBeGreaterThanOrEqual(5);
  expect(clips.every((name) => name.endsWith('-720.mp4'))).toBe(true);
  await expect(page.locator('.sw-route')).toBeHidden();
  await expect(page.locator('.sw-hint')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('selected work shows stacked cards that fade in', async ({ page }) => {
  await page.goto('/#work');
  await expect(page.locator('.work-pin')).toBeHidden();
  const first = page.locator('[data-work-item]').first();
  await expect(first).toHaveClass(/is-in/);
  await expect(first.locator('.work-inline img')).toBeVisible();
});
