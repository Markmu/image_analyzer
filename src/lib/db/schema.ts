import { pgTable, text, varchar, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('images_user_id_idx').on(table.userId),
}));
