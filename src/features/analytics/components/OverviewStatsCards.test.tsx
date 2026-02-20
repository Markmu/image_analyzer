/**
 * UI 组件测试
 * Story 7-3: 模版使用分析和统计
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewStatsCards } from '@/features/analytics/components/OverviewStatsCards';
import type { OverviewStats } from '@/features/analytics/types';

describe('OverviewStatsCards', () => {
  const mockStats: OverviewStats = {
    totalTemplates: 10,
    totalGenerations: 100,
    topTemplates: [
      {
        id: 1,
        title: 'Test Template',
        usageCount: 50,
        thumbnail: 'https://example.com/thumb.jpg',
      },
    ],
    recentActivity: {
      last7Days: 20,
      last30Days: 60,
      last90Days: 80,
    },
  };

  it('should render all stat cards', () => {
    render(<OverviewStatsCards stats={mockStats} />);

    expect(screen.getByText('总模版数')).toBeInTheDocument();
    expect(screen.getByText('总生成数')).toBeInTheDocument();
    expect(screen.getByText('最近 7 天')).toBeInTheDocument();
    expect(screen.getByText('最近 30 天')).toBeInTheDocument();
  });

  it('should display correct values', () => {
    render(<OverviewStatsCards stats={mockStats} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // totalTemplates
    expect(screen.getByText('100')).toBeInTheDocument(); // totalGenerations
    expect(screen.getByText('20')).toBeInTheDocument(); // last7Days
    expect(screen.getByText('60')).toBeInTheDocument(); // last30Days
  });

  it('should render zero values correctly', () => {
    const zeroStats: OverviewStats = {
      totalTemplates: 0,
      totalGenerations: 0,
      topTemplates: [],
      recentActivity: {
        last7Days: 0,
        last30Days: 0,
        last90Days: 0,
      },
    };

    render(<OverviewStatsCards stats={zeroStats} />);

    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});
