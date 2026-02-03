---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/prd.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/architecture.md
  - /Users/muchao/code/image_analyzer/_bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'create-epics-and-stories'
project_name: 'image_analyzer'
user_name: 'Muchao'
date: '2026-02-02'
status: 'completed'
completedAt: '2026-02-03'
---

# image_analyzer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for image_analyzer, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**总数：79 个**

| 类别 | 数量 | FR编号 | 描述 |
|------|------|--------|------|
| 用户认证与管理 | 5 | FR1-5 | Google OAuth登录、Credit系统、账户管理 |
| 图片上传与输入管理 | 7 | FR6-12, FR67 | 拖拽/批量上传、验证、进度显示 |
| 风格分析与处理 | 8 | FR13-18, FR74, FR76 | 四维度分析、视觉模型集成 |
| 模版生成与编辑 | 7 | FR19-25, FR65 | JSON/变量模版、编辑、导出 |
| 图像生成集成 | 7 | FR26-32, FR72, FR73, FR82 | 生图模型、分享、奖励 |
| 历史记录与库管理 | 7 | FR33-40, FR69, FR70 | 临时历史、永久模版库、统计 |
| 订阅与计费管理 | 13 | FR42-49, FR80, FR81 | Credit系统、订阅等级、计费 |
| 性能与可靠性 | 2 | FR78-79 | 后台队列、队列透明化 |
| 合规与内容安全 | 7 | FR50-56 | 内容过滤、隐私合规、AI透明度 |
| 错误处理与用户支持 | 10 | FR57-64 | 错误信息、重试、教育、反馈 |
| 系统配置与扩展性 | 1 | FR68 | 管理员配置功能 |

**详细功能需求列表：**

