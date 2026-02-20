# Story 7.2: template-library

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 创作者
I want 将有价值的模版永久保存到个人模版库，并为模版添加收藏、标签和分类
so that 我可以长期管理和快速复用这些模版，并查看基于每个模版生成的所有历史图片和使用统计

## Acceptance Criteria

1. **AC1:** 用户可以在分析结果页面选择将特定模版**永久保存**到个人模版库（FR37, FR65）
   - 提供"保存到模版库"按钮（与临时历史记录的自动保存区分）
   - 保存时可以添加标题和描述（可选）
   - 保存后显示确认提示

2. **AC2:** 用户可以浏览其个人模版库，显示以下信息：
   - 模版标题/描述（如果提供）
   - 模版摘要（前50字符）
   - 标签和分类（见 AC4）
   - 收藏状态（星标图标）
   - 使用次数统计（见 AC6）
   - 创建时间（相对时间）
   - 关联的原始图片缩略图

3. **AC3:** 用户可以点击模版查看完整的模版内容：
   - 变量模版格式
   - JSON 格式模版
   - 关联的分析结果（四维度分析）
   - 基于此模版生成的所有历史图片（FR69）

4. **AC4:** 用户可以为模版添加自定义标签或分类（FR40）：
   - 标签数量：单个模版最多 10 个标签
   - 标签长度：每个标签最多 20 个字符
   - 分类层级：支持两级分类（父分类/子分类）
   - 支持自动补全已有标签和分类
   - 支持创建新标签和分类

5. **AC5:** 用户可以收藏/标记特定的模版以便快速访问（FR38）：
   - 点击星标图标切换收藏状态
   - 收藏的模版在列表中优先显示
   - 支持过滤只显示收藏的模版

6. **AC6:** 用户可以基于收藏的模版一键重新生成图片（FR39）：
   - 提供"重新生成"按钮
   - 直接使用模版调用生图 API
   - 消耗相应 credit（因为实际生成了新图片）
   - 生成的图片自动关联到此模版（用于 FR69 统计）

7. **AC7:** 用户可以查看每个模版的使用次数统计（FR70）：
   - 显示"已使用 X 次"
   - 点击可查看基于此模版生成的所有历史图片（FR69）
   - 历史图片以缩略图网格形式展示，支持点击查看大图

8. **AC8:** 用户可以编辑和删除已保存的模版：
   - 编辑：修改标题、描述、标签、分类
   - 删除：删除模版（但不删除已生成的图片）
   - 删除前显示确认对话框

9. **AC9:** 模版库页面遵循 UX 设计规范：
   - 使用 Glassmorphism 卡片样式（`ia-glass-card`）
   - 使用 Lucide 图标（Star, Tag, Folder, Image, TrendingUp 等）
   - 响应式布局（移动端/平板端/桌面端）
   - 支持搜索、过滤和排序功能

10. **AC10:** 模版库数据持久化到数据库：
    - 使用 `templates` 表存储（需扩展，见 Dev Notes）
    - 关联到 `users` 表（user_id）
    - 关联到 `analysis_results` 表（analysis_result_id）
    - 关联到 `generations` 表（用于 FR69 统计）

11. **AC11:** 遵循 NFR-SEC-3 授权控制：
    - 用户只能访问自己的模版库
    - API 路由需要身份验证
    - 数据查询强制过滤 user_id

## Tasks / Subtasks

- [ ] **Task 1: 扩展数据库 Schema 和迁移** (AC: 1, 10)
  - [ ] 1.1 扩展 `templates` 表结构（添加收藏、标签、分类字段）
  - [ ] 1.2 创建 `template_tags` 表（标签管理）
  - [ ] 1.3 创建 `template_categories` 表（分类管理）
  - [ ] 1.4 创建 `template_generations` 表（模版与生成图片的关联）
  - [ ] 1.5 创建 Drizzle 迁移脚本
  - [ ] 1.6 运行迁移并验证表结构

