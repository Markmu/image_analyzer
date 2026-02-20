# Story 7.1: history-management

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 创作者
I want 系统自动保存我的分析历史记录
so that 我可以随时查看之前的分析结果和模版，并基于历史模版创建新的分析

## Acceptance Criteria

1. **AC1:** 系统自动保存用户最近的 **10 次分析记录**（临时历史记录），FIFO 策略（最旧的记录被自动删除）

2. **AC2:** 用户可以浏览其历史分析记录列表，显示以下信息：
   - 分析时间（相对时间，如"2小时前"）
   - 原始图片缩略图
   - 模版摘要（前50字符）
   - 分析状态（成功/失败）

3. **AC3:** 用户可以点击历史记录查看完整的分析结果和模版内容：
   - 四维度分析结果（光影、构图、色彩、艺术风格）
   - 变量模版格式
   - JSON 格式模版

4. **AC4:** 用户可以基于历史记录中的模版创建新的分析：
   - 一键加载模版到分析界面
   - 可编辑后重新生成
   - 不消耗额外 credit（因为只是重新使用模版）

5. **AC5:** 历史记录页面遵循 UX 设计规范：
   - 使用 Glassmorphism 卡片样式（`ia-glass-card`）
   - 使用 Lucide 图标（History, Clock, Eye 等）
   - 响应式布局（移动端/平板端/桌面端）
   - 无限滚动或分页（每页 10 条记录）

6. **AC6:** 历史记录数据持久化到数据库：
   - 使用 `analysis_history` 表存储
   - 关联到 `users` 表（user_id）
   - 关联到 `analysis_results` 表（analysis_result_id）
   - 自动清理机制（保留最近 10 条）

7. **AC7:** 遵循 NFR-SEC-3 授权控制：
   - 用户只能访问自己的历史记录
   - API 路由需要身份验证
   - 数据查询强制过滤 user_id

## Tasks / Subtasks

- [ ] **Task 1: 创建数据库 Schema 和迁移** (AC: 1, 6)
  - [ ] 1.1 定义 `analysis_history` 表结构
  - [ ] 1.2 创建 Drizzle 迁移脚本
  - [ ] 1.3 运行迁移并验证表结构
  - [ ] 1.4 添加自动清理机制（数据库触发器或应用层逻辑）

- [ ] **Task 2: 创建历史记录 API 路由** (AC: 2, 3, 7)
  - [ ] 2.1 创建 `GET /api/history` 端点（获取历史记录列表）
  - [ ] 2.2 创建 `GET /api/history/[id]` 端点（获取单条历史记录详情）
  - [ ] 2.3 创建 `POST /api/history/[id]/reuse` 端点（基于历史模版创建新分析）
  - [ ] 2.4 实现身份验证和授权检查
  - [ ] 2.5 添加分页和排序参数

- [ ] **Task 3: 实现历史记录服务层** (AC: 1, 6)
  - [ ] 3.1 创建 `saveToHistory` 函数（保存分析记录）
  - [ ] 3.2 创建 `getHistoryList` 函数（获取用户历史列表）
  - [ ] 3.3 创建 `getHistoryDetail` 函数（获取单条记录详情）
  - [ ] 3.4 创建 `reuseFromHistory` 函数（基于历史模版创建新分析）
  - [ ] 3.5 实现 FIFO 自动清理逻辑（保留最近 10 条）

- [ ] **Task 4: 创建历史记录 UI 组件** (AC: 2, 5)
  - [ ] 4.1 创建 `HistoryList` 组件（历史记录列表）
  - [ ] 4.2 创建 `HistoryCard` 组件（单条历史记录卡片）
  - [ ] 4.3 创建 `HistoryDetail` 组件（历史记录详情页面）
  - [ ] 4.4 应用 Glassmorphism 样式（`ia-glass-card`）
  - [ ] 4.5 集成 Lucide 图标（History, Clock, Eye, RefreshCw）

- [ ] **Task 5: 实现历史记录页面** (AC: 2, 3, 5)
  - [ ] 5.1 创建 `/history` 页面（历史记录列表页）
  - [ ] 5.2 创建 `/history/[id]` 页面（历史记录详情页）
  - [ ] 5.3 实现响应式布局（移动端/平板端/桌面端）
  - [ ] 5.4 添加加载状态和错误处理

- [ ] **Task 6: 集成历史记录保存逻辑** (AC: 1, 6)
  - [ ] 6.1 在分析完成后自动调用 `saveToHistory`
  - [ ] 6.2 修改 `AnalysisCard` 组件，添加保存到历史逻辑
  - [ ] 6.3 确保只保存成功的分析记录