FR1: 新用户可以通过 Google OAuth 登录创建账户
FR2: 系统在新用户首次登录时自动授予 30 credit
FR3: 用户可以在登录后查看其当前 credit 余额和订阅状态
FR4: 用户可以查看其基本账户信息
FR5: 用户可以主动删除其账户
FR6: 用户可以通过拖拽方式上传单张图片
FR7: 用户可以批量上传最多 5 张同风格图片进行综合分析
FR8: 系统可以验证上传图片的格式和大小
FR9: 系统可以检测不适合分析的图片
FR10: 系统可以显示上传进度
FR11: 用户可以取消正在进行的图片上传
FR12: 系统可以为复杂图片提供降级分析选项并标注置信度
FR13: 系统可以从上传的图片中提取四大维度的风格特征
FR14: 系统可以对多张同风格图片进行综合分析以提取共同特征
FR15: 系统可以在分析过程中显示实时进度和专业术语
FR16: 系统可以调用至少一个视觉模型提供商进行图片理解
FR17: 用户可以手动选择视觉模型提供商
FR18: 系统可以将风格特征组织成结构化的分析结果
FR19: 系统可以根据风格特征生成可编辑的变量模版
FR20: 系统可以生成 JSON 格式的模版供专业用户集成工作流
FR21: 系统可以在模版中清晰标记可替换的变量部分
FR22: 用户可以编辑生成的模版内容
FR23: 用户可以将模版复制到剪贴板
FR24: 用户可以导出 JSON 格式的模版文件
FR25: 系统可以调用文字模型提供商优化提示词
FR26: 用户可以基于编辑后的模版直接生成同风格图片
FR27: 系统可以调用至少一个生图模型提供商生成图片
FR28: 用户可以手动选择生图模型提供商
FR29: 用户可以查看生成的图片结果
FR30: 用户可以保存生成的图片到本地设备
FR31: 系统可以展示图片生成的进度状态
FR32: 用户可以将生成的图片分享到 X (Twitter)
FR33: 系统可以保存用户最近的 10 次分析记录
FR34: 用户可以浏览其历史分析记录
FR35: 用户可以查看历史记录中的分析结果和模版
FR36: 用户可以基于历史记录中的模版创建新的分析
FR37: 用户可以将分析生成的模版永久保存到个人模版库
FR38: 用户可以收藏/标记特定的模版以便快速访问
FR39: 用户可以基于收藏的模版一键重新生成图片
FR40: 用户可以为模版添加自定义标签或分类
FR42: 系统支持 Free 等级用户登录后自动获赠 30 credit
FR43: 系统支持多等级订阅（Lite, Standard）
FR44: 用户可以订阅 Lite 月度或年度计划
FR45: 用户可以订阅 Standard 月度或年度计划
FR46: 系统可以在分析成功后扣除相应的 credit
FR47: 用户可以在 credit 不足时收到升级提示
FR48: 系统可以跟踪用户的订阅状态和计费周期
FR49: 用户可以查看其 credit 充值和消费历史明细
FR50: 用户在上传图片前需确认拥有使用权利
FR51: 用户在首次使用时需同意服务条款
FR52: 系统可以检测并拒绝包含不当内容的图片上传
FR53: 系统可以检测并阻止生成包含不当内容的提示词
FR54: 系统可以在 UI 上清晰标注 AI 驱动的分析
FR55: 系统可以按照用户订阅等级自动删除过期的图片数据
FR56: 系统可以在用户删除账户时立即清除所有相关图片数据
FR57: 系统可以为上传失败提供友好的错误信息和可操作建议
FR58: 系统可以为分析失败提供友好的错误信息和可操作建议
FR59: 系统可以为图片生成失败提供友好的错误信息和可操作建议
FR60: 系统可以告知用户工具的最佳使用场景
FR61: 系统可以在 API 调用失败时进行自动重试
FR62: 系统可以在分析超时后停止轮询并提示用户
FR63: 系统可以显示上传进度
FR64: 系统可以显示图片生成进度
FR65: 用户可以在分析结果页面选择将特定模版保存到个人模版库
FR67: 系统可以在批量分析时显示整体进度
FR68: 管理员可以配置启用/禁用不同的模型提供商
FR69: 用户可以查看其使用模版生成的所有历史图片
FR70: 用户可以查看每个模版的使用次数统计
FR72: 用户首次分享生成的图片到社交媒体可获得 6 credit 奖励
FR73: 用户后续分享生成的图片到社交媒体每次可获得 2 credit 奖励
FR74: 用户可以对分析结果提供质量反馈
FR76: 系统可以在检测到低置信度分析时主动警告用户并提供重试选项
FR78: 系统可以在分析超时后将任务加入后台队列
FR79: 系统可以显示当前等待队列中的任务数量
FR80: Standard 订阅用户可以享受优先队列
FR81: Standard 订阅用户可以获得更详细的分析维度
FR82: Standard 订阅用户可以享受更高的图片生成分辨率

### NonFunctional Requirements

**总数：28 个**

| 类别 | 数量 | 描述 |
|------|------|------|
| Performance（性能） | 5 | P95响应时间、实时进度、生成响应、编辑响应 |
| Security（安全） | 6 | TLS加密、OAuth认证、授权控制、支付安全、内容过滤 |
| Scalability（可扩展性） | 5 | 10倍用户增长、3倍流量突发、100K图片存储、并发队列 |
| Concurrency（并发控制） | 1 | 按用户等级的并发任务限制 |
| Integration（集成） | 5 | Replicate API、Google OAuth、社交分享、支付网关、存储 |
| Reliability（可靠性） | 6 | 99.5%可用性、95% API成功率、数据持久性、超时处理 |

**详细非功能需求：**

NFR-PERF-1: 分析响应时间 - 95% 的分析请求在 60 秒内完成
NFR-PERF-2: 实时进度反馈 - 每 1-2 秒更新一次进度状态
NFR-PERF-3: 图片生成响应 - 用户点击生成后 < 1 秒显示加载状态，< 5 秒显示生成进度
NFR-PERF-4: 模版编辑响应 - 用户编辑模版时的输入延迟必须 < 100ms
NFR-PERF-5: 批量分析进度 - 显示批量分析的整体进度

