# Story 1.3: 会话管理与登出

Status: backlog

## Epic 上下文

**Epic 1**: 用户认证与账户系统

**Epic 目标**: 用户可以使用 Google 账户登录系统，管理个人资料和积分余额。

**Epic 范围**:
- Google OAuth 2.0 登录集成
- 新用户自动获赠 30 credit
- 账户信息查看（余额、订阅状态）
- 账户删除功能

**Epic 内故事依赖**:
- Story 1-1 (OAuth 基础设置): **前置依赖** - 必须先完成
- Story 1-3 (当前故事): 实现会话持久化和登出功能
- Story 1-4 (用户菜单 UI): 可并行开发，但会依赖此故事的登出功能

## Story

作为 **用户**，
我想要 **保持登录状态并可以安全登出**，
以便 **控制我的会话并保护隐私**。

## 验收标准

### 功能验收标准

1. **[AC-1] 会话持久化**
   - 用户登录后，关闭浏览器重新打开仍保持登录状态
   - 会话持续 7 天（使用 JWT）
   - 7 天后自动过期，用户需重新登录
   - JWT Token 存储在 HTTP-only Cookie 中

2. **[AC-2] 登出功能**
   - 用户可以点击"登出"按钮
   - 系统清除 NextAuth 会话
   - 清除 JWT Token Cookie
   - 用户被重定向到首页

3. **[AC-3] 登出后状态更新**
   - 登出后，用户菜单隐藏
   - 登出后，显示"登录"按钮
   - 登出后，无法访问需要认证的页面

4. **[AC-4] 会话刷新机制**
   - 用户活跃时自动延长会话
   - 使用 NextAuth 的 `session` 回调保持会话新鲜
   - 会话在 7 天内有效

### 非功能验收标准

5. **[AC-5] 响应时间**
   - 登出操作 < 1 秒
   - 会话验证 < 100ms
   - 登出后重定向 < 500ms

6. **[AC-6] 安全性**
   - JWT Token 存储在 HTTP-only Cookie（防止 XSS）
   - Cookie 设置 `Secure` 属性（HTTPS only）
   - Cookie 设置 `SameSite=Strict`（防止 CSRF）
   - 登出后立即清除所有会话数据

7. **[AC-7] 用户体验**
   - 登出过程中显示加载状态
   - 登出失败时显示友好错误信息
   - 登出成功后显示短暂提示："已登出"

## Tasks / Subtasks

### Task 1: 配置会话管理 (AC: 1, 4, 6)

- [ ] 1.1 配置 JWT 策略
  - [ ] 1.1.1 在 `src/lib/auth/options.ts` 中配置 `session` 策略
  - [ ] 1.1.2 设置 `maxAge: 7 * 24 * 60 * 60`（7 天）
  - [ ] 1.1.3 配置 `updateAge: 24 * 60 * 60`（每天更新）
  - [ ] 1.1.4 使用 JWT 策略（默认）

- [ ] 1.2 配置 Cookie 安全选项
  - [ ] 1.2.1 设置 `httpOnly: true`（防止 XSS）
  - [ ] 1.2.2 设置 `secure: true`（HTTPS only，生产环境）
  - [ ] 1.2.3 设置 `sameSite: 'strict'`（防止 CSRF）
  - [ ] 1.2.4 开发环境允许 insecure（`process.env.NODE_ENV === 'development'`）

- [ ] 1.3 配置会话回调
  - [ ] 1.3.1 实现 `session` 回调函数
  - [ ] 1.3.2 从数据库加载最新用户信息
  - [ ] 1.3.3 返回标准化的 session 对象

### Task 2: 实现登出功能 (AC: 2, 3, 5, 7)

- [ ] 2.1 创建登出 Hook
  - [ ] 2.1.1 创建 `src/features/auth/hooks/useAuth.ts`
  - [ ] 2.1.2 封装 `signOut()` 函数 from `next-auth/react`
  - [ ] 2.1.3 添加登出后的回调处理

