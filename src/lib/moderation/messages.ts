/**
 * 内容审核友好提示消息
 *
 * Story 4-1: 内容审核功能
 * Story 4-2: 生成安全功能
 */

export const MODERATION_MESSAGES = {
  violence: {
    title: '图片包含暴力内容',
    suggestion: '请上传不含暴力或血腥内容的图片',
    category: 'violence',
  },
  sexual: {
    title: '图片包含敏感内容',
    suggestion: '请上传适合所有年龄段的内容',
    category: 'sexual',
  },
  hate: {
    title: '图片包含不当符号',
    suggestion: '请确保内容不包含仇恨或歧视性符号',
    category: 'hate',
  },
  harassment: {
    title: '图片包含骚扰内容',
    suggestion: '请确保内容不会对他人造成骚扰',
    category: 'harassment',
  },
  selfHarm: {
    title: '图片包含不当内容',
    suggestion: '请上传健康积极的内容',
    category: 'selfHarm',
  },
  general: {
    title: '内容不符合社区政策',
    suggestion: '请查看我们的内容政策并修改后重试',
    link: '/content-policy',
    category: 'general',
  },
} as const;

/**
 * Story 4-2: 生成内容审核消息
 */
export const GENERATION_MODERATION_MESSAGES = {
  prompt: {
    violence: {
      title: '提示词包含暴力相关内容',
      suggestion: '请修改提示词，避免描述暴力场景或行为',
      category: 'violence',
    },
    sexual: {
      title: '提示词包含敏感内容',
      suggestion: '请使用更合适的描述方式',
      category: 'sexual',
    },
    hate: {
      title: '提示词包含仇恨相关内容',
      suggestion: '请确保提示词不包含歧视性描述',
      category: 'hate',
    },
    harassment: {
      title: '提示词包含骚扰相关内容',
      suggestion: '请修改提示词，避免骚扰性描述',
      category: 'harassment',
    },
    selfHarm: {
      title: '提示词包含不当内容',
      suggestion: '请使用积极健康的描述',
      category: 'selfHarm',
    },
    illegal: {
      title: '提示词可能生成违规内容',
      suggestion: '请确保生成内容符合法律法规',
      category: 'illegal',
    },
    general: {
      title: '提示词需要修改',
      suggestion: '请查看我们的内容政策并修改后重试',
      link: '/content-policy',
      category: 'general',
    },
    sensitive_keywords: {
      title: '提示词包含敏感词汇',
      suggestion: '请移除敏感词汇后重试',
      category: 'sensitive_keywords',
    },
    too_long: {
      title: '提示词过长',
      suggestion: '请简化描述，保持在 1000 字符以内',
      category: 'too_long',
    },
  },
  image: {
    rejected: {
      title: '生成的图片不符合内容政策',
      suggestion: '图片已被自动删除，请修改提示词后重试',
      category: 'rejected',
    },
    violence: {
      title: '生成的图片包含暴力内容',
      suggestion: '请修改提示词以避免生成此类内容',
      category: 'violence',
    },
    sexual: {
      title: '生成的图片包含敏感内容',
      suggestion: '请调整提示词以生成合适的内容',
      category: 'sexual',
    },
  },
  review: {
    pending: {
      title: '生成请求正在审核中',
      suggestion: '您的请求已提交审核，预计 24 小时内完成',
      category: 'pending',
    },
    approved: {
      title: '审核通过',
      suggestion: '您的生成请求已通过审核',
      category: 'approved',
    },
    rejected: {
      title: '审核未通过',
      suggestion: '您的生成请求未通过审核，请查看内容政策',
      link: '/content-policy',
      category: 'rejected',
    },
  },
} as const;

export type ModerationCategory = keyof typeof MODERATION_MESSAGES;

/**
 * 根据审核结果获取最严重的问题类别
 */
export function getPrimaryReason(
  categories: Record<string, number>,
  thresholds: Record<string, number>
): ModerationCategory {
  let maxScore = 0;
  let primaryCategory: ModerationCategory = 'general';

  for (const [category, score] of Object.entries(categories)) {
    if (score > thresholds[category] && score > maxScore) {
      maxScore = score;
      primaryCategory = category as ModerationCategory;
    }
  }

  return primaryCategory;
}

/**
 * 获取审核失败消息
 */
export function getModerationMessage(
  categories: Record<string, number>,
  thresholds: Record<string, number>
) {
  const primaryCategory = getPrimaryReason(categories, thresholds);
  return MODERATION_MESSAGES[primaryCategory];
}
