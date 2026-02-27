---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/architecture.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design/README.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design/11-responsive-accessibility.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design/12-core-flow-optimization.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design/13-glassmorphism-guide.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design/14-icon-system.md
workflowType: 'create-epics-and-stories'
project_name: 'image_analyzer'
user_name: 'Muchao'
date: '2026-02-28'
status: 'completed'
completedAt: '2026-02-28'
---

# image_analyzer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for image_analyzer, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: 用户可以上传单张参考图片以启动风格分析任务。
FR2: 用户可以提交包含目标模型、变量替换意图与输出偏好的分析请求。
FR3: 系统可以为每个分析任务生成唯一任务标识并关联完整处理链路。
FR4: 用户可以查看任务当前状态并在任务完成后访问完整结果。
FR5: 系统可以输出仅基于可见信息的客观图像描述。
FR6: 系统可以在不确定字段中标记 unknown，并给出不确定字段列表。
FR7: 系统可以在客观描述中提供结构化的摄影与成像特征字段。
FR8: 系统可以输出客观描述整体置信度。
FR9: 系统可以从客观描述中提取可复现的风格指纹。
FR10: 系统可以区分并输出风格常量与用户可替换变量。
FR11: 系统可以提供标准变量槽位用于主体、场景、时间与画幅替换。
FR12: 用户可以在不破坏风格常量的前提下替换变量并重用模板。
FR13: 系统可以基于风格指纹生成通用模板（universal template）。
FR14: 系统可以输出可选 negative prompt。
FR15: 系统可以输出 Natural Language 适配表达。
FR16: 系统可以输出 Tag Stack 适配表达。
FR17: 系统可以输出 Short Command 适配表达。
FR18: 系统可以为每类适配表达输出 lite/standard/strong 三档强度版本。
FR19: 系统可以输出与生成相关的参数建议（如画幅与 seed 策略）。
FR20: 系统可以校验关键字段完整性并输出缺失项。
FR21: 系统可以检测并报告内部语义冲突。
FR22: 系统可以检测并报告可复现性不足的问题。
FR23: 系统可以输出问题修复建议与整体通过结论。
FR24: 用户可以查看 QA 报告并基于修复建议发起重试。
FR25: 系统可以以统一 JSON 契约返回最终结果。
FR26: 系统可以保存每个阶段的输入输出用于任务回放。
FR27: 系统可以为每个任务记录 schema_version 与 prompt_version。
FR28: 支持人员可以基于任务链路快速定位问题来源并提供修复指导。
FR29: 用户可以保存分析输出模板用于后续复用。
FR30: 用户可以在历史任务中重新加载并复用既有模板。
FR31: 系统可以统计模板复用行为并按模板维度聚合。
FR32: 系统可以归档任务质量指标并支持趋势分析。
FR33: 用户可以在 SPA 主流程中完成上传、分析、模板替换与结果获取。
FR34: 系统可以通过轮询方式向用户提供任务进度更新。
FR35: 系统可以在任务异常时提供可恢复的下一步操作。
FR36: 系统可以在内容站页面提供可被搜索引擎理解的分析内容呈现。
FR37: 用户可以选择需要的适配表达类型（Natural Language / Tag Stack / Short Command）。
FR38: 用户可以选择输出强度档位（lite / standard / strong）。
FR39: 系统可以校验最终 JSON 契约合法性并在不合法时返回可操作错误信息。
FR40: 用户可以复制或导出编译结果用于外部生图工作流。
FR41: 支持人员可以按任务 ID、时间范围与异常类型检索任务链路。
FR42: 系统可以对同一参考图与同一变量输入产出可比较的稳定结果，用于复现验证。
FR43: 系统可以输出风格保真解释摘要，说明本次结果如何保持关键风格常量。

### NonFunctional Requirements

