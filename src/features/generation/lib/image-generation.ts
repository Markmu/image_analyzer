/**
 * Image Generation API Client
 *
 * Epic 6 - Story 6.1: Image Generation
 *
 * This file now re-exports the client-side API implementation.
 * All server-side logic (Replicate SDK, moderation, database) is handled in:
 *   /api/generate-images/route.ts
 */

// Re-export everything from the client implementation
export * from './image-generation-client';
