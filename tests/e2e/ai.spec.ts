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

  test('the workflow opens with the intro, a legend and six steps', async ({ page }) => {
    await page.goto('/#ai');
    await expect(page.locator('#ai').getByText('I treat AI agents like fast, capable teammates')).toBeVisible();
    const chart = page.getByRole('figure', { name: 'My agentic development process' });
    await expect(chart).toBeVisible();
    await expect(chart.getByRole('listitem')).toHaveCount(6);
    const legend = page.getByRole('list', { name: 'Who owns each step' }).getByRole('listitem');
    await expect(legend).toHaveText(['I own', 'Agent executes', 'Foundation']);
    const owners = await chart.locator('.flow-step').evaluateAll((steps) => steps.map((s) => (s as HTMLElement).dataset.owner));
    expect(owners).toEqual(['base', 'me', 'me', 'agent', 'agent', 'me']);
    await expect(chart.getByText('Learnings go back into the context file.')).toBeVisible();
  });

  test('a step opens and closes with a click, Enter and Space', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/#ai');
    const spec = page.getByRole('button', { name: /Write the spec/ });
    const body = page.getByText('I write a spec with clear acceptance tests');
    await expect(spec).toHaveAttribute('aria-expanded', 'false');
    await expect(body).toBeHidden();

    await spec.click();
    await expect(spec).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toBeVisible();
    await spec.click();
    await expect(spec).toHaveAttribute('aria-expanded', 'false');
    await expect(body).toBeHidden();

    await spec.focus();
    await page.keyboard.press('Enter');
    await expect(spec).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    const plan = page.getByRole('button', { name: /Review the plan/ });
    await expect(plan).toBeFocused();
    await page.keyboard.press('Space');
    await expect(plan).toHaveAttribute('aria-expanded', 'true');
    await expect(spec).toHaveAttribute('aria-expanded', 'true');
    expect(errors).toEqual([]);
  });

  test('step 5 tells screen readers where a failure goes', async ({ page }) => {
    await page.goto('/#ai');
    await expect(page.getByRole('button', { name: /Check its own work/ })).toHaveAccessibleName(
      /If any check fails, the work goes back to step 4/,
    );
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
    await expect(page.getByRole('figure', { name: 'Mi proceso de desarrollo con agentes' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Revisa su propio trabajo/ })).toBeVisible();
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

  test('every workflow step is shown open', async ({ page }) => {
    await page.goto('/#ai');
    await expect(page.getByText('I write a spec with clear acceptance tests')).toBeVisible();
    await expect(page.getByText('the pull request gets my review before anything deploys')).toBeVisible();
  });
});
