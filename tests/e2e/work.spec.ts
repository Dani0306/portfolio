import { expect, test } from '@playwright/test';

test.describe('selected work', () => {
  test('the pinned frame follows the project in the middle of the screen', async ({ page }) => {
    await page.goto('/#work');
    const items = page.locator('[data-work-item]');
    await expect(items).toHaveCount(4);
    await expect(page.locator('.work-pin')).toBeVisible();

    for (let i = 0; i < 4; i++) {
      await items.nth(i).evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2, behavior: 'instant' });
      });
      await expect(items.nth(i)).toHaveAttribute('data-active', '');
      await expect(page.locator('[data-work-count]')).toHaveText(String(i + 1).padStart(2, '0'));
      await expect(page.locator(`[data-frame="${i}"]`)).toHaveClass(/is-shown/);
    }
  });

  test('every project links to its live site and its code', async ({ page }) => {
    await page.goto('/#work');
    for (const name of ['Classly', 'Yield', 'Forest Media Récords', 'Grupo Autos Colorado']) {
      await expect(page.getByRole('link', { name: `Live site: ${name}` })).toHaveAttribute('href', /^https:\/\/.+\.vercel\.app$/);
      await expect(page.getByRole('link', { name: `Code: ${name}` })).toHaveAttribute('href', /^https:\/\/github\.com\/Dani0306\//);
    }
  });
});
