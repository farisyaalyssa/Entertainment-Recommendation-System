const { test, expect } = require('@playwright/test');

async function registerUser(page, suffix) {
  const username = `funcuser${suffix}`;
  const email = `func${suffix}@example.com`;
  const password = 'Password1';

  await page.goto('/pages/register.html');
  await page.fill('#firstName', 'Functional');
  await page.fill('#lastName', 'Tester');
  await page.fill('#username', username);
  await page.fill('#regEmail', email);
  await page.fill('#regPassword', password);
  await page.check('#agreeTerms');
  await page.click('button[type="submit"]');
  await page.waitForURL(/onboarding\.html|home\.html/);

  return { username, email, password };
}

test.describe('Authentication flow', () => {
  test('user can register and log in', async ({ page }) => {
    const suffix = Date.now();
    await registerUser(page, suffix);
    await expect(page).not.toHaveURL(/register\.html/);
  });

  test('user can log in from the login page', async ({ page }) => {
    const suffix = Date.now();
    const user = await registerUser(page, suffix);

    await page.goto('/pages/login.html');
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.click('#loginForm button[type="submit"]');

    await page.waitForURL(/home\.html|onboarding\.html/);

    if (page.url().includes('onboarding.html')) {
      await expect(page.locator('text=Welcome to WatchLy!')).toBeVisible();
    } else {
      await expect(page.locator('#main-navbar')).toBeVisible();
    }
  });
});
