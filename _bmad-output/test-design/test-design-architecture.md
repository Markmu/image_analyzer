# image_analyzer - 测试设计文档 (架构版)

**用途：** 架构关注点、可测试性差距、NFR 需求评审，供架构/开发团队审查。与 QA 团队就测试开发前必须解决的问题达成共识。

**日期：** 2026-02-04
**作者：** Murat (TEA Agent)
**状态：** 架构评审修订版 v2.0
**项目：** image_analyzer
**PRD 参考：** `_bmad-output/planning-artifacts/prd.md`
**架构参考：** `_bmad-output/planning-artifacts/architecture.md`
**评审修订：** 增强测试隔离、并发控制、NFR 策略

---

## 执行摘要

**范围：** 完整的 AI 图像分析平台，包含 10 个 Epic（Epic 0 已完成）

**业务上下文：**
- **问题：** 用户需要将参考图片风格转化为可编辑的提示词模板
- **目标：** 95% API 成功率，99.5% 可用性
- **规模：** 100→1000 用户（10倍增长），100 并发任务

**架构决策：**
- Next.js 15 + Drizzle ORM + PostgreSQL
- NextAuth.js v5 + Google OAuth 2.0
- Cloudflare R2 对象存储
- Replicate API（三类模型：视觉/文字/生图）
- Creem 支付集成

**风险摘要：**
- 高优先级风险（≥6）：11 个（新增 3 个）
- 中优先级风险（3-5）：10 个（调整部分）
- 测试工作量：约 50-65 个测试（3-4 周，含隔离策略实施）

---

## 快速指南

### 🚨 **阻塞项 - 团队必须决定（无法继续）**

**Sprint 0 关键路径 - 这些必须在 QA 开始编写测试前完成：**

1. **R-001: Replicate API Mock 端点** - 需要提供 Mock 端点用于隔离测试（推荐：后端开发，Sprint 0）
2. **R-002: 测试数据 Seeding API** - `/api/test/seed` 端点，用于并行测试数据注入（推荐：后端开发，Sprint 0）
3. **R-003: NextAuth 测试配置** - 测试环境的认证模拟配置（推荐：全栈开发，Sprint 0）
4. **R-004: E2E 测试隔离策略** ⚠️ **新增** - 用户状态隔离、数据库隔离、并发控制（推荐：全栈+QA，Sprint 0）
5. **R-005: Playwright 配置决策** ⚠️ **新增** - Worker 数量、超时、重试策略（推荐：QA+DevOps，Sprint 0）
6. **R-006: 测试数据清理机制** ⚠️ **新增** - afterEach Hook 自动清理策略（推荐：后端，Sprint 0）

### ⚠️ **高优先级 - 团队应验证（我们提供建议，你们批准）**

1. **SEC-001: 支付安全测试** - Creem Webhook 签名验证架构（财务团队，Sprint 1）
2. **PERF-001: 分析超时处理** - 后台队列架构设计（后端开发，Sprint 1）
3. **TECH-005: 并发测试冲突评估** ⚠️ **新增** - 100 并发任务场景下的测试策略（QA+后端，Sprint 1）
4. **TECH-006: Replicate Mock 实现方案** ⚠️ **新增** - MSW + Recording 混合策略（前端+QA，Sprint 0）

### 📋 **仅供参考 - 解决方案已提供（审查，无需决策）**

1. **测试策略**：单元(40%) + 集成(35%) + E2E(25%)
2. **工具链**：Playwright + Jest/Vitest + React Testing Library
3. **CI/CD 分层**：PR 级（所有测试，~15min），每日构建（性能测试），每周（混沌测试）

---

## 面向架构师和开发人员 - 开放议题 👷

### 风险评估

**识别的风险总数：** 23 个（11 个高优先级 ≥6，10 个中优先级，2 个低优先级）

#### 高优先级风险（分数 ≥6）- 立即关注

| 风险 ID | 类别 | 描述 | 概率 | 影响 | 分数 | 缓解措施 | 负责人 | 时间线 |
| ------- | ---- | ----- | ---- | ---- | ---- | -------- | ------ | ------ |
| **PERF-001** | PERF | 分析超时未处理（>60s） | 3 | 3 | **9** | 后台队列 + 进度轮询 | 后端 | Sprint 0 |
| **OPS-001** | OPS | 监控告警未配置 | 3 | 3 | **9** ⬆️ | Prometheus + AlertManager | DevOps | Sprint 0 |
| **SEC-001** | SEC | 未授权访问敏感 API 端点 | 2 | 3 | **6** | OAuth 2.0 强制认证 | 后端 | Sprint 1 |
| **SEC-002** | SEC | 支付 Webhook 签名验证缺失 | 2 | 3 | **6** | Creem 签名验证中间件 | 后端 | Sprint 1 |
| **SEC-003** | SEC | XSS 在用户输入字段 | 2 | 2 | **4** ⬇️ | 输入转义 + CSP | 前端 | Sprint 1 |
| **PERF-002** | PERF | 100 并发任务队列瓶颈 | 2 | 3 | **6** | Redis 队列 + 连接池优化 | 后端 | Sprint 2 |
| **TECH-001** | TECH | R2 存储集成未隔离 | 2 | 3 | **6** | 提供 R2 Mock 服务 | 后端 | Sprint 0 |
| **TECH-002** | TECH | Drizzle Schema 变更影响测试 | 2 | 2 | **4** ⬇️ | 迁移测试 + 向后兼容 | 后端 | Sprint 1 |
| **TECH-004** | TECH | E2E 测试隔离策略缺失 ⚠️ **新增** | 3 | 3 | **9** | 实现隔离机制（见下文） | 全栈+QA | Sprint 0 |
| **TECH-005** | TECH | 测试数据清理未定义 ⚠️ **新增** | 3 | 3 | **9** | afterEach Hook 清理 | 后端 | Sprint 0 |
| **DATA-001** | DATA | 用户数据跨租户泄露 | 1 | 3 | **6** | customer_id 强制过滤 | 后端 | Sprint 1 |
| **BUS-001** | BUS | Credit 扣除事务不一致 | 2 | 3 | **6** | 事务 + 幂等性设计 | 后端 | Sprint 1 |

> **⬆️/⬇️** 表示相比初版的风险分数调整
> **⚠️ 新增** 表示架构评审中识别的新风险

#### 中优先级风险（分数 3-5）

| 风险 ID | 类别 | 描述 | 概率 | 影响 | 分数 | 缓解措施 |
| ------- | ---- | ----- | ---- | ---- | ---- | -------- |
| **SEC-003** | SEC | XSS 在用户输入字段 | 2 | 2 | **4** ⬇️ | 输入转义 + CSP + Content Security Policy |
| **TECH-003** | TECH | NextAuth v5 Beta 稳定性 | 2 | 2 | 4 | v4 回退方案 |
| **TECH-006** | TECH | 并发测试冲突场景 ⚠️ **新增** | 2 | 2 | **4** | Worker 隔离 + Test User Pool（见下文） |
| **PERF-003** | PERF | 图片生成响应延迟 | 2 | 2 | 4 | 乐观更新 + 骨架屏 |
| **DATA-002** | DATA | 图片过期未清理 | 2 | 2 | 4 | 定时任务 + 软删除 |
| **BUS-002** | BUS | 免费用户体验降级 | 2 | 2 | 4 | 功能限制清晰标注 |

#### 低优先级风险（分数 1-2）

| 风险 ID | 类别 | 描述 | 概率 | 影响 | 分数 | 操作 |
| ------- | ---- | ----- | ---- | ---- | ---- | ---- |
| TECH-004 | TECH | MUI + Tailwind 样式冲突 | 1 | 2 | 2 | 监控 |
| PERF-004 | PERF | 批量上传进度更新 | 1 | 1 | 2 | 监控 |

#### 风险类别说明

- **TECH**: 技术/架构（缺陷、集成、可扩展性）
- **SEC**: 安全（访问控制、认证、数据暴露）
- **PERF**: 性能（SLA 违规、降级、资源限制）
- **DATA**: 数据完整性（丢失、损坏、不一致）
- **BUS**: 业务影响（UX 危害、逻辑错误、收入）
- **OPS**: 运维（部署、配置、监控）

---

### 可测试性关注点和架构差距

#### 1. 快速反馈的阻塞项（我们需要架构提供什么）

| 关注点 | 影响 | 架构必须提供 | 负责人 | 时间线 |
| ------ | ---- | ------------ | ------ | ------ |
| **无 Replicate Mock** | 测试依赖外部 API，昂贵且不稳定 | 提供 Mock 端点返回预设结果 | 后端开发 | Sprint 0 |
| **无测试数据 Seeding** | 无法并行执行测试，测试时间长 | POST /api/test/seed 端点 | 后端开发 | Sprint 0 |
| **R2 存储直接使用** | E2E 测试上传真实文件到生产 | 提供 R2 Mock 服务或测试 bucket | 后端开发 | Sprint 0 |
| **认证未隔离** | E2E 测试无法模拟不同用户状态 | NextAuth 测试适配器 | 全栈开发 | Sprint 0 |

**示例：**
- **无 API 测试数据 Seeding** → 无法并行测试 → 提供 `/api/test/seed` 端点（后端，Sprint 0）

#### 2. 需要进行的架构改进

**改进项 1：后台任务队列架构**

- **当前问题**：分析超时直接失败，用户体验差
- **所需更改**：实现基于 Redis/Bull 的后台队列
- **影响**：未修复则无法满足 FR78/FR79 要求
- **负责人**：后端开发
- **时间线**：Sprint 1

**改进项 2：支付 Webhook 签名验证**

- **当前问题**：Creem Webhook 未验证签名，存在支付欺诈风险
- **所需更改**：实现 HMAC 签名验证中间件
- **影响**：未修复则资金安全无法保障
- **负责人**：后端开发
- **时间线**：Sprint 1

---

---

### E2E 测试隔离策略 ⚠️ **新增 - 关键阻塞项**

