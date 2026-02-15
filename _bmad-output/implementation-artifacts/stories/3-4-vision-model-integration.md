# Story 3.4: vision-model-integration

Status: completed

---

## 📋 Story

作为一名 **AI 创作者或普通用户**,
我希望 **能够选择不同的视觉模型来分析图片**,
以便 **根据不同的分析需求选择最适合的模型，获得更准确或更有针对性的分析结果**。

---

## ✅ Acceptance Criteria

1. **[AC-1]** 系统可以支持多个视觉模型提供商
   - 支持至少 3 个视觉模型（如 lucataco/qwen3-vl-8b-instruct:39e893666996acf464cff75688ad49ac95ef54e9f1c688fbc677330acc478e11, moonshotai/kimi-k2.5, google/gemini-3-flash）
   - 每个模型有不同的特点（准确性、速度、价格）
   - 可以通过环境变量配置启用的模型列表

2. **[AC-2]** 用户可以手动选择使用的视觉模型
   - 在分析设置中选择模型
   - 记住用户偏好的模型选择
   - 显示每个模型的特点和适用场景

3. **[AC-3]** 系统可以为不同订阅等级配置模型访问权限
   - Free 用户：仅默认模型
   - Lite 用户：可选择所有模型
   - Standard 用户：可选择所有模型
   - 显示模型锁定提示（如需要升级）

4. **[AC-4]** 系统可以动态切换模型进行风格分析
   - 不修改核心分析逻辑
   - 通过模型 ID 动态选择
   - 保持 API 响应格式一致

5. **[AC-5]** 🔴 **管理员可以配置启用/禁用不同的模型**（PRD FR68）
   - 管理员界面配置模型开关
   - 禁用模型不可见/不可选
   - 支持模型配置持久化

6. **[AC-6]** 系统可以跟踪不同模型的使用统计
   - 记录每个模型的使用次数
   - 记录模型分析成功率
   - 用于后续优化和推荐

7. **[AC-7]** 系统可以优雅地处理模型不可用的情况
   - 模型 API 失败时自动切换备用模型
   - 显示模型切换提示
   - 记录切换日志

---

## 📦 Tasks / Subtasks

### **Task 1: 创建视觉模型配置系统** (AC: 1, 5) ⏱️ 2小时

- [ ] Subtask 1.1: 定义视觉模型配置结构
  - 位置: `src/lib/analysis/models.ts`（新建）
  - 接口: `VisionModel`, `ModelConfig`
  - 字段: id, name, description,特点、cost、speed、default, enabled
- [ ] Subtask 1.2: 创建模型注册表
  - 实现模型注册表（类似插件系统）
  - 支持动态添加/移除模型
  - 提供模型查询接口
- [ ] Subtask 1.3: 实现管理员配置接口
  - POST `/api/admin/models` - 配置模型启用状态
  - GET `/api/admin/models` - 获取模型配置列表
  - 管理员权限检查

### **Task 2: 扩展 Replicate 客户端支持多模型** (AC: 1, 4) ⏱️ 2小时

- [ ] Subtask 2.1: 扩展现有 `src/lib/replicate/vision.ts`
  - ⚡ **不要创建新文件**，在现有文件中添加新函数
  - 添加函数: `analyzeImageWithModel(imageUrl: string, modelId: string)`
  - 保持原有 `analyzeImageStyle()` 函数作为默认模型调用
- [ ] Subtask 2.2: 实现模型动态选择
  - 根据 modelId 动态构建模型标识符
  - 支持不同模型的 Prompt 适配
  - 统一返回格式
- [ ] Subtask 2.3: 实现模型降级策略
  - 主模型失败时自动切换备用模型
  - 配置降级顺序
  - 记录降级日志

### **Task 3: 创建模型选择 UI** (AC: 2, 3) ⏱️ 2小时

- [ ] Subtask 3.1: 创建模型选择器组件
  - 位置: `src/features/analysis/components/ModelSelector/`（新建）
  - 组件: `ModelSelector`, `ModelCard`, `ModelLockBadge`
  - 显示模型名称、特点、适用场景
