---
title: '合并右侧模板编辑器为统一卡片'
slug: 'merge-right-column-template-editors'
created: '2026-02-23'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4, 5, 6]
tech_stack: ['React', 'TypeScript', 'MUI', 'lucide-react']
files_to_modify: [
  'src/features/analysis/components/WorkspaceColumns/RightColumn.tsx',
  'src/features/analysis/components/UnifiedTemplateEditor/UnifiedTemplateEditor.tsx',
  'src/features/analysis/components/UnifiedTemplateEditor/TemplatePreview.tsx',
  'src/features/analysis/components/UnifiedTemplateEditor/QuickVariableEditor.tsx'
]
code_patterns: ['统一变量系统', '双向同步', '响应式布局', 'Glassmorphism']
test_patterns: ['手动测试']
---

# Tech-Spec: 合并右侧模板编辑器为统一卡片

**Created:** 2026-02-23

## Overview

### Problem Statement

Analysis 页面右侧列目前存在两个独立的卡片组件：
1. `TemplateEditor` - 模板预览 + 变量替换编辑
2. `TemplateGenerationSection` - 包含 `EnhancedTemplateEditor` + 图片生成（默认收起）

这种分离设计导致：
- 功能分散，用户需要在两个区域操作
- 收起/展开增加了交互步骤
- 视觉上不够统一

### Solution

将两个卡片合并为一个统一的卡片，整合所有功能：
- 模板编辑区 + 快速变量编辑区 + 预览区
- 双向同步：编辑模板 ↔ 修改变量
- 图片生成兼容：变量自动转换为 6 字段格式
- 移除收起/展开，全部直接展开显示

### Scope

**In Scope:**
- 合并 RightColumn 中的两个卡片为一个
- 简化变量系统（直接从模板提取，无需单独维护）
- 保留图片生成功能
- 保留复制、导出功能
- 移除展开/收起按钮
- 响应式布局优化（桌面/平板/移动）

**Out of Scope:**
- 修改模板库页面
- 修改其他分析流程页面

## Context for Development

### Codebase Patterns

- 使用 MUI + Glassmorphism 风格 (`ia-glass-card`)
- 组件使用 `data-testid` 进行测试标识
- 响应式布局支持 mobile/tablet/desktop (`useMediaQuery`)

### Files to Reference

| File | Purpose | 改造要点 |
| ---- | ------- | -------- |
| `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx` | 右侧列主组件 | 合并两个卡片为一个 |
| `src/features/analysis/components/TemplateEditor.tsx` | 现有变量编辑器 | 参考预览高亮逻辑 |
| `src/features/analysis/components/TemplateGenerationSection/TemplateGenerationSection.tsx` | 模板生成区块 | 移除（功能整合） |
| `src/features/templates/components/CopyButton/CopyButton.tsx` | 复制按钮 | 复用 |
| `src/features/templates/components/ExportButton/ExportButton.tsx` | 导出按钮 | 复用 |
| `src/features/generation/components/GenerateButton/GenerateButton.tsx` | 生成图片按钮 | 复用 |

### Technical Decisions

1. **简化变量系统**:
   - 不单独维护变量列表状态
   - 变量直接从模板文本中提取（正则：`/\[([^\]]+)\]/g`）
   - 用户在模板中直接输入 `[变量名]` 即可创建变量

2. **快速变量编辑区**:
   - 在模板编辑区下方显示提取的变量
   - 允许快速编辑变量值（不影响模板文本）
   - 实现双向同步：编辑模板 → 提取变量 | 编辑变量 → 更新对应占位符
   - **防循环机制实现**：
     - 使用 `useRef` 记录更新来源：`'template' | 'variable' | null`
     - 从模板编辑区更新时：先设置 `updatingRef.current = 'template'`，再更新变量列表
     - 从变量编辑区更新时：先设置 `updatingRef.current = 'variable'`，再更新模板文本
     - 更新完成后重置：`updatingRef.current = null`
     - 每次更新前检查：`if (updatingRef.current === source) return`
   - **变量值初始值**：首次提取时默认为空字符串 `''`，用户需手动填写
   - **重复变量名处理**：对变量名去重，只显示一个，多个同名占位符同步更新

3. **预览逻辑**:
   - 直接在模板文本中高亮 `[变量名]`
   - 非变量格式的方括号（如 `[普通文本]`）不进行高亮处理

4. **图片生成兼容**:
   - 确定方案 A：将模板文本转换为 jsonFormat
   - 变量名 → 字段 key 的映射规则：
     - 第1个变量 → subject
     - 第2个变量 → style
     - 第3个变量 → composition
     - 第4个变量 → colors
     - 第5个变量 → lighting
     - 第6个变量 → additional
     - 超出6个的变量：用换行符 `\n` 分隔后合并到 additional

