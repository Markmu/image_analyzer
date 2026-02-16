# ATDD 测试检查表 - Story 4-1: Content Moderation

**生成日期**: 2026-02-15
**Story ID**: 4-1
**Story 名称**: Content Moderation (内容审核)
**测试架构师**: TEA (Murat)

---

## 测试策略

### 测试级别选择

| 验收标准 | 测试级别 | 优先级 | 原因 |
|---------|---------|-------|------|
| AC-1: 用户版权确认 | E2E + API | P0 | 用户交互关键路径，合规要求 |
| AC-2: 服务条款同意 | E2E + API | P0 | 首次使用关键流程，合规要求 |
| AC-3: 图片内容审核 | API + E2E | P0 | 核心安全功能，关键路径 |
| AC-4: 文本内容审核 | API + E2E | P0 | 安全功能，关键路径 |
| AC-5: AI 透明度标注 | E2E + Component | P1 | UI 展示，合规要求 |
| AC-6: 数据保留策略 | API + Unit | P0 | 核心业务逻辑，数据安全 |
| AC-7: 账户删除数据清除 | API + E2E | P0 | 核心安全功能，隐私合规 |

---

## 失败的测试用例 (TDD Red Phase)

### 1. 版权确认测试

#### TEST-COPYRIGHT-01: 用户上传图片前必须确认版权

```typescript
test.skip('用户上传图片前必须确认版权', async ({ page }) => {
  await page.goto('/upload');

  // 不勾选版权确认
  const uploadButton = page.locator('[data-testid="upload-button"]');
  await expect(uploadButton).toBeDisabled();

  // 勾选版权确认
  await page.check('[data-testid="copyright-consent-checkbox"]');
  await expect(uploadButton).toBeEnabled();
});
```

#### TEST-COPYRIGHT-02: 未确认版权应返回错误

```typescript
test.skip('未确认版权应返回错误', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', testImagePath)
    .field('copyrightConfirmed', 'false');

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('COPYRIGHT_CONFIRMATION_REQUIRED');
});
```

---

### 2. 服务条款同意测试

#### TEST-TERMS-03: 首次使用应弹出服务条款

```typescript
test.skip('首次使用应弹出服务条款', async ({ page }) => {
  // 使用新用户登录
  await loginAsNewUser(page);

  await page.goto('/');

  // 验证服务条款弹窗显示
  const termsDialog = page.locator('[data-testid="terms-dialog"]');
  await expect(termsDialog).toBeVisible();
  await expect(termsDialog.locator('text=服务条款')).toBeVisible();
  await expect(termsDialog.locator('text=AI 使用说明')).toBeVisible();
});
```

#### TEST-TERMS-04: 必须同意条款才能继续

```typescript
test.skip('必须同意条款才能继续', async ({ page }) => {
  await loginAsNewUser(page);
  await page.goto('/');

  // 点击取消
  await page.click('[data-testid="terms-cancel-button"]');

  // 应该被重定向到登出或提示页面
  await expect(page).toHaveURL(/\/terms-required/);
});
```

#### TEST-TERMS-05: 同意条款后应记录时间

```typescript
test.skip('同意条款后应记录时间', async () => {
  const response = await request(app)
    .post('/api/user/agree-terms')
    .set('Authorization', `Bearer ${newUserToken}`)
    .send({ version: '1.0' });

  expect(response.status).toBe(200);
  expect(response.body.data.agreedAt).toBeDefined();

  // 验证数据库记录
  const user = await db.query.user.findFirst({
    where: eq(user.id, newUserId)
  });
  expect(user?.agreedToTermsAt).toBeDefined();
  expect(user?.termsVersion).toBe('1.0');
});
```

#### TEST-TERMS-06: 已同意用户不应再看到条款弹窗

```typescript
test.skip('已同意用户不应再看到条款弹窗', async ({ page }) => {
  // 使用已同意条款的用户登录
  await loginAsExistingUser(page);
  await page.goto('/');

  // 验证服务条款弹窗不显示
  const termsDialog = page.locator('[data-testid="terms-dialog"]');
  await expect(termsDialog).not.toBeVisible();
});
```

---

### 3. 图片内容审核测试

#### TEST-MOD-07: 正常图片应通过审核

```typescript
test.skip('正常图片应通过审核', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', normalImagePath)
    .field('copyrightConfirmed', 'true');

  expect(response.status).toBe(200);
  expect(response.body.data.moderation.status).toBe('approved');
  expect(response.body.data.moderation.confidence).toBeGreaterThan(0.8);
});
```

#### TEST-MOD-08: 暴力内容应被拒绝