- [ ] **Task 2: 创建模版库 API 路由** (AC: 2, 3, 7, 8, 11)
  - [ ] 2.1 创建 `POST /api/templates` 端点（保存模版到库）
  - [ ] 2.2 创建 `GET /api/templates` 端点（获取模版库列表）
  - [ ] 2.3 创建 `GET /api/templates/[id]` 端点（获取模版详情）
  - [ ] 2.4 创建 `PATCH /api/templates/[id]` 端点（编辑模版）
  - [ ] 2.5 创建 `DELETE /api/templates/[id]` 端点（删除模版）
  - [ ] 2.6 创建 `POST /api/templates/[id]/favorite` 端点（切换收藏状态）
  - [ ] 2.7 创建 `GET /api/templates/[id]/generations` 端点（获取基于此模版的生成图片）
  - [ ] 2.8 创建 `POST /api/templates/[id]/regenerate` 端点（基于模版重新生成图片）
  - [ ] 2.9 实现身份验证和授权检查
  - [ ] 2.10 添加搜索、过滤和排序参数

- [ ] **Task 3: 实现模版库服务层** (AC: 1, 6, 10)
  - [ ] 3.1 创建 `saveToLibrary` 函数（保存模版到库）
  - [ ] 3.2 创建 `getTemplateLibrary` 函数（获取用户模版库列表）
  - [ ] 3.3 创建 `getTemplateDetail` 函数（获取模版详情）
  - [ ] 3.4 创建 `updateTemplate` 函数（编辑模版）
  - [ ] 3.5 创建 `deleteTemplate` 函数（删除模版）
  - [ ] 3.6 创建 `toggleFavorite` 函数（切换收藏状态）
  - [ ] 3.7 创建 `getTemplateGenerations` 函数（获取基于此模版的生成图片）
  - [ ] 3.8 创建 `regenerateFromTemplate` 函数（基于模版重新生成图片）
  - [ ] 3.9 实现标签和分类管理逻辑

- [ ] **Task 4: 创建模版库 UI 组件** (AC: 2, 5, 9)
  - [ ] 4.1 创建 `TemplateLibrary` 组件（模版库列表页面）
  - [ ] 4.2 创建 `TemplateCard` 组件（单个模版卡片）
  - [ ] 4.3 创建 `TemplateDetail` 组件（模版详情页面）
  - [ ] 4.4 创建 `TemplateEditor` 组件（编辑模版表单）
  - [ ] 4.5 创建 `TagManager` 组件（标签管理）
  - [ ] 4.6 创建 `CategoryManager` 组件（分类管理）
  - [ ] 4.7 创建 `FavoriteButton` 组件（收藏按钮）
  - [ ] 4.8 创建 `UsageStats` 组件（使用统计展示）
  - [ ] 4.9 创建 `GenerationGallery` 组件（生成图片画廊）
  - [ ] 4.10 应用 Glassmorphism 样式（`ia-glass-card`）
  - [ ] 4.11 集成 Lucide 图标（Star, Tag, Folder, Image, TrendingUp, Edit, Trash, RefreshCw）

- [ ] **Task 5: 实现模版库页面和路由** (AC: 2, 3, 9)
  - [ ] 5.1 创建 `/templates` 页面（模版库列表页）
  - [ ] 5.2 创建 `/templates/[id]` 页面（模版详情页）
  - [ ] 5.3 创建 `/templates/[id]/edit` 页面（编辑模版页）
  - [ ] 5.4 实现搜索、过滤和排序功能
  - [ ] 5.5 实现响应式布局（移动端/平板端/桌面端）
  - [ ] 5.6 添加加载状态和错误处理

- [ ] **Task 6: 集成"保存到模版库"功能** (AC: 1)
  - [ ] 6.1 在分析结果页面添加"保存到模版库"按钮
  - [ ] 6.2 实现保存对话框（标题、描述、标签、分类输入）
  - [ ] 6.3 修改 `AnalysisCard` 组件，添加保存到模版库逻辑
  - [ ] 6.4 确保保存后显示确认提示

