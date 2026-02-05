# ATDD Checklist: Story 1-3 - 会话管理与登出

**Story ID**: 1-3
**Epic**: Epic 1 - 用户认证与账户系统
**生成日期**: 2026-02-06
**TDD 阶段**: RED（失败测试已生成）

---

## TDD 红阶段（当前状态）

✅ 失败测试已生成

- **API 测试**: 14 个测试（全部使用 test.skip() 跳过）
- **E2E 测试**: 16 个测试（全部使用 test.skip() 跳过）
- **总计**: 30 个测试

**所有测试都将失败，直到功能实现完成。**

---

## 验收标准覆盖

### AC-1: 会话持久化
- ✅ API: JWT Token 在 HTTP-only Cookie 中（1个测试）
- ✅ API: 会话验证（1个测试）
- ✅ API: 7天过期（1个测试）
- ✅ E2E: 刷新页面后保持登录（1个测试）
- ✅ E2E: 浏览器关闭后保持登录（1个测试）
- ✅ E2E: HTTP-only Cookie 验证（1个测试）

### AC-2: 登出功能
- ✅ API: 清除 NextAuth 会话（1个测试）
- ✅ API: 清除 JWT Token Cookie（1个测试）
- ✅ API: 重定向到首页（1个测试）
- ✅ E2E: 点击登出按钮（1个测试）
- ✅ E2E: 清除会话（1个测试）
- ✅ E2E: 加载状态（1个测试）
- ✅ E2E: 重定向到首页（1个测试）

### AC-3: 登出后状态更新
- ✅ API: 返回 null 用户（1个测试）
- ✅ API: 拒绝访问受保护路由（1个测试）
- ✅ E2E: 隐藏用户菜单（1个测试）
- ✅ E2E: 显示登录按钮（1个测试）
- ✅ E2E: 拒绝访问受保护页面（1个测试）

### AC-4: 会话刷新机制
- ✅ API: 用户活跃时延长会话（1个测试）
- ✅ API: 7天有效期（1个测试）

### AC-5: 响应时间
- ✅ API: 登出 < 1秒（1个测试）
- ✅ API: 会话验证 < 100ms（1个测试）

### AC-6: 安全性
- ✅ API: HTTP-only Cookie（1个测试）
- ✅ API: 立即清除会话数据（1个测试）

### AC-7: 用户体验
- ✅ E2E: 登出成功提示（1个测试）
- ✅ E2E: 登出失败错误处理（1个测试）
- ✅ E2E: 性能要求 < 1秒（1个测试）
- ✅ E2E: 按钮禁用状态（1个测试）

### 额外覆盖
- ✅ E2E: 完整登录-活动-登出流程（1个测试）
- ✅ E2E: 多标签页会话同步（1个测试）

---

## 下一步（TDD 绿阶段）

功能实现后：

1. **移除 test.skip()**: 从所有测试文件中删除 `test.skip(true, 'Implementation pending: ...')`
2. **运行测试**: `npm test` 或 `npx playwright test`
3. **验证测试通过**: 确保所有测试变为绿色（通过）
4. **处理失败的测试**:
   - 修复实现（功能 bug）
   - 或修复测试（测试 bug）
5. **提交通过的测试**: Git commit 包含实现和测试

---

## 实现指导

### 需要实现的 API 端点

根据 API 测试，以下端点需要实现：

1. **POST /api/auth/signin**
   - Google OAuth 登录
   - 返回 JWT Token 在 HTTP-only Cookie 中
   - Cookie 属性: HttpOnly, Secure, SameSite=Strict

2. **GET /api/auth/session**
   - 验证 JWT Token
   - 返回用户会话信息
   - 响应时间 < 100ms

3. **POST /api/auth/signout**
   - 清除 NextAuth 会话
   - 清除 JWT Token Cookie
   - 返回重定向 URL
   - 响应时间 < 1秒

4. **会话刷新机制**
   - 用户活跃时自动延长会话
   - 7天有效期

### 需要实现的 UI 组件

根据 E2E 测试，以下组件和流程需要实现：

1. **SignOutButton** (`src/features/auth/components/SignOutButton`)
   - 点击触发登出
   - 加载状态显示
   - 禁用状态

2. **UserMenu** (`src/features/auth/components/UserMenu`)
   - 登录后显示
   - 登出后隐藏

3. **登录按钮** (`src/features/auth/components/SignInButton`)
   - 登出后显示
   - 点击跳转到登录页

4. **成功/错误提示**
   - 登出成功: "已登出"（3秒后自动隐藏）
   - 登出失败: "登出失败，请重试"

5. **页面保护**
   - 中间件保护受保护路由
   - 未登录重定向到登录页

### 需要实现的功能

1. **useAuth Hook** (`src/features/auth/hooks/useAuth.ts`)
   - `signOut()` 函数
   - 返回用户状态
   - 返回加载状态

2. **useRequireAuth Hook** (`src/features/auth/hooks/useRequireAuth.ts`)
   - 检查用户是否已登录
   - 未登录时重定向到登录页

3. **Middleware** (`src/middleware.ts`)
   - 保护需要认证的路由
   - 使用 NextAuth `withAuth`

4. **NextAuth 配置** (`src/lib/auth/options.ts`)
   - JWT 策略
   - 7天过期
   - 每天更新
   - Cookie 安全配置

---

## 测试文件位置

- **API 测试**: `tests/api/session-management.spec.ts`
- **E2E 测试**: `tests/e2e/session-management.spec.ts`
- **User Factory**: `tests/support/factories/user-factory.ts`（已存在）

---

## TDD 工作流

```
🔴 RED 阶段（当前）:
  ✅ 失败测试已生成
  ✅ 所有测试使用 test.skip() 跳过

🟢 GREEN 阶段（下一步）:
  ⏳ 实现功能代码
  ⏳ 移除 test.skip()
  ⏳ 运行测试验证通过

🔵 REFACTOR 阶段:
  ⏳ 重构代码
  ⏳ 确保测试仍然通过
```

---

## 知识库片段使用

生成测试时使用了以下知识库片段：

- ✅ `data-factories.md` - 工厂模式生成测试数据
- ✅ `component-tdd.md` - 组件 TDD 工作流
- ✅ `test-quality.md` - 测试质量标准
- ✅ `auth-session.md` - 认证会话管理

---

## 性能指标

- **执行模式**: 并行（API + E2E 子进程）
- **生成时间**: ~1分钟
- **性能提升**: ~50% 快于串行生成

---

## 故障排除

如果测试在移除 test.skip() 后仍然失败：

1. **检查实现**: 确保所有 API 端点已实现
2. **检查配置**: 确保 NextAuth 配置正确
3. **检查 Cookie**: 确保 Cookie 设置正确（HttpOnly, Secure, SameSite）
4. **检查重定向**: 确保登出后正确重定向
5. **检查状态**: 确保登出后 UI 状态正确更新

---

**生成于**: 2026-02-06
**工作流**: bmad-tea-testarch-atdd
**版本**: 5.0 (Step-File Architecture)
