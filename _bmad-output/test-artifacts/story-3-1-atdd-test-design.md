# Story 3-1: ATDD 测试设计文档

## 概述

**Story**: 3-1-style-analysis (风格分析功能)
**测试架构师**: Murat (TEA)
**设计日期**: 2026-02-12
**测试范围**: 9 个验收标准 (AC-1 至 AC-9)

## 测试策略

### 测试金字塔

```
        /\
       /  \    E2E 测试 (15%)
      /____\   - 关键用户流程
     /      \  - 跨组件交互
    /        \
   /__________\ 单元测试 (50%)
   |          | - 纯函数逻辑
   |          | - 数据解析
   |          | - 工具函数
  |____________|
  |____________| API 集成测试 (35%)
               - 端点测试
               - 数据库交互
               - 外部 API Mock
```

### 测试分层

| 层级 | 工具 | 覆盖范围 | 数量 |
|------|------|---------|------|
| E2E | Playwright | 关键用户流程 | 12 个测试 |
| API | Vitest + Supertest | API 端点 + DB | 18 个测试 |
| Unit | Vitest | 纯函数逻辑 | 25 个测试 |

---

## 1. E2E 测试设计

### 测试文件结构

```
tests/e2e/
├── story-3-1-style-analysis.spec.ts  (新建)
```

### 1.1 AC-1: Replicate Vision API 调用

#### TEST-3-1-01: 成功调用 Vision API 进行分析
**优先级**: P0 (Critical)
**标签**: @smoke @critical @api @replicate

**Given**:
- 用户已登录
- 用户有足够的 credit (≥ 1)
- 图片已上传完成

**When**:
- 用户点击"开始分析"按钮

**Then**:
- 分析状态应变为 "analyzing"
- 进度条显示"正在分析光影特征..."
- API 调用成功，返回 200 状态码
- 60 秒内完成分析

**Mock 策略**:
```typescript
// Mock Replicate API 响应
await page.route('**/api/replicate/v1/predictions', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 'mock-prediction-id',
      status: 'succeeded',
      output: mockAnalysisOutput
    })
  });
});
```

---

#### TEST-3-1-02: API 调用超时处理
**优先级**: P1 (High)
**标签**: @error-handling @timeout @api

**Given**:
- 用户已发起分析请求

**When**:
- Replicate API 超过 60 秒未响应

**Then**:
- 显示"分析超时，请重试"错误消息
- 自动重试最多 3 次
- 3 次重试后仍失败，显示"暂时无法分析，请稍后再试"
- 不扣除用户 credit

---

#### TEST-3-1-03: API 错误重试机制
**优先级**: P1 (High)
**标签**: @retry @error-handling @api

**测试场景**:
| 场景 | 预期行为 | 重试次数 |
|------|---------|---------|
| Rate Limiting (429) | 等待 2^n 秒后重试 | 最多 3 次 |
| Network Error | 指数退避重试 | 最多 3 次 |
| Model Not Found (404) | 不重试，显示"模型暂时不可用" | 0 次 |
| Invalid Input (400) | 不重试，显示"图片格式不支持" | 0 次 |

---

### 1.2 AC-2: 四维度特征提取

#### TEST-3-1-04: 光影维度特征提取
**优先级**: P1 (High)
**标签**: @dimensions @lighting @feature-extraction

**Given**:
- 分析完成

**When**:
- 用户查看分析结果

**Then**:
- 光影维度卡片显示以下特征：
  - 主光源方向 (如: "侧光", "顶光")
  - 光影对比度 (如: "高对比度")
  - 阴影特征 (如: "柔和阴影")
- 每个特征有置信度分数 (0-1)
- 维度整体置信度显示

**验证数据**:
```json
{
  "dimensions": {
    "lighting": {
      "name": "光影",
      "features": [
        {"name": "主光源方向", "value": "侧光", "confidence": 0.85},
        {"name": "光影对比度", "value": "高对比度", "confidence": 0.9},
        {"name": "阴影特征", "value": "柔和阴影", "confidence": 0.8}
      ],
      "confidence": 0.85
    }
  }
}
```

---

#### TEST-3-1-05: 构图维度特征提取
**优先级**: P1 (High)
**标签**: @dimensions @composition @feature-extraction

**验证字段**:
- 视角 (平视, 俯视, 仰视)
- 画面平衡 (对称, 黄金分割)
- 景深 (浅景深, 深景深)

---

#### TEST-3-1-06: 色彩维度特征提取
**优先级**: P1 (High)
**标签**: @dimensions @color @feature-extraction

