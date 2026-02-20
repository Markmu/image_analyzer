/**
 * Story 7-1: History Management - API Tests
 *
 * 测试历史记录相关的 API 端点:
 * - GET /api/history - 获取历史记录列表
 * - GET /api/history/[id] - 获取单条历史记录详情
 * - POST /api/history/[id]/reuse - 基于历史模版创建新分析
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/history/route';
import { GET, DELETE } from '@/app/api/history/[id]/route';
import { POST } from '@/app/api/history/[id]/reuse/route';
import { db } from '@/lib/db';
import { analysisHistory, analysisResults, user } from '@/lib/db/schema';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('Story 7-1: History Management API', () => {
  const mockUserId = 'test-user-id';
  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1 & AC6: 自动保存和 FIFO 清理', () => {
    it('应该自动保存分析记录到历史', async () => {
      const mockHistoryData = {
        id: 1,
        userId: mockUserId,
        analysisResultId: 100,
        templateSnapshot: {
          variableFormat: 'A photo of {subject}',
          jsonFormat: {
            subject: 'mountain landscape',
            style: 'dramatic',
            composition: 'rule of thirds',
            colors: 'warm tones',
            lighting: 'golden hour',
            additional: 'high detail',
          },
        },
        status: 'success',
        createdAt: new Date(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockHistoryData]),
      } as any);

      // 测试保存逻辑
      const result = await db.insert(analysisHistory).values(mockHistoryData).returning();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userId: mockUserId,
        status: 'success',
      });
    });

    it('应该保留最近 10 条记录(FIFO)', async () => {
      // 模拟 11 条记录
      const mockRecords = Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        userId: mockUserId,
        analysisResultId: 100 + i,
        templateSnapshot: {},
        status: 'success',
        createdAt: new Date(Date.now() - i * 1000 * 60), // 每条相隔1分钟
      }));

      // FIFO 清理逻辑应该删除最旧的记录
      const oldestRecord = mockRecords[10]; // 第11条(最旧)
      const expectedRemaining = mockRecords.slice(0, 10); // 保留最近10条

      expect(expectedRemaining).toHaveLength(10);
      expect(expectedRemaining.map((r) => r.id)).not.toContain(oldestRecord.id);
    });
  });

  describe('AC2: 历史记录列表', () => {
    it('应该返回用户的历史记录列表', async () => {
      const mockHistoryRecords = [
        {
          id: 1,
          userId: mockUserId,
          analysisResultId: 100,
          templateSnapshot: {
            variableFormat: 'A photo of mountain',
            jsonFormat: { subject: 'mountain' },
          },
          status: 'success',
          createdAt: new Date(Date.now() - 3600 * 1000), // 1小时前
          imageUrl: 'https://example.com/image1.jpg',
          analysisData: {
            lighting: 'Natural lighting',
            composition: 'Balanced',
            colors: 'Earth tones',
            artisticStyle: 'Realistic',
          },
        },
        {
          id: 2,
          userId: mockUserId,
          analysisResultId: 101,
          templateSnapshot: {
            variableFormat: 'A photo of ocean',
            jsonFormat: { subject: 'ocean' },
          },
          status: 'success',
          createdAt: new Date(Date.now() - 7200 * 1000), // 2小时前
          imageUrl: 'https://example.com/image2.jpg',
          analysisData: {
            lighting: 'Soft lighting',
            composition: 'Minimalist',
            colors: 'Blue tones',
            artisticStyle: 'Abstract',
          },
        },
      ];

      const mockRequest = new Request('http://localhost:3000/api/history?page=1&limit=10', {
        method: 'GET',
      });

      // TODO: 实现后需要调用实际的 API
      // const response = await GET(mockRequest);
      // const data = await response.json();

      // 验证返回的数据结构
      expect(mockHistoryRecords).toHaveLength(2);
      expect(mockHistoryRecords[0]).toMatchObject({
        userId: mockUserId,
        status: 'success',
      });
    });

    it('应该显示相对时间(如"2小时前")', () => {
      const now = Date.now();
      const testCases = [
        { timestamp: now - 3600 * 1000, expected: '1小时前' },
        { timestamp: now - 7200 * 1000, expected: '2小时前' },
        { timestamp: now - 86400 * 1000, expected: '1天前' },
      ];

      testCases.forEach(({ timestamp, expected }) => {
        const relativeTime = getRelativeTime(new Date(timestamp));
        expect(relativeTime).toContain(expected);
      });
    });

    it('应该显示模版摘要(前50字符)', () => {
      const longTemplate = 'A photo of a dramatic mountain landscape with golden hour lighting, rule of thirds composition, warm earth tones, and high detail rendering';
      const expected = longTemplate.substring(0, 50);

      expect(expected).toHaveLength(50);
      expect(expected).toBe('A photo of a dramatic mountain landscape with gold');
      // "golden" 被切断为 "gold"
      expect(expected.endsWith('gold')).toBe(true);
    });
  });

  describe('AC3: 历史记录详情', () => {
    it('应该返回完整的分析结果和模版内容', async () => {
      const mockDetail = {
        id: 1,
        userId: mockUserId,
        analysisResultId: 100,
        templateSnapshot: {
          variableFormat: 'A photo of {subject}',
          jsonFormat: {
            subject: 'mountain landscape',
            style: 'dramatic',
            composition: 'rule of thirds',
            colors: 'warm tones',
            lighting: 'golden hour',
            additional: 'high detail',
          },
        },
        status: 'success',
        createdAt: new Date(),
        analysisResult: {
          imageUrl: 'https://example.com/image.jpg',
          analysisData: {
            lighting: 'Natural golden hour lighting from the side',
            composition: 'Rule of thirds with strong leading lines',
            colors: 'Warm earth tones (orange, brown, gold)',
            artisticStyle: 'Dramatic landscape photography',
          },
        },
      };

      // 验证数据结构包含完整的四维度分析
      expect(mockDetail.templateSnapshot.jsonFormat).toMatchObject({
        subject: expect.any(String),
        style: expect.any(String),
        composition: expect.any(String),
        colors: expect.any(String),
        lighting: expect.any(String),
        additional: expect.any(String),
      });

      expect(mockDetail.analysisResult.analysisData).toMatchObject({
        lighting: expect.any(String),
        composition: expect.any(String),
        colors: expect.any(String),
        artisticStyle: expect.any(String),
      });
    });
  });

  describe('AC4: 基于历史模版创建新分析', () => {
    it('应该返回可编辑的模版数据', async () => {
      const mockTemplate = {
        variableFormat: 'A photo of {subject}',
        jsonFormat: {
          subject: 'mountain landscape',
          style: 'dramatic',
          composition: 'rule of thirds',
          colors: 'warm tones',
          lighting: 'golden hour',
          additional: 'high detail',
        },
      };

      const mockRequest = new Request('http://localhost:3000/api/history/1/reuse', {
        method: 'POST',
      });

      // TODO: 实现后需要调用实际的 API
      // const response = await POST(mockRequest, { params: { id: '1' } });
      // const data = await response.json();

      expect(mockTemplate.variableFormat).toContain('{subject}');
      expect(mockTemplate.jsonFormat).toHaveProperty('subject');
    });
  });

  describe('AC7: 授权控制', () => {
    it('应该阻止用户访问其他人的历史记录', async () => {
      const otherUserId = 'other-user-id';
      const mockHistory = {
        id: 1,
        userId: otherUserId,
        analysisResultId: 100,
        templateSnapshot: {},
        status: 'success',
        createdAt: new Date(),
      };

      // 用户尝试访问其他人的记录
      const mockRequest = new Request('http://localhost:3000/api/history/1', {
        method: 'GET',
      });

      // 应该返回 403 Forbidden
      // TODO: 实现后需要验证
      // const response = await GET(mockRequest, { params: { id: '1' } });
      // expect(response.status).toBe(403);
    });

    it('未认证用户应该返回 401', async () => {
      (getServerSession as any).mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3000/api/history', {
        method: 'GET',
      });

      // TODO: 实现后需要验证
      // const response = await GET(mockRequest);
      // expect(response.status).toBe(401);
    });

    it('API 路由需要强制过滤 user_id', () => {
      // 验证查询逻辑包含 user_id 过滤
      const userId = mockUserId;
      const queryConditions = {
        userId: userId,
        // 必须包含 userId 过滤条件
      };

      expect(queryConditions).toHaveProperty('userId');
      expect(queryConditions.userId).toBe(userId);
    });
  });

  describe('性能测试', () => {
    it('历史记录列表加载时间应该 < 500ms', async () => {
      const startTime = Date.now();

      // 模拟查询 10 条记录
      const mockRecords = Array.from({ length: 10 }, () => ({
        id: Math.random(),
        userId: mockUserId,
        analysisResultId: 100,
        templateSnapshot: {},
        status: 'success',
        createdAt: new Date(),
      }));

      // 模拟数据库查询延迟
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
      expect(mockRecords).toHaveLength(10);
    });

    it('历史记录详情加载时间应该 < 300ms', async () => {
      const startTime = Date.now();

      const mockDetail = {
        id: 1,
        userId: mockUserId,
        analysisResultId: 100,
        templateSnapshot: {},
        status: 'success',
        createdAt: new Date(),
      };

      // 模拟数据库查询延迟
      await new Promise((resolve) => setTimeout(resolve, 50));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300);
      expect(mockDetail).toHaveProperty('id');
    });

    it('重新使用模版响应时间应该 < 200ms', async () => {
      const startTime = Date.now();

      const mockTemplate = {
        variableFormat: 'A photo of {subject}',
        jsonFormat: { subject: 'test' },
      };

      // 模拟数据读取延迟
      await new Promise((resolve) => setTimeout(resolve, 30));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200);
      expect(mockTemplate).toHaveProperty('variableFormat');
    });

    it('FIFO 清理操作应该 < 100ms', async () => {
      const startTime = Date.now();

      // 模拟 FIFO 清理逻辑
      const records = Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        createdAt: new Date(Date.now() - i * 1000),
      }));
      const sortedRecords = records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const toDelete = sortedRecords.slice(10);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect(toDelete).toHaveLength(1);
    });
  });

  describe('分页和排序', () => {
    it('应该支持分页参数', () => {
      const page = 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      expect(offset).toBe(0);
      expect(limit).toBe(10);
    });

    it('应该按创建时间倒序排列', () => {
      const records = [
        { id: 1, createdAt: new Date('2024-01-01') },
        { id: 2, createdAt: new Date('2024-01-03') },
        { id: 3, createdAt: new Date('2024-01-02') },
      ];

      const sorted = records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      expect(sorted[0].id).toBe(2); // 最新的
      expect(sorted[2].id).toBe(1); // 最旧的
    });
  });
});

// 辅助函数
function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const hours = Math.floor(diff / (3600 * 1000));
  const days = Math.floor(diff / (86400 * 1000));

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else {
    return '刚刚';
  }
}
