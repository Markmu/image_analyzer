# ATDD 测试检查表 - Story 3-4: Vision Model Integration

**生成日期**: 2026-02-14
**Story ID**: 3-4
**Story 名称**: Vision Model Integration
**测试架构师**: TEA

---

## 测试策略

### 测试级别选择

| 验收标准 | 测试级别 | 优先级 | 原因 |
|---------|---------|-------|------|
| AC-1: 多模型支持 | API + Unit | P0 | 核心功能，需要验证模型注册和配置 |
| AC-2: 用户模型选择 | E2E + API | P0 | 用户交互流程，关键路径 |
| AC-3: 订阅等级权限 | API + E2E | P0 | 业务逻辑核心 |
| AC-4: 动态模型切换 | Unit + API | P0 | 核心实现逻辑 |
| AC-5: 管理员配置 | API + E2E | P1 | 管理功能 |
| AC-6: 使用统计 | API | P1 | 数据追踪功能 |
| AC-7: 错误处理 | API + Unit | P0 | 韧性要求 |

---

## 失败的测试用例 (TDD Red Phase)

### 1. 模型注册表测试

#### TEST-MODEL-01: 模型注册表应支持添加新模型

```typescript
test.skip('模型注册表应支持添加新模型', async () => {
  const newModel: VisionModel = {
    id: 'test-model',
    name: 'Test Model',
    description: '测试模型',
    features: ['测试'],
    replicateModelId: 'test/model:id',
    isDefault: false,
    enabled: true,
    requiresTier: 'free',
    costPerCall: 1,
    avgDuration: 10,
  };

  modelRegistry.registerModel(newModel);
  const model = modelRegistry.getModelById('test-model');

  expect(model).toBeDefined();
  expect(model?.name).toBe('Test Model');
});
```

#### TEST-MODEL-02: 模型注册表应支持移除模型

```typescript
test.skip('模型注册表应支持移除模型', async () => {
  modelRegistry.registerModel({
    id: 'temp-model',
    name: 'Temp',
    description: '',
    features: [],
    replicateModelId: 'temp',
    isDefault: false,
    enabled: true,
    requiresTier: 'free',
    costPerCall: 1,
    avgDuration: 10,
  });

  const removed = modelRegistry.unregisterModel('temp-model');
  expect(removed).toBe(true);
  expect(modelRegistry.getModelById('temp-model')).toBeUndefined();
});
```

#### TEST-MODEL-03: 模型注册表应支持启用/禁用模型

```typescript
test.skip('模型注册表应支持启用/禁用模型', async () => {
  const enabled = modelRegistry.setModelEnabled('kimi-k2.5', false);
  expect(enabled).toBe(true);

  const model = modelRegistry.getModelById('kimi-k2.5');
  expect(model?.enabled).toBe(false);
});
```

#### TEST-MODEL-04: 模型注册表应返回默认模型

```typescript
test.skip('模型注册表应返回默认模型', async () => {
  const defaultModel = modelRegistry.getDefaultModel();
  expect(defaultModel).toBeDefined();
  expect(defaultModel?.isDefault).toBe(true);
});
```

---

### 2. 订阅等级权限测试

#### TEST-TIER-05: Free 用户应只能访问默认模型

```typescript
test.skip('Free 用户应只能访问默认模型', async () => {
  const models = modelRegistry.getModelsForTier('free');
  expect(models.length).toBe(1);
  expect(models[0].id).toBe('qwen3-vl');
});
```

#### TEST-TIER-06: Lite 用户应能访问 qwen3-vl 和 kimi-k2.5

```typescript
test.skip('Lite 用户应能访问 qwen3-vl 和 kimi-k2.5', async () => {
  const models = modelRegistry.getModelsForTier('lite');
  expect(models.length).toBe(2);
  expect(models.map(m => m.id).sort()).toEqual(['kimi-k2.5', 'qwen3-vl']);
});
```

#### TEST-TIER-07: Standard 用户应能访问所有模型

```typescript
test.skip('Standard 用户应能访问所有模型', async () => {
  const models = modelRegistry.getModelsForTier('standard');
  expect(models.length).toBe(3);
  expect(models.map(m => m.id).sort()).toEqual(['gemini-flash', 'kimi-k2.5', 'qwen3-vl']);
});
```

#### TEST-TIER-08: 订阅等级权限检查应正确工作

```typescript
test.skip('订阅等级权限检查应正确工作', async () => {
  // Free 用户不能访问需要 lite 订阅的模型
  expect(modelRegistry.isModelAccessible('kimi-k2.5', 'free')).toBe(false);
  // Free 用户可以访问免费模型
  expect(modelRegistry.isModelAccessible('qwen3-vl', 'free')).toBe(true);
  // Lite 用户可以访问 lite 模型
  expect(modelRegistry.isModelAccessible('kimi-k2.5', 'lite')).toBe(true);
});
```

