# Tests

This directory contains the test suite for the image_analyzer project.

**📢 最新更新 (2026-02-04):**
- ✅ 新增数据库事务回滚隔离机制
- ✅ 新增全局清理钩子
- ✅ 新增 MSW Mock 服务（Replicate API）
- ✅ 优化并发测试配置
- 📋 详细信息参见 [FRAMEWORK_ENHANCEMENT_SUMMARY.md](./FRAMEWORK_ENHANCEMENT_SUMMARY.md)

---

## Directory Structure

```
tests/
├── api/                    # API-only tests (no browser)
│   ├── users.spec.ts       # User API tests
│   ├── error-scenarios.spec.ts # Error handling tests
│   └── test-data-api-guide.md  # 测试数据 API 实施指南
├── e2e/                   # End-to-end browser tests
│   └── image-upload.spec.ts
├── mocks/                 # 🆕 MSW Mock 服务
│   ├── replicate-handlers.ts   # Replicate API Mock handlers
│   └── msw-setup.ts            # MSW 服务器设置
├── support/               # Test infrastructure
│   ├── fixtures/
│   │   ├── merged-fixtures.ts    # Combined test fixtures
│   │   └── custom-fixtures.ts    # Project-specific fixtures
│   ├── factories/         # Data factories
│   │   ├── user-factory.ts
│   │   ├── template-factory.ts
│   │   └── analysis-factory.ts
│   ├── helpers/           # Test helpers
│   │   └── api-helpers.ts
│   ├── global-setup.ts    # Runs once before all tests
│   ├── global-teardown.ts # Runs once after all tests
│   ├── database-transaction-fixture.ts  # 🆕 数据库事务回滚
│   └── global-cleanup-hooks.ts         # 🆕 全局清理钩子
├── fixtures/              # Static test fixtures
│   └── images/
├── test-results/          # Generated test outputs
├── FRAMEWORK_ENHANCEMENT_SUMMARY.md  # 🆕 框架增强总结
└── README.md              # 本文件
```

## Running Tests

### Install Dependencies

```bash
# Install Playwright browsers
npx playwright install

# Install project dependencies (if not already installed)
npm install
```

### Run All Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

### Run Specific Tests

```bash
# Run API tests only
npm run test:e2e -- --project=api

# Run E2E tests only
npm run test:e2e -- --project=chromium

# Run a specific test file
npm run test:e2e tests/e2e/image-upload.spec.ts

# Run tests matching a pattern
npm run test:e2e -g "upload"
```

### Running in CI

```bash
# Run all projects with retries
npm run test:e2e

# Run with sharding (for parallel CI jobs)
npm run test:e2e -- --shard=1/3
npm run test:e2e -- --shard=2/3
npm run test:e2e -- --shard=3/3
```

## Writing Tests

### Using Merged Fixtures

Import test and expect from merged fixtures to get all utilities:

```typescript
import { test, expect } from '../support/merged-fixtures';
```

Available fixtures:
- `apiRequest` - HTTP client with schema validation
- `authToken` - Auto-fetched authentication token
- `recurse` - Async polling for background jobs
- `log` - Report-integrated logging
- `interceptNetworkCall` - Network spy/stub
- `testUser` - Auto-seeded test user
- `apiClient` - Convenience API wrapper

### Test Structure

Follow Given-When-Then structure:

```typescript
test('should do something', async ({ page, log }) => {
  // Given: User is on the page
  await page.goto('/page');

  // When: User performs action
  await page.click('button');

  // Then: Expected result
  await expect(page).toHaveURL('/result');
});
```

### Using Data Factories

Create realistic test data:

```typescript
import { createUser, createTemplate } from '../support/factories/user-factory';

test('with custom user', async ({ apiRequest }) => {
  const user = createUser({ role: 'admin' });
  await apiRequest({ method: 'POST', path: '/users', data: user });
});
```

## Best Practices

1. **Use data-testid selectors** - Avoid fragile CSS/XPath selectors
2. **API-first setup** - Seed data via API, not UI
3. **Parallel-safe** - All data uses unique IDs (UUIDs)
4. **Proper cleanup** - Fixtures auto-cleanup after tests
5. **Avoid sleeps** - Use auto-waiting instead of hardcoded waits
6. **One assertion per test** - Keep tests focused

## Configuration

See `playwright.config.ts` for:
- Timeouts
- Reporter settings
- Browser configurations
- Parallel execution settings

## Troubleshooting

### Tests failing with "Browser not found"

```bash
npx playwright install
```

### Authentication issues

Ensure `.env.local` has valid credentials:
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

### Tests too slow

Run in parallel:
```bash
npm run test:e2e -- --workers=4
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Utils](https://github.com/seontechnologies/playwright-utils)
- [BMAD Tea Knowledge Base](file:///Users/muchao/code/image_analyzer/_bmad/tea/testarch/knowledge)
- [测试设计文档 (架构版)](../_bmad-output/test-design/test-design-architecture.md)

---

## 🆕 新增功能 (2026-02-04)

### 1. 数据库事务回滚隔离

使用 `database-transaction-fixture.ts` 实现完美的数据库隔离：

```typescript
import { test as dbTest } from '../support/database-transaction-fixture';

dbTest('数据库操作测试', async ({ dbTransaction }) => {
  // 所有操作在事务中执行
  await dbTransaction.query.insert(schema.users).values(userData);

  // 测试结束后自动回滚，无需手动清理
});
```

**优势：** 完美的测试隔离，快速且可靠

---

### 2. 全局清理钩子

使用 `global-cleanup-hooks.ts` 自动清理浏览器状态：

```typescript
import { registerGlobalCleanup } from '../support/global-cleanup-hooks';

test.afterEach(async ({ page }) => {
  await registerGlobalCleanup(page, {
    verifyCleanup: true,  // 验证清理成功
  });
});
```

**清理内容：**
- Cookies
- localStorage
- sessionStorage
- 认证状态

---

### 3. MSW Mock 服务

使用 `msw-setup.ts` Mock Replicate API：

```typescript
import { setupReplicateMocks } from '../mocks/msw-setup';

const server = setupReplicateMocks();

test.beforeAll(() => server.listen());
test.afterEach(() => server.resetHandlers());
test.afterAll(() => server.close());

test('API 测试', async ({ request }) => {
  // Replicate API 请求自动被 Mock
  const response = await request.post('/api/analyze', {
    data: { imageUrl: 'test.jpg' }
  });
});
```

**优势：**
- 降低测试成本（无真实 API 费用）
- 提升测试稳定性（无网络延迟）
- 加速测试执行

---

### 4. 优化并发配置

参考 `playwright.config.enhanced.ts` 的配置策略：

- **API 测试：** 完全并行（workers: 4）
- **E2E 测试：** 受控并行（workers: 2）
- **按项目分离：** API 和 E2E 独立运行

---

## 📚 相关文档

- **[框架增强总结](./FRAMEWORK_ENHANCEMENT_SUMMARY.md)** - 详细的增强说明
- **[测试数据 API 指南](./api/test-data-api-guide.md)** - 后端 API 实施规范
- **[测试设计文档](../_bmad-output/test-design/test-design-architecture.md)** - 架构级测试策略
