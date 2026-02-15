# Story 3.5: confidence-scoring

Status: ready-for-dev

---

## Story

作为一名 **AI 创作者或普通用户**,
我希望 **能够了解分析结果的置信度并在低置信度时获得警告和重试选项**,
以便 **对分析结果有更清晰的认知，并在需要时获得更可靠的分析结果**。

---

## Acceptance Criteria

1. **[AC-1]** 系统可以为每个分析维度返回置信度分数
   - 置信度范围：0-100%
   - 四个维度（光影、构图、色彩、艺术风格）各有独立置信度
   - 整体置信度取各维度平均值

2. **[AC-2]** 系统可以在检测到低置信度分析时主动警告用户
   - 当任一维度置信度 < 60% 时显示警告
   - 当整体置信度 < 70% 时显示建议重试提示
   - 警告信息清晰说明哪些维度需要关注

3. **[AC-3]** 用户可以选择重新分析以获得更高置信度结果
   - 提供"重新分析"按钮
   - 重新分析不额外扣除 credit（因系统原因导致低置信度）
   - 记录重试次数用于优化

4. **[AC-4]** 系统可以根据模型选择提供差异化的置信度阈值
   - 高准确性模型（gemini-flash）：更严格的阈值
   - 快速模型（qwen3-vl）：相对宽松的阈值
   - 阈值可通过配置调整

5. **[AC-5]** 系统可以记录置信度数据用于持续优化
   - 记录每次分析的置信度分数
   - 统计低置信度分析的比例
   - 用于后续模型优化和产品改进

6. **[AC-6]** 用户可以查看置信度评分说明
   - 提供置信度含义的解释
   - 说明不同分数范围代表的质量等级
   - 帮助用户理解结果可靠性

---

## Tasks / Subtasks

### **Task 1: 扩展分析结果数据结构支持置信度** (AC: 1, 5) ⏱️ 2小时

- [ ] Subtask 1.1: 定义置信度数据结构
  - 位置: `src/lib/analysis/types.ts`（新建）
  - 接口: `ConfidenceScores`, `DimensionConfidence`
  - 字段: overall, lighting, composition, color, style
- [ ] Subtask 1.2: 扩展 analysis_results 表添加置信度字段
  - 位置: `src/lib/db/schema.ts`
  - 添加字段: confidence_scores (JSON)
- [ ] Subtask 1.3: 创建置信度计算函数
  - 位置: `src/lib/analysis/confidence.ts`（新建）
  - 实现: calculateConfidence(), aggregateConfidence()

### **Task 2: 集成视觉模型置信度输出** (AC: 1) ⏱️ 2小时

- [ ] Subtask 2.1: 修改 Replicate 客户端解析置信度
  - 位置: `src/lib/replicate/vision.ts` (现有文件)
  - 复用 `analyzeImageStyle` 函数 (第193-296行)
  - 从返回的 `AnalysisData` 中提取置信度
- [ ] Subtask 2.2: 实现多模型置信度适配
  - 不同模型可能以不同格式返回置信度
  - 统一转换为标准格式 (见下方置信度解析策略)
- [ ] Subtask 2.3: 添加置信度测试用例
  - 测试不同模型的置信度解析
  - 测试置信度聚合计算

### **Task 3: 实现低置信度警告系统** (AC: 2, 3) ⏱️ 2小时

- [ ] Subtask 3.1: 创建置信度警告逻辑
  - 位置: `src/lib/analysis/confidence.ts`
  - 实现: checkLowConfidence(), generateWarning()
- [ ] Subtask 3.2: 创建置信度警告 UI 组件
  - 位置: `src/features/analysis/components/ConfidenceWarning/`（新建）
  - 组件: `ConfidenceBadge`, `ConfidenceWarning`, `RetryButton`
  - 显示各维度置信度可视化
- [ ] Subtask 3.3: 实现重试功能
  - 复用现有分析 API (`src/lib/replicate/vision.ts:analyzeImageStyle`)
  - 不扣除额外 credit
  - 记录重试次数
- [ ] Subtask 3.4: 实现重试防抖 (防止连续点击)
  - 客户端: 3秒防抖
  - 服务端: 幂等性保护
  - 位置: `src/lib/analysis/retry.ts`（新建）

### **Task 4: 实现置信度阈值配置系统** (AC: 4, Standard用户扩展) ⏱️ 1小时

- [ ] Subtask 4.1: 定义置信度阈值配置
  - 位置: `src/lib/analysis/config.ts`
  - 实现: `CONFIDENCE_THRESHOLDS` 配置
- [ ] Subtask 4.2: 根据模型调整阈值
  - 不同模型有不同的准确性特性
  - 动态调整阈值策略
