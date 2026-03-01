---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - /Users/muchao/code/image_analyzer/docs/image-to-style-prompt-agent.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/product-brief-image_analyzer-2026-01-30.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/architecture.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/epics.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design-specification.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.backup-20260227-235042.md
documentCounts:
  productBriefs: 1
  researchDocuments: 0
  brainstormingDocuments: 0
  projectDocumentation: 5
workflowType: 'prd'
project_name: 'image_analyzer'
user_name: 'Muchao'
date: '2026-02-27'
status: 'draft'
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - image_analyzer

**Author:** Muchao
**Date:** 2026-02-27

## Executive Summary

image_analyzer 本次需求聚焦于升级“图片分析”核心能力：从通用描述输出，提升为可复现、可迁移、可审计的风格编译流程。目标是让用户在替换主体或场景后，仍能稳定复现参考图的关键风格特征，显著提升同风格生成成功率。

该能力升级将以结构化中间表示（IR）为核心，建立从客观图像勘验到风格指纹提取，再到多模型 Prompt 编译与质量校验的完整链路。系统输出不再是单一 Prompt，而是可被工程系统消费、缓存、回放与持续优化的标准化 JSON 产物，支持后续模型替换与能力扩展。

本次改造属于现有系统上的能力增强，不改变产品主形态（技术分析 + 内容站并行），重点优化分析链路的专业性、一致性与可运营性，为后续增长阶段的模板复用、质量度量和多模型扩展提供基础。

本次需求的优先用户分为三类：一是希望快速复现参考风格的创作者与设计师；二是需要低门槛完成风格迁移的新手用户；三是需要基于任务链路排查问题的支持人员。MVP 以“单图分析 -> 结构化结果 -> 模板替换 -> 外部生图验证 -> 问题回放”作为主闭环，不将模板市场、团队协作或大规模运营分析纳入首阶段验收范围。

相较于 2026-01-30 的 Product Brief，本 PRD 明确收敛范围：直接生图能力在本阶段仅保留“对外部生图工作流的可复制/可导出验证”，不作为内置生成能力验收项；登录、订阅/Credit、计费等既有平台能力默认由现有 brownfield 系统承接，不在本次分析链路升级中重复展开；多图/批量分析能力延期到后续阶段，不进入 MVP。

### What Makes This Special

该产品的核心差异点是“可复现风格指纹”，而不是“图片转文字描述”。系统通过锁定风格常量（如光型、色彩策略、镜头语言、质感）与开放用户变量（如主体、场景、画幅），将风格迁移从经验试错转为可控过程。

核心洞察是：风格迁移质量取决于“结构化拆解 + 编译适配 + 冲突门禁”，而非堆叠更多自然语言描述。为此，系统将提供模型无关 IR 与多 Adapter 输出（Natural Language / Tag Stack / Short Command，含强度分级），并通过 QA Critic 执行一致性与可复现性检查，减少强度增强时的风格崩坏与语义冲突。

一句话价值主张：用户应选择 image_analyzer，因为它能产出更精准复现图片风格的提示词，并可跨模型稳定迁移。

## Project Classification

- Project Type: web_app（兼顾技术分析能力与内容站形态）
- Domain: general（跨技术分析与内容运营的混合产品域）
- Complexity: medium（涉及多阶段结构化链路、规则校验与适配器编译）
- Project Context: brownfield（在现有项目中增强图片分析能力）

## Success Criteria

### User Success
用户在替换主体/场景后，能稳定获得与参考图风格一致的结果，并感知到“提示词可直接用、少改动、可复用”。
成功完成路径是：上传参考图 -> 获取结构化分析与模板 -> 替换变量 -> 生成结果并认可风格一致性。

### Business Success
本次需求验证目标是提升核心能力价值，而非扩展功能面：以“分析结果采纳率”和“风格迁移成功率提升”作为一阶段北极星指标，验证该能力是否能驱动复用、留存与后续付费转化。

### Technical Success
系统需形成稳定的模型无关编译链路（objective_description -> style_fingerprint -> controls -> prompt_outputs -> qa_report），并可通过 QA 规则检测冲突、保障输出可复现、可审计、可回放。

