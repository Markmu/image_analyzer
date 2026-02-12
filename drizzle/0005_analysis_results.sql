-- ============================================================================
-- Analysis Results Table
-- Epic 3: Story 3-1 - Style Analysis
-- ============================================================================

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS "analysis_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"image_id" varchar(64) NOT NULL,
	"analysis_data" jsonb NOT NULL,
	"confidence_score" real NOT NULL,
	"feedback" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "analysis_results_user_id_idx" ON "analysis_results" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analysis_results_image_id_idx" ON "analysis_results" ("image_id");
--> statement-breakpoint
-- Add foreign key constraints
DO $$ BEGIN
	ALTER TABLE "analysis_results"
		ADD CONSTRAINT "analysis_results_user_id_user_id_fk"
		FOREIGN KEY ("user_id")
		REFERENCES "user"("id")
		ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "analysis_results"
		ADD CONSTRAINT "analysis_results_image_id_images_id_fk"
		FOREIGN KEY ("image_id")
		REFERENCES "images"("id")
		ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
