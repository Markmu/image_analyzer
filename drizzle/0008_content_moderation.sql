-- Story 4-1: 内容审核功能
-- 添加用户条款同意字段
ALTER TABLE "user" ADD COLUMN agreed_to_terms_at TIMESTAMP;
ALTER TABLE "user" ADD COLUMN terms_version VARCHAR(32);

-- 添加图片数据保留字段
ALTER TABLE images ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE images ADD COLUMN deletion_notified_at TIMESTAMP;

-- 创建审核日志表
CREATE TABLE content_moderation_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  image_id VARCHAR(64) REFERENCES images(id) ON DELETE SET NULL,
  content_type VARCHAR(32) NOT NULL,
  moderation_result JSONB NOT NULL,
  action VARCHAR(32) NOT NULL,
  reason TEXT,
  batch_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX moderation_logs_user_id_idx ON content_moderation_logs(user_id);
CREATE INDEX moderation_logs_image_id_idx ON content_moderation_logs(image_id);
CREATE INDEX moderation_logs_created_idx ON content_moderation_logs(created_at);
CREATE INDEX images_expires_idx ON images(expires_at);
