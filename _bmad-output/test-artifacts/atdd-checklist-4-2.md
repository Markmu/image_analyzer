# ATDD 测试检查表 - Story 4-2: Generation Safety

**生成日期**: 2026-02-15
**Story ID**: 4-2
**Story 名称**: Generation Safety (生成安全)
**测试架构师**: TEA (Murat)

---

## 测试策略

### 测试级别选择

| 验收标准 | 测试级别 | 优先级 | 原因 |
|---------|---------|-------|------|
| AC-1: 提示词前置审核 | API + E2E | P0 | 核心安全功能，关键路径 |
| AC-2: 生成图片后置审核 | API + E2E | P0 | 核心安全功能，关键路径 |
| AC-3: 安全约束注入 | API + Unit | P0 | 核心业务逻辑 |
| AC-4: 审核失败处理 | API + E2E | P0 | 用户体验关键路径 |
| AC-5: 审核状态 UI | E2E + Component | P1 | UI 展示 |
| AC-6: 高风险人工审核 | API + E2E | P1 | 管理功能 |

---

## 失败的测试用例 (TDD Red Phase)

### 1. 提示词前置审核测试

#### TEST-PROMPT-01: 正常提示词应通过审核

```typescript
test.skip('正常提示词应通过审核', async () => {
  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '一只可爱的猫咪坐在窗台上',
      templateId: 1,
    });

  expect(response.status).toBe(200);
  expect(response.body.data.moderation.prompt.status).toBe('approved');
  expect(response.body.data.moderation.prompt.confidence).toBeGreaterThan(0.8);
});
```

#### TEST-PROMPT-02: 暴力相关提示词应被拒绝

```typescript
test.skip('暴力相关提示词应被拒绝', async () => {
  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '一个暴力血腥的场景',
      templateId: 1,
    });

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('PROMPT_REJECTED');
  expect(response.body.error.details.reason).toBe('violence');
  expect(response.body.error.details.suggestion).toContain('暴力');
});
```

#### TEST-PROMPT-03: 敏感内容提示词应被拒绝

```typescript
test.skip('敏感内容提示词应被拒绝', async () => {
  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '生成敏感的成人内容',
      templateId: 1,
    });

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('PROMPT_REJECTED');
  expect(response.body.error.details.reason).toBe('sexual');
});
```

#### TEST-PROMPT-04: 非法内容提示词应被拒绝

```typescript
test.skip('非法内容提示词应被拒绝', async () => {
  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '生成违禁品的图片',
      templateId: 1,
    });

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('PROMPT_REJECTED');
  expect(response.body.error.details.reason).toBe('illegal');
});
```

#### TEST-PROMPT-05: 提示词审核应记录日志

```typescript
test.skip('提示词审核应记录日志', async () => {
  await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '美丽的风景',
      templateId: 1,
    });

  // 验证审核日志
  const logs = await db.query.moderationLogs.findMany({
    where: and(
      eq(moderationLogs.userId, testUserId),
      eq(moderationLogs.contentType, 'prompt')
    )
  });

  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].action).toBe('approved');
});
```

---

### 2. 生成图片后置审核测试

#### TEST-IMAGE-06: 正常生成的图片应通过审核

```typescript
test.skip('正常生成的图片应通过审核', async () => {
  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '一只可爱的猫咪',
      templateId: 1,
    });

  expect(response.status).toBe(200);
  expect(response.body.data.moderation.image.status).toBe('approved');
  expect(response.body.data.moderation.image.confidence).toBeGreaterThan(0.8);
});
```

#### TEST-IMAGE-07: 审核失败的图片应自动删除

```typescript
test.skip('审核失败的图片应自动删除', async () => {
  // Mock 生成返回违规图片
  mockGenerationAPI.resolve({
    imageUrl: 'https://example.com/violent-image.png',
    generationId: 123,
  });

  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '正常提示词',
      templateId: 1,
    });

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('IMAGE_REJECTED');

  // 验证图片已被删除
  const deletedImage = await db.query.generations.findFirst({
    where: eq(generations.id, 123)
  });
  expect(deletedImage).toBeUndefined();
});
```

