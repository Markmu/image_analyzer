/**
 * Custom Fixtures for image_analyzer
 *
 * Project-specific fixtures that extend Playwright's base test.
 * These integrate with the project's domain models and API patterns.
 */

import { test as base, APIRequestContext } from '@playwright/test';
import { createUser, type User, type CreateUserInput } from './factories/user-factory';
import { createTemplate, type Template, type CreateTemplateInput } from './factories/template-factory';
import { createAnalysis, type Analysis, type CreateAnalysisInput } from './factories/analysis-factory';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TestUser = User & {
  cleanup: () => Promise<void>;
};

export type TestTemplate = Template & {
  cleanup: () => Promise<void>;
};

export type TestAnalysis = Analysis & {
  cleanup: () => Promise<void>;
};

export type ApiClient = {
  get: <T>(path: string, options?: { headers?: Record<string, string> }) => Promise<{ status: number; body: T }>;
  post: <T>(path: string, data: unknown, options?: { headers?: Record<string, string> }) => Promise<{ status: number; body: T }>;
  put: <T>(path: string, data: unknown, options?: { headers?: Record<string, string> }) => Promise<{ status: number; body: T }>;
  delete: <T>(path: string, options?: { headers?: Record<string, string> }) => Promise<{ status: number; body: T }>;
};

// ============================================
// FIXTURES
// ============================================

export const test = base.extend<{
  // Custom test user fixture
  testUser: TestUser;

  // Test template fixture
  testTemplate: TestTemplate;

  // Test analysis fixture
  testAnalysis: TestAnalysis;

  // API client fixture
  apiClient: ApiClient;

  // Authenticated request context
  authenticatedRequest: APIRequestContext;
}>({
  // ----------------------------------------
  // Test User Fixture
  // ----------------------------------------
  testUser: async ({ request }, use) => {
    const user = createUser({
      role: 'user',
    });

    // Seed user via API
    const response = await request.post('/api/users', {
      data: user,
    });

    let userCreated = false;
    if (response.ok()) {
      userCreated = true;
    } else {
      console.warn(`⚠️  Failed to seed test user, using without API setup`);
    }

    await use(user);

    // Cleanup: Delete the created user (fail test if cleanup fails)
    if (userCreated) {
      const deleteResponse = await request.delete(`/api/users/${user.id}`);
      if (!deleteResponse.ok()) {
        // Log detailed error and throw to prevent state pollution
        const errorBody = await deleteResponse.text().catch(() => 'Unknown error');
        throw new Error(
          `Failed to cleanup test user ${user.id}. Status: ${deleteResponse.status()}. Body: ${errorBody}`,
        );
      }
    }
  },

  // ----------------------------------------
  // Test Template Fixture
  // ----------------------------------------
  testTemplate: async ({ request }, use) => {
    const template = createTemplate({
      userId: 'test-user-id', // Will be overridden by actual user
    });

    // Seed template via API
    const response = await request.post('/api/templates', {
      data: template,
    });

    let templateCreated = false;
    if (response.ok()) {
      templateCreated = true;
    } else {
      console.warn(`⚠️  Failed to seed test template, using without API setup`);
    }

    await use(template);

    // Cleanup
    if (templateCreated) {
      const deleteResponse = await request.delete(`/api/templates/${template.id}`);
      if (!deleteResponse.ok()) {
        const errorBody = await deleteResponse.text().catch(() => 'Unknown error');
        throw new Error(
          `Failed to cleanup test template ${template.id}. Status: ${deleteResponse.status()}. Body: ${errorBody}`,
        );
      }
    }
  },

  // ----------------------------------------
  // Test Analysis Fixture
  // ----------------------------------------
  testAnalysis: async ({ request }, use) => {
    const analysis = createAnalysis({
      userId: 'test-user-id',
    });

    // Seed analysis via API
    const response = await request.post('/api/analysis', {
      data: analysis,
    });

    let analysisCreated = false;
    if (response.ok()) {
      analysisCreated = true;
    } else {
      console.warn(`⚠️  Failed to seed test analysis, using without API setup`);
    }

    await use(analysis);

    // Cleanup
    if (analysisCreated) {
      const deleteResponse = await request.delete(`/api/analysis/${analysis.id}`);
      if (!deleteResponse.ok()) {
        const errorBody = await deleteResponse.text().catch(() => 'Unknown error');
        throw new Error(
          `Failed to cleanup test analysis ${analysis.id}. Status: ${deleteResponse.status()}. Body: ${errorBody}`,
        );
      }
    }
  },

  // ----------------------------------------
  // API Client Fixture
  // ----------------------------------------
  apiClient: async ({ request, authToken }, use) => {
    const client: ApiClient = {
      async get<T>(path, options = {}) {
        const response = await request.get(path, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            ...options.headers,
          },
        });
        return {
          status: response.status(),
          body: (await response.json()) as T,
        };
      },
      async post<T>(path, data, options = {}) {
        const response = await request.post(path, {
          data,
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return {
          status: response.status(),
          body: (await response.json()) as T,
        };
      },
      async put<T>(path, data, options = {}) {
        const response = await request.put(path, {
          data,
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return {
          status: response.status(),
          body: (await response.json()) as T,
        };
      },
      async delete<T>(path, options = {}) {
        const response = await request.delete(path, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            ...options.headers,
          },
        });
        return {
          status: response.status(),
          body: (await response.json()) as T,
        };
      },
    };

    await use(client);
  },

  // ----------------------------------------
  // Authenticated Request Fixture
  // ----------------------------------------
  authenticatedRequest: async ({ request, authToken }, use) => {
    // The request fixture is already authenticated via storage state
    // This is a convenience wrapper for clarity
    await use(request);
  },
});

// ============================================
// FIXTURE OPTIONS (test.use)
// ============================================

export interface TestFixtureOptions {
  /**
   * User role for test user creation
   */
  userRole?: 'user' | 'admin' | 'moderator';

  /**
   * Whether to skip API seeding (for UI-only tests)
   */
  skipApiSeeding?: boolean;
}