### Measurable Outcomes
- 分析结果采纳率 >= 65%
- 生成满意率 >= 60%（以用户在结果页完成“可直接使用/满意”反馈计）
- 模板二次编辑率 <= 35%
- 端到端处理时延 P95 <= 45 秒
- 风格迁移成功率（固定参考图与变量输入条件下，对 50 组基准样本进行人工双评审通过率，相对 2026-02-27 旧链路基线）提升 >= 25%

## Product Scope

### MVP - Minimum Viable Product
- 上线完整 IR 输出链路与统一 JSON 契约
- 完成 Forensic Describer / Style Fingerprinter / Prompt Compiler / QA Critic 的最小闭环
- 支持三类 Adapter（Natural Language / Tag Stack / Short Command）与强度分级（lite/standard/strong）
- 支持风格常量锁定与变量槽位替换
- 支持 `objective_description`、`style_fingerprint`、`controls`、`prompt_outputs`、`qa_report` 五类核心产物输出
- 支持基础冲突检测与修复建议输出
- 支持 negative prompt、parameter suggestions、schema_version/prompt_version
- 支持模板保存、历史重载与结果复制/导出，满足外部生图工作流验证
- 提供关键指标埋点以验证采纳率、满意率、编辑率与时延
- 支持最小内容站结果页，只输出标题、摘要、关键风格块和回流入口

### Explicitly Out of Scope for MVP
- 不在 MVP 内交付多图联合风格分析
- 不在 MVP 内直接承诺内置生图能力；MVP 仅要求结果可复制、导出并用于外部生图工作流验证
- 不在本 PRD 中重新定义登录、订阅、Credit 与计费能力；若现有平台能力需调整，另立专项需求
- 不在 MVP 内建设模板市场、团队协作、企业审计看板
- 不在 MVP 内要求覆盖所有图像模型的深度适配，只验证首批目标模型

### Growth Features (Post-MVP)
- 扩展模型适配器覆盖与参数建议策略
- 增强 QA 规则库（更多冲突模式、可解释修复）
- 引入模板效果反馈闭环，驱动自动优化
- 针对内容站场景增加可发布的分析解读产物与 SEO 化结构输出
- 建立运营趋势看板与模板质量聚合分析

### Vision (Future)
- 建立“风格指纹资产层”：模板、成功案例与规则持续积累
- 支持跨模型长期稳定迁移，模型切换仅替换 Adapter
- 形成可运营、可审计、可演进的风格编译平台能力

## User Journeys

### Journey 1: 主用户成功路径（风格迁移闭环）

用户上传参考图片，希望在替换主体或场景后仍保持原图风格。系统先执行客观勘验并提取风格指纹，再输出包含变量槽位的可复现模板。用户仅替换 `{subject}`、`{setting}` 等变量并发起生成，结果在光型、色彩策略、构图倾向和质感上与参考图保持一致。用户感知到“模板可直接用、改动少、风格稳”，并将该模板保存用于后续复用。

关键节点：
- 上传图片并触发分析
- 获得结构化 IR 与多适配器模板
- 复制或导出模板到外部生图工作流
- 替换变量并生成
- 对结果满意并复用模板

成功标准映射：
- 采纳率、满意率、二次编辑率、迁移成功率四项核心指标直接可观测。
- 端到端处理时延通过“上传完成到结果返回”的任务日志直接观测。

适用用户：
- 新手用户：需要低门槛理解输出并快速替换少量变量
- 创作者/设计师：需要可复制、可导出、可复用的结构化模板
- 专业用户：需要稳定的参数建议、模板保存与历史重载能力

### Journey 2: 支持排障路径（问题回放与修复）

用户反馈“生成图风格不像参考图”。支持人员调取该任务的结构化链路输出（objective_description、style_fingerprint、controls、prompt_outputs、qa_report），快速定位偏差来自分析阶段、编译阶段还是模型适配阶段。支持人员依据 QA issues/fixes 给出可执行修复建议（如调整风格常量锁定项、修正冲突字段、切换适配表达强度），指导用户重试并验证结果改善。

关键节点：
- 接收用户问题反馈
- 回放任务 JSON 链路
- 定位问题根因
- 输出修复建议并验证重试结果

成功标准映射：
- 缩短问题定位时间，提升异常场景下的修复成功率和用户信任。
- 复现稳定性与风格保真解释可作为支持人员判断“问题出在分析、编译还是规则版本”的依据。

