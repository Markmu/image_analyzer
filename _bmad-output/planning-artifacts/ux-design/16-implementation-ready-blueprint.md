# Implementation-Ready Blueprint

> **项目：** image_analyzer UX 实施蓝图  
> **版本：** v1.0  
> **最后更新：** 2026-03-01

---

## 文档目的

这份文档把现有 UX 规范压缩成前端可直接落地的实施清单。

它回答四个问题：

1. 先做哪些页面
2. 每个页面必须包含哪些区域
3. 需要哪些核心组件
4. 每块需要覆盖哪些状态与验收项

---

## MVP 页面清单

### P0 页面

1. 分析入口页
2. 分析任务工作台页
3. 公开结果页

### P1 页面

1. 历史任务列表页
2. 模板列表页
3. 支持回放详情页或回放抽屉

---

## 页面一：分析入口页

### 目标

让用户快速上传图片并创建 `analysis_task`。

### 必需区域

- 页面标题与简短价值说明
- 上传区
- 支持格式 / 尺寸 / 限制说明
- 最近任务入口
- 失败提示区域

### 必需动作

- 拖拽上传
- 点击选择文件
- 上传后自动创建任务
- 失败后重试

### 必需状态

- empty
- dragover
- uploading
- upload_failed
- task_creating

### 验收项

- 上传完成后立即进入任务页
- dragover 为蓝色高亮
- 错误不清空用户上下文

---

## 页面二：分析任务工作台页

### 目标

承载完整任务生命周期和结果消费闭环。

### 页面结构

#### 顶部

- `AnalysisTaskHeader`

#### 左侧

- 参考图
- 文件信息
- 任务元数据
- `StageProgressRail`
- 重试入口

#### 中部

- `StyleOverviewCard`
- `LockedStyleConstantsPanel`
- 变量摘要
- `QaVerdictBanner`
- issues / fixes 摘要
- 回放入口
- 公开结果预览入口

#### 右侧

- `PromptVariantSwitcher`
- `PromptOutputPanel`
- negative prompt
- parameter suggestions
- 复制 / 导出 / 保存

### 必需状态

- task_queued
- task_running
- task_completed
- task_failed
- task_canceled
- qa_pass
- qa_warn
- qa_fail

### 验收项

- 首屏能看到当前 Prompt
- 首屏能看到 QA verdict
- 首屏能找到复制 / 导出 / 保存
- 用户能区分变量和锁定常量
- 回放入口不打断主流程

---

## 页面三：公开结果页

### 目标

以 allowlist 投影方式对外展示安全、可读的分析结果。

### 必需区域

- 标题
- 摘要
- hero image
- style overview
- key style blocks
- prompt preview
- CTA

### 禁止区域

- 原始阶段快照
- QA issues / fixes 原文
- 调试字段
- 内部版本字段
- 支持侧信息

### 验收项

- 文案与工具页风格结论一致
- 不展示内部调试对象
- CTA 明确回流到主产品流程

---

## Core Components

### P0 组件

1. `AnalysisTaskHeader`
2. `StageProgressRail`
3. `StyleOverviewCard`
4. `LockedStyleConstantsPanel`
5. `VariableSlotEditor`
6. `PromptVariantSwitcher`
7. `PromptOutputPanel`
8. `QaVerdictBanner`
9. `PublicResultPreviewCard`
10. `UploadZone`

### P1 组件

1. `ReplayEntryList`
2. `TaskHistoryTable`
3. `TemplateCard`
4. `ExportDialog`

---

## Component Ownership Map

### 上传与任务创建

- `UploadZone`
- `TaskCreationFeedback`

### 任务状态

- `AnalysisTaskHeader`
- `StageProgressRail`
- `TaskMetaBlock`

### 结果消费

- `PromptVariantSwitcher`
- `PromptOutputPanel`
- `QaVerdictBanner`

### 结果理解

- `StyleOverviewCard`
- `LockedStyleConstantsPanel`
- `VariableSlotEditor`

### 高级能力

- `ReplayEntryList`
- `PublicResultPreviewCard`
- `ExportDialog`

---

## Data Mapping

### `analysis_tasks`

前端直接需要：

- `id`
- `public_id`
- `status`
- `current_stage`
- `schema_version`
- `prompt_version`
- `result_payload`
- `result_summary`
- `latest_qa_verdict`
- `latest_error_message`

### `analysis_stage_snapshots`

前端在回放场景需要：

- `stage_name`
- `attempt_no`
- `stage_status`
- `output_payload`
- `error_payload`
- `started_at`
- `completed_at`

---

## State Coverage Checklist

每个核心页面至少覆盖：

- empty
- loading
- success
- error
- partial
- disabled

每个关键组件至少覆盖：

- default
- hover
- focus
- active
- disabled
- error

---

## Design System Checklist

- [ ] 使用 `design-system` token
- [ ] 主 CTA 为蓝色体系
- [ ] Glass 卡片使用统一类名
- [ ] 图标来自 `lucide-react`
- [ ] 响应式遵循任务优先顺序
- [ ] WCAG 2.1 AA 基线满足

---

## Suggested Implementation Order

### Sprint 1

1. 分析入口页
2. `UploadZone`
3. `AnalysisTaskHeader`
4. `StageProgressRail`

### Sprint 2

1. `PromptVariantSwitcher`
2. `PromptOutputPanel`
3. `QaVerdictBanner`
4. `StyleOverviewCard`

### Sprint 3

1. `LockedStyleConstantsPanel`
2. `VariableSlotEditor`
3. `PublicResultPreviewCard`
4. 公开结果页

### Sprint 4

1. `ReplayEntryList`
2. 历史任务页
3. 模板列表页

---

## Handoff Notes

如果前端只看一份文档就开工，应优先阅读：

1. 本文档
2. `12-core-flow-optimization.md`
3. `15-workspace-layout.md`
4. `05-design-system.md`
5. `09-component-strategy.md`

---

## 相关文档

- [核心流程优化方案](./12-core-flow-optimization.md)
- [工作台布局设计规范](./15-workspace-layout.md)
- [组件策略](./09-component-strategy.md)
- [返回总览](./README.md)
