-- Story: 永久模版库与生成记录
-- Epic: Epic 7 - Story 7-2 模版库管理
--
-- 添加生成记录表和模版库相关表

-- ============================================================================
-- 新建 generation_requests 表 (Epic 6: Story 6-1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "generation_requests" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "analysis_result_id" INTEGER NOT NULL REFERENCES "analysis_results"("id") ON DELETE CASCADE,
    "prompt" TEXT NOT NULL,
    "negative_prompt" TEXT,
    "provider" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "format" VARCHAR(10) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "prediction_id" VARCHAR(128),
    "credit_cost" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completed_at" TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS "generation_requests_user_id_idx" ON "generation_requests"("user_id");
CREATE INDEX IF NOT EXISTS "generation_requests_analysis_result_id_idx" ON "generation_requests"("analysis_result_id");
CREATE INDEX IF NOT EXISTS "generation_requests_status_idx" ON "generation_requests"("status");
CREATE INDEX IF NOT EXISTS "generation_requests_prediction_id_idx" ON "generation_requests"("prediction_id");
CREATE INDEX IF NOT EXISTS "generation_requests_created_at_idx" ON "generation_requests"("created_at");

-- 注释
COMMENT ON TABLE "generation_requests" IS '图片生成请求表 (Epic 6: Story 6-1)';
COMMENT ON COLUMN "generation_requests"."user_id" IS '用户 ID';
COMMENT ON COLUMN "generation_requests"."analysis_result_id" IS '关联的分析结果 ID';
COMMENT ON COLUMN "generation_requests"."prompt" IS '生成提示词';
COMMENT ON COLUMN "generation_requests"."negative_prompt" IS '负面提示词';
COMMENT ON COLUMN "generation_requests"."provider" IS '生成服务提供商';
COMMENT ON COLUMN "generation_requests"."model" IS '使用的模型';
COMMENT ON COLUMN "generation_requests"."width" IS '生成图片宽度';
COMMENT ON COLUMN "generation_requests"."height" IS '生成图片高度';
COMMENT ON COLUMN "generation_requests"."quantity" IS '生成数量';
COMMENT ON COLUMN "generation_requests"."format" IS '图片格式';
COMMENT ON COLUMN "generation_requests"."status" IS '状态: pending | processing | completed | failed';
COMMENT ON COLUMN "generation_requests"."prediction_id" IS 'Replicate prediction ID';
COMMENT ON COLUMN "generation_requests"."credit_cost" IS '消耗的积分';
COMMENT ON COLUMN "generation_requests"."created_at" IS '创建时间';
COMMENT ON COLUMN "generation_requests"."completed_at" IS '完成时间';

-- ============================================================================
-- 新建 generations 表 (Epic 6: Story 6-1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "generations" (
    "id" SERIAL PRIMARY KEY,
    "generation_request_id" INTEGER NOT NULL REFERENCES "generation_requests"("id") ON DELETE CASCADE,
    "image_url" VARCHAR(2048) NOT NULL,
    "thumbnail_url" VARCHAR(2048),
    "r2_path" VARCHAR(1024),
    "file_size" INTEGER,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "format" VARCHAR(10) NOT NULL,
    "safety_check_passed" BOOLEAN NOT NULL DEFAULT TRUE,
    "safety_score" REAL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS "generations_generation_request_id_idx" ON "generations"("generation_request_id");
CREATE INDEX IF NOT EXISTS "generations_created_at_idx" ON "generations"("created_at");

-- 注释
COMMENT ON TABLE "generations" IS '生成图片表 (Epic 6: Story 6-1)';
COMMENT ON COLUMN "generations"."generation_request_id" IS '关联的生成请求 ID';
COMMENT ON COLUMN "generations"."image_url" IS '图片 URL';
COMMENT ON COLUMN "generations"."thumbnail_url" IS '缩略图 URL';
COMMENT ON COLUMN "generations"."r2_path" IS 'R2 存储路径';
COMMENT ON COLUMN "generations"."file_size" IS '文件大小(字节)';
COMMENT ON COLUMN "generations"."width" IS '图片宽度';
COMMENT ON COLUMN "generations"."height" IS '图片高度';
COMMENT ON COLUMN "generations"."format" IS '图片格式';
COMMENT ON COLUMN "generations"."safety_check_passed" IS '是否通过安全检查';
COMMENT ON COLUMN "generations"."safety_score" IS '安全检查分数';
COMMENT ON COLUMN "generations"."created_at" IS '创建时间';

-- ============================================================================
-- 新建 templates 表 (Epic 7: Story 7-2 永久模版库)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "templates" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "analysis_result_id" INTEGER NOT NULL REFERENCES "analysis_results"("id") ON DELETE CASCADE,
    "title" VARCHAR(200),
    "description" TEXT,
    "template_snapshot" JSONB NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT FALSE,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS "templates_user_id_idx" ON "templates"("user_id");
CREATE INDEX IF NOT EXISTS "templates_analysis_result_id_idx" ON "templates"("analysis_result_id");
CREATE INDEX IF NOT EXISTS "templates_is_favorite_idx" ON "templates"("is_favorite");
CREATE INDEX IF NOT EXISTS "templates_usage_count_idx" ON "templates"("usage_count");
CREATE INDEX IF NOT EXISTS "templates_created_at_idx" ON "templates"("created_at");

-- 注释
COMMENT ON TABLE "templates" IS '永久模版库表 (Epic 7: Story 7-2)';
COMMENT ON COLUMN "templates"."user_id" IS '用户 ID';
COMMENT ON COLUMN "templates"."analysis_result_id" IS '关联的分析结果 ID';
COMMENT ON COLUMN "templates"."title" IS '用户自定义标题';
COMMENT ON COLUMN "templates"."description" IS '用户自定义描述';
COMMENT ON COLUMN "templates"."template_snapshot" IS '模版内容快照';
COMMENT ON COLUMN "templates"."is_favorite" IS '是否收藏';
COMMENT ON COLUMN "templates"."usage_count" IS '使用次数';
COMMENT ON COLUMN "templates"."created_at" IS '创建时间';
COMMENT ON COLUMN "templates"."updated_at" IS '更新时间';

-- ============================================================================
-- 新建 template_tags 表 (Epic 7: Story 7-2 标签管理)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "template_tags" (
    "id" SERIAL PRIMARY KEY,
    "template_id" INTEGER NOT NULL REFERENCES "templates"("id") ON DELETE CASCADE,
    "tag" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS "template_tags_template_id_idx" ON "template_tags"("template_id");
CREATE INDEX IF NOT EXISTS "template_tags_tag_idx" ON "template_tags"("tag");

-- 注释
COMMENT ON TABLE "template_tags" IS '模版标签表 (Epic 7: Story 7-2)';
COMMENT ON COLUMN "template_tags"."template_id" IS '关联的模版 ID';
COMMENT ON COLUMN "template_tags"."tag" IS '标签内容(最多 20 字符)';
COMMENT ON COLUMN "template_tags"."created_at" IS '创建时间';

-- ============================================================================
-- 新建 template_categories 表 (Epic 7: Story 7-2 分类管理)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "template_categories" (
    "id" SERIAL PRIMARY KEY,
    "template_id" INTEGER NOT NULL REFERENCES "templates"("id") ON DELETE CASCADE,
    "parent_category" VARCHAR(50),
    "child_category" VARCHAR(50),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS "template_categories_template_id_idx" ON "template_categories"("template_id");
CREATE INDEX IF NOT EXISTS "template_categories_parent_category_idx" ON "template_categories"("parent_category");

-- 注释
COMMENT ON TABLE "template_categories" IS '模版分类表 (Epic 7: Story 7-2)';
COMMENT ON COLUMN "template_categories"."template_id" IS '关联的模版 ID';
COMMENT ON COLUMN "template_categories"."parent_category" IS '父分类';
COMMENT ON COLUMN "template_categories"."child_category" IS '子分类';
COMMENT ON COLUMN "template_categories"."created_at" IS '创建时间';

-- ============================================================================
-- 新建 template_generations 表 (Epic 7: Story 7-2 使用统计)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "template_generations" (
    "id" SERIAL PRIMARY KEY,
    "template_id" INTEGER NOT NULL REFERENCES "templates"("id") ON DELETE CASCADE,
    "generation_id" INTEGER NOT NULL REFERENCES "generations"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS "template_generations_template_id_idx" ON "template_generations"("template_id");
CREATE INDEX IF NOT EXISTS "template_generations_generation_id_idx" ON "template_generations"("generation_id");

-- 注释
COMMENT ON TABLE "template_generations" IS '模版生成关联表 (Epic 7: Story 7-2)';
COMMENT ON COLUMN "template_generations"."template_id" IS '关联的模版 ID';
COMMENT ON COLUMN "template_generations"."generation_id" IS '关联的生成图片 ID';
COMMENT ON COLUMN "template_generations"."created_at" IS '创建时间';
