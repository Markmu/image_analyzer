# Story 3.1: style-analysis

Status: ready-for-dev

---

## 📋 Story

作为一名 **AI 创作者或普通用户**,
我希望 **上传图片后能获得专业的四维度风格分析（光影、构图、色彩、艺术风格）**,
以便 **理解图片的风格特征，并用于生成同风格的新图片**。

---

## ✅ Acceptance Criteria

1. **[AC-1]** 系统可以调用 Replicate 视觉模型 API 进行图片风格分析
   - 支持至少一个视觉模型（如 LLaVA, Qwen-VL）
   - API 调用超时设置为 60 秒
   - 错误重试机制（最多 3 次，指数退避）
   - 返回结构化的分析结果

2. **[AC-2]** 系统可以从图片中提取四大维度的风格特征
   - **光影维度**: 主光源方向、光影对比度、阴影特征
   - **构图维度**: 视角、画面平衡、景深
   - **色彩维度**: 主色调、色彩对比度、色温
   - **艺术风格维度**: 风格流派、艺术时期、情感基调
   - 每个维度包含 3-5 个具体特征标签

3. **[AC-3]** 系统可以将分析结果组织成结构化数据
   - JSON 格式存储到数据库
   - 包含每个维度的特征标签
   - 包含每个特征的置信度分数（0-1）
   - 包含整体分析置信度

4. **[AC-4]** 系统可以显示分析的实时进度
   - 复用 Story 2-4 的进度反馈组件
   - 显示"正在分析光影特征..."等专业术语
   - 显示预计剩余时间
   - 支持取消分析（可选）

5. **[AC-5]** 系统可以处理低置信度的分析结果
   - 如果整体置信度 < 0.6，显示警告
   - 提供"重新分析"选项
   - 标注低置信度的具体维度

6. **[AC-6]** 系统可以收集用户对分析结果的反馈
   - "准确" / "不准确" 二选一反馈
   - 反馈数据存储到数据库
   - 用于后续优化

7. **[AC-7]** 移动端优化和 AI 透明度标注
   - 简化分析结果显示
   - 优先显示主要风格标签
   - "在桌面端查看详细分析"引导
   - 🔴 **清晰标注"AI 分析结果"**（PRD FR54）

8. **[AC-8]** 🔴 **内容安全检查**（PRD FR52）
   - 分析前检查图片是否包含不当内容
   - 如果检测到不当内容，拒绝分析
   - 记录审核日志

9. **[AC-9]** 🔴 **Credit 系统集成**（PRD FR46）
   - 分析开始前检查用户 credit 余额
   - 分析成功后扣除 1 credit
   - 如果 credit 不足，返回升级提示
   - 记录 credit 交易历史

---

## 📦 Tasks / Subtasks

### **Task 1: 创建数据库 Schema** (AC: 3, 6, 9) ⏱️ 30分钟

- [ ] Subtask 1.1: 定义 `analysis_results` 表结构
  - 位置: `src/lib/db/schema.ts`
  - ⚡ **遵循现有命名约定**: TypeScript 使用 camelCase，数据库列使用 snake_case
  ```typescript
  export const analysisResults = pgTable('analysis_results', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    imageId: integer('image_id').notNull().references(() => images.id),
    analysisData: jsonb('analysis_data').notNull().$type<AnalysisData>(),
    confidenceScore: real('confidence_score').notNull(),
    feedback: text('feedback'), // 'accurate' | 'inaccurate' | null
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```
- [ ] Subtask 1.2: 运行数据库迁移
  - `npm run db:generate`
  - `npm run db:migrate`
  - 迁移文件: `drizzle/0005_add_analysis_results.sql`
- [ ] Subtask 1.3: 验证数据库迁移
  - 运行 `npm run db:studio` 打开 Drizzle Studio
  - 确认 `analysis_results` 表存在
  - 确认所有字段类型正确
  - 确认外键约束生效

### **Task 2: 扩展 Replicate Vision 客户端** (AC: 1, 8) ⏱️ 2小时

- [ ] Subtask 2.1: 🔴 **扩展现有 `src/lib/replicate/vision.ts`**
  - ⚡ **不要创建新文件**，在现有文件中添加新函数
  - 添加函数: `analyzeImageStyle(imageUrl: string): Promise<AnalysisData>`
  - 现有函数: `analyzeImage()`, `validateImageComplexity()` 已存在
