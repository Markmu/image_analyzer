# Testing Framework Guide

本项目测试目录已统一为单一根目录：`tests/`。

## 目录约定（唯一规范）

- 所有新测试文件只能放在 `tests/` 下。
- 禁止在 `src/test`、`src/__tests__`、根目录 `test` 新增测试。
- 按测试类型分层：

```text
tests/
├── unit/                   # Vitest 单元/组件/服务层测试（*.test.ts / *.test.tsx）
├── api/                    # Playwright API 测试（*.spec.ts）
├── e2e/                    # Playwright 端到端测试（*.spec.ts）
├── support/                # fixtures / factories / setup / teardown
├── setup/                  # Vitest 全局初始化（vitest.setup.ts）
├── mocks/                  # MSW 等 Mock
├── fixtures/               # 静态测试资源（如图片）
└── test-results/           # 自动生成产物（不要手动编辑）
```

## 运行命令

```bash
# Vitest（仅扫描 tests/**/*.test.ts(x)）
npm run test
npm run test:run
npm run test:unit

# Playwright
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

## 新增测试文件放置规则

- React 组件/工具函数/服务逻辑：`tests/unit/**`
- API 合约/接口行为（Playwright API project）：`tests/api/**`
- 浏览器端用户流程：`tests/e2e/**`

命名约定：
- Vitest: `*.test.ts` / `*.test.tsx`
- Playwright: `*.spec.ts`

## 配置映射

- `vitest.config.ts`
  - `setupFiles`: `tests/setup/vitest.setup.ts`
  - `include`: `tests/**/*.test.{ts,tsx}`
- `playwright.config.ts`
  - `testDir`: `tests`
  - `testMatch`: `**/*.spec.ts`

## 迁移说明

历史目录 `src/test` 与 `src/__tests__` 已迁移完成。
后续请仅在 `tests/` 下创建和维护测试文件。