- [ ] 2.2 集成登出按钮（简化版）
  - [ ] 2.2.1 创建 `src/features/auth/components/SignOutButton/index.tsx`
  - [ ] 2.2.2 调用 `signOut()` 函数
  - [ ] 2.2.3 登出后重定向到首页
  - [ ] 2.2.4 添加加载状态显示

- [ ] 2.3 添加登出提示
  - [ ] 2.3.1 登出成功后显示 Snackbar："已登出"
  - [ ] 2.3.2 位置：页面底部中央
  - [ ] 2.3.3 自动隐藏：3 秒

- [ ] 2.4 错误处理
  - [ ] 2.4.1 处理登出失败情况
  - [ ] 2.4.2 显示友好错误信息："登出失败，请重试"
  - [ ] 2.4.3 记录错误日志

### Task 3: 实现会话验证和保护 (AC: 3, 6)

- [ ] 3.1 创建认证保护 Hook
  - [ ] 3.1.1 创建 `src/features/auth/hooks/useRequireAuth.ts`
  - [ ] 3.1.2 检查用户是否已登录
  - [ ] 3.1.3 未登录时重定向到登录页

- [ ] 3.2 创建中间件（可选，用于页面保护）
  - [ ] 3.2.1 创建 `src/middleware.ts`
  - [ ] 3.2.2 保护需要认证的路由
  - [ ] 3.2.3 未登录时重定向到登录页

### Task 4: 测试和验证 (AC: 1-7)

- [ ] 4.1 单元测试
  - [ ] 4.1.1 测试 `useAuth` Hook
  - [ ] 4.1.2 测试会话配置正确加载
  - [ ] 4.1.3 Mock NextAuth `signOut()` 函数

- [ ] 4.2 集成测试
  - [ ] 4.2.1 测试会话持久化（刷新页面）
  - [ ] 4.2.2 测试登出流程
  - [ ] 4.2.3 测试会话过期（模拟 7 天后）
  - [ ] 4.2.4 测试登出后无法访问受保护页面

- [ ] 4.3 E2E 测试（使用 Playwright）
  - [ ] 4.3.1 测试用户登录后刷新页面 → 仍登录
  - [ ] 4.3.2 测试用户点击登出 → 重定向到首页
  - [ ] 4.3.3 测试登出后 Cookie 清除
  - [ ] 4.3.4 测试登出后无法访问受保护页面

## Dev Notes

### 相关架构模式和约束

