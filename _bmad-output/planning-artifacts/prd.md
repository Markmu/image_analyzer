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
- 生成满意率 >= 60%
- 模板二次编辑率 <= 35%
- 端到端处理时延 P95 <= 45 秒
- 风格迁移成功率（相对当前基线）提升 >= 25%
- MVP 验证周期：8 周

## Product Scope

### MVP - Minimum Viable Product
- 上线完整 IR 输出链路与统一 JSON 契约
- 完成 Forensic Describer / Style Fingerprinter / Prompt Compiler / QA Critic 的最小闭环
- 支持三类 Adapter（Natural Language / Tag Stack / Short Command）与强度分级（lite/standard/strong）
- 支持风格常量锁定与变量槽位替换
- 支持基础冲突检测与修复建议输出
- 提供关键指标埋点以验证采纳率、满意率、编辑率与时延

### Growth Features (Post-MVP)
- 扩展模型适配器覆盖与参数建议策略
- 增强 QA 规则库（更多冲突模式、可解释修复）
- 引入模板效果反馈闭环，驱动自动优化
- 针对内容站场景增加可发布的分析解读产物与 SEO 化结构输出

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
- 替换变量并生成
- 对结果满意并复用模板

成功标准映射：
- 采纳率、满意率、二次编辑率、迁移成功率四项核心指标直接可观测。

### Journey 2: 支持排障路径（问题回放与修复）

用户反馈“生成图风格不像参考图”。支持人员调取该任务的结构化链路输出（objective_description、style_fingerprint、controls、prompt_outputs、qa_report），快速定位偏差来自分析阶段、编译阶段还是模型适配阶段。支持人员依据 QA issues/fixes 给出可执行修复建议（如调整风格常量锁定项、修正冲突字段、切换适配表达强度），指导用户重试并验证结果改善。

关键节点：
- 接收用户问题反馈
- 回放任务 JSON 链路
- 定位问题根因
- 输出修复建议并验证重试结果

成功标准映射：
- 缩短问题定位时间，提升异常场景下的修复成功率和用户信任。

### Journey Requirements Summary

由以上旅程直接推导的能力需求：
- 端到端结构化输出与可回放能力（支持排障）
- 变量槽位机制与风格常量锁定机制（支持稳定迁移）
- 多适配器模板输出与强度分级（支持不同模型表达）
- QA 冲突检测与修复建议（支持质量兜底）
- 模板保存与复用能力（支持重复价值实现）

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
- 进度与状态通过轮询统一回传，避免多通道状态不一致
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
- SPA 主流程 + 轮询进度 + Chrome 优先现代浏览器支持
- 内容站 SSR/静态化基础骨架（仅必要 SEO 页面）

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
- FR19: 系统可以输出与生成相关的参数建议（如画幅与 seed 策略）。
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
- FR28: 支持人员可以基于任务链路快速定位问题来源并提供修复指导。
- FR41: 支持人员可以按任务 ID、时间范围与异常类型检索任务链路。

### Template Reuse & Operational Insights
- FR29: 用户可以保存分析输出模板用于后续复用。
- FR30: 用户可以在历史任务中重新加载并复用既有模板。
- FR31: 系统可以统计模板复用行为并按模板维度聚合。
- FR32: 系统可以归档任务质量指标并支持趋势分析。

### Web Experience & Content Surface
- FR33: 用户可以在 SPA 主流程中完成上传、分析、模板替换与结果获取。
- FR34: 系统可以通过轮询方式向用户提供任务进度更新。
- FR35: 系统可以在任务异常时提供可恢复的下一步操作。
- FR36: 系统可以在内容站页面提供可被搜索引擎理解的分析内容呈现。

### Reproducibility Assurance
- FR42: 系统可以对同一参考图与同一变量输入产出可比较的稳定结果，用于复现验证。
- FR43: 系统可以输出风格保真解释摘要，说明本次结果如何保持关键风格常量。

## Non-Functional Requirements

### Performance
- NFR-P1: 端到端分析请求（上传完成到返回最终 JSON）P95 <= 45 秒。
- NFR-P2: 任务进度轮询更新间隔 <= 2 秒。
- NFR-P3: 结果页面关键操作（切换适配表达、切换强度、复制结果）交互响应 <= 200ms（前端感知）。

### Security
- NFR-S1: 任务数据与结果数据在传输过程中必须使用 TLS 加密。
- NFR-S2: 任务回放数据访问必须受鉴权控制，用户仅可访问自身任务；支持角色具备受控查询权限。
- NFR-S3: 结果导出与日志记录必须避免泄露敏感凭据与密钥信息。

### Scalability
- NFR-SC1: 在用户规模增长 10x 的情况下，核心分析链路仍可通过横向扩展保持稳定服务。
- NFR-SC2: 系统应支持多模型 Adapter 并行扩展，不要求重构 IR 主契约。
- NFR-SC3: 当单模型质量或可用性波动时，系统可在不改变主链路的情况下切换/回滚适配器版本。

### Accessibility
- NFR-A1: 产品维持 WCAG 2.1 AA 级别可访问性要求。
- NFR-A2: 核心流程（上传、查看结果、复制导出、重试）必须可通过键盘完成。

### Integration
- NFR-I1: IR 输出必须保持统一 JSON 契约并具备版本标识（schema_version、prompt_version）。
- NFR-I2: 外部模型接入必须通过 Adapter 层完成，禁止绕过编译与 QA 门禁直接输出最终结果。
- NFR-I3: 内容站渲染链路与工具链共享核心分析结果，但允许采用不同渲染策略（SSR/静态化 vs SPA）。

### Reliability
- NFR-R1: 分析任务在外部模型调用失败时必须具备可恢复策略（重试、回滚、错误可读反馈）。
- NFR-R2: 每个任务必须可回放，支持定位到阶段级输入输出与质量门禁结果。
- NFR-R3: 系统需支持版本对比与回归验证，以保障同输入场景下的复现稳定性。
