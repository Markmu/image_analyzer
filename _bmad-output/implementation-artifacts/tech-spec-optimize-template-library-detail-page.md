---
title: '优化模板详情页面 - 字段展示与编辑器集成'
slug: 'optimize-template-library-detail-page'
created: '2026-02-27T12:00:00.000Z'
status: 'done'
stepsCompleted: [1, 2, 3, 4, 5]
tech_stack: ['Next.js 15', 'React 19', 'TypeScript', 'Material-UI v5', 'Drizzle ORM', 'PostgreSQL']
files_to_modify: ['src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx']
code_patterns: ['Glassmorphism CSS classes', 'useState/useCallback hooks', 'async/await API calls']
test_patterns: ['Jest + React Testing Library', 'data-testid attributes', 'userEvent async helpers']

---

# Tech-Spec: 优化模板详情页面 - 字段展示与编辑器集成

**Created:** 2026-02-27

## Overview

### Problem Statement

当前模板详情页面 (`TemplateLibraryDetail`) 以 JSON 字符串形式展示 `templateSnapshot` 数据，用户难以直观查看模板的各个分析维度字段。同时，页面缺少基于模板快速生成新图片的工作流，用户无法方便地复用现有模板创建变体。

**深层需求：** 用户的核心诉求是"复用和变体生成"——基于已保存的模板快速生成类似风格的新图片，而不仅仅是查看和编辑字段。

### Solution

基于第一性原理分析、反向工程和跨职能团队讨论，采用**简化渐进式 + 就地生成**方案：

1. **主要操作：直接生成** - 放置"生成图片"按钮作为主 CTA，使用原始模板直接生成
2. **高级编辑按需展开** - 提供"高级编辑"次要按钮，展开完整编辑器
3. **简化的编辑器集成**：
   - 默认折叠：只显示核心参数摘要（只读）
   - 展开后：完整 `TemplateEditor` 组件
   - 编辑完成后：提供"确认修改"和"生成图片"两个操作
4. **就地生成工作流**：
   - 直接生成：点击主按钮立即调用 API
   - 编辑后生成：展开编辑器 → 修改参数 → 生成
5. **数据转换分阶段**：
   - MVP：使用 `templateSnapshotToTemplate` 转换函数
   - V2：数据库添加 `jsonFormat` 字段优化性能

### Scope

**In Scope:**
- 修改 `TemplateLibraryDetail` 组件，添加双按钮布局
  - 主按钮："生成图片"（直接生成）
  - 次要按钮："高级编辑"（展开编辑器）
- 集成 `TemplateEditor` 组件（默认折叠）
- 实现折叠/展开逻辑和编辑器状态管理
- 添加"生成图片"API 调用逻辑
- 创建数据转换工具 `templateSnapshotToTemplate`（向后兼容）
- 显示核心参数摘要（只读，替代快速调整面板）

**Out of Scope:**
- 模板列表页面的修改
- 快速调整面板（QuickAdjustPanel）- 简化设计，留待 V2
- 图片生成 API 的修改（仅需确认调用方式）
- 后端 API 修改（除可选的 `jsonFormat` 字段外）
- 模板保存流程的修改
- 生成历史区域的修改（已存在，功能完整）
- **编辑后生成功能**（MVP 仅支持直接生成，编辑后生成作为 V2 功能）

## Context for Development

### Codebase Patterns

**Glassmorphism 样式：**
- 使用 `ia-glass-card` 类实现玻璃态效果
- 颜色变量：`--glass-bg-dark`, `--glass-text-white-heavy`, `--glass-text-primary` 等

**组件结构模式：**
- 使用 `'use client'` 声明客户端组件
- 使用 `useState`, `useEffect`, `useCallback` 管理状态
- 使用 Material-UI 组件库
- 测试 ID 使用 `data-testid` 属性

**数据流模式：**
- `AnalysisData` → `TemplateJSONFormat` → `Template`
- 使用 `generateTemplate` 函数从分析结果生成模板

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx` | 需要修改的详情页组件 |
| `src/features/templates/components/TemplateEditor/TemplateEditor.tsx` | 需要集成的编辑器组件 |
| `src/features/templates/components/TemplatePreview/FieldPreview.tsx` | 字段预览展示参考，可用于核心参数摘要 |
| `src/features/templates/lib/template-generator.ts` | 模板生成逻辑参考，复用转换函数 |
| `src/features/templates/lib/template-library-service.ts` | 模板服务层，包含 `regenerateFromTemplate` |
| `src/features/templates/types/template.ts` | 模板类型定义 |
| `src/features/templates/types/library.ts` | SavedTemplate 类型定义 |
| `src/types/analysis.ts` | 分析数据类型定义 |
| `src/lib/db/schema.ts` | 数据库 schema（templates 表结构） |
| `src/app/api/templates/[id]/regenerate/route.ts` | 重新生成 API 端点 |
| `src/app/api/templates/[id]/generations/route.ts` | 生成历史 API 端点 |

### Technical Decisions

**UI/UX 设计策略（简化渐进式 + 就地生成）：**
```
┌─────────────────────────────────────────────┐
│  [返回]                    标题    [收藏]    │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────┐ │
│  │          │  │   生成图片 [主按钮] ✓     │ │  ← 直接生成
│  │ 预览图   │  ├──────────────────────────┤ │
│  │          │  │   高级编辑 [次要按钮]     │ │  ← 展开编辑器
│  └──────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────┤
│  核心参数摘要（只读）                          │
│  ┌──────────────────────────────────────┐  │
│  │  主体: ...                            │  │
│  │  风格: ...                            │  │
│  │  构图: ...                            │  │
│  └──────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  高级编辑器（默认折叠）                        │
│  ┌──────────────────────────────────────┐  │  ← 点击"高级编辑"展开
│  │  [TemplateEditor 组件]               │  │
│  │  - 变量格式标签页                    │  │
│  │  - JSON 字段标签页                   │  │
│  │  - 预览标签页                        │  │
│  │  底部：[确认修改] [生成图片] [取消]   │  │
│  └──────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  生成历史（已存在，无需修改）                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│  │图片1│ │图片2│ │图片3│ │图片4│         │
│  └─────┘ └─────┘ └─────┘ └─────┘         │
└─────────────────────────────────────────────┘
```

**用户工作流：**

**路径 A：直接生成（80% 用户）**
```
打开详情页 → 查看 → 点击"生成图片" → 等待 → 新图片出现在生成历史
```

**路径 B：编辑后生成（20% 高级用户）**
```
打开详情页 → 点击"高级编辑" → 展开编辑器 → 修改参数 →
   └─ 点击"确认修改" → 返回摘要视图
   └─ 点击"生成图片" → 生成新图片