- [ ] Subtask 2.2: 设计 Prompt 模板
  - 明确要求返回四维度结构化数据
  - 要求包含置信度分数
  - 要求使用 JSON 格式输出
  - 💡 参考实现见下方
- [ ] Subtask 2.3: 实现错误处理和重试机制
  - 超时: 60 秒
  - 重试: 最多 3 次
  - 指数退避: 2^attempt 秒
  - 💡 错误处理场景见 Dev Notes
- [ ] Subtask 2.4: 配置环境变量
  - 在 `.env.local` 添加 `REPLICATE_API_TOKEN=xxx`
  - 在 `.env.local` 添加 `REPLICATE_VISION_MODEL_ID=xxx`
  - 在 `.env.example` 添加示例配置

### **Task 3: 实现分析结果解析和验证** (AC: 2, 3) ⏱️ 1.5小时

- [ ] Subtask 3.1: 创建分析结果类型定义
  - 位置: `src/types/analysis.ts`
  - 类型: `AnalysisData`, `StyleDimension`, `StyleFeature`
- [ ] Subtask 3.2: 实现结果解析器
  - 位置: `src/lib/analysis/parser.ts`（新建）
  - 函数: `parseAnalysisResponse(response: string): AnalysisData`
- [ ] Subtask 3.3: 实现结果验证
  - 使用 Zod 验证数据结构
  - 验证置信度范围（0-1）
  - 验证必需字段

### **Task 4: 创建和扩展分析 API 端点** (AC: 1, 3, 5, 9) ⏱️ 3小时

- [ ] Subtask 4.1: POST `/api/analysis` - 发起分析请求
  - 输入: image_id
  - 输出: analysis_id, status
  - 🔴 **检查 credit 余额**（FR46）
  - 🔴 **内容安全检查**（FR52）
  - 触发后台分析任务
- [ ] Subtask 4.2: 🔴 **扩展 GET `/api/analysis/[id]/status`**
  - 文件: `src/app/api/analysis/[id]/status/route.ts`（已存在）
  - ⚡ **扩展现有功能**: 在 `status === 'completed'` 时返回分析结果
  - 返回: status, progress, result (如果完成)
  - 💡 实现细节见 Dev Notes
- [ ] Subtask 4.3: POST `/api/analysis/[id]/feedback` - 提交用户反馈
  - 输入: feedback (accurate/inaccurate)
  - 更新数据库: analysis_results.feedback
- [ ] Subtask 4.4: 🔴 **集成 Credit 扣除逻辑**
  - 在分析开始前检查用户 credit 余额
  - 分析成功后扣除 1 credit
  - 如果 credit 不足，返回错误提示升级
  - 记录 credit 交易历史

### **Task 5: 实现分析结果前端展示** (AC: 4, 5, 7) ⏱️ 4小时

- [ ] Subtask 5.1: 创建分析结果卡片组件
  - 位置: `src/features/analysis/components/AnalysisResult/`
  - 组件: `AnalysisCard`, `DimensionCard`, `FeatureTag`
- [ ] Subtask 5.2: 实现四维度展示
  - 光影维度卡片（图标: ☀️）
  - 构图维度卡片（图标: 🖼️）
  - 色彩维度卡片（图标: 🎨）
  - 艺术风格维度卡片（图标: 🎭）
- [ ] Subtask 5.3: 实现置信度可视化
  - 高置信度（≥ 0.8）: 绿色徽章
  - 中置信度（0.6-0.8）: 黄色徽章
  - 低置信度（< 0.6）: 红色警告 + "重新分析"按钮
- [ ] Subtask 5.4: 实现用户反馈收集
  - "准确" / "不准确" 按钮
  - 提交后显示感谢消息
- [ ] Subtask 5.5: 🔴 **添加 AI 透明度标注**（FR54）
  - 在分析结果页面显示"AI 分析结果"标签
  - 使用视觉徽章或图标明确标识
  - 移动端也要显示 AI 标注

### **Task 6: 集成进度反馈** (AC: 4) ⏱️ 1小时

- [ ] Subtask 6.1: 复用 ProgressDisplay 组件
  - 从 Story 2-4 导入: `src/features/analysis/components/ProgressDisplay/`
  - ⚡ **不要创建新组件**
- [ ] Subtask 6.2: 更新专业术语列表
  - 位置: `src/features/analysis/constants/analysis-terms.ts`
  - 添加: "正在分析光影特征...", "正在识别构图方法..." 等
