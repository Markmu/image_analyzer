---
title: "Sprint Change Proposal - Epic 0 数据表结构范围调整"
date: "2026-02-03"
status: "approved"
author: "Bob (Scrum Master)"
trigger: "Epic 0 数据表结构创建延迟到业务模块"
---

# Sprint Change Proposal - Epic 0 数据表结构范围调整

## 1. 问题摘要

### 触发问题

在项目规划过程中发现，**Epic 0 中包含的数据库 Schema 定义应该延迟到具体业务模块实现时再进行**，而不是在项目初始化阶段完成。

### 触发背景

- Epic 0 原计划包含：PostgreSQL + Drizzle ORM 设置 + 数据库 Schema 定义
- 决定：**保留 Drizzle ORM 基础配置，移除数据库 Schema 定义**

### 触发时间

2026-02-03，Sprint Planning 阶段

---

## 2. 影响分析

### Epic 影响

| Epic | 状态 | 影响描述 |
|------|------|----------|
| **Epic 0** | ✅ 需要修改 | 移除"数据库 Schema 定义"，保留"Drizzle ORM 基础配置" |
| Epic 1-9 | ✅ 无影响 | 数据库 Schema 将在各自 Epic 中按需创建 |

### 故事影响

| 故事 | 状态 | 影响描述 |
|------|------|----------|
| Epic 0 相关故事 | ✅ 需要更新 | 修改包含内容说明 |

### 产物冲突

| 产物 | 状态 | 行动 |
|------|------|------|
| PRD | ⚠️ 无冲突 | 不需要修改 |
| Architecture | ⚠️ 可能需要更新 | 说明数据表结构在业务模块时创建 |
| UX Design | ⚠️ 无冲突 | 不需要修改 |
| Tech Spec | ⚠️ 无冲突 | 不存在 |

### 技术影响

| 区域 | 影响 | 描述 |
|------|------|------|
| 数据库层 | ✅ 延迟 | Schema 定义延迟到业务模块 |
| Drizzle ORM | ✅ 保留 | 基础配置仍在 Epic 0 完成 |
| CI/CD | ❌ 无影响 | 不需要修改 |

---

## 3. 推荐路径

### 评估选项

| 选项 | 努力估计 | 风险 | 状态 |
|------|----------|------|------|
| **1. 直接调整** | 🟡 低 | 🟢 低 | ✅ 推荐 |
| 2. 回滚 | N/A | N/A | ❌ 不可行 |
| 3. PRD MVP 审查 | N/A | N/A | ❌ 不需要 |

### 推荐路径：直接调整（Direct Adjustment）

**理由**：
- 这是一个简单的范围调整，不影响项目目标
- 低努力，低风险
- 数据库 Schema 将在具体业务模块（Epic 1-9）实现时创建
- Drizzle ORM 基础配置保留在 Epic 0，确保基础设施完整

---

## 4. 详细变更提案

### 变更：Epic 0 范围调整

**产物**: [epics.md](../planning-artifacts/epics.md)

**Section**: Epic 0: 项目初始化与基础设施 - 包含内容

#### 修改前

```markdown
#### Epic 0: 项目初始化与基础设施
**FRs:** 无 (基础设施 Epic)

**包含内容：**
- 项目初始化（create-next-app）
  - TypeScript, Tailwind, ESLint, App Router
  - src-dir, import-alias "@/*"
- **数据库配置**
  - **PostgreSQL + Drizzle ORM 设置**
  - **数据库 Schema 定义**
- 开发环境配置
  - VSCode 设置和格式化配置
  - Git hooks (husky, lint-staged)
  - ESLint + Prettier 配置
- CI/CD 流水线
  - GitHub Actions 工作流
  - 自动测试和构建
- 外部服务集成准备
  - NextAuth.js 配置结构
  - Replicate API 客户端基础
  - Cloudflare R2 存储配置
  - Creem 支付集成准备
```

#### 修改后

```markdown
#### Epic 0: 项目初始化与基础设施
**FRs:** 无 (基础设施 Epic)

**包含内容：**
- 项目初始化（create-next-app）
  - TypeScript, Tailwind, ESLint, App Router
  - src-dir, import-alias "@/*"
- **数据库配置**
  - **PostgreSQL + Drizzle ORM 设置**（Drizzle 基础配置）
  - **数据库 Schema 定义** → **在具体业务模块实现时添加**
- 开发环境配置
  - VSCode 设置和格式化配置
  - Git hooks (husky, lint-staged)
  - ESLint + Prettier 配置
- CI/CD 流水线
  - GitHub Actions 工作流
  - 自动测试和构建
- 外部服务集成准备
  - NextAuth.js 配置结构
  - Replicate API 客户端基础
  - Cloudflare R2 存储配置
  - Creem 支付集成准备

**不包含（延迟到业务模块）：**
- ~~数据库 Schema 定义~~ → **在具体业务模块（Epic 1-9）实现时创建**
```

#### 变更摘要

| 项目 | 原状态 | 新状态 |
|------|--------|--------|
| Drizzle ORM 基础配置 | 保留 | ✅ 保留 |
| 数据库 Schema 定义 | 包含 | ❌ 移除 → 业务模块时创建 |

---

## 5. 实现交接

### 变更范围分类

| 分类 | 描述 |
|------|------|
| **范围** | Minor（可直接由开发团队实施） |

### 交接对象

| 角色 | 职责 |
|------|------|
| **开发团队** | 更新 Epic 0 文档，移除数据库 Schema 定义相关任务 |

### 成功标准

- [ ] Epic 0 文档已更新，明确说明 Schema 定义延迟到业务模块
- [ ] Drizzle ORM 基础配置仍在 Epic 0 范围内
- [ ] Epic 1-9 文档已标注需要在各自模块中创建相关 Schema

---

## 6. 附录

### 检查表完成状态

| 检查项 | 状态 |
|--------|------|
| Section 1: 理解触发器和上下文 | ✅ 完成 |
| Section 2: Epic 影响评估 | ✅ 完成 |
| Section 3: 产物冲突和影响分析 | ✅ 完成 |
| Section 4: 前进路径评估 | ✅ 完成 |
| Section 5: Sprint Change Proposal 组件 | ✅ 完成 |
| Section 6: 最终审查和交接 | ✅ 完成 |

---

**文档版本**: 1.0
**创建日期**: 2026-02-03
**状态**: Approved
**作者**: Bob (Scrum Master)