- [ ] Subtask 3.2: 实现用户偏好保存
  - 保存用户选择的模型到用户设置
  - 下次分析时自动使用上次选择的模型
- [ ] Subtask 3.3: 实现订阅等级限制 UI
  - 显示锁定图标表示需要升级
  - 点击弹出升级提示
  - 记住用户选择

### **Task 4: 扩展分析 API 支持模型选择** (AC: 2, 4) ⏱️ 2小时

- [ ] Subtask 4.1: 扩展 POST `/api/analysis`
  - 添加可选字段: `modelId`
  - 如果未指定，使用用户偏好或默认模型
  - 验证用户是否有权限使用指定模型
- [ ] Subtask 4.2: 扩展 POST `/api/analysis/batch`
  - 同样支持模型选择参数
  - 批量分析使用统一的模型
- [ ] Subtask 4.3: 在分析结果中记录使用的模型
  - 扩展 `analysis_results` 表添加 `modelId` 字段
  - 分析结果中显示使用的模型名称

### **Task 5: 实现模型使用统计** (AC: 6) ⏱️ 1小时

- [ ] Subtask 5.1: 创建模型使用统计表
  - 位置: `src/lib/db/schema.ts`
  - 表: `model_usage_stats`
  - 字段: model_id, user_id, success_count, failure_count, avg_duration
- [ ] Subtask 5.2: 实现统计记录功能
  - 分析完成时记录使用统计
  - 记录成功/失败状态
  - 记录分析耗时
- [ ] Subtask 5.3: 创建统计查询 API
  - GET `/api/admin/models/stats` - 获取使用统计
  - 支持按时间范围筛选

### **Task 6: 集成订阅等级控制** (AC: 3) ⏱️ 1小时

- [ ] Subtask 6.1: 定义订阅等级模型访问权限
  - Free: 仅默认模型
  - Lite: 默认模型 + 1 个高级模型
  - Standard: 所有模型
- [ ] Subtask 6.2: 实现权限检查逻辑
  - 在 API 层检查用户权限
  - 在前端隐藏不可用的模型选项
- [ ] Subtask 6.3: 实现升级提示
  - 显示需要升级才能使用的模型
  - 链接到订阅升级页面

### **Task 7: 编写单元测试和 E2E 测试** (AC: 1, 2, 4, 7) ⏱️ 2小时

- [ ] Subtask 7.1: 测试模型注册表
  - 模型添加/移除测试
  - 模型查询测试
- [ ] Subtask 7.2: 测试多模型切换
  - 不同模型的调用测试
  - 模型降级测试
- [ ] Subtask 7.3: 测试 API 端点
  - 模型选择参数测试
  - 权限检查测试
- [ ] Subtask 7.4: E2E 测试
  - 选择模型 → 分析 → 查看结果
  - 订阅等级限制测试

---

## 🛠️ Dev Notes

### 🔴 Critical Architecture Requirements

1. **扩展现有文件**:
   - ⚡ 扩展 `src/lib/replicate/vision.ts`（已存在）
   - ⚡ 添加新函数不要修改现有函数签名

2. **⚠️ 现有代码冲突 - validateImageComplexity 函数**:
   - 现有代码已存在 `validateImageComplexity()` 函数 (vision.ts:122-177)
   - 该函数使用 `moonshotai/kimi-k2.5` 模型
   - **整合方案**:
     - 将该函数纳入新的模型系统统一管理
     - 在模型配置中注册 kimi 模型
     - 修改 `validateImageComplexity` 调用新系统的 `analyzeImageWithModel('qwen3-vl', imageUrl)`

3. **数据库命名约定**:
   - TypeScript 层: camelCase（`userId`, `modelId`）
   - 数据库列: snake_case（`user_id`, `model_id`）
   - ⚡ 参考 `analysis_results` 表的实现

