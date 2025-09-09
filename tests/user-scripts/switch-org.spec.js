import { test, expect } from '@playwright/test';

test.use({ storageState: "authState.json" });

test('Switch to random org different from current', async ({ page }) => {
  await page.goto('/switch-org');
  await page.waitForSelector('tbody tr', { timeout: 10000 });

  const orgRows = page.locator('tbody tr');
  const rowCount = await orgRows.count();

  let currentOrgName = '';
  for (let i = 0; i < rowCount; i++) {
    const row = orgRows.nth(i);
    const isCurrent = await row.locator('text=Current').count();
    if (isCurrent) {
      currentOrgName = await row.locator('td span.text-blue-400.font-medium').innerText();
      break;
    }
  }
  expect(currentOrgName).not.toBe('');

  const swappableRows = [];
  for (let i = 0; i < rowCount; i++) {
    const row = orgRows.nth(i);
    const hasSwitchButton = await row.locator('button:has-text("Switch")').count();
    const orgName = await row.locator('td span.text-blue-400.font-medium').innerText();
    if (hasSwitchButton && orgName !== currentOrgName) {
      swappableRows.push(row);
    }
  }
  expect(swappableRows.length).toBeGreaterThan(0);

  const randomIndex = Math.floor(Math.random() * swappableRows.length);
  const selectedRow = swappableRows[randomIndex];

  await selectedRow.locator('button:has-text("Switch")').click();

  await page.waitForNavigation();

  await page.goto('/switch-org');
  await page.waitForSelector('tbody tr');

  const newCurrentOrgName = await page.locator('tbody tr:has(span:has-text("Current")) td span.text-blue-400.font-medium').innerText();

  expect(newCurrentOrgName).toBe(await selectedRow.locator('td span.text-blue-400.font-medium').innerText());

  console.log(`✅ Switched from "${currentOrgName}" to "${newCurrentOrgName}" successfully.`);
});
