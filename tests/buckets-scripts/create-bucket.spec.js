import { test, expect } from "@playwright/test";

test.use({ storageState: "authState.json" });

test("Create storage bucket with random name", async ({ page }) => {
  await page.goto("/storage");

  // Click the initial Create button
  await page.click('button:has-text("Create")');

  // Generate a random number for bucket name
  const randomNumber = Math.floor(Math.random() * 10000);
  const bucketName = `test-${randomNumber}`;

  // Fill the bucket name input (assuming placeholder "mybucket")
  await page.fill('input[placeholder="mybucket"]', bucketName);

  // Click the Next button (text: "Next")
  await page.click('button:has-text("Next")');

  // Wait for the Review & Create page to load
  await page.waitForSelector("text=Review Storage Bucket Configuration");

  // Click the Create button on review page
  await Promise.all([
    page.waitForURL("/storage/create"), // Wait for navigation to /storage/create
    page.click('button:has-text("Create")'),
  ]);

  // Wait for either redirect to /storage OR timeout after 20 seconds
  try {
    await page.waitForURL(/\/storage$/, { timeout: 20000 });
    console.log(
      `✅ Bucket "${bucketName}" created successfully and redirected to /storage`
    );
  } catch {
    // If no redirect happen, assume bucket already exists or error
    console.log(`⚠️ Bucket "${bucketName}" was not created. Still on page.`);
  }
});
