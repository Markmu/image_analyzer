/**
 * 队列管理服务
 *
 * Story 3-3: 分析进度与队列管理
 * AC-1: 并发控制机制
 * AC-5: 高并发场景处理
 *
 * 提供队列管理、并发控制、等待时间估算等功能
 */

import { getDb } from '@/lib/db';
import { user, batchAnalysisResults } from '@/lib/db/schema';
import { eq, and, desc, lt, isNull } from 'drizzle-orm';

// ============================================================
// 类型定义
// ============================================================

export type SubscriptionTier = 'free' | 'lite' | 'standard';

export interface QueueStatus {
  queueLength: number;
  userPosition: number;
  estimatedWaitTime: number;
  currentProcessing: number;
  maxConcurrent: number;
}

export interface QueueEntry {
  id: number;
  userId: string;
  status: string;
  isQueued: boolean;
  queuePosition: number | null;
  estimatedWaitTime: number | null;
  createdAt: Date;
  queuedAt: Date | null;
}

// ============================================================
// 内存队列（用于跟踪活跃任务）
// ============================================================

/**
 * 活跃任务队列（内存中）
 * 使用 Map 存储用户当前活跃的任务
 */
const activeTasks = new Map<string, number>();

/**
 * 全局等待队列
 * 存储所有等待中的任务
 */
const waitingQueue: QueueEntry[] = [];

/**
 * 处理中的任务集合
 */
const processingTasks = new Set<number>();

// ============================================================
// 并发限制配置
// ============================================================

/**
 * 根据订阅等级获取最大并发数
 */
export function getMaxConcurrent(tier: SubscriptionTier): number {
  switch (tier) {
    case 'free':
      return 1;
    case 'lite':
      return 3;
    case 'standard':
      return 10;
    default:
      return 1;
  }
}

/**
 * 平均处理时间（秒）
 * 用于估算等待时间
 */
const AVG_PROCESSING_TIME = 30;

/**
 * 计算预计等待时间
 *
 * @param queuePosition 队列位置
 * @param maxConcurrent 最大并发数
 * @returns 预计等待秒数
 */
export function calculateEstimatedWaitTime(
  queuePosition: number,
  maxConcurrent: number
): number {
  if (queuePosition <= 0) return 0;

  const effectivePosition = Math.ceil(
    queuePosition / Math.max(1, Math.floor(maxConcurrent / 2))
  );
  return effectivePosition * AVG_PROCESSING_TIME;
}

// ============================================================
// 用户订阅等级获取
// ============================================================

/**
 * 获取用户订阅等级
 *
 * @param userId 用户 ID
 * @returns 订阅等级: 'free' | 'lite' | 'standard'
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  try {
    const db = getDb();
    const userList = await db
      .select({ subscriptionTier: user.subscriptionTier })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userList.length === 0) {
      return 'free';
    }

    const tier = userList[0].subscriptionTier;
    if (tier === 'lite' || tier === 'standard') {
      return tier;
    }

    return 'free';
  } catch (error) {
    console.error('Failed to get user subscription tier:', error);
    return 'free';
  }
}

// ============================================================
// 并发控制
// ============================================================

/**
 * 获取用户当前活跃任务数
 *
 * @param userId 用户 ID
 * @returns 活跃任务数
 */
export function getUserActiveTaskCount(userId: string): number {
  return activeTasks.get(userId) || 0;
}

/**
 * 检查用户是否可以发起新任务
 *
 * @param userId 用户 ID
 * @param requiredSlots 需要占用槽位数（默认 1）
 * @returns { canProcess: boolean, queuePosition?: number, estimatedWaitTime?: number }
 */
export function checkQueueCapacity(
  userId: string,
  requiredSlots: number = 1
): { canProcess: boolean; queuePosition?: number; estimatedWaitTime?: number } {
  const userActiveCount = getUserActiveTaskCount(userId);

  // 简单检查：如果当前活跃任务数小于系统限制则允许
  // 注意：这里简化处理，实际应该根据用户订阅等级限制
  const maxConcurrent = 10; // 全局最大并发

  if (userActiveCount + requiredSlots <= maxConcurrent) {
    return { canProcess: true };
  }

  // 计算队列位置
  const queuePosition = getUserWaitingCount(userId) + 1;
  const estimatedWaitTime = calculateEstimatedWaitTime(queuePosition, maxConcurrent);

  return {
    canProcess: false,
    queuePosition,
    estimatedWaitTime,
  };
}

