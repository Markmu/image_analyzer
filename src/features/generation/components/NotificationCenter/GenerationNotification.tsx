/**
 * GenerationNotification Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Display a single generation notification
 */

import React from 'react';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import type { GenerationNotification } from '../../types/progress';

interface GenerationNotificationItemProps {
  /** Notification data */
  notification: GenerationNotification;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Click callback */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const GenerationNotificationItem: React.FC<GenerationNotificationItemProps> = ({
  notification,
  onDismiss,
  onClick,
  className,
}) => {
  // Get icon and color based on type
  const iconConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    timeout: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  }[notification.type];

  const Icon = iconConfig.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg p-3',
        'transition-colors duration-200',
        iconConfig.bgColor,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <Icon className={cn('mt-0.5 flex-shrink-0', iconConfig.color)} size={20} />

      {/* Content */}
      <div className="flex-1 space-y-1">
        <p className={cn('text-sm font-medium', 'text-gray-900 dark:text-gray-100')}>
          {notification.title}
        </p>
        <p className={cn('text-xs', 'text-gray-700 dark:text-gray-300')}>
          {notification.message}
        </p>
        <p className={cn('text-xs', 'text-gray-500 dark:text-gray-400')}>
          {notification.timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className={cn(
            'flex-shrink-0 rounded-full p-1',
            'hover:bg-black/5 dark:hover:bg-white/10',
            'transition-colors'
          )}
          aria-label="关闭通知"
        >
          <X size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};
