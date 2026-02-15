# Test Design: Story 3-5 - Confidence Scoring

**Date:** 2026-02-15
**Author:** TEA (Murat) - Test Architect
**Status:** Draft

---

## Executive Summary

**Scope:** Story-level test design for Epic 3 - Confidence Scoring

**Risk Summary:**

- Total risks identified: 10
- High-priority risks (>=6): 4
- Critical categories: DATA, BUS, PERF, TECH

**Coverage Summary:**

- P0 scenarios: 12 (24 hours)
- P1 scenarios: 18 (18 hours)
- P2/P3 scenarios: 15 (7.5 hours)
- **Total effort**: 49.5 hours (~6.2 days)

---

## Not in Scope

| Item       | Reasoning      | Mitigation            |
| ---------- | -------------- | --------------------- |
| **Credit 扣除逻辑** | 已在 Epic 3 其他 Story 覆盖 | 复用现有测试 |
| **内容安全检查** | Epic 4 专门覆盖 | 集成测试验证接口 |
| **模型选择器 UI** | Story 3-4 已实现 | 回归测试覆盖 |

---

## Risk Assessment

### High-Priority Risks (Score >=6)

| Risk ID | Category | Description   | Probability | Impact | Score | Mitigation   | Owner   | Timeline |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------------ | ------- | -------- |
| R-001   | DATA     | 置信度数据计算错误导致用户误判 | 2           | 3      | 6     | 多层验证：单元测试覆盖所有计算逻辑，集成测试验证端到端数据流 | DEV | 2026-02-15 |
| R-002   | BUS      | 低置信度警告未正确触发导致用户错过重试机会 | 2           | 3      | 6     | 阈值边界测试，E2E 测试覆盖所有阈值场景 | QA | 2026-02-15 |
| R-003   | PERF     | 重试防抖失效导致重复请求和资源浪费 | 2           | 3      | 6     | 并发测试，幂等性测试，压力测试 | DEV | 2026-02-15 |
| R-004   | TECH     | 多模型置信度解析不一致导致数据混乱 | 2           | 3      | 6     | 每个模型的置信度解析单独测试，适配器模式测试 | DEV | 2026-02-15 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description   | Probability | Impact | Score | Mitigation   | Owner   |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------------ | ------- |
| R-005   | BUS      | Standard 用户扩展维度显示不正确 | 2           | 2      | 4     | 订阅等级集成测试 | QA |
| R-006   | DATA     | 置信度日志数据丢失影响优化分析 | 1           | 3      | 3     | 数据库事务测试，备份恢复测试 | DEV |
| R-007   | TECH     | 阈值配置热更新失败 | 1           | 3      | 3     | 配置验证测试，回滚测试 | DEV |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description   | Probability | Impact | Score | Action  |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------- |
| R-008   | OPS      | 置信度统计 API 性能下降 | 1           | 2      | 2     | Monitor |
| R-009   | BUS      | 置信度说明文案过长影响移动端体验 | 1           | 1      | 1     | Monitor |
| R-010   | TECH     | 数据库迁移兼容性问题 | 1           | 1      | 1     | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Entry Criteria

- [x] Requirements and assumptions agreed upon by QA, Dev, PM
- [ ] Test environment provisioned and accessible
- [ ] Test data available or factories ready
- [ ] Feature deployed to test environment
- [ ] Story 3-1 ~ 3-4 已完成并部署
- [ ] 数据库迁移脚本已准备

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing (or failures triaged)
- [ ] No open high-priority / high-severity bugs
- [ ] Test coverage agreed as sufficient
- [ ] 置信度计算准确率达到 100%
- [ ] 低置信度警告触发准确率 >= 95%

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (>=6) + No workaround

| Requirement   | Test Level | Risk Link | Test Count | Owner | Notes   |
| ------------- | ---------- | --------- | ---------- | ----- | ------- |
| AC-1: 置信度分数计算 | Unit, API | R-001 | 4 | DEV | 边界值 + 聚合逻辑 |
| AC-2: 低置信度警告 | E2E, API | R-002 | 3 | QA | 阈值触发 + UI 显示 |
| AC-3: 重新分析 | E2E, API | R-003 | 3 | QA | 防抖 + 幂等性 |
| AC-4: 模型差异化阈值 | Unit, API | R-004 | 2 | DEV | 多模型适配 |

