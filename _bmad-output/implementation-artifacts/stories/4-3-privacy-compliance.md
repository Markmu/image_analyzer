# Story 4.3: privacy-compliance

Status: done

---

## Story

作为一名 **用户**,
我希望 **系统能够保护我的隐私和数据安全，符合 GDPR/CCPA 等法规要求**,
以便 **安心使用平台服务，知道我的数据受到法律保护**。

---

## Acceptance Criteria

1. **[AC-1]** 用户可以查看其账户的数据收集和使用情况 (FR-隐私-1)
   - 提供数据使用报告页面
   - 清晰列出收集的数据类型
   - 说明数据使用目的

2. **[AC-2]** 用户可以导出其所有数据 (FR-隐私-2)
   - 一键导出所有个人数据
   - 支持 JSON 格式
   - 包含图片、分析结果、模板等

3. **[AC-3]** 用户可以管理数据共享设置 (FR-隐私-3)
   - 控制是否分享数据用于改进服务
   - 灵活的隐私设置
   - 实时生效

4. **[AC-4]** 系统遵守 GDPR 删除权 (FR-隐私-4)
   - 完整的数据删除（被遗忘权）
   - 删除所有相关数据
   - 提供删除确认和进度

5. **[AC-5]** 系统遵守 CCPA 数据保留限制 (FR-隐私-5)
   - 不出售用户数据
   - 提供"Do Not Sell"选项
   - 透明的隐私政策

---

## Tasks / Subtasks

### **Task 1: 创建数据隐私设置页面** (AC: 1, 3, 5) ⏱️ 2小时

- [ ] Subtask 1.1: 创建隐私设置页面组件
  - 位置: `src/app/settings/privacy/page.tsx`（新建）
  - 展示数据收集清单
  - 提供"Do Not Sell"选项

- [ ] Subtask 1.2: 实现数据共享管理功能
  - 位置: `src/lib/privacy/data-sharing.ts`（新建）
  - 控制服务改进数据分享
  - 实时生效

- [ ] Subtask 1.3: 添加隐私设置到用户偏好
  - 扩展 user 表添加隐私设置字段
  - 保存用户选择

### **Task 2: 实现数据导出功能** (AC-2) ⏱️ 2小时

- [ ] Subtask 2.1: 创建数据导出服务
  - 位置: `src/lib/privacy/data-export.ts`（新建）
  - 收集用户所有数据
  - 生成 JSON 导出

- [ ] Subtask 2.2: 实现导出 API
  - 位置: `src/app/api/user/export-data/route.ts`（新建）
  - 验证用户身份
  - 返回数据下载链接

- [ ] Subtask 2.3: 创建导出进度 UI
  - 显示导出进度
  - 处理大数据导出

### **Task 3: 完善账户删除功能** (AC-4) ⏱️ 1.5小时

- [ ] Subtask 3.1: 扩展 Story 1-5 的删除功能
  - 确保所有数据被清除
  - 添加删除进度显示

- [ ] Subtask 3.2: 实现删除确认流程
  - 显示将删除的数据列表
  - 提供最后下载选项

- [ ] Subtask 3.3: 添加删除后确认邮件
  - 确认数据已清除
  - 提供反馈链接

### **Task 4: 添加隐私政策页面** (AC-5) ⏱️ 1小时

- [ ] Subtask 4.1: 创建隐私政策页面
  - 位置: `src/app/privacy-policy/page.tsx`（新建）
  - 包含 GDPR 和 CCPA 合规说明

- [ ] Subtask 4.2: 添加 Cookie 同意横幅
  - 位置: `src/components/shared/CookieConsent/`（新建）
  - 符合 Cookie 法规要求

### **Task 5: 编写测试** (AC: 1-5) ⏱️ 1.5小时

- [ ] 测试数据导出功能
- [ ] 测试隐私设置
- [ ] 测试账户删除完整性
- [ ] E2E 测试完整流程

---

## Dev Notes

### Critical Architecture Requirements

1. **复用现有代码**:
   - 复用 Story 1-5 的账户删除功能
   - 复用 Story 4-1 的数据保留配置

