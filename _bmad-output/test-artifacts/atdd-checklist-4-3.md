# ATDD 测试检查表 - Story 4-3: Privacy Compliance

**生成日期**: 2026-02-15
**Story ID**: 4-3
**Story 名称**: Privacy Compliance (隐私合规)
**测试架构师**: TEA (Murat)

---

## 测试策略

### 测试级别选择

| 验收标准 | 测试级别 | 优先级 | 原因 |
|---------|---------|-------|------|
| AC-1: 数据收集使用报告 | E2E + API | P0 | 关键合规功能 |
| AC-2: 数据导出 | API + E2E | P0 | 关键合规功能 |
| AC-3: 数据共享管理 | API + E2E | P0 | 关键隐私功能 |
| AC-4: GDPR 删除权 | API + E2E | P0 | 法律合规要求 |
| AC-5: CCPA 数据保留 | E2E + API | P1 | 法律合规要求 |

---

## 失败的测试用例 (TDD Red Phase)

### 1. 数据收集使用报告测试 (AC-1)

#### TEST-PRIVACY-01: 用户应能看到数据收集清单

```typescript
test.skip('用户应能看到数据收集清单', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 验证数据收集清单显示
  const dataCollection = page.locator('[data-testid="data-collection-list"]');
  await expect(dataCollection).toBeVisible();

  // 验证包含各类数据
  await expect(dataCollection.locator('text=图片数据')).toBeVisible();
  await expect(dataCollection.locator('text=分析结果')).toBeVisible();
  await expect(dataCollection.locator('text=账户信息')).toBeVisible();
});
```

#### TEST-PRIVACY-02: 数据使用说明应清晰展示

```typescript
test.skip('数据使用说明应清晰展示', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 验证数据使用目的说明
  const usageSection = page.locator('[data-testid="data-usage-section"]');
  await expect(usageSection).toBeVisible();
  await expect(usageSection.locator('text=服务提供')).toBeVisible();
  await expect(usageSection.locator('text=服务改进')).toBeVisible();
});
```

---

### 2. 数据导出功能测试 (AC-2)

#### TEST-EXPORT-03: 用户应能一键导出所有数据

```typescript
test.skip('用户应能一键导出所有数据', async ({ page }) => {
  await page.goto('/settings/privacy');
  await page.click('[data-testid="export-data-button"]');

  // 验证导出请求成功
  const successMessage = page.locator('[data-testid="export-success-message"]');
  await expect(successMessage).toBeVisible();
  await expect(successMessage.locator('text=导出请求已提交')).toBeVisible();
});
```

#### TEST-EXPORT-04: 导出的 JSON 应包含所有数据类型

```typescript
test.skip('导出的 JSON 应包含所有数据类型', async () => {
  const response = await request(app)
    .get('/api/user/export-data')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  expect(response.body.data.downloadUrl).toBeDefined();

  // 下载并验证 JSON 内容
  const exportData = await downloadExportFile(response.body.data.downloadUrl);
  expect(exportData.profile).toBeDefined();
  expect(exportData.images).toBeDefined();
  expect(exportData.analyses).toBeDefined();
  expect(exportData.templates).toBeDefined();
  expect(exportData.exportedAt).toBeDefined();
});
```

#### TEST-EXPORT-05: 导出链接应有有效期

```typescript
test.skip('导出链接应有有效期', async () => {
  const response = await request(app)
    .get('/api/user/export-data')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  expect(response.body.data.expiresAt).toBeDefined();

  // 验证有效期为 24 小时
  const expiresAt = new Date(response.body.data.expiresAt);
  const now = new Date();
  const hoursDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  expect(hoursDiff).toBeGreaterThanOrEqual(23);
  expect(hoursDiff).toBeLessThanOrEqual(25);
});
```

#### TEST-EXPORT-06: 空数据用户应能正常导出

```typescript
test.skip('空数据用户应能正常导出', async () => {
  // 使用新用户（无数据）
  const newUser = await createNewUser();

  const response = await request(app)
    .get('/api/user/export-data')
    .set('Authorization', `Bearer ${newUser.token}`);

  expect(response.status).toBe(200);
  expect(response.body.data.downloadUrl).toBeDefined();
});
```

#### TEST-EXPORT-07: 大数据导出应显示预计大小

```typescript
test.skip('大数据导出应显示预计大小', async () => {
  // 创建大量图片数据
  await createManyImages(testUserId, 100);

  const response = await request(app)
    .get('/api/user/export-data')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  expect(response.body.data.estimatedSize).toBeDefined();
  expect(response.body.data.estimatedSize).toMatch(/\d+MB/);
});
```

---

### 3. 数据共享管理测试 (AC-3)

#### TEST-SHARING-08: 用户应能控制服务改进数据分享

