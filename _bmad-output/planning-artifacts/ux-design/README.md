# UX 设计规范 - image_analyzer

**版本：** v2.0  
**最后更新：** 2026-03-01  
**状态：** Updated for latest PRD + Architecture

---

## 文档定位

本目录已根据以下最新输入完成对齐更新：

- PRD：`_bmad-output/planning-artifacts/prd.md`（2026-02-27）
- Architecture：`_bmad-output/planning-artifacts/architecture.md`（2026-03-01）
- Design System：`design-system/image-analyzer/MASTER.md`
- Color Scheme：`design-system/COLOR_SCHEME.md`
- Implementation Guide：`design-system/IMPLEMENTATION_GUIDE.md`

当前 UX 规范不再把产品定义为“通用图片分析工具”，而是定义为：

**单图输入 -> 异步分析任务 -> 结构化风格指纹 -> 多适配 Prompt 编译 -> QA 门禁 -> 导出/复用/回放/公开结果投影**

---

## 快速阅读顺序

### 产品与体验

| 文档 | 说明 | 推荐人群 |
|------|------|----------|
| [执行摘要](./01-executive-summary.md) | 最新产品定位、目标用户、UX 目标 | 所有人 |
| [核心用户体验](./02-core-experience.md) | 任务中心体验、关键时刻、交互原则 | PM、设计师、开发 |
| [核心流程优化方案](./12-core-flow-optimization.md) | MVP 主链路、状态反馈、结果分层 | PM、设计师、前端 |
| [工作台布局设计规范](./15-workspace-layout.md) | 主工作区布局和响应式行为 | 设计师、前端 |
| [实施蓝图](./16-implementation-ready-blueprint.md) | 页面、组件、状态、验收项实施清单 | 前端、设计师、PM |

### 设计系统与视觉

| 文档 | 说明 | 推荐人群 |
|------|------|----------|
| [设计系统基础](./05-design-system.md) | 设计 token、组件基线、实现约束 | 设计师、前端 |
| [视觉设计基础](./07-visual-foundation.md) | 色彩、排版、间距、层级、动效 | 设计师、前端 |
| [组件策略](./09-component-strategy.md) | 核心领域组件和状态组合策略 | 前端、设计师 |

### 辅助参考

| 文档 | 说明 |
|------|------|
| [情感响应设计](./03-emotional-response.md) | 情绪目标与信任构建 |
| [UX 模式分析](./04-ux-patterns.md) | 可复用模式与反模式 |
| [定义体验](./06-defining-experience.md) | 用户心理模型与成功路径 |
| [设计方向决策](./08-design-direction.md) | 方向选择依据 |
| [UX 一致性模式](./10-ux-consistency.md) | 通用交互一致性 |
| [响应式与无障碍](./11-responsive-accessibility.md) | WCAG 2.1 AA 与响应式原则 |
| [Glassmorphism 实施指南](./13-glassmorphism-guide.md) | 视觉实现细则 |
| [图标系统规范](./14-icon-system.md) | 图标语义与使用方式 |

---

## v2.0 核心变化

### 1. 体验模型改变

旧版 UX 强调：

- 通用图片风格分析
- 四维度结果卡片
- “256 人使用 / 94% 成功率”式社会证明
- 移动端灵感捕捉，桌面端深度分析

新版 UX 改为：

- 单图分析任务中心
- IR 管线结果分层展示
- `objective_description / style_fingerprint / controls / prompt_outputs / qa_report`
- 变量替换、强度切换、Adapter 切换、导出与回放
- 工具内结果与公开结果页保持一致，但投影字段受 allowlist 约束

### 2. 视觉基线改变

旧版文档存在绿色 CTA、MUI 中心化叙事和与当前代码不一致的规范。

新版统一遵循 `design-system`：

- 背景：`#0B0B10`
- 主色：`#3B82F6`
- 强调色：`#06B6D4`
- 次要色：`#94A3B8`
- 主文字：`#F8FAFC`
- 深色 Glassmorphism + 蓝/青色状态反馈

### 3. 架构感知增强

UX 文档现在显式考虑：

- 异步任务状态机
- 阶段化进度与回放
- QA 门禁和修复建议
- 模板复用与历史重载
- 公开结果页投影边界
- 支持排障视图与普通用户视图分离

---

## 当前 UX 设计焦点

MVP 设计优先级：

1. 用户能理解“任务正在分析什么、当前处于哪一阶段”  
2. 用户能理解“哪些是风格常量，哪些是允许替换的变量”  
3. 用户能在不理解内部架构名词的前提下完成复制、导出、保存和重试  
4. 支持人员能快速回放任务并定位问题  
5. 公开结果页与工具结果一致，但不泄露内部调试字段  

---

## 更新历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-02-02 | 初始 UX 设计完成 |
| v1.1 | 2026-02-17 | 新增流程优化、Glassmorphism、图标规范 |
| v1.1 | 2026-02-18 | 文档拆分为模块化章节 |
| v2.0 | 2026-03-01 | 基于最新 PRD、Architecture 与 Design System 重新对齐 |

---

**维护者：** UX 设计团队  
**作者：** Sally（UX Designer）
