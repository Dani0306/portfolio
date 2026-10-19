import { expect, test } from '@playwright/test';

import { watchErrors } from './helpers';

test.describe('how I build with AI', () => {
  test('sits right after the intro and the header links to it', async ({ page }) => {
    await page.goto('/');
    const order = await page.evaluate(() => [...document.querySelectorAll('main > section[id]')].map((s) => s.id));
    expect(order[0]).toBe('ai');
    await page.getByRole('navigation', { name: 'Main' }).first().getByRole('link', { name: 'AI', exact: true }).click();
    await expect(page.locator('#ai')).toBeInViewport();
  });

  test('the workbench switches files with clicks and arrow keys', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/#ai');
    const tabs = page.getByRole('tablist', { name: 'What I use AI for' }).getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel', { name: 'Build apps' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Classly CLAUDE.md on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/Dani0306/Classly/blob/main/CLAUDE.md',
    );

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    const automate = page.getByRole('tabpanel', { name: 'Automate processes' });
    await expect(automate).toBeVisible();
    await expect(automate).toContainText("'* * * * *',");
    await expect(page.getByRole('tabpanel', { name: 'Build apps' })).toBeHidden();

    await tabs.nth(1).press('ArrowDown');
    await expect(tabs.nth(2)).toBeFocused();
    await expect(page.getByRole('tabpanel', { name: 'Ideas into products' })).toBeVisible();
    await tabs.nth(2).press('Home');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    expect(errors).toEqual([]);
  });

  test('every lab project is labeled as not shipped', async ({ page }) => {
    await page.goto('/#ai');
    const lab = page.locator('#ai li', { has: page.locator('h4') });
    await expect(lab).toHaveCount(4);
    for (const item of await lab.all()) await expect(item).toContainText('In the lab');
    await expect(page.getByText('None of them is shipped yet')).toBeVisible();
  });

  test('the command menu finds it', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('automation');
    await expect(page.getByRole('option', { name: 'How I build with AI' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(page.locator('#ai')).toBeInViewport();
  });

  test('it reads in Spanish at /es/', async ({ page }) => {
    await page.goto('/es/#ai');
    await expect(page.getByRole('heading', { level: 2, name: 'Cómo construyo con IA' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Automatizar procesos/ })).toBeVisible();
    await expect(page.getByText('En el laboratorio').first()).toBeVisible();
  });
});

test.describe('how I build with AI, without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all three files are readable, each under its job', async ({ page }) => {
    await page.goto('/#ai');
    for (const label of ['Build apps', 'Automate processes', 'Ideas into products']) {
      await expect(page.locator('#ai .ai-panel-label', { hasText: label })).toBeVisible();
    }
    await expect(page.locator('#ai [role="tablist"]')).toBeHidden();
  });
});