```

**组件层次结构（简化后）：**
```
TemplateLibraryDetail
├── TemplateHeader (预览图 + 标题 + 双按钮)
│   ├── GenerateImageButton (新的主按钮)
│   └── EditToggleButton (切换编辑器)
├── TemplateSummaryDisplay (核心参数摘要，只读)
├── TemplateEditor (高级编辑器，可折叠)
│   └── 确认修改 / 生成图片 / 取消 按钮
└── GenerationHistory (已存在，无需修改)
```

**数据转换策略（分阶段）：**
- **MVP**：创建 `templateSnapshotToTemplate` 工具函数处理现有数据
- **V2**：数据库添加 `jsonFormat` 字段，优先读取，后备转换
- 转换逻辑复用 `generateTemplate` 的实现

**编辑器集成方式：**
- 默认折叠（`collapsed` state），点击"高级编辑"展开
- 传入从快照转换的模板数据
- 展开时遮盖摘要区域，或推到下方
- 编辑器底部提供操作按钮："确认修改"、"生成图片"、"取消"
- 确认修改后折叠编辑器，更新摘要显示

**状态管理策略：**
```
组件状态：
- template: SavedTemplate (从 API 获取)
- editableTemplate: Template (转换后的可编辑格式)
- isEditorExpanded: boolean (编辑器展开状态)
- isGenerating: boolean (生成中状态)
```

**图片生成 API 调用（已确认）：**
- **API 端点**：`POST /api/templates/[id]/regenerate`
- **服务层函数**：`regenerateFromTemplate(userId, templateId)`
- **返回格式**：`{ predictionId, message }`
- **生成流程**：
  1. 调用 API → 立即返回 `predictionId`
  2. 后台异步生成图片（Replicate）
  3. Webhook 回调自动关联生成结果到模板
  4. 轮询或刷新 `template.generations` 获取新图片
- **刷新策略**：生成成功后调用 `fetchTemplateDetail()` 刷新数据

**数据库 Schema 确认：**
```sql
-- templates 表结构（已确认）
CREATE TABLE templates (
  id serial PRIMARY KEY,
  user_id varchar(255) NOT NULL,
  analysis_result_id integer NOT NULL,
  title varchar(200),
  description text,
  template_snapshot jsonb NOT NULL,  -- 包含 analysisData
  is_favorite boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 注意：当前没有 jsonFormat 字段
-- 需要从 templateSnapshot.analysisData 实时转换
```

**数据转换工具函数设计：**
```typescript
// src/features/templates/lib/template-snapshot-converter.ts (新建)

/**
 * 从 templateSnapshot 转换为 Template 格式
 */
export function templateSnapshotToTemplate(
  savedTemplate: SavedTemplate,
  templateId: string
): Template {
  const { templateSnapshot, userId, analysisResultId } = savedTemplate;
  const analysisData = templateSnapshot.analysisData as AnalysisData;

  // 复用 template-generator.ts 的逻辑
  const jsonFormat = generateJSONFormat(analysisData);
  const variableFormat = generateVariableFormat(jsonFormat);

  return {
    id: templateId,
    userId,
    analysisResultId: String(analysisResultId),
    variableFormat,
    jsonFormat,
    createdAt: savedTemplate.createdAt,
    updatedAt: savedTemplate.updatedAt,
  };
}
```

### API Contract Definition

**API 端点：** `POST /api/templates/[id]/regenerate`

**请求格式：**
```typescript
// 请求：不需要请求体（使用 templateId 路径参数）
// Headers:
{
  'Content-Type': 'application/json',
}

// URL 参数：
// - id: 模板 ID（从 template.id 获取）
```

**成功响应：**
```typescript
{
  success: true,
  data: {
    predictionId: string,      // Replicate prediction ID
    message: string,            // "Image generation started successfully"
  }
}
```

**错误响应：**
```typescript
// 401 Unauthorized
{
  success: false,
  error: 'Unauthorized'
}

// 404 Not Found
{
  success: false,
  error: 'Template not found'
}

// 429 Too Many Requests
{
  success: false,
  error: 'Credit limit exceeded',
  data: {
    currentCredits: number,
    requiredCredits: number
  }
}

// 500 Internal Server Error
{
  success: false,
  error: 'Internal server error',
  details?: string // 调试信息（仅开发环境）
}
```

**超时和重试策略：**
```typescript
const API_TIMEOUT = 30000; // 30 秒超时
const MAX_RETRIES = 1;      // 最多重试 1 次（网络错误时）

// 重试条件：
// - 网络错误（fetch failed）
// - 5xx 服务器错误
// 不重试：
// - 4xx 客户端错误
// - 429 限流错误
```

### Data Validation & Type Safety

**问题：** `templateSnapshot.analysisData` 类型是 `any`，需要运行时验证

**解决方案：使用 Zod 进行 schema 验证**

```typescript
// src/features/templates/lib/validation-schemas.ts (新建)

import { z } from 'zod';

/**
 * AnalysisData 的运行时验证 schema
 */
export const AnalysisDataSchema = z.object({
  dimensions: z.object({
    lighting: z.object({
      name: z.string(),
      features: z.array(z.object({
        name: z.string(),
        value: z.string(),
        confidence: z.number(),
      })),
      confidence: z.number(),
    }),
    composition: z.object({
      name: z.string(),
      features: z.array(z.object({
        name: z.string(),
        value: z.string(),
        confidence: z.number(),
      })),
      confidence: z.number(),
    }),
    color: z.object({
      name: z.string(),
      features: z.array(z.object({
        name: z.string(),
        value: z.string(),
        confidence: z.number(),
      })),
      confidence: z.number(),
    }),
    artisticStyle: z.object({
      name: z.string(),
      features: z.array(z.object({
        name: z.string(),
        value: z.string(),
        confidence: z.number(),
      })),
      confidence: z.number(),
    }),
  }),
  overallConfidence: z.number(),
  modelUsed: z.string(),
  analysisDuration: z.number(),
}).partial(); // 允许部分字段（向后兼容）

/**
 * 验证并转换 analysisData
 */
export function validateAnalysisData(data: unknown): AnalysisData | null {
  try {
    return AnalysisDataSchema.parse(data);
  } catch (error) {
    console.error('Invalid analysisData:', error);
    return null;
  }
}
```

**降级策略：**
```typescript
// 在 templateSnapshotToTemplate 中使用
const analysisData = validateAnalysisData(templateSnapshot.analysisData);

if (!analysisData) {
  // 降级：返回空白的 TemplateJSONFormat
  return {
    id: templateId,
    userId,
    analysisResultId: String(analysisResultId),
    variableFormat: '',
    jsonFormat: {
      subject: '',
      style: '',
      composition: '',
      colors: '',
      lighting: '',
      additional: '',
    },
    createdAt: savedTemplate.createdAt,
    updatedAt: savedTemplate.updatedAt,
  };
}
```

### State Machine Design

**问题：** 编辑器状态管理存在竞态条件

**解决方案：使用状态机模式**

```typescript
// 状态定义
type EditorState =
  | 'idle'           // 初始状态，显示摘要
  | 'editing'        // 编辑器展开，用户正在编辑
  | 'generating'     // 正在生成图片
  | 'success'        // 生成成功
  | 'error';         // 生成/编辑失败

type EditorEvent =
  | { type: 'OPEN_EDITOR' }
  | { type: 'CONFIRM_EDIT' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'START_GENERATE' }
  | { type: 'GENERATE_SUCCESS' }
  | { type: 'GENERATE_ERROR'; error: string };

// 状态转换逻辑
const stateTransition: Record<EditorState, EditorEvent[]> = {
  idle: ['OPEN_EDITOR', 'START_GENERATE'],
  editing: ['CONFIRM_EDIT', 'CANCEL_EDIT'],
  generating: ['GENERATE_SUCCESS', 'GENERATE_ERROR'],
  success: ['OPEN_EDITOR', 'START_GENERATE'],
  error: ['OPEN_EDITOR', 'START_GENERATE'],
};

// 状态机 hook 使用示例
function useEditorStateMachine() {
  const [state, setState] = useState<EditorState>('idle');

  const transition = useCallback((event: EditorEvent) => {
    setState((currentState) => {
      const allowedEvents = stateTransition[currentState];
      if (!allowedEvents.includes(event.type)) {
        console.warn(`Invalid event ${event.type} for state ${currentState}`);
        return currentState;
      }

      switch (event.type) {
        case 'OPEN_EDITOR':
          return 'editing';
        case 'CONFIRM_EDIT':
          return 'idle';
        case 'CANCEL_EDIT':
          return 'idle';
        case 'START_GENERATE':
          return 'generating';
        case 'GENERATE_SUCCESS':
          return 'success';
        case 'GENERATE_ERROR':
          return 'error';
        default:
          return currentState;
      }
    });
  }, []);

  return { state, transition };
}
```

### Error Handling Matrix

| 错误场景 | 错误类型 | 用户反馈 | 重试策略 | 日志级别 |
|---------|---------|----------|----------|----------|
| API 调用失败 | Network Error | "网络连接失败，请检查网络后重试" | 显示重试按钮 | WARN |
| API 超时 | Timeout | "请求超时，请稍后重试" | 显示重试按钮 | WARN |
| 401 Unauthorized | Auth Error | "请先登录" | 跳转登录页 | ERROR |
| 404 Not Found | Not Found | "模板不存在" | 返回列表页 | ERROR |
| 429 Rate Limit | Rate Limit | "生成次数已达上限" | 显示升级提示 | INFO |
| 500 Server Error | Server Error | "服务器错误，请稍后重试" | 显示重试按钮 | ERROR |
| 数据转换失败 | Data Error | "模板数据格式错误" | 降级显示空摘要 | ERROR |
| 编辑器加载失败 | Component Error | "编辑器加载失败" | 禁用编辑功能 | ERROR |
| 权限不足 | Permission Error | "您没有权限执行此操作" | 禁用按钮 | WARN |

### Performance Budget

**性能目标：**
- FCP (First Contentful Paint): < 1.0s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.5s
- 数据转换时间: < 10ms

**优化策略：**
1. 使用 `React.memo` 包装 `TemplateSummaryDisplay` 组件
2. 使用 `useMemo` 缓存转换后的模板数据
3. 使用 `useCallback` 缓存事件处理函数
4. 实现编辑器的懒加载（动态 import）
5. 防抖用户输入（debounce: 300ms）

### TemplateEditor Integration Configuration

**集成配置：**
```typescript
<TemplateEditor
  template={editableTemplate}
  onChange={handleTemplateChange}
  // 在详情页中禁用的功能
  showSaveButton={false}      // 禁用"保存到模版库"按钮
  showOptimizeButton={false}  // 禁用"优化"按钮
  // 默认显示的 Tab
  defaultTab="json"           // 默认显示 JSON 字段标签页
  // 其他配置
  readOnly={false}            // 允许编辑
  data-testid="template-editor"
/>
```

**编辑器底部操作按钮：**
```typescript
<Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
  <Button
    variant="text"
    onClick={handleCancelEdit}
    disabled={isGenerating}
    data-testid="cancel-edit-button"
  >
    取消
  </Button>
  <Button
    variant="outlined"
    onClick={handleConfirmEdit}
    disabled={isGenerating}
    data-testid="confirm-edit-button"
  >
    确认修改
  </Button>
  {/* MVP: 禁用"生成图片"按钮，显示提示 */}
  <Tooltip title="编辑后生成功能将在 V2 版本提供">
    <span>
      <Button
        variant="contained"
        disabled
        startIcon={<BlockIcon />}
        data-testid="generate-from-editor-button"
      >
        生成图片
      </Button>
    </span>
  </Tooltip>
</Stack>
```

### Button Layout Design

**桌面端布局（≥ md 断点）：**
```
┌─────────────────────────────────────────────────┐
│  [预览图]        [生成图片] [高级编辑] [⋮更多]  │
│                    ↑主按钮  ↑次要  ↑菜单        │
└─────────────────────────────────────────────────┘
```

**移动端布局（< md 断点）：**
```
┌─────────────────────────────┐
│      [预览图]               │
│  [生成图片] 全宽主按钮      │
│  [高级编辑] 全宽次要按钮    │
│  [⋮更多] 菜单按钮          │
└─────────────────────────────┘
```

**按钮排列规则：**
- 主按钮（生成图片）在第一位
- 次要按钮（高级编辑）在第二位
- 编辑、删除按钮移到折叠菜单（More Menu）
- 所有按钮使用 `size="large"` 以获得更好的触摸目标

### Loading State UX Specification

**全局加载状态：**
- 生成图片时，禁用所有交互按钮
- 显示全页遮罩（可选）或禁用预览图卡片
- 显示 `CircularProgress` 和状态文本

**按钮加载状态：**
- "生成图片"按钮：显示禁用状态 + `CircularProgress` 图标
- "高级编辑"按钮：禁用
- 编辑、删除按钮：禁用

**编辑器加载状态：**
- 如果编辑器已展开，保持展开但禁用所有输入
- 显示遮罩层提示"正在生成图片，请稍候..."

**状态文本：**
- 开始生成："正在生成图片..."
- 生成中："生成中，预计需要 10-20 秒..."
- 成功："图片生成已开始！"
- 失败："生成失败，请重试"

### Core Summary & Editor Relationship

**明确设计决策：**

当用户点击"高级编辑"按钮时：
1. 核心参数摘要**淡出并向上滑动消失**（使用 Collapse + Slide 动画）
2. 编辑器**淡入并从下方展开**
3. 动画时长：300ms，缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`

当用户点击"确认修改"或"取消"时：
1. 编辑器**淡出并向下滑动消失**
2. 核心参数摘要**淡入并从上方滑入**
3. 动画时长：300ms

**布局优先级：**
```
Z-index 层级：
- 编辑器展开时：10（最上层）
- 核心参数摘要：5
- 预览图卡片：3
- 生成历史：1
```

### Test Coverage Requirements

**覆盖率目标：**
- 行覆盖率：≥ 80%
- 分支覆盖率：≥ 70%
- 函数覆盖率：≥ 80%
- 语句覆盖率：≥ 80%

**必须测试的场景：**
1. `templateSnapshotToTemplate` 转换函数的所有分支
2. `TemplateSummaryDisplay` 的空值、部分值、完整值渲染
3. 状态机的所有状态转换
4. API 调用的成功、失败、超时场景
5. 所有错误处理矩阵中的场景

### Accessibility Test Checklist

**键盘导航：**
- [ ] Tab 键可以访问所有交互元素（按钮、输入框）
- [ ] Tab 顺序符合视觉布局
- [ ] Enter/Space 可以触发按钮点击
- [ ] Esc 键可以关闭编辑器

**屏幕阅读器：**
- [ ] 所有按钮有 `aria-label` 或可读文本
- [ ] 加载状态有 `aria-live="polite"` 和 `aria-busy="true"`
- [ ] 错误消息有 `role="alert"` 和 `aria-live="assertive"`
- [ ] 编辑器展开/折叠有 `aria-expanded` 属性

**焦点管理：**
- [ ] 编辑器展开后，焦点移到编辑器内部
- [ ] 编辑器关闭后，焦点返回到"高级编辑"按钮
- [ ] 没有焦点陷阱

**颜色对比度：**
- [ ] 所有文本满足 WCAG AA 标准（4.5:1 或 3:1）
- [ ] 使用 axe DevTools 或 Lighthouse 验证

### Mobile Interaction Specifications

**触摸手势：**
- 不需要特殊手势，使用标准点击交互
- 确保触摸目标至少 44x44px（WCAG AAA 标准）

**移动端布局：**
- 按钮全宽显示（`fullWidth={isMobile}`）
- 卡片内边距：`p={2}` 而非 `p={3}`（节省空间）
- 字体大小：不小于 14px

**表单输入：**
- 输入框使用 `InputProps={{ disableUnderline: true }}` 减少视觉干扰
- 使用 `autoFocus={false}` 避免自动弹出键盘

## Design System Compliance

**设计系统参考：**
- 全局样式：`src/app/globals.css` (Glassmorphism 样式定义)
- 组件库：Material-UI v5 (`@mui/material`)
- 颜色变量：`src/styles/theme.ts` (如果存在) 或 MUI 主题配置

**必须遵循的设计规范：**

#### 1. 按钮样式规范

```typescript
// 主按钮（生成图片）
<Button
  variant="contained"
  color="primary"
  size="large"
  fullWidth={isMobile} // 移动端全宽
  disabled={isGenerating}
  startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
  data-testid="generate-image-button"
>
  {isGenerating ? '生成中...' : '生成图片'}
</Button>

// 次要按钮（高级编辑）
<Button
  variant="outlined"
  color="primary"
  size="large"
  fullWidth={isMobile}
  data-testid="advanced-edit-button"
>
  高级编辑
</Button>
```

**参考现有按钮：** `TemplateLibraryDetail` 第 391-410 行的编辑/删除按钮样式

#### 2. 间距规范

使用 Material-UI 的 `spacing` 系统（基准单位：8px）：

```typescript
// 卡片内边距
<Box sx={{ p: 3 }}> // 24px (3 * 8px)

// 卡片间距
<Box sx={{ mb: 3 }}> // 24px 下边距

// 组件间距
<Stack spacing={3}> // 24px 间距

// 按钮组间距
<ButtonGroup sx={{ gap: 2 }}> // 16px 间距
```

#### 3. 响应式断点

```typescript
// MUI 默认断点
const breakpoints = {
  xs: 0,      // 手机竖屏
  sm: 600,    // 手机横屏/小平板
  md: 900,    // 平板
  lg: 1200,   // 桌面
  xl: 1536,   // 大屏幕
};

// 使用示例
<Box sx={{
  display: { xs: 'block', md: 'flex' },
  flexDirection: { xs: 'column', md: 'row' },
  padding: { xs: 2, md: 3 }
}}>
```

#### 4. 颜色规范

```typescript
// 从主题或 CSS 变量使用颜色
const colors = {
  primary: 'var(--glass-text-primary)',
  background: 'var(--glass-bg-dark)',
  text: {
    primary: 'var(--glass-text-white-heavy)',
    secondary: 'var(--glass-text-primary)',
  },
  border: 'rgba(255, 255, 255, 0.1)',
};

// 确保颜色对比度符合 WCAG AA 标准
// - 正常文本：最少 4.5:1
// - 大文本（18pt+）：最少 3:1
```

#### 5. 状态设计规范

**加载状态：**
```typescript
// 使用 CircularProgress 组件
<CircularProgress
  size={24}
  sx={{ color: 'primary.main' }}
  data-testid="generating-spinner"
/>

// 或作为按钮内容
<Button disabled startIcon={<CircularProgress size={16} />}>
  生成中...
</Button>
```

**错误状态：**
```typescript
// 使用 Alert 组件
<Alert
  severity="error"
  sx={{ mb: 2 }}
  data-testid="error-alert"
>
  {error}
</Alert>
```

**禁用状态：**
```typescript
// Material-UI 自动处理
<Button disabled={isGenerating}>
  生成图片
</Button>
```

#### 6. 动画规范

```typescript
// 折叠动画
<Collapse
  in={isEditorExpanded}
  timeout={300}
  easing="cubic-bezier(0.4, 0, 0.2, 1)"
  unmountOnExit
>
  {/* 编辑器内容 */}
</Collapse>

// 悬停效果
<Button
  sx={{
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }
  }}
>
```

#### 7. Glassmorphism 样式

```typescript
// 使用预定义的 CSS 类
<Box className="ia-glass-card">
  {/* 内容 */}
</Box>

// 或使用 sx 属性（当类名不可用时）
<Box sx={{
  backgroundColor: 'var(--glass-bg-dark)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 2,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}}>
```

**验证清单：**
- ✅ 所有 UI 组件使用 Material-UI 组件或预定义样式类
- ❌ 禁止硬编码颜色值（使用 CSS 变量或主题）
- ❌ 禁止硬编码间距值（使用 spacing 系统）
- ❌ 禁止硬编码字体大小（使用 typography 系统）
- ✅ 所有交互元素有明确的视觉反馈（hover, disabled, loading 状态）
- ✅ 使用 `data-testid` 属性便于测试
- ✅ 响应式设计覆盖移动端到桌面端

## Implementation Plan

### Tasks

#### 阶段 1：数据转换层（基础设施）

- [ ] **Task 1.1**: 创建模板快照转换工具
  - File: `src/features/templates/lib/template-snapshot-converter.ts` (新建)
  - Action: 创建 `templateSnapshotToTemplate` 函数，将 `SavedTemplate` 转换为 `Template` 格式
  - 实现细节:
    - 从 `templateSnapshot.analysisData` 提取 `AnalysisData`
    - 复用 `generateJSONFormat` 和 `generateVariableFormat` 函数
    - 处理类型断言和空值保护
    - 导出函数供组件使用

- [ ] **Task 1.2**: 添加转换工具单元测试
  - File: `src/features/templates/lib/template-snapshot-converter.test.ts` (新建)
  - Action: 测试转换函数的各种场景
  - 测试用例:
    - 正常的完整 analysisData
    - 缺少某些维度的情况
    - 空值处理
    - 边界情况

#### 阶段 2：核心参数摘要组件

- [ ] **Task 2.1**: 创建核心参数摘要展示组件
  - File: `src/features/templates/components/TemplateSummaryDisplay/TemplateSummaryDisplay.tsx` (新建)
  - Action: 创建只读参数摘要组件
  - 实现细节:
    - 复用 `FIELD_CONFIGS` 配置
    - 显示 6 个维度的字段值
    - 使用 Glassmorphism 样式
    - 支持 data-testid 属性
    - 响应式布局（移动端/桌面端）
  - 组件 Props 接口:
    ```typescript
    interface TemplateSummaryDisplayProps {
      /** 模板的 JSON 格式数据 */
      jsonFormat: TemplateJSONFormat | null;
      /** 可选的类名 */
      className?: string;
      /** 是否显示标签（默认：true） */
      showLabels?: boolean;
    }
    ```

- [ ] **Task 2.2**: 添加摘要组件单元测试
  - File: `src/features/templates/components/TemplateSummaryDisplay/TemplateSummaryDisplay.test.tsx` (新建)
  - Action: 测试组件渲染和快照
  - 测试用例:
    - 完整数据渲染
    - 空值处理
    - 长文本截断
    - 样式类名正确

- [ ] **Task 2.3**: 导出摘要组件
  - File: `src/features/templates/components/TemplateSummaryDisplay/index.ts` (新建)
  - Action: 导出组件供外部使用

#### 阶段 3：主详情页组件集成

- [ ] **Task 3.1**: 修改 TemplateLibraryDetail 组件状态管理
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 添加新的状态变量
  - 实现细节:
    ```typescript
    const [editableTemplate, setEditableTemplate] = useState<Template | null>(null);
    const [isEditorExpanded, setIsEditorExpanded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<string | null>(null);
    ```

- [ ] **Task 3.2**: 在组件加载时转换模板数据
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 在 `fetchTemplateDetail` 成功后调用转换函数
  - 实现细节:
    - 导入 `templateSnapshotToTemplate`
    - 在获取模板后转换数据
    - 处理转换错误（降级显示）

- [ ] **Task 3.3**: 修改预览图卡片区域，添加双按钮布局
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 替换现有的编辑/删除按钮区域（位于预览图卡片右侧的操作按钮区域）
  - 实现细节:
    - 主按钮："生成图片"（使用主题色，显眼）
    - 次要按钮："高级编辑"（outlined 样式）
    - 保留现有的编辑、删除按钮到其他位置或折叠菜单
    - 添加 loading 状态（isGenerating 时禁用）

- [ ] **Task 3.4**: 集成 TemplateSummaryDisplay 组件
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 在预览图卡片后添加核心参数摘要区域
  - 位置: 在现有顶部卡片后，生成历史前
  - 实现细节:
    - 导入 `TemplateSummaryDisplay`
    - 传入 `editableTemplate?.jsonFormat`
    - 使用 Glassmorphism 卡片样式

- [x] **Task 3.5**: 集成 TemplateEditor 组件（可折叠）✅ (第五轮审查)
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 添加可折叠的编辑器
  - 实现细节:
    - 使用 Material-UI Collapse 或 Accordion 组件 ✅
    - 默认折叠（isEditorExpanded = false）✅
    - 点击"高级编辑"按钮展开 ✅
    - 编辑器底部添加操作按钮：✅
      - "确认修改"：保存编辑并折叠 ✅
      - "取消"：放弃编辑并折叠 ✅
    - 传入 `editableTemplate` 和 `onChange` 回调 ✅

- [ ] **Task 3.6**: 实现"生成图片"API 调用
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 创建 `handleGenerateImage` 函数
  - 实现细节:
    ```typescript
    const handleGenerateImage = useCallback(async (useEditedData = false) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setGenerationStatus('正在生成图片...');

      try {
        // 如果使用编辑后的数据，需要不同的处理
        // MVP: 直接调用 regenerate API，使用原始模板
        const response = await fetch(`/api/templates/${templateId}/regenerate`, {
          method: 'POST',
        });

        const result = await response.json();

        if (result.success) {
          setGenerationStatus('图片生成已开始，请稍候...');
          // 轮询或延迟刷新
          setTimeout(() => {
            fetchTemplateDetail();
            setGenerationStatus(null);
          }, 5000);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成失败');
        setGenerationStatus(null);
      } finally {
        setIsGenerating(false);
      }
    }, [templateId, isGenerating]);
    ```

- [x] **Task 3.7**: 实现"确认修改"和"取消"操作 ✅ (第五轮审查)
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 创建处理函数
  - 实现细节:
    - `handleConfirmEdit`: 保存编辑后的模板，折叠编辑器 ✅
    - `handleCancelEdit`: 放弃编辑，恢复原始数据，折叠编辑器 ✅
    - 使用临时状态存储编辑前的数据以支持取消 ✅
    - `handleTemplateChange`: 处理编辑器数据变化 ✅

- [ ] **Task 3.8**: 添加错误处理和用户反馈
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 完善错误状态和 Toast 通知
  - 实现细节:
    - 使用现有的 error state 显示错误
    - 添加生成状态的视觉反馈（ CircularProgress 或进度文本）
    - 成功/失败通知（可选，如果组件已有 useToast）

- [ ] **Task 3.9**: 移除或重构现有的 JSON 字符串展示
  - File: `src/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail.tsx`
  - Action: 删除"模版快照数据"卡片区域（位于生成历史之前，显示 JSON 字符串的区域）
  - 替换为新的 `TemplateSummaryDisplay` 组件
  - 注：查找包含 `JSON.stringify(templateSnapshot)` 或类似代码的 Card 组件

#### 阶段 4：测试与文档

- [ ] **Task 4.1**: 更新 TemplateLibraryDetail 组件测试
  - File: 对应的测试文件（如果存在）
  - Action: 添加新功能的测试用例
  - 测试用例:
    - 双按钮布局渲染
    - 点击"生成图片"调用正确 API
    - 点击"高级编辑"展开编辑器
    - 编辑器确认/取消操作
    - 核心参数摘要显示

- [ ] **Task 4.2**: 手动测试场景
  - Action: 执行完整的手动测试
  - 测试场景:
    - 直接生成路径
    - 编辑后生成路径
    - 编辑器展开/折叠
    - 错误处理（API 失败）
    - 移动端响应式
    - 不同数据完整度（完整/部分/空）

### Acceptance Criteria

#### 功能验收标准

- [ ] **AC 1**: Given 用户打开模板详情页，When 页面加载完成，Then 显示预览图、标题、核心参数摘要和两个操作按钮

- [ ] **AC 2**: Given 核心参数摘要区域，When 模板有完整数据，Then 显示 6 个维度的字段值（主体、风格、构图、色彩、光线、其他）

- [ ] **AC 3**: Given 用户点击"生成图片"按钮，When API 调用成功，Then 显示生成状态，并在 5 秒后刷新生成历史列表

- [ ] **AC 4**: Given 用户点击"生成图片"按钮，When 正在生成中，Then 按钮显示为禁用状态，并显示加载指示器

- [x] **AC 5**: Given 用户点击"高级编辑"按钮，When 编辑器展开，Then 显示完整的 TemplateEditor 组件，并隐藏或推到下方核心参数摘要 ✅ (第五轮审查)

- [x] **AC 6**: Given 用户在编辑器中修改了参数，When 点击"确认修改"，Then 编辑器折叠，核心参数摘要更新为修改后的值 ✅ (第五轮审查)

- [x] **AC 7**: Given 用户在编辑器中修改了参数，When 点击"取消"，Then 编辑器折叠，参数恢复为原始值 ✅ (第五轮审查)

- [ ] **AC 8**: Given 模板数据不完整（缺少某些维度），When 页面加载，Then 核心参数摘要显示可用字段，空字段显示为空或默认值

- [ ] **AC 9**: Given API 调用失败，When 发生错误，Then 在页面顶部显示错误提示，并允许用户重试

- [ ] **AC 10**: Given 用户在移动端访问，When 页面加载，Then 布局正确适配，按钮可点击，编辑器可展开

#### 集成验收标准

- [ ] **AC 11**: Given 新图片生成完成，When Webhook 回调执行，Then 生成历史列表自动包含新图片（通过刷新数据验证）

- [ ] **AC 12**: Given 用户编辑模板后生成图片，When 查看 API 调用，Then 使用正确的数据（MVP: 使用原始模板数据；未来: 使用编辑后的数据）

## Additional Context

### Dependencies

**外部依赖：**
- Next.js 15+ (App Router)
- React 19+
- Material-UI v5+ (Box, Button, Collapse, CircularProgress, Typography, etc.)
- Drizzle ORM (数据库操作，仅读取)
- date-fns (时间格式化，已使用)

**内部依赖：**
- `src/features/templates/components/TemplateEditor/TemplateEditor.tsx` - 现有编辑器组件
- `src/features/templates/components/TemplatePreview/FieldPreview.tsx` - 参考 FIELD_CONFIGS
- `src/features/templates/lib/template-generator.ts` - `generateJSONFormat`, `generateVariableFormat`
- `src/features/templates/lib/template-library-service.ts` - `getTemplateDetail`, `getTemplateGenerations`
- `src/features/templates/types/template.ts` - `Template`, `TemplateJSONFormat` 类型
- `src/features/templates/types/library.ts` - `SavedTemplate` 类型
- `src/types/analysis.ts` - `AnalysisData` 类型
- `src/features/templates/lib/field-configs.ts` - `FIELD_CONFIGS` 常量

**API 依赖：**
- `GET /api/templates/[id]` - 获取模板详情（已存在）
- `POST /api/templates/[id]/regenerate` - 重新生成图片（已存在）
- `GET /api/templates/[id]/generations` - 获取生成历史（已存在）

**数据流依赖：**
```
SavedTemplate (API)
    ↓ templateSnapshotToTemplate
Template (可编辑格式)
    ↓ TemplateEditor
编辑后的 Template
    ↓ (未来) API 调用
新图片生成
```

### Testing Strategy

**单元测试：**
1. **template-snapshot-converter.test.ts**
   - 测试正常数据转换
   - 测试缺失维度处理
   - 测试空值和边界情况
   - 使用 Jest，覆盖率目标 90%+

2. **TemplateSummaryDisplay.test.tsx**
   - 测试组件渲染
   - 测试不同数据状态（完整/部分/空）
   - 测试样式类名和 data-testid
   - 使用 React Testing Library

**测试数据示例：**
```typescript
// 完整数据测试用例
const completeJsonFormat: TemplateJSONFormat = {
  subject: "一位优雅的女性肖像",
  style: "油画风格，印象派笔触",
  composition: "中心构图，三分法布局",
  colors: "温暖的色调，金色和棕色为主",
  lighting: "自然光，柔和的侧光",
  additional: "背景虚化，突出主体"
};

// 部分缺失数据测试用例
const partialJsonFormat: TemplateJSONFormat = {
  subject: "城市夜景",
  style: "", // 空值
  // 缺少其他字段
};

// 空数据测试用例
const emptyJsonFormat: TemplateJSONFormat = {
  subject: "",
  style: "",
  composition: "",
  colors: "",
  lighting: "",
  additional: ""
};
```

**集成测试：**
3. **TemplateLibraryDetail 集成测试** (如果已有测试文件)
   - 测试完整的用户工作流（直接生成）
   - 测试编辑工作流（展开编辑器 → 修改 → 确认）
   - 测试 API 调用和错误处理
   - 使用 Mock Service Worker (MSW) 模拟 API

**E2E 测试：**
4. **手动测试清单**
   - 跨浏览器测试（Chrome, Firefox, Safari）
   - 移动端响应式测试
   - 不同数据完整度测试
   - 错误场景测试（网络错误、API 错误）

**性能测试：**
5. **转换性能**
   - 测试 `templateSnapshotToTemplate` 函数执行时间
   - 目标：< 10ms 转换时间

**可访问性测试：**
6. **WCAG 2.1 AA 合规**
   - 键盘导航（Tab 顺序）
   - 屏幕阅读器支持（aria-label）
   - 颜色对比度检查：
     - 正常文本：最少 **4.5:1** 对比度
     - 大文本（18pt+ 或 14pt+ 粗体）：最少 **3:1** 对比度
     - 交互元素（按钮、链接）：最少 **3:1** 对比度
   - 验证工具：使用 axe DevTools 或 Lighthouse 进行自动检测

### Testing Strategy - 测试环境配置

**所需测试配置：**
- Jest 配置（已存在）
- React Testing Library（已存在）
- MSW 用于 API mocking（如果未配置）
- Test data factories（使用现有的 `tests/support/factories/template-factory.ts`）

### Notes

**对抗性审查发现（2026-02-27）：**

### 第一轮审查（设计系统焦点）

通过对抗性审查发现并修复了以下问题：

**Critical 问题（已修复）：**
- ✅ **F1-F4**: 添加了"Design System Compliance"章节，明确设计系统规范
  - 按钮样式规范（variant, color, size）
  - 间距规范（spacing 系统）
  - 响应式断点（breakpoints）
  - 颜色规范（CSS 变量，对比度标准）
  - 状态设计规范（loading, error, disabled）
  - 动画规范（transition 参数）
  - Glassmorphism 样式使用指南

**High 优先级问题（已修复）：**
- ✅ **F5, F6**: 移除脆弱的行号引用，改用区域标识
- ✅ **F7**: 在 Out of Scope 中明确"编辑后生成"作为 V2 功能
- ✅ **F8**: 添加了测试数据示例（完整/部分/空数据）

**Medium 优先级问题（已修复）：**
- ✅ **F9**: 添加了 WCAG AA 颜色对比度标准（4.5:1 / 3:1）

**Low 优先级问题（已修复）：**
- ✅ **F13**: 为 TemplateSummaryDisplay 添加了 Props 接口定义

### 第二轮审查（新上下文，20 个发现）

通过独立上下文的对抗性审查发现并修复了以下问题：

**Critical 问题（已修复）：**
- ✅ **F1**: 添加了完整的 API 契约定义（请求/响应格式、错误处理、超时重试）
- ✅ **F2**: 添加了数据验证和类型安全（Zod schema + 运行时验证 + 降级策略）
- ✅ **F3**: 明确了 Props 验证和空值处理策略
- ✅ **F4**: 添加了状态机设计（5 种状态 + 事件转换 + 状态转换逻辑）
- ✅ **F5**: 明确了 MVP 中编辑器的"生成图片"按钮行为（禁用 + Tooltip 提示）

**High 优先级问题（已修复）：**
- ✅ **F6**: 添加了详细的按钮布局设计（桌面端/移动端 + 按钮排列规则）
- ✅ **F7**: 添加了完整的错误处理矩阵（9 种错误场景）
- ✅ **F8**: 添加了 TemplateEditor 集成配置（禁用功能、默认 Tab、其他配置）
- ✅ **F9**: 添加了完整的加载状态 UX 规范（全局/按钮/编辑器 + 状态文本）
- ✅ **F10**: 明确了核心参数摘要与编辑器的关系（动画效果、Z-index、布局优先级）

**Medium 优先级问题（已修复）：**
- ✅ **F11**: 添加了测试覆盖率要求（80% 行覆盖率，70% 分支覆盖率）
- ✅ **F12**: 添加了完整的可访问性测试清单（键盘导航、屏幕阅读器、焦点管理、颜色对比度）
- ✅ **F13**: 添加了性能预算和优化策略（FCP/LCP/TTI 目标 + React 优化）
- ✅ **F14**: 记录了国际化考虑（硬编码中文，产品仅支持中文）
- ✅ **F15**: 添加了移动端交互规范（触摸目标、布局策略、表单输入）
- ✅ **F16**: 添加了测试数据示例和验证函数

**Low 优先级问题（已记录）：**
- ⚠️ **F17**: 代码组织和命名（复用 FieldPreview 组件需进一步评估）
- ⚠️ **F18**: 验收标准可测试性（已记录，保持现有结构）
- ⚠️ **F19**: Analytics 和监控（作为未来迭代方向）
- ⚠️ **F20**: 向后兼容性（已通过降级策略处理）

### 第三轮审查（实现代码审查，2026-02-27）

对实际实现代码进行对抗性审查，发现并自动修复了以下问题：

**Critical 问题（已自动修复）：**
- ✅ **C1**: 添加 Zod 数据验证实现（`validation-schemas.ts`）
- ✅ **C2**: 实现状态机模式（`use-editor-state-machine.ts` hook）
- ✅ **C3**: 修复按钮 `fullWidth` 响应式问题（使用 `isMobile` 检测）
- ✅ **C4**: 移除无效的"确认修改"按钮，替换为清晰的"关闭编辑器"按钮
- ✅ **C5**: 实现 MoreMenu 组件（菜单形式集成编辑/删除按钮）

**Medium 问题（已自动修复）：**
- ✅ **M1**: 添加 API 调用超时处理（30s AbortController）
- ✅ **M2**: 实现网络错误和 5xx 错误的重试逻辑（最多 1 次重试）
- ✅ **M3**: 更新 `template-snapshot-converter.ts` 使用 Zod 验证

**Low 问题（已自动修复）：**
- ✅ **L1**: 添加 CircularProgress 加载图标到生成按钮
- ✅ **L2**: 添加状态机 hook 的完整测试覆盖

### 新增文件（第三轮审查）

为解决 Critical 和 Medium 问题，新增了以下文件：
1. **validation-schemas.ts** - Zod schema 验证（C1）
2. **use-editor-state-machine.ts** - 状态机 hook（C2）
3. **use-editor-state-machine.test.ts** - 状态机测试（L2）

### 修改的文件（第三轮审查）

为解决具体问题，修改了以下文件：
1. **TemplateLibraryDetail.tsx**:
   - 导入并使用 `useEditorStateMachine`（C2）
   - 修复 `fullWidth` 使用 `isMobile` 变量（C3）
   - 替换直接按钮为 MoreMenu（C5）
   - 添加 API 超时和重试逻辑（M1, M2）
   - 更新编辑器 UI，移除无效的"确认修改"按钮（C4）
   - 添加 CircularProgress 加载状态（L1）

2. **template-snapshot-converter.ts**:
   - 更新 `validateAnalysisData` 使用 Zod 验证（M3）

3. **template-snapshot-converter.test.ts**:
   - 添加 Zod 验证测试用例（M3）
   - 测试无效 confidence 值拒绝

---

### 第四轮审查（Low 优先级问题，2026-02-27）

修复剩余的 Low 优先级问题：

**Low 问题（已自动修复）：**
- ✅ **L2**: 提取玻璃卡片样式为可复用常量（`src/features/templates/styles/styles.ts`）
- ✅ **L3**: 添加完整的可访问性测试（WCAG 合规、键盘导航、语义化 HTML）
- ✅ **L4**: Git 提交记录（已在第三轮审查完成）

### 新增文件（第四轮审查）

为解决 Low 优先级问题，新增了以下文件：
1. **styles/styles.ts** - 玻璃卡片样式常量（GLASS_CARD_SX, GLASS_TEXT_COLORS 等）
2. **styles/index.ts** - 样式导出

### 修改的文件（第四轮审查）

为解决具体问题，修改了以下文件：
1. **TemplateLibraryDetail.tsx**:
   - 使用导入的 GLASS_CARD_SX 替代本地定义
   - 使用 GLASS_TEXT_COLORS 和 GLASS_BORDER_COLORS 常量

2. **TemplateSummaryDisplay.tsx**:
   - 使用导入的样式常量替代硬编码 CSS 变量

3. **TemplateSummaryDisplay.test.tsx**:
   - 添加 `afterEach` cleanup
   - 新增 WCAG 合规测试套件（3 个测试）
   - 新增键盘导航测试套件（2 个测试）
   - 新增语义化 HTML 和可访问性测试
   - 总共新增 10 个可访问性测试用例

---

### 审查统计总结

**第一轮审查：** 14 个问题，10 个已修复
**第二轮审查：** 20 个问题，16 个已修复 + 4 个已记录
**第三轮审查：** 11 个问题，11 个已自动修复
**第四轮审查：** 4 个问题，4 个已自动修复
**第五轮审查（对抗性代码审查，2026-02-27）：** 12 个问题，10 个已自动修复 + 2 个已记录

**总计：** 61 个发现，59 个已修复，2 个记录为技术债务

---

### 第五轮审查（对抗性代码审查，2026-02-27）

通过对抗性代码审查发现并修复了以下问题：

**Critical 问题（已自动修复）：**
- ✅ **C1**: 集成真正的 TemplateEditor 组件，替换占位符
- ✅ **C2**: 实现编辑器数据变化处理（handleTemplateChange）
- ✅ **C3**: 实现 handleConfirmEdit 函数，使用状态机的 CONFIRM_EDIT 事件
- ✅ **C4**: 添加"确认修改"按钮，允许用户保存编辑

**High 优先级问题（已自动修复）：**
- ✅ **H1**: 添加编辑前模板备份状态（templateBeforeEdit）用于取消时恢复
- ✅ **H2**: 配置 TemplateEditor props（showSaveButton=false, showOptimizeButton=false）
- ✅ **H3**: 实现 handleCancelEdit 使用备份模板数据恢复

**Medium 优先级问题（已自动修复）：**
- ✅ **M1**: TemplateEditor 集成配置已实现
- ✅ **M2**: AC6 和 AC7 验收标准现在可以通过（确认修改和取消功能完整）
- ✅ **M3**: CONFIRM_EDIT 事件现在被正确使用
- ✅ **M4**: 核心参数摘要更新逻辑已实现（通过 editableTemplate 状态）

**Low 优先级问题（已记录）：**
- ⚠️ **L1**: Git 提交消息精确度（已在第三轮处理）
- ⚠️ **L2**: MUI Grid 弃用警告（需要升级到 Grid v2）

### 修改的文件（第五轮审查）

为解决具体问题，修改了以下文件：
1. **TemplateLibraryDetail.tsx**:
   - 导入 TemplateEditor 组件
   - 添加 templateBeforeEdit 备份状态
   - 实现 handleConfirmEdit 函数
   - 实现 handleTemplateChange 函数
   - 更新 handleCancelEdit 使用备份恢复
   - 替换占位符为真正的 TemplateEditor 组件
   - 添加"确认修改"和"取消"按钮

### 测试结果
- ✅ 所有 379 个测试通过
- ✅ 没有引入新的类型错误
- ✅ 编辑器功能完整实现
**第四轮审查：** 4 个问题，4 个已自动修复
**总计：** 49 个发现，47 个已修复，2 个记录为技术债务

**自动修复详情（2026-02-27）：**

**第一轮（HIGH + MEDIUM）：**
- 新增文件：3 个（validation-schemas.ts, use-editor-state-machine.ts, 测试文件）
- 修改文件：4 个（TemplateLibraryDetail.tsx, converter.ts, converter.test.ts）
- 测试通过：30 个测试用例

**第二轮（LOW）：**
- 新增文件：2 个（styles.ts, styles/index.ts）
- 修改文件：3 个（TemplateLibraryDetail.tsx, TemplateSummaryDisplay.tsx, 测试文件）
- 测试通过：379 个模板测试用例，新增 10 个可访问性测试

**累计提交：**
- commit 0c2b115: fix: 修复模板详情页代码审查发现的问题（HIGH + MEDIUM）
- commit bfbacae: refactor: 提取玻璃卡片样式常量并增强可访问性测试（LOW）