4. **订阅等级配置**:

   ```typescript
   const TIER_ACCESS = {
     free: ['qwen3-vl'], // 仅默认模型
     lite: ['qwen3-vl', 'kimi-k2.5'], // 默认 + 1 个
     standard: ['qwen3-vl', 'kimi-k2.5', 'gemini-flash'], // 所有模型
   };
   ```

5. **使用 console 而非 logger**:
   - ⚡ 项目中没有统一的 logger 工具
   - 使用 `console.error()` 记录错误

6. **复用现有组件**:
   - ⚡ 复用 Story 3-1 的分析逻辑
   - ⚡ 复用 Story 3-2 的批量分析
   - ⚡ 复用 Story 3-3 的队列功能

---

### Dependencies

**依赖图:**

```
Epic 0 (初始化) ✅ 已完成
Epic 1 (用户认证) ✅ 已完成
Epic 2 (图片上传) ✅ 已完成
  ├─ Story 2-1 (图片上传) ✅
  ├─ Story 2-2 (批量上传) ✅
  ├─ Story 2-3 (上传验证) ✅
  └─ Story 2-4 (进度反馈) ✅

Epic 3 (AI 风格分析)
  ├─ Story 3-1 (风格分析) ✅ → 复用分析函数
  ├─ Story 3-2 (批量分析) ✅ → 复用批量逻辑
  ├─ Story 3-3 (分析进度) ✅ → 复用队列功能
  └─ Story 3-4 (模型集成) ← 当前

Epic 8 (订阅与支付系统) 🔴 阻塞 - 需要先完成
  └─ 订阅等级控制依赖此 Epic
  └─ 解决建议: 使用占位符实现或延期 AC-3

后续 Stories:
└─ Story 3-5 (置信度评分)
```

**⚠️ 重要依赖说明:**

- **AC-3 (订阅等级控制)** 依赖 Epic 8 (订阅与支付系统)，该 Epic 当前为 backlog 状态
- **解决方案选择:**
  1. **方案 A**: 使用占位符实现 (硬编码订阅等级判断)，Epic 8 完成后再替换
  2. **方案 B**: 跳过 AC-3 相关功能，Story 3-4 仅实现核心多模型支持
- **推荐**: 方案 A - 使用占位符，保持向前兼容

**依赖的外部服务:**

- Replicate API（视觉模型）
- PostgreSQL（数据存储）

**后续 Stories:**

- 3-5-confidence-scoring: 置信度优化（扩展本 Story）

---

### 📐 Database Schema

```typescript
// src/lib/db/schema.ts

// 模型使用统计表（新建）
export const modelUsageStats = pgTable('model_usage_stats', {
  id: serial('id').primaryKey(),
  modelId: text('model_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  totalDuration: real('total_duration').notNull().default(0), // 总耗时（秒）
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 扩展现有 analysis_results 表
export const analysisResults = pgTable('analysis_results', {
  // ... 现有字段
  modelId: text('model_id'), // 使用的模型 ID
});

// 管理员模型配置表（新建）
export const modelConfig = pgTable('model_config', {
  id: text('id').primaryKey(), // 模型 ID
  name: text('name').notNull(),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  requiresTier: text('requires_tier'), // 最低订阅等级: free | lite | standard
  costPerCall: real('cost_per_call'), // 每次调用成本
  avgDuration: real('avg_duration'), // 平均分析耗时（秒）
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});
```

---

### 🎨 UX Requirements

**模型选择器 UI:**

- 下拉选择框显示可用模型
- 每个选项显示模型名称和特点
- 锁定图标表示需要升级
- 悬停显示详细描述

**模型卡片设计:**

- 模型名称（大字体）
- 特点标签：快速/准确/经济
- 适用场景描述
- 订阅等级要求徽章

**分析结果中显示:**

- 使用的模型名称
- 模型特点（如"更擅长艺术风格"）

---

### 🗄️ Database Migration (Drizzle)

**数据库迁移步骤:**

```bash
# 使用 Drizzle Kit 进行迁移
npm run db:generate  # 生成迁移 SQL
npm run db:migrate    # 执行迁移
```

**SQL 迁移示例:**

