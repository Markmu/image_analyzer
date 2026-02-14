# Story 3.3: analysis-progress

Status: completed

Completed: 2026-02-14

---

## 📋 Story

作为一名 **用户**,
我希望 **在分析任务较多时能看到排队等待的情况，并在后台继续处理**,
以便 **无需持续等待页面，知道预计等待时间，任务完成后自动通知我**。

---

## ✅ Acceptance Criteria

1. **[AC-1]** 系统可以在分析任务超过并发限制时将任务加入后台队列
   - Free 用户：最多 1 个并发任务
   - Lite 用户：最多 3 个并发任务
   - Standard 用户：最多 10 个并发任务
   - 超过限制时返回 503 并提示用户选择加入队列或稍后重试

2. **[AC-2]** 系统可以显示当前等待队列中的任务数量
   - 在分析页面显示"当前有 X 个任务正在等待"
   - 实时更新队列长度
   - 队列透明化，让用户知道等待时间

3. **[AC-3]** 系统可以在后台任务完成后通知用户
   - 使用浏览器通知（Web Notifications API）
   - 页面标题闪烁提示
   - 显示"分析完成"的消息

4. **[AC-4]** 系统可以处理用户离开页面的情况
   - 用户离开页面后分析继续进行
   - 返回页面时显示分析状态
   - 支持页面刷新后状态恢复（通过数据库）

5. **[AC-5]** 系统可以优雅地处理高并发场景
   - 返回 503 Service Unavailable
   - UI 显示友好的"服务器繁忙，请稍后再试"消息
   - 提供"加入等待队列"或"稍后重试"选项

6. **[AC-6]** 系统可以在后台处理长时间运行的任务
   - 分析任务改为后台异步处理
   - 使用轮询模式查询任务状态
   - 支持任务取消

---

## 📦 Tasks / Subtasks

### **Task 1: 实现并发控制机制** (AC: 1, 5) ⏱️ 2小时

- [ ] Subtask 1.1: 获取用户订阅等级
  - 位置: `src/lib/analysis/queue.ts`（新建）
  - 函数: `getUserSubscriptionTier(userId)`
  - 从 `user.subscriptionTier` 或 `subscriptions` 表获取
  - 返回: 'free' | 'lite' | 'standard'

- [ ] Subtask 1.2: 实现并发限制检查
  - 函数: `checkQueueCapacity(userId, requiredSlots)`
  - 根据订阅等级返回最大并发数
  - Free: 1, Lite: 3, Standard: 10
  - 返回 503 当超过限制时

- [ ] Subtask 1.3: 实现优雅降级 UI
  - 显示服务器繁忙提示
  - 提供"加入队列"和"稍后重试"选项

### **Task 2: 实现等待队列透明化** (AC: 2) ⏱️ 2小时

- [ ] Subtask 2.1: 创建队列状态 API
  - GET `/api/analysis/queue/status`
  - 返回当前队列长度、用户等待位置
- [ ] Subtask 2.2: 实现队列显示组件
  - 位置: `src/features/analysis/components/QueueStatus/`
  - 组件: `QueueIndicator`, `QueueLength`
- [ ] Subtask 2.3: 实时更新队列状态
  - 使用轮询更新队列长度（每 3 秒）
  - 显示预计等待时间

### **Task 3: 实现后台异步分析** (AC: 3, 6) ⏱️ 2小时

- [ ] Subtask 3.1: 改造分析 API 为异步模式
  - 位置: `src/app/api/analysis/route.ts`
  - POST 请求立即返回任务 ID，状态为 'pending' | 'processing'
  - 不再同步等待分析完成
- [ ] Subtask 3.2: 实现后台任务执行
  - 使用 `queueMicrotask` 或 setTimeout 延迟执行
  - 任务完成后更新状态为 'completed'
- [ ] Subtask 3.3: 实现任务状态轮询
  - 客户端每 3 秒轮询 `/api/analysis/[id]/status`
  - 获取最新任务状态和结果

### **Task 4: 实现任务完成通知** (AC: 3) ⏱️ 2小时

- [ ] Subtask 4.1: 实现浏览器通知
  - 使用 Web Notifications API
  - 请求用户授权
  - 发送通知
- [ ] Subtask 4.2: 实现页面标题闪烁
  - 使用 title 变化提示用户
  - 支持不同状态提示
- [ ] Subtask 4.3: 实现通知偏好设置
  - 允许用户开启/关闭通知
  - 记住用户偏好（存储在用户设置中）

### **Task 5: 实现页面离开后继续处理** (AC: 4) ⏱️ 2小时

- [ ] Subtask 5.1: 实现服务器端任务跟踪
  - 使用 `batch_analysis_results` 表存储任务状态
  - 支持页面刷新后从数据库恢复
- [ ] Subtask 5.2: 实现状态恢复 API
  - 页面加载时调用 `/api/analysis/batch/[id]/status`
  - 恢复任务状态显示
- [ ] Subtask 5.3: 实现页面可见性处理
  - 使用 Page Visibility API
  - 页面重新可见时刷新状态