- [ ] **Task 7: 实现"重新使用模版"功能** (AC: 4)
  - [ ] 7.1 在历史记录详情页添加"重新使用"按钮
  - [ ] 7.2 实现模版加载到分析界面的逻辑
  - [ ] 7.3 添加模版可编辑功能
  - [ ] 7.4 确保不消耗额外 credit（只在上传新图片时扣除）

- [ ] **Task 8: 单元测试和集成测试** (AC: 1-7)
  - [ ] 8.1 测试历史记录保存逻辑（FIFO 清理）
  - [ ] 8.2 测试 API 路由（列表、详情、重新使用）
  - [ ] 8.3 测试授权控制（用户只能访问自己的数据）
  - [ ] 8.4 测试 UI 组件渲染和交互
  - [ ] 8.5 测试响应式布局

- [ ] **Task 9: E2E 测试**
  - [ ] 9.1 测试完整流程：上传 → 分析 → 自动保存到历史
  - [ ] 9.2 测试历史记录列表浏览
  - [ ] 9.3 测试历史记录详情查看
  - [ ] 9.4 测试基于历史模版创建新分析
  - [ ] 9.5 测试 FIFO 自动清理（第 11 条记录删除第 1 条）
  - [ ] 9.6 测试移动端交互

## Dev Notes

### 业务上下文

**Epic 7 目标：** 模版库与历史记录 - 用户可以保存和管理自己的模版和历史分析记录

**Story 7.1 定位：** 第一个故事，实现临时历史记录功能（最近 10 次分析），为后续故事（永久模版库、使用统计）奠定基础

**用户价值：**
- 新手用户：可以随时查看之前的分析结果，学习风格分析
- 专业用户：可以快速复用之前的模版，提升工作效率
- 所有人：不用担心丢失分析结果，提升产品粘性

**与 Story 7-2 的区别：**
- Story 7-1（本故事）：临时历史记录（最近 10 次，FIFO 自动清理）
- Story 7-2：永久模版库（用户主动保存，支持收藏、标签、分类，永久保留）

### 相关功能需求（FR）

- **FR33:** 系统可以保存用户最近的 **10 次分析记录**（临时历史记录）
- **FR34:** 用户可以浏览其历史分析记录
- **FR35:** 用户可以查看历史记录中的分析结果和模版
- **FR36:** 用户可以基于历史记录中的模版创建新的分析

### 架构约束

**技术栈：**
- 前端框架：Next.js 15+ (App Router)
- 状态管理：Zustand（UI 状态）+ React Query（服务器状态）
- UI 组件：MUI + Tailwind CSS（Glassmorphism 样式）
- 图标库：Lucide React（必须使用）
- 数据库：PostgreSQL + Drizzle ORM
- 类型检查：TypeScript

**命名规范：**
- 组件：PascalCase（`HistoryList`, `HistoryCard`, `HistoryDetail`）
- 函数/变量：camelCase（`saveToHistory`, `getHistoryList`）
- 类型/接口：PascalCase（`AnalysisHistory`, `HistoryRecord`）
- 常量：UPPER_SNAKE_CASE（`MAX_HISTORY_RECORDS`）
- 文件名：kebab-case（`history-list.tsx`）

**项目结构：**
```
src/features/history/
├── components/
│   ├── HistoryList/
│   │   ├── index.tsx
│   │   ├── HistoryList.tsx
│   │   ├── HistoryList.test.tsx
│   │   └── types.ts
│   ├── HistoryCard/
│   │   ├── index.tsx
│   │   ├── HistoryCard.tsx
│   │   └── HistoryCard.test.tsx
│   └── HistoryDetail/
│       ├── index.tsx
│       ├── HistoryDetail.tsx
│       └── HistoryDetail.test.tsx
├── hooks/
│   ├── useHistory.ts
│   ├── useHistoryList.ts
│   └── index.ts
├── lib/
│   ├── history-service.ts
│   └── index.ts
└── types/
    └── history.ts

src/app/
├── history/
│   ├── page.tsx           # 历史记录列表页
│   ├── [id]/
│   │   └── page.tsx       # 历史记录详情页
│   └── layout.tsx
└── api/
    └── history/
        ├── route.ts           # GET /api/history (列表)
        ├── [id]/
        │   ├── route.ts       # GET /api/history/[id] (详情)
        │   └── reuse/
        │       └── route.ts   # POST /api/history/[id]/reuse (重新使用)
```

### 数据结构设计

