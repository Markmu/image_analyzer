# Story 0-4: CI/CD 流水线

Status: review

## Story

As a 开发团队,
I want 拥有自动化的 CI/CD 流水线,
so that 我们可以确保代码质量并自动化部署流程.

## User Outcomes

- 每次 push 自动运行测试和构建
- Pull Request 自动检查代码质量
- 合并到 main 分支自动部署到生产环境
- 构建状态可视化

## Acceptance Criteria

1. [x] GitHub Actions 工作流配置正确:
   - [x] ci.yml - 持续集成工作流
   - [x] 触发条件正确设置（push, pull_request）
2. [x] CI 工作流包含:
   - [x] Node.js 环境设置
   - [x] 依赖安装（npm ci）
   - [x] 代码检查（lint）
   - [x] 类型检查（type-check）
   - [x] 构建验证（build）
   - [x] 测试运行（test）
3. [x] CD 工作流配置（如适用）:
   - [x] 部署到 Vercel 或其他平台
   - [x] 环境变量配置
   - [x] 部署后验证
4. [x] 工作流文件结构正确:
   - [x] .github/workflows/ci.yml
   - [x] .github/workflows/deploy.yml
5. [x] 缓存配置正确:
   - [x] Node modules 缓存
   - [x] 构建产物缓存

## Tasks / Subtasks

- [x] Task 1: 创建 CI 工作流 (AC: #1, #2)
  - [x] 1.1 创建 .github/workflows/ci.yml
  - [x] 1.2 配置 Node.js 版本
  - [x] 1.3 配置依赖安装
  - [x] 1.4 配置代码检查步骤
  - [x] 1.5 配置类型检查步骤
  - [x] 1.6 配置构建步骤
- [x] Task 2: 配置测试框架 (AC: #2)
  - [x] 2.1 安装 Vitest
  - [x] 2.2 配置测试脚本
  - [x] 2.3 创建基础测试
- [x] Task 3: 创建 CD 工作流 (AC: #3)
  - [x] 3.1 创建 .github/workflows/deploy.yml
  - [x] 3.2 配置 Vercel 部署
  - [x] 3.3 配置环境变量
- [x] Task 4: 优化工作流 (AC: #5)
  - [x] 4.1 配置依赖缓存（使用 setup-node cache: 'npm'）
  - [x] 4.2 配置并行作业（CI 中 4 个作业并行执行）
  - [x] 4.3 添加失败通知（GitHub Actions 内置通知）

## Dev Notes

### CI 工作流示例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test
```

### CD 工作流示例（Vercel）

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 环境变量配置

在 GitHub 仓库设置中添加：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DATABASE_URL`（用于生产环境）
- `NEXTAUTH_SECRET`

### 缓存配置

```yaml
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm' # 自动缓存 npm 依赖
```

### 命名规范

| 类别       | 规则       | 示例                     |
| ---------- | ---------- | ------------------------ |
| 工作流文件 | kebab-case | `ci.yml`, `deploy.yml`   |
| 工作流名称 | PascalCase | "CI", "Deploy to Vercel" |
| 作业名称   | PascalCase | "Lint", "Type Check"     |

### Project Structure Notes

```
.github/
└── workflows/
    ├── ci.yml         # CI 工作流
    └── deploy.yml      # CD 工作流
```

### References

- 部署配置: [architecture.md#infrastructure--deployment](_bmad-output/planning-artifacts/architecture.md#infrastructure--deployment)
- 技术栈: [architecture.md#core-architectural-decisions](_bmad-output/planning-artifacts/architecture.md#core-architectural-decisions)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

- 2026-02-04: 完成 CI/CD 流水线配置
  - 创建 CI 工作流包含 lint、type-check、build、test 四个并行作业
  - 配置 Vitest 测试框架，包含 React Testing Library
  - 创建 CD 工作流支持 Vercel 部署和预览部署
  - 添加环境变量模板 .env.example
  - 所有测试通过验证

- 2026-02-04: 代码审查修复 (Code Review)
  - 添加 permissions 限制到 CI/CD 工作流
  - 添加部署后验证步骤到 deploy.yml
  - 修复 deploy-preview job 缺少 vercel-args 参数
  - 添加 actions/cache 缓存 Next.js 构建产物
  - 更新测试用例增强覆盖范围
  - 完善 .env.example 注释说明

### File List

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/example.test.tsx`
- `.env.example`
- `package.json` (添加 test 脚本)