NFR-SEC-1: 数据加密 - 传输中 TLS 1.3，静态 AES-256
NFR-SEC-2: 身份认证 - OAuth 2.0，Token 有效期不超过 7 天
NFR-SEC-3: 授权控制 - 用户只能访问自己的数据
NFR-SEC-4: 支付安全 - PCI-DSS Level 1 标准
NFR-SEC-5: 内容过滤 - 输入端和输出端过滤不当内容
NFR-SEC-6: 数据隐私（CCPA合规）- Free 30天，Standard 90天保留期

NFR-SCALE-1: 用户增长支持 - 支持 10 倍用户增长（100→1000）
NFR-SCALE-2: 流量突发支持 - 承受 3 倍日常流量突发
NFR-SCALE-3: 数据存储扩展 - 支持存储 100,000 张图片
NFR-SCALE-4: 队列管理 - 支持最多 100 个并发分析任务
NFR-SCALE-5: Credit 事务处理 - 支持每秒 100 次 credit 扣除操作

NFR-CONCURRENCY: 并发处理数限制 - Free 1个，Lite 3个，Standard 10个

NFR-INT-1: Replicate API 集成 - 支持至少 3 个模型类别
NFR-INT-2: Google OAuth 集成 - 支持 Google OAuth 2.0 协议
NFR-INT-3: 社交分享集成 - 支持 X (Twitter) API 和 Web Share API
NFR-INT-4: 支付网关集成 - 集成主流支付网关，支持月度和年度订阅
NFR-INT-5: 存储服务集成 - 集成云存储服务，按订阅等级设置不同保留期限

NFR-REL-1: 可用性 - 99.5%（每月约 3.6 小时停机）
NFR-REL-2: API 调用成功率 - > 95%
NFR-REL-3: 错误恢复 - API 调用失败后自动重试最多 3 次
NFR-REL-4: 数据持久性 - 99.99%
NFR-REL-5: 超时处理 - 分析请求在 60 秒后停止轮询
NFR-REL-6: 高并发优雅降级 - 达到并发限制时返回 503

### Additional Requirements

**来自 Architecture：**

1. **Starter 模板**：使用 `create-next-app` 官方 CLI 初始化项目
   - TypeScript, Tailwind, ESLint, App Router, src-dir, import-alias "@/*"

2. **技术栈决策**：
   - 数据库：PostgreSQL + Drizzle ORM
   - 认证：NextAuth.js v5 + Google OAuth 2.0
   - 状态管理：Zustand (UI状态) + React Query (服务器状态)
   - 组件库：MUI + Tailwind CSS
   - 存储：Cloudflare R2（S3 API 兼容）
   - 支付：Creem（Merchant of Record）
   - 部署：Vercel

3. **命名规范**：
   - 数据库表/列：`snake_case` 复数
   - API端点：`kebab-case` 复数
   - React组件：`PascalCase`
   - 函数/变量：`camelCase`
   - 常量：`UPPER_SNAKE_CASE`
   - 文件名：`kebab-case`

4. **项目结构**：
   - `src/app/` - Next.js App Router
   - `src/components/ui/` - 基础 UI 组件（MUI）
   - `src/components/shared/` - 共享功能组件
   - `src/features/` - 按功能域组织的模块
   - `src/lib/` - 库和工具（db, auth, api, replicate, r2, creem, utils）
   - `src/stores/` - Zustand stores
   - `src/types/` - 全局类型

5. **API 响应格式**：
   ```typescript
   // 成功响应
   interface ApiResponse<T> {
     success: true;
     data: T;
     meta?: { page?, limit?, total? };
   }

   // 错误响应
   interface ApiError {
     success: false;
     error: { code: string; message: string; details? };
   }
   ```

**来自 UX Design：**

1. **自适应界面**：新手模式（默认）/ 专业模式切换
2. **三列布局**：参考图片 | 分析结果 | 可编辑模版
3. **四维度分析卡片**：光影、构图、色彩、艺术风格
4. **质量指标徽章**：使用人数、成功率、用户评分
5. **进度反馈**：阶段进度 + 预计剩余时间 + 质量承诺
6. **一键复制**：模版复制功能（快捷键支持）
7. **响应式设计**：
   - 移动端（< 768px）：单列布局，底部导航
   - 平板端（768-1024px）：两列布局
   - 桌面端（≥ 1024px）：三列布局