**验证字段**:
- 主色调 (暖色调, 冷色调, 中性色)
- 色彩对比度 (高对比, 中等对比, 低对比)
- 色温 (暖色, 冷色)

---

#### TEST-3-1-07: 艺术风格维度特征提取
**优先级**: P1 (High)
**标签**: @dimensions @artistic @feature-extraction

**验证字段**:
- 风格流派 (印象派, 现实主义, 抽象派)
- 艺术时期 (现代, 古典)
- 情感基调 (愉悦, 忧郁, 平静)

---

#### TEST-3-1-08: 四维度完整性验证
**优先级**: P0 (Critical)
**标签**: @smoke @dimensions @completeness

**验证条件**:
- 所有 4 个维度都存在
- 每个维度至少有 3 个特征
- 每个特征都有置信度
- 置信度在 0-1 范围内

---

### 1.3 AC-3: 结构化数据存储

#### TEST-3-1-09: 分析结果 JSON 存储
**优先级**: P1 (High)
**标签**: @database @json @storage

**Given**:
- 分析完成

**When**:
- 检查数据库 `analysis_results` 表

**Then**:
```sql
SELECT * FROM analysis_results WHERE image_id = <test_image_id>;

-- 验证字段：
-- id: NOT NULL
-- user_id: 匹配当前用户
-- image_id: 匹配上传图片
-- analysis_data: JSONB 类型，包含完整结构
-- confidence_score: REAL 类型，0-1 之间
-- feedback: NULL (用户尚未反馈)
-- created_at: 当前时间戳
```

---

#### TEST-3-1-10: JSON 数据结构验证
**优先级**: P1 (High)
**标签**: @json @validation @schema

**验证 JSON Schema**:
```typescript
interface AnalysisData {
  dimensions: {
    lighting: StyleDimension;
    composition: StyleDimension;
    color: StyleDimension;
    artisticStyle: StyleDimension;
  };
  overallConfidence: number;  // 0-1
  modelUsed: string;          // 模型名称
  analysisDuration: number;    // 秒
}

interface StyleDimension {
  name: string;
  features: StyleFeature[];
  confidence: number;  // 0-1
}

interface StyleFeature {
  name: string;
  value: string;
  confidence: number;  // 0-1
}
```

---

### 1.4 AC-4: 实时进度显示

#### TEST-3-1-11: 分析进度显示
**优先级**: P0 (Critical)
**标签**: @smoke @progress @ui

**Given**:
- 用户发起分析请求

**When**:
- 分析进行中

**Then**:
- 显示进度条组件 (复用 Story 2-4 的 ProgressDisplay)
- 显示专业术语：
  - "正在分析光影特征..."
  - "正在识别构图方法..."
  - "正在提取色彩信息..."
  - "正在识别艺术风格..."
- 显示预计剩余时间
- 每个阶段持续 5-15 秒

**测试步骤**:
```typescript
// 1. 点击分析按钮
await page.getByTestId('analyze-button').click();

// 2. 验证进度组件可见
const progressComponent = page.getByTestId('progress-display');
await expect(progressComponent).toBeVisible();

// 3. 验证专业术语显示
const currentStep = page.getByTestId('current-step-text');
await expect(currentStep).toContainText(/正在分析/);

// 4. 验证预计时间显示
const estimatedTime = page.getByTestId('estimated-time');
await expect(estimatedTime).toContainText(/预计还需/);
```

---

#### TEST-3-1-12: 取消分析功能
**优先级**: P2 (Medium)
**标签**: @cancel @progress @ui

**Given**:
- 分析正在进行

**When**:
- 用户点击"取消分析"按钮

**Then**:
- 显示确认对话框
- 确认后，停止分析
- 不扣除用户 credit
- 返回到上传页面

---

### 1.5 AC-5: 低置信度处理

#### TEST-3-1-13: 低置信度警告显示
**优先级**: P1 (High)
**标签**: @confidence @warning @ui

**测试矩阵**:

| 整体置信度 | 预期行为 | 徽章颜色 |
|-----------|---------|---------|
| ≥ 0.8 | 高置信度，显示"分析准确度高" | 绿色 |
| 0.6 - 0.8 | 中等置信度，显示黄色徽章 | 黄色 |
| < 0.6 | 低置信度，显示警告 + "重新分析"按钮 | 红色 |

