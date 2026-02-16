---
title: 'Replicate Webhook 支持'
slug: 'replicate-webhook-support'
created: '2026-02-16'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js', 'Replicate API', 'Drizzle ORM']
files_to_modify: ['src/lib/db/schema.ts', 'src/lib/credit.ts', 'src/app/api/analysis/route.ts', 'src/lib/replicate/webhook.ts', 'src/lib/replicate/async.ts', 'src/app/api/webhooks/replicate/route.ts', 'src/app/api/predictions/[id]/route.ts']
code_patterns: ['独立函数模式', 'Webhook 回调', 'Signature 验签', 'Drizzle 事务']
test_patterns: ['单元测试', 'Webhook 集成测试', 'Vitest']
---

# Tech-Spec: Replicate Webhook 支持

**Created:** 2026-02-16

## Overview

### Problem Statement

当前项目对 Replicate 的调用采用同步阻塞模式（`replicate.run()`），长时间运行的 AI 任务（如图片风格分析、图像生成）会导致请求超时，影响用户体验和系统稳定性。需要支持 Webhook 异步回调机制。

### Solution

为 Replicate 集成添加 Webhook 支持，实现两种调用模式：
1. **同步模式**（默认兼容）：保持现有 `replicate.run()` 行为
2. **异步模式**：创建独立的 `analyzeImageAsync()` / `generateImageAsync()` 函数，使用 Webhook 回调获取结果

同时支持图片分析和图片生成两种场景的 Webhook。

### Scope

**In Scope:**
- 图片分析 (Vision) Webhook 支持
- 图片生成 (Image) Webhook 支持
- Webhook 安全验证（Replicate Signature 验签）
- 数据库持久化 Prediction ID 和状态
- 任务状态查询和恢复机制
- 积分预扣+回补机制
- 积分变更明细表（支持充值、订阅、赠送等场景）

**Out of Scope:**
- 多租户独立 Webhook（单租户模式）
- Webhook 失败重试机制（失败直接标记失败，回补积分）

## Context for Development

### Codebase Patterns

