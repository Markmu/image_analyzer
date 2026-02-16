/**
 * 风险评估服务
 *
 * Story 4-2: 生成安全功能
 * Epic 4: 内容安全与合规
 *
 * 评估生成请求的风险等级，识别需要人工审核的高风险请求
 */

import type { ModerationLog } from './types';

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 风险评估结果
 */
export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  requiresManualReview: boolean;
  reason: string;
  factors: string[];
}

/**
 * 风险评估配置
 */
const RISK_CONFIG = {
  // 用户历史失败次数权重
  failedCountWeight: 10,
  // 提示词长度阈值
  promptLengthThreshold: 500,
  promptLengthScore: 5,
  // 复杂术语额外分值
  complexTermScore: 10,
  // 敏感关键词额外分值
  sensitiveKeywordScore: 20,
  // 风险等级阈值
  lowThreshold: 20,
  mediumThreshold: 50,
};

/**
 * 复杂术语列表（可能表示复杂或敏感意图）
 */
const COMPLEX_TERMS = [
  'realistic', 'detailed', 'complex', 'intricate',
  'photorealistic', 'hyperrealistic', 'ultra detailed',
  '真实', '详细', '复杂',
];

/**
 * 检查是否包含复杂术语
 */
function containsComplexTerms(text: string): boolean {
  const lowerText = text.toLowerCase();
  return COMPLEX_TERMS.some(term => lowerText.includes(term.toLowerCase()));
}

/**
 * 检查是否包含敏感关键词
 */
function containsSensitiveKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  const sensitiveKeywords = [
    'violence', 'blood', 'gore', 'nsfw', 'nude', 'explicit',
    'hate', 'racist', 'illegal', 'drug', 'weapon',
    '暴力', '血腥', '色情', '仇恨', '非法', '毒品', '武器',
  ];

  return sensitiveKeywords.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * 评估用户风险等级
 *
 * @param userId - 用户 ID
 * @param prompt - 生成提示词
 * @param userHistory - 用户历史审核记录
 * @returns 风险评估结果
 */
export function assessRisk(
  userId: string,
  prompt: string,
  userHistory: ModerationLog[] = []
): RiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];

  // 1. 用户历史审核失败次数
  const failedCount = userHistory.filter(log => log.action === 'rejected').length;
  if (failedCount > 0) {
    const score = failedCount * RISK_CONFIG.failedCountWeight;
    riskScore += score;
    factors.push(`历史审核失败 ${failedCount} 次 (+${score} 分)`);
  }

  // 2. 提示词复杂度
  if (prompt.length > RISK_CONFIG.promptLengthThreshold) {
    riskScore += RISK_CONFIG.promptLengthScore;
    factors.push(`提示词过长 (${prompt.length} 字符, +${RISK_CONFIG.promptLengthScore} 分)`);
  }

  // 3. 复杂术语
  if (containsComplexTerms(prompt)) {
    riskScore += RISK_CONFIG.complexTermScore;
    factors.push(`包含复杂术语 (+${RISK_CONFIG.complexTermScore} 分)`);
  }

  // 4. 敏感关键词
  if (containsSensitiveKeywords(prompt)) {
    riskScore += RISK_CONFIG.sensitiveKeywordScore;
    factors.push(`包含敏感关键词 (+${RISK_CONFIG.sensitiveKeywordScore} 分)`);
  }

  // 5. 确定风险等级
  let level: RiskLevel;
  let requiresManualReview: boolean;

  if (riskScore < RISK_CONFIG.lowThreshold) {
    level = 'low';
    requiresManualReview = false;
  } else if (riskScore < RISK_CONFIG.mediumThreshold) {
    level = 'medium';
    requiresManualReview = false;
  } else {
    level = 'high';
    requiresManualReview = true;
  }

  // 生成原因描述
  let reason: string;
  if (factors.length === 0) {
    reason = '无风险因素';
  } else {
    reason = `风险分数: ${riskScore} (${factors.join(', ')})`;
  }

  return {
    level,
    score: riskScore,
    requiresManualReview,
    reason,
    factors,
  };
}

/**
 * 批量评估多个用户的风险等级
 *
 * @param requests - 评估请求列表
 * @returns 评估结果映射
 */
export function batchAssessRisk(
  requests: Array<{
    userId: string;
    prompt: string;
    userHistory?: ModerationLog[];
  }>
): Map<string, RiskAssessment> {
  const results = new Map<string, RiskAssessment>();

  for (const request of requests) {
    const assessment = assessRisk(
      request.userId,
      request.prompt,
      request.userHistory
    );
    results.set(request.userId, assessment);
  }

  return results;
}

/**
 * 获取风险等级描述
 *
 * @param level - 风险等级
 * @returns 描述文本
 */
export function getRiskLevelDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    low: '低风险 - 可以直接生成',
    medium: '中等风险 - 需要额外审核',
    high: '高风险 - 需要人工审核',
  };

  return descriptions[level];
}

/**
 * 获取风险等级颜色
 *
 * @param level - 风险等级
 * @returns 颜色代码
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
  };

  return colors[level];
}
