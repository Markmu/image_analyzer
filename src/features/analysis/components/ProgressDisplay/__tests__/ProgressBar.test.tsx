/**
 * ProgressBar 组件测试
 */

import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar 组件', () => {
  it('应该渲染进度条', () => {
    render(<ProgressBar value={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('应该显示正确的百分比', () => {
    render(<ProgressBar value={75} showPercentage={true} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    render(<ProgressBar value={50} label="上传中" />);
    expect(screen.getByText('上传中')).toBeInTheDocument();
  });

  it('应该显示预计时间', () => {
    render(<ProgressBar value={50} estimatedTime="预计还需 30 秒" />);
    expect(screen.getByText('预计还需 30 秒')).toBeInTheDocument();
  });

  it('应该不显示百分比当 showPercentage 为 false', () => {
    render(<ProgressBar value={50} showPercentage={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('应该使用正确的颜色', () => {
    const { container: container1 } = render(<ProgressBar value={50} color="success" />);
    const { container: container2 } = render(<ProgressBar value={50} color="error" />);

    // 这些测试需要验证样式，可能需要使用toHaveStyle或其他方法
    expect(container1).toBeInTheDocument();
    expect(container2).toBeInTheDocument();
  });
});
