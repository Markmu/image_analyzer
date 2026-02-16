# Story 4.1: content-moderation

Status: done

---

## Story

作为一名 **AI 创作者或普通用户**,
我希望 **上传的图片能够经过内容安全审核，不当内容被自动过滤**,
以便 **在安全可信的平台上使用服务，保护自己和他人免受有害内容的影响**。

---

## Acceptance Criteria

1. **[AC-1]** 用户在上传图片前需确认拥有使用权利 (FR50)
   - 显示版权声明和使用授权确认
   - 上传前必须勾选确认
   - 确认信息清晰易懂

2. **[AC-2]** 用户在首次使用时需同意服务条款 (FR51)
   - 服务条款弹窗显示
   - 包含 AI 使用透明度说明
   - 必须同意才能继续使用

3. **[AC-3]** 系统可以检测并拒绝包含不当内容的图片上传 (FR52)
   - 集成内容审核 API（如 Replicate Moderation Model）
   - 审核维度：暴力、色情、仇恨符号等
   - 检测到不当内容时拒绝上传并显示友好提示
   - 记录审核日志

4. **[AC-4]** 系统可以检测并阻止生成包含不当内容的提示词 (FR53)
   - 文本内容审核集成
   - 提示词过滤功能
   - 阻止时显示友好的修改建议

5. **[AC-5]** 系统可以在 UI 上清晰标注 AI 驱动的分析 (FR54)
   - 分析结果显示 "AI 分析结果" 标识
   - 使用醒目的图标和文字
   - 符合 AI 透明度规范

6. **[AC-6]** 系统可以按照用户订阅等级自动删除过期的图片数据 (FR55)
   - Free 用户：30 天后自动删除
   - Lite 用户：60 天后自动删除
   - Standard 用户：90 天后自动删除
   - 删除前发送邮件通知

7. **[AC-7]** 系统可以在用户删除账户时立即清除所有相关图片数据 (FR56)
   - 账户删除时级联删除所有相关数据
   - 包括图片文件和分析结果
   - 确保数据完全清除

---

## Tasks / Subtasks

### **Task 1: 创建数据库 Schema** (AC: 3, 4, 6) ⏱️ 1小时

- [ ] Subtask 1.1: 定义 `moderation_logs` 表结构
  - 位置: `src/lib/db/schema.ts`
  - ⚡ **遵循现有命名约定**: TypeScript 使用 camelCase，数据库列使用 snake_case
  ```typescript
  export const moderationLogs = pgTable('moderation_logs', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    imageId: integer('image_id').references(() => images.id),
    contentType: text('content_type').notNull(), // 'image' | 'text'
    moderationResult: jsonb('moderation_result').notNull().$type<ModerationResult>(),
    action: text('action').notNull(), // 'approved' | 'rejected' | 'flagged'
    reason: text('reason'), // 拒绝或标记的原因
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```
- [ ] Subtask 1.2: 扩展 `images` 表添加数据保留字段
  - 添加 `expiresAt` 字段
  - 添加 `deletionNotifiedAt` 字段
- [ ] Subtask 1.3: 运行数据库迁移
  - `npm run db:generate`
  - `npm run db:migrate`
  - 迁移文件: `drizzle/0006_add_moderation_logs.sql`
- [ ] Subtask 1.4: 验证数据库迁移
  - 确认 `moderation_logs` 表存在
  - 确认所有字段类型正确
  - 确认外键约束生效

### **Task 2: 实现用户授权与免责声明 UI** (AC: 1, 2) ⏱️ 2小时

- [ ] Subtask 2.1: 创建版权声明组件
  - 位置: `src/features/upload/components/CopyrightConsent/`（新建）
  - 组件: `CopyrightConsent`, `TermsOfService`
  - 上传前必须确认
- [ ] Subtask 2.2: 创建服务条款弹窗
  - 位置: `src/components/shared/TermsDialog/`（新建）
  - 显示完整服务条款
  - 包含 AI 透明度说明
  - 首次使用时自动弹出
- [ ] Subtask 2.3: 实现用户同意记录
  - 扩展 `user` 表添加 `agreedToTermsAt` 字段
  - 记录用户同意时间
  - 存储同意的版本号