```typescript
test.skip('用户应能控制服务改进数据分享', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 关闭服务改进分享
  const toggle = page.locator('[data-testid="share-for-improvement-toggle"]');
  await toggle.click();

  // 验证设置已保存
  const successMessage = page.locator('[data-testid="settings-saved-message"]');
  await expect(successMessage).toBeVisible();

  // 验证设置已更新
  const response = await request(app)
    .get('/api/user/privacy-settings')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.body.data.shareForImprovement).toBe(false);
});
```

#### TEST-SHARING-09: 隐私设置应实时生效

```typescript
test.skip('隐私设置应实时生效', async () => {
  // 修改隐私设置
  await request(app)
    .patch('/api/user/privacy-settings')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ shareForImprovement: false });

  // 验证设置立即生效（无需重新登录）
  const response = await request(app)
    .get('/api/user/privacy-settings')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.body.data.shareForImprovement).toBe(false);
});
```

#### TEST-SHARING-10: 用户应能设置营销邮件偏好

```typescript
test.skip('用户应能设置营销邮件偏好', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 关闭营销邮件
  const toggle = page.locator('[data-testid="marketing-emails-toggle"]');
  await toggle.click();

  const response = await request(app)
    .get('/api/user/privacy-settings')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.body.data.marketingEmails).toBe(false);
});
```

---

### 4. GDPR 删除权测试 (AC-4)

#### TEST-DELETE-11: 账户删除应清除所有数据

```typescript
test.skip('账户删除应清除所有数据', async () => {
  // 创建用户和各类数据
  const user = await createTestUser();
  await createImages(user.id, 5);
  await createAnalyses(user.id, 10);
  await createTemplates(user.id, 3);
  await createModerationLogs(user.id, 8);

  // 删除账户
  const response = await request(app)
    .delete('/api/user/delete-account')
    .set('Authorization', `Bearer ${user.token}`);

  expect(response.status).toBe(200);

  // 验证所有数据已删除
  const images = await db.query.images.findMany({ where: eq(images.userId, user.id) });
  const analyses = await db.query.analysisResults.findMany({ where: eq(analysisResults.userId, user.id) });
  const templates = await db.query.templates.findMany({ where: eq(templates.userId, user.id) });
  const logs = await db.query.moderationLogs.findMany({ where: eq(moderationLogs.userId, user.id) });

  expect(images.length).toBe(0);
  expect(analyses.length).toBe(0);
  expect(templates.length).toBe(0);
  expect(logs.length).toBe(0);
});
```

#### TEST-DELETE-12: 删除流程应显示数据清单

```typescript
test.skip('删除流程应显示数据清单', async ({ page }) => {
  await page.goto('/settings/account');

  // 点击删除账户按钮
  await page.click('[data-testid="delete-account-button"]');

  // 验证显示将要删除的数据列表
  const dataList = page.locator('[data-testid="data-to-delete-list"]');
  await expect(dataList).toBeVisible();
  await expect(dataList.locator('text=图片')).toBeVisible();
  await expect(dataList.locator('text=分析结果')).toBeVisible();
});
```

#### TEST-DELETE-13: 删除前应提供最后下载选项

```typescript
test.skip('删除前应提供最后下载选项', async ({ page }) => {
  await page.goto('/settings/account');
  await page.click('[data-testid="delete-account-button"]');

  // 验证提供数据导出选项
  const exportOption = page.locator('[data-testid="export-before-delete-option"]');
  await expect(exportOption).toBeVisible();
});
```

#### TEST-DELETE-14: 删除后应发送确认邮件

```typescript
test.skip('删除后应发送确认邮件', async () => {
  const user = await createTestUser();

  await request(app)
    .delete('/api/user/delete-account')
    .set('Authorization', `Bearer ${user.token}`);

  // 验证确认邮件已发送
  const email = await findEmailSentTo(user.email);
  expect(email).toBeDefined();
  expect(email.subject).toContain('账户已删除');
  expect(email.body).toContain('数据已清除');
});
```

#### TEST-DELETE-15: 删除应清除 R2 存储文件

```typescript
test.skip('删除应清除 R2 存储文件', async () => {
  const user = await createTestUser();
  const images = await createImages(user.id, 3);

  // Mock R2 删除
  images.forEach(img => mockR2Delete.onCall(img.r2Key).resolve(true));

  await request(app)
    .delete('/api/user/delete-account')
    .set('Authorization', `Bearer ${user.token}`);

  // 验证 R2 删除被调用
  images.forEach(img => {
    expect(mockR2Delete).toHaveBeenCalledWith(img.r2Key);
  });
});
```

---

### 5. CCPA 数据保留测试 (AC-5)

#### TEST-CCPA-16: 应提供 Do Not Sell 选项

