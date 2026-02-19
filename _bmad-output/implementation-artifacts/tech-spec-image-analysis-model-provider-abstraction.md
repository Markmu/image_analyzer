---
title: '图片分析模型 Provider 抽象与阿里百炼接入'
slug: 'image-analysis-model-provider-abstraction'
created: '2026-02-19T13:30:00Z'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - Next.js 16
  - React 19
  - TypeScript 5
  - Replicate SDK
  - OpenAI SDK (新增，阿里百炼兼容)
  - Zod (数据验证)
  - Vitest (单元测试)
  - MSW (API mock)
files_to_modify:
  - src/lib/analysis/models.ts
  - src/lib/replicate/vision.ts
  - src/lib/analysis/parser.ts
  - src/app/api/analysis/route.ts
  - .env.example
code_patterns:
  - 'Zod schema 验证：使用 z.object() 定义数据结构，safeParse() 验证'
  - '环境变量验证：模块顶层检查必需的环境变量，缺失时抛出错误'
  - '错误处理：使用 try-catch + console.error 记录，抛出用户友好的错误信息'
  - '客户端单例：Replicate client 在模块顶层初始化并导出'
  - '类型导出：优先使用 type 关键字导出类型，避免值导入问题'
test_patterns:
  - 'Vitest 单元测试：使用 describe/it/expect 结构'
  - '环境变量 mock：使用 beforeAll/afterAll 设置和清理'
  - '动态导入：使用 await import() 按需加载模块'
  - '测试文件位置：tests/unit/ 和 tests/api/ 目录结构'
---

# Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入

**Created:** 2026-02-19

## Overview

### Problem Statement

当前图片分析功能直接耦合 Replicate API，存在以下问题：

1. **紧耦合**：`src/lib/replicate/vision.ts` 直接调用 Replicate SDK，难以扩展其他模型平台
2. **重复代码**：`analyzeImageStyle` 和 `analyzeImageWithModel` 有大量重复逻辑
3. **无法支持多平台**：模型配置（`src/lib/analysis/models.ts`）只支持 Replicate 模型 ID
4. **阿里百炼无法接入**：需要直接调用阿里百炼 OpenAI 兼容接口，现有架构不支持

### Solution

引入 Provider 抽象层，统一图片分析模型接口：

1. **定义统一 Provider 接口**：所有 provider 实现相同的方法签名
2. **实现双 Provider**：
   - `ReplicateVisionProvider`：封装现有 Replicate 调用逻辑
   - `AliyunBailianProvider`：实现阿里百炼 OpenAI 兼容接口调用
3. **Provider 路由层**：根据模型 ID 自动路由到对应 provider
4. **模型配置扩展**：在 `VisionModel` 接口添加 `provider` 字段

### Scope

**In Scope:**
- Provider 接口抽象定义（`src/lib/analysis/providers/interface.ts`）
- Replicate Provider 实现（`src/lib/analysis/providers/replicate.ts`）
- 阿里百炼 Provider 实现（`src/lib/analysis/providers/aliyun-bailian.ts`）
- Provider 路由器（`src/lib/analysis/providers/router.ts`）
- 扩展模型配置支持 `provider` 字段
- 重构 `analyzeImageWithModel` 和 `validateImageComplexity` 使用 provider 抽象
- 环境变量配置（`ALIYUN_API_KEY`, `ALIYUN_BASE_URL`）
- 单元测试（provider mock、router 测试）

**Out of Scope:**
- 数据库动态配置模型（留待后续）
- Provider 管理后台 UI
- 回退/降级策略（无需回退，直接报错）
- 性能监控埋点
- Provider 健康检查和自动切换
- 日志记录策略（使用现有 `console.error` 模式）

## Context for Development

### Codebase Patterns

**现有模型配置模式**（`src/lib/analysis/models.ts`）：
- 使用 `VisionModel` 接口定义模型元数据
- `ModelRegistry` 类管理模型注册和查询
- `PROMPT_TEMPLATES` 存储各模型的 prompt 模板
- 环境变量 `REPLICATE_VISION_MODEL_ID` 作为默认模型

