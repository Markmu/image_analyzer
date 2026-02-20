/**
 * Progress Constants
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Configuration constants for progress tracking
 */

import { STAGE_THRESHOLDS, STAGE_LABELS } from '../types/progress';

/**
 * Timeout duration in seconds
 */
export const TIMEOUT_DURATION = 90;

/**
 * Maximum retry count
 */
export const MAX_RETRY_COUNT = 3;

/**
 * Retry delays in milliseconds (exponential backoff)
 */
export const RETRY_DELAYS = [1000, 2000, 4000];

/**
 * Default estimated generation time in seconds
 */
export const DEFAULT_ESTIMATED_TIME = 45;

/**
 * Progress update throttle interval in milliseconds
 */
export const PROGRESS_UPDATE_THROTTLE = 1000;

/**
 * Batch generation max concurrent items
 */
export const MAX_CONCURRENT_BATCH_ITEMS = 4;

/**
 * Progress persistence key for localStorage
 */
export const PROGRESS_STORAGE_KEY = 'generation-progress';

/**
 * Notification permission key for localStorage
 */
export const NOTIFICATION_PERMISSION_KEY = 'notification-permission';

/**
 * Historical generation times storage key
 */
export const GENERATION_TIMES_KEY = 'generation-times';

/**
 * Maximum historical times to store
 */
export const MAX_HISTORICAL_TIMES = 50;

/**
 * Stage icons configuration (Lucide icon names)
 */
export const STAGE_ICONS = {
  initializing: 'Loader2',
  parsing: 'Loader2',
  queued: 'Clock',
  generating: 'Loader2',
  post_processing: 'Loader2',
  saving: 'Loader2',
  completed: 'CheckCircle',
  failed: 'AlertCircle',
  timeout: 'AlertCircle',
} as const;

/**
 * Progress animation duration in milliseconds
 */
export const PROGRESS_ANIMATION_DURATION = 300;

/**
 * Batch generation layout breakpoints
 */
export const BATCH_LAYOUT_BREAKPOINTS = {
  desktop: 1024,
  tablet: 768,
} as const;

/**
 * Error message templates
 */
export const ERROR_MESSAGES = {
  timeout: {
    title: '生成超时',
    message: '图片生成时间超过了预期时间。这可能是由于网络问题或服务器负载较高。',
    suggestions: [
      '检查您的网络连接',
      '稍后重试',
      '尝试使用较低的分辨率',
      '减少同时生成的图片数量',
    ],
  },
  api_error: {
    title: 'API 错误',
    message: '与图片生成服务通信时出现问题。',
    suggestions: [
      '检查您的网络连接',
      '稍后重试',
      '如果问题持续存在,请联系支持',
    ],
  },
  network_error: {
    title: '网络错误',
    message: '无法连接到图片生成服务。',
    suggestions: [
      '检查您的网络连接',
      '稍后重试',
      '尝试切换到不同的网络',
    ],
  },
  insufficient_credits: {
    title: '积分不足',
    message: '您的账户积分不足以生成此图片。',
    suggestions: [
      '升级您的订阅计划',
      '分享图片以获取额外积分',
      '选择较低的分辨率以节省积分',
    ],
  },
} as const;

/**
 * Progress colors (Tailwind classes)
 */
export const PROGRESS_COLORS = {
  bar: 'bg-gradient-to-r from-purple-500 to-green-500',
  barBackground: 'bg-gray-200 dark:bg-gray-700',
  text: 'text-gray-900 dark:text-gray-100',
  subtext: 'text-gray-600 dark:text-gray-400',
  icon: {
    initializing: 'text-blue-500',
    parsing: 'text-purple-500',
    queued: 'text-yellow-500',
    generating: 'text-purple-500 animate-spin',
    post_processing: 'text-green-500',
    saving: 'text-green-500',
    completed: 'text-green-500',
    failed: 'text-red-500',
    timeout: 'text-red-500',
  },
} as const;

/**
 * Re-export stage thresholds and labels for convenience
 */
export { STAGE_THRESHOLDS, STAGE_LABELS };