```typescript
test.skip('应提供 Do Not Sell 选项', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 验证 Do Not Sell 选项显示
  const doNotSellToggle = page.locator('[data-testid="do-not-sell-toggle"]');
  await expect(doNotSellToggle).toBeVisible();
});
```

#### TEST-CCPA-17: 用户设置 Do Not Sell 应生效

```typescript
test.skip('用户设置 Do Not Sell 应生效', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 开启 Do Not Sell
  const toggle = page.locator('[data-testid="do-not-sell-toggle"]');
  await toggle.click();

  const response = await request(app)
    .get('/api/user/privacy-settings')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.body.data.doNotSell).toBe(true);
});
```

#### TEST-CCPA-18: 应显示隐私政策链接

```typescript
test.skip('应显示隐私政策链接', async ({ page }) => {
  await page.goto('/settings/privacy');

  // 验证隐私政策链接
  const privacyPolicyLink = page.locator('[data-testid="privacy-policy-link"]');
  await expect(privacyPolicyLink).toBeVisible();

  // 验证链接可点击
  await privacyPolicyLink.click();
  await expect(page).toHaveURL(/\/privacy-policy/);
});
```

#### TEST-CCPA-19: Cookie 同意横幅应显示

```typescript
test.skip('Cookie 同意横幅应显示', async ({ page }) => {
  await page.goto('/');

  // 验证 Cookie 同意横幅显示
  const cookieBanner = page.locator('[data-testid="cookie-consent-banner"]');
  await expect(cookieBanner).toBeVisible();
  await expect(cookieBanner.locator('text=Cookie')).toBeVisible();
});
```

#### TEST-CCPA-20: 用户应能接受 Cookie 政策

```typescript
test.skip('用户应能接受 Cookie 政策', async ({ page }) => {
  await page.goto('/');

  // 点击接受
  await page.click('[data-testid="accept-cookies-button"]');

  // 验证横幅已关闭
  const cookieBanner = page.locator('[data-testid="cookie-consent-banner"]');
  await expect(cookieBanner).not.toBeVisible();

  // 验证设置已保存
  const response = await request(app)
    .get('/api/user/privacy-settings')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.body.data.cookieConsent).toBe(true);
});
```

---

## 边界条件测试

| 测试 ID | 边界条件 | 预期行为 |
|--------|---------|---------|
| TEST-BOUND-01 | 导出服务不可用 | 返回友好错误，稍后重试 |
| TEST-BOUND-02 | 导出文件过大 (>100MB) | 分批导出，显示进度 |
| TEST-BOUND-03 | 删除正在进行中时用户重新登录 | 拒绝访问，完成删除 |
| TEST-BOUND-04 | 并发删除请求 | 第一个成功，后续返回已删除 |
| TEST-BOUND-05 | 隐私设置更新冲突 | 最后写入胜出 |
| TEST-BOUND-06 | 导出链接被盗用 | 验证用户身份后才能下载 |
| TEST-BOUND-07 | Cookie 设置存储失败 | 使用默认设置，显示警告 |
| TEST-BOUND-08 | 敏感数据导出权限不足 | 返回 403 错误 |

---

## 测试数据工厂

### User Factory (扩展)

```typescript
// tests/support/factories/user-factory.ts
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  privacySettings: {
    shareForImprovement: true,
    marketingEmails: true,
    doNotSell: false,
    cookieConsent: false,
  },
  createdAt: new Date(),
  ...overrides,
});
```

### Privacy Settings Factory

```typescript
// tests/support/factories/privacy-settings-factory.ts
export const createPrivacySettings = (overrides: Partial<PrivacySettings> = {}): PrivacySettings => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  userId: faker.string.uuid(),
  shareForImprovement: true,
  marketingEmails: true,
  doNotSell: false,
  updatedAt: new Date(),
  ...overrides,
});
```

### Export Data Factory

```typescript
// tests/support/factories/export-factory.ts
export const createExportData = (overrides: Partial<ExportData> = {}): ExportData => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  userId: faker.string.uuid(),
  downloadUrl: faker.internet.url(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  estimatedSize: '10MB',
  status: 'ready',
  createdAt: new Date(),
  ...overrides,
});
```

---

## Mock 要求

### Storage Service Mock

```typescript
// tests/support/mocks/storage-mock.ts
export const mockR2Delete = {
  deletedKeys: [] as string[],

  async delete(key: string) {
    this.deletedKeys.push(key);
    return { success: true };
  },

  onCall(key: string) {
    return {
      resolve: (result: any) => { /* mock resolve */ },
      reject: (error: Error) => { /* mock reject */ },
    };
  },

  clear() {
    this.deletedKeys = [];
  },
};
```

### Email Service Mock

