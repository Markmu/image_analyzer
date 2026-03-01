---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/architecture.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design-specification.md
---

# image_analyzer - Epic Breakdown

## Overview

本文提供 image_analyzer 的完整 Epic 与 Story 拆解，将 PRD、UX 设计和架构约束分解为可实施的 stories。

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
FR19: 系统可以输出与生成相关的参数建议，至少包括 aspect_ratio、seed_strategy 与不少于 1 条使用说明。
FR20: 系统可以校验关键字段完整性并输出缺失项。
FR21: 系统可以检测并报告内部语义冲突。
FR22: 系统可以检测并报告可复现性不足的问题。
FR23: 系统可以输出问题修复建议与整体通过结论。
FR24: 用户可以查看 QA 报告并基于修复建议发起重试。
FR25: 系统可以以统一 JSON 契约返回最终结果。
FR26: 系统可以保存每个阶段的输入输出用于任务回放。
FR27: 系统可以为每个任务记录 schema_version 与 prompt_version。
FR28: 支持人员可以基于任务链路在 5 分钟内定位问题处于分析、编译或 QA 阶段，并提供修复指导。
FR29: 用户可以保存分析输出模板用于后续复用。
FR30: 用户可以在历史任务中重新加载并复用既有模板。
FR31: 产品负责人可以按日或周查看模板复用率、二次编辑率和模板采纳率，并按模板 ID 聚合；统计窗口支持最近 7 天与最近 30 天。
FR32: 产品负责人可以按版本窗口查看任务质量指标趋势，至少包括采纳率、满意率、迁移成功率和端到端时延；趋势视图支持按日聚合。
FR33: 用户可以在单一连续流程中完成上传、分析、模板替换与结果获取，过程中无需跨页面重建任务上下文。
FR34: 系统可以向用户提供不超过 2 秒状态陈旧度的任务进度更新。
FR35: 系统可以在任务异常时提供可恢复的下一步操作。
FR36: 系统可以基于已批准公开的分析结果生成内容站页面，页面至少包含标题、摘要、关键风格块和工具回流入口。
FR37: 用户可以选择需要的适配表达类型（Natural Language / Tag Stack / Short Command）。
FR38: 用户可以选择输出强度档位（lite / standard / strong）。
FR39: 系统可以校验最终 JSON 契约合法性并在不合法时返回可操作错误信息。
FR40: 用户可以复制或导出编译结果用于外部生图工作流。
FR41: 支持人员可以按任务 ID、时间范围与异常类型检索任务链路，并返回对应阶段输出、版本信息与 QA 问题列表；单次检索结果最多返回 100 条记录。
FR42: 系统可以对同一参考图与同一变量输入保留可重复评估所需的关键输出，以支持版本间复现对比；复现对比至少保留 30 天。
FR43: 系统可以输出风格保真解释摘要，至少说明 lighting、color palette、camera language 三类关键风格常量如何被保持，每类至少输出 1 条解释。

### NonFunctional Requirements

NFR-P1: 端到端分析请求（上传完成到返回最终 JSON）P95 <= 45 秒；以生产环境 APM 和任务日志统计自然日滚动窗口内的已完成任务为测量口径，每日汇总一次。
NFR-P2: 已提交任务在前端触发状态刷新后，95% 的状态更新可在 2 秒内返回最新结果；以生产环境 API 网关日志统计 `/task-status` 请求的日级 P95 响应时间为测量口径。
NFR-P3: 结果页面关键操作（切换适配表达、切换强度、复制结果）交互响应 <= 200ms；以真实浏览器 RUM 事件采样和上线前实验室脚本各执行 100 次操作的 P95 结果共同验证。
NFR-S1: 任务数据与结果数据在传输过程中必须使用 TLS 1.2 或以上版本加密；上线前生产域名扫描结果必须达到 100% HTTPS 覆盖，且不得接受明文 HTTP 业务请求。
NFR-S2: 任务回放数据访问必须通过鉴权校验；季度抽样验证中普通用户跨账号访问成功率必须为 0%，支持角色的查询行为日志留痕率必须达到 100%。
NFR-S3: 结果导出与日志记录中不得出现密钥、访问令牌或完整凭据；上线前对 100% 导出样本和错误日志样本执行脱敏检查，敏感信息遗漏率必须为 0%。
NFR-SC1: 在基线 20 个并发分析任务的 10 倍压测条件下，核心分析链路仍需满足 NFR-P1，且任务错误率必须 <= 2%，压测口径按 15 分钟稳定流量窗口计算。
NFR-SC2: 首批 3 个目标模型接入时，新增模型不得要求修改既有 IR 字段定义，且以 30 个固定回归样本执行兼容性回归时通过率必须达到 100%。
NFR-SC3: 当单模型质量或可用性波动时，版本切换或回滚后的 30 分钟内，任务成功率必须恢复至回滚前稳定版本最近 7 天均值的 95% 以上。
NFR-A1: 产品在 MVP 范围内的核心页面必须达到 WCAG 2.1 AA 级别，并在上线前通过自动化扫描零严重错误以及不少于 5 个核心页面的人工抽检。
NFR-A2: 核心流程（上传、查看结果、复制导出、重试）必须可通过键盘在不依赖鼠标的情况下完成；每个核心任务的主路径不得超过 15 个 Tab 停靠点，且焦点可见性检查通过率必须达到 100%。
NFR-I1: IR 输出必须保持统一 JSON 业务契约，并具备 `schema_version`、`prompt_version` 两个版本字段；上线前对固定 100 条样本执行契约校验时失败率必须为 0。
NFR-I2: 任一目标模型的输出都必须经过统一编译和质量门禁后才能返回最终结果；抽样检查中绕过统一门禁流程的比例必须为 0。
NFR-I3: 内容站页面与工具页必须复用同一份核心分析结果数据；每周抽样对比 20 条公开结果时，关键字段一致性必须达到 100%，允许页面呈现方式不同。
NFR-R1: 分析任务在单次外部模型调用失败时必须在最多 2 次自动重试内完成恢复或返回可读错误；月度统计中自动恢复成功率必须 >= 80%，不可恢复任务的错误说明覆盖率必须达到 100%。
NFR-R2: 每个任务必须可回放到阶段级输入输出与质量门禁结果；每周从最近 7 天已完成任务中随机抽取不少于 100 条执行回放校验，回放成功率不得低于 99%。
NFR-R3: 系统必须支持版本对比与回归验证；每次版本发布前必须对 50 组固定样本完成复现评估，且风格迁移成功率相对回归版本下降不得超过 5%，风格保真解释缺失率不得超过 2%。