NFR1: 端到端分析请求（上传完成到返回最终 JSON）P95 <= 45 秒。
NFR2: 任务进度轮询更新间隔 <= 2 秒。
NFR3: 结果页面关键操作（切换适配表达、切换强度、复制结果）交互响应 <= 200ms（前端感知）。
NFR4: 任务数据与结果数据在传输过程中必须使用 TLS 加密。
NFR5: 任务回放数据访问必须受鉴权控制，用户仅可访问自身任务；支持角色具备受控查询权限。
NFR6: 结果导出与日志记录必须避免泄露敏感凭据与密钥信息。
NFR7: 在用户规模增长 10x 的情况下，核心分析链路仍可通过横向扩展保持稳定服务。
NFR8: 系统应支持多模型 Adapter 并行扩展，不要求重构 IR 主契约。
NFR9: 当单模型质量或可用性波动时，系统可在不改变主链路的情况下切换/回滚适配器版本。
NFR10: 产品维持 WCAG 2.1 AA 级别可访问性要求。
NFR11: 核心流程（上传、查看结果、复制导出、重试）必须可通过键盘完成。
NFR12: IR 输出必须保持统一 JSON 契约并具备版本标识（schema_version、prompt_version）。
NFR13: 外部模型接入必须通过 Adapter 层完成，禁止绕过编译与 QA 门禁直接输出最终结果。
NFR14: 内容站渲染链路与工具链共享核心分析结果，但允许采用不同渲染策略（SSR/静态化 vs SPA）。
NFR15: 分析任务在外部模型调用失败时必须具备可恢复策略（重试、回滚、错误可读反馈）。
NFR16: 每个任务必须可回放，支持定位到阶段级输入输出与质量门禁结果。
NFR17: 系统需支持版本对比与回归验证，以保障同输入场景下的复现稳定性。

### Additional Requirements

- Starter template: 使用 create-next-app（TypeScript, Tailwind, ESLint, App Router, src-dir, alias）初始化。
- 技术栈基线：Next.js + Drizzle/PostgreSQL + NextAuth + React Query + Zustand + Cloudflare R2 + Creem。
- API 响应契约统一为 `{ success, data|error }` 结构。
- 命名规范：数据库 snake_case、组件 PascalCase、文件 kebab-case。
- UX 响应式要求：移动端单列、平板双列、桌面三列。
- 无障碍要求：WCAG 2.1 AA、最小触控目标 44x44、键盘可访问。
- 核心流程优化：上传即分析、进度透明化、结果分层展示、一键复制优先。
- Glassmorphism 实施规范：半透明背景 + blur + 细边框 + 层次阴影。
- 图标系统规范：统一 Lucide 图标库与语义映射。

### FR Coverage Map

FR1: Epic 1 - 上传参考图并启动分析任务
FR2: Epic 1 - 提交分析请求参数
FR3: Epic 1 - 任务标识与链路关联
FR4: Epic 1 - 任务状态与结果可见
FR5: Epic 1 - 客观图像描述输出
FR6: Epic 1 - 不确定字段 unknown 标记
FR7: Epic 1 - 结构化摄影与成像特征
FR8: Epic 1 - 客观描述置信度输出
FR33: Epic 1 - SPA 主流程可完成上传到结果获取
FR34: Epic 1 - 轮询进度更新
FR35: Epic 1 - 异常可恢复操作

FR9: Epic 2 - 风格指纹提取
FR10: Epic 2 - 风格常量与变量区分
FR11: Epic 2 - 标准变量槽位
FR12: Epic 2 - 不破坏风格常量的变量替换
FR42: Epic 2 - 同输入可比较稳定结果
FR43: Epic 2 - 风格保真解释摘要

FR13: Epic 3 - 通用模板生成
FR14: Epic 3 - 可选负向提示词
FR15: Epic 3 - Natural Language 输出
FR16: Epic 3 - Tag Stack 输出
FR17: Epic 3 - Short Command 输出
FR18: Epic 3 - 三档强度输出
FR19: Epic 3 - 参数建议输出
FR37: Epic 3 - 适配表达类型选择
FR38: Epic 3 - 输出强度选择
FR40: Epic 3 - 编译结果复制/导出

FR20: Epic 4 - 关键字段完整性校验
FR21: Epic 4 - 内部语义冲突检测
FR22: Epic 4 - 可复现性不足检测
FR23: Epic 4 - 修复建议与通过结论
FR24: Epic 4 - 基于 QA 报告重试
FR39: Epic 4 - JSON 契约合法性校验

FR25: Epic 5 - 统一 JSON 契约返回
FR26: Epic 5 - 阶段输入输出回放
FR27: Epic 5 - schema/prompt 版本记录
FR28: Epic 5 - 支持排障定位与指导
FR29: Epic 5 - 模板保存复用
FR30: Epic 5 - 历史模板重载复用
FR31: Epic 5 - 模板复用行为统计
FR32: Epic 5 - 任务质量趋势分析
FR41: Epic 5 - 按任务/时间/异常检索链路

