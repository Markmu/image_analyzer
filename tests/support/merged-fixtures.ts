import { APIRequestContext, mergeTests, test as base } from '@playwright/test';
import { test as customFixtures } from './custom-fixtures';
import { registerGlobalCleanup } from './global-cleanup-hooks';

type ApiRequestInput = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  data?: unknown;
  headers?: Record<string, string>;
};

type ApiRequestOutput<T = any> = {
  status: number;
  body: T;
};

type RecurseOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

type AuthOptions = {
  userIdentifier?: string;
  environment?: string;
};

const utilityFixtures = base.extend<{
  authOptions: AuthOptions;
  authToken: string;
  apiRequest: <T = any>(input: ApiRequestInput) => Promise<ApiRequestOutput<T>>;
  recurse: <T>(
    producer: () => Promise<T>,
    predicate: (value: T) => boolean,
    options?: RecurseOptions,
  ) => Promise<T>;
  log: {
    step: (name: string, callback?: () => Promise<void>) => Promise<void>;
    info: (message: string) => void;
    error: (message: string, error?: unknown) => void;
  };
  interceptNetworkCall: (input: {
    url: string | RegExp;
    method?: string;
    timeoutMs?: number;
  }) => Promise<unknown>;
  networkRecorder: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
  };
  fileUtils: {
    exists: (filePath: string) => Promise<boolean>;
  };
  networkErrorMonitor: {
    hasErrors: () => boolean;
  };
  burnIn: {
    selectTests: () => string[];
  };
}>({
  authOptions: [{}, { option: true }],

  authToken: async ({ authOptions }, use) => {
    const tokenSeed = authOptions.userIdentifier || 'test-user';
    await use(`test-token-${tokenSeed}`);
  },

  apiRequest: async ({ request }, use) => {
    await use(async <T = any>({ method, path, data, headers = {} }: ApiRequestInput) => {
      const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
      const methodLower = method.toLowerCase() as Lowercase<ApiRequestInput['method']>;

      const response = await (request[methodLower] as APIRequestContext[typeof methodLower])(normalizedPath, {
        data,
        headers,
      });

      const contentType = response.headers()['content-type'] || '';
      const body = contentType.includes('application/json')
        ? ((await response.json().catch(() => ({}))) as T)
        : (({ text: await response.text().catch(() => '') } as unknown) as T);

      return { status: response.status(), body };
    });
  },

  recurse: async ({}, use) => {
    await use(async <T>(
      producer: () => Promise<T>,
      predicate: (value: T) => boolean,
      options: RecurseOptions = {},
    ) => {
      const timeoutMs = options.timeoutMs ?? 5000;
      const intervalMs = options.intervalMs ?? 300;
      const start = Date.now();

      while (Date.now() - start <= timeoutMs) {
        const value = await producer();
        if (predicate(value)) {
          return value;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      throw new Error(`recurse timeout after ${timeoutMs}ms`);
    });
  },

  log: async ({}, use) => {
    await use({
      step: async (name: string, callback?: () => Promise<void>) => {
        console.log(`[step] ${name}`);
        if (callback) {
          await callback();
        }
      },
      info: (message: string) => console.log(`[info] ${message}`),
      error: (message: string, error?: unknown) => console.error(`[error] ${message}`, error),
    });
  },

  interceptNetworkCall: async ({ page }, use) => {
    await use(({ url, method, timeoutMs = 30_000 }) =>
      page.waitForResponse(
        (response) => {
          const matchesUrl = typeof url === 'string' ? response.url().includes(url.replaceAll('*', '')) : url.test(response.url());
          const matchesMethod = method ? response.request().method().toUpperCase() === method.toUpperCase() : true;
          return matchesUrl && matchesMethod;
        },
        { timeout: timeoutMs },
      ),
    );
  },

  networkRecorder: async ({}, use) => {
    await use({
      start: async () => {},
      stop: async () => {},
    });
  },

  fileUtils: async ({}, use) => {
    await use({
      exists: async (filePath: string) => {
        try {
          const fs = await import('fs/promises');
          await fs.access(filePath);
          return true;
        } catch {
          return false;
        }
      },
    });
  },

  networkErrorMonitor: async ({}, use) => {
    await use({
      hasErrors: () => false,
    });
  },

  burnIn: async ({}, use) => {
    await use({
      selectTests: () => [],
    });
  },
});

export const test = mergeTests(utilityFixtures, customFixtures);
export { expect } from '@playwright/test';

// ============================================
// GLOBAL TEST CLEANUP HOOK
// ============================================
/**
 * 自动清理钩子 - 在每个测试后运行
 *
 * 确保测试间完全隔离，防止状态污染
 * 特别解决了移动端测试的隔离问题
 */
test.afterEach(async ({ page }, testInfo) => {
  // 跳过 API 测试（没有 page 对象）
  if (!page) {
    return;
  }

  try {
    // 执行全局清理
    await registerGlobalCleanup(page, {
      skipBrowserCleanup: false,
      verifyCleanup: true,
      verbose: testInfo.project.name.includes('mobile'), // 移动端测试输出详细日志
    });
  } catch (error) {
    // 记录清理错误，但不让测试失败（测试本身可能已经失败了）
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Cleanup error in ${testInfo.title}: ${errorMessage}`);
  }
});

export function getBaseURL(): string {
  return process.env.BASE_URL || 'http://localhost:3000';
}

export function getAPIURL(): string {
  return process.env.API_URL || 'http://localhost:3000/api';
}