```typescript
test.skip('暴力内容应被拒绝', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', violentImagePath)
    .field('copyrightConfirmed', 'true');

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('CONTENT_REJECTED');
  expect(response.body.error.details.reason).toBe('violence');
  expect(response.body.error.details.suggestion).toContain('暴力');
});
```

#### TEST-MOD-09: 敏感内容应被拒绝

```typescript
test.skip('敏感内容应被拒绝', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', sexualImagePath)
    .field('copyrightConfirmed', 'true');

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('CONTENT_REJECTED');
  expect(response.body.error.details.reason).toBe('sexual');
});
```

#### TEST-MOD-10: 仇恨符号应被拒绝

```typescript
test.skip('仇恨符号应被拒绝', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', hateSymbolImagePath)
    .field('copyrightConfirmed', 'true');

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('CONTENT_REJECTED');
  expect(response.body.error.details.reason).toBe('hate');
});
```

#### TEST-MOD-11: 审核日志应正确记录

```typescript
test.skip('审核日志应正确记录', async () => {
  // 上传一张图片
  await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', normalImagePath)
    .field('copyrightConfirmed', 'true');

  // 验证审核日志
  const logs = await db.query.moderationLogs.findMany({
    where: eq(moderationLogs.userId, testUserId)
  });

  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].contentType).toBe('image');
  expect(logs[0].action).toBe('approved');
});
```

#### TEST-MOD-12: 审核失败应显示友好提示

```typescript
test.skip('审核失败应显示友好提示', async ({ page }) => {
  await page.goto('/upload');

  // 模拟上传违规图片
  await page.check('[data-testid="copyright-consent-checkbox"]');
  await page.setInputFiles('[data-testid="file-input"]', violentImagePath);

  // 等待审核失败提示
  const errorMessage = page.locator('[data-testid="moderation-error"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage.locator('text=暴力内容')).toBeVisible();
  await expect(errorMessage.locator('text=内容政策')).toBeVisible();
});
```

---

### 4. 文本内容审核测试

#### TEST-TEXT-13: 正常提示词应通过审核

```typescript
test.skip('正常提示词应通过审核', async () => {
  const response = await request(app)
    .post('/api/moderation/check-text')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ text: '请分析这张图片的风格' });

  expect(response.status).toBe(200);
  expect(response.body.data.isApproved).toBe(true);
});
```

#### TEST-TEXT-14: 敏感提示词应被拒绝

```typescript
test.skip('敏感提示词应被拒绝', async () => {
  const response = await request(app)
    .post('/api/moderation/check-text')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ text: '生成暴力内容' });

  expect(response.status).toBe(200);
  expect(response.body.data.isApproved).toBe(false);
  expect(response.body.data.reason).toBeDefined();
  expect(response.body.data.suggestion).toBeDefined();
});
```

#### TEST-TEXT-15: 分析请求应先审核提示词

```typescript
test.skip('分析请求应先审核提示词', async () => {
  const response = await request(app)
    .post('/api/analysis')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      imageId: testImageId,
      customPrompt: '生成不当内容'
    });

  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('CONTENT_REJECTED');
});
```

---

### 5. AI 透明度标注测试

#### TEST-TRANS-16: 分析结果应显示 AI 标识

```typescript
test.skip('分析结果应显示 AI 标识', async ({ page }) => {
  await page.goto('/analysis');
  await page.click('[data-testid="analyze-button"]');

  await page.waitForSelector('[data-testid="analysis-result"]');

  // 验证 AI 标识显示
  const aiBadge = page.locator('[data-testid="ai-transparency-badge"]');
  await expect(aiBadge).toBeVisible();
  await expect(aiBadge.locator('text=AI 分析结果')).toBeVisible();
});
```

#### TEST-TRANS-17: AI 标识应显示悬停说明

```typescript
test.skip('AI 标识应显示悬停说明', async ({ page }) => {
  await page.goto('/analysis');
  await page.waitForSelector('[data-testid="analysis-result"]');

  // 悬停在 AI 标识上
  const aiBadge = page.locator('[data-testid="ai-transparency-badge"]');
  await aiBadge.hover();

  // 验证提示显示
  const tooltip = page.locator('[role="tooltip"]');
  await expect(tooltip).toBeVisible();
  await expect(tooltip.locator('text=AI 模型')).toBeVisible();
});
```

---

### 6. 数据保留策略测试

#### TEST-RETAIN-18: Free 用户图片 30 天后过期