---

### 3. API 端点测试

#### TEST-API-09: GET /api/analysis/models 应返回可用模型列表

```typescript
test.skip('GET /api/analysis/models 应返回可用模型列表', async () => {
  const response = await request(app)
    .get('/api/analysis/models')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.models).toBeDefined();
  expect(response.body.data.models.length).toBeGreaterThan(0);
});
```

#### TEST-API-10: POST /api/analysis 应支持 modelId 参数

```typescript
test.skip('POST /api/analysis 应支持 modelId 参数', async () => {
  const response = await request(app)
    .post('/api/analysis')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      imageId: testImageId,
      modelId: 'qwen3-vl',
    });

  expect(response.status).toBe(200);
  expect(response.body.data.modelUsed).toBe('qwen3-vl');
});
```

#### TEST-API-11: POST /api/analysis 应拒绝 Free 用户访问受限模型

```typescript
test.skip('POST /api/analysis 应拒绝 Free 用户访问受限模型', async () => {
  // 模拟 Free 用户
  const response = await request(app)
    .post('/api/analysis')
    .set('Authorization', `Bearer ${freeUserToken}`)
    .send({
      imageId: testImageId,
      modelId: 'gemini-flash', // 需要 standard 订阅
    });

  expect(response.status).toBe(403);
  expect(response.body.error.code).toBe('MODEL_UNAVAILABLE');
});
```

#### TEST-API-12: 管理员应能配置模型启用状态

```typescript
test.skip('管理员应能配置模型启用状态', async () => {
  const response = await request(app)
    .post('/api/admin/models')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      modelId: 'gemini-flash',
      enabled: true,
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

#### TEST-API-13: GET /api/admin/models/stats 应返回使用统计

```typescript
test.skip('GET /api/admin/models/stats 应返回使用统计', async () => {
  const response = await request(app)
    .get('/api/admin/models/stats')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(response.body.data.stats).toBeDefined();
  expect(Array.isArray(response.body.data.stats)).toBe(true);
});
```

---

### 4. E2E 测试

#### TEST-E2E-14: 用户应能在分析设置中选择视觉模型

```typescript
test.skip('用户应能在分析设置中选择视觉模型', async ({ page }) => {
  await page.goto('/analysis');
  await page.click('[data-testid="model-selector"]');
  await page.click('[data-testid="model-option-qwen3-vl"]');

  // 验证选择已保存
  const selectedModel = await page.textContent('[data-testid="selected-model"]');
  expect(selectedModel).toContain('Qwen3 VL');
});
```

#### TEST-E2E-15: 用户选择模型后应记住偏好

```typescript
test.skip('用户选择模型后应记住偏好', async ({ page }) => {
  // 第一次选择
  await page.goto('/analysis');
  await page.click('[data-testid="model-selector"]');
  await page.click('[data-testid="model-option-kimi-k2.5"]');

  // 刷新页面
  await page.reload();

  // 验证偏好已保存
  const selectedModel = await page.textContent('[data-testid="selected-model"]');
  expect(selectedModel).toContain('Kimi K2.5');
});
```

#### TEST-E2E-16: Free 用户应看到模型锁定提示

```typescript
test.skip('Free 用户应看到模型锁定提示', async ({ page }) => {
  // 以 Free 用户登录
  await page.goto('/analysis');
  await page.click('[data-testid="model-selector"]');

  // 验证受限模型显示锁定图标
  const lockIcon = await page.locator('[data-testid="locked-model-gemini-flash"]');
  await expect(lockIcon).toBeVisible();
});
```

#### TEST-E2E-17: 分析结果应显示使用的模型名称

```typescript
test.skip('分析结果应显示使用的模型名称', async ({ page }) => {
  await page.goto('/analysis');
  await page.click('[data-testid="analyze-button"]');

  // 等待分析完成
  await page.waitForSelector('[data-testid="analysis-result"]');

  // 验证模型名称显示
  const modelName = await page.textContent('[data-testid="model-used"]');
  expect(modelName).toBeDefined();
});
```

---

### 5. 错误处理测试

#### TEST-ERR-18: 模型不可用时应返回友好错误

```typescript
test.skip('模型不可用时应返回友好错误', async () => {
  // 禁用模型
  modelRegistry.setModelEnabled('qwen3-vl', false);

  const response = await request(app)
    .post('/api/analysis')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      imageId: testImageId,
      modelId: 'qwen3-vl',
    });

  expect(response.status).toBe(400);
  expect(response.body.error.message).toContain('已禁用');
});
```

#### TEST-ERR-19: 不存在的模型 ID 应返回 404

```typescript
test.skip('不存在的模型 ID 应返回 404', async () => {
  const response = await request(app)
    .post('/api/analysis')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      imageId: testImageId,
      modelId: 'non-existent-model',
    });

  expect(response.status).toBe(404);
  expect(response.body.error.code).toBe('MODEL_NOT_FOUND');
});
```

#### TEST-ERR-20: 模型 API 失败时应重试

```typescript
test.skip('模型 API 失败时应重试', async () => {
  // Mock Replicate API 失败一次后成功
  let attemptCount = 0;
  mockReplicate.onFirstCall().reject();
  mockReplicate.onSecondCall().resolve(mockAnalysisResult);

  const result = await analyzeImageWithModel(testImageUrl, 'qwen3-vl');

  expect(result).toBeDefined();
  expect(mockReplicate).toHaveBeenCalledTimes(2);
});
```

---

### 6. Prompt 模板测试

#### TEST-PROMPT-21: 不同模型应返回不同的 prompt

```typescript
test.skip('不同模型应返回不同的 prompt', async () => {
  const qwenPrompt = getModelPrompt('qwen3-vl');
  const kimiPrompt = getModelPrompt('kimi-k2.5');

  expect(qwenPrompt).not.toBe(kimiPrompt);
  expect(qwenPrompt).toContain('Analyze');
  expect(kimiPrompt).toContain('分析');
});
```

#### TEST-PROMPT-22: 未知模型应回退到默认 prompt

```typescript
test.skip('未知模型应回退到默认 prompt', async () => {
  const prompt = getModelPrompt('unknown-model');
  const defaultPrompt = getModelPrompt('qwen3-vl');

  expect(prompt).toBe(defaultPrompt);
});
```

---

## 边界条件测试

| 测试 ID | 边界条件 | 预期行为 |
|--------|---------|---------|
| TEST-BOUND-01 | 模型列表为空 | 返回错误或使用默认模型 |
| TEST-BOUND-02 | 所有模型都被禁用 | 返回错误提示用户联系管理员 |
| TEST-BOUND-03 | 模型配置缺失 requiredTier | 默认为 'standard' |
| TEST-BOUND-04 | 用户订阅等级为 null | 默认为 'free' |
| TEST-BOUND-05 | 同时请求多个模型 | 依次处理，不并发 |

---

## 测试数据工厂

### User Factory

```typescript
// tests/support/factories/user-factory.ts
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  subscriptionTier: 'free', // 默认
  createdAt: new Date(),
  ...overrides,
});

