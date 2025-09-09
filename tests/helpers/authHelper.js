import { expect } from '@playwright/test';

// Helper function to complete user registration flow
export async function completeUserRegistration(page, email) {
  await page.goto('/signin');
  
  // Verify signin page loads correctly
  await expect(page.getByText('Sign in to your account')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  
  // Fill email and submit
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  
  // Wait for check-user API (should return exists: false for new user)
  const checkUserResponse = await page.waitForResponse(response => 
    response.url().includes('/api/auth/check-user') && 
    response.status() === 200
  );
  
  const checkUserData = await checkUserResponse.json();
  expect(checkUserData.exists).toBe(false);
  
  // Wait for redirect to Keycloak registration page
  await page.waitForURL(/.*identity\.tower\.cloud.*registrations.*/);
      
  // Verify we're on the Keycloak registration page
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#password-confirm')).toBeVisible();
  await expect(page.locator('#firstName')).toBeVisible();
  await expect(page.locator('#lastName')).toBeVisible();
  
  // Fill Keycloak registration form
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.fill('input[name="password-confirm"]', 'TestPassword123!');
  await page.click('input[type="submit"]');
  
  // Wait for redirect back to app
  await page.waitForURL('/');
  
  // Verify successful login
  await expect(page).toHaveURL('/');
}

// Helper function to handle existing user login flow
export async function handleExistingUserLogin(page, email) {
  // Step 1: Navigate to signin
  await page.goto('/signin');
  
  // Step 2: Enter existing user email
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  
  // Step 3: Wait for check-user API (should return exists: true)
  const checkUserResponse = await page.waitForResponse(response => 
    response.url().includes('/api/auth/check-user') && 
    response.status() === 200
  );
  
  const checkUserData = await checkUserResponse.json();
  expect(checkUserData.exists).toBe(true);
  expect(checkUserData.organizations.length).toBeGreaterThan(0);
  
  // Step 4: Verify organization selection page appears
  await expect(page.getByText('Select Organization')).toBeVisible();
  await expect(page.getByText('Choose an organization to sign in to')).toBeVisible();
  
  // Step 5: Select the first organization
  const firstOrg = checkUserData.organizations[0];
  await page.click(`text=${firstOrg.name}`);
  
  // Step 6: Wait for redirect to Keycloak login
  await page.waitForURL(/.*identity\.tower\.cloud.*login.*/);
  
  // Step 7: Verify we're on the Keycloak login page
  await expect(page.getByText('Sign in to your account')).toBeVisible();
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  
  return firstOrg;
}

// Helper function to verify signin page elements
export async function verifySigninPage(page) {
  await expect(page.getByText('Sign in to your account')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
}

// Helper function to verify Keycloak registration page elements
export async function verifyKeycloakRegistrationPage(page) {
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#password-confirm')).toBeVisible();
  await expect(page.locator('#firstName')).toBeVisible();
  await expect(page.locator('#lastName')).toBeVisible();
}

// Helper function to verify Keycloak login page elements
export async function verifyKeycloakLoginPage(page) {
  await expect(page.getByText('Sign in to your account')).toBeVisible();
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
}

// Helper function to fill Keycloak registration form
export async function fillKeycloakRegistrationForm(page, email, firstName = 'Test', lastName = 'User') {
  await page.fill('input[name="firstName"]', firstName);
  await page.fill('input[name="lastName"]', lastName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.fill('input[name="password-confirm"]', 'TestPassword123!');
  await page.click('input[type="submit"]');
}

// Helper function to wait for API response
export async function waitForAPIResponse(page, apiPath) {
  return await page.waitForResponse(response => 
    response.url().includes(apiPath) && 
    response.status() === 200
  );
} 