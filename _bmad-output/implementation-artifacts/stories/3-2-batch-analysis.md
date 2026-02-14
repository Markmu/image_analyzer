# Story 3.2: batch-analysis

Status: ready-for-dev

---

## 📋 Story

作为一名 **AI 创作者或普通用户**,
我希望 **批量上传同风格的多张图片进行综合分析**,
以便 **提取这些图片的共同特征，获得更准确和全面的风格分析结果**。

---

## ✅ Acceptance Criteria

1. **[AC-1]** 系统可以接受批量图片上传（最多 5 张）
   - 复用 Story 2-2 批量上传组件
   - 显示批量选择器 UI
   - 支持图片排序/移除操作

2. **[AC-2]** 系统可以对批量图片进行串行或并行分析
   - 复用 Story 3-1 的单图分析逻辑
   - 支持串行分析（逐张分析）
   - 支持并行分析（同时分析多张）
   - 串行模式：节省 API 配额，适合复杂图片
   - 并行模式：速度快，适合简单图片

3. **[AC-3]** 系统可以提取多张图片的共同特征
   - 对每张图片单独分析获得四维度数据
   - 算法提取共同特征（多张图片都有的特征）
   - 算法识别独特特征（仅部分图片有的特征）
   - 生成综合分析结果

4. **[AC-4]** 系统可以显示批量分析的实时进度
   - 显示整体进度（已完成/总数）
   - 显示当前分析的图片序号
   - 显示"正在分析第 X 张图片..."
   - 显示预计剩余时间
   - 复用 Story 2-4 的 ProgressDisplay 组件

5. **[AC-5]** 系统可以在批量分析完成后显示对比视图
   - 显示每张图片的单独分析结果
   - 突出显示共同特征
   - 突出显示独特特征
   - 提供综合分析结果卡片

6. **[AC-6]** 🔴 **Credit 系统集成**（PRD FR46）
   - 批量分析按实际分析的图片数量扣除 credit
   - 每张图片分析扣除 1 credit
   - 如果 credit 不足，停止分析并提示用户
   - 已分析的图片结果保留

7. **[AC-7]** 🔴 **内容安全检查**（PRD FR52）
   - 每张上传的图片都需要内容安全检查
   - 如果某张图片检测到不当内容，跳过该图片分析
   - 记录审核日志
   - 告知用户哪些图片未能通过审核

8. **[AC-8]** 系统可以处理批量分析中的错误
   - 单张图片分析失败不影响其他图片
   - 显示哪些图片分析成功/失败
   - 提供"重试失败图片"选项
   - 错误信息友好且可操作

---

## 📦 Tasks / Subtasks

### **Task 1: 扩展批量上传组件** (AC: 1) ⏱️ 1小时

- [ ] Subtask 1.1: 扩展现有的批量上传组件
  - 位置: `src/features/analysis/components/ImageUploader/`
  - ⚡ **不要创建新组件**，复用 Story 2-2 组件
  - 添加批量选择模式切换
- [ ] Subtask 1.2: 实现图片排序和移除功能
  - 支持拖拽排序
  - 支持移除单张图片
  - 显示缩略图预览
- [ ] Subtask 1.3: 验证批量上传限制
  - 最多 5 张图片
  - 图片格式验证（复用 Story 2-3）

### **Task 2: 创建批量分析服务** (AC: 2, 8) ⏱️ 2小时

- [ ] Subtask 2.1: 创建批量分析服务
  - 位置: `src/lib/analysis/batch.ts`（新建）
  - 函数: `analyzeBatch(imageUrls: string[], mode: 'serial' | 'parallel')`
- [ ] Subtask 2.2: 实现串行分析模式
  - 逐张调用 Story 3-1 的分析函数
  - 每张分析完成后保存结果
  - 支持中断和恢复
- [ ] Subtask 2.3: 实现并行分析模式
  - 使用 Promise.all 并行调用分析函数
  - 设置并发限制（最多 3 个）
  - 错误处理：单点失败不影响整体
