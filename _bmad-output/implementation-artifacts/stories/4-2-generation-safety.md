# Story 4.2: generation-safety

Status: done

---

## Story

作为一名 **AI 创作者或普通用户**,
我希望 **在使用模板生成图片时，生成的提示词和图片都经过安全审核，确保不会产生不当内容**,
以便 **安全地使用 AI 生成功能，避免产生有害或不合规的内容**。

---

## Acceptance Criteria

1. **[AC-1]** 系统可以在生成提示词前进行文本内容审核 (FR53)
   - 检测提示词中的敏感词汇和不当内容
   - 审核维度：暴力、色情、仇恨言论、非法内容等
   - 审核不通过时阻止生成并显示友好的修改建议
   - 记录审核日志

2. **[AC-2]** 系统可以在生成图片后进行内容审核 (FR52 扩展)
   - 使用 AI 视觉模型检测生成的图片
   - 审核维度：暴力、色情、仇恨符号等
   - 检测到不当内容时自动删除并通知用户
   - 记录审核日志

3. **[AC-3]** 系统可以为生成请求添加安全约束 (FR53)
   - 在提示词中自动添加安全约束（negative prompt）
   - 防止生成特定类型的内容
   - 安全约束可配置

4. **[AC-4]** 系统可以处理生成内容审核失败的情况 (FR53)
   - 友好的错误提示（不使用技术术语）
   - 提供具体的修改建议
   - 允许用户修改提示词后重试
   - 不扣除 credit（系统原因导致失败）

5. **[AC-5]** 系统可以在 UI 上显示生成内容的审核状态
   - 显示"正在审核内容..."进度
   - 审核通过显示安全徽章
   - 审核失败显示详细原因
   - 审核历史记录可查看

6. **[AC-6]** 系统可以对高风险生成请求进行人工审核标记
   - 识别高风险用户或请求模式
   - 自动标记需要人工审核
   - 管理员审核界面
   - 审核通过后才执行生成

---

## Tasks / Subtasks

### **Task 1: 扩展内容审核服务** (AC: 1, 2) ⏱️ 2小时

- [ ] Subtask 1.1: 创建生成内容审核服务
  - 位置: `src/lib/moderation/generation-moderation.ts`（新建）
  - 实现 `moderatePrompt` 函数（提示词审核）
  - 实现 `moderateGeneratedImage` 函数（图片审核）
  - 复用 Story 4-1 的 `ModerationResult` 类型
- [ ] Subtask 1.2: 扩展文本审核服务
  - 位置: `src/lib/moderation/text-moderation.ts`（扩展 Story 4-1）
  - 添加生成提示词专用审核逻辑
  - 支持更严格的审核标准
- [ ] Subtask 1.3: 扩展图片审核服务
  - 位置: `src/lib/moderation/image-moderation.ts`（扩展 Story 4-1）
  - 添加生成图片审核逻辑
  - 复用 `moderateImage` 函数
- [ ] Subtask 1.4: 创建审核失败处理逻辑
  - 自动删除审核失败的生成图片
  - 记录详细日志
  - 返回友好错误信息

### **Task 2: 实现安全约束系统** (AC: 3) ⏱️ 1.5小时

- [ ] Subtask 2.1: 创建安全约束配置
  - 位置: `src/lib/config/safety-constraints.ts`（新建）
  - 定义默认 negative prompts
  - 支持按内容类型配置
  ```typescript
  const SAFETY_CONSTRAINTS = {
    default: 'nsfw, violence, gore, hate symbols',
    portrait: 'deformed, bad anatomy, extra fingers',
    landscape: 'unnatural colors, distorted perspective',
  };
  ```
- [ ] Subtask 2.2: 实现安全约束注入
  - 位置: `src/lib/generation/prompt-builder.ts`（新建）
  - 自动在生成提示词中添加约束
  - 保持用户原始提示词不变
- [ ] Subtask 2.3: 创建约束可配置接口
  - 管理员可配置全局约束
  - 支持动态更新
  - 版本控制

### **Task 3: 集成到生成流程** (AC: 1, 2, 4) ⏱️ 2小时

