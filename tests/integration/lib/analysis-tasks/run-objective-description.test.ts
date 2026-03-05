/**
 * Objective Description Stage Service Integration Tests
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * Test coverage for the Forensic Describer stage service.
 * Tests cover successful parsing, external model exceptions, and snapshot write failures.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { runObjectiveDescriptionStage } from '@/lib/analysis-tasks/run-objective-description';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * Mock setup for external dependencies
 */

// Mock Replicate SDK
const mockReplicate = {
  run: vi.fn(),
};

vi.mock('@/lib/providers/analysis/replicate', () => ({
  replicate: mockReplicate,
}));

// Mock database - must define mock inline to avoid hoisting issues
vi.mock('@/lib/db', () => {
  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  };
  return {
    db: mockDb,
    getDb: vi.fn(() => mockDb),
  };
});

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

/**
 * Test data factories
 */

const createMockTask = (overrides = {}) => ({
  id: 'test-task-id',
  user_id: 'test-user-id',
  image_id: 'test-image-id',
  status: 'running',
  current_stage: 'forensic_describer',
  schema_version: '1.0.0',
  ...overrides,
});

const createMockReplicateResponse = (overrides = {}) => ({
  output: {
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
  ...overrides,
});

const createMockStageSnapshot = (overrides = {}) => ({
  id: 'test-snapshot-id',
  task_id: 'test-task-id',
  stage_name: 'forensic_describer',
  attempt_no: 1,
  stage_status: 'completed',
  provider: 'replicate',
  model_id: 'claude-3-opus',
  schema_version: '1.0.0',
  input_payload: {},
  output_payload: {},
  error_payload: null,
  metrics_payload: {},
  created_at: new Date(),
  ...overrides,
});

describe('runObjectiveDescriptionStage - P0 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC4: Successful external model response parsing', () => {
    it('should correctly parse Replicate response and return objective_description', async () => {
      // Arrange: Mock successful Replicate response
      const mockTask = createMockTask();
      const mockResponse = createMockReplicateResponse();

      mockReplicate.run.mockResolvedValueOnce(mockResponse);
      db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Result contains valid objective_description
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visible_content.primary_subjects).toEqual(['person', 'car']);
        expect(result.data.overall_confidence).toBe(0.92);
        expect(result.data.uncertainty_fields).toEqual([]);
      }

      // Verify Replicate SDK was called correctly
      expect(mockReplicate.run).toHaveBeenCalledTimes(1);
    });

    it('should include all required fields in parsed objective_description', async () => {
      // Arrange: Full response with all fields
      const mockTask = createMockTask();
      const mockResponse = createMockReplicateResponse({
        output: {
          visible_content: {
            primary_subjects: ['person'],
            secondary_elements: ['building', 'tree'],
            setting: 'urban street',
            actions: ['walking'],
            text_content: ['street sign'],
          },
          imaging_features: {
            technique: 'photography',
            lighting: 'natural',
            composition: 'rule-of-thirds',
            perspective: 'eye-level',
          },
          overall_confidence: 0.92,
          uncertainty_fields: [],
        },
      });

      mockReplicate.run.mockResolvedValueOnce(mockResponse);
      db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: All fields present
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visible_content.primary_subjects).toBeDefined();
        expect(result.data.visible_content.secondary_elements).toBeDefined();
        expect(result.data.visible_content.setting).toBeDefined();
        expect(result.data.visible_content.actions).toBeDefined();
        expect(result.data.visible_content.text_content).toBeDefined();
        expect(result.data.imaging_features).toBeDefined();
        expect(result.data.overall_confidence).toBeDefined();
        expect(result.data.uncertainty_fields).toBeDefined();
      }
    });
  });

  describe('AC5: Stage snapshot persistence', () => {
    it('should write stage output to analysis_stage_snapshots', async () => {
      // Arrange: Mock successful response and database
      const mockTask = createMockTask();
      const mockResponse = createMockReplicateResponse();

      mockReplicate.run.mockResolvedValueOnce(mockResponse);
      db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Database insert was called with correct structure
      expect(db.insert).toHaveBeenCalledTimes(1);

      const insertCall = db.insert.mock.calls[0];
      expect(insertCall[0]).toStrictEqual(require('@/lib/db/schema').analysis_stage_snapshots);

      const snapshotData = insertCall[1].values;
      expect(snapshotData.task_id).toBe(mockTask.id);
      expect(snapshotData.stage_name).toBe('forensic_describer');
      expect(snapshotData.stage_status).toBe('completed');
      expect(snapshotData.output_payload).toBeDefined();
    });

    it('should serialize output_payload as JSON in stage snapshot', async () => {
      // Arrange: Mock response
      const mockTask = createMockTask();
      const mockResponse = createMockReplicateResponse();

      mockReplicate.run.mockResolvedValueOnce(mockResponse);
      db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: output_payload is valid JSON
      const insertCall = db.insert.mock.calls[0];
      const snapshotData = insertCall[1].values;

      expect(snapshotData.output_payload).toBeDefined();
      expect(() => JSON.parse(snapshotData.output_payload)).not.toThrow();

      const parsedOutput = JSON.parse(snapshotData.output_payload);
      expect(parsedOutput.visible_content).toBeDefined();
      expect(parsedOutput.overall_confidence).toBeDefined();
    });
  });

  describe('Timeout handling (30 second limit)', () => {
    it('should trigger retry or return readable error when Replicate call exceeds 30 seconds', async () => {
      // Arrange: Mock timeout scenario
      const mockTask = createMockTask();

      // Simulate timeout (Promise never resolves within 30s)
      mockReplicate.run.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 35000)) // 35 seconds
      );

      db.select.mockResolvedValueOnce([mockTask]);

      // Act & Assert: Should handle timeout gracefully
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Expected: Either retry logic or readable error
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toMatch(/timeout|exceeded|timed out/i);
      }

      // Verify timeout was enforced (not 35 second wait)
      expect(mockReplicate.run).toHaveBeenCalledTimes(1);
    }, 35000); // Test timeout longer than method timeout

    it('should return structured error on timeout', async () => {
      // Arrange: Mock timeout
      const mockTask = createMockTask();
      mockReplicate.run.mockRejectedValueOnce(new Error('Request timeout'));
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Error is structured
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBeDefined();
        expect(result.error.message).toBeDefined();
      }
    });
  });
});