- [ ] Subtask 2.4: 创建同意验证中间件
  - 位置: `src/lib/auth/terms-middleware.ts`（新建）
  - 检查用户是否已同意条款
  - 未同意时返回特定错误码

### **Task 3: 实现图片内容审核** (AC: 3) ⏱️ 3小时

- [ ] Subtask 3.1: 集成 Replicate 内容审核模型
  - 位置: `src/lib/replicate/moderation.ts`（新建）
  - 使用 Replicate Moderation API
  - 支持多种审核维度
- [ ] Subtask 3.2: 创建内容审核服务
  - 位置: `src/lib/moderation/image-moderation.ts`（新建）
  - 实现 `moderateImage` 函数
  - 定义审核结果数据结构
  - 实现审核失败处理
- [ ] Subtask 3.3: 集成到上传流程
  - 修改 `src/app/api/upload/route.ts`
  - 在图片上传后立即进行审核
  - 审核不通过时删除图片
  - 返回友好的错误信息
- [ ] Subtask 3.4: 创建审核日志记录
  - 记录每次审核的结果
  - 包含审核时间和决策原因
  - 用于审计和优化
- [ ] Subtask 3.5: 创建审核失败 UI 反馈
  - 位置: `src/features/upload/components/ModerationError/`（新建）
  - 显示友好的错误信息
  - 提供内容政策链接
  - 建议用户修改后重试

### **Task 4: 实现文本内容审核** (AC: 4) ⏱️ 2小时

- [ ] Subtask 4.1: 创建文本审核服务
  - 位置: `src/lib/moderation/text-moderation.ts`（新建）
  - 实现提示词内容审核
  - 检测敏感词汇和不当内容
- [ ] Subtask 4.2: 集成到模板生成流程
  - 修改 `src/app/api/analysis/route.ts`
  - 在生成提示词前进行审核
  - 审核不通过时返回错误
- [ ] Subtask 4.3: 创建文本审核错误处理
  - 提供修改建议
  - 显示哪些内容不符合政策
  - 允许用户修改后重新提交

### **Task 5: 实现 AI 透明度标注** (AC: 5) ⏱️ 1小时

- [ ] Subtask 5.1: 创建 AI 标注组件
  - 位置: `src/components/shared/AITransparency/`（新建）
  - 组件: `AITransparencyBadge`, `AIDisclaimer`
  - 显示 "AI 分析结果" 标识
- [ ] Subtask 5.2: 集成到分析结果显示
  - 修改 `src/features/analysis/components/AnalysisResult/`
  - 在分析结果顶部显示 AI 标识
  - 使用醒目的图标和颜色
- [ ] Subtask 5.3: 添加 AI 透明度说明
  - 提供详细说明链接
  - 解释 AI 的工作原理
  - 说明结果的局限性

### **Task 6: 实现数据保留策略** (AC: 6) ⏱️ 2小时

- [ ] Subtask 6.1: 创建数据保留配置
  - 位置: `src/lib/config/retention.ts`（新建）
  - 定义不同订阅等级的保留期限
  - 支持配置化调整
  ```typescript
  const RETENTION_PERIODS = {
    free: 30,      // 30 天
    lite: 60,      // 60 天
    standard: 90,  // 90 天
  };
  ```
- [ ] Subtask 6.2: 实现自动过期逻辑
  - 位置: `src/lib/cron/retention.ts`（新建）
  - 每日定时任务检查过期数据
  - 批量删除过期图片
  - 记录删除日志
- [ ] Subtask 6.3: 实现删除前通知
  - 邮件通知即将删除的数据
  - 提前 7 天发送提醒
  - 提供数据导出选项
- [ ] Subtask 6.4: 创建数据清理 API
  - DELETE `/api/cron/cleanup-expired-data`
  - 受 Cron 密钥保护
  - 返回清理统计信息

### **Task 7: 实现账户删除数据清除** (AC: 7) ⏱️ 1.5小时

- [ ] Subtask 7.1: 扩展账户删除功能
  - 修改 `src/app/api/user/delete-account/route.ts`（复用 Epic 1）
  - 添加图片文件删除逻辑
  - 添加分析结果删除逻辑
  - 添加审核日志删除逻辑