**现有 API 调用模式**（`src/lib/replicate/vision.ts`）：
- 直接调用 `replicate.run()` 执行模型
- 使用 `runModelWithVersionFallback` 处理版本回退
- 错误重试使用指数退避
- 响应解析使用 `extractJsonFromResponse` 和 `parseAnalysisResponse`

**类型定义模式**（`src/types/analysis.ts`）：
- `AnalysisData`：四维度分析结果
- `StyleDimension` 和 `StyleFeature`：风格维度和特征
- 置信度使用 0-1 浮点数

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/lib/replicate/vision.ts` | 现有 Replicate 调用逻辑，需重构为 provider |
| `src/lib/analysis/models.ts` | 模型配置系统，需添加 `provider` 字段 |
| `src/lib/analysis/parser.ts` | 响应解析工具，需添加规范化函数 |
| `src/types/analysis.ts` | 分析数据类型定义 |
| `src/app/api/analysis/route.ts` | 分析 API，调用入口点 |
| `.env.example` | 环境变量模板 |

### Technical Decisions

#### 1. Provider 接口设计

使用 TypeScript 接口定义统一契约：

```typescript
interface VisionAnalysisProvider {
  /**
   * 执行图片风格分析
   */
  analyzeImageStyle(params: {
    imageUrl: string;
    prompt: string;
    maxTokens?: number;
  }): Promise<AnalysisData>;

  /**
   * 验证图片复杂度
   */
  validateImageComplexity(params: {
    imageUrl: string;
    prompt: string;
  }): Promise<ComplexityAnalysisResult>;

  /**
   * Provider 标识符
   */
  readonly providerId: string;
}
```

**决策原因**：
- 接口强制所有 provider 实现相同方法，确保可替换性
- 返回统一类型 `AnalysisData`，便于上层使用
- `providerId` 用于日志和监控

#### 2. Provider 路由策略

根据模型 ID 前缀或配置中的 `provider` 字段路由：

```typescript
// 模型配置中添加 provider 字段
interface VisionModel {
  // ... 现有字段
  provider: 'replicate' | 'aliyun';
}
```

**路由逻辑**：
1. 从 `ModelRegistry` 获取模型配置
2. 读取 `provider` 字段
3. 调用对应 provider 的方法

**决策原因**：
- 配置驱动，无需硬编码路由规则
- 支持未来扩展更多 provider
- 模型 ID 保持简洁，不包含 provider 前缀

#### 3. 响应规范化策略

使用共享工具函数处理不同平台的响应格式差异：

```typescript
// src/lib/analysis/parser.ts
export function normalizeProviderResponse(
  raw: string,
  provider: 'replicate' | 'aliyun'
): string {
  switch (provider) {
    case 'replicate':
      return normalizeReplicateResponse(raw);
    case 'aliyun':
      return normalizeAliyunResponse(raw);
    default:
      return raw;
  }
}
```

**决策原因**：
- 平台了解自己的响应格式，在 Provider 层调用共享工具
- 共享函数避免代码重复，保持 DRY
- 便于测试和维护
- Provider 内部处理特殊情况（如 Replicate 版本回退）

**职责边界**：
- Provider：调用 API + 处理平台特定逻辑（如版本回退）
- 共享工具：响应格式规范化
- Router：路由和缓存
- API：credit 扣除和用户响应

#### 3. 阿里百炼实现方案

使用 OpenAI SDK 调用阿里百炼兼容接口：

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ALIYUN_API_KEY,
  baseURL: process.env.ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const response = await client.chat.completions.create({
  model: 'qwen3.5-plus',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
  ],
});
```

**决策原因**：
- 阿里百炼官方推荐使用 OpenAI 兼容接口
- 复用成熟的 OpenAI SDK，减少自定义代码
- 支持流式响应（可选，当前不使用）

**模型名称映射**：
- 系统内部模型 ID：`qwen3.5-plus`
- 阿里百炼 API 模型名称：`qwen-vl-plus`（多模态视觉模型）
- 配置中的 `replicateModelId` 字段对阿里模型设为 `null`

**注意**：系统内部 ID 与 API 模型名称不同。内部 ID `qwen3.5-plus` 用于用户选择和配置，实际调用阿里百炼 API 时使用 `qwen-vl-plus`。这种分离允许灵活的模型版本管理。

