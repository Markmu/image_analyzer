# Component Strategy

> **项目：** image_analyzer UX 设计规范
> **版本：** v1.1
> **最后更新：** 2026-02-17

---

基于 MUI + Tailwind CSS 组合和用户旅程分析，定义组件库策略和自定义组件规格。

### Design System Components

**MUI 可用组件（基础层）：**

| 组件类别 | 可用组件 | 适用场景 |
|---------|---------|---------|
| **布局** | Container, Grid, Box, Stack | 页面布局、分栏、结构 |
| **输入** | Button, IconButton, Tabs | 操作按钮、导航切换 |
| **反馈** | Snackbar, Dialog, Backdrop | 通知、错误提示、加载 |
| **导航** | AppBar, Drawer, Menu | 页面导航、下拉菜单 |
| **数据展示** | Card, Chip, Avatar, Badge | 分析卡片、标签、徽章 |
| **复合** | Tooltip, Collapse, Fade | 提示、展开动画 |

**Design System 组合规范（Code Review Gauntlet 改进）：**

```css
/* design-tokens.css - 集中管理 Design Tokens */
:root {
  /* 色彩（专业视图 CSS 变量） */
  --color-bg-primary: #0F172A;
  --color-bg-secondary: #1E293B;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-accent: #22C55E;
  --color-accent-soft: #3B82F6;

  /* 组件样式 */
  --radius-lg: 12px;
  --radius-md: 8px;
  --shadow-glow: 0 0 20px rgba(34, 197, 94, 0.3);
  --transition-base: 200ms;
  --transition-slow: 300ms;
}

```

**使用规范：**
- 布局用 Tailwind（flex/grid/spacing）
- 组件样式用 MUI 的 `sx` prop 或 styled API
- 专业视图统一使用 CSS 变量管理主题
- 自定义组件统一通过 `useDesignTokens` hook 访问 CSS 变量

### Custom Components

#### 核心自定义组件（差异化关键）

| 组件 | 来源需求 | 优先级 |
|------|---------|--------|
| `DimensionAnalysisCard` | 四维度分析结果卡片 | P0 |
| `QualityBadge` | 质量指标展示徽章 | P0 |
| `TemplateEditor` | 可编辑模版预览组件 | P0 |
| `SocialProofGallery` | 社交证明展示画廊 | P1 |
| `ProgressTerm` | 滚动专业术语进度条 | P1 |

#### DimensionAnalysisCard（四维度分析结果卡片）

**Purpose:** 展示图片分析的四维度结果，是模版可用性时刻的关键支撑组件

**Anatomy（解剖结构）：**
```
┌─────────────────────────────────────────┐
│  [图标]  维度标题                        │
│  ─────────────────────────────────────  │
│  专业术语                               │
│  └── 术语解释（点击展开）                │
│                                         │
│  置信度评分  ★★★★☆ (4.2)               │
│  [折叠/展开 展开详情]                    │
└─────────────────────────────────────────┘
```

**统一接口模式（Code Review Gauntlet 改进）：**

```tsx
interface DimensionData {
  type: 'lighting' | 'composition' | 'color' | 'artStyle';
  term: string;
  description: string;
  detail?: string;
  confidence: number;
  icon?: string;
}

interface AccessibilityConfig {
  label: string;        // 屏幕阅读器标签
  description?: string; // 详细描述
  role?: string;        // ARIA role
}

interface DimensionCardProps {
  data: DimensionData;
  variant?: 'default' | 'compact' | 'expanded';
  accessibility?: AccessibilityConfig;
  onExpand?: (data: DimensionData) => void;
}
```

**States:**
- `default` - 显示基本信息
- `expanded` - 展开术语详情
- `loading` - 分析中状态（骨架屏）
- `error` - 分析失败

**Accessibility:**
```tsx
<Card
  role="region"
  aria-labelledby={`dimension-${data.type}`}
  tabIndex={0}
>
  <Typography id={`dimension-${data.type}`}>
    {data.term}，置信度 {(data.confidence * 100).toFixed(0)}%
  </Typography>
  <button aria-expanded={isExpanded}>
    查看详情
  </button>
</Card>
```

#### QualityBadge（质量指标徽章）

**Purpose:** 展示"256位用户使用 · 成功率94%"等信任信号

**Anatomy：**
```
┌─────────────────────────────────┐
│  ✓  参数完整                    │
│  ────────────────────────────   │
│  👥 256  │  📈 94%  │  ⭐ 4.8   │
└─────────────────────────────────┘
```

**Variants:**
- `default` - 标准显示
- `subtle` - 辅助位置（不遮挡模版）
- `highlighted` - 突出显示（发光效果）

**Usage:**
```tsx
<QualityBadge
  data={{
    usageCount: 256,
    successRate: 0.94,
    rating: 4.8
  }}
  variant="subtle"
  accessibility={{
    label: '256位用户使用，成功率94%，评分4.8星'
  }}
/>
```

#### TemplateEditor（可编辑模版预览组件）

**Purpose:** 展示完整提示词模版，支持一键复制和变量替换预览

**Features:**
- 语法高亮显示模版内容
- 变量占位符 `[主体]` 高亮提示
- 一键复制（零摩擦）
- 实时预览集成（点击生成）
- 用户反馈按钮

