/**
 * 模版使用统计列表组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import type { TemplateUsageStats } from '../types';

interface TemplateUsageListProps {
  templates: TemplateUsageStats[];
}

export function TemplateUsageList({ templates }: TemplateUsageListProps) {
  if (templates.length === 0) {
    return (
      <div className="ia-glass-card rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart3 size={48} className="mb-4 opacity-50" />
          <p>还没有使用任何模版</p>
          <p className="text-sm mt-2">快去创建并使用模版吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ia-glass-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">模版使用统计</h3>
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.templateId}
            className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              {template.thumbnail && (
                <img
                  src={template.thumbnail}
                  alt={template.title || 'Template'}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{template.title || '未命名模版'}</h4>
                {template.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                    {template.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <BarChart3 size={14} />
                    <span>使用 {template.usageCount} 次</span>
                  </div>
                  {template.lastUsedAt && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatRelativeTime(template.lastUsedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{template.generationCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">生成数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{template.successRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">成功率</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
}
