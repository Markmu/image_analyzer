# Component Strategy

> **项目：** image_analyzer UX 设计规范  
> **版本：** v2.0  
> **最后更新：** 2026-03-01

---

## Strategy Overview

组件策略必须围绕最新 PRD 和架构定义的任务模型展开，而不是围绕旧版“四维度分析卡片 + 质量徽章”展开。

当前组件应服务的核心对象是：

- 分析任务
- 阶段快照
- 风格指纹摘要
- 变量控制
- Prompt 输出切换
- QA 结论
- 历史重载与公开投影

---

## Foundational Components

基础层不指定某个 UI 库，而指定必须具备的语义能力：

| 类别 | 必需能力 |
|------|----------|
| Layout | 响应式容器、分栏、堆叠、分组 |
| Input | 文件上传、文本输入、选择器、切换器 |
| Feedback | 进度、状态、空态、错误、Toast |
| Overlay | 模态框、抽屉、浮层 |
| Disclosure | Accordion、Tabs、Collapse |
| Navigation | 顶部导航、次级面板导航、历史入口 |

---

## Core Domain Components

### 1. `AnalysisTaskHeader`

**Purpose:** 展示任务身份、状态、阶段、版本与主操作

**应包含：**

- 任务 ID / public ID
- 当前状态
- 当前阶段
- `schema_version` / `prompt_version` 的用户友好表达
- 复制 / 导出 / 保存 / 重试

### 2. `StageProgressRail`

**Purpose:** 把异步链路变成用户可理解的阶段进度

**阶段建议：**

- 图像勘验
- 风格提炼
- 模板编译
- 质量校验

**状态：**

- queued
- running
- completed
- failed
- canceled

### 3. `StyleOverviewCard`

**Purpose:** 用户快速理解这次分析的风格结论

**应包含：**

- camera language 摘要
- lighting 摘要
- color strategy 摘要
- texture / finish 摘要
- composition 摘要

### 4. `LockedStyleConstantsPanel`

**Purpose:** 明确哪些是不能轻易修改的风格常量

**交互要求：**

- 只读
- 可展开查看细节
- 每项附简短说明“为什么锁定”

### 5. `VariableSlotEditor`

**Purpose:** 用户替换主体、场景等变量

**默认槽位：**

- `{subject}`
- `{setting}`
- `{time_of_day}`
- `{weather_or_conditions}`
- `{wardrobe_or_props}`
- `{action}`
- `{background_elements}`
- `{aspect_ratio}`

### 6. `PromptVariantSwitcher`

**Purpose:** 切换适配表达和强度

**切换维度：**

- `natural_language`
- `tag_stack`
- `short_command`

和

- `lite`
- `standard`
- `strong`

### 7. `PromptOutputPanel`

**Purpose:** 承载当前选中 Prompt 的阅读、复制与导出

**应包含：**

- 当前 Adapter / intensity 标识
- Prompt 内容
- negative prompt（如果有）
- parameter suggestions（如果有）

### 8. `QaVerdictBanner`

**Purpose:** 用最短路径告诉用户“是否可直接使用”

**状态：**

- `pass`
- `warn`
- `fail`

**辅助内容：**

- 摘要说明
- issues 数量
- fixes 建议入口

### 9. `ReplayEntryList`

**Purpose:** 面向支持和高级用户查看阶段快照入口

**特点：**

- 不默认打开放在首屏
- 支持按阶段和 attempt 展开
- 用于解释问题，不干扰主任务流

### 10. `PublicResultPreviewCard`

**Purpose:** 在工具内预览公开结果页投影内容

**应包含：**

- title
- summary
- style_overview
- key_style_blocks
- prompt_preview
- CTA

且必须明确这不是完整内部结果。

---

## Recommended Composition

### 首屏组件组合

```text
AnalysisTaskHeader
StageProgressRail
PromptVariantSwitcher
PromptOutputPanel
QaVerdictBanner
StyleOverviewCard
```

### 次级层组件组合

```text
LockedStyleConstantsPanel
VariableSlotEditor
ReplayEntryList
PublicResultPreviewCard
```

---

## State Design

每个核心组件至少考虑以下状态：

- empty
- loading
- success
- warning
- error
- disabled

特别注意：

- 任务失败并不等于页面失败
- QA `warn` 不等于任务失败
- 没有公开资格不等于结果不可用

---

## Accessibility Rules

- 进度与 verdict 使用 `aria-live`
- 切换器必须支持键盘操作
- Prompt 面板必须支持完整文本选择与复制
- 展开区域必须正确使用 `aria-expanded`
- 错误提示必须与相关输入绑定

---

## Deprioritized Legacy Components

以下旧组件概念不再作为 v2 主组件：

- `DimensionAnalysisCard`
- `QualityBadge`
- `SocialProofGallery`
- `BatchAnalyzer`

原因：

- 不符合最新 MVP 范围
- 与任务中心 IR 体验不匹配
- 容易把用户注意力从“可复现模板”带偏到“表面信任信号”

---

## 相关文档

- [核心用户体验](./02-core-experience.md)
- [设计系统基础](./05-design-system.md)
- [工作台布局设计规范](./15-workspace-layout.md)
- [返回总览](./README.md)
