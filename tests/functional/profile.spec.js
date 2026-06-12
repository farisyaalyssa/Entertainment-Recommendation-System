const { test, expect } = require('@playwright/test');

async function login(page) {
  const suffix = Date.now();
  const email = `profilefunc${suffix}@example.com`;
  const password = 'Password1';

  await page.goto('/pages/register.html');
  await page.fill('#firstName', 'Profile');
  await page.fill('#lastName', 'Tester');
  await page.fill('#username', `profileuser${suffix}`);
  await page.fill('#regEmail', email);
  await page.fill('#regPassword', password);
  await page.check('#agreeTerms');
  await page.click('button[type="submit"]');
  await page.waitForURL(/home\.html|onboarding\.html/);

  return { email, password, displayName: 'Profile Tester' };
}

test.describe('Profile management flow', () => {
  test('user can view profile and open account settings', async ({ page }) => {
    await login(page);

    await page.goto('/pages/profile.html');
    await expect(page.locator('.profile-name')).not.toHaveText('John Doe');
    await expect(page.locator('#watchlist-grid')).toBeVisible();

    await page.click('text=Edit Profile');
    await expect(page.locator('#edit-profile-modal')).toBeVisible();

    await page.click('#edit-profile-modal .modal-close');
    await page.click('text=Change Password');
    await expect(page.locator('#password-modal')).toBeVisible();

    await page.click('#password-modal .modal-close');
    await page.click('text=Manage Preferences');
    await expect(page.locator('#preferences-modal')).toBeVisible();
  });

  test('user can switch profile tabs', async ({ page }) => {
    await login(page);
    await page.goto('/pages/profile.html');

    await page.click('text=My Reviews');
    await expect(page.locator('#reviews')).toBeVisible();

    await page.click('text=Favourites');
    await expect(page.locator('#favourites')).toBeVisible();

    await page.click('text=Watch History');
    await expect(page.locator('#history')).toBeVisible();
  });
});