### Additional Requirements

- 保留现有 `create-next-app` / Next.js App Router brownfield 基座，不重新搭建新平台或重跑脚手架。
- 分析主链路必须严格遵循统一 IR 契约：`objective_description -> style_fingerprint -> controls -> prompt_outputs -> qa_report`，禁止绕过结构化输出直接生成最终提示词。
- 任务执行采用数据库驱动的异步任务状态机；创建任务后通过轮询获取状态，MVP 不引入 WebSocket 或 SSE。
- 新主数据模型必须以 `analysis_tasks` 与 `analysis_stage_snapshots` 为唯一真相来源，阶段快照必须 append-only，保留失败与重试链路。
- 主结果存储采用 PostgreSQL + JSONB 快照，图片与导出物使用 Cloudflare R2。
- 运行时契约统一使用 Zod 4 校验，TypeScript 类型应从 schema 推导，避免手写类型漂移。
- 外部模型集成必须通过 `provider` 抽象实现；Prompt 输出表达必须通过独立的 `adapter_type` 层实现，二者禁止混用命名与职责。
- API 继续使用 Next.js Route Handlers + REST 风格 + 统一 `{ success, data|error }` 响应包装。
- 前端服务端状态使用 React Query 处理任务轮询与结果拉取；Zustand 仅用于局部 UI/workspace 状态，不承载任务真相状态。
- QA Critic 是强制门禁阶段，只输出 `issues`、`fixes` 和 verdict，不直接修改前置阶段产物。
- 用户仅可访问自身任务；支持链路必须采用受控查询和审计日志，`support/search` 默认返回摘要优先结果。
- 公开内容页必须通过 allowlist projector 生成，只能暴露标题、摘要、关键风格块、CTA 等白名单字段，不得暴露内部快照、输入载荷或完整 QA 细节。
- 浏览器支持策略以现代 Chromium 浏览器为主，老旧浏览器深度兼容不属于当前里程碑目标。
- 基于当前指定输入范围，`ux-design-specification.md` 为归档导航文档，未提供可直接分解为 stories 的细粒度交互规范；本轮未额外提取具体 UI 约束。

### FR Coverage Map

FR1: Epic 1 - 上传参考图启动分析任务
FR2: Epic 1 - 提交分析请求参数
FR3: Epic 1 - 建立唯一任务标识与完整处理链路
FR4: Epic 1 - 查看任务状态并访问结果
FR5: Epic 1 - 输出结构化客观图像描述
FR6: Epic 1 - 标记 unknown 与不确定字段
FR7: Epic 1 - 输出结构化摄影与成像特征
FR8: Epic 1 - 输出客观描述整体置信度
FR9: Epic 2 - 提取可复现的风格指纹
FR10: Epic 2 - 区分风格常量与用户变量
FR11: Epic 2 - 提供标准变量槽位
FR12: Epic 2 - 在不破坏风格下安全替换变量
FR13: Epic 3 - 基于风格模板生成通用模板
FR14: Epic 3 - 输出可选 negative prompt
FR15: Epic 3 - 输出 Natural Language 适配表达
FR16: Epic 3 - 输出 Tag Stack 适配表达
FR17: Epic 3 - 输出 Short Command 适配表达
FR18: Epic 3 - 输出三档强度版本
FR19: Epic 3 - 输出生成参数建议
FR20: Epic 4 - 校验关键字段完整性
FR21: Epic 4 - 检测并报告语义冲突
FR22: Epic 4 - 检测并报告可复现性不足
FR23: Epic 4 - 输出修复建议与整体通过结论
FR24: Epic 4 - 用户基于 QA 报告发起重试
FR25: Epic 5 - 返回统一 JSON 契约
FR26: Epic 5 - 保存阶段输入输出用于任务回放
FR27: Epic 5 - 记录 schema_version 与 prompt_version
FR28: Epic 5 - 支持人员在任务链路中定位问题
FR29: Epic 5 - 保存分析输出模板
FR30: Epic 5 - 重载历史任务并复用模板
FR31: Epic 5 - 查看模板复用率、编辑率与采纳率
FR32: Epic 5 - 查看版本窗口质量趋势
FR33: Epic 1 - 在单一连续流程中完成主路径
FR34: Epic 1 - 提供不超过 2 秒陈旧度的状态更新
FR35: Epic 1 - 任务异常时提供可恢复操作
FR36: Epic 6 - 生成公开内容站页面
FR37: Epic 3 - 选择适配表达类型
FR38: Epic 3 - 选择输出强度档位
FR39: Epic 4 - 校验最终 JSON 契约合法性
FR40: Epic 3 - 复制或导出编译结果
FR41: Epic 5 - 按任务 ID、时间范围、异常类型检索任务链路
FR42: Epic 2 - 保留版本间复现对比关键输出
FR43: Epic 2 - 输出风格保真解释摘要

## Epic List

### Epic 1: 上传图片并获得可轮询的结构化分析任务
用户可以上传单张参考图、提交分析请求、轮询任务状态，并在任务完成后获得结构化客观描述作为后续风格提取的基础。
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR33, FR34, FR35

### Epic 2: 生成可复用风格模板并安全替换变量
用户可以获得可复现的风格模板，区分风格常量与变量槽位，并在保持核心风格不变的前提下安全替换主体、场景、时间与画幅。
**FRs covered:** FR9, FR10, FR11, FR12, FR42, FR43

