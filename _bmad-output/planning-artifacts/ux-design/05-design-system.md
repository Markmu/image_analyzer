# Design System Foundation

> **项目：** image_analyzer UX 设计规范  
> **版本：** v2.0  
> **最后更新：** 2026-03-01

---

## Source of Truth

本项目 UX 规范必须以仓库中的 `design-system` 为最高优先级视觉与实现基线：

- `design-system/image-analyzer/MASTER.md`
- `design-system/COLOR_SCHEME.md`
- `design-system/IMPLEMENTATION_GUIDE.md`
- `design-system/glassmorphism-guidelines.md`

如果章节文档与上述文件冲突，以 `design-system` 为准。

---

## Design System Positioning

当前设计系统不是一个“独立的第三方组件库选择文档”，而是一套**围绕现有 Next.js 应用落地的设计 token + Glassmorphism 组件约束**。

因此本章不再把 MUI 视为必须前提。  
真正需要坚持的是：

- 统一 CSS 变量
- 统一色彩语义
- 统一玻璃态容器和交互状态
- 统一 icon、间距、阴影、动效与可访问性规则

技术实现可以因页面和组件而异，但视觉和交互语义必须一致。

---

## Core Tokens

### 色彩

| 角色 | Token | 值 | 用途 |
|------|------|----|------|
| 背景 | `--background` | `#0B0B10` | 页面背景 |
| 前景 | `--foreground` | `#F8FAFC` | 主文字 |
| 主色 | `--primary` | `#3B82F6` | 主要 CTA、激活状态、链接 |
| 次要色 | `--secondary` | `#94A3B8` | 次要文字、禁用态 |
| 强调色 | `--accent` | `#06B6D4` | 高亮、悬停强调 |
| 成功 | `--success` | `#2563EB` | 成功提示、完成状态 |
| 警告 | `--warning` | `#F59E0B` | 风险提示 |
| 错误 | `--error` | `#F43F5E` | 错误、删除、失败状态 |

### Glassmorphism

| Token | 值 | 用途 |
|------|----|------|
| `--glass-bg-dark` | `rgba(30, 41, 59, 0.6)` | 标准卡片背景 |
| `--glass-bg-active` | `rgba(59, 130, 246, 0.15)` | 选中/激活背景 |
| `--glass-border` | `rgba(148, 163, 184, 0.15)` | 默认边框 |
| `--glass-border-active` | `rgba(59, 130, 246, 0.4)` | 激活边框 |
| `--glass-blur` | `12px` | 标准模糊 |
| `--glass-blur-heavy` | `20px` | 模态/重层级 |
| `--glass-shadow` | `0 4px 20px rgba(0,0,0,0.25)` | 默认阴影 |
| `--glass-shadow-active` | `0 4px 20px rgba(0,0,0,0.25), 0 0 20px rgba(59,130,246,0.3)` | 激活阴影 |

### 交互

| Token | 值 | 用途 |
|------|----|------|
| `--glass-radius` | `12px` | 常规圆角 |
| `--glass-radius-lg` | `16px` | 主要卡片圆角 |
| `--glass-transition` | `all 0.2s ease` | 标准状态切换 |
| `--glass-transition-slow` | `all 0.3s ease` | 展开/收起/面板过渡 |

---

## Component Baseline

### 推荐基础类

所有主工作台容器优先基于以下类组合：

- `.ia-glass-card`
- `.ia-glass-card--clickable`
- `.ia-glass-card--static`
- `.ia-glass-card--active`
- `.ia-glass-card--heavy`

### 使用规则

#### 可点击容器

- 必须具备 `cursor: pointer`
- 必须有 hover 和 focus-visible 状态
- 禁止通过布局抖动表达交互

#### 静态信息容器

- 使用 `--static` 变体
- 不应在 hover 时上浮
- 用于结果摘要、只读分析块、说明面板

#### 激活容器

- 使用蓝色而非绿色高亮
- 用于当前选中 Adapter、当前 intensity、当前推荐输出

---

## Domain Components That UX Relies On

设计系统要支持的不是通用卡片，而是当前产品域组件：

| 组件类型 | 设计系统职责 |
|---------|--------------|
| 任务头部 | 状态颜色、元数据层级、主操作区 |
| 阶段进度条 | 进度、阶段标签、失败/重试状态 |
| 风格块卡片 | 风格摘要、可折叠细节、一致边框与层次 |
| 变量编辑器 | 输入态、锁定态、说明文本、错误提示 |
| Prompt 切换器 | Adapter / intensity 选中与可用性状态 |
| QA Verdict 横幅 | pass / warn / fail 的语义与优先级 |
| 公开结果预览卡片 | 工具结果与公开投影的一致视觉桥接 |

---

## Implementation Guardrails

### 1. 不依赖硬编码颜色

禁止：

- 直接写绿色 CTA 作为产品主色
- 直接写 `rgba(...)` 替代已有 token
- 一个页面自定义一套阴影、圆角、blur

### 2. 视觉一致性优先于组件来源

可以使用不同实现方式，但最终必须服从统一 token。  
换句话说，组件“来自哪里”不是核心，核心是“看起来和行为上是否同属一个系统”。

### 3. 公开页与工具页共享同一语义系统

公开结果页可以更轻、更摘要，但：

- 颜色层级一致
- 文案风格一致
- CTA 语义一致
- 风格块结构一致

### 4. 可访问性是默认要求

- 对比度满足 WCAG 2.1 AA
- `focus-visible` 始终可见
- `prefers-reduced-motion` 被尊重
- 交互目标不小于 44x44px

---

## Default Mapping

### 主操作

- 使用 `--primary`
- 悬停可引入 `--accent`
- 不使用绿色作为默认主 CTA

### 进行中状态

- 使用蓝/青色高亮
- 阶段变化使用清晰文字而不是纯动画暗示

### 成功状态

- 使用 `--success`
- 只表示“动作完成”或“任务通过”
- 不与主 CTA 颜色混用

### 风险与错误状态

- `warn` 使用琥珀
- `fail` 使用玫瑰红
- 必须配图标和文字，不能仅靠颜色区分

---

## Review Checklist

- [ ] 所有页面颜色来自 design-system token
- [ ] 主 CTA 为蓝色体系，不是绿色体系
- [ ] 可点击 Glass 组件具备 `cursor-pointer`
- [ ] 激活态采用蓝色高亮与蓝色光晕
- [ ] 公开页与工具页视觉语义一致
- [ ] 不存在与当前 design-system 冲突的局部规范

---

## 相关文档

- [视觉设计基础](./07-visual-foundation.md)
- [组件策略](./09-component-strategy.md)
- [Glassmorphism 实施指南](./13-glassmorphism-guide.md)
- [返回总览](./README.md)