/**
 * 检查用户的并发限制
 *
 * @param userId 用户 ID
 * @param tier 用户订阅等级
 * @returns { canProcess: boolean, queuePosition?: number, estimatedWaitTime?: number }
 */
export async function checkUserConcurrencyLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<{ canProcess: boolean; queuePosition?: number; estimatedWaitTime?: number }> {
  const maxConcurrent = getMaxConcurrent(tier);
  const userActiveCount = getUserActiveTaskCount(userId);

  // 用户活跃任务数 + 全局等待队列中该用户的任务数
  const userWaitingCount = getUserWaitingCount(userId);

  if (userActiveCount + userWaitingCount < maxConcurrent) {
    return { canProcess: true };
  }

  // 计算队列位置（该用户在等待队列中的位置）
  let queuePosition = 0;
  for (const entry of waitingQueue) {
    if (entry.userId === userId) {
      queuePosition++;
    }
  }
  queuePosition += 1; // 当前任务

  // 根据并发槽位计算实际等待时间
  const estimatedWaitTime = calculateEstimatedWaitTime(queuePosition, maxConcurrent);

  return {
    canProcess: false,
    queuePosition,
    estimatedWaitTime,
  };
}

// ============================================================
// 队列管理
// ============================================================

/**
 * 获取用户在等待队列中的任务数
 *
 * @param userId 用户 ID
 * @returns 等待中的任务数
 */
function getUserWaitingCount(userId: string): number {
  return getUserWaitingCount(userId);
}

/**
 * 将任务添加到等待队列
 *
 * @param entry 队列条目
 */
export function addToQueue(entry: QueueEntry): void {
  waitingQueue.push(entry);
}

/**
 * 从等待队列移除任务
 *
 * @param taskId 任务 ID
 */
export function removeFromQueue(taskId: number): QueueEntry | undefined {
  const index = waitingQueue.findIndex((entry) => entry.id === taskId);
  if (index !== -1) {
    return waitingQueue.splice(index, 1)[0];
  }
  return undefined;
}

/**
 * 获取队列长度
 *
 * @returns 等待队列长度
 */
export function getQueueLength(): number {
  return waitingQueue.length;
}

/**
 * 获取下一个待处理任务
 *
 * @returns 下一个待处理任务（如果有）
 */
export function getNextInQueue(): QueueEntry | undefined {
  if (waitingQueue.length > 0) {
    return waitingQueue[0];
  }
  return undefined;
}

/**
 * 激活任务（从等待队列移到处理中）
 *
 * @param taskId 任务 ID
 * @returns 是否成功激活
 */
export function activateTask(taskId: number): boolean {
  const entry = removeFromQueue(taskId);
  if (entry) {
    processingTasks.add(taskId);
    return true;
  }
  return false;
}

/**
 * 完成任务
 *
 * @param taskId 任务 ID
 * @param userId 用户 ID
 */
export function completeTask(taskId: number, userId: string): void {
  processingTasks.delete(taskId);
  const count = activeTasks.get(userId) || 0;
  if (count > 0) {
    activeTasks.set(userId, count - 1);
  }
}

/**
 * 添加活跃任务
 *
 * @param userId 用户 ID
 */
export function addActiveTask(userId: string): void {
  const count = activeTasks.get(userId) || 0;
  activeTasks.set(userId, count + 1);
}

/**
 * 移除活跃任务
 *
 * @param userId 用户 ID
 */
export function removeActiveTask(userId: string): void {
  const count = activeTasks.get(userId) || 0;
  if (count > 0) {
    activeTasks.set(userId, count - 1);
  }
}

// ============================================================
// 队列状态查询
// ============================================================

/**
 * 获取队列状态
 *
 * @param userId 用户 ID（可选，用于计算用户位置）
 * @returns 队列状态
 */
export function getQueueStatus(userId?: string): QueueStatus {
  const queueLength = waitingQueue.length;
  const currentProcessing = processingTasks.size;

  // 计算用户在队列中的位置
  let userPosition = 0;
  if (userId) {
    userPosition = getUserWaitingCount(userId);
  }

  // 估算等待时间
  const estimatedWaitTime = calculateEstimatedWaitTime(userPosition, 10);

  return {
    queueLength,
    userPosition,
    estimatedWaitTime,
    currentProcessing,
    maxConcurrent: 10,
  };
}