```sql
-- 创建模型配置表
CREATE TABLE model_config (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  requires_tier VARCHAR(20), -- free | lite | standard
  cost_per_call DECIMAL(10, 6),
  avg_duration DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 创建模型使用统计表
CREATE TABLE model_usage_stats (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  total_duration DECIMAL(10, 2) DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 扩展 analysis_results 表
ALTER TABLE analysis_results ADD COLUMN model_id VARCHAR(50);
```

---

### 🔧 API 端点设计

**POST /api/analysis** (扩展)

```typescript
// 请求
{
  "imageId": 123,
  "modelId": "qwen3-vl"  // 可选，不指定则使用默认/偏好
}

// 响应
{
  "success": true,
  "data": {
    "analysisId": 456,
    "status": "processing",
    "modelUsed": "qwen3-vl"  // 实际使用的模型
  }
}

// 错误 - 模型不可用
{
  "success": false,
  "error": {
    "code": "MODEL_UNAVAILABLE",
    "message": "该模型需要 Standard 订阅",
    "data": {
      "upgradeTier": "standard"
    }
  }
}
```

**GET /api/analysis/models**

```typescript
// 响应
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "kimi-k2.5",
        "name": "LLaVA 默认",
        "description": "性价比高，适合日常使用",
        "features": ["快速", "经济"],
        "enabled": true,
        "isDefault": true,
        "requiresTier": "free"
      },
      {
        "id": "qwen3-vl",
        "name": "Qwen VL",
        "description": "中文理解能力强",
        "features": ["中文优化", "准确"],
        "enabled": true,
        "isDefault": false,
        "requiresTier": "lite"
      },
      {
        "id": "gemini-flash",
        "name": "GPT-4o",
        "description": "最准确的视觉理解",
        "features": ["最高准确率"],
        "enabled": false,  // 管理员禁用
        "isDefault": false,
        "requiresTier": "standard"
      }
    ],
    "userTier": "free",
    "availableModels": ["qwen3-vl"]
  }
}
```

**POST /api/admin/models** (管理员)

```typescript
// 请求
{
  "modelId": "gemini-flash",
  "enabled": true
}

// 响应
{
  "success": true,
  "data": {
    "message": "模型已启用"
  }
}
```

**GET /api/admin/models/stats**

```typescript
// 响应
{
  "success": true,
  "data": {
    "stats": [
      {
        "modelId": "kimi-k2.5",
        "totalCalls": 150,
        "successRate": 0.95,
        "avgDuration": 12.5
      },
      {
        "modelId": "qwen3-vl",
        "totalCalls": 45,
        "successRate": 0.98,
        "avgDuration": 18.2
      }
    ]
  }
}
```

---

### 🔧 Vision Models Configuration

**推荐的视觉模型:**

| 模型 ID        | 名称          | 特点         | 成本       | 适用场景 | Replicate 模型 ID                                                                           |
| -------------- | ------------- | ------------ | ---------- | -------- | ------------------------------------------------------------------------------------------ |
| `qwen3-vl`     | Qwen3 VL 8B  | 快速、性价比 | 待定       | 日常使用 | `lucataco/qwen3-vl-8b-instruct:39e893666996acf464cff75688ad49ac95ef54e9f1c688fbc677330acc478e11` |
| `kimi-k2.5`    | Kimi K2.5    | 中文优化     | 待定       | 中文图片 | `moonshotai/kimi-k2.5`                                                                    |
| `gemini-flash` | Gemini 3 Flash | 最高准确率 | 待定     | 复杂分析 | `google/gemini-3-flash`                                                                    |

**错误处理策略 (不降级):**

