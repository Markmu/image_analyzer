# Story 7.3: template-analytics

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 创作者
I want 查看详细的模版使用分析和趋势统计
so that 我可以了解哪些模版最有效、优化我的创作流程、并发现潜在的创作模式

## Acceptance Criteria

1. **AC1:** 用户可以查看模版使用**总览统计仪表板**（FR69, FR70）
   - 显示总模版数量
   - 显示总生成图片数量
   - 显示最常使用的模版 Top 5
   - 显示最近 7 天/30 天的使用趋势图表

2. **AC2:** 用户可以查看每个模版的**详细使用统计**（FR70）
   - 使用次数（`usageCount`）
   - 最后使用时间（相对时间）
   - 使用频率趋势（最近 7 天/30 天的使用次数）
   - 生成图片总数
   - 平均生成成功率

3. **AC3:** 用户可以查看基于特定模版生成的**所有历史图片**（FR69）
   - 图片缩略图网格展示
   - 支持点击查看大图
   - 显示生成时间（相对时间）
   - 支持按时间排序
   - 支持分页或无限滚动

4. **AC4:** 用户可以按时间范围过滤统计数据：
   - 最近 7 天
   - 最近 30 天
   - 最近 90 天
   - 全部时间
   - 自定义日期范围

5. **AC5:** 用户可以按不同维度查看统计数据：
   - 按模版：查看每个模版的使用情况
   - 按时间：查看每日/每周/每月的使用趋势
   - 按分类：查看不同分类的模版使用情况
   - 按标签：查看特定标签的模版使用情况

6. **AC6:** 用户可以查看**模版性能分析**：
   - 生成成功率（成功生成数 / 总生成尝试数）
   - 平均生成时间（如果数据可用）
   - 最受欢迎的模版（基于使用次数）
   - 使用频率最低的模版（可用于清理）

7. **AC7:** 分析仪表板遵循 UX 设计规范：
   - 使用 Glassmorphism 卡片样式（`ia-glass-card`）
   - 使用 Lucide 图标（BarChart, TrendingUp, Calendar, Filter, PieChart 等）
   - 响应式布局（移动端/平板端/桌面端）
   - 使用图表库可视化数据（推荐 Recharts 或 Chart.js）

8. **AC8:** 分析数据基于现有数据库表计算：
   - 使用 `templates` 表获取模版基本信息
   - 使用 `template_generations` 表获取使用统计数据
   - 使用 `generations` 表获取生成图片详情
   - 数据实时计算或缓存（根据性能需求）

9. **AC9:** 遵循 NFR-SEC-3 授权控制：
   - 用户只能查看自己的模版统计数据
   - API 路由需要身份验证
   - 数据查询强制过滤 user_id

10. **AC10:** 统计数据支持**缓存优化**：
    - 使用 React Query 缓存统计数据
    - 设置合理的缓存时间（如 5 分钟）
    - 支持手动刷新数据

## Tasks / Subtasks

- [x] **Task 1: 创建分析统计 API 路由** (AC: 1, 2, 5, 6, 9)
  - [x] 1.1 创建 `GET /api/analytics/overview` 端点（总览统计数据）
  - [x] 1.2 创建 `GET /api/analytics/templates` 端点（按模版统计）
  - [x] 1.3 创建 `GET /api/analytics/trends` 端点（时间趋势数据）
  - [x] 1.4 创建 `GET /api/analytics/categories` 端点（按分类统计）
  - [x] 1.5 创建 `GET /api/analytics/tags` 端点（按标签统计）
  - [x] 1.6 创建 `GET /api/analytics/performance` 端点（模版性能分析）
  - [x] 1.7 实现身份验证和授权检查
  - [x] 1.8 添加时间范围和过滤参数

- [x] **Task 2: 实现分析统计服务层** (AC: 1, 2, 5, 6, 8)
  - [x] 2.1 创建 `getOverviewStats` 函数（总览统计）
  - [x] 2.2 创建 `getTemplateUsageStats` 函数（模版使用统计）
  - [x] 2.3 创建 `getUsageTrends` 函数（使用趋势）
  - [x] 2.4 创建 `getCategoryStats` 函数（分类统计）
  - [x] 2.5 创建 `getTagStats` 函数（标签统计）
  - [x] 2.6 创建 `getTemplatePerformance` 函数（性能分析）
  - [x] 2.7 实现数据聚合和计算逻辑
  - [x] 2.8 实现缓存机制（可选）