- [ ] Subtask 3.1: 修改生成 API 添加前置审核
  - 位置: `src/app/api/generate/route.ts`（扩展 Epic 6）
  - 生成前先审核提示词
  - 审核不通过时返回错误
  - 不扣除 credit
- [ ] Subtask 3.2: 添加生成后审核
  - 图片生成完成后自动审核
  - 审核失败时删除图片
  - 通知用户审核结果
- [ ] Subtask 3.3: 实现审核失败重试机制
  - 允许用户修改提示词
  - 重新审核通过后才生成
  - 记录重试次数
- [ ] Subtask 3.4: 创建审核日志记录
  - 扩展 `moderation_logs` 表
  - 记录生成相关的审核
  - 添加 `generationId` 字段

### **Task 4: 创建审核状态 UI** (AC: 5) ⏱️ 2小时

- [ ] Subtask 4.1: 创建审核进度组件
  - 位置: `src/features/generation/components/ModerationProgress/`（新建）
  - 组件: `ModerationProgress`, `ModerationBadge`, `ModerationStatus`
  - 显示"正在审核内容..."动画
- [ ] Subtask 4.2: 创建审核结果展示组件
  - 位置: `src/features/generation/components/ModerationResult/`（新建）
  - 显示审核通过/失败状态
  - 失败时显示详细原因
  - 提供修改建议
- [ ] Subtask 4.3: 集成到生成流程 UI
  - 位置: `src/features/generation/components/GenerationFlow/`
  - 在生成进度中显示审核阶段
  - 审核失败时暂停并提示
- [ ] Subtask 4.4: 创建审核历史查看界面
  - 显示历史生成内容的审核记录
  - 筛选审核失败的项目
  - 查看详细审核结果

### **Task 5: 实现高风险请求标记系统** (AC: 6) ⏱️ 1.5小时

- [ ] Subtask 5.1: 创建风险评估服务
  - 位置: `src/lib/moderation/risk-assessment.ts`（新建）
  - 评估用户风险等级
  - 识别高风险请求模式
  - 自动标记需要人工审核
- [ ] Subtask 5.2: 创建管理员审核队列
  - 位置: `src/app/admin/moderation-queue/`（新建）
  - 显示待审核的生成请求
  - 批准或拒绝操作
  - 添加审核备注
- [ ] Subtask 5.3: 实现人工审核流程
  - 高风险请求进入队列
  - 管理员审核通过后才执行
  - 拒绝时通知用户

### **Task 6: 数据库扩展** (AC: 1, 2, 6) ⏱️ 1小时

- [ ] Subtask 6.1: 扩展 `moderation_logs` 表
  - 添加 `generation_id` 字段
  - 添加 `risk_level` 字段
  - 添加 `requires_manual_review` 字段
- [ ] Subtask 6.2: 创建 `manual_review_queue` 表
  ```typescript
  export const manualReviewQueue = pgTable('manual_review_queue', {
    id: serial('id').primaryKey(),
    generationRequestId: integer('generation_request_id').notNull(),
    userId: text('user_id').notNull(),
    riskLevel: text('risk_level').notNull(),
    status: text('status').notNull(), // 'pending' | 'approved' | 'rejected'
    reviewedBy: text('reviewed_by'),
    reviewNotes: text('review_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    reviewedAt: timestamp('reviewed_at'),
  });
  ```
- [ ] Subtask 6.3: 运行数据库迁移
  - `npm run db:generate`
  - `npm run db:migrate`
  - 迁移文件: `drizzle/0007_add_generation_moderation.sql`

### **Task 7: 编写单元测试和 E2E 测试** (AC: 1-6) ⏱️ 2小时

- [ ] Subtask 7.1: 测试提示词审核
  - 测试各种敏感词汇检测
  - 测试边界情况
  - 测试误报率
- [ ] Subtask 7.2: 测试图片审核
  - 测试生成图片审核流程
  - 测试自动删除逻辑
  - 测试通知发送
- [ ] Subtask 7.3: 测试安全约束
  - 测试约束注入
  - 测试配置更新
  - 测试不同场景