### Epic 3: 生成可导出的多适配候选 Prompt
用户可以基于风格模板获得通用模板、negative prompt、多种适配表达和不同强度档位，并复制或导出这些候选结果到外部生图工作流。
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR37, FR38, FR40

### Epic 4: 校验候选结果并形成可修复的可信输出
用户可以看到 JSON 契约校验、语义冲突与可复现性问题，并根据修复建议进行重试，最终获得可信、可解释、可继续复用的结果。
**FRs covered:** FR20, FR21, FR22, FR23, FR24, FR39

### Epic 5: 复用历史结果并支撑支持与运营分析
用户可以保存模板、重载历史任务并复用结果；支持人员可以检索和回放任务链路；产品负责人可以查看复用率、采纳率、满意率和版本趋势。
**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR41

### Epic 6: 将分析结果安全发布为公开内容页
系统可以把已批准公开的分析结果安全投影为可索引的内容站页面，对外展示标题、摘要、关键风格块和工具回流入口。
**FRs covered:** FR36

## Story Design Constraints

- Epic 1 的前三条 stories 必须尽早交付“上传一张图并获得结构化客观描述”的可见结果，不能只交付底层任务框架。
- Epic 2 必须以“变量可替换且风格稳定”为首要验收目标，不能退化为纯 IR schema 建模。
- Epic 3 产出的是候选 prompt outputs；Epic 4 产出的是经过 QA 校验、可解释、可修复的可信结果。后续 stories 必须严格保持这一边界。
- Epic 5 在 story 拆分时必须显式区分三条子线：用户复用、支持排障、产品观测，避免成为兜底杂项 Epic。
- 每个 Epic 在 story 设计时至少绑定 1-3 条关键 NFR，尤其是 Epic 1、Epic 4、Epic 5，必须把性能、可靠性、鉴权和回放能力写入 AC。

## Epic 1: 上传图片并获得可轮询的结构化分析任务

用户可以上传单张参考图、提交分析请求、轮询任务状态，并在任务完成后获得结构化客观描述作为后续风格提取的基础。

### Story 1.1: 上传参考图并创建分析任务

As a 用户,
I want 上传单张参考图并提交分析请求,
So that 系统可以创建可追踪的分析任务并开始处理。

**Dependencies:** 无，作为分析主链路起点 story。

**Technical Constraints:**
- 必须遵循数据库驱动的异步任务状态机，创建任务后立即返回，不在请求内同步执行完整分析链路。
- API 必须使用统一 `{ success, data|error }` 响应包装，并与 Route Handlers + REST 风格保持一致。
- 任务主记录必须以 `analysis_tasks` 为唯一真相来源，不允许复用旧 `analysis_results` 作为新链路主写入对象。

**Primary Source Hints:**
- PRD: 上传参考图、任务初始化、请求参数提交相关需求。
- Architecture: Async task state machine、`analysis_tasks` 主数据模型、API route 边界、传输安全约束。

**Acceptance Criteria:**

**Given** 用户位于分析入口页并选择了一张受支持的图片
**When** 用户提交分析请求
**Then** 系统创建唯一 `task_id`、保存图片引用和请求参数，并返回任务受理结果
**And** 返回结果包含初始任务状态、轮询所需标识和失败时可读错误信息

**Given** 用户上传了不受支持的文件类型、超出限制的文件或缺少必要请求参数
**When** 用户提交请求
**Then** 系统拒绝创建任务
**And** 界面显示明确、可操作的错误提示

**Given** 任务创建接口处理上传与请求校验
**When** 系统返回受理结果
**Then** 端到端任务创建路径遵守 TLS 传输要求且不记录敏感凭据到错误日志或导出内容
**And** 任务创建失败时返回可读错误说明，以支持最多 2 次自动恢复或明确失败告知

### Story 1.2: 轮询任务状态并展示可恢复进度反馈

As a 用户,
I want 查看分析任务的实时状态和当前阶段,
So that 我知道任务是否在正常推进并能在异常时采取下一步操作。

**Dependencies:** 依赖 Story 1.1 已成功创建任务并返回 `task_id` 与初始状态。

**Technical Constraints:**
- 前端服务端状态必须由 React Query 承担，Zustand 仅可保存局部工作区状态，不能作为任务真相来源。
- 状态接口只返回状态、阶段、进度与可恢复动作，不直接返回完整结果对象。
- 轮询机制采用短周期轮询，MVP 不引入 WebSocket 或 SSE。

**Primary Source Hints:**
- PRD: 任务状态可见、2 秒陈旧度、异常时可恢复下一步操作。
- Architecture: `app/api/analysis/[id]/status/route.ts` 边界、React Query 轮询职责、异步任务状态机。

**Acceptance Criteria:**

**Given** 某个分析任务已创建
**When** 前端按约定频率请求任务状态
**Then** 系统返回标准化状态、当前阶段、进度信息和可恢复操作
**And** 95% 的状态刷新请求在 2 秒内返回最新状态

**Given** 任务进入失败、部分完成或可重试状态
**When** 用户查看任务状态
**Then** 界面按状态展示明确的下一步操作，例如 `failed -> 重试/查看错误`、`partial -> 查看结果/重试`
**And** 不要求用户跨页面重新建立任务上下文

**Given** 前端持续轮询任务状态
**When** 系统返回状态结果
**Then** 95% 的状态刷新请求在 2 秒内返回最新状态
**And** 轮询链路在单次外部调用失败时可进入受控重试或返回明确错误说明

### Story 1.3: 生成完整结构化客观描述结果

As a 用户,
I want 在任务完成后获得完整的结构化客观图像描述,
So that 我能基于可见事实理解图片内容并为后续风格提取提供完整输入。

**Dependencies:** 依赖 Story 1.1 完成任务初始化，Story 1.2 提供状态轮询与结果进入点。

