/**
 * Image History Service
 *
 * Epic 6 - Story 6-3: Image Save
 * Service for saving generated images to user history
 */

import { eq, and, desc, asc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { generations, generationRequests, analysisResults } from '@/lib/db/schema';
import type {
  ImageHistoryRecord,
  ImageHistoryResponse,
  ImageHistoryParams,
  SaveToHistoryResult,
  ImageMetadata,
} from '../types/history';

/**
 * Get user's image generation history
 */
export async function getImageHistory(
  userId: string,
  params: ImageHistoryParams = {}
): Promise<ImageHistoryResponse> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * limit;

  // Get total count
  const [totalCount] = await db
    .select({ count: count() })
    .from(generations)
    .innerJoin(
      generationRequests,
      eq(generations.generationRequestId, generationRequests.id)
    )
    .where(eq(generationRequests.userId, userId));

  // Build order by
  const orderByColumn =
    sortBy === 'createdAt'
      ? generations.createdAt
      : sortBy === 'width'
      ? generations.width
      : generations.height;

  const orderByClause = sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

  // Get records
  const records = await db
    .select({
      id: generations.id,
      imageUrl: generations.imageUrl,
      thumbnailUrl: generations.thumbnailUrl,
      width: generations.width,
      height: generations.height,
      format: generations.format,
      createdAt: generations.createdAt,
      generationRequest: {
        id: generationRequests.id,
        prompt: generationRequests.prompt,
        provider: generationRequests.provider,
        model: generationRequests.model,
      },
    })
    .from(generations)
    .innerJoin(
      generationRequests,
      eq(generations.generationRequestId, generationRequests.id)
    )
    .where(eq(generationRequests.userId, userId))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  return {
    records,
    total: totalCount.count,
    page,
    limit,
  };
}

/**
 * Get single image history record by ID
 */
export async function getImageHistoryDetail(
  userId: string,
  generationId: number
): Promise<ImageHistoryRecord> {
  const [record] = await db
    .select({
      id: generations.id,
      imageUrl: generations.imageUrl,
      thumbnailUrl: generations.thumbnailUrl,
      width: generations.width,
      height: generations.height,
      format: generations.format,
      createdAt: generations.createdAt,
      generationRequest: {
        id: generationRequests.id,
        prompt: generationRequests.prompt,
        provider: generationRequests.provider,
        model: generationRequests.model,
      },
    })
    .from(generations)
    .innerJoin(
      generationRequests,
      eq(generations.generationRequestId, generationRequests.id)
    )
    .where(
      and(
        eq(generations.id, generationId),
        eq(generationRequests.userId, userId)
      )
    )
    .limit(1);

  if (!record) {
    throw new Error('Image history record not found');
  }

  return record;
}

/**
 * Verify user owns the generation record
 */
export async function verifyGenerationOwnership(
  userId: string,
  generationId: number
): Promise<boolean> {
  try {
    const record = await getImageHistoryDetail(userId, generationId);
    return !!record;
  } catch {
    return false;
  }
}

/**
 * Delete image from history
 */
export async function deleteImageFromHistory(
  userId: string,
  generationId: number
): Promise<void> {
  // Verify ownership first
  await getImageHistoryDetail(userId, generationId);

  // Delete the generation record
  await db
    .delete(generations)
    .where(eq(generations.id, generationId));
}