**测试代码**:
```typescript
test('低置信度警告', async ({ page }) => {
  // Mock 低置信度响应
  mockLowConfidenceResponse();

  // 完成分析
  await completeAnalysis();

  // 验证警告显示
  const warningBadge = page.getByTestId('confidence-warning');
  await expect(warningBadge).toBeVisible();
  await expect(warningBadge).toContainText('置信度较低');

  // 验证重新分析按钮
  const reanalyzeBtn = page.getByTestId('reanalyze-button');
  await expect(reanalyzeBtn).toBeVisible();
});
```

---

#### TEST-3-1-14: 低置信度维度标注
**优先级**: P2 (Medium)
**标签**: @confidence @dimensions @ui

**Given**:
- 整体置信度 ≥ 0.6
- 某个维度置信度 < 0.6

**Then**:
- 该维度卡片显示警告图标
- 标注"此维度分析可能不准确"

---

### 1.6 AC-6: 用户反馈收集

#### TEST-3-1-15: 用户反馈提交
**优先级**: P1 (High)
**标签**: @feedback @ui @api

**Given**:
- 分析结果显示

**When**:
- 用户点击"准确"或"不准确"按钮

**Then**:
- 显示"感谢您的反馈！"
- 发送 POST 请求到 `/api/analysis/[id]/feedback`
- 数据库更新 `analysis_results.feedback` 字段

**测试代码**:
```typescript
test('提交准确反馈', async ({ page }) => {
  await page.goto('/analysis/results/123');

  // 点击"准确"按钮
  const accurateBtn = page.getByTestId('feedback-accurate');
  await accurateBtn.click();

  // 验证成功消息
  const thankYouMsg = page.getByTestId('feedback-thank-you');
  await expect(thankYouMsg).toBeVisible();

  // 验证 API 调用
  const feedbackCall = await waitForAPIResponse('/api/analysis/123/feedback');
  expect(feedbackCall.postData).toEqual({ feedback: 'accurate' });
});
```

---

#### TEST-3-1-16: 反馈数据存储验证
**优先级**: P2 (Medium)
**标签**: @feedback @database @api

**数据库验证**:
```sql
-- 提交反馈后验证
SELECT feedback FROM analysis_results WHERE id = <analysis_id>;

-- 预期结果：
-- feedback = 'accurate' 或 'inaccurate'
```

---

### 1.7 AC-7: 移动端优化 + AI 透明度

#### TEST-3-1-17: 移动端简化显示
**优先级**: P1 (High)
**标签**: @mobile @responsive @ui

**视口**: 375x667 (iPhone SE)

**简化策略**:
- 单列布局
- 只显示主要风格标签
- 隐藏详细置信度分数
- 显示"在桌面端查看详细分析"链接

**测试代码**:
```typescript
test.use({ viewport: { width: 375, height: 667 } });

test('移动端简化显示', async ({ page }) => {
  await page.goto('/analysis/results/123');

  // 验证单列布局
  const grid = page.getByTestId('dimensions-grid');
  const columns = await grid.getAttribute('data-columns');
  expect(columns).toBe('1');

  // 验证主要标签显示
  const mainTags = page.getByTestId('main-style-tags');
  await expect(mainTags).toBeVisible();

  // 验证详细查看引导
  const desktopLink = page.getByTestId('view-desktop-link');
  await expect(desktopLink).toContainText('桌面端查看详细分析');
});
```

---

#### TEST-3-1-18: AI 透明度标注
**优先级**: P0 (Critical)
**标签**: @smoke @ai-transparency @ui @compliance

**验证要求**:
- 分析结果页面顶部显示"AI 分析结果"徽章
- 使用红色/橙色视觉标识
- 徽章固定在页面顶部
- 移动端也必须显示

**测试代码**:
```typescript
test('AI 透明度标注', async ({ page }) => {
  await page.goto('/analysis/results/123');

  // 验证 AI 徽章存在
  const aiBadge = page.getByTestId('ai-result-badge');
  await expect(aiBadge).toBeVisible();
  await expect(aiBadge).toContainText('AI 分析结果');

  // 验证视觉样式（红色）
  const badgeColor = await aiBadge.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return styles.backgroundColor;
  });
  expect(badgeColor).toContain('rgb(255'); // 红色系

  // 验证位置（页面顶部）
  const position = await aiBadge.evaluate(el => {
    return el.closest('[data-testid="analysis-header"]') !== null;
  });
  expect(position).toBe(true);
});
```

---

### 1.8 AC-8: 内容安全检查

#### TEST-3-1-19: 不当内容拒绝分析
**优先级**: P0 (Critical)
**标签**: @smoke @safety @moderation @compliance

**测试场景**:
- 使用包含不当内容的测试图片
- 触发内容安全检查

