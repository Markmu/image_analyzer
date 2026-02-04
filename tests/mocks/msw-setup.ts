/**
 * MSW (Mock Service Worker) Server Setup
 *
 * Setup file for starting/stopping MSW in tests.
 *
 * Usage in test files:
 *
 * ```typescript
 * import { setupServer } from 'msw/node';
 * import { replicateHandlers } from '@/tests/mocks/replicate-handlers';
 * import { setupReplicateMocks } from '@/tests/mocks/msw-setup';
 *
 * const server = setupReplicateMocks();
 *
 * test.beforeAll(() => server.listen());
 * test.afterEach(() => server.resetHandlers());
 * test.afterAll(() => server.close());
 * ```
 *
 * @see test-design-architecture.md#L698-L719
 */

import { setupServer, SetupServerApi } from 'msw/node';
import { handlers, replicateHandlers } from './replicate-handlers';

// ============================================
// SERVER SETUP
// ============================================

/**
 * Create and configure MSW server for Replicate API mocking
 *
 * @returns SetupServerApi instance
 */
export function setupReplicateMocks(): SetupServerApi {
  const server = setupServer(...handlers);

  // Event listeners for debugging
  server.listen({
    onUnhandledRequest: 'warn',
  });

  // Log when server starts/stops
  server.events.on('start', () => {
    console.log('🎭 MSW: Mock server started');
  });

  server.events.on('stop', () => {
    console.log('🎭 MSW: Mock server stopped');
  });

  server.events.on('request:start', ({ request }) => {
    if (request.url.includes('replicate.com')) {
      console.log(`🎭 MSW: Intercepted ${request.method} ${request.url}`);
    }
  });

  return server;
}

/**
 * Create MSW server with custom handlers
 * Useful for testing specific scenarios
 *
 * @param customHandlers - Array of custom MSW handlers
 * @returns SetupServerApi instance
 */
export function setupCustomReplicateMocks(
  customHandlers: ReturnType<typeof replicateHandlers>
): SetupServerApi {
  const server = setupServer(...customHandlers);

  server.listen({
    onUnhandledRequest: 'bypass', // Don't warn on unhandled requests
  });

  return server;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify that MSW is intercepting requests
 *
 * @param server - MSW server instance
 * @returns true if server is running
 */
export function isMSWRunning(server: SetupServerApi): boolean {
  // @ts-ignore - MSW internal property
  return server?.listener?.status === 'active';
}

/**
 * Reset all handlers to default
 * Useful in test.afterEach to clear custom handlers
 *
 * @param server - MSW server instance
 */
export function resetHandlers(server: SetupServerApi): void {
  server.resetHandlers(...handlers);
  console.log('🎭 MSW: Handlers reset to default');
}

/**
 * Use custom handlers temporarily
 * Useful for testing specific error scenarios
 *
 * @param server - MSW server instance
 * @param customHandlers - Array of custom handlers
 */
export function useCustomHandlers(
  server: SetupServerApi,
  ...customHandlers: ReturnType<typeof replicateHandlers>
): void {
  server.use(...customHandlers);
  console.log('🎭 MSW: Using custom handlers');
}

// ============================================
// PRECONFIGURED SERVERS
// ============================================

/**
 * Preconfigured server for successful predictions
 */
export const successServer = setupReplicateMocks();

/**
 * Preconfigured server for timeout scenarios
 */
export const timeoutServer = setupServer();
timeoutServer.use(
  http.post('https://api.replicate.com/v1/predictions', () => {
    return HttpResponse.json({
      id: 'mock-timeout-prediction',
      status: 'processing',
      output: null,
    });
  }),
  http.get('https://api.replicate.com/v1/predictions/:id', () => {
    // Always return processing (never completes)
    return HttpResponse.json({
      status: 'processing',
      output: null,
    });
  })
);

/**
 * Preconfigured server for error scenarios
 */
export const errorServer = setupServer();
errorServer.use(
  http.post('https://api.replicate.com/v1/predictions', () => {
    return HttpResponse.json(
      {
        error: 'Simulated Replicate API error',
        status: 500,
      },
      { status: 500 }
    );
  })
);

// ============================================
// EXPORTS
// ============================================

export { handlers, replicateHandlers };
export default setupReplicateMocks;