- [ ] Subtask 6.3: 集成轮询机制
  - 复用: `src/lib/api/polling.ts`
  - 轮询间隔: 2 秒
  - 超时: 60 秒

### **Task 7: 编写单元测试和 E2E 测试** (AC: 1, 2, 3, 5) ⏱️ 2小时

- [ ] Subtask 7.1: 测试 Replicate Vision 客户端
  - Mock API 调用
  - 测试错误处理
- [ ] Subtask 7.2: 测试分析结果解析器
  - 测试有效响应解析
  - 测试无效响应处理
- [ ] Subtask 7.3: 测试 API 端点
  - POST /api/analysis
  - GET /api/analysis/[id]/status
  - POST /api/analysis/[id]/feedback
- [ ] Subtask 7.4: E2E 测试完整分析流程
  - 上传图片 → 分析 → 查看结果 → 提交反馈

---

## 🛠️ Dev Notes

### 🔴 Critical Architecture Requirements

1. **扩展现有文件**:
   - ⚡ 扩展 `src/lib/replicate/vision.ts`（已存在）
   - ⚡ 不要创建新的 vision 客户端

2. **数据库命名约定**:
   - TypeScript 层: camelCase（`userId`, `createdAt`）
   - 数据库列: snake_case（`user_id`, `created_at`）
   - ⚡ 参考 `images` 表的实现

3. **Credit 系统集成**:
   - 检查余额: `user.creditBalance >= 1`
   - 扣除 credit: `UPDATE user SET credit_balance = credit_balance - 1`
   - 记录交易: 插入到 `credit_transactions` 表（Epic 8）

4. **内容安全检查**:
   - 使用 `validateImageComplexity()` 函数（已存在）
   - 如果检测到不当内容，返回 400 错误

5. **使用 console 而非 logger**:
   - ⚡ 项目中没有统一的 logger 工具
   - 使用 `console.error()` 记录错误

---

### Dependencies

**依赖图:**
```
Epic 2 (图片上传) ✅ 已完成
  ├─ Story 2-1 (图片上传) ✅
  └─ Story 2-4 (进度反馈) ✅ → 复用组件
        ↓
Story 3-1 (风格分析) ← 当前
  ├─ 需要: images 表 ✅
  ├─ 需要: ProgressDisplay 组件 ✅
  ├─ 需要: useProgressStore ✅
  ├─ 需要: src/lib/replicate/vision.ts ✅
  └─ 需要: validateImageComplexity() ✅
        ↓
Story 3-2 (批量分析)
```

**依赖的外部服务:**
- Replicate API（视觉模型）
- PostgreSQL（数据存储）

**后续 Stories:**
- 3-2-batch-analysis: 批量分析（依赖本 Story）
- 3-4-vision-model-integration: 多模型支持（扩展本 Story）
- 3-5-confidence-scoring: 置信度优化（扩展本 Story）

---

### 📐 Database Schema

```typescript
// src/lib/db/schema.ts

export const analysisResults = pgTable('analysis_results', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  imageId: integer('image_id').notNull().references(() => images.id),
  analysisData: jsonb('analysis_data').notNull().$type<AnalysisData>(),
  confidenceScore: real('confidence_score').notNull(), // 整体置信度 0-1
  feedback: text('feedback'), // 'accurate' | 'inaccurate' | null
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AnalysisData = {
  dimensions: {
    lighting: StyleDimension;  // 光影
    composition: StyleDimension;  // 构图
    color: StyleDimension;  // 色彩
    artisticStyle: StyleDimension;  // 艺术风格
  };
  overallConfidence: number;  // 整体置信度
  modelUsed: string;  // 使用的模型
  analysisDuration: number;  // 分析耗时（秒）
};

export type StyleDimension = {
  name: string;  // 维度名称
  features: StyleFeature[];  // 特征列表
  confidence: number;  // 该维度的置信度
};

export type StyleFeature = {
  name: string;  // 特征名称
  value: string;  // 特征值
  confidence: number;  // 该特征的置信度
};
```

---

### 🎨 UX Requirements

**响应式设计断点:**
- **移动端 (< 768px)**: 单列布局，简化卡片
- **平板端 (768-1024px)**: 两列布局（2x2 网格）
- **桌面端 (≥ 1024px)**: 两列布局（2x2 网格）

