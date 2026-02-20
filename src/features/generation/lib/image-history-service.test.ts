/**
 * Image History Service Tests
 *
 * Epic 6 - Story 6-3: Image Save
 * Tests for image history service functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getImageHistory,
  getImageHistoryDetail,
  verifyGenerationOwnership,
  deleteImageFromHistory,
} from '@/features/generation/lib/image-history-service';
import { db } from '@/lib/db';
import { generations, generationRequests } from '@/lib/db/schema';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Image History Service', () => {
  const mockUserId = 'test-user-id';
  const mockGenerationId = 123;

  const mockHistoryRecords = [
    {
      id: 1,
      imageUrl: 'https://example.com/image1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      width: 1024,
      height: 1024,
      format: 'png',
      createdAt: new Date('2024-01-03T10:00:00Z'),
      generationRequest: {
        id: 1,
        prompt: 'A beautiful landscape',
        provider: 'replicate',
        model: 'flux-schnell',
      },
    },
    {
      id: 2,
      imageUrl: 'https://example.com/image2.jpg',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      width: 1024,
      height: 1024,
      format: 'png',
      createdAt: new Date('2024-01-02T10:00:00Z'),
      generationRequest: {
        id: 2,
        prompt: 'A portrait photo',
        provider: 'replicate',
        model: 'flux-schnell',
      },
    },
    {
      id: 3,
      imageUrl: 'https://example.com/image3.jpg',
      thumbnailUrl: 'https://example.com/thumb3.jpg',
      width: 512,
      height: 512,
      format: 'jpeg',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      generationRequest: {
        id: 3,
        prompt: 'Abstract art',
        provider: 'replicate',
        model: 'flux-dev',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getImageHistory', () => {
    it('应该返回用户的图片历史记录列表', async () => {
      // Mock select chain
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockHistoryRecords),
      };

      const mockCountSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]),
      });

      vi.mocked(db.select).mockImplementation((...args: any[]) => {
        // Check if this is a count query by looking at the first argument
        if (args.length > 0 && typeof args[0] === 'object' && 'count' in args[0]) {
          return mockCountSelect() as any;
        }
        return mockQuery as any;
      });

      const result = await getImageHistory(mockUserId, {
        page: 1,
        limit: 10,
      });

      expect(result.records).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.records[0].id).toBe(1);
    });

    it('应该支持按创建时间倒序排列', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockHistoryRecords),
      };

      const mockCountSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]),
      });

      vi.mocked(db.select).mockImplementation((...args: any[]) => {
        if (args.length > 0 && typeof args[0] === 'object' && 'count' in args[0]) {
          return mockCountSelect() as any;
        }
        return mockQuery as any;
      });

      const result = await getImageHistory(mockUserId, {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(mockQuery.orderBy).toHaveBeenCalled();
      expect(result.records).toHaveLength(3);
    });

    it('应该支持分页参数', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([mockHistoryRecords[0]]),
      };

      const mockCountSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]),
      });

      vi.mocked(db.select).mockImplementation((...args: any[]) => {
        if (args.length > 0 && typeof args[0] === 'object' && 'count' in args[0]) {
          return mockCountSelect() as any;
        }
        return mockQuery as any;
      });

      const result = await getImageHistory(mockUserId, {
        page: 2,
        limit: 1,
      });

      expect(mockQuery.offset).toHaveBeenCalledWith(1); // (2-1) * 1 = 1
      expect(mockQuery.limit).toHaveBeenCalledWith(1);
      expect(result.records).toHaveLength(1);
    });
  });

  describe('getImageHistoryDetail', () => {
    it('应该返回单条历史记录详情', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockHistoryRecords[0]]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await getImageHistoryDetail(mockUserId, 1);

      expect(result.id).toBe(1);
      expect(result.imageUrl).toBe('https://example.com/image1.jpg');
      expect(result.width).toBe(1024);
      expect(result.height).toBe(1024);
      expect(result.generationRequest.prompt).toBe('A beautiful landscape');
    });

    it('当记录不存在时应该抛出错误', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      await expect(
        getImageHistoryDetail(mockUserId, 999)
      ).rejects.toThrow('Image history record not found');
    });

    it('应该验证用户权限', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockHistoryRecords[0]]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      // This should work with correct user
      const result = await getImageHistoryDetail(mockUserId, 1);
      expect(result.id).toBe(1);

      // The where clause should include userId filter
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe('verifyGenerationOwnership', () => {
    it('当用户拥有记录时应该返回 true', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockHistoryRecords[0]]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await verifyGenerationOwnership(mockUserId, 1);

      expect(result).toBe(true);
    });

    it('当用户不拥有记录时应该返回 false', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await verifyGenerationOwnership(mockUserId, 999);

      expect(result).toBe(false);
    });
  });

  describe('deleteImageFromHistory', () => {
    it('应该删除图片历史记录', async () => {
      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockHistoryRecords[0]]),
      };

      const mockDeleteQuery = {
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectQuery as any);
      vi.mocked(db.delete).mockReturnValue(mockDeleteQuery as any);

      await deleteImageFromHistory(mockUserId, 1);

      expect(mockDeleteQuery.where).toHaveBeenCalled();
    });

    it('当记录不存在时应该抛出错误', async () => {
      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectQuery as any);

      await expect(
        deleteImageFromHistory(mockUserId, 999)
      ).rejects.toThrow('Image history record not found');
    });
  });
});