适用用户：
- 支持人员：需要按任务链路回放并定位阶段性偏差

### Journey 3: 产品验证路径（质量评估与版本比对）

产品与运营负责人需要判断新链路是否真的提升了风格迁移效果。系统按任务保存版本化输出、用户反馈和复现评估结果，支持按时间窗口查看采纳率、满意率、编辑率、迁移成功率与时延表现，并对新旧规则版本进行对照。

关键节点：
- 采集任务级版本信息与反馈信号
- 聚合核心指标并按版本窗口查看
- 对比新旧规则/模板版本表现
- 决定是否继续放量或回滚

成功标准映射：
- 风格迁移成功率提升、分析结果采纳率、端到端时延三项指标具备明确观测路径。

### Journey 4: 内容站结果消费路径（SEO 与回流）

潜在用户通过搜索进入公开分析结果页，希望快速理解某一风格案例的关键特征，并判断是否进入工具主流程。系统基于已批准公开的任务结果生成包含标题、摘要、关键风格块和 CTA 的内容页，页面内容与工具内核心分析结果保持一致，但不暴露内部调试信息。用户阅读后可跳转至上传或模板复用入口。

关键节点：
- 基于公开任务生成内容页
- 展示标题、摘要、关键风格块与结构化信息
- 跳转到工具主流程或模板复用入口

成功标准映射：
- 内容站页面承接 SEO 流量并为工具页提供回流入口。
- 页面内容与工具输出一致，避免“内容说法”和“实际结果”不一致。

适用用户：
- 搜索流量用户：需要快速理解产品能力与结果质量
- 运营人员：需要低成本复用分析结果形成可索引页面

### Journey Requirements Summary

由以上旅程直接推导的能力需求：
- 端到端结构化输出与可回放能力（支持排障）
- 变量槽位机制与风格常量锁定机制（支持稳定迁移）
- 多适配器模板输出与强度分级（支持不同模型表达）
- QA 冲突检测与修复建议（支持质量兜底）
- 模板保存与复用能力（支持重复价值实现）
- 版本化指标采集与回归对比能力（支持产品验证与灰度决策）
- 公开结果页与工具结果一致性能力（支持 SEO 与内容回流）

## Domain-Specific Requirements

### Compliance & Regulatory
- 维持现有平台合规基线：AI 透明标识、用户数据删除链路、按订阅等级执行数据保留策略。
- 对本次新增分析链路，补充“可审计”要求：每次任务需保留阶段化输出与版本信息，支持追踪与回放。

### Technical Constraints
- 分析主链路必须遵循统一 IR 契约（objective_description -> style_fingerprint -> controls -> prompt_outputs -> qa_report），禁止绕过结构化输出直接生成最终提示词。
- 必须具备一致性冲突检测能力（如景深与散景、光型与阴影、饱和策略与色盘表达冲突），并输出可执行修复建议。
- 新模型接入必须通过 Adapter 层实现，禁止破坏 IR 主契约与上游分析步骤。

### Integration Requirements
- 保持与现有图片上传、模板管理、历史记录链路兼容，新增字段应向后兼容历史数据读取。
- 任务级日志需关联 schema_version 与 prompt_version，确保线上问题可精确定位到规则版本与模板版本。

### Risk Mitigations
- 风格迁移不稳定风险：通过风格常量锁定 + 变量槽位边界降低漂移。
- 强度增强导致语义冲突风险：通过 QA Critic 规则门禁阻断冲突输出。
- 模型切换引发质量回退风险：通过 Adapter 回归测试与版本灰度发布控制上线风险。

## Innovation & Novel Patterns

### Detected Innovation Areas
- 将图片分析从“描述输出”升级为“结构化风格编译链路”，输出可复现、可迁移、可审计的中间表示。
- 引入模型无关 IR 作为稳定核心，把模型差异下沉到 Adapter 层，避免主链路随模型变化反复重构。
- 通过 QA Critic 规则门禁对输出进行一致性与冲突校验，降低强度增强时的风格崩坏风险。

### Market Context & Competitive Landscape
- 主流方案普遍停留在图像描述或单段 prompt 生成，缺乏“风格常量锁定 + 变量槽位管理 + 质量门禁”的系统化能力。
- 本方案竞争优势不在“生成更长文本”，而在“生成可工程消费、可回放、可持续优化的结构化产物”。