- [ ] Subtask 4.3: Standard 用户扩展维度置信度 (Epic 3 FR81)
  - 添加 `emotionalTone` (情感基调) 维度
  - 添加 `artisticPeriod` (艺术时期) 维度
  - 仅 Standard 用户可见

### **Task 5: 创建置信度说明 UI** (AC: 6) ⏱️ 1小时

- [ ] Subtask 5.1: 创建置信度解释组件
  - 位置: `src/components/shared/ConfidenceExplanation/`（新建）
  - 显示置信度等级说明
  - 提供分数范围解释
- [ ] Subtask 5.2: 在分析结果页面集成说明
  - 悬停显示详情
  - 链接到帮助文档

### **Task 6: 实现置信度数据记录与统计** (AC: 5) ⏱️ 2小时

- [ ] Subtask 6.1: 创建置信度日志记录
  - 记录每次分析的置信度数据
  - 记录低置信度触发次数
- [ ] Subtask 6.2: 创建置信度统计 API
  - GET `/api/analysis/confidence-stats` - 获取置信度统计
  - 支持按时间范围筛选
- [ ] Subtask 6.3: 创建管理员置信度仪表板
  - 显示低置信度比例趋势
  - 按模型维度分析

### **Task 7: 编写单元测试和 E2E 测试** (AC: 1, 2, 3) ⏱️ 2小时

- [ ] Subtask 7.1: 测试置信度计算
  - 置信度聚合测试
  - 边界条件测试
- [ ] Subtask 7.2: 测试警告逻辑
  - 不同阈值触发测试
  - 多维度组合测试
- [ ] Subtask 7.3: E2E 测试
  - 完整分析流程置信度显示
  - 低置信度警告显示测试
  - 重试功能测试

---

## Dev Notes

### Critical Architecture Requirements

1. **复用现有代码** (⚠️ 必须遵守):
   - ⚡ 复用 `src/lib/replicate/vision.ts`（现有，第193-296行 `analyzeImageStyle` 函数）
   - ⚡ 复用 `src/lib/analysis/models.ts` (Story 3-4 创建的模型注册表)
   - ⚡ 复用 Story 3-1 的分析逻辑
   - ⚡ 复用 Story 3-4 的模型选择功能
   - ⚡ **禁止创建新文件来替代现有功能**，只能在现有文件中扩展

2. **置信度解析策略** (必须实现):
   ```typescript
   // 位置: src/lib/analysis/confidence.ts (新建)
   import type { AnalysisData } from '@/types/analysis';

   // 从 AnalysisData 提取置信度
   export function extractConfidenceFromAnalysisData(data: AnalysisData): ConfidenceScores {
     const dims = data.dimensions;
     return {
       overall: Math.round(data.overallConfidence * 100),
       lighting: Math.round((dims.lighting?.confidence || 0) * 100),
       composition: Math.round((dims.composition?.confidence || 0) * 100),
       color: Math.round((dims.color?.confidence || 0) * 100),
       style: Math.round((dims.artisticStyle?.confidence || 0) * 100),
     };
   }

   // 置信度解析降级策略
   const CONFIDENCE_PARSING_STRATEGY = {
     // 策略1: 从 features 数组聚合 (主要方式)
     aggregate: (dimension: DimensionData): number => {
       const features = dimension.features || [];
       if (features.length === 0) return 40; // 无特征，低置信度
       const sum = features.reduce((acc, f) => acc + (f.confidence || 0), 0);
       return Math.round((sum / features.length) * 100);
     },

     // 策略2: 直接使用 confidence 字段
     direct: (dimension: DimensionData): number => {
       return Math.round((dimension.confidence || 0.5) * 100);
     },

     // 策略3: 基于响应完整度估算 (备用)
     estimate: (data: Partial<AnalysisData>): number => {
       const hasAllDimensions = Object.keys(data.dimensions || {}).length >= 4;
       const hasFeatures = Object.values(data.dimensions || {}).every(
         d => d.features && d.features.length > 0
       );
       return hasAllDimensions && hasFeatures ? 75 : 40;
     }
   };
   ```

3. **置信度数据结构**:
   ```typescript
   // 置信度数据结构
   interface ConfidenceScores {
     overall: number;        // 整体置信度 0-100
     lighting: number;       // 光影维度 0-100
     composition: number;    // 构图维度 0-100
     color: number;          // 色彩维度 0-100
     style: number;          // 艺术风格维度 0-100
   }

   // 置信度等级
   type ConfidenceLevel = 'high' | 'medium' | 'low';

   // 警告信息
   interface ConfidenceWarning {
     level: ConfidenceLevel;
     message: string;
     affectedDimensions: string[];
     suggestedAction: 'retry' | 'review' | 'continue';
   }
   ```

