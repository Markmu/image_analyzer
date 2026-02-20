/**
 * 性能指标组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import type { PerformanceMetrics } from '../types';

interface PerformanceMetricsDisplayProps {
  metrics: PerformanceMetrics;
}

export function PerformanceMetricsDisplay({ metrics }: PerformanceMetricsDisplayProps) {
  return (
    <div className="ia-glass-card rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-red-500" />
        <h3 className="text-lg font-semibold">性能分析</h3>
      </div>

      {/* 总体指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">平均成功率</p>
          <p className="text-2xl font-bold text-blue-500 mt-2">{metrics.averageSuccessRate}%</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">总生成数</p>
          <p className="text-2xl font-bold text-green-500 mt-2">{metrics.totalGenerations}</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">成功生成数</p>
          <p className="text-2xl font-bold text-purple-500 mt-2">{metrics.successfulGenerations}</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-green-500" />
          <h4 className="font-medium">表现最佳</h4>
        </div>
        <div className="space-y-2">
          {metrics.topPerformers.map((performer) => (
            <div
              key={performer.templateId}
              className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{performer.title || '未命名模版'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {performer.totalGenerations} 次生成
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-500">{performer.successRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">成功率</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Performers */}
      {metrics.lowPerformers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-red-500" />
            <h4 className="font-medium">需要改进</h4>
          </div>
          <div className="space-y-2">
            {metrics.lowPerformers.map((performer) => (
              <div
                key={performer.templateId}
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{performer.title || '未命名模版'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {performer.totalGenerations} 次生成
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">{performer.successRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">成功率</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
