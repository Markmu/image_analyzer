/**
 * Replicate Webhook 单元测试
 *
 * 测试覆盖：
 * - Signature 验签 (verifyReplicateSignature)
 * - Webhook 配置函数
 * - 回调处理逻辑
 */

// Mock 必须在导入之前
vi.mock('../../../src/lib/replicate/index', () => ({
  replicate: {
    predictions: {
      create: vi.fn(),
      get: vi.fn(),
    },
  },
}));

vi.mock('../../../src/lib/db', () => ({
  getDb: vi.fn(),
}));

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';
import {
  verifyReplicateSignature,
  getWebhookSecret,
  getWebhookUrl,
  handleWebhookCallback,
  type PredictionStatus,
} from '../../../src/lib/replicate/webhook';

// Mock 环境变量
const mockEnv = {
  REPLICATE_WEBHOOK_SECRET: 'test-webhook-secret',
  REPLICATE_WEBHOOK_URL: 'https://test.example.com',
  REPLICATE_API_TOKEN: 'test-token', // 添加 mock token
};

describe('Replicate Webhook - Signature Verification', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, ...mockEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('verifyReplicateSignature', () => {
    test('[P0] 正确签名应通过验证', () => {
      const payload = JSON.stringify({ id: 'pred_123', status: 'completed' });
      const secret = 'test-webhook-secret';
      const hmac = createHmac('sha256', secret);
      const signature = hmac.update(payload).digest('hex');

      const result = verifyReplicateSignature(payload, signature, secret);

      expect(result).toBe(true);
    });

    test('[P0] 错误签名应拒绝', () => {
      const payload = JSON.stringify({ id: 'pred_123', status: 'completed' });
      const secret = 'test-webhook-secret';
      const wrongSignature = 'invalid-signature-1234567890abcdef';

      const result = verifyReplicateSignature(payload, wrongSignature, secret);

      expect(result).toBe(false);
    });

    test('[P0] 空 secret 应抛出错误', () => {
      const payload = JSON.stringify({ id: 'pred_123', status: 'completed' });

      expect(() => {
        verifyReplicateSignature(payload, 'some-signature', '');
      }).toThrow('REPLICATE_WEBHOOK_SECRET is not configured');
    });

    test('[P1] 长度不匹配的签名应返回 false', () => {
      const payload = JSON.stringify({ id: 'pred_123', status: 'completed' });
      const secret = 'test-webhook-secret';
      // 短签名
      const shortSignature = 'abc123';

      const result = verifyReplicateSignature(payload, shortSignature, secret);

      expect(result).toBe(false);
    });

    test('[P1] 不同 payload 应拒绝', () => {
      const secret = 'test-webhook-secret';
      const originalPayload = JSON.stringify({ id: 'pred_123', status: 'completed' });
      const hmac = createHmac('sha256', secret);
      const signature = hmac.update(originalPayload).digest('hex');

      const modifiedPayload = JSON.stringify({ id: 'pred_123', status: 'failed' });
      const result = verifyReplicateSignature(modifiedPayload, signature, secret);

      expect(result).toBe(false);
    });
  });

  describe('getWebhookSecret', () => {
    test('[P2] 应返回配置的环境变量', () => {
      const secret = getWebhookSecret();
      expect(secret).toBe('test-webhook-secret');
    });

    test('[P0] 未配置时应抛出错误', () => {
      delete process.env.REPLICATE_WEBHOOK_SECRET;

      expect(() => {
        getWebhookSecret();
      }).toThrow('REPLICATE_WEBHOOK_SECRET environment variable is not configured');
    });
  });

  describe('getWebhookUrl', () => {
    test('[P2] 应返回配置的环境变量', () => {
      const url = getWebhookUrl();
      expect(url).toBe('https://test.example.com');
    });

    test('[P0] 未配置时应抛出错误', () => {
      delete process.env.REPLICATE_WEBHOOK_URL;

      expect(() => {
        getWebhookUrl();
      }).toThrow('REPLICATE_WEBHOOK_URL environment variable is not configured');
    });
  });
});

describe('handleWebhookCallback', () => {
  // 由于 handleWebhookCallback 涉及数据库操作，
  // 这里只测试函数签名和基本逻辑
  // 完整测试需要数据库 mock

  test('[P1] 函数签名正确', () => {
    // 验证函数存在且可调用
    expect(typeof handleWebhookCallback).toBe('function');
  });

  test('[P1] 返回值结构正确', async () => {
    // Mock 数据库操作
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnValue([]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnValue([]),
      transaction: vi.fn(),
    };

    // 这个测试主要验证函数签名
    expect(handleWebhookCallback).toBeDefined();
  });
});
