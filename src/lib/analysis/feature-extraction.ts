/**
 * 特征提取算法
 *
 * AC-3: 共同特征提取
 * - 识别共同特征（多张图片都有的特征）
 * - 识别独特特征（仅部分图片有的特征）
 * - 生成综合分析结果
 */

import type { AnalysisData, StyleFeature, StyleDimension } from '@/lib/db/schema';

/**
 * 综合分析结果
 */
export interface ComprehensiveAnalysis {
  commonFeatures: {
    dimension: string;
    features: StyleFeature[];
    confidence: number;
  }[];
  uniqueFeatures: {
    dimension: string;
    features: { feature: StyleFeature; sourceImages: string[] }[];
  }[];
  overallConfidence: number;
}

/**
 * 提取共同特征
 *
 * @param results - 分析结果数组
 * @returns 共同特征和独特特征
 */
export function extractCommonFeatures(results: AnalysisData[]): ComprehensiveAnalysis {
  if (results.length === 0) {
    return {
      commonFeatures: [],
      uniqueFeatures: [],
      overallConfidence: 0,
    };
  }

  if (results.length === 1) {
    // 单张图片，返回其所有特征作为"共同特征"
    const result = results[0];
    const dimensions = getDimensions(result);

    const commonFeatures = dimensions.map((dim) => ({
      dimension: dim.name,
      features: dim.features,
      confidence: dim.confidence,
    }));

    return {
      commonFeatures,
      uniqueFeatures: [],
      overallConfidence: result.overallConfidence,
    };
  }

  const dimensions = getDimensions(results[0]);

  // 分析每个维度
  const commonFeaturesList: ComprehensiveAnalysis['commonFeatures'] = [];
  const uniqueFeaturesList: ComprehensiveAnalysis['uniqueFeatures'] = [];

  for (const dimension of dimensions) {
    // 提取所有图片在该维度的特征
    const allDimensionFeatures = results.map((r) => {
      const dim = getDimension(r, dimension.name);
      return dim ? dim.features : [];
    });

    // 找出共同特征（在所有图片中都出现的特征）
    const common = findCommonFeatures(allDimensionFeatures);
    if (common.length > 0) {
      commonFeaturesList.push({
        dimension: dimension.name,
        features: common,
        confidence: calculateAverageConfidence(common),
      });
    }

    // 找出独特特征（仅在部分图片中出现的特征）
    const unique = findUniqueFeatures(allDimensionFeatures, results.map((_, i) => `image-${i + 1}`));
    if (unique.length > 0) {
      uniqueFeaturesList.push({
        dimension: dimension.name,
        features: unique,
      });
    }
  }

  // 计算整体置信度
  const overallConfidence = calculateOverallConfidence(results);

  return {
    commonFeatures: commonFeaturesList,
    uniqueFeatures: uniqueFeaturesList,
    overallConfidence,
  };
}

/**
 * 获取所有维度
 */
function getDimensions(data: AnalysisData) {
  return [
    data.dimensions.lighting,
    data.dimensions.composition,
    data.dimensions.color,
    data.dimensions.artisticStyle,
  ].filter((dim): dim is StyleDimension => dim !== undefined);
}

/**
 * 获取指定维度
 */
function getDimension(data: AnalysisData, name: string): StyleDimension | undefined {
  switch (name) {
    case 'lighting':
      return data.dimensions.lighting;
    case 'composition':
      return data.dimensions.composition;
    case 'color':
      return data.dimensions.color;
    case 'artisticStyle':
      return data.dimensions.artisticStyle;
    default:
      return undefined;
  }
}

/**
 * 找出共同特征
 *
 * @param allFeatures - 所有图片的特征数组
 * @returns 共同特征
 */
function findCommonFeatures(allFeatures: StyleFeature[][]): StyleFeature[] {
  if (allFeatures.length === 0) return [];

  // 取第一张图片的特征作为基准
  const baseFeatures = allFeatures[0];
  const common: StyleFeature[] = [];

  for (const baseFeature of baseFeatures) {
    // 检查该特征是否在所有图片中都存在
    let appearsInAll = true;
    const featureValues: string[] = [baseFeature.value];

    for (let i = 1; i < allFeatures.length; i++) {
      const imageFeatures = allFeatures[i];
      const matchingFeature = imageFeatures.find(
        (f) => areFeaturesSimilar(f.value, baseFeature.value)
      );

      if (!matchingFeature) {
        appearsInAll = false;
        break;
      }

      featureValues.push(matchingFeature.value);
    }

    if (appearsInAll) {
      // 使用平均置信度
      const confidences = allFeatures.map((features) => {
        const match = features.find(
          (f) => areFeaturesSimilar(f.value, baseFeature.value)
        );
        return match?.confidence || 0;
      });

      common.push({
        name: baseFeature.name,
        value: featureValues[0], // 使用第一个值作为代表
        confidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
      });
    }
  }

  return common;
}

/**
 * 找出独特特征
 *
 * @param allFeatures - 所有图片的特征数组
 * @param imageIds - 图片 ID 数组
 * @returns 独特特征（按来源图片分组）
 */