- 使用 Drizzle ORM 管理数据库，事务保证原子性
- API Route 位于 `src/app/api/` 目录，遵循 Next.js App Router 模式
- Replicate 客户端在 `src/lib/replicate/` 目录
- 数据库 schema 在 `src/lib/db/schema.ts`
- 现有积分逻辑在 `src/lib/credit.ts`，使用事务处理 deduct/refund
- 现有异步分析模式在 `src/app/api/analysis/route.ts`（`executeAnalysisAsync` 函数）

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/lib/replicate/index.ts` | Replicate 客户端初始化 |
| `src/lib/replicate/vision.ts` | 图片分析（同步） |
| `src/lib/replicate/image.ts` | 图片生成（同步） |
| `src/lib/db/schema.ts` | 数据库 schema（已有 creditTransactions 表） |
| `src/lib/credit.ts` | 积分工具函数（deductCredits, refundCredits） |
| `src/app/api/analysis/route.ts` | 分析 API（现有异步模式参考） |
| `tests/unit/lib/replicate.test.ts` | Replicate 单元测试 |

### Technical Decisions

#### 决策 1: Webhook 端点部署方式
- **选择：Next.js API Route** (`app/api/webhooks/replicate/route.ts`)
- 理由：与现有项目集成、快速开发

#### 决策 2: 预测状态持久化
- **选择：新建 `replicatePredictions` 表**
- 理由：清晰分离预测生命周期、支持重试和历史查询

#### 决策 3: 同步/异步模式选择
- **选择：独立函数模式** (`analyzeImageAsync()` vs `analyzeImageSync()`)
- 理由：语义清晰、调用方明确选择

#### 决策 4: Signature 验证
- **选择：独立工具函数** (`verifyReplicateSignature()`)
- 理由：可复用、便于测试

#### 决策 5: 积分扣除流程
- **选择：先扣后回补模式**
  - 预扣积分 → 创建预测 → 回调成功 → 完成（确认）
  - 预扣积分 → 创建预测 → 回调失败/超时 → 回补积分 + 标记失败

#### 决策 6: 积分变更明细表
- **扩展现有 `creditTransactions` 表**
- 扩展 type 字段支持：预扣(analysis_prehold)、完成确认(analysis_complete)、回补(refund)、充值(topup)、订阅(subscription)、赠送(gift)、管理员调整(admin_adjustment)
- 新增字段：
  - `transactionId`: 用于关联预扣和回补的唯一事务ID（UUID）
  - `predictionId`: 关联 replicate prediction

## Implementation Plan

### Tasks

#### 阶段 1: 数据库和基础设施

- [ ] Task 1: 扩展 creditTransactions 表
  - File: `src/lib/db/schema.ts`
  - Action: 在 creditTransactions 表新增字段：
    - `transactionId`: varchar(64) - UUID 关联预扣和回补
    - `predictionId`: varchar(128) - 关联 Replicate prediction
    - 修改 type 字段长度: `varchar('type', { length: 64 })` 支持更多类型
  - Notes: 运行 `drizzle-kit generate` 生成迁移

- [ ] Task 2: 新建 replicatePredictions 表
  - File: `src/lib/db/schema.ts`
  - Action: 创建新表 `replicatePredictions`：
    - id: serial primary key
    - predictionId: varchar(128) NOT NULL UNIQUE - Replicate 返回的 ID
    - userId: varchar(255) - 关联用户
    - taskType: varchar(32) - 'analysis' | 'generation'
    - modelId: varchar(64) - 使用的模型
    - status: varchar(32) - 'pending' | 'processing' | 'completed' | 'failed'
    - input: jsonb - 请求输入
    - output: jsonb - 回调结果
    - creditTransactionId: integer - 关联的积分事务
    - errorMessage: text - 错误信息
    - createdAt / completedAt: timestamps
  - Notes: 添加索引：
    - `index('replicate_predictions_user_id_idx').on(userId)`
    - `index('replicate_predictions_status_idx').on(status)`
    - `uniqueIndex('replicate_predictions_prediction_id_idx').on(predictionId)`

#### 阶段 2: 核心工具函数

- [ ] Task 3: 实现 Signature 验签函数
  - File: `src/lib/replicate/webhook.ts` (新建)
  - Action: 创建 `verifyReplicateSignature()` 函数
    - Header 名称: `Replicate-Signature` 或 `x-replicate-signature`
    - 接收 raw request body (字符串)、signature、secret
    - 使用 HMAC-SHA256 计算
    - **必须使用 `timingSafeEqual` 防止 timing attack**
    - **运行时验证: secret 为空时抛出错误**
    - 返回验证结果
  - Notes: |
    ```typescript
    // 必须使用 timingSafeEqual 防止 timing attack
    import { createHmac, timingSafeEqual } from 'crypto';

    export function verifyReplicateSignature(
      payload: string,  // 原始 raw request body
      signature: string,
      secret: string
    ): boolean {
      // 运行时验证：secret 未配置时拒绝所有请求
      if (!secret) {
        throw new Error('REPLICATE_WEBHOOK_SECRET is not configured');
      }

      const hmac = createHmac('sha256', secret);
      const digest = hmac.update(payload).digest('hex');

      const sigBuffer = Buffer.from(signature, 'hex');
      const digestBuffer = Buffer.from(digest, 'hex');

      if (sigBuffer.length !== digestBuffer.length) {
        return false;
      }

      return timingSafeEqual(sigBuffer, digestBuffer);
    }
    ```

- [ ] Task 4: 创建 Replicate 预测服务
  - File: `src/lib/replicate/webhook.ts` (新建)
  - Action: 创建以下函数：
    - `createPrediction(taskType, modelId, input, webhookUrl)` - 创建预测
    - `createPredictionWithRetry(..., maxRetries=3)` - 带重试的创建预测（指数退避: 1s, 2s, 4s）
    - `getPredictionStatus(predictionId)` - 查询状态
    - `pollPrediction(predictionId, timeout)` - 轮询直到完成（同步模式备用）
  - Notes: |
    - 使用 `replicate.predictions.create()` 而非 `replicate.run()`
    - 重试策略：指数退避，捕获 `timeout` 和 `rate_limit` 错误

#### 阶段 3: Webhook 端点

- [ ] Task 5: 实现 Webhook 回调端点
  - File: `src/app/api/webhooks/replicate/route.ts` (新建)
  - Action: 创建 POST 处理器
    - 验证 Signature
    - 解析 payload
    - 查找对应的 prediction 记录
    - 更新状态并触发后续处理
  - Notes: |
    错误处理策略：
    - 返回 200 场景：成功处理、幂等重复回调（状态已是 completed）、预测不存在
    - 返回 500 场景：数据库保存失败、积分操作失败（让 Replicate 重试）
    - 记录详细日志用于调试

- [ ] Task 6: 实现回调处理逻辑
  - File: `src/lib/replicate/webhook.ts`
  - Action: 创建 `handleWebhookCallback()` 函数
    - **成功回调 (status=completed)**：保存结果、更新状态为 completed、记录积分确认
    - **失败回调 (status=failed)**：回补积分、更新状态为 failed
    - **处理中回调 (status=processing)**：更新状态为 processing，不执行积分操作
    - **幂等处理**：检查状态避免重复处理
    - 从 prediction 记录获取 userId 进行验证
  - Notes: 使用事务保证原子性

#### 阶段 4: 异步函数

- [ ] Task 7: 实现 analyzeImageAsync 异步分析函数
  - File: `src/lib/replicate/async.ts` (新建)
  - Action: 创建 `analyzeImageAsync()` 函数
    1. 预扣积分（使用事务 + FOR UPDATE 锁，记录 transactionId）
    2. 创建 prediction（传入 webhook URL）
    3. 保存 prediction 记录
    4. **原子性保证**: 如果步骤 2 或 3 失败，立即回补积分
    5. 返回 predictionId
  - Notes: |
    - 参考现有 analyzeImageStyle 实现
    - **必须使用事务 + FOR UPDATE 锁防止并发超扣**
    - 积分不足时直接返回错误，不创建 prediction

- [ ] Task 8: 实现 generateImageAsync 异步生成函数
  - File: `src/lib/replicate/async.ts`
  - Action: 创建 `generateImageAsync()` 函数
    - 类似 Task 7，支持图片生成参数
  - Notes: 参考现有 generateImage 实现

#### 阶段 5: API 集成

- [ ] Task 9: 集成异步分析到现有 API
  - File: `src/app/api/analysis/route.ts`
  - Action: 修改 POST 处理器支持异步模式
    - 添加 `useWebhook?: boolean` 参数
    - 当 useWebhook=true 时调用 analyzeImageAsync
    - 返回 predictionId 而非等待完成
  - Notes: 保持向后兼容

- [ ] Task 10: 创建图片生成 API
  - File: `src/app/api/generation/route.ts` (新建)
  - Action: 创建 POST 端点
    - 验证用户和积分
    - 调用 generateImageAsync
    - 返回 predictionId
  - Notes: 复用现有认证和积分逻辑

- [ ] Task 10A: 创建预测状态查询 API
  - File: `src/app/api/predictions/[id]/route.ts` (新建)
  - Action: 创建 GET 端点
    - 验证用户身份（从 prediction 记录获取 userId 匹配）
    - 返回当前状态和结果（如果已完成）
  - Notes: 支持用户查询异步任务状态

#### 阶段 6: 超时处理

- [ ] Task 11: 实现超时检测定时任务
  - File: `src/app/api/cron/check-predictions/route.ts` (新建)
  - Action: 创建 cron 端点检查超时的 prediction
    - **添加认证机制**: 使用 API Key 或 NextAuth Session 验证调用者身份
    - 查询 createdAt 超过 **15 分钟**（可通过 `REPLICATE_PREDICTION_TIMEOUT_MINUTES` 配置）且 status=pending 的记录
    - 标记为 failed 并回补积分
  - Notes: |
    - 可设置为每 5 分钟执行
    - 生产环境使用 Vercel Cron 或外部定时服务调用

#### 阶段 7: 测试

- [ ] Task 12: 编写单元测试
  - File: `tests/unit/lib/replicate-webhook.test.ts` (新建)
  - Action: 测试以下场景
    - Signature 验证（正确/错误 signature）
    - 预测状态更新逻辑
    - 积分预扣/回补事务
  - Notes: 使用 Vitest + msw

- [ ] Task 13: 编写集成测试
  - File: `tests/integration/webhook.test.ts` (新建)
  - Action: 测试完整 webhook 流程
    - Mock Replicate API
    - 发送测试请求
    - 验证状态更新和积分变动
  - Notes: 使用 mcp__playwright__ 或直接测试 API

### Acceptance Criteria

#### 核心功能

- [ ] AC 1: Given 用户调用异步分析 API with useWebhook=true, when API 返回, then 返回 predictionId 且不等待分析完成
- [ ] AC 2: Given Replicate 回调成功, when Webhook 端点收到回调, then 保存分析结果到数据库且状态为 completed
- [ ] AC 3: Given Replicate 回调失败, when Webhook 端点收到回调, then 回补用户积分且状态为 failed

#### 安全性

- [ ] AC 4: Given 伪造的 webhook 请求 with 错误的 signature, when 请求到达端点, then 返回 401 且不处理
- [ ] AC 5: Given 重复的 webhook 回调, when 第二次回调到达, then 不重复处理且返回 200
- [ ] AC 6: Given 并发的积分预扣请求 on 同一用户, when 两个请求同时到达, then 最终只扣除一次积分

#### 积分系统

- [ ] AC 7: Given 用户积分余额为 5, when 发起异步分析, then 余额变为 4 且记录预扣事务
- [ ] AC 8: Given 预扣成功但 prediction 创建失败, when 发生错误, then 回补积分到 5
- [ ] AC 9: Given 回调成功完成, when 处理完成, then 记录积分确认事务（类型 analysis_complete）

#### 边界情况

- [ ] AC 10: Given Webhook secret 未配置, when 收到回调请求, then 抛出错误拒绝请求
- [ ] AC 11: Given Webhook 请求缺少 signature header, when 请求到达, then 返回 401
- [ ] AC 12: Given predictionId 不存在, when 回调到达, then 返回 404 且不处理
- [ ] AC 13: Given 用户未登录, when 调用异步 API, then 返回 401
- [ ] AC 14: Given 用户积分余额为 0, when 发起异步分析, then 返回错误且不创建 prediction
- [ ] AC 15: Given 并发预扣请求 on 同一用户 with 余额=1, when 两个请求各需 1 积分, then 只有一个请求成功

#### 任务管理

- [ ] AC 16: Given 用户持有 predictionId, when 调用查询 API, then 返回当前状态和结果（如果已完成）
- [ ] AC 17: Given Replicate 回调状态为 processing, when 收到回调, then 更新状态为 processing 且不执行积分操作

#### 现有功能兼容

- [ ] AC 18: Given 用户调用分析 API without useWebhook 参数, when API 返回, then 行为与现有同步模式一致
- [ ] AC 19: Given 用户调用分析 API with useWebhook=false, when API 返回, then 行为与现有同步模式一致

## Additional Context

### Dependencies

- `replicate` npm 包（已安装）
- `crypto` Node.js 内置模块（HMAC-SHA256）
- `uuid` 生成 transactionId（可使用 crypto.randomUUID()）
- `drizzle-orm`（已安装）

### Testing Strategy

- **单元测试**:
  - `tests/unit/lib/replicate-webhook.test.ts` - Signature 验证、预测状态更新
  - `tests/unit/lib/credit-transactions.test.ts` - 积分事务测试
- **集成测试**:
  - `tests/integration/webhook.test.ts` - 完整 webhook 流程
  - 使用 msw Mock Replicate API 响应
- **手动测试**:
  - 使用 ngrok 暴露本地 webhook
  - 调用分析 API 创建任务
  - 检查数据库状态和积分变动

### Notes

- 开发阶段使用 ngrok 暴露本地 webhook 回调 URL
- 生产环境域名：`image-prompt-ai.com`
- 现有 creditTransactions 表已存在，需要扩展字段
- 现有 `src/lib/credit.ts` 提供了 deductCredits/refundCredits 事务模式，可复用
- **高风险项**: 积分超扣、签名验签、幂等处理
- **已知限制**: Webhook 超时依赖 cron 任务检测（初始实现）
- **未来考虑**:
  - 支持 webhook 失败自动重试
  - 支持多租户独立 webhook
  - 添加实时通知（WebSocket）

## Failure Mode Analysis

### 1. Webhook 端点 (`app/api/webhooks/replicate/route.ts`)

| 失败场景 | 影响 | 严重程度 | 缓解措施 |
|---------|------|---------|---------|
| 收到重复回调 | 重复处理结果 | 中 | 使用 predictionId 去重，检查状态是否为 completed |
| 解析 JSON 失败 | 任务卡住 | 高 | 记录原始请求，返回 400 |
| 签名验证失败 | 伪造请求 | 高 | 记录并拒绝，告警 |
| 处理超时 | 请求失败 | 中 | 使用后台任务处理（Queue） |

### 2. Replicate Prediction 创建

| 失败场景 | 影响 | 严重程度 | 缓解措施 |
|---------|------|---------|---------|
| API Token 过期 | 所有任务失败 | 严重 | 监控告警，定期刷新 |
| API 请求超时 | 任务无法创建 | 高 | 添加重试 + 指数退避 |
| 模型不存在 | 立即失败 | 中 | 启动前验证模型 ID |
| 超出 Rate Limit | 限流 | 中 | 实现客户端限流 |
| Webhook URL 不可达 | Replicate 报错 | 高 | 开发阶段使用 ngrok，生产配置正确域名 |

### 3. Signature 验证

| 失败场景 | 影响 | 严重程度 | 缓解措施 |
|---------|------|---------|---------|
| 缺少 Signature Header | 伪造请求 | 高 | 拒绝请求 |
| Secret 配置错误 | 无法验证 | 高 | 启动时验证 |
| HMAC 计算错误 | 误判合法请求 | 中 | 详细日志 |

### 4. 积分预扣/回补

| 失败场景 | 影响 | 严重程度 | 缓解措施 |
|---------|------|---------|---------|
| 预扣成功但记录失败 | 数据不一致 | 高 | 使用事务，失败回滚 |
| 预扣成功但创建预测失败 | 用户被扣积分但无任务 | 高 | 捕获异常，立即回补 |
| 回调成功但保存结果失败 | 任务完成但无结果 | 高 | 重试保存，标记待处理 |
| 回补积分失败 | 用户积分损失 | 严重 | 记录告警，人工处理 |
| 并发预扣（超扣） | 积分变负 | 严重 | 数据库锁（FOR UPDATE） |

### 5. 数据库持久化 (`replicatePredictions` 表)

| 失败场景 | 影响 | 严重程度 | 缓解措施 |
|---------|------|---------|---------|
| 插入 prediction 失败 | 无法追踪任务 | 高 | 重试 + 告警 |
| 更新状态失败 | 状态不一致 | 高 | 重试 + 补偿 |
| 查询超时 | 请求超时 | 中 | 添加索引，优化查询 |

### 6. 回调处理流程

| 失败场景 | 影响 | 严重程度 | 缓解措施 |
|---------|------|---------|---------|
| 状态已为 completed | 重复回调 | 低 | 幂等处理，忽略 |
| 关联的 prediction 不存在 | 无效回调 | 中 | 记录日志，返回 404 |
| 解析 output 失败 | 任务失败 | 高 | 记录原始 output，标记失败 |

### 7. 关键补偿机制

1. **幂等处理**：使用 `predictionId` 去重，同一回调多次执行不影响结果
2. **超时检测**：定时任务检查 `pending` 状态超过 N 分钟的 prediction，回补积分
3. **事务保证**：积分操作使用 Drizzle 事务，失败自动回滚
4. **告警监控**：关键失败点记录日志，发送到监控系统

### 8. 失败路径流程图

```
用户请求
   │
   ▼