2. **隐私合规设计**:
   ```typescript
   // 位置: src/lib/privacy/types.ts (新建)
   export interface PrivacySettings {
     shareForImprovement: boolean;
     marketingEmails: boolean;
     doNotSell: boolean;
     dataRetention: 'delete-immediately' | 'keep-30-days' | 'keep-90-days';
   }

   // 位置: src/lib/privacy/data-export.ts
   export async function exportUserData(userId: string): Promise<{
     data: UserExportData;
     format: 'json';
   }> {
     // 收集用户所有数据
     const images = await db.query.images.findMany({ where: eq(images.userId, userId) });
     const analyses = await db.query.analysisResults.findMany({ where: eq(analyses.userId, userId) });
     const templates = await db.query.templates.findMany({ where: eq(templates.userId, userId) });

     return {
       data: {
         profile: await getUserProfile(userId),
         images,
         analyses,
         templates,
         exportedAt: new Date(),
       },
       format: 'json',
     };
   }
   ```

3. **数据库扩展**:
   ```typescript
   // src/lib/db/schema.ts
   export const privacySettings = pgTable('privacy_settings', {
     id: serial('id').primaryKey(),
     userId: text('user_id').notNull().references(() => user.id),
     shareForImprovement: boolean('share_for_improvement').default(true),
     marketingEmails: boolean('marketing_emails').default(true),
     doNotSell: boolean('do_not_sell').default(false),
     updatedAt: timestamp('updated_at').defaultNow().notNull(),
   });
   ```

4. **账户删除流程**:
   ```typescript
   // 扩展删除流程，确保完全清除
   export async function completeDataDeletion(userId: string) {
     await db.transaction(async (tx) => {
       // 1. 删除图片文件（R2）
       const images = await tx.query.images.findMany({ where: eq(images.userId, userId) });
       await batchDeleteFromR2(images.map(img => img.r2Key));

       // 2. 删除所有数据库记录
       await tx.delete(analysisResults).where(eq(analysisResults.userId, userId));
       await tx.delete(templates).where(eq(templates.userId, userId));
       await tx.delete(images).where(eq(images.userId, userId));
       await tx.delete(moderationLogs).where(eq(moderationLogs.userId, userId));
       await tx.delete(privacySettings).where(eq(privacySettings.userId, userId));
       await tx.delete(user).where(eq(user.id, userId));
     });
   }
   ```

---

### Dependencies

**依赖的已完成 Stories:**
- Story 1-5: 账户删除基础功能
- Story 4-1: 数据保留策略
- Story 4-2: 审核日志结构

---

### UX Requirements

**数据导出页面:**
- 清晰的导出进度指示
- 支持大文件分批导出
- 导出完成后邮件通知

**隐私设置:**
- 简洁的开关设计
- 实时生效提示
- 清晰的隐私政策链接

**删除流程:**
- 步骤化的删除向导
- 最后下载数据选项
- 删除后确认邮件

---

### API 端点设计

**GET /api/user/privacy-settings**

```typescript
// 响应
{
  "success": true,
  "data": {
    "shareForImprovement": true,
    "marketingEmails": false,
    "doNotSell": true,
    "updatedAt": "2026-02-15T10:00:00Z"
  }
}
```

**PATCH /api/user/privacy-settings**

```typescript
// 请求
{
  "shareForImprovement": false,
  "marketingEmails": true
}

// 响应
{
  "success": true,
  "data": {
    "shareForImprovement": false,
    "marketingEmails": true,
    "updatedAt": "2026-02-15T10:05:00Z"
  }
}
```

**GET /api/user/export-data**

```typescript
// 响应
{
  "success": true,
  "data": {
    "downloadUrl": "https://...",
    "expiresAt": "2026-02-15T12:00:00Z",
    "estimatedSize": "15MB"
  }
}
```

---

### Testing Requirements

**单元测试:**
- 隐私设置保存和读取
- 数据导出完整性
- 账户删除彻底性

**E2E 测试:**
- 完整隐私设置流程
- 数据导出流程
- 账户删除确认流程

---

## References

- [Source: epics.md#Epic-4] (Epic 4 完整需求)
- [Source: Story 1-5] (账户删除实现参考)
- [Source: Story 4-1] (数据保留配置参考)
- GDPR 合规指南
- CCPA 合规指南

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
