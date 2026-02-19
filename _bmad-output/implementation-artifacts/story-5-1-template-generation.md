# Story 5.1: template-generation

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 创作者
I want 系统根据风格分析结果自动生成结构化的提示词模版
so that 我可以直接使用或微调后生成同风格的新图片

## Acceptance Criteria

1. **AC1:** 系统可以从风格分析结果（四维度特征）生成可编辑的变量模版，清晰标记可替换部分（使用 `[变量名]` 格式）

2. **AC2:** 系统可以生成两种格式的模版：
   - 变量模版格式：适合新手用户，清晰标记可替换部分
   - JSON 格式：适合专业用户集成工作流

3. **AC3:** 用户可以在模版生成界面直接编辑模版内容，支持实时预览

4. **AC4:** 用户可以一键复制模版到剪贴板（支持快捷键 Ctrl/Cmd + C）

5. **AC5:** 系统提供默认模版结构，包含以下核心字段：
   - Subject: [主体描述]
   - Style: [风格描述]
   - Composition: [构图信息]
   - Colors: [色彩方案]
   - Lighting: [光线设置]
   - Additional: [其他细节]

6. **AC6:** 模版生成遵循 UX 设计规范：
   - 使用 Glassmorphism 卡片样式（`ia-glass-card`）
   - 使用 Lucide 图标（Copy 图标：16px，green-500）
   - 支持展开/收起详细分析（300ms 动画）

7. **AC7:** 用户可以选择将模版保存到个人模版库（关联到 Story 5.4）

## Tasks / Subtasks

- [x] **Task 1: 创建模版生成数据结构和类型定义** (AC: 1, 2, 5)
  - [x] 1.1 定义 `Template` 接口（包含变量模版和 JSON 格式）
  - [x] 1.2 定义 `TemplateField` 枚举（Subject, Style, Composition, Colors, Lighting, Additional）
  - [x] 1.3 创建模版生成工具函数

- [x] **Task 2: 实现模版生成逻辑** (AC: 1, 2, 5)
  - [x] 2.1 从分析结果提取风格特征
  - [x] 2.2 将四维度分析转换为结构化模版
  - [x] 2.3 生成变量模版格式（标记可替换部分）
  - [x] 2.4 生成 JSON 格式模版

- [x] **Task 3: 创建模版编辑组件** (AC: 3, 6)
  - [x] 3.1 创建 `TemplateEditor` 组件（支持实时编辑）
  - [x] 3.2 应用 Glassmorphism 样式（`ia-glass-card`）
  - [x] 3.3 实现 Lucide Copy 图标按钮
  - [x] 3.4 实现展开/收起详细分析（300ms 动画）

- [x] **Task 4: 实现一键复制功能** (AC: 4)
  - [x] 4.1 创建 `useCopyToClipboard` hook
  - [x] 4.2 实现复制按钮交互
  - [x] 4.3 添加快捷键支持（Ctrl/Cmd + C）
  - [x] 4.4 添加复制成功反馈（Toast 提示）

- [x] **Task 5: 集成到分析结果页面** (AC: 6)
  - [x] 5.1 修改 `AnalysisCard` 组件，添加模版生成区域
  - [x] 5.2 实现模版与分析结果的联动
  - [x] 5.3 确保响应式布局（移动端/桌面端）

- [ ] **Task 6: 添加模版保存功能（基础）** (AC: 7)
  - [ ] 6.1 创建 "保存到模版库" 按钮
  - [ ] 6.2 实现保存逻辑（调用 Story 5.4 的 API）
  - [ ] 6.3 添加保存成功反馈

- [x] **Task 7: 单元测试和集成测试**
  - [x] 7.1 测试模版生成逻辑（各种分析结果场景）
  - [ ] 7.2 测试模版编辑组件交互
  - [ ] 7.3 测试复制功能（包括快捷键）
  - [ ] 7.4 测试 Glassmorphism 样式渲染

- [ ] **Task 8: E2E 测试**
  - [ ] 8.1 测试完整流程：分析 → 生成模版 → 编辑 → 复制
  - [ ] 8.2 测试保存到模版库流程
  - [ ] 8.3 测试移动端交互
  - [ ] 8.4 视觉回归测试（模版编辑器快照）

## Dev Notes

### 业务上下文

**Epic 5 目标：** 模版生成与管理 - 用户可以获得结构化的提示词模版，支持编辑和导出

