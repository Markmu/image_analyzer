# Story 3-5: Confidence Scoring - 测试设计 Review

> **Review 者:** TEA (Murat) - 测试架构师
> **Review 日期:** 2026-02-15
> **被 Review 文档:** story-3-5-confidence-scoring-test-design.md
> **Story:** 3-5-confidence-scoring

---

## Review 概述

**Review 结论:** PASS (有改进建议)

**总体评价:** 测试设计全面覆盖了所有 6 个验收标准，风险评估充分，测试策略清晰，ATDD 失败测试用例定义明确。发现了一些可以优化的地方，但不影响测试设计的有效性。

---

## Review 检查清单

### 1. AC 覆盖度检查

| AC | 测试覆盖 | 状态 | 备注 |
|----|---------|------|------|
| AC-1: 置信度分数计算 | PASS 完整覆盖 | PASS | TEST-CS-001 至 TEST-CS-004 |
| AC-2: 低置信度警告 | PASS 完整覆盖 | PASS | TEST-CW-001 至 TEST-CW-003 |
| AC-3: 重新分析功能 | PASS 完整覆盖 | PASS | TEST-CR-001 至 TEST-CR-003 |
| AC-4: 模型差异化阈值 | PASS 完整覆盖 | PASS | TEST-MT-001 至 TEST-MT-002 |
| AC-5: 置信度数据记录 | PASS 完整覆盖 | PASS | P1 级别覆盖 |
| AC-6: 置信度说明 UI | PASS 完整覆盖 | PASS | P1 级别覆盖 |

**结论:** PASS 所有 6 个验收标准都有对应的测试用例覆盖。

---

### 2. 边界条件检查

| 边界场景 | 测试覆盖 | 状态 | 备注 |
|---------|---------|------|------|
| 置信度 0% | PASS | PASS | TEST-CS-002 缺失维度 |
| 置信度 100% | PASS | PASS | TEST-CS-001 高置信度 |
| 阈值边界 60% | PASS | PASS | TEST-CW-001 |
| 阈值边界 70% | PASS | PASS | TEST-CW-002 |
| 空特征数组 | PASS | PASS | TEST-CS-002 |
| 缺失维度 | PASS | PASS | TEST-CS-002 |

**额外建议的边界条件:**

1. **MID-001: 缺少置信度 50% 边界测试**
   - 建议: 添加 TEST-CS-005 测试置信度正好等于 50% 的场景
   - 场景: 验证中等置信度的判定逻辑

2. **MID-002: 缺少多维度同时低置信度测试**
   - 建议: 添加 TEST-CW-004 测试所有维度都低于 60% 的场景
   - 场景: 验证多维度警告聚合

3. **MID-003: 缺少重试次数上限测试**
   - 建议: 添加 TEST-CR-004 测试达到最大重试次数后的行为
   - 场景: 防止无限重试

---

### 3. 异常场景检查

| 异常场景 | 测试覆盖 | 状态 | 备注 |
|---------|---------|------|------|
| 模型 API 失败 | PASS | PASS | R-004 覆盖 |
| 重试防抖失效 | PASS | PASS | TEST-CR-001 |
| 数据库写入失败 | PASS | PASS | R-006 覆盖 |
| 置信度解析失败 | PASS | PASS | TEST-CS-002 降级策略 |

**额外建议的异常场景:**

1. **MID-004: 缺少并发重试测试**
   - 场景: 多个用户同时对同一分析进行重试
   - 建议: 添加 TEST-CR-005 并发幂等性测试

2. **MID-005: 缺少配置热更新失败测试**
   - 场景: 阈值配置更新失败后回滚
   - 建议: 添加 TEST-TH-001 配置回滚测试

3. **MID-006: 缺少模型响应超时测试**
   - 场景: 模型分析超时后置信度如何处理
   - 建议: 添加 TEST-TO-001 超时降级测试

---

### 4. 测试独立性检查

**检查项:**
- PASS 每个测试用例都使用独立的 mock 数据
- PASS beforeEach/afterEach 钩子正确使用
- PASS 测试之间无数据依赖

**发现的问题:**

