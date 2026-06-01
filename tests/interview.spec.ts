import { test, expect } from '@playwright/test';
import path from "path";

/**
 * Tests user's ability to start an interview.
 */
test('can start interview', async ({ page }) => {
  const id = Date.now();
  const email = `vivy${id}@stevens.edu`;

  // Sign Up
  await page.goto('/auth/login');
  // await page.getByRole('link', { name: 'New user? sign up' }).click();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.waitForURL("**/signup"); // wait until /signup page is loaded
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Testing@123');
  await page.locator('input[name="passwordConfirm"]').fill('Testing@123');
  await page.getByRole('button', { name: 'Register' }).click();

  // Login
  await page.waitForURL("**/register");
  
  // Input profile picture
  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles(path.join(__dirname, "profilePic.jpg"));

  await page.getByRole('textbox', { name: 'Full Name' }).fill('Vivy Diva');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL('/', {timeout: 30000}); // wait to be redirected to homepage
  
  // const heading = page.getByRole("heading", {level: 1});
  // await expect(heading).toHaveText("Welcome back, Vivy Diva!");
   
  // // Start interview
  // await page.getByRole('link', { name: 'Natural Conversation' }).click();
  await expect(page.getByText("Welcome back, Vivy Diva!")).toBeVisible();
   
  // Start interview using the new button name
  await page.getByRole('link', { name: 'Start Mock Interview' }).click();
  await page.goto('https://meet.livekit.io/custom?liveKitUrl=wss://heygen-feapbkvq.livekit.cloud&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzA2OTkyMTUsImlzcyI6IkFQSVByREUyNXZZRldERyIsIm5hbWUiOiJjbGllbnQiLCJuYmYiOjE3NzA2MTI4MTUsInN1YiI6ImNsaWVudCIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiI0YTExZTFjMC0wNTczLTExZjEtYmFiNC1iMjMxMzc5OWQxOTciLCJyb29tSm9pbiI6dHJ1ZX19.i9djsTddaCTO--O6NienIgBRX1LFgXPWydsR-LVBP2E');
  await expect(page.locator('.lk-participant-tile')).toBeVisible();

});

/**
 * Tests the user's ability to check their interview results. TODO: This test shouldn't be using a brand new user since they haven't taken a test yet. Also, instead of reading from Firebase we should use Playwright's page.route() to intercept the endpoint and return mock data that'll populate the progress UI.
 */
test('query interview results', async ({ page }) => {
  const id = Date.now();
  const email = `emmafrost${id}@stevens.edu`;

  // Sign Up
  await page.goto('/auth/login');
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.waitForURL("**/signup"); // wait until /signup page is loaded
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Querying!123');
  await page.locator('input[name="passwordConfirm"]').fill('Querying!123');
  await page.getByRole('button', { name: 'Register' }).click();

  // Login
  await page.waitForURL("**/register");
  
  // Input profile picture
  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles(path.join(__dirname, "profilePic.jpg"));

  await page.getByRole('textbox', { name: 'Full Name' }).fill('Emma Frost');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL('/', {timeout: 30000}); // wait to be redirected to homepage

  await expect(page.getByText("Welcome back, Emma Frost!")).toBeVisible();

  // Request interview results using the new button name
  await page.getByRole('link', { name: 'View Interview History' }).click();
  await page.waitForURL("**/progress");
  await expect(page.getByText('Interview History').first()).toBeVisible();
});