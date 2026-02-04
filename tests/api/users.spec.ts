/**
 * Example API Test - User API
 *
 * Demonstrates API testing best practices:
 * - Using apiRequest fixture
 * - Schema validation
 * - Authentication
 * - Proper assertions
 */

import { test, expect } from '../support/merged-fixtures';

test.describe('Users API', () => {
  test('should create a new user', async ({ apiRequest, log }) => {
    await log.step('Create a new user via API');

    // When: Creating a user
    const { status, body } = await apiRequest({
      method: 'POST',
      path: '/users',
      data: {
        email: 'newuser@example.com',
        name: 'New User',
      },
    });

    // Then: User should be created successfully
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.email).toBe('newuser@example.com');
  });

  test('should get user by ID', async ({ apiRequest, testUser, log }) => {
    await log.step('Get user by ID');

    // When: Fetching user
    const { status, body } = await apiRequest({
      method: 'GET',
      path: `/users/${testUser.id}`,
    });

    // Then: User should be returned
    expect(status).toBe(200);
    expect(body.id).toBe(testUser.id);
    expect(body.email).toBe(testUser.email);
  });

  test('should update user profile', async ({ apiRequest, testUser, log }) => {
    await log.step('Update user profile');

    // When: Updating user
    const { status, body } = await apiRequest({
      method: 'PUT',
      path: `/users/${testUser.id}`,
      data: {
        name: 'Updated Name',
      },
    });

    // Then: User should be updated
    expect(status).toBe(200);
    expect(body.name).toBe('Updated Name');
  });

  test('should return 404 for non-existent user', async ({ apiRequest, log }) => {
    await log.step('Try to get non-existent user');

    // When: Fetching non-existent user
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/users/non-existent-id',
    });

    // Then: 404 error should be returned
    expect(status).toBe(404);
    expect(body.error.code).toBe('USER_NOT_FOUND');
  });

  test('should require authentication for protected endpoint', async ({
    request,
    log,
  }) => {
    await log.step('Try to access protected endpoint without auth');

    // When: Making unauthenticated request
    const response = await request.get('/api/users/profile');

    // Then: Should return 401
    expect(response.status()).toBe(401);
  });
});

test.describe('Templates API', () => {
  test('should create a template', async ({ apiRequest, testUser, log }) => {
    await log.step('Create a new template');

    // When: Creating a template
    const { status, body } = await apiRequest({
      method: 'POST',
      path: '/templates',
      data: {
        name: 'My Template',
        visibility: 'private',
        styles: [
          {
            name: 'Photorealistic',
            prompt: 'photorealistic, highly detailed',
          },
        ],
      },
    });

    // Then: Template should be created
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('My Template');
  });

  test('should list user templates', async ({ apiRequest, testUser, log }) => {
    await log.step('List user templates');

    // When: Fetching templates list
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/templates',
    });

    // Then: Templates should be returned
    expect(status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should get public templates', async ({ apiRequest, log }) => {
    await log.step('Get public templates');

    // When: Fetching public templates
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/templates/public',
    });

    // Then: Public templates should be returned
    expect(status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

test.describe('Analysis API', () => {
  test('should create analysis request', async ({ apiRequest, testUser, log }) => {
    await log.step('Create analysis request');

    // When: Creating analysis
    const { status, body } = await apiRequest({
      method: 'POST',
      path: '/analysis',
      data: {
        inputImageUrl: 'https://example.com/image.jpg',
        type: 'full_analysis',
      },
    });

    // Then: Analysis should be created
    expect(status).toBe(201);
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('pending');
  });

  test('should poll for analysis completion', async ({
    apiRequest,
    recurse,
    log,
  }) => {
    await log.step('Poll for analysis completion');

    // Given: Analysis is processing
    const analysisId = 'test-analysis-id';

    // When: Polling for completion
    const result = await recurse(
      () =>
        apiRequest({
          method: 'GET',
          path: `/analysis/${analysisId}`,
        }),
      (res) => res.body.status === 'completed',
    );

    // Then: Analysis should be completed
    expect(result.body.status).toBe('completed');
  });

  test('should return analysis results', async ({ apiRequest, log }) => {
    await log.step('Get analysis results');

    // Given: Analysis is complete
    const analysisId = 'completed-analysis-id';

    // When: Fetching results
    const { status, body } = await apiRequest({
      method: 'GET',
      path: `/analysis/${analysisId}`,
    });

    // Then: Results should be returned
    expect(status).toBe(200);
    expect(body.status).toBe('completed');
    expect(body).toHaveProperty('styleResults');
  });
});