```typescript
// src/lib/analysis/error-handler.ts

/**
 * 错误处理配置
 * ⚠️ 重要: 模型失败时不降级，直接报错，不扣 credit
 */
export const MODEL_ERROR_CONFIG = {
  maxRetries: 3,              // 最多重试 3 次
  retryDelayMs: 2000,         // 重试间隔 2 秒
  retryableErrors: [
    'RATE_LIMIT',             // 速率限制
    'TIMEOUT',                // 超时
    'TEMPORARILY_UNAVAILABLE' // 临时不可用
  ],
};

/**
 * 处理模型错误
 * - 重试 retryableErrors 中的错误
 * - 其他错误直接抛出，不扣 credit
 * - 记录错误日志用于分析
 */
export async function handleModelError(
  error: Error,
  modelId: string,
  context: { imageUrl: string; userId: string }
): Promise<never> {
  const isRetryable = MODEL_ERROR_CONFIG.retryableErrors.includes(error.message);

  if (isRetryable) {
    // 可重试错误可以重试（用户等待中，不扣 credit）
    throw error;
  }

  // 非可重试错误：直接报错，不扣 credit
  console.error('模型调用失败（不扣 credit）:', {
    modelId,
    error: error.message,
    ...context,
    timestamp: new Date().toISOString()
  });

  throw new Error(`模型 ${modelId} 暂时不可用，请稍后重试或选择其他模型`);
}
```

**⚠️ 实现要点:**

1. **不降级**: 模型失败时不自动切换到备用模型
2. **不扣 Credit**: 调用失败不扣除用户积分
3. **重试机制**: 对 RATE_LIMIT、TEMPORARILY_UNAVAILABLE 等临时错误进行重试
4. **错误提示**: 返回友好的错误信息给用户
5. **错误日志**: 记录详细错误用于后续分析

**环境变量配置:**

```bash
# .env.local
# 默认模型 (推荐 Kimi)
REPLICATE_VISION_MODEL_ID=lucataco/qwen3-vl-8b-instruct:39e893666996acf464cff75688ad49ac95ef54e9f1c688fbc677330acc478e11

# 额外模型配置 (使用逗号分隔的模型 ID 列表)
REPLICATE_EXTRA_MODELS=lucataco/qwen3-vl-8b-instruct:39e893666996acf464cff75688ad49ac95ef54e9f1c688fbc677330acc478e11,google/gemini-3-flash

# 管理员启用的模型列表（逗号分隔）
ENABLED_VISION_MODELS=kimi-k2.5,qwen3-vl

# 降级超时配置 (毫秒)
MODEL_FALLBACK_TIMEOUT=30000
```

---

### 📊 Performance Monitoring

**性能监控要求:**

- 记录每个模型的平均分析时间
- 记录每个模型的成功率
- 记录模型降级触发次数

**告警阈值:**

- 模型成功率 < 90%
- 模型平均响应时间 > 60 秒
- 连续降级触发 > 3 次

---

### 🎯 Prompt 适配策略

**不同模型的 Prompt 模板:**

```typescript
// src/lib/analysis/prompt-templates.ts
export const PROMPT_TEMPLATES = {
  // Qwen3 VL 8B - 默认模型，快速性价比
  'qwen3-vl': {
    base: `Analyze the visual style of this image and extract the following four dimensions:
1. Lighting & Shadow
2. Composition
3. Color
4. Artistic Style

Return the result in JSON format.`,
    features: ['standard', 'fast'],
  },

  // Kimi K2.5 - 中文优化
  'kimi-k2.5': {
    base: `分析这张图片的视觉风格，提取以下四个维度：
1. 光影 (Lighting & Shadow)
2. 构图 (Composition)
3. 色彩 (Color)
4. 艺术风格 (Artistic Style)

请用中文返回 JSON 格式结果。`,
    features: ['chinese', 'accurate'],
  },

  // Gemini 3 Flash - 详细分析
  gemini-flash: {
    base: `Perform a comprehensive visual style analysis of this image with extreme detail.
Analyze and provide:
1. Lighting & Shadow - light source, contrast, shadows
2. Composition - viewpoint, balance, depth
3. Color - palette, contrast, temperature
4. Artistic Style - movement, period, emotional tone