```typescript
test.skip('Free 用户图片 30 天后过期', async () => {
  const freeUser = await createFreeUser();
  const image = await createImage({
    userId: freeUser.id,
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) // 31 天前
  });

  const expirationDate = getExpirationDate('free');
  const daysDiff = Math.floor((expirationDate.getTime() - image.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  expect(daysDiff).toBe(30);
});
```

#### TEST-RETAIN-19: Lite 用户图片 60 天后过期

```typescript
test.skip('Lite 用户图片 60 天后过期', async () => {
  const expirationDate = getExpirationDate('lite');
  const now = new Date();
  const daysDiff = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  expect(daysDiff).toBe(60);
});
```

#### TEST-RETAIN-20: Standard 用户图片 90 天后过期

```typescript
test.skip('Standard 用户图片 90 天后过期', async () => {
  const expirationDate = getExpirationDate('standard');
  const now = new Date();
  const daysDiff = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  expect(daysDiff).toBe(90);
});
```

#### TEST-RETAIN-21: 清理任务应删除过期图片

```typescript
test.skip('清理任务应删除过期图片', async () => {
  // 创建过期图片
  const expiredImage = await createImage({
    userId: testUserId,
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 昨天
  });

  // 运行清理任务
  const response = await request(app)
    .delete('/api/cron/cleanup-expired-data')
    .set('X-Cron-Key', process.env.CRON_SECRET);

  expect(response.status).toBe(200);
  expect(response.body.data.deletedImages).toBeGreaterThan(0);

  // 验证图片已被删除
  const deletedImage = await db.query.images.findFirst({
    where: eq(images.id, expiredImage.id)
  });
  expect(deletedImage).toBeUndefined();
});
```

#### TEST-RETAIN-22: 删除前应发送邮件通知

```typescript
test.skip('删除前应发送邮件通知', async () => {
  // 创建即将过期的图片
  await createImage({
    userId: testUserId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 天后
  });

  // 运行通知任务
  const response = await request(app)
    .post('/api/cron/send-deletion-notices')
    .set('X-Cron-Key', process.env.CRON_SECRET);

  expect(response.status).toBe(200);
  expect(response.body.data.notifiedUsers).toBeGreaterThan(0);

  // 验证邮件已发送
  const emailSent = await checkEmailSent(testUserEmail, '数据即将删除');
  expect(emailSent).toBe(true);
});
```

---

### 7. 账户删除数据清除测试

#### TEST-DELETE-23: 删除账户应清除所有图片

```typescript
test.skip('删除账户应清除所有图片', async () => {
  // 创建用户和图片
  const user = await createTestUser();
  const image1 = await createImage({ userId: user.id });
  const image2 = await createImage({ userId: user.id });

  // 删除账户
  const response = await request(app)
    .delete('/api/user/delete-account')
    .set('Authorization', `Bearer ${user.token}`);

  expect(response.status).toBe(200);

  // 验证图片已被删除
  const remainingImages = await db.query.images.findMany({
    where: eq(images.userId, user.id)
  });
  expect(remainingImages.length).toBe(0);
});
```

#### TEST-DELETE-24: 删除账户应清除 R2 存储

```typescript
test.skip('删除账户应清除 R2 存储', async () => {
  const user = await createTestUser();
  const image = await createImage({ userId: user.id, r2Key: 'test-key' });

  // Mock R2 删除
  mockR2Delete.onCall('test-key').resolve(true);

  // 删除账户
  await request(app)
    .delete('/api/user/delete-account')
    .set('Authorization', `Bearer ${user.token}`);

  // 验证 R2 删除被调用
  expect(mockR2Delete).toHaveBeenCalledWith('test-key');
});
```

#### TEST-DELETE-25: 删除账户应清除审核日志

```typescript
test.skip('删除账户应清除审核日志', async () => {
  const user = await createTestUser();
  await createModerationLog({ userId: user.id });

  // 删除账户
  await request(app)
    .delete('/api/user/delete-account')
    .set('Authorization', `Bearer ${user.token}`);

  // 验证审核日志已被删除
  const logs = await db.query.moderationLogs.findMany({
    where: eq(moderationLogs.userId, user.id)
  });
  expect(logs.length).toBe(0);
});
```

#### TEST-DELETE-26: 删除前应显示确认信息

```typescript
test.skip('删除前应显示确认信息', async ({ page }) => {
  await page.goto('/settings/account');
  await page.click('[data-testid="delete-account-button"]');

  // 验证确认对话框
  const confirmDialog = page.locator('[data-testid="delete-confirm-dialog"]');
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog.locator('text=将要删除的数据')).toBeVisible();
});
```

---

## 边界条件测试

