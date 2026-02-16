/**
 * 文本内容审核服务
 *
 * Story 4-1: 内容审核功能
 * Epic 4: 内容安全与合规
 *
 * 使用简单规则和关键词匹配进行文本审核
 */

import type { ModerationResult, ModerationCategories } from './types';
import { getModerationMessage } from './messages';

/**
 * 敏感词汇列表（示例）
 *
 * 在生产环境中，应该使用更完善的敏感词库或专业的文本审核 API
 */
const SENSITIVE_PATTERNS = {
  violence: [
    /\b(kill|murder|暴力|杀|死|血腥)\b/i,
  ],
  sexual: [
    /\b(porn|sex|nude|色情|裸体|成人)\b/i,
  ],
  hate: [
    /\b(nazi|swastika|纳粹|卐|仇恨)\b/i,
  ],
  harassment: [
    /\b(stupid|idiot|hate|蠢|笨|讨厌)\b/i,
  ],
  selfHarm: [
    /\b(suicide|self.harm|自杀|自残)\b/i,
  ],
};

/**
 * 审核文本内容
 *
 * @param text - 待审核的文本
 * @returns 审核结果
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  console.log('[TextModeration] Starting text moderation');

  const categories: ModerationCategories = {
    violence: 0,
    sexual: 0,
    hate: 0,
    harassment: 0,
    selfHarm: 0,
  };

  // 检查每个类别
  for (const [category, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        categories[category as keyof ModerationCategories] = 0.9;
        break;
      }
    }
  }

  // 检查是否超过阈值
  const thresholds = {
    violence: 0.7,
    sexual: 0.7,
    hate: 0.7,
    harassment: 0.7,
    selfHarm: 0.7,
  };

  let isApproved = true;
  for (const [category, score] of Object.entries(categories)) {
    if (score > thresholds[category as keyof typeof thresholds]) {
      isApproved = false;
      break;
    }
  }

  const maxScore = Math.max(...Object.values(categories));
  const confidence = isApproved ? 1 - maxScore : maxScore;
  const action: ModerationResult['action'] = isApproved ? 'approved' : 'rejected';

  let reason: string | undefined;
  if (!isApproved) {
    const message = getModerationMessage(categories, thresholds);
    reason = message.title;
  }

  return {
    isApproved,
    confidence,
    categories,
    action,
    reason,
  };
}

/**
 * 获取文本修改建议
 */
export function getTextModerationSuggestion(result: ModerationResult): string {
  if (result.isApproved) {
    return '';
  }

  const thresholds = {
    violence: 0.7,
    sexual: 0.7,
    hate: 0.7,
    harassment: 0.7,
    selfHarm: 0.7,
  };

  const message = getModerationMessage(result.categories, thresholds);
  return `${message.suggestion}。请修改后重新提交。`;
}
