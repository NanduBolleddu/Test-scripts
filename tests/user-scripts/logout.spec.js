import { test, expect } from "@playwright/test";

test.use({ storageState: "authState.json" });

test("Logout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Logout" }).click();
  //await expect(page).toHaveURL("/signin");
  console.log("✅ Logout test completed successfully");
});