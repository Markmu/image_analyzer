/**
 * Confidence Scoring Types
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * Type definitions for confidence scoring system
 */

import type { AnalysisData, StyleDimension } from '@/types/analysis';

/**
 * 置信度分数结构
 */
export interface ConfidenceScores {
  /** 整体置信度 0-100 */
  overall: number;
  /** 光影维度 0-100 */
  lighting: number;
  /** 构图维度 0-100 */
  composition: number;
  /** 色彩维度 0-100 */
  color: number;
  /** 艺术风格维度 0-100 */
  style: number;
}

/**
 * Standard 用户扩展置信度维度
 */
export interface ExtendedConfidenceScores extends ConfidenceScores {
  /** 情感基调维度 0-100 (Standard 用户专属) */
  emotionalTone?: number;
  /** 艺术时期维度 0-100 (Standard 用户专属) */
  artisticPeriod?: number;
}

/**
 * 置信度等级
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'critical';

/**
 * 建议操作类型
 */
export type SuggestedAction = 'retry' | 'review' | 'continue';

/**
 * 置信度警告信息
 */
export interface ConfidenceWarning {
  /** 警告等级 */
  level: ConfidenceLevel;
  /** 警告消息 */
  message: string;
  /** 受影响的维度 */
  affectedDimensions: string[];
  /** 建议操作 */
  suggestedAction: SuggestedAction;
}

/**
 * 置信度阈值配置
 */
export interface ConfidenceThresholds {
  /** 高置信度阈值 >= 80% */
  high: number;
  /** 中等置信度阈值 >= 60% */
  medium: number;
  /** 低置信度阈值 >= 40% */
  low: number;
  /** 极低置信度阈值 < 20% */
  critical: number;
}

/**
 * 按模型的阈值调整配置
 */
export type ModelThresholdModifiers = Record<string, number>;

// ============================================================================
// Confidence Threshold Configuration
// ============================================================================

/**
 * 默认置信度阈值
 */
export const DEFAULT_CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
  high: 80, // >= 80% 高置信度
  medium: 60, // >= 60% 中等置信度
  low: 40, // >= 40% 低置信度
  critical: 20, // < 20% 极低置信度
};

/**
 * 按模型的阈值调整
 * 负数表示更严格，正数表示更宽松
 */
export const MODEL_THRESHOLD_MODIFIERS: ModelThresholdModifiers = {
  'gemini-flash': -5, // 更严格（高准确性模型）
  'kimi-k2.5': 0, // 标准
  'qwen3-vl': 5, // 更宽松（快速模型）
};

// ============================================================================
// Confidence Calculation Functions
// ============================================================================

/**
 * 从 AnalysisData 提取置信度
 */
export function extractConfidenceFromAnalysisData(data: AnalysisData): ConfidenceScores {
  const dims = data.dimensions;

  return {
    overall: Math.round(data.overallConfidence * 100),
    lighting: Math.round((dims.lighting?.confidence || 0) * 100),
    composition: Math.round((dims.composition?.confidence || 0) * 100),
    color: Math.round((dims.color?.confidence || 0) * 100),
    style: Math.round((dims.artisticStyle?.confidence || 0) * 100),
  };
}

/**
 * 置信度解析策略 - 从维度特征聚合
 */
function aggregateConfidenceFromFeatures(dimension: StyleDimension): number {
  const features = dimension.features || [];
  if (features.length === 0) return 40; // 无特征，低置信度

  const sum = features.reduce((acc, f) => acc + (f.confidence || 0), 0);
  return Math.round((sum / features.length) * 100);
}

/**
 * 计算整体置信度（各维度平均值）
 */
export function calculateOverallConfidence(scores: ConfidenceScores): number {
  const dimensions = ['lighting', 'composition', 'color', 'style'] as const;
  const sum = dimensions.reduce((acc, key) => acc + scores[key], 0);
  return Math.round(sum / dimensions.length);
}

/**
 * 获取置信度等级
 */
export function getConfidenceLevel(score: number, thresholds: ConfidenceThresholds = DEFAULT_CONFIDENCE_THRESHOLDS): ConfidenceLevel {
  if (score >= thresholds.high) return 'high';
  if (score >= thresholds.medium) return 'medium';
  if (score >= thresholds.low) return 'low';
  return 'critical';
}

/**
 * 根据模型调整阈值
 */
export function getAdjustedThresholds(modelId: string): ConfidenceThresholds {
  const modifier = MODEL_THRESHOLD_MODIFIERS[modelId] || 0;

  return {
    high: DEFAULT_CONFIDENCE_THRESHOLDS.high + modifier,
    medium: DEFAULT_CONFIDENCE_THRESHOLDS.medium + modifier,
    low: DEFAULT_CONFIDENCE_THRESHOLDS.low + modifier,
    critical: DEFAULT_CONFIDENCE_THRESHOLDS.critical + modifier,
  };
}

// ============================================================================
// Low Confidence Warning System
// ============================================================================

/**
 * 检查低置信度维度
 */
export function checkLowConfidenceDimensions(
  scores: ConfidenceScores,
  threshold: number = DEFAULT_CONFIDENCE_THRESHOLDS.medium
): string[] {
  const dimensions: string[] = [];

  if (scores.lighting < threshold) dimensions.push('光影');
  if (scores.composition < threshold) dimensions.push('构图');
  if (scores.color < threshold) dimensions.push('色彩');
  if (scores.style < threshold) dimensions.push('艺术风格');

  return dimensions;
}

/**
 * 生成置信度警告
 */
export function generateConfidenceWarning(
  scores: ConfidenceScores,
  thresholds: ConfidenceThresholds = DEFAULT_CONFIDENCE_THRESHOLDS
): ConfidenceWarning | null {
  const overallLevel = getConfidenceLevel(scores.overall, thresholds);
  const lowDimensions = checkLowConfidenceDimensions(scores, thresholds.medium);

  // 无低置信度维度
  if (lowDimensions.length === 0 && scores.overall >= thresholds.high) {
    return null;
  }

  // 整体置信度过低
  if (scores.overall < 70) {
    return {
      level: overallLevel,
      message: '整体分析置信度较低，建议重新分析以获得更可靠的结果',
      affectedDimensions: lowDimensions,
      suggestedAction: 'retry',
    };
  }

  // 部分维度低置信度
  if (lowDimensions.length > 0) {
    return {
      level: 'medium',
      message: `${lowDimensions.join('、')}维度分析置信度较低，建议重新分析`,
      affectedDimensions: lowDimensions,
      suggestedAction: 'retry',
    };
  }

  return null;
}

// ============================================================================
// User Tier Support
// ============================================================================

/**
 * 检查用户订阅等级决定返回的置信度维度
 */
export function getConfidenceForTier(
  scores: ExtendedConfidenceScores,
  tier: 'free' | 'lite' | 'standard'
): ConfidenceScores | ExtendedConfidenceScores {
  if (tier === 'standard') {
    return scores; // 返回完整维度（包含 emotionalTone 和 artisticPeriod）
  }

  // Free/Lite 用户只返回基础4维
  const { emotionalTone, artisticPeriod, ...base } = scores;
  return base;
}

