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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('images_user_id_idx').on(table.userId),
  batchIdIdx: index('images_batch_id_idx').on(table.batchId),
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
// 内容审核日志表 (content_moderation_logs)
// ============================================================================
export const contentModerationLogs = pgTable('content_moderation_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  imageId: varchar('image_id', { length: 64 }).notNull().references(() => images.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 32 }).notNull(), // 'approved' | 'rejected'
  reason: varchar('reason', { length: 255 }),
  confidence: real('confidence'),
  batchId: integer('batch_id'), // 可选，关联批量分析
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('moderation_logs_user_id_idx').on(table.userId),
  imageIdIdx: index('moderation_logs_image_id_idx').on(table.imageId),
}));

// ============================================================================
// Credit 交易历史表 (credit_transactions)
// ============================================================================
export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull(), // 'deduct' | 'refund' | 'purchase' | 'bonus'
  amount: integer('amount').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  batchId: integer('batch_id'), // 可选，关联批量分析
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('credit_transactions_user_id_idx').on(table.userId),
  batchIdIdx: index('credit_transactions_batch_id_idx').on(table.batchId),
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
