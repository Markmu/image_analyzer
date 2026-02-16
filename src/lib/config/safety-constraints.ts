/**
 * 安全约束配置
 *
 * Story 4-2: 生成安全功能
 * Epic 4: 内容安全与合规
 *
 * 为 AI 生成提供自动安全约束（negative prompts）
 */

/**
 * 安全约束类型
 */
export type SafetyConstraintType = 'default' | 'portrait' | 'landscape' | 'abstract' | 'product';

/**
 * 安全约束配置
 *
 * 用于在生成提示词中自动添加 negative prompt
 * 防止生成不当内容
 */
export const SAFETY_CONSTRAINTS = {
  /**
   * 默认约束（所有生成）
   */
  default: [
    'nsfw',
    'violence',
    'gore',
    'hate symbols',
    'illegal content',
    'disturbing imagery',
  ],

  /**
   * 人像专用约束
   */
  portrait: [
    'deformed',
    'bad anatomy',
    'extra fingers',
    'mutated hands',
    'poorly drawn face',
    'distortion',
    'disfigured',
  ],

  /**
   * 风景专用约束
   */
  landscape: [
    'unnatural colors',
    'distorted perspective',
    'blurry',
    'low quality',
  ],

  /**
   * 抽象艺术专用约束
   */
  abstract: [
    'realistic',
    'photographic',
    'literal representation',
  ],

  /**
   * 产品图片专用约束
   */
  product: [
    'defective',
    'damaged',
    'poor quality',
    'blurry',
  ],

  /**
   * 转换为 negative prompt 字符串
   */
  toString(type: SafetyConstraintType = 'default'): string {
    const constraints = [...this.default, ...(this[type] || [])];
    return [...new Set(constraints)].join(', '); // 去重
  },

  /**
   * 获取所有约束类型
   */
  getTypes(): SafetyConstraintType[] {
    return ['default', 'portrait', 'landscape', 'abstract', 'product'];
  },
} as const;

/**
 * 构建安全的生成提示词
 *
 * 自动在用户提示词中添加安全约束
 *
 * @param userPrompt - 用户原始提示词
 * @param type - 约束类型
 * @returns 包含安全约束的提示词
 */
export function buildSafePrompt(
  userPrompt: string,
  type: SafetyConstraintType = 'default'
): string {
  const safetyConstraint = SAFETY_CONSTRAINTS.toString(type);

  // 如果用户提示词已经包含 negative prompt，合并
  if (userPrompt.toLowerCase().includes('negative:') ||
      userPrompt.toLowerCase().includes('--no')) {
    return `${userPrompt}, ${safetyConstraint}`;
  }

  // 否则添加新的 negative prompt
  return `${userPrompt}, negative: ${safetyConstraint}`;
}

/**
 * 提取用户原始提示词
 *
 * 从包含安全约束的提示词中提取用户原始输入
 *
 * @param safePrompt - 包含安全约束的提示词
 * @returns 用户原始提示词
 */
export function extractUserPrompt(safePrompt: string): string {
  // 查找 negative 标记
  const negativeIndex = safePrompt.toLowerCase().indexOf('negative:');

  if (negativeIndex === -1) {
    // 查找 --no 标记
    const noIndex = safePrompt.toLowerCase().indexOf('--no');
    if (noIndex === -1) {
      return safePrompt.trim();
    }
    return safePrompt.substring(0, noIndex).trim();
  }

  return safePrompt.substring(0, negativeIndex).trim();
}

/**
 * 验证约束类型
 *
 * @param type - 约束类型
 * @returns 是否有效
 */
export function isValidConstraintType(type: string): type is SafetyConstraintType {
  return SAFETY_CONSTRAINTS.getTypes().includes(type as SafetyConstraintType);
}

/**
 * 获取约束描述
 *
 * @param type - 约束类型
 * @returns 约束描述
 */
export function getConstraintDescription(type: SafetyConstraintType): string {
  const descriptions: Record<SafetyConstraintType, string> = {
    default: '默认安全约束，防止生成不当内容',
    portrait: '人像专用约束，确保人物生成质量',
    landscape: '风景专用约束，确保画面自然',
    abstract: '抽象艺术专用约束，确保艺术性',
    product: '产品图片专用约束，确保产品展示质量',
  };

  return descriptions[type] || descriptions.default;
}
