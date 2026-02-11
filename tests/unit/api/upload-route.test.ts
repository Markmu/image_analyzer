import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/route';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadToR2 } from '@/lib/r2/upload';
import { deleteFromR2 } from '@/lib/r2/download';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock('@/lib/r2/upload', () => ({
  uploadToR2: vi.fn(),
}));

vi.mock('@/lib/r2/download', () => ({
  deleteFromR2: vi.fn(),
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
    }),
  })),
}));

const mockAuth = auth as any;
const mockDb = db as any;
const mockUploadToR2 = uploadToR2 as any;
const mockDeleteFromR2 = deleteFromR2 as any;

// Helper to create mock request with FormData
function createMockRequest(formData: FormData) {
  return {
    formData: () => Promise.resolve(formData),
  } as any;
}

// Helper to create a mock File with arrayBuffer
function createMockFile(content: string, name: string, type: string, size?: number) {
  const file = new File([content], name, { type });
  if (size) {
    Object.defineProperty(file, 'size', { value: size });
  }
  // Add arrayBuffer method
  file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(file.size));
  return file;
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should reject unauthenticated users', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const request = createMockRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('AC-2: File Validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });
    });

    it('should accept JPEG format', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.jpg',
        url: 'https://example.com/test.jpg',
        size: 5 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept PNG format', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.png', 'image/png', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.png',
        url: 'https://example.com/test.png',
        size: 5 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept WebP format', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.webp', 'image/webp', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.webp',
        url: 'https://example.com/test.webp',
        size: 5 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject unsupported formats (GIF)', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.gif', 'image/gif');
      formData.append('file', file);

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_FILE_TYPE');
      expect(mockUploadToR2).not.toHaveBeenCalled();
    });

    it('should reject files larger than 10MB', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 15 * 1024 * 1024);
      formData.append('file', file);

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FILE_TOO_LARGE');
      expect(mockUploadToR2).not.toHaveBeenCalled();
    });

    it('should accept files up to 10MB', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 10 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.jpg',
        url: 'https://example.com/test.jpg',
        size: 10 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject images smaller than 200x200px', async () => {
      const sharp = await import('sharp');
      vi.mocked(sharp.default).mockReturnValueOnce({
        metadata: vi.fn().mockResolvedValue({
          width: 100,
          height: 100,
          format: 'jpeg',
        }),
      } as any);

      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_DIMENSIONS');
      expect(mockUploadToR2).not.toHaveBeenCalled();
    });

    it('should reject images larger than 8192x8192px', async () => {
      const sharp = await import('sharp');
      vi.mocked(sharp.default).mockReturnValueOnce({
        metadata: vi.fn().mockResolvedValue({
          width: 10000,
          height: 10000,
          format: 'jpeg',
        }),
      } as any);

      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_DIMENSIONS');
      expect(mockUploadToR2).not.toHaveBeenCalled();
    });

    it('should accept images with valid dimensions (200x200 to 8192x8192)', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.jpg',
        url: 'https://example.com/test.jpg',
        size: 5 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('AC-6: Database Metadata', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });
    });

    it('should save image metadata to database on successful upload', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.jpg',
        url: 'https://example.com/test.jpg',
        size: 5 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should clean up R2 file if database insert fails', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.jpg',
        url: 'https://example.com/test.jpg',
        size: 5 * 1024 * 1024,
      });

      mockDb.insert.mockImplementationOnce(() => ({
        values: vi.fn(() => Promise.reject(new Error('Database error'))),
      }));

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(mockDeleteFromR2).toHaveBeenCalledWith('images/test-user-id/test.jpg');
    });

    it('should not create database record if R2 upload fails', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockRejectedValueOnce(new Error('R2 upload failed'));

      const request = createMockRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });
    });

    it('should return image metadata on success', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      formData.append('file', file);

      mockUploadToR2.mockResolvedValueOnce({
        key: 'images/test-user-id/test.jpg',
        url: 'https://example.com/test.jpg',
        size: 5 * 1024 * 1024,
      });

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('imageId');
      expect(data.data).toHaveProperty('filePath');
      expect(data.data).toHaveProperty('fileSize');
      expect(data.data).toHaveProperty('fileFormat');
      expect(data.data).toHaveProperty('width');
      expect(data.data).toHaveProperty('height');
      expect(data.data).toHaveProperty('url');
    });

    it('should return error object with code and message on failure', async () => {
      const formData = new FormData();
      const file = createMockFile('test', 'test.gif', 'image/gif');
      formData.append('file', file);

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing file in request', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });

      const formData = new FormData();
      // No file appended

      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_FILE');
    });
  });
});