预扣积分 ✅ ─── 失败 ──▶ 返回错误（未创建预测）
   │
   ▼
创建 Prediction ✅ ─── 失败 ──▶ 回补积分，返回错误
   │
   ▼
保存 predictionId ✅ ─── 失败 ──▶ 回补积分，返回错误
   │
   ▼
返回 prediction_id 给用户
   │
   ▼
[等待 Webhook 回调...]
   │
   ├─ 成功回调 ✅ ──▶ 保存结果，标记完成
   │
   ├─ 失败回调 ✅ ──▶ 回补积分，标记失败
   │
   └─ 无回调（超时）──▶ 定时任务检查，回补积分
```

## Security Audit

### 🔴 黑客视角（攻击向量）

| 攻击向量 | 描述 | 潜在影响 | 防御措施 |
|---------|------|---------|---------|
| **Webhook 伪造** | 攻击者构造假请求发送到 webhook 端点 | 虚假任务完成、积分被盗 | ✅ Signature 验签（必须） |
| **重放攻击** | 截获合法回调，重新发送 | 重复处理、积分回补 | 使用 predictionId 去重，检查状态 |
| **积分超扣** | 并发请求耗尽用户积分 | 用户资产损失 | 数据库行锁（FOR UPDATE） |
| **越权访问** | 修改 prediction 的 userId 访问他人任务 | 数据泄露 | 验证 userId 匹配 |
| **SQL 注入** | 恶意 payload 注入数据库 | 数据破坏 | Drizzle ORM 参数化查询 |
| **环境变量泄露** | Replicate Token 暴露 | API 滥用 | 运行时验证，仅服务端使用 |

### 🛡️ 防御者视角（保护措施）

| 防护层 | 措施 | 状态 |
|-------|------|------|
| **身份验证** | Replicate Signature HMAC-SHA256 验签 | 待实现 |
| **授权检查** | userId 匹配验证 | 待实现 |
| **输入验证** | predictionId 格式验证、状态检查 | 待实现 |
| **幂等性** | predictionId 去重 + 状态检查 | 待实现 |
| **速率限制** | API 限流 | 可复用现有队列机制 |
| **审计日志** | 所有操作记录日志 | 可扩展 |
| **错误处理** | 异常不泄露敏感信息 | 需注意 |

### 📋 审计员视角（合规与日志）

| 检查项 | 要求 | 实现位置 |
|-------|------|---------|
| **完整审计追踪** | 每个操作需记录：who/what/when | 扩展 creditTransactions |
| **签名验证日志** | 记录验签成功/失败 | webhook route |
| **积分变动明细** | 预扣/确认/回补全程追踪 | creditTransactions 表 |
| **预测生命周期** | 创建→完成/失败全程记录 | replicatePredictions 表 |
| **异常告警** | 关键失败发送到监控系统 | 新增 |

### ⚠️ 安全要求优先级

| 优先级 | 项目 | 描述 |
|-------|------|------|
| **P0** | Signature 验签 | 防止 webhook 伪造 |
| **P0** | 积分原子性 | 防止超扣/漏扣 |
| **P1** | 幂等处理 | 防止重放攻击 |
| **P1** | 越权检查 | 防止访问他人数据 |
| **P2** | 审计日志 | 合规要求 |
| **P2** | 速率限制 | 防止滥用 |

### 🔐 安全配置清单

```typescript
// 环境变量（需配置）
REPLICATE_API_TOKEN=xxx          // 服务端保密
REPLICATE_WEBHOOK_SECRET=xxx     // 用于验签
REPLICATE_WEBHOOK_URL=xxx       // 生产域名

// 开发环境
// 使用 ngrok 暴露本地 webhook
// ngrok http 3000
// REPLICATE_WEBHOOK_URL=https://xxx.ngrok.io/api/webhooks/replicate
```
