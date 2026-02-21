import { pgTable, text, varchar, integer, timestamp, uniqueIndex, index, uuid, serial, real, jsonb, boolean } from 'drizzle-orm/pg-core';

/**
 * NextAuth 认证表
 *
 * Epic 1 - Story 1.1: OAuth 基础设置
 * Drizzle Adapter 需要的标准 NextAuth 表结构
 * 注意：表名必须使用 NextAuth 约定的单数形式
 */

// ============================================================================
// 用户表 (user) - 注意：NextAuth 要求单数形式
// ============================================================================
export const user = pgTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),

  // 用户基本信息（从 Google OAuth 获取）
  email: varchar('email', { length: 320 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: varchar('image', { length: 2048 }), // Profile picture URL

  // 邮箱验证字段（NextAuth 标准字段）
  emailVerified: timestamp('emailVerified'),

  // Credit 和订阅信息（后续故事使用）
  creditBalance: integer('credit_balance').notNull().default(0),
  subscriptionTier: varchar('subscription_tier', { length: 32 }).notNull().default('free'),

  // === Story 4-1: 服务条款同意字段 ===
  agreedToTermsAt: timestamp('agreed_to_terms_at'), // 用户同意条款的时间
  termsVersion: varchar('terms_version', { length: 32 }), // 同意的条款版本

  // === Story 4-3: 隐私合规字段 ===
  dataSharingEnabled: boolean('data_sharing_enabled').notNull().default(true), // 是否允许数据分享用于服务改进
  doNotSellEnabled: boolean('do_not_sell_enabled').notNull().default(false), // CCPA: "Do Not Sell" 选项
  privacySettingsUpdatedAt: timestamp('privacy_settings_updated_at'), // 隐私设置最后更新时间

  // 时间戳
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('user_email_unique').on(table.email),
}));

// ============================================================================
// OAuth 账户表 (account) - 注意：NextAuth 要求单数形式
// ============================================================================
export const account = pgTable('account', {
  userId: varchar('userId', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull(), // "oauth" | "email" | "credentials"
  provider: varchar('provider', { length: 64 }).notNull(), // "google" | "github" etc.
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 64 }),
  scope: varchar('scope', { length: 1024 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => ({
  providerIdx: uniqueIndex('account_provider_providerAccountId_key').on(table.provider, table.providerAccountId),
}));

// ============================================================================
// 会话表 (session) - 注意：NextAuth 要求单数形式
// ============================================================================
export const session = pgTable('session', {
  sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// ============================================================================
// 验证令牌表 (verificationToken) - 注意：NextAuth 要求单数形式
// ============================================================================
export const verificationToken = pgTable('verificationToken', {
  identifier: varchar('identifier', { length: 320 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('verificationToken_token_key').on(table.token),
  identifierIdx: uniqueIndex('verificationToken_identifier_token_key').on(table.identifier, table.token),
}));

// ============================================================================
// 向后兼容的导出（保持与旧代码的兼容性）
// ============================================================================
export const users = user;
export const accounts = account;
export const sessions = session;
export const verificationTokens = verificationToken;

// ============================================================================
// 账户删除审计表 (account_deletions)
// ============================================================================
export const accountDeletions = pgTable('account_deletions', {
  userId: varchar('user_id', { length: 255 }).primaryKey(),
  deletedAt: timestamp('deleted_at').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 1024 }),
});

// ============================================================================
// 图片表 (images) - Epic 2: 图片上传与管理
// ============================================================================
export const images = pgTable('images', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  filePath: varchar('file_path', { length: 1024 }).notNull(), // R2 存储路径
  fileSize: integer('file_size').notNull(), // 文件大小(字节)
  fileFormat: varchar('file_format', { length: 32 }).notNull(), // JPEG, PNG, WebP
  width: integer('width'), // 图片宽度
  height: integer('height'), // 图片高度
  uploadStatus: varchar('upload_status', { length: 32 }).notNull(), // pending, completed, failed
  // Batch upload fields (Story 2-2)
  batchId: uuid('batch_id'), // 批次 ID，关联同批次上传的图片
  uploadOrder: integer('upload_order'), // 上传顺序
  // === Story 4-1: 数据保留字段 ===
  expiresAt: timestamp('expires_at'), // 图片过期时间
  deletionNotifiedAt: timestamp('deletion_notified_at'), // 删除通知发送时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('images_user_id_idx').on(table.userId),
  batchIdIdx: index('images_batch_id_idx').on(table.batchId),
  expiresIdx: index('images_expires_idx').on(table.expiresAt),
}));

// ============================================================================
// 分析结果表 (analysis_results) - Epic 3: Story 3-1 风格分析
// ============================================================================
export const analysisResults = pgTable('analysis_results', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  imageId: varchar('image_id', { length: 64 }).notNull().references(() => images.id, { onDelete: 'cascade' }),
  analysisData: jsonb('analysis_data').notNull(),
  confidenceScore: real('confidence_score').notNull(),
  feedback: varchar('feedback', { length: 32 }),
  // === 模型相关字段 (Story 3-4) ===
  modelId: varchar('model_id', { length: 50 }), // 使用的模型 ID
  // === 置信度相关字段 (Story 3-5) ===
  confidenceScores: jsonb('confidence_scores'), // ConfidenceScores
  retryCount: integer('retry_count').default(0), // 重试次数
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('analysis_results_user_id_idx').on(table.userId),
  imageIdIdx: index('analysis_results_image_id_idx').on(table.imageId),
}));