/**
 * 获取用户当前处理中的任务数
 *
 * @param userId 用户 ID
 * @returns 处理中的任务数
 */
export function getUserProcessingCount(userId: string): number {
  let count = 0;
  for (const taskId of processingTasks) {
    const entry = waitingQueue.find((e) => e.id === taskId);
    if (entry && entry.userId === userId) {
      count++;
    }
  }
  return count + (activeTasks.get(userId) || 0);
}

// ============================================================
// 数据库队列同步
// ============================================================

/**
 * 从数据库加载待处理任务
 * 用于服务启动时恢复队列状态
 */
export async function loadQueueFromDatabase(): Promise<void> {
  try {
    const db = getDb();

    // 加载所有 pending 状态的任务
    const pendingTasks = await db
      .select()
      .from(batchAnalysisResults)
      .where(
        and(
          eq(batchAnalysisResults.status, 'pending'),
          eq(batchAnalysisResults.isQueued, true)
        )
      )
      .orderBy(desc(batchAnalysisResults.queuedAt));

    for (const task of pendingTasks) {
      waitingQueue.push({
        id: task.id,
        userId: task.userId,
        status: task.status,
        isQueued: task.isQueued,
        queuePosition: task.queuePosition,
        estimatedWaitTime: task.estimatedWaitTime,
        createdAt: task.createdAt,
        queuedAt: task.queuedAt,
      });
    }

    // 加载所有 processing 状态的任务
    const processingTasksDb = await db
      .select()
      .from(batchAnalysisResults)
      .where(eq(batchAnalysisResults.status, 'processing'));

    for (const task of processingTasksDb) {
      processingTasks.add(task.id);
      const count = activeTasks.get(task.userId) || 0;
      activeTasks.set(task.userId, count + 1);
    }

    console.log(`Loaded ${pendingTasks.length} pending tasks and ${processingTasksDb.length} processing tasks from database`);
  } catch (error) {
    console.error('Failed to load queue from database:', error);
  }
}

/**
 * 更新数据库中的队列位置
 *
 * @param taskId 任务 ID
 * @param queuePosition 队列位置
 * @param estimatedWaitTime 预计等待时间
 */
export async function updateQueuePosition(
  taskId: number,
  queuePosition: number,
  estimatedWaitTime: number
): Promise<void> {
  try {
    const db = getDb();
    await db
      .update(batchAnalysisResults)
      .set({
        queuePosition,
        estimatedWaitTime,
      })
      .where(eq(batchAnalysisResults.id, taskId));
  } catch (error) {
    console.error('Failed to update queue position:', error);
  }
}

/**
 * 更新任务状态为入队
 *
 * @param taskId 任务 ID
 */
export async function markAsQueued(taskId: number): Promise<void> {
  try {
    const db = getDb();
    await db
      .update(batchAnalysisResults)
      .set({
        isQueued: true,
        queuedAt: new Date(),
        status: 'pending',
      })
      .where(eq(batchAnalysisResults.id, taskId));
  } catch (error) {
    console.error('Failed to mark task as queued:', error);
  }
}

/**
 * 更新任务状态为处理中
 *
 * @param taskId 任务 ID
 */
export async function markAsProcessing(taskId: number): Promise<void> {
  try {
    const db = getDb();
    await db
      .update(batchAnalysisResults)
      .set({
        isQueued: false,
        status: 'processing',
        queuePosition: null,
        estimatedWaitTime: null,
      })
      .where(eq(batchAnalysisResults.id, taskId));
  } catch (error) {
    console.error('Failed to mark task as processing:', error);
  }
}

// ============================================================
// 队列处理循环
// ============================================================

/**
 * 处理队列中的任务
 * 应该在定时任务中调用
 */
export async function processQueue(): Promise<void> {
  const maxConcurrent = 10; // 全局最大并发
  const availableSlots = maxConcurrent - processingTasks.size;

  if (availableSlots <= 0 || waitingQueue.length === 0) {
    return;
  }

  // 获取待处理任务
  const tasksToProcess = waitingQueue.slice(0, availableSlots);

  for (const entry of tasksToProcess) {
    // 从等待队列移除
    removeFromQueue(entry.id);

    // 添加到处理中
    processingTasks.add(entry.id);
    addActiveTask(entry.userId);

    // 更新数据库状态
    await markAsProcessing(entry.id);

    // 触发任务处理（由调用方实现具体处理逻辑）
    console.log(`Activated task ${entry.id} for user ${entry.userId}`);
  }
}
