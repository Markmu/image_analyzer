/**
 * Objective Description Result API Integration Tests
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * Test coverage for GET /api/analysis/[id] endpoint returning objective_description.
 * Tests cover successful retrieval, permission validation, and error cases.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/analysis/[id]/route';
import { GET } from '@/app/api/analysis/[id]/status/route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * Mock setup
 */

vi.mock('@/lib/db');
vi.mock('@/lib/auth');

/**
 * Test data factories
 */

const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

const createMockTask = (overrides = {}) => ({
  id: 'test-task-id',
  user_id: 'test-user-id',
  image_id: 'test-image-id',
  status: 'completed',
  current_stage: null,
  result_payload: {
    objective_description: {
      visible_content: {
        primary_subjects: ['person', 'car'],
        setting: 'outdoor urban scene',
      },
      imaging_features: {
        technique: 'photography',
        lighting: 'natural',
      },
      overall_confidence: 0.92,
      uncertainty_fields: [],
    },
  },
  ...overrides,
});

const createMockStageSnapshot = (overrides = {}) => ({
  id: 'test-snapshot-id',
  task_id: 'test-task-id',
  stage_name: 'forensic_describer',
  attempt_no: 1,
  stage_status: 'completed',
  output_payload: JSON.stringify({
    visible_content: {
      primary_subjects: ['person'],
      setting: 'urban scene',
    },
    overall_confidence: 0.90,
    uncertainty_fields: [],
  }),
  ...overrides,
}));

describe('GET /api/analysis/[id] - Objective Description Result - P0 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC6: Return objective_description from stage snapshot', () => {
    it('should return complete objective_description when task is completed', async () => {
      // Arrange: Mock authenticated user and completed task
      const mockUser = createMockUser();
      const mockTask = createMockTask();
      const mockSnapshot = createMockStageSnapshot();

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([mockTask]); // Task query
      db.select.mockReturnValueOnce([mockSnapshot]); // Snapshot query

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

      // Assert: Response contains objective_description
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.objective_description).toBeDefined();
      expect(body.data.objective_description.visible_content.primary_subjects).toEqual(['person', 'car']);
      expect(body.data.objective_description.overall_confidence).toBe(0.92);
      expect(body.data.objective_description.uncertainty_fields).toEqual([]);
    });

    it('should read objective_description from forensic_describer stage snapshot', async () => {
      // Arrange: Mock task with stage snapshot
      const mockUser = createMockUser();
      const mockTask = createMockTask({ status: 'completed' });
      const mockSnapshot = createMockStageSnapshot({
        stage_name: 'forensic_describer',
        stage_status: 'completed',
      });

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([mockTask]);
      db.select.mockReturnValueOnce([mockSnapshot]);

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

      // Assert: Response reads from stage snapshot
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data.objective_description).toBeDefined();

      // Verify snapshot was queried
      expect(db.select).toHaveBeenCalledTimes(2); // Task + Snapshot queries
    });

    it('should merge stage snapshot output into result payload', async () => {
      // Arrange: Task with result_payload (for backward compatibility)
      const mockUser = createMockUser();
      const mockTask = createMockTask({
        result_payload: {
          objective_description: {
            visible_content: {
              primary_subjects: ['merged from result_payload'],
            },
            overall_confidence: 0.88,
            uncertainty_fields: [],
          },
        },
      });

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([mockTask]);
      db.select.mockReturnValueOnce([]); // No stage snapshot

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

      // Assert: Returns merged result
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data.objective_definition).toBeDefined();
      expect(body.data.objective_description).toBeDefined();
    });
  });

  describe('AC6: Permission validation', () => {
    it('should return 403 when accessing another user\'s analysis result', async () => {
      // Arrange: Mock different user IDs
      const mockUser = createMockUser({ id: 'user-1' });
      const mockTask = createMockTask({ user_id: 'user-2' }); // Different owner

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([mockTask]);

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

      // Assert: 403 Forbidden
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
    });

    it('should allow access when user owns the analysis task', async () => {
      // Arrange: Same user IDs
      const mockUser = createMockUser({ id: 'same-user-id' });
      const mockTask = createMockTask({ user_id: 'same-user-id' });
      const mockSnapshot = createMockStageSnapshot();

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([mockTask]);
      db.select.mockReturnValueOnce([mockSnapshot]);

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

      // Assert: 200 OK
      expect(response.status).toBe(200);
    });
  });
});