#### TEST-IMAGE-08: 图片审核失败应通知用户

```typescript
test.skip('图片审核失败应通知用户', async ({ page }) => {
  await page.goto('/generate');
  await page.fill('[data-testid="prompt-input"]', '正常提示词');
  await page.click('[data-testid="generate-button"]');

  // 等待图片审核失败提示
  const errorMessage = page.locator('[data-testid="moderation-error"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage.locator('text=图片')).toBeVisible();
  await expect(errorMessage.locator('text=已删除')).toBeVisible();
});
```

#### TEST-IMAGE-09: 图片审核日志应正确记录

```typescript
test.skip('图片审核日志应正确记录', async () => {
  await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '美丽的风景',
      templateId: 1,
    });

  // 验证审核日志
  const logs = await db.query.moderationLogs.findMany({
    where: and(
      eq(moderationLogs.userId, testUserId),
      eq(moderationLogs.contentType, 'image')
    )
  });

  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].generationId).toBeDefined();
});
```

---

### 3. 安全约束注入测试

#### TEST-CONSTRAINT-10: 默认安全约束应自动添加

```typescript
test.skip('默认安全约束应自动添加', async () => {
  const userPrompt = '一只可爱的猫咪';
  const safePrompt = buildSafePrompt(userPrompt, 'default');

  expect(safePrompt).toContain(userPrompt);
  expect(safePrompt).toContain('nsfw');
  expect(safePrompt).toContain('violence');
  expect(safePrompt).toContain('gore');
});
```

#### TEST-CONSTRAINT-11: 人像模板应添加专用约束

```typescript
test.skip('人像模板应添加专用约束', async () => {
  const userPrompt = '一位优雅的女士';
  const safePrompt = buildSafePrompt(userPrompt, 'portrait');

  expect(safePrompt).toContain('deformed');
  expect(safePrompt).toContain('bad anatomy');
  expect(safePrompt).toContain('extra fingers');
});
```

#### TEST-CONSTRAINT-12: 风景模板应添加专用约束

```typescript
test.skip('风景模板应添加专用约束', async () => {
  const userPrompt = '美丽的山景';
  const safePrompt = buildSafePrompt(userPrompt, 'landscape');

  expect(safePrompt).toContain('unnatural colors');
  expect(safePrompt).toContain('distorted perspective');
});
```

#### TEST-CONSTRAINT-13: 安全约束不应修改用户原始提示词

```typescript
test.skip('安全约束不应修改用户原始提示词', async () => {
  const userPrompt = '一只可爱的猫咪';
  const safePrompt = buildSafePrompt(userPrompt, 'default');

  // 用户提示词应保持不变
  expect(safePrompt).toContain(userPrompt);

  // 约束应该添加在 negative 部分
  expect(safePrompt).toMatch(/negative:/i);
});
```

---

### 4. 审核失败处理测试

#### TEST-FAIL-14: 审核失败应显示友好错误

```typescript
test.skip('审核失败应显示友好错误', async ({ page }) => {
  await page.goto('/generate');
  await page.fill('[data-testid="prompt-input"]', '暴力场景');
  await page.click('[data-testid="generate-button"]');

  // 验证友好错误提示
  const errorDialog = page.locator('[data-testid="moderation-error-dialog"]');
  await expect(errorDialog).toBeVisible();
  await expect(errorDialog.locator('text=提示词')).toBeVisible();
  await expect(errorDialog.locator('text=修改')).toBeVisible();
});
```

#### TEST-FAIL-15: 审核失败应提供修改建议

```typescript
test.skip('审核失败应提供修改建议', async () => {
  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '暴力内容',
      templateId: 1,
    });

  expect(response.status).toBe(400);
  expect(response.body.error.details.suggestion).toBeDefined();
  expect(response.body.error.details.policyLink).toBe('/content-policy');
});
```

#### TEST-FAIL-16: 审核失败不应扣除 credit