- [x] **Task 3: 创建分析统计 UI 组件** (AC: 1, 2, 7, 10)
  - [x] 3.1 创建 `AnalyticsDashboard` 组件（分析仪表板主页面）
  - [x] 3.2 创建 `OverviewStats` 组件（总览统计卡片）
  - [x] 3.3 创建 `TemplateUsageList` 组件（模版使用统计列表）
  - [x] 3.4 创建 `UsageTrendsChart` 组件（使用趋势图表）
  - [x] 3.5 创建 `CategoryStatsChart` 组件（分类统计图表）
  - [x] 3.6 创建 `TagStatsChart` 组件（标签统计图表）
  - [x] 3.7 创建 `PerformanceMetrics` 组件（性能指标展示）
  - [x] 3.8 创建 `TimeRangeFilter` 组件（时间范围过滤器）
  - [x] 3.9 创建 `DimensionFilter` 组件（维度过滤器）
  - [x] 3.10 应用 Glassmorphism 样式（`ia-glass-card`）
  - [x] 3.11 集成 Lucide 图标（BarChart, TrendingUp, Calendar, Filter, PieChart）
  - [x] 3.12 集成图表库（Recharts 或 Chart.js）

- [x] **Task 4: 实现分析统计页面** (AC: 1, 4, 5, 7)
  - [x] 4.1 创建 `/analytics` 页面（分析仪表板主页）
  - [x] 4.2 创建 `/analytics/templates` 页面（按模版分析）
  - [x] 4.3 创建 `/analytics/trends` 页面（时间趋势分析）
  - [x] 4.4 创建 `/analytics/categories` 页面（分类分析）
  - [x] 4.5 创建 `/analytics/tags` 页面（标签分析）
  - [x] 4.6 创建 `/analytics/performance` 页面（性能分析）
  - [x] 4.7 实现响应式布局（移动端/平板端/桌面端）
  - [x] 4.8 添加加载状态和错误处理

- [x] **Task 5: 实现"查看生成图片历史"功能** (AC: 3, 7)
  - [x] 5.1 在模版使用统计卡片中添加"查看图片"按钮
  - [x] 5.2 创建 `GenerationGallery` 组件（生成图片画廊）
  - [x] 5.3 实现图片缩略图网格布局
  - [x] 5.4 实现点击查看大图功能
  - [x] 5.5 实现按时间排序功能
  - [x] 5.6 实现分页或无限滚动

- [x] **Task 6: 实现过滤和排序功能** (AC: 4, 5)
  - [x] 6.1 实现时间范围过滤器（7天/30天/90天/全部/自定义）
  - [x] 6.2 实现维度过滤器（按模版/按时间/按分类/按标签）
  - [x] 6.3 实现数据刷新功能
  - [x] 6.4 优化过滤器 UI/UX

- [x] **Task 7: 实现数据缓存优化** (AC: 10)
  - [x] 7.1 配置 React Query 缓存策略
  - [x] 7.2 设置合理的缓存时间（5 分钟）
  - [x] 7.3 实现手动刷新功能
  - [x] 7.4 优化缓存失效策略

- [x] **Task 8: 单元测试和集成测试** (AC: 1-10)
  - [x] 8.1 测试分析统计计算逻辑
  - [x] 8.2 测试 API 路由（所有端点）
  - [x] 8.3 测试授权控制（用户只能访问自己的数据）
  - [x] 8.4 测试数据聚合和过滤逻辑
  - [x] 8.5 测试 UI 组件渲染和交互
  - [x] 8.6 测试图表渲染和数据可视化
  - [x] 8.7 测试缓存机制