**Total P0**: 12 tests, 24 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement   | Test Level | Risk Link | Test Count | Owner | Notes   |
| ------------- | ---------- | --------- | ---------- | ----- | ------- |
| AC-5: 置信度数据记录 | API, Integration | R-006 | 4 | DEV | 数据持久化 |
| AC-6: 置信度说明 | E2E, Component | - | 3 | QA | UI 交互 |
| Standard 用户扩展维度 | E2E, API | R-005 | 4 | QA | 订阅等级 |
| 置信度统计 API | API | R-008 | 3 | DEV | 性能 + 正确性 |

**Total P1**: 14 tests, 14 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement   | Test Level | Risk Link | Test Count | Owner | Notes   |
| ------------- | ---------- | --------- | ---------- | ----- | ------- |
| 阈值配置热更新 | Unit | R-007 | 3 | DEV | 配置管理 |
| 数据库迁移 | Integration | R-010 | 2 | DEV | 向后兼容 |
| UI 边缘情况 | E2E | R-009 | 2 | QA | 响应式 |

**Total P2**: 7 tests, 3.5 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement   | Test Level | Test Count | Owner | Notes   |
| ------------- | ---------- | ---------- | ----- | ------- |
| 性能基准 | Performance | 4 | QA | 压力测试 |
| 可访问性 | E2E | 4 | QA | WCAG AA |

**Total P3**: 8 tests, 2 hours

---

## ATDD Failing Tests

### Phase 1: Write Failing Tests (P0 Critical)

以下测试用例应该先编写，并在功能实现前全部失败。

#### AC-1: 置信度分数计算

**TEST-CS-001: 应正确计算各维度置信度分数**
```typescript
// tests/unit/analysis/confidence.test.ts
describe('Confidence Score Calculation', () => {
  it('TEST-CS-001: 应正确计算各维度置信度分数 @p0 @unit @confidence', () => {
    const analysisData: AnalysisData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [
            { name: '主光源方向', value: '侧光', confidence: 0.85 },
            { name: '光影对比度', value: '高对比度', confidence: 0.9 },
          ],
          confidence: 0.85,
        },
        // ... 其他维度
      },
      overallConfidence: 0.86,
    };

    const scores = extractConfidenceFromAnalysisData(analysisData);

    expect(scores.lighting).toBe(85);
    expect(scores.composition).toBe(88);
    expect(scores.color).toBe(88);
    expect(scores.style).toBe(81);
    expect(scores.overall).toBe(86);
  });
});
```

**TEST-CS-002: 应正确处理缺失维度置信度**
```typescript
it('TEST-CS-002: 应正确处理缺失维度置信度 @p0 @unit @edge-case', () => {
  const analysisData = {
    dimensions: {
      lighting: { features: [], confidence: 0 },
      composition: { features: [{ name: 'test', value: 'test', confidence: 0.5 }], confidence: 0.5 },
    },
    overallConfidence: 0.25,
  };

  const scores = extractConfidenceFromAnalysisData(analysisData);

  expect(scores.lighting).toBe(40); // 降级策略：无特征返回 40
  expect(scores.composition).toBe(50);
  expect(scores.overall).toBeLessThan(70);
});
```

**TEST-CS-003: 应正确聚合多特征置信度**
```typescript
it('TEST-CS-003: 应正确聚合多特征置信度 @p0 @unit @aggregation', () => {
  const dimension = {
    features: [
      { name: 'f1', value: 'v1', confidence: 0.8 },
      { name: 'f2', value: 'v2', confidence: 0.9 },
      { name: 'f3', value: 'v3', confidence: 0.7 },
    ],
  };

  const aggregated = aggregateConfidence(dimension.features);

  // 平均值
  expect(aggregated).toBeCloseTo(0.8, 1);
});
```

**TEST-CS-004: 应正确计算整体置信度平均值**
```typescript
it('TEST-CS-004: 应正确计算整体置信度平均值 @p0 @unit @calculation', () => {
  const scores: ConfidenceScores = {
    lighting: 85,
    composition: 88,
    color: 78,
    style: 82,
    overall: 0, // 待计算
  };

  const overall = calculateOverallConfidence(scores);

  expect(overall).toBe(83); // (85+88+78+82)/4
});
```

