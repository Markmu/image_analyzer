-- Story 3-5: Confidence Scoring
-- Add confidence fields and logs table

-- Add confidence fields to analysis_results table
ALTER TABLE "analysis_results" ADD COLUMN "confidence_scores" JSONB;
ALTER TABLE "analysis_results" ADD COLUMN "retry_count" INTEGER DEFAULT 0;

-- Create confidence_logs table
CREATE TABLE "confidence_logs" (
  "id" SERIAL PRIMARY KEY,
  "analysis_id" INTEGER REFERENCES "analysis_results"("id") ON DELETE SET NULL,
  "model_usage_stat_id" INTEGER REFERENCES "model_usage_stats"("id") ON DELETE SET NULL,
  "confidence_scores" JSONB NOT NULL,
  "is_low_confidence" BOOLEAN NOT NULL,
  "triggered_warning" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for confidence_logs
CREATE INDEX "confidence_logs_created_idx" ON "confidence_logs"("created_at");
CREATE INDEX "confidence_logs_low_confidence_idx" ON "confidence_logs"("is_low_confidence");
CREATE INDEX "confidence_logs_model_idx" ON "confidence_logs"("model_usage_stat_id");