5. **响应式布局**:
   - 桌面端：三列（模板编辑 | 快速变量 | 预览+操作）
   - 平板端：两列（模板编辑+变量 | 预览+操作）
   - 移动端：单列堆叠（编辑 → 变量 → 预览）
   - **移动端优化**：编辑时自动滚动到可视区域，避免虚拟键盘遮挡

6. **组件架构**:
   - 新建 `UnifiedTemplateEditor` 组件
   - 移除 `TemplateGenerationSection`
   - 模板库的 `EnhancedTemplateEditor` 保持不变

7. **组件接口定义**:
   - `UnifiedTemplateEditor` props: `templateContent, onCopy, onExport, analysisData, analysisResultId, userId`
   - `TemplatePreview` props: `templateContent, variables`
   - `QuickVariableEditor` props: `templateContent, onVariableChange, onTemplateChange`

8. **外部 props 变化处理**:
   - 使用 `useEffect` 监听 `templateContent` prop 变化
   - 当外部更新时，同步更新内部编辑器状态
   - 防止循环：使用 `prevTemplateContent` ref 对比，避免重复处理

## Implementation Plan

### Tasks

#### Task 1: 新建 UnifiedTemplateEditor 组件
- **File**: `src/features/analysis/components/UnifiedTemplateEditor/UnifiedTemplateEditor.tsx`
- **Action**:
  - 创建目录和组件文件
  - 实现模板编辑区（TextArea 直接编辑）
  - 实现快速变量编辑区（从模板提取变量，可快速编辑值）
  - 实现模板预览区（带变量高亮渲染）
  - 实现操作栏（复制/导出/生成）
  - 实现响应式布局（三列/两列/单列）
  - **防循环机制**：使用 `useRef` 标记更新来源
  - **外部 props 处理**：监听 `templateContent` 变化并同步
- **Props 接口**:
  ```typescript
  interface UnifiedTemplateEditorProps {
    templateContent: string;
    onCopy: () => void;
    onExport: (template: Template) => void;
    analysisData?: AnalysisData | null;
    analysisResultId?: string | null;
    userId?: string | null;
  }
  ```
- **Notes**:
  - 复用 `CopyButton`, `ExportButton`, `GenerateButton`
  - 变量提取正则：`/\[([^\]]+)\]/g`
  - 快速变量编辑与模板文本双向同步
  - 组件卸载时无需特殊清理（useRef 自动处理）

#### Task 2: 实现模板预览组件
- **File**: `src/features/analysis/components/UnifiedTemplateEditor/TemplatePreview.tsx`
- **Action**:
  - 实现模板内容渲染
  - 实现变量高亮（ `[变量名]` 格式）
- **Props 接口**:
  ```typescript
  interface TemplatePreviewProps {
    templateContent: string;
    variables: Array<{ name: string; value: string }>;
  }
  ```
- **Notes**: 使用正则匹配高亮变量

#### Task 3: 实现快速变量编辑器组件
- **File**: `src/features/analysis/components/UnifiedTemplateEditor/QuickVariableEditor.tsx`
- **Action**:
  - 从模板文本提取变量列表（使用正则 `/\[([^\]]+)\]/g`）
  - 对变量名去重（Set）
  - 显示变量名和变量值输入框
  - 编辑变量值时同步更新模板文本（使用防循环机制）
  - 实时更新：onChange 事件实时同步
  - 处理边界情况：
    - 空变量值：显示为灰色占位符
    - 重复变量名：去重后只显示一个
- **Props 接口**:
  ```typescript
  interface QuickVariableEditorProps {
    templateContent: string;
    onVariableChange: (name: string, value: string) => void;
    onTemplateChange: (newTemplate: string) => void;
  }
  ```
- **Notes**: 作为 UnifiedTemplateEditor 的子组件

#### Task 4: 更新 RightColumn 组件
- **File**: `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx`
- **Action**:
  - 移除 `TemplateGenerationSection` 导入和使用
  - 导入并使用 `UnifiedTemplateEditor`
  - 移除展开/收起状态和逻辑
  - 调整布局（单一卡片）
- **Notes**: 确保 props 正确传递

#### Task 5: 添加组件导出
- **File**: `src/features/analysis/components/index.ts`
- **Action**: 导出 `UnifiedTemplateEditor` 组件

#### Task 6: 验证功能完整性
- **Action**:
  - 测试所有验收标准
  - 检查响应式布局
  - 验证图片生成功能
- **Notes**: 手动测试为主

### Acceptance Criteria

**Happy Path:**

