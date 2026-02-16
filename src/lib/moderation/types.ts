/**
 * 内容审核类型定义
 *
 * Story 4-1: 内容审核功能
 * Epic 4: 内容安全与合规
 */

/**
 * 审核类别分数（0-1，越高表示越可能包含该类内容）
 */
export interface ModerationCategories {
  violence: number; // 暴力内容
  sexual: number; // 色情内容
  hate: number; // 仇恨符号
  harassment: number; // 骚扰
  selfHarm: number; // 自残
  [key: string]: number; // 索引签名
}

/**
 * 审核结果
 */
export interface ModerationResult {
  isApproved: boolean; // 是否通过审核
  confidence: number; // 整体置信度 (0-1)
  categories: ModerationCategories; // 各类别分数
  action: 'approved' | 'rejected' | 'flagged'; // 采取的行动
  reason?: string; // 拒绝或标记的原因
}

/**
 * 审核配置
 */
export interface ModerationConfig {
  // 各类别的阈值（超过即认为包含该类内容）
  thresholds: {
    violence: number;
    sexual: number;
    hate: number;
    harassment: number;
    selfHarm: number;
  };
  // 整体通过阈值
  approvalThreshold: number;
}

/**
 * 文本审核请求
 */
export interface TextModerationRequest {
  text: string;
  userId: string;
}

/**
 * 图片审核请求
 */
export interface ImageModerationRequest {
  imageUrl: string;
  userId: string;
  imageId?: string;
  batchId?: number;
}

/**
 * 审核日志
 */
export interface ModerationLog {
  id: number;
  userId: string;
  imageId?: string;
  contentType: ContentType;
  moderationResult: ModerationResult;
  action: ModerationAction;
  reason?: string;
  batchId?: number;
  // Story 4-2: 生成安全功能新增字段
  generationId?: number;
  riskLevel?: RiskLevel;
  requiresManualReview?: boolean;
  createdAt: Date;
}

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 审核操作类型
 */
export type ModerationAction = 'approved' | 'rejected' | 'flagged';

/**
 * 内容类型
 */
export type ContentType = 'image' | 'text';

/**
 * 订阅等级
 */
export type SubscriptionTier = 'free' | 'lite' | 'standard';

/**
 * 判断审核是否通过
 */
export function isModerationApproved(result: ModerationResult): boolean {
  return result.isApproved && result.action === 'approved';
}

/**
 * 获取最高风险类别
 */
export function getHighestRiskCategory(
  categories: ModerationCategories
): { category: string; score: number } {
  let maxCategory = 'violence';
  let maxScore = categories.violence;

  for (const [category, score] of Object.entries(categories)) {
    if (score > maxScore) {
      maxCategory = category;
      maxScore = score;
    }
  }

  return { category: maxCategory, score: maxScore };
}
