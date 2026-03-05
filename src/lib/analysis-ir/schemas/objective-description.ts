/**
 * Objective Description Schema
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * 定义统一的分析任务客观描述协议
 * 使用 Zod 4 进行运行时验证和 TypeScript 类型推导
 */

import { z } from 'zod';

/**
 * 规范化任务状态枚举
 */
export const TaskStatusEnum = z.enum([
  'queued',
  'running',
  'partial',
  'failed',
  'completed',
  'canceled',
]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

/**
 * 当前执行阶段
 */
export const CurrentStageEnum = z.enum([
  'forensic_describer',
  'style_fingerprinter',
  'prompt_compiler',
  'qa_critic',
]);
export type CurrentStage = z.infer<typeof CurrentStageEnum>;

/**
 * 阶段状态枚举
 */
export const StageStatusEnum = z.enum([
  'queued',
  'running',
  'completed',
  'failed',
  'skipped',
]);
export type StageStatus = z.infer<typeof StageStatusEnum>;

/**
 * 可见内容描述
 */
export const VisibleContentSchema = z.object({
  /** 主要主体/对象列表 */
  primary_subjects: z.array(z.string()).min(1),
  /** 次要元素（可选） */
  secondary_elements: z.array(z.string()).optional(),
  /** 场景设置 */
  setting: z.string().min(1),
  /** 动作/活动（可选） */
  actions: z.array(z.string()).optional(),
  /** 文本内容（可选） */
  text_content: z.array(z.string()).optional(),
});

/**
 * 摄影/成像特征
 */
export const ImagingFeaturesSchema = z.object({
  /** 成像技术（如 photography, digital_art 等） */
  technique: z.string().min(1),
  /** 光照类型 */
  lighting: z.string().min(1),
  /** 构图方式（可选） */
  composition: z.string().optional(),
  /** 视角（可选） */
  perspective: z.string().optional(),
});

/**
 * 不确定字段
 */
export const UncertaintyFieldSchema = z.object({
  /** 字段路径（如 'visible_content.actions'） */
  field_path: z.string().min(1),
  /** 不确定原因 */
  reason: z.string().min(1),
  /** 置信度（0-1） */
  confidence: z.number().min(0).max(1),
});

/**
 * 客观描述结果
 *
 * 这是 Forensic Describer 阶段的输出结构
 * 满足 AC1: 返回完整 objective_description
 * 满足 AC2: 无法可靠判断的字段显式标记为 unknown
 * 满足 AC3: 统一 JSON 契约
 */
export const ObjectiveDescriptionSchema = z.object({
  /** 可见内容描述 */
  visible_content: VisibleContentSchema,
  /** 摄影/成像特征 */
  imaging_features: ImagingFeaturesSchema,
  /** 整体置信度 (0-1) */
  overall_confidence: z.number().min(0).max(1),
  /** 不确定字段列表 */
  uncertainty_fields: z.array(UncertaintyFieldSchema),
});

/**
 * 从 Zod schema 推导 TypeScript 类型
 */
export type VisibleContent = z.infer<typeof VisibleContentSchema>;
export type ImagingFeatures = z.infer<typeof ImagingFeaturesSchema>;
export type UncertaintyField = z.infer<typeof UncertaintyFieldSchema>;
export type ObjectiveDescription = z.infer<typeof ObjectiveDescriptionSchema>;

/**
 * 客观描述结果包装（用于 API 响应）
 */
export const ObjectiveDescriptionResultSchema = z.object({
  success: z.literal(true),
  data: ObjectiveDescriptionSchema,
});

export type ObjectiveDescriptionResult = z.infer<typeof ObjectiveDescriptionResultSchema>;

/**
 * 客观描述错误响应
 */
export const ObjectiveDescriptionErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean().optional(),
  }),
});

export type ObjectiveDescriptionError = z.infer<typeof ObjectiveDescriptionErrorSchema>;

/**
 * 客观描述响应联合类型
 */
export const ObjectiveDescriptionResponseSchema = z.discriminatedUnion('success', [
  ObjectiveDescriptionResultSchema,
  ObjectiveDescriptionErrorSchema,
]);

export type ObjectiveDescriptionResponse = z.infer<typeof ObjectiveDescriptionResponseSchema>;

/**
 * Schema 版本信息
 */
export const SCHEMA_VERSION = '1.0.0' as const;

/**
 * 默认值工厂函数
 * 用于创建带有合理默认值的客观描述对象
 */
export function createDefaultObjectiveDescription(): Partial<ObjectiveDescription> {
  return {
    visible_content: {
      primary_subjects: [],
      setting: '',
    },
    imaging_features: {
      technique: 'unknown',
      lighting: 'unknown',
    },
    overall_confidence: 0.5,
    uncertainty_fields: [],
  };
}

/**
 * 验证客观描述数据
 * 使用 safeParse 返回机器可读错误
 */
export function validateObjectiveDescription(
  data: unknown
): ReturnType<typeof ObjectiveDescriptionSchema.safeParse> {
  return ObjectiveDescriptionSchema.safeParse(data);
}

/**
 * 创建未知标记字段
 * 用于标记无法可靠判断的字段
 */
export function createUnknownField(
  fieldPath: string,
  reason: string,
  confidence: number = 0.0
): UncertaintyField {
  return {
    field_path: fieldPath,
    reason,
    confidence: Math.max(0, Math.min(1, confidence)),
  };
}