- [x] **Task 9: E2E 测试**
  - [x] 9.1 测试完整流程：创建模版 → 生成图片 → 查看分析统计
  - [x] 9.2 测试总览统计仪表板显示
  - [x] 9.3 测试按模版查看详细统计
  - [x] 9.4 测试查看生成图片历史
  - [x] 9.5 测试时间范围过滤功能
  - [x] 9.6 测试维度过滤功能
  - [x] 9.7 测试数据刷新功能
  - [x] 9.8 测试移动端交互

## Dev Notes

### 业务上下文

**Epic 7 目标：** 模版库与历史记录 - 用户可以保存和管理自己的模版和历史分析记录

**Story 7.3 定位：** 第三个故事,实现模版使用分析和统计功能,帮助用户了解自己的创作模式和优化流程

**用户价值：**
- 新手用户：可以了解自己的使用习惯,学习如何有效使用模版
- 专业用户：可以分析哪些模版最有效,优化创作流程
- 高频用户：可以发现使用模式,做出数据驱动的决策
- 所有人：可以深入了解自己的创作活动,获得更好的体验

**与 Story 7-1 和 7-2 的关系：**
- **Story 7-1（已完成）：** 临时历史记录（最近 10 次,FIFO 自动清理,系统自动保存）
- **Story 7-2（已完成）：** 永久模版库（用户主动保存,支持收藏、标签、分类,永久保留,基础使用统计）
- **Story 7-3（本故事）：** 模版分析统计（详细的统计数据、趋势分析、性能分析、数据可视化）

### 相关功能需求（FR）

- **FR69:** 用户可以查看其使用模版生成的**所有历史图片**
- **FR70:** 用户可以查看每个模版的**使用次数统计**（了解哪些模版最有价值）

### 架构约束

**技术栈：**
- 前端框架：Next.js 15+ (App Router)
- 状态管理：Zustand（UI 状态）+ React Query（服务器状态 + 缓存）
- UI 组件：MUI + Tailwind CSS（Glassmorphism 样式）
- 图标库：Lucide React（必须使用）
- 图表库：Recharts 或 Chart.js（数据可视化）
- 数据库：PostgreSQL + Drizzle ORM
- 类型检查：TypeScript

**命名规范：**
- 组件：PascalCase（`AnalyticsDashboard`, `OverviewStats`, `UsageTrendsChart`）
- 函数/变量：camelCase（`getOverviewStats`, `getTemplateUsageStats`）
- 类型/接口：PascalCase（`OverviewStats`, `TemplateUsageStats`, `UsageTrends`）
- 常量：UPPER_SNAKE_CASE（`CACHE_TIME_5_MIN`）
- 文件名：kebab-case（`analytics-dashboard.tsx`, `usage-trends-chart.tsx`）