**预期行为**:
1. 分析前检查图片内容
2. 检测到不当内容时，显示错误："此图片包含不当内容，无法分析"
3. 不调用 Replicate API
4. 不扣除用户 credit
5. 记录审核日志

**测试代码**:
```typescript
test('不当内容拒绝', async ({ page }) => {
  // Mock 内容安全检查响应
  await page.route('**/api/analysis', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INAPPROPRIATE_CONTENT',
          message: '此图片包含不当内容，无法分析'
        }
      })
    });
  });

  // 尝试分析
  await page.getByTestId('analyze-button').click();

  // 验证错误显示
  const errorMsg = page.getByTestId('analysis-error');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText('不当内容');
});
```

---

#### TEST-3-1-20: 审核日志记录
**优先级**: P2 (Medium)
**标签**: @safety @logging @database

**验证日志记录**:
```sql
-- 检查审核日志表（假设有 moderation_logs 表）
SELECT * FROM moderation_logs
WHERE user_id = <test_user_id>
  AND action = 'analysis_rejected'
  AND reason = 'inappropriate_content'
  AND created_at >= NOW() - INTERVAL '1 hour';
```

---

### 1.9 AC-9: Credit 系统集成

#### TEST-3-1-21: Credit 余额充足
**优先级**: P0 (Critical)
**标签**: @smoke @credit @payment @api

**Given**:
- 用户 credit 余额 = 5

**When**:
- 用户发起分析

**Then**:
- 检查余额通过
- 扣除 1 credit
- 余额变为 4
- 记录交易历史

**测试代码**:
```typescript
test('Credit 扣除', async ({ page }) => {
  // 初始余额 = 5
  const initialBalance = await getUserCreditBalance();
  expect(initialBalance).toBe(5);

  // 发起分析
  await page.getByTestId('analyze-button').click();

  // 等待分析完成
  await page.getByTestId('analysis-result').waitFor();

  // 验证余额
  const finalBalance = await getUserCreditBalance();
  expect(finalBalance).toBe(4);

  // 验证交易记录
  const transaction = await getLatestCreditTransaction();
  expect(transaction.amount).toBe(-1);
  expect(transaction.description).toBe('图片风格分析');
});
```

---

#### TEST-3-1-22: Credit 余额不足
**优先级**: P1 (High)
**标签**: @credit @payment @error-handling

**Given**:
- 用户 credit 余额 = 0

**When**:
- 用户尝试发起分析

**Then**:
- 显示"Credit 不足，请升级订阅"错误
- 不调用分析 API
- 显示升级按钮链接到订阅页面

**测试代码**:
```typescript
test('Credit 不足提示', async ({ page, context }) => {
  // 设置 credit = 0
  await setUserCreditBalance(0);

  // 刷新页面
  await page.reload();

  // 尝试分析
  await page.getByTestId('analyze-button').click();

  // 验证错误消息
  const errorMsg = page.getByTestId('credit-insufficient-error');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText('Credit 不足');

  // 验证升级按钮
  const upgradeBtn = page.getByTestId('upgrade-button');
  await expect(upgradeBtn).toBeVisible();
  await upgradeBtn.click();

  // 验证跳转到订阅页面
  await expect(page).toHaveURL(/\/pricing|\/upgrade/);
});
```

---

#### TEST-3-1-23: Credit 交易历史记录
**优先级**: P2 (Medium)
**标签**: @credit @database @logging

**数据库验证**:
```sql
SELECT * FROM credit_transactions
WHERE user_id = <test_user_id>
  AND amount = -1
  AND description = '图片风格分析'
  AND created_at >= NOW() - INTERVAL '1 hour';

-- 验证字段：
-- id: NOT NULL
-- user_id: 匹配用户
-- amount: -1 (扣除)
-- balance_after: 扣除后的余额
-- description: '图片风格分析'
-- created_at: 交易时间
```

---

## 2. API 集成测试设计

### 测试文件结构

```
tests/api/
├── analysis/
│   ├── post-analysis.spec.ts          (新建)
│   ├── get-analysis-status.spec.ts     (扩展现有)
│   └── post-analysis-feedback.spec.ts (新建)
```

### 2.1 POST /api/analysis 测试

#### TEST-API-01: 成功创建分析请求
```typescript
describe('POST /api/analysis', () => {
  test('应该成功创建分析请求', async ({ request }) => {
    const response = await request.post('/api/analysis', {
      data: { imageId: 123 }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      data: {
        analysisId: expect.any(Number),
        status: 'pending'
      }
    });
  });
});
```

---