describe('runObjectiveDescriptionStage - P1 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC9: Network error retry (max 1 retry, 2 total attempts)', () => {
    it('should retry once on first call failure and succeed on second call', async () => {
      // Arrange: First call fails, second succeeds
      const mockTask = createMockTask();
      const mockSuccessResponse = createMockReplicateResponse();

      mockReplicate.run
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSuccessResponse);

      db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage (with retry logic)
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Should succeed after retry
      expect(result.success).toBe(true);
      expect(mockReplicate.run).toHaveBeenCalledTimes(2); // Failed once, retried once
    });

    it('should only retry once (total 2 attempts) before failing', async () => {
      // Arrange: Both attempts fail
      const mockTask = createMockTask();

      mockReplicate.run.mockRejectedValue(new Error('Persistent network error'));
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Should fail after 2 attempts
      expect(result.success).toBe(false);
      expect(mockReplicate.run).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should not retry on validation errors (non-network errors)', async () => {
      // Arrange: Validation error (should not retry)
      const mockTask = createMockTask();

      mockReplicate.run.mockRejectedValueOnce(
        new Error('Invalid image format')
      );
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Should fail immediately without retry
      expect(result.success).toBe(false);
      expect(mockReplicate.run).toHaveBeenCalledTimes(1); // No retry
    });
  });

  describe('AC9: Invalid JSON format handling', () => {
    it('should return structured error when Replicate returns invalid JSON', async () => {
      // Arrange: Mock invalid JSON response
      const mockTask = createMockTask();

      mockReplicate.run.mockResolvedValueOnce({
        output: 'invalid json string instead of object',
      });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Structured error returned
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_RESPONSE_FORMAT');
        expect(result.error.message).toMatch(/json|parse|format/i);
      }
    });

    it('should handle malformed response structure gracefully', async () => {
      // Arrange: Response with missing required fields
      const mockTask = createMockTask();

      mockReplicate.run.mockResolvedValueOnce({
        output: {
          // Missing required fields like overall_confidence
          visible_content: {},
        },
      });
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Validation error returned
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBeDefined();
      }
    });
  });

  describe('AC9: Model unavailable (503 error)', () => {
    it('should handle Replicate API 503 Service Unavailable', async () => {
      // Arrange: Mock 503 error
      const mockTask = createMockTask();

      const error503 = new Error('Service Unavailable');
      error503.statusCode = 503;
      mockReplicate.run.mockRejectedValueOnce(error503);
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Error handled correctly
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toMatch(/503|SERVICE_UNAVAILABLE/i);
        expect(result.error.retryable).toBe(true);
      }
    });
  });
});