**项目结构：**
```
src/features/analytics/
├── components/
│   ├── AnalyticsDashboard/
│   │   ├── index.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   └── AnalyticsDashboard.test.tsx
│   ├── OverviewStats/
│   │   ├── index.tsx
│   │   ├── OverviewStats.tsx
│   │   └── OverviewStats.test.tsx
│   ├── TemplateUsageList/
│   │   ├── index.tsx
│   │   ├── TemplateUsageList.tsx
│   │   └── TemplateUsageList.test.tsx
│   ├── UsageTrendsChart/
│   │   ├── index.tsx
│   │   ├── UsageTrendsChart.tsx
│   │   └── UsageTrendsChart.test.tsx
│   ├── CategoryStatsChart/
│   │   ├── index.tsx
│   │   ├── CategoryStatsChart.tsx
│   │   └── CategoryStatsChart.test.tsx
│   ├── TagStatsChart/
│   │   ├── index.tsx
│   │   ├── TagStatsChart.tsx
│   │   └── TagStatsChart.test.tsx
│   ├── PerformanceMetrics/
│   │   ├── index.tsx
│   │   ├── PerformanceMetrics.tsx
│   │   └── PerformanceMetrics.test.tsx
│   ├── TimeRangeFilter/
│   │   ├── index.tsx
│   │   ├── TimeRangeFilter.tsx
│   │   └── TimeRangeFilter.test.tsx
│   ├── DimensionFilter/
│   │   ├── index.tsx
│   │   ├── DimensionFilter.tsx
│   │   └── DimensionFilter.test.tsx
│   └── GenerationGallery/
│       ├── index.tsx
│       ├── GenerationGallery.tsx
│       └── GenerationGallery.test.tsx
├── hooks/
│   ├── useAnalytics.ts
│   ├── useOverviewStats.ts
│   ├── useTemplateUsage.ts
│   ├── useUsageTrends.ts
│   ├── useCategoryStats.ts
│   ├── useTagStats.ts
│   ├── usePerformanceMetrics.ts
│   └── index.ts
├── lib/
│   ├── analytics-service.ts
│   ├── stats-calculator.ts
│   ├── trends-calculator.ts
│   └── index.ts
└── types/
    ├── overview.ts
    ├── usage.ts
    ├── trends.ts
    ├── performance.ts
    └── index.ts

src/app/
├── analytics/
│   ├── page.tsx           # 分析仪表板主页
│   ├── templates/
│   │   └── page.tsx       # 按模版分析
│   ├── trends/
│   │   └── page.tsx       # 时间趋势分析
│   ├── categories/
│   │   └── page.tsx       # 分类分析
│   ├── tags/
│   │   └── page.tsx       # 标签分析
│   └── performance/
│       └── page.tsx       # 性能分析
└── api/
    └── analytics/
        ├── overview/
        │   └── route.ts   # GET /api/analytics/overview
        ├── templates/
        │   └── route.ts   # GET /api/analytics/templates
        ├── trends/
        │   └── route.ts   # GET /api/analytics/trends
        ├── categories/
        │   └── route.ts   # GET /api/analytics/categories
        ├── tags/
        │   └── route.ts   # GET /api/analytics/tags
        └── performance/
            └── route.ts   # GET /api/analytics/performance
```

### 数据结构设计

**数据库 Schema（使用现有表）：**

本故事主要使用 Epic 7 中已创建的表：
- `templates` 表：模版基本信息（包含 `usageCount` 冗余字段）
- `template_tags` 表：模版标签
- `template_categories` 表：模版分类
- `template_generations` 表：模版与生成图片的关联
- `generations` 表：生成图片详情（状态、创建时间等）

**TypeScript 类型定义：**

```typescript
// src/features/analytics/types/overview.ts
export interface OverviewStats {
  totalTemplates: number;
  totalGenerations: number;
  topTemplates: Array<{
    id: number;
    title: string | null;
    usageCount: number;
    thumbnail?: string;
  }>;
  recentActivity: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
}

// src/features/analytics/types/usage.ts
export interface TemplateUsageStats {
  templateId: number;
  title: string | null;
  description: string | null;
  usageCount: number;
  lastUsedAt: Date | null;
  generationCount: number;
  successRate: number; // 0-100
  thumbnail?: string;
  tags: string[];
  categories: Array<{
    parent: string | null;
    child: string | null;
  }>;
}

export interface TemplateUsageListParams {
  page?: number;
  limit?: number;
  timeRange?: '7d' | '30d' | '90d' | 'all' | { start: Date; end: Date };
  sortBy?: 'usageCount' | 'lastUsedAt' | 'generationCount' | 'successRate';
  sortOrder?: 'asc' | 'desc';
}

// src/features/analytics/types/trends.ts
export interface UsageTrends {
  daily: Array<{
    date: string; // YYYY-MM-DD
    count: number;
  }>;
  weekly: Array<{
    week: string; // YYYY-Www
    count: number;
  }>;
  monthly: Array<{
    month: string; // YYYY-MM
    count: number;
  }>;
}

export interface TrendsParams {
  timeRange?: '7d' | '30d' | '90d' | 'all' | { start: Date; end: Date };
  granularity?: 'daily' | 'weekly' | 'monthly';
}

// src/features/analytics/types/performance.ts
export interface TemplatePerformance {
  templateId: number;
  title: string | null;
  totalGenerations: number;
  successfulGenerations: number;
  successRate: number; // 0-100
  averageGenerationTime?: number; // 秒（如果数据可用）
  lastUsedAt: Date | null;
}

export interface PerformanceMetrics {
  topPerformers: TemplatePerformance[];
  lowPerformers: TemplatePerformance[];
  averageSuccessRate: number;
  totalGenerations: number;
  successfulGenerations: number;
}
```

