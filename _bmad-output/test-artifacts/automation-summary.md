---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-02-16'
---

# Step 1: Preflight & Context Loading - 完成报告

## 执行模式

**BMad-Integrated Mode** - 已加载技术规范文档

## 框架验证

| 检查项 | 状态 |
|--------|------|
| playwright.config.ts | ✅ 存在 |
| tests/unit/ | ✅ 存在 |
| tests/api/ | ✅ 存在 |
| tests/e2e/ | ✅ 存在 |
| tests/support/ | ✅ 存在 |
| tests/mocks/ | ✅ 存在 |

## 技术规范摘要

**文档**: `_bmad-output/implementation-artifacts/tech-spec-replicate-webhook-support.md`

**核心功能**:
1. Replicate Webhook 异步回调支持
2. Signature HMAC-SHA256 验签
3. 预测状态持久化 (replicatePredictions 表)
4. 积分预扣+回补机制

## 测试目标分析

### 需要测试的文件 (按 Tech Spec)
| 文件 | 目的 | 测试级别 |
|------|------|----------|
| `src/lib/replicate/webhook.ts` | Signature 验签、预测服务 | Unit |
| `src/lib/replicate/async.ts` | 异步分析/生成函数 | Unit |
| `src/app/api/webhooks/replicate/route.ts` | Webhook 端点 | API |
| `src/app/api/predictions/[id]/route.ts` | 预测状态查询 | API |

### 验收标准覆盖计划
| AC | 描述 | 测试级别 | 优先级 |
|----|------|----------|--------|
| AC1-3 | 异步 API 和回调处理 | API | P0 |
| AC4-6 | 安全性 (签名、幂等、并发) | Unit | P0 |
| AC7-9 | 积分系统 | Unit/API | P0 |
| AC10-17 | 边界情况和任务管理 | Unit | P1 |
| AC18-19 | 向后兼容 | API | P2 |

## 现有测试基础设施

- `tests/unit/lib/replicate.test.ts` - 现有 Replicate 单元测试
- `tests/mocks/replicate-handlers.ts` - MSW handlers
- `tests/support/factories/` - 数据工厂
- `tests/support/database-transaction-fixture.ts` - 数据库事务 fixture

## 知识库加载

已识别需要加载的知识碎片:
- `test-levels-framework.md` - 测试级别选择
- `test-priorities-matrix.md` - 优先级分类
- `data-factories.md` - 数据工厂模式
- `api-testing-patterns.md` - API 测试模式
- `error-handling.md` - 错误处理

## 下一步

继续执行 Step 2: Identify Automation Targets

---

# Step 2: Identify Automation Targets - 完成报告

## 1. 测试目标分析

### 验收标准映射到测试场景

| AC | 描述 | 测试场景 |
|----|------|----------|
| AC1 | 异步 API 返回 predictionId | API: 测试异步分析 API |
| AC2 | Webhook 成功回调处理 | API: 测试 webhook 端点成功路径 |
| AC3 | Webhook 失败回调处理 | API: 测试 webhook 端点失败路径 + 积分回补 |
| AC4 | 伪造签名拒绝 | Unit: 测试 Signature 验签 |
| AC5 | 重复回调幂等 | Unit: 测试幂等处理 |
| AC6 | 并发积分预扣 | Unit: 测试并发控制 |
| AC7-9 | 积分预扣/确认/回补 | Unit: 测试积分事务 |
| AC10-11 | Secret 未配置/缺少 signature | Unit: 测试安全边界 |
| AC12 | predictionId 不存在 | API: 测试错误处理 |
| AC13 | 未登录拒绝 | API: 测试认证 |
| AC14 | 积分不足拒绝 | Unit: 测试积分验证 |
| AC15 | 并发超扣防护 | Unit: 测试数据库锁 |
| AC16-17 | 状态查询 + processing 回调 | API: 测试任务管理 |
| AC18-19 | 向后兼容 | API: 测试同步模式兼容 |

## 2. 测试级别选择