FR36: Epic 6 - 内容站可被搜索引擎理解的分析呈现

## Epic List

### Epic 1: 分析任务输入与结构化客观勘验
用户可上传参考图并获得结构化、可置信度标注的客观描述输出，为后续风格编译建立可信输入。
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR33, FR34, FR35

### Epic 2: 风格指纹与变量控制层
系统将客观描述提炼为可复现风格指纹，并明确风格常量与变量槽位，支持稳定风格迁移。
**FRs covered:** FR9, FR10, FR11, FR12, FR42, FR43

### Epic 3: Prompt 编译与多适配输出
系统产出通用模板、负向提示词与三类适配表达（含三档强度），并支持复制/导出用于外部生图。
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR37, FR38, FR40

### Epic 4: QA 门禁与一致性保障
系统对输出做完整性、冲突与可复现性校验，返回问题与修复建议，支持用户重试闭环。
**FRs covered:** FR20, FR21, FR22, FR23, FR24, FR39

### Epic 5: 结果交付、回放排障与运营观测
系统提供统一 JSON 输出、阶段化回放、支持检索排障、模板复用与质量趋势观测。
**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR41

### Epic 6: 内容站交付面
系统在内容站提供可被搜索引擎理解的分析内容呈现，形成“工具体验 + 内容获客”双轨闭环。
**FRs covered:** FR36

### Epic Prioritization Matrix
| Epic | 用户价值 | 风险降低 | 依赖解锁 | 成本友好 | 加权总分 |
|------|---------|---------|---------|---------|---------|
| Epic 1 输入与客观勘验 | 5 | 4 | 5 | 3 | 4.45 |
| Epic 2 风格指纹与变量控制 | 5 | 4 | 4 | 3 | 4.20 |
| Epic 3 Prompt 编译与多适配 | 5 | 3 | 4 | 3 | 4.00 |
| Epic 4 QA 门禁与一致性 | 4 | 5 | 3 | 2 | 3.85 |
| Epic 5 回放排障与运营观测 | 3 | 5 | 3 | 3 | 3.55 |
| Epic 6 内容站交付面 | 2 | 2 | 2 | 4 | 2.35 |

**Recommended Delivery Order:** Epic 1 -> Epic 2 -> Epic 3 -> Epic 4 -> Epic 5 -> Epic 6

## Epic 1: 分析任务输入与结构化客观勘验

建立从上传到客观描述输出的主流程，确保任务可追踪、状态可见、失败可恢复，为后续风格编译提供可信输入。

### Story 1.1: 单图上传与任务初始化

As a 内容创作者,
I want 上传一张参考图并立即创建分析任务,
So that 我可以快速进入风格分析流程。

**Acceptance Criteria:**

**Given** 用户具备任务创建权限并处于可上传页面  
**When** 用户上传合法图片并提交  
**Then** 系统创建唯一任务 ID 并返回初始任务状态  
**And** 任务与用户、图片资源建立可追踪关联

**Given** 用户上传图片格式或大小不合法  
**When** 系统执行输入校验  
**Then** 系统拒绝任务创建并返回可操作错误信息  
**And** 页面提供重新上传入口

### Story 1.2: 客观描述引擎输出

As a 内容创作者,
I want 获得仅基于可见事实的结构化客观描述,
So that 后续风格提取有可靠输入。

**Acceptance Criteria:**

**Given** 任务已进入分析阶段  
**When** 客观描述引擎执行完成  
**Then** 输出包含 scene、subjects、framing、lighting 等结构化字段  
**And** 不确定项使用 unknown 并记录 uncertain_fields

**Given** 图片复杂度较高导致不确定性增加  
**When** 系统完成客观描述  
**Then** 输出整体置信度并保留关键不确定字段  
**And** 结果可继续传递到下一阶段

### Story 1.3: 任务状态可见与异常恢复

As a 内容创作者,
I want 在 SPA 中实时看到任务进度并可恢复失败任务,
So that 我不会在分析过程中失去控制。

**Acceptance Criteria:**

**Given** 任务处于运行中  
**When** 前端按轮询周期请求任务状态  
**Then** 页面更新当前阶段与进度  
**And** 用户可查看当前是否可重试或继续等待  
**And** 当任务进入 completed/failed/canceled 终态时停止轮询