- [ ] Subtask 2.4: 实现错误处理和重试
  - 记录失败的分析
  - 提供重试接口

### **Task 3: 实现共同特征提取算法** (AC: 3) ⏱️ 2小时

- [ ] Subtask 3.1: 设计特征对比算法
  - 位置: `src/lib/analysis/feature-extraction.ts`（新建）
  - 算法: 特征匹配度计算
- [ ] Subtask 3.2: 识别共同特征
  - 找出多张图片共同拥有的特征
  - 计算共同特征的置信度（取平均值或最高值）
- [ ] Subtask 3.3: 识别独特特征
  - 找出仅部分图片拥有的特征
  - 标注来源图片
- [ ] Subtask 3.4: 生成综合分析结果
  - 合并四维度数据
  - 标注共同特征和独特特征
  - 生成最终置信度

### **Task 4: 创建批量分析 API 端点** (AC: 2, 6, 7) ⏱️ 2小时

- [ ] Subtask 4.1: POST `/api/analysis/batch` - 发起批量分析
  - 输入: { imageIds: number[], mode: 'serial' | 'parallel' }
  - 输出: { batchId, status, progress }
  - 🔴 **检查 credit 余额**（总credit >= 图片数量）
  - 🔴 **内容安全检查**（每张图片）
  - 触发后台批量分析任务
- [ ] Subtask 4.2: GET `/api/analysis/batch/[id]/status` - 查询批量分析状态
  - 返回: status, progress, currentIndex, results[], errors[]
- [ ] Subtask 4.3: POST `/api/analysis/batch/[id]/retry` - 重试失败的分析
  - 输入: { failedImageIds: number[] }
  - 继续批量分析流程

### **Task 5: 实现批量分析前端 UI** (AC: 4, 5) ⏱️ 3小时

- [ ] Subtask 5.1: 创建批量分析进度组件
  - 位置: `src/features/analysis/components/BatchAnalysisProgress/`
  - 显示整体进度条
  - 显示当前分析序号
  - 显示预计剩余时间
  - ⚡ **复用 ProgressDisplay 组件**（Story 2-4）
- [ ] Subtask 5.2: 创建批量分析结果对比视图
  - 位置: `src/features/analysis/components/BatchAnalysisResult/`
  - 组件: `BatchResultCard`, `ImageComparisonGrid`, `CommonFeatureBadge`
- [ ] Subtask 5.3: 实现共同特征高亮显示
  - 绿色边框标注共同特征
  - 蓝色边框标注独特特征
  - 显示特征来源
- [ ] Subtask 5.4: 实现错误处理 UI
  - 显示失败图片列表
  - 提供"重试"按钮
  - 友好的错误提示

### **Task 6: 集成 Credit 扣除逻辑** (AC: 6) ⏱️ 1小时

- [ ] Subtask 6.1: 预扣 credit
  - 批量分析开始前预扣 totalImages * 1 credit
  - 如果预扣失败，拒绝分析
- [ ] Subtask 6.2: 动态调整 credit
  - 如果部分图片分析失败，退还相应 credit
  - 如果用户中断分析，按已完成数量扣除
- [ ] Subtask 6.3: 记录 credit 交易历史
  - 记录每笔扣费详情

### **Task 7: 编写单元测试和 E2E 测试** (AC: 2, 3, 8) ⏱️ 2小时

- [ ] Subtask 7.1: 测试批量分析服务
  - 串行模式测试
  - 并行模式测试
  - 错误处理测试
- [ ] Subtask 7.2: 测试特征提取算法
  - 共同特征识别测试
  - 独特特征识别测试
  - 边界情况测试
- [ ] Subtask 7.3: 测试 API 端点
  - POST /api/analysis/batch
  - GET /api/analysis/batch/[id]/status
  - POST /api/analysis/batch/[id]/retry
- [ ] Subtask 7.4: E2E 测试完整批量分析流程
  - 上传多张图片 → 批量分析 → 查看对比结果

