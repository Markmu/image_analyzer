import { pgTable, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
  id: text('id').primaryKey(),

  // 用户基本信息（从 Google OAuth 获取）
  email: text('email').notNull(),
  name: text('name').notNull(),
  image: text('image'), // Profile picture URL

  // 邮箱验证字段（NextAuth 标准字段）
  emailVerified: timestamp('emailVerified'),

  // Credit 和订阅信息（后续故事使用）
  creditBalance: integer('credit_balance').notNull().default(0),
  subscriptionTier: text('subscription_tier').notNull().default('free'),

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
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // "oauth" | "email" | "credentials"
  provider: text('provider').notNull(), // "google" | "github" etc.
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  providerIdx: uniqueIndex('account_provider_providerAccountId_key').on(table.provider, table.providerAccountId),
}));

// ============================================================================
// 会话表 (session) - 注意：NextAuth 要求单数形式
// ============================================================================
export const session = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// ============================================================================
// 验证令牌表 (verificationToken) - 注意：NextAuth 要求单数形式
// ============================================================================
export const verificationToken = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
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
  userId: text('user_id').primaryKey(),
  deletedAt: timestamp('deleted_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});