- [ ] Subtask 7.4: E2E 测试
  - 完整生成审核流程
  - 审核失败处理流程
  - 人工审核流程

---

## Dev Notes

### Critical Architecture Requirements

1. **复用现有代码** (⚠️ 必须遵守):
   - ⚡ 复用 Story 4-1 的审核服务 (`src/lib/moderation/`)
   - ⚡ 复用 Story 4-1 的 `ModerationResult` 类型
   - ⚡ 复用 Story 4-1 的 `moderation_logs` 表（扩展而非重建）
   - ⚡ 复用 Epic 6 的生成 API（扩展添加审核）
   - ⚡ **禁止创建新文件来替代现有功能**，只能在现有文件中扩展

2. **生成内容审核流程** (必须实现):
   ```typescript
   // 位置: src/lib/moderation/generation-moderation.ts (新建)
   import { moderateText } from './text-moderation';
   import { moderateImage } from './image-moderation';

   export async function moderatePrompt(prompt: string): Promise<ModerationResult> {
     // 1. 文本内容审核
     const textResult = await moderateText(prompt);

     // 2. 生成特定审核（更严格）
     const generationResult = await moderateForGeneration(prompt);

     // 3. 合并结果
     return combineResults([textResult, generationResult]);
   }

   export async function moderateGeneratedImage(
     imageUrl: string,
     generationId: number
   ): Promise<ModerationResult> {
     const result = await moderateImage(imageUrl);

     if (!result.isApproved) {
       // 自动删除审核失败的图片
       await deleteGeneratedImage(generationId);
     }

     return result;
   }
   ```

3. **安全约束配置**:
   ```typescript
   // 位置: src/lib/config/safety-constraints.ts (新建)
   export const SAFETY_CONSTRAINTS = {
     // 默认约束（所有生成）
     default: [
       'nsfw',
       'violence',
       'gore',
       'hate symbols',
       'illegal content',
     ],

     // 人像专用约束
     portrait: [
       'deformed',
       'bad anatomy',
       'extra fingers',
       'mutated hands',
     ],

     // 风景专用约束
     landscape: [
       'unnatural colors',
       'distorted perspective',
     ],

     // 转换为 negative prompt 字符串
     toString(type: string = 'default'): string {
       const constraints = [...this.default, ...(this[type] || [])];
       return constraints.join(', ');
     }
   };

   // 自动注入安全约束
   export function buildSafePrompt(
     userPrompt: string,
     type: string = 'default'
   ): string {
     const safetyConstraint = SAFETY_CONSTRAINTS.toString(type);
     return `${userPrompt}, negative: ${safetyConstraint}`;
   }
   ```

4. **数据库 Schema 扩展**:
   ```typescript
   // src/lib/db/schema.ts

   // 扩展 moderation_logs 表（Story 4-1 已创建）
   export const moderationLogs = pgTable('moderation_logs', {
     // ... 现有字段
     generationId: integer('generation_id').references(() => generations.id), // 新增
     riskLevel: text('risk_level'), // 'low' | 'medium' | 'high' // 新增
     requiresManualReview: boolean('requires_manual_review').default(false), // 新增
   });

   // 新建人工审核队列表
   export const manualReviewQueue = pgTable('manual_review_queue', {
     id: serial('id').primaryKey(),
     generationRequestId: integer('generation_request_id').notNull(),
     userId: text('user_id').notNull().references(() => user.id),
     riskLevel: text('risk_level').notNull(),
     status: text('status').notNull(),
     reviewedBy: text('reviewed_by'),
     reviewNotes: text('review_notes'),
     createdAt: timestamp('created_at').defaultNow().notNull(),
     reviewedAt: timestamp('reviewed_at'),
   });
   ```

5. **风险评估逻辑**:
   ```typescript
   // 位置: src/lib/moderation/risk-assessment.ts (新建)
   export function assessRisk(
     userId: string,
     prompt: string,
     userHistory: ModerationLog[]
   ): RiskAssessment {
     let riskScore = 0;

     // 1. 用户历史审核失败次数
     const failedCount = userHistory.filter(log => log.action === 'rejected').length;
     riskScore += failedCount * 10;

     // 2. 提示词复杂度
     if (prompt.length > 500) riskScore += 5;
     if (containsComplexTerms(prompt)) riskScore += 10;

     // 3. 敏感关键词
     if (containsSensitiveKeywords(prompt)) riskScore += 20;

     // 确定风险等级
     const level = riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high';

     return {
       level,
       score: riskScore,
       requiresManualReview: level === 'high',
       reason: `Risk score: ${riskScore}`,
     };
   }
   ```