---

## 🛠️ Dev Notes

### 🔴 Critical Architecture Requirements

1. **复用现有组件**:
   - ⚡ 使用 Story 2-2 的批量上传组件
   - ⚡ 使用 Story 2-4 的 ProgressDisplay 组件
   - ⚡ 复用 Story 3-1 的单图分析逻辑

2. **Credit 系统集成**:
   - 预扣模式：分析开始前扣除所有 credit
   - 动态调整：失败/中断时退还多余 credit
   - 计算公式: `requiredCredits = imageIds.length`

3. **错误处理原则**:
   - 单张图片失败不影响其他图片
   - 提供部分结果展示
   - 支持重试失败图片

4. **使用 console 而非 logger**:
   - ⚡ 项目中没有统一的 logger 工具
   - 使用 `console.error()` 记录错误

---

### Dependencies

**依赖图:**
```
Epic 2 (图片上传) ✅ 已完成
  ├─ Story 2-1 (图片上传) ✅
  ├─ Story 2-2 (批量上传) ✅ → 复用组件
  ├─ Story 2-3 (上传验证) ✅
  └─ Story 2-4 (进度反馈) ✅ → 复用组件
        ↓
Epic 3 (AI 风格分析)
  ├─ Story 3-1 (风格分析) ✅ → 复用分析逻辑
  └─ Story 3-2 (批量分析) ← 当前
        ↓
  后续 Stories 依赖:
  ├─ Story 3-3 (分析进度) → 本 Story 扩展
  ├─ Story 3-4 (视觉模型集成) → 本 Story 扩展
  └─ Story 3-5 (置信度评分) → 本 Story 扩展
```

**依赖的外部服务:**
- Replicate API（视觉模型）
- PostgreSQL（数据存储）

---

### 📐 Database Schema

```typescript
// src/lib/db/schema.ts 扩展

// 批量分析记录表（新建）
export const batchAnalysisResults = pgTable('batch_analysis_results', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  mode: text('mode').notNull(), // 'serial' | 'parallel'
  totalImages: integer('total_images').notNull(),
  completedImages: integer('completed_images').notNull().default(0),
  failedImages: integer('failed_images').notNull().default(0),
  status: text('status').notNull(), // 'pending' | 'processing' | 'completed' | 'partial' | 'failed'
  creditUsed: integer('credit_used').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// 单张分析结果关联（扩展现有表）
// analysisResults.batchId -> batchAnalysisResults.id
```

---

### 🎨 UX Requirements

**批量分析进度显示:**
- 整体进度条：已分析/总数
- 当前图片序号显示
- 预计剩余时间（基于平均分析时间）
- 取消按钮

**批量分析结果对比视图:**
- 每张图片的分析结果卡片
- 共同特征区域（绿色高亮）
- 独特特征区域（蓝色高亮）
- 综合分析结果卡片

**移动端适配:**
- 简化进度显示
- 单列布局显示对比结果
- 隐藏次要信息

---

### 🔧 API 端点设计

**POST /api/analysis/batch**
```typescript
// 请求
{
  "imageIds": [1, 2, 3],
  "mode": "serial" // serial | parallel
}

// 响应
{
  "success": true,
  "data": {
    "batchId": 100,
    "status": "pending",
    "creditRequired": 3
  }
}

// 错误响应 - Credit 不足
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "需要 3 credit，当前余额不足"
  }
}
```

**GET /api/analysis/batch/[id]/status**
```typescript
// 响应
{
  "success": true,
  "data": {
    "batchId": 100,
    "status": "processing", // pending | processing | completed | partial | failed
    "progress": {
      "total": 3,
      "completed": 1,
      "failed": 0,
      "currentIndex": 2
    },
    "results": [
      {
        "imageId": 1,
        "status": "completed",
        "analysisData": { ... }
      }
    ],
    "errors": []
  }
}
```