**Given** 任务执行失败或超时  
**When** 系统返回失败状态  
**Then** 页面展示可恢复操作（重试/重新上传）  
**And** 不清空已保留的任务上下文信息

## Epic 2: 风格指纹与变量控制层

将客观描述转换为可复现的风格指纹，明确锁定常量与可替换变量，建立稳定迁移基础。

### Story 2.1: 风格指纹核心提取

As a 内容创作者,
I want 系统提取可复现的风格指纹,
So that 我可以在不同内容上复用同一风格。

**Acceptance Criteria:**

**Given** 客观描述结果可用  
**When** 风格指纹引擎执行  
**Then** 输出 camera_language、lighting_recipe、color_grade 等核心风格字段  
**And** 每个字段使用统一结构，供编译器消费

**Given** 某些风格字段不充分  
**When** 引擎完成提取  
**Then** 系统保留可用字段并标记风险  
**And** 不阻断整体流程

### Story 2.2: 常量锁定与变量槽位管理

As a 内容创作者,
I want 系统区分风格常量与用户变量,
So that 我替换主体/场景时不会破坏风格。

**Acceptance Criteria:**

**Given** 风格指纹已生成  
**When** 控制层构建 controls  
**Then** 输出 locked_style_constants 与 user_variables 两类集合  
**And** 默认包含 subject、setting、aspect_ratio 等变量槽位

**Given** 用户修改变量值  
**When** 系统准备进入编译阶段  
**Then** 仅变量部分被替换  
**And** 常量字段保持不变

### Story 2.3: 复现稳定性与风格保真解释

As a 支持人员,
I want 查看同输入稳定性与风格保真解释,
So that 我能判断系统是否真正复现了风格。

**Acceptance Criteria:**

**Given** 相同参考图与相同变量输入  
**When** 任务重复执行  
**Then** 系统可输出可比较结果用于稳定性验证  
**And** 差异可定位到阶段级字段

**Given** 最终结果生成完成  
**When** 用户查看结果详情  
**Then** 系统提供风格保真解释摘要  
**And** 说明关键常量如何被保持

## Epic 3: Prompt 编译与多适配输出

将风格指纹编译为可直接使用的多模型表达形式，支持用户选择表达类型和强度，并导出使用。

### Story 3.1: 通用模板与负向提示词编译

As a 内容创作者,
I want 生成通用模板与可选负向提示词,
So that 我可以快速在外部生图工具使用。

**Acceptance Criteria:**

**Given** 风格指纹与 controls 可用  
**When** 编译器执行  
**Then** 输出 universal_template_en  
**And** 在可用场景输出 universal_negative

**Given** 模板字段存在缺失  
**When** 编译器构建模板  
**Then** 仍输出结构化模板  
**And** 缺失项在结果中标注

### Story 3.2: 多适配器与强度分档输出

As a 内容创作者,
I want 获取多种表达形式和强度档位,
So that 我可以匹配不同模型偏好。

**Acceptance Criteria:**

**Given** 编译请求包含适配输出  
**When** 系统完成编译  
**Then** 输出 natural_language、tag_stack、short_command 三类适配结果  
**And** 每类包含 lite/standard/strong 三档版本

**Given** 对应任务已存在可用编译结果缓存且用户选择指定适配类型与强度  
**When** 页面展示编译结果  
**Then** 默认显示用户所选版本  
**And** 用户可在不触发重新分析的情况下切换其他版本

### Story 3.3: 参数建议与结果导出

As a 内容创作者,
I want 复制或导出编译结果并附带参数建议,
So that 我能无缝接入外部生成工作流。

**Acceptance Criteria:**

**Given** 编译结果已生成  
**When** 用户点击复制或导出  
**Then** 系统提供结构化输出内容  
**And** 包含 aspect_ratio、seed_strategy 等建议字段

**Given** 导出失败或权限受限  
**When** 系统处理导出动作  
**Then** 返回清晰错误信息  
**And** 用户可重试导出

## Epic 4: QA 门禁与一致性保障

在输出前执行规则门禁，确保结构完整、语义一致、可复现，降低无效模板与冲突提示词流出。

### Story 4.1: 字段完整性与 JSON 合法性校验

As a 平台系统,
I want 校验关键字段和 JSON 契约合法性,
So that 下游消费方可以稳定解析结果。

**Acceptance Criteria:**

