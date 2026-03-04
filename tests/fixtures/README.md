# 测试 Fixtures 工厂使用指南

## 📖 概述

测试 Fixtures 工厂提供统一的测试数据创建和管理接口，解决以下问题：

- ✅ **消除重复代码** - 不再需要在每个测试中重复创建用户、图片等数据
- ✅ **自动管理外键依赖** - 自动处理表之间的依赖关系
- ✅ **可靠的清理机制** - 自动按正确顺序清理测试数据
- ✅ **预定义测试场景** - 快速创建常用测试场景
- ✅ **类型安全** - 完整的 TypeScript 类型支持

## 🚀 快速开始

### 基础用法

```typescript
import { createAnalysisFixtures, TestScenario } from '@/tests/fixtures';

describe('我的测试', () => {
  const fixtures = createAnalysisFixtures();

  beforeEach(async () => {
    // 创建已认证的用户
    const userId = await fixtures.createAuthenticatedUser({
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  afterEach(async () => {
    // 自动清理所有测试数据
    await fixtures.cleanup();
  });

  it('应该执行某些操作', async () => {
    // 测试代码...
  });
});
```

### 使用预定义场景

```typescript
it('应该返回批量任务状态', async () => {
  // 快速创建一个"进行中"的批量任务场景
  const { userId, taskId } = await fixtures.createScenario(
    TestScenario.BATCH_PROCESSING
  );

  // 执行测试...
  const response = await GET(
    new Request(`http://localhost:3000/api/analysis/${taskId}/status`),
    { params: Promise.resolve({ id: String(taskId) }) }
  );

  expect(response.status).toBe(200);
});
```

### 可用的测试场景

| 场景 | 描述 |
|------|------|
| `TestScenario.BATCH_PROCESSING` | 批量任务进行中（部分完成） |
| `TestScenario.BATCH_COMPLETED` | 批量任务已完成 |
| `TestScenario.BATCH_FAILED` | 批量任务失败 |
| `TestScenario.STANDARD_COMPLETED` | 标准分析已完成 |
| `TestScenario.STANDARD_FAILED` | 标准分析失败 |

## 📚 高级用法

### 精细控制（使用底层构建器）

```typescript
it('应该处理自定义场景', async () => {
  const db = fixtures.getDbBuilder();

  // 创建用户
  const userId = await db.createUser({
    creditBalance: 1000,
    subscriptionTier: 'premium'
  });

  // 创建图片
  const imageId1 = await db.createImage(userId, {
    fileFormat: 'PNG',
    width: 1920,
    height: 1080
  });

  const imageId2 = await db.createImage(userId, {
    fileFormat: 'JPEG',
    width: 800,
    height: 600
  });

  // 创建任务
  const taskId = await db.createBatchTask(userId, {
    mode: 'parallel',
    totalImages: 2,
    status: 'processing'
  });

  // 测试代码...
});
```

### 认证控制

```typescript
it('应该返回 401 当用户未登录', async () => {
  // Mock 未登录状态
  fixtures.mockUnauthenticated();

  const response = await GET(/* ... */);

  expect(response.status).toBe(401);
});
```

### 组合多个场景

```typescript
it('应该处理多用户场景', async () => {
  const db = fixtures.getDbBuilder();

  // 创建第一个用户
  const user1Id = await fixtures.createAuthenticatedUser();
  const task1Id = await db.createBatchTask(user1Id, {
    totalImages: 5,
    status: 'completed'
  });

  // 创建第二个用户
  const auth2 = createAuthContext();
  const session2 = auth2.createSession({ name: 'User 2' });
  auth2.mock();

  const user2Id = await db.createUser({
    id: session2.user.id,
    name: session2.user.name,
    email: session2.user.email
  });

  const task2Id = await db.createBatchTask(user2Id, {
    totalImages: 3,
    status: 'processing'
  });

  // 测试用户只能访问自己的任务...
});
```

## 🏗️ 架构设计

### 三层结构

```
┌─────────────────────────────────┐
│  AnalysisTestFixtures (Facade)  │  ← 高层次 API
│  - 预定义场景                    │
│  - 生命周期管理                  │
└─────────────────────────────────┘
           ↓                ↓
