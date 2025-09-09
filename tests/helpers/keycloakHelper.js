import { expect } from '@playwright/test';

// Environment variables for Keycloak
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://identity.tower.cloud';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'cloud-platform';
const KEYCLOAK_ADMIN = process.env.KEYCLOAK_ADMIN || "admin";
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || "admin";

// Helper function to get Keycloak admin token
export async function getKeycloakAdminToken(request) {
  const response = await request.post(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams({
      client_id: 'admin-cli',
      username: KEYCLOAK_ADMIN,
      password: KEYCLOAK_ADMIN_PASSWORD,
      grant_type: 'password'
    }).toString()
  });
  
  if (!response.ok()) {
    throw new Error(`Failed to get admin token: ${response.status()} ${response.statusText()}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

// Helper function to verify Keycloak components
export async function verifyKeycloakComponents(request, email) {
  const adminToken = await getKeycloakAdminToken(request);
  const expectedOrgName = generateExpectedOrgName(email);
  const expectedClientId = generateExpectedClientId(email);
  const expectedDomain = generateExpectedDomain(email);
  
  console.log('Verifying Keycloak components for:', {
    email,
    expectedOrgName,
    expectedClientId,
    expectedDomain
  });
  
  // 1. Verify user exists in Keycloak
  const users = await request.get(`${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${email}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  expect(users.ok()).toBeTruthy();
  const userData = await users.json();
  expect(userData.length).toBeGreaterThan(0);
  expect(userData[0].id).toBeDefined();
  console.log('✅ User found in Keycloak:', userData[0].email, 'ID:', userData[0].id);
  
  // 2. Verify organization exists in Keycloak
  const orgs = await request.get(`${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  expect(orgs.ok()).toBeTruthy();
  const orgData = await orgs.json();
  
  // Find the specific organization for this user by looking for the username part
  const username = email.split("@")[0];
  console.log('🔍 Looking for organization with username:', username);
  console.log('🔍 Available organizations:', orgData.map(org => org.name));
  
  const testOrg = orgData.find(org => org.name.includes(username));
  expect(testOrg).toBeDefined();
  console.log('✅ Organization found in Keycloak:', testOrg.name, 'for user:', username);
  
  // 3. Verify client exists in Keycloak
  const clients = await request.get(`${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  expect(clients.ok()).toBeTruthy();
  const clientData = await clients.json();
  
  // Find the specific client for this user by looking for the username part
  console.log('🔍 Looking for client with username:', username);
  console.log('🔍 Available clients:', clientData.map(client => client.clientId));
  
  const testClient = clientData.find(client => client.clientId.includes(username));
  expect(testClient).toBeDefined();
  console.log('✅ Client found in Keycloak:', testClient.clientId, 'for user:', username);
  
  // 4. Verify client roles exist
  const clientRoles = await request.get(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${testClient.id}/roles`,
    { headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  expect(clientRoles.ok()).toBeTruthy();
  const rolesData = await clientRoles.json();
  expect(rolesData.some(role => role.name === 'owner')).toBeTruthy();
  expect(rolesData.some(role => role.name === 'developer')).toBeTruthy();
  expect(rolesData.some(role => role.name === 'reader')).toBeTruthy();
  console.log('✅ Client roles found:', rolesData.map(r => r.name));
  
  return {
    userId: userData[0].id,
    orgId: testOrg.id,
    clientId: testClient.clientId,
    clientUUID: testClient.id
  };
}

// Helper function to generate expected organization name based on email
export function generateExpectedOrgName(email) {
  const domain = email.split("@")[1];
  const username = email.split("@")[0];
  const cleanDomain = domain.toLowerCase().split(".")[0].replace(/[^a-z0-9]/g, "");
  return `${cleanDomain}-${username.replace(/\./g, "-")}`;
}

// Helper function to generate expected client ID based on email
export function generateExpectedClientId(email) {
  const domain = email.split("@")[1];
  const username = email.split("@")[0];
  const cleanDomain = domain.toLowerCase().split(".")[0].replace(/[^a-z0-9]/g, "");
  return `client-${cleanDomain}-${username.replace(/\./g, "-")}`;
}

// Helper function to generate expected domain based on email
export function generateExpectedDomain(email) {
  const username = email.split("@")[0];
  const emailDomain = email.split("@")[1];
  return `${username.replace(/\./g, "-")}#${emailDomain}.cloud.tower`;
} 