# ATDD Checklist - Story 3-2: 批量分析功能

**生成日期**: 2026-02-13
**Story**: 3-2-batch-analysis
**状态**: TDD RED PHASE (测试将失败，因为功能尚未实现)

---

## 执行摘要

- **API 测试**: 6 个 (含 test.skip())
- **E2E 测试**: 8 个 (含 test.skip())
- **总测试数**: 14 个
- **TDD 阶段**: RED (功能未实现，测试将失败)

---

## 1. API 测试 (tests/api/analysis/batch-analysis-api.spec.ts)

### AC-2: 批量分析 API 端点

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P0 | api-batch-001 | POST /api/analysis/batch - 成功发起批量分析 | AC-2 |
| P0 | api-batch-002 | GET /api/analysis/batch/[id]/status - 查询批量分析状态 | AC-2 |
| P1 | api-batch-003 | POST /api/analysis/batch - 串行模式分析 | AC-2 |
| P1 | api-batch-004 | POST /api/analysis/batch - 并行模式分析 | AC-2 |

### AC-6: Credit 系统集成

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P0 | api-credit-001 | POST /api/analysis/batch - Credit 不足时拒绝 | AC-6 |
| P1 | api-credit-002 | POST /api/analysis/batch - 预扣 credit 成功 | AC-6 |

### AC-7: 内容安全检查

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P1 | api-safety-001 | POST /api/analysis/batch - 不当内容图片跳过 | AC-7 |
| P1 | api-safety-002 | POST /api/analysis/batch - 记录审核日志 | AC-7 |

### AC-8: 重试机制

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P1 | api-retry-001 | POST /api/analysis/batch/[id]/retry - 重试失败图片 | AC-8 |

---

## 2. E2E 测试 (tests/e2e/batch-analysis.spec.ts)

### AC-1: 批量图片上传 UI

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P0 | e2e-upload-001 | 上传 5 张图片 - 批量选择器 UI 显示 | AC-1 |
| P0 | e2e-upload-002 | 上传超过 5 张图片 - 验证限制 | AC-1 |
| P1 | e2e-upload-003 | 图片排序 - 拖拽操作 | AC-1 |
| P1 | e2e-upload-004 | 图片移除 - 删除单张图片 | AC-1 |

### AC-4: 进度显示 UI

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P0 | e2e-progress-001 | 批量分析进度 - 显示整体进度 | AC-4 |
| P0 | e2e-progress-002 | 批量分析进度 - 显示当前图片序号 | AC-4 |
| P1 | e2e-progress-003 | 批量分析进度 - 显示预计剩余时间 | AC-4 |

### AC-5: 结果对比视图

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P0 | e2e-result-001 | 批量分析完成 - 显示每张图片结果 | AC-5 |
| P1 | e2e-result-002 | 共同特征高亮显示 (绿色边框) | AC-5 |
| P1 | e2e-result-003 | 独特特征高亮显示 (蓝色边框) | AC-5 |
| P1 | e2e-result-004 | 综合分析结果卡片显示 | AC-5 |

### AC-8: 错误处理 UI

| 优先级 | 测试用例 ID | 描述 | 验收标准覆盖 |
|--------|-------------|------|--------------|
| P1 | e2e-error-001 | 单张图片失败 - 其他图片不受影响 | AC-8 |
| P1 | e2e-error-002 | 显示成功/失败图片列表 | AC-8 |
| P1 | e2e-error-003 | 重试失败图片按钮 | AC-8 |

---

## 3. 测试详细说明

### API 测试详细用例

#### api-batch-001: POST /api/analysis/batch - 成功发起批量分析

```typescript
test.skip('[P0] should create batch analysis successfully', async ({ request }) => {
  const response = await request.post('/api/analysis/batch', {
    data: {
      imageIds: [1, 2, 3],
      mode: 'serial'
    }
  });

  expect(response.status()).toBe(201);

  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.data.batchId).toBeDefined();
  expect(data.data.status).toBe('pending');
  expect(data.data.creditRequired).toBe(3);
});
```

#### api-batch-002: GET /api/analysis/batch/[id]/status - 查询状态

```typescript
test.skip('[P0] should get batch analysis status', async ({ request }) => {
  // 先创建批量分析
  const createResponse = await request.post('/api/analysis/batch', {
    data: { imageIds: [1, 2], mode: 'serial' }
  });
  const { batchId } = await createResponse.json();

  // 查询状态
  const statusResponse = await request.get(`/api/analysis/batch/${batchId}/status`);

  expect(statusResponse.status()).toBe(200);

  const data = await statusResponse.json();
  expect(data.data.batchId).toBe(batchId);
  expect(data.data.progress).toBeDefined();
  expect(data.data.progress.total).toBe(2);
});
```

#### api-credit-001: Credit 不足拒绝

```typescript
test.skip('[P0] should reject batch analysis when credits insufficient', async ({ request }) => {
  const response = await request.post('/api/analysis/batch', {
    data: {
      imageIds: [1, 2, 3, 4, 5],
      mode: 'serial'
    }
  });

  // 期望返回 402 Payment Required
  expect(response.status()).toBe(402);

  const error = await response.json();
  expect(error.error.code).toBe('INSUFFICIENT_CREDITS');
  expect(error.error.message).toContain('credit');
});
```

#### api-safety-001: 内容安全检查

```typescript
test.skip('[P1] should skip images that fail content safety check', async ({ request }) => {
  const response = await request.post('/api/analysis/batch', {
    data: {
      imageIds: [1, 2, 3],
      mode: 'serial'
    }
  });

  expect(response.status()).toBe(201);

  const data = await response.json();
  // 检查是否有被跳过的图片
  expect(data.data.skippedImageIds).toBeDefined();
});
```

#### api-retry-001: 重试失败图片

```typescript
test.skip('[P1] should retry failed image analysis', async ({ request }) => {
  // 创建批量分析并模拟失败
  const batchResponse = await request.post('/api/analysis/batch', {
    data: { imageIds: [1, 2], mode: 'serial' }
  });
  const { batchId } = await batchResponse.json();

  // 重试失败图片
  const retryResponse = await request.post(`/api/analysis/batch/${batchId}/retry`, {
    data: { failedImageIds: [2] }
  });

  expect(retryResponse.status()).toBe(200);
  expect((await retryResponse.json()).data.message).toContain('重试');
});
```

### E2E 测试详细用例

#### e2e-upload-001: 批量上传 UI

```typescript
test.skip('[P0] should display batch upload UI with 5 image slots', async ({ page }) => {
  await page.goto('/analysis/batch');

  // 验证批量上传选择器显示
  await expect(page.getByTestId('batch-upload-selector')).toBeVisible();

  // 验证有 5 个上传槽位
  const slots = await page.getByTestId('upload-slot').all();
  expect(slots).toHaveLength(5);
});
```

#### e2e-progress-001: 进度显示

```typescript
test.skip('[P0] should display batch analysis progress', async ({ page }) => {
  await page.goto('/analysis/batch');

  // 上传图片并开始分析
  await page.getByTestId('batch-upload-selector').setInputFiles([
    'test-image-1.jpg',
    'test-image-2.jpg',
    'test-image-3.jpg'
  ]);
  await page.getByTestId('start-batch-analysis').click();

  // 验证进度条显示
  await expect(page.getByTestId('progress-bar')).toBeVisible();

  // 验证进度文本
  await expect(page.getByText(/已完成 \d+\/\d+/)).toBeVisible();
});
```

#### e2e-result-001: 结果对比视图

```typescript
test.skip('[P0] should display comparison view after batch analysis', async ({ page }) => {
  await page.goto('/analysis/batch');

  // 完成批量分析
  await uploadAndAnalyzeBatch(page, [1, 2, 3]);

  // 验证每张图片结果卡片显示
  const resultCards = await page.getByTestId('analysis-result-card').all();
  expect(resultCards).toHaveLength(3);

  // 验证综合结果卡片
  await expect(page.getByTestId('combined-result-card')).toBeVisible();
});
```

#### e2e-result-002: 共同特征高亮

```typescript
test.skip('[P1] should highlight common features with green border', async ({ page }) => {
  await page.goto('/analysis/batch');

  await uploadAndAnalyzeBatch(page, [1, 2, 3]);

  // 验证共同特征区域有绿色边框
  const commonFeatures = page.getByTestId('common-features');
  await expect(commonFeatures).toHaveCSS('border-color', 'rgb(34, 197, 94)');
});
```

#### e2e-error-001: 错误处理

```typescript
test.skip('[P1] should continue analysis when single image fails', async ({ page }) => {
  await page.goto('/analysis/batch');

  await uploadAndAnalyzeBatchWithFailure(page, [1, 2, 3]);

  // 验证显示哪些图片成功/失败
  await expect(page.getByText(/成功: \d+ 张/)).toBeVisible();
  await expect(page.getByText(/失败: \d+ 张/)).toBeVisible();

  // 验证重试按钮显示
  await expect(page.getByTestId('retry-failed-button')).toBeVisible();
});
```

---

## 4. 实施清单 (Implementation Checklist)

### Task 1: 扩展批量上传组件 (AC-1) ⏱️ 1小时

- [ ] Subtask 1.1: 扩展现有的批量上传组件
  - [ ] 位置: `src/features/analysis/components/ImageUploader/`
  - [ ] 添加批量选择模式切换
- [ ] Subtask 1.2: 实现图片排序和移除功能
  - [ ] 支持拖拽排序
  - [ ] 支持移除单张图片
  - [ ] 显示缩略图预览
- [ ] Subtask 1.3: 验证批量上传限制
  - [ ] 最多 5 张图片
  - [ ] 图片格式验证

### Task 2: 创建批量分析服务 (AC-2, AC-8) ⏱️ 2小时

- [ ] Subtask 2.1: 创建批量分析服务
  - [ ] 位置: `src/lib/analysis/batch.ts`
  - [ ] 函数: `analyzeBatch(imageUrls: string[], mode: 'serial' | 'parallel')`
- [ ] Subtask 2.2: 实现串行分析模式
- [ ] Subtask 2.3: 实现并行分析模式 (最大并发 3)
- [ ] Subtask 2.4: 实现错误处理和重试

### Task 3: 实现共同特征提取算法 (AC-3) ⏱️ 2小时

- [ ] Subtask 3.1: 设计特征对比算法
  - [ ] 位置: `src/lib/analysis/feature-extraction.ts`
- [ ] Subtask 3.2: 识别共同特征
- [ ] Subtask 3.3: 识别独特特征
- [ ] Subtask 3.4: 生成综合分析结果

### Task 4: 创建批量分析 API 端点 (AC-2, AC-6, AC-7) ⏱️ 2小时

- [ ] Subtask 4.1: POST `/api/analysis/batch`
  - [ ] 检查 credit 余额
  - [ ] 内容安全检查
- [ ] Subtask 4.2: GET `/api/analysis/batch/[id]/status`
- [ ] Subtask 4.3: POST `/api/analysis/batch/[id]/retry`

### Task 5: 实现批量分析前端 UI (AC-4, AC-5) ⏱️ 3小时

- [ ] Subtask 5.1: 创建批量分析进度组件
  - [ ] 位置: `src/features/analysis/components/BatchAnalysisProgress/`
  - [ ] 复用 ProgressDisplay 组件 (Story 2-4)
- [ ] Subtask 5.2: 创建批量分析结果对比视图
  - [ ] 位置: `src/features/analysis/components/BatchAnalysisResult/`
- [ ] Subtask 5.3: 实现共同特征高亮显示
  - [ ] 绿色边框标注共同特征
  - [ ] 蓝色边框标注独特特征
- [ ] Subtask 5.4: 实现错误处理 UI

### Task 6: 集成 Credit 扣除逻辑 (AC-6) ⏱️ 1小时

- [ ] Subtask 6.1: 预扣 credit
- [ ] Subtask 6.2: 动态调整 credit
- [ ] Subtask 6.3: 记录 credit 交易历史

### Task 7: 编写测试 (AC-2, AC-3, AC-8) ⏱️ 2小时

- [ ] Subtask 7.1: 测试批量分析服务
- [ ] Subtask 7.2: 测试特征提取算法
- [ ] Subtask 7.3: 测试 API 端点
- [ ] Subtask 7.4: E2E 测试完整批量分析流程

---

## 5. 优先级矩阵

| 优先级 | 数量 | 说明 |
|--------|------|------|
| P0 | 10 | 核心功能，必须实现 |
| P1 | 8 | 重要功能，应该实现 |
| P2 | 0 | 可选功能 |
| P3 | 0 | 可选功能 |

---

## 6. 依赖关系

```
Epic 2 (已完成)
  ├─ Story 2-1 (图片上传) ✅
  ├─ Story 2-2 (批量上传) ✅ → 复用组件
  ├─ Story 2-3 (上传验证) ✅
  └─ Story 2-4 (进度反馈) ✅ → 复用组件
        ↓
Epic 3 (AI 风格分析)
  ├─ Story 3-1 (风格分析) ✅ → 复用分析逻辑
  └─ Story 3-2 (批量分析) ← 当前
```

---

## 7. 边界和异常情况测试覆盖

| 场景 | 测试用例 |
|------|----------|
| 上传 0 张图片 | e2e-upload-001 (验证提示) |
| 上传 1 张图片 | api-batch-001 (单张) |
| 上传 5 张图片 (最大) | e2e-upload-001 |
| 上传 6 张图片 (超过限制) | e2e-upload-002 |
| Credit 不足 | api-credit-001 |
| 部分图片内容不安全 | api-safety-001 |
| 单张图片分析失败 | e2e-error-001 |
| 串行模式分析 | api-batch-003 |
| 并行模式分析 | api-batch-004 |
| 重试失败图片 | api-retry-001 |

---

## 8. 知识库模式应用

测试生成遵循以下知识库模式：

- **data-factories.md**: 使用 `createAnalysis()` 工厂生成测试数据
- **component-tdd.md**: 遵循 Red-Green-Refactor 循环
- **test-quality.md**: 确定性、隔离性、显式断言
- **selector-resilience.md**: 使用 getByRole, getByTestId 等弹性选择器
- **test-healing-patterns.md**: 避免硬编码、硬等待

---

**注意**: 所有测试在功能实现前使用 `test.skip()` 标记为跳过，这是 TDD Red 阶段的预期行为。