// ============================================================================
// 风格分析类型定义
// ============================================================================

/**
 * 单个风格特征
 */
export interface StyleFeature {
  name: string;
  value: string;
  confidence: number;
}

/**
 * 风格维度（光影、构图、色彩、艺术风格）
 */
export interface StyleDimension {
  name: string;
  features: StyleFeature[];
  confidence: number;
}

/**
 * 完整的分析数据
 */
export interface AnalysisData {
  dimensions: {
    lighting: StyleDimension;
    composition: StyleDimension;
    color: StyleDimension;
    artisticStyle: StyleDimension;
  };
  overallConfidence: number;
  modelUsed: string;
  analysisDuration: number;
}

// ============================================================================
// 批量分析结果表 (batch_analysis_results) - Epic 3: Story 3-2 批量分析
// ============================================================================
export const batchAnalysisResults = pgTable('batch_analysis_results', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  mode: varchar('mode', { length: 32 }).notNull(), // 'serial' | 'parallel' | 'single'
  totalImages: integer('total_images').notNull(),
  completedImages: integer('completed_images').notNull().default(0),
  failedImages: integer('failed_images').notNull().default(0),
  skippedImages: integer('skipped_images').notNull().default(0),
  status: varchar('status', { length: 32 }).notNull(), // 'pending' | 'processing' | 'completed' | 'partial' | 'failed'
  creditUsed: integer('credit_used').notNull().default(0),

  // === 队列相关字段 (Story 3-3) ===
  queuePosition: integer('queue_position'), // 队列位置
  estimatedWaitTime: integer('estimated_wait_time'), // 预计等待秒数
  isQueued: boolean('is_queued').notNull().default(false), // 是否在队列中
  queuedAt: timestamp('queued_at'), // 入队时间

  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('batch_results_user_id_idx').on(table.userId),
  statusIdx: index('batch_results_status_idx').on(table.status),
}));

// ============================================================================
// 批量分析图片关联表 (batch_analysis_images)
// ============================================================================
export const batchAnalysisImages = pgTable('batch_analysis_images', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').notNull().references(() => batchAnalysisResults.id, { onDelete: 'cascade' }),
  imageId: varchar('image_id', { length: 64 }).notNull().references(() => images.id, { onDelete: 'cascade' }),
  imageOrder: integer('image_order').notNull(),
  status: varchar('status', { length: 32 }).notNull(), // 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'
  errorMessage: text('error_message'),
  analysisResultId: integer('analysis_result_id').references(() => analysisResults.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  batchIdIdx: index('batch_images_batch_id_idx').on(table.batchId),
  imageIdIdx: index('batch_images_image_id_idx').on(table.imageId),
}));