#### TEST-API-02: Credit 不足拒绝
```typescript
test('应该拒绝 credit 不足的用户', async ({ request, db }) => {
  // 设置用户 credit = 0
  await db.updateUserCredit(userId, 0);

  const response = await request.post('/api/analysis', {
    data: { imageId: 123 }
  });

  expect(response.status()).toBe(402); // Payment Required

  const body = await response.json();
  expect(body).toMatchObject({
    success: false,
    error: {
      code: 'INSUFFICIENT_CREDITS',
      message: 'Credit 不足，请升级订阅'
    }
  });
});
```

---

#### TEST-API-03: 不当内容拒绝
```typescript
test('应该拒绝不当内容', async ({ request }) => {
  // Mock 内容安全检查
  mockSafetyCheckReturnsInappropriate();

  const response = await request.post('/api/analysis', {
    data: { imageId: 999 } // 不当内容图片 ID
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.error.code).toBe('INAPPROPRIATE_CONTENT');
});
```

---

### 2.2 GET /api/analysis/[id]/status 测试

#### TEST-API-04: 获取分析状态（进行中）
```typescript
test('应该返回分析状态', async ({ request }) => {
  const response = await request.get('/api/analysis/123/status');

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toMatchObject({
    success: true,
    data: {
      status: 'analyzing', // 或 'pending'
      progress: expect.any(Number), // 0-100
      currentStep: expect.any(String) // "正在分析光影特征..."
    }
  });
});
```

---

#### TEST-API-05: 获取分析结果（完成）
```typescript
test('分析完成后返回结果', async ({ request }) => {
  const response = await request.get('/api/analysis/456/status');

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.data.status).toBe('completed');
  expect(body.data.progress).toBe(100);
  expect(body.data.result).toBeDefined();
  expect(body.data.result.dimensions).toBeDefined();
});
```

---

### 2.3 POST /api/analysis/[id]/feedback 测试

#### TEST-API-06: 提交准确反馈
```typescript
test('应该接受准确反馈', async ({ request, db }) => {
  const response = await request.post('/api/analysis/789/feedback', {
    data: { feedback: 'accurate' }
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toMatchObject({
    success: true,
    data: {
      message: '感谢您的反馈！'
    }
  });

  // 验证数据库
  const result = await db.getAnalysisResult(789);
  expect(result.feedback).toBe('accurate');
});
```

---

#### TEST-API-07: 提交不准确反馈
```typescript
test('应该接受不准确反馈', async ({ request, db }) => {
  const response = await request.post('/api/analysis/789/feedback', {
    data: { feedback: 'inaccurate' }
  });

  expect(response.status()).toBe(200);

  const result = await db.getAnalysisResult(789);
  expect(result.feedback).toBe('inaccurate');
});
```

---

## 3. 单元测试设计

### 测试文件结构

```
src/lib/__tests__/
├── replicate/
│   └── vision.spec.ts                   (扩展)
├── analysis/
│   ├── parser.spec.ts                   (新建)
│   └── validator.spec.ts               (新建)
src/types/__tests__/
└── analysis.spec.ts                     (新建)
```

### 3.1 Replicate Vision 客户端测试

#### TEST-UNIT-01: 解析成功的 API 响应
```typescript
describe('parseAnalysisResponse', () => {
  test('应该解析有效的 JSON 响应', () => {
    const mockResponse = JSON.stringify({
      dimensions: {
        lighting: { features: [], confidence: 0.85 }
      },
      overallConfidence: 0.86
    });

    const result = parseAnalysisResponse(mockResponse);

    expect(result).toMatchObject({
      dimensions: {
        lighting: expect.objectContaining({
          confidence: 0.85
        })
      },
      overallConfidence: 0.86
    });
  });
});
```

---

#### TEST-UNIT-02: 处理无效的 JSON 响应
```typescript
test('应该拒绝无效的 JSON', () => {
  const invalidResponse = 'This is not JSON';

  expect(() => {
    parseAnalysisResponse(invalidResponse);
  }).toThrow('Invalid JSON format');
});
```

---

#### TEST-UNIT-03: 验证必需字段
```typescript
test('应该验证必需字段存在', () => {
  const incompleteResponse = JSON.stringify({
    dimensions: {
      lighting: { features: [] }
      // 缺少 overallConfidence
    }
  });

  expect(() => {
    parseAnalysisResponse(incompleteResponse);
  }).toThrow('Missing required field: overallConfidence');
});
```

---

#### TEST-UNIT-04: 验证置信度范围
```typescript
test('应该验证置信度在 0-1 范围内', () => {
  const invalidConfidence = JSON.stringify({
    dimensions: { lighting: { features: [], confidence: 1.5 } },
    overallConfidence: 0.86
  });

  expect(() => {
    parseAnalysisResponse(invalidConfidence);
  }).toThrow('Confidence must be between 0 and 1');
});
```

