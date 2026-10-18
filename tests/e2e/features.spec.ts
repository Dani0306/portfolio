import { expect, test } from '@playwright/test';

import { watchErrors } from './helpers';

const PROJECTS = [
  { slug: 'classly', title: 'Classly' },
  { slug: 'yield', title: 'Yield' },
  { slug: 'forest-media-records', title: 'Forest Media Récords' },
  { slug: 'grupo-autos-colorado', title: 'Grupo Autos Colorado' },
];

test.describe('Spanish version', () => {
  test('/es/ is in Spanish and the header switches between languages', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-CO');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Desarrollador full stack');
    await expect(page.getByRole('heading', { level: 2, name: 'Proyectos' })).toBeAttached();

    await page.getByRole('link', { name: 'View in English' }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('link', { name: 'Ver en español' }).first().click();
    await expect(page).toHaveURL(/\/es\/$/);
    expect(errors).toEqual([]);
  });

  test('pages point search engines at both languages', async ({ page }) => {
    await page.goto('/work/yield/');
    await expect(page.locator('link[rel="alternate"][hreflang="es-CO"]')).toHaveAttribute('href', /\/es\/work\/yield\/$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/work\/yield\/$/);
  });
});

test.describe('share cards', () => {
  for (const [path, image] of [
    ['/', '/og/home.png'],
    ['/es/', '/og/home-es.png'],
    ['/work/classly/', '/og/work/classly.png'],
    ['/es/work/yield/', '/og/work/yield-es.png'],
  ]) {
    test(`${path} has a share card that exists`, async ({ page, request }) => {
      await page.goto(path);
      const url = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(url).toMatch(new RegExp(`^https://.+${image.replace(/\//g, '\\/')}$`));
      const response = await request.get(image);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');
    });
  }
});

test.describe('command menu', () => {
  test('Ctrl+K opens it, typing filters, Enter opens the case study', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('dialog', { name: 'Command menu' });
    await expect(menu).toBeHidden();
    await page.keyboard.press('Control+k');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('combobox')).toBeFocused();

    await page.keyboard.type('yield');
    await expect(menu.getByRole('option', { name: 'Yield, case study' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/work\/yield\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Yield' })).toBeVisible();
  });

  test('the header button opens it, arrows move the selection and Escape closes it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open command menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Command menu' });
    const options = menu.getByRole('option');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.type('zzzz');
    await expect(menu.getByText('No results')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('it jumps to a section', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('contact');
    await page.keyboard.press('Enter');
    await expect(page.locator('#contact')).toBeInViewport();
  });
});

test.describe('local time and activity', () => {
  test('the hero and contact show the time in Medellín', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-stop="hello"] [data-local-time]')).toHaveText(/^Medellín · \d{1,2}:\d{2}\s?[AP]M \(UTC−5\)$/);
    await expect(page.locator('#contact [data-local-time]')).toHaveText(/^It is \d{1,2}:\d{2}\s?[AP]M in Medellín right now\.$/);
  });

  test('the GitHub graph shows a year of days', async ({ page }) => {
    await page.goto('/#activity');
    const section = page.locator('#activity');
    // The build leaves the section out when GitHub could not be reached.
    test.skip((await section.count()) === 0, 'GitHub was unreachable at build time');
    await expect(section.getByRole('img', { name: /contributions in the last year/ })).toBeVisible();
    expect(await section.locator('.activity-days .activity-day').count()).toBeGreaterThan(360);
  });
});

test.describe('case studies', () => {
  for (const { slug, title } of PROJECTS) {
    test(`${title} has a case study in both languages`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(`/work/${slug}/`);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      await expect(page.locator('.case-body h2').first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Live site', exact: true })).toHaveAttribute('href', /^https:\/\//);
      await expect(page.getByText('Next project')).toBeVisible();

      await page.goto(`/es/work/${slug}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'es-CO');
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      await expect(page.getByText('Siguiente proyecto')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('a card on the home page opens its case study', async ({ page }) => {
    await page.goto('/#work');
    await page.getByRole('link', { name: 'Case study: Classly' }).click();
    await expect(page).toHaveURL(/\/work\/classly\/$/);
    await expect(page.locator('.case-shot')).toBeVisible();
    await page.getByRole('link', { name: 'All work' }).click();
    await expect(page).toHaveURL(/\/#work$/);
  });
});

test.describe('not found', () => {
  test('an unknown path gets the branded 404 in both languages', async ({ page }) => {
    const response = await page.goto('/this/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('Page not found')).toBeVisible();
    await expect(page.getByText('Página no encontrada')).toBeVisible();
    await expect(page.locator('[data-missing-path]')).toHaveText('/this/does-not-exist');
    await expect(page.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/es/');
  });
});
