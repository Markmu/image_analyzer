/**
 * User Factory for Test Data Generation
 *
 * Creates realistic user test data using @faker-js/faker.
 * Supports overrides for test-specific requirements.
 */

import { faker } from '@faker-js/faker';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type UserRole = 'user' | 'admin' | 'moderator';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateUserInput extends Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {
  // Override any field except id, createdAt, updatedAt (these are auto-generated)
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a test user with realistic data
 *
 * @param overrides - Partial user data to override defaults
 * @returns Complete User object with unique, collision-free data
 *
 * @example
 * // Default user
 * const user = createUser();
 *
 * // Admin user
 * const admin = createUser({ role: 'admin' });
 *
 * // User with specific email
 * const user = createUser({ email: 'test@example.com' });
 */
export function createUser(overrides: CreateUserInput = {}): User {
  const now = new Date();

  const user: User = {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    role: 'user',
    status: 'active',
    avatarUrl: faker.image.avatar(),
    creditBalance: faker.number.int({ min: 0, max: 1000 }),
    createdAt: now,
    updatedAt: now,
    emailVerified: false,
    ...overrides,
  };

  return user;
}

// ============================================
// SPECIALIZED FACTORIES
// ============================================

/**
 * Create an admin user (for testing admin features)
 */
export function createAdminUser(overrides: CreateUserInput = {}): User {
  return createUser({
    role: 'admin',
    emailVerified: true,
    creditBalance: faker.number.int({ min: 1000, max: 10000 }),
    ...overrides,
  });
}

/**
 * Create a moderator user
 */
export function createModeratorUser(overrides: CreateUserInput = {}): User {
  return createUser({
    role: 'moderator',
    emailVerified: true,
    ...overrides,
  });
}

/**
 * Create a suspended user (for testing access denied)
 */
export function createSuspendedUser(overrides: CreateUserInput = {}): User {
  return createUser({
    status: 'suspended',
    ...overrides,
  });
}

/**
 * Create an inactive user
 */
export function createInactiveUser(overrides: CreateUserInput = {}): User {
  return createUser({
    status: 'inactive',
    ...overrides,
  });
}

/**
 * Create a user with specific credit balance
 */
export function createUserWithCredits(creditBalance: number, overrides: CreateUserInput = {}): User {
  return createUser({
    creditBalance,
    ...overrides,
  });
}

// ============================================
// BATCH CREATION
// ============================================

/**
 * Create multiple users for bulk testing
 */
export function createUsers(count: number, baseOverrides: CreateUserInput = {}): User[] {
  return Array.from({ length: count }, () => createUser(baseOverrides));
}

/**
 * Create users with different roles
 */
export function createUsersWithRoles(roleCount: Record<UserRole, number>): User[] {
  const users: User[] = [];

  Object.entries(roleCount).forEach(([role, count]) => {
    const roleUsers = createUsers(count, { role: role as UserRole });
    users.push(...roleUsers);
  });

  return users;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate user object matches expected structure
 */
export function validateUser(user: unknown): user is User {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const u = user as Record<string, unknown>;

  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.name === 'string' &&
    ['user', 'admin', 'moderator'].includes(u.role as string) &&
    ['active', 'inactive', 'suspended'].includes(u.status as string) &&
    typeof u.creditBalance === 'number'
  );
}

/**
 * Generate unique email based on test context
 */
export function generateTestEmail(testName: string): string {
  const timestamp = Date.now();
  const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `test_${sanitizedTestName}_${timestamp}@example.com`;
}

// ============================================
// MOCK DATA SETS
// ============================================

/**
 * Predefined users for common test scenarios
 */
export const MockUsers = {
  default: createUser(),
  admin: createAdminUser(),
  moderator: createModeratorUser(),
  suspended: createSuspendedUser(),
  inactive: createInactiveUser(),
  zeroCredits: createUserWithCredits(0),
  premium: createUserWithCredits(5000),
};

/**
 * Generate a mock user database response
 */
export function createUserDatabaseResponse(users: User[], meta?: { page?: number; limit?: number; total?: number }) {
  return {
    success: true,
    data: users,
    meta: meta || { page: 1, limit: 20, total: users.length },
  };
}

/**
 * Generate a mock single user response
 */
export function createUserResponse(user: User) {
  return {
    success: true,
    data: user,
  };
}

/**
 * Generate a mock user error response
 */
export function createUserErrorResponse(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