function findUniqueFeatures(
  allFeatures: StyleFeature[][],
  imageIds: string[]
): { feature: StyleFeature; sourceImages: string[] }[] {
  if (allFeatures.length === 0) return [];

  const uniqueFeatures: { feature: StyleFeature; sourceImages: string[] }[] = [];

  // 遍历每张图片的特征
  for (let i = 0; i < allFeatures.length; i++) {
    const imageFeatures = allFeatures[i];

    for (const feature of imageFeatures) {
      // 检查该特征是否在其他图片中也存在
      let appearsInOthers = false;

      for (let j = 0; j < allFeatures.length; j++) {
        if (i === j) continue;

        const otherFeatures = allFeatures[j];
        const matchingFeature = otherFeatures.find(
          (f) => areFeaturesSimilar(f.value, feature.value)
        );

        if (matchingFeature) {
          appearsInOthers = true;
          break;
        }
      }

      // 如果只出现在当前图片中，则是独特特征
      if (!appearsInOthers) {
        // 检查是否已存在相同的独特特征
        const existingIndex = uniqueFeatures.findIndex(
          (uf) => areFeaturesSimilar(uf.feature.value, feature.value)
        );

        if (existingIndex >= 0) {
          // 已存在，添加来源图片
          if (!uniqueFeatures[existingIndex].sourceImages.includes(imageIds[i])) {
            uniqueFeatures[existingIndex].sourceImages.push(imageIds[i]);
          }
        } else {
          // 不存在，新增
          uniqueFeatures.push({
            feature: { ...feature },
            sourceImages: [imageIds[i]],
          });
        }
      }
    }
  }

  return uniqueFeatures;
}

/**
 * 判断两个特征是否相似
 */
function areFeaturesSimilar(value1: string, value2: string): boolean {
  // 标准化比较（忽略大小写和空格）
  const normalized1 = value1.toLowerCase().trim();
  const normalized2 = value2.toLowerCase().trim();

  // 完全匹配
  if (normalized1 === normalized2) return true;

  // 包含匹配
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  // 相似特征映射
  const similarGroups: Record<string, string[]> = {
    warm: ['warm', 'warm_tone', 'warm_color', 'warmth'],
    cool: ['cool', 'cool_tone', 'cool_color', 'coolness'],
    natural: ['natural', 'natural_light', 'natural_lighting'],
    artificial: ['artificial', 'artificial_light', 'artificial_lighting'],
    high_key: ['high_key', 'bright', 'light'],
    low_key: ['low_key', 'dark', 'shadow'],
    rule_of_thirds: ['rule_of_thirds', 'thirds', 'composition'],
    centered: ['centered', 'center', 'symmetrical'],
    vibrant: ['vibrant', 'vibrant_colors', 'colorful'],
    muted: ['muted', 'muted_colors', 'subdued'],
  };

  for (const group of Object.values(similarGroups)) {
    if (group.includes(normalized1) && group.includes(normalized2)) {
      return true;
    }
  }

  return false;
}

/**
 * 计算平均置信度
 */
function calculateAverageConfidence(features: StyleFeature[]): number {
  if (features.length === 0) return 0;

  const sum = features.reduce((acc, f) => acc + f.confidence, 0);
  return sum / features.length;
}

/**
 * 计算整体置信度
 */
function calculateOverallConfidence(results: AnalysisData[]): number {
  if (results.length === 0) return 0;

  const sum = results.reduce((acc, r) => acc + r.overallConfidence, 0);
  return sum / results.length;
}

/**
 * 生成综合分析文本描述
 */
export function generateComprehensiveDescription(
  analysis: ComprehensiveAnalysis
): string {
  const parts: string[] = [];

  // 添加共同特征描述
  if (analysis.commonFeatures.length > 0) {
    const commonDesc = analysis.commonFeatures
      .map((dim) => {
        const featureNames = dim.features.map((f) => f.value).join('、');
        return `${dim.dimension}: ${featureNames}`;
      })
      .join('；');

    parts.push(`共同特征：${commonDesc}`);
  }

  // 添加独特特征描述
  if (analysis.uniqueFeatures.length > 0) {
    const uniqueDesc = analysis.uniqueFeatures
      .map((dim) => {
        const featureGroups = dim.features.map((f) =>
          f.sourceImages.length > 0
            ? `${f.feature.value}（来自${f.sourceImages.join('、')}）`
            : f.feature.value
        );
        return `${dim.dimension}: ${featureGroups.join('；')}`;
      })
      .join('；');

    parts.push(`独特特征：${uniqueDesc}`);
  }

  // 添加置信度
  parts.push(`整体置信度: ${(analysis.overallConfidence * 100).toFixed(1)}%`);

  return parts.join('。');
}

/**
 * 获取特征高亮样式
 */
export function getFeatureHighlightStyle(
  isCommon: boolean,
  isUnique: boolean
): { borderColor: string; backgroundColor: string } {
  if (isCommon) {
    // 绿色边框 - 共同特征
    return {
      borderColor: 'rgb(34, 197, 94)', // green-500
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    };
  }

  if (isUnique) {
    // 蓝色边框 - 独特特征
    return {
      borderColor: 'rgb(59, 130, 246)', // blue-500
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    };
  }

  // 默认样式
  return {
    borderColor: 'rgb(229, 231, 235)', // gray-200
    backgroundColor: 'transparent',
  };
}