3. **置信度阈值配置**:
   ```typescript
   const CONFIDENCE_THRESHOLDS = {
     high: 80,    // >= 80% 高置信度
     medium: 60, // >= 60% 中等置信度
     low: 40,    // >= 40% 低置信度
     critical: 20 // < 20% 极低置信度
   };

   // 按模型的阈值调整
   const MODEL_THRESHOLD_MODIFIERS = {
     'gemini-flash': -5,  // 更严格
     'kimi-k2.5': 0,      // 标准
     'qwen3-vl': 5,       // 更宽松
   };
   ```

4. **数据库 Schema**:
   ```typescript
   // src/lib/db/schema.ts

   // 扩展 analysis_results 表
   export const analysisResults = pgTable('analysis_results', {
     // ... 现有字段
     confidenceScores: jsonb('confidence_scores'), // ConfidenceScores
     retryCount: integer('retry_count').default(0), // 重试次数
   });

   // ⚠️ 复用 Story 3-4 的 model_usage_stats 表，避免重复创建
   // 置信度日志表（新建）- 关联到 model_usage_stats
   export const confidenceLogs = pgTable('confidence_logs', {
     id: serial('id').primaryKey(),
     analysisId: integer('analysis_id').references(() => analysisResults.id),
     modelUsageStatId: integer('model_usage_stat_id').references(() => modelUsageStats.id), // 关联到 Story 3-4 的表
     confidenceScores: jsonb('confidence_scores').notNull(),
     isLowConfidence: boolean('is_low_confidence').notNull(),
     triggeredWarning: boolean('triggered_warning').notNull(),
     createdAt: timestamp('created_at').defaultNow().notNull(),
   });
   ```

5. **Standard 用户扩展维度支持** (AC-4):
   ```typescript
   // 扩展置信度结构支持 Standard 用户额外维度
   interface ExtendedConfidenceScores extends ConfidenceScores {
     // Standard 用户专属维度
     emotionalTone?: number;    // 情感基调 0-100
     artisticPeriod?: number;  // 艺术时期 0-100
   }

   // 检查用户订阅等级决定返回的置信度维度
   export function getConfidenceForTier(
     scores: ExtendedConfidenceScores,
     tier: 'free' | 'lite' | 'standard'
   ): ConfidenceScores | ExtendedConfidenceScores {
     if (tier === 'standard') {
       return scores; // 返回完整维度
     }
     // Free/Lite 用户只返回基础4维
     const { emotionalTone, artisticPeriod, ...base } = scores;
     return base;
   }
   ```

6. **重试防抖设计** (AC-3):
   ```typescript
   // 客户端防抖 - 防止连续点击
   const RETRY_DEBOUNCE_MS = 3000; // 3秒内只能重试一次

   // 服务端幂等性保护
   export async function retryAnalysis(
     originalAnalysisId: number,
     userId: string
   ): Promise<{ newAnalysisId: number; isIdempotent: boolean }> {
     // 检查是否在3秒内重复请求
     const recentRetry = await db.query.confidenceLogs.findFirst({
       where: and(
         eq(confidenceLogs.analysisId, originalAnalysisId),
         gte(confidenceLogs.createdAt, new Date(Date.now() - RETRY_DEBOUNCE_MS))
       ),
     });

     if (recentRetry 返回) {
       //已有结果，不创建新记录
       return { newAnalysisId: originalAnalysisId, isIdempotent: true };
     }

     // 执行新的重试分析
     // ... 重试逻辑
   }
   ```

7. **不扣除 Credit 的场景**:
   - 系统原因导致的低置信度（模型返回结果不完整）
   - 用户选择重试分析
   - 批量分析中部分图片低置信度

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
  ├─ Story 3-1 (风格分析) ✅
  ├─ Story 3-2 (批量分析) ✅
  ├─ Story 3-3 (分析进度) ✅
  ├─ Story 3-4 (模型集成) ✅
  └─ Story 3-5 (置信度评分) ← 当前

