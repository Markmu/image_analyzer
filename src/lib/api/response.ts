/**
 * Unified API Response Format
 *
 * All API endpoints should return responses in this consistent format.
 */

/**
 * Success response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

/**
 * Pagination metadata
 */
export interface ResponseMeta {
  /** Request ID for tracing */
  requestId: string;
  /** Response timestamp */
  timestamp: string;
  /** Pagination info (if applicable) */
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Create a success response
 * @param data - Response data
 * @param meta - Optional metadata
 * @returns Standardized success response
 */
export function successResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId: meta?.requestId || generateRequestId(),
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create a paginated success response
 * @param items - Array of items
 * @param pagination - Pagination parameters
 * @returns Paginated success response
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): ApiResponse<T[]> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return {
    success: true,
    data: items,
    meta: {
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasMore: pagination.page < totalPages,
      },
    },
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Response helper for empty responses
 */
export function emptyResponse(): ApiResponse<null> {
  return {
    success: true,
    data: null,
    meta: {
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  };
}