- [ ] AC1: Given 有模板内容, when 渲染右侧列, then 只有一个卡片显示
- [ ] AC2: Given 模板包含变量占位符 `[变量名]`, when 渲染预览区, then 变量高亮显示
- [ ] AC3: Given 模板包含变量占位符, when 渲染编辑器, then 快速变量编辑区显示所有提取的变量（去重）
- [ ] AC4: Given 用户在快速变量区编辑变量值, when onChange 触发, then 模板文本中的对应占位符值实时同步更新
- [ ] AC5: Given 用户编辑模板文本, when 内容变化, then 快速变量区自动重新提取变量
- [ ] AC6: Given 用户在模板中输入 `[新变量]`, when 预览渲染, then 新变量在快速变量区显示（初始值为空字符串）
- [ ] AC7: Given 有模板内容, when 用户点击复制按钮, then 复制替换后的完整内容到剪贴板
- [ ] AC8: Given 有模板内容, when 用户点击导出按钮, then 弹出包含变量信息的 JSON 文件下载
- [ ] AC9: Given 有模板内容, when 用户点击生成图片按钮, then 打开生成选项对话框（使用转换后的 jsonFormat）
- [ ] AC10: Given 桌面端布局, when 渲染编辑器, then 显示三列布局（编辑 | 变量 | 预览+操作）
- [ ] AC11: Given 平板端布局, when 渲染编辑器, then 显示两列布局（编辑+变量 | 预览+操作）
- [ ] AC12: Given 移动端布局, when 渲染编辑器, then 显示单列布局，编辑时自动滚动到可视区域

**Edge Cases:**

- [ ] AC13: Given 无模板内容, when 渲染右侧列, then 显示 EmptyState 组件
- [ ] AC14: Given 模板无变量占位符, when 渲染预览, then 正常显示纯文本
- [ ] AC15: Given 模板包含超过 6 个变量, when 图片生成, then 前 6 个映射到字段，其余用换行符分隔后合并到 additional
- [ ] AC16: Given 模板包含特殊字符, when 渲染预览, then 正常显示不报错
- [ ] AC17: Given 模板中有 `[普通文本]` (非变量), when 提取变量, then 也会提取（无法区分）
- [ ] AC18: Given 变量值为空, when 显示快速变量区, then 显示为灰色占位符
- [ ] AC19: Given 模板中有重复变量名, when 提取变量, then 去重后只显示一个
- [ ] AC20: Given 外部 templateContent prop 更新, when 组件接收新值, then 内部编辑器状态同步更新

## Additional Context

### Dependencies

**内部依赖:**
- `src/features/templates/components/CopyButton/CopyButton.tsx` - 复用复制按钮
- `src/features/templates/components/ExportButton/ExportButton.tsx` - 复用导出按钮
- `src/features/generation/components/GenerateButton/GenerateButton.tsx` - 复用生成按钮
- `@mui/material` - UI 组件库
- `lucide-react` - 图标

**无外部依赖**: 本任务不引入新的 npm 包

### Testing Strategy

**手动测试:**
- 所有 20 条验收标准
- 响应式布局（桌面/平板/移动）
- 与 RightColumn 的集成
- 双向同步防循环测试
- 外部 props 变化同步测试

**Task 依赖关系:**
- Task 1 (UnifiedTemplateEditor) → 独立，可并行
- Task 2 (TemplatePreview) → 依赖 Task 1 的接口定义
- Task 3 (QuickVariableEditor) → 依赖 Task 1 的接口定义
- Task 4 (RightColumn) → 依赖 Task 1 完成
- Task 5 (导出) → 依赖 Task 1-3 完成
- Task 6 (验证) → 依赖所有开发 Task 完成

### Notes

**最终设计亮点：**
- 简化变量系统：直接从模板提取，无需额外状态
- 快速变量编辑区：用户可快速修改变量值，无需编辑整个模板
- 双向同步：编辑模板 → 提取变量 | 编辑变量 → 更新模板
- 图片生成兼容：自动将变量转换为 6 字段格式（按顺序映射，超出部分用换行符分隔）
- 防循环机制：使用 `useRef` 标记更新来源避免死循环
- 完整响应式支持：桌面三列 / 平板两列 / 移动单列
- 接口明确：所有组件 props 接口清晰定义
- 外部同步：支持外部 props 变化时内部状态同步

**高风险项:**
- 模板编辑与快速变量区的同步逻辑需要确保正确
- 模板内容很长时的高亮渲染性能

**已知限制:**
- 模板库的 EnhancedTemplateEditor 保持不变，两套系统独立
- 无法区分 `[普通文本]` 和 `[变量]`，都会被提取为变量