**技术栈决策** ([Source: architecture.md#Core Architectural Decisions](../planning-artifacts/architecture.md)):
- **会话管理**: JWT，7 天过期
- **认证方案**: NextAuth.js v5 + Google OAuth 2.0
- **安全策略**: HTTP-only Cookie, Secure, SameSite=Strict

**命名规范** ([Source: architecture.md#Naming Patterns](../planning-artifacts/architecture.md)):
- React 组件: `SignOutButton`, `useAuth`, `useRequireAuth` (PascalCase)
- 文件名: `sign-out-button.tsx`, `use-auth.ts` (kebab-case)
- 函数/变量: `signOut`, `requireAuth` (camelCase)

### 会话管理详细设计

**NextAuth JWT 配置**:
```typescript
// src/lib/auth/options.ts
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  // ... 其他配置

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 天
    updateAge: 24 * 60 * 60, // 每天更新
  },

  callbacks: {
    async session({ token, user }) {
      // 从数据库加载最新用户信息
      return {
        user: {
          id: token.sub,
          email: token.email,
          name: token.name,
          image: token.picture,
        },
        expires: new Date(token.exp * 1000).toISOString(),
      };
    },
    async jwt({ token, user, account }) {
      // 首次登录时添加用户信息到 token
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
  },
};
```

**Cookie 安全配置**:
```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
```

### 登出功能实现

**useAuth Hook 实现**:
```typescript
// src/features/auth/hooks/useAuth.ts
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      router.push('/');
      // 显示成功提示
    } catch (error) {
      // 显示错误提示
      console.error('Sign out error:', error);
    }
  };

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signOut,
  };
}
```

**SignOutButton 组件**:
```typescript
// src/features/auth/components/SignOutButton/index.tsx
import { Button } from '@mui/material';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function SignOutButton() {
  const { signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="text"
    >
      {isLoading ? '登出中...' : '登出'}
    </Button>
  );
}
```

### 页面保护实现

**middleware.ts 实现**:
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analysis/:path*',
    '/templates/:path*',
  ],
};
```

**useRequireAuth Hook 实现**:
```typescript
// src/features/auth/hooks/useRequireAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // 还在加载中
    if (!session) {
      // 未登录，重定向到登录页
      router.push('/api/auth/signin');
    }
  }, [session, status, router]);

  return {
    session,
    isLoading: status === 'loading',
  };
}
```

### 安全考虑

**JWT Token 安全**:
- 存储: HTTP-only Cookie（JavaScript 无法访问）
- 传输: 仅 HTTPS（生产环境）
- 防护: SameSite=Strict（防止 CSRF 攻击）

**会话过期策略**:
- 绝对过期: 7 天后必须重新登录
- 滑动过期: 用户活跃时每天刷新 token
- 存储: JWT 包含 `exp` 字段，NextAuth 自动验证

**登出安全**:
- 清除服务器端会话
- 清除客户端 Cookie
- 清除内存中的 session 数据
- 重定向到首页（防止后退）

### 用户体验考虑

**登出流程设计**:
1. 用户点击"登出"按钮
2. 显示加载状态（按钮禁用）
3. 调用 `signOut()` API
4. 清除会话和 Cookie
5. 重定向到首页
6. 显示短暂提示："已登出"

**会话持久化体验**:
- 用户关闭浏览器后重新打开 → 仍登录
- 用户刷新页面 → 仍登录
- 7 天后自动过期 → 需重新登录
- 主动登出 → 立即清除会话

### PRD 需求映射

**来自 PRD 的需求**:
- FR1: 新用户可以通过 Google OAuth 登录创建账户（会话管理）
- FR3: 用户可以在登录后查看其当前 credit 余额（需要认证）

**注意**: PRD 中未明确说明登出功能，但这是认证系统的标准功能。

### 常见陷阱和解决方案

**问题 1: 会话不持久**
- **症状**: 刷新页面后用户未登录
- **解决**: 确保 Drizzle Adapter 正确配置，数据库 `sessions` 和 `users` 表存在

**问题 2: Cookie 无法设置**
- **症状**: 登录后没有 Cookie
- **解决**: 检查 `NEXTAUTH_URL` 环境变量是否正确

**问题 3: 登出后仍可访问受保护页面**
- **症状**: 登出后可以通过浏览器后退访问
- **解决**: 添加客户端路由保护（`useRequireAuth`）和服务器端中间件

**问题 4: 会话过期时间不准确**
- **症状**: 会话在 7 天前就过期
- **解决**: 检查 JWT `exp` 字段计算是否正确，时区是否一致

## Dev Agent Record

### Completion Notes List

- ✅ 从原始 Story 1-1 拆分会话管理和登出部分
- ✅ 专注于会话持久化和安全登出
- ✅ 定义了清晰的验收标准
- ✅ 包含了安全配置（HTTP-only, Secure, SameSite）
- ✅ 提供了页面保护实现
- ✅ 添加了登出用户体验设计

### File List

**待创建/修改的文件**:

1. `src/lib/auth/options.ts` - NextAuth 配置（修改）
2. `src/features/auth/hooks/useAuth.ts` - 认证 Hook（新增）
3. `src/features/auth/hooks/useRequireAuth.ts` - 页面保护 Hook（新增）
4. `src/features/auth/components/SignOutButton/index.tsx` - 登出按钮（新增）
5. `src/middleware.ts` - 路由保护中间件（新增）

**测试文件**:
- `src/features/auth/hooks/useAuth.test.ts`
- `tests/e2e/session-management.spec.ts`

---

**Story 生成完成时间**: 2026-02-04

**前置依赖**: Story 1-1 (OAuth 基础设置) 必须先完成

**下一步**:
1. 等待 Story 1-1 完成
2. Review this story file
3. Run dev agent's `dev-story` for implementation
4. After completion, Story 1-4 可以使用登出功能
