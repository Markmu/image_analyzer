import { pgTable, text, varchar, integer, timestamp, uniqueIndex, index, uuid, serial, real, jsonb } from 'drizzle-orm/pg-core';

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