### **Task 6: 集成队列管理与批量分析** (AC: 1, 2, 3) ⏱️ 1小时

- [ ] Subtask 6.1: 修改批量分析 API 集成队列
  - POST `/api/analysis/batch` 集成队列检查
  - 返回队列状态信息
- [ ] Subtask 6.2: 修改单图分析 API 集成队列
  - POST `/api/analysis` 集成队列检查
- [ ] Subtask 6.3: 更新前端组件集成队列状态
  - 复用 Story 3-2 的进度组件
  - 添加队列状态显示

### **Task 7: 编写单元测试和 E2E 测试** ⏱️ 2小时

- [ ] Subtask 7.1: 测试队列管理服务
  - 并发限制测试
  - 队列添加/移除测试
- [ ] Subtask 7.2: 测试超时处理
  - 超时检测测试
  - 自动入队测试
- [ ] Subtask 7.3: 测试通知功能
  - 通知授权测试
  - 通知发送测试
- [ ] Subtask 7.4: E2E 测试完整流程
  - 高并发场景测试
  - 页面离开/返回测试

---

## 🛠️ Dev Notes

### 🔴 Critical Architecture Requirements

1. **复用现有组件**:
   - ⚡ 使用 Story 3-2 的批量分析组件
   - ⚡ 使用 Story 2-4 的 ProgressDisplay 组件
   - ⚡ 复用 Story 3-1 的分析逻辑

2. **队列实现 - 内存队列**:
   - 使用内存队列存储活跃任务（适合 MVP）
   - 使用 `batch_analysis_results` 表持久化任务状态
   - 不使用 Redis（MVP 阶段不需要分布式队列）

3. **后台异步处理**:
   - 分析 API 改为异步模式：立即返回任务 ID，后台执行
   - 客户端使用轮询（每 3 秒）获取任务状态
   - 不使用 SSE（简化实现）

4. **通知机制**:
   - 主要使用 Web Notifications API
   - 降级方案：页面标题闪烁
   - 不实现邮件通知（超出 MVP 范围）

5. **状态持久化**:
   - 使用 `batch_analysis_results` 表存储任务状态
   - 支持页面刷新后通过 API 恢复
   - 任务完成后清除前端状态

6. **使用 console 而非 logger**:
   - ⚡ 项目中没有统一的 logger 工具
   - 使用 `console.error()` 记录错误

7. **获取用户订阅等级**:
   - 从 `user.subscriptionTier` 字段获取
   - 或查询 `subscriptions` 表获取当前订阅
   - 默认值: 'free'

---

### Dependencies

**依赖图:**
```
Epic 2 (图片上传) ✅ 已完成
  ├─ Story 2-1 (图片上传) ✅
  ├─ Story 2-2 (批量上传) ✅
  ├─ Story 2-3 (上传验证) ✅
  └─ Story 2-4 (进度反馈) ✅ → 复用组件

Epic 3 (AI 风格分析)
  ├─ Story 3-1 (风格分析) ✅ → 复用分析逻辑
  ├─ Story 3-2 (批量分析) ✅ → 复用 API
  └─ Story 3-3 (分析进度) ← 当前
        ↓
  后续 Stories 依赖:
  ├─ Story 3-4 (视觉模型集成) → 队列集成
  └─ Story 3-5 (置信度评分) → 队列集成
```

**依赖的外部服务:**
- Replicate API（视觉模型）
- PostgreSQL（数据存储）

---

### 📐 Database Schema

**扩展现有 `batch_analysis_results` 表** (Story 3-2 已创建):

```typescript
// src/lib/db/schema.ts - 扩展现有表

// 批量分析记录表（已有，添加队列相关字段）
export const batchAnalysisResults = pgTable('batch_analysis_results', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  mode: text('mode').notNull(), // 'serial' | 'parallel'
  totalImages: integer('total_images').notNull(),
  completedImages: integer('completed_images').notNull().default(0),
  failedImages: integer('failed_images').notNull().default(0),
  status: text('status').notNull(), // 'pending' | 'processing' | 'completed' | 'partial' | 'failed'
  creditUsed: integer('credit_used').notNull(),

  // === 新增字段 ===
  queuePosition: integer('queue_position'), // 队列位置
  estimatedWaitTime: integer('estimated_wait_time'), // 预计等待秒数
  isQueued: boolean('is_queued').notNull().default(false), // 是否在队列中
  queuedAt: timestamp('queued_at'), // 入队时间

  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});
```

**单图分析也使用同一表记录**:
- 单图分析的 `totalImages = 1`，`mode = 'single'`
- 使用 `status` 字段区分: 'pending' → 'processing' → 'completed' | 'failed'

---

### 🔧 API 端点设计

**改造现有 API:**