**Technical Constraints:**
- 本 story 只交付 `objective_description` 阶段产物，不提前承担 `style_fingerprint`、`controls`、`prompt_outputs` 或 `qa_report` 的输出职责。
- 输出字段必须保持统一 IR 的 `snake_case` 命名，并符合阶段级 JSON 契约。
- 不确定字段必须显式标记为 `unknown` 或等价结构，不能以省略字段代替不确定性表达。

**Primary Source Hints:**
- PRD: 客观勘验、结构化摄影与成像特征、不确定字段与整体置信度要求。
- Architecture: Forensic Describer 阶段职责、IR 顶层命名规范、阶段快照与最终结果边界。

**Acceptance Criteria:**

**Given** 分析任务成功完成客观勘验阶段
**When** 用户查看任务结果
**Then** 系统返回完整 `objective_description` 结构化结果
**And** 结果至少包含可见内容描述、摄影/成像特征字段、整体置信度和 `unknown`/不确定字段列表

**Given** 某些字段无法从图像可靠判断
**When** 系统生成客观描述
**Then** 这些字段使用 `unknown` 或等价结构标识
**And** 不确定字段会被列入专门字段列表而不是静默省略

**Given** 用户获取 Epic 1 的最终结果
**When** 返回结果 payload
**Then** `objective_description` 字段结构满足统一 JSON 契约的该阶段要求
**And** 后续 Epic 不需要回头补齐本阶段缺失字段

**Given** 用户通过键盘完成上传并查看结果
**When** 任务成功返回 `objective_description`
**Then** 上传、查看结果等核心路径可在不依赖鼠标的情况下完成
**And** 相关页面满足 MVP 范围内 WCAG 2.1 AA 的可访问性要求

## Epic 2: 生成可复用风格模板并安全替换变量

用户可以获得可复现的风格模板，区分风格常量与变量槽位，并在保持核心风格不变的前提下安全替换主体、场景、时间与画幅。

### Story 2.1: 提取风格指纹并区分常量与变量

As a 用户,
I want 系统从客观描述中提取风格指纹并区分风格常量与可替换变量,
So that 我能理解哪些风格特征应被锁定，哪些内容允许修改。

**Dependencies:** 依赖 Story 1.3 已产出完整 `objective_description` 结构化结果。

**Technical Constraints:**
- 本 story 只负责从 `objective_description` 提取 `style_fingerprint` 与变量控制边界，不提前承担 prompt 编译或 QA 门禁职责。
- 风格字段必须保持统一 IR 的 `snake_case` 命名，并与后续变量编辑器和 prompt compiler 直接兼容。
- 必须显式区分 `locked_style_constants` 与 `user_variables`，不能将二者混合存储或模糊命名。

**Primary Source Hints:**
- PRD: 风格指纹、风格常量与变量区分、关键风格维度要求。
- Architecture: Style Fingerprinter 阶段职责、IR 命名规范、`provider` / `adapter_type` 与阶段边界约束。

**Acceptance Criteria:**

**Given** 某个任务已产出完整 `objective_description`
**When** 系统执行风格指纹提取
**Then** 系统输出 `style_fingerprint`
**And** 明确区分 `locked_style_constants` 与 `user_variables`

**Given** 风格指纹包含多类风格信息
**When** 系统返回结果
**Then** 至少覆盖 lighting、color palette、camera language 等关键风格维度
**And** 字段命名与结构符合统一 IR 契约，并可被变量编辑器和后续 prompt 编译阶段直接消费

### Story 2.2: 提供标准变量槽位并支持安全替换

As a 用户,
I want 使用标准变量槽位替换主体、场景、时间和画幅,
So that 我可以复用模板而不破坏参考图的核心风格。

**Dependencies:** 依赖 Story 2.1 已输出 `user_variables` 与 `locked_style_constants`。

**Technical Constraints:**
- 变量替换只能作用于白名单变量槽位，不能直接修改 `locked_style_constants`。
- 变量编辑行为属于工作区局部状态，可由 UI/workspace 状态管理承载，但不能成为任务真相来源。
- 替换后的结构必须保持与后续 prompt 编译阶段兼容，不能引入临时字段或破坏 IR 契约。

**Primary Source Hints:**
- PRD: 标准变量槽位、风格稳定前提下的变量替换要求。
- Architecture: controls 阶段职责、Zustand 仅承载局部 UI 状态、统一 IR 契约兼容性要求。

**Acceptance Criteria:**

**Given** 系统已输出 `user_variables`
**When** 用户查看或编辑模板变量
**Then** 系统提供标准变量槽位，至少包括主体、场景、时间和画幅
**And** 仅允许编辑白名单变量字段

**Given** 用户提交变量替换
**When** 系统校验替换请求
**Then** 不允许直接修改 `locked_style_constants`
**And** 替换后的结果仍保持模板结构完整并可供后续编译阶段使用

**Given** 用户尝试编辑被锁定的风格常量字段
**When** 界面校验该编辑操作
**Then** 系统明确阻止该修改
**And** UI 给出不可编辑原因说明，帮助用户理解哪些字段属于风格常量

### Story 2.3: 生成风格保真解释并保留复现对比关键输出

As a 用户或支持人员,
I want 查看风格保真解释并保留可复现对比所需的关键输出,
So that 我能理解系统如何保持风格一致，并在版本之间做稳定对比。

**Dependencies:** 依赖 Story 2.1 和 Story 2.2 已形成稳定的风格指纹与变量控制层输出。

**Technical Constraints:**
- 风格保真解释必须基于已生成的风格常量与变量控制结果，不允许由前端自行拼装解释摘要。
- 复现对比关键输出必须与版本记录、阶段快照和回放能力兼容，便于后续版本比较直接读取。
- 本 story 产出的解释与对比数据仍属于 Epic 2 范围，不提前承担 QA verdict 或最终结果组装职责。

**Primary Source Hints:**
- PRD: 风格保真解释摘要、版本间复现对比、保留 30 天要求。
- Architecture: 版本追踪、阶段快照、回放与版本比较能力、Task-centric 数据模型。

**Acceptance Criteria:**