Provide detailed analysis with high confidence scores. Return JSON.`,
    features: ['detailed', 'high-accuracy'],
  },
};

// 获取模型对应的 Prompt
export function getModelPrompt(modelId: string, basePrompt?: string): string {
  const template = PROMPT_TEMPLATES[modelId];
  if (!template) {
    // 默认回退到 qwen3-vl 模板
    return basePrompt || PROMPT_TEMPLATES['qwen3-vl'].base;
  }
  return basePrompt || template.base;
}
```

---

### 🧪 Test Data

**测试模型切换:**

```typescript
// 测试不同模型
const models = ['kimi-k2.5', 'qwen3-vl', 'gemini-flash'];

for (const modelId of models) {
  const result = await analyzeImageWithModel(testImageUrl, modelId);
  expect(result).toBeDefined();
}
```

**测试订阅限制:**

```typescript
// Free 用户测试
const freeUser = { tier: 'free', models: ['kimi-k2.5'] };
expect(() => selectModel('qwen3-vl', freeUser)).toThrow('需要升级');

// Standard 用户测试
const standardUser = { tier: 'standard', models: ['kimi-k2.5', 'qwen3-vl', 'gemini-flash'] };
expect(selectModel('gemini-flash', standardUser)).toBe('gemini-flash');
```

---

### 💾 Caching Strategy

**缓存策略 (推荐实现):**

```typescript
// src/lib/analysis/model-cache.ts
import { createRedisCache } from '@/lib/redis';

// 缓存配置
const CACHE_TTL = {
  modelList: 300, // 模型列表缓存 5 分钟
  userPreferences: 3600, // 用户偏好缓存 1 小时
  modelStats: 60, // 统计信息缓存 1 分钟
};

// 分析结果不应缓存（实时性要求高）
// 但模型列表和用户偏好可以缓存
export const modelCache = {
  async getModelList() {
    return await redis.get('vision:models:list');
  },
  async setModelList(models) {
    await redis.setex('vision:models:list', CACHE_TTL.modelList, JSON.stringify(models));
  },
  async getUserPreference(userId: string) {
    return await redis.get(`vision:preference:${userId}`);
  },
  async setUserPreference(userId: string, modelId: string) {
    await redis.setex(`vision:preference:${userId}`, CACHE_TTL.userPreferences, modelId);
  },
};
```

**缓存失效场景:**

- 管理员修改模型配置 → 清除模型列表缓存
- 用户更换订阅等级 → 清除用户偏好缓存

---

### Testing Requirements

**单元测试:**

- 模型注册表测试
- 模型切换测试
- 订阅权限检查测试
- 降级策略测试

**E2E 测试:**

- 完整模型选择流程
- 订阅等级限制测试
- 模型统计测试

**集成测试:**

- 多模型 API 集成
- 管理员配置集成

---

### Previous Story Intelligence

**从 Story 3-1 学到的经验:**

- Replicate API 可能有延迟，需要超时保护
- 必须集成 Credit 系统
- 必须检查内容安全
- 必须标注 AI 透明度
- `analyzeImageStyle()` 函数已实现

**从 Story 3-2 学到的经验:**

- 批量分析 API 已完善
- Credit 预扣和动态调整逻辑
- 特征提取算法

**从 Story 3-3 学到的经验:**

- 队列管理已完成
- 并发控制已实现
- 通知机制已实现

**新增考虑:**

- 需要适配多个模型的 Prompt
- 订阅等级权限控制
- 模型降级策略
- 管理员配置接口
- 模型使用统计

---

### References

- [Source: prd.md#FR16] (调用至少一个视觉模型)
- [Source: prd.md#FR17] (用户手动选择模型)
- [Source: prd.md#FR68] (管理员配置模型)
- [Source: architecture.md#Replicate-API] (Replicate 集成规范)
- [Source: architecture.md#Naming-Patterns] (命名规范)
- [Source: epics.md#Epic-3] (Epic 3 完整需求)
- [Source: Story 3-1] (风格分析实现参考)
- [Source: Story 3-2] (批量分析实现参考)
- [Source: Story 3-3] (队列管理实现参考)
- [Source: src/lib/replicate/vision.ts] (现有 Vision 客户端)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
