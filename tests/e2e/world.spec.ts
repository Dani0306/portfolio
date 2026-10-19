import { expect, test } from '@playwright/test';

import { canPlayH264, copyOpacity, expectStopShown, scrollToY, segments, stopAnchor, watchErrors } from './helpers';

const STOPS = ['hello', 'about', 'stack', 'how-i-work', 'testing', 'shipping'];

test.describe('scroll world', () => {
  test('loads with a single h1 and no errors', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Daniel Colorado');
    await expectStopShown(page, 'hello');
    expect(errors).toEqual([]);
  });

  test('every clip is seekable and its time follows the scroll', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await canPlayH264(page)), 'This browser build cannot decode H.264');
    const clips = (await segments(page)).filter((s) => s.kind === 'clip');
    expect(clips).toHaveLength(5);

    for (const clip of clips) {
      for (const share of [0.25, 0.75]) {
        await scrollToY(page, clip.start + (clip.end - clip.start) * share);
        // The clip's scene is the (2k - 1)th: stop, clip, stop, clip…
        const progress = () =>
          page.evaluate((k) => {
            const video = document.querySelectorAll('.sw-scene')[2 * k - 1]?.querySelector('video');
            if (!video || !video.duration || video.seekable.length === 0) return -1;
            return video.currentTime / video.duration;
          }, clip.i);
        await expect.poll(progress, { timeout: 15_000, message: `clip-${clip.i} at ${share}` }).toBeGreaterThan(share - 0.03);
        await expect.poll(progress, { timeout: 5000 }).toBeLessThan(share + 0.03);
      }
      const seekable = await page.evaluate(
        (k) => document.querySelectorAll('.sw-scene')[2 * k - 1].querySelector('video')!.seekable.end(0),
        clip.i,
      );
      expect(seekable).toBeGreaterThan(0);
    }
  });

  test('each stop shows its text only while the camera is at that stop', async ({ page }) => {
    await page.goto('/');
    const segs = await segments(page);
    for (const seg of segs) {
      if (seg.kind === 'stop') {
        await scrollToY(page, stopAnchor(seg, STOPS.length - 1));
        await expectStopShown(page, STOPS[seg.i]);
      } else {
        await scrollToY(page, (seg.start + seg.end) / 2);
        await expect
          .poll(() => Promise.all(STOPS.map((id) => copyOpacity(page, id))).then((all) => Math.max(...all)), { timeout: 5000 })
          .toBe(0);
      }
    }
  });

  test('the accent turns green at the testing stop', async ({ page }) => {
    await page.goto('/');
    const testing = (await segments(page)).find((s) => s.kind === 'stop' && s.i === 4)!;
    await scrollToY(page, stopAnchor(testing, 5));
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'green');
  });

  test('header links land on their sections', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' }).first();

    await nav.getByRole('link', { name: 'About' }).click();
    await expectStopShown(page, 'about');
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'true');

    for (const name of ['Work', 'Experience', 'Contact']) {
      await nav.getByRole('link', { name }).click();
      await expect(page.locator(`#${name.toLowerCase()}`)).toBeInViewport();
    }
  });

  test('Skip intro jumps past the world and then hides', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: 'Skip intro' });
    await skip.click();
    await expect(page.locator('#work')).toBeInViewport();
    await expect(page.locator('#work')).toBeFocused();
    await expect(skip).toBeHidden();
  });

  test('Get in touch is a mailto link and Copy email copies the address', async ({ page, context, browserName }) => {
    await page.goto('/');
    const hero = page.locator('[data-stop="hello"]');
    await expect(hero.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', 'mailto:danielcolorado.dev@gmail.com');

    test.skip(browserName !== 'chromium', 'Reading the clipboard back needs Chromium permissions');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await hero.getByRole('button', { name: 'Copy email' }).click();
    await expect(hero.locator('[data-copy-email] [role="status"]')).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('danielcolorado.dev@gmail.com');
  });
});

test.describe('shipping', () => {
  test('the deploy log lists every live project and the résumé downloads as a PDF', async ({ page, request }) => {
    await page.goto('/');
    const log = page.getByRole('list', { name: 'Live projects' });
    await expect(log.getByRole('link')).toHaveCount(4);

    const resume = page.locator('[data-stop="shipping"]').getByRole('link', { name: 'Download résumé' });
    await expect(resume).toHaveAttribute('href', '/resume.pdf');
    const response = await request.get('/resume.pdf');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });
});

test.describe('contact', () => {
  test('lists every way to reach me, and Copy copies the address', async ({ page, context, browserName }) => {
    await page.goto('/#contact');
    const sheet = page.getByRole('list', { name: 'Ways to reach me' });
    await expect(sheet.getByRole('link', { name: 'danielcolorado.dev@gmail.com' })).toHaveAttribute('href', 'mailto:danielcolorado.dev@gmail.com');
    await expect(sheet.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', /linkedin\.com\/in\//);
    await expect(sheet.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/Dani0306');
    await expect(sheet.getByRole('link', { name: /Résumé/ })).toHaveAttribute('href', '/resume.pdf');

    test.skip(browserName !== 'chromium', 'Reading the clipboard back needs Chromium permissions');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await sheet.getByRole('button', { name: 'Copy email address' }).click();
    await expect(sheet.locator('[data-copy-email] [role="status"]')).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('danielcolorado.dev@gmail.com');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows the stills only: no video loads', async ({ page }) => {
    const videos: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.mp4')) videos.push(request.url());
    });
    await page.goto('/');
    for (const seg of (await segments(page)).filter((s) => s.kind === 'stop')) {
      await scrollToY(page, stopAnchor(seg, 5));
      await expectStopShown(page, STOPS[seg.i]);
    }
    expect(videos).toEqual([]);
    await expect(page.locator('.sw-scene video')).toHaveCount(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every stop is readable over its still', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    for (const name of ['About', 'Stack', 'I build with AI', 'Testing and quality', 'Shipping', 'How I build with AI', 'Selected work']) {
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
    }
    await expect(page.locator('[data-stop-static] img')).toHaveCount(6);
  });
});