**Given** 系统已完成风格指纹和变量控制层输出
**When** 返回 Epic 2 结果
**Then** 系统输出风格保真解释摘要
**And** 至少说明 lighting、color palette、camera language 三类关键风格常量如何被保持

**Given** 同一参考图与同一变量输入需要进行版本间对比
**When** 系统保存本阶段关键输出
**Then** 保留支持复现对比所需的关键字段至少 30 天
**And** 这些字段可被后续回放和版本比较能力稳定读取

## Epic 3: 生成可导出的多适配候选 Prompt

用户可以基于风格模板获得通用模板、negative prompt、多种适配表达和不同强度档位，并复制或导出这些候选结果到外部生图工作流。

### Story 3.1: 生成通用模板与 negative prompt

As a 用户,
I want 基于风格模板获得通用模板和可选 negative prompt,
So that 我能先拿到模型无关的候选提示结构作为后续适配输出基础。

**Dependencies:** 依赖 Epic 2 已完成 `style_fingerprint` 与 `controls` 输出。

**Technical Constraints:**
- 本 story 只负责 Prompt Compiler 产出模型无关模板与 negative prompt，不提前承担多适配表达切换与 QA 门禁职责。
- 输出必须遵循统一 IR 契约，使用 `universal_template_en` 与 `universal_negative` 命名。
- Prompt Compiler 必须作为独立阶段运行，不能绕过结构化 IR 直接生成最终用户展示对象。

**Primary Source Hints:**
- PRD: 通用模板、negative prompt、模型无关候选结构要求。
- Architecture: Prompt Compiler 阶段职责、统一 IR 路径、Route Handler 不直接组装最终 IR。

**Acceptance Criteria:**

**Given** 系统已完成风格指纹和变量控制层输出
**When** 系统执行 prompt 编译
**Then** 返回与统一 IR 契约一致的 `universal_template_en`
**And** 在适用时返回可选 `universal_negative`

**Given** 编译结果返回给前端或下游模块
**When** 系统输出候选结果
**Then** 输出结构符合统一 IR 契约
**And** 可被后续适配表达与导出流程直接消费

### Story 3.2: 生成三类适配表达

As a 用户,
I want 获得 Natural Language、Tag Stack 和 Short Command 三类适配表达,
So that 我可以根据外部生图模型或个人偏好选择合适的提示形式。

**Dependencies:** 依赖 Story 3.1 已生成通用模板。

**Technical Constraints:**
- `adapter_type` 只表示输出表达形式，如 `natural_language`、`tag_stack`、`short_command`，不得与 provider 概念混用。
- 多类适配表达必须基于同一份 `prompt_outputs` 结果切换展示，不能把每种适配形式做成独立后端资源。
- Prompt output adapter 不直接访问 HTTP request/response 或数据库连接。

**Primary Source Hints:**
- PRD: 三类适配表达与用户选择表达类型的需求。
- Architecture: `adapter_type` 命名边界、`prompt_outputs.adapters`、结果页基于同一 `prompt_outputs` 切换展示。

**Acceptance Criteria:**

**Given** 系统已生成通用模板
**When** 系统执行适配表达编译
**Then** 返回 Natural Language、Tag Stack、Short Command 三类输出
**And** 每类输出都与同一份风格模板保持语义一致

**Given** 用户查看多类适配结果
**When** 前端展示候选输出
**Then** 用户可以明确区分不同 `adapter_type`
**And** 不需要切换到不同任务或页面才能查看这些表达

### Story 3.3: 为每类适配表达提供强度档位与参数建议

As a 用户,
I want 为每类适配表达查看 lite、standard、strong 三档结果和参数建议,
So that 我可以按目标模型和生成意图选择合适的输出强度。

**Dependencies:** 依赖 Story 3.2 已生成三类适配表达。

**Technical Constraints:**
- 强度档位属于同一 `prompt_outputs` 结果内的展示与选择维度，不应拆成独立任务或独立资源。
- 参数建议至少与 `aspect_ratio`、`seed_strategy` 和使用说明保持结构化输出，便于导出与下游消费。
- 前端切换强度档位时只更新工作区展示状态，不改变任务真相状态。

**Primary Source Hints:**
- PRD: 三档强度版本、参数建议、200ms 交互目标。
- Architecture: 结果页基于单一 `prompt_outputs` 切换展示、React Query 与 workspace 状态职责边界。

**Acceptance Criteria:**

**Given** 系统已生成三类适配表达
**When** 返回候选 prompt outputs
**Then** 每类适配表达都提供 lite、standard、strong 三档版本
**And** 每组结果至少附带 `aspect_ratio`、`seed_strategy` 和不少于 1 条使用说明

**Given** 用户切换不同强度档位
**When** 前端更新展示结果
**Then** 关键交互响应满足 `<= 200ms` 的目标
**And** 切换行为不破坏当前任务上下文

### Story 3.4: 选择、复制并导出候选结果

As a 用户,
I want 选择适配表达类型与强度档位，并复制或导出候选结果,
So that 我可以把这些输出直接用于外部生图工作流验证。

**Dependencies:** 依赖 Story 3.2 和 Story 3.3 已生成可切换的适配表达与强度档位。

**Technical Constraints:**
- 导出与复制只暴露选中的 `adapter_type`、强度档位和参数建议，不得暴露内部调试字段或敏感信息。
- 模板与导出模块只消费规范化 `prompt_outputs` 和模板视图模型，不直接读取内部阶段快照。
- 当前工作区选择状态应保持在 UI/workspace 层，不通过重新创建任务实现切换。

**Primary Source Hints:**
- PRD: 复制、导出、外部生图工作流验证、敏感信息不泄露要求。
- Architecture: `features/templates/*` 边界、只消费 `prompt_outputs`、导出不暴露内部字段。

**Acceptance Criteria:**

**Given** 用户正在查看候选 prompt outputs
**When** 用户切换表达类型或强度档位
**Then** 系统展示对应结果
**And** 当前选择状态在结果工作区中保持一致

