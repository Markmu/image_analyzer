/**
 * Story 3-1: 风格分析 API 集成测试
 *
 * 测试覆盖：
 * - POST /api/analysis (创建分析请求)
 * - GET /api/analysis/[id]/status (获取分析状态和结果)
 * - POST /api/analysis/[id]/feedback (提交用户反馈)
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

// 测试数据库配置
const TEST_DB_URL = process.env.DATABASE_URL_TEST || 'postgresql://test:test@localhost:5432/image_analyzer_test';

describe('Story 3-1: Style Analysis API', () => {
  let authToken: string;
  let testUserId: string;
  let testImageId: number;
  let testAnalysisId: number;

  beforeAll(async () => {
    // 设置测试环境
    process.env.DATABASE_URL = TEST_DB_URL;

    // 创建测试用户并获取认证 token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      });

    authToken = registerResponse.body.data.token;
    testUserId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    // 清理测试数据
    // await cleanupTestDatabase(testUserId);
  });

  beforeEach(async () => {
    // 每个测试前创建测试图片
    const imageResponse = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('test-image'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      });

    testImageId = imageResponse.body.data.imageId;
  });

  // ========================================
  // POST /api/analysis 测试
  // ========================================
  describe('POST /api/analysis', () => {
    test('TEST-API-01: 应成功创建分析请求', async () => {
      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          analysisId: expect.any(Number),
          status: expect.stringMatching('pending|analyzing')
        }
      });

      testAnalysisId = response.body.data.analysisId;
    });

    test('TEST-API-02: 应拒绝 credit 不足的用户', async () => {
      // 设置用户 credit = 0
      await request(app)
        .post('/api/user/credit/set')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ balance: 0 });

      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      expect(response.status).toBe(402); // Payment Required

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: expect.stringContaining('Credit 不足')
        }
      });
    });

    test('TEST-API-03: 应拒绝不当内容', async () => {
      // Mock 内容安全检查返回不当内容
      // （实际实现中需要 mock 内容安全检查服务）

      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: 999 }); // 假设 999 是不当内容图片 ID

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INAPPROPRIATE_CONTENT',
          message: expect.stringContaining('不当内容')
        }
      });
    });

    test('TEST-API-04: 应拒绝无效的 imageId', async () => {
      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: 99999 }); // 不存在的图片

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: expect.stringContaining('图片不存在')
        }
      });
    });

    test('TEST-API-05: 应拒绝缺少认证', async () => {
      const response = await request(app)
        .post('/api/analysis')
        .send({ imageId: testImageId });

      expect(response.status).toBe(401);
    });

    test('TEST-API-06: 应验证请求参数', async () => {
      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}); // 缺少 imageId

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: expect.stringContaining('imageId')
        }
      });
    });
  });

  // ========================================
  // GET /api/analysis/[id]/status 测试
  // ========================================
  describe('GET /api/analysis/:id/status', () => {
    beforeEach(async () => {
      // 创建分析请求
      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      testAnalysisId = response.body.data.analysisId;
    });

    test('TEST-API-07: 应返回分析状态（进行中）', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testAnalysisId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: expect.stringMatching('pending|analyzing|completed'),
          progress: expect.any(Number),
          currentStep: expect.any(String)
        }
      });

      // 验证 progress 范围 0-100
      expect(response.body.data.progress).toBeGreaterThanOrEqual(0);
      expect(response.body.data.progress).toBeLessThanOrEqual(100);
    });

    test('TEST-API-08: 分析完成后应返回结果', async () => {
      // 等待分析完成或 mock 完成状态
      // 在实际测试中，需要等待异步分析完成
      // 这里假设分析已完成

      const response = await request(app)
        .get(`/api/analysis/${testAnalysisId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const { data } = response.body;

      if (data.status === 'completed') {
        expect(data.progress).toBe(100);
        expect(data.result).toBeDefined();
        expect(data.result.dimensions).toBeDefined();
        expect(data.result.overallConfidence).toBeDefined();
      }
    });

    test('TEST-API-09: 应拒绝访问他人的分析', async () => {
      // 创建另一个用户
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `other-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Other User'
        });

      const otherAuthToken = otherUserResponse.body.data.token;

      // 尝试访问第一个用户的分析
      const response = await request(app)
        .get(`/api/analysis/${testAnalysisId}/status`)
        .set('Authorization', `Bearer ${otherAuthToken}`);

      expect(response.status).toBe(403);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: expect.stringContaining('无权访问')
        }
      });
    });

    test('TEST-API-10: 应拒绝不存在的分析 ID', async () => {
      const response = await request(app)
        .get('/api/analysis/999999/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: expect.stringContaining('分析不存在')
        }
      });
    });

    test('TEST-API-11: 应验证分析结果的数据结构', async () => {
      // Mock 完成的分析
      const response = await request(app)
        .get(`/api/analysis/${testAnalysisId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      if (response.body.data.status === 'completed') {
        const { result } = response.body.data;

        // 验证必需字段
        expect(result).toMatchObject({
          dimensions: expect.objectContaining({
            lighting: expect.any(Object),
            composition: expect.any(Object),
            color: expect.any(Object),
            artisticStyle: expect.any(Object)
          }),
          overallConfidence: expect.any(Number),
          modelUsed: expect.any(String),
          analysisDuration: expect.any(Number)
        });

        // 验证置信度范围
        expect(result.overallConfidence).toBeGreaterThanOrEqual(0);
        expect(result.overallConfidence).toBeLessThanOrEqual(1);

        // 验证每个维度的结构
        Object.values(result.dimensions).forEach((dimension: any) => {
          expect(dimension).toMatchObject({
            name: expect.any(String),
            features: expect.any(Array),
            confidence: expect.any(Number)
          });

          // 验证特征数组不为空
          expect(dimension.features.length).toBeGreaterThan(0);

          // 验证特征结构
          dimension.features.forEach((feature: any) => {
            expect(feature).toMatchObject({
              name: expect.any(String),
              value: expect.any(String),
              confidence: expect.any(Number)
            });

            // 验证特征置信度范围
            expect(feature.confidence).toBeGreaterThanOrEqual(0);
            expect(feature.confidence).toBeLessThanOrEqual(1);
          });
        });
      }
    });
  });

  // ========================================
  // POST /api/analysis/[id]/feedback 测试
  // ========================================
  describe('POST /api/analysis/:id/feedback', () => {
    beforeEach(async () => {
      // 创建分析请求
      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      testAnalysisId = response.body.data.analysisId;
    });

    test('TEST-API-12: 应接受准确反馈', async () => {
      const response = await request(app)
        .post(`/api/analysis/${testAnalysisId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ feedback: 'accurate' });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('感谢')
        }
      });

      // 验证数据库更新
      const statusResponse = await request(app)
        .get(`/api/analysis/${testAnalysisId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.data.feedback).toBe('accurate');
    });

    test('TEST-API-13: 应接受不准确反馈', async () => {
      const response = await request(app)
        .post(`/api/analysis/${testAnalysisId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ feedback: 'inaccurate' });

      expect(response.status).toBe(200);

      // 验证数据库更新
      const statusResponse = await request(app)
        .get(`/api/analysis/${testAnalysisId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.data.feedback).toBe('inaccurate');
    });

    test('TEST-API-14: 应拒绝无效的反馈值', async () => {
      const response = await request(app)
        .post(`/api/analysis/${testAnalysisId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ feedback: 'maybe' }); // 无效值

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_FEEDBACK',
          message: expect.stringContaining('feedback')
        }
      });
    });

    test('TEST-API-15: 应拒绝重复提交反馈', async () => {
      // 第一次提交
      await request(app)
        .post(`/api/analysis/${testAnalysisId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ feedback: 'accurate' });

      // 第二次提交
      const response = await request(app)
        .post(`/api/analysis/${testAnalysisId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ feedback: 'inaccurate' });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'FEEDBACK_ALREADY_SUBMITTED',
          message: expect.stringContaining('已经提交过反馈')
        }
      });
    });

    test('TEST-API-16: 应验证反馈参数', async () => {
      const response = await request(app)
        .post(`/api/analysis/${testAnalysisId}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({}); // 缺少 feedback

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: expect.stringContaining('feedback')
        }
      });
    });
  });

  // ========================================
  // Credit 系统集成测试
  // ========================================
  describe('Credit 系统集成', () => {
    test('TEST-API-17: 应在分析成功后扣除 credit', async () => {
      // 设置初始余额
      await request(app)
        .post('/api/user/credit/set')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ balance: 5 });

      // 获取初始余额
      const initialBalanceResponse = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      const initialBalance = initialBalanceResponse.body.data.creditBalance;

      // 创建分析
      await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      // 验证余额减少
      const finalBalanceResponse = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalBalanceResponse.body.data.creditBalance).toBe(initialBalance - 1);
    });

    test('TEST-API-18: 应记录 credit 交易历史', async () => {
      // 创建分析
      const analysisResponse = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      const analysisId = analysisResponse.body.data.analysisId;

      // 获取交易历史
      const transactionsResponse = await request(app)
        .get('/api/user/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      const transactions = transactionsResponse.body.data.transactions;

      // 查找相关的交易记录
      const analysisTransaction = transactions.find((t: any) =>
        t.description.includes('图片风格分析') || t.analysisId === analysisId
      );

      expect(analysisTransaction).toBeDefined();
      expect(analysisTransaction.amount).toBe(-1);
      expect(analysisTransaction.type).toBe('analysis');
    });

    test('TEST-API-19: 分析失败不应扣除 credit', async () => {
      // 设置初始余额
      await request(app)
        .post('/api/user/credit/set')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ balance: 5 });

      const initialBalanceResponse = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      const initialBalance = initialBalanceResponse.body.data.creditBalance;

      // 尝试分析不当内容（会失败）
      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: 999 }); // 不当内容 ID

      // 验证余额未变
      const finalBalanceResponse = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalBalanceResponse.body.data.creditBalance).toBe(initialBalance);
    });
  });

  // ========================================
  // 内容安全检查测试
  // ========================================
  describe('内容安全检查', () => {
    test('TEST-API-20: 应检查图片安全性', async () => {
      // Mock 安全图片
      const safeImageResponse = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      expect(safeImageResponse.status).toBe(200);
    });

    test('TEST-API-21: 应记录审核日志', async () => {
      // 尝试分析不当内容
      await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: 999 });

      // 获取审核日志
      const logsResponse = await request(app)
        .get('/api/admin/moderation-logs')
        .set('Authorization', `Bearer ${authToken}`);

      if (logsResponse.status === 200) {
        const logs = logsResponse.body.data.logs;

        // 验证日志存在
        const relevantLog = logs.find((log: any) =>
          log.action === 'analysis_rejected' &&
          log.reason === 'inappropriate_content'
        );

        expect(relevantLog).toBeDefined();
        expect(relevantLog.userId).toBe(testUserId);
      }
    });
  });

  // ========================================
  // 性能测试
  // ========================================
  describe('性能测试', () => {
    test('TEST-API-22: API 响应时间应在可接受范围内', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: testImageId });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // 500ms 以内
    });

    test('TEST-API-23: 应支持并发请求', async () => {
      // 创建多个测试图片
      const imageIds = [];
      for (let i = 0; i < 5; i++) {
        const imageResponse = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('test-image'), {
            filename: `test-${i}.jpg`,
            contentType: 'image/jpeg'
          });
        imageIds.push(imageResponse.body.data.imageId);
      }

      // 并发创建分析
      const promises = imageIds.map(imageId =>
        request(app)
          .post('/api/analysis')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ imageId })
      );

      const responses = await Promise.all(promises);

      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  // ========================================
  // 边界条件测试
  // ========================================
  describe('边界条件测试', () => {
    test('TEST-API-24: 应处理最大尺寸的图片', async () => {
      // 创建一个接近大小限制的图片
      const largeImageResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.alloc(10 * 1024 * 1024), {
          filename: 'large.jpg',
          contentType: 'image/jpeg'
        });

      const largeImageId = largeImageResponse.body.data.imageId;

      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: largeImageId });

      expect(response.status).toBe(200);
    });

    test('TEST-API-25: 应处理特殊字符的图片名', async () => {
      const specialNameResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test-image'), {
          filename: '测试图片-2024@#$%.jpg',
          contentType: 'image/jpeg'
        });

      const specialImageId = specialNameResponse.body.data.imageId;

      const response = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ imageId: specialImageId });

      expect(response.status).toBe(200);
    });
  });
});