- [ ] **Task 7: 实现"基于模版重新生成"功能** (AC: 6)
  - [ ] 7.1 在模版详情页添加"重新生成"按钮
  - [ ] 7.2 实现调用生图 API 的逻辑
  - [ ] 7.3 确保扣除相应 credit
  - [ ] 7.4 将生成的图片关联到此模版（更新 `template_generations` 表）

- [ ] **Task 8: 实现模版使用统计功能** (AC: 7, 8)
  - [ ] 8.1 在生图完成时更新 `template_generations` 表
  - [ ] 8.2 计算每个模版的使用次数
  - [ ] 8.3 在模版卡片上显示使用统计
  - [ ] 8.4 实现点击查看所有生成图片的功能

- [ ] **Task 9: 实现搜索、过滤和排序功能** (AC: 9)
  - [ ] 9.1 实现关键词搜索（标题、描述、标签）
  - [ ] 9.2 实现过滤功能（收藏状态、分类、标签）
  - [ ] 9.3 实现排序功能（创建时间、使用次数、标题）
  - [ ] 9.4 优化搜索性能（数据库索引）

- [ ] **Task 10: 单元测试和集成测试** (AC: 1-11)
  - [ ] 10.1 测试模版库保存逻辑
  - [ ] 10.2 测试 API 路由（列表、详情、编辑、删除、收藏、重新生成）
  - [ ] 10.3 测试授权控制（用户只能访问自己的数据）
  - [ ] 10.4 测试标签和分类管理逻辑
  - [ ] 10.5 测试 UI 组件渲染和交互
  - [ ] 10.6 测试搜索、过滤和排序功能
  - [ ] 10.7 测试使用统计计算逻辑

- [ ] **Task 11: E2E 测试**
  - [ ] 11.1 测试完整流程：分析 → 保存到模版库 → 查看模版库
  - [ ] 11.2 测试模版编辑功能（标题、描述、标签、分类）
  - [ ] 11.3 测试收藏/取消收藏功能
  - [ ] 11.4 测试基于模版重新生成图片
  - [ ] 11.5 测试查看模版的生成图片历史
  - [ ] 11.6 测试模版删除功能
  - [ ] 11.7 测试搜索、过滤和排序功能
  - [ ] 11.8 测试移动端交互

## Dev Notes

### 业务上下文

**Epic 7 目标：** 模版库与历史记录 - 用户可以保存和管理自己的模版和历史分析记录

**Story 7.2 定位：** 第二个故事，实现永久模版库功能（用户主动保存，支持收藏、标签、分类，永久保留）

**用户价值：**
- 新手用户：可以将喜欢的模版永久保存，避免被临时历史的 FIFO 清理删除
- 专业用户：可以建立个人风格模版库，通过标签和分类管理大量模版
- 高频用户：可以快速找到最常用的模版（收藏功能），一键生成新图片
- 所有人：可以查看每个模版的使用统计，了解哪些模版最有效

**与 Story 7-1 的区别：**
- **Story 7-1（已完成）：** 临时历史记录（最近 10 次，FIFO 自动清理，系统自动保存）
- **Story 7-2（本故事）：** 永久模版库（用户主动保存，支持收藏、标签、分类，永久保留，使用统计）

**与 Story 7-3 的关系：**
- **Story 7-2（本故事）：** 永久模版库基础功能（保存、管理、查看）
- **Story 7-3（后续）：** 模版分析统计（更高级的统计、趋势分析、推荐）

### 相关功能需求（FR）

