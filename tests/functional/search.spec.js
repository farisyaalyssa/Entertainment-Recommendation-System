const { test, expect } = require('@playwright/test');

async function login(page) {
  const suffix = Date.now();
  const email = `searchfunc${suffix}@example.com`;
  const password = 'Password1';

  await page.goto('/pages/register.html');
  await page.fill('#firstName', 'Search');
  await page.fill('#lastName', 'Tester');
  await page.fill('#username', `searchuser${suffix}`);
  await page.fill('#regEmail', email);
  await page.fill('#regPassword', password);
  await page.check('#agreeTerms');
  await page.click('button[type="submit"]');
  await page.waitForURL(/home\.html|onboarding\.html/);

  return { email, password };
}

test.describe('Search flow', () => {
  test('user can search from the search page', async ({ page }) => {
    await login(page);

    await page.goto('/pages/search.html');
    await page.fill('#searchInput', 'fight');
    await page.keyboard.press('Enter');

    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#results-meta')).not.toHaveText('');
  });

  test('user can search from the navbar with Enter', async ({ page }) => {
    await login(page);

    await page.goto('/pages/home.html');
    await page.fill('#nav-search-input', 'inception');
    await page.keyboard.press('Enter');

    await page.waitForURL(/search\.html\?q=/);
    await expect(page.locator('#searchInput')).toHaveValue('inception');
  });
});