**Story 5.1 定位：** 第一个故事，实现核心的模版生成功能，为后续故事（JSON 导出、模版编辑器、提示词优化）奠定基础

**用户价值：**
- 新手用户：获得可用的提示词，无需专业写作能力
- 专业用户：快速生成结构化模版，集成到工作流
- 所有人：降低 AI 绘画门槛，提升创作效率

### 相关功能需求（FR）

- **FR19:** 系统可以根据风格特征生成可编辑的变量模版
- **FR20:** 系统可以生成 JSON 格式的模版供专业用户集成工作流
- **FR21:** 系统可以在模版中清晰标记可替换的变量部分
- **FR22:** 用户可以编辑生成的模版内容
- **FR23:** 用户可以将模版复制到剪贴板
- **FR24:** 用户可以导出 JSON 格式的模版文件（Story 5.2）
- **FR25:** 系统可以调用文字模型提供商优化提示词（Story 5.4）
- **FR65:** 用户可以在分析结果页面选择将特定模版保存到个人模版库

### 架构约束

**技术栈：**
- 前端框架：Next.js 15+ (App Router)
- 状态管理：Zustand（UI 状态）+ React Query（服务器状态）
- UI 组件：MUI + Tailwind CSS（Glassmorphism 样式）
- 图标库：Lucide React（必须使用）
- 类型检查：TypeScript

**命名规范：**
- 组件：PascalCase（`TemplateEditor`, `CopyButton`）
- 函数/变量：camelCase（`generateTemplate`, `copyToClipboard`）
- 类型/接口：PascalCase（`Template`, `TemplateField`）
- 常量：UPPER_SNAKE_CASE（`TEMPLATE_FIELDS`）
- 文件名：kebab-case（`template-editor.tsx`）

**项目结构：**
```
src/features/templates/
├── components/
│   ├── TemplateEditor/
│   │   ├── index.tsx
│   │   ├── TemplateEditor.tsx
│   │   ├── TemplateEditor.test.tsx
│   │   └── types.ts
│   ├── CopyButton/
│   │   ├── index.tsx
│   │   └── CopyButton.tsx
│   └── TemplatePreview/
│       ├── index.tsx
│       └── TemplatePreview.tsx
├── hooks/
│   ├── useCopyToClipboard.ts
│   └── useTemplateGeneration.ts
├── lib/
│   ├── template-generator.ts
│   └── template-formatter.ts
└── types/
    └── template.ts
```

### 数据结构设计

**Template 接口：**
```typescript
interface Template {
  id: string;
  userId: string;
  analysisResultId: string;
  variableFormat: string;  // 变量模版格式
  jsonFormat: {
    subject: string;
    style: string;
    composition: string;
    colors: string;
    lighting: string;
    additional: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateField {
  key: 'subject' | 'style' | 'composition' | 'colors' | 'lighting' | 'additional';
  label: string;
  placeholder: string;
  required: boolean;
}
```

### API 设计

**生成模版（内部函数，无需 API）：**
```typescript
// src/features/templates/lib/template-generator.ts
export function generateTemplate(analysisResult: AnalysisResult): Template {
  // 从分析结果生成模版
}
```

**复制到剪贴板（浏览器 API）：**
```typescript
// src/features/templates/hooks/useCopyToClipboard.ts
export function useCopyToClipboard() {
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };
  return { copy };
}
```

### 测试策略

**单元测试：**
- 模版生成逻辑（各种分析结果场景）
- 模版格式化函数
- `useCopyToClipboard` hook

**集成测试：**
- `TemplateEditor` 组件交互
- 复制按钮功能
- Glassmorphism 样式应用

**E2E 测试：**
- 完整流程：上传 → 分析 → 生成模版 → 编辑 → 复制
- 保存到模版库流程
- 移动端交互
- 视觉回归测试

### UI/UX 设计规范

**Glassmorphism 样式：**
- 使用 `ia-glass-card` 类（已在 `src/app/globals.css` 定义）
- 悬停状态：`ia-glass-card:hover`
- 激活状态：`ia-glass-card--active`

**图标系统：**
- 复制图标：`<Copy size={16} className="text-green-500" />`
- 必须使用 Lucide 图标库
- 尺寸：16px（按钮图标）
- 颜色：`text-green-500`（主要操作）

**动画：**
- 展开/收起：300ms 平滑过渡
- 使用 CSS transition 或 Framer Motion

**响应式设计：**
- 桌面端（≥ 1024px）：三列布局
- 平板端（768-1024px）：两列布局
- 移动端（< 768px）：单列布局

