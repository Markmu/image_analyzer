# 测试数据 API - 实施指南

**状态：** 🔴 **阻塞项** - 需要后端实施

**优先级：** P0（Sprint 0 关键路径）

**风险分：** 9 - 数据污染导致假阳性失败

---

## 📋 概述

测试数据 API 提供两个端点用于测试数据的管理：

1. **POST /api/test/seed** - 创建测试数据（用户、任务、图片、credit）
2. **POST /api/test/cleanup** - 清理测试数据

**目的：** 实现测试隔离，防止数据污染

**参考文档：** [test-design-architecture.md#L338-L474](../../_bmad-output/test-design/test-design-architecture.md#L338-L474)

---

## 🔧 API 规范

### 1. POST /api/test/seed

**请求格式：**

```typescript
interface SeedRequest {
  fixtures: Array<{
    type: 'user' | 'task' | 'image' | 'credit';
    count?: number;
    overrides?: Record<string, any>;
  }>;
  options: {
    cleanupAfter?: 'test' | 'suite' | 'manual';
    tagged?: string[];
    testRunId?: string; // 自动生成或传入
  };
}

interface SeedResponse {
  created: {
    users: number;
    tasks: number;
    images: number;
    credits: number;
  };
  cleanupId: string; // 用于后续清理
  tags: string[];
  testRunId: string;
}
```

**示例请求：**

```json
{
  "fixtures": [
    {
      "type": "user",
      "overrides": {
        "role": "user",
        "creditBalance": 100
      }
    },
    {
      "type": "image",
      "count": 3
    },
    {
      "type": "credit",
      "overrides": {
        "amount": 50
      }
    }
  ],
  "options": {
    "cleanupAfter": "test",
    "tagged": ["upload-test", "p0"],
    "testRunId": "test-run-12345"
  }
}
```

**示例响应：**

```json
{
  "created": {
    "users": 1,
    "tasks": 0,
    "images": 3,
    "credits": 1
  },
  "cleanupId": "cleanup-67890",
  "tags": ["upload-test", "p0"],
  "testRunId": "test-run-12345"
}
```

---

### 2. POST /api/test/cleanup

**请求格式：**

```typescript
interface CleanupRequest {
  testRunId: string;
  cleanupId?: string; // 可选，如果只清理特定批次
  tagged?: string[]; // 可选，只清理特定标签的数据
}

interface CleanupResponse {
  deleted: {
    users: number;
    tasks: number;
    images: number;
    credits: number;
  };
  testRunId: string;
  success: boolean;
}
```

**示例请求：**

```json
{
  "testRunId": "test-run-12345",
  "tagged": ["upload-test"]
}
```

**示例响应：**

```json
{
  "deleted": {
    "users": 1,
    "tasks": 0,
    "images": 3,
    "credits": 1
  },
  "testRunId": "test-run-12345",
  "success": true
}
```

---

## 🏗️ 实施建议

### 后端实施要点

1. **仅在测试环境启用**
   ```typescript
   // middleware.ts
   if (process.env.NODE_ENV !== 'test') {
     return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
   }
   ```

2. **使用 Drizzle ORM 批量插入**
   ```typescript
   await db.insert(schema.users).values(usersData);
   ```

3. **所有测试数据必须包含 `testRunId`**
   ```typescript
   const userData = {
     ...overrides,
     metadata: {
       ...overrides.metadata,
       testRunId: options.testRunId,
       tags: options.tagged,
     },
   };
   ```

4. **级联删除**
   ```typescript
   // 删除用户时同时删除相关数据
   await db.transaction(async (tx) => {
     await tx.deleteFrom(testImages).where('testRunId', '=', testRunId);
     await tx.deleteFrom(testTasks).where('testRunId', '=', testRunId);
     await tx.deleteFrom(testUsers).where('testRunId', '=', testRunId);
   });
   ```

---

## 📝 测试用例示例

### 使用 seed API 的测试

```typescript
import { test, expect } from '@playwright/test';

test('用户上传图片并分析', async ({ page, request }) => {
  // 1. 创建测试数据
  const seedResponse = await request.post('/api/test/seed', {
    data: {
      fixtures: [
        { type: 'user', overrides: { credits: 100 } },
        { type: 'image', count: 3 }
      ],
      options: {
        cleanupAfter: 'test',
        tagged: ['upload-test']
      }
    }
  });

  const { cleanupId, testRunId } = await seedResponse.json();

  // 2. 使用测试数据
  await page.goto('/upload');
  // ... 上传图片测试 ...

  // 3. 测试结束后自动清理（通过 afterEach Hook）
});
```

### 使用 cleanup API 的 afterEach Hook

```typescript
// global-hooks.ts
test.afterEach(async ({ request }, testInfo) => {
  const testRunId = testInfo.testRunId || `test-${Date.now()}`;

  const cleanupResponse = await request.post('/api/test/cleanup', {
    data: { testRunId }
  });

  const { deleted, success } = await cleanupResponse.json();

  // 验证清理成功
  if (!success) {
    throw new Error(`Cleanup failed for testRunId ${testRunId}`);
  }

  console.log(`✅ Cleaned up test data:`, deleted);
});
```

---

## 🚀 迁移策略

### 阶段 1：API 实施（Sprint 0）

- [ ] 创建 `/api/test/seed` 端点
- [ ] 创建 `/api/test/cleanup` 端点
- [ ] 添加测试环境检查中间件
- [ ] 编写 API 单元测试

### 阶段 2：集成到测试框架（Sprint 0）

- [ ] 更新 `global-setup.ts` 调用 seed API
- [ ] 更新 `global-teardown.ts` 调用 cleanup API
- [ ] 更新 fixtures 使用 seed API
- [ ] 添加 afterEach cleanup hook

### 阶段 3：验证（Sprint 0）

- [ ] 运行测试套件验证隔离
- [ ] 并行运行 10 个测试验证无冲突
- [ ] 检查数据库无残留数据

---

## ⚠️ 注意事项

1. **仅测试环境**
   - 这些 API 必须仅在 `NODE_ENV=test` 时可用
   - 生产环境应返回 403 Forbidden

2. **性能考虑**
   - Seed API 应支持批量插入（`db.insert().values([...])`）
   - Cleanup API 应使用事务保证原子性

3. **错误处理**
   - Seed 失败应返回详细错误信息
   - Cleanup 失败应抛出异常（防止数据污染）

4. **测试标识**
   - 所有测试数据必须标记 `testRunId`
   - 支持 `tagged` 分组清理
   - 生成唯一 `cleanupId` 用于追踪

---

## 📊 成功标准

- [x] Seed API 可以创建用户、图片、任务、credit
- [x] Cleanup API 可以按 testRunId 删除数据
- [x] 并行测试无数据竞争
- [x] 测试后数据库无残留数据
- [x] 清理失败时测试抛出异常

---

**下一步行动：**

1. 后端开发团队实施这两个 API 端点
2. QA 团队编写 API 集成测试
3. 验证测试隔离策略有效性

**负责人：** 后端开发
**时间线：** Sprint 0（阻塞测试开发）
**验证：** 测试后数据库查询返回 0 条记录
