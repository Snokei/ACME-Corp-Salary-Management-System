import { test, expect, Page } from '@playwright/test';

const DEMO_EMAIL = 'admin@acme.com';
const DEMO_PASSWORD = 'password123';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(DEMO_EMAIL);
  await page.locator('input[name="password"]').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.getByText(/hello/i).first()).toBeVisible({ timeout: 20_000 });
}

test.describe('ACME Salary Management — E2E smoke', () => {
  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/people');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('admin can log in and see the dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText(/total global payroll/i)).toBeVisible();
    await expect(page.getByText(/average base salary/i)).toBeVisible();
  });

  test('admin can open People and see the employee directory', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /^people$/i }).click();
    await expect(page).toHaveURL(/\/people/);
    await expect(page.getByRole('heading', { name: /^people$/i })).toBeVisible();
    await expect(
      page.locator('table').first().or(page.getByText(/no employees/i))
    ).toBeVisible({ timeout: 30_000 });
  });

  test('admin can open Salary Bands', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /salary bands/i }).click();
    await expect(page).toHaveURL(/\/salary-bands/);
    await expect(page.getByText(/salary band/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('admin can open Compensation Analytics', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /^analytics$/i }).click();
    await expect(page).toHaveURL(/\/compensation-analytics/);
    await expect(
      page.getByRole('heading', { name: /compensation analytics/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('wrong password stays on login with an error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(DEMO_EMAIL);
    await page.locator('input[name="password"]').fill('wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText(/invalid email or password|login failed|unexpected error|database unavailable|failed/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