- [ ] Subtask 7.2: 实现 R2 存储清理
  - 位置: `src/lib/r2/cleanup.ts`（新建）
  - 删除用户的所有图片文件
  - 批量删除优化
- [ ] Subtask 7.3: 实现数据库级联删除
  - 确保所有关联数据被删除
  - 使用数据库事务保证一致性
  - 记录删除操作日志
- [ ] Subtask 7.4: 创建删除确认流程
  - 显示将要删除的数据列表
  - 要求用户确认
  - 提供数据导出选项

### **Task 8: 编写单元测试和 E2E 测试** (AC: 1-7) ⏱️ 2小时

- [ ] Subtask 8.1: 测试内容审核
  - 测试图片审核逻辑
  - 测试文本审核逻辑
  - 测试边界情况
- [ ] Subtask 8.2: 测试数据保留
  - 测试过期计算
  - 测试自动清理
  - 测试通知发送
- [ ] Subtask 8.3: E2E 测试
  - 完整上传审核流程
  - 服务条款同意流程
  - 账户删除流程

---

## Dev Notes

### Critical Architecture Requirements

1. **复用现有代码** (⚠️ 必须遵守):
   - ⚡ 复用 `src/lib/replicate/client.ts`（现有 Replicate 客户端）
   - ⚡ 复用 `src/lib/r2/client.ts`（现有 R2 存储客户端）
   - ⚡ 复用 Epic 1 的账户删除功能 (`src/app/api/user/delete-account/route.ts`)
   - ⚡ 复用 Epic 2 的上传功能 (`src/app/api/upload/route.ts`)
   - ⚡ **禁止创建新文件来替代现有功能**，只能在现有文件中扩展

2. **内容审核集成** (必须实现):
   ```typescript
   // 位置: src/lib/moderation/types.ts (新建)
   export interface ModerationResult {
     isApproved: boolean;
     confidence: number; // 0-1
     categories: {
       violence: number;
       sexual: number;
       hate: number;
       harassment: number;
       selfHarm: number;
     };
     action: 'approved' | 'rejected' | 'flagged';
     reason?: string;
   }

   // 位置: src/lib/replicate/moderation.ts (新建)
   export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
     const model = 'moderation-model-version'; // Replicate moderation model
     const output = await replicate.run(model, {
       input: { image: imageUrl }
     });

     return parseModerationOutput(output);
   }
   ```

3. **数据保留配置**:
   ```typescript
   // 位置: src/lib/config/retention.ts (新建)
   export const RETENTION_CONFIG = {
     periods: {
       free: 30,      // Free 用户 30 天
       lite: 60,      // Lite 用户 60 天
       standard: 90,  // Standard 用户 90 天
     },
     notificationDaysBefore: 7, // 提前 7 天通知
     cronSchedule: '0 2 * * *', // 每天凌晨 2 点执行
   };

   export function getExpirationDate(tier: string): Date {
     const days = RETENTION_CONFIG.periods[tier] || 30;
     return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
   }
   ```

4. **数据库 Schema**:
   ```typescript
   // src/lib/db/schema.ts

   // 审核日志表（新建）
   export const moderationLogs = pgTable('moderation_logs', {
     id: serial('id').primaryKey(),
     userId: text('user_id').notNull().references(() => user.id),
     imageId: integer('image_id').references(() => images.id),
     contentType: text('content_type').notNull(),
     moderationResult: jsonb('moderation_result').notNull().$type<ModerationResult>(),
     action: text('action').notNull(),
     reason: text('reason'),
     createdAt: timestamp('created_at').defaultNow().notNull(),
   });

   // 扩展 images 表
   export const images = pgTable('images', {
     // ... 现有字段
     expiresAt: timestamp('expires_at'),
     deletionNotifiedAt: timestamp('deletion_notified_at'),
   });

   // 扩展 user 表
   export const user = pgTable('user', {
     // ... 现有字段
     agreedToTermsAt: timestamp('agreed_to_terms_at'),
     termsVersion: text('terms_version'),
   });
   ```

