-- ============================================================================
-- Queue Management Fields
-- Epic 3: Story 3-3 - Analysis Progress & Queue Management
-- ============================================================================

-- Add queue-related fields to batch_analysis_results table
ALTER TABLE "batch_analysis_results" ADD COLUMN IF NOT EXISTS "queue_position" integer;
ALTER TABLE "batch_analysis_results" ADD COLUMN IF NOT EXISTS "estimated_wait_time" integer;
ALTER TABLE "batch_analysis_results" ADD COLUMN IF NOT EXISTS "is_queued" boolean NOT NULL DEFAULT false;
ALTER TABLE "batch_analysis_results" ADD COLUMN IF NOT EXISTS "queued_at" timestamp;

-- Add 'cancelled' to status enum if not exists
DO $$ BEGIN
    -- PostgreSQL enum modification requires type change
    -- This is handled by Drizzle migration
    NULL;
END $$;