### 性能要求

- 模版生成延迟：< 100ms（本地计算）
- 编辑输入延迟：< 50ms（无感知延迟）
- 复制操作：< 200ms（包含反馈动画）

### 安全考虑

- 用户只能编辑自己的模版
- 复制操作需要用户主动触发（防止恶意脚本）
- 模版内容需要内容过滤（复用 Story 4.1 的逻辑）

### 依赖关系

**前置依赖：**
- ✅ Epic 3: AI 风格分析（已完成的 `analysis_results` 数据结构）
- ✅ Epic 4: 内容安全（内容过滤逻辑）
- ✅ UX-UPGRADE-1: UX 设计规范升级（Glassmorphism + Lucide 图标）

**后置依赖：**
- 🟡 Story 5.2: JSON 导出（依赖本故事的 `jsonFormat`）
- 🟡 Story 5.3: 模版编辑器（扩展本故事的编辑功能）
- 🟡 Story 5.4: 提示词优化（调用文字模型 API）

### 风险和缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| 模版生成质量不一致 | 🟡 中 | 🟡 中 | 基于用户反馈迭代优化模版生成逻辑 |
| Lucide 图标导入错误 | 🟢 低 | 🟢 低 | 严格参考 `14-icon-system.md`，使用正确的图标名称 |
| Glassmorphism 样式冲突 | 🟢 低 | 🟢 低 | 使用 `ia-` 命名空间，避免与第三方库冲突 |
| 移动端编辑体验差 | 🟡 中 | 🟡 中 | 增加移动端测试，优化触摸交互 |
| 复制功能兼容性问题 | 🟢 低 | 🟢 低 | 使用 Clipboard API + fallback 方案 |

### 验收测试检查清单

**功能测试：**
- [ ] 模版生成正确（从分析结果转换）
- [ ] 变量模版格式正确（`[变量名]` 标记）
- [ ] JSON 格式结构正确
- [ ] 编辑功能正常（实时更新）
- [ ] 复制功能正常（包括快捷键）
- [ ] 保存到模版库功能正常

**视觉测试：**
- [ ] Glassmorphism 样式应用正确
- [ ] Lucide 图标显示正确
- [ ] 展开/收起动画流畅（300ms）
- [ ] 响应式布局正确（桌面/平板/移动）

**兼容性测试：**
- [ ] Chrome 浏览器测试通过
- [ ] Safari 浏览器测试通过
- [ ] Firefox 浏览器测试通过
- [ ] 移动端测试通过

**性能测试：**
- [ ] 模版生成延迟 < 100ms
- [ ] 编辑输入延迟 < 50ms
- [ ] 复制操作 < 200ms

### 项目结构注意事项

**遵循现有项目结构：**
- 模版功能放在 `src/features/templates/` 目录
- 测试文件与源文件同目录
- 使用 `src/lib/` 存放通用工具函数
- 使用 `src/types/` 存放全局类型定义

**与现有代码集成：**
- 复用 `src/features/analysis/` 的 `AnalysisResult` 类型
- 复用 `src/components/shared/` 的通用组件
- 复用 `src/lib/replicate/` 的 API 客户端

### 参考文档

