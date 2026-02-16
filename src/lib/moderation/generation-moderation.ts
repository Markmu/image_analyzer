/**
 * 生成内容审核服务
 *
 * Story 4-2: 生成安全功能
 * Epic 4: 内容安全与合规
 *
 * 为 AI 生成功能提供前置和后置内容审核
 */

import { moderateText } from './text-moderation';
import { moderateImage } from './image-moderation';
import { logModeration } from './log-moderation';
import type { ModerationResult, ModerationCategories } from './types';

/**
 * 生成专用审核阈值（比普通审核更严格）
 */
const GENERATION_THRESHOLDS = {
  violence: 0.5, // 更低的阈值 = 更严格
  sexual: 0.5,
  hate: 0.5,
  harassment: 0.5,
  selfHarm: 0.5,
};

/**
 * 敏感关键词列表（用于提示词预检）
 */
const SENSITIVE_KEYWORDS = [
  // 暴力相关
  'violence', 'gore', 'blood', 'kill', 'murder', 'torture',
  '暴力', '血腥', '杀戮', '虐待',
  // 色情相关
  'nsfw', 'nude', 'porn', 'sex', 'explicit',
  '色情', '裸体', '性',
  // 仇恨相关
  'hate', 'racist', 'nazi', 'discrimination',
  '仇恨', '歧视',
  // 非法相关
  'illegal', 'drug', 'weapon', 'crime',
  '非法', '毒品', '武器', '犯罪',
];

/**
 * 检查是否包含敏感关键词
 */
function containsSensitiveKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  }

  return found;
}

/**
 * 生成特定审核逻辑
 *
 * 对生成提示词应用更严格的审核标准
 */
async function moderateForGeneration(prompt: string): Promise<ModerationResult> {
  // 1. 检查敏感关键词
  const sensitiveKeywords = containsSensitiveKeywords(prompt);

  if (sensitiveKeywords.length > 0) {
    return {
      isApproved: false,
      confidence: 0.95,
      categories: {
        violence: sensitiveKeywords.some(k =>
          ['violence', 'gore', 'blood', 'kill', 'murder', 'torture', '暴力', '血腥', '杀戮', '虐待'].includes(k)
        ) ? 0.9 : 0.1,
        sexual: sensitiveKeywords.some(k =>
          ['nsfw', 'nude', 'porn', 'sex', 'explicit', '色情', '裸体', '性'].includes(k)
        ) ? 0.9 : 0.1,
        hate: sensitiveKeywords.some(k =>
          ['hate', 'racist', 'nazi', 'discrimination', '仇恨', '歧视'].includes(k)
        ) ? 0.9 : 0.1,
        harassment: 0.1,
        selfHarm: 0.1,
      },
      action: 'rejected',
      reason: `提示词包含敏感内容: ${sensitiveKeywords.slice(0, 3).join(', ')}`,
    };
  }

  // 2. 检查提示词长度（过长可能包含复杂意图）
  if (prompt.length > 1000) {
    return {
      isApproved: false,
      confidence: 0.7,
      categories: {
        violence: 0.1,
        sexual: 0.1,
        hate: 0.1,
        harassment: 0.1,
        selfHarm: 0.1,
      },
      action: 'rejected',
      reason: '提示词过长，请简化描述',
    };
  }

  // 3. 默认通过
  return {
    isApproved: true,
    confidence: 0.95,
    categories: {
      violence: 0.05,
      sexual: 0.05,
      hate: 0.05,
      harassment: 0.05,
      selfHarm: 0.05,
    },
    action: 'approved',
  };
}

/**
 * 合并多个审核结果
 */
function combineResults(results: ModerationResult[]): ModerationResult {
  if (results.length === 0) {
    return {
      isApproved: false,
      confidence: 0,
      categories: {
        violence: 0,
        sexual: 0,
        hate: 0,
        harassment: 0,
        selfHarm: 0,
      },
      action: 'rejected',
      reason: '无审核结果',
    };
  }

  // 取最严格的结果
  let isApproved = true;
  const combinedCategories: ModerationCategories = {
    violence: 0,
    sexual: 0,
    hate: 0,
    harassment: 0,
    selfHarm: 0,
  };

  const reasons: string[] = [];

  for (const result of results) {
    if (!result.isApproved) {
      isApproved = false;
      if (result.reason) {
        reasons.push(result.reason);
      }
    }

    // 取各类别最高分
    for (const key of Object.keys(combinedCategories) as (keyof ModerationCategories)[]) {
      combinedCategories[key] = Math.max(
        combinedCategories[key],
        result.categories[key] || 0
      );
    }
  }

  // 计算整体置信度
  const maxScore = Math.max(...Object.values(combinedCategories));
  const confidence = isApproved ? 1 - maxScore : maxScore;

  return {
    isApproved,
    confidence,
    categories: combinedCategories,
    action: isApproved ? 'approved' : 'rejected',
    reason: reasons.length > 0 ? reasons[0] : undefined,
  };
}

