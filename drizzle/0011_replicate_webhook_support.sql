-- Story: Replicate Webhook 支持
-- Epic: 异步任务处理
--
-- 添加 Replicate 预测表和扩展积分事务表

-- ============================================================================
-- 新建 replicate_predictions 表
-- ============================================================================

CREATE TABLE IF NOT EXISTS "replicate_predictions" (
    "id" SERIAL PRIMARY KEY,
    "prediction_id" VARCHAR(128) NOT NULL UNIQUE,
    "user_id" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "task_type" VARCHAR(32) NOT NULL DEFAULT 'analysis',
    "model_id" VARCHAR(64) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "credit_transaction_id" INTEGER REFERENCES "credit_transactions"("id") ON DELETE SET NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completed_at" TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS "replicate_predictions_user_id_idx" ON "replicate_predictions"("user_id");
CREATE INDEX IF NOT EXISTS "replicate_predictions_status_idx" ON "replicate_predictions"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "replicate_predictions_prediction_id_idx" ON "replicate_predictions"("prediction_id");

-- 注释
COMMENT ON TABLE "replicate_predictions" IS 'Replicate 预测任务表 (Story: Webhook 支持)';
COMMENT ON COLUMN "replicate_predictions"."prediction_id" IS 'Replicate 返回的预测 ID';
COMMENT ON COLUMN "replicate_predictions"."user_id" IS '关联的用户 ID';
COMMENT ON COLUMN "replicate_predictions"."task_type" IS '任务类型: analysis | generation';
COMMENT ON COLUMN "replicate_predictions"."model_id" IS '使用的模型 ID';
COMMENT ON COLUMN "replicate_predictions"."status" IS '任务状态: pending | processing | completed | failed';
COMMENT ON COLUMN "replicate_predictions"."input" IS '预测输入参数';
COMMENT ON COLUMN "replicate_predictions"."output" IS '预测输出结果';
COMMENT ON COLUMN "replicate_predictions"."credit_transaction_id" IS '关联的积分预扣事务 ID';
COMMENT ON COLUMN "replicate_predictions"."error_message" ISCOMMENT ON COLUMN " '错误信息';
replicate_predictions"."created_at" IS '创建时间';
COMMENT ON COLUMN "replicate_predictions"."completed_at" IS '完成时间';

-- ============================================================================
-- 扩展 credit_transactions 表
-- ============================================================================

-- 扩展 type 字段长度支持更多类型
ALTER TABLE "credit_transactions" ALTER COLUMN "type" TYPE VARCHAR(64);

-- 添加 transaction_id 字段用于关联预扣和回补
ALTER TABLE "credit_transactions" ADD COLUMN IF NOT EXISTS "transaction_id" VARCHAR(64);

-- 添加 prediction_id 字段用于关联 Replicate 预测
ALTER TABLE "credit_transactions" ADD COLUMN IF NOT EXISTS "prediction_id" VARCHAR(128);

-- 添加索引
CREATE INDEX IF NOT EXISTS "credit_transactions_transaction_id_idx" ON "credit_transactions"("transaction_id");

-- 注释
COMMENT ON COLUMN "credit_transactions"."transaction_id" IS 'UUID 关联预扣和回补事务 (Story: Webhook 支持)';
COMMENT ON COLUMN "credit_transactions"."prediction_id" IS '关联的 Replicate prediction ID (Story: Webhook 支持)';