// ============================================================================
// 内容审核日志表 (content_moderation_logs) - Epic 4: Story 4-1 内容审核
// ============================================================================
export const contentModerationLogs = pgTable('content_moderation_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  imageId: varchar('image_id', { length: 64 }).references(() => images.id, { onDelete: 'set null' }),
  contentType: varchar('content_type', { length: 32 }).notNull(), // 'image' | 'text'
  moderationResult: jsonb('moderation_result').notNull().$type<ModerationResult>(), // 详细审核结果
  action: varchar('action', { length: 32 }).notNull(), // 'approved' | 'rejected' | 'flagged'
  reason: text('reason'), // 拒绝或标记的原因
  batchId: integer('batch_id'), // 可选，关联批量分析
  // Story 4-2: 生成安全功能新增字段
  generationId: integer('generation_id'), // 可选，关联生成请求
  riskLevel: varchar('risk_level', { length: 16 }), // 'low' | 'medium' | 'high'
  requiresManualReview: boolean('requires_manual_review').default(false), // 是否需要人工审核
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('moderation_logs_user_id_idx').on(table.userId),
  imageIdIdx: index('moderation_logs_image_id_idx').on(table.imageId),
  generationIdIdx: index('moderation_logs_generation_id_idx').on(table.generationId),
  riskLevelIdx: index('moderation_logs_risk_level_idx').on(table.riskLevel),
  createdIdx: index('moderation_logs_created_idx').on(table.createdAt),
}));

// ============================================================================
// 审核结果类型定义 (ModerationResult) - Epic 4: Story 4-1
// ============================================================================

/**
 * 内容审核结果
 */
export interface ModerationResult {
  isApproved: boolean;
  confidence: number; // 0-1
  categories: {
    violence: number; // 0-1
    sexual: number; // 0-1
    hate: number; // 0-1
    harassment: number; // 0-1
    selfHarm: number; // 0-1
  };
  action: 'approved' | 'rejected' | 'flagged';
  reason?: string;
}

// ============================================================================
// 人工审核队列表 (manual_review_queue) - Epic 4: Story 4-2 生成安全
// ============================================================================

export const manualReviewQueue = pgTable('manual_review_queue', {
  id: serial('id').primaryKey(),
  generationRequestId: integer('generation_request_id').notNull(), // 关联生成请求
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(), // 用户提交的提示词
  riskLevel: varchar('risk_level', { length: 16 }).notNull(), // 'low' | 'medium' | 'high'
  status: varchar('status', { length: 32 }).notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  reviewedBy: varchar('reviewed_by', { length: 255 }), // 审核管理员 ID
  reviewNotes: text('review_notes'), // 审核备注
  createdAt: timestamp('created_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
}, (table) => ({
  statusIdx: index('manual_review_status_idx').on(table.status),
  userIdIdx: index('manual_review_user_id_idx').on(table.userId),
  createdIdx: index('manual_review_created_idx').on(table.createdAt),
}));

// ============================================================================
// Credit 交易历史表 (credit_transactions)
// ============================================================================
export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 64 }).notNull(), // 'deduct' | 'refund' | 'purchase' | 'bonus' | 'analysis_prehold' | 'analysis_complete' | 'topup' | 'subscription' | 'gift' | 'admin_adjustment'
  amount: integer('amount').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  batchId: integer('batch_id'), // 可选，关联批量分析
  // Webhook 相关字段
  transactionId: varchar('transaction_id', { length: 64 }), // UUID 关联预扣和回补
  predictionId: varchar('prediction_id', { length: 128 }), // 关联 Replicate prediction
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('credit_transactions_user_id_idx').on(table.userId),
  batchIdIdx: index('credit_transactions_batch_id_idx').on(table.batchId),
  transactionIdIdx: index('credit_transactions_transaction_id_idx').on(table.transactionId),
}));