#### 5. Provider 实例缓存策略

Provider 构造函数验证必需的环境变量：

```typescript
class AliyunBailianProvider {
  constructor() {
    if (!process.env.ALIYUN_API_KEY) {
      throw new Error(
        'ALIYUN_API_KEY is required for AliyunBailianProvider. ' +
        'Please set the environment variable before starting the application.'
      );
    }
    // ... 初始化 OpenAI client
  }
}
```

**验证时机说明**：
- 环境变量必须在**应用启动时**存在
- Provider 在首次创建时验证，之后使用缓存实例
- 如果运行时环境变量被删除，Provider 不会重新验证
- 适用于传统 Node.js 和 Serverless 环境（每个请求都是新进程）

**决策原因**：
- 启动时验证比运行时验证更安全（早失败原则）
- 单例缓存下，运行时验证意义不大
- 符合 12-factor app 的配置原则

#### 4. Provider 实例缓存策略

Router 层使用 Map 缓存 Provider 实例：

```typescript
class ProviderRouter {
  private providerCache = new Map<string, VisionAnalysisProvider>();

  getProvider(modelId: string): VisionAnalysisProvider {
    const model = modelRegistry.getModelById(modelId);
    const cacheKey = model.provider;

    let provider = this.providerCache.get(cacheKey);
    if (!provider) {
      provider = this.createProvider(model.provider);
      this.providerCache.set(cacheKey, provider);
    }

    return provider;
  }

  resetCache(): void {
    this.providerCache.clear();
  }
}
```

**决策原因**：
- 避免重复创建 OpenAI client 和 Replicate 实例
- 连接池管理更有效
- 简单实现，覆盖 99% 场景
- `resetCache()` 用于测试和热重载

**并发安全说明**：
- Node.js 单线程环境：Map 操作是原子的，无并发问题
- Serverless 环境：每个请求是独立进程，缓存各自独立
- 测试环境：使用 `resetCache()` 确保测试隔离

**测试环境隔离**：
- 使用 `resetCache()` 在每个测试套件开始/结束时清理缓存
- 确保测试间相互独立，不受缓存状态影响

#### 6. 新增模型配置

在 `DEFAULT_VISION_MODELS` 数组中添加：

```typescript
{
  id: 'qwen3.5-plus',
  name: 'Qwen3.5 Plus',
  description: '阿里百炼旗舰模型，高性价比，中文优化',
  features: ['高性价比', '中文优化', '快速响应'],
  replicateModelId: null, // 阿里模型不使用此字段
  provider: 'aliyun',
  isDefault: false,
  enabled: true,
  requiresTier: 'free',
  costPerCall: 1,
  avgDuration: 10,
}
```

**决策原因**：
- `replicateModelId` 设为 `null`，明确标识非 Replicate 模型
- 设置为免费层级，降低使用门槛
- `avgDuration` 设为 10 秒，反映阿里百炼通常更快的响应速度

#### 6. 重构策略

**保持向后兼容**：
- 保留 `analyzeImageStyle` 和 `validateImageComplexity` 的原有签名
- 内部实现改为调用 provider 抽象层
- 旧代码无需修改

**迁移路径**：
1. 先实现 provider 抽象层和路由器
2. Replicate Provider 封装现有逻辑
3. 阿里百炼 Provider 新实现
4. 修改 `analyzeImageWithModel` 使用路由器
5. 逐步迁移其他调用点

## Implementation Plan

### Tasks

#### Task 1: 定义 Provider 接口

**文件**: `src/lib/analysis/providers/interface.ts`

**操作**:
1. 创建 `VisionAnalysisProvider` 接口
2. 定义方法签名：
   - `analyzeImageStyle(params): Promise<AnalysisData>`
   - `validateImageComplexity(params): Promise<ComplexityAnalysisResult>`
3. 定义参数类型：
   - `AnalyzeImageStyleParams`
   - `ValidateImageComplexityParams`
4. **类型定义**：为了避免循环依赖，在 `interface.ts` 中直接定义 `ComplexityAnalysisResult` 类型（不从 `vision.ts` 导入）：
   ```typescript
   export interface ComplexityAnalysisResult {
     subjectCount: number;
     complexity: 'low' | 'medium' | 'high';
     confidence: number;
     reason: string;
   }
   ```
