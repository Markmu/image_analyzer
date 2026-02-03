/**
 * @jest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Set up environment variables before any imports
const mockEnv = {
  REPLICATE_API_TOKEN: 'test-replicate-api-token',
};

beforeAll(() => {
  Object.assign(process.env, mockEnv);
});

afterAll(() => {
  delete process.env.REPLICATE_API_TOKEN;
});

describe('Replicate Client Configuration', () => {
  describe('Module Imports', () => {
    it('should import replicate client without errors', async () => {
      const { replicate } = await import('@/lib/replicate');
      expect(replicate).toBeDefined();
    });

    it('should import vision module', async () => {
      const visionModule = await import('@/lib/replicate/vision');
      expect(visionModule).toBeDefined();
      expect(typeof visionModule.analyzeImage).toBe('function');
    });

    it('should import text module', async () => {
      const textModule = await import('@/lib/replicate/text');
      expect(textModule).toBeDefined();
      expect(typeof textModule.generateText).toBe('function');
    });

    it('should import image module', async () => {
      const imageModule = await import('@/lib/replicate/image');
      expect(imageModule).toBeDefined();
      expect(typeof imageModule.generateImage).toBe('function');
    });
  });

  describe('Replicate Client Structure', () => {
    it('should have Replicate instance configured with run method', async () => {
      const { replicate } = await import('@/lib/replicate');
      expect(replicate).toBeDefined();
      expect(typeof replicate.run).toBe('function');
    });
  });
});

describe('Vision Module', () => {
  it('should export analyzeImage function', async () => {
    const { analyzeImage } = await import('@/lib/replicate/vision');
    expect(typeof analyzeImage).toBe('function');
  });
});

describe('Text Module', () => {
  it('should export generateText function', async () => {
    const { generateText } = await import('@/lib/replicate/text');
    expect(typeof generateText).toBe('function');
  });
});

describe('Image Module', () => {
  it('should export generateImage function', async () => {
    const { generateImage } = await import('@/lib/replicate/image');
    expect(typeof generateImage).toBe('function');
  });
});