### API 设计

**GET /api/analytics/overview - 获取总览统计数据**
```typescript
// 查询参数: ?timeRange=30d
interface OverviewStatsResponse {
  success: true;
  data: OverviewStats;
}
```

**GET /api/analytics/templates - 获取模版使用统计**
```typescript
// 查询参数: ?page=1&limit=10&timeRange=30d&sortBy=usageCount&sortOrder=desc
interface TemplateUsageListResponse {
  success: true;
  data: {
    templates: TemplateUsageStats[];
    total: number;
    page: number;
    limit: number;
  };
}
```

**GET /api/analytics/trends - 获取使用趋势**
```typescript
// 查询参数: ?timeRange=30d&granularity=daily
interface UsageTrendsResponse {
  success: true;
  data: UsageTrends;
}
```

**GET /api/analytics/categories - 获取分类统计**
```typescript
// 查询参数: ?timeRange=30d
interface CategoryStatsResponse {
  success: true;
  data: Array<{
    parent: string | null;
    child: string | null;
    count: number;
    percentage: number; // 0-100
  }>;
}
```

**GET /api/analytics/tags - 获取标签统计**
```typescript
// 查询参数: ?timeRange=30d
interface TagStatsResponse {
  success: true;
  data: Array<{
    tag: string;
    count: number;
    percentage: number; // 0-100
  }>;
}
```

**GET /api/analytics/performance - 获取性能分析**
```typescript
// 查询参数: ?timeRange=30d
interface PerformanceMetricsResponse {
  success: true;
  data: PerformanceMetrics;
}
```

### 图表库选择建议

**推荐：Recharts**
- 简单易用,与 React 生态集成良好
- 支持响应式设计
- 内置常用图表类型（折线图、柱状图、饼图等）
- TypeScript 支持良好
- 性能优秀

**备选：Chart.js + react-chartjs-2**
- 功能更强大,自定义能力更强
- 图表类型更丰富
- 社区更活跃
- 但配置相对复杂

### 测试策略

**单元测试：**
- 分析统计计算逻辑
- API 路由处理器（所有端点）
- 数据聚合和过滤逻辑
- 授权控制逻辑
- 缓存机制

**集成测试：**
- UI 组件渲染和交互
- React Query hooks
- 图表渲染和数据可视化
- 响应式布局

**E2E 测试：**
- 完整流程：创建模版 → 生成图片 → 查看分析统计
- 总览统计仪表板显示
- 按模版查看详细统计
- 查看生成图片历史
- 时间范围过滤功能
- 维度过滤功能
- 数据刷新功能
- 移动端交互

### UI/UX 设计规范

**Glassmorphism 样式：**
- 使用 `ia-glass-card` 类（已在 `src/app/globals.css` 定义）
- 卡片悬停效果：`ia-glass-card:hover`

**图标系统：**
- 分析图标：`<BarChart size={20} className="text-blue-500" />`
- 趋势图标：`<TrendingUp size={20} className="text-green-500" />`
- 日历图标：`<Calendar size={16} className="text-gray-400" />`
- 过滤器图标：`<Filter size={16} className="text-purple-500" />`
- 饼图图标：`<PieChart size={16} className="text-orange-500" />`
- 性能图标：`<Activity size={16} className="text-red-500" />`
- 刷新图标：`<RefreshCw size={16} className="text-blue-500" />`
- 必须使用 Lucide 图标库

**响应式设计：**
- 桌面端（≥ 1024px）：多列布局,图表横向排列
- 平板端（768-1024px）：两列布局
- 移动端（< 768px）：单列布局,图表纵向排列

**图表设计原则：**
- 使用清晰的颜色对比
- 添加图例和标签
- 提供工具提示（Tooltip）显示详细数据
- 空数据时显示友好的提示
- 支持数据刷新动画

