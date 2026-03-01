---
stepsCompleted: ["1", "2", "3", "4", "5", "6", "7", "8"]
inputDocuments:
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/product-brief-image_analyzer-2026-01-30.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design-specification.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/epics.md
  - /Users/muchao/code/image_analyzer/docs/image-to-style-prompt-agent.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-01'
project_name: 'image_analyzer'
user_name: 'Muchao'
date: '2026-03-01'
---

# Architecture Decision Document - image_analyzer

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

当前需求已从“通用图片分析平台”收敛为“图片到风格提示词的结构化编译链路升级”。从架构视角可拆分为 6 个核心能力域：

| 能力域 | 核心职责 | 架构含义 |
|--------|----------|----------|
| 分析任务输入与客观勘验 | 单图上传、任务初始化、状态可见、输出 `objective_description` | 需要异步任务编排、状态轮询与结构化勘验产物 |
| 风格指纹与变量控制 | 输出 `style_fingerprint`、`locked_style_constants`、`user_variables` | 需要稳定的 IR 建模与变量边界定义 |
| Prompt 编译与多适配输出 | 输出通用模板、negative prompt、三类 Adapter 与三档强度 | 需要模型无关编译核心和 Adapter 扩展点 |
| QA 门禁与可复现性保障 | 校验字段完整性、语义冲突、可复现性不足，输出 `qa_report` | 需要规则引擎、门禁结果和修复建议机制 |
| 统一结果交付、回放与复用 | 最终 JSON 契约、阶段回放、模板保存、历史重载、质量观测 | 需要版本化存储、任务回放与可检索诊断能力 |
| 内容站结果消费 | 公开分析结果页、SEO 承接与工具回流 | 需要与工具链共享核心结果但允许不同渲染策略 |

**Non-Functional Requirements:**

- 端到端分析请求（上传完成到返回最终 JSON）P95 <= 45 秒
- 任务进度轮询更新间隔 <= 2 秒
- 结果页关键交互（切换适配表达、切换强度、复制结果）响应 <= 200ms
- 任务数据与结果数据传输必须使用 TLS 加密
- 任务回放数据必须受鉴权控制，用户仅可访问自身任务，支持角色具备受控查询权限
- 输出与日志记录必须避免泄露敏感凭据和密钥
- 在用户规模增长 10x 的情况下，主分析链路可通过横向扩展保持稳定
- 必须支持多模型 Adapter 并行扩展，且不破坏 IR 主契约
- 外部模型波动时，可在不改变主链路的前提下切换或回滚 Adapter 版本
- 维持 WCAG 2.1 AA，并保证上传、查看结果、复制导出、重试可通过键盘完成
- 每个任务必须可回放，并关联阶段级输入输出、`schema_version` 与 `prompt_version`

### Scale & Complexity

- Primary domain: brownfield web application enhancement
- Complexity level: medium
- Architectural shape: SPA 主流程 + 内容站分发 + 异步分析流水线
- Estimated architectural components: Upload & Task Intake、Analysis Orchestrator、Forensic Describer、Style Fingerprinter、Prompt Compiler、QA Critic、Result Assembly & Versioning、Template Library & History Replay、Support Diagnostics、Content Renderer

项目复杂度不在页面规模，而在结构化链路的一致性控制：

- 必须维持统一 IR 契约
- 必须支持阶段化回放与审计
- 必须通过 Adapter 机制吸收模型差异
- 必须通过 QA 门禁兜住质量与可复现性

### Technical Constraints & Dependencies

- 分析主链路必须遵循统一 IR 契约：
  `objective_description -> style_fingerprint -> controls -> prompt_outputs -> qa_report`
- 禁止绕过结构化输出直接生成最终提示词
- 新模型接入必须通过 Adapter 层完成，禁止破坏 IR 主契约
- 必须兼容现有图片上传、模板管理、历史记录与平台鉴权能力
- 新增字段需向后兼容历史数据读取
- 任务级日志必须关联 `schema_version` 与 `prompt_version`
- 内容站与工具站共享核心分析结果，但允许采用不同渲染策略（SSR/静态化 vs SPA）

### Cross-Cutting Concerns

- 任务编排与状态机一致性
- 阶段化输出存储与版本追踪
- QA 规则门禁与冲突检测
- 模型适配层隔离
- 模板复用与变量替换安全边界
- 任务回放与支持检索权限控制
- 内容站结果脱敏与公开发布边界
- 指标埋点：采纳率、满意率、编辑率、迁移成功率、时延

---

## Starter Template Evaluation

### Primary Technology Domain

**Brownfield Next.js Web Application Enhancement** - 基于项目需求分析，本项目是在现有 Next.js App Router 应用上增强图片分析链路，而不是重新搭建一个新的 SaaS 平台。

### Starter Options Considered

| Starter / Approach | 类型 | 优点 | 对本项目的限制 |
|-------------------|------|------|----------------|
| **Retain existing create-next-app foundation** | Brownfield continuation | 与当前仓库现实一致、迁移风险最低、保留既有路由/API/鉴权/数据模式 | 需要显式补全文档化约束，而不是依赖新脚手架替我们做决定 |
| **create-next-app** | 官方 CLI | 官方维护、App Router + TypeScript + Tailwind + ESLint 基线、低意见化 | 适合作为参考基线，但不应对现有仓库重新执行初始化 |
| **create-t3-app** | 意见化全栈 starter | 强类型、安全默认值较多、Drizzle/NextAuth 选项成熟 | 更适合 greenfield，迁入现有项目会引入额外结构重组与决策噪音 |
| **next-forge** | SaaS/monorepo starter | SaaS 基础设施丰富、适合多应用场景 | 对当前“分析链路升级”范围明显过重，偏离 MVP 收敛方向 |

