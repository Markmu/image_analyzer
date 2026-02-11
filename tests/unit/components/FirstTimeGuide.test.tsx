/**
 * Unit Tests - FirstTimeGuide Component
 *
 * Testing first-time guide component functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FirstTimeGuide } from '@/features/analysis/components/FirstTimeGuide';

describe('FirstTimeGuide Component', () => {
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Reset localStorage before each test
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });

  describe('Initial Rendering', () => {
    it('should render when not previously dismissed', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByTestId('first-time-guide')).toBeInTheDocument();
      expect(screen.getByText('最佳实践提示')).toBeInTheDocument();
    });

    it('should not render when previously dismissed', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue('true');

      render(<FirstTimeGuide />);

      expect(screen.queryByTestId('first-time-guide')).not.toBeInTheDocument();
    });

    it('should display guide title', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByText('最佳实践提示')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display recommended scenarios', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByText(/推荐场景/)).toBeInTheDocument();
      expect(screen.getByText('单个主体(人物、物体或产品)')).toBeInTheDocument();
      expect(screen.getByText('静态场景(非动作照片)')).toBeInTheDocument();
      expect(screen.getByText('清晰的风格特征(明显的光影、色彩、构图)')).toBeInTheDocument();
    });

    it('should display scenarios to avoid', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByText(/避免使用/)).toBeInTheDocument();
      expect(screen.getByText('多个主体(>5个)')).toBeInTheDocument();
      expect(screen.getByText('动态场景(运动照片)')).toBeInTheDocument();
      expect(screen.getByText('模糊或低分辨率图片')).toBeInTheDocument();
    });

    it('should display good example card', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByTestId('good-example')).toBeInTheDocument();
      expect(screen.getByText('好的示例')).toBeInTheDocument();
      expect(screen.getByText('单主体、风格明显')).toBeInTheDocument();
    });

    it('should display bad example card', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByTestId('bad-example')).toBeInTheDocument();
      expect(screen.getByText('不好的示例')).toBeInTheDocument();
      expect(screen.getByText('多主体、动态场景')).toBeInTheDocument();
    });

    it('should display dismiss button', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      expect(screen.getByTestId('dismiss-guide-btn')).toBeInTheDocument();
      expect(screen.getByText('知道了')).toBeInTheDocument();
    });
  });

  describe('Dismissal Behavior', () => {
    it('should call onDismiss callback when button clicked', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);
      const onDismiss = vi.fn();

      render(<FirstTimeGuide onDismiss={onDismiss} />);

      const button = screen.getByTestId('dismiss-guide-btn');
      fireEvent.click(button);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should save dismissal state to localStorage', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      const button = screen.getByTestId('dismiss-guide-btn');
      fireEvent.click(button);

      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'image-upload-guide-dismissed',
        'true'
      );
    });

    it('should not render after dismissal', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);
      const { rerender } = render(<FirstTimeGuide />);

      // Dismiss the guide
      const button = screen.getByTestId('dismiss-guide-btn');
      fireEvent.click(button);

      // Rerender to check if state is updated
      rerender(<FirstTimeGuide />);

      expect(screen.queryByTestId('first-time-guide')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing localStorage gracefully', () => {
      // Remove localStorage
      delete (global as any).localStorage;

      const { container } = render(<FirstTimeGuide />);

      // Should still render without crashing
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle different localStorage values', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue('false');

      render(<FirstTimeGuide />);

      expect(screen.getByTestId('first-time-guide')).toBeInTheDocument();
    });

    it('should handle onDismiss being undefined', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      expect(() => render(<FirstTimeGuide />)).not.toThrow();
    });
  });

  describe('Styling', () => {
    it('should have correct styling for success theme', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      const guideElement = screen.getByTestId('first-time-guide');
      expect(guideElement).toHaveStyle({
        backgroundColor: expect.stringContaining('34'), // Green component
        border: expect.stringContaining('34'),
      });
    });

    it('should have correct styling for good example card', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      const goodExample = screen.getByTestId('good-example');
      expect(goodExample).toHaveStyle({
        backgroundColor: expect.stringContaining('34'), // Green
        border: expect.stringContaining('34'),
      });
    });

    it('should have correct styling for bad example card', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      render(<FirstTimeGuide />);

      const badExample = screen.getByTestId('bad-example');
      expect(badExample).toHaveStyle({
        backgroundColor: expect.stringContaining('239'), // Red
        border: expect.stringContaining('239'),
      });
    });
  });
});