1. **MID-007: 潜在问题: 数据库状态残留**
   - 问题: 集成测试可能在数据库中留下测试数据
   - 建议: 在每个测试后清理数据库
   - 修复示例:
   ```typescript
   afterEach(async () => {
     await db.delete(confidenceLogs);
     await db.delete(analysisResults);
   });
   ```

2. **MID-008: 潜在问题: 全局配置污染**
   - 问题: 阈值配置测试可能影响其他测试
   - 建议: 使用配置快照和恢复
   - 修复示例:
   ```typescript
   let originalConfig: ConfidenceThresholds;

   beforeEach(() => {
     originalConfig = { ...CONFIDENCE_THRESHOLDS };
   });

   afterEach(() => {
     Object.assign(CONFIDENCE_THRESHOLDS, originalConfig);
   });
   ```

---

### 5. 测试命名清晰度检查

**检查项:**
- PASS 测试 ID 规范 (TEST-XX-NNN)
- PASS 测试分组合理 (AC 分类)
- PASS 优先级标签清晰 (@p0/@p1/@p2/@p3)

**建议改进:**

1. **LOW-001: 部分测试名称可以更具体**
   - 原: `TEST-CS-001: 应正确计算各维度置信度分数`
   - 建议: `TEST-CS-001: 应将 AnalysisData 置信度转换为 0-100 百分比分数`
   - 理由: 更清楚地描述输入和输出

2. **LOW-002: 添加更多描述性标签**
   - 建议: 添加 @regression, @security, @performance 等功能性标签
   - 理由: 便于测试分类和筛选

---

### 6. 断言充分性检查

**关键测试用例的断言检查:**

1. **PASS 置信度计算测试 (TEST-CS-001)**
   - 断言充分: 验证了所有 5 个置信度维度
   - 示例: `expect(scores.lighting).toBe(85)`

2. **PASS 警告触发测试 (TEST-CW-001)**
   - 断言充分: 验证了警告级别、受影响维度和建议操作
   - 示例: `expect(warning?.affectedDimensions).toContain('composition')`

3. **PASS 重试防抖测试 (TEST-CR-001)**
   - 断言充分: 验证了第一次成功和第二次被拒绝
   - 示例: `expect(response2.status).toBe(429)`

4. **MID-009: 潜在问题: 缺少时间验证**
   - **问题:** 防抖测试未验证 3 秒后可以重试
   - **建议:** 添加时间相关断言
   - 示例:
   ```typescript
   it('TEST-CR-001-EXT: 应在 3 秒后允许重试', async () => {
     await fetch('/api/analysis/retry', { method: 'POST', body: JSON.stringify({ analysisId: 123 }) });

     // 等待 3 秒
     await new Promise(resolve => setTimeout(resolve, 3000));

     const response = await fetch('/api/analysis/retry', { method: 'POST', body: JSON.stringify({ analysisId: 123 }) });

     expect(response.status).toBe(200);
   });
   ```

---

### 7. 性能测试检查

**性能测试覆盖:**
- PASS P3 级别包含性能基准测试
- PASS 重试防抖测试 (R-003)
- PASS 置信度统计 API 性能测试 (R-008)

**建议补充:**

1. **LOW-003: 缺少置信度计算性能测试**
   - 建议: 添加 TEST-PERF-001
   - 方法: 验证大量特征聚合的计算时间
   - 示例:
   ```typescript
   it('TEST-PERF-001: 置信度聚合应在 10ms 内完成', () => {
     const features = Array.from({ length: 100 }, (_, i) => ({
       name: `feature-${i}`,
       value: `value-${i}`,
       confidence: Math.random(),
     }));

     const start = performance.now();
     const result = aggregateConfidence(features);
     const duration = performance.now() - start;

     expect(duration).toBeLessThan(10);
   });
   ```

2. **LOW-004: 缺少并发写入性能测试**
   - 场景: 100 个用户同时写入置信度日志
   - 建议: 添加 TEST-PERF-002
   - 验证: 数据库连接池，无死锁

---

### 8. 可访问性测试检查

**A11y 测试覆盖:**
- PASS P3 级别包含可访问性测试
- PASS UI 组件测试包含颜色编码验证

