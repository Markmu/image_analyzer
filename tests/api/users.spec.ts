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
import { faker } from '@faker-js/faker';

test.describe('Users API', () => {
  test('TEST-101: should create a new user @p0 @smoke @api @user', async ({ apiRequest, log }) => {
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

  test('TEST-102: should get user by ID @p0 @api @user', async ({ apiRequest, testUser, log }) => {
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

  test('TEST-103: should update user profile @p1 @api @user', async ({ apiRequest, testUser, log }) => {
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

  test('TEST-104: should return 404 for non-existent user @p1 @api @error-handling', async ({ apiRequest, log }) => {
    await log.step('Try to get non-existent user');

    // When: Fetching non-existent user
    const { status, body } = await apiRequest({
      method: 'GET',
      path: `/users/${faker.string.uuid()}`,
    });

    // Then: 404 error should be returned
    expect(status).toBe(404);
    expect(body.error.code).toBe('USER_NOT_FOUND');
  });

  test('TEST-105: should require authentication for protected endpoint @p0 @security @api @auth', async ({
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
  test('TEST-201: should create a template @p0 @api @template', async ({ apiRequest, testUser, log }) => {
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

  test('TEST-202: should list user templates @p1 @api @template', async ({ apiRequest, testUser, log }) => {
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

  test('TEST-203: should get public templates @p2 @api @template', async ({ apiRequest, log }) => {
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
  test('TEST-301: should create analysis request @p0 @api @analysis', async ({ apiRequest, testUser, log }) => {
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

  test('TEST-302: should poll for analysis completion @p1 @api @analysis @polling', async ({
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

  test('TEST-303: should return analysis results @p1 @api @analysis @results', async ({ apiRequest, log }) => {
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
