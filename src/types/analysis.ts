/**
 * Analysis Types
 *
 * Epic 3 - Story 3-1: Style Analysis
 * Type definitions for image style analysis
 */

/**
 * 单个风格特征
 */
export interface StyleFeature {
  /** 特征名称 */
  name: string;
  /** 特征值 */
  value: string;
  /** 该特征的置信度 (0-1) */
  confidence: number;
}

/**
 * 风格维度（光影、构图、色彩、艺术风格）
 */
export interface StyleDimension {
  /** 维度名称 */
  name: string;
  /** 特征列表 */
  features: StyleFeature[];
  /** 该维度的置信度 (0-1) */
  confidence: number;
}

/**
 * 完整的分析数据
 */
export interface AnalysisData {
  /** 四维度分析结果 */
  dimensions: {
    /** 光影维度 */
    lighting: StyleDimension;
    /** 构图维度 */
    composition: StyleDimension;
    /** 色彩维度 */
    color: StyleDimension;
    /** 艺术风格维度 */
    artisticStyle: StyleDimension;
  };
  /** 整体置信度 (0-1) */
  overallConfidence: number;
  /** 使用的模型 */
  modelUsed: string;
  /** 分析耗时（秒） */
  analysisDuration: number;
}

/**
 * 分析结果（包含数据库字段）
 */
export interface AnalysisResult {
  id: number;
  userId: string;
  imageId: string;
  analysisData: AnalysisData;
  confidenceScore: number;
  feedback: 'accurate' | 'inaccurate' | null;
  createdAt: Date;
}