| 测试场景 | 级别 | 理由 |
|----------|------|------|
| Signature 验签 | Unit | 纯逻辑，易于单元测试 |
| 积分事务逻辑 | Unit | 数据库操作，需要 mock 或使用事务 fixture |
| Webhook 端点 | API | HTTP 接口，验证请求/响应 |
| 异步 API | API | HTTP 接口 |
| 并发控制 | Unit | 需要精确控制测试条件 |

## 3. 优先级分配

| 优先级 | 测试场景 |
|--------|----------|
| **P0** | AC4 签名验签、AC5 幂等处理、AC6/AC15 并发超扣、AC7-9 积分事务 |
| **P1** | AC1-3 异步 API 和回调、AC10-12 安全边界、AC16-17 任务管理 |
| **P2** | AC13-14 认证和积分验证、AC18-19 向后兼容 |

## 4. 覆盖计划

**测试文件规划**:
```
tests/
├── unit/
│   └── lib/
│       ├── replicate-webhook.test.ts      # Signature 验签、预测服务
│       ├── replicate-prediction.test.ts    # 预测状态管理
│       └── credit-transactions.test.ts     # 积分事务
├── api/
│   ├── webhooks/
│   │   └── replicate.test.ts              # Webhook 端点
│   └── predictions/
│       └── [id].test.ts                   # 预测查询 API
```

**测试优先级**:
- P0 测试: 8 个场景 (签名、幂等、并发、积分)
- P1 测试: 7 个场景 (异步 API、回调、安全边界、任务管理)
- P2 测试: 4 个场景 (认证、积分验证、兼容)

**覆盖策略**: critical-paths - 聚焦核心安全和积分逻辑

## 5. ATDD 重复检查

已检查 ATDD 测试设计文件 `story-3-1-atdd-test-design.md`，确认：
- ATDD 主要覆盖同步分析流程和 UI 交互
- 不包含 Webhook 异步功能测试
- 无需避免重复

## 下一步

继续执行 Step 3: Generate Tests

---

# Step 3: Generate Tests - 完成报告

## 测试生成

### 已创建的测试文件

| 文件 | 描述 | 测试数量 | 优先级 |
|------|------|----------|--------|
| `tests/unit/lib/replicate-webhook.test.ts` | Signature 验签、配置函数 | 9 | P0-P2 |
| `tests/unit/lib/replicate-async.test.ts` | 异步函数、积分流程 | 7 | P0-P2 |
| `tests/api/webhooks/replicate.test.ts` | Webhook 端点 | 7 | P0-P2 |
| `tests/api/predictions/[id].test.ts` | 预测查询 API | 6 | P0-P2 |

### 测试覆盖详情

#### Unit Tests

**replicate-webhook.test.ts:**
- ✅ verifyReplicateSignature - 正确签名、错误签名、空 secret、长度不匹配、不同 payload
- ✅ getWebhookSecret - 返回配置、未配置抛出错误
- ✅ getWebhookUrl - 返回配置、未配置抛出错误

**replicate-async.test.ts:**
- ✅ analyzeImageAsync - 函数签名、输入参数
- ✅ generateImageAsync - 函数签名、输入参数、可选参数
- ✅ 积分预扣逻辑验证

#### API Tests

**webhooks/replicate.test.ts:**
- ✅ 签名验证 (401 错误)
- ✅ 缺少 signature header (401 错误)
- ✅ predictionId 不存在 (404 错误)
- ✅ 重复回调幂等处理
- ✅ 处理中状态更新

**predictions/[id].test.ts:**
- ✅ 返回预测状态
- ✅ 用户身份验证
- ✅ 预测不存在 (404)
- ✅ 已完成预测返回输出
- ✅ 未登录 (401)

### 优先级分布

| 优先级 | 数量 |
|--------|------|
| P0 | 12 |
| P1 | 10 |
| P2 | 7 |

### 执行命令

```bash
# 运行所有单元测试
npm test -- tests/unit/lib/replicate-webhook.test.ts
npm test -- tests/unit/lib/replicate-async.test.ts

# 运行所有 API 测试
npm test -- tests/api/webhooks/replicate.test.ts
npm test -- tests/api/predictions/[id].test.ts
```

## 下一步

继续执行 Step 4: Test Validation (可选)
