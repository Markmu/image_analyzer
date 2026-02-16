-- Replicate Webhook Support Migration
-- Generated: 2026-02-16

-- 1. Extend creditTransactions table with new fields
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS prediction_id VARCHAR(128);

ALTER TABLE credit_transactions
ALTER COLUMN type TYPE VARCHAR(64);

CREATE INDEX IF NOT EXISTS credit_transactions_transaction_id_idx
ON credit_transactions(transaction_id);

-- 2. Create replicate_predictions table
CREATE TABLE IF NOT EXISTS replicate_predictions (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(128) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    task_type VARCHAR(32) NOT NULL,
    model_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    input JSONB NOT NULL,
    output JSONB,
    credit_transaction_id INTEGER REFERENCES credit_transactions(id) ON DELETE SET NULL,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS replicate_predictions_user_id_idx
ON replicate_predictions(user_id);

CREATE INDEX IF NOT EXISTS replicate_predictions_status_idx
ON replicate_predictions(status);

CREATE UNIQUE INDEX IF NOT EXISTS replicate_predictions_prediction_id_idx
ON replicate_predictions(prediction_id);