| 测试 ID | 边界条件 | 预期行为 |
|--------|---------|---------|
| TEST-BOUND-01 | 审核服务不可用 | 返回友好错误，稍后重试 |
| TEST-BOUND-02 | 审核置信度在临界值 | 进行人工复审或拒绝 |
| TEST-BOUND-03 | 图片太大无法审核 | 先压缩后审核 |
| TEST-BOUND-04 | 文本包含 Unicode 特殊字符 | 正确处理不报错 |
| TEST-BOUND-05 | 用户订阅等级变更 | 图片过期时间相应调整 |
| TEST-BOUND-06 | 批量上传包含违规图片 | 只拒绝违规的，其他正常处理 |
| TEST-BOUND-07 | 同时删除大量数据 | 使用事务保证一致性 |
| TEST-BOUND-08 | 邮件发送失败 | 记录日志，不阻塞删除流程 |

---

## 测试数据工厂

### User Factory

```typescript
// tests/support/factories/user-factory.ts
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  subscriptionTier: 'free',
  agreedToTermsAt: new Date(),
  termsVersion: '1.0',
  createdAt: new Date(),
  ...overrides,
});

export const createFreeUser = () => createTestUser({ subscriptionTier: 'free' });
export const createLiteUser = () => createTestUser({ subscriptionTier: 'lite' });
export const createStandardUser = () => createTestUser({ subscriptionTier: 'standard' });
export const createNewUser = () => createTestUser({ agreedToTermsAt: undefined });
```

### Image Factory

```typescript
// tests/support/factories/image-factory.ts
export const createTestImage = (overrides: Partial<Image> = {}): Image => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  userId: faker.string.uuid(),
  url: faker.image.url(),
  r2Key: `images/${faker.string.uuid()}.jpg`,
  filename: faker.system.fileName(),
  mimeType: 'image/jpeg',
  size: faker.number.int({ min: 1000, max: 10000000 }),
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ...overrides,
});

export const createExpiredImage = () => createTestImage({
  expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
});
```

### Moderation Log Factory

```typescript
// tests/support/factories/moderation-log-factory.ts
export const createModerationLog = (overrides: Partial<ModerationLog> = {}): ModerationLog => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  userId: faker.string.uuid(),
  imageId: faker.number.int({ min: 1, max: 10000 }),
  contentType: 'image',
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
  createdAt: new Date(),
  ...overrides,
});
```

---

## Mock 要求

