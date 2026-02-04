# Story 1.2: 用户注册与 Credit 奖励

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
- Story 1-1 (OAuth 基础设置): **前置依赖** - 必须先完成
- Story 1-2 (当前故事): 实现新用户奖励机制
- 后续故事 (1-3, 1-4, 1-5): 可并行开发

## Story

作为 **新用户**，
我想要 **首次登录时自动获得 30 credit（免费使用额度）**，
以便 **可以免费试用图片分析功能，体验产品价值**。

## 验收标准

### 功能验收标准

1. **[AC-1] 新用户检测**
   - 系统可以检测到新用户（首次登录）
   - 判断逻辑：`createdAt === updatedAt` 且 `creditBalance === 0`
   - 仅在用户首次登录时触发

2. **[AC-2] Credit 自动授予**
   - 新用户首次登录自动获得 30 credit
   - Credit 数值写入 `credit_balance` 字段
   - 仅授予一次，不会重复奖励

3. **[AC-3] 欢迎提示显示**
   - 登录成功后显示欢迎消息："欢迎！您已获得 30 次 free credit"
   - 提示使用 MUI Snackbar 组件
   - 位置：页面底部中央
   - 自动隐藏：5 秒
   - 样式：绿色背景，白色文字，勾选图标

4. **[AC-4] 老用户不重复奖励**
   - 老用户（`creditBalance > 0`）登录不会获得额外 credit
   - 老用户登录不显示欢迎提示
   - 仅在首次授予时更新 `credit_balance`

### 非功能验收标准

5. **[AC-5] 防止并发授予**
   - 即使多个 OAuth 回调同时到达，也只授予一次
   - 使用数据库事务确保原子性

6. **[AC-6] 数据一致性**
   - Credit 余额更新后立即反映在数据库
   - 后续查询能读取到最新余额

7. **[AC-7] 性能要求**
   - Credit 授予操作 < 500ms
   - 不延长登录流程总时间

## Tasks / Subtasks

### Task 1: 创建新用户检测和奖励服务 (AC: 1, 2, 5, 6, 7)

- [x] 1.1 创建认证服务模块
  - [x] 1.1.1 创建 `src/features/auth/services/auth.service.ts`
  - [x] 1.1.2 导出 `checkAndRewardNewUser()` 函数

- [x] 1.2 实现新用户检测逻辑
  - [x] 1.2.1 从数据库查询用户记录
  - [x] 1.2.2 检查条件：`createdAt === updatedAt` 且 `creditBalance === 0`
  - [x] 1.2.3 返回布尔值表示是否为新用户

- [x] 1.3 实现 Credit 授予逻辑
  - [x] 1.3.1 使用 Drizzle ORM 更新 `credit_balance` 字段
  - [x] 1.3.2 设置 `credit_balance = 30`
  - [x] 1.3.3 使用数据库事务确保原子性
  - [x] 1.3.4 添加乐观锁防止并发问题

- [x] 1.4 添加错误处理
  - [x] 1.4.1 处理数据库连接错误
  - [x] 1.4.2 处理更新失败情况
  - [x] 1.4.3 记录错误日志

### Task 2: 集成到 NextAuth 回调 (AC: 1, 2, 4)

- [x] 2.1 修改 NextAuth 配置
  - [x] 2.1.1 在 `src/lib/auth/options.ts` 中添加 `signIn` 回调
  - [x] 2.1.2 在回调中调用 `checkAndRewardNewUser()`
  - [x] 2.1.3 处理奖励失败的错误情况

- [x] 2.2 测试集成
  - [x] 2.2.1 测试新用户首次登录 → 获得 30 credit
  - [x] 2.2.2 测试老用户登录 → 不获得 credit
  - [x] 2.2.3 测试并发登录 → 只授予一次

### Task 3: 创建欢迎提示组件 (AC: 3)

- [x] 3.1 创建欢迎提示组件
  - [x] 3.1.1 创建 `src/features/auth/components/WelcomeSnackbar/index.tsx`
  - [x] 3.1.2 使用 MUI Snackbar 组件
  - [x] 3.1.3 样式：绿色背景，白色文字，勾选图标
  - [x] 3.1.4 位置：页面底部中央
  - [x] 3.1.5 自动隐藏：5 秒

- [x] 3.2 集成到登录流程
  - [x] 3.2.1 在登录成功后显示欢迎提示
  - [x] 3.2.2 仅对新用户显示
  - [x] 3.2.3 老用户不显示提示