**POST `/api/analysis` (改造)**
```typescript
// 请求
{ "imageId": "xxx" }

// 响应 - 异步模式
{
  "success": true,
  "data": {
    "analysisId": 100,
    "status": "processing", // 或 "completed" (快速完成时)
    "message": "分析已开始"
  }
}

// 响应 - 队列满时
{
  "success": false,
  "error": {
    "code": "QUEUE_FULL",
    "message": "服务器繁忙，当前有 X 个任务正在处理",
    "data": {
      "queuePosition": 2,
      "estimatedWaitTime": 120
    }
  }
}
```

**GET `/api/analysis/[id]/status` (已有，扩展)**
```typescript
// 响应
{
  "success": true,
  "data": {
    "id": 100,
    "status": "processing", // pending | processing | completed | failed
    "progress": {
      "completed": 0,
      "total": 1
    },
    "result": null, // 分析完成时返回
    "error": null // 失败时返回错误信息
  }
}
```

**GET `/api/analysis/queue/status`**
```typescript
// 响应
{
  "success": true,
  "data": {
    "queueLength": 5,
    "userPosition": 2,
    "estimatedWaitTime": 120,
    "currentProcessing": 3,
    "maxConcurrent": 10
  }
}
```

---

### 🔧 Notification Implementation

**浏览器通知:**
```typescript
// 请求权限
if (Notification.permission === 'default') {
  await Notification.requestPermission();
}

// 发送通知
if (Notification.permission === 'granted') {
  new Notification('分析完成', {
    body: '您的图片分析已完成',
    tag: 'analysis-complete'
  });
}
```

**页面标题闪烁:**
```typescript
function flashTitle(message: string) {
  const original = document.title;
  const interval = setInterval(() => {
    document.title = document.title === message ? original : message;
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    document.title = original;
  }, 5000);
}
```

---

### 🔧 Queue Processing Logic

**异步分析流程:**
```
1. 用户发起分析请求
   ↓
2. POST /api/analysis
   ↓
3. 检查并发限制
   ├─ 有可用槽位 → 创建任务，返回 'processing'
   └─ 无可用槽位 → 返回 503 (QUEUE_FULL)
   ↓
4. 客户端轮询状态
   - 每 3 秒调用 GET /api/analysis/[id]/status
   - 显示进度
   ↓
5. 任务完成
   - 更新状态为 'completed'
   - 发送浏览器通知
   - 页面标题闪烁
   ↓
6. 页面刷新恢复
   - 从数据库加载任务状态
   - 显示最新状态
```

---

### 📊 Performance Monitoring

**性能监控要求:**
- 记录队列平均等待时间
- 记录队列最长等待时间
- 记录超时任务数量
- 监控并发槽位利用率

**告警阈值:**
- 队列等待时间 > 5 分钟
- 超时任务 > 10%
- 并发槽位利用率 > 90%

---

### 🧪 Test Data

**测试队列:**
```typescript
// Free 用户测试
const freeUser = { tier: 'free', maxConcurrent: 1 };

// Lite 用户测试
const liteUser = { tier: 'lite', maxConcurrent: 3 };

// Standard 用户测试
const standardUser = { tier: 'standard', maxConcurrent: 10 };
```

---

### 🔧 Environment Variables

**无需新增环境变量** - 复用已有配置:
```bash
# 已有配置
REPLICATE_API_TOKEN=r8_xxx...
REPLICATE_VISION_MODEL_ID=yorickvp/llava-13b:xxx
DATABASE_URL=postgres://...
```

---

### Testing Requirements

**单元测试:**
- 队列管理服务测试
- 并发限制测试
- 超时处理测试
- 通知功能测试

**E2E 测试:**
- 高并发场景测试
- 页面离开/返回测试
- 通知触发测试

**集成测试:**
- 队列与批量分析集成
- 队列与单图分析集成

---

### Previous Story Intelligence

**从 Story 3-2 学到的经验:**
- 批量分析 API 已实现 (`POST /api/analysis/batch`)
- 进度显示组件已完善
- Credit 扣除逻辑已集成
- `batch_analysis_results` 表已创建
- 需要复用这些组件和 API

**从 Story 3-1 学到的经验:**
- Replicate API 可能有延迟
- 需要异步处理机制
- 必须集成 Credit 系统
- 必须检查内容安全

**从 Story 2-4 学到的经验:**
- ProgressDisplay 组件支持实时进度更新
- 轮询模式工作正常

**新增考虑:**
- 队列需要持久化到数据库（支持页面刷新）
- 通知需要用户授权
- 需要处理不同订阅等级的并发限制

---

### References

- [Source: prd.md#FR78] (后台队列处理)
- [Source: prd.md#FR79] (队列透明化)
- [Source: prd.md#FR62] (分析超时处理)
- [Source: prd.md#NFR-CONCURRENCY] (并发限制)
- [Source: prd.md#FR61] (自动重试)
- [Source: architecture.md#API-Communication] (API 设计规范)
- [Source: architecture.md#Naming-Patterns] (命名规范)
- [Source: epics.md#Epic-3] (Epic 3 完整需求)
- [Source: Story 3-2] (批量分析实现参考)
- [Source: Story 3-1] (单图分析实现参考)
- [Source: Story 2-4] (进度反馈组件)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
