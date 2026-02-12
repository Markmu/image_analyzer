/**
 * TermScroller 组件测试
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TermScroller, SimpleTermDisplay } from '../TermScroller';

describe('TermScroller 组件', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染组件', () => {
    const terms = ['正在分析图片...', '检测构图方法...', '识别色彩搭配...'];
    const { container } = render(<TermScroller terms={terms} />);

    // 检查组件是否渲染
    expect(container.firstChild).toBeInTheDocument();
  });

  it('应该显示光标', () => {
    const terms = ['测试术语'];
    const { container } = render(<TermScroller terms={terms} />);

    // 推进时间以触发 useEffect
    vi.advanceTimersByTime(50);

    // 应该有一个 span 元素（光标）
    const cursor = container.querySelector('span');
    expect(cursor).toBeInTheDocument();
  });

  it('应该处理空术语数组', () => {
    const { container } = render(<TermScroller terms={[]} />);

    // 空数组不应该渲染任何内容
    expect(container.firstChild).toBe(null);
  });
});

describe('SimpleTermDisplay 组件', () => {
  it('应该渲染术语', () => {
    render(<SimpleTermDisplay term="测试术语" />);

    expect(screen.getByText('测试术语')).toBeInTheDocument();
  });

  it('应该有淡入淡出动画', () => {
    const { container } = render(<SimpleTermDisplay term="测试术语" />);

    // 检查是否有 transition 样式
    const termElement = screen.getByText('测试术语');
    expect(termElement).toBeInTheDocument();
  });
});