### Task 4: 创建 Credit 显示组件（简化版）(AC: 6)

- [x] 4.1 创建 Credit 显示组件
  - [x] 4.1.1 创建 `src/features/credits/components/CreditDisplay/index.tsx`
  - [x] 4.1.2 从数据库实时获取用户 Credit 余额
  - [x] 4.1.3 显示格式："30 credits" 或 "3 次使用剩余"
  - [x] 4.1.4 添加到页面（用于验证）

### Task 5: 测试和验证 (AC: 1-7)

- [x] 5.1 单元测试
  - [x] 5.1.1 测试 `checkAndRewardNewUser()` 函数逻辑
  - [x] 5.1.2 测试 Credit 奖励仅授予一次
  - [x] 5.1.3 测试并发授予防护
  - [x] 5.1.4 Mock 数据库调用

- [x] 5.2 集成测试
  - [x] 5.2.1 测试完整登录流程
  - [x] 5.2.2 使用测试数据库验证 Credit 写入
  - [x] 5.2.3 测试新用户和老用户场景

- [x] 5.3 E2E 测试（使用 Playwright）
  - [x] 5.3.1 测试新用户首次登录 → 获得 30 credit
  - [x] 5.3.2 验证欢迎提示显示
  - [x] 5.3.3 验证 Credit 余额正确显示
  - [x] 5.3.4 测试老用户登录 → 无欢迎提示

## Dev Notes

### 相关架构模式和约束

