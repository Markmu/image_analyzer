# Story 4-2: 生成安全功能 - 实现总结

**Story**: 4-2 - generation-safety
**Epic**: Epic 4 - 内容安全与合规
**实现日期**: 2026-02-15
**开发者**: BMM 开发工程师 (Amelia)

---

## 📋 实现范围

### Acceptance Criteria 完成情况

| AC | 描述 | 状态 |
|----|------|------|
| AC-1 | 提示词前置审核 | ✅ 完成 |
| AC-2 | 生成图片后置审核 | ✅ 完成 |
| AC-3 | 安全约束系统 | ✅ 完成 |
| AC-4 | 审核失败处理 | ✅ 完成 |
| AC-5 | 审核状态 UI | ⏳ 部分（API 已完成，UI 组件待前端集成） |
| AC-6 | 高风险请求标记 | ✅ 完成 |

---

## 📁 新增文件 (8 个)

### 1. 生成内容审核服务
**文件**: `src/lib/moderation/generation-moderation.ts`
**功能**:
- `moderatePrompt()` - 提示词审核（文本审核 + 生成专用审核）
- `moderateGeneratedImage()` - 生成图片审核
- `deleteGeneratedImage()` - 删除审核失败的图片
- 敏感关键词检测
- 生成专用更严格阈值
- 合并多个审核结果

### 2. 安全约束配置
**文件**: `src/lib/config/safety-constraints.ts`
**功能**:
- `SAFETY_CONSTRAINTS` - 默认 negative prompts
- `buildSafePrompt()` - 构建包含安全约束的提示词
- 支持多种生成类型（default, portrait, landscape, abstract, product）

### 3. 风险评估服务
**文件**: `src/lib/moderation/risk-assessment.ts`
**功能**:
- `assessRisk()` - 评估用户风险等级
- 基于用户历史、提示词复杂度、敏感关键词评分
- 自动识别需要人工审核的高风险请求
- 支持 low/medium/high 三级风险

### 4. 人工审核队列服务
**文件**: `src/lib/moderation/manual-review-queue.ts`
**功能**:
- `addToManualReviewQueue()` - 添加到审核队列
- `getPendingReviews()` - 获取待审核列表
- `processReview()` - 处理审核结果
- `getReviewStats()` - 获取统计数据

### 5. 管理员审核队列 API
**文件**: `src/app/api/admin/moderation-queue/route.ts`
**端点**: `GET /api/admin/moderation-queue`
**功能**: 获取待审核队列

### 6. 管理员审核操作 API
**文件**: `src/app/api/admin/moderation-queue/[id]/review/route.ts`
**端点**: `POST /api/admin/moderation-queue/[id]/review`
**功能**: 处理审核结果（批准/拒绝）

### 7. 数据库迁移
**文件**: `drizzle/0009_generation_safety.sql`
**功能**:
- 扩展 `content_moderation_logs` 表（添加 generation_id, risk_level, requires_manual_review）
- 创建 `manual_review_queue` 表

---

## 🔧 修改文件 (2 个)

### 1. 数据库 Schema
**文件**: `src/lib/db/schema.ts`
**修改**:
- 扩展 `contentModerationLogs` 表定义
- 新增 `manualReviewQueue` 表定义
- 添加索引

### 2. 审核消息系统
**文件**: `src/lib/moderation/messages.ts`
**修改**:
- 添加 `GENERATION_MODERATION_MESSAGES`
- 提示词审核友好提示
- 图片审核友好提示
- 审核状态提示

### 3. 类型定义
**文件**: `src/lib/moderation/types.ts`
**修改**:
- `ModerationLog` 接口添加新字段
- 添加 `RiskLevel` 类型

---

## 🎯 核心功能实现

### 1. 提示词前置审核流程

```typescript
// 1. 基础文本审核
const textResult = await moderateText({ text: prompt, userId });

// 2. 生成专用审核（更严格）
const generationResult = await moderateForGeneration(prompt);

// 3. 合并结果
const combinedResult = combineResults([textResult, generationResult]);

// 4. 记录日志
await logModeration({ userId, contentType: 'text', content: prompt, result });
```

### 2. 安全约束注入

```typescript
// 用户原始提示词
const userPrompt = "a beautiful sunset over mountains";

// 自动添加安全约束
const safePrompt = buildSafePrompt(userPrompt, 'landscape');
// "a beautiful sunset over mountains, negative: nsfw, violence, gore, ..."
```

### 3. 风险评估

```typescript
// 评估风险
const risk = assessRisk(userId, prompt, userHistory);

if (risk.requiresManualReview) {
  // 加入人工审核队列
  await addToManualReviewQueue(generationId, userId, prompt, risk.level);
  return { status: 'pending_review' };
}
```

### 4. 审核失败处理

```typescript
// 审核失败时自动删除图片
if (!moderationResult.isApproved) {
  await deleteGeneratedImage(imageUrl, generationId);

  // 返回友好错误信息
  return {
    success: false,
    error: {
      code: 'IMAGE_REJECTED',
      message: GENERATION_MODERATION_MESSAGES.image.rejected.title,
      suggestion: GENERATION_MODERATION_MESSAGES.image.rejected.suggestion,
    }
  };
}
```

---

## 📊 技术规格

### 审核阈值

**普通审核**:
- violence: 0.7
- sexual: 0.7
- hate: 0.7
- harassment: 0.7
- selfHarm: 0.7

**生成审核（更严格）**:
- violence: 0.5
- sexual: 0.5
- hate: 0.5
- harassment: 0.5
- selfHarm: 0.5

### 风险评分

- 历史失败次数: +10 分/次
- 提示词过长（>500字符）: +5 分
- 复杂术语: +10 分
- 敏感关键词: +20 分

**风险等级**:
- < 20: low
- 20-50: medium
- >= 50: high（需要人工审核）

---

## ✅ 测试覆盖

### 单元测试（待实现）
- [ ] 提示词审核逻辑
- [ ] 图片审核逻辑
- [ ] 安全约束注入
- [ ] 风险评估算法
- [ ] 人工审核队列操作

### E2E 测试（待实现）
- [ ] 完整生成审核流程
- [ ] 审核失败处理
- [ ] 人工审核流程

---

## 🚀 下一步

### Phase B-4: 验证测试
- 运行单元测试
- 运行 E2E 测试
- 验证覆盖率 ≥ 80%

### 待办事项
1. 前端 UI 组件实现（审核进度显示、审核结果展示）
2. 集成到 Epic 6 生成 API
3. 管理员审核界面
4. 完整的单元测试和 E2E 测试

---

## 📝 技术债务

1. **管理员权限验证**: 当前管理员 API 仅验证用户登录，需要添加角色检查
2. **审核队列清理**: `cleanupOldReviews()` 函数需要完善删除逻辑
3. **测试覆盖**: 需要添加完整的单元测试和 E2E 测试
4. **性能优化**: 批量审核处理可以考虑使用数据库事务

---

## 🔗 相关文件

- Story 文件: `_bmad-output/implementation-artifacts/stories/4-2-generation-safety.md`
- Epic 文件: `epics.md#Epic-4`
- 依赖 Story: Story 4-1（内容审核基础）

---

**实现状态**: ✅ Phase B-3 完成
**下一阶段**: Phase B-4 验证测试
