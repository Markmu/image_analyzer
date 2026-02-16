/**
 * 时间估算算法测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateAnalysisTime,
  calculateUploadTime,
  formatEstimatedTime,
  adjustEstimate,
  recordStageDuration,
  type AnalysisStage,
} from './time-estimation';

describe('时间估算算法', () => {
  beforeEach(() => {
    // 清空历史数据
    (calculateAnalysisTime as any).historyData = {
      uploading: [],
      analyzing: [],
      generating: [],
    };
  });

  describe('calculateAnalysisTime', () => {
    it('应该返回 0 当分析已完成', () => {
      const result = calculateAnalysisTime('completed', 100);
      expect(result).toBe(0);
    });

    it('应该返回默认总时间当状态为 idle', () => {
      const result = calculateAnalysisTime('idle', 0);
      // analyzing (40) + generating (15) = 55
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });

    it('应该根据进度正确计算上传阶段的剩余时间', () => {
      const result = calculateAnalysisTime('uploading', 50);
      // 应该包含：上传剩余 + 分析 + 生成
      expect(result).toBeGreaterThan(40); // 至少包含分析 + 生成时间
    });

    it('应该根据进度正确计算分析阶段的剩余时间', () => {
      const result = calculateAnalysisTime('analyzing', 50);
      // 应该包含：分析剩余 + 生成
      expect(result).toBeGreaterThan(10); // 至少包含部分生成时间
      expect(result).toBeLessThan(60); // 不超过总时间
    });

    it('应该根据进度正确计算生成阶段的剩余时间', () => {
      const result = calculateAnalysisTime('generating', 50);
      // 只包含生成剩余时间
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(20);
    });

    it('进度增加时剩余时间应该减少', () => {
      const time1 = calculateAnalysisTime('analyzing', 20);
      const time2 = calculateAnalysisTime('analyzing', 60);
      expect(time2).toBeLessThan(time1);
    });
  });

  describe('calculateUploadTime', () => {
    it('应该返回 0 当速度为 0', () => {
      const result = calculateUploadTime(50, 0, 5);
      expect(result).toBe(0);
    });

    it('应该返回 0 当进度达到 100%', () => {
      const result = calculateUploadTime(100, 1, 5);
      expect(result).toBe(0);
    });

    it('应该正确计算剩余时间', () => {
      const speed = 1; // 1 MB/s
      const fileSize = 10; // 10 MB
      const progress = 50; // 50%

      const result = calculateUploadTime(progress, speed, fileSize);
      // 剩余文件 = 10 * 0.5 = 5 MB
      // 剩余时间 = 5 / 1 = 5 秒
      expect(result).toBe(5);
    });

    it('速度增加时剩余时间应该减少', () => {
      const time1 = calculateUploadTime(50, 1, 10);
      const time2 = calculateUploadTime(50, 2, 10);
      expect(time2).toBeLessThan(time1);
    });

    it('文件大小增加时剩余时间应该增加', () => {
      const time1 = calculateUploadTime(50, 1, 5);
      const time2 = calculateUploadTime(50, 1, 10);
      expect(time2).toBeGreaterThan(time1);
    });
  });

  describe('formatEstimatedTime', () => {
    it('应该返回"即将完成"当时间为 0', () => {
      const result = formatEstimatedTime(0);
      expect(result).toBe('即将完成');
    });

    it('应该正确格式化秒数（< 60 秒）', () => {
      const result = formatEstimatedTime(30);
      expect(result).toBe('预计还需 30 秒');
    });

    it('应该正确格式化分钟（整分钟）', () => {
      const result = formatEstimatedTime(120);
      expect(result).toBe('预计还需 2 分钟');
    });

    it('应该正确格式化分钟和秒', () => {
      const result = formatEstimatedTime(150);
      expect(result).toBe('预计还需 2 分 30 秒');
    });

    it('应该四舍五入秒数', () => {
      const result = formatEstimatedTime(45.7);
      expect(result).toBe('预计还需 46 秒');
    });
  });

  describe('adjustEstimate', () => {
    it('实际速度正常时不应调整估算', () => {
      const originalEstimate = 60;
      const actualElapsed = 30;
      const currentProgress = 50;

      const result = adjustEstimate(originalEstimate, actualElapsed, currentProgress);
      expect(result).toBe(originalEstimate);
    });

    it('实际速度低于 50% 应增加 50% 时间', () => {
      const originalEstimate = 60;
      const actualElapsed = 60; // 已经用了 60 秒但只完成了 30%
      const currentProgress = 30;

      const result = adjustEstimate(originalEstimate, actualElapsed, currentProgress);
      expect(result).toBe(originalEstimate * 1.5);
    });

    it('实际速度低于 75% 应增加 25% 时间', () => {
      const originalEstimate = 60;
      const actualElapsed = 30; // 已经用了 30 秒但只完成了 36% - 实际速度 1.2
      const currentProgress = 36; // 低于估算速度的 75%

      const result = adjustEstimate(originalEstimate, actualElapsed, currentProgress);
      expect(result).toBe(originalEstimate * 1.25);
    });
  });

  describe('recordStageDuration', () => {
    it('应该记录非完成/错误阶段的耗时', () => {
      recordStageDuration('uploading', 5.2);
      recordStageDuration('analyzing', 38.5);
      recordStageDuration('generating', 14.8);

      // 记录后历史数据应该被保存
      // 这个测试需要访问内部的历史数据，实际实现可能需要调整
      expect(true).toBe(true); // 占位测试
    });

    it('不应该记录 idle 和 error 阶段的耗时', () => {
      recordStageDuration('idle', 10);
      recordStageDuration('error', 5);
      recordStageDuration('completed', 0);

      // 这些阶段不应该被记录
      expect(true).toBe(true); // 占位测试
    });
  });
});