5. 导出接口和类型

**验收标准**:
- [ ] TypeScript 编译无错误
- [ ] 接口方法签名清晰，参数类型完整
- [ ] `ComplexityAnalysisResult` 类型在 `interface.ts` 中定义，避免循环依赖
- [ ] 添加 JSDoc 注释说明每个方法用途

---

#### Task 2: 实现响应规范化工具函数

**文件**: `src/lib/analysis/parser.ts`

**操作**:
1. 添加 `normalizeProviderResponse()` 函数：
   ```typescript
   export function normalizeProviderResponse(
     raw: string,
     provider: 'replicate' | 'aliyun'
   ): string
   ```
2. 实现 `normalizeReplicateResponse(raw: string): string`：
   - 提取 JSON 内容（处理字符串/对象类型）
   - 清理多余空白字符
   - 兜底处理：返回原始内容并记录警告
3. 实现 `normalizeAliyunResponse(raw: string): string`：
   - 提取 JSON 内容（处理 markdown 代码块）
   - 清理特殊字符和多余换行
   - 处理可能的中文标点差异（中文逗号 `，` → 英文 `,`，中文引号 `"` `"` → 英文 `"`）
   - 兜底处理：返回原始内容并记录警告
4. 添加单元测试验证各种响应格式

**验收标准**:
- [ ] 函数支持 Replicate 和阿里百炼两种 provider
- [ ] 正确处理标准 JSON 响应
- [ ] 正确处理包含 markdown 代码块的响应
- [ ] 正确处理字符串/对象类型的响应
- [ ] 单元测试覆盖所有格式变体
- [ ] 函数有清晰的 JSDoc 注释
- [ ] 兜底处理确保任何响应都能被解析
- [ ] 兜底触发时记录 `console.warn` 警告日志
- [ ] 未知 provider 抛出 `TypeError`

---

#### Task 3: 实现 Replicate Provider

**文件**: `src/lib/analysis/providers/replicate.ts`

**操作**:
1. 创建 `ReplicateVisionProvider` 类
2. 实现 `VisionAnalysisProvider` 接口
3. 封装现有 `src/lib/replicate/vision.ts` 逻辑：
   - `analyzeImageStyle` → `analyzeImageWithModel`
   - `validateImageComplexity` → 保持逻辑不变
4. **关键**：Provider 不处理重试，只做单次调用
5. **响应规范化**：使用共享的 `normalizeProviderResponse()` 函数处理 Replicate 特有的响应格式
6. **特殊情况处理**：Replicate 的版本回退逻辑保留在 Provider 内部
   - 从 `src/lib/replicate/vision.ts` 导入 `runModelWithVersionFallback` 函数
   - 或在 Provider 内部复制版本回退逻辑

**验收标准**:
- [ ] 实现 `VisionAnalysisProvider` 接口
- [ ] `providerId` 返回 `'replicate'`
- [ ] 支持所有现有 Replicate 模型
- [ ] 不处理通用重试逻辑，由调用方决定是否重试
- [ ] 版本回退逻辑保留在 Provider 内部
- [ ] 使用共享的 `normalizeProviderResponse('replicate', raw)` 函数
- [ ] 明确 `runModelWithVersionFallback` 的访问方式（导入或复制）
- [ ] 单元测试通过（使用 msw mock Replicate API）

---

#### Task 4: 实现阿里百炼 Provider

**文件**: `src/lib/analysis/providers/aliyun-bailian.ts`

**操作**:
1. 安装依赖：`npm install openai`
2. **版本兼容性检查**：检查项目中是否有 `@types/openai`，确保版本兼容。如果不兼容，更新 `openai` 包版本
3. 创建 `AliyunBailianProvider` 类
4. **OpenAI Client 初始化**：
   - 在类属性中存储 OpenAI client 实例：`private client: OpenAI`
   - 在构造函数中初始化，复用连接
