/**
 * Forensic Describer Stage
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * 职责：
 * - 调用外部模型生成图像客观描述
 * - 解析并验证模型响应
 * - 构建符合 Zod schema 的客观描述结构
 * - 处理超时、重试和错误场景
 */

import { replicate } from '@/lib/replicate';
import {
  ObjectiveDescriptionSchema,
  type ObjectiveDescription,
  createUnknownField,
} from '@/lib/analysis-ir/schemas/objective-description';

/**
 * Forensic Describer 阶段配置
 */
const FORENSIC_DESCRIBER_CONFIG = {
  /** 调用超时时间（毫秒） */
  TIMEOUT_MS: 30000,
  /** 最大重试次数 */
  MAX_RETRIES: 1,
  /** 默认模型 - 使用完整路径避免类型断言 */
  DEFAULT_MODEL: 'anthropic/claude-3-5-sonnet-20240620',
} as const;

// 确保模型常量类型正确
const MODEL_VERSION = FORENSIC_DESCRIBER_CONFIG.DEFAULT_MODEL as const;

/**
 * Forensic Describer 提示词模板
 */
const FORENSIC_DESCRIBER_PROMPT = `Analyze this image and provide a forensic, objective description. Respond ONLY with valid JSON in this exact format:

{
  "visible_content": {
    "primary_subjects": ["subject1", "subject2"],
    "secondary_elements": ["element1", "element2"],
    "setting": "scene description",
    "actions": ["action1"],
    "text_content": ["text1"]
  },
  "imaging_features": {
    "technique": "photography/digital_art/other",
    "lighting": "natural/artificial/mixed",
    "composition": "rule-of-thirds/centered/symmetrical",
    "perspective": "eye-level/high-angle/low-angle"
  },
  "overall_confidence": 0.0-1.0,
  "uncertainty_fields": [
    {
      "field_path": "path.to.field",
      "reason": "why uncertain",
      "confidence": 0.0-1.0
    }
  ]
}

Guidelines:
- Be objective and factual - only describe what is visibly present
- Use "unknown" for fields that cannot be reliably determined
- Include uncertain fields in uncertainty_fields array with reasons
- overall_confidence should reflect how certain you are about the entire analysis
- If a field is uncertain, add it to uncertainty_fields with the field path and reason`;

/**
 * Forensic Describer 阶段输入
 */
export interface ForensicDescriberInput {
  /** 图片 URL */
  image_url: string;
  /** 任务 ID */
  task_id: string;
  /** 可选的自定义提示词 */
  custom_prompt?: string;
}

/**
 * Forensic Describer 阶段输出
 */
export interface ForensicDescriberOutput {
  success: true;
  data: ObjectiveDescription;
  metadata: {
    model_used: string;
    provider: 'replicate';
    attempt_no: number;
    duration_ms: number;
  };
}

/**
 * Forensic Describer 阶段错误
 */
export interface ForensicDescriberError {
  success: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    attempt_no: number;
  };
}

/**
 * Forensic Describer 阶段结果
 */
export type ForensicDescriberResult = ForensicDescriberOutput | ForensicDescriberError;

/**
 * 错误代码枚举
 */