#### AC-2: 低置信度警告

**TEST-CW-001: 应在任一维度低于 60% 时触发警告**
```typescript
// tests/unit/analysis/confidence-warning.test.ts
describe('Low Confidence Warning', () => {
  it('TEST-CW-001: 应在任一维度低于 60% 时触发警告 @p0 @unit @warning', () => {
    const scores: ConfidenceScores = {
      overall: 72,
      lighting: 85,
      composition: 45, // 低于 60%
      color: 78,
      style: 82,
    };

    const warning = checkLowConfidence(scores);

    expect(warning).not.toBeNull();
    expect(warning?.level).toBe('low');
    expect(warning?.affectedDimensions).toContain('composition');
    expect(warning?.suggestedAction).toBe('review');
  });
});
```

**TEST-CW-002: 应在整体置信度低于 70% 时建议重试**
```typescript
it('TEST-CW-002: 应在整体置信度低于 70% 时建议重试 @p0 @unit @warning', () => {
  const scores: ConfidenceScores = {
    overall: 55,
    lighting: 52,
    composition: 58,
    color: 55,
    style: 56,
  };

  const warning = checkLowConfidence(scores);

  expect(warning?.level).toBe('low');
  expect(warning?.suggestedAction).toBe('retry');
});
```

**TEST-CW-003: 应生成正确的警告消息**
```typescript
it('TEST-CW-003: 应生成正确的警告消息 @p0 @unit @messaging', () => {
  const affectedDimensions = ['composition', 'color'];
  const warning = generateWarning('low', affectedDimensions);

  expect(warning.message).toContain('构图');
  expect(warning.message).toContain('色彩');
  expect(warning.message).toContain('置信度较低');
});
```

#### AC-3: 重新分析

**TEST-CR-001: 应在 3 秒内防止重复重试请求**
```typescript
// tests/api/analysis/retry.test.ts
describe('Analysis Retry', () => {
  it('TEST-CR-001: 应在 3 秒内防止重复重试请求 @p0 @api @debounce', async () => {
    const analysisId = 123;

    // 第一次重试
    const response1 = await fetch('/api/analysis/retry', {
      method: 'POST',
      body: JSON.stringify({ analysisId }),
    });

    // 立即第二次重试（应该被阻止）
    const response2 = await fetch('/api/analysis/retry', {
      method: 'POST',
      body: JSON.stringify({ analysisId }),
    });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(429); // Too Many Requests
  });
});
```

**TEST-CR-002: 应在重试时不扣除 Credit**
```typescript
it('TEST-CR-002: 应在重试时不扣除 Credit @p0 @api @credit', async () => {
  const analysisId = 123;
  const initialBalance = await getUserCreditBalance(userId);

  await fetch('/api/analysis/retry', {
    method: 'POST',
    body: JSON.stringify({ analysisId }),
  });

  const newBalance = await getUserCreditBalance(userId);

  expect(newBalance).toBe(initialBalance);
});
```

**TEST-CR-003: 应记录重试次数**
```typescript
it('TEST-CR-003: 应记录重试次数 @p0 @api @tracking', async () => {
  const analysisId = 123;

  await fetch('/api/analysis/retry', {
    method: 'POST',
    body: JSON.stringify({ analysisId }),
  });

  const analysis = await getAnalysisById(analysisId);

  expect(analysis.retryCount).toBe(1);
});
```

#### AC-4: 模型差异化阈值

**TEST-MT-001: 应为不同模型应用不同的阈值调整**
```typescript
// tests/unit/analysis/model-thresholds.test.ts
describe('Model Threshold Adjustments', () => {
  it('TEST-MT-001: 应为不同模型应用不同的阈值调整 @p0 @unit @model', () => {
    const baseThreshold = 60;

    const geminiThreshold = getAdjustedThreshold('gemini-flash', baseThreshold);
    const qwenThreshold = getAdjustedThreshold('qwen3-vl', baseThreshold);

    expect(geminiThreshold).toBe(55); // -5 更严格
    expect(qwenThreshold).toBe(65); // +5 更宽松
  });
});
```

