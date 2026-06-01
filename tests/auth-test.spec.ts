import { test, expect } from '@playwright/test';
import path from "path";
/**
 * Tests user's ability to register an account and login.
 */
test('can register and login', async ({ page }) => {
  const id = Date.now();
  const email = `student${id}@stevens.edu`;
  
  // Sign Up
  await page.goto('/auth/login');
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.waitForURL("**/signup"); // wait until /signup page is loaded
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Stevens@26');
  await page.locator('input[name="passwordConfirm"]').fill('Stevens@26');
  await page.getByRole('button', { name: 'Register' }).click();

  // Login
  await page.waitForURL("**/register");
  
  // Input profile picture
  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles(path.join(__dirname, "profilePic.jpg"));

  await page.getByRole('textbox', { name: 'Full Name' }).fill('John Doe');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL('/', {timeout: 30000}); // wait to be redirected to homepage

  await expect(page.getByText("Welcome back, John Doe!")).toBeVisible();
  
  // Logout
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  
});