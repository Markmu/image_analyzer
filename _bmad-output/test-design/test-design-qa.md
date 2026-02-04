# image_analyzer - 测试设计文档 (QA版)

**用途：** QA 团队测试执行指南。定义测试什么、如何测试、QA 需要其他团队提供什么。

**日期：** 2026-02-04
**作者：** Murat (TEA Agent)
**状态：** 草稿
**项目：** image_analyzer

**相关文档：** 架构文档（test-design-architecture.md）包含可测试性关注点和架构阻塞项。

---

## 执行摘要

**范围：** 完整 AI 图像分析平台测试（Epic 1-9）

**风险摘要：**
- 高优先级风险（≥6）：8 个（SEC: 2, PERF: 2, TECH: 2, DATA: 1, BUS: 1）
- 中优先级风险（3-5）：12 个
- 关键类别：支付安全、并发处理、数据隔离

**覆盖摘要：**
- P0 测试：约 15 个（关键路径、安全）
- P1 测试：约 20 个（重要功能、集成）
- P2 测试：约 10 个（边缘情况、回归）
- P3 测试：约 5 个（探索性、性能基准）
- **总计**：约 45-50 个测试（2-3 周 1 名 QA）

---

## 依赖项和测试阻塞项

**严重警告：** QA 无法在没有以下项目的情况下进行。

### 后端/架构依赖项（Sprint 0）

**来源：** 架构文档"快速指南"有详细缓解计划

1. **Replicate API Mock 端点** - 后端开发 - Sprint 0
   - QA 需要：返回预设结果的 Mock 端点
   - 为什么阻塞测试：避免外部 API 调用，确保测试稳定性

2. **测试数据 Seeding API** - 后端开发 - Sprint 0
   - QA 需要：POST /api/test/seed 端点
   - 为什么阻塞测试：无法并行执行测试

3. **R2 存储 Mock 服务** - 后端开发 - Sprint 0
   - QA 需要：模拟上传/下载的测试服务
   - 为什么阻塞测试：避免上传真实文件到生产 bucket

4. **NextAuth 测试适配器** - 全栈开发 - Sprint 0
   - QA 需要：模拟不同用户状态的认证工具
   - 为什么阻塞测试：无法测试多用户场景

### QA 基础设施设置（Sprint 0）

1. **测试数据工厂**
   - User 工厂（faker-based，unique email）
   - Image 工厂（支持多种格式）
   - Template 工厂
   - AnalysisResult 工厂
   - 自动清理夹具确保并行安全

2. **测试环境**
   - 本地：Docker Compose（PostgreSQL + MinIO）
   - CI：GitHub Actions + Playwright
   - Staging：Vercel 预览部署

3. **Playwright 工具配置**
   - 全局 setup：`playwright/global-setup.ts`
   - 认证状态：`playwright/.auth/user.json`
   - 存储状态：`playwright/.storage/user.json`

**示例工厂模式：**

```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { test as base } from '@playwright/test';

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  credit_balance: 30,
  subscription_tier: 'free',
  created_at: new Date().toISOString(),
  ...overrides,
});

// 使用方式
test('用户注册获得 30 credit', async ({ seedUser }) => {
  const user = await seedUser(createUser());
  expect(user.credit_balance).toBe(30);
});
```

---

## 风险评估

**注意：** 完整风险详情见架构文档。本节总结与 QA 测试规划相关的风险。

### 高优先级风险（分数 ≥6）

| 风险 ID | 类别 | 描述 | 分数 | QA 测试覆盖 |
| ------- | ---- | ----- | ---- | ----------- |
| **SEC-001** | SEC | 未授权访问敏感 API | **6** | P0: 未认证请求返回 401 |
| **SEC-002** | SEC | 支付 Webhook 未签名验证 | **6** | P0: Webhook 签名验证 |
| **PERF-001** | PERF | 分析超时未处理 | **9** | P0: 60s 超时入队列 |
| **PERF-002** | PERF | 100 并发队列瓶颈 | **6** | P1: 并发限制生效 |
| **TECH-001** | TECH | R2 存储未隔离 | **6** | P1: R2 Mock 服务 |
| **TECH-002** | TECH | Schema 变更影响测试 | **6** | P1: 迁移测试 |
| **DATA-001** | DATA | 跨租户数据泄露 | **6** | P0: 用户 A 无法访问 B 的数据 |
| **BUS-001** | BUS | Credit 扣除不一致 | **6** | P0: 原子性事务验证 |

### 中/低优先级风险

| 风险 ID | 类别 | 描述 | 分数 | QA 测试覆盖 |
| ------- | ---- | ----- | ---- | ----------- |
| TECH-003 | TECH | NextAuth v5 稳定性 | 4 | P1: 登录/登出流程 |
| PERF-003 | PERF | 生成响应延迟 | 4 | P2: 骨架屏显示 |
| SEC-003 | SEC | XSS 注入 | 4 | P1: 输入验证 |
| DATA-002 | DATA | 图片过期未清理 | 4 | P2: 定时任务 |
| OPS-001 | OPS | 监控未配置 | 4 | 手动验证 |
| BUS-002 | BUS | 免费用户体验降级 | 4 | P1: 功能限制 |

---

## 测试覆盖计划

**重要：** P0/P1/P2/P3 = **优先级和风险等级**（时间紧张时的焦点），不是执行时机。见"执行策略"了解何时运行测试。

### P0（严重）

**标准：** 阻塞核心功能 + 高风险（≥6）+ 无解决方法 + 影响大多数用户

| 测试 ID | 需求 | 测试级别 | 风险链接 | 备注 |
| ------- | ---- | -------- | -------- | ---- |
| **P0-AUTH-001** | 未认证请求返回 401 | API | SEC-001 | |
| **P0-AUTH-002** | 用户只能访问自己的数据 | API | DATA-001 | 跨租户测试 |
| **P0-CREDIT-001** | 新用户获得 30 credit | API | BUS-001 | 事务原子性 |
| **P0-CREDIT-002** | 分析成功后扣除 credit | E2E | BUS-001 | 完整流程 |
| **P0-QUEUE-001** | 超时任务自动入队列 | API | PERF-001 | 后台处理 |
| **P0-QUEUE-002** | 显示队列任务数量 | E2E | PERF-001 | UI 进度 |
| **P0-WEBHOOK-001** | Creem 签名验证 | API | SEC-002 | 安全关键 |
| **P0-MODERATION-001** | 不当内容过滤 | API | SEC-003 | 内容安全 |

**P0 总计：** 约 8 个测试

---

### P1（高）

**标准：** 重要功能 + 中等风险（3-4）+ 常见流程 + 有解决方法但困难

| 测试 ID | 需求 | 测试级别 | 风险链接 | 备注 |
| ------- | ---- | -------- | -------- | ---- |
| **P1-AUTH-001** | Google OAuth 登录 | E2E | TECH-003 | 第三方集成 |
| **P1-AUTH-002** | 账户信息查看 | API | | |
| **P1-UPLOAD-001** | 单张图片拖拽上传 | E2E | | 桌面端 |
| **P1-UPLOAD-002** | 批量上传最多 5 张 | E2E | | 批量处理 |
| **P1-UPLOAD-003** | 图片格式验证 | API | | 文件类型 |
| **P1-UPLOAD-004** | 上传进度显示 | E2E | | UI 反馈 |
| **P1-ANALYSIS-001** | 四维度风格分析 | E2E | PERF-001 | 核心功能 |
| **P1-ANALYSIS-002** | 置信度标注 | API | | 质量指标 |
| **P1-TEMPLATE-001** | 变量模板生成 | API | | 核心功能 |
| **P1-TEMPLATE-002** | JSON 格式导出 | E2E | | 专业用户 |
| **P1-GENERATION-001** | 基于模板生成图片 | E2E | PERF-003 | 核心流程 |
| **P1-GENERATION-002** | 分享到 X (Twitter) | E2E | | 社交集成 |
| **P1-GENERATION-003** | 分享奖励 credit | API | BUS-001 | 奖励机制 |
| **P1-HISTORY-001** | 最近 10 次分析记录 | API | | 历史功能 |
| **P1-HISTORY-002** | 模板库管理 | E2E | | 收藏/标签 |
| **P1-CONCURRENCY-001** | 并发任务限制 | API | PERF-2 | Free 1/Lite 3/Standard 10 |
| **P1-SEC-001** | XSS 输入过滤 | API | SEC-003 | 安全测试 |
| **P1-SEC-002** | SQL 注入防护 | API | SEC-003 | 安全测试 |

**P1 总计：** 约 18 个测试

---

### P2（中）

**标准：** 次要功能 + 低风险（1-2）+ 边缘情况 + 回归预防

| 测试 ID | 需求 | 测试级别 | 风险链接 | 备注 |
| ------- | ---- | -------- | -------- | ---- |
| **P2-UPLOAD-001** | 取消上传功能 | E2E | | 异常处理 |
| **P2-UPLOAD-002** | 复杂图片降级处理 | API | | 降级逻辑 |
| **P2-ANALYSIS-001** | 多图综合分析 | API | | 批量功能 |
| **P2-ANALYSIS-002** | 用户质量反馈 | API | | 反馈机制 |
| **P2-TEMPLATE-001** | 模板编辑 | E2E | | 编辑器 |
| **P2-TEMPLATE-002** | 一键复制到剪贴板 | E2E | | UX 功能 |
| **P2-GENERATION-001** | 图片保存到本地 | E2E | | 下载功能 |
| **P2-GENERATION-002** | 生成进度显示 | E2E | | UI 反馈 |
| **P2-HISTORY-001** | 基于历史重新分析 | E2E | | 快捷操作 |
| **P2-HISTORY-002** | 模板使用统计 | API | | 统计数据 |

**P2 总计：** 约 10 个测试

---

### P3（低）

**标准：** 锦上添花 + 探索性 + 性能基准 + 文档验证

| 测试 ID | 需求 | 测试级别 | 备注 |
| ------- | ---- | -------- | ---- |
| **P3-UX-001** | 响应式布局验证 | E2E | 移动/平板/桌面 |
| **P3-UX-002** | 无障碍 WCAG 2.1 AA | E2E | a11y 测试 |
| **P3-PERF-001** | 100 并发负载 | 性能 | k6 负载测试 |
| **P3-PERF-002** | 图片生成响应时间 | 性能 | SLA 验证 |
| **P3-DR-001** | 备份恢复 | 手动 | 灾难恢复 |

**P3 总计：** 约 5 个测试

---

## 执行策略

**哲学：** 在 PR 中运行所有测试，除非有显著的基础设施开销。Playwright 并行化非常快（100 个测试约 10-15 分钟）。

### 每个 PR：Playwright 测试（约 10-15 分钟）

**所有功能测试（来自任何优先级级别）：**

- 所有 E2E、API、集成、单元测试使用 Playwright
- 并行化分片：4 个
- 总计：约 45 个 Playwright 测试（包含 P0、P1、P2、P3）

**为什么在 PR 中运行：** 快速反馈，无昂贵基础设施

### 每日构建：性能测试（约 30-60 分钟）

**所有性能测试（来自任何优先级级别）：**

- 负载、压力、峰值、耐久性测试
- 工具：k6
- 总计：约 5 个性能测试

**为什么推迟到每日构建：** 昂贵基础设施（k6 Cloud），长时间运行

### 每周：混沌和长期运行测试（数小时）

**特殊基础设施测试：**

- 多区域故障转移（需要 AWS FIS）
- 灾难恢复（备份恢复，4+ 小时）
- 耐久性测试（4+ 小时运行时间）

**为什么推迟到每周：** 非常昂贵的基础设施，非常长的运行时间

### 手动测试（排除在自动化之外）：

- DevOps 验证（部署、监控）
- 财务验证（成本告警）
- 文档验证

---

## QA 工作量估算

**仅 QA 测试开发工作量**（排除 DevOps、后端、数据工程工作）：

| 优先级 | 数量 | 估算范围 | 备注 |
| ------ | ---- | -------- | ---- |
| P0 | 8 | 1-1.5 周 | 复杂设置（安全、并发、多步骤） |
| P1 | 18 | 1.5-2 周 | 标准覆盖（集成、API 测试） |
| P2 | 10 | 5-7 天 | 边缘情况、简单验证 |
| P3 | 5 | 2-3 天 | 探索性、基准测试 |
| **总计** | ~45 | **2-3 周** | **1 名全职 QA 工程师** |

