/**
 * 使用趋势图表组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { UsageTrends } from '../types';

interface UsageTrendsChartProps {
  trends: UsageTrends;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export function UsageTrendsChart({ trends, granularity = 'daily' }: UsageTrendsChartProps) {
  // 根据粒度选择数据
  const data =
    granularity === 'daily'
      ? trends.daily.map((d) => ({ date: d.date, count: d.count }))
      : granularity === 'weekly'
        ? trends.weekly.map((w) => ({ date: w.week, count: w.count }))
        : trends.monthly.map((m) => ({ date: m.month, count: m.count }));

  const hasData = data.length > 0;

  return (
    <div className="ia-glass-card rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={20} className="text-green-500" />
        <h3 className="text-lg font-semibold">使用趋势</h3>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-sm text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis className="text-sm text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              name="使用次数"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          暂无数据
        </div>
      )}
    </div>
  );
}