### Selected Starter: Retain Existing create-next-app Foundation

**参考初始化命令：**

```bash
npx create-next-app@latest image_analyzer \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir
```

> 注：该命令仅作为现有项目的官方基线参考，不应重新对当前仓库执行。

**理由：**

1. **尊重 brownfield 现实**：当前仓库已经是可运行的 Next.js App Router 应用，重跑脚手架只会制造结构性噪音
2. **范围收敛**：最新 PRD 聚焦图片分析链路升级，而不是平台级基础设施重建
3. **低迁移风险**：保留现有页面、API Route、鉴权与数据访问模式，有利于将精力集中在 IR、Adapter、QA 与回放能力
4. **官方基线仍然成立**：当前代码库本质上仍然延续 `create-next-app` 的官方项目形态，便于后续按官方演进路径升级

**现有基座已经提供的架构决策：**

| 决策领域 | 选择 | 说明 |
|---------|------|------|
| **语言** | TypeScript | 现有仓库已经是 TypeScript-first |
| **框架** | Next.js App Router | 当前代码库已使用 `src/app` 结构 |
| **渲染策略** | SPA 主流程 + SSR/静态化内容页 | 与 PRD 的“工具体验 + 内容获客”双轨模式一致 |
| **样式** | Tailwind CSS 基线 + 扩展 UI 层 | 当前项目可在此基础上叠加设计系统 |
| **代码组织** | `src/` 目录结构 | 便于在现有工程内增量引入分析流水线模块 |
| **测试** | 仓库已扩展为 Vitest + Playwright | 不作为脚手架重决策项，而是沿用现有测试基线 |
| **代码规范** | ESLint + Prettier | 当前仓库已有相关脚本与约束 |
| **构建工具** | 官方 Next.js CLI 流程 | 保持与现有工程一致，除非性能证据要求调整 |

**架构含义：**

后续架构设计应把当前 Next.js 应用视为宿主平台，并把新的 IR 流水线、QA 门禁、任务回放和内容结果页作为宿主平台内的领域模块与服务扩展，而不是新建一个平行系统。

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- 采用“任务中心 + 阶段快照”的数据模型，作为 IR 链路唯一事实源
- 以 Zod 4 为统一契约校验层，约束各阶段输入输出与最终 JSON 产物
- 采用数据库驱动的异步任务状态机，而不是在请求内同步跑完整链路
- 明确区分两类 Adapter：
  - Analysis Provider Adapter：调用分析模型/服务
  - Prompt Output Adapter：把 IR 编译为 Natural Language / Tag Stack / Short Command
- 将现有平台鉴权作为宿主能力继承，不在本次 PRD 中重做认证/计费体系

**Important Decisions (Shape Architecture):**
- API 继续采用 Next.js Route Handlers + REST 风格 + 统一 `{ success, data|error }` 响应
- 前端继续以 SPA 为主流程，内容站结果页采用 SSR/静态化承载 SEO
- React Query 负责任务状态、结果拉取与轮询；Zustand 仅承担局部 UI/workspace 状态
- 结果存储采用 PostgreSQL + JSONB 为主，R2 用于图片与导出工件存储
- QA Critic 作为强制门禁阶段，而不是可选后处理

**Deferred Decisions (Post-MVP):**
- Redis / 外部消息队列
- WebSocket / SSE 实时推送
- 多图联合风格分析
- 更广泛的模型专用 Adapter 深度适配
- 自动规则学习与模板效果闭环优化

### Data Architecture

| 决策 | 选择 | 版本/规格 | 说明 |
|------|------|----------|------|
| **主数据库** | PostgreSQL | 当前仓库基线 | 继续作为任务、模板、历史、回放与指标的主存储 |
| **ORM** | Drizzle ORM | 当前仓库 `^0.45.1` | 保持轻量、类型安全、与现有代码一致 |
| **契约验证** | Zod | 当前仓库 `^4.3.6` | 用于阶段 schema、最终 JSON schema、API payload 校验 |
| **对象存储** | Cloudflare R2 | 当前平台基线 | 继续存储上传图片、导出结果与可能的调试附件 |
| **结果建模方式** | Task-centric + JSONB snapshots | 新增架构决策 | 阶段产物以 JSONB 快照持久化，不再把新 IR 强塞进旧 `analysisData.dimensions` 结构 |

**核心数据建模决策：**
- 现有 `analysis_results.analysis_data` 主要服务旧版四维风格分析，不适合作为新 IR 的主契约
- 新链路应以“分析任务”为中心建模，至少包含：
  - `analysis_tasks`：任务主记录、状态、用户、图片、目标模型、版本号、摘要结果
  - `analysis_stage_snapshots`：阶段输入输出快照，如 `objective_description`、`style_fingerprint`、`controls`、`prompt_outputs`、`qa_report`
  - `analysis_retries` 或等价重试记录：重试原因、来源阶段、修复建议引用
  - `template_reuse_events`：模板复用、导出、采纳、满意度等事件
- `schema_version` 与 `prompt_version` 必须作为一等字段记录在任务级，而不是埋入非结构化备注中
- 现有历史/模板/分析表可以保留兼容层，但新主链路不得继续以旧 `dimensions` 结构作为核心真相来源

**缓存策略：**
- 服务端不引入 Redis 作为 MVP 前提
- 客户端状态缓存依赖 TanStack Query
- 对任务状态类接口采用短周期轮询，不做激进服务端缓存

### Authentication & Security

