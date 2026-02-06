/**
 * @jest-environment node
 */
import { describe, it, expect } from 'vitest';
import {
  ApiResponse,
  ApiErrorCode,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
} from '@/lib/api/types';
import {
  AppError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  isAppError,
  toApiError,
} from '@/lib/api/errors';

describe('API Response Types', () => {
  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const response = createSuccessResponse({ id: '1', name: 'Test' });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '1', name: 'Test' });
      expect(response.error).toBeUndefined();
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.timestamp).toBeDefined();
    });

    it('should include custom metadata', () => {
      const response = createSuccessResponse('data', { requestId: 'req-123' });
      
      expect(response.metadata?.requestId).toBe('req-123');
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response', () => {
      const response = createErrorResponse(
        ApiErrorCode.NOT_FOUND,
        'Resource not found'
      );
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ApiErrorCode.NOT_FOUND);
      expect(response.error?.message).toBe('Resource not found');
    });

    it('should include error details', () => {
      const response = createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid input',
        { field: 'email' }
      );
      
      expect(response.error?.details?.field).toBe('email');
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create a paginated response', () => {
      const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const response = createPaginatedResponse(items, 10, 1, 3);
      
      expect(response.success).toBe(true);
      expect(response.data?.items).toEqual(items);
      expect(response.data?.total).toBe(10);
      expect(response.data?.page).toBe(1);
      expect(response.data?.limit).toBe(3);
      expect(response.data?.totalPages).toBe(4);
      expect(response.data?.hasNext).toBe(true);
      expect(response.data?.hasPrev).toBe(false);
    });

    it('should calculate hasPrev correctly', () => {
      const items = [{ id: '4' }];
      const response = createPaginatedResponse(items, 10, 2, 3);
      
      expect(response.data?.hasPrev).toBe(true);
      expect(response.data?.hasNext).toBe(true);
    });
  });
});

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default status', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should create an AppError with custom status', () => {
      const error = new AppError('Not found', 'NOT_FOUND', 404);
      
      expect(error.statusCode).toBe(404);
    });
  });

  describe('AuthenticationError', () => {
    it('should have 401 status code', () => {
      const error = new AuthenticationError();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe(ApiErrorCode.UNAUTHORIZED);
    });
  });

  describe('ValidationError', () => {
    it('should include field errors', () => {
      const error = new ValidationError('Invalid data', {
        email: ['Invalid format'],
        password: ['Too short'],
      });
      
      expect(error.statusCode).toBe(400);
      expect(error.details?.fieldErrors).toBeDefined();
    });
  });

  describe('NotFoundError', () => {
    it('should include resource id in message', () => {
      const error = new NotFoundError('User', '123');
      
      expect(error.message).toContain('123');
      expect(error.statusCode).toBe(404);
    });
  });
});

describe('Error Utilities', () => {
  describe('isAppError', () => {
    it('should return true for AppError', () => {
      const error = new AppError('test', 'TEST');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('test');
      expect(isAppError(error)).toBe(false);
    });
  });

  describe('toApiError', () => {
    it('should convert AppError to ApiError', () => {
      const error = new NotFoundError('User', '123');
      const apiError = toApiError(error);
      
      expect(apiError.code).toBe(ApiErrorCode.NOT_FOUND);
      expect(apiError.message).toContain('User');
    });

    it('should convert Error to ApiError', () => {
      const error = new Error('Unknown error');
      const apiError = toApiError(error);
      
      expect(apiError.code).toBe('INTERNAL_ERROR');
    });
  });
});
