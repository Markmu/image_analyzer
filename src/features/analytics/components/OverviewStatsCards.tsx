/**
 * 总览统计卡片组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import type { OverviewStats } from '../types';

interface OverviewStatsCardsProps {
  stats: OverviewStats;
}

export function OverviewStatsCards({ stats }: OverviewStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 总模版数 */}
      <div className="ia-glass-card rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">总模版数</p>
            <p className="text-3xl font-bold mt-2">{stats.totalTemplates}</p>
          </div>
          <BarChart3 size={32} className="text-blue-500 opacity-80" />
        </div>
      </div>

      {/* 总生成数 */}
      <div className="ia-glass-card rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">总生成数</p>
            <p className="text-3xl font-bold mt-2">{stats.totalGenerations}</p>
          </div>
          <TrendingUp size={32} className="text-green-500 opacity-80" />
        </div>
      </div>

      {/* 最近 7 天 */}
      <div className="ia-glass-card rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">最近 7 天</p>
            <p className="text-3xl font-bold mt-2">{stats.recentActivity.last7Days}</p>
          </div>
          <Calendar size={32} className="text-purple-500 opacity-80" />
        </div>
      </div>

      {/* 最近 30 天 */}
      <div className="ia-glass-card rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">最近 30 天</p>
            <p className="text-3xl font-bold mt-2">{stats.recentActivity.last30Days}</p>
          </div>
          <Calendar size={32} className="text-orange-500 opacity-80" />
        </div>
      </div>
    </div>
  );
}