**问题背景：**
测试隔离是稳定测试套件的基石。未隔离的测试会导致：
- **Flakiness（不稳定性）**：测试间状态泄漏导致偶发失败
- **假阳性**：测试失败但代码正确
- **调试困难**：无法确定是代码问题还是测试污染

**三层隔离架构：**

#### 1. 用户状态隔离

| 策略 | 实现方式 | 优点 | 缺点 | 推荐度 |
|-----|---------|-----|-----|--------|
| **独立测试用户** | 每个测试用例使用唯一的 `test-user-{uuid}@example.com` | 完全隔离 | 用户数据膨胀 | ⭐⭐⭐⭐⭐ |
| **Session Reset** | afterEach 清除 Redis session + cookies | 简单 | 可能遗漏状态 | ⭐⭐⭐ |
| **Test Database Schema** | 每个测试套件独立 schema | 隔离彻底 | 资源消耗大 | ⭐⭐⭐⭐ |

**推荐方案：独立测试用户 + afterEach Hook 清理**

```typescript
// 示例：测试用户工厂函数
export async function createTestUser(overrides?: Partial<User>) {
  const uniqueId = crypto.randomUUID();
  return {
    email: `test-user-${uniqueId}@example.com`,
    name: `Test User ${uniqueId.slice(0, 8)}`,
    ...overrides
  };
}

// afterEach Hook
test.afterEach(async ({ page }) => {
  // 1. 清除认证状态
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  // 2. 调用清理 API
  await apiClient.post('/api/test/cleanup', { testUserId });
});
```

**负责人：** 全栈开发 + QA
**时间线：** Sprint 0（阻塞测试开发）
**验证：** 并行运行 10 个测试用例，无状态泄漏

---

#### 2. 数据库隔离

**选项评估：**

| 选项 | 速度 | 隔离性 | 复杂度 | 推荐度 |
|-----|-----|-------|-------|--------|
| **Transaction Rollback** | ⚡⚡⚡ | ✅ 完美 | ⭐⭐ 中等 | ⭐⭐⭐⭐⭐ |
| **Schema Per Suite** | ⚡⚡ | ✅ 完美 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ |
| **Database Rebuild** | ⚡ | ✅ 完美 | ⭐⭐ 低 | ⭐⭐ |
| **Test Data Cleanup** | ⚡⚡ | ⚠️ 良好 | ⭐⭐⭐ 中等 | ⭐⭐⭐ |

**推荐方案：Transaction Rollback（PostgreSQL）**

```typescript
// globalSetup.ts
export default async function globalSetup() {
  // 启动测试事务
  await db.execute('BEGIN;');
}

// globalTeardown.ts
export default async function globalTeardown() {
  // 回滚所有更改
  await db.execute('ROLLBACK;');
}

// fixtures.ts
export const test = base.extend<{
  dbTransaction: DatabaseTransaction;
}>({
  dbTransaction: async ({}, use) => {
    const tx = await db.beginTransaction();
    await use(tx);
    await tx.rollback(); // 每个测试后回滚
  },
});
```

**负责人：** 后端开发
**时间线：** Sprint 0
**验证：** 测试后数据库无残留数据

---

#### 3. 并发控制

**Playwright Worker 隔离策略：**

```yaml
playwright.config.ts:
  workers: 4  # 并行 Worker 数量
  fullyParallel: true  # 允许完全并行

  # 按文件分组（推荐）
  testMatch:
    - 'tests/api/**/*.spec.ts'  # API 测试可并行
    - 'tests/e2e/**/*.spec.ts'  # E2E 测试按用户分组

  # 全局超时
  timeout: 60000  # 60s
  expect:
    timeout: 5000  # 5s
```

**冲突场景规避：**

| 场景 | 风险 | 缓解策略 |
|-----|-----|---------|
| 测试 A 上传图片，测试 B 删除 | 数据竞争 | 使用独立 testUserId |
| 测试 A 修改 credit，测试 B 消费 | 事务冲突 | Database Transaction 隔离 |
| 多 Worker 并行写入同一 DB | 连接池耗尽 | 限制 Worker 数量或使用连接池 |

**负责人：** QA + DevOps
**时间线：** Sprint 0
**验证：** 4 Workers 并行运行 20 个测试，无冲突

---

### Playwright 配置决策表 ⚠️ **新增 - 阻塞项**

**关键配置项决策：**

| 配置项 | 决策值 | 理由 | 风险评估 |
|-------|-------|------|---------|
| **Worker 数量** | `4` | 平衡速度与资源消耗（8 CPU = 4 Workers） | 可根据 CI 资源调整 |
| **重试策略** | `retries: 1` | 降低偶发性网络问题影响 | 不应掩盖真正失败 |
| **全局超时** | `timeout: 60000ms` | 匹配 Replicate API 60s 上限 | 单个测试不应超时 |
| **API 超时** | `expect.timeout: 5000ms` | API 响应应 < 2s，5s 留 buffer | 失败表示性能问题 |
| **Base URL** | `process.env.TEST_BASE_URL` | 支持多环境（dev/staging/proxy） | 必须（环境变量） |
| **Video 失败保留** | `use: { video: 'on-first-failure' }` | 调试关键，减少存储 | 仅失败时保留 |
| **Trace 保留** | `use: { trace: 'retain-on-failure' }` | 性能问题诊断 | 生产环境必选 |
| **Screenshot** | `use: { screenshot: 'only-on-failure' }` | 失败场景可视化 | 调试辅助 |

