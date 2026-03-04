/**
 * 任务状态 Schema
 *
 * 定义统一的分析任务状态协议
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 */

/**
 * 规范化任务状态枚举
 * - queued: 任务在队列中等待
 * - running: 任务正在执行
 * - partial: 任务部分完成（例如批量分析中部分图片失败）
 * - failed: 任务失败
 * - completed: 任务成功完成
 * - canceled: 任务已取消
 */
export type TaskStatus = 'queued' | 'running' | 'partial' | 'failed' | 'completed' | 'canceled';

/**
 * 当前执行阶段
 * 仅在任务进入具体执行阶段时返回，queued/canceled 等状态应为 null
 */
export type CurrentStage = 'forensic_describer' | 'style_fingerprinter' | 'prompt_compiler' | 'qa_critic' | null;

/**
 * 进度信息
 * 必须是固定对象形态，不允许返回数字或其他格式
 */
export interface TaskProgress {
  /** 进度百分比 (0-100) */
  percentage: number;
  /** 已完成步骤数（可选） */
  completed_steps?: number;
  /** 总步骤数（可选） */
  total_steps?: number;
}

/**
 * 排队状态信息（queued 状态时返回）
 */
export interface QueueInfo {
  /** 队列位置 */
  queue_position: number;
  /** 预计等待时间（秒，可选） */
  estimated_wait_time?: number;
}

/**
 * 可恢复操作
 * 定义用户在当前状态下可执行的恢复操作
 */
export type RecoverableAction = 'retry' | 'view_error' | 'view_result' | 'cancel' | 'none';

/**
 * 错误摘要
 * 用于向用户展示的简化错误信息
 */
export interface ErrorSummary {
  /** 用户友好的错误消息 */
  message: string;
  /** 错误代码（可选） */
  code?: string;
  /** 是否可重试 */
  retryable: boolean;
}

/**
 * 任务状态视图
 * 状态接口返回的轻量状态视图，不包含完整结果
 */
export interface TaskStatusView {
  /** 任务 ID（可能是数字 ID 或 public_id） */
  id: string | number;
  /** 任务状态 */
  status: TaskStatus;
  /** 当前执行阶段（可选，queued/canceled 时为 null） */
  current_stage: CurrentStage;
  /** 进度信息 */
  progress: TaskProgress;
  /** 可恢复操作列表 */
  recoverable_actions: RecoverableAction[];
  /** 最后更新时间 */
  updated_at: string;
  /** 错误摘要（失败或部分完成时） */
  error_summary?: ErrorSummary;
  /** 排队信息（queued 状态时） */
  queue_info?: QueueInfo;
}

/**
 * API 响应类型
 */
export interface TaskStatusResponse {
  success: true;
  data: TaskStatusView;
}

export interface TaskStatusErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * 状态转换规则
 * 定义合法的状态转换路径
 */
export const VALID_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  queued: ['running', 'canceled', 'failed'],
  running: ['completed', 'failed', 'partial', 'canceled'],
  partial: ['running', 'canceled', 'failed'],
  failed: ['running', 'canceled'],
  completed: [], // 终态
  canceled: [], // 终态
};

/**
 * 检查状态转换是否合法
 */
export function isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

/**
 * 状态对应的可恢复操作
 */
export function getRecoverableActions(status: TaskStatus): RecoverableAction[] {
  switch (status) {
    case 'queued':
      return ['cancel'];
    case 'running':
      return ['cancel'];
    case 'partial':
      return ['view_result', 'retry', 'cancel'];
    case 'failed':
      return ['view_error', 'retry'];
    case 'completed':
      return ['view_result'];
    case 'canceled':
      return ['none'];
    default:
      return ['none'];
  }
}

/**
 * 状态到前端展示态的映射
 * 用于将服务端状态映射到前端 UI 展示状态
 * 注意：这是单向投影，前端不应该反向推导服务端状态
 */
export type DisplayStatus = 'uploading' | 'queued' | 'analyzing' | 'generating' | 'completed' | 'partial' | 'error' | 'canceled';

export function mapToDisplayStatus(
  taskStatus: TaskStatus,
  currentStage: CurrentStage
): DisplayStatus {
  switch (taskStatus) {
    case 'queued':
      return 'queued';
    case 'running':
      // 根据 current_stage 映射到具体展示态
      switch (currentStage) {
        case 'forensic_describer':
        case 'style_fingerprinter':
          return 'analyzing';
        case 'prompt_compiler':
        case 'qa_critic':
          return 'generating';
        default:
          return 'analyzing';
      }
    case 'partial':
      return 'partial';
    case 'failed':
      return 'error';
    case 'completed':
      return 'completed';
    case 'canceled':
      return 'canceled';
    default:
      return 'error';
  }
}