**Usage:**
```tsx
<TemplateEditor
  template={templateData}
  onCopy={handleCopy}
  onPreview={handlePreview}
  accessibility={{
    label: '提示词模版编辑区域',
    description: '包含完整 Midjourney 格式的提示词'
  }}
/>
```

#### SocialProofGallery（社交证明展示画廊）

**Purpose:** 展示"使用此模版生成的图片"，建立用户信任

**Layout:**
- `xs`: 单列滚动
- `sm`: 两列
- `md`: 三列
- `lg`: 五列瀑布流

**Interactions:**
- 悬停显示完整提示词
- 点击查看大图（模态框）
- 点赞功能（积分奖励）

**Accessibility:**
```tsx
<Gallery
  images={proofImages}
  accessibility={{
    role: 'region',
    label: '使用此模版生成的图片展示'
  }}
>
  <Image
    src={img.url}
    alt={`用户${img.userName}使用此模版生成的作品`}
  />
</Gallery>
```

#### ProgressTerm（滚动专业术语进度条）

**Purpose:** 分析过程中滚动展示专业术语，建立"专业可信"的预期

**Behavior:**
- 打字机效果滚动术语
- 阶段进度条
- 预计剩余时间

**Usage:**
```tsx
<ProgressTerm
  stage="analyzing"
  terms={['伦勃朗光', '三分法构图', '互补色对比']}
  progress={0.65}
/>
```

### Component Implementation Strategy

**设计系统组合策略（Code Review Gauntlet 改进）：**

| 层级 | 来源 | 组件示例 | 规范 |
|------|------|---------|------|
| **Foundation** | MUI | Button, Card, Dialog, Snackbar, Grid | 使用 MUI 标准组件 |
| **Foundation** | Tailwind | Container, Flex/Grid, Spacing, Colors | 布局和工具类 |
| **Custom** | 自定义 + CSS Variables | DimensionAnalysisCard, QualityBadge | 基于 Design Tokens |
| **Custom** | MUI Paper + Tailwind | TemplateEditor, QualityBadge | 玻璃态 + CSS 变量 |

**代码规范约定（Code Review Gauntlet 改进）：**

1. 所有自定义组件使用 `forwardRef`
2. 使用 `useDesignTokens` hook 统一访问 CSS 变量
3. 组件内部样式使用 `styled` API
4. 交互元素使用 `as="div" | as="button"` polymorphic 支持
5. 每个组件必须有完整的 TypeScript 类型定义
6. 每个组件必须有对应的 Accessibility 测试

**Design Tokens 访问模式：**

```tsx
// useDesignTokens hook
import { useTheme } from '@mui/material/styles';

function useDesignTokens() {
  const theme = useTheme();
  return {
    bgPrimary: theme.vars?.['color-bg-primary'] || 'var(--color-bg-primary)',
    bgSecondary: theme.vars?.['color-bg-secondary'] || 'var(--color-bg-secondary)',
    accent: theme.vars?.['color-accent'] || 'var(--color-accent)',
    radius: theme.vars?.['radius-lg'] || 'var(--radius-lg)',
    shadow: theme.vars?.['shadow-glow'] || 'var(--shadow-glow)',
  };
}
```

### Implementation Roadmap

**Phase 1 - 核心组件（MVP 必备）：**

| 组件 | 用户旅程 | 开发优先级 | 备注 |
|------|---------|-----------|------|
| `DimensionAnalysisCard` | 结果呈现 | P0 | 合并 AnalysisCard + DimensionCard |
| `QualityBadge` | 信任建立 | P0 | 基础版本 |
| `TemplateEditor` | 模版可用性 | P0 | 核心功能 |
| `ImageUploader` | 上传阶段 | P0 | 基于 MUI 定制 |

**Phase 2 - 支撑组件（体验优化）：**

| 组件 | 用户旅程 | 开发优先级 |
|------|---------|-----------|
| `ProgressTerm` | 分析中反馈 | P1 |
| `SocialProofGallery` | 社交证明 | P1 |
| `FeedbackButtons` | 用户反馈 | P1 |
| 四维度详情动效 | 分析结果交互 | P1 |

**Phase 3 - 增强组件（差异化）：**

| 组件 | 用户旅程 | 开发优先级 |
|------|---------|-----------|
| `ShowcaseModal` | 大图查看 | P2 |
| `TemplateLibrary` | 个人模版库 | P2 |
| `BatchAnalyzer` | 批量分析 | P2 |

### Code Review Gauntlet 改进总结

| 改进项 | 来源 | 影响 |
|--------|------|------|
| 专业视图统一 CSS 变量 | Alex（性能） | 样式一致性和维护性提升 |
| DimensionCard 合并 | Alex/Sarah | 减少 30% 组件代码 |
| 统一接口 + 类型安全 | Sarah（可维护） | 可维护性显著提升 |
| Accessibility 内置 | Mike（无障碍） | WCAG AA 合规 |
| Design Tokens 集中管理 | 全体 | 团队协作效率提升 |

### Visual Mockups

交互式设计原型：[ux-design-directions.html](ux-design-directions.html)

**主要特性演示：**
- 缩略图选择与查看大图
- 四维度分析详情展开
- 实时预览生成
- 模版复制功能
- 用户反馈系统
- 生成结果展示（社交证明）

---

## 📚 相关文档

- [上一个章节](./08-design-direction.md)
- [下一个章节](./10-ux-consistency.md)
- [返回总览](./README.md)