┌────────────────────┐  ┌─────────────────┐
│  TestDataBuilder   │  │  AuthContext     │
│  - 数据库实体工厂   │  │  - 认证 Mock     │
└────────────────────┘  └─────────────────┘
```

### 清理机制

Fixtures 使用**回调栈**来管理清理顺序：

1. 每次创建数据时注册清理回调
2. 回调按照**逆序**存储（保证外键约束）
3. `cleanup()` 时按顺序执行所有回调

```typescript
// 创建顺序：
await db.createUser(userId);      // 注册清理: [delete user]
await db.createImage(userId);      // 注册清理: [delete image, delete user]
await db.createBatchTask(userId);  // 注册清理: [delete task, delete image, delete user]

// cleanup() 执行顺序：
// 1. delete task  (最后创建，最先删除)
// 2. delete image
// 3. delete user (最先创建，最后删除)
```

## 🎯 最佳实践

### ✅ 推荐做法

1. **在 beforeEach 中设置 fixtures**
   ```typescript
   const fixtures = createAnalysisFixtures();
   beforeEach(async () => {
     await fixtures.createScenario(TestScenario.BATCH_PROCESSING);
   });
   ```

2. **在 afterEach 中清理**
   ```typescript
   afterEach(async () => {
     await fixtures.cleanup();
   });
   ```

3. **使用预定义场景**
   ```typescript
   const data = await fixtures.createScenario(TestScenario.BATCH_COMPLETED);
   ```

4. **为每个测试文件创建独立的 fixtures 实例**
   ```typescript
   describe('API 测试', () => {
     const fixtures = createAnalysisFixtures();
     // ...
   });
   ```

### ❌ 避免做法

1. ❌ 不要手动清理数据
   ```typescript
   // ❌ 错误
   await db.delete(user).where(eq(user.id, userId));

   // ✅ 正确
   await fixtures.cleanup(); // 自动清理
   ```

2. ❌ 不要跨测试共享 fixtures 实例
   ```typescript
   // ❌ 错误
   const globalFixtures = createAnalysisFixtures();

   // ✅ 正确
   describe('测试组', () => {
     const fixtures = createAnalysisFixtures();
   });
   ```

3. ❌ 不要忘记清理
   ```typescript
   // ❌ 错误
   beforeEach(async () => {
     await fixtures.createScenario(...);
   });
   // 缺少 afterEach cleanup!

   // ✅ 正确
   afterEach(async () => {
     await fixtures.cleanup();
   });
   ```

## 📋 迁移指南

### 从旧的测试代码迁移

**之前：**
```typescript
const mockUserId = `test-user-${Date.now()}`;
const taskId = generateUniqueTaskId();

// 手动创建用户
await db.insert(user).values({
  id: mockUserId,
  email: 'test@example.com',
  name: 'Test User',
  // ...
});

// 手动创建任务
await db.insert(batchAnalysisResults).values({
  id: taskId,
  userId: mockUserId,
  // ...
});
```

**之后：**
```typescript
const fixtures = createAnalysisFixtures();

// 一行代码完成！
const { userId, taskId } = await fixtures.createScenario(
  TestScenario.BATCH_PROCESSING
);
```

## 🧪 测试示例

查看 `tests/integration/analysis-status-api.test.ts` 中的完整示例。

## 🔗 相关文档

- [Vitest 集成测试文档](https://vitest.dev/guide/testing-database.html)
- [测试金字塔](https://martinfowler.com/articles/practical-test-pyramid.html)
- [固定装置模式](https://martinfowler.com/bliki/TestFixture.html)
