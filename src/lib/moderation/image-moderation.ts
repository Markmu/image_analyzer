/**
 * 图片内容审核服务
 *
 * Story 4-1: 内容审核功能
 * Epic 4: 内容安全与合规
 *
 * 使用 Replicate Moderation API 进行图片内容审核
 */

import { replicate } from '@/lib/replicate';
import type { ModerationResult, ModerationCategories } from './types';
import { getModerationMessage } from './messages';

/**
 * 默认审核配置
 */
const DEFAULT_THRESHOLDS = {
  violence: 0.7, // 暴力内容阈值
  sexual: 0.7, // 色情内容阈值
  hate: 0.7, // 仇恨符号阈值
  harassment: 0.7, // 骚扰阈值
  selfHarm: 0.7, // 自残阈值
};

const APPROVAL_THRESHOLD = 0.5; // 整体通过阈值

/**
 * Replicate 审核模型输出格式
 */
interface ReplicateModerationOutput {
  scores?: Record<string, number>;
  status?: string;
  error?: string;
}

/**
 * 解析 Replicate 审核输出
 */
function parseModerationOutput(output: ReplicateModerationOutput): ModerationResult {
  if (!output || output.error) {
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
      reason: output?.error || '审核服务错误',
    };
  }

  const scores = output.scores || {};

  // 标准化类别分数
  const categories: ModerationCategories = {
    violence: scores['violence'] || scores['violence/graphic'] || 0,
    sexual: scores['sexual'] || scores['sexual/minors'] || scores['nudity'] || 0,
    hate: scores['hate'] || scores['hate_symbol'] || 0,
    harassment: scores['harassment'] || scores['insult'] || 0,
    selfHarm: scores['self_harm'] || scores['self-harm'] || 0,
  };

  // 检查是否超过任何阈值
  let isApproved = true;
  let maxViolationScore = 0;

  for (const [category, score] of Object.entries(categories)) {
    const threshold = DEFAULT_THRESHOLDS[category as keyof typeof DEFAULT_THRESHOLDS] || 0.7;
    if (score > threshold) {
      isApproved = false;
      if (score > maxViolationScore) {
        maxViolationScore = score;
      }
    }
  }

  // 计算整体置信度
  const maxScore = Math.max(...Object.values(categories));
  const confidence = isApproved ? 1 - maxScore : maxScore;

  // 确定行动
  const action: ModerationResult['action'] = isApproved ? 'approved' : 'rejected';

  // 生成原因
  let reason: string | undefined;
  if (!isApproved) {
    const message = getModerationMessage(categories, DEFAULT_THRESHOLDS);
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
 * 审核图片内容
 *
 * @param imageUrl - 图片 URL
 * @returns 审核结果
 */
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  try {
    // 使用 Replicate 的内容审核模型
    // 注意：实际使用时需要替换为真实的审核模型 ID
    const modelId = (process.env.REPLICATE_MODERATION_MODEL || 'moderation-model-version') as `${string}/${string}` | `${string}/${string}:${string}`;

    console.log('[Moderation] Starting image moderation:', { imageUrl, modelId });

    const output = await replicate.run(modelId, {
      input: {
        image: imageUrl,
      },
    }) as ReplicateModerationOutput;

    console.log('[Moderation] Raw output:', output);

    const result = parseModerationOutput(output);

    console.log('[Moderation] Parsed result:', result);

    return result;
  } catch (error) {
    console.error('[Moderation] Error:', error);

    // 审核失败时，出于安全考虑，拒绝内容
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
 * Mock 图片审核（用于开发测试）
 *
 * 在开发环境中，如果未配置 Replicate 审核模型，使用 mock 函数
 */
export async function moderateImageMock(imageUrl: string): Promise<ModerationResult> {
  console.log('[Moderation] Using mock moderation for:', imageUrl);

  // 模拟审核延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 简单规则：如果 URL 包含 "test-violence" 或 "test-adult"，则拒绝
  const url = imageUrl.toLowerCase();

  if (url.includes('test-violence')) {
    return {
      isApproved: false,
      confidence: 0.95,
      categories: {
        violence: 0.95,
        sexual: 0.1,
        hate: 0.05,
        harassment: 0.05,
        selfHarm: 0.05,
      },
      action: 'rejected',
      reason: '图片包含暴力内容',
    };
  }

  if (url.includes('test-adult') || url.includes('test-sexual')) {
    return {
      isApproved: false,
      confidence: 0.92,
      categories: {
        violence: 0.05,
        sexual: 0.92,
        hate: 0.05,
        harassment: 0.05,
        selfHarm: 0.05,
      },
      action: 'rejected',
      reason: '图片包含敏感内容',
    };
  }

  // 默认通过
  return {
    isApproved: true,
    confidence: 0.98,
    categories: {
      violence: 0.02,
      sexual: 0.01,
      hate: 0.01,
      harassment: 0.01,
      selfHarm: 0.01,
    },
    action: 'approved',
  };
}

/**
 * 获取审核函数（根据环境选择真实或 mock）
 */
export function getModerationFunction() {
  const useMock = process.env.NODE_ENV === 'development' && !process.env.REPLICATE_MODERATION_MODEL;

  return useMock ? moderateImageMock : moderateImage;
}