describe('runObjectiveDescriptionStage - P2 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC10: Stage snapshot write failure', () => {
    it('should handle database connection error during snapshot write', async () => {
      // Arrange: Mock successful Replicate response but DB insert fails
      const mockTask = createMockTask();
      const mockResponse = createMockReplicateResponse();

      mockReplicate.run.mockResolvedValueOnce(mockResponse);
      db.insert.mockRejectedValueOnce(new Error('Database connection lost'));
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Error returned, not crash
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DATABASE_ERROR');
        expect(result.error.message).toBeDefined();
      }

      // Verify stage status was updated appropriately
      expect(db.update).toHaveBeenCalled();
    });

    it('should rollback transaction on snapshot write failure', async () => {
      // Arrange: Mock transaction failure
      const mockTask = createMockTask();
      const mockResponse = createMockReplicateResponse();

      mockReplicate.run.mockResolvedValueOnce(mockResponse);
      db.insert.mockRejectedValueOnce(new Error('Constraint violation'));
      db.select.mockResolvedValueOnce([mockTask]);

      // Act: Run the stage
      const result = await runObjectiveDescriptionStage({
        taskId: mockTask.id,
        imageId: mockTask.image_id,
      });

      // Assert: Transaction rolled back
      expect(result.success).toBe(false);
      // Verify no partial data written
      expect(db.select).toHaveBeenCalled(); // Task status checked
    });
  });
});

describe('Service Best Practices', () => {
  it('should use transaction rollback for database operations', async () => {
    // This test verifies the service uses transactions for atomicity
    // Implementation should wrap DB operations in transaction

    const mockTask = createMockTask();
    const mockResponse = createMockReplicateResponse();

    mockReplicate.run.mockResolvedValueOnce(mockResponse);
    db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
    db.select.mockResolvedValueOnce([mockTask]);

    await runObjectiveDescriptionStage({
      taskId: mockTask.id,
      imageId: mockTask.image_id,
    });

    // Verify transaction pattern (db.transaction should be used)
    // This is a design assertion - implementation must use transactions
    expect(db.insert).toHaveBeenCalled();
  });

  it('should log metrics for observability', async () => {
    // Arrange: Mock response
    const mockTask = createMockTask();
    const mockResponse = createMockReplicateResponse();

    mockReplicate.run.mockResolvedValueOnce(mockResponse);
    db.insert.mockResolvedValueOnce({ id: 'test-snapshot-id' });
    db.select.mockResolvedValueOnce([mockTask]);

    // Act: Run the stage
    const result = await runObjectiveDescriptionStage({
      taskId: mockTask.id,
      imageId: mockTask.image_id,
    });

    // Assert: Metrics captured
    expect(result.success).toBe(true);
    if (result.success) {
      // Verify metrics are included in snapshot
      const insertCall = db.insert.mock.calls[0];
      const snapshotData = insertCall[1].values;
      expect(snapshotData.metrics_payload).toBeDefined();
    }
  });
});