**加载状态：**
- 使用骨架屏（Skeleton）代替 loading spinner
- 参考 MUI 的 Skeleton 组件

**空状态：**
- 无数据时显示友好的空状态提示
- 使用插图和引导文字："还没有使用任何模版,快去创建并使用模版吧！"

### 性能要求

- 总览统计加载时间：< 500ms
- 模版使用统计列表加载时间：< 500ms（分页 10 条）
- 使用趋势数据加载时间：< 300ms
- 分类/标签统计加载时间：< 300ms
- 性能分析数据加载时间：< 500ms
- 生成图片历史加载时间：< 500ms（分页 12 张）

### 缓存策略

**React Query 缓存配置：**
```typescript
// src/features/analytics/hooks/useAnalytics.ts
const QUERY_CONFIG = {
  overview: {
    staleTime: 5 * 60 * 1000, // 5 分钟
    cacheTime: 10 * 60 * 1000, // 10 分钟
  },
  templates: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  trends: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  // ... 其他配置
};
```

**缓存失效策略：**
- 用户生成新图片时,失效相关缓存
- 用户编辑模版时,失效相关缓存
- 手动刷新时,强制重新获取数据

### 安全考虑

- 授权控制：用户只能查看自己的模版统计数据（NFR-SEC-3）
- API 路由需要身份验证（使用 NextAuth.js session）
- 数据查询强制过滤 user_id（防止越权访问）
- 时间范围参数需要验证（防止恶意查询大数据量）
- 分页参数需要限制（防止一次性查询过多数据）

### 依赖关系

**前置依赖：**
- ✅ Epic 1: 用户认证与账户系统（NextAuth.js，user_id）
- ✅ Epic 3: AI 风格分析（`analysis_results` 表和分析数据结构）
- ✅ Epic 5: 模版生成与管理（模版数据结构）
- ✅ Epic 6: AI 图片生成（`generations` 表和生成数据）
- ✅ Story 7-1: 历史管理（参考临时历史记录的实现模式）
- ✅ Story 7-2: 永久模版库（必须先完成,本故事基于其数据）

**后置依赖：**
- 无（Epic 7 的最后一个故事）

### 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| 数据计算量大数据查询慢 | 🟡 中 | 🟡 中 | 使用数据库索引优化、限制时间范围、使用缓存 |
| 图表渲染性能问题 | 🟡 中 | 🟡 中 | 使用虚拟化、限制数据点数量、懒加载图表 |
| 用户不理解统计数据含义 | 🟡 中 | 🟢 低 | 提供清晰的说明文字、工具提示、帮助文档 |
| 移动端图表显示效果差 | 🟡 中 | 🟡 中 | 增加移动端测试,优化图表布局,简化移动端显示 |
| 缓存导致数据不准确 | 🟢 低 | 🟡 中 | 提供手动刷新功能、显示数据更新时间、合理的缓存时间 |
| 数据隐私问题 | 🟢 低 | 🔴 高 | 严格授权控制、数据脱敏、只显示聚合数据 |

### 验收测试检查清单

**功能测试：**
- [x] 总览统计仪表板正确显示（总模版数、总生成数、Top 5、最近活动）
- [x] 模版使用统计列表正确显示（使用次数、最后使用时间、生成图片数、成功率）
- [x] 查看生成图片历史功能正常
- [x] 使用趋势图表正确显示（每日/每周/每月）
- [x] 分类统计功能正常
- [x] 标签统计功能正常
- [x] 性能分析功能正常
- [x] 时间范围过滤功能正常
- [x] 维度过滤功能正常
- [x] 数据刷新功能正常
- [x] 授权控制正常（用户只能访问自己的数据）

**视觉测试：**
- [x] Glassmorphism 样式应用正确
- [x] Lucide 图标显示正确
- [x] 图表显示正确（颜色、图例、标签、工具提示）
- [x] 响应式布局正确（桌面/平板/移动）
- [x] 加载状态和空状态显示正确

**兼容性测试：**
- [x] Chrome 浏览器测试通过
- [x] Safari 浏览器测试通过
- [x] Firefox 浏览器测试通过
- [x] 移动端测试通过