### Validation Approach
- 以迁移成功率、分析采纳率、二次编辑率、满意率和端到端时延作为核心验证指标。
- 在 MVP 8 周窗口内采用灰度与对照实验，验证 IR + Adapter + QA 相对现有流程的提升幅度。
- 对每次任务保存版本化输出（schema_version/prompt_version），保证实验可追踪与结果可复现。

### Risk Mitigation
- 若创新链路带来时延上升，优先保留核心 IR 字段并降级非关键扩展项，确保 P95 指标达标。
- 若某 Adapter 质量波动，按模型维度回滚至稳定版本并保持主 IR 契约不变。
- 若 QA 规则误伤率偏高，采用规则分级（阻断/告警）逐步上线，避免影响主路径可用性。

## Web App Specific Requirements

### Project-Type Overview
本产品采用 SPA 作为主要交互形态，核心目标是保障分析链路与模板生成体验的连续性和响应速度。
同时保留内容站 SEO 能力，通过 SSR/静态化策略承载可收录页面，形成“工具体验 + 内容获客”双轨结构。

### Technical Architecture Considerations
- 前端主形态：SPA
- 浏览器策略：以 Chrome 为主的现代浏览器（Chromium 内核优先保障）
- 实时反馈策略：分析任务状态更新采用轮询机制（无需 WebSocket/SSE）
- 无障碍标准：维持 WCAG 2.1 AA 要求

### Browser Matrix & Compatibility
- P0 支持：Chrome 最新稳定版与近两代版本
- P1 兼容：其他现代 Chromium 浏览器（Edge 等）
- 非目标：老旧浏览器的深度兼容（不作为当前里程碑验收项）

### Responsive & UX Delivery
- SPA 页面优先保证上传、分析、模板编辑、结果生成的交互连续性
- 进度与状态必须在用户触发刷新后 2 秒内反映最新任务状态，避免多通道状态不一致
- 异常状态需提供可恢复交互（重试、回放、修复建议）

### SEO Strategy for Content Surfaces
- 内容站页面采用 SSR/静态化优先，保障索引与首屏可见性
- 工具核心页面保持 SPA 交互，不强行 SEO 化
- 结构化内容输出需支持搜索可读（标题层级、摘要、关键信息块）

### Implementation Considerations
- 轮询频率需与性能目标协同，避免高并发下额外负载放大
- 工具链与内容链要共享风格分析核心能力，但在渲染策略上解耦
- 新增功能需保持对现有 brownfield 架构兼容，避免改动认证、计费与历史链路的稳定性

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** 问题验证型 MVP（先证明“风格迁移更准、更稳、更可复用”）
**Resource Requirements:** 2-3 人核心团队（1 全栈、1 AI/后端、0.5 前端/设计支持）

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- 主用户成功路径（上传 -> 分析 -> 模板 -> 生成）
- 支持排障路径（回放 JSON -> 定位问题 -> 修复建议）

**Must-Have Capabilities:**
- 统一 IR 输出链路（objective_description -> style_fingerprint -> controls -> prompt_outputs -> qa_report）
- 三类 Adapter + 三档强度输出
- 风格常量锁定 + 变量槽位机制
- QA 冲突检测 + fixes 输出
- 关键指标埋点（采纳率、满意率、编辑率、时延、迁移成功率）
- SPA 主流程 + 实时状态刷新 + Chrome 优先现代浏览器支持
- 内容站 SSR/静态化基础骨架（仅必要 SEO 页面）
- 外部生图工作流复制/导出验证

**Validation Window:**
- 以 8 周为验证窗口完成灰度、对照和指标复盘；该时间窗口用于项目执行与验收计划，不作为产品成功指标。

### Post-MVP Features

**Phase 2 (Post-MVP):**
- 扩展 Adapter 覆盖和参数建议策略
- QA 规则库增强与误伤控制
- 模板质量反馈闭环与自动优化
- 内容站分析报告产物化与 SEO 扩展

**Phase 3 (Expansion):**
- 风格指纹资产层平台化（模板、案例、规则体系）
- 多模型大规模接入与策略编排
- 更高阶企业能力（审计看板、规则治理、团队协作）

### Risk Mitigation Strategy

