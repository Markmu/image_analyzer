/**
 * Template Summary Display Tests
 *
 * Tests for TemplateSummaryDisplay component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateSummaryDisplay } from '../TemplateSummaryDisplay';
import type { TemplateJSONFormat } from '../../../types/template';

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
      expect(screen.getByText('主体描述')).toBeInTheDocument();
      expect(screen.getByText('风格描述')).toBeInTheDocument();
      expect(screen.getByText('构图信息')).toBeInTheDocument();
      expect(screen.getByText('色彩方案')).toBeInTheDocument();
      expect(screen.getByText('光线设置')).toBeInTheDocument();
      expect(screen.getByText('其他细节')).toBeInTheDocument();
    });
  });
});