---

### 3.2 分析结果解析器测试

#### TEST-UNIT-05: 提取特征标签
```typescript
describe('extractFeatures', () => {
  test('应该正确提取特征标签', () => {
    const mockDimension = {
      name: '光影',
      features: [
        { name: '主光源方向', value: '侧光', confidence: 0.85 },
        { name: '光影对比度', value: '高对比度', confidence: 0.9 }
      ],
      confidence: 0.875
    };

    const features = extractFeatures(mockDimension);

    expect(features).toHaveLength(2);
    expect(features[0]).toMatchObject({
      name: '主光源方向',
      value: '侧光',
      confidence: 0.85
    });
  });
});
```

---

#### TEST-UNIT-06: 计算维度平均置信度
```typescript
test('应该计算维度的平均置信度', () => {
  const features = [
    { confidence: 0.85 },
    { confidence: 0.9 },
    { confidence: 0.8 }
  ];

  const avgConfidence = calculateAverageConfidence(features);

  expect(avgConfidence).toBeCloseTo(0.85, 2);
});
```

---

### 3.3 Zod Schema 验证测试

#### TEST-UNIT-07: 验证完整的 AnalysisData
```typescript
describe('AnalysisData Schema', () => {
  test('应该验证有效的 AnalysisData', () => {
    const validData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [{ name: 'test', value: 'value', confidence: 0.8 }],
          confidence: 0.8
        },
        composition: {
          name: '构图',
          features: [],
          confidence: 0.7
        },
        color: {
          name: '色彩',
          features: [],
          confidence: 0.75
        },
        artisticStyle: {
          name: '艺术风格',
          features: [],
          confidence: 0.7
        }
      },
      overallConfidence: 0.76,
      modelUsed: 'llava-13b',
      analysisDuration: 45
    };

    const result = AnalysisDataSchema.parse(validData);

    expect(result).toEqual(validData);
  });
});
```

---

#### TEST-UNIT-08: 拒绝缺少维度的数据
```typescript
test('应该拒绝缺少维度的数据', () => {
  const incompleteData = {
    dimensions: {
      lighting: { name: '光影', features: [], confidence: 0.8 },
      // 缺少 composition, color, artisticStyle
    },
    overallConfidence: 0.8,
    modelUsed: 'llava-13b',
    analysisDuration: 30
  };

  expect(() => {
    AnalysisDataSchema.parse(incompleteData);
  }).toThrow();
});
```

---

## 4. 测试数据设计

### 4.1 Mock 分析响应数据

**文件位置**: `tests/fixtures/mock-analysis-responses.ts`

```typescript
export const mockAnalysisResponses = {
  // 高置信度完整响应
  highConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '侧光', confidence: 0.85 },
          { name: '光影对比度', value: '高对比度', confidence: 0.9 },
          { name: '阴影特征', value: '柔和阴影', confidence: 0.8 }
        ],
        confidence: 0.85
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '平视', confidence: 0.92 },
          { name: '画面平衡', value: '黄金分割构图', confidence: 0.88 },
          { name: '景深', value: '浅景深', confidence: 0.85 }
        ],
        confidence: 0.88
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '暖色调', confidence: 0.95 },
          { name: '色彩对比度', value: '中等对比', confidence: 0.82 },
          { name: '色温', value: '暖色', confidence: 0.88 }
        ],
        confidence: 0.88
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '印象派', confidence: 0.78 },
          { name: '艺术时期', value: '现代', confidence: 0.85 },
          { name: '情感基调', value: '愉悦', confidence: 0.8 }
        ],
        confidence: 0.81
      }
    },
    overallConfidence: 0.86,
    modelUsed: 'llava-13b',
    analysisDuration: 45
  },

  // 低置信度响应
  lowConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '不确定', confidence: 0.5 }
        ],
        confidence: 0.5
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '平视', confidence: 0.7 }
        ],
        confidence: 0.7
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '混合色调', confidence: 0.55 }
        ],
        confidence: 0.55
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '不确定', confidence: 0.45 }
        ],
        confidence: 0.45
      }
    },
    overallConfidence: 0.55,
    modelUsed: 'llava-13b',
    analysisDuration: 42
  },

  // 单个低置信度维度
  lowConfidenceDimension: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '侧光', confidence: 0.85 }
        ],
        confidence: 0.85
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '不确定', confidence: 0.4 }
        ],
        confidence: 0.4
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '暖色调', confidence: 0.9 }
        ],
        confidence: 0.9
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '印象派', confidence: 0.88 }
        ],
        confidence: 0.88
      }
    },
    overallConfidence: 0.76,
    modelUsed: 'llava-13b',
    analysisDuration: 44
  }
};
```

