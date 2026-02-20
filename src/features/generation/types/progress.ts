/**
 * Progress Types
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Extended type definitions for detailed generation progress tracking
 */

/**
 * Extended generation progress stages with more granular states
 * 使用字符串字面量联合类型而非 enum，以避免与 store 中的字符串类型不匹配
 */
export type GenerationStage =
  | 'initializing'       // 正在初始化模型 (0-10%)
  | 'parsing'            // 正在解析提示词 (10-20%)
  | 'queued'             // 队列等待 (20-30%)
  | 'generating'         // 正在生成图片 (30-90%)
  | 'post_processing'    // 正在优化图片 (90-95%)
  | 'saving'             // 正在保存图片 (95-100%)
  | 'completed'          // 完成
  | 'failed'             // 失败
  | 'timeout';           // 超时

/**
 * Error information for failed generations
 */
export interface GenerationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Number of retries attempted */
  retryCount?: number;
  /** Suggested actions for the user */
  suggestions?: string[];
}

/**
 * Extended generation progress information
 */
export interface GenerationProgress {
  /** Unique generation task ID */
  id: string;
  /** Current stage */
  stage: GenerationStage;
  /** Stage display name for UI */
  stageName?: string;
  /** Completion percentage (0-100) */
  progress: number;
  /** Estimated remaining time in seconds */
  estimatedTimeRemaining: number;
  /** Current queue position (only in queued stage) */
  currentPosition?: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Error information (only in failed stage) */
  error?: GenerationError;
  /** Template ID */
  templateId?: string;
  /** Template name for display */
  templateName?: string;
}

/**
 * Batch generation progress information
 */
export interface BatchGenerationProgress {
  /** Batch generation task ID */
  id: string;
  /** Total number of images */
  totalItems: number;
  /** Number of completed items */
  completedItems: number;
  /** Number of failed items */
  failedItems: number;
  /** Overall completion percentage (0-100) */
  overallPercentage: number;
  /** Individual image progress list */
  items: GenerationProgress[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Estimated remaining time in seconds */
  estimatedTimeRemaining: number;
}

/**
 * Progress stage thresholds
 */
export const STAGE_THRESHOLDS = {
  INITIALIZING: { min: 0, max: 10 },
  PARSING: { min: 10, max: 20 },
  QUEUED: { min: 20, max: 30 },
  GENERATING: { min: 30, max: 90 },
  POST_PROCESSING: { min: 90, max: 95 },
  SAVING: { min: 95, max: 100 },
} as const;

/**
 * Stage display labels (Chinese)
 */
export const STAGE_LABELS: Record<GenerationStage, string> = {
  'initializing': '正在初始化模型...',
  'parsing': '正在解析提示词...',
  'queued': '队列中',
  'generating': '正在生成图片...',
  'post_processing': '正在优化图片...',
  'saving': '正在保存图片...',
  'completed': '生成完成',
  'failed': '生成失败',
  'timeout': '生成超时',
};

/**
 * Progress update options
 */
export interface ProgressUpdateOptions {
  /** Throttle updates to avoid excessive re-renders (ms) */
  throttleMs?: number;
  /** Enable detailed logging */
  debug?: boolean;
}

/**
 * Notification permission status
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Generation notification data
 */
export interface GenerationNotification {
  /** Generation task ID */
  generationId: string;
  /** Notification type */
  type: 'completed' | 'failed' | 'timeout';
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Click action URL */
  clickUrl?: string;
  /** Timestamp */
  timestamp: Date;
}
