-- Story 4-3: 隐私合规功能
-- Epic 4: 内容安全与合规
--
-- 扩展用户表，添加隐私设置字段

-- ============================================================================
-- 扩展 user 表
-- ============================================================================

-- 添加数据分享设置
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS data_sharing_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 添加 CCPA "Do Not Sell" 选项
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS do_not_sell_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 添加隐私设置更新时间
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS privacy_settings_updated_at TIMESTAMP;

-- ============================================================================
-- 注释
-- ============================================================================

COMMENT ON COLUMN "user".data_sharing_enabled IS '是否允许数据分享用于服务改进 (Story 4-3)';
COMMENT ON COLUMN "user".do_not_sell_enabled IS 'CCPA: "Do Not Sell" 选项 (Story 4-3)';
COMMENT ON COLUMN "user".privacy_settings_updated_at IS '隐私设置最后更新时间 (Story 4-3)';