// ============================================================================
// 模型配置表 (model_config) - Epic 3: Story 3-4 视觉模型集成
// ============================================================================
export const modelConfig = pgTable('model_config', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  requiresTier: varchar('requires_tier', { length: 20 }), // free | lite | standard
  costPerCall: real('cost_per_call'),
  avgDuration: real('avg_duration'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// ============================================================================
// 模型使用统计表 (model_usage_stats) - Epic 3: Story 3-4 视觉模型集成
// ============================================================================
export const modelUsageStats = pgTable('model_usage_stats', {
  id: serial('id').primaryKey(),
  modelId: varchar('model_id', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  totalDuration: real('total_duration').notNull().default(0),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  modelIdIdx: index('model_usage_stats_model_id_idx').on(table.modelId),
  userIdIdx: index('model_usage_stats_user_id_idx').on(table.userId),
}));

// ============================================================================
// 用户模型偏好表 (user_model_preferences) - Epic 3: Story 3-4 视觉模型集成
// ============================================================================
export const userModelPreferences = pgTable('user_model_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  preferredModelId: varchar('preferred_model_id', { length: 50 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// 置信度日志表 (confidence_logs) - Epic 3: Story 3-5 置信度评分
// ============================================================================
export const confidenceLogs = pgTable('confidence_logs', {
  id: serial('id').primaryKey(),
  analysisId: integer('analysis_id').references(() => analysisResults.id, { onDelete: 'set null' }),
  modelUsageStatId: integer('model_usage_stat_id').references(() => modelUsageStats.id, { onDelete: 'set null' }),
  confidenceScores: jsonb('confidence_scores').notNull(),
  isLowConfidence: boolean('is_low_confidence').notNull(),
  triggeredWarning: boolean('triggered_warning').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  createdIdx: index('confidence_logs_created_idx').on(table.createdAt),
  lowConfidenceIdx: index('confidence_logs_low_confidence_idx').on(table.isLowConfidence),
  modelIdx: index('confidence_logs_model_idx').on(table.modelUsageStatId),
}));

// ============================================================================
// Replicate 预测表 (replicate_predictions) - Webhook 支持
// ============================================================================
export const replicatePredictions = pgTable('replicate_predictions', {
  id: serial('id').primaryKey(),
  predictionId: varchar('prediction_id', { length: 128 }).notNull().unique(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  taskType: varchar('task_type', { length: 32 }).notNull(), // 'analysis' | 'generation'
  modelId: varchar('model_id', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('pending'), // 'pending' | 'processing' | 'completed' | 'failed'
  input: jsonb('input').notNull(),
  output: jsonb('output'),
  creditTransactionId: integer('credit_transaction_id').references(() => creditTransactions.id, { onDelete: 'set null' }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('replicate_predictions_user_id_idx').on(table.userId),
  statusIdx: index('replicate_predictions_status_idx').on(table.status),
  predictionIdIdx: uniqueIndex('replicate_predictions_prediction_id_idx').on(table.predictionId),
}));

// ============================================================================
// 图片生成请求表 (generation_requests) - Epic 6: Story 6-1 图片生成
// ============================================================================
export const generationRequests = pgTable('generation_requests', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  analysisResultId: integer('analysis_result_id').notNull().references(() => analysisResults.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  quantity: integer('quantity').notNull().default(1),
  format: varchar('format', { length: 10 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('pending'),
  errorMessage: text('error_message'),
  predictionId: varchar('prediction_id', { length: 128 }),
  creditCost: integer('credit_cost').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('generation_requests_user_id_idx').on(table.userId),
  analysisResultIdIdx: index('generation_requests_analysis_result_id_idx').on(table.analysisResultId),
  statusIdx: index('generation_requests_status_idx').on(table.status),
  predictionIdIdx: index('generation_requests_prediction_id_idx').on(table.predictionId),
  createdAtIdx: index('generation_requests_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// 生成图片表 (generations) - Epic 6: Story 6-1 图片生成
// ============================================================================
export const generations = pgTable('generations', {
  id: serial('id').primaryKey(),
  generationRequestId: integer('generation_request_id').notNull().references(() => generationRequests.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url', { length: 2048 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 2048 }),
  r2Path: varchar('r2_path', { length: 1024 }),
  fileSize: integer('file_size'),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  format: varchar('format', { length: 10 }).notNull(),
  safetyCheckPassed: boolean('safety_check_passed').notNull().default(true),
  safetyScore: real('safety_score'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  generationRequestIdIdx: index('generations_generation_request_id_idx').on(table.generationRequestId),
  createdAtIdx: index('generations_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// 模版库表 (templates) - Epic 7: Story 7-2 永久模版库
// ============================================================================
export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  analysisResultId: integer('analysis_result_id').notNull().references(() => analysisResults.id, { onDelete: 'cascade' }),

  // 模版基本信息
  title: varchar('title', { length: 200 }),
  description: text('description'),

  // 模版内容(快照,避免原始分析结果被删除)
  templateSnapshot: jsonb('template_snapshot').notNull(),

  // 收藏和组织
  isFavorite: boolean('is_favorite').notNull().default(false),

  // 使用统计(冗余字段,优化查询性能)
  usageCount: integer('usage_count').notNull().default(0),

  // 时间戳
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('templates_user_id_idx').on(table.userId),
  analysisResultIdIdx: index('templates_analysis_result_id_idx').on(table.analysisResultId),
  isFavoriteIdx: index('templates_is_favorite_idx').on(table.isFavorite),
  usageCountIdx: index('templates_usage_count_idx').on(table.usageCount),
  createdAtIdx: index('templates_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// 模版标签表 (template_tags) - Epic 7: Story 7-2 标签管理
// ============================================================================
export const templateTags = pgTable('template_tags', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  templateIdIdx: index('template_tags_template_id_idx').on(table.templateId),
  tagIdx: index('template_tags_tag_idx').on(table.tag),
}));

// ============================================================================
// 模版分类表 (template_categories) - Epic 7: Story 7-2 分类管理
// ============================================================================
export const templateCategories = pgTable('template_categories', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  parentCategory: varchar('parent_category', { length: 50 }),
  childCategory: varchar('child_category', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  templateIdIdx: index('template_categories_template_id_idx').on(table.templateId),
  parentCategoryIdx: index('template_categories_parent_category_idx').on(table.parentCategory),
}));

// ============================================================================
// 模版生成关联表 (template_generations) - Epic 7: Story 7-2 使用统计(FR69, FR70)
// ============================================================================
export const templateGenerations = pgTable('template_generations', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  generationId: integer('generation_id').notNull().references(() => generations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  templateIdIdx: index('template_generations_template_id_idx').on(table.templateId),
  generationIdIdx: index('template_generations_generation_id_idx').on(table.generationId),
}));

// ============================================================================
// 分析历史表 (analysis_history) - Epic 7: Story 7-1 临时历史记录
// ============================================================================
export const analysisHistory = pgTable('analysis_history', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  analysisResultId: integer('analysis_result_id').notNull().references(() => analysisResults.id, { onDelete: 'cascade' }),
  templateSnapshot: jsonb('template_snapshot').notNull(),
  status: varchar('status', { length: 32 }).notNull(), // 'success' | 'failed'
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('analysis_history_user_id_idx').on(table.userId),
  analysisResultIdIdx: index('analysis_history_analysis_result_id_idx').on(table.analysisResultId),
  createdAtIdx: index('analysis_history_created_at_idx').on(table.createdAt),
}));
