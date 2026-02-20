/**
 * 分类统计图表组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryStatsChartProps {
  data: Array<{
    parent: string | null;
    child: string | null;
    count: number;
    percentage: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function CategoryStatsChart({ data }: CategoryStatsChartProps) {
  // 准备图表数据
  const chartData = data.map((item, index) => ({
    name: item.child || item.parent || '未分类',
    value: item.count,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="ia-glass-card rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon size={20} className="text-orange-500" />
        <h3 className="text-lg font-semibold">分类统计</h3>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            <h4 className="font-medium mb-3">分类详情</h4>
            {chartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          暂无分类数据
        </div>
      )}
    </div>
  );
}
