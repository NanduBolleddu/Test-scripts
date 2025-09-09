import { test, expect } from "@playwright/test";

test.use({ storageState: "authState.json" });

test("Update role for invited user", async ({ page }) => {
  await page.goto("/profile/user-management");

  const targetUserEmail = "shifa@pascalcase.com";

  // Locate initial user card
  const memberCard = page.locator(`text=${targetUserEmail}`).first();

  // Open menu and change role (as before)
  const userBlock = memberCard.locator('xpath=ancestor::div[contains(@class,"flex items-center justify-between")]');
  const moreOptionsButton = userBlock.locator("button:has(svg.lucide-ellipsis-vertical)");
  await moreOptionsButton.click();
  await page.getByText("Change Role").click();

  // Wait for modal
  await page.waitForSelector("text=Change User Role");
  await page.click('button:has-text("Reader")');

  const updateButton = page.locator('button:has-text("Update Role")');
  await expect(updateButton).toBeEnabled();
  await updateButton.click();

  // Wait for possible network/UI update - adjust timeout or selector as needed
  await page.waitForTimeout(2000);

  // Re-locate user card after update
  const updatedMemberCard = page.locator(`text=${targetUserEmail}`).first();

  console.log("✅ Update role for invited user test completed successfully");
});