| 决策 | 选择 | 版本/规格 | 说明 |
|------|------|----------|------|
| **认证宿主能力** | Auth.js for Next.js (`next-auth`) | 当前仓库 `^5.0.0-beta.30` 基线 | 继续沿用现有平台鉴权，不在本次需求中重做 |
| **数据库适配** | `@auth/drizzle-adapter` | 当前仓库 `^1.11.1` | 与现有用户/会话表结构兼容 |
| **授权模型** | User-owned tasks + controlled support access | 新增架构决策 | 普通用户仅访问自身任务；支持角色按受控查询能力访问回放 |
| **传输安全** | TLS | 平台要求 | 所有任务与结果数据传输必须加密 |
| **静态数据保护** | 依赖托管存储加密 + 最小化敏感日志 | 平台策略 | 不在日志、导出、快照中泄露密钥与敏感凭据 |

**安全边界决策：**
- 本次需求不重新设计登录、订阅、Credit、计费
- 支持排障链路必须与普通用户链路分权：
  - 用户：仅访问自己的任务、模板、回放
  - 支持角色：可按任务 ID / 时间范围 / 异常类型检索，但需可审计
- 阶段快照允许保存模型输出，但必须避免原样记录密钥、签名头、受保护内部凭据
- 内容站公开结果页不得暴露调试字段、内部问题列表、原始链路快照

### API & Communication Patterns

| 决策 | 选择 | 版本/规格 | 说明 |
|------|------|----------|------|
| **API 风格** | REST over Next.js Route Handlers | 现有宿主模式 | 与当前 `src/app/api/**` 结构保持一致 |
| **响应契约** | `{ success, data|error }` | 现有项目规范 | 沿用 `src/lib/api/response.ts` 的统一包装 |
| **任务执行模型** | Async task state machine | 新增架构决策 | 创建任务立即返回，后续通过轮询获取状态与结果 |
| **进度通信** | Polling | PRD 要求 | MVP 不引入 WebSocket/SSE |
| **外部模型集成** | Provider interface + adapters | 现有代码基线扩展 | 调用分析模型时通过 provider router 隔离实现差异 |

**关键通信决策：**
- `POST /api/analysis` 负责创建任务，不负责同步返回完整分析结果
- `GET /api/analysis/[id]/status` 返回阶段、进度、可恢复操作
- `GET /api/analysis/[id]` 返回最终统一 JSON 结果与展示所需摘要
- 回放与支持检索接口应与用户主查询分离，避免调试字段和面向用户的数据模型耦合
- QA Critic 输出必须进入标准结果对象，不允许前端自行拼装“伪 QA 结论”

**关于 Adapter 的命名澄清：**
- `Provider Adapter`：面向“谁来执行分析/生成”
- `Prompt Output Adapter`：面向“结果要编译成什么表达形式”
- 两者必须在代码命名、目录结构和文档中严格区分，避免实现混淆

### Frontend Architecture

| 决策 | 选择 | 版本/规格 | 说明 |
|------|------|----------|------|
| **宿主前端** | Next.js App Router + React | 当前仓库 `next 16.1.6`, `react 19.2.3` | 继续沿用现有应用外壳 |
| **服务端状态** | TanStack Query | 当前仓库 `^5.90.20` | 负责任务状态轮询、结果读取、历史刷新 |
| **局部 UI 状态** | Zustand | 当前仓库 `^5.0.11` | 仅用于编辑器/UI 局部状态，不承载任务真相状态 |
| **表单与输入** | React Hook Form + Zod | 当前仓库 `^7.71.1` + `^4.3.6` | 适合分析请求参数与变量替换表单 |
| **结果承载方式** | 单一规范化结果对象 + 客户端切换视图 | 新增架构决策 | 同一 payload 支撑不同 Adapter/强度切换，不重复请求不同格式 |

**前端边界决策：**
- SPA 主流程继续承载上传、分析、变量替换、复制/导出、重试
- 结果页不应把每种 Adapter/强度作为独立后端资源；应基于同一 `prompt_outputs` 结果切换展示
- 历史重载应恢复：
  - 原始任务摘要
  - 结构化产物
  - 模板选择
  - 变量替换上下文
- 内容站页面只消费公开可发布的结果投影，不直接消费内部完整回放对象

### Infrastructure & Deployment

| 决策 | 选择 | 版本/规格 | 说明 |
|------|------|----------|------|
| **应用宿主** | Vercel-compatible Next.js deployment | 当前平台方向 | 与现有 Next.js 工程和内容站形态一致 |
| **数据库** | Managed PostgreSQL | 当前平台基线 | 持久化任务、模板、历史、版本与回放索引 |
| **文件存储** | Cloudflare R2 | 当前平台基线 | 图片与导出物存储 |
| **模型调用** | Replicate SDK + provider abstraction | 当前仓库 `replicate ^1.4.0` | 继续支持现有调用方式，并为后续 provider 扩展留口 |
| **运行编排** | DB-backed orchestration + webhook/cron-friendly resumption | 新增架构决策 | 不要求 MVP 上 Redis/队列基础设施 |

#### 开发环境数据库管理

**开发阶段使用 Docker 管理 PostgreSQL：**

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: image_analyzer_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: image_analyzer
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 可选：pgAdmin 用于数据库管理
  pgadmin:
    image: dpage/pgadmin8:latest
    container_name: image_analyzer_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@localhost
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

**启动命令：**

```bash
# 启动数据库
docker-compose up -d

# 停止数据库
docker-compose down

# 停止并删除数据卷（慎用！会删除所有数据）
docker-compose down -v
```

**开发环境变量配置（.env.local）：**

```bash
# 数据库连接（Docker 本地实例）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/image_analyzer?schema=public"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Replicate API
REPLICATE_API_TOKEN="your-replicate-token"

# Cloudflare R2
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_ACCOUNT_ID="your-r2-account-id"
R2_BUCKET_NAME="your-r2-bucket"

# Creem Payment
CREEM_API_KEY="your-creem-api-key"
CREEM_WEBHOOK_SECRET="your-creem-webhook-secret"
```