5. **审核失败友好提示**:
   ```typescript
   // 位置: src/lib/moderation/messages.ts (新建)
   export const MODERATION_MESSAGES = {
     violence: {
       title: '图片包含暴力内容',
       suggestion: '请上传不含暴力或血腥内容的图片',
     },
     sexual: {
       title: '图片包含敏感内容',
       suggestion: '请上传适合所有年龄段的内容',
     },
     hate: {
       title: '图片包含不当符号',
       suggestion: '请确保内容不包含仇恨或歧视性符号',
     },
     general: {
       title: '内容不符合社区政策',
       suggestion: '请查看我们的内容政策并修改后重试',
       link: '/content-policy',
     },
   };
   ```

6. **AI 透明度标注设计**:
   ```tsx
   // 位置: src/components/shared/AITransparency/AITransparencyBadge.tsx
   export function AITransparencyBadge() {
     return (
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
         <SmartToyIcon color="primary" />
         <Typography variant="body2" color="text.secondary">
           AI 分析结果
         </Typography>
         <Tooltip title="此分析由 AI 模型生成，仅供参考">
           <InfoIcon fontSize="small" color="action" />
         </Tooltip>
       </Box>
     );
   }
   ```

7. **账户删除数据清除流程**:
   ```typescript
   // 位置: src/app/api/user/delete-account/route.ts (扩展现有)
   export async function DELETE(request: Request) {
     const userId = await getCurrentUserId();

     await db.transaction(async (tx) => {
       // 1. 删除 R2 存储中的图片
       const images = await tx.query.images.findMany({ where: eq(images.userId, userId) });
       await batchDeleteFromR2(images.map(img => img.r2Key));

       // 2. 删除数据库记录（级联）
       await tx.delete(moderationLogs).where(eq(moderationLogs.userId, userId));
       await tx.delete(analysisResults).where(eq(analysisResults.userId, userId));
       await tx.delete(images).where(eq(images.userId, userId));

       // 3. 删除用户账户
       await tx.delete(user).where(eq(user.id, userId));
     });

     return json({ success: true, message: '账户及所有相关数据已删除' });
   }
   ```

---

### Dependencies

**依赖图:**

```
Epic 0 (初始化) ✅ 已完成
Epic 1 (用户认证) ✅ 已完成
  └─ Story 1-5 (账户删除) ✅

Epic 2 (图片上传) ✅ 已完成
  ├─ Story 2-1 (图片上传) ✅
  └─ Story 2-3 (上传验证) ✅

Epic 3 (AI 风格分析) ✅ 已完成
  ├─ Story 3-1 (风格分析) ✅
  └─ Story 3-4 (模型集成) ✅

Epic 4 (内容安全)
  └─ Story 4-1 (内容审核) ← 当前

后续 Stories:
  ├─ Story 4-2 (生成安全)
  └─ Story 4-3 (隐私合规)
```

**依赖的外部服务:**

- Replicate API（内容审核模型）
- Resend API（邮件通知）
- Cloudflare R2（图片存储）
- PostgreSQL（数据存储）

**依赖的已完成 Stories:**

- Story 1-5: 账户删除基础功能
- Story 2-1: 图片上传功能
- Story 2-3: 上传验证逻辑
- Story 3-1: 分析流程
- Story 3-4: 模型集成经验

---

### UX Requirements

**版权确认 UI:**

- 上传区域下方显示确认框
- 确认文字清晰易懂："我确认拥有此图片的使用权利"
- 必须勾选才能启用上传按钮
- 链接到完整的版权政策

**服务条款弹窗:**

- 首次使用时自动弹出
- 显示完整服务条款（可滚动）
- 突出显示 AI 使用条款
- "同意并继续" 和 "取消" 按钮
- 记录用户同意时间

**内容审核失败提示:**

- 友好的错误信息（不使用技术术语）
- 具体说明哪种类型的内容不符合政策
- 提供修改建议
- 链接到内容政策页面
- 允许用户重新上传

**AI 透明度标识:**

- 醒目的 AI 图标
- 清晰的文字说明
- 悬停显示详细信息
- 使用品牌颜色（主题色）

**数据删除通知邮件:**

- 提前 7 天发送
- 列出即将删除的图片
- 提供数据导出链接
- 提供升级订阅延长保留期选项

---

### API 端点设计

**POST /api/upload** (扩展)