**技术栈决策** ([Source: architecture.md#Core Architectural Decisions](../planning-artifacts/architecture.md)):
- **数据库**: PostgreSQL + Drizzle ORM
- **事务处理**: 使用数据库事务确保原子性
- **乐观锁**: 防止并发更新冲突

**Credit 系统规则** ([Source: PRD](../planning-artifacts/prd.md)):
- 新用户自动获赠 30 credit（相当于 3 次使用）
- Credit 是使用量计费的基础单位
- Credit 扣除在后续 Epic 中实现

### 数据库操作详细设计

**新用户检测逻辑**:
```typescript
// src/features/auth/services/auth.service.ts
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function checkAndRewardNewUser(userId: string): Promise<boolean> {
  // 查询用户记录
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 检查是否为新用户
  const isNewUser =
    user.createdAt.getTime() === user.updatedAt.getTime() &&
    user.creditBalance === 0;

  if (isNewUser) {
    // 授予 30 credit
    await rewardUserWithCredits(userId, 30);
    return true;
  }

  return false;
}

async function rewardUserWithCredits(userId: string, amount: number) {
  // 使用事务确保原子性
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        creditBalance: amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  });
}
```

### 并发防护策略

**问题**: 多个 OAuth 回调可能同时到达，导致重复授予

**解决方案 1: 数据库约束（推荐）**
```sql
-- 添加部分唯一索引防止重复授予
CREATE UNIQUE INDEX idx_users_rewarded
ON users(id)
WHERE credit_balance > 0;
```

**解决方案 2: 乐观锁**
```typescript
-- 使用 WHERE 条件确保只有 credit_balance = 0 时才能更新
UPDATE users
SET credit_balance = 30, updated_at = NOW()
WHERE id = $1 AND credit_balance = 0
RETURNING *;
-- 检查影响的行数，如果为 0 则表示已授予
```

**解决方案 3: 数据库事务**
```typescript
await db.transaction(async (tx) => {
  const user = await tx.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user && user.creditBalance === 0) {
    await tx.update(users)
      .set({ creditBalance: 30, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
});
```

### 用户体验考虑

**欢迎提示设计** ([Source: UX Design Specification](../planning-artifacts/ux-design-specification.md)):
- 使用 MUI Snackbar 组件
- 样式：绿色背景（#22C55E），白色文字
- 图标：✓ 勾选图标
- 位置：页面底部中央
- 自动隐藏：5 秒
- 动画：淡入淡出效果

**Credit 显示格式**:
- 格式 1: "30 credits"（直接显示）
- 格式 2: "3 次使用剩余"（除以 10，更直观）
- 位置：用户菜单中，订阅状态旁边
- 样式：绿色突出显示

### PRD 需求映射

**来自 PRD 的需求**:
- FR2: 系统在新用户首次登录时自动授予 30 credit
- FR3: 用户可以在登录后查看其当前 credit 余额

**注意**: PRD 中提到的 "3 次 free credit" 是指 30 ÷ 10 = 3 次使用（假设每次分析消耗 10 credit）。Credit 系统的详细规则在 Epic 8 中定义。

### 常见陷阱和解决方案

**问题 1: 每次登录都获得 credit**
- **症状**: 老用户每次登录都增加 30 credit
- **解决**: 检查 `checkAndRewardNewUser()` 逻辑，确保 `creditBalance === 0` 检查

**问题 2: 并发登录重复授予**
- **症状**: 同时多个 OAuth 回调导致重复授予
- **解决**: 使用数据库事务或乐观锁

**问题 3: 欢迎提示不显示**
- **症状**: 新用户登录后看不到欢迎提示
- **解决**: 确保在登录成功后触发 `checkAndRewardNewUser()`，并正确处理返回值

**问题 4: Credit 余额未更新**
- **症状**: 数据库中 `credit_balance` 仍为 0
- **解决**: 检查数据库事务是否正确提交，检查 WHERE 条件是否正确

## Dev Agent Record

### Completion Notes List

- ✅ 从原始 Story 1-1 拆分出用户注册奖励部分
- ✅ 专注于新用户检测和 Credit 授予
- ✅ 定义了清晰的验收标准
- ✅ 包含了并发防护策略
- ✅ 提供了数据库操作示例
- ✅ 添加了欢迎提示设计
- ✅ 实现了 auth.service.ts 核心服务
- ✅ 集成到 NextAuth signIn 回调
- ✅ 创建了 WelcomeSnackbar 组件
- ✅ 创建了 CreditDisplay 组件
- ✅ 添加了 API 端点支持测试
- ✅ 实现了乐观锁防止并发授予
- ✅ 使用数据库事务确保原子性

### File List

**新增文件**:
1. `src/features/auth/services/auth.service.ts` - 认证服务核心逻辑
2. `src/features/auth/services/index.ts` - 服务导出
3. `src/features/auth/components/WelcomeSnackbar/index.tsx` - 欢迎提示组件
4. `src/features/auth/components/index.ts` - 组件导出
5. `src/features/credits/components/CreditDisplay/index.tsx` - Credit 显示组件
6. `src/features/credits/components/index.ts` - 组件导出
7. `src/app/api/auth/check-new-user/route.ts` - 新用户检测 API
8. `src/app/api/auth/reward-new-user/route.ts` - Credit 授予 API

**修改文件**:
1. `src/lib/auth/options.ts` - 集成新用户奖励到 OAuth 回调

**测试文件**:
1. `tests/api/user-registration.spec.ts` - API 测试（43 个测试）
2. `tests/e2e/user-registration.spec.ts` - E2E 测试（20 个测试）
3. `_bmad-output/test-artifacts/atdd-checklist-1-2-user-registration.md` - ATDD 验收清单
4. `_bmad-output/test-reviews/test-review-1-2-user-registration.md` - 测试审查报告

### Change Log

**2026-02-05 - Story Implementation Complete**
- ✅ 实现 checkNewUser() 函数 - 检测新用户逻辑
- ✅ 实现 rewardUserWithCredits() 函数 - Credit 授予逻辑
- ✅ 实现 checkAndRewardNewUser() 函数 - 组合操作
- ✅ 集成到 NextAuth signIn 回调
- ✅ 创建 WelcomeSnackbar UI 组件
- ✅ 创建 CreditDisplay UI 组件
- ✅ 添加 API 端点支持测试
- ✅ 使用数据库事务确保原子性
- ✅ 使用乐观锁防止并发授予
- ✅ 添加错误处理和日志记录

**2026-02-05 - Code Review Fixes Applied**
- ✅ 移除所有 test.skip() - 启用测试 GREEN Phase
- ✅ 添加 API 认证保护（session 验证）
- ✅ 修复错误处理 - 返回实际余额而非硬编码 0
- ✅ 添加用户只能操作自己账户的安全检查

---

**Story 生成完成时间**: 2026-02-04
**Story 实现完成时间**: 2026-02-05
**代码审查完成时间**: 2026-02-05

**前置依赖**: Story 1-1 (OAuth 基础设置) ✅ 已完成

**下一步**:
1. 提交代码 (YOLO Dev Flow Step 5)
2. 可以并行开发 Story 1-3, 1-4, 或 1-5