describe('GET /api/analysis/[id] - P1 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error handling', () => {
    it('should return 404 when task does not exist', async () => {
      // Arrange: Mock task not found
      const mockUser = createMockUser();

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([]); // Empty result

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/non-existent-id`);
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent-id' }) });

      // Assert: 404 Not Found
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('ANALYSIS_NOT_FOUND');
    });

    it('should return 404 when task exists but has no objective_description yet', async () => {
      // Arrange: Task without objective_description
      const mockUser = createMockUser();
      const mockTask = createMockTask({
        result_payload: {}, // No objective_description
        status: 'running', // Still processing
      });

      auth.mockResolvedValueOnce(mockUser);
      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });
      db.select.mockReturnValueOnce([mockTask]);
      db.select.mockReturnValueOnce([]); // No stage snapshot

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
      const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

      // Assert: 404 or appropriate status
      // Could return 404 (not ready) or 202 (accepted) depending on API design
      expect([404, 202]).toContain(response.status);
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange: Mock unauthenticated
      auth.mockResolvedValueOnce(null); // No user

      // Act: Call GET endpoint
      const request = new Request(`http://localhost:3000/api/analysis/test-task-id`);
      const response = await GET(request, { params: Promise.resolve({ id: 'test-task-id' }) });

      // Assert: 401 Unauthorized
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid task ID format', async () => {
      // Arrange: Mock user but invalid ID
      const mockUser = createMockUser();
      auth.mockResolvedValueOnce(mockUser);

      // Act: Call GET endpoint with invalid ID
      const request = new Request(`http://localhost:3000/api/analysis/invalid-uuid-format`);
      const response = await GET(request, { params: Promise.resolve({ id: 'invalid-uuid-format' }) });

      // Assert: 400 Bad Request
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

describe('Result API Integration Best Practices', () => {
  it('should use unified response format', async () => {
    // Arrange: Mock successful scenario
    const mockUser = createMockUser();
    const mockTask = createMockTask();
    const mockSnapshot = createMockStageSnapshot();

    auth.mockResolvedValueOnce(mockUser);
    db.select.mockReturnValueOnce({
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
    });
    db.select.mockReturnValueOnce([mockTask]);
    db.select.mockReturnValueOnce([mockSnapshot]);

    // Act: Call endpoint
    const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
    const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

    // Assert: Unified response format
    const body = await response.json();

    // Should have success field
    expect(body).toHaveProperty('success');

    // Should have either data or error
    if (body.success) {
      expect(body).toHaveProperty('data');
    } else {
      expect(body).toHaveProperty('error');
    }
  });

  it('should include correct HTTP status codes', async () => {
    // Test various scenarios for correct HTTP status
    const scenarios = [
      { auth: null, expectedStatus: 401 },
      { auth: {}, task: null, expectedStatus: 404 },
      { auth: {}, task: { user_id: 'other' }, expectedStatus: 403 },
      { auth: {}, task: { user_id: 'same' }, snapshot: {}, expectedStatus: 200 },
    ];

    for (const scenario of scenarios) {
      // Setup mocks based on scenario
      if (scenario.auth === null) {
        auth.mockResolvedValueOnce(null);
      } else {
        auth.mockResolvedValueOnce({ id: 'same' });
      }

      db.select.mockReturnValueOnce({
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
      });

      if (scenario.task === null) {
        db.select.mockReturnValueOnce([]);
      } else {
        db.select.mockReturnValueOnce([scenario.task]);
        db.select.mockReturnValueOnce(scenario.snapshot ? [scenario.snapshot] : []);
      }

      // Act
      const request = new Request('http://localhost:3000/api/analysis/test-id');
      const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });

      // Assert
      expect(response.status).toBe(scenario.expectedStatus);

      vi.clearAllMocks();
    }
  });
});

describe('Objective Description Specific Validation', () => {
  it('should include uncertainty_fields when present in stage snapshot', async () => {
    // Arrange: Mock snapshot with uncertainty_fields
    const mockUser = createMockUser();
    const mockTask = createMockTask();
    const mockSnapshot = createMockStageSnapshot({
      output_payload: JSON.stringify({
        visible_content: {
          primary_subjects: ['person'],
        },
        overall_confidence: 0.75,
        uncertainty_fields: [
          {
            field_name: 'lighting',
            reason: 'Image too dark',
            confidence: 0.3,
          },
        ],
      }),
    });

    auth.mockResolvedValueOnce(mockUser);
    db.select.mockReturnValueOnce({
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
    });
    db.select.mockReturnValueOnce([mockTask]);
    db.select.mockReturnValueOnce([mockSnapshot]);

    // Act: Call endpoint
    const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
    const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

    // Assert: uncertainty_fields included in response
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.objective_description).toBeDefined();
    expect(body.data.objective_description.uncertainty_fields).toBeDefined();
    expect(body.data.objective_description.uncertainty_fields).toHaveLength(1);
    expect(body.data.objective_description.uncertainty_fields[0].field_name).toBe('lighting');
  });

  it('should handle empty uncertainty_fields array', async () => {
    // Arrange: Mock snapshot with no uncertainty
    const mockUser = createMockUser();
    const mockTask = createMockTask();
    const mockSnapshot = createMockStageSnapshot({
      output_payload: JSON.stringify({
        visible_content: {},
        overall_confidence: 0.95,
        uncertainty_fields: [], // No uncertain fields
      }),
    });

    auth.mockResolvedValueOnce(mockUser);
    db.select.mockReturnValueOnce({
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
    });
    db.select.mockReturnValueOnce([mockTask]);
    db.select.mockReturnValueOnce([mockSnapshot]);

    // Act: Call endpoint
    const request = new Request(`http://localhost:3000/api/analysis/${mockTask.id}`);
    const response = await GET(request, { params: Promise.resolve({ id: mockTask.id }) });

    // Assert: Empty uncertainty_fields is valid
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.objective_description.uncertainty_fields).toEqual([]);
  });
});