```typescript
test.skip('审核失败不应扣除 credit', async () => {
  // 获取当前 credit
  const userBefore = await db.query.user.findFirst({
    where: eq(user.id, testUserId)
  });
  const creditBefore = userBefore.credits;

  // 发送会被拒绝的请求
  await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      prompt: '暴力内容',
      templateId: 1,
    });

  // 验证 credit 未减少
  const userAfter = await db.query.user.findFirst({
    where: eq(user.id, testUserId)
  });
  expect(userAfter.credits).toBe(creditBefore);
});
```

#### TEST-FAIL-17: 用户应能修改提示词后重试

```typescript
test.skip('用户应能修改提示词后重试', async ({ page }) => {
  await page.goto('/generate');

  // 第一次输入违规提示词
  await page.fill('[data-testid="prompt-input"]', '暴力场景');
  await page.click('[data-testid="generate-button"]');

  // 等待审核失败
  await page.waitForSelector('[data-testid="moderation-error-dialog"]');

  // 修改提示词
  await page.fill('[data-testid="prompt-input"]', '美丽的风景');
  await page.click('[data-testid="retry-button"]');

  // 验证生成成功
  await page.waitForSelector('[data-testid="generation-result"]');
  const result = page.locator('[data-testid="generation-result"]');
  await expect(result).toBeVisible();
});
```

---

### 5. 审核状态 UI 测试

#### TEST-UI-18: 生成过程应显示审核进度

```typescript
test.skip('生成过程应显示审核进度', async ({ page }) => {
  await page.goto('/generate');
  await page.fill('[data-testid="prompt-input"]', '美丽的风景');
  await page.click('[data-testid="generate-button"]');

  // 验证审核进度显示
  const progress = page.locator('[data-testid="moderation-progress"]');
  await expect(progress).toBeVisible();
  await expect(progress.locator('text=审核')).toBeVisible();
});
```

#### TEST-UI-19: 审核通过应显示安全徽章

```typescript
test.skip('审核通过应显示安全徽章', async ({ page }) => {
  await page.goto('/generate');
  await page.fill('[data-testid="prompt-input"]', '美丽的风景');
  await page.click('[data-testid="generate-button"]');

  await page.waitForSelector('[data-testid="generation-result"]');

  // 验证安全徽章显示
  const badge = page.locator('[data-testid="safety-badge"]');
  await expect(badge).toBeVisible();
  await expect(badge.locator('text=已审核')).toBeVisible();
});
```

#### TEST-UI-20: 审核失败应显示详细原因

```typescript
test.skip('审核失败应显示详细原因', async ({ page }) => {
  await page.goto('/generate');
  await page.fill('[data-testid="prompt-input"]', '暴力场景');
  await page.click('[data-testid="generate-button"]');

  await page.waitForSelector('[data-testid="moderation-error"]');

  // 验证详细原因显示
  const errorDetails = page.locator('[data-testid="moderation-error-details"]');
  await expect(errorDetails).toBeVisible();
  await expect(errorDetails.locator('text=暴力')).toBeVisible();
});
```

#### TEST-UI-21: 用户应能查看审核历史

```typescript
test.skip('用户应能查看审核历史', async ({ page }) => {
  await page.goto('/generate/history');

  // 验证历史记录显示
  const historyItem = page.locator('[data-testid="moderation-history-item"]');
  await expect(historyItem.first()).toBeVisible();

  // 验证审核状态标记
  const statusBadge = historyItem.first().locator('[data-testid="moderation-status"]');
  await expect(statusBadge).toBeVisible();
});
```

---

### 6. 高风险人工审核测试

#### TEST-RISK-22: 高风险请求应进入人工审核队列