后续 Stories:
└─ Epic 4 (内容安全) - 可并行
```

**依赖的外部服务:**

- Replicate API（视觉模型）
- PostgreSQL（数据存储）

**依赖的已完成 Stories:**

- Story 3-1: 风格分析基础逻辑
- Story 3-2: 批量分析功能
- Story 3-3: 队列和进度系统
- Story 3-4: 视觉模型集成

---

### UX Requirements

**置信度显示 UI:**

- 四个维度使用进度条显示置信度
- 颜色编码：
  - 绿色 (>= 80%): 高置信度
  - 黄色 (60-79%): 中等置信度
  - 红色 (< 60%): 低置信度
- 整体置信度使用大字体突出显示
- **Standard 用户额外显示**: 情感基调、艺术时期两个扩展维度 (Epic 3 FR81)

**低置信度警告:**

- 警告徽章显示在分析结果顶部
- 列出受影响的维度
- 提供"重新分析"按钮（带3秒防抖）
- 可展开查看详细说明

**置信度解释 Tooltip:**

- 悬停显示置信度含义
- 说明分数范围代表的质量
- 提供改进建议

---

### API 端点设计

**POST /api/analysis** (扩展)

```typescript
// 响应扩展
{
  "success": true,
  "data": {
    "analysisId": 456,
    "status": "completed",
    "confidenceScores": {
      "overall": 85,
      "lighting": 90,
      "composition": 82,
      "color": 78,
      "style": 88
    },
    "lowConfidenceWarning": null  // 无警告
  }
}

// 低置信度响应
{
  "success": true,
  "data": {
    "analysisId": 457,
    "status": "completed",
    "confidenceScores": {
      "overall": 55,
      "lighting": 72,
      "composition": 45,
      "color": 38,
      "style": 52
    },
    "lowConfidenceWarning": {
      "level": "low",
      "message": "部分维度分析置信度较低，建议重新分析",
      "affectedDimensions": ["composition", "color", "style"],
      "suggestedAction": "retry"
    }
  }
}
```

**POST /api/analysis/retry** (重试分析)

```typescript
// 请求
{
  "analysisId": 457
}

// 响应
{
  "success": true,
  "data": {
    "newAnalysisId": 458,
    "message": "重新分析完成，不扣除 credit"
  }
}
```

**GET /api/analysis/confidence-stats**

```typescript
// 响应
{
  "success": true,
  "data": {
    "totalAnalyses": 1000,
    "averageConfidence": 78.5,
    "lowConfidenceRate": 0.12,
    "byModel": {
      "qwen3-vl": { "avgConfidence": 75, "lowRate": 0.15 },
      "kimi-k2.5": { "avgConfidence": 82, "lowRate": 0.08 }
    }
  }
}
```

---

### Database Migration (Drizzle)

```bash
npm run db:generate
npm run db:migrate
```

> ⚠️ **注意**: `model_usage_stats` 表已在 Story 3-4 中创建，**不要重复创建**。只需添加关联字段。

```sql
-- 扩展 analysis_results 表
ALTER TABLE analysis_results ADD COLUMN confidence_scores JSONB;
ALTER TABLE analysis_results ADD COLUMN retry_count INTEGER DEFAULT 0;

-- ⚠️ 检查 model_usage_stats 是否已存在 (Story 3-4)
-- 如果不存在才创建:
-- CREATE TABLE model_usage_stats (...); -- 已在 Story 3-4 实现

-- 创建置信度日志表 (关联到 model_usage_stats)
CREATE TABLE confidence_logs (
  id SERIAL PRIMARY KEY,
  analysis_id INTEGER REFERENCES analysis_results(id),
  model_usage_stat_id INTEGER REFERENCES model_usage_stats(id), -- 关联 Story 3-4 的表
  confidence_scores JSONB NOT NULL,
  is_low_confidence BOOLEAN NOT NULL,
  triggered_warning BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_confidence_logs_created ON confidence_logs(created_at);
CREATE INDEX idx_confidence_logs_low ON confidence_logs(is_low_confidence);
CREATE INDEX idx_confidence_logs_model ON confidence_logs(model_usage_stat_id);
```

---

### Testing Requirements

**单元测试:**

- 置信度计算测试
- 阈值判断测试
- 警告生成测试

**E2E 测试:**

- 完整分析流程置信度显示
- 低置信度警告显示
- 重试功能

**集成测试:**

- 多模型置信度解析
- 数据库记录

---

### Previous Story Intelligence

**从 Story 3-4 学到的经验:**

- 多模型集成已完成
- 模型选择器组件已存在
- 订阅等级控制已实现（占位符）
- 模型配置系统已建立
- 扩展 `src/lib/replicate/vision.ts` 而非创建新文件

**本 Story 扩展:**

- 在 vision.ts 中添加置信度解析逻辑
- 复用 ModelSelector 组件
- 复用批量分析逻辑
- 扩展分析结果 API

---

### References

- [Source: epics.md#FR76] (置信度警告和重试选项)
- [Source: epics.md#Epic-3] (Epic 3 完整需求)
- [Source: Story 3-1] (风格分析实现参考)
- [Source: Story 3-2] (批量分析实现参考)
- [Source: Story 3-3] (队列管理实现参考)
- [Source: Story 3-4] (视觉模型集成参考)
- [Source: src/lib/replicate/vision.ts] (现有 Vision 客户端)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
