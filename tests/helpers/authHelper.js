// authHelper.js
import { expect } from "@playwright/test";

export async function login(page, email, password) {
  await page.goto("/signin");
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');

  // Wait for user check API and UI elements
  const checkUserResponse = await page.waitForResponse(
    (response) =>
      response.url().includes("/api/auth/check-user") &&
      response.status() === 200
  );

  const data = await checkUserResponse.json();
  expect(data.exists).toBe(true);
  expect(data.organizations.length).toBeGreaterThan(0);

  await expect(page.getByText("Select Organization")).toBeVisible();
  await expect(
    page.getByText("Choose an organization to sign in to")
  ).toBeVisible();

  const firstOrg = data.organizations[0];
  await page.click(`text=${firstOrg.name}`);

  await page.waitForURL(/.*identity\.tower\.cloud.*login.*/);

  await page.fill("#username", email);
  await page.fill("#password", password);
  await page.click('button:has-text("Sign In")');

  await page.waitForURL("/");
  await expect(page).toHaveURL("/");

  console.log("✅ Login successful");

  // Save storage state for reuse
  //await page.context().storageState({ path: 'authState.json' });
}

export async function logout(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Logout" }).click();
  console.log("✅ Logout successful");
}