**PRD:**
- [PRD - 模版生成与编辑](../../planning-artifacts/prd.md#模版生成与编辑)
- [FR19-25, FR65](../../planning-artifacts/prd.md#模版生成与编辑)

**Architecture:**
- [架构决策文档](../../planning-artifacts/architecture.md)
- [命名规范](../../planning-artifacts/architecture.md#naming-patterns)
- [项目结构](../../planning-artifacts/architecture.md#project-structure--boundaries)

**UX Design:**
- [Glassmorphism 指南](../../planning-artifacts/ux-design/13-glassmorphism-guide.md)
- [图标系统](../../planning-artifacts/ux-design/14-icon-system.md)

**Previous Stories:**
- [Story 3.1: Style Analysis](./story-3-1-style-analysis.md)（参考分析结果结构）
- [Story UX-UPGRADE-1](./story-ux-upgrade-1.md)（参考 UX 升级模式）

### 开发优先级

**P0（核心必需）：**
- Task 1: 数据结构和类型定义
- Task 2: 模版生成逻辑
- Task 3: 模版编辑组件（基础版本）
- Task 4: 一键复制功能

**P1（重要）：**
- Task 5: 集成到分析结果页面
- Task 7: 单元测试和集成测试

**P2（优化）：**
- Task 6: 保存到模版库功能（可延后到 Story 5.4）
- Task 8: E2E 测试

### 技术债务和优化机会

**当前可接受的技术债务：**
- 模版生成逻辑基于规则，未使用 AI 优化（延迟到 Story 5.4）
- JSON 导出功能未实现（Story 5.2 实现）

**未来优化方向：**
- 基于用户反馈数据优化模版生成质量
- 支持自定义模版字段
- 支持模版预设（品牌风格、艺术流派等）

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

**✅ 已完成的核心功能 (P0):**

1. **类型定义系统**
   - 创建完整的 TypeScript 类型定义
   - 定义 Template、TemplateField、TemplateJSONFormat 等核心接口
   - 建立模版字段常量和元数据

2. **模版生成逻辑**
   - 实现 `generateTemplate` 函数，从分析结果生成结构化模版
   - 支持变量格式和 JSON 格式两种输出
   - 实现变量提取和替换功能
   - 提供模版格式化工具函数

3. **UI 组件**
   - `TemplateEditor`: 完整的模版编辑器，支持实时编辑和预览
   - `TemplatePreview`: 模版预览组件，支持变量高亮
   - `CopyButton`: 复制按钮组件，支持键盘快捷键和反馈
   - `TemplateGenerationSection`: 集成到分析结果页面的模版生成区域

4. **React Hooks**
   - `useCopyToClipboard`: 复制到剪贴板功能，支持回退方案
   - `useTemplateGeneration`: 模版生成 hook，自动处理分析数据

5. **集成**
   - 将模版生成功能集成到 `MiddleColumn` 组件
   - 在分析完成后自动生成并显示模版区域
   - 支持展开/收起功能（300ms 动画）

6. **测试**
   - 编写 8 个单元测试，覆盖模版生成核心逻辑
   - 所有测试通过

**⚠️ 未完成的功能 (P1/P2):**

- Task 6: 保存到模版库功能（延后到 Story 5.4）
- Task 7.2-7.4: 组件交互测试、快捷键测试、样式测试
- Task 8: E2E 测试

**📝 技术决策:**

1. 使用 TypeScript 严格类型检查，确保类型安全
2. 采用组件化设计，便于复用和维护
3. 遵循项目的 Glassmorphism 设计规范
4. 使用 Lucide 图标库，保持设计一致性
5. 实现回退方案，支持旧版浏览器的复制功能

### File List

**新增文件:**
- `src/features/templates/types/template.ts` - 模板类型定义
- `src/features/templates/types/constants.ts` - 模板常量
- `src/features/templates/types/index.ts` - 类型导出
- `src/features/templates/lib/template-generator.ts` - 模板生成器
- `src/features/templates/lib/template-formatter.ts` - 模板格式化工具
- `src/features/templates/lib/index.ts` - 库导出
- `src/features/templates/lib/template-generator.test.ts` - 模板生成器测试
- `src/features/templates/components/CopyButton/CopyButton.tsx` - 复制按钮组件
- `src/features/templates/components/CopyButton/index.ts` - 复制按钮导出
- `src/features/templates/components/TemplateEditor/TemplateEditor.tsx` - 模板编辑器组件
- `src/features/templates/components/TemplateEditor/index.ts` - 模板编辑器导出
- `src/features/templates/components/TemplatePreview/TemplatePreview.tsx` - 模板预览组件
- `src/features/templates/components/TemplatePreview/index.ts` - 模板预览导出
- `src/features/templates/components/index.ts` - 组件导出
- `src/features/templates/hooks/useCopyToClipboard.ts` - 复制 hook
- `src/features/templates/hooks/useCopyToClipboard.test.ts` - 复制 hook 测试
- `src/features/templates/hooks/useTemplateGeneration.ts` - 模板生成 hook
- `src/features/templates/hooks/index.ts` - hooks 导出
- `src/features/templates/index.ts` - 功能主导出
- `src/features/analysis/components/TemplateGenerationSection/TemplateGenerationSection.tsx` - 模板生成区域组件
- `src/features/analysis/components/TemplateGenerationSection/index.ts` - 模板生成区域导出

**修改文件:**
- `src/features/analysis/components/WorkspaceColumns/MiddleColumn.tsx` - 集成模板生成区域
- `src/features/analysis/components/index.ts` - 导出 TemplateGenerationSection
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - 更新故事状态为 in-progress
- `_bmad-output/implementation-artifacts/story-5-1-template-generation.md` - 更新任务进度
