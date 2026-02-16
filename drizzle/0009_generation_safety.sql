-- Story 4-2: 生成安全功能
-- Epic 4: 内容安全与合规
--
-- 扩展内容审核日志表，添加生成安全相关字段
-- 创建人工审核队列表

-- ============================================================================
-- 扩展 content_moderation_logs 表
-- ============================================================================

-- 添加生成请求 ID 字段
ALTER TABLE content_moderation_logs ADD COLUMN IF NOT EXISTS generation_id INTEGER;

-- 添加风险等级字段
ALTER TABLE content_moderation_logs ADD COLUMN IF NOT EXISTS risk_level VARCHAR(16);

-- 添加是否需要人工审核字段
ALTER TABLE content_moderation_logs ADD COLUMN IF NOT EXISTS requires_manual_review BOOLEAN DEFAULT FALSE;

-- 创建索引
CREATE INDEX IF NOT EXISTS moderation_logs_generation_id_idx ON content_moderation_logs(generation_id);
CREATE INDEX IF NOT EXISTS moderation_logs_risk_level_idx ON content_moderation_logs(risk_level);

-- ============================================================================
-- 创建人工审核队列表
-- ============================================================================

CREATE TABLE IF NOT EXISTS manual_review_queue (
  id SERIAL PRIMARY KEY,
  generation_request_id INTEGER NOT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  risk_level VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  reviewed_by VARCHAR(255),
  review_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS manual_review_status_idx ON manual_review_queue(status);
CREATE INDEX IF NOT EXISTS manual_review_user_id_idx ON manual_review_queue(user_id);
CREATE INDEX IF NOT EXISTS manual_review_created_idx ON manual_review_queue(created_at);

-- ============================================================================
-- 注释
-- ============================================================================

COMMENT ON COLUMN content_moderation_logs.generation_id IS '关联的生成请求 ID (Story 4-2)';
COMMENT ON COLUMN content_moderation_logs.risk_level IS '风险等级: low, medium, high (Story 4-2)';
COMMENT ON COLUMN content_moderation_logs.requires_manual_review IS '是否需要人工审核 (Story 4-2)';

COMMENT ON TABLE manual_review_queue IS '人工审核队列表 (Story 4-2)';
COMMENT ON COLUMN manual_review_queue.generation_request_id IS '生成请求 ID';
COMMENT ON COLUMN manual_review_queue.prompt IS '用户提交的提示词';
COMMENT ON COLUMN manual_review_queue.risk_level IS '风险评估等级: low, medium, high';
COMMENT ON COLUMN manual_review_queue.status IS '审核状态: pending, approved, rejected';
COMMENT ON COLUMN manual_review_queue.reviewed_by IS '审核管理员 ID';
COMMENT ON COLUMN manual_review_queue.review_notes IS '审核备注';