### Replicate Moderation API Mock

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
      }
    }
  })
};
```

### Email Service Mock

```typescript
// tests/support/mocks/email-mock.ts
export const mockEmailService = {
  sentEmails: [] as any[],

  async sendDeletionNotice(userEmail: string, images: Image[]) {
    this.sentEmails.push({
      to: userEmail,
      subject: '数据即将删除',
      template: 'deletion-notice',
      data: { images },
      sentAt: new Date(),
    });
  },

  clear() {
    this.sentEmails = [];
  }
};
```

---

## Required data-testid 属性

### 上传页面

- `copyright-consent-checkbox` - 版权确认复选框
- `upload-button` - 上传按钮
- `file-input` - 文件输入框
- `moderation-error` - 审核错误提示

### 服务条款弹窗

- `terms-dialog` - 服务条款弹窗
- `terms-content` - 条款内容区域
- `terms-agree-button` - 同意按钮
- `terms-cancel-button` - 取消按钮

### 分析结果

- `ai-transparency-badge` - AI 透明度标识
- `analysis-result` - 分析结果容器
- `model-used` - 使用的模型名称

### 账户删除

- `delete-account-button` - 删除账户按钮
- `delete-confirm-dialog` - 删除确认对话框
- `data-to-delete-list` - 将删除的数据列表

---

## 实施清单

### Phase 1: 用户授权与免责声明

- [ ] 创建 CopyrightConsent 组件
- [ ] 创建 TermsDialog 组件
- [ ] 实现 POST /api/user/agree-terms
- [ ] 实现 GET /api/user/terms-status
- [ ] 添加 terms-middleware
- [ ] 扩展 user 表添加 agreedToTermsAt 字段
- [ ] 运行 TEST-COPYRIGHT-01 到 TEST-COPYRIGHT-02
- [ ] 运行 TEST-TERMS-03 到 TEST-TERMS-06

### Phase 2: 图片内容审核

- [ ] 集成 Replicate Moderation API
- [ ] 创建 moderateImage 函数
- [ ] 扩展 POST /api/upload 添加审核逻辑
- [ ] 创建 moderation_logs 表
- [ ] 创建 ModerationError 组件
- [ ] 扩展 images 表添加 expiresAt 字段
- [ ] 运行 TEST-MOD-07 到 TEST-MOD-12

### Phase 3: 文本内容审核

- [ ] 创建 moderateText 函数
- [ ] 实现 POST /api/moderation/check-text
- [ ] 扩展 POST /api/analysis 添加提示词审核
- [ ] 运行 TEST-TEXT-13 到 TEST-TEXT-15

### Phase 4: AI 透明度标注

- [ ] 创建 AITransparencyBadge 组件
- [ ] 集成到分析结果显示
- [ ] 运行 TEST-TRANS-16 到 TEST-TRANS-17

### Phase 5: 数据保留策略

- [ ] 创建 retention.ts 配置文件
- [ ] 实现自动过期逻辑
- [ ] 实现 DELETE /api/cron/cleanup-expired-data
- [ ] 实现删除前邮件通知
- [ ] 运行 TEST-RETAIN-18 到 TEST-RETAIN-22

### Phase 6: 账户删除数据清除

- [ ] 扩展 delete-account API 添加图片删除
- [ ] 实现 R2 批量删除逻辑
- [ ] 创建删除确认 UI
- [ ] 运行 TEST-DELETE-23 到 TEST-DELETE-26

### Phase 7: 数据库迁移

- [ ] 创建 moderation_logs 表
- [ ] 扩展 images 表添加 expiresAt, deletionNotifiedAt
- [ ] 扩展 user 表添加 agreedToTermsAt, termsVersion
- [ ] 运行 `npm run db:generate`
- [ ] 运行 `npm run db:migrate`

---

## 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- atdd-checklist-4-1

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

**验证:**

- 所有测试按预期失败
- 失败消息清晰可操作
- 测试因缺少实现而失败，而非测试错误

---

### GREEN 阶段 (DEV Team - 下一步)

**DEV Agent 职责:**

1. 从实施清单中选择一个失败的测试（从最高优先级开始）
2. 阅读测试以理解预期行为
3. 实现最小代码使该特定测试通过
4. 运行测试验证它现在通过（绿色）
5. 在实施清单中勾选任务
6. 移至下一个测试并重复

**关键原则:**

- 一次一个测试（不要试图一次修复所有）
- 最小实现（不要过度工程）
- 频繁运行测试（立即反馈）
- 使用实施清单作为路线图

---

### REFACTOR 阶段 (DEV Team - 所有测试通过后)

**DEV Agent 职责:**

1. 验证所有测试通过（绿色阶段完成）
2. 审查代码质量（可读性、可维护性、性能）
3. 提取重复代码（DRY 原则）
4. 优化性能（如果需要）
5. 确保每次重构后测试仍然通过
6. 更新文档（如果 API 约定变更）

**完成标准:**

- 所有测试通过
- 代码质量符合团队标准
- 没有重复或代码异味
- 准备好进行代码审查和 story 批准

---

## 下一步

1. 与 dev 工作流共享此检查表和失败测试（手动交接）
2. 在站会或计划中与团队审查此检查表
3. 运行失败测试确认 RED 阶段: `npm run test`
4. 使用实施清单作为指南开始实现
5. 一次处理一个测试（每个的红 -> 绿）
6. 在每日站会中分享进度
7. 当所有测试通过时，重构代码以提高质量
8. 重构完成后，手动在 sprint-status.yaml 中更新 story 状态为 'done'

---

## 知识库参考

此 ATDD 工作流参考了以下知识片段:

- **fixture-architecture.md** - 使用 Playwright test.extend() 的测试 fixture 模式
- **data-factories.md** - 使用 @faker-js/faker 的工厂模式
- **component-tdd.md** - 使用 Playwright Component Testing 的组件测试策略
- **network-first.md** - 路由拦截模式（在导航前拦截以防止竞态条件）
- **test-quality.md** - 测试设计原则（Given-When-Then，每个测试一个断言，确定性，隔离）
- **test-levels-framework.md** - 测试级别选择框架

---

## 总结

### 测试统计

| 类别 | 数量 |
|------|-----|
| 版权确认测试 | 2 |
| 服务条款测试 | 4 |
| 图片审核测试 | 6 |
| 文本审核测试 | 3 |
| AI 透明度测试 | 2 |
| 数据保留测试 | 5 |
| 账户删除测试 | 4 |
| **总计** | **26** |

### 优先级分布

| 优先级 | 数量 |
|--------|------|
| P0 (必须实现) | 18 |
| P1 (应该实现) | 8 |

### 预计执行时间

- 单元测试: ~10 分钟
- API 测试: ~15 分钟
- E2E 测试: ~20 分钟
- **总计**: ~45 分钟

---

**Generated by BMad TEA Agent (Murat)** - 2026-02-15
