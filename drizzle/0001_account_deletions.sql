CREATE TABLE IF NOT EXISTS "account_deletions" (
  "user_id" text PRIMARY KEY NOT NULL,
  "deleted_at" timestamp DEFAULT now() NOT NULL,
  "ip_address" text,
  "user_agent" text
);