- **FR37:** 用户可以将分析生成的模版**永久保存**到个人模版库
- **FR38:** 用户可以收藏/标记特定的模版以便快速访问
- **FR39:** 用户可以基于收藏的模版**一键重新生成**图片
- **FR40:** 用户可以为模版添加自定义标签或分类（最多 10 个标签，每个最多 20 字符，两级分类）
- **FR65:** 用户可以在分析结果页面选择将特定模版保存到个人模版库
- **FR69:** 用户可以查看其使用模版生成的**所有历史图片**
- **FR70:** 用户可以查看每个模版的使用次数统计

### 架构约束

**技术栈：**
- 前端框架：Next.js 15+ (App Router)
- 状态管理：Zustand（UI 状态）+ React Query（服务器状态）
- UI 组件：MUI + Tailwind CSS（Glassmorphism 样式）
- 图标库：Lucide React（必须使用）
- 数据库：PostgreSQL + Drizzle ORM
- 类型检查：TypeScript

**命名规范：**
- 组件：PascalCase（`TemplateLibrary`, `TemplateCard`, `TemplateDetail`, `TagManager`）
- 函数/变量：camelCase（`saveToLibrary`, `getTemplateLibrary`, `toggleFavorite`）
- 类型/接口：PascalCase（`SavedTemplate`, `TemplateTag`, `TemplateCategory`）
- 常量：UPPER_SNAKE_CASE（`MAX_TAGS_PER_TEMPLATE`, `MAX_TAG_LENGTH`）
- 文件名：kebab-case（`template-library.tsx`, `tag-manager.tsx`）

**项目结构：**
```
src/features/templates/
├── components/
│   ├── TemplateLibrary/
│   │   ├── index.tsx
│   │   ├── TemplateLibrary.tsx
│   │   ├── TemplateLibrary.test.tsx
│   │   └── types.ts
│   ├── TemplateCard/
│   │   ├── index.tsx
│   │   ├── TemplateCard.tsx
│   │   └── TemplateCard.test.tsx
│   ├── TemplateDetail/
│   │   ├── index.tsx
│   │   ├── TemplateDetail.tsx
│   │   └── TemplateDetail.test.tsx
│   ├── TemplateEditor/
│   │   ├── index.tsx
│   │   ├── TemplateEditor.tsx
│   │   └── TemplateEditor.test.tsx
│   ├── TagManager/
│   │   ├── index.tsx
│   │   ├── TagManager.tsx
│   │   └── TagManager.test.tsx
│   ├── CategoryManager/
│   │   ├── index.tsx
│   │   ├── CategoryManager.tsx
│   │   └── CategoryManager.test.tsx
│   ├── FavoriteButton/
│   │   ├── index.tsx
│   │   ├── FavoriteButton.tsx
│   │   └── FavoriteButton.test.tsx
│   ├── UsageStats/
│   │   ├── index.tsx
│   │   ├── UsageStats.tsx
│   │   └── UsageStats.test.tsx
│   └── GenerationGallery/
│       ├── index.tsx
│       ├── GenerationGallery.tsx
│       └── GenerationGallery.test.tsx
├── hooks/
│   ├── useTemplateLibrary.ts
│   ├── useTemplateDetail.ts
│   ├── useTemplateActions.ts
│   └── index.ts
├── lib/
│   ├── template-library-service.ts
│   ├── tag-manager.ts
│   ├── category-manager.ts
│   └── index.ts
└── types/
    ├── library.ts
    ├── tag.ts
    ├── category.ts
    └── index.ts

src/app/
├── templates/
│   ├── page.tsx           # 模版库列表页
│   ├── [id]/
│   │   ├── page.tsx       # 模版详情页
│   │   └── edit/
│   │       └── page.tsx   # 编辑模版页
│   └── layout.tsx
└── api/
    └── templates/
        ├── route.ts           # GET /api/templates (列表), POST /api/templates (保存)
        ├── [id]/
        │   ├── route.ts       # GET /api/templates/[id] (详情), PATCH /api/templates/[id] (编辑), DELETE /api/templates/[id] (删除)
        │   ├── favorite/
        │   │   └── route.ts   # POST /api/templates/[id]/favorite (切换收藏)
        │   ├── generations/
        │   │   └── route.ts   # GET /api/templates/[id]/generations (生成图片历史)
        │   └── regenerate/
        │       └── route.ts   # POST /api/templates/[id]/regenerate (重新生成)
```

