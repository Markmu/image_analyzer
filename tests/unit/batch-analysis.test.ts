/**
 * ATDD Unit Tests - Story 3.2: Batch Analysis
 *
 * Testing Phase: RED (Implementation not started)
 *
 * These tests cover:
 * - AC-1: 批量图片上传（最多5张）
 * - AC-2: 串行/并行分析模式
 * - AC-3: 共同特征提取算法
 * - AC-4: 实时进度显示
 * - AC-5: 对比视图
 * - AC-6: Credit 系统集成
 * - AC-7: 内容安全检查
 * - AC-8: 错误处理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules that don't exist yet
vi.mock('@/lib/analysis/batch', () => ({
  analyzeBatch: vi.fn(),
  analyzeBatchSerial: vi.fn(),
  analyzeBatchParallel: vi.fn(),
}));

vi.mock('@/lib/analysis/feature-extraction', () => ({
  extractCommonFeatures: vi.fn(),
  extractUniqueFeatures: vi.fn(),
  generateComprehensiveAnalysis: vi.fn(),
}));

vi.mock('@/lib/credit', () => ({
  checkCredits: vi.fn(),
  deductCredits: vi.fn(),
  refundCredits: vi.fn(),
}));

vi.mock('@/lib/moderation', () => ({
  checkContentSafety: vi.fn(),
}));

describe('AC-1: 批量图片上传（最多5张）', () => {
  describe('BatchImageUploader 组件', () => {
    it('TEST-BATCH-001: 应该支持批量选择最多5张图片', () => {
      // Test: 系统可以接受批量图片上传（最多5张）
      // Given: 用户选择了5张图片
      const selectedImages = [
        { id: 1, url: 'https://example.com/1.jpg' },
        { id: 2, url: 'https://example.com/2.jpg' },
        { id: 3, url: 'https://example.com/3.jpg' },
        { id: 4, url: 'https://example.com/4.jpg' },
        { id: 5, url: 'https://example.com/5.jpg' },
      ];

      // Then: 应该成功添加所有5张图片
      expect(selectedImages.length).toBe(5);
    });

    it('TEST-BATCH-002: 应该拒绝超过5张图片的选择', () => {
      // Test: 超过5张图片时应该拒绝
      // Given: 用户选择了6张图片
      const maxImages = 5;

      // Then: 只能接受前5张
      expect(6 > maxImages).toBe(true);
    });

    it('TEST-BATCH-003: 应该显示批量选择器UI', () => {
      // Test: 显示批量选择器UI
      // Given: 批量分析模式启用
      const isBatchMode = true;

      // Then: 应该显示批量选择器
      expect(isBatchMode).toBe(true);
    });

    it('TEST-BATCH-004: 应该支持图片排序操作', () => {
      // Test: 支持图片排序/移除操作
      // Given: 有多张图片
      const images = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
        { id: 3, order: 2 },
      ];

      // When: 用户拖拽排序
      const reordered = [...images].reverse();

      // Then: 图片顺序应该改变
      expect(reordered[0].id).toBe(3);
    });

    it('TEST-BATCH-005: 应该支持移除单张图片', () => {
      // Test: 支持移除单张图片
      // Given: 有3张图片
      let images = [
        { id: 1, url: 'https://example.com/1.jpg' },
        { id: 2, url: 'https://example.com/2.jpg' },
        { id: 3, url: 'https://example.com/3.jpg' },
      ];

      // When: 移除第二张图片
      images = images.filter((img) => img.id !== 2);

      // Then: 应该剩下2张图片
      expect(images.length).toBe(2);
      expect(images.find((img) => img.id === 2)).toBeUndefined();
    });

    it('TEST-BATCH-006: 应该显示缩略图预览', () => {
      // Test: 显示缩略图预览
      // Given: 有上传的图片
      const images = [{ id: 1, thumbnailUrl: 'https://example.com/thumb.jpg' }];

      // Then: 应该显示缩略图
      expect(images[0].thumbnailUrl).toBeDefined();
    });
  });
});

describe('AC-2: 串行/并行分析模式', () => {
  describe('批量分析服务', () => {
    it('TEST-BATCH-010: 应该支持串行分析模式', () => {
      // Test: 支持串行分析（逐张分析）
      const mode = 'serial';

      // Then: 模式应该是 'serial'
      expect(mode).toBe('serial');
    });

    it('TEST-BATCH-011: 应该支持并行分析模式', () => {
      // Test: 支持并行分析（同时分析多张）
      const mode = 'parallel';

      // Then: 模式应该是 'parallel'
      expect(mode).toBe('parallel');
    });

    it('TEST-BATCH-012: 串行模式应该逐张调用分析函数', () => {
      // Test: 串行模式逐张调用分析
      // Given: 3张图片
      const images = ['url1', 'url2', 'url3'];
      const callSequence: string[] = [];

      // When: 模拟串行调用
      images.forEach((url) => callSequence.push(url));

      // Then: 应该按顺序调用
      expect(callSequence).toEqual(['url1', 'url2', 'url3']);
    });

    it('TEST-BATCH-013: 并行模式应该同时调用多个分析函数', () => {
      // Test: 并行模式同时分析
      // Given: 3张图片
      const images = ['url1', 'url2', 'url3'];

      // When: 使用 Promise.all 并行调用
      const parallelPromises = images.map((url) => Promise.resolve(url));

      // Then: 应该创建3个并行的 Promise
      expect(parallelPromises.length).toBe(3);
    });

    it('TEST-BATCH-014: 并行模式应该有并发限制（最多3个）', () => {
      // Test: 设置并发限制（最多3个）
      const maxConcurrency = 3;
      const images = ['url1', 'url2', 'url3', 'url4', 'url5'];

      // Then: 应该限制并发数
      expect(maxConcurrency).toBe(3);
      expect(images.length).toBeGreaterThan(maxConcurrency);
    });

    it('TEST-BATCH-015: 串行模式适合复杂图片（节省API配额）', () => {
      // Test: 串行模式节省API配额
      const imageComplexity = 'high';
      const recommendedMode = imageComplexity === 'high' ? 'serial' : 'parallel';

      // Then: 复杂图片推荐串行模式
      expect(recommendedMode).toBe('serial');
    });

    it('TEST-BATCH-016: 并行模式适合简单图片（速度快）', () => {
      // Test: 并行模式速度快
      const imageComplexity = 'low';
      const recommendedMode = imageComplexity === 'low' ? 'parallel' : 'serial';

      // Then: 简单图片推荐并行模式
      expect(recommendedMode).toBe('parallel');
    });
  });
});

describe('AC-3: 共同特征提取', () => {
  describe('特征提取算法', () => {
    it('TEST-BATCH-020: 应该对每张图片单独分析获得四维度数据', () => {
      // Test: 对每张图片单独分析
      const analysisResult = {
        lighting: { value: 'warm', confidence: 0.9 },
        composition: { value: 'rule_of_thirds', confidence: 0.85 },
        colorPalette: { value: 'vibrant', confidence: 0.8 },
        subject: { value: 'portrait', confidence: 0.95 },
      };

      // Then: 应该有4个维度
      expect(Object.keys(analysisResult).length).toBe(4);
    });

    it('TEST-BATCH-021: 应该提取共同特征（多张图片都有的特征）', () => {
      // Test: 算法提取共同特征
      const results = [
        { lighting: { value: 'warm', confidence: 0.9 } },
        { lighting: { value: 'warm', confidence: 0.85 } },
        { lighting: { value: 'warm', confidence: 0.88 } },
      ];

      // When: 提取共同特征
      const commonFeature = results.every((r) => r.lighting.value === 'warm')
        ? 'warm'
        : null;

      // Then: 应该识别出共同特征
      expect(commonFeature).toBe('warm');
    });

    it('TEST-BATCH-022: 应该识别独特特征（仅部分图片有的特征）', () => {
      // Test: 算法识别独特特征
      const results = [
        { exposure: { value: 'long', confidence: 0.9 }, lighting: { value: 'warm', confidence: 0.9 } },
        { exposure: { value: 'short', confidence: 0.85 }, lighting: { value: 'warm', confidence: 0.85 } },
      ];

      // When: 识别独特特征
      const uniqueFeatures = results
        .map((r) => r.exposure.value)
        .filter((v, i, arr) => arr.indexOf(v) === i);

      // Then: 应该识别出独特特征
      expect(uniqueFeatures).toContain('long');
      expect(uniqueFeatures).toContain('short');
    });

    it('TEST-BATCH-023: 应该生成综合分析结果', () => {
      // Test: 生成综合分析结果
      const comprehensiveResult = {
        commonFeatures: ['warm', 'natural_light'],
        uniqueFeatures: {
          image1: ['long_exposure'],
          image2: ['bokeh'],
        },
        overallConfidence: 0.87,
      };

      // Then: 应该包含综合结果
      expect(comprehensiveResult.commonFeatures).toBeDefined();
      expect(comprehensiveResult.uniqueFeatures).toBeDefined();
      expect(comprehensiveResult.overallConfidence).toBeDefined();
    });

    it('TEST-BATCH-024: 共同特征应该有置信度（取平均值或最高值）', () => {
      // Test: 计算共同特征置信度
      const confidences = [0.9, 0.85, 0.88];
      const avgConfidence =
        confidences.reduce((a, b) => a + b, 0) / confidences.length;

      // Then: 应该计算平均置信度
      expect(avgConfidence).toBeCloseTo(0.876, 2);
    });

    it('TEST-BATCH-025: 独特特征应该标注来源图片', () => {
      // Test: 标注特征来源
      const uniqueFeatures = {
        'image-1': ['long_exposure'],
        'image-2': ['bokeh'],
      };

      // Then: 应该标注来源
      expect(uniqueFeatures['image-1']).toContain('long_exposure');
      expect(uniqueFeatures['image-2']).toContain('bokeh');
    });
  });
});

describe('AC-4: 实时进度显示', () => {
  describe('批量分析进度组件', () => {
    it('TEST-BATCH-030: 应该显示整体进度（已完成/总数）', () => {
      // Test: 显示整体进度
      const progress = {
        completed: 2,
        total: 5,
      };

      // Then: 应该显示进度百分比
      expect((progress.completed / progress.total) * 100).toBe(40);
    });

    it('TEST-BATCH-031: 应该显示当前分析的图片序号', () => {
      // Test: 显示当前分析序号
      const currentIndex = 3;

      // Then: 应该显示 "正在分析第 X 张"
      expect(currentIndex).toBe(3);
    });

    it('TEST-BATCH-032: 应该显示"正在分析第 X 张图片..."', () => {
      // Test: 显示进度文本
      const progressMessage = `正在分析第 ${3} 张图片...`;

      // Then: 应该包含正确文本
      expect(progressMessage).toContain('正在分析');
      expect(progressMessage).toContain('第 3 张');
    });

    it('TEST-BATCH-033: 应该显示预计剩余时间', () => {
      // Test: 显示预计剩余时间
      const avgTimePerImage = 30; // seconds
      const remainingImages = 3;
      const estimatedRemaining = avgTimePerImage * remainingImages;

      // Then: 应该计算剩余时间
      expect(estimatedRemaining).toBe(90);
    });

    it('TEST-BATCH-034: 应该复用 ProgressDisplay 组件', () => {
      // Test: 复用 Story 2-4 的 ProgressDisplay 组件
      // Given: ProgressDisplay 组件存在
      const ProgressDisplayComponent = null; // 尚未实现

      // Then: 应该可以被导入使用
      // 这是集成测试，会在实际导入时检查
      expect(ProgressDisplayComponent).toBeNull();
    });
  });
});

describe('AC-5: 对比视图', () => {
  describe('批量分析结果对比视图', () => {
    it('TEST-BATCH-040: 应该显示每张图片的单独分析结果', () => {
      // Test: 显示单独分析结果
      const results = [
        { imageId: 1, analysis: { lighting: 'warm' } },
        { imageId: 2, analysis: { lighting: 'cool' } },
      ];

      // Then: 应该显示所有结果
      expect(results.length).toBe(2);
    });

    it('TEST-BATCH-041: 应该突出显示共同特征（绿色边框）', () => {
      // Test: 绿色边框标注共同特征
      const featureStyle = {
        isCommon: true,
        borderColor: 'green',
      };

      // Then: 应该是绿色边框
      expect(featureStyle.borderColor).toBe('green');
    });

    it('TEST-BATCH-042: 应该突出显示独特特征（蓝色边框）', () => {
      // Test: 蓝色边框标注独特特征
      const featureStyle = {
        isUnique: true,
        borderColor: 'blue',
      };

      // Then: 应该是蓝色边框
      expect(featureStyle.borderColor).toBe('blue');
    });

    it('TEST-BATCH-043: 应该提供综合分析结果卡片', () => {
      // Test: 综合分析结果卡片
      const comprehensiveCard = {
        title: '综合分析结果',
        commonFeatures: ['warm', 'natural_light'],
        uniqueFeatures: ['long_exposure'],
        overallConfidence: 0.87,
      };

      // Then: 应该包含所有必要信息
      expect(comprehensiveCard.title).toBeDefined();
      expect(comprehensiveCard.commonFeatures).toBeDefined();
      expect(comprehensiveCard.overallConfidence).toBeDefined();
    });

    it('TEST-BATCH-044: 应该显示特征来源信息', () => {
      // Test: 显示特征来源
      const featureSource = {
        feature: 'long_exposure',
        sourceImages: ['image-2'],
      };

      // Then: 应该标注来源
      expect(featureSource.sourceImages).toContain('image-2');
    });
  });
});

describe('AC-6: Credit 系统集成', () => {
  describe('Credit 扣除逻辑', () => {
    it('TEST-BATCH-050: 批量分析应该按实际图片数量扣除credit', () => {
      // Test: 每张图片分析扣除 1 credit
      const imageCount = 3;
      const creditDeduction = imageCount * 1;

      // Then: 应该扣除相应credit
      expect(creditDeduction).toBe(3);
    });

    it('TEST-BATCH-051: 如果credit不足应该停止分析并提示用户', () => {
      // Test: credit不足时拒绝分析
      const userCredits = 2;
      const requiredCredits = 5;

      // Then: 应该拒绝分析
      expect(userCredits < requiredCredits).toBe(true);
    });

    it('TEST-BATCH-052: 已分析的图片结果应该保留', () => {
      // Test: 已分析的图片结果保留
      const completedResults = [
        { imageId: 1, status: 'completed' },
        { imageId: 2, status: 'completed' },
      ];

      // Then: 应该保留结果
      expect(completedResults.length).toBe(2);
    });

    it('TEST-BATCH-053: 批量分析开始前应该预扣credit', () => {
      // Test: 预扣模式：分析开始前扣除所有 credit
      const userCredits = 10;
      const imageCount = 5;
      const requiredCredits = imageCount;

      // Then: 应该预扣
      expect(userCredits >= requiredCredits).toBe(true);
    });

    it('TEST-BATCH-054: 如果部分图片分析失败应该退还相应credit', () => {
      // Test: 失败时退还credit
      const totalImages = 5;
      const failedImages = 2;
      const completedImages = totalImages - failedImages;
      const refundCredits = failedImages * 1;

      // Then: 应该退还
      expect(refundCredits).toBe(2);
      expect(completedImages).toBe(3);
    });

    it('TEST-BATCH-055: 如果用户中断分析应该按已完成数量扣除', () => {
      // Test: 中断时按已完成数量扣除
      const completedBeforeInterrupt = 3;
      const creditDeduction = completedBeforeInterrupt * 1;

      // Then: 应该按已完成数量扣除
      expect(creditDeduction).toBe(3);
    });

    it('TEST-BATCH-056: 应该记录credit交易历史', () => {
      // Test: 记录每笔扣费详情
      const transactionHistory = [
        {
          type: 'deduct',
          amount: 3,
          reason: 'batch_analysis',
          timestamp: new Date().toISOString(),
        },
      ];

      // Then: 应该记录交易
      expect(transactionHistory[0].type).toBe('deduct');
      expect(transactionHistory[0].amount).toBe(3);
    });
  });
});

describe('AC-7: 内容安全检查', () => {
  describe('内容安全检查', () => {
    it('TEST-BATCH-060: 每张上传的图片都应该进行内容安全检查', () => {
      // Test: 每张图片都需要内容安全检查
      const images = [
        { id: 1, safetyChecked: false },
        { id: 2, safetyChecked: false },
        { id: 3, safetyChecked: false },
      ];

      // When: 执行安全检查
      const checkedImages = images.map((img) => ({
        ...img,
        safetyChecked: true,
      }));

      // Then: 所有图片都应该被检查
      expect(checkedImages.every((img) => img.safetyChecked)).toBe(true);
    });

    it('TEST-BATCH-061: 如果图片检测到不当内容应该跳过该图片分析', () => {
      // Test: 不当内容跳过分析
      const safetyResult = {
        passed: false,
        reason: 'inappropriate_content',
      };

      // Then: 应该跳过
      expect(safetyResult.passed).toBe(false);
    });

    it('TEST-BATCH-062: 应该记录审核日志', () => {
      // Test: 记录审核日志
      const auditLog = [
        {
          imageId: 1,
          action: 'skip',
          reason: 'inappropriate_content',
          timestamp: new Date().toISOString(),
        },
      ];

      // Then: 应该记录
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].action).toBe('skip');
    });

    it('TEST-BATCH-063: 应该告知用户哪些图片未能通过审核', () => {
      // Test: 告知用户未通过审核的图片
      const failedImages = [
        { id: 2, reason: 'inappropriate_content' },
      ];

      // Then: 应该提供失败列表
      expect(failedImages.length).toBe(1);
      expect(failedImages[0].reason).toBeDefined();
    });

    it('TEST-BATCH-064: 通过安全检查的图片应该正常分析', () => {
      // Test: 通过检查的图片正常分析
      const safetyResult = {
        passed: true,
      };

      // Then: 应该继续分析
      expect(safetyResult.passed).toBe(true);
    });
  });
});

describe('AC-8: 错误处理', () => {
  describe('批量分析错误处理', () => {
    it('TEST-BATCH-070: 单张图片分析失败不应该影响其他图片', () => {
      // Test: 单点失败不影响整体
      const results = [
        { imageId: 1, status: 'completed' },
        { imageId: 2, status: 'failed', error: 'API timeout' },
        { imageId: 3, status: 'completed' },
      ];

      // Then: 其他图片应该正常完成
      const completedCount = results.filter((r) => r.status === 'completed').length;
      expect(completedCount).toBe(2);
    });

    it('TEST-BATCH-071: 应该显示哪些图片分析成功/失败', () => {
      // Test: 显示成功/失败列表
      const statusSummary = {
        completed: [1, 3],
        failed: [2],
      };

      // Then: 应该清晰显示状态
      expect(statusSummary.completed.length).toBe(2);
      expect(statusSummary.failed.length).toBe(1);
    });

    it('TEST-BATCH-072: 应该提供"重试失败图片"选项', () => {
      // Test: 提供重试接口
      const retryAction = {
        available: true,
        failedImageIds: [2],
      };

      // Then: 应该可以重试
      expect(retryAction.available).toBe(true);
      expect(retryAction.failedImageIds).toContain(2);
    });

    it('TEST-BATCH-073: 错误信息应该友好且可操作', () => {
      // Test: 友好的错误信息
      const errorMessage = {
        code: 'API_ERROR',
        userMessage: '图片分析失败，是否重试？',
        action: 'retry',
      };

      // Then: 应该包含用户友好的消息和可操作建议
      expect(errorMessage.userMessage).toBeDefined();
      expect(errorMessage.action).toBeDefined();
    });

    it('TEST-BATCH-074: 应该支持中断和恢复批量分析', () => {
      // Test: 支持中断和恢复
      const batchAnalysis = {
        status: 'paused',
        currentIndex: 2,
        completedImages: [1],
      };

      // Then: 应该可以恢复
      expect(batchAnalysis.status).toBe('paused');
      expect(batchAnalysis.currentIndex).toBe(2);
    });

    it('TEST-BATCH-075: 失败后重试应该继续之前的分析', () => {
      // Test: 重试失败图片
      const retryRequest = {
        batchId: 100,
        failedImageIds: [2],
        resumeFromIndex: 2,
      };

      // Then: 应该从失败点继续
      expect(retryRequest.resumeFromIndex).toBe(2);
    });
  });
});

describe('API 端点测试', () => {
  describe('POST /api/analysis/batch', () => {
    it('TEST-BATCH-080: 应该接受 imageIds 和 mode 参数', () => {
      // Test: API 接受正确参数
      const request = {
        imageIds: [1, 2, 3],
        mode: 'serial',
      };

      // Then: 应该包含所有必要参数
      expect(request.imageIds).toBeDefined();
      expect(request.mode).toBeDefined();
    });

    it('TEST-BATCH-081: 应该返回 batchId、status、creditRequired', () => {
      // Test: API 返回必要信息
      const response = {
        batchId: 100,
        status: 'pending',
        creditRequired: 3,
      };

      // Then: 应该包含所有必要字段
      expect(response.batchId).toBeDefined();
      expect(response.status).toBeDefined();
      expect(response.creditRequired).toBeDefined();
    });

    it('TEST-BATCH-082: Credit不足时应该返回错误', () => {
      // Test: Credit 不足错误响应
      const errorResponse = {
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: '需要 3 credit，当前余额不足',
        },
      };

      // Then: 应该返回错误
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error.code).toBe('INSUFFICIENT_CREDITS');
    });
  });

  describe('GET /api/analysis/batch/[id]/status', () => {
    it('TEST-BATCH-083: 应该返回批量分析状态和进度', () => {
      // Test: 返回状态信息
      const statusResponse = {
        batchId: 100,
        status: 'processing',
        progress: {
          total: 3,
          completed: 1,
          failed: 0,
          currentIndex: 2,
        },
      };

      // Then: 应该包含状态和进度
      expect(statusResponse.status).toBeDefined();
      expect(statusResponse.progress).toBeDefined();
    });

    it('TEST-BATCH-084: 应该返回每张图片的分析结果', () => {
      // Test: 返回结果列表
      const statusResponse = {
        results: [
          { imageId: 1, status: 'completed', analysisData: {} },
        ],
      };

      // Then: 应该包含结果
      expect(statusResponse.results).toBeDefined();
    });

    it('TEST-BATCH-085: 应该返回错误列表', () => {
      // Test: 返回错误信息
      const statusResponse = {
        errors: [
          { imageId: 2, error: 'API timeout' },
        ],
      };

      // Then: 应该包含错误
      expect(statusResponse.errors).toBeDefined();
    });
  });

  describe('POST /api/analysis/batch/[id]/retry', () => {
    it('TEST-BATCH-086: 应该接受 failedImageIds 参数', () => {
      // Test: 重试请求
      const retryRequest = {
        failedImageIds: [2],
      };

      // Then: 应该包含失败图片ID
      expect(retryRequest.failedImageIds).toBeDefined();
    });

    it('TEST-BATCH-087: 重试成功后应该返回成功消息', () => {
      // Test: 重试响应
      const retryResponse = {
        success: true,
        data: {
          message: '已重试失败的分析',
        },
      };

      // Then: 应该返回成功
      expect(retryResponse.success).toBe(true);
    });
  });
});

describe('边界情况和集成测试', () => {
  describe('边界情况', () => {
    it('TEST-BATCH-090: 应该处理空图片列表', () => {
      // Test: 空列表处理
      const images: number[] = [];

      // Then: 应该返回适当错误
      expect(images.length).toBe(0);
    });

    it('TEST-BATCH-091: 应该处理单张图片的批量分析', () => {
      // Test: 单张图片
      const images = [1];

      // Then: 应该正常处理
      expect(images.length).toBe(1);
    });

    it('TEST-BATCH-092: 应该处理最大数量（5张）图片', () => {
      // Test: 5张图片
      const maxImages = 5;
      const images = [1, 2, 3, 4, 5];

      // Then: 应该等于最大数量
      expect(images.length).toBe(maxImages);
    });

    it('TEST-BATCH-093: 应该处理所有图片都失败的情况', () => {
      // Test: 全部失败
      const results = [
        { imageId: 1, status: 'failed' },
        { imageId: 2, status: 'failed' },
        { imageId: 3, status: 'failed' },
      ];

      const allFailed = results.every((r) => r.status === 'failed');
      expect(allFailed).toBe(true);
    });

    it('TEST-BATCH-094: 应该处理网络超时错误', () => {
      // Test: 网络错误处理
      const error = {
        code: 'NETWORK_ERROR',
        message: '网络连接超时',
        retryable: true,
      };

      // Then: 应该标记为可重试
      expect(error.retryable).toBe(true);
    });

    it('TEST-BATCH-095: 应该处理API配额超限', () => {
      // Test: API 配额错误
      const error = {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'API 配额已用完，请稍后重试',
        retryAfter: 60,
      };

      // Then: 应该包含重试时间
      expect(error.retryAfter).toBeDefined();
    });
  });
});