**POST /api/analysis/batch/[id]/retry**
```typescript
// 请求
{
  "failedImageIds": [2]
}

// 响应
{
  "success": true,
  "data": {
    "message": "已重试失败的分析"
  }
}
```

---

### 🔧 Feature Extraction Algorithm

**共同特征识别算法:**
```typescript
interface FeatureComparison {
  dimension: string;      // e.g., "lighting"
  commonFeatures: Feature[];  // 所有图片都有的特征
  uniqueFeatures: Feature[][];  // 每张图片独有的特征
}

function extractCommonFeatures(results: AnalysisData[]): FeatureComparison[] {
  // 1. 提取每个维度的所有特征
  const allFeaturesByDimension = results.map(r => r.dimensions);

  // 2. 找出共同特征（出现在所有图片中）
  const commonFeatures = findIntersection(allFeaturesByDimension);

  // 3. 找出独特特征（仅出现在部分图片中）
  const uniqueFeatures = findUnique(allFeaturesByDimension);

  // 4. 计算置信度
  return {
    commonFeatures: avgConfidence(commonFeatures),
    uniqueFeatures: uniqueFeatures
  };
}
```

---

### 📊 Performance Monitoring

**性能监控要求:**
- 记录批量分析的总耗时
- 记录单张图片平均分析时间
- 记录并行模式 vs 串行模式的性能差异
- 监控 API 配额使用情况

**告警阈值:**
- 单张图片分析 > 90秒
- 批量分析总耗时 > 5分钟
- 失败率 > 20%

---

### 🧪 Test Data

**测试批量分析:**
```typescript
const testImages = [
  'https://example.com/photo1.jpg',
  'https://example.com/photo2.jpg',
  'https://example.com/photo3.jpg',
];

// 期望：提取共同特征如 "暖色调", "自然光"
// 期望：识别独特特征如 "长曝光"(仅photo2)
```

---

### 🔧 Environment Variables

**无需新增环境变量** - 复用 Story 3-1 的配置:
```bash
# 已有配置（Story 3-1）
REPLICATE_API_TOKEN=r8_xxx...
REPLICATE_VISION_MODEL_ID=yorickvp/llava-13b:xxx
```

---

### Testing Requirements

**单元测试:**
- 批量分析服务测试（串行/并行）
- 特征提取算法测试
- API 端点测试
- Credit 扣除逻辑测试

**E2E 测试:**
- 完整批量分析流程：上传 → 分析 → 查看结果
- Credit 不足场景
- 错误处理和重试流程

**集成测试:**
- 批量分析与 Credit 系统集成
- 批量分析与内容安全集成

---

### Previous Story Intelligence

**从 Story 3-1 学到的经验:**
- Replicate API 可能有延迟，需要超时保护
- 必须集成 Credit 系统（避免无限使用）
- 必须检查内容安全（合规要求）
- 必须标注 AI 透明度
- 进度反馈必须准确且及时

**从 Epic 2 学到的经验:**
- 复用现有组件可以大幅减少开发时间
- 进度反馈组件设计良好，直接复用
- 批量上传功能完整，可直接扩展

**新增考虑:**
- 批量分析需要处理部分失败场景
- Credit 预扣和动态调整逻辑复杂
- 特征提取算法需要验证准确性
- 对比视图需要良好的 UX 设计

---

### References

- [Source: prd.md#FR14] (批量综合分析)
- [Source: prd.md#FR67] (批量分析进度显示)
- [Source: prd.md#FR46] (Credit 扣除)
- [Source: prd.md#FR52] (内容安全检查)
- [Source: architecture.md#API-Communication] (API 设计规范)
- [Source: architecture.md#Naming-Patterns] (命名规范)
- [Source: epics.md#Epic-3] (Epic 3 完整需求)
- [Source: Story 3-1] (单图分析实现参考)
- [Source: Story 2-2] (批量上传组件)
- [Source: Story 2-4] (进度反馈组件)
- [Source: src/lib/replicate/vision.ts] (现有 Vision 客户端)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