6. **审核失败友好提示**:
   ```typescript
   // 位置: src/lib/moderation/messages.ts (扩展 Story 4-1)
   export const GENERATION_MODERATION_MESSAGES = {
     prompt: {
       violence: {
         title: '提示词包含暴力相关内容',
         suggestion: '请修改提示词，避免描述暴力场景或行为',
       },
       sexual: {
         title: '提示词包含敏感内容',
         suggestion: '请使用更合适的描述方式',
       },
       illegal: {
         title: '提示词可能生成违规内容',
         suggestion: '请确保生成内容符合法律法规',
       },
       general: {
         title: '提示词需要修改',
         suggestion: '请查看我们的内容政策并修改后重试',
         link: '/content-policy',
       },
     },
     image: {
       rejected: {
         title: '生成的图片不符合内容政策',
         suggestion: '图片已被自动删除，请修改提示词后重试',
       },
     },
   };
   ```

7. **生成流程集成**:
   ```typescript
   // 位置: src/app/api/generate/route.ts (扩展 Epic 6)
   export async function POST(request: Request) {
     const { prompt, templateId } = await request.json();
     const userId = await getCurrentUserId();

     // 1. 提示词审核
     const promptModeration = await moderatePrompt(prompt);
     if (!promptModeration.isApproved) {
       // 审核不通过，不扣除 credit
       return json({
         success: false,
         error: {
           code: 'PROMPT_REJECTED',
           message: GENERATION_MODERATION_MESSAGES.prompt[promptModeration.reason].title,
           details: {
             reason: promptModeration.reason,
             suggestion: GENERATION_MODERATION_MESSAGES.prompt[promptModeration.reason].suggestion,
           }
         }
       });
     }

     // 2. 风险评估
     const risk = await assessRisk(userId, prompt);
     if (risk.requiresManualReview) {
       // 加入人工审核队列
       await addToManualReviewQueue(userId, prompt, risk);
       return json({
         success: true,
         data: {
           status: 'pending_review',
           message: '您的生成请求正在审核中',
         }
       });
     }

     // 3. 添加安全约束
     const safePrompt = buildSafePrompt(prompt);

     // 4. 调用生成 API
     const generation = await generateImage(safePrompt);

     // 5. 生成后图片审核
     const imageModeration = await moderateGeneratedImage(generation.url, generation.id);
     if (!imageModeration.isApproved) {
       return json({
         success: false,
         error: {
           code: 'IMAGE_REJECTED',
           message: '生成的图片不符合内容政策',
         }
       });
     }

     // 6. 返回成功结果
     return json({ success: true, data: generation });
   }
   ```

---

### Dependencies

**依赖图:**

```
Epic 4 (内容安全)
  ├─ Story 4-1 (内容审核) ✅ 已完成
  └─ Story 4-2 (生成安全) ← 当前

依赖的已完成 Stories:
- Story 4-1: 审核服务、日志表、审核消息模板
- Epic 6 的生成 API（需要在 Epic 6 实现时集成）
```

**依赖的外部服务:**

- Replicate API（内容审核模型）
- PostgreSQL（数据存储）

**依赖的已完成 Stories:**

- Story 4-1: 内容审核服务和日志系统

---

### UX Requirements

**审核进度显示:**

- 生成过程中显示"正在审核内容..."
- 使用进度条或旋转动画
- 审核时间通常 < 5 秒

**审核结果展示:**

- ✅ 审核通过：显示绿色安全徽章
- ❌ 审核失败：显示红色警告图标和详细原因
- ⏳ 等待审核：显示橙色时钟图标

**审核失败提示:**

- 友好的错误信息（不使用技术术语）
- 具体的修改建议
- 链接到内容政策页面
- 提供重新编辑提示词的选项