/**
 * 审核生成提示词
 *
 * @param prompt - 用户输入的提示词
 * @param userId - 用户 ID
 * @returns 审核结果
 */
export async function moderatePrompt(
  prompt: string,
  userId: string
): Promise<ModerationResult> {
  console.log('[GenerationModeration] Moderating prompt:', { userId, promptLength: prompt.length });

  try {
    // 1. 基础文本审核
    const textResult = await moderateText(prompt);

    // 2. 生成专用审核（更严格）
    const generationResult = await moderateForGeneration(prompt);

    // 3. 合并结果
    const combinedResult = combineResults([textResult, generationResult]);

    // 4. 记录审核日志
    await logModeration({
      userId,
      contentType: 'text',
      result: combinedResult,
    });

    console.log('[GenerationModeration] Prompt moderation result:', {
      isApproved: combinedResult.isApproved,
      confidence: combinedResult.confidence,
    });

    return combinedResult;
  } catch (error) {
    console.error('[GenerationModeration] Error moderating prompt:', error);

    // 审核失败时拒绝
    return {
      isApproved: false,
      confidence: 0,
      categories: {
        violence: 0,
        sexual: 0,
        hate: 0,
        harassment: 0,
        selfHarm: 0,
      },
      action: 'rejected',
      reason: '审核服务暂时不可用，请稍后重试',
    };
  }
}

/**
 * 审核生成的图片
 *
 * @param imageUrl - 图片 URL
 * @param generationId - 生成 ID
 * @param userId - 用户 ID
 * @returns 审核结果
 */
export async function moderateGeneratedImage(
  imageUrl: string,
  generationId: number,
  userId: string
): Promise<ModerationResult> {
  console.log('[GenerationModeration] Moderating generated image:', { generationId, userId });

  try {
    // 1. 使用图片审核服务
    const result = await moderateImage(imageUrl);

    // 2. 应用更严格的阈值
    for (const [category, score] of Object.entries(result.categories)) {
      const threshold = GENERATION_THRESHOLDS[category as keyof typeof GENERATION_THRESHOLDS] || 0.5;
      if (score > threshold && result.isApproved) {
        result.isApproved = false;
        result.action = 'rejected';
        result.reason = `图片可能包含不适当的内容 (${category}: ${(score * 100).toFixed(1)}%)`;
      }
    }

    // 3. 记录审核日志
    await logModeration({
      userId,
      imageId: String(generationId),
      contentType: 'image',
      result,
    });

    console.log('[GenerationModeration] Image moderation result:', {
      isApproved: result.isApproved,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    console.error('[GenerationModeration] Error moderating image:', error);

    // 审核失败时拒绝
    return {
      isApproved: false,
      confidence: 0,
      categories: {
        violence: 0,
        sexual: 0,
        hate: 0,
        harassment: 0,
        selfHarm: 0,
      },
      action: 'rejected',
      reason: '审核服务暂时不可用，请稍后重试',
    };
  }
}

/**
 * 删除审核失败的生成图片
 *
 * @param imageUrl - 图片 URL
 * @param generationId - 生成 ID
 */
export async function deleteGeneratedImage(
  imageUrl: string,
  generationId: number
): Promise<void> {
  console.log('[GenerationModeration] Deleting rejected image:', { generationId });

  try {
    // 从 URL 提取 R2 key
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // 移除开头的 /

    // 导入 R2 删除功能
    const { deleteFromR2 } = await import('@/lib/r2/delete');
    await deleteFromR2(key);

    console.log('[GenerationModeration] Image deleted successfully:', { generationId });
  } catch (error) {
    console.error('[GenerationModeration] Error deleting image:', error);
    throw error;
  }
}