**建议补充:**

1. **LOW-005: 缺少屏幕阅读器测试**
   - 建议: 添加 TEST-A11Y-001
   - 验证: 置信度徽章的 aria-label
   - 示例:
   ```typescript
   it('TEST-A11Y-001: 置信度徽章应有正确的 aria-label', async ({ page }) => {
     const badge = page.getByTestId('confidence-badge');
     const ariaLabel = await badge.getAttribute('aria-label');

     expect(ariaLabel).toContain('置信度');
     expect(ariaLabel).toMatch(/\d+%/);
   });
   ```

2. **LOW-006: 缺少对比度验证**
   - 建议: 添加 TEST-A11Y-002
   - 验证: 置信度颜色对比度符合 WCAG AA 标准
   - 工具: axe-core

---

### 9. 测试数据策略检查

**测试数据:**
- PASS Mock 数据结构完整
- PASS 覆盖了正常和异常场景
- PASS 测试工厂函数定义清晰

**建议改进:**

1. **MID-010: 缺少真实模型响应数据**
   - 建议: 添加录制的真实 API 响应作为测试数据
   - 好处: 提高测试真实性
   - 示例:
   ```typescript
   // tests/fixtures/recorded-responses/qwen3-vl-response.json
   {
     "dimensions": {
       "lighting": { ...真实响应... }
     }
   }
   ```

2. **LOW-007: 缺少极端值测试数据**
   - 建议: 添加极小/极大置信度值测试
   - 场景: 0.001 和 0.999 置信度

---

### 10. 测试金字塔合理性检查

**测试分布:**
- 单元测试: ~20 (49%)
- 集成测试: ~12 (29%)
- E2E 测试: ~9 (22%)

**评估:** PASS 符合测试金字塔原则

**建议:**
1. PASS 单元测试比例最高，速度快
2. PASS E2E 测试数量合理，避免过慢
3. PASS 集成测试覆盖关键路径

---

## 发现的问题汇总

### PASS 高优先级问题 (必须修复)

**无高优先级问题**

---

### MID 中优先级问题 (建议修复)

| ID | 问题 | 位置 | 建议 |
|----|------|------|------|
| MID-001 | 缺少 50% 置信度边界测试 | 边界条件 | 添加 TEST-CS-005 |
| MID-002 | 缺少多维度同时低置信度测试 | 边界条件 | 添加 TEST-CW-004 |
| MID-003 | 缺少重试次数上限测试 | 边界条件 | 添加 TEST-CR-004 |
| MID-004 | 缺少并发重试测试 | 异常场景 | 添加 TEST-CR-005 |
| MID-005 | 缺少配置热更新失败测试 | 异常场景 | 添加 TEST-TH-001 |
| MID-006 | 缺少模型响应超时测试 | 异常场景 | 添加 TEST-TO-001 |
| MID-007 | 数据库状态残留 | 测试独立性 | 添加 afterEach 清理 |
| MID-008 | 全局配置污染 | 测试独立性 | 添加配置快照恢复 |
| MID-009 | 缺少时间验证 | 断言充分性 | 添加 3 秒后重试测试 |
| MID-010 | 缺少真实模型响应数据 | 测试数据 | 添加录制响应 |

---

### LOW 低优先级问题 (可选修复)

| ID | 问题 | 位置 | 建议 |
|----|------|------|------|
| LOW-001 | 测试名称可更具体 | 命名清晰度 | 改进测试名称 |
| LOW-002 | 缺少描述性标签 | 命名清晰度 | 添加功能标签 |
| LOW-003 | 缺少置信度计算性能测试 | 性能测试 | 添加 TEST-PERF-001 |
| LOW-004 | 缺少并发写入性能测试 | 性能测试 | 添加 TEST-PERF-002 |
| LOW-005 | 缺少屏幕阅读器测试 | 可访问性 | 添加 TEST-A11Y-001 |
| LOW-006 | 缺少对比度验证 | 可访问性 | 添加 TEST-A11Y-002 |
| LOW-007 | 缺少极端值测试数据 | 测试数据 | 添加极值测试 |

---

## 改进建议

