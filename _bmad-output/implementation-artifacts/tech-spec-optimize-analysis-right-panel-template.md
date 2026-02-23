---
title: '优化 Analysis 页面右侧模板区域'
slug: 'optimize-analysis-right-panel-template'
created: '2026-02-22'
status: 'Completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React', 'Next.js', 'MUI', 'TypeScript', 'Tailwind CSS']
files_to_modify: [
  'src/features/analysis/components/WorkspaceColumns/RightColumn.tsx',
  'src/features/analysis/components/TemplatePreview.tsx'
]
code_patterns: ['Glassmorphism (CSS Classes)', 'MUI Component Library', 'React Hooks']
test_patterns: []
---

# Tech-Spec: 优化 Analysis 页面右侧模板区域

**Created:** 2026-02-22

## Overview

### Problem Statement

当前 Analysis 页面右侧模板区域存在以下问题：
1. **布局复杂** - 多层嵌套的玻璃卡片，信息层级不清晰
2. **功能分散** - 复制、保存、变量替换、AI 生成等功能平铺，用户难以快速找到核心操作
3. **视觉负担重** - 过多的边框、背景色、分隔线增加认知负担
4. **交互门槛高** - 用户需要理解多个独立功能才能使用

### Solution

重新设计右侧模板区域，采用简洁的单一列布局：
- **核心操作前置** - 一键复制作为最显眼的主按钮
- **功能渐进展开** - 模板预览为核心，变量替换和 AI 生成作为可折叠区块
- **视觉降噪** - 减少嵌套层级和装饰性元素，保留玻璃质感但简化边框
- **统一交互模式** - 保持现有功能入口清晰，降低学习成本

### Scope

**In Scope:**
- RightColumn 组件布局重构
- TemplatePreview 组件样式优化
- 按钮区域简化整合
- 变量替换区块保留（可折叠）
- 模板生成区块保留（可折叠）
- 保存模板弹窗保留

**Out of Scope:**
- 左侧、中间列的改动
- API 和数据层逻辑变更
- 变量替换具体交互逻辑改动
- 模板生成具体交互逻辑改动

## Context for Development

### Codebase Patterns

当前右侧模板区域包含以下组件和逻辑：
1. **RightColumn.tsx** - 主容器，管理状态和弹窗
2. **TemplatePreview.tsx** - 模板预览渲染，识别 `[变量]` 格式
3. **VariableReplacer** - 变量替换编辑（保留，不升级）
4. **TemplateGenerationSection** - AI 模板生成区块
5. 弹窗使用 MUI Dialog + 自定义玻璃卡片样式

### Glassmorphism CSS 类（参考 globals.css）

| 类名 | 用途 |
|------|------|
| `ia-glass-card` | 基础玻璃卡片 |
| `ia-glass-card--static` | 静态卡片（禁用悬停效果）|
| `ia-glass-card--active` | 激活状态（蓝色高亮）|
| `ia-glass-card--lg` | 大圆角卡片 |
| `ia-glass-card--heavy` | 重度模糊（用于弹窗）|

### 技术约束

1. **CollapsibleSection 行为**
   - 接受 `defaultExpanded` 属性
   - 使用 localStorage 保存用户偏好（key: `workspace-collapsed-{storageKey}`）
   - ⚠️ **注意**: 如果用户之前已收起该区块，会优先读取 localStorage 状态
   - **解决方案**: 首次访问时强制展开，或清除用户之前的偏好

2. **VariableReplacer**
   - 自动从模板中提取 `[变量]` 格式的变量
   - 提供简单的 TextField 输入

