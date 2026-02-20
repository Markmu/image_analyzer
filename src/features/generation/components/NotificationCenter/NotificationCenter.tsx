/**
 * NotificationCenter Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Display all generation notifications
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { Button, Box, Typography, IconButton, Paper } from '@mui/material';
import { cn } from '@/lib/utils';
import { GenerationNotificationItem } from './GenerationNotification';
import type { GenerationNotification } from '../../types/progress';

interface NotificationCenterProps {
  /** Notifications to display */
  notifications: GenerationNotification[];
  /** Dismiss notification callback */
  onDismiss?: (id: string) => void;
  /** Dismiss all callback */
  onDismissAll?: () => void;
  /** Notification click callback */
  onNotificationClick?: (notification: GenerationNotification) => void;
  /** Additional CSS classes */
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  onDismissAll,
  onNotificationClick,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Animate icon when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);

  const unreadCount = notifications.length;

  return (
    <div className={cn('relative', className)}>
      {/* Notification bell button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="通知中心"
      >
        <Bell
          className={cn(
            'transition-transform',
            animate && 'scale-110'
          )}
          size={20}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -right-1 -top-1',
              'flex h-5 w-5 items-center justify-center',
              'rounded-full bg-red-500 text-white',
              'text-xs font-bold',
              unreadCount > 9 && 'w-6'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              'absolute right-0 top-12 z-50',
              'w-80 max-w-sm',
              'ia-glass-card rounded-lg shadow-xl',
              'animate-in slide-in-from-right-4 fade-in-20'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                通知
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    ({unreadCount})
                  </span>
                )}
              </h3>

              <div className="flex items-center gap-1">
                {/* Clear all button */}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissAll?.();
                    }}
                    className="h-7 text-xs"
                  >
                    全部已读
                  </Button>
                )}

                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'rounded-full p-1',
                    'hover:bg-gray-200 dark:hover:bg-gray-700',
                    'transition-colors'
                  )}
                  aria-label="关闭"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="mb-3 text-gray-400" size={48} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    暂无通知
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div key={notification.generationId} className="p-2">
                      <GenerationNotificationItem
                        notification={notification}
                        onDismiss={() => onDismiss?.(notification.generationId)}
                        onClick={() => {
                          onNotificationClick?.(notification);
                          setIsOpen(false);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