**Given** 用户选择复制或导出
**When** 系统执行对应操作
**Then** 系统至少支持复制当前选中结果文本，并导出包含所选 `adapter_type`、强度档位和参数建议的结构化内容
**And** 导出与复制内容不包含敏感凭据或不应暴露的内部字段

**Given** 用户完成复制或导出操作
**When** 系统返回操作结果
**Then** 界面提供明确的成功反馈
**And** 当前工作区上下文和所选结果状态保持不变

## Epic 4: 校验候选结果并形成可修复的可信输出

用户可以看到 JSON 契约校验、语义冲突与可复现性问题，并根据修复建议进行重试，最终获得可信、可解释、可继续复用的结果。

### Story 4.1: 校验 JSON 契约完整性与关键字段缺失

As a 用户,
I want 系统校验候选结果是否符合统一 JSON 契约并指出缺失字段,
So that 我知道当前结果是否结构完整、可继续使用。

**Dependencies:** 依赖 Epic 3 已完成候选 `prompt_outputs` 生成。

**Technical Constraints:**
- QA Critic 是强制门禁阶段，本 story 只负责契约完整性校验，不直接修改前置阶段产物。
- 契约校验必须基于统一 Zod schema 和版本字段执行，避免手写类型漂移。
- 机器可读错误信息必须可被结果工作区、重试流程和固定样本回归共同消费。

**Primary Source Hints:**
- PRD: 关键字段完整性、最终 JSON 契约合法性、可操作错误信息要求。
- Architecture: QA Critic 作为强制门禁、Zod 4 契约校验、`schema_version` / `prompt_version` 一致性检查。

**Acceptance Criteria:**

**Given** 系统已生成候选 prompt outputs
**When** QA 阶段执行契约校验
**Then** 系统校验最终结果是否符合统一 JSON 契约
**And** 当字段缺失、不合法或结构不一致时返回机器可读错误信息

**Given** 最终结果进入 QA 门禁
**When** 契约校验执行
**Then** 所有目标模型输出都必须经过统一编译与质量门禁后才能继续返回
**And** 契约校验结果可用于固定样本集回归，满足 `schema_version` 与 `prompt_version` 的一致性检查

**Given** 契约校验失败
**When** 用户查看 QA 结果
**Then** 界面清晰显示缺失字段或不合法字段
**And** 问题列表可用于后续修复或重试决策

### Story 4.2: 检测语义冲突与可复现性问题并生成修复建议

As a 用户,
I want 系统指出候选结果中的语义冲突和可复现性风险，并给出修复建议,
So that 我能理解结果为什么不可靠以及如何修正。

**Dependencies:** 依赖 Story 4.1 已完成契约完整性校验；依赖前置阶段产物结构化稳定输出。

**Technical Constraints:**
- QA Critic 只输出 `issues`、`fixes` 和 verdict，不直接回写或修改 `objective_description`、`style_fingerprint`、`controls`、`prompt_outputs`。
- 问题分类必须可支撑版本回归与复现评估，至少能标识问题来源阶段与影响范围。
- 本 story 聚焦语义冲突与复现性风险，不扩展为全量自动修复系统。

**Primary Source Hints:**
- PRD: 语义冲突、可复现性不足、修复建议要求。
- Architecture: QA Report 格式、QA Critic 输出边界、版本回归与复现评估约束。

**Acceptance Criteria:**

**Given** 系统已完成候选结果编译
**When** QA Critic 分析输出一致性
**Then** 系统检测内部语义冲突和可复现性不足问题
**And** 以标准化 `issues` 与 `fixes` 结构返回结果

**Given** QA 发现问题
**When** 用户查看 QA 报告
**Then** 系统展示问题严重程度、影响字段和修复建议
**And** MVP 首版至少覆盖关键风格冲突、字段不一致和复现不足三类高频问题，而不要求覆盖全部潜在冲突模式

**Given** QA Critic 评估候选结果的可靠性
**When** 检测到外部模型波动、字段冲突或复现不足
**Then** 报告明确标识问题来源阶段与影响范围
**And** 问题分类可支撑后续版本回归与复现评估

### Story 4.3: 展示 QA 结果并支持用户发起修复重试

As a 用户,
I want 查看 QA 报告并根据修复建议发起重试,
So that 我可以把候选结果推进为更可信的最终输出。

**Dependencies:** 依赖 Story 4.1 和 Story 4.2 已输出完整 QA 报告与修复建议。

**Technical Constraints:**
- QA 结果展示只消费标准化 `qa_report`，前端不自行拼装伪 QA 结论。
- 重试必须通过受控任务生命周期与重试链路实现，不允许前端直接覆盖旧结果。
- 原始失败链路、重试原因与关联版本信息必须可被后续回放和支持排障读取。

**Primary Source Hints:**
- PRD: 查看 QA 报告、基于建议发起重试、异常恢复要求。
- Architecture: retry-service、QA Critic 输出进入标准结果对象、analysis_retries 与回放链路边界。

**Acceptance Criteria:**

**Given** QA 阶段已输出 verdict、issues 和 fixes
**When** 用户查看结果工作区
**Then** 界面清晰展示 QA 报告和整体通过结论
**And** 用户可以识别当前结果是可通过、告警还是失败状态

**Given** QA 报告包含多个问题和修复建议
**When** 界面展示 QA 结果
**Then** 系统按 verdict 和严重度分层展示问题
**And** 优先呈现最关键、最影响可用性的项

**Given** 当前结果存在可修复问题
**When** 用户根据建议发起重试
**Then** 系统创建受控重试流程、生成可关联的独立尝试记录，并保留原结果链路
**And** 重试入口不要求用户重新上传图片或重建任务上下文

**Given** 用户发起修复重试
**When** 系统创建新的受控尝试
**Then** 重试流程保留原始 QA 结果、重试原因和关联版本信息
**And** 单次外部模型调用失败时最多执行 2 次自动重试或返回可读错误说明

## Epic 5: 复用历史结果并支撑支持与运营分析

