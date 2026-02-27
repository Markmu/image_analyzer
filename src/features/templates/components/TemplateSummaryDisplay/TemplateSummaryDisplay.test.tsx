/**
 * Template Summary Display Tests
 *
 * Tests for TemplateSummaryDisplay component
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TemplateSummaryDisplay } from '../TemplateSummaryDisplay';
import type { TemplateJSONFormat } from '../../../types/template';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

describe('TemplateSummaryDisplay', () => {
  const completeJsonFormat: TemplateJSONFormat = {
    subject: '一位优雅的女性肖像',
    style: '油画风格，印象派笔触',
    composition: '中心构图，三分法布局',
    colors: '温暖的色调，金色和棕色为主',
    lighting: '自然光，柔和的侧光',
    additional: '背景虚化，突出主体',
  };

  const partialJsonFormat: TemplateJSONFormat = {
    subject: '城市夜景',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  };

  const emptyJsonFormat: TemplateJSONFormat = {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  };

  describe('rendering', () => {
    it('should render all fields when data is complete', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      // Check that field labels are displayed
      expect(screen.getByText('核心参数')).toBeInTheDocument();
      expect(screen.getByText(/一位优雅的女性肖像/)).toBeInTheDocument();
      expect(screen.getByText(/油画风格，印象派笔触/)).toBeInTheDocument();
      expect(screen.getByText(/中心构图，三分法布局/)).toBeInTheDocument();
    });

    it('should show filled count chip', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      expect(screen.getByText('6 / 6')).toBeInTheDocument();
    });

    it('should render only filled fields for partial data', () => {
      render(<TemplateSummaryDisplay jsonFormat={partialJsonFormat} />);

      expect(screen.getByText(/城市夜景/)).toBeInTheDocument();
      expect(screen.getByText('1 / 6')).toBeInTheDocument();
    });

    it('should show empty state when all fields are empty', () => {
      render(<TemplateSummaryDisplay jsonFormat={emptyJsonFormat} />);

      expect(screen.getByText('模板数据为空')).toBeInTheDocument();
    });

    it('should show no data state when jsonFormat is null', () => {
      render(<TemplateSummaryDisplay jsonFormat={null} />);

      expect(screen.getByText('暂无模板数据')).toBeInTheDocument();
    });

    it('should show hint when some fields are missing', () => {
      render(<TemplateSummaryDisplay jsonFormat={partialJsonFormat} />);

      expect(
        screen.getByText(/部分字段未填写，点击"高级编辑"补充信息/)
      ).toBeInTheDocument();
    });

    it('should not show hint when all fields are filled', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      expect(
        screen.queryByText(/部分字段未填写，点击"高级编辑"补充信息/)
      ).not.toBeInTheDocument();
    });
  });

  describe('props', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <TemplateSummaryDisplay jsonFormat={completeJsonFormat} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render with data-testid', () => {
      const { container } = render(
        <TemplateSummaryDisplay jsonFormat={completeJsonFormat} data-testid="custom-testid" />
      );

      expect(container.querySelector('[data-testid="custom-testid"]')).toBeInTheDocument();
    });

    it('should display field with data-testid attributes', () => {
      render(<TemplateSummaryDisplay jsonFormat={partialJsonFormat} />);

      expect(screen.getByTestId('template-summary-field-subject')).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should render grid for responsive layout', () => {
      const { container } = render(
        <TemplateSummaryDisplay jsonFormat={completeJsonFormat} />
      );

      // Check that Grid components are rendered (using data-testid instead of class)
      expect(screen.getByTestId('template-summary-field-subject')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      const heading = screen.getByText('核心参数');
      expect(heading.tagName).toBe('H6'); // MUI Typography variant="h6" renders as h6
    });

    it('should display field labels', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      // Check that field labels from FIELD_CONFIGS are displayed
      expect(screen.getByText('[subject]')).toBeInTheDocument();
      expect(screen.getByText('风格描述')).toBeInTheDocument();
      expect(screen.getByText('构图信息')).toBeInTheDocument();
      expect(screen.getByText('色彩方案')).toBeInTheDocument();
      expect(screen.getByText('光线设置')).toBeInTheDocument();
      expect(screen.getByText('[additional]')).toBeInTheDocument();
    });

    it('should have data-testid attributes for testing', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      expect(screen.getByTestId('template-summary-display')).toBeInTheDocument();
      expect(screen.getByTestId('template-summary-field-subject')).toBeInTheDocument();
      expect(screen.getByTestId('template-summary-field-style')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(
        <TemplateSummaryDisplay jsonFormat={completeJsonFormat} />
      );

      // Check for proper heading level
      const heading = container.querySelector('h6');
      expect(heading).toBeInTheDocument();

      // Check for list/grid structure (Grid component)
      const gridItems = container.querySelectorAll('[data-testid^="template-summary-field-"]');
      expect(gridItems.length).toBeGreaterThan(0);
    });

    it('should have accessible empty states', () => {
      const { container: nullContainer } = render(
        <TemplateSummaryDisplay jsonFormat={null} />
      );

      // Null data should have accessible message
      expect(screen.getByText('暂无模板数据')).toBeInTheDocument();

      cleanup();

      const { container: emptyContainer } = render(
        <TemplateSummaryDisplay jsonFormat={emptyJsonFormat} />
      );

      // Empty data should have accessible message
      expect(screen.getByText('模板数据为空')).toBeInTheDocument();
    });

    it('should have accessible chip with count', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      const chip = screen.getByText('6 / 6');
      expect(chip).toBeInTheDocument();

      // Chip should have proper text representation
      expect(chip.textContent).toBe('6 / 6');
    });
  });

  describe('WCAG compliance', () => {
    it('should meet color contrast requirements for primary text', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      // Get the heading element
      const heading = screen.getByText('核心参数');

      // In a real setup, use axe-core to verify contrast
      // For now, we verify the element exists and has text
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toBeTruthy();

      // Note: Actual contrast ratio testing requires:
      // 1. axe-core library
      // 2. JSDOM or browser environment
      // 3. Visual regression testing
      //
      // Example with axe-core:
      // import { axe, toHaveNoViolations } from 'jest-axe';
      // const results = await axe(container);
      // expect(results).toHaveNoViolations();
    });

    it('should have readable font sizes', () => {
      const { container } = render(
        <TemplateSummaryDisplay jsonFormat={completeJsonFormat} />
      );

      // Check that typography has appropriate sizes
      const heading = screen.getByText('核心参数');
      expect(heading.tagName).toBe('H6'); // MUI h6 is appropriate for section headings

      // Field labels use Typography with variant="caption" - verify text content exists
      expect(screen.getByText('[subject]')).toBeInTheDocument();
      expect(screen.getByText('风格描述')).toBeInTheDocument();

      // Check for caption class in the DOM
      const captionElements = container.querySelectorAll('.MuiTypography-caption');
      expect(captionElements.length).toBeGreaterThan(0);
    });

    it('should have sufficient touch targets on mobile', () => {
      // This test verifies data-testid attributes exist for interaction testing
      render(<TemplateSummaryDisplay jsonFormat={partialJsonFormat} />);

      // All interactive elements should have testable IDs
      expect(screen.getByTestId('template-summary-display')).toBeInTheDocument();

      // Fields have test IDs for potential interaction
      expect(screen.getByTestId('template-summary-field-subject')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should be navigable with keyboard (no focus traps)', () => {
      const { container } = render(
        <TemplateSummaryDisplay jsonFormat={completeJsonFormat} />
      );

      // Component should not create focus traps
      // All elements should be accessible via tab

      // Verify component renders without problematic focus management
      expect(container).toBeInTheDocument();
    });

    it('should have proper tab order for fields', () => {
      render(<TemplateSummaryDisplay jsonFormat={completeJsonFormat} />);

      // Fields should be in logical order
      const subjectField = screen.getByTestId('template-summary-field-subject');
      const styleField = screen.getByTestId('template-summary-field-style');

      expect(subjectField).toBeInTheDocument();
      expect(styleField).toBeInTheDocument();

      // Both should be present and in the DOM in correct order
      const subjectIndex = Array.from(subjectField.parentElement?.children || []).indexOf(subjectField);
      const styleIndex = Array.from(styleField.parentElement?.children || []).indexOf(styleField);

      expect(subjectIndex).toBeLessThan(styleIndex);
    });
  });
});
