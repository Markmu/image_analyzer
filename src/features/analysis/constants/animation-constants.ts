/**
 * 动画常量
 * 用于控制进度显示相关的动画效果
 */

/**
 * 打字机效果默认参数
 */
export const TYPEWRITER_DEFAULTS = {
  speed: 50, // 毫秒/字符
  deleteSpeed: 30, // 毫秒/字符
  delay: 2000, // 打完后停留时间（毫秒）
  cursorBlinkSpeed: 500, // 光标闪烁间隔（毫秒）
} as const;

/**
 * 轮询默认参数
 */
export const POLLING_DEFAULTS = {
  interval: 2000, // 2秒
  timeout: 60000, // 60秒
  maxRetries: 3,
  retryBaseDelay: 2000, // 重试基础延迟（毫秒）
} as const;

/**
 * 时间估算默认参数
 */
export const TIME_ESTIMATION_DEFAULTS = {
  defaultTotalTime: 60, // 默认总时间（秒）
  historyMaxLength: 50, // 历史记录最大长度
  slowSpeedThreshold: 0.5, // 慢速阈值（估算速度的 50%）
  verySlowSpeedThreshold: 0.25, // 极慢速阈值（估算速度的 25%）
} as const;

/**
 * 进度条默认参数
 */
export const PROGRESS_BAR_DEFAULTS = {
  animationDuration: 300, // 动画持续时间（毫秒）
  transitionTiming: 'ease', // 缓动函数
} as const;