### 数据结构设计

**数据库 Schema（新增和扩展表）：**

```typescript
// src/lib/db/schema.ts

// ============================================================================
// 模版库表 (templates) - Epic 7: Story 7-2 永久模版库
// ============================================================================
export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  analysisResultId: integer('analysis_result_id').notNull().references(() => analysisResults.id, { onDelete: 'cascade' }),

  // 模版基本信息
  title: varchar('title', { length: 200 }), // 用户自定义标题
  description: text('description'), // 用户自定义描述

  // 模版内容（快照，避免原始分析结果被删除）
  templateSnapshot: jsonb('template_snapshot').notNull(), // 与 Story 7-1 相同的结构

  // 收藏和组织
  isFavorite: boolean('is_favorite').notNull().default(false), // 收藏状态

  // 使用统计（冗余字段，优化查询性能）
  usageCount: integer('usage_count').notNull().default(0), // 使用次数（FR70）

  // 时间戳
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('templates_user_id_idx').on(table.userId),
  analysisResultIdIdx: index('templates_analysis_result_id_idx').on(table.analysisResultId),
  isFavoriteIdx: index('templates_is_favorite_idx').on(table.isFavorite),
  usageCountIdx: index('templates_usage_count_idx').on(table.usageCount),
  createdAtIdx: index('templates_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// 模版标签表 (template_tags) - Epic 7: Story 7-2 标签管理
// ============================================================================
export const templateTags = pgTable('template_tags', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 20 }).notNull(), // 标签内容（最多 20 字符）
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  templateIdIdx: index('template_tags_template_id_idx').on(table.templateId),
  tagIdx: index('template_tags_tag_idx').on(table.tag),
}));

// ============================================================================
// 模版分类表 (template_categories) - Epic 7: Story 7-2 分类管理
// ============================================================================
export const templateCategories = pgTable('template_categories', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  parentCategory: varchar('parent_category', { length: 50 }), // 父分类
  childCategory: varchar('child_category', { length: 50 }), // 子分类
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  templateIdIdx: index('template_categories_template_id_idx').on(table.templateId),
  parentCategoryIdx: index('template_categories_parent_category_idx').on(table.parentCategory),
}));

// ============================================================================
// 模版生成关联表 (template_generations) - Epic 7: Story 7-2 使用统计（FR69, FR70）
// ============================================================================
export const templateGenerations = pgTable('template_generations', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  generationId: integer('generation_id').notNull().references(() => generations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  templateIdIdx: index('template_generations_template_id_idx').on(table.templateId),
  generationIdIdx: index('template_generations_generation_id_idx').on(table.generationId),
}));
```

**TypeScript 类型定义：**

```typescript
// src/features/templates/types/library.ts
export interface SavedTemplate {
  id: number;
  userId: string;
  analysisResultId: number;
  title: string | null;
  description: string | null;
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
  isFavorite: boolean;
  usageCount: number;
  tags: string[];
  categories: Array<{
    parent: string | null;
    child: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateLibraryParams {
  page?: number;
  limit?: number;
  search?: string; // 关键词搜索
  tags?: string[]; // 按标签过滤
  categories?: Array<{ parent?: string; child?: string }>; // 按分类过滤
  isFavorite?: boolean; // 按收藏状态过滤
  sortBy?: 'createdAt' | 'usageCount' | 'title'; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
}

export interface SaveToLibraryInput {
  analysisResultId: number;
  title?: string;
  description?: string;
  tags?: string[];
  category?: {
    parent?: string;
    child?: string;
  };
}

export interface UpdateTemplateInput {
  title?: string;
  description?: string;
  tags?: string[];
  category?: {
    parent?: string;
    child?: string;
  };
}
```