```typescript
test.skip('高风险请求应进入人工审核队列', async () => {
  // 模拟高风险用户（多次审核失败历史）
  const highRiskUser = await createHighRiskUser();

  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${highRiskUser.token}`)
    .send({
      prompt: '正常提示词',
      templateId: 1,
    });

  expect(response.status).toBe(200);
  expect(response.body.data.status).toBe('pending_review');

  // 验证已加入队列
  const queueItem = await db.query.manualReviewQueue.findFirst({
    where: eq(manualReviewQueue.userId, highRiskUser.id)
  });
  expect(queueItem).toBeDefined();
  expect(queueItem.riskLevel).toBe('high');
});
```

#### TEST-RISK-23: 低风险请求应直接执行

```typescript
test.skip('低风险请求应直接执行', async () => {
  const lowRiskUser = await createLowRiskUser();

  const response = await request(app)
    .post('/api/generate')
    .set('Authorization', `Bearer ${lowRiskUser.token}`)
    .send({
      prompt: '美丽的风景',
      templateId: 1,
    });

  expect(response.status).toBe(200);
  expect(response.body.data.status).toBe('completed');
  expect(response.body.data.imageUrl).toBeDefined();
});
```

#### TEST-RISK-24: 管理员应能看到待审核队列

```typescript
test.skip('管理员应能看到待审核队列', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/moderation-queue');

  // 验证队列显示
  const queueList = page.locator('[data-testid="review-queue-list"]');
  await expect(queueList).toBeVisible();

  const pendingItem = queueList.locator('[data-testid="pending-item"]');
  await expect(pendingItem.first()).toBeVisible();
});
```

#### TEST-RISK-25: 管理员应能批准生成请求

```typescript
test.skip('管理员应能批准生成请求', async () => {
  // 创建待审核项目
  const pendingItem = await createPendingReviewItem();

  const response = await request(app)
    .post(`/api/admin/moderation-queue/${pendingItem.id}/review`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      action: 'approve',
      notes: '内容安全，批准生成',
    });

  expect(response.status).toBe(200);
  expect(response.body.data.status).toBe('approved');

  // 验证队列状态已更新
  const updatedItem = await db.query.manualReviewQueue.findFirst({
    where: eq(manualReviewQueue.id, pendingItem.id)
  });
  expect(updatedItem.status).toBe('approved');
});
```

#### TEST-RISK-26: 管理员拒绝后应通知用户

```typescript
test.skip('管理员拒绝后应通知用户', async () => {
  const pendingItem = await createPendingReviewItem();

  await request(app)
    .post(`/api/admin/moderation-queue/${pendingItem.id}/review`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      action: 'reject',
      notes: '内容不符合政策',
    });

  // 验证用户收到通知
  const notification = await db.query.notifications.findFirst({
    where: eq(notifications.userId, pendingItem.userId)
  });
  expect(notification).toBeDefined();
  expect(notification.message).toContain('审核未通过');
});
```

#### TEST-RISK-27: 风险评估应考虑用户历史

```typescript
test.skip('风险评估应考虑用户历史', async () => {
  const user = await createTestUser();

  // 创建多次审核失败历史
  await createModerationLogs(user.id, [
    { action: 'rejected', reason: 'violence' },
    { action: 'rejected', reason: 'sexual' },
    { action: 'rejected', reason: 'illegal' },
  ]);

  const assessment = assessRisk(user.id, '正常提示词', userHistory);

  expect(assessment.level).toBe('high');
  expect(assessment.requiresManualReview).toBe(true);
});
```

---

## 边界条件测试

| 测试 ID | 边界条件 | 预期行为 |
|--------|---------|---------|
| TEST-BOUND-01 | 审核服务不可用 | 返回友好错误，稍后重试 |
| TEST-BOUND-02 | 提示词过长 (>500 字符) | 增加风险评估分数 |
| TEST-BOUND-03 | 提示词包含特殊字符 | 正确处理不报错 |
| TEST-BOUND-04 | 同时提交多个生成请求 | 依次审核处理 |
| TEST-BOUND-05 | 管理员审核超时 | 自动标记为需要重新审核 |
| TEST-BOUND-06 | 生成图片审核超时 | 返回部分成功结果 |
| TEST-BOUND-07 | 用户频繁提交违规请求 | 临时限制生成权限 |
| TEST-BOUND-08 | 安全约束配置为空 | 使用默认约束 |

---

## 测试数据工厂

### User Factory (扩展)

```typescript
// tests/support/factories/user-factory.ts
export const createHighRiskUser = () => createTestUser({
  riskLevel: 'high',
  moderationFailures: 5,
});