```typescript
// tests/support/mocks/email-mock.ts
export const mockEmailService = {
  sentEmails: [] as Email[],

  async sendDeletionConfirmation(email: string) {
    this.sentEmails.push({
      to: email,
      subject: '账户已删除',
      body: '您的数据已完全清除',
      sentAt: new Date(),
    });
  },

  findByRecipient(email: string) {
    return this.sentEmails.find(e => e.to === email);
  },

  clear() {
    this.sentEmails = [];
  },
};
```

---

## Required data-testid 属性

### 隐私设置页面

- `data-collection-list` - 数据收集清单
- `data-usage-section` - 数据使用说明
- `share-for-improvement-toggle` - 服务改进分享开关
- `marketing-emails-toggle` - 营销邮件开关
- `do-not-sell-toggle` - Do Not Sell 开关
- `privacy-policy-link` - 隐私政策链接
- `settings-saved-message` - 设置保存成功消息

### 数据导出

- `export-data-button` - 导出数据按钮
- `export-success-message` - 导出成功消息
- `export-progress` - 导出进度显示
- `export-error-message` - 导出错误消息

### 账户删除

- `delete-account-button` - 删除账户按钮
- `data-to-delete-list` - 将删除的数据列表
- `export-before-delete-option` - 删除前导出选项
- `delete-confirm-button` - 确认删除按钮
- `delete-progress` - 删除进度显示

### Cookie 同意

- `cookie-consent-banner` - Cookie 同意横幅
- `accept-cookies-button` - 接受 Cookie 按钮
- `reject-cookies-button` - 拒绝 Cookie 按钮

---

## 实施清单

### Phase 1: 隐私设置页面

- [ ] 创建隐私设置页面
- [ ] 实现数据收集清单展示
- [ ] 实现数据使用说明展示
- [ ] 运行 TEST-PRIVACY-01 到 TEST-PRIVACY-02

### Phase 2: 数据导出功能

- [ ] 创建 data-export.ts 服务
- [ ] 实现 GET /api/user/export-data
- [ ] 实现文件下载功能
- [ ] 创建导出进度 UI
- [ ] 运行 TEST-EXPORT-03 到 TEST-EXPORT-07

### Phase 3: 数据共享管理

- [ ] 实现 PATCH /api/user/privacy-settings
- [ ] 实现 GET /api/user/privacy-settings
- [ ] 创建隐私设置保存逻辑
- [ ] 运行 TEST-SHARING-08 到 TEST-SHARING-10

### Phase 4: GDPR 删除权

- [ ] 扩展 delete-account API 清除所有数据
- [ ] 实现删除确认流程
- [ ] 添加删除后确认邮件
- [ ] 实现 R2 存储清理
- [ ] 运行 TEST-DELETE-11 到 TEST-DELETE-15

### Phase 5: CCPA 合规

- [ ] 实现 Do Not Sell 功能
- [ ] 创建隐私政策页面
- [ ] 创建 Cookie 同意横幅
- [ ] 运行 TEST-CCPA-16 到 TEST-CCPA-20

### Phase 6: 数据库

- [ ] 创建 privacy_settings 表
- [ ] 扩展 user 表添加隐私字段
- [ ] 运行 `npm run db:generate`
- [ ] 运行 `npm run db:migrate`

---

## 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- atdd-checklist-4-3

# 运行 E2E 测试 (headed 模式)
npm run test:e2e -- --headed

# 运行 API 测试
npm run test:api
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

1. 从实施清单中选择一个失败的测试
2. 阅读测试以理解预期行为
3. 实现最小代码使该特定测试通过
4. 运行测试验证它现在通过
5. 在实施清单中勾选任务
6. 移至下一个测试并重复

---

## 知识库参考

此 ATDD 工作流参考了以下知识片段:

- **fixture-architecture.md** - 测试 fixture 模式
- **data-factories.md** - 工厂函数模式
- **component-tdd.md** - 组件测试策略
- **network-first.md** - 路由拦截模式
- **test-quality.md** - 测试设计原则
- **test-levels-framework.md** - 测试级别选择框架

---

## 总结

### 测试统计

| 类别 | 数量 |
|------|-----|
| 数据收集使用报告测试 | 2 |
| 数据导出功能测试 | 5 |
| 数据共享管理测试 | 3 |
| GDPR 删除权测试 | 5 |
| CCPA 合规测试 | 5 |
| **总计** | **20** |

### 优先级分布

| 优先级 | 数量 |
|--------|------|
| P0 (必须实现) | 14 |
| P1 (应该实现) | 6 |

### 预计执行时间

- 单元测试: ~8 分钟
- API 测试: ~12 分钟
- E2E 测试: ~15 分钟
- **总计**: ~35 分钟

---

**Generated by BMad TEA Agent (Murat)** - 2026-02-15