---

### 4.2 测试图片

**文件位置**: `tests/fixtures/images/analysis/`

| 文件名 | 用途 | 描述 |
|-------|------|------|
| `portrait-lighting.jpg` | 测试光影维度 | 清晰的光影对比 |
| `landscape-composition.jpg` | 测试构图维度 | 经典黄金分割构图 |
| `colorful-palette.jpg` | 测试色彩维度 | 丰富的色彩层次 |
| `impressionist-art.jpg` | 测试艺术风格 | 印象派风格作品 |
| `low-quality.jpg` | 测试低置信度 | 模糊、低对比度 |
| `inappropriate.jpg` | 测试内容安全 | 不当内容（需特殊处理） |

---

### 4.3 测试用户数据

```typescript
export const testUsers = {
  premiumUser: {
    id: 'test-premium-user',
    email: 'premium@test.com',
    creditBalance: 100,
    subscriptionTier: 'premium'
  },

  freeUser: {
    id: 'test-free-user',
    email: 'free@test.com',
    creditBalance: 5,
    subscriptionTier: 'free'
  },

  noCreditUser: {
    id: 'test-no-credit-user',
    email: 'nocredit@test.com',
    creditBalance: 0,
    subscriptionTier: 'free'
  }
};
```

---

## 5. Mock 策略

### 5.1 Replicate API Mock

**文件位置**: `tests/mocks/replicate-api.ts`

```typescript
import { HttpResponse, http } from 'msw';

export const mockReplicateAPI = [
  // 成功响应
  http.post('https://api.replicate.com/v1/predictions', async ({ request }) => {
    const body = await request.json();

    // 返回模拟预测结果
    return HttpResponse.json({
      id: 'mock-prediction-id',
      status: 'succeeded',
      output: JSON.stringify(mockAnalysisResponses.highConfidence),
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  }),

  // 超时场景
  http.post('https://api.replicate.com/v1/predictions', async ({ request }) => {
    // 模拟 65 秒延迟（超过 60 秒超时）
    await new Promise(resolve => setTimeout(resolve, 65000));
    return HttpResponse.json({ status: 'processing' });
  }),

  // Rate Limiting
  http.post('https://api.replicate.com/v1/predictions', () => {
    return HttpResponse.json(
      { detail: 'Rate limit exceeded' },
      { status: 429 }
    );
  }),

  // Model Not Found
  http.post('https://api.replicate.com/v1/predictions', () => {
    return HttpResponse.json(
      { detail: 'Model not found' },
      { status: 404 }
    );
  })
];
```

---

### 5.2 内容安全检查 Mock

```typescript
export const mockSafetyCheck = [
  // 通过检查
  http.post('**/api/analysis/safety-check', () => {
    return HttpResponse.json({
      safe: true,
      confidence: 0.95
    });
  }),

  // 检测到不当内容
  http.post('**/api/analysis/safety-check', () => {
    return HttpResponse.json({
      safe: false,
      reason: 'inappropriate_content_detected',
      confidence: 0.92
    });
  })
];
```

---

## 6. 性能测试

### 6.1 响应时间测试

| 指标 | 目标值 | 测试方法 |
|------|-------|---------|
| API 响应时间 (POST /api/analysis) | < 500ms | Playwright 测量 |
| 分析完成时间 | P95 < 60s | 监控 100 次分析 |
| 进度更新延迟 | < 2s | 轮询间隔 |
| 页面加载时间 (结果页) | < 1s | Lighthouse |

---

### 6.2 并发测试

```typescript
test.describe('并发分析', () => {
  test('应该支持 5 个并发分析', async ({ request }) => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      request.post('/api/analysis', {
        data: { imageId: 100 + i }
      })
    );

    const responses = await Promise.all(promises);

    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});
```

---

## 7. 测试覆盖率目标

| 层级 | 目标覆盖率 |
|------|----------|
| Statements | 85% |
| Branches | 80% |
| Functions | 85% |
| Lines | 85% |

---

## 8. 测试执行顺序

### Phase 1: 单元测试 (优先运行)
```bash
npm run test:unit
```

### Phase 2: API 集成测试
```bash
npm run test:api
```

### Phase 3: E2E 测试 (最后运行)
```bash
npm run test:e2e -- project=story-3-1
```

