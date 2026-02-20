/**
 * Image History Client
 *
 * Epic 6 - Story 6-3: Image Save
 * Client functions for fetching and managing image history
 */

import type {
  ImageHistoryRecord,
  ImageHistoryResponse,
  ImageHistoryParams,
} from '../types/history';

const API_BASE = '/api/history/generations';

/**
 * Fetch user's image generation history
 */
export async function fetchImageHistory(
  params: ImageHistoryParams = {}
): Promise<ImageHistoryResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch image history');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch image history');
  }

  return result.data;
}

/**
 * Fetch single image history record
 */
export async function fetchImageHistoryDetail(
  generationId: number
): Promise<ImageHistoryRecord> {
  const response = await fetch(`${API_BASE}/${generationId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch image history detail');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch image history detail');
  }

  return result.data;
}

/**
 * Delete image from history
 */
export async function deleteImageHistory(generationId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${generationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to delete image from history');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete image from history');
  }
}
