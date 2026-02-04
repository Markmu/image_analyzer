/**
 * Database Transaction Rollback Fixture
 *
 * Implements test isolation using PostgreSQL transaction rollback.
 * Each test runs in its own transaction that gets rolled back after completion.
 *
 * Benefits:
 * - Perfect isolation (no data pollution between tests)
 * - Fast (no expensive cleanup operations)
 * - Reliable (transaction guarantees ACID properties)
 *
 * @see test-design-architecture.md#L191-L231
 */

import { test as base } from '@playwright/test';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DatabaseTransaction {
  query: ReturnType<typeof drizzle>;
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
  isInTransaction: boolean;
}

// ============================================
// TRANSACTION FIXTURE
// ============================================

export const test = base.extend<{
  dbTransaction: DatabaseTransaction;
}>({
  // ----------------------------------------
  // Database Transaction Fixture
  // ----------------------------------------
  dbTransaction: async ({}, use) => {
    // Check if DATABASE_URL is configured
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Cannot use database transaction rollback isolation.'
      );
    }

    // Create PostgreSQL client
    const client = postgres(databaseUrl, {
      max: 1, // Single connection per test
    });

    const db = drizzle(client, { schema });

    // Start transaction
    console.log('🔧 Starting database transaction for test isolation...');
    await client`BEGIN`;

    const transaction: DatabaseTransaction = {
      query: db,
      isInTransaction: true,

      /**
       * Rollback the transaction (called automatically after each test)
       */
      rollback: async () => {
        await client`ROLLBACK`;
        console.log('↩️  Transaction rolled back');
      },

      /**
       * Commit the transaction (useful for testing transaction behavior itself)
       * WARNING: Committed data will persist! Use only for specific test scenarios.
       */
      commit: async () => {
        await client`COMMIT`;
        console.log('✅ Transaction committed');
        transaction.isInTransaction = false;
      },
    };

    // Use the transaction in the test
    await use(transaction);

    // AUTOMATIC ROLLBACK after test completes
    // This is the KEY to test isolation
    if (transaction.isInTransaction) {
      await transaction.rollback();
    }

    // Close connection
    await client.end();
  },
});

// ============================================
// TRANSACTION OPTIONS (test.use)
// ============================================

export interface TransactionOptions {
  /**
   * Skip transaction rollback (data will persist)
   * WARNING: Only use for testing transaction behavior itself
   * @default false
   */
  skipRollback?: boolean;

  /**
   * Use a snapshot/SAVEPOINT for nested rollbacks
   * Useful for tests that need to rollback mid-test
   * @default false
   */
  useSavepoint?: boolean;
}

// ============================================
// CLEANUP VERIFICATION
// ============================================

/**
 * Verify that no test data remains after transaction rollback
 * This should be called in test.afterEach to ensure isolation worked
 */
export async function verifyNoTestDataRemaining(
  db: DatabaseTransaction,
  testRunId: string
): Promise<void> {
  // Query for any records with testRunId (should be 0 after rollback)
  const result = await client`
    SELECT COUNT(*) as count
    FROM (
      SELECT id FROM users WHERE metadata->>'testRunId' = ${testRunId}
      UNION ALL
      SELECT id FROM templates WHERE metadata->>'testRunId' = ${testRunId}
      UNION ALL
      SELECT id FROM analysis WHERE metadata->>'testRunId' = ${testRunId}
    ) AS all_records
  `;

  const count = result[0]?.count || 0;

  if (count > 0) {
    throw new Error(
      `❌ Cleanup verification failed: ${count} test records remain after transaction rollback. ` +
      `This indicates the transaction isolation is not working correctly.`
    );
  }

  console.log(`✅ Verified: No test data remains for testRunId ${testRunId}`);
}

// ============================================
// EXPORTS
// ============================================

export { test as dbTest };
export default test;