**Technical Risks:**
- 时延超标：优先保核心字段，非关键项降级
- 适配器波动：按模型版本回滚，不破坏 IR 主契约

**Market Risks:**
- 用户感知提升不足：用 8 周对照验证核心指标，失败则收敛范围重做核心链路

**Resource Risks:**
- 人力不足：冻结 Phase 2/3，仅保 MVP 必需能力与指标闭环

## Functional Requirements

### Image Input & Task Initiation
- FR1: 用户可以上传单张参考图片以启动风格分析任务。
- FR2: 用户可以提交包含目标模型、变量替换意图与输出偏好的分析请求。
- FR3: 系统可以为每个分析任务生成唯一任务标识并关联完整处理链路。
- FR4: 用户可以查看任务当前状态并在任务完成后访问完整结果。

### Objective Analysis
- FR5: 系统可以输出仅基于可见信息的客观图像描述。
- FR6: 系统可以在不确定字段中标记 unknown，并给出不确定字段列表。
- FR7: 系统可以在客观描述中提供结构化的摄影与成像特征字段。
- FR8: 系统可以输出客观描述整体置信度。

### Style Fingerprint & Controls
- FR9: 系统可以从客观描述中提取可复现的风格指纹。
- FR10: 系统可以区分并输出风格常量与用户可替换变量。
- FR11: 系统可以提供标准变量槽位用于主体、场景、时间与画幅替换。
- FR12: 用户可以在不破坏风格常量的前提下替换变量并重用模板。

### Prompt Compilation & Adapters
- FR13: 系统可以基于风格指纹生成通用模板（universal template）。
- FR14: 系统可以输出可选 negative prompt。
- FR15: 系统可以输出 Natural Language 适配表达。
- FR16: 系统可以输出 Tag Stack 适配表达。
- FR17: 系统可以输出 Short Command 适配表达。
- FR18: 系统可以为每类适配表达输出 lite/standard/strong 三档强度版本。
- FR19: 系统可以输出与生成相关的参数建议，至少包括 aspect_ratio、seed_strategy 与不少于 1 条使用说明。
- FR37: 用户可以选择需要的适配表达类型（Natural Language / Tag Stack / Short Command）。
- FR38: 用户可以选择输出强度档位（lite / standard / strong）。
- FR40: 用户可以复制或导出编译结果用于外部生图工作流。

### QA & Consistency Gate
- FR20: 系统可以校验关键字段完整性并输出缺失项。
- FR21: 系统可以检测并报告内部语义冲突。
- FR22: 系统可以检测并报告可复现性不足的问题。
- FR23: 系统可以输出问题修复建议与整体通过结论。
- FR24: 用户可以查看 QA 报告并基于修复建议发起重试。
- FR39: 系统可以校验最终 JSON 契约合法性并在不合法时返回可操作错误信息。

### Results, Replay & Observability
- FR25: 系统可以以统一 JSON 契约返回最终结果。
- FR26: 系统可以保存每个阶段的输入输出用于任务回放。
- FR27: 系统可以为每个任务记录 schema_version 与 prompt_version。
- FR28: 支持人员可以基于任务链路在 5 分钟内定位问题处于分析、编译或 QA 阶段，并提供修复指导。
- FR41: 支持人员可以按任务 ID、时间范围与异常类型检索任务链路，并返回对应阶段输出、版本信息与 QA 问题列表；单次检索结果最多返回 100 条记录。

### Template Reuse & Operational Insights
- FR29: 用户可以保存分析输出模板用于后续复用。
- FR30: 用户可以在历史任务中重新加载并复用既有模板。
- FR31: 产品负责人可以按日或周查看模板复用率、二次编辑率和模板采纳率，并按模板 ID 聚合；统计窗口支持最近 7 天与最近 30 天。
- FR32: 产品负责人可以按版本窗口查看任务质量指标趋势，至少包括采纳率、满意率、迁移成功率和端到端时延；趋势视图支持按日聚合。

### Web Experience & Content Surface
- FR33: 用户可以在单一连续流程中完成上传、分析、模板替换与结果获取，过程中无需跨页面重建任务上下文。
- FR34: 系统可以向用户提供不超过 2 秒状态陈旧度的任务进度更新。
- FR35: 系统可以在任务异常时提供可恢复的下一步操作。
- FR36: 系统可以基于已批准公开的分析结果生成内容站页面，页面至少包含标题、摘要、关键风格块和工具回流入口。