5. 实现 `VisionAnalysisProvider` 接口
6. **启动验证**：构造函数中验证必需的环境变量 `ALIYUN_API_KEY`，缺失时抛出清晰错误
7. 实现逻辑：
   - 初始化 OpenAI client
   - `analyzeImageStyle`：调用 `qwen3.5-plus` 模型
   - `validateImageComplexity`：调用相同模型，不同 prompt
8. **图片输入支持**：
   - 支持图片 URL：`{ type: 'image_url', image_url: { url: imageUrl } }`
   - 支持 Base64：`{ type: 'image_url', image_url: { url: 'data:image/...;base64,...' } }`
   - OpenAI SDK 的 `image_url` 类型自动支持两种格式
9. **响应规范化**：使用共享的 `normalizeProviderResponse()` 函数处理阿里百炼特有的响应格式
10. 复用 `extractJsonFromResponse` 和 `parseAnalysisResponse` 进行最终解析

**验收标准**:
- [ ] 实现 `VisionAnalysisProvider` 接口
- [ ] `providerId` 返回 `'aliyun'`
- [ ] OpenAI client 在类属性中存储，复用连接
- [ ] 构造时验证 `ALIYUN_API_KEY`，缺失时抛出清晰错误
- [ ] 从环境变量读取 `ALIYUN_API_KEY` 和 `ALIYUN_BASE_URL`
- [ ] 支持图片 URL 输入
- [ ] 支持 Base64 输入（`data:image/...;base64,...` 格式）
- [ ] 使用共享的 `normalizeProviderResponse('aliyun', raw)` 函数
- [ ] 响应解析成功，返回 `AnalysisData` 结构
- [ ] OpenAI SDK 版本与现有类型定义兼容
- [ ] 单元测试通过（mock OpenAI client，测试环境变量缺失场景）

---

#### Task 5: 实现 Provider 路由器

**文件**:
- `src/lib/analysis/providers/router.ts`
- `src/lib/analysis/providers/errors.ts`（新建）

**操作**:

**第一步：创建自定义错误类型** (`src/lib/analysis/providers/errors.ts`)：
```typescript
export class ModelNotFoundError extends Error {
  constructor(modelId: string) {
    super(\`Model not found: \${modelId}\`);
    this.name = 'ModelNotFoundError';
  }
}

export class UnknownProviderError extends TypeError {
  constructor(provider: string) {
    super(\`Unknown provider: \${provider}. Valid: 'replicate', 'aliyun'\`);
    this.name = 'UnknownProviderError';
  }
}
```

**第二步：创建 Router** (`src/lib/analysis/providers/router.ts`)：
1. 创建 `ProviderRouter` 类
2. **导入 ModelRegistry**：
   ```typescript
   import { modelRegistry } from '@/lib/analysis/models';
   ```
3. 实现 Provider 实例缓存：
   - 使用 `Map<string, VisionAnalysisProvider>` 缓存实例
   - 键为 provider 类型（'replicate' | 'aliyun'）
   - `getProvider(modelId)` 方法返回缓存的实例或创建新实例
   - 添加 `resetCache()` 方法用于测试和热重载
4. 实现方法：
   - `getProvider(modelId: string): VisionAnalysisProvider`
   - `analyzeImageWithProvider(imageUrl, modelId, prompt?)`：prompt 可选，内部使用 `modelRegistry.getModelPrompt(modelId)` 获取
   - `validateComplexityWithProvider(imageUrl, modelId, prompt?)`：prompt 可选，内部使用 `modelRegistry.getModelPrompt(modelId)` 获取
5. 路由逻辑：
   - 从 `modelRegistry` 获取模型配置
   - 读取 `provider` 字段
   - 返回对应 provider 实例（从缓存）
6. **错误处理**：
   - 模型不存在 → 抛出 `ModelNotFoundError`
   - Provider 未实现 → 抛出 `UnknownProviderError`