**运行时决策：**

- 任务编排以数据库状态推进为核心，不把完整流程绑死在单次 Node 请求生命周期中
- 对外部模型的异步完成，可继续兼容 webhook / polling / cron 检查等宿主可用机制
- 日志和监控必须带上：
  - `task_id`
  - `stage`
  - `schema_version`
  - `prompt_version`
  - `provider`
  - `adapter_type`
- 如果单个 provider 波动，应优先通过 provider 层回滚或切换，而不是修改 IR 主链路

**数据库连接池配置（生产环境）：**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // 生产环境连接池配置
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
```

### Decision Impact Analysis

**Implementation Sequence:**

1. 建立任务中心数据模型与阶段 schema
2. 搭建 Orchestrator 与阶段接口
3. 实现 Forensic Describer 输出 `objective_description`
4. 实现 Style Fingerprinter 与 `controls`
5. 实现 Prompt Compiler 与三类 Prompt Output Adapter
6. 实现 QA Critic 与统一结果组装
7. 接入历史重载、模板复用、回放检索与内容站投影

**Cross-Component Dependencies:**

- Task state machine 依赖新的任务中心数据模型
- QA Critic 依赖前面所有阶段的结构化产物稳定输出
- 历史重载、支持排障、趋势观测都依赖阶段快照与版本字段完整记录
- 内容站结果页依赖统一结果对象的公开投影，而不是额外生成一套内容模型

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 7 major areas where AI agents could make incompatible choices

1. IR field naming and schema ownership
2. Task/stage status vocabulary
3. Provider Adapter vs Prompt Output Adapter boundary
4. Snapshot persistence and version tracking
5. API result projection vs internal replay payload
6. Retry / recovery / QA issue modeling
7. Frontend query state vs local editor state ownership

### Naming Patterns

| 类别 | 规则 | 示例 |
|------|------|------|
| **数据库表** | `snake_case` 复数，保留 Auth.js 适配表例外 | `analysis_tasks`, `analysis_stage_snapshots`, `template_reuse_events` |
| **数据库列** | `snake_case` | `schema_version`, `prompt_version`, `stage_status` |
| **IR JSON 字段** | 顶层与嵌套字段统一使用 `snake_case` | `objective_description`, `style_fingerprint`, `locked_style_constants` |
| **API 请求/响应 TS 字段** | 与 IR 保持一致，不做 camelCase 二次映射 | `qa_report.issues`, `prompt_outputs.adapters` |
| **React 组件** | `PascalCase` | `AnalysisWorkspace`, `QaReportPanel` |
| **函数/变量** | `camelCase` | `buildTaskResult`, `currentStageStatus` |
| **文件名** | `kebab-case` | `qa-critic.ts`, `analysis-task-service.ts` |
| **目录名** | 领域优先，`kebab-case` | `prompt-output-adapters/`, `stage-snapshots/` |
| **常量** | `UPPER_SNAKE_CASE` | `TERMINAL_TASK_STATUSES`, `MAX_RETRY_COUNT` |

**强制命名规则：**
- IR 契约字段禁止 camelCase / PascalCase 变体
- `provider` 只表示模型或服务提供方，如 `replicate`, `aliyun`
- `adapter_type` 只表示输出形式，如 `natural_language`, `tag_stack`, `short_command`
- 不允许用 `adapter` 同时指代 provider 和 prompt output adapter

### Structure Patterns

| 类别 | 规则 |
|------|------|
| **宿主分层** | `app/api` 负责 HTTP 边界，领域逻辑下沉到 `src/lib` 或 `src/features` |
| **IR 领域模块** | 统一放在 `src/lib/analysis-ir/` 或等价单一领域目录，不散落到旧分析模块 |
| **阶段实现** | 每个阶段一个独立模块：`forensic-describer`, `style-fingerprinter`, `prompt-compiler`, `qa-critic` |
| **Provider Adapter** | 放在 `src/lib/providers/analysis/` 或等价路径 |
| **Prompt Output Adapter** | 放在 `src/lib/prompt-output-adapters/` 或等价路径 |
| **任务编排** | 统一放在 `src/lib/analysis-tasks/` 或等价路径 |
| **数据库访问** | 通过领域 service/repository 封装，不在 Route Handler 中直接拼复杂业务流程 |
| **测试文件** | 单元测试与模块同目录，集成测试放 `src/app/api/**` 或专门 integration 目录 |
| **公开结果投影** | 与内部回放对象分离，单独维护 result presenter / projector |

**结构边界规则：**
- Route Handler 不直接调用多个底层 provider 并组装最终 IR
- QA Critic 不直接修改前置阶段产物，只输出 issues / fixes / pass verdict
- 内容站页面禁止直接消费内部 stage snapshot 全量对象
- 历史重载读取的是“规范化任务结果视图”，不是任意拼接旧表字段

### Format Patterns

**统一最终结果格式：**

```typescript
interface AnalysisTaskResult {
  schema_version: string;
  prompt_version: string;
  task_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'partial';
  objective_description: ObjectiveDescription;
  style_fingerprint: StyleFingerprint;
  controls: Controls;
  prompt_outputs: PromptOutputs;
  qa_report: QaReport;
}
```

**统一阶段快照格式：**

```typescript
interface AnalysisStageSnapshot<TInput = unknown, TOutput = unknown> {
  task_id: string;
  stage_name:
    | 'forensic_describer'
    | 'style_fingerprinter'
    | 'prompt_compiler'
    | 'qa_critic';
  stage_status: 'queued' | 'running' | 'completed' | 'failed' | 'skipped';
  schema_version: string;
  prompt_version: string | null;
  input_payload: TInput | null;
  output_payload: TOutput | null;
  error_payload: StageErrorPayload | null;
  started_at: string | null;
  completed_at: string | null;
}
```

**QA 报告格式：**

```typescript
interface QaReport {
  verdict: 'pass' | 'warn' | 'fail';
  issues: QaIssue[];
  fixes: QaFix[];
  confidence: {
    overall: number;
    uncertain_fields: string[];
  };
}

interface QaIssue {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  related_fields: string[];
}

interface QaFix {
  code: string;
  action: string;
  target_fields: string[];
}
```

**API 错误格式：**
- 继续使用统一 `{ success: false, error: { code, message, details? } }`
- `details` 中可包含 `task_id`, `stage`, `retryable`, `missing_fields`
- 错误码必须机器可读，如 `INVALID_IR_SCHEMA`, `QA_CONFLICT_DETECTED`, `TASK_NOT_FOUND`

### Communication Patterns

**任务状态词汇表：**
- `queued`: 已入队，尚未开始
- `running`: 正在执行某阶段
- `completed`: 全链路完成且可交付
- `failed`: 终态失败
- `partial`: 有可展示结果但存在失败或降级

**阶段状态词汇表：**
- `queued`
- `running`
- `completed`
- `failed`
- `skipped`

**前后端交互规则：**
- 创建任务接口只返回任务受理结果，不返回伪最终结果
- 状态接口只返回当前状态、当前阶段、进度、可恢复动作
- 结果接口只在终态或允许部分展示时返回规范化结果对象
- 回放接口返回内部调试视图，必须单独授权

**Query Key 规则：**
- `['analysis-task', taskId]`
- `['analysis-task-status', taskId]`
- `['analysis-task-replay', taskId]`
- `['template-library', userId, filters]`

### Process Patterns

**编排规则：**
1. Upload 完成后创建任务主记录
2. Orchestrator 依次推进阶段
3. 每阶段开始前写入 `running` 快照
4. 每阶段完成后写入 `completed` / `failed` 快照
5. QA Critic 完成后组装最终结果视图
6. 终态后才允许内容站投影与模板复用事件落库

**重试规则：**
- 重试必须显式记录触发来源：`user_retry`, `support_retry`, `system_retry`
- 重试必须关联原任务或原阶段
- 不允许无痕覆盖旧快照；必须保留原链路用于回放

**变量替换规则：**
- 只允许替换 `user_variables`
- 不允许直接编辑 `locked_style_constants`
- 前端变量编辑器提交前要做 Zod 校验与字段白名单校验

**内容站发布规则：**
- 只发布公开投影字段：标题、摘要、关键风格块、CTA、必要结构化数据
- 不发布 `issues`, `fixes`, 原始 `input_payload`, 内部错误细节
- 内容站结果必须可追溯到同一个 `task_id`，但不暴露内部调试视图

### Enforcement Guidelines

**All AI Agents MUST:**

- 使用 `snake_case` 作为 IR 契约字段唯一命名方式
- 严格区分 `provider` 与 `adapter_type`
- 通过阶段快照记录每个阶段输入输出，禁止只保留最终结果
- 在 Route Handler 中调用 service/orchestrator，不直接拼完整业务流程
- 使用统一状态词汇表，不得自行发明平行状态枚举
- 使用统一 QA issue/fix 结构，不得按页面需求临时塑形
- 区分“公开结果投影”和“内部回放对象”，不得混用

**Pattern Enforcement:**

- Zod schema 作为 IR、QA、API payload 的唯一运行时契约
- TypeScript 类型从 schema 推导，避免手写并漂移
- ESLint / review checklist 强制检查 `snake_case` IR 字段和 adapter 命名
- 架构文档作为实现前的唯一决策基线

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
image_analyzer/
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── public/
├── docs/
│   └── image-to-style-prompt-agent.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── analysis/
│   │   │   └── page.tsx
│   │   ├── analyze/
│   │   │   └── results/[id]/page.tsx
│   │   ├── history/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── library/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── error/page.tsx
│   │   └── api/
│   │       ├── analysis/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   ├── [id]/status/route.ts
│   │       │   ├── [id]/feedback/route.ts
│   │       │   ├── replay/[id]/route.ts
│   │       │   └── support/search/route.ts
│   │       ├── templates/
│   │       ├── history/
│   │       ├── upload/
│   │       ├── auth/
│   │       ├── analytics/
│   │       ├── webhooks/
│   │       └── cron/
│   ├── features/
│   │   ├── analysis/
│   │   │   ├── components/
│   │   │   │   ├── ImageUploader/
│   │   │   │   ├── TaskStatusPanel/
│   │   │   │   ├── ResultWorkspace/
│   │   │   │   ├── QaReportPanel/
│   │   │   │   ├── PromptOutputsPanel/
│   │   │   │   └── VariableEditor/
│   │   │   ├── hooks/
│   │   │   │   ├── use-analysis-task.ts
│   │   │   │   ├── use-analysis-task-status.ts
│   │   │   │   └── use-analysis-replay.ts
│   │   │   ├── lib/
│   │   │   │   └── result-presenter.ts
│   │   │   └── types/
│   │   ├── templates/
│   │   ├── history/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── generation/
│   │   └── upload/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── r2/
│   │   ├── analysis-ir/
│   │   │   ├── schemas/
│   │   │   │   ├── objective-description.schema.ts
│   │   │   │   ├── style-fingerprint.schema.ts
│   │   │   │   ├── controls.schema.ts
│   │   │   │   ├── prompt-outputs.schema.ts
│   │   │   │   ├── qa-report.schema.ts
│   │   │   │   └── analysis-task-result.schema.ts
│   │   │   ├── stages/
│   │   │   │   ├── forensic-describer.ts
│   │   │   │   ├── style-fingerprinter.ts
│   │   │   │   ├── prompt-compiler.ts
│   │   │   │   └── qa-critic.ts
│   │   │   ├── prompt-output-adapters/
│   │   │   │   ├── natural-language.ts
│   │   │   │   ├── tag-stack.ts
│   │   │   │   └── short-command.ts
│   │   │   ├── presenters/
│   │   │   │   ├── public-result-projector.ts
│   │   │   │   ├── workspace-result-projector.ts
│   │   │   │   └── replay-projector.ts
│   │   │   └── constants/
│   │   ├── analysis-tasks/
│   │   │   ├── orchestrator.ts
│   │   │   ├── task-service.ts
│   │   │   ├── task-repository.ts
│   │   │   ├── stage-snapshot-service.ts
│   │   │   ├── retry-service.ts
│   │   │   └── status-mapper.ts
│   │   ├── providers/
│   │   │   └── analysis/
│   │   │       ├── interface.ts
│   │   │       ├── router.ts
│   │   │       ├── replicate.ts
│   │   │       └── aliyun-bailian.ts
│   │   ├── moderation/
│   │   ├── privacy/
│   │   ├── creem/
│   │   └── utils/
│   ├── providers/
│   ├── stores/
│   ├── types/
│   └── middleware.ts
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
└── _bmad-output/
```

### Architectural Boundaries

**API Boundaries:**
- `src/app/api/upload/*`
  - 只负责图片上传、基础校验、R2 持久化
  - 不负责执行完整分析链路
- `src/app/api/analysis/route.ts`
  - 唯一任务创建入口
  - 写入任务主记录并启动 orchestrator
- `src/app/api/analysis/[id]/status/route.ts`
  - 只返回状态、阶段、进度、可恢复动作
- `src/app/api/analysis/[id]/route.ts`
  - 返回规范化结果对象
- `src/app/api/analysis/replay/[id]/route.ts`
  - 返回内部回放视图，必须受更严格授权控制
- `src/app/api/analysis/support/search/route.ts`
  - 面向支持排障，不得复用普通用户结果接口
- `src/app/api/templates/*`
  - 只处理模板保存、复用、导出、收藏与变体操作
- `src/app/api/history/*`
  - 只处理任务历史列表、详情、复用入口
- `src/app/api/webhooks/*`
  - 只处理外部异步回调，不直接面向最终用户 UI

**Component Boundaries:**
- `features/analysis/components/*`
  - 承载上传、进度、结果工作区、QA 展示、变量替换
  - 不直接调用 provider SDK
- `features/templates/*`
  - 承载模板编辑、模板库、导出
  - 只消费规范化 `prompt_outputs` 和模板视图模型
- `features/history/*`
  - 承载历史列表、历史详情、历史复用
  - 不直接拼装 stage snapshots
- `features/analytics/*`
  - 承载指标与趋势展示
  - 只消费聚合数据，不读任务明细 JSONB
- `app/analyze/results/[id]/page.tsx`
  - 用户结果工作区页面
- 内容站公开页面
  - 只消费 `public-result-projector` 输出，不访问内部回放对象

**Service Boundaries:**
- `lib/analysis-tasks/*`
  - 任务生命周期、状态机、重试、阶段快照、最终结果组装
- `lib/analysis-ir/stages/*`
  - 各阶段纯业务逻辑
- `lib/providers/analysis/*`
  - 外部模型服务适配
- `lib/analysis-ir/prompt-output-adapters/*`
  - Prompt 输出表达适配
- `lib/db/*`
  - 底层数据库连接与 schema
- Route Handler 只能调用 service/orchestrator/repository，不直接跨多层组装流程

**Data Boundaries:**
- `analysis_tasks`
  - 任务主记录、任务状态、用户、图片、版本、摘要结果
- `analysis_stage_snapshots`
  - 阶段级输入输出、错误、时间戳
- `analysis_retries`
  - 重试链路与来源
- `template_reuse_events`
  - 复用、导出、采纳等事件
- 旧 `analysis_results`
  - 作为兼容层保留，不再作为新主链路唯一真相
- R2
  - 只保存图片、导出物、必要附件，不保存数据库主真相字段

### Feature to Structure Mapping

| Feature Module | Directory | Associated FRs |
|---------------|-----------|----------------|
| **Epic 1: 分析任务输入与结构化客观勘验** | `features/analysis`, `app/api/upload`, `app/api/analysis`, `lib/analysis-tasks`, `lib/analysis-ir/stages/forensic-describer.ts` | FR1-8, FR33-35 |
| **Epic 2: 风格指纹与变量控制层** | `lib/analysis-ir/stages/style-fingerprinter.ts`, `lib/analysis-ir/schemas`, `features/analysis/components/VariableEditor` | FR9-12, FR42-43 |
| **Epic 3: Prompt 编译与多适配输出** | `lib/analysis-ir/stages/prompt-compiler.ts`, `lib/analysis-ir/prompt-output-adapters`, `features/analysis/components/PromptOutputsPanel`, `features/templates` | FR13-19, FR37-40 |
| **Epic 4: QA 门禁与一致性保障** | `lib/analysis-ir/stages/qa-critic.ts`, `features/analysis/components/QaReportPanel`, `lib/analysis-tasks/retry-service.ts` | FR20-24, FR39 |
| **Epic 5: 结果交付、回放排障与运营观测** | `app/api/analysis/[id]`, `app/api/analysis/replay/[id]`, `app/api/analysis/support/search`, `features/history`, `features/analytics` | FR25-32, FR41 |
| **Epic 6: 内容站交付面** | 内容站页面 + `lib/analysis-ir/presenters/public-result-projector.ts` | FR36 |

### Integration Points

**Internal Communication:**
- Upload API -> Task Service -> Orchestrator
- Orchestrator -> Stage Modules -> Stage Snapshot Service
- Orchestrator -> Result Projector -> Result API / Content Projector
- React Query hooks -> Analysis / History / Template APIs
- Template actions -> Template Library Service -> DB + event tables

**External Integrations:**
- Analysis providers via `lib/providers/analysis/*`
- Cloudflare R2 via `lib/r2/*`
- Auth.js via `lib/auth/*`
- Existing billing/subscription via existing platform modules, not redefined in this architecture

**Boundary Guardrails:**
- 新 IR 流水线禁止继续向旧 `analysisData.dimensions` 回写作为主结果
- 内容站投影与内部回放对象必须由不同 projector 生成
- Provider adapter 不能直接产出最终用户展示对象
- Prompt output adapter 不能直接访问 HTTP request/response 或数据库连接

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- `Next.js App Router + Route Handlers + React Query + Zustand + Drizzle + PostgreSQL + R2` 组合兼容，无明显技术冲突
- “数据库驱动的异步任务状态机”与“轮询进度反馈”一致，符合 MVP 不引入 WebSocket/SSE 的约束
- `Provider Adapter` 与 `Prompt Output Adapter` 已清晰分离，避免了外部模型接入与输出表达适配的职责混叠
- 公开结果投影、内部回放对象、阶段快照三层边界明确，能同时满足用户展示、支持排障与内容站发布需求

**Pattern Consistency:**
- IR 契约统一使用 `snake_case`，与阶段快照、QA 报告、版本字段保持一致
- API 契约统一为 `{ success, data|error }`，与现有项目规范一致
- 状态词汇表（`queued/running/completed/failed/partial`）与阶段状态词汇表（含 `skipped`）已经标准化
- Zod 作为运行时 schema 基线，能支撑 API payload、IR 输出、QA 结果的一致校验

**Structure Alignment:**
- `analysis-ir`、`analysis-tasks`、`providers/analysis`、`presenters` 的新增结构与既有 `app/api`、`features/*` 分层兼容
- 新架构保留 brownfield 宿主结构，不要求重建平台基础设施
- Epic 到目录和接口的映射已清楚定义，具备实施可操作性

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- Epic 1 由上传、任务初始化、状态轮询与 `forensic-describer` 支撑
- Epic 2 由 `style-fingerprinter`、IR schemas 与变量编辑视图支撑
- Epic 3 由 `prompt-compiler`、Prompt Output Adapters、模板视图支撑
- Epic 4 由 `qa-critic`、QA 结果面板与重试服务支撑
- Epic 5 由结果 API、回放 API、支持检索、历史与分析模块支撑
- Epic 6 由公开结果投影器与内容站页面支撑

**Functional Requirements Coverage:**
- FR1-FR43 均有明确架构落点
- 高风险 FR，如统一 JSON 契约、阶段回放、版本记录、支持检索、公开内容页与稳定复现解释，均已有专门模块支撑
- 变量槽位、风格常量、QA issues/fixes、复制导出等跨模块需求已在数据模型与前端边界中体现

**Non-Functional Requirements Coverage:**
- NFR1-NFR3：通过异步任务、轮询、单一规范化结果对象与客户端切换视图支撑性能目标
- NFR4-NFR6：通过 TLS、鉴权、最小化敏感日志、公开/内部对象隔离支撑安全目标
- NFR7-NFR9：通过 DB-backed orchestration 与 Adapter 分层支撑扩展性与 provider 回滚
- NFR10-NFR11：通过现有 SPA 主流程与无障碍要求延续支撑
- NFR12-NFR17：通过 Zod schema、阶段快照、`schema_version`、`prompt_version`、回放与版本对比能力支撑一致性与可审计性

### Implementation Readiness Validation ✅

**Decision Completeness:**
- 关键决策已经聚焦于新 IR 主链路，而不是旧平台范围
- 技术栈、契约策略、任务模型、投影策略、Adapter 边界均已明确
- 绝大多数实现前置争议点已被消解

**Structure Completeness:**
- 宿主平台、领域模块、API 边界、服务边界、数据边界均已定义
- 新增目录足以承接本轮 PRD，而不必破坏现有工程主干
- Epic 与结构映射具备直接指导 story implementation 的作用

**Pattern Completeness:**
- 命名冲突、状态词汇冲突、适配器职责冲突、快照建模冲突、公开/内部对象混用风险都已被覆盖
- QA 结果格式、重试来源、变量替换边界、内容站发布规则已经标准化

### Gap Analysis Results

**Critical Gaps:** 0

**Important Gaps:**
- 仍需补充正式数据库 schema 设计稿，细化 `analysis_tasks`、`analysis_stage_snapshots`、`analysis_retries`、`template_reuse_events` 的字段级设计
- 支持角色的授权模型已定义边界，但尚未细化为具体角色来源、权限矩阵与审计要求
- `public-result-projector` 的公开字段白名单建议单独成文，降低内容站实现漂移与字段泄露风险

**Pre-mortem Risks Identified:**
- 若未明确新旧数据模型主从关系，实现阶段可能出现 `analysis_results` 与新任务中心表并行双写且真相来源不一致
- 若支持权限仅停留在概念层，`replay` 与 `support/search` 接口容易过度暴露内部链路数据
- 若未定义公开字段白名单，内容站实现可能直接复用内部结果对象，导致调试字段、QA 细节或输入快照泄露
- 若未把 Adapter 边界继续固化到代码与 schema 层，后续实现容易重新混淆 `provider` 与 `adapter_type`
- 若重试链路未强制保留失败快照与触发来源，任务回放、问题定位与版本比较能力会在实现阶段被弱化

**Preventive Actions:**
- 在正式开发前补一份任务中心数据表设计说明，明确主真相表、兼容层和迁移策略
- 在支持接口开发前补一份最小 RBAC / 审计规则说明
- 在内容站开发前补一份公开结果投影字段白名单
- 在 schema 与 lint/review checklist 中继续固化 `provider` / `adapter_type` 命名边界
- 在重试服务设计中要求保留失败快照、重试来源、版本号与关联任务链路

### Validation Issues Addressed

- 已消除旧架构文档中“内置生图、计费系统、平台级能力重建”与新 PRD 范围不一致的问题
- 已把旧 `analysis_results.analysis_data` 从主真相来源降级为兼容层定位
- 已明确 brownfield 宿主结构与新 IR 流水线之间的边界，避免后续实现继续散落在旧模块中

### Architecture Decision Addenda

**ADR-01: Task-Centric Data Model as Source of Truth**
- `analysis_tasks` + `analysis_stage_snapshots` 是新 IR 流水线的唯一主真相源
- `analysis_results` 保留为兼容层，不允许作为第二个可写真相源
- 如需兼容旧页面，只允许通过投影或桥接读取新结果，不允许反向约束新链路数据模型
- `analysis_tasks` 必须承担 `task_id`、`user_id`、`image_id`、`status`、`current_stage`、`schema_version`、`prompt_version` 与最终结果索引等核心职责
- `analysis_stage_snapshots` 必须以 `task_id + stage_name + attempt_no` 为唯一执行单元，且保持 append-only，不允许覆盖旧快照
- 如存在过渡期双写方案，必须被标记为临时迁移策略，并定义退役条件

**ADR-02: Minimal RBAC for Support Replay Access**
- 普通用户仅可访问自己的任务、模板、历史与结果
- 支持角色可访问 `replay` / `support/search`，但默认只读
- 支持访问必须记录审计日志，至少包含 `actor_id`、`task_id`、`action`、`timestamp`、`reason`
- `support/search` 默认返回摘要结果，不默认返回全量 payload
- `support_readonly` 不允许修改任务结果、阶段快照或伪造重试
- 如后续引入 `support_operator`，也仅允许受控触发重试，不允许直接编辑阶段输出

**ADR-03: Public Result Projection Must Use an Allowlist**
- 内容站公开结果必须仅通过 `public-result-projector` 生成
- 公共结果只允许输出白名单字段，不得直接暴露内部快照、原始输入、完整 QA 细节或调试字段
- 工具结果页、回放页、公开内容页必须由不同 projector 负责，禁止直接复用内部结果对象
- `public-result-projector` 必须基于 allowlist 构建，而不是对内部对象做删字段式过滤
- 明确禁止公开：`input_payload`、`analysis_stage_snapshots`、完整 `qa_report.issues/fixes`、内部错误详情、支持排障字段、审计字段

**Execution Constraints from ADRs**
- `analysis_stage_snapshots` must be append-only across attempts
- `support/search` returns summary-first results and requires explicit reason metadata
- `public-result-projector` must be built from an allowlist, never from subtractive field filtering

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] 项目上下文已重新分析
- [x] 规模与复杂度已重估
- [x] 技术约束已识别
- [x] 跨切面关注点已映射

**✅ Architectural Decisions**
- [x] 关键决策已记录
- [x] 技术栈已重新对齐
- [x] 集成模式已定义
- [x] 性能与安全考虑已纳入

**✅ Implementation Patterns**
- [x] 命名规范已建立
- [x] 结构模式已定义
- [x] 通信模式已指定
- [x] 过程模式已记录

**✅ Project Structure**
- [x] 完整目录结构已定义
- [x] 组件边界已建立
- [x] 集成点已映射
- [x] Epic 到结构映射已完成

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** 高

**Key Strengths:**
1. 架构已与最新 PRD 精确对齐，不再受旧平台范围干扰
2. 新 IR、Adapter、QA、Replay、Public Projection 五个关键能力边界已经明确
3. 对 AI agent 最容易冲突的实现点已做标准化，适合作为后续 story 开发基线

**Primary Follow-up Focus:**
- 优先产出新任务中心数据表设计
- 优先按 Epic 1 -> Epic 5 主链路实施
- 在正式开发前补一份公开结果投影字段白名单

### Implementation Handoff

**AI Agent Guidelines:**

- 遵循架构文档中的所有决策
- 在所有组件中一致使用实现模式
- 尊重项目结构和边界
- 不再以旧 `analysis_results.analysis_data` 作为新 IR 主链路真相来源
- 如有架构问题，请参考本文档

**First Implementation Priority:**

```text
1. 先落实任务中心数据表设计（analysis_tasks / analysis_stage_snapshots / analysis_retries / template_reuse_events）
2. 再补支持排障最小 RBAC / 审计规则
3. 再补 public-result-projector 白名单
4. 然后以 Epic 1 -> 2 -> 3 -> 4 -> 5 的顺序实现主链路
```

### Next Architecture Artifacts

**Completed Addendum:**
- 任务中心数据模型设计稿：`_bmad-output/planning-artifacts/analysis-task-data-model.md`

**Required Before Replay / Support / Public Result Implementation:**
- 支持排障最小 RBAC / 审计规则说明
- `public-result-projector` 公开字段白名单说明

**Recommended Consumption Order:**
1. 先阅读本文档的 `Core Architectural Decisions`、`Implementation Patterns & Consistency Rules`、`Project Structure & Boundaries`
2. 再阅读 `analysis-task-data-model.md`，落实数据库 schema 与迁移策略
3. 在开发 `replay` / `support/search` / 内容站结果页前，补齐 RBAC 与 public projection 两份补充设计

---

**文档版本:** 2.0
**最后更新:** 2026-03-01
**状态:** 已验证，可以实现