export const createLowRiskUser = () => createTestUser({
  riskLevel: 'low',
  moderationFailures: 0,
});

export const createAdminUser = () => createTestUser({
  role: 'admin',
});
```

### Generation Request Factory

```typescript
// tests/support/factories/generation-factory.ts
export const createGenerationRequest = (overrides: Partial<GenerationRequest> = {}): GenerationRequest => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  userId: faker.string.uuid(),
  prompt: '测试提示词',
  templateId: 1,
  status: 'pending',
  createdAt: new Date(),
  ...overrides,
});

export const createPendingReviewItem = () => createGenerationRequest({
  status: 'pending_review',
  riskLevel: 'high',
});
```

### Moderation Log Factory (扩展)

```typescript
// tests/support/factories/moderation-log-factory.ts
export const createModerationLog = (overrides: Partial<ModerationLog> = {}): ModerationLog => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  userId: faker.string.uuid(),
  contentType: 'prompt',
  moderationResult: {
    isApproved: true,
    confidence: 0.95,
    categories: {
      violence: 0.01,
      sexual: 0.01,
      hate: 0.01,
      harassment: 0.01,
      selfHarm: 0.01,
    },
    action: 'approved',
  },
  action: 'approved',
  generationId: null,
  riskLevel: 'low',
  requiresManualReview: false,
  createdAt: new Date(),
  ...overrides,
});
```

---

## Mock 要求

### Generation API Mock

```typescript
// tests/support/mocks/generation-mock.ts
export const mockGenerationAPI = {
  success: {
    imageUrl: 'https://example.com/generated-image.png',
    generationId: 123,
  },
  violent: {
    imageUrl: 'https://example.com/violent-image.png',
    generationId: 124,
  },
  timeout: () => new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 30000)
  ),
};
```

### Replicate Moderation Mock (扩展)

```typescript
// tests/support/mocks/replicate-mock.ts
export const mockReplicateModeration = {
  approved: {
    output: {
      status: 'approved',
      confidence: 0.95,
      categories: {
        violence: 0.01,
        sexual: 0.01,
        hate: 0.01,
        illegal: 0.01,
      }
    }
  },
  rejected: (reason: string) => ({
    output: {
      status: 'rejected',
      confidence: 0.89,
      categories: {
        violence: reason === 'violence' ? 0.95 : 0.01,
        sexual: reason === 'sexual' ? 0.95 : 0.01,
        hate: reason === 'hate' ? 0.95 : 0.01,
        illegal: reason === 'illegal' ? 0.95 : 0.01,
      }
    }
  }),
  uncertain: {
    output: {
      status: 'uncertain',
      confidence: 0.55,
      categories: {
        violence: 0.55,
        sexual: 0.01,
        hate: 0.01,
        illegal: 0.01,
      }
    }
  }
};
```

---

## Required data-testid 属性

### 生成页面

- `prompt-input` - 提示词输入框
- `generate-button` - 生成按钮
- `retry-button` - 重试按钮
- `generation-result` - 生成结果容器

### 审核状态

- `moderation-progress` - 审核进度显示
- `safety-badge` - 安全徽章
- `moderation-error` - 审核错误提示
- `moderation-error-dialog` - 审核错误对话框
- `moderation-error-details` - 审核错误详情
- `moderation-status` - 审核状态标记
- `moderation-history-item` - 审核历史项

### 管理员审核

- `review-queue-list` - 审核队列列表
- `pending-item` - 待审核项
- `approve-button` - 批准按钮
- `reject-button` - 拒绝按钮

---

## 实施清单

### Phase 1: 扩展内容审核服务

- [ ] 创建 generation-moderation.ts
- [ ] 实现 moderatePrompt 函数
- [ ] 实现 moderateGeneratedImage 函数
- [ ] 扩展 text-moderation.ts 添加生成特定逻辑
- [ ] 运行 TEST-PROMPT-01 到 TEST-PROMPT-05
- [ ] 运行 TEST-IMAGE-06 到 TEST-IMAGE-09

### Phase 2: 安全约束系统

- [ ] 创建 safety-constraints.ts 配置
- [ ] 实现 buildSafePrompt 函数
- [ ] 创建 prompt-builder.ts
- [ ] 运行 TEST-CONSTRAINT-10 到 TEST-CONSTRAINT-13

### Phase 3: 审核失败处理

- [ ] 修改生成 API 添加前置审核
- [ ] 实现审核失败重试机制
- [ ] 确保审核失败不扣除 credit
- [ ] 运行 TEST-FAIL-14 到 TEST-FAIL-17

### Phase 4: 审核状态 UI

- [ ] 创建 ModerationProgress 组件
- [ ] 创建 ModerationBadge 组件
- [ ] 创建 ModerationResult 组件
- [ ] 集成到生成流程 UI
- [ ] 创建审核历史查看界面
- [ ] 运行 TEST-UI-18 到 TEST-UI-21

### Phase 5: 高风险人工审核

- [ ] 创建 risk-assessment.ts
- [ ] 扩展 moderation_logs 表
- [ ] 创建 manual_review_queue 表
- [ ] 创建管理员审核队列界面
- [ ] 实现人工审核流程
- [ ] 运行 TEST-RISK-22 到 TEST-RISK-27

### Phase 6: 数据库迁移

- [ ] 扩展 moderation_logs 表添加字段
- [ ] 创建 manual_review_queue 表
- [ ] 运行 `npm run db:generate`
- [ ] 运行 `npm run db:migrate`

---

## 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- atdd-checklist-4-2

# 运行 E2E 测试 (headed 模式)
npm run test:e2e -- --headed

# 运行 API 测试
npm run test:api

# 运行测试并生成覆盖率
npm run test:coverage
```