**数据库 Schema（新增 `analysis_history` 表）：**
```typescript
// src/lib/db/schema.ts
import { pgTable, serial, text, timestamp, foreignKey, integer } from 'drizzle-orm/pg-core';

export const analysisHistory = pgTable('analysis_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  analysisResultId: integer('analysis_result_id').notNull().references(() => analysisResults.id),
  templateSnapshot: text('template_snapshot').notNull(), // JSON 字符串存储模版快照
  status: text('status').notNull(), // 'success' | 'failed'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// FIFO 自动清理的触发器（可选）
// 或者使用应用层逻辑在保存时清理
```

**AnalysisHistory 类型：**
```typescript
// src/features/history/types/history.ts
export interface AnalysisHistory {
  id: number;
  userId: number;
  analysisResultId: number;
  templateSnapshot: {
    variableFormat: string;
    jsonFormat: {
      subject: string;
      style: string;
      composition: string;
      colors: string;
      lighting: string;
      additional: string;
    };
  };
  status: 'success' | 'failed';
  createdAt: Date;
}

export interface HistoryRecord extends AnalysisHistory {
  // 关联的分析结果信息（用于显示缩略图等）
  analysisResult?: {
    imageUrl: string;
    analysisData: any;
  };
}

export interface HistoryListParams {
  page?: number;
  limit?: number;
  status?: 'success' | 'failed' | 'all';
}
```

### API 设计

**GET /api/history - 获取历史记录列表**
```typescript
// 查询参数: ?page=1&limit=10&status=success
interface HistoryListResponse {
  success: true;
  data: {
    records: HistoryRecord[];
    total: number;
    page: number;
    limit: number;
  };
}
```

**GET /api/history/[id] - 获取单条历史记录详情**
```typescript
interface HistoryDetailResponse {
  success: true;
  data: HistoryRecord;
}
```

**POST /api/history/[id]/reuse - 基于历史模版创建新分析**
```typescript
// 注意：这个 API 只是返回模版数据，实际的图片上传和分析在后续流程中处理
interface ReuseHistoryResponse {
  success: true;
  data: {
    template: AnalysisHistory['templateSnapshot'];
    message: string;
  };
}
```

### 测试策略

**单元测试：**
- 历史记录保存逻辑（FIFO 清理）
- API 路由处理器（列表、详情、重新使用）
- 授权控制逻辑

**集成测试：**
- UI 组件渲染和交互
- React Query hooks
- 响应式布局

**E2E 测试：**
- 完整流程：上传 → 分析 → 自动保存 → 查看历史 → 重新使用
- FIFO 自动清理（第 11 条记录删除第 1 条）
- 移动端交互

### UI/UX 设计规范

**Glassmorphism 样式：**
- 使用 `ia-glass-card` 类（已在 `src/app/globals.css` 定义）
- 卡片悬停效果：`ia-glass-card:hover`

**图标系统：**
- 历史记录图标：`<History size={20} className="text-blue-500" />`
- 时钟图标：`<Clock size={16} className="text-gray-400" />`
- 查看图标：`<Eye size={16} className="text-green-500" />`
- 重新使用图标：`<RefreshCw size={16} className="text-blue-500" />`
- 必须使用 Lucide 图标库

**响应式设计：**
- 桌面端（≥ 1024px）：三列网格布局（每行 3 个卡片）
- 平板端（768-1024px）：两列网格布局（每行 2 个卡片）
- 移动端（< 768px）：单列布局（每行 1 个卡片）

**加载状态：**
- 使用骨架屏（Skeleton）代替 loading spinner
- 参考 MUI 的 Skeleton 组件

**空状态：**
- 无历史记录时显示友好的空状态提示
- 使用插图和引导文字

### 性能要求

- 历史记录列表加载时间：< 500ms（分页 10 条）
- 历史记录详情加载时间：< 300ms
- 重新使用模版响应时间：< 200ms（只是读取数据）
- FIFO 清理操作：< 100ms

### 安全考虑

- 授权控制：用户只能访问自己的历史记录（NFR-SEC-3）
- API 路由需要身份验证（使用 NextAuth.js session）
- 数据查询强制过滤 user_id（防止越权访问）
- 模版快照需要内容过滤（复用 Story 4.1 的逻辑）

### 依赖关系

**前置依赖：**
- ✅ Epic 1: 用户认证与账户系统（NextAuth.js，user_id）
- ✅ Epic 3: AI 风格分析（`analysis_results` 表和分析数据结构）
- ✅ Epic 5: 模版生成与管理（模版数据结构）

**后置依赖：**
- 🟡 Story 7-2: 永久模版库（扩展本故事的功能）
- 🟡 Story 7-3: 模版使用统计（依赖本历史记录数据）