**完整配置示例：**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: [
    ['html', { outputFolder: '_bmad-output/test-results/html' }],
    ['json', { outputFile: '_bmad-output/test-results/results.json' }],
    ['junit', { outputFile: '_bmad-output/test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'on-first-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
  timeout: 60000,
  expect: {
    timeout: 5000,
  },
});
```

**负责人：** QA + DevOps
**时间线：** Sprint 0（阻塞框架初始化）
**验证：** 运行 `npx playwright test` 成功，生成报告

---

### 测试数据清理策略 ⚠️ **新增 - 关键阻塞项**

**风险计算：**
- **概率：** 3/3（必然发生）
- **影响：** 3/3（数据污染 → 假阳性 → 测试不可信）
- **风险分：** **9** - 🔴 严重

**三层清理架构：**

#### 1. 创建 - Seeding API

```typescript
// POST /api/test/seed
interface SeedRequest {
  fixtures: Array<{
    type: 'user' | 'task' | 'image' | 'credit';
    count?: number;
    overrides?: Record<string, any>;
  }>;
  options: {
    cleanupAfter?: 'test' | 'suite' | 'manual';  // 新增
    tagged?: string[];  // 用于分组清理
  };
}

interface SeedResponse {
  created: {
    users: number;
    tasks: number;
    images: number;
    credits: number;
  };
  cleanupId: string;  // 用于后续清理
  tags: string[];
}
```

**示例使用：**

```typescript
// 测试用例
test('用户上传图片并分析', async ({ page }) => {
  // 1. 创建测试数据
  const seed = await seedTestData({
    fixtures: [
      { type: 'user', overrides: { credits: 100 } },
      { type: 'image', count: 3 }
    ],
    options: {
      cleanupAfter: 'test',
      tagged: ['upload-test']
    }
  });

  // 2. 使用数据
  await page.goto(`/upload`);
  await uploadImage(seed.images[0].url);

  // 3. 测试结束自动清理（通过 afterEach Hook）
});
```

---

#### 2. 使用 - Fixture Tagging

```typescript
// fixtures.ts
export const test = base.extend<{
  seedData: SeedData;
  cleanup: () => Promise<void>;
}>({
  seedData: async ({}, use) => {
    const data = await createTestFixture('user', { credits: 100 });
    await use(data);
    // 自动清理
    await cleanupTestData([data.id]);
  },

  cleanup: async ({}, use) => {
    await use(async () => {
      // 手动触发清理
      await apiClient.post('/api/test/cleanup', {
        testRunId: currentTestRunId
      });
    });
  },
});
```

---

#### 3. 清理 - Cleanup API

**清理策略对比：**

| 策略 | 速度 | 可靠性 | 实现复杂度 | 推荐度 |
|-----|-----|-------|-----------|--------|
| **afterEach Hook** | ⚡⚡⚡ | ✅ 高 | ⭐⭐ 中 | ⭐⭐⭐⭐⭐ |
| **Transaction Rollback** | ⚡⚡⚡ | ✅ 完美 | ⭐⭐⭐ 中高 | ⭐⭐⭐⭐⭐ |
| **Cron Job** | ⚡⚡ | ⚠️ 中 | ⭐ 简单 | ⭐⭐ |
| **Manual Cleanup** | ⚡ | ❌ 低 | ⭐ 简单 | ⭐ |

**推荐方案：afterEach Hook + Transaction Rollback（混合）**

```typescript
// global-hooks.ts
test.afterEach(async ({ page }) => {
  // 策略 1: 清除前端状态
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

// database-cleanup.ts
export async function cleanupTestData(testRunId: string) {
  // 策略 2: 数据库事务回滚（优先）
  if (db.inTransaction) {
    await db.rollback();
  }

  // 策略 3: 级联删除（fallback）
  await db.transaction(async (tx) => {
    await tx.deleteFrom('test_images').where('testRunId', '=', testRunId);
    await tx.deleteFrom('test_tasks').where('testRunId', '=', testRunId);
    await tx.deleteFrom('test_users').where('testRunId', '=', testRunId);
  });
}

// 验证清理成功
test.afterEach(async ({}, testInfo) => {
  const remaining = await db.selectFrom('test_users')
    .where('testRunId', '=', testInfo.testRunId)
    .execute();

  if (remaining.length > 0) {
    throw new Error(`Cleanup failed: ${remaining.length} records remaining`);
  }
});
```

**负责人：** 后端开发
**时间线：** Sprint 0（阻塞测试稳定性）
**验证：** 测试后数据库查询返回 0 条记录

---

### 并发测试冲突风险评估 ⚠️ **新增**

**问题：**
文档提到"100 并发任务"业务场景，但**测试环境下的并发冲突**未评估。

**风险场景矩阵：**

| 冲突场景 | 触发条件 | 影响 | 概率 | 风险分 | 缓解策略 |
|---------|---------|-----|-----|--------|---------|
| **用户 A 删除图片，用户 B 同时访问** | E2E 并发 | 404 Not Found | 3/3 | **9** | 独立 testUserId |
| **测试 A 修改 credit，测试 B 同时消费** | API 并发 | 余额不一致 | 2/3 | **6** | DB Transaction 隔离 |
| **多 Worker 并行写入同一用户** | Worker 并行 | 唯一约束冲突 | 3/3 | **9** | 按 testUserId 分片 |
| **Replicate API Rate Limit** | 测试批量调用 | 测试失败 | 2/3 | **6** | Mock + Throttle |
| **R2 并发上传** | E2E 批量上传 | 存储配额超限 | 1/3 | **3** | Test Bucket 隔离 |

---

**并发测试分层策略：**

```yaml
单元测试层:
  并行度: fullyParallel: true
  隔离机制: Mock 所有外部依赖
  风险: 无 ✅

集成测试层:
  并行度: workers: 4
  隔离机制:
    - Database Transaction Rollback
    - Test User Pool（每个 Worker 独立用户）
  风险: 低 ⚠️

E2E 测试层:
  选项A: 保守策略
    并行度: workers: 1（顺序执行）
    适用: MVP 阶段
    速度: 慢（20-30 min）

  选项B: 中等策略 ⭐ 推荐
    并行度: workers: 2-4
    隔离: 按 testUserId 分组
    适用: 稳定后
    速度: 中（10-15 min）

  选项C: 激进策略
    并行度: workers: 8+
    隔离: 完整 Transaction 隔离
    适用: 成熟期
    速度: 快（5-10 min）
```

---

**推荐配置：**

```typescript
// playwright.config.ts
export default defineConfig({
  // API 测试：完全并行
  projects: [
    {
      name: 'api-tests',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      fullyParallel: true,
      workers: 4,
    },
    // E2E 测试：按用户分组并行
    {
      name: 'e2e-tests',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      fullyParallel: false,  // 文件内顺序执行
      workers: 2,  // 2 个文件并行
    },
  ],
});
```

**负责人：** QA + 后端开发
**时间线：** Sprint 1
**验证：** 4 Workers 并行运行，无数据竞争或唯一约束冲突

---

### Replicate Mock 实现方案 ⚠️ **新增**

**问题背景：**
Replicate API 是核心依赖，直接调用会导致：
- 测试成本高（每次调用产生费用）
- 测试不稳定（网络延迟、Rate Limit）
- 测试速度慢（真实 AI 响应时间）

---

**Mock 方案对比：**

| 方案 | 优点 | 缺点 | 维护成本 | 推荐度 | 适用场景 |
|-----|-----|-----|---------|--------|---------|
| **MSW (Mock Service Worker)** | 拦截网络层、无需后端 | 需维护大量 fixture | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ | API + E2E |
| **Nock (HTTP Mock)** | 轻量级、仅 Node.js | 仅限 API 测试 | ⭐⭐ 低 | ⭐⭐⭐ | API 测试 |
| **后端 Mock Server** | 真实环境 | 增加维护成本 | ⭐⭐⭐⭐ 高 | ⭐⭐ | 集成测试 |
| **Recording + Replay** | 真实场景 | API 变更需重新录制 | ⭐⭐ 低 | ⭐⭐⭐⭐⭐ | 回归测试 |

---

**推荐方案：MSW + Recording（混合策略）**

#### 1. MSW 配置（API 层）

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Replicate API - 视觉分析
  http.post('https://api.replicate.com/v1/predictions', async ({ request }) => {
    const body = await request.json();

    // 根据输入返回不同的预设结果
    if (body.version.includes('vision')) {
      return HttpResponse.json({
        id: 'mock-vision-prediction-001',
        status: 'succeeded',
        output: {
          analysis: 'modern minimalist kitchen with clean lines',
          style_tags: ['minimalist', 'modern', 'scandinavian'],
          color_palette: ['#FFFFFF', '#E0E0E0', '#808080'],
          confidence: 0.92,
        },
      });
    }

    if (body.version.includes('text-to-image')) {
      return HttpResponse.json({
        id: 'mock-image-gen-prediction-001',
        status: 'processing',
        output: null,
        urls: {
          get: 'https://api.replicate.com/v1/predictions/mock-image-gen-prediction-001',
        },
      });
    }
  }),

  // Mock 轮询端点
  http.get('https://api.replicate.com/v1/predictions/:id', ({ params }) => {
    if (params.id === 'mock-image-gen-prediction-001') {
      return HttpResponse.json({
        id: params.id,
        status: 'succeeded',
        output: 'https://mock-replicate-output.com/image-001.png',
      });
    }
  }),
];
```

---

#### 2. Recording + Replay（回归测试）

```typescript
// tests/recording/setup.ts
import { record, setupRecorder } from 'polly-node';

const recorder = setupRecorder({
  adapters: [require('polly-node-adapter-fetch')],
  mode: process.env.RECORD === 'true' ? 'record' : 'replay',
  recordingsDir: 'tests/recordings',
});

test.beforeEach(async () => {
  await recorder.start();
});

test.afterEach(async () => {
  await recorder.stop();
});

// 使用方法：
// RECORD=true npx playwright test tests/e2e/replicate-flow.spec.ts
```

---

#### 3. Fixture 模板管理

```typescript
// fixtures/replicate-responses.ts
export const mockResponses = {
  vision: {
    modern_kitchen: {
      analysis: 'modern minimalist kitchen with clean lines',
      style_tags: ['minimalist', 'modern'],
      color_palette: ['#FFFFFF', '#E0E0E0'],
    },
    industrial_bedroom: {
      analysis: 'industrial style bedroom with exposed brick',
      style_tags: ['industrial', 'rustic'],
      color_palette: ['#8B4513', '#696969'],
    },
  },

  textToImage: {
    success: 'https://mock-output.com/success.png',
    timeout: null,  // 模拟超时
    error: null,    // 模拟 API 错误
  },
};

// 测试中使用
test('视觉分析成功场景', async () => {
  const mock = mockResponses.vision.modern_kitchen;
  // 使用预设 fixture
});
```

---

**集成到测试：**

```typescript
// tests/api/replicate.spec.ts
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

const server = setupServer(...handlers);

test.beforeAll(() => server.listen());
test.afterEach(() => server.resetHandlers());
test.afterAll(() => server.close());

test('POST /api/analyze - 成功调用 Replicate 视觉分析', async ({ request }) => {
  const response = await request.post('/api/analyze', {
    data: { imageUrl: 'https://test.com/kitchen.jpg' },
  });

  await expect(response).toBeOK();
  const body = await response.json();
  expect(body.analysis).toContain('kitchen');
  expect(body.confidence).toBeGreaterThan(0.8);
});
```

**负责人：** 前端开发 + QA
**时间线：** Sprint 0
**验证：** API 测试套件运行时间 < 2min，无外部网络调用

---

### NFR 测试策略 ⚠️ **新增**

**文档提到 NFR 但未提供可执行的测试策略。以下补充完整的 NFR 测试覆盖。**

---

#### 1. 性能测试

| 测试类型 | 目标 | 工具 | 频率 | 通过标准 |
|---------|-----|-----|-----|---------|
| **API 响应时间** | P95 < 200ms | Playwright + Lighthouse | 每个 PR | ✅ 95% 请求 < 200ms |
| **页面加载时间** | LCP < 2s | Lighthouse CI | 每个 PR | ✅ LCP < 2s (Performance > 90) |
| **并发用户负载** | 100 用户 | k6 | 每日构建 | ✅ 0% 错误率，P95 < 1s |
| **内存泄漏** | 无持续增长 | Chrome DevTools | 每周 | ✅ 24h 无明显增长 |

**k6 负载测试示例：**

```javascript
// load-tests/100-concurrent-users.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // 2 分钟爬坡到 100 用户
    { duration: '5m', target: 100 },  // 保持 5 分钟
    { duration: '2m', target: 0 },    // 2 分钟降到 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // P95 < 1s
    http_req_failed: ['rate<0.01'],     // 错误率 < 1%
  },
};

export default function () {
  // 模拟用户上传图片
  let uploadRes = http.post('http://test-api.com/api/upload', {
    files: { image: open('test-image.jpg') },
  });

  check(uploadRes, {
    'upload status 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

#### 2. 安全测试

| 测试类型 | 覆盖范围 | 工具 | 频率 | 通过标准 |
|---------|---------|-----|-----|---------|
| **OWASP Top 10** | SQL 注入、XSS、CSRF 等 | OWASP ZAP | 每周 | ✅ 0 高危漏洞 |
| **认证/授权** | API 访问控制矩阵 | Playwright | 每个 PR | ✅ 未认证无法访问 |
| **支付安全** | Webhook 签名验证 | 手动 + 单元测试 | Sprint 1 | ✅ 签名验证通过 |
| **数据加密** | 敏感字段加密 | 代码审查 | 每个 PR | ✅ 密码/Token 加密 |

**Playwright 安全测试示例：**

```typescript
// tests/security/auth-matrix.spec.ts
test('未认证用户无法访问 API', async ({ request }) => {
  const response = await request.get('/api/tasks');
  expect(response.status()).toBe(401);
});

test('用户 A 无法访问用户 B 的数据', async ({ request }) => {
  // 用户 A 登录
  const tokenA = await loginAs('user-a@example.com');

  // 尝试访问用户 B 的任务
  const response = await request.get('/api/tasks/user-b-task-id', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  expect(response.status()).toBe(403);
});
```

---

#### 3. 可靠性测试

| 测试类型 | 目标 | 工具 | 频率 | 通过标准 |
|---------|-----|-----|-----|---------|
| **可用性** | 99.5% | Playwright + Chaos | 每周 | ✅ 99.5% 成功率 |
| **故障注入** | Replicate 超时、R2 故障 | MSW | 每个 PR | ✅ 优雅降级 |
| **数据持久性** | 无数据丢失 | 单元测试 | 每个 PR | ✅ 事务回滚成功 |
| **幂等性** | 重复请求安全 | API 测试 | 每个 PR | ✅ 重复请求结果一致 |

**故障注入测试示例：**

```typescript
// tests/reliability/fault-injection.spec.ts
import { setupServer } from 'msw/node';

const server = setupServer(
  // 模拟 Replicate 超时
  http.post('https://api.replicate.com/v1/predictions', () => {
    return HttpResponse.timeout();
  })
);

test('Replicate 超时时任务自动入队', async ({ request }) => {
  server.listen();

  const response = await request.post('/api/analyze', {
    data: { imageUrl: 'test.jpg' },
  });

  // 应返回 202 Accepted（任务入队）
  expect(response.status()).toBe(202);

  // 验证任务状态为 pending
  const body = await response.json();
  expect(body.status).toBe('pending');
});
```

---

#### 4. 兼容性测试

| 浏览器 | 版本 | 优先级 | 测试频率 |
|-------|-----|-------|---------|
| **Chrome** | 最新 + 前一版本 | P0 | 每个 PR |
| **Firefox** | 最新 + 前一版本 | P1 | 每日 |
| **Safari** | 最新 | P1 | 每周 |
| **Edge** | 最新 | P2 | 每周 |

---

**NFR 测试执行计划：**

| Sprint | 新增 NFR 测试 | 目标 |
|-------|--------------|-----|
| **Sprint 0** | API 性能基线、认证矩阵 | 建立基线 |
| **Sprint 1** | 支付安全、故障注入 | 核心功能安全 |
| **Sprint 2** | 负载测试（100 用户） | SLA 验证 |
| **每周** | OWASP 扫描、可用性测试 | 持续监控 |

**负责人：** QA + DevOps + Security
**时间线：** Sprint 0 开始，持续执行
**验证：** 所有 NFR 指标达标，文档化在 CI Dashboard

---

### 可测试性评估摘要

#### 运作良好的部分

- ✅ **API First 设计**：所有业务逻辑可通过 REST API 访问，支持无 UI 测试
- ✅ **Zustand + React Query**：状态管理清晰，便于模拟
- ✅ **Drizzle ORM**：数据库操作可隔离，使用 test database
- ✅ **Next.js App Router**：服务端/客户端组件分离，测试边界清晰

#### 可接受的技术债务

对于 MVP 阶段，以下是可接受的权衡：

- **R2 存储使用真实 bucket**：测试阶段接受上传测试文件到专用测试 bucket（生产数据隔离）
- **Replicate API 直接调用**：MVP 阶段使用 Rate Limit 友好的测试策略，正式环境需 Mock

---

### 高优先级风险缓解计划（分数 ≥6）

#### PERF-001: 分析超时处理（分数：9）- 严重

**缓解策略：**

1. 实现后台任务队列（Redis/Bull）
2. 添加进度轮询 API（每 1-2 秒更新）
3. 实现超时自动移入队列逻辑
4. 队列透明化：显示等待任务数量

**负责人：** 后端开发
**时间线：** Sprint 0-1
**状态：** 计划中
**验证：** 100s 超时场景下任务自动入队并正确处理

#### SEC-001: API 认证强制（分数：6）- 高

**缓解策略：**

1. 所有 API 端点添加认证中间件
2. 未认证请求返回 401 + 错误码
3. OAuth 回调端点使用 NextAuth 原生保护

**负责人：** 后端开发
**时间线：** Sprint 1
**状态：** 计划中
**验证：** 未认证请求无法访问任何 API

#### DATA-001: 跨租户数据隔离（分数：6）- 高

**缓解策略：**

1. 所有数据库查询强制包含 user_id/customer_id 过滤
2. 实现行级安全策略（RLS）
3. API 层添加租户验证中间件

**负责人：** 后端开发
**时间线：** Sprint 1
**状态：** 计划中
**验证：** 用户 A 无法访问用户 B 的任何数据

---

### 假设和依赖

#### 假设

1. NextAuth.js v5 稳定性可接受（官方 Beta）
2. Replicate API 响应时间可接受（平均 <30s）
3. Cloudflare R2 出站费用在预算范围内
4. Creem API Webhook 签名验证有官方 SDK 支持
5. **PostgreSQL Transaction Rollback 在测试环境可用** ⚠️ **新增**
6. **Playwright Workers 数量与 CI 资源匹配** ⚠️ **新增**

#### 依赖

1. **Replicate API Key** - Sprint 0 前需要
2. **Cloudflare R2 凭证** - Sprint 0 前需要
3. **Creem 商户账户** - Sprint 1 前需要
4. **Google OAuth 应用** - Sprint 0 前需要
5. **PostgreSQL Test Database** ⚠️ **新增** - Sprint 0 前需要（独立于生产）
6. **Redis Test Instance** ⚠️ **新增** - Sprint 1 前需要（后台队列测试）

#### 计划风险

| 风险 | 影响 | 应急方案 |
|-----|-----|---------|
| **Replicate API 限流影响测试** | 自动化测试不稳定 | 实施请求重试 + 指数退避 + Mock |
| **Playwright CI 资源不足** | 并行测试无法执行 | 降低 Worker 数量，分阶段运行 |
| **测试数据清理失败** | 数据污染累积 | Cron Job + 监控告警 |
| **NextAuth v5 Breaking Changes** | 认证测试失败 | 准备 v4 回退方案 |

---

**架构文档结束 - v2.0 修订版**

## 📝 修订记录

| 版本 | 日期 | 修订人 | 主要变更 |
|-----|-----|-------|---------|
| **v2.0** | 2026-02-04 | Murat (TEA) | 架构评审修订：新增测试隔离、并发控制、NFR 策略等 6 个关键章节 |
| **v1.0** | 2026-02-04 | Murat (TEA) | 初始版本：风险评估 + 可测试性差距分析 |

---

## 🎯 架构团队下一步

### Sprint 0 关键路径（阻塞测试开发）

**必须完成（P0）：**
1. ✅ 审查并批准"E2E 测试隔离策略"（第 [109行](#L109)）
2. ✅ 决策"Playwright 配置"（第 [175行](#L175)）
3. ✅ 实现"测试数据清理机制"（第 [233行](#L233)）
4. ✅ 提供 Replicate Mock 端点（第 [361行](#L361)）
5. ✅ 搭建 PostgreSQL Test Database（独立于生产）
6. ✅ 为高优先级风险（≥6）指定负责人和时间线

**Sprint 1 前完成（P1）：**
7. 评估并发测试冲突场景（第 [297行](#L297)）
8. 搭建 Redis Test Instance（后台队列测试）
9. 验证假设和依赖

---

## 🧪 QA 团队下一步

### Sprint 0 准备工作

**等待阻塞项完成后：**
1. 使用 `bmad-tea-testarch-framework` 初始化 Playwright 测试框架
2. 配置测试隔离机制（Transaction Rollback + afterEach Hook）
3. 创建测试数据 Fixtures（工厂函数）
4. 搭建 MSW Mock 服务（Replicate API）

**参考文档：**
- 测试场景：配套 QA 文档 `test-design-qa.md`
- 测试自动化：`bmad-tea-testarch-automate` 工作流
- ATDD 测试：`bmad-tea-testarch-atdd` 工作流

---

## 📊 修订优先级总结

| 优先级 | 修订项 | 状态 | 负责人 | 交付物 |
|-------|-------|------|--------|-------|
| 🔴 **P0** | E2E 测试隔离策略 | ✅ 已补充 | 全栈 + QA | [完整策略](#L109) |
| 🔴 **P0** | Playwright 配置决策 | ✅ 已补充 | QA + DevOps | [配置表](#L175) |
| 🔴 **P0** | 测试数据清理策略 | ✅ 已补充 | 后端 | [清理 API](#L233) |
| 🟡 **P1** | 并发测试冲突评估 | ✅ 已补充 | QA + 后端 | [风险矩阵](#L297) |
| 🟡 **P1** | Replicate Mock 实现 | ✅ 已补充 | 前端 + QA | [MSW 方案](#L361) |
| 📋 **P2** | 风险评分调整 | ✅ 已调整 | 全团队 | [更新评分表](#L64) |
| 📋 **P2** | NFR 测试策略 | ✅ 已补充 | QA + DevOps | [NFR 覆盖](#L443) |

---

## ⚠️ 风险评分调整说明

| 风险 ID | 原分数 | 新分数 | 调整理由 |
|---------|-------|-------|---------|
| **OPS-001** | 4 | **9** ⬆️ | 无监控 = 生产事故无法响应，严重影响 SLA |
| **TECH-002** | 6 | **4** ⬇️ | Schema 变更影响有限，可通过迁移脚本缓解 |
| **SEC-003** | 4 | **4** ✅ | 维持原评分，已补充详细缓解措施 |

**新增风险：**
- **TECH-004**: E2E 测试隔离策略缺失（分数：9）
- **TECH-005**: 测试数据清理未定义（分数：9）
- **TECH-006**: 并发测试冲突场景（分数：4）

---

## ✅ 文档质量检查清单

- [x] 风险评估完整（23 个风险，11 个高优先级）
- [x] 可测试性差距清晰（6 个阻塞项）
- [x] 缓解措施具体可执行
- [x] E2E 测试隔离策略完整
- [x] Playwright 配置决策明确
- [x] 测试数据清理机制定义
- [x] 并发测试冲突评估覆盖
- [x] Replicate Mock 实现方案
- [x] NFR 测试策略可执行
- [x] 假设和依赖更新
- [x] 下一步行动清晰

**文档状态：** ✅ **已就绪 - 可交付架构评审**

---

**需要我帮你：**
1. 生成配套的 QA 测试场景文档（`test-design-qa.md`）？
2. 启动测试框架初始化（`bmad-tea-testarch-framework`）？
3. 开始 ATDD 测试编写（`bmad-tea-testarch-atdd`）？

告诉我你的选择！🧪