### Reproducibility Assurance
- FR42: 系统可以对同一参考图与同一变量输入保留可重复评估所需的关键输出，以支持版本间复现对比；复现对比至少保留 30 天。
- FR43: 系统可以输出风格保真解释摘要，至少说明 lighting、color palette、camera language 三类关键风格常量如何被保持，每类至少输出 1 条解释。

## Non-Functional Requirements

### Performance
- NFR-P1: 端到端分析请求（上传完成到返回最终 JSON）P95 <= 45 秒；以生产环境 APM 和任务日志统计自然日滚动窗口内的已完成任务为测量口径，每日汇总一次。
- NFR-P2: 已提交任务在前端触发状态刷新后，95% 的状态更新可在 2 秒内返回最新结果；以生产环境 API 网关日志统计 `/task-status` 请求的日级 P95 响应时间为测量口径。
- NFR-P3: 结果页面关键操作（切换适配表达、切换强度、复制结果）交互响应 <= 200ms；以真实浏览器 RUM 事件采样和上线前实验室脚本各执行 100 次操作的 P95 结果共同验证。

### Security
- NFR-S1: 任务数据与结果数据在传输过程中必须使用 TLS 1.2 或以上版本加密；上线前生产域名扫描结果必须达到 100% HTTPS 覆盖，且不得接受明文 HTTP 业务请求。
- NFR-S2: 任务回放数据访问必须通过鉴权校验；季度抽样验证中普通用户跨账号访问成功率必须为 0%，支持角色的查询行为日志留痕率必须达到 100%。
- NFR-S3: 结果导出与日志记录中不得出现密钥、访问令牌或完整凭据；上线前对 100% 导出样本和错误日志样本执行脱敏检查，敏感信息遗漏率必须为 0%。

### Scalability
- NFR-SC1: 在基线 20 个并发分析任务的 10 倍压测条件下，核心分析链路仍需满足 NFR-P1，且任务错误率必须 <= 2%，压测口径按 15 分钟稳定流量窗口计算。
- NFR-SC2: 首批 3 个目标模型接入时，新增模型不得要求修改既有 IR 字段定义，且以 30 个固定回归样本执行兼容性回归时通过率必须达到 100%。
- NFR-SC3: 当单模型质量或可用性波动时，版本切换或回滚后的 30 分钟内，任务成功率必须恢复至回滚前稳定版本最近 7 天均值的 95% 以上。

### Accessibility
- NFR-A1: 产品在 MVP 范围内的核心页面必须达到 WCAG 2.1 AA 级别，并在上线前通过自动化扫描零严重错误以及不少于 5 个核心页面的人工抽检。
- NFR-A2: 核心流程（上传、查看结果、复制导出、重试）必须可通过键盘在不依赖鼠标的情况下完成；每个核心任务的主路径不得超过 15 个 Tab 停靠点，且焦点可见性检查通过率必须达到 100%。

### Integration
- NFR-I1: IR 输出必须保持统一 JSON 业务契约，并具备 `schema_version`、`prompt_version` 两个版本字段；上线前对固定 100 条样本执行契约校验时失败率必须为 0。
- NFR-I2: 任一目标模型的输出都必须经过统一编译和质量门禁后才能返回最终结果；抽样检查中绕过统一门禁流程的比例必须为 0。
- NFR-I3: 内容站页面与工具页必须复用同一份核心分析结果数据；每周抽样对比 20 条公开结果时，关键字段一致性必须达到 100%，允许页面呈现方式不同。

### Reliability
- NFR-R1: 分析任务在单次外部模型调用失败时必须在最多 2 次自动重试内完成恢复或返回可读错误；月度统计中自动恢复成功率必须 >= 80%，不可恢复任务的错误说明覆盖率必须达到 100%。
- NFR-R2: 每个任务必须可回放到阶段级输入输出与质量门禁结果；每周从最近 7 天已完成任务中随机抽取不少于 100 条执行回放校验，回放成功率不得低于 99%。
- NFR-R3: 系统必须支持版本对比与回归验证；每次版本发布前必须对 50 组固定样本完成复现评估，且风格迁移成功率相对回归版本下降不得超过 5%，风格保真解释缺失率不得超过 2%。
