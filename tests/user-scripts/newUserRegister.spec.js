import { test, expect } from "@playwright/test";

const user = {
  email: "demo1@gmail.com",
  password: "12345",
  firstName: "test",
  lastName: "user",
};

test("New user registration", async ({ page }) => {
  // Step 1: Navigate to signin and verify page elements
  await page.goto("/signin");

  // Step 2: Enter new user email and submit
  await page.fill('input[type="email"]', user.email);
  await page.click('button[type="submit"]');

  const checkUserResponse = await page.waitForResponse(
    (response) =>
      response.url().includes("/api/auth/check-user") &&
      response.status() === 200
  );

  await page.fill("#password", user.password);
  await page.fill("#password-confirm", user.password);
  await page.fill("#firstName", user.firstName);
  await page.fill("#lastName", user.lastName);

  await page.click('input[type="submit"]');
  await page.waitForTimeout(2000);

  // Step 3: Verify new user registration
  await expect(page).toHaveURL("https://portal.tower.cloud/");
  console.log("✅ New user registration test completed successfully");
});