**TEST-MT-002: 应正确解析多模型置信度输出**
```typescript
it('TEST-MT-002: 应正确解析多模型置信度输出 @p0 @unit @model @parsing', () => {
  // Qwen 模型输出格式
  const qwenOutput = {
    dimensions: {
      lighting: {
        features: [{ name: 'test', value: 'test', confidence: 0.85 }],
      },
    },
  };

  const scores = parseModelConfidence('qwen3-vl', qwenOutput);

  expect(scores.lighting).toBe(85);
});
```

---

### Phase 2: Implementation Checklist

开发团队必须完成以下实施项才能通过所有测试：

#### 数据结构实施
- [ ] 创建 `src/lib/analysis/types.ts` 文件
- [ ] 定义 `ConfidenceScores` 接口
- [ ] 定义 `ConfidenceWarning` 接口
- [ ] 定义 `ConfidenceLevel` 类型

#### 核心逻辑实施
- [ ] 创建 `src/lib/analysis/confidence.ts` 文件
- [ ] 实现 `extractConfidenceFromAnalysisData()` 函数
- [ ] 实现 `calculateOverallConfidence()` 函数
- [ ] 实现 `checkLowConfidence()` 函数
- [ ] 实现 `generateWarning()` 函数
- [ ] 实现 `getAdjustedThreshold()` 函数

#### 数据库实施
- [ ] 扩展 `analysis_results` 表添加 `confidence_scores` 字段
- [ ] 扩展 `analysis_results` 表添加 `retry_count` 字段
- [ ] 创建 `confidence_logs` 表
- [ ] 添加索引

#### API 实施
- [ ] 扩展 `/api/analysis` 返回置信度分数
- [ ] 创建 `/api/analysis/retry` 端点
- [ ] 创建 `/api/analysis/confidence-stats` 端点

#### UI 组件实施
- [ ] 创建 `ConfidenceBadge` 组件
- [ ] 创建 `ConfidenceWarning` 组件
- [ ] 创建 `ConfidenceExplanation` 组件
- [ ] 创建 `RetryButton` 组件

#### 防抖逻辑实施
- [ ] 客户端 3 秒防抖
- [ ] 服务端幂等性保护

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] TEST-CS-001: 置信度计算基本功能 (30s)
- [ ] TEST-CW-001: 低置信度警告触发 (30s)
- [ ] TEST-CR-001: 重试防抖基本功能 (30s)
- [ ] TEST-MT-001: 模型阈值调整 (30s)

**Total**: 4 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] TEST-CS-001 ~ CS-004: 置信度计算 (Unit)
- [ ] TEST-CW-001 ~ CW-003: 低置信度警告 (Unit)
- [ ] TEST-CR-001 ~ CR-003: 重试功能 (API)
- [ ] TEST-MT-001 ~ MT-002: 模型阈值 (Unit)

**Total**: 12 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Standard 用户扩展维度显示 (E2E)
- [ ] 置信度数据持久化 (API)
- [ ] 置信度统计 API (API)
- [ ] 置信度说明 UI (E2E)

**Total**: 14 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] 阈值配置热更新 (Unit)
- [ ] 数据库迁移兼容性 (Integration)
- [ ] 性能基准测试 (Performance)
- [ ] 可访问性测试 (E2E)

**Total**: 15 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority  | Count             | Hours/Test | Total Hours       | Notes                   |
| --------- | ----------------- | ---------- | ----------------- | ----------------------- |
| P0        | 12        | 2.0        | 24        | Complex calculation, API, E2E |
| P1        | 14        | 1.0        | 14        | Standard coverage       |
| P2        | 7        | 0.5        | 3.5        | Simple scenarios        |
| P3        | 8        | 0.25       | 2        | Exploratory             |
| **Total** | **41** | **-**      | **43.5** | **~5.4 days**  |

### Prerequisites

**Test Data:**

- `createMockAnalysisData()` factory (faker-based, auto-cleanup)
- `createMockConfidenceScores()` fixture (setup/teardown)
- Standard 用户测试账号
- Free/Lite 用户测试账号

**Tooling:**

- Vitest for unit tests
- Playwright for E2E tests
- MSW for API mocking
- Drizzle for database operations

**Environment:**

