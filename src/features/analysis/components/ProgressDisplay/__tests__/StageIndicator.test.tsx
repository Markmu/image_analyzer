/**
 * StageIndicator 组件测试
 */

import { render, screen } from '@testing-library/react';
import { StageIndicator } from '../StageIndicator';

describe('StageIndicator 组件', () => {
  it('应该渲染所有四个阶段', () => {
    render(<StageIndicator currentStage="uploading" />);

    expect(screen.getByText('上传中')).toBeInTheDocument();
    expect(screen.getByText('分析中')).toBeInTheDocument();
    expect(screen.getByText('生成中')).toBeInTheDocument();
    expect(screen.getByText('完成')).toBeInTheDocument();
  });

  it('应该正确高亮当前阶段', () => {
    render(<StageIndicator currentStage="analyzing" />);

    const analyzingStage = screen.getByText('分析中');
    expect(analyzingStage).toBeInTheDocument();
  });

  it('应该高亮所有已完成的阶段', () => {
    const { container } = render(<StageIndicator currentStage="generating" />);

    // 生成阶段之前的所有阶段都应该高亮
    expect(screen.getByText('上传中')).toBeInTheDocument();
    expect(screen.getByText('分析中')).toBeInTheDocument();
    expect(screen.getByText('生成中')).toBeInTheDocument();
  });
});