### API 设计

**POST /api/templates - 保存模版到库**
```typescript
interface SaveToLibraryRequest {
  analysisResultId: number;
  title?: string;
  description?: string;
  tags?: string[];
  category?: {
    parent?: string;
    child?: string;
  };
}

interface SaveToLibraryResponse {
  success: true;
  data: {
    template: SavedTemplate;
    message: string;
  };
}
```

**GET /api/templates - 获取模版库列表**
```typescript
// 查询参数: ?page=1&limit=10&search=portrait&isFavorite=true&sortBy=usageCount&sortOrder=desc
interface TemplateLibraryResponse {
  success: true;
  data: {
    templates: SavedTemplate[];
    total: number;
    page: number;
    limit: number;
  };
}
```

**GET /api/templates/[id] - 获取模版详情**
```typescript
interface TemplateDetailResponse {
  success: true;
  data: {
    template: SavedTemplate;
    analysisResult?: {
      imageUrl: string;
      analysisData: any;
    };
  };
}
```

**PATCH /api/templates/[id] - 编辑模版**
```typescript
interface UpdateTemplateRequest {
  title?: string;
  description?: string;
  tags?: string[];
  category?: {
    parent?: string;
    child?: string;
  };
}

interface UpdateTemplateResponse {
  success: true;
  data: {
    template: SavedTemplate;
  };
}
```

**DELETE /api/templates/[id] - 删除模版**
```typescript
interface DeleteTemplateResponse {
  success: true;
  data: {
    message: string;
  };
}
```

**POST /api/templates/[id]/favorite - 切换收藏状态**
```typescript
interface ToggleFavoriteResponse {
  success: true;
  data: {
    template: SavedTemplate;
    isFavorite: boolean;
  };
}
```

**GET /api/templates/[id]/generations - 获取基于此模版的生成图片**
```typescript
interface TemplateGenerationsResponse {
  success: true;
  data: {
    generations: Array<{
      id: number;
      imageUrl: string;
      createdAt: Date;
    }>;
    total: number;
  };
}
```

**POST /api/templates/[id]/regenerate - 基于模版重新生成图片**
```typescript
interface RegenerateFromTemplateResponse {
  success: true;
  data: {
    generationId: number;
    message: string;
  };
}
```

### 测试策略

**单元测试：**
- 模版库保存逻辑
- API 路由处理器（列表、详情、编辑、删除、收藏、重新生成）
- 标签和分类管理逻辑
- 授权控制逻辑
- 搜索、过滤和排序逻辑

**集成测试：**
- UI 组件渲染和交互
- React Query hooks
- 响应式布局

**E2E 测试：**
- 完整流程：分析 → 保存到模版库 → 查看模版库 → 编辑模版 → 重新生成
- 收藏功能
- 标签和分类管理
- 使用统计展示
- 搜索、过滤和排序
- 移动端交互

### UI/UX 设计规范

**Glassmorphism 样式：**
- 使用 `ia-glass-card` 类（已在 `src/app/globals.css` 定义）
- 卡片悬停效果：`ia-glass-card:hover`
- 收藏模版的卡片使用金色边框高亮

**图标系统：**
- 收藏图标：`<Star size={20} className={isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />`
- 标签图标：`<Tag size={16} className="text-blue-500" />`
- 分类图标：`<Folder size={16} className="text-purple-500" />`
- 图片图标：`<Image size={16} className="text-green-500" />`
- 统计图标：`<TrendingUp size={16} className="text-orange-500" />`
- 编辑图标：`<Edit size={16} className="text-gray-500" />`
- 删除图标：`<Trash size={16} className="text-red-500" />`
- 重新生成图标：`<RefreshCw size={16} className="text-blue-500" />`
- 必须使用 Lucide 图标库

