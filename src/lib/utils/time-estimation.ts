/**
 * 时间估算工具函数
 * 用于计算上传和分析阶段的预计剩余时间
 */

export type AnalysisStage = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'completed' | 'error';

/**
 * 分析阶段的时间分布（基于历史数据）
 * 单位：秒
 */
export const STAGE_DURATION = {
  uploading: 5, // 5 秒（上传阶段）
  analyzing: 40, // 40 秒（分析阶段）
  generating: 15, // 15 秒（生成模版阶段）
} as const;

/**
 * 历史数据收集接口
 */
interface HistoryData {
  [key: string]: number[]; // stage -> 历史耗时数组
}

/**
 * 历史数据存储（可选）
 * 用于收集实际耗时并动态调整估算
 */
const historyData: HistoryData = {
  uploading: [],
  analyzing: [],
  generating: [],
};

/**
 * 计算移动平均值
 */
const getMovingAverage = (stage: AnalysisStage): number => {
  const history = historyData[stage];
  if (history.length === 0) {
    // 只对有定义的 stage 返回默认值
    if (stage in STAGE_DURATION) {
      return STAGE_DURATION[stage as keyof typeof STAGE_DURATION] || 30;
    }
    return 30;
  }
  const sum = history.reduce((acc, val) => acc + val, 0);
  return sum / history.length;
};

/**
 * 记录阶段实际耗时（用于优化后续估算）
 */
export const recordStageDuration = (stage: AnalysisStage, duration: number): void => {
  if (stage !== 'idle' && stage !== 'error' && stage !== 'completed') {
    historyData[stage].push(duration);
    // 只保留最近 50 次记录
    if (historyData[stage].length > 50) {
      historyData[stage].shift();
    }
  }
};

/**
 * 计算分析阶段的剩余时间
 * @param stage 当前阶段
 * @param progress 当前进度（0-100）
 * @returns 预计剩余时间（秒）
 */
export const calculateAnalysisTime = (
  stage: AnalysisStage,
  progress: number
): number => {
  if (stage === 'completed') return 0;
  if (stage === 'idle') return getMovingAverage('analyzing') + getMovingAverage('generating');
  if (stage === 'error') return 0;

  const stageDuration = getMovingAverage(stage);
  const remaining = stageDuration * (1 - progress / 100);

  // 加上后续阶段的时间
  if (stage === 'uploading') {
    return remaining + getMovingAverage('analyzing') + getMovingAverage('generating');
  } else if (stage === 'analyzing') {
    return remaining + getMovingAverage('generating');
  } else if (stage === 'generating') {
    return remaining;
  }

  return stageDuration;
};

/**
 * 计算上传的剩余时间
 * @param progress 上传进度（0-100）
 * @param speed 上传速度（MB/s）
 * @param fileSize 文件大小（MB）
 * @returns 预计剩余时间（秒）
 */
export const calculateUploadTime = (
  progress: number,
  speed: number,
  fileSize: number = 5
): number => {
  if (speed === 0 || progress >= 100) return 0;

  const remaining = (100 - progress) / 100;
  const remainingBytes = fileSize * remaining;

  return remainingBytes / speed;
};

/**
 * 格式化时间显示
 * @param seconds 秒数
 * @returns 格式化后的时间字符串（例如："预计还需 30 秒" 或 "预计还需 2 分钟"）
 */
export const formatEstimatedTime = (seconds: number): string => {
  if (seconds <= 0) return '即将完成';

  if (seconds < 60) {
    return `预计还需 ${Math.round(seconds)} 秒`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (remainingSeconds === 0) {
    return `预计还需 ${minutes} 分钟`;
  }

  return `预计还需 ${minutes} 分 ${remainingSeconds} 秒`;
};

/**
 * 智能调整估算时间
 * 根据实际进度与估算的偏差动态调整
 * @param originalEstimate 原始估算时间
 * @param actualElapsed 实际已用时间
 * @param currentProgress 当前进度
 * @returns 调整后的估算时间
 */
export const adjustEstimate = (
  originalEstimate: number,
  actualElapsed: number,
  currentProgress: number
): number => {
  if (currentProgress <= 0) return originalEstimate;

  // 计算实际进度速度（每秒完成百分比）
  const actualSpeed = currentProgress / actualElapsed;

  // 计算估算进度速度
  const estimatedSpeed = 100 / originalEstimate;

  // 如果实际速度明显低于估算速度，调整估算
  if (actualSpeed < estimatedSpeed * 0.5) {
    // 实际速度低于估算的 50%，增加 50% 时间
    return originalEstimate * 1.5;
  } else if (actualSpeed < estimatedSpeed * 0.75) {
    // 实际速度低于估算的 75%，增加 25% 时间
    return originalEstimate * 1.25;
  }

  // 如果进度停滞（过去 10 秒内进度没有变化），增加估算
  // 这个逻辑需要在调用处维护一个"上一次进度"的状态
  return originalEstimate;
};