**验收标准**:
- [ ] 创建自定义错误类型 `ModelNotFoundError` 和 `UnknownProviderError`
- [ ] 正确导入 `modelRegistry`，通过 `modelRegistry.getModelPrompt(modelId)` 获取 prompt
- [ ] 正确路由到对应 provider
- [ ] Replicate 模型使用 `ReplicateVisionProvider`
- [ ] 阿里模型使用 `AliyunBailianProvider`
- [ ] Provider 实例被正确缓存，多次调用复用同一实例
- [ ] `resetCache()` 方法清空缓存
- [ ] 模型不存在时抛出 `ModelNotFoundError`
- [ ] Provider 未实现时抛出 `UnknownProviderError`
- [ ] 单元测试覆盖所有路由场景
- [ ] 单元测试验证缓存复用逻辑
- [ ] 单元测试验证错误抛出逻辑

---

#### Task 6: 扩展模型配置

**文件**: `src/lib/analysis/models.ts`

**操作**:
1. 修改 `VisionModel` 接口，添加 `provider` 字段（必需字段）：
   ```typescript
   provider: 'replicate' | 'aliyun';
   ```
2. 更新 `ModelRegistry.registerModel()` 方法：
   - 添加运行时验证：检查 `provider` 字段是否存在
   - 验证 `provider` 值是否为 'replicate' 或 'aliyun'
   - 缺失或无效时抛出清晰错误
3. 更新 `DEFAULT_VISION_MODELS`：
   - 所有现有模型添加 `provider: 'replicate'`
   - 添加 `qwen3.5-plus` 模型配置（`provider: 'aliyun'`）
4. 更新 `TIER_ACCESS`，添加 `qwen3.5-plus` 到免费层级
5. 确保 `replicateModelId` 对阿里模型为可选（可设为 `null` 或 `undefined`）

**验收标准**:
- [ ] TypeScript 编译无错误
- [ ] `provider` 字段为必需，所有模型都有该字段
- [ ] 模型注册时验证 `provider` 字段，缺失或无效时抛出错误
- [ ] `qwen3.5-plus` 在免费层级可用
- [ ] `qwen3.5-plus` 不使用 `replicateModelId`

---

#### Task 7: 重构分析 API 使用 Provider

**文件**: `src/app/api/analysis/route.ts`

**操作**:
1. 导入 `ProviderRouter`
2. 修改 `executeAnalysisAsync` 函数：
   - 替换 `analyzeImageWithModel(imageUrl, modelId)` 为 `router.analyzeImageWithProvider(imageUrl, modelId)`
   - 替换 `validateImageComplexity(imageUrl)` 为 `router.validateComplexityWithProvider(imageUrl, modelId)`
3. **关键**：确保 credit 扣除在最终成功后，避免重试导致的重复扣除
4. 确保错误处理逻辑不变，错误边界清晰

**数据库持久化说明**：
- `provider` 字段不需要持久化到数据库
- `analysisResults` 表已有 `modelId` 字段，通过 `modelRegistry.getModelById(modelId).provider` 获取 provider
- 如需在未来存储 provider，添加数据库迁移任务

**验收标准**:
- [ ] API 响应格式不变
- [ ] 支持 Replicate 和阿里模型
- [ ] Credit 只在分析成功后扣除一次
- [ ] 错误处理与原有实现一致
- [ ] 错误处理边界清晰（Provider 错误 vs API 错误）
- [ ] 集成测试通过

---

#### Task 8: 环境变量配置

**文件**: `.env.example`

**操作**:
1. 添加阿里百炼配置：
   ```
   # 阿里百炼配置（必需）
   ALIYUN_API_KEY=your_aliyun_api_key_here
   ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   ```
2. 更新 `.env.local`（本地开发）
3. 更新部署环境变量
4. **Provider 初始化验证**：在 `AliyunBailianProvider` 构造函数中验证环境变量

**验收标准**:
- [ ] `.env.example` 包含新配置
- [ ] 环境变量在代码中正确读取
- [ ] Provider 初始化时验证环境变量，缺失时抛出清晰错误
- [ ] 错误信息包含缺失的环境变量名称和配置建议

---

#### Task 9: 单元测试

**文件**:
- `src/lib/analysis/providers/__tests__/replicate.test.ts`
- `src/lib/analysis/providers/__tests__/aliyun-bailian.test.ts`
- `src/lib/analysis/providers/__tests__/router.test.ts`

**操作**:

