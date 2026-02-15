/**
 * Confidence Scoring E2E Test
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * End-to-end test for confidence scoring functionality
 */

import { describe, test, expect } from 'vitest';
import {
  extractConfidenceFromAnalysisData,
  generateConfidenceWarning,
  calculateOverallConfidence,
} from '@/lib/analysis/confidence';
import type { AnalysisData } from '@/types/analysis';

describe('Story 3-5: Confidence Scoring E2E', () => {
  test('Complete confidence scoring workflow', () => {
    // 模拟分析结果
    const analysisData: AnalysisData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [
            { name: '主光源方向', value: '侧光', confidence: 0.85 },
            { name: '光影对比度', value: '高对比度', confidence: 0.90 },
          ],
          confidence: 0.875,
        },
        composition: {
          name: '构图',
          features: [
            { name: '视角', value: '平视', confidence: 0.92 },
          ],
          confidence: 0.92,
        },
        color: {
          name: '色彩',
          features: [
            { name: '主色调', value: '暖色调', confidence: 0.50 },
          ],
          confidence: 0.50,
        },
        artisticStyle: {
          name: '艺术风格',
          features: [
            { name: '风格流派', value: '印象派', confidence: 0.45 },
          ],
          confidence: 0.45,
        },
      },
      overallConfidence: 0.68,
      modelUsed: 'qwen3-vl',
      analysisDuration: 15,
    };

    // Step 1: 提取置信度
    const confidenceScores = extractConfidenceFromAnalysisData(analysisData);

    expect(confidenceScores.overall).toBe(68);
    expect(confidenceScores.lighting).toBe(88);
    expect(confidenceScores.composition).toBe(92);
    expect(confidenceScores.color).toBe(50);
    expect(confidenceScores.style).toBe(45);

    // Step 2: 计算整体置信度
    const avgConfidence = calculateOverallConfidence(confidenceScores);
    expect(avgConfidence).toBeGreaterThan(0);
    expect(avgConfidence).toBeLessThan(100);

    // Step 3: 生成警告
    const warning = generateConfidenceWarning(confidenceScores);

    // 应该有警告（因为色彩和艺术风格维度低于60%）
    expect(warning).not.toBeNull();
    expect(warning?.affectedDimensions).toContain('色彩');
    expect(warning?.affectedDimensions).toContain('艺术风格');
    expect(warning?.suggestedAction).toBe('retry');

    console.log('✅ 置信度流程测试通过！');
    console.log('置信度分数:', confidenceScores);
    console.log('警告信息:', warning);
  });

  test('High confidence scenario - no warning', () => {
    const analysisData: AnalysisData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [
            { name: '主光源', value: '侧光', confidence: 0.90 },
          ],
          confidence: 0.90,
        },
        composition: {
          name: '构图',
          features: [
            { name: '视角', value: '平视', confidence: 0.88 },
          ],
          confidence: 0.88,
        },
        color: {
          name: '色彩',
          features: [
            { name: '色调', value: '暖', confidence: 0.92 },
          ],
          confidence: 0.92,
        },
        artisticStyle: {
          name: '艺术风格',
          features: [
            { name: '风格', value: '现代', confidence: 0.85 },
          ],
          confidence: 0.85,
        },
      },
      overallConfidence: 0.89,
      modelUsed: 'gemini-flash',
      analysisDuration: 20,
    };

    const confidenceScores = extractConfidenceFromAnalysisData(analysisData);
    const warning = generateConfidenceWarning(confidenceScores);

    // 高置信度不应产生警告
    expect(warning).toBeNull();
    expect(confidenceScores.overall).toBeGreaterThanOrEqual(80);

    console.log('✅ 高置信度场景测试通过！');
    console.log('置信度分数:', confidenceScores);
  });

  test('Low confidence scenario - requires retry', () => {
    const analysisData: AnalysisData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [],
          confidence: 0.40,
        },
        composition: {
          name: '构图',
          features: [],
          confidence: 0.35,
        },
        color: {
          name: '色彩',
          features: [],
          confidence: 0.30,
        },
        artisticStyle: {
          name: '艺术风格',
          features: [],
          confidence: 0.25,
        },
      },
      overallConfidence: 0.32,
      modelUsed: 'qwen3-vl',
      analysisDuration: 10,
    };

    const confidenceScores = extractConfidenceFromAnalysisData(analysisData);
    const warning = generateConfidenceWarning(confidenceScores);

    // 极低置信度应产生严重警告
    expect(warning).not.toBeNull();
    expect(warning?.level).toBe('critical');
    expect(warning?.suggestedAction).toBe('retry');
    expect(warning?.affectedDimensions.length).toBeGreaterThan(0);

    console.log('✅ 低置信度场景测试通过！');
    console.log('置信度分数:', confidenceScores);
    console.log('警告信息:', warning);
  });
});
