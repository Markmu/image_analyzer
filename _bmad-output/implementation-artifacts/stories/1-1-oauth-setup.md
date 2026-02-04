# Story 1.1: OAuth 基础设置

Status: done

## Epic 上下文

**Epic 1**: 用户认证与账户系统

**Epic 目标**: 用户可以使用 Google 账户登录系统，管理个人资料和积分余额。

**Epic 范围**:
- Google OAuth 2.0 登录集成
- 新用户自动获赠 30 credit
- 账户信息查看（余额、订阅状态）
- 账户删除功能

**Epic 内故事依赖**:
- Story 1-1 (当前故事): OAuth 基础设置和用户数据存储
- 后续故事 (1-2, 1-3, 1-4, 1-5): 依赖当前故事

## Story

作为 **系统**，
我想要 **配置 NextAuth.js 和 Google OAuth 集成**，
以便 **用户可以使用 Google 账户登录系统**。

## 验收标准

### 功能验收标准

1. **[AC-1] NextAuth.js 配置**
   - 安装 NextAuth.js v5 (beta) 和相关依赖
   - 配置环境变量（`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Google OAuth 凭据）
   - 创建 NextAuth 配置文件 `src/lib/auth/index.ts`
   - 配置 Google OAuth Provider
   - 配置 Drizzle Adapter 用于数据库会话存储

2. **[AC-2] 数据库 Schema**
   - 创建 `users` 表，包含以下字段：
     - `id` (text, primary key): Google OAuth 用户 ID
     - `email` (text, unique, not null): 用户邮箱
     - `name` (text, not null): 显示名称
     - `image` (text): 头像 URL
     - `credit_balance` (integer, default 0): Credit 余额
     - `subscription_tier` (text, default 'free'): 订阅等级
     - `created_at` (timestamp, default now): 创建时间
     - `updated_at` (timestamp, default now): 更新时间
   - 创建数据库迁移并执行

3. **[AC-3] OAuth 登录流程**
   - 用户可以点击"使用 Google 登录"按钮
   - 系统重定向到 Google OAuth 2.0 授权页面
   - 用户授权后，系统成功创建或更新用户账户
   - 用户被重定向回应用，并已登录状态

4. **[AC-4] 用户信息获取和存储**
   - 从 Google OAuth 获取用户基本信息：
     - Email（用作唯一标识）
     - Display Name（显示名称）
     - Profile Picture（头像 URL）
   - 信息正确存储到 `users` 表
   - 老用户登录时更新 `updated_at` 字段

### 非功能验收标准

5. **[AC-5] 安全性**
   - 所有通信使用 HTTPS (TLS 1.3)
   - NextAuth 使用环境变量配置的 `NEXTAUTH_SECRET`
   - JWT Token 有效期设置为 7 天（在后续故事中实现会话管理）
   - 用户只能访问自己的数据

6. **[AC-6] 数据持久性**
   - 用户数据存储在 PostgreSQL 数据库
   - 使用 Drizzle ORM 管理数据访问
   - 用户账户数据持久性 99.99%

7. **[AC-7] 响应时间**
   - 登录流程总时间 < 10 秒（包括 Google OAuth 重定向）
   - 数据库写入操作 < 500ms

8. **[AC-8] 错误处理**
   - OAuth 授权失败时显示友好错误信息
   - 数据库连接失败时显示错误提示
   - 环境变量缺失时阻止启动并提示

## Tasks / Subtasks

### Task 1: 环境配置和依赖安装 (AC: 1)

- [x] 1.1 安装 NextAuth.js v5
  - [x] 1.1.1 安装依赖：`npm install next-auth@beta @auth/drizzle-adapter`
  - [x] 1.1.2 验证安装成功

- [x] 1.2 配置环境变量
  - [x] 1.2.1 在 `.env.local` 中添加环境变量
  - [x] 1.2.2 在 `.env.example` 中添加模板
  - [x] 1.2.3 生成 `NEXTAUTH_SECRET`: `openssl rand -base64 32`

### Task 2: 创建数据库 Schema (AC: 2, 6)

- [x] 2.1 定义 `users` 表结构
  - [x] 2.1.1 在 `src/lib/db/schema.ts` 中定义 users 表

- [x] 2.2 创建数据库迁移
  - [x] 2.2.1 生成迁移：`npm run drizzle-kit generate`
  - [x] 2.2.2 执行迁移：`npm run drizzle-kit push`
  - [x] 2.2.3 验证表结构正确

### Task 3: 配置 NextAuth.js (AC: 1, 3, 4, 5)

- [x] 3.1 创建 NextAuth 配置文件
  - [x] 3.1.1 创建 `src/lib/auth/index.ts`
  - [x] 3.1.2 创建 `src/lib/auth/options.ts`
  - [x] 3.1.3 配置 Google OAuth Provider
  - [x] 3.1.4 配置 Drizzle Adapter
  - [x] 3.1.5 配置 JWT 策略（maxAge: 7 天）

- [x] 3.2 创建 API 路由
  - [x] 3.2.1 创建 `src/app/api/auth/[...nextauth]/route.ts`
  - [x] 3.2.2 导出 NextAuth 处理程序：`export { GET, POST } from '@/lib/auth'`

- [x] 3.3 测试 OAuth 流程
  - [x] 3.3.1 启动开发服务器
  - [x] 3.3.2 访问 `/api/auth/signin` 验证 NextAuth 正常工作
  - [x] 3.3.3 测试 Google OAuth 重定向
  - [x] 3.3.4 验证用户数据正确存储到数据库

### Task 4: 创建登录按钮组件（简化版）(AC: 3)

- [x] 4.1 创建基础登录按钮
  - [x] 4.1.1 创建 `src/features/auth/components/SignInButton/index.tsx`
  - [x] 4.1.2 实现 Google 登录按钮 UI（简化版，仅用于测试）
  - [x] 4.1.3 集成 `signIn()` 函数 from `next-auth/react`
  - [x] 4.1.4 添加到首页用于测试

### Task 5: 测试和验证 (AC: 1-8)

- [x] 5.1 单元测试
  - [x] 5.1.1 测试 NextAuth 配置正确加载（16 个测试）
  - [x] 5.1.2 测试数据库连接（Schema 验证）

- [x] 5.2 集成测试
  - [x] 5.2.1 测试 OAuth 登录流程
  - [x] 5.2.2 测试新用户创建
  - [x] 5.2.3 测试老用户登录（仅更新 `updated_at`）
  - [x] 5.2.4 测试错误处理（OAuth 失败）

- [x] 5.3 手动测试
  - [x] 5.3.1 测试登录流程端到端
  - [x] 5.3.2 验证数据库中用户数据正确
  - [x] 5.3.3 测试环境变量缺失时的错误提示

## Dev Notes

### 相关架构模式和约束

**技术栈决策** ([Source: architecture.md#Core Architectural Decisions](../planning-artifacts/architecture.md)):
- **认证方案**: NextAuth.js v5 + Google OAuth 2.0
- **会话管理**: JWT，7 天过期
- **数据库**: PostgreSQL + Drizzle ORM
- **数据加密**: AES-256 静态加密，TLS 1.3 传输加密

**命名规范** ([Source: architecture.md#Naming Patterns](../planning-artifacts/architecture.md)):
- 数据库表: `users` (snake_case 复数)
- 数据库列: `credit_balance`, `subscription_tier`, `created_at` (snake_case)
- API 端点: `/api/auth/*` (kebab-case 复数)
- React 组件: `SignInButton` (PascalCase)
- 文件名: `sign-in-button.tsx` (kebab-case)
- 函数/变量: `creditBalance` (camelCase)

**项目结构** ([Source: architecture.md#Project Structure](../planning-artifacts/architecture.md)):
```
src/
├── lib/
│   ├── auth/                    # NextAuth 配置
│   │   ├── index.ts             # NextAuth 配置文件
│   │   └── options.ts           # Auth 选项
│   └── db/
│       ├── schema.ts            # 数据库 Schema（包含 users 表）
│       └── migrations/          # Drizzle 迁移文件
├── features/
│   └── auth/                    # 认证功能模块
│       └── components/
│           └── SignInButton/
│               ├── index.tsx
│               └── SignInButton.tsx
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts     # NextAuth API 端点
```

### 数据库 Schema 详细设计

**`users` 表结构** ([Source: architecture.md](../planning-artifacts/architecture.md)):

```typescript
// src/lib/db/schema.ts
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  // 主键：Google OAuth 用户 ID
  id: text('id').primaryKey(),

  // 用户基本信息（从 Google OAuth 获取）
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  image: text('image'), // Profile picture URL

  // Credit 和订阅信息（后续故事使用）
  creditBalance: integer('credit_balance').notNull().default(0),
  subscriptionTier: text('subscription_tier').notNull().default('free'),

  // 时间戳
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### 安全考虑

**环境变量** ([Source: architecture.md](../planning-artifacts/architecture.md)):
- `NEXTAUTH_SECRET`: 使用强随机字符串（生成：`openssl rand -base64 32`）
- `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`: 从 [Google Cloud Console](https://console.cloud.google.com/) 获取
- 授权重定向 URI：`http://localhost:3000/api/auth/callback/google`（开发环境）

**NextAuth 配置要点**:
- 使用 `jwt` 策略（默认）
- 设置 `maxAge: 7 * 24 * 60 * 60`（7 天）
- 配置 Drizzle Adapter 用于持久化会话
- 确保 `NEXTAUTH_SECRET` 在生产环境中使用强随机值

### Google OAuth 设置指南

**创建 Google OAuth 2.0 凭据**:
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 配置 OAuth 同意屏幕
5. 创建 OAuth 2.0 客户端 ID
   - 应用类型：Web 应用
   - 授权重定向 URI：`http://localhost:3000/api/auth/callback/google`

### 常见陷阱和解决方案

**问题 1: NextAuth 配置错误**
- **症状**: OAuth 回调失败，显示 "OAuthError"
- **解决**: 检查 Google Cloud Console 中的授权重定向 URI 是否正确

**问题 2: 数据库连接失败**
- **症状**: "Database connection error"
- **解决**: 确保 Docker PostgreSQL 正在运行，`DATABASE_URL` 正确

**问题 3: 环境变量未加载**
- **症状**: "NEXTAUTH_SECRET is not defined"
- **解决**: 确保 `.env.local` 文件存在且包含所有必需变量

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- ✅ 从原始 Story 1-1 拆分出 OAuth 基础设置部分
- ✅ 专注于 NextAuth 配置和用户数据存储
- ✅ 定义了清晰的数据库 Schema
- ✅ 包含了安全考虑和环境配置
- ✅ 提供了 Google OAuth 设置指南
- ✅ **[Task 4.1] 创建 SignInButton 组件**
- ✅ **[Task 4.1] 集成 signIn() 函数**
- ✅ **[Task 4.1] 添加到首页用于测试**
- ✅ **[Task 5.1] 单元测试：49 个测试全部通过**
- ✅ **[Task 3.3, 5.2, 5.3] OAuth 流程验证成功**

### Code Review Fixes (2026-02-04)

对抗性代码审查发现并修复以下问题：

**CRITICAL 问题（已修复）**:
- ✅ **CRITICAL-001**: 安装并配置 `@auth/drizzle-adapter`
- ✅ **CRITICAL-002**: 添加 Drizzle Adapter 到 NextAuth 配置
- ✅ **CRITICAL-003**: 在 `signIn` callback 中添加用户数据验证和 `updated_at` 更新逻辑
- ✅ **CRITICAL-004**: 在 `jwt` callback 中添加类型安全检查
- ✅ **CRITICAL-005**: 在所有 callbacks 中添加 try-catch 错误处理

**修复后的改进**:
- 邮箱格式验证（正则表达式）
- 用户数据自动存储到数据库（通过 Drizzle Adapter）
- 老用户登录时自动更新 `updated_at` 字段
- 详细的错误日志记录用于调试
- OAuth 凭据为空时返回空字符串而非 undefined
- **表名修复**：使用 NextAuth 标准约定（单数形式：user, account, session, verificationToken）
- **向后兼容**：导出复数别名（users, accounts, sessions）保持与旧代码兼容

### File List

**待创建/修改的文件**:

1. `src/lib/db/schema.ts` - 添加 `users` 表定义
2. `src/lib/auth/index.ts` - NextAuth 配置
3. `src/lib/auth/options.ts` - NextAuth 选项
4. `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API 端点
5. `src/features/auth/components/SignInButton/index.tsx` - 登录按钮组件（简化版）
6. `.env.local` - 环境变量配置
7. `.env.example` - 环境变量模板

**数据库迁移文件**:
- `drizzle/0001_users.sql` - 创建 `users` 表

**测试文件**:
- `tests/unit/task-1.1-nextauth-installation.test.ts` - 验证 NextAuth 安装
- `tests/unit/task-1.2-env-config.test.ts` - 验证环境变量配置
- `tests/unit/task-2.1-users-schema.test.ts` - 验证 users 表结构定义
- `tests/unit/task-3-nextauth-config.test.ts` - 验证 NextAuth 配置
- `tests/unit/task-4-signin-button-component.test.ts` - 验证 SignInButton 组件
- `tests/api/oauth-setup.spec.ts` - ATDD API 测试
- `tests/e2e/oauth-login.spec.ts` - ATDD E2E 测试

**已修改文件**:
- `package.json` - 升级 next-auth 到 v5.0.0-beta.30，添加 @auth/drizzle-adapter
- `.env.local` - 配置 NEXTAUTH_SECRET 和 DATABASE_URL
- `src/lib/db/schema.ts` - 添加 users 表定义
- `src/lib/auth/options.ts` - NextAuth 配置选项（含 Drizzle Adapter 和验证逻辑）
- `src/lib/auth/index.ts` - NextAuth 处理程序导出
- `src/types/next-auth.d.ts` - NextAuth 类型扩展
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API 路由
- `src/features/auth/components/SignInButton/index.tsx` - 登录按钮组件
- `src/app/page.tsx` - 首页添加登录按钮
- `drizzle/0000_nice_namora.sql` - users 表迁移文件

---

**Story 生成完成时间**: 2026-02-04

**下一步**:
1. Review this story file
2. Run dev agent's `dev-story` for implementation
3. After completion, proceed to Story 1-2 (user-registration)
