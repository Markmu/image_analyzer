# Tests

This directory contains the test suite for the image_analyzer project.

## Directory Structure

```
tests/
├── api/                    # API-only tests (no browser)
│   └── users.spec.ts      # User API tests
├── e2e/                   # End-to-end browser tests
│   └── image-upload.spec.ts
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
│   └── global-teardown.ts # Runs once after all tests
├── fixtures/              # Static test fixtures
│   └── images/
└── test-results/          # Generated test outputs
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