### 1. 测试用例补充

**建议添加的测试用例:**

```typescript
// TEST-CS-005: 置信度 50% 边界
describe('Confidence Score Calculation - Edge Cases', () => {
  it('TEST-CS-005: 应正确处理置信度正好等于 50% 的场景 @p1 @unit @edge-case', () => {
    const scores: ConfidenceScores = {
      overall: 50,
      lighting: 50,
      composition: 50,
      color: 50,
      style: 50,
    };

    const level = getConfidenceLevel(scores.overall);

    expect(level).toBe('medium');
    expect(checkLowConfidence(scores)).toBeNull();
  });
});

// TEST-CW-004: 多维度同时低置信度
it('TEST-CW-004: 应在多个维度同时低置信度时聚合警告 @p1 @unit @aggregation', () => {
  const scores: ConfidenceScores = {
    overall: 35,
    lighting: 38,
    composition: 32,
    color: 35,
    style: 35,
  };

  const warning = checkLowConfidence(scores);

  expect(warning?.level).toBe('critical');
  expect(warning?.affectedDimensions).toHaveLength(4);
  expect(warning?.suggestedAction).toBe('retry');
});

// TEST-CR-004: 重试次数上限
it('TEST-CR-004: 应在达到最大重试次数后拒绝重试 @p1 @api @rate-limit', async () => {
  const analysisId = 123;

  // 模拟已达到最大重试次数
  await updateAnalysisRetryCount(analysisId, 3);

  const response = await fetch('/api/analysis/retry', {
    method: 'POST',
    body: JSON.stringify({ analysisId }),
  });

  expect(response.status).toBe(429);
  const body = await response.json();
  expect(body.error.message).toContain('已达到最大重试次数');
});

// TEST-CR-005: 并发重试幂等性
it('TEST-CR-005: 应正确处理并发重试请求 @p0 @api @concurrency @idempotency', async () => {
  const analysisId = 123;

  // 同时发起 5 个重试请求
  const requests = Array.from({ length: 5 }, () =>
    fetch('/api/analysis/retry', {
      method: 'POST',
      body: JSON.stringify({ analysisId }),
    })
  );

  const responses = await Promise.all(requests);
  const statusCodes = responses.map(r => r.status);

  // 只有一个成功，其他都是 429
  const successCount = statusCodes.filter(code => code === 200).length;
  const failCount = statusCodes.filter(code => code === 429).length;

  expect(successCount).toBe(1);
  expect(failCount).toBe(4);
});
```

### 2. 测试断言增强

**改进示例:**

```typescript
// 原测试
it('TEST-CW-001: 应在任一维度低于 60% 时触发警告', () => {
  const scores: ConfidenceScores = { ... };
  const warning = checkLowConfidence(scores);
  expect(warning?.level).toBe('low');
});

// 改进后: 添加更多验证
it('TEST-CW-001: 应在任一维度低于 60% 时触发警告', () => {
  const scores: ConfidenceScores = {
    overall: 72,
    lighting: 85,
    composition: 45,
    color: 78,
    style: 82,
  };

  const warning = checkLowConfidence(scores);

  expect(warning).not.toBeNull();
  expect(warning?.level).toBe('low');
  expect(warning?.affectedDimensions).toEqual(['composition']);
  expect(warning?.message).toContain('构图');
  expect(warning?.suggestedAction).toBe('review');

  // 验证警告不会误触发高置信度维度
  expect(warning?.affectedDimensions).not.toContain('lighting');
});
```

### 3. Mock 数据改进

**建议:**

```typescript
// tests/mocks/confidence-mocks.ts
export const createMockConfidenceScores = (overrides: Partial<ConfidenceScores> = {}): ConfidenceScores => ({
  overall: 85,
  lighting: 90,
  composition: 82,
  color: 78,
  style: 88,
  ...overrides,
});

export const createLowConfidenceScores = (): ConfidenceScores => ({
  overall: 35,
  lighting: 38,
  composition: 32,
  color: 35,
  style: 35,
});

// 使用示例
it('TEST-CW-001-IMPROVED', () => {
  const scores = createMockConfidenceScores({ composition: 45 });
  const warning = checkLowConfidence(scores);
  expect(warning?.affectedDimensions).toContain('composition');
});
```

