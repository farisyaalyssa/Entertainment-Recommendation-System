const { test, expect } = require('@playwright/test');

async function login(page) {
  const suffix = Date.now();
  const email = `detailfunc${suffix}@example.com`;
  const password = 'Password1';

  await page.goto('/pages/register.html');
  await page.fill('#firstName', 'Detail');
  await page.fill('#lastName', 'Tester');
  await page.fill('#username', `detailuser${suffix}`);
  await page.fill('#regEmail', email);
  await page.fill('#regPassword', password);
  await page.check('#agreeTerms');
  await page.click('button[type="submit"]');
  await page.waitForURL(/home\.html|onboarding\.html/);
}

test.describe('Content detail flow', () => {
  test('user can open a title, rate it, and submit a review', async ({ page }) => {
    await login(page);

    await page.goto('/pages/content-detail.html?id=550&type=movie');
    await expect(page.locator('#detail-title')).toBeVisible();
    await page.click('#write-review-btn');

    await page.locator('.star').nth(7).click();
    await page.fill('#review-input', 'Functional test review');
    await page.click('#review-submit-btn');

    await expect(page.locator('#review-input')).toHaveValue('');
    await expect(page.locator('#reviews-list')).toContainText('Functional test review');
  });

  test('user can use watchlist and favourite actions', async ({ page }) => {
    await login(page);

    await page.goto('/pages/content-detail.html?id=550&type=movie');
    await page.click('#watchlist-btn');
    await page.click('#favourite-btn');

    await page.goto('/pages/profile.html');
    await page.click('text=Favourites');
    await expect(page.locator('#favourites-grid')).toBeVisible();
  });
});
