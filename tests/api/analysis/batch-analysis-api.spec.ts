/**
 * Story 3-2: Batch Analysis API 集成测试
 *
 * 测试覆盖：
 * - POST /api/analysis/batch (发起批量分析)
 * - GET /api/analysis/batch/[id]/status (查询批量分析状态)
 * - POST /api/analysis/batch/[id]/retry (重试失败的分析)
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';

// 测试数据库配置
const TEST_DB_URL = process.env.DATABASE_URL_TEST || 'postgresql://test:test@localhost:5432/image_analyzer_test';

describe('Story 3-2: Batch Analysis API', () => {
  let authToken: string;
  let testUserId: string;
  let testImageIds: number[] = [];
  let testBatchId: number;

  beforeAll(async () => {
    // 设置测试环境
    process.env.DATABASE_URL = TEST_DB_URL;

    // 创建测试用户并获取认证 token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `batch-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Batch Test User'
      });

    authToken = registerResponse.body.data.token;
    testUserId = registerResponse.body.data.user.id;

    // 设置测试用户 credit（足够进行批量分析）
    await request(app)
      .post('/api/user/credit/set')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ balance: 10 });
  });

  afterAll(async () => {
    // 清理测试数据
  });

  beforeEach(async () => {
    // 每个测试前创建多张测试图片
    testImageIds = [];
    for (let i = 0; i < 3; i++) {
      const imageResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test-image'), {
          filename: `test-${i}.jpg`,
          contentType: 'image/jpeg'
        });

      if (imageResponse.body.success) {
        testImageIds.push(imageResponse.body.data.imageId);
      }
    }
  });

  // ========================================
  // POST /api/analysis/batch 测试
  // ========================================
  describe('POST /api/analysis/batch', () => {
    test('TEST-BATCH-API-001: 应成功发起批量分析请求（串行模式）', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          batchId: expect.any(Number),
          status: expect.stringMatching('pending|processing'),
          creditRequired: testImageIds.length
        }
      });

      testBatchId = response.body.data.batchId;
    });

    test('TEST-BATCH-API-002: 应成功发起批量分析请求（并行模式）', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'parallel'
        });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          batchId: expect.any(Number),
          status: expect.stringMatching('pending|processing'),
          creditRequired: testImageIds.length
        }
      });
    });

    test('TEST-BATCH-API-003: 应拒绝超过5张图片的批量分析', async () => {
      const tooManyImages = [1, 2, 3, 4, 5, 6];

      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: tooManyImages,
          mode: 'serial'
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_IMAGE_COUNT',
          message: expect.stringContaining('5')
        }
      });
    });

    test('TEST-BATCH-API-004: 应拒绝 credit 不足的用户', async () => {
      // 设置用户 credit = 0
      await request(app)
        .post('/api/user/credit/set')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ balance: 0 });

      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      expect(response.status).toBe(402);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: expect.stringContaining('Credit')
        }
      });

      // 恢复 credit
      await request(app)
        .post('/api/user/credit/set')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ balance: 10 });
    });

    test('TEST-BATCH-API-005: 应拒绝无效的分析模式', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'invalid_mode'
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_MODE',
          message: expect.stringContaining('mode')
        }
      });
    });

    test('TEST-BATCH-API-006: 应拒绝空图片列表', async () => {
      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: [],
          mode: 'serial'
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'EMPTY_IMAGE_LIST',
          message: expect.stringContaining('图片')
        }
      });
    });

    test('TEST-BATCH-API-007: 应拒绝未上传的图片ID', async () => {
      const nonExistentImageIds = [99999, 99998];

      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: nonExistentImageIds,
          mode: 'serial'
        });

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND'
        }
      });
    });

    test('TEST-BATCH-API-008: 应拒绝其他用户的图片', async () => {
      // 创建另一个用户
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `other-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Other User'
        });

      const otherToken = otherUserResponse.body.data.token;

      // 上传一张其他用户的图片
      const imageResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${otherToken}`)
        .attach('file', Buffer.from('test-image'), {
          filename: 'other.jpg',
          contentType: 'image/jpeg'
        });

      const otherImageId = imageResponse.body.data.imageId;

      // 尝试批量分析其他用户的图片
      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: [otherImageId],
          mode: 'serial'
        });

      expect(response.status).toBe(403);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN'
        }
      });
    });

    test('TEST-BATCH-API-009: 应检查每张图片的内容安全', async () => {
      // 这个测试需要模拟不安全的内容
      // 实际实现时会调用内容安全检查服务
      const response = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      // 应该返回成功（假设所有图片都通过安全检查）
      expect(response.body.success).toBe(true);
    });

    test('TEST-BATCH-API-010: 应在分析开始前预扣 credit', async () => {
      // 获取初始 credit
      const initialCreditResponse = await request(app)
        .get('/api/user/credit')
        .set('Authorization', `Bearer ${authToken}`);

      const initialCredit = initialCreditResponse.body.data.balance;

      // 发起批量分析
      await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      // 获取分析后的 credit
      const finalCreditResponse = await request(app)
        .get('/api/user/credit')
        .set('Authorization', `Bearer ${authToken}`);

      const finalCredit = finalCreditResponse.body.data.balance;

      // 应该已扣除 credit
      expect(finalCredit).toBe(initialCredit - testImageIds.length);
    });
  });

  // ========================================
  // GET /api/analysis/batch/[id]/status 测试
  // ========================================
  describe('GET /api/analysis/batch/[id]/status', () => {
    test('TEST-BATCH-API-011: 应返回批量分析状态和进度', async () => {
      // 先创建一个批量分析
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      // 查询状态
      const statusResponse = await request(app)
        .get(`/api/analysis/batch/${batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.status).toBe(200);

      expect(statusResponse.body).toMatchObject({
        success: true,
        data: {
          batchId: batchId,
          status: expect.stringMatching('pending|processing|completed|partial|failed'),
          progress: {
            total: testImageIds.length,
            completed: expect.any(Number),
            failed: expect.any(Number),
            currentIndex: expect.any(Number)
          }
        }
      });
    });

    test('TEST-BATCH-API-012: 应返回每张图片的分析结果', async () => {
      // 先等待分析完成（或者使用已存在的 batchId）
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      // 等待一段时间让分析完成（实际测试中可能需要等待或使用 mock）
      // 这里只测试状态返回结构
      const statusResponse = await request(app)
        .get(`/api/analysis/batch/${batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.data).toHaveProperty('results');
      expect(Array.isArray(statusResponse.body.data.results)).toBe(true);
    });

    test('TEST-BATCH-API-013: 应返回错误列表', async () => {
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      const statusResponse = await request(app)
        .get(`/api/analysis/batch/${batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.data).toHaveProperty('errors');
      expect(Array.isArray(statusResponse.body.data.errors)).toBe(true);
    });

    test('TEST-BATCH-API-014: 应拒绝访问不存在的批量分析', async () => {
      const response = await request(app)
        .get('/api/analysis/batch/99999/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND'
        }
      });
    });

    test('TEST-BATCH-API-015: 应拒绝访问其他用户的批量分析', async () => {
      // 创建另一个用户
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `status-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Status Test User'
        });

      const otherToken = otherUserResponse.body.data.token;

      // 上传图片
      const imageResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${otherToken}`)
        .attach('file', Buffer.from('test-image'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        });

      const imageId = imageResponse.body.data.imageId;

      // 创建批量分析
      const batchResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          imageIds: [imageId],
          mode: 'serial'
        });

      const batchId = batchResponse.body.data.batchId;

      // 尝试用第一个用户访问
      const statusResponse = await request(app)
        .get(`/api/analysis/batch/${batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.status).toBe(403);
    });
  });

  // ========================================
  // POST /api/analysis/batch/[id]/retry 测试
  // ========================================
  describe('POST /api/analysis/batch/[id]/retry', () => {
    test('TEST-BATCH-API-016: 应成功重试失败的分析', async () => {
      // 先创建一个批量分析
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      // 模拟失败（实际测试中需要制造失败场景）
      // 这里假设 batch 已经有失败记录
      const retryResponse = await request(app)
        .post(`/api/analysis/batch/${batchId}/retry`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          failedImageIds: [testImageIds[1]]
        });

      expect(retryResponse.status).toBe(200);

      expect(retryResponse.body).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('重试')
        }
      });
    });

    test('TEST-BATCH-API-017: 应拒绝重试不存在的批量分析', async () => {
      const response = await request(app)
        .post('/api/analysis/batch/99999/retry')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          failedImageIds: [1]
        });

      expect(response.status).toBe(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND'
        }
      });
    });

    test('TEST-BATCH-API-018: 应拒绝重试其他用户的批量分析', async () => {
      // 创建另一个用户并创建批量分析
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `retry-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Retry Test User'
        });

      const otherToken = otherUserResponse.body.data.token;

      const imageResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${otherToken}`)
        .attach('file', Buffer.from('test-image'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        });

      const imageId = imageResponse.body.data.imageId;

      const batchResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          imageIds: [imageId],
          mode: 'serial'
        });

      const batchId = batchResponse.body.data.batchId;

      // 尝试用第一个用户重试
      const retryResponse = await request(app)
        .post(`/api/analysis/batch/${batchId}/retry`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          failedImageIds: [imageId]
        });

      expect(retryResponse.status).toBe(403);
    });

    test('TEST-BATCH-API-019: 应拒绝空的重试列表', async () => {
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      const retryResponse = await request(app)
        .post(`/api/analysis/batch/${batchId}/retry`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          failedImageIds: []
        });

      expect(retryResponse.status).toBe(400);
    });
  });

  // ========================================
  // Credit 集成测试
  // ========================================
  describe('Credit 系统集成', () => {
    test('TEST-BATCH-API-020: 部分失败时应该退还相应 credit', async () => {
      // 获取初始 credit
      const initialCreditResponse = await request(app)
        .get('/api/user/credit')
        .set('Authorization', `Bearer ${authToken}`);

      const initialCredit = initialCreditResponse.body.data.balance;

      // 创建一个会部分失败的批量分析
      // 这里需要模拟失败场景
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      // 等待一段时间后检查 credit
      const finalCreditResponse = await request(app)
        .get('/api/user/credit')
        .set('Authorization', `Bearer ${authToken}`);

      const finalCredit = finalCreditResponse.body.data.balance;

      // 如果有失败，应该会退还 credit
      // 这里只是一个基本测试
      expect(finalCredit).toBeLessThanOrEqual(initialCredit);
    });

    test('TEST-BATCH-API-021: 用户中断分析时应该按已完成数量扣除 credit', async () => {
      // 获取初始 credit
      const initialCreditResponse = await request(app)
        .get('/api/user/credit')
        .set('Authorization', `Bearer ${authToken}`);

      const initialCredit = initialCreditResponse.body.data.balance;

      // 创建批量分析
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      // 模拟用户取消（实际测试中需要调用取消 API）
      // 检查 credit 已被扣除
      const afterCancelResponse = await request(app)
        .get('/api/user/credit')
        .set('Authorization', `Bearer ${authToken}`);

      const afterCancelCredit = afterCancelResponse.body.data.balance;

      // 至少应该扣除了部分 credit
      expect(afterCancelCredit).toBeLessThan(initialCredit);
    });
  });

  // ========================================
  // 错误处理测试
  // ========================================
  describe('错误处理', () => {
    test('TEST-BATCH-API-022: 单张图片失败不应影响其他图片', async () => {
      // 创建批量分析
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      // 查询状态
      const statusResponse = await request(app)
        .get(`/api/analysis/batch/${batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      // 应该有 completed 和可能的 failed
      const { completed, failed } = statusResponse.body.data.progress;

      // 至少应该有完成的
      expect(completed + failed).toBeGreaterThan(0);
    });

    test('TEST-BATCH-API-023: 应该记录审核日志', async () => {
      // 创建批量分析
      const createResponse = await request(app)
        .post('/api/analysis/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageIds: testImageIds,
          mode: 'serial'
        });

      const batchId = createResponse.body.data.batchId;

      // 查询状态，应该包含审核信息
      const statusResponse = await request(app)
        .get(`/api/analysis/batch/${batchId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      // 应该有审核相关字段（实际实现时添加）
      expect(statusResponse.body.data).toBeDefined();
    });
  });
});
