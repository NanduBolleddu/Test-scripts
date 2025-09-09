import { test, expect } from "@playwright/test";

// Load the authenticated state from the previous login
test.use({ storageState: "authState.json" });

const invitedEmail = {
  email: "testuser1@gmail.com",
  //"role":"Reader"
};

test("User management actions : Invite User", async ({ page }) => {
  await page.goto("/profile/user-management");

  // Assert, interact, and test with user already logged in
  await page.fill(
    'input[placeholder="Enter email address"]',
    invitedEmail.email
  );

  // Verify and select the "reader" role (default) - adjust selector if needed
  await page.selectOption("select", { label: "Developer" });

  // Click the invite button
  await page.click('button:has-text("Create Organization & Invite")');

  await page.waitForTimeout(2000);

  console.log("✅ Invite User test completed successfully");
});

//test("User management actions : Verify Invited User", async ({ page }) => {
  //await page.goto("/profile/user-management");
  //await page.waitForTimeout(2000);
  // Verify the invited email appears in the organization members section
  //await expect(page.locator(`text=${invitedEmail.email}`)).toBeVisible();

  //console.log("✅ Verify Invited User test completed successfully");
//});



