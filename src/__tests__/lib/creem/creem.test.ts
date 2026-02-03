/**
 * @jest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Set up environment variables before any imports
const mockEnv = {
  CREEM_API_KEY: 'test-creem-api-key',
  CREEM_WEBHOOK_SECRET: 'test-webhook-secret',
};

beforeAll(() => {
  Object.assign(process.env, mockEnv);
});

afterAll(() => {
  delete process.env.CREEM_API_KEY;
  delete process.env.CREEM_WEBHOOK_SECRET;
});

describe('Creem Payment Integration', () => {
  describe('Module Imports', () => {
    it('should import creem client without errors', async () => {
      const creemModule = await import('@/lib/creem');
      expect(creemModule).toBeDefined();
    });

    it('should import checkout module', async () => {
      const checkoutModule = await import('@/lib/creem/checkout');
      expect(checkoutModule).toBeDefined();
      expect(typeof checkoutModule.createCheckoutSession).toBe('function');
    });

    it('should import webhook module', async () => {
      const webhookModule = await import('@/lib/creem/webhook');
      expect(webhookModule).toBeDefined();
      expect(typeof webhookModule.verifyWebhookSignature).toBe('function');
    });
  });

  describe('Checkout Module', () => {
    it('should export createCheckoutSession function', async () => {
      const { createCheckoutSession } = await import('@/lib/creem/checkout');
      expect(typeof createCheckoutSession).toBe('function');
    });

    it('should export getProduct function', async () => {
      const { getProduct } = await import('@/lib/creem/checkout');
      expect(typeof getProduct).toBe('function');
    });
  });

  describe('Webhook Module', () => {
    it('should export verifyWebhookSignature function', async () => {
      const { verifyWebhookSignature } = await import('@/lib/creem/webhook');
      expect(typeof verifyWebhookSignature).toBe('function');
    });

    it('should export handleWebhookEvent function', async () => {
      const { handleWebhookEvent } = await import('@/lib/creem/webhook');
      expect(typeof handleWebhookEvent).toBe('function');
    });
  });
});
