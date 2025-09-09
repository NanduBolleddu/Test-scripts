import { test, expect } from "@playwright/test";
//import { handleExistingUserLogin, verifySigninPage, verifyKeycloakLoginPage } from '../helpers/authHelper.js';
test("Existing user login flow", async ({ page }) => {
  // Use an existing user email (you can change this to a real existing user)
  const existingUser = {
    email: "nandakishore788130@gmail.com",
    password: "12345",
  };

  // Step 1: Navigate to signin and verify page elements
  await page.goto("/signin");
  //await verifySigninPage(page);

  // Step 2: Enter existing user email and submit
  await page.fill('input[type="email"]', existingUser.email);
  await page.click('button[type="submit"]');

  // Step 3: Wait for check-user API (should return exists: true)
  const checkUserResponse = await page.waitForResponse(
    (response) =>
      response.url().includes("/api/auth/check-user") &&
      response.status() === 200
  );

  const checkUserData = await checkUserResponse.json();
  expect(checkUserData.exists).toBe(true);
  expect(checkUserData.organizations.length).toBeGreaterThan(0);

  // Step 4: Verify organization selection page appears
  await expect(page.getByText("Select Organization")).toBeVisible();
  await expect(
    page.getByText("Choose an organization to sign in to")
  ).toBeVisible();

  // Step 5: Verify each organization is displayed (UI elements verification)
  for (const org of checkUserData.organizations) {
    await expect(page.getByText(org.name)).toBeVisible();
  }

  // Step 6: Select the first organization
  const firstOrg = checkUserData.organizations[0];
  await page.click(`text=${firstOrg.name}`);

  // Step 7: Wait for redirect to Keycloak login
  await page.waitForURL(/.*identity\.tower\.cloud.*login.*/);


  // Step 8: Login with the existing user
  await page.fill("#username", existingUser.email);
  await page.fill("#password", existingUser.password);
  await page.click('button:has-text("Sign In")');

  // Step 9: Wait for redirect back to app and verify we're logged in
  await page.waitForURL("/");
  await expect(page).toHaveURL("/");

  console.log("✅ Existing user Login Flow test completed successfully");

  await page.context().storageState({ path: "authState.json" });
});