用户可以保存模板、重载历史任务并复用结果；支持人员可以检索和回放任务链路；产品负责人可以查看复用率、采纳率、满意率和版本趋势。

### Story 5.0: 组装最终分析结果并返回统一 JSON 契约

As a 用户或下游系统,
I want 获得包含各阶段产物和版本信息的统一 JSON 最终结果,
So that 我可以稳定消费可信输出，而不必自行拼装各阶段数据。

**Dependencies:** 依赖 Epic 1-4 已分别完成 `objective_description`、`style_fingerprint`、`controls`、`prompt_outputs` 与 `qa_report` 的结构化输出。

**Technical Constraints:**
- 最终结果对象必须由任务服务层统一组装，Route Handler 不直接拼接多阶段产物。
- 顶层字段必须与统一结果视图保持一致，至少包含 `task_id`、`status`、`schema_version`、`prompt_version` 和五类阶段产物。
- 响应对象必须保持 `snake_case` IR 字段命名，不做 camelCase 二次映射。

**Primary Source Hints:**
- PRD: 统一 JSON 契约返回、版本字段记录、下游消费稳定性要求。
- Architecture: `AnalysisTaskResult` 统一结果格式、service 边界、`app/api/analysis/[id]/route.ts` 返回规范化结果对象。

**Acceptance Criteria:**

**Given** `objective_description`、`style_fingerprint`、`controls`、`prompt_outputs` 和 `qa_report` 已完成
**When** 系统组装最终分析结果
**Then** 返回统一 JSON 契约对象
**And** 顶层至少包含 `task_id`、`status`、上述五类阶段产物以及 `schema_version`、`prompt_version`

**Given** 最终结果返回给前端、导出链路或下游系统
**When** 系统输出成功响应
**Then** 响应使用统一 `{ success, data|error }` 包装
**And** 返回结构可被历史复用、公开投影和支持回放能力直接消费

**Given** 最终结果进入发布前校验
**When** 对固定样本集执行契约验证
**Then** 最终 JSON 结果满足统一业务契约
**And** 不允许绕过统一编译与 QA 门禁直接返回下游可消费结果

### Story 5.1: 保存模板并重载历史任务结果

As a 用户,
I want 保存分析输出模板并从历史任务中重载结果,
So that 我可以复用已有成果，而不必每次从头开始分析。

**Dependencies:** 依赖 Story 5.0 已能返回规范化最终结果；与 Epic 3 的 prompt outputs 结果结构保持一致。

**Technical Constraints:**
- 历史重载读取的是规范化任务结果视图，不允许直接拼装阶段快照或旧表字段。
- 模板能力只消费 `prompt_outputs` 和模板视图模型，不直接依赖内部回放对象。
- 保存模板、历史重载与复用入口应与模板模块、历史模块边界保持一致，不复用支持排障接口。

**Primary Source Hints:**
- PRD: 模板保存、历史重载、模板复用相关需求。
- Architecture: `features/templates/*`、`features/history/*` 边界，规范化任务结果视图，不直接拼装 stage snapshots。

**Acceptance Criteria:**

**Given** 用户拥有一个已完成的可信分析结果
**When** 用户选择保存模板
**Then** 系统保存可复用模板及其必要元数据
**And** 模板可在后续会话中再次读取

**Given** 用户访问历史任务或模板列表
**When** 用户选择某个历史结果进行重载
**Then** 系统恢复规范化任务结果视图和可复用模板上下文
**And** 不依赖重新执行完整分析链路

### Story 5.2: 保存阶段快照和版本信息以支持任务回放

As a 支持人员或系统,
I want 为每个任务保存阶段输入输出与版本信息,
So that 后续可以稳定回放任务链路并定位问题来源。

**Dependencies:** 依赖 Epic 1-4 各阶段在执行中持续产出结构化输入输出；与 Story 5.0 的最终结果索引能力协同。

**Technical Constraints:**
- `analysis_stage_snapshots` 必须以 `task_id + stage_name + attempt_no` 作为唯一执行单元，并保持 append-only。
- 阶段快照必须记录输入、输出、错误和时间戳，以支持回放、失败链路保留和版本比对。
- 回放接口必须与普通用户结果接口分离，并受更严格授权控制。

**Primary Source Hints:**
- PRD: 任务回放、版本记录、支持定位问题来源要求。
- Architecture: `analysis_stage_snapshots` 数据边界、`AnalysisStageSnapshot` 格式、`app/api/analysis/replay/[id]/route.ts` 授权要求。

**Acceptance Criteria:**

**Given** 一个分析任务在各阶段推进
**When** 阶段开始、完成、失败或重试
**Then** 系统以 append-only 方式保存阶段快照
**And** 每条记录都可关联 `task_id`、`stage_name`、`attempt_no`、阶段状态、`schema_version` 与 `prompt_version`

**Given** 支持人员或系统需要回放某个任务
**When** 读取任务链路
**Then** 可以按阶段查看输入输出和关键结果
**And** 原始失败链路不会被重试结果覆盖

**Given** 支持或系统回放最近 7 天的已完成任务
**When** 执行阶段级回放校验
**Then** 回放结果可稳定恢复到阶段输入输出与 QA 门禁结果
**And** 普通用户不能访问非本人任务链路，支持角色查询行为必须完整留痕

### Story 5.3: 检索任务链路并支撑支持排障

As a 支持人员,
I want 按任务 ID、时间范围和异常类型检索任务链路,
So that 我能在 5 分钟内定位问题发生在分析、编译还是 QA 阶段。

**Dependencies:** 依赖 Story 5.2 已保存完整阶段快照和版本信息；依赖平台已有支持角色鉴权能力。

**Technical Constraints:**
- `support/search` 必须与普通用户结果接口隔离，默认返回摘要优先结果，不默认返回全量 payload。
- 支持访问必须记录审计日志，至少包含 `actor_id`、`task_id`、`action`、`timestamp`、`reason`。
- 支持角色默认只读，不允许直接修改任务结果、阶段快照或伪造重试。

