/**
 * 队列状态组件
 *
 * Story 3-3: 分析进度与队列管理
 * AC-2: 等待队列透明化
 */

import React, { useEffect, useState } from 'react';

export interface QueueStatusData {
  queueLength: number;
  userPosition: number;
  estimatedWaitTime: number;
  currentProcessing: number;
  maxConcurrent: number;
}

/**
 * 队列状态指示器组件
 *
 * 显示当前队列状态信息
 */
export function QueueIndicator({
  status,
  onRetry,
}: {
  status: QueueStatusData;
  onRetry?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(status.estimatedWaitTime);

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} 秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} 分钟`;
    }
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 队列状态
  const isQueued = status.userPosition > 0;

  return (
    <div className="queue-indicator">
      {/* 当前处理状态 */}
      <div className="queue-status">
        <div className="status-icon">
          {isQueued ? (
            <svg
              className="waiting-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          ) : (
            <svg
              className="processing-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12,6v6l4,2" />
            </svg>
          )}
        </div>
        <div className="status-info">
          <div className="status-title">
            {isQueued ? '等待中' : '处理中'}
          </div>
          <div className="status-detail">
            {isQueued
              ? `您当前排在第 ${status.userPosition} 位`
              : `正在处理，请稍候`}
          </div>
        </div>
      </div>

      {/* 队列信息 */}
      <div className="queue-info">
        <div className="info-item">
          <span className="label">等待队列</span>
          <span className="value">{status.queueLength} 个任务</span>
        </div>
        <div className="info-item">
          <span className="label">正在处理</span>
          <span className="value">
            {status.currentProcessing} / {status.maxConcurrent}
          </span>
        </div>
        {isQueued && (
          <div className="info-item">
            <span className="label">预计等待</span>
            <span className="value">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* 重试按钮 */}
      {onRetry && isQueued && (
        <button className="retry-button" onClick={onRetry}>
          重新检查
        </button>
      )}
    </div>
  );
}

/**
 * 队列长度显示组件
 */
export function QueueLength({
  queueLength,
}: {
  queueLength: number;
}) {
  if (queueLength === 0) {
    return (
      <span className="queue-length idle">
        队列空闲
      </span>
    );
  }

  return (
    <span className="queue-length waiting">
      当前有 {queueLength} 个任务正在等待
    </span>
  );
}

/**
 * 预计等待时间显示组件
 */
export function EstimatedWaitTime({
  seconds,
}: {
  seconds: number;
}) {
  const formatTime = (s: number): string => {
    if (s < 60) {
      return `${s} 秒`;
    }
    const minutes = Math.floor(s / 60);
    const remainingSeconds = s % 60;
    if (remainingSeconds === 0) {
      return `${minutes} 分钟`;
    }
    return `${minutes}分${remainingSeconds}秒`;
  };

  return <span className="estimated-time">{formatTime(seconds)}</span>;
}

/**
 * 队列位置显示组件
 */
export function QueuePosition({
  position,
}: {
  position: number;
}) {
  if (position === 0) {
    return <span className="queue-position">正在处理</span>;
  }

  return (
    <span className="queue-position">
      第 <strong>{position}</strong> 位
    </span>
  );
}

export default QueueIndicator;
