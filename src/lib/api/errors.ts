/**
 * Unified Error Handling
 * Consistent error patterns across all services
 */

import { ApiErrorCode, type ApiError } from './types';

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ApiErrorCode.UNAUTHORIZED, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, ApiErrorCode.FORBIDDEN, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message, ApiErrorCode.VALIDATION_ERROR, 400, { fieldErrors });
    this.name = 'ValidationError';
  }
}

/**
 * Resource errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, ApiErrorCode.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ApiErrorCode.CONFLICT, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Business logic errors
 */
export class QuotaExceededError extends AppError {
  constructor(message: string = 'Quota exceeded') {
    super(message, ApiErrorCode.QUOTA_EXCEEDED, 429);
    this.name = 'QuotaExceededError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, ApiErrorCode.RATE_LIMITED, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Server errors
 */
export class InternalError extends AppError {
  constructor(message: string = 'An internal error occurred') {
    super(message, ApiErrorCode.INTERNAL_ERROR, 500);
    this.name = 'InternalError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, ApiErrorCode.SERVICE_UNAVAILABLE, 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Error handler utilities
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  if (error instanceof Error) {
    return 'INTERNAL_ERROR';
  }
  return 'UNKNOWN_ERROR';
}

export function getErrorStatus(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  if (error instanceof Error) {
    return 500;
  }
  return 500;
}

export function toApiError(error: unknown): ApiError {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
  };
}

/**
 * Async error wrapper
 */
export async function catchAsync<T>(
  fn: () => Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await fn();
    return [data, null] as [T, null];
  } catch (error) {
    return [null, error as Error] as [null, Error];
  }
}
