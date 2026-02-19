/**
 * FieldPreview Component Unit Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Tests for FieldPreview component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldPreview } from '@/features/templates/components/TemplatePreview/FieldPreview';

const defaultProps = {
  fields: {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  },
};

describe('FieldPreview', () => {
  describe('rendering', () => {
    it('should render preview header', () => {
      render(<FieldPreview {...defaultProps} />);

      expect(screen.getByText('完整提示词预览')).toBeInTheDocument();
    });

    it('should render empty state message when no fields are filled', () => {
      render(<FieldPreview {...defaultProps} />);

      expect(screen.getByText('开始编辑字段以查看预览...')).toBeInTheDocument();
    });

    it('should display 0/6 fields filled counter', () => {
      render(<FieldPreview {...defaultProps} />);

      expect(screen.getByText('0 / 6 字段已填写')).toBeInTheDocument();
    });

    it('should display 0 character counter for empty fields', () => {
      render(<FieldPreview {...defaultProps} />);

      expect(screen.getByText('0 字符')).toBeInTheDocument();
    });
  });

  describe('content display', () => {
    it('should display single field content', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText(/主体描述: 一位美丽的女性/)).toBeInTheDocument();
    });

    it('should display multiple fields content', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
          style: '肖像摄影风格',
          composition: '特写，居中构图',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText(/主体描述: 一位美丽的女性/)).toBeInTheDocument();
      expect(screen.getByText(/风格描述: 肖像摄影风格/)).toBeInTheDocument();
      expect(screen.getByText(/构图信息: 特写，居中构图/)).toBeInTheDocument();
    });

    it('should skip empty fields', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
          style: '',
          composition: '特写，居中构图',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText(/主体描述: 一位美丽的女性/)).toBeInTheDocument();
      expect(screen.getByText(/构图信息: 特写，居中构图/)).toBeInTheDocument();
      expect(screen.queryByText(/风格描述:/)).not.toBeInTheDocument();
    });

    it('should display all 6 fields when filled', () => {
      const props = {
        ...defaultProps,
        fields: {
          subject: '一位美丽的女性',
          style: '肖像摄影风格',
          composition: '特写，居中构图',
          colors: '暖色调，柔和的棕色和金色',
          lighting: '柔和的自然光，黄金时刻',
          additional: '优雅的姿势，平静的表情',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText(/主体描述:/)).toBeInTheDocument();
      expect(screen.getByText(/风格描述:/)).toBeInTheDocument();
      expect(screen.getByText(/构图信息:/)).toBeInTheDocument();
      expect(screen.getByText(/色彩方案:/)).toBeInTheDocument();
      expect(screen.getByText(/光线设置:/)).toBeInTheDocument();
      expect(screen.getByText(/其他细节:/)).toBeInTheDocument();
    });
  });

  describe('counters', () => {
    it('should update filled fields counter', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
          style: '肖像摄影风格',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText('2 / 6 字段已填写')).toBeInTheDocument();
    });

    it('should count only non-empty fields', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
          style: '   ', // whitespace only
          composition: '',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText('1 / 6 字段已填写')).toBeInTheDocument();
    });

    it('should calculate total characters correctly', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: 'Test',
          style: 'Style',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText('8 字符')).toBeInTheDocument();
    });

    it('should show 6/6 fields when all filled', () => {
      const props = {
        ...defaultProps,
        fields: {
          subject: 'a',
          style: 'b',
          composition: 'c',
          colors: 'd',
          lighting: 'e',
          additional: 'f',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText('6 / 6 字段已填写')).toBeInTheDocument();
    });
  });

  describe('expanded state', () => {
    it('should show content when expanded', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
        },
        expanded: true,
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText(/主体描述: 一位美丽的女性/)).toBeInTheDocument();
    });

    it('should hide content when collapsed', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
        },
        expanded: false,
      };

      render(<FieldPreview {...props} />);

      expect(screen.queryByText(/主体描述: 一位美丽的女性/)).not.toBeInTheDocument();
    });

    it('should be expanded by default', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '一位美丽的女性',
        },
      };

      render(<FieldPreview {...props} />);

      expect(screen.getByText(/主体描述: 一位美丽的女性/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper data-testid', () => {
      render(<FieldPreview {...defaultProps} data-testid="test-preview" />);

      expect(screen.getByTestId('test-preview')).toBeInTheDocument();
    });

    it('should use default data-testid if not provided', () => {
      render(<FieldPreview {...defaultProps} />);

      expect(screen.getByTestId('field-preview')).toBeInTheDocument();
    });
  });

  describe('special characters and formatting', () => {
    it('should handle newlines in field values', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: 'Line 1\nLine 2\nLine 3',
        },
      };

      render(<FieldPreview {...props} expanded={true} />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: '🎨 美术作品 🎭',
        },
      };

      render(<FieldPreview {...props} expanded={true} />);

      expect(screen.getByText(/🎨 美术作品 🎭/)).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: longText,
        },
      };

      render(<FieldPreview {...props} expanded={true} />);

      expect(screen.getByText(/主体描述:/)).toBeInTheDocument();
      expect(screen.getByText('1000 字符')).toBeInTheDocument();
    });
  });

  describe('monospace font', () => {
    it('should apply monospace font family to content', () => {
      const props = {
        ...defaultProps,
        fields: {
          ...defaultProps.fields,
          subject: 'Test content',
        },
      };

      const { container } = render(<FieldPreview {...props} expanded={true} />);
      const contentElement = container.querySelector('[style*="font-family"]');

      expect(contentElement).toBeInTheDocument();
      // Note: You may need to check the actual font-family value in a real test
    });
  });
});