3. **TemplateGenerationSection**
   - 使用自己的折叠逻辑（不依赖 CollapsibleSection）
   - 有独立的展开/收起状态

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx` | 右侧列主组件 |
| `src/features/analysis/components/TemplatePreview.tsx` | 模板预览组件 |
| `src/app/analysis/page.tsx` | 父页面，传递 props |
| `src/components/shared/CollapsibleSection.tsx` | 可折叠区块组件 |
| `src/features/analysis/components/TemplateGenerationSection` | AI 生成区块 |
| `src/features/analysis/components/VariableReplacer.tsx` | 变量替换组件（保留）|

### Technical Decisions

1. **保留全部功能** - 只做视觉和布局优化，不删除现有功能
2. **渐进式 Disclosure** - 变量替换默认展开（用户要求），AI 生成可折叠
3. **单一主按钮** - 一键复制作为最醒目的 CTA，其他操作为次级按钮
4. **简化卡片嵌套** - 减少 ia-glass-card 多层嵌套，保留外层内层即可
5. **保持 VariableReplacer 不变** - 变量编辑器暂不升级，聚焦布局优化

## Implementation Plan

### Tasks

采用方案 B - 渐进式重构：

1. [x] **简化 RightColumn 整体布局**
   - 移除多余的嵌套卡片层
   - 采用单层大卡片包裹核心内容
   - File: `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx`

2. [x] **优化按钮区域**
   - 复制和保存在同一行组成紧凑工具栏
   - 一键复制为主按钮，保存模板为次级按钮
   - File: `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx`

3. [x] **优化 TemplatePreview**
   - 保留变量高亮样式
   - 简化容器边框和背景
   - 移除"可编辑模板预览"标签
   - 实现方式：在 RightColumn 调用 TemplatePreview 时不传递 label prop，或 TemplatePreview 接受 `showLabel` prop 默认为 false
   - File: `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx`
   - File: `src/features/analysis/components/TemplatePreview.tsx`（如需修改）

4. [x] **调整 CollapsibleSection 使用**
   - 变量替换区块默认展开（设置 `defaultExpanded={true}`）
   - 模板生成区块保持现有逻辑（可折叠）
   - File: `src/features/analysis/components/WorkspaceColumns/RightColumn.tsx`

### 验收标准

1. **视觉简化**
   - [ ] AC1: Given 当前有双层嵌套卡片, when 渲染 RightColumn, then 只显示单层玻璃卡片
   - [ ] AC2: Given 按钮区域, when 用户查看, then 复制和保存在同一行，主次分明

2. **功能保留**
   - [ ] AC3: Given 模板内容, when 用户点击一键复制, then 模板内容复制到剪贴板并显示成功反馈
   - [ ] AC4: Given 模板内容为空, when 用户点击一键复制, then 无操作或提示"无内容可复制"
   - [ ] AC5: Given 保存模板按钮, when 用户点击, then 弹出保存对话框
   - [ ] AC6: Given 变量替换区块, when 页面加载, then 默认展开显示（或强制展开，忽略 localStorage）
   - [ ] AC7: Given AI 生成区块, when 页面加载, then 默认收起

3. **交互体验**
   - [ ] AC8: Given 用户打开分析完成页面, when 首次查看右侧, then 首先看到一键复制按钮
   - [ ] AC9: Given 用户复制后, when 复制成功, then 按钮显示"已复制！"反馈
   - [ ] AC10: Given 变量替换 CollapsibleSection, when 用户查看, then 标题显示"自定义内容"（而非"变量替换"）

4. **响应式**
   - [ ] AC11: Given 移动端布局, when 屏幕宽度 < md, then 显示简化版本
   - [ ] AC12: Given 桌面端布局, when 屏幕宽度 >= md, then 显示紧凑高效布局

## Additional Context

### Dependencies

- MUI 组件库
- Lucide React 图标
- 现有 glassmorphism 样式变量

### Testing Strategy

> 注意：当前项目暂无针对此 UI 优化的自动化测试，暂以手动测试为主。

1. 手动测试复制功能
2. 手动测试保存弹窗
3. 手动测试变量替换展开/收起
4. 手动测试 AI 生成区块
5. 验证移动端响应式
6. 验证空模板场景

### Notes

参考 UI/UX Pro Max 设计指南：
- Minimal & Swiss Style - 简洁、白色空间、功能性
- 单一聚焦 - 主按钮突出
- 渐进显示 - 高级功能可折叠

---

## Tree of Thoughts 分析结果

经过多方案对比，选择**方案 B - 渐进式重构**：

### 方案 B 结构
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ 复制 | 保存                 │ │  ← 按钮组
│ └─────────────────────────────┘ │
│                               │
│ 模板预览内容                   │
│                               │
└───────────────────────────────┘
│ ▼ 自定义内容 (默认展开)         │  ← CollapsibleSection
│ ▼ AI 生成 (默认收起)           │
└─────────────────────────────────┘
```

### 实现路径（Reverse Engineering）

#### Step 1: 简化卡片结构
- 移除内层 `ia-glass-card ia-glass-card--active` 容器
- 保留外层单层玻璃卡片

#### Step 2: 按钮组优化
- 使用 `display: 'flex', gap: 1.5` 紧凑排列
- 复制按钮：主按钮样式（contained）
- 保存按钮：次级按钮样式（outlined）

#### Step 3: 模板预览优化
- 移除"可编辑模板预览"标签
- 直接渲染预览内容

#### Step 4: CollapsibleSection 默认展开
- 变量替换：`defaultExpanded={true}`
- 标题改为"自定义内容"

## Review Notes

- Adversarial review completed
- Findings: 10 total, 4 fixed, 6 skipped
- Resolution approach: auto-fix