**假设：**

- 包含测试设计、实现、调试、CI 集成
- 排除持续维护（约 10% 工作量）
- 假设测试基础设施（工厂、夹具）已就绪

**来自其他团队的依赖：**

- 见"依赖项和测试阻塞项"部分，了解 QA 需要后端、DevOps、数据工程提供什么

---

## 附录 A：代码示例和标记

### Playwright 标记用于选择性执行

```typescript
import { test, expect } from '@playwright/test';

// P0 关键测试
test('@P0 @API @Security 未认证请求返回 401', async ({ apiRequest }) => {
  const response = await apiRequest({
    method: 'POST',
    path: '/api/analysis',
    body: { image_url: 'test.jpg' },
  });

  expect(response.status()).toBe(401);
});

// P0 认证测试
test('@P0 @Auth 用户只能访问自己的数据', async ({ authenticatedRequest, seedUser }) => {
  const userA = await seedUser({ email: 'user-a@test.com' });
  const userB = await seedUser({ email: 'user-b@test.com' });

  // User A 创建的资源
  const analysis = await authenticatedRequest({
    user: userA,
    method: 'POST',
    path: '/api/analysis',
    body: { image_url: 'test.jpg' },
  });

  // User B 尝试访问
  const response = await authenticatedRequest({
    user: userB,
    method: 'GET',
    path: `/api/analysis/${analysis.id}`,
  });

  expect(response.status()).toBe(403);
});

// P1 集成测试
test('@P1 @Integration 图片上传和分析完整流程', async ({ page, authenticatedRequest }) => {
  // 1. 上传图片
  await page.goto('/upload');
  await page.locator('[data-testid="dropzone"]').dropFile('test-image.jpg');

  // 2. 等待上传完成
  await expect(page.locator('[data-testid="upload-progress"]')).toHaveValue('100%');

  // 3. 验证分析开始
  await expect(page.locator('[data-testid="analysis-status"]')).toHaveText(/分析中/);

  // 4. 验证分析完成
  await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible();
});

// P2 UI 测试
test('@P2 @UI 响应式布局 - 移动端单列', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/analysis');

  // 验证单列布局
  const columns = page.locator('[data-testid="layout-column"]');
  await expect(columns).toHaveCount(1);
});
```

### 运行特定标记

```bash
# 仅运行 P0 测试
npx playwright test --grep @P0

# 运行 P0 + P1 测试
npx playwright test --grep "@P0|@P1"

# 仅运行安全测试
npx playwright test --grep @Security

# 运行 PR 中的所有 Playwright 测试（默认）
npx playwright test
```

---

## 附录 B：知识库参考

- **风险治理**：`_bmad/tea/testarch/knowledge/risk-governance.md` - 风险评分方法论
- **测试优先级矩阵**：`_bmad/tea/testarch/knowledge/probability-impact.md` - P0-P3 标准
- **测试层级框架**：`_bmad/tea/testarch/knowledge/test-levels-framework.md` - E2E vs API vs 单元测试选择
- **测试质量**：`_bmad/tea/testarch/knowledge/test-quality.md` - 完成定义（无硬等待，<300 行，<1.5 分钟）
- **ADR 质量准备检查表**：`_bmad/tea/testarch/knowledge/adr-quality-readiness-checklist.md` - 8 类 29 条标准

---

## 测试 ID 命名规范

| 前缀 | 含义 | 示例 |
|------|------|------|
| P0-AUTH | P0 级别认证测试 | P0-AUTH-001 |
| P1-UPLOAD | P1 级别上传测试 | P1-UPLOAD-001 |
| P2-ANALYSIS | P2 级别分析测试 | P2-ANALYSIS-001 |
| P3-PERF | P3 级别性能测试 | P3-PERF-001 |

---

**生成者：** BMad TEA Agent
**工作流：** `_bmad/tea/testarch/test-design`
**版本：** 4.0（BMad v6）