**人工审核通知:**

- "您的生成请求正在审核中"
- 预计审核时间
- 审核完成后通知

---

### API 端点设计

**POST /api/generate** (扩展)

```typescript
// 请求
{
  "prompt": "用户输入的提示词",
  "templateId": 123
}

// 审核失败响应
{
  "success": false,
  "error": {
    "code": "PROMPT_REJECTED",
    "message": "提示词包含暴力相关内容",
    "details": {
      "reason": "violence",
      "suggestion": "请修改提示词，避免描述暴力场景或行为",
      "policyLink": "/content-policy"
    }
  }
}

// 需要人工审核响应
{
  "success": true,
  "data": {
    "status": "pending_review",
    "message": "您的生成请求正在审核中",
    "estimatedReviewTime": "24小时"
  }
}

// 成功响应
{
  "success": true,
  "data": {
    "generationId": 456,
    "imageUrl": "https://...",
    "moderation": {
      "prompt": { "status": "approved", "confidence": 0.95 },
      "image": { "status": "approved", "confidence": 0.98 }
    }
  }
}
```

**GET /api/admin/moderation-queue**

```typescript
// 响应
{
  "success": true,
  "data": {
    "pending": [
      {
        "id": 1,
        "userId": "user123",
        "prompt": "...",
        "riskLevel": "high",
        "createdAt": "2026-02-15T10:00:00Z"
      }
    ],
    "total": 5
  }
}
```

**POST /api/admin/moderation-queue/:id/review**

```typescript
// 请求
{
  "action": "approve" | "reject",
  "notes": "审核备注"
}

// 响应
{
  "success": true,
  "data": {
    "status": "approved",
    "reviewedBy": "admin@example.com",
    "reviewedAt": "2026-02-15T11:00:00Z"
  }
}
```

---

### Database Migration (Drizzle)

```bash
npm run db:generate
npm run db:migrate
```

```sql
-- 扩展 moderation_logs 表
ALTER TABLE moderation_logs ADD COLUMN generation_id INTEGER REFERENCES generations(id);
ALTER TABLE moderation_logs ADD COLUMN risk_level TEXT;
ALTER TABLE moderation_logs ADD COLUMN requires_manual_review BOOLEAN DEFAULT FALSE;

-- 创建人工审核队列表
CREATE TABLE manual_review_queue (
  id SERIAL PRIMARY KEY,
  generation_request_id INTEGER NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  risk_level TEXT NOT NULL,
  status TEXT NOT NULL,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_moderation_logs_generation ON moderation_logs(generation_id);
CREATE INDEX idx_moderation_logs_risk ON moderation_logs(risk_level);
CREATE INDEX idx_manual_review_status ON manual_review_queue(status);
CREATE INDEX idx_manual_review_created ON manual_review_queue(created_at);
```

---

### Testing Requirements

**单元测试:**

- 提示词审核逻辑测试
- 图片审核逻辑测试
- 安全约束注入测试
- 风险评估逻辑测试

**E2E 测试:**

- 完整生成审核流程
- 审核失败处理流程
- 人工审核流程

**集成测试:**

- 生成 API 集成
- 审核服务集成
- 数据库记录集成

---

### Previous Story Intelligence

**从 Story 4-1 学到的经验:**

- 审核服务已建立，可以复用
- `ModerationResult` 类型定义完善
- `moderation_logs` 表已创建
- 审核消息模板已定义
- API 错误处理模式可参考

**从 Epic 6（未来）需要了解:**

- 生成 API 的基本结构
- 图片生成流程
- Credit 扣除逻辑

**本 Story 扩展:**

- 在生成流程中添加前置和后置审核
- 扩展审核日志表
- 添加安全约束系统
- 实现人工审核流程

---

### References

- [Source: epics.md#FR52-53] (生成内容审核需求)
- [Source: epics.md#Epic-4] (Epic 4 完整需求)
- [Source: Story 4-1] (内容审核实现参考)
- [Source: src/lib/moderation/] (现有审核服务)
- [Source: src/lib/db/schema.ts] (现有数据库 Schema)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