**Primary Source Hints:**
- PRD: 支持人员按任务链路定位问题、按条件检索、返回问题列表相关要求。
- Architecture: `app/api/analysis/support/search/route.ts`、Minimal RBAC、summary-first 结果、reason 元数据与审计约束。

**Acceptance Criteria:**

**Given** 支持角色已通过授权校验
**When** 发起任务链路检索
**Then** 系统支持按任务 ID、时间范围和异常类型搜索
**And** 单次检索结果最多返回 100 条记录，且请求必须记录明确的排障原因元数据

**Given** 支持人员查看某条任务链路
**When** 系统返回搜索结果
**Then** 返回对应阶段输出、版本信息和 QA 问题列表
**And** 返回内容遵守支持链路的授权与审计边界

**Given** 支持人员接到排障请求
**When** 使用任务 ID、时间范围或异常类型进行检索
**Then** 支持人员可在 5 分钟内定位问题处于分析、编译或 QA 阶段
**And** 搜索结果默认优先返回摘要，并提供进入详细阶段快照的受控入口

### Story 5.4: 聚合模板复用与版本质量趋势指标

As a 产品负责人,
I want 查看模板复用率、编辑率、采纳率和版本质量趋势,
So that 我可以判断当前链路是否真正提升了用户价值和风格迁移质量。

**Dependencies:** 依赖 Story 5.1 记录模板复用事件，依赖 Story 5.0 和 Story 5.2 提供任务结果与版本维度数据。

**Technical Constraints:**
- 分析面板只消费聚合数据，不直接读取任务明细 JSONB 或阶段快照原始对象。
- 指标口径必须与 PRD 保持一致，仅展示已有埋点和反馈链路可稳定计算的数据。
- 趋势能力需要支持按日聚合和按版本窗口比较，但不应越界承担任务明细回放职责。

**Primary Source Hints:**
- PRD: 模板复用率、编辑率、采纳率、满意率、迁移成功率和端到端时延趋势需求。
- Architecture: `features/analytics/*` 只消费聚合数据、`template_reuse_events` 数据边界、Epic 5 feature mapping。

**Acceptance Criteria:**

**Given** 系统持续记录模板使用和任务反馈事件
**When** 产品负责人查看分析面板
**Then** 系统按日或周聚合模板复用率、二次编辑率和模板采纳率
**And** 支持最近 7 天与最近 30 天窗口

**Given** 产品负责人查看版本质量趋势
**When** 系统生成趋势视图
**Then** 至少展示采纳率、满意率、迁移成功率和端到端时延
**And** 仅展示已有埋点和反馈链路可稳定计算、且与 PRD 口径一致的指标，并支持按日聚合和按版本窗口比较

## Epic 6: 将分析结果安全发布为公开内容页

系统可以把已批准公开的分析结果安全投影为可索引的内容站页面，对外展示标题、摘要、关键风格块和工具回流入口。

### Story 6.1: 生成公开结果投影并执行字段白名单控制

As a 系统,
I want 将已批准公开的分析结果转换为公共结果投影,
So that 内容站页面可以安全复用分析结果而不暴露内部调试信息。

**Dependencies:** 依赖 Story 5.0 已生成规范化最终结果；依赖公开发布审批或允许公开展示标记已经存在。

**Technical Constraints:**
- 公开结果必须通过专用 `public-result-projector` 生成，不能直接复用内部结果对象或阶段快照。
- 公共结果构建必须采用 allowlist，而不是删字段式过滤。
- 禁止公开 `input_payload`、`analysis_stage_snapshots`、完整 `qa_report.issues/fixes`、内部错误详情、支持排障字段与审计字段。

**Primary Source Hints:**
- PRD: 已批准公开结果生成内容站页面、展示字段范围、工具回流要求。
- Architecture: ADR-03 Public Result Projection、allowlist projector、公开字段边界与禁止公开字段清单。

**Acceptance Criteria:**

**Given** 某个分析任务已被标记为允许公开展示
**When** 系统生成公开结果数据
**Then** 系统通过专用 public result projector 输出公开结果对象
**And** 输出仅包含白名单字段，如标题、摘要、关键风格块和 CTA 所需信息

**Given** 内部结果包含 QA 细节、阶段快照或原始输入载荷
**When** 系统生成公开投影
**Then** 这些内部字段不会出现在公开结果对象中
**And** 公开投影构建基于 allowlist，而不是删字段式过滤

### Story 6.2: 渲染可索引内容页并提供工具回流入口

As a 搜索用户,
I want 查看结构清晰、可索引的公开分析结果页,
So that 我能快速理解某个风格案例并进入工具主流程继续使用产品。

**Dependencies:** 依赖 Story 6.1 已输出公共结果投影；依赖内容站页面路由可以消费该投影模型。

**Technical Constraints:**
- 内容站页面只能消费 `public-result-projector` 输出，不访问内部回放对象或任务明细 JSONB。
- 页面渲染必须采用适合索引的方式，并保持标题层级、摘要块、关键风格块与 CTA 结构稳定。
- 公开内容页与工具页可以复用同一核心分析结果，但呈现层与 projector 责任必须分离。

**Primary Source Hints:**
- PRD: 内容站页面展示标题、摘要、关键风格块和工具回流入口的需求。
- Architecture: 内容站公开页面边界、SEO/索引承载方式、public-result-projector 消费约束。

**Acceptance Criteria:**

**Given** 某个任务已生成公开结果投影
**When** 用户访问公开内容页
**Then** 页面展示标题、摘要、关键风格块和工具回流入口
**And** 页面内容与工具内核心分析结果保持一致但不暴露内部字段

**Given** 搜索引擎或用户访问内容页
**When** 页面渲染
**Then** 页面采用适合索引的渲染方式，并输出稳定的标题层级、摘要块、关键风格块和可访问链接结构
**And** 不要求用户登录即可查看公开内容，但进入工具主流程时可按现有平台规则处理
