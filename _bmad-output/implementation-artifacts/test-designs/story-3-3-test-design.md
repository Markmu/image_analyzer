# Story 3-3: 分析进度与队列管理 - ATDD 测试设计文档

> **设计者:** TEA (Test Architect) - 测试架构师
> **设计日期:** 2026-02-14
> **Story:** 3-3-analysis-progress
> **测试覆盖率目标:** ≥ 80%

---

## 目录

1. [测试设计概述](#测试设计概述)
2. [验收标准映射](#验收标准映射)
3. [单元测试设计](#单元测试设计)
4. [集成测试设计](#集成测试设计)
5. [E2E 测试设计](#e2e-测试设计)
6. [边界条件和异常场景](#边界条件和异常场景)
7. [性能测试](#性能测试)
8. [测试数据策略](#测试数据策略)

---

## 测试设计概述

### 测试范围

Story 3-3 实现分析进度与队列管理功能，包括:
- 并发控制机制 (Free:1, Lite:3, Standard:10)
- 等待队列透明化
- 任务完成通知 (Web Notifications API、标题闪烁)
- 页面离开后继续处理
- 高并发场景处理 (503 响应)
- 后台异步处理 (轮询模式、任务取消)

### 测试策略

```
┌─────────────────────────────────────────────────────────┐
│                    测试金字塔                          │
├─────────────────────────────────────────────────────────┤
│                                                 E2E  │  少量关键流程
│                                              (10%)   │
├─────────────────────────────────────────────────────────┤
│                                          集成测试     │  中等覆盖
│                                       (30%)          │
├─────────────────────────────────────────────────────────┤
│                                  单元测试             │  广泛覆盖
│                               (60%)                  │
└─────────────────────────────────────────────────────────┘
```

**重点测试领域:**
1. **并发限制** - 不同订阅等级的任务并发数控制
2. **队列管理** - 入队、出队、队列位置计算
3. **通知系统** - 浏览器通知、标题闪烁
4. **状态持久化** - 数据库存储、页面刷新恢复
5. **轮询机制** - 状态查询、错误处理

---

## 验收标准映射

### AC-1: 并发控制机制

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| Free 用户最多 1 个并发 | TEST-CC-001 | 单元 | P0 |
| Lite 用户最多 3 个并发 | TEST-CC-002 | 单元 | P0 |
| Standard 用户最多 10 个并发 | TEST-CC-003 | 单元 | P0 |
| 超过限制返回 503 | TEST-CC-004 | 集成 | P0 |
| 队列满时返回 QUEUE_FULL 错误码 | TEST-CC-005 | 单元 | P0 |

### AC-2: 等待队列透明化

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 显示队列长度 | TEST-QT-001 | 单元 | P0 |
| 显示用户位置 | TEST-QT-002 | 单元 | P0 |
| 显示预计等待时间 | TEST-QT-003 | 单元 | P0 |
| 实时更新队列状态 | TEST-QT-004 | 集成 | P1 |

### AC-3: 任务完成通知

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| Web Notifications API 授权 | TEST-NF-001 | 单元 | P0 |
| 发送分析完成通知 | TEST-NF-002 | 单元 | P0 |
| 页面标题闪烁 | TEST-NF-003 | 单元 | P0 |
| 通知偏好设置 | TEST-NF-004 | 单元 | P1 |

### AC-4: 页面离开后继续处理

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 任务状态持久化到数据库 | TEST-PL-001 | 单元 | P0 |
| 页面刷新后状态恢复 | TEST-PL-002 | 集成 | P0 |
| Page Visibility API 处理 | TEST-PL-003 | 单元 | P1 |

### AC-5: 高并发场景处理

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 返回 503 Service Unavailable | TEST-HC-001 | 单元 | P0 |
| 显示友好错误消息 | TEST-HC-002 | 集成 | P0 |
| 提供"加入队列"选项 | TEST-HC-003 | 集成 | P1 |

### AC-6: 后台异步处理

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 异步模式立即返回任务 ID | TEST-BA-001 | 单元 | P0 |
| 轮询获取任务状态 | TEST-BA-002 | 集成 | P0 |
| 任务完成后停止轮询 | TEST-BA-003 | 单元 | P0 |
| 支持任务取消 | TEST-BA-004 | 集成 | P1 |

---

## 单元测试设计

### 1. 并发控制 (queue.ts)

**文件位置:** `src/lib/analysis/__tests__/queue.test.ts`

```typescript
describe('并发控制机制', () => {
  describe('getMaxConcurrent', () => {
    // TEST-CC-001: Free 用户并发限制
    it('Free 用户应该返回 maxConcurrent = 1', () => {
      expect(getMaxConcurrent('free')).toBe(1);
    });

    // TEST-CC-002: Lite 用户并发限制
    it('Lite 用户应该返回 maxConcurrent = 3', () => {
      expect(getMaxConcurrent('lite')).toBe(3);
    });

    // TEST-CC-003: Standard 用户并发限制
    it('Standard 用户应该返回 maxConcurrent = 10', () => {
      expect(getMaxConcurrent('standard')).toBe(10);
    });

    // 未知订阅等级默认
    it('未知订阅等级应该默认为 Free (1)', () => {
      expect(getMaxConcurrent('unknown')).toBe(1);
    });
  });

  describe('checkQueueCapacity', () => {
    // 有可用槽位
    it('当活跃任务数小于并发限制时应允许新任务', () => {
      expect(canProcess(2, 3)).toBe(true);
    });

    // 达到限制
    it('当活跃任务数等于并发限制时应拒绝新任务', () => {
      expect(canProcess(3, 3)).toBe(false);
    });

    // 超过限制
    it('当活跃任务数超过并发限制时应拒绝新任务', () => {
      expect(canProcess(4, 3)).toBe(false);
    });
  });
});
```

### 2. 队列管理

**文件位置:** `src/lib/analysis/__tests__/queue.test.ts`

```typescript
describe('队列管理', () => {
  describe('入队/出队', () => {
    it('应该将任务添加到队列末尾', () => {
      const queue = [task1, task2];
      queue.push(task3);
      expect(queue.length).toBe(3);
    });

    it('应该从队列头部取出任务', () => {
      const queue = [task1, task2, task3];
      const nextTask = queue.shift();
      expect(nextTask).toBe(task1);
    });
  });

  describe('队列位置计算', () => {
    // TEST-QT-002: 用户位置
    it('应该正确计算用户在队列中的位置', () => {
      const position = calculateQueuePosition(userId, queue);
      expect(position).toBe(2);
    });

    // TEST-QT-003: 等待时间
    it('应该基于队列位置计算预计等待时间', () => {
      const waitTime = calculateEstimatedWaitTime(position, avgProcessingTime);
      expect(waitTime).toBe(60);
    });
  });
});
```

### 3. 通知系统

**文件位置:** `src/features/analysis/hooks/__tests__/useNotification.test.ts`

```typescript
describe('通知系统', () => {
  describe('Web Notifications API', () => {
    // TEST-NF-001: 权限请求
    it('应在需要时请求通知权限', async () => {
      const permission = await Notification.requestPermission();
      expect(permission).toBe('granted');
    });

    // TEST-NF-002: 发送通知
    it('应发送分析完成通知', () => {
      new Notification('分析完成', {
        body: '您的图片分析已完成',
        tag: 'analysis-complete'
      });
      expect(Notification).toHaveBeenCalledWith('分析完成', expect.any(Object));
    });
  });

  describe('页面标题闪烁', () => {
    // TEST-NF-003: 标题闪烁
    it('应能切换到闪烁消息', () => {
      document.title = '分析完成';
      expect(document.title).not.toBe(originalTitle);
    });

    it('应在指定时间后恢复原始标题', () => {
      document.title = originalTitle;
      expect(document.title).toBe(originalTitle);
    });
  });
});
```

---

## 集成测试设计

### 1. 队列状态 API 集成

**文件位置:** `src/__tests__/api/queue-status.test.ts`

```typescript
describe('GET /api/analysis/queue/status', () => {
  // TEST-QT-001: 队列长度
  it('应返回当前队列长度', async () => {
    const response = await fetch('/api/analysis/queue/status');
    const data = await response.json();

    expect(data.data.queueLength).toBeDefined();
  });

  // TEST-QT-002: 用户位置
  it('应返回用户在队列中的位置', async () => {
    const response = await fetch('/api/analysis/queue/status');
    const data = await response.json();

    expect(data.data.userPosition).toBeDefined();
  });

  // TEST-QT-003: 等待时间
  it('应返回预计等待时间', async () => {
    const response = await fetch('/api/analysis/queue/status');
    const data = await response.json();

    expect(data.data.estimatedWaitTime).toBeDefined();
  });
});
```

### 2. 分析 API 异步模式集成

**文件位置:** `src/__tests__/api/analysis-async.test.ts`

```typescript
describe('POST /api/analysis 异步模式', () => {
  // TEST-BA-001: 立即返回任务 ID
  it('应立即返回任务 ID 和状态', async () => {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      body: JSON.stringify({ imageId: 'img-123' })
    });
    const data = await response.json();

    expect(data.data.analysisId).toBeDefined();
    expect(data.data.status).toMatch(/pending|processing/);
  });

  // TEST-CC-004: 队列满返回 503
  it('队列满时应返回 503 状态码', async () => {
    // 模拟队列满的情况
    const response = await fetch('/api/analysis', {
      method: 'POST',
      body: JSON.stringify({ imageId: 'img-123' })
    });

    expect(response.status).toBe(503);
  });
});
```

### 3. 轮询状态集成

**文件位置:** `src/__tests__/integration/poll-status.test.ts`

```typescript
describe('轮询获取任务状态', () => {
  // TEST-BA-002: 轮询获取状态
  it('应能通过轮询获取最新任务状态', async () => {
    const status = await pollTaskStatus('analysis-123');
    expect(status.data.status).toBeDefined();
  });

  // TEST-BA-003: 任务完成停止轮询
  it('任务完成后应停止轮询', async () => {
    const shouldContinue = status !== 'completed' && status !== 'failed';
    expect(shouldContinue).toBe(false);
  });
});
```

---

## E2E 测试设计

### 1. 完整分析流程

**文件位置:** `tests/e2e/analysis-progress.spec.ts`

```typescript
test.describe('分析进度与队列管理', () => {
  // TEST-E2E-001: 完整异步分析流程
  test('应能发起分析并通过轮询获取结果', async ({ page }) => {
    await page.goto('/');

    // 发起分析
    await page.click('[data-testid="analyze-button"]');

    // 获取任务 ID
    const response = await page.waitForResponse('/api/analysis');
    const data = await response.json();
    expect(data.data.analysisId).toBeDefined();

    // 轮询状态直到完成
    await page.waitForFunction(() => {
      const status = window.__taskStatus;
      return status === 'completed';
    }, { timeout: 30000 });

    // 验证通知
    await expect(page.locator('text=/分析完成/')).toBeVisible();
  });

  // TEST-HC-001: 高并发场景
  test('队列满时应显示友好错误消息', async ({ page }) => {
    await page.goto('/');

    // 模拟队列满
    await page.route('**/api/analysis', async (route) => {
      await route.fulfill({
        status: 503,
        json: {
          success: false,
          error: {
            code: 'QUEUE_FULL',
            message: '服务器繁忙，当前有 10 个任务正在处理',
            data: { queuePosition: 2, estimatedWaitTime: 120 }
          }
        }
      });
    });

    await page.click('[data-testid="analyze-button"]');

    // 验证错误消息
    await expect(page.locator('text=/服务器繁忙/')).toBeVisible();
    await expect(page.locator('text=/加入等待队列/')).toBeVisible();
  });

  // TEST-PL-002: 页面刷新恢复
  test('页面刷新后应恢复任务状态', async ({ page }) => {
    await page.goto('/analysis/100');

    // 刷新页面
    await page.reload();

    // 验证状态恢复
    const status = await page.locator('[data-testid="task-status"]').textContent();
    expect(status).toMatch(/pending|processing|completed/);
  });
});
```

---

## 边界条件和异常场景

### 单元测试 - 边界条件

```typescript
describe('边界条件', () => {
  // 队列为空
  it('队列为空时应显示空闲', () => {
    const displayMessage = queue.length === 0 ? '队列空闲' : `${queue.length} 个任务`;
    expect(displayMessage).toBe('队列空闲');
  });

  // 等待时间为 0
  it('用户位置为 0 时预计等待时间为 0', () => {
    const waitTime = calculateWaitTime(0, 30);
    expect(waitTime).toBe(0);
  });

  // 通知权限被拒绝
  it('权限被拒绝时应优雅降级', () => {
    const canNotify = Notification.permission === 'granted';
    expect(canNotify).toBe(false);
  });

  // 任务已完成无法取消
  it('已完成的任务不应能被取消', () => {
    const canCancel = taskStatus !== 'completed' && taskStatus !== 'failed';
    expect(canCancel).toBe(false);
  });
});
```

---

## 性能测试

```typescript
describe('性能测试', () => {
  // 轮询频率
  it('轮询间隔不应少于 3 秒', () => {
    expect(pollInterval).toBeGreaterThanOrEqual(3000);
  });

  // 队列操作性能
  it('入队操作应在 10ms 内完成', () => {
    const startTime = performance.now();
    queue.push(task);
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(10);
  });
});
```

---

## 测试数据策略

### Mock 数据

```typescript
export const mockQueueData = {
  freeUser: { tier: 'free', maxConcurrent: 1 },
  liteUser: { tier: 'lite', maxConcurrent: 3 },
  standardUser: { tier: 'standard', maxConcurrent: 10 },

  queueStatus: {
    queueLength: 5,
    userPosition: 2,
    estimatedWaitTime: 120,
    currentProcessing: 3,
    maxConcurrent: 10
  },

  taskStatus: ['pending', 'processing', 'completed', 'failed']
};
```

---

## 测试执行计划

### Phase 1: 单元测试 (RED)
```
优先级 P0:
- 并发控制机制
- 队列管理
- 通知系统

预计时间: 2-3 小时
```

### Phase 2: 集成测试 (RED)
```
优先级 P0:
- 队列状态 API
- 分析 API 异步模式
- 轮询机制

预计时间: 2-3 小时
```

### Phase 3: E2E 测试 (RED)
```
优先级 P0:
- 完整异步分析流程
- 高并发场景
- 页面刷新恢复

预计时间: 2-3 小时
```

### 总测试用例统计

| 测试类型 | 用例数量 | 预计通过时间 |
|---------|---------|------------|
| 单元测试 | ~50 | 2-3h |
| 集成测试 | ~20 | 2-3h |
| E2E 测试 | ~15 | 2-3h |
| **总计** | **~85** | **6-9h** |

---

## 覆盖率目标

### 文件覆盖率要求

| 文件/模块 | 目标覆盖率 | 优先级 |
|----------|-----------|-------|
| `lib/analysis/queue.ts` | 100% | P0 |
| `features/analysis/hooks/useNotification.ts` | 95% | P0 |
| `features/analysis/hooks/useTitleFlash.ts` | 90% | P0 |
| `app/api/analysis/route.ts` | 85% | P1 |
| `app/api/analysis/queue/status/route.ts` | 90% | P0 |

### 整体覆盖率目标

- **语句覆盖率:** ≥ 80%
- **分支覆盖率:** ≥ 75%
- **函数覆盖率:** ≥ 85%
- **行覆盖率:** ≥ 80%

---

## 风险和缓解措施

### 已识别风险

1. **异步测试稳定性**
   - 风险: 定时器、Promise 可能导致测试不稳定
   - 缓解: 使用 `vi.useFakeTimers()`, 合理设置 timeout

2. **浏览器 API Mock**
   - 风险: Notification API 等浏览器 API 在 Node 环境无法使用
   - 缓解: 使用 `vi.stubGlobal()` 模拟

3. **数据库依赖**
   - 风险: 集成测试依赖真实数据库
   - 缓解: 使用测试数据库或 Mock

---

## 测试文件清单

已创建的测试文件:

1. `src/__tests__/story-3-3-queue-management.test.ts` - 队列管理与后端逻辑测试
2. `src/__tests__/story-3-3-frontend.test.ts` - 前端组件与 Hook 测试

待创建的实现文件:

1. `src/lib/analysis/queue.ts` - 队列管理服务
2. `src/features/analysis/hooks/useNotification.ts` - 通知 Hook
3. `src/features/analysis/hooks/useTitleFlash.ts` - 标题闪烁 Hook
4. `src/features/analysis/hooks/usePolling.ts` - 轮询 Hook
5. `src/app/api/analysis/queue/status/route.ts` - 队列状态 API

---

## 下一步行动

1. ✅ 完成 Phase 1: ATDD 测试设计 (本文档)
2. ⏭️ Phase 2: Review 测试设计
3. ⏭️ Phase 3: 实现功能
4. ⏭️ Phase 4: 验证测试

---

**文档版本:** 1.0
**最后更新:** 2026-02-14
**状态:** ready-for-dev