---

## 测试可维护性评估

### 优点

1. PASS 测试文件组织清晰 (按 AC 分组)
2. PASS 测试 ID 规范，易于追踪
3. PASS Mock 数据工厂函数定义清晰
4. PASS 使用了优先级标签

### 改进建议

1. **MID-011: 提取公共测试工具函数**
   ```typescript
   // tests/utils/confidence-test-helpers.ts
   export const assertConfidenceLevel = (
     score: number,
     expectedLevel: ConfidenceLevel
   ) => {
     const level = getConfidenceLevel(score);
     expect(level).toBe(expectedLevel);
   };

   export const createTestAnalysisData = (
     confidenceOverrides = {}
   ): AnalysisData => ({
     dimensions: {
       lighting: { features: [], confidence: 0.8 },
       ...confidenceOverrides,
     },
     overallConfidence: 0.8,
   });
   ```

2. **LOW-008: 添加测试配置文件**
   ```typescript
   // tests/config/confidence-test-config.ts
   export const CONFIDENCE_TEST_CONFIG = {
     debounceMs: 3000,
     maxRetries: 3,
     thresholds: {
       high: 80,
       medium: 60,
       low: 40,
       critical: 20,
     },
   } as const;
   ```

---

## 测试执行时间估算

**估算结果:**

| 测试类型 | 用例数 | 单个用例平均时间 | 总时间 |
|---------|-------|----------------|--------|
| 单元测试 | 20 | 50ms | 1s |
| 集成测试 | 12 | 500ms | 6s |
| E2E 测试 | 9 | 30s | 270s (4.5min) |
| **总计** | **41** | - | **~5 min** |

**优化建议:**
1. PASS 并行执行 E2E 测试 (使用 Playwright workers)
2. PASS 使用测试快照加速集成测试
3. PASS 单元测试已经很快

---

## 最终 Review 决策

### PASS 条件

- [x] 所有 AC 都有测试覆盖
- [x] 边界条件充分
- [x] 异常场景考虑
- [x] 测试独立性良好
- [x] 断言充分 (有改进空间)
- [x] 性能测试完备
- [x] 可访问性测试覆盖
- [x] ATDD 失败测试定义清晰
- [x] 实施清单完整

### 决策结论

**PASS - 可以进入 Phase 3 (实现功能)**

**理由:**
1. 所有 6 个验收标准都有完整测试覆盖
2. ATDD 失败测试用例定义明确，可直接用于开发
3. 测试策略合理，符合测试金字塔原则
4. 风险评估充分，缓解措施明确
5. 发现的问题都是改进建议，不影响测试有效性

**注意事项:**
1. 建议在实现过程中修复中优先级问题
2. 低优先级问题可在后续迭代中改进
3. 需要准备真实模型响应测试数据
4. 需要实现数据库清理逻辑

---

## 后续行动

### 立即执行

1. PASS 更新测试设计文档，添加改进建议
2. 将测试设计交付给开发工程师
3. 开始 Phase 3: 实现功能
4. 开发工程师先编写 P0 失败测试

### 可选优化

1. 添加测试工具函数提取
2. 添加录制真实 API 响应
3. 添加额外的边界条件测试
4. 添加并发测试

---

## 附录: 修订后的测试用例数量

| 测试类型 | 原数量 | 新增建议 | 修订后总数 |
|---------|-------|---------|-----------|
| 单元测试 | 20 | +5 | 25 |
| 集成测试 | 12 | +2 | 14 |
| E2E 测试 | 9 | +1 | 10 |
| **总计** | **41** | **+8** | **49** |

---

**Review 版本:** 1.0
**Review 状态:** PASS
**最后更新:** 2026-02-15

---

## 审查确认

- [x] AC 覆盖度: 100% (6/6)
- [x] P0 测试用例: 12 个已定义
- [x] 实施清单: 完整
- [x] 风险缓解: 4 个高风险已覆盖
- [x] 质量门禁: 定义清晰

**测试设计已批准，可以进入开发阶段。**