**移动端优化细节:**
- 卡片间距: `spacing={1}` (8px)
- 字体大小: 标题 `h6`，正文 `body2`
- 隐藏次要信息：置信度分数可以用图标代替文字

**分析结果卡片结构** (参考实现见下方):
- 整体置信度徽章（带颜色）
- 四维度卡片（2x2 网格）
- 每个维度显示特征标签列表
- 用户反馈收集按钮
- 🔴 **AI 透明度标注**："AI 分析结果"徽章

---

### 🔧 API 端点设计

**POST /api/analysis**
```typescript
// 请求
{
  "imageId": 123
}

// 响应
{
  "success": true,
  "data": {
    "analysisId": 456,
    "status": "pending"
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Credit 不足，请升级订阅"
  }
}
```

**🔴 扩展 GET /api/analysis/[id]/status** (已存在)
```typescript
// 文件: src/app/api/analysis/[id]/status/route.ts
// 现有功能: 返回上传进度和分析状态
// ⚡ 需要扩展: 在 status === 'completed' 时返回分析结果

// 修改逻辑:
if (status === 'completed') {
  const analysisResult = await db
    .select()
    .from(analysisResults)
    .where(eq(analysisResults.imageId, imageId))
    .limit(1);

  return {
    success: true,
    data: {
      status: 'completed',
      progress: 100,
      result: analysisResult[0]?.analysisData
    }
  };
}
```

**POST /api/analysis/[id]/feedback**
```typescript
// 请求
{
  "feedback": "accurate"  // accurate | inaccurate
}

// 响应
{
  "success": true,
  "data": {
    "message": "感谢您的反馈！"
  }
}
```

---

### 🔧 Error Handling Scenarios

**错误处理场景:**
- **Rate Limiting (429)**: 等待 60 秒后重试
- **Model Not Found (404)**: 不重试，返回错误"模型暂时不可用"
- **Invalid Input (400)**: 不重试，返回错误"图片格式不支持"
- **Timeout**: 重试最多 3 次，使用指数退避
- **Network Error**: 重试最多 3 次，使用指数退避

**实现示例:**
```typescript
const MAX_RETRIES = 3;
const TIMEOUT = 60000; // 60 秒

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const output = await replicate.run(...);

    clearTimeout(timeoutId);
    return parseAnalysisResponse(output);
  } catch (error) {
    if (attempt === MAX_RETRIES) {
      console.error('Replicate Vision API failed after max retries', {
        error,
        imageUrl,
        attempts: attempt
      });
      throw new Error('分析失败，请稍后重试');
    }

    // 指数退避
    await new Promise(resolve =>
      setTimeout(resolve, Math.pow(2, attempt) * 1000)
    );
  }
}
```

---

### 📊 Performance Monitoring

**性能监控要求:**
- **关键指标**: 记录每次分析的实际耗时
- **日志记录**: 在 `analysis_results.analysis_duration` 字段中存储
- **告警阈值**: 如果分析耗时 > 90秒，记录警告日志
- **P95监控**: 使用 Vercel Analytics 或自定义指标监控 P95 响应时间
- **目标**: P95 < 60 秒（架构要求）

---

### 🧪 Test Data

**测试数据示例:**
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
    },
    "composition": {
      "name": "构图",
      "features": [
        {"name": "视角", "value": "平视", "confidence": 0.92},
        {"name": "画面平衡", "value": "对称构图", "confidence": 0.88}
      ],
      "confidence": 0.90
    },
    "color": {
      "name": "色彩",
      "features": [
        {"name": "主色调", "value": "暖色调", "confidence": 0.95},
        {"name": "色彩对比度", "value": "中等对比", "confidence": 0.82}
      ],
      "confidence": 0.88
    },
    "artisticStyle": {
      "name": "艺术风格",
      "features": [
        {"name": "风格流派", "value": "印象派", "confidence": 0.78},
        {"name": "艺术时期", "value": "现代", "confidence": 0.85}
      ],
      "confidence": 0.81
    }
  },
  "overallConfidence": 0.86,
  "modelUsed": "llava-13b",
  "analysisDuration": 45
}
```

---

### 🔧 Environment Variables

**需要配置的环境变量:**
```bash
# .env.local
REPLICATE_API_TOKEN=r8_xxx...  # Replicate API 密钥
REPLICATE_VISION_MODEL_ID=yorickvp/llava-13b:2facb4a274b3e660f8e3b2db36195b5e4f2b6b5e