**Replicate Provider 测试**:
- Mock `replicate.run()` 调用
- 测试 `analyzeImageStyle` 成功场景
- 测试版本回退逻辑（Provider 内部特殊处理）
- 测试使用共享规范化函数
- 测试各种 Replicate 响应格式

**阿里百炼 Provider 测试**:
- Mock OpenAI client
- 测试 `analyzeImageStyle` 成功场景
- 测试 `validateImageComplexity` 成功场景
- 测试环境变量缺失错误（构造函数验证）
- 测试使用共享规范化函数
- 测试各种阿里百炼响应格式

**响应规范化函数测试**:
- 测试 `normalizeProviderResponse()` 函数
- 测试 Replicate 格式标准化
- 测试阿里百炼格式标准化
- 测试边界情况（空字符串、无效 JSON、markdown 代码块等）

**路由器测试**:
- 测试正确路由到 Replicate
- 测试正确路由到阿里百炼
- 测试模型不存在错误
- 测试 provider 未实现错误
- 测试 Provider 实例缓存和复用
- 测试 `resetCache()` 方法

**验收标准**:
- [ ] 所有测试通过
- [ ] 测试覆盖率 > 80%
- [ ] Mock 清理正确，无测试间污染

---

#### Task 10: 文档更新

**文件**: `docs/` (新建或更新)

**操作**:
1. 创建 `docs/model-provider-abstraction.md`：
   - Provider 抽象架构说明
   - 如何添加新 provider
   - 环境变量配置指南
   - 测试隔离策略（`resetCache()` 使用）
2. 更新 `README.md`：添加阿里百炼配置说明

**验收标准**:
- [ ] 文档清晰，包含代码示例
- [ ] 新开发者能根据文档添加 provider
- [ ] 环境变量配置说明完整

---

### Acceptance Criteria

**总体验收标准**:

1. **功能完整性**:
   - [ ] 支持 Replicate 和阿里百炼双平台
   - [ ] 图片风格分析功能正常
   - [ ] 复杂度验证功能正常
   - [ ] 新模型 `qwen3.5-plus` 可用

2. **向后兼容性**:
   - [ ] 现有 Replicate 模型调用无影响
   - [ ] API 响应格式不变
   - [ ] 数据库 schema 无需修改

3. **代码质量**:
   - [ ] TypeScript 编译无错误
   - [ ] ESLint 检查通过
   - [ ] 单元测试覆盖率 > 80%
   - [ ] 所有测试通过

4. **可维护性**:
   - [ ] Provider 接口清晰，易于扩展
   - [ ] 代码结构合理，职责分离
   - [ ] 注释完整，关键逻辑有说明

5. **性能**:
   - [ ] 阿里百炼响应时间 < 15 秒
   - [ ] Provider 路由无额外性能开销
   - [ ] 内存占用无明显增加

6. **错误处理边界**:
   - [ ] Provider 层：只返回原始错误，不处理重试
   - [ ] Router 层：处理路由和可选的重试
   - [ ] API 层：处理 credit 扣除和用户响应
   - [ ] 环境变量缺失时错误信息清晰

## Additional Context

### Dependencies

**新增 npm 包**:
```json
{
  "openai": "^4.0.0"
}
```

**环境变量**:
```bash
# 阿里百炼配置
ALIYUN_API_KEY=sk-xxx
ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### Testing Strategy

**单元测试**:
- Provider 实现：mock 外部 API 调用，验证请求参数和响应处理
- 路由器：测试各种路由场景，包括错误情况
- 使用 Vitest 运行，配合 msw mock HTTP 请求

**集成测试**:
- 使用真实 API Key 调用阿里百炼（可选，手动测试）
- 验证端到端分析流程

**E2E 测试**:
- 复用现有 Playwright 测试
- 验证分析 API 功能正常

### Notes

**阿里百炼 API 参考**:
- 官方文档: https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api
- OpenAI 兼容接口: https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope

**模型版本**:
- 阿里百炼 qwen-vl-plus: 多模态理解模型，支持图片分析
- Replicate qwen3-vl-8b: 开源版本，通过 Replicate 平台调用

**未来扩展**:
- 可添加更多 provider（如 Azure OpenAI、百度文心一言等）
- 可实现 provider 健康检查和自动切换
- 可添加性能监控和成本追踪