8. **无障碍**：WCAG 2.1 AA 合规
9. **视觉风格**：Glassmorphism
   - 深色背景：Slate 900 (#0F172A)
   - 卡片背景：Slate 800 (#1E293B)
   - CTA/成功：Green 500 (#22C55E)
10. **字体**：
    - 标题：Poppins
    - 正文：Open Sans
    - 专业术语：JetBrains Mono

### FR Coverage Map

| Feature Module | Directory | Associated FRs |
|---------------|-----------|----------------|
| **认证** | `src/features/auth/` | FR1-5 |
| **图片上传** | `src/features/analysis/components/ImageUploader/` | FR6-12, FR67 |
| **风格分析** | `src/features/analysis/` | FR13-18, FR74, FR76 |
| **内容安全** | `src/lib/replicate/` + `src/app/api/webhook/` | FR50-56 |
| **模版生成** | `src/features/templates/` | FR19-25, FR65 |
| **图片生成** | `src/features/generation/` | FR26-32, FR72, FR73, FR82 |
| **历史记录** | `src/features/templates/` + `history/` | FR33-36 |
| **模版库** | `src/features/templates/` | FR37-40, FR69, FR70 |
| **Credit 系统** | `src/features/credits/` | FR42-49, FR80, FR81 |

## Epic List

**总数：9 个 Epic**

| Epic | 标题 | FRs | 用户价值 |
|------|------|-----|---------|
| **Epic 1** | 用户认证与账户系统 | FR1-5 | 用户可以注册登录、管理账户 |
| **Epic 2** | 图片上传与管理 | FR6-12, FR67 | 用户可以上传和管理图片（支持移动端） |
| **Epic 3** | AI 风格分析 | FR13-18, FR74, FR76 | 用户可以获取专业风格分析 |
| **Epic 4** | 内容安全与合规 | FR50-56 | 系统安全合规，用户信任 |
| **Epic 5** | 模版生成与管理 | FR19-25, FR65 | 用户可以生成和编辑提示词模版 |
| **Epic 6** | AI 图片生成 | FR26-32, FR72, FR73, FR82 | 用户可以基于模版生成图片 |
| **Epic 7** | 模版库与历史记录 | FR33-40, FR69, FR70 | 用户可以保存和查看历史 |
| **Epic 8** | 订阅与支付系统 | FR42-49, FR80, FR81 | 用户可以购买订阅和管理积分 |
| **Epic 9** | 错误处理与用户支持 | FR57-64 | 用户获得友好错误信息和帮助 |

---

### 详细 Epic 描述

#### Epic 1: 用户认证与账户系统
**FRs:** FR1-5

**用户成果：** 用户可以使用 Google 账户登录系统，管理个人资料和积分余额。

**包含内容：**
- Google OAuth 2.0 登录集成
- 新用户自动获赠 30 credit
- 账户信息查看（余额、订阅状态）
- 账户删除功能

---

#### Epic 2: 图片上传与管理
**FRs:** FR6-12, FR67

**用户成果：** 用户可以通过拖拽或点击上传图片，支持单张和批量上传（支持桌面端和移动端）。

**包含内容：**
- **桌面端：** 拖拽上传界面（单张图片）
- **移动端：** 手机拍照或相册选择上传
- 批量上传（最多 5 张同风格图片）
- 图片格式/大小验证
- 上传进度显示
- 取消上传功能
- 复杂图片检测与降级处理
- 批量分析进度显示

**移动端支持（焦点小组反馈优化）：**
- 最小触摸目标 44x44px
- 上传按钮固定底部（Floating Action Button）
- 简化专业术语，只显示风格标签
- "在桌面端查看详细分析"引导

---

#### Epic 3: AI 风格分析
**FRs:** FR13-18, FR74, FR76

**用户成果：** 用户可以获得专业的四维度（光影、构图、色彩、艺术风格）风格分析结果。

**包含内容：**
- 四维度风格特征提取
- 批量图片综合分析
- 实时分析进度显示
- 视觉模型 API 集成（Replicate）
- 置信度标注与低置信度警告
- 用户质量反馈机制

---

#### Epic 4: 内容安全与合规
**FRs:** FR50-56

**用户成果：** 用户在安全可信的平台上使用服务，隐私得到保护。

**包含内容：**
- 上传内容审核（不当内容过滤）
- 生成内容审核（提示词过滤）
- 用户授权与免责声明
- AI 透明度标注
- 数据保留策略（按订阅等级：Free 30天，Standard 90天）
- 账户删除数据清除

---

#### Epic 5: 模版生成与管理
**FRs:** FR19-25, FR65

**用户成果：** 用户可以获得结构化的提示词模版，支持编辑和导出。

**包含内容：**
- 变量模版生成（清晰标记可替换部分）
- JSON 格式导出（专业用户 deal-breaker）
- 模版编辑功能
- 一键复制到剪贴板
- 文字模型 API 集成（提示词优化）
- 保存模版到个人库

---

#### Epic 6: AI 图片生成
**FRs:** FR26-32, FR72, FR73, FR82

**用户成果：** 用户可以使用模版直接生成同风格新图片，并分享到社交媒体。

**包含内容：**
- 生图模型 API 集成（Replicate）
- 基于模版生成图片
- 生成进度显示
- 图片保存到本地
- 社交分享功能（X/Twitter）
- 分享奖励机制（credit 奖励）

**Standard 用户专属（FR82）：**
- 更高的图片生成分辨率

---

#### Epic 7: 模版库与历史记录
**FRs:** FR33-40, FR69, FR70

**用户成果：** 用户可以保存和管理自己的模版和历史分析记录。

**包含内容：**
- 临时历史记录（最近 10 次分析）
- 永久模版库（收藏、标签、分类）
- 基于历史模版重新分析
- 模版使用统计
- 查看模版生成的历史图片

---

#### Epic 8: 订阅与支付系统
**FRs:** FR42-49, FR80, FR81

**用户成果：** 用户可以购买订阅、管理积分，并享受会员权益。

**包含内容：**
- Credit 系统（Free, Lite, Standard）
- 订阅计划管理（月度/年度）
- Credit 扣除与消费记录
- Creem 支付集成

**Standard 用户专属权益（FR80, FR81）：**
- **优先队列（FR80）：** Standard 订阅用户分析请求优先处理
- **详细分析维度（FR81）：** Standard 用户可获得更详细的分析维度（如新增"情感基调"、"艺术时期"等）

---

#### Epic 9: 错误处理与用户支持
**FRs:** FR57-64

**用户成果：** 用户在遇到问题时获得友好的错误信息和帮助。

**包含内容：**
- 上传失败错误处理
- 分析失败错误处理
- 生成失败错误处理
- API 自动重试机制
- 超时处理与提示
- 用户教育（最佳使用场景）

---

### FR 覆盖映射

```
FR1-5: Epic 1 - 用户认证与账户系统
FR6-12, FR67: Epic 2 - 图片上传与管理
FR13-18, FR74, FR76: Epic 3 - AI 风格分析
FR50-56: Epic 4 - 内容安全与合规
FR19-25, FR65: Epic 5 - 模版生成与管理
FR26-32, FR72, FR73, FR82: Epic 6 - AI 图片生成
FR33-40, FR69, FR70: Epic 7 - 模版库与历史记录
FR42-49, FR80, FR81: Epic 8 - 订阅与支付系统
FR57-64: Epic 9 - 错误处理与用户支持
```

---

### 执行顺序与依赖关系

```
Epic 1 (认证) → Epic 2 (上传) → Epic 3 (分析) → Epic 4 (安全) → Epic 5 (模版) → Epic 6 (生成)
                                                                                           ↓
                                                                            Epic 7 (历史) ← Epic 8 (支付)
                                                                                           ↓
                                                                                      Epic 9 (错误)
```

**说明：**
- **Epic 1-6**：核心流程，顺序执行（Epic 4 安全在生成之前）
- **Epic 7-9**：可并行开发或按需调整
- **Epic 8 支付**：可后期补充，Free 用户体验完整优先