```typescript
// 请求（增加确认字段）
{
  "file": File,
  "copyrightConfirmed": true  // 新增：版权确认
}

// 响应（增加审核结果）
{
  "success": true,
  "data": {
    "imageId": 123,
    "url": "https://...",
    "moderation": {
      "status": "approved",
      "confidence": 0.98
    }
  }
}

// 审核失败响应
{
  "success": false,
  "error": {
    "code": "CONTENT_REJECTED",
    "message": "图片包含暴力内容",
    "details": {
      "reason": "violence",
      "suggestion": "请上传不含暴力或血腥内容的图片",
      "policyLink": "/content-policy"
    }
  }
}
```

**POST /api/user/agree-terms** (新建)

```typescript
// 请求
{
  "version": "1.0"
}

// 响应
{
  "success": true,
  "data": {
    "agreedAt": "2026-02-15T10:30:00Z"
  }
}
```

**GET /api/user/terms-status** (新建)

```typescript
// 响应
{
  "success": true,
  "data": {
    "hasAgreed": false,
    "currentVersion": "1.0",
    "requiresAgreement": true
  }
}
```

**POST /api/moderation/check-text** (新建)

```typescript
// 请求
{
  "text": "用户输入的提示词"
}

// 响应
{
  "success": true,
  "data": {
    "isApproved": true,
    "confidence": 0.95
  }
}

// 审核失败响应
{
  "success": true,
  "data": {
    "isApproved": false,
    "confidence": 0.12,
    "reason": "包含敏感内容",
    "suggestion": "请修改提示词，移除不当内容"
  }
}
```

**DELETE /api/cron/cleanup-expired-data** (新建)

```typescript
// Headers
{
  "X-Cron-Key": "secret-cron-key"
}

// 响应
{
  "success": true,
  "data": {
    "deletedImages": 45,
    "deletedAnalysisResults": 38,
    "notifiedUsers": 12
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
-- 创建审核日志表
CREATE TABLE moderation_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  image_id INTEGER REFERENCES images(id),
  content_type TEXT NOT NULL,
  moderation_result JSONB NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 扩展 images 表
ALTER TABLE images ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE images ADD COLUMN deletion_notified_at TIMESTAMP;

-- 扩展 user 表
ALTER TABLE "user" ADD COLUMN agreed_to_terms_at TIMESTAMP;
ALTER TABLE "user" ADD COLUMN terms_version TEXT;

-- 创建索引
CREATE INDEX idx_moderation_logs_user ON moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_created ON moderation_logs(created_at);
CREATE INDEX idx_images_expires ON images(expires_at);
CREATE INDEX idx_user_agreed ON "user"(agreed_to_terms_at);
```

---

### Testing Requirements

**单元测试:**

- 内容审核逻辑测试
- 数据保留计算测试
- 文本审核测试
- AI 标注显示测试

**E2E 测试:**

- 完整上传审核流程
- 服务条款同意流程
- 不当内容拒绝流程
- 账户删除数据清除流程

**集成测试:**

- Replicate Moderation API 集成
- 邮件通知发送
- Cron 任务执行
- 数据库级联删除

---

### Previous Story Intelligence

**从 Story 3-4 学到的经验:**

- Replicate API 集成模式已建立
- 模型调用错误处理已实现
- 模型响应解析策略已优化

**从 Story 1-5 学到的经验:**

- 账户删除基础逻辑已存在
- 需要扩展数据清理范围
- 事务处理模式已建立

**从 Story 2-3 学到的经验:**

- 上传验证流程已建立
- 文件验证逻辑可复用
- 错误处理模式可参考

**本 Story 扩展:**

- 在上传流程中集成内容审核
- 扩展账户删除功能
- 添加数据保留策略
- 实现 AI 透明度标注

---

### References

- [Source: epics.md#FR50-56] (内容安全与合规需求)
- [Source: epics.md#Epic-4] (Epic 4 完整需求)
- [Source: Story 1-5] (账户删除实现参考)
- [Source: Story 2-1] (图片上传实现参考)
- [Source: Story 2-3] (上传验证实现参考)
- [Source: Story 3-1] (分析流程参考)
- [Source: Story 3-4] (模型集成参考)
- [Source: src/lib/replicate/client.ts] (现有 Replicate 客户端)
- [Source: src/lib/r2/client.ts] (现有 R2 存储客户端)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