export const createFreeUser = () => createTestUser({ subscriptionTier: 'free' });
export const createLiteUser = () => createTestUser({ subscriptionTier: 'lite' });
export const createStandardUser = () => createTestUser({ subscriptionTier: 'standard' });
export const createAdminUser = () => createTestUser({ role: 'admin' });
```

### Model Factory

```typescript
// tests/support/factories/model-factory.ts
export const createVisionModel = (overrides: Partial<VisionModel> = {}): VisionModel => ({
  id: faker.string.alphanumeric(8),
  name: 'Test Model',
  description: 'Test description',
  features: ['test'],
  replicateModelId: 'test/model:id',
  isDefault: false,
  enabled: true,
  requiresTier: 'free',
  costPerCall: 1,
  avgDuration: 10,
  ...overrides,
});
```

---

## 实施清单

### Phase 1: 模型配置系统

- [ ] 实现 VisionModel 接口
- [ ] 实现 ModelRegistry 类
- [ ] 添加 DEFAULT_VISION_MODELS 配置
- [ ] 实现 TIER_ACCESS 映射

### Phase 2: API 端点

- [ ] 实现 GET /api/analysis/models
- [ ] 实现 POST /api/admin/models
- [ ] 实现 GET /api/admin/models/stats
- [ ] 扩展 POST /api/analysis 支持 modelId

### Phase 3: 前端 UI

- [ ] 创建 ModelSelector 组件
- [ ] 实现用户偏好保存
- [ ] 实现订阅等级限制 UI

### Phase 4: 数据库

- [ ] 创建 model_config 表
- [ ] 创建 model_usage_stats 表
- [ ] 扩展 analysis_results 表添加 modelId

### Phase 5: 测试

- [ ] 实现单元测试
- [ ] 实现 API 集成测试
- [ ] 实现 E2E 测试

---

## 总结

### 测试统计

| 类别 | 数量 |
|------|-----|
| 模型注册表测试 | 4 |
| 订阅等级权限测试 | 4 |
| API 端点测试 | 5 |
| E2E 测试 | 4 |
| 错误处理测试 | 3 |
| Prompt 模板测试 | 2 |
| **总计** | **22** |

### 优先级分布

| 优先级 | 数量 |
|--------|------|
| P0 (必须实现) | 14 |
| P1 (应该实现) | 6 |
| P2 (可以延后) | 2 |

### 预计执行时间

- 单元测试: ~5 分钟
- API 测试: ~10 分钟
- E2E 测试: ~15 分钟
- **总计**: ~30 分钟