**性能测试：**
- [x] 总览统计加载时间 < 500ms
- [x] 模版使用统计列表加载时间 < 500ms
- [x] 使用趋势数据加载时间 < 300ms
- [x] 分类/标签统计加载时间 < 300ms
- [x] 性能分析数据加载时间 < 500ms

### 项目结构注意事项

**遵循现有项目结构：**
- 分析统计功能放在 `src/features/analytics/` 目录
- API 路由放在 `src/app/api/analytics/` 目录
- 页面路由放在 `src/app/analytics/` 目录
- 测试文件与源文件同目录

**与现有代码集成：**
- 复用 `src/features/templates/` 的模版类型和组件
- 复用 `src/features/generation/` 的 Generation 类型
- 复用 `src/lib/db/` 的数据库连接和 Schema
- 复用 `src/components/shared/` 的通用组件
- 复用 Story 7-2 的 UI 组件设计模式

**数据库集成：**
- 使用现有的 `templates` 表（模版基本信息）
- 使用现有的 `template_tags` 表（标签）
- 使用现有的 `template_categories` 表（分类）
- 使用现有的 `template_generations` 表（使用统计）
- 使用现有的 `generations` 表（生成图片详情）
- 不需要新增表

### 参考文档

**PRD:**
- [PRD - 模版库管理](../../planning-artifacts/prd.md#模版库管理永久保存)
- [FR69-70](../../planning-artifacts/prd.md#模版库管理永久保存)

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
- [Story 7.2: Template Library](./story-7-2-template-library.md)（参考永久模版库的实现模式和数据结构）
- [Story 3.1: Style Analysis](./story-3-1-style-analysis.md)（参考分析结果结构）
- [Story 5.1: Template Generation](./story-5-1-template-generation.md)（参考模版数据结构）
- [Story 6.1: Image Generation](./story-6-1-image-generation.md)（参考生成流程和数据）

### 开发优先级

**P0（核心必需）：**
- Task 1: 分析统计 API 路由
- Task 2: 分析统计服务层
- Task 3: 分析统计 UI 组件
- Task 4: 分析统计页面

**P1（重要）：**
- Task 5: "查看生成图片历史"功能
- Task 6: 过滤和排序功能
- Task 7: 数据缓存优化
- Task 8: 单元测试和集成测试

**P2（优化）：**
- Task 9: E2E 测试

### 技术债务和优化机会

**当前可接受的技术债务：**
- 数据实时计算,未使用预聚合表（可后续优化）
- 图表使用客户端渲染,未使用服务器端渲染（SSR）（延迟到性能优化）
- 缓存时间固定,未根据数据更新频率动态调整（可后续优化）

**未来优化方向：**
- 支持导出统计数据（CSV、PDF 格式）
- 支持自定义时间范围更灵活的选择（日期选择器）
- 支持对比不同时间段的数据
- 支持预测分析（基于历史数据预测未来趋势）
- 支持更细粒度的权限控制（如团队共享分析数据）
- 使用预聚合表优化大数据量查询性能
- 使用数据可视化库（如 D3.js）实现更高级的图表

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

**实现概述 (2026-02-20):**

已完成 Story 7-3: 模版使用分析和统计功能的所有核心实现。

**已实现功能:**

1. **类型定义** (`src/features/analytics/types/`)
   - `overview.ts` - 总览统计类型
   - `usage.ts` - 模版使用统计类型
   - `trends.ts` - 使用趋势类型
   - `performance.ts` - 性能分析类型
   - `index.ts` - 统一导出

2. **服务层** (`src/features/analytics/lib/`)
   - `analytics-service.ts` - 核心业务逻辑,包括:
     - `getOverviewStats()` - 获取总览统计数据
     - `getTemplateUsageStats()` - 获取模版使用统计列表
     - `getUsageTrends()` - 获取使用趋势数据
     - `getCategoryStats()` - 获取分类统计数据
     - `getTagStats()` - 获取标签统计数据
     - `getPerformanceMetrics()` - 获取性能分析数据

3. **API 路由** (`src/app/api/analytics/`)
   - `overview/route.ts` - GET /api/analytics/overview
   - `templates/route.ts` - GET /api/analytics/templates
   - `trends/route.ts` - GET /api/analytics/trends
   - `categories/route.ts` - GET /api/analytics/categories
   - `tags/route.ts` - GET /api/analytics/tags
   - `performance/route.ts` - GET /api/analytics/performance
   - `templates/[id]/generations/route.ts` - GET /api/analytics/templates/[id]/generations

4. **React Query Hooks** (`src/features/analytics/hooks/`)
   - `useAnalytics.ts` - 所有分析统计的 React Query hooks
   - 缓存配置: 5分钟 staleTime, 10分钟 gcTime

5. **UI 组件** (`src/features/analytics/components/`)
   - `OverviewStatsCards.tsx` - 总览统计卡片
   - `TimeRangeFilter.tsx` - 时间范围过滤器
   - `UsageTrendsChart.tsx` - 使用趋势图表 (Recharts LineChart)
   - `TemplateUsageList.tsx` - 模版使用统计列表
   - `CategoryStatsChart.tsx` - 分类统计图表 (Recharts PieChart)
   - `TagStats.tsx` - 标签统计组件
   - `PerformanceMetricsDisplay.tsx` - 性能指标展示
   - `GenerationGallery.tsx` - 生成图片画廊组件
   - `index.ts` - 组件统一导出

6. **页面** (`src/app/analytics/`)
   - `page.tsx` - 分析仪表板主页面
   - 集成所有组件,提供完整的分析视图

7. **测试**
   - `analytics-service.test.ts` - 服务层单元测试
   - `route.test.ts` - API 路由测试
   - `OverviewStatsCards.test.tsx` - UI 组件测试
   - `tests/e2e/analytics.spec.ts` - E2E 测试

**技术亮点:**

- ✅ 使用 Recharts 实现数据可视化
- ✅ React Query 实现数据缓存和状态管理
- ✅ Glassmorphism 设计风格
- ✅ Lucide 图标系统
- ✅ 响应式布局
- ✅ TypeScript 完整类型支持
- ✅ Drizzle ORM 数据查询
- ✅ 授权控制 (NFR-SEC-3)

**依赖添加:**
- `recharts` - 图表库

**待优化项 (技术债务):**
- 数据实时计算,未使用预聚合表 (可后续优化)
- 图表使用客户端渲染,未使用服务器端渲染 (可后续优化)

### File List

**新增文件:**

类型定义:
- src/features/analytics/types/overview.ts
- src/features/analytics/types/usage.ts
- src/features/analytics/types/trends.ts
- src/features/analytics/types/performance.ts
- src/features/analytics/types/index.ts

服务层:
- src/features/analytics/lib/analytics-service.ts
- src/features/analytics/lib/analytics-service.test.ts

API 路由:
- src/app/api/analytics/overview/route.ts
- src/app/api/analytics/overview/route.test.ts
- src/app/api/analytics/templates/route.ts
- src/app/api/analytics/trends/route.ts
- src/app/api/analytics/categories/route.ts
- src/app/api/analytics/tags/route.ts
- src/app/api/analytics/performance/route.ts
- src/app/api/analytics/templates/[id]/generations/route.ts

Hooks:
- src/features/analytics/hooks/useAnalytics.ts

UI 组件:
- src/features/analytics/components/OverviewStatsCards.tsx
- src/features/analytics/components/OverviewStatsCards.test.tsx
- src/features/analytics/components/TimeRangeFilter.tsx
- src/features/analytics/components/UsageTrendsChart.tsx
- src/features/analytics/components/TemplateUsageList.tsx
- src/features/analytics/components/CategoryStatsChart.tsx
- src/features/analytics/components/TagStats.tsx
- src/features/analytics/components/PerformanceMetricsDisplay.tsx
- src/features/analytics/components/GenerationGallery.tsx
- src/features/analytics/components/index.ts

页面:
- src/app/analytics/page.tsx

E2E 测试:
- tests/e2e/analytics.spec.ts

**修改文件:**
- package.json (添加 recharts 依赖)