**响应式设计：**
- 桌面端（≥ 1024px）：三列网格布局（每行 3 个卡片）
- 平板端（768-1024px）：两列网格布局（每行 2 个卡片）
- 移动端（< 768px）：单列布局（每行 1 个卡片）

**加载状态：**
- 使用骨架屏（Skeleton）代替 loading spinner
- 参考 MUI 的 Skeleton 组件

**空状态：**
- 无模版时显示友好的空状态提示
- 使用插图和引导文字："还没有保存任何模版，快去分析图片并保存喜欢的模版吧！"

**搜索、过滤和排序：**
- 搜索框：固定在页面顶部
- 过滤器：侧边栏或折叠面板（桌面端/移动端）
- 排序：下拉选择框

### 性能要求

- 模版库列表加载时间：< 500ms（分页 12 条）
- 模版详情加载时间：< 300ms
- 保存到模版库响应时间：< 200ms
- 标签自动补全响应时间：< 100ms
- 搜索响应时间：< 300ms
- 重新生成图片响应时间：< 1 秒（启动生图）

### 安全考虑

- 授权控制：用户只能访问自己的模版库（NFR-SEC-3）
- API 路由需要身份验证（使用 NextAuth.js session）
- 数据查询强制过滤 user_id（防止越权访问）
- 标签和分类需要输入验证（长度、格式）
- 模版快照需要内容过滤（复用 Story 4.1 的逻辑）

### 依赖关系

**前置依赖：**
- ✅ Epic 1: 用户认证与账户系统（NextAuth.js，user_id）
- ✅ Epic 3: AI 风格分析（`analysis_results` 表和分析数据结构）
- ✅ Epic 5: 模版生成与管理（模版数据结构）
- ✅ Epic 6: AI 图片生成（`generations` 表，用于关联生成图片）
- ✅ Story 7-1: 历史管理（参考临时历史记录的实现模式）

**后置依赖：**
- 🟡 Story 7-3: 模版分析统计（依赖本故事的使用统计数据）

### 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| 用户保存大量模版导致性能问题 | 🟡 中 | 🟡 中 | 使用分页、懒加载、数据库索引优化 |
| 标签和分类管理复杂度 | 🟡 中 | 🟢 低 | 提供预设标签和分类，限制用户自定义数量 |
| 用户不理解临时和永久保存的区别 | 🟡 中 | 🟢 低 | 清晰标注"临时历史（最近10次）"和"永久模版库" |
| 模版删除导致生成图片关联失效 | 🟢 低 | 🟡 中 | 模版删除时不删除生成图片，只删除关联 |
| 移动端体验差 | 🟡 中 | 🟡 中 | 增加移动端测试，优化触摸交互，简化操作流程 |
| 搜索性能问题 | 🟢 低 | 🟡 中 | 使用数据库全文搜索索引，限制搜索范围 |

### 验收测试检查清单

**功能测试：**
- [ ] 保存模版到库功能正常
- [ ] 模版库列表正确显示（标题、描述、标签、分类、收藏状态、使用统计）
- [ ] 模版详情正确显示（完整模版内容、关联分析结果）
- [ ] 编辑模版功能正常（标题、描述、标签、分类）
- [ ] 删除模版功能正常
- [ ] 收藏/取消收藏功能正常
- [ ] 基于模版重新生成图片功能正常
- [ ] 查看模版的生成图片历史功能正常
- [ ] 使用统计计算正确
- [ ] 授权控制正常（用户只能访问自己的数据）

**视觉测试：**
- [ ] Glassmorphism 样式应用正确
- [ ] Lucide 图标显示正确
- [ ] 响应式布局正确（桌面/平板/移动）
- [ ] 加载状态和空状态显示正确
- [ ] 收藏模版的高亮效果正确

**兼容性测试：**
- [ ] Chrome 浏览器测试通过
- [ ] Safari 浏览器测试通过
- [ ] Firefox 浏览器测试通过
- [ ] 移动端测试通过