- PostgreSQL test database
- 测试用 Replicate API mock
- 测试用订阅系统 mock

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: >=95% (waivers required for failures)
- **P2/P3 pass rate**: >=90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: >=80%
- **Security scenarios**: 100%
- **Business logic**: >=70%
- **Edge cases**: >=50%
- **置信度计算**: 100%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (>=6) items unmitigated
- [ ] 置信度计算准确率 100%
- [ ] 低置信度警告触发率 >= 95%
- [ ] 重试防抖有效性 100%

---

## Mitigation Plans

### R-001: 置信度数据计算错误 (Score: 6)

**Mitigation Strategy:**
1. 实现三层验证：单元测试 -> 集成测试 -> E2E 测试
2. 所有计算逻辑使用纯函数，便于测试
3. 边界值测试覆盖所有阈值
4. 添加数据校验层，拒绝不合理数据

**Owner:** DEV
**Timeline:** 2026-02-15
**Status:** Planned
**Verification:** 单元测试覆盖率 >= 90%，集成测试通过率 100%

### R-002: 低置信度警告未正确触发 (Score: 6)

**Mitigation Strategy:**
1. 阈值配置集中管理，便于测试
2. E2E 测试覆盖所有阈值边界
3. UI 自动化验证警告显示
4. 添加监控和告警

**Owner:** QA
**Timeline:** 2026-02-15
**Status:** Planned
**Verification:** E2E 测试通过率 100%，警告触发准确率 >= 95%

### R-003: 重试防抖失效 (Score: 6)

**Mitigation Strategy:**
1. 客户端和服务端双重防护
2. 并发测试验证防抖效果
3. 压力测试模拟高并发场景
4. 数据库幂等性保护

**Owner:** DEV
**Timeline:** 2026-02-15
**Status:** Planned
**Verification:** 并发测试通过率 100%，无重复请求

### R-004: 多模型置信度解析不一致 (Score: 6)

**Mitigation Strategy:**
1. 为每个模型创建独立的解析适配器
2. 单元测试覆盖所有模型的解析逻辑
3. 集成测试验证端到端数据流
4. 添加数据格式校验层

**Owner:** DEV
**Timeline:** 2026-02-15
**Status:** Planned
**Verification:** 所有模型解析测试通过率 100%

---

## Assumptions and Dependencies

### Assumptions

1. Story 3-1 ~ 3-4 已完成并部署
2. 数据库迁移工具可用（Drizzle）
3. 测试环境与生产环境配置一致
4. 订阅系统 mock 可用

### Dependencies

1. Story 3-4 模型注册表 - Required by 2026-02-15
2. 数据库 schema 扩展 - Required by 2026-02-15
3. 订阅等级判断逻辑 - Required by 2026-02-15

### Risks to Plan

- **Risk**: 数据库迁移延迟
  - **Impact**: 测试无法执行
  - **Contingency**: 使用本地数据库快照

- **Risk**: 第三方模型 API 不稳定
  - **Impact**: E2E 测试失败
  - **Contingency**: 使用预录制响应

---

## Follow-on Workflows (Manual)

- 将本文档交付给开发工程师
- 开发工程师实现功能代码
- 运行 P0 测试验证实现
- 执行 Phase 2: Review 测试设计

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: ____________ Date: ____________
- [ ] Tech Lead: ____________ Date: ____________
- [ ] QA Lead: ____________ Date: ____________

**Comments:**

---

---

---

## Interworking & Regression

| Service/Component | Impact         | Regression Scope                |
| ----------------- | -------------- | ------------------------------- |
| **Story 3-1 分析结果** | 添加置信度字段 | 现有分析结果测试必须通过 |
| **Story 3-4 模型选择** | 集成置信度解析 | 模型选择器测试必须通过 |
| **数据库 Schema** | 扩展字段 | 迁移测试必须通过 |

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework
- `probability-impact.md` - Risk scoring methodology
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - P0-P3 prioritization

### Related Documents

- PRD: `_bmad-output/prd/epics.md`
- Epic: Epic 3 - AI 风格分析
- Story: `_bmad-output/implementation-artifacts/stories/3-5-confidence-scoring.md`
- Tech Spec: Story 3-5 Dev Notes

---

**Generated by**: TEA (Murat) - Test Architect
**Workflow**: `_bmad/tea/testarch/test-design`
**Version**: 4.0 (BMad v6)
