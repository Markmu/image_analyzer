/**
 * 时间范围过滤器组件
 * Story 7-3: 模版使用分析和统计
 */

import React from 'react';
import { Calendar } from 'lucide-react';

export type TimeRangeOption = '7d' | '30d' | '90d' | 'all';

interface TimeRangeFilterProps {
  value: TimeRangeOption;
  onChange: (value: TimeRangeOption) => void;
}

const TIME_RANGE_OPTIONS: Array<{ value: TimeRangeOption; label: string }> = [
  { value: '7d', label: '最近 7 天' },
  { value: '30d', label: '最近 30 天' },
  { value: '90d', label: '最近 90 天' },
  { value: 'all', label: '全部时间' },
];

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <div className="ia-glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} className="text-purple-500" />
        <span className="text-sm font-medium">时间范围</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TIME_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              value === option.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