**Given** 编译结果准备返回  
**When** QA 门禁执行  
**Then** 校验关键必填字段存在性  
**And** 校验最终 JSON 可解析且满足契约

**Given** 校验失败  
**When** QA 结束  
**Then** 返回可操作错误信息  
**And** 标识失败原因类别

### Story 4.2: 语义冲突与可复现性规则检测

As a 平台系统,
I want 自动检测冲突和复现风险,
So that 用户获得更稳定的风格迁移结果。

**Acceptance Criteria:**

**Given** QA 门禁读取中间结果  
**When** 规则引擎执行  
**Then** 识别 DoF/光型/饱和度等冲突  
**And** 输出冲突列表与严重程度

**Given** 可复现性不足  
**When** QA 输出报告  
**Then** 标记 pass=false 或告警状态  
**And** 附带可复现性问题说明

### Story 4.3: 修复建议与重试闭环

As a 内容创作者,
I want 根据 QA 建议快速修复并重试,
So that 我能在最少试错中得到可用结果。

**Acceptance Criteria:**

**Given** QA 发现问题  
**When** 系统生成报告  
**Then** 返回 issues 与 fixes  
**And** 提供可重试的输入建议

**Given** 用户发起重试  
**When** 系统重新执行相关阶段  
**Then** 生成新任务结果  
**And** 新旧任务可对比

## Epic 5: 结果交付、回放排障与运营观测

构建任务级可回放链路与运营指标体系，支持用户复用模板、支持团队快速排障、运营团队持续优化质量。

### Story 5.1: 统一结果交付与阶段化回放

As a 支持人员,
I want 获取任务的阶段化输入输出与版本信息,
So that 我能快速定位问题来源。

**Acceptance Criteria:**

**Given** 任务执行完成  
**When** 系统保存结果  
**Then** 按阶段保存输入输出快照  
**And** 记录 schema_version 与 prompt_version

**Given** 支持人员查询任务  
**When** 打开任务回放视图  
**Then** 可查看分阶段数据  
**And** 可识别问题所在阶段

### Story 5.2: 模板保存复用与历史重载

As a 内容创作者,
I want 保存模板并在历史中重载使用,
So that 我能持续复用高质量风格资产。

**Acceptance Criteria:**

**Given** 用户完成一次分析编译  
**When** 用户执行保存模板  
**Then** 模板被持久化并可在历史列表查询  
**And** 可再次加载用于新任务

**Given** 用户从历史加载模板  
**When** 用户替换变量并执行  
**Then** 系统使用历史模板生成新结果  
**And** 不丢失模板来源关联信息

### Story 5.3: 链路检索与质量趋势观测

As a 运营人员,
I want 基于任务与模板维度观察质量趋势,
So that 我可以发现问题并持续优化规则。

**Acceptance Criteria:**

**Given** 运营或支持进入诊断界面  
**When** 按任务 ID、时间范围、异常类型检索  
**Then** 返回匹配链路记录  
**And** 支持按模板维度聚合

**Given** 系统累积足够任务样本  
**When** 生成统计视图  
**Then** 可查看模板复用与质量趋势  
**And** 趋势视图至少支持按天聚合以便持续观测

## Epic 6: 内容站交付面

输出可索引、可理解的分析内容页面，支撑内容获客与品牌认知。

### Story 6.1: SEO 友好的分析结果呈现页

As a 内容消费者,
I want 在内容站阅读结构化分析结果页面,
So that 我可以快速理解风格特征并评估工具价值。

**Acceptance Criteria:**

**Given** 分析结果具备公开发布标记  
**When** 内容页被访问  
**Then** 页面提供清晰结构化信息层级  
**And** 内容可被搜索引擎抓取理解

**Given** 页面包含术语与摘要  
**When** 用户浏览内容  
**Then** 关键信息在首屏可见  
**And** 提供跳转到工具流程的入口

### Story 6.2: 内容页与工具结果一致性同步

As a 运营人员,
I want 内容页与工具链结果保持一致,
So that 不会出现“内容说法”和“工具输出”不一致的问题。

**Acceptance Criteria:**

**Given** 工具链输出更新且对应结果具备公开发布标记  
**When** 内容页渲染对应结果  
**Then** 使用同一核心结果数据源  
**And** 关键字段保持一致

**Given** 结果不可公开或数据不完整  
**When** 系统构建内容页  
**Then** 页面不发布或展示受限状态  
**And** 返回明确处理原因