export const ERROR_CODES = {
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE_FORMAT: 'INVALID_RESPONSE_FORMAT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * 执行 Forensic Describer 阶段
 *
 * @param input - 阶段输入
 * @param attemptNo - 当前尝试次数（用于重试逻辑）
 * @returns 阶段结果
 *
 * @example
 * ```typescript
 * const result = await runForensicDescriberStage({
 *   image_url: 'https://example.com/image.jpg',
 *   task_id: 'task-123',
 * });
 *
 * if (result.success) {
 *   console.log('Visible content:', result.data.visible_content);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export async function runForensicDescriberStage(
  input: ForensicDescriberInput,
  attemptNo: number = 1
): Promise<ForensicDescriberResult> {
  const startTime = Date.now();
  const { image_url, task_id, custom_prompt } = input;

  try {
    // 执行外部模型调用（带超时控制）
    const modelOutput = await callReplicateWithTimeout(
      image_url,
      custom_prompt || FORENSIC_DESCRIBER_PROMPT,
      FORENSIC_DESCRIBER_CONFIG.TIMEOUT_MS
    );

    // 解析并验证响应
    const objectiveDescription = parseAndValidateResponse(modelOutput);

    // 计算执行时间
    const durationMs = Date.now() - startTime;

    return {
      success: true,
      data: objectiveDescription,
      metadata: {
        model_used: FORENSIC_DESCRIBER_CONFIG.DEFAULT_MODEL,
        provider: 'replicate',
        attempt_no: attemptNo,
        duration_ms: durationMs,
      },
    };
  } catch (error) {
    return handleError(error, attemptNo);
  }
}

/**
 * 调用 Replicate 模型（带超时控制）
 */
async function callReplicateWithTimeout(
  imageUrl: string,
  prompt: string,
  timeoutMs: number
): Promise<unknown> {
  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  // 调用 Replicate - 使用类型安全的模型版本
  const replicatePromise = replicate.run(MODEL_VERSION, {
    input: {
      image: imageUrl,
      prompt: prompt,
      max_tokens: 1000,
    },
  });

  // 竞速：Replicate 调用 vs 超时
  return Promise.race([replicatePromise, timeoutPromise]);
}

/**
 * 解析并验证模型响应
 */
function parseAndValidateResponse(modelOutput: unknown): ObjectiveDescription {
  // 转换为字符串（如果还不是）
  const outputStr = typeof modelOutput === 'string' ? modelOutput : JSON.stringify(modelOutput);

  // 解析 JSON
  let parsedOutput: unknown;
  try {
    parsedOutput = JSON.parse(outputStr);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 使用 Zod 验证
  const validationResult = ObjectiveDescriptionSchema.safeParse(parsedOutput);

  if (!validationResult.success) {
    const errorDetails = validationResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Validation failed: ${errorDetails}`);
  }

  return validationResult.data;
}

/**
 * 处理错误并返回结构化错误响应
 */
function handleError(error: unknown, attemptNo: number): ForensicDescriberError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // 判断错误类型和是否可重试
  let errorCode: keyof typeof ERROR_CODES = 'UNKNOWN_ERROR';
  let retryable = false;

  // 使用 Error 对象的类型和属性进行判断，而非字符串匹配
  if (error instanceof Error) {
    // 检查错误名称或代码
    if (error.name === 'TimeoutError' || errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      errorCode = ERROR_CODES.TIMEOUT;
      retryable = true;
    } else if (
      error.name === 'NetworkError' ||
      error.name === 'FetchError' ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('network')
    ) {
      errorCode = ERROR_CODES.NETWORK_ERROR;
      retryable = true;
    } else if (errorMessage.includes('invalid json') || errorMessage.includes('JSON.parse')) {
      errorCode = ERROR_CODES.INVALID_RESPONSE_FORMAT;
      retryable = false;
    } else if (errorMessage.includes('validation failed') || errorMessage.includes('ZodError')) {
      errorCode = ERROR_CODES.VALIDATION_ERROR;
      retryable = false;
    } else if (
      errorMessage.includes('503') ||
      errorMessage.includes('503 Service Unavailable') ||
      errorMessage.includes('model unavailable')
    ) {
      errorCode = ERROR_CODES.MODEL_UNAVAILABLE;
      retryable = true;
    }
  }

  return {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      retryable,
      attempt_no: attemptNo,
    },
  };
}

/**
 * 判断是否应该重试
 */
export function shouldRetry(result: ForensicDescriberResult): boolean {
  if (!result.success && result.error.retryable) {
    // MAX_RETRIES = 1 表示最多重试1次
    // attempt_no = 1 表示第一次失败，可以重试
    // attempt_no = 2 表示第二次失败（已经重试过1次），不能再重试
    return result.error.attempt_no <= FORENSIC_DESCRIBER_CONFIG.MAX_RETRIES;
  }
  return false;
}