---

## Red-Green-Refactor 工作流

### RED 阶段 (完成) ✅

**TEA Agent 职责:**

- ✅ 所有测试已编写并预期失败
- ✅ 测试数据工厂已创建
- ✅ Mock 要求已记录
- ✅ data-testid 要求已列出
- ✅ 实施清单已创建

---

### GREEN 阶段 (DEV Team - 下一步)

**DEV Agent 职责:**

1. 从实施清单中选择一个失败的测试（从最高优先级开始）
2. 阅读测试以理解预期行为
3. 实现最小代码使该特定测试通过
4. 运行测试验证它现在通过（绿色）
5. 在实施清单中勾选任务
6. 移至下一个测试并重复

---

### REFACTOR 阶段 (DEV Team - 所有测试通过后)

**DEV Agent 职责:**

1. 验证所有测试通过
2. 审查代码质量
3. 提取重复代码
4. 优化性能
5. 确保每次重构后测试仍然通过
6. 更新文档

---

## 知识库参考

此 ATDD 工作流参考了以下知识片段:

- **fixture-architecture.md** - 使用 Playwright test.extend() 的测试 fixture 模式
- **data-factories.md** - 使用 @faker-js/faker 的工厂模式
- **component-tdd.md** - 使用 Playwright Component Testing 的组件测试策略
- **network-first.md** - 路由拦截模式
- **test-quality.md** - 测试设计原则
- **test-levels-framework.md** - 测试级别选择框架

---

## 总结

### 测试统计

| 类别 | 数量 |
|------|-----|
| 提示词审核测试 | 5 |
| 图片审核测试 | 4 |
| 安全约束测试 | 4 |
| 审核失败处理测试 | 4 |
| 审核状态 UI 测试 | 4 |
| 高风险人工审核测试 | 6 |
| **总计** | **27** |

### 优先级分布

| 优先级 | 数量 |
|--------|------|
| P0 (必须实现) | 16 |
| P1 (应该实现) | 11 |

### 预计执行时间

- 单元测试: ~10 分钟
- API 测试: ~15 分钟
- E2E 测试: ~20 分钟
- **总计**: ~45 分钟

---

**Generated by BMad TEA Agent (Murat)** - 2026-02-15