# .env.example (添加示例)
REPLICATE_API_TOKEN=your-replicate-api-token
REPLICATE_VISION_MODEL_ID=your-vision-model-id
```

---

### 🔧 Replicate Vision Model Configuration

**推荐模型:**
- **主力模型**: `yorickvp/llava-13b:2facb4a274b3e660f8e3b2db36195b5e4f2b6b5e`
  - 开源，性价比高
  - 成本: 约 $0.002/次

- **备选模型**: `qwen/qwen-2-vl-7b-instruct:latest`
  - 已在项目中使用（Story 2-3）
  - 中文支持更好

**Prompt 模板:**
```typescript
const prompt = `Analyze the visual style of this image and extract the following four dimensions:

1. **Lighting & Shadow**: Identify the main light source direction, light-shadow contrast, shadow characteristics
2. **Composition**: Identify the viewpoint, visual balance, depth of field
3. **Color**: Identify the main color palette, color contrast, color temperature
4. **Artistic Style**: Identify the style movement, art period, emotional tone

For each dimension, provide 3-5 specific feature tags with confidence scores (0-1).

Return the result in JSON format:
{
  "dimensions": {
    "lighting": { "features": [...], "confidence": 0.XX },
    "composition": { "features": [...], "confidence": 0.XX },
    "color": { "features": [...], "confidence": 0.XX },
    "artisticStyle": { "features": [...], "confidence": 0.XX }
  },
  "overallConfidence": 0.XX
}`;
```

---

### 📚 Implementation Patterns

**状态管理模式:**
```typescript
// src/stores/useAnalysisStore.ts (新建)
import { create } from 'zustand';

interface AnalysisState {
  currentAnalysisId: number | null;
  analysisStatus: 'idle' | 'analyzing' | 'completed' | 'error';
  analysisResult: AnalysisData | null;

  setCurrentAnalysis: (id: number) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysisResult: (result: AnalysisData) => void;
  resetAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysisId: null,
  analysisStatus: 'idle',
  analysisResult: null,

  setCurrentAnalysis: (id) => set({ currentAnalysisId: id }),
  setAnalysisStatus: (status) => set({ analysisStatus: status }),
  setAnalysisResult: (result) => set({ analysisResult: result, analysisStatus: 'completed' }),
  resetAnalysis: () => set({
    currentAnalysisId: null,
    analysisStatus: 'idle',
    analysisResult: null
  }),
}));
```

**轮询模式（复用 Story 2-4）:**
```typescript
// 复用 src/lib/api/polling.ts
// 复用 src/features/analysis/components/ProgressDisplay/
```

---

### Testing Requirements

**单元测试:**
- Replicate Vision 客户端测试
- 分析结果解析器测试
- API 端点测试
- 置信度计算测试

**E2E 测试:**
- 完整分析流程：上传 → 分析 → 查看结果 → 提交反馈
- 低置信度处理流程
- 错误处理流程
- Credit 不足场景

**集成测试:**
- 数据库操作测试
- API 集成测试

---

### Previous Story Intelligence

**从 Epic 2 (Story 2-1 ~ 2-4) 学到的经验:**
- 进度反馈必须准确且及时（复用 Story 2-4 组件）
- 错误处理需要友好且可操作
- 移动端需要简化信息显示
- API 响应格式必须统一

**新增考虑:**
- Replicate API 可能有延迟，需要超时保护
- 模型返回的 JSON 可能格式不正确，需要严格验证
- 置信度可以帮助用户判断分析质量
- 用户反馈可以用于后续优化
- 🔴 **必须集成 Credit 系统**（避免无限使用）
- 🔴 **必须检查内容安全**（合规要求）
- 🔴 **必须标注 AI 透明度**（用户信任）

---

### References

- [Source: prd.md#FR13-18] (风格分析功能需求)
- [Source: prd.md#FR46] (Credit 扣除)
- [Source: prd.md#FR52] (内容安全检查)
- [Source: prd.md#FR54] (AI 透明度标注)
- [Source: prd.md#FR74, FR76] (用户反馈和置信度)
- [Source: architecture.md#Replicate-API] (Replicate 集成规范)
- [Source: architecture.md#Naming-Patterns] (命名规范)
- [Source: epics.md#Epic-3] (Epic 3 完整需求)
- [Source: Story 2-4] (进度反馈组件参考)
- [Source: src/lib/replicate/vision.ts] (现有 Vision 客户端)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
