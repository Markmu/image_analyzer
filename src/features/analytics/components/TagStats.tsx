/**
 * 标签统计组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { Tag } from 'lucide-react';

interface TagStatsProps {
  data: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
}

export function TagStats({ data }: TagStatsProps) {
  const hasData = data.length > 0;

  return (
    <div className="ia-glass-card rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Tag size={20} className="text-blue-500" />
        <h3 className="text-lg font-semibold">标签统计</h3>
      </div>

      {hasData ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.tag}
              className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-blue-500" />
                <span className="font-medium">{item.tag}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">{item.count}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
          暂无标签数据
        </div>
      )}
    </div>
  );
}