**性能测试：**
- [ ] 模版库列表加载时间 < 500ms
- [ ] 模版详情加载时间 < 300ms
- [ ] 保存到模版库响应时间 < 200ms
- [ ] 搜索响应时间 < 300ms
- [ ] 重新生成图片响应时间 < 1 秒

### 项目结构注意事项

**遵循现有项目结构：**
- 模版库功能放在 `src/features/templates/` 目录（扩展现有的 templates feature）
- API 路由放在 `src/app/api/templates/` 目录
- 页面路由放在 `src/app/templates/` 目录
- 测试文件与源文件同目录

**与现有代码集成：**
- 复用 `src/features/analysis/` 的 `AnalysisResult` 类型
- 复用 `src/features/templates/` 的现有模版类型和组件
- 复用 `src/features/generation/` 的 `Generation` 类型
- 复用 `src/lib/db/` 的数据库连接和 Schema
- 复用 `src/components/shared/` 的通用组件
- 复用 `src/lib/replicate/` 的内容过滤逻辑

**数据库集成：**
- 使用现有的 `user` 表（user_id）
- 使用现有的 `analysis_results` 表（analysis_result_id）
- 使用现有的 `generations` 表（generation_id）
- 新增 `templates` 表（本故事创建）
- 新增 `template_tags` 表（本故事创建）
- 新增 `template_categories` 表（本故事创建）
- 新增 `template_generations` 表（本故事创建）

**与 Story 7-1 的区别和复用：**
- 区别：Story 7-1 的 `analysis_history` 表是临时存储（FIFO 自动清理），本故事的 `templates` 表是永久存储
- 复用：可以复用 Story 7-1 的 UI 组件设计模式（HistoryCard → TemplateCard，HistoryList → TemplateLibrary）
- 复用：可以复用 Story 7-1 的 API 路由设计模式

### 参考文档

**PRD:**
- [PRD - 模版库管理（永久保存）](../../planning-artifacts/prd.md#模版库管理永久保存)
- [FR37-40, FR69-70](../../planning-artifacts/prd.md#模版库管理永久保存)

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
- [Story 7.1: History Management](./story-7-1-history-management.md)（参考临时历史记录的实现模式）
- [Story 3.1: Style Analysis](./story-3-1-style-analysis.md)（参考分析结果结构）
- [Story 5.1: Template Generation](./story-5-1-template-generation.md)（参考模版数据结构）
- [Story 6.1: Image Generation](./story-6-1-image-generation.md)（参考生成流程和 credit 扣除）

### 开发优先级

**P0（核心必需）：**
- Task 1: 扩展数据库 Schema 和迁移
- Task 2: 模版库 API 路由
- Task 3: 模版库服务层
- Task 4: 模版库 UI 组件
- Task 5: 模版库页面和路由
- Task 6: 集成"保存到模版库"功能

**P1（重要）：**
- Task 7: "基于模版重新生成"功能
- Task 8: 模版使用统计功能
- Task 10: 单元测试和集成测试

**P2（优化）：**
- Task 9: 搜索、过滤和排序功能（可延后）
- Task 11: E2E 测试

### 技术债务和优化机会

**当前可接受的技术债务：**
- `usageCount` 字段是冗余存储（可从 `template_generations` 表计算），用于优化查询性能
- 搜索功能使用简单的 LIKE 查询，未使用全文搜索引擎（延迟到性能优化）

**未来优化方向：**
- 支持模版分享功能（生成公开链接分享给其他用户）
- 支持模版导出/导入（JSON 格式）
- 支持模版 duplication（复制模版并修改）
- 支持模版批量操作（批量编辑、批量删除）
- 支持模版文件夹组织（多级分类）
- 使用全文搜索引擎（如 PostgreSQL FTS 或 Elasticsearch）优化搜索性能

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

_待开发时填写_
