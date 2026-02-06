/**
 * @jest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Set up environment variables before any imports
const mockEnv = {
  R2_ACCOUNT_ID: 'test-account-id',
  R2_ACCESS_KEY_ID: 'test-access-key-id',
  R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
  R2_BUCKET_NAME: 'test-bucket',
};

beforeAll(() => {
  Object.assign(process.env, mockEnv);
});

afterAll(() => {
  delete process.env.R2_ACCOUNT_ID;
  delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY;
  delete process.env.R2_BUCKET_NAME;
});

describe('R2 Storage Client Configuration', () => {
  describe('Module Imports', () => {
    it('should import r2 client without errors', async () => {
      const { r2 } = await import('@/lib/r2');
      expect(r2).toBeDefined();
    });

    it('should import upload module', async () => {
      const uploadModule = await import('@/lib/r2/upload');
      expect(uploadModule).toBeDefined();
      expect(typeof uploadModule.uploadToR2).toBe('function');
    });

    it('should import download module', async () => {
      const downloadModule = await import('@/lib/r2/download');
      expect(downloadModule).toBeDefined();
      expect(typeof downloadModule.downloadFromR2).toBe('function');
    });
  });

  describe('R2 Client Structure', () => {
    it('should have S3Client configured', async () => {
      const { r2 } = await import('@/lib/r2');
      expect(r2).toBeDefined();
      expect(typeof r2.config).toBe('object');
    });
  });
});

describe('Upload Module', () => {
  it('should export uploadToR2 function', async () => {
    const { uploadToR2 } = await import('@/lib/r2/upload');
    expect(typeof uploadToR2).toBe('function');
  });

  it('should export uploadTextToR2 function', async () => {
    const { uploadTextToR2 } = await import('@/lib/r2/upload');
    expect(typeof uploadTextToR2).toBe('function');
  });

  it('should export uploadJsonToR2 function', async () => {
    const { uploadJsonToR2 } = await import('@/lib/r2/upload');
    expect(typeof uploadJsonToR2).toBe('function');
  });

  it('should export copyToR2 function', async () => {
    const { copyToR2 } = await import('@/lib/r2/upload');
    expect(typeof copyToR2).toBe('function');
  });
});

describe('Download Module', () => {
  it('should export downloadFromR2 function', async () => {
    const { downloadFromR2 } = await import('@/lib/r2/download');
    expect(typeof downloadFromR2).toBe('function');
  });

  it('should export getSignedUrl function', async () => {
    const { getSignedDownloadUrl } = await import('@/lib/r2/download');
    expect(typeof getSignedDownloadUrl).toBe('function');
  });

  it('should export deleteFromR2 function', async () => {
    const { deleteFromR2 } = await import('@/lib/r2/download');
    expect(typeof deleteFromR2).toBe('function');
  });

  it('should export getPublicDownloadUrl function', async () => {
    const { getPublicDownloadUrl } = await import('@/lib/r2/download');
    expect(typeof getPublicDownloadUrl).toBe('function');
  });
});