---

## 9. 测试环境配置

### 9.1 环境变量

**文件**: `.env.test`

```bash
# 测试数据库
DATABASE_URL=postgresql://test:test@localhost:5432/image_analyzer_test

# 测试用 Replicate Token (mock)
REPLICATE_API_TOKEN=test_mock_token
REPLICATE_VISION_MODEL_ID=test-model-id

# 测试用户凭证
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test_password_123

# API 基础 URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

---

### 9.2 数据库清理脚本

**文件**: `scripts/cleanup-test-db.ts`

```typescript
import { db } from '../src/lib/db';

export async function cleanupTestDatabase() {
  // 清理测试数据
  await db.delete(analysisResults);
  await db.delete(images);
  await db.delete(creditTransactions);

  console.log('测试数据库已清理');
}
```

---

## 10. CI/CD 集成

### 10.1 GitHub Actions 工作流

**文件**: `.github/workflows/test-story-3-1.yml`

```yaml
name: Test Story 3-1

on:
  pull_request:
    paths:
      - 'src/features/analysis/**'
      - 'src/lib/replicate/vision.ts'
      - 'src/app/api/analysis/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      - name: Run API tests
        run: npm run test:api
      - name: Run E2E tests
        run: npm run test:e2e -- project=story-3-1
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 11. 测试验收清单

在 Story 3-1 开发完成后，使用此清单验证：

### AC-1: Replicate Vision API 调用
- [ ] TEST-3-1-01: 成功调用 Vision API
- [ ] TEST-3-1-02: API 调用超时处理
- [ ] TEST-3-1-03: API 错误重试机制

### AC-2: 四维度特征提取
- [ ] TEST-3-1-04: 光影维度
- [ ] TEST-3-1-05: 构图维度
- [ ] TEST-3-1-06: 色彩维度
- [ ] TEST-3-1-07: 艺术风格维度
- [ ] TEST-3-1-08: 四维度完整性

### AC-3: 结构化数据存储
- [ ] TEST-3-1-09: JSON 存储
- [ ] TEST-3-1-10: JSON 结构验证

### AC-4: 实时进度显示
- [ ] TEST-3-1-11: 进度显示
- [ ] TEST-3-1-12: 取消分析

### AC-5: 低置信度处理
- [ ] TEST-3-1-13: 低置信度警告
- [ ] TEST-3-1-14: 低置信度维度标注

### AC-6: 用户反馈收集
- [ ] TEST-3-1-15: 反馈提交
- [ ] TEST-3-1-16: 反馈数据存储

### AC-7: 移动端优化 + AI 透明度
- [ ] TEST-3-1-17: 移动端简化
- [ ] TEST-3-1-18: AI 透明度标注

### AC-8: 内容安全检查
- [ ] TEST-3-1-19: 不当内容拒绝
- [ ] TEST-3-1-20: 审核日志记录

### AC-9: Credit 系统集成
- [ ] TEST-3-1-21: Credit 扣除
- [ ] TEST-3-1-22: Credit 不足
- [ ] TEST-3-1-23: 交易历史记录

---

## 12. 风险和注意事项

### 12.1 测试风险

| 风险 | 缓解措施 |
|------|---------|
| Replicate API 成本 | 使用 Mock 进行大部分测试 |
| 测试数据不一致 | 使用固定的测试数据集 |
| 测试环境不稳定 | 使用 Docker 容器化测试环境 |
| 测试执行时间长 | 并行执行测试 |

---

### 12.2 测试维护

- 每月审查测试覆盖率报告
- 定期更新 Mock 数据以匹配真实 API
- 监控测试执行时间，优化慢速测试
- 保持测试数据与生产数据结构同步

---

## 附录

### A. 测试 ID 命名规范

- `TEST-3-1-XX`: E2E 测试
- `TEST-API-XX`: API 集成测试
- `TEST-UNIT-XX`: 单元测试

### B. 优先级定义

- **P0 (Critical)**: 核心功能，必须通过
- **P1 (High)**: 重要功能，应该通过
- **P2 (Medium)**: 次要功能，可以延后

### C. 标签定义

| 标签 | 用途 |
|------|------|
| @smoke | 冒烟测试，快速验证核心功能 |
| @critical | 关键路径测试 |
| @api | API 测试 |
| @ui | UI 交互测试 |
| @mobile | 移动端测试 |
| @error-handling | 错误处理测试 |
| @performance | 性能测试 |
| @compliance | 合规性测试 |

---

**文档版本**: 1.0
**最后更新**: 2026-02-12
**状态**: Ready for Review