### 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| FIFO 清理误删重要记录 | 🟡 中 | 🟡 中 | 在删除前提示用户，或提供"导出"功能（Story 7-2） |
| 历史记录列表加载慢 | 🟡 中 | 🟡 中 | 使用分页 + 图片懒加载 + 缓存 |
| 用户误解临时和永久保存 | 🟡 中 | 🟢 低 | 清晰标注"临时历史（最近10次）"，引导用户使用模版库 |
| 移动端体验差 | 🟡 中 | 🟡 中 | 增加移动端测试，优化触摸交互 |
| 数据库存储空间问题 | 🟢 低 | 🟡 中 | FIFO 自动清理，限制 10 条，存储空间可控 |

### 验收测试检查清单

**功能测试：**
- [ ] 分析完成后自动保存到历史记录
- [ ] 历史记录列表正确显示（时间、缩略图、摘要、状态）
- [ ] 历史记录详情正确显示（完整分析结果和模版）
- [ ] 基于历史模版创建新分析功能正常
- [ ] FIFO 自动清理正常（第 11 条记录删除第 1 条）
- [ ] 授权控制正常（用户只能访问自己的数据）

**视觉测试：**
- [ ] Glassmorphism 样式应用正确
- [ ] Lucide 图标显示正确
- [ ] 响应式布局正确（桌面/平板/移动）
- [ ] 加载状态和空状态显示正确

**兼容性测试：**
- [ ] Chrome 浏览器测试通过
- [ ] Safari 浏览器测试通过
- [ ] Firefox 浏览器测试通过
- [ ] 移动端测试通过

**性能测试：**
- [ ] 历史记录列表加载时间 < 500ms
- [ ] 历史记录详情加载时间 < 300ms
- [ ] 重新使用模版响应时间 < 200ms
- [ ] FIFO 清理操作 < 100ms

### 项目结构注意事项

**遵循现有项目结构：**
- 历史记录功能放在 `src/features/history/` 目录
- API 路由放在 `src/app/api/history/` 目录
- 页面路由放在 `src/app/history/` 目录
- 测试文件与源文件同目录

**与现有代码集成：**
- 复用 `src/features/analysis/` 的 `AnalysisResult` 类型
- 复用 `src/features/templates/` 的模版类型
- 复用 `src/lib/db/` 的数据库连接和 Schema
- 复用 `src/components/shared/` 的通用组件
- 复用 `src/lib/replicate/` 的内容过滤逻辑

**数据库集成：**
- 使用现有的 `users` 表（user_id）
- 使用现有的 `analysis_results` 表（analysis_result_id）
- 新增 `analysis_history` 表（本故事创建）

### 参考文档

**PRD:**
- [PRD - 历史记录与库管理](../../planning-artifacts/prd.md#历史记录与库管理)
- [FR33-36](../../planning-artifacts/prd.md#历史记录与库管理)

**Architecture:**
- [架构决策文档](../../planning-artifacts/architecture.md)
- [命名规范](../../planning-artifacts/architecture.md#naming-patterns)
- [项目结构](../../planning-artifacts/architecture.md#project-structure--boundaries)
- [数据库设计](../../planning-artifacts/architecture.md#database-schema--data-model)

**UX Design:**
- [Glassmorphism 指南](../../planning-artifacts/ux-design/13-glassmorphism-guide.md)
- [图标系统](../../planning-artifacts/ux-design/14-icon-system.md)
- [响应式设计](../../planning-artifacts/ux-design-specification.md)

**Previous Stories:**
- [Story 3.1: Style Analysis](./story-3-1-style-analysis.md)（参考分析结果结构）
- [Story 5.1: Template Generation](./story-5-1-template-generation.md)（参考模版数据结构）

### 开发优先级

**P0（核心必需）：**
- Task 1: 数据库 Schema 和迁移
- Task 2: 历史记录 API 路由
- Task 3: 历史记录服务层
- Task 4: 历史记录 UI 组件

**P1（重要）：**
- Task 5: 历史记录页面
- Task 6: 集成历史记录保存逻辑
- Task 8: 单元测试和集成测试

**P2（优化）：**
- Task 7: "重新使用模版"功能（可延后）
- Task 9: E2E 测试

### 技术债务和优化机会

**当前可接受的技术债务：**
- FIFO 清理使用应用层逻辑，未使用数据库触发器（可后续优化）
- 图片缩略图使用原图，未生成专门的缩略图（延迟到性能优化）

**未来优化方向：**
- 支持搜索和过滤历史记录（按时间、按状态、按关键词）
- 支持导出历史记录（CSV 格式）
- 支持批量删除历史记录
- 支持历史记录恢复（误删保护）

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

_待开发时填写_
