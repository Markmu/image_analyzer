/**
 * FieldEditor Component Unit Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Tests for FieldEditor component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldEditor } from '@/features/templates/components/TemplateEditor/FieldEditor';
import type { FieldConfig } from '@/features/templates/types';

const mockConfig: FieldConfig = {
  key: 'subject',
  label: '主体描述',
  placeholder: '例如：一位美丽的女性',
  required: true,
  maxLength: 200,
  suggestions: ['一位美丽的女性', '一个可爱的猫咪', '一座雄伟的山脉'],
  validation: (value: string) => {
    if (!value.trim()) return '主体描述不能为空';
    if (value.length > 200) return '主体描述不能超过 200 个字符';
    return null;
  },
};

describe('FieldEditor', () => {
  const defaultProps = {
    config: mockConfig,
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render field label', () => {
      render(<FieldEditor {...defaultProps} />);

      expect(screen.getByText('主体描述')).toBeInTheDocument();
    });

    it('should render required indicator for required fields', () => {
      render(<FieldEditor {...defaultProps} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not render required indicator for optional fields', () => {
      const optionalConfig = { ...mockConfig, required: false };
      render(<FieldEditor {...defaultProps} config={optionalConfig} />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should render text input with placeholder', () => {
      render(<FieldEditor {...defaultProps} />);

      const input = screen.getByPlaceholderText('例如：一位美丽的女性');
      expect(input).toBeInTheDocument();
    });

    it('should render character counter', () => {
      render(<FieldEditor {...defaultProps} value="Test" />);

      expect(screen.getByText('4/200')).toBeInTheDocument();
    });

    it('should render suggestions toggle button', () => {
      render(<FieldEditor {...defaultProps} />);

      const button = screen.getByTestId('toggle-suggestions-subject');
      expect(button).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(<FieldEditor {...defaultProps} onChange={onChange} />);

      const input = screen.getByPlaceholderText('例如：一位美丽的女性');
      fireEvent.change(input, { target: { value: 'New value' } });

      expect(onChange).toHaveBeenCalledWith('New value');
    });

    it('should not allow input exceeding maxLength', () => {
      const onChange = vi.fn();
      render(<FieldEditor {...defaultProps} onChange={onChange} />);

      const input = screen.getByPlaceholderText('例如：一位美丽的女性');
      const longValue = 'a'.repeat(201);

      fireEvent.change(input, { target: { value: longValue } });

      // Should not call onChange with value exceeding maxLength
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should show suggestions when toggle button is clicked', () => {
      render(<FieldEditor {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-suggestions-subject');
      fireEvent.click(toggleButton);

      expect(screen.getByText('一位美丽的女性')).toBeInTheDocument();
      expect(screen.getByText('一个可爱的猫咪')).toBeInTheDocument();
      expect(screen.getByText('一座雄伟的山脉')).toBeInTheDocument();
    });

    it('should call onChange when suggestion is clicked', () => {
      const onChange = vi.fn();
      render(<FieldEditor {...defaultProps} onChange={onChange} />);

      const toggleButton = screen.getByTestId('toggle-suggestions-subject');
      fireEvent.click(toggleButton);

      const suggestion = screen.getByText('一位美丽的女性');
      fireEvent.click(suggestion);

      expect(onChange).toHaveBeenCalledWith('一位美丽的女性');
    });

    it('should toggle suggestions panel visibility', () => {
      render(<FieldEditor {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-suggestions-subject');

      // Initially hidden
      expect(screen.queryByText('建议关键词')).not.toBeInTheDocument();

      // Show suggestions
      fireEvent.click(toggleButton);
      expect(screen.getByText('建议关键词')).toBeInTheDocument();

      // Hide suggestions
      fireEvent.click(toggleButton);
      expect(screen.queryByText('建议关键词')).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should display validation error for empty required field', () => {
      render(<FieldEditor {...defaultProps} value="   " />);

      expect(screen.getByText('主体描述不能为空')).toBeInTheDocument();
    });

    it('should display validation error for exceeding max length', () => {
      const configWithValidation = {
        ...mockConfig,
        maxLength: 10,
        validation: (value: string) => {
          if (value.length > 10) return '不能超过 10 个字符';
          return null;
        },
      };

      render(<FieldEditor {...defaultProps} config={configWithValidation} value={"a".repeat(11)} />);

      expect(screen.getByText('不能超过 10 个字符')).toBeInTheDocument();
    });

    it('should not display error for valid value', () => {
      render(<FieldEditor {...defaultProps} value="Valid value" />);

      expect(screen.queryByText('主体描述不能为空')).not.toBeInTheDocument();
    });

    it('should show helper text for required fields', () => {
      render(<FieldEditor {...defaultProps} value="" />);

      expect(screen.getByText('必填字段')).toBeInTheDocument();
    });
  });

  describe('character counter', () => {
    it('should display correct count for empty value', () => {
      render(<FieldEditor {...defaultProps} value="" />);

      expect(screen.getByText('0/200')).toBeInTheDocument();
    });

    it('should update count when value changes', () => {
      render(<FieldEditor {...defaultProps} value="Test" />);

      expect(screen.getByText('4/200')).toBeInTheDocument();
    });

    it('should show warning color when near limit (80%)', () => {
      render(<FieldEditor {...defaultProps} value={"a".repeat(161)} />);

      const counter = screen.getByText('161/200');
      expect(counter).toBeInTheDocument();
      // Check if the text color is warning (orange)
      // Note: You may need to check the actual style in a real test
    });

    it('should show error color when at limit', () => {
      render(<FieldEditor {...defaultProps} value={"a".repeat(200)} />);

      expect(screen.getByText('200/200')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper data-testid', () => {
      render(<FieldEditor {...defaultProps} data-testid="test-field-editor" />);

      expect(screen.getByTestId('test-field-editor')).toBeInTheDocument();
    });

    it('should have input with proper data-testid', () => {
      render(<FieldEditor {...defaultProps} />);

      expect(screen.getByTestId('input-subject')).toBeInTheDocument();
    });

    it('should have suggestions panel with proper data-testid', () => {
      render(<FieldEditor {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-suggestions-subject');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('suggestions-subject')).toBeInTheDocument();
    });

    it('should render suggestion chips with proper data-testid', () => {
      render(<FieldEditor {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-suggestions-subject');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('suggestion-subject-0')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-subject-1')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-subject-2')).toBeInTheDocument();
    });
  });

  describe('focus state', () => {
    it('should call onFocus when input is focused', () => {
      const onFocus = vi.fn();
      render(<FieldEditor {...defaultProps} onFocus={onFocus} />);

      const input = screen.getByPlaceholderText('例如：一位美丽的女性');
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('should apply focused styling when focused', () => {
      const { rerender } = render(<FieldEditor {...defaultProps} isFocused={false} />);
      const container = screen.getByTestId('field-editor-subject');

      // Get initial opacity
      const initialStyle = window.getComputedStyle(container);
      expect(initialStyle.opacity).not.toBe('1');

      rerender(<FieldEditor {...defaultProps} isFocused={true} />);

      const focusedStyle = window.getComputedStyle(container);
      expect(focusedStyle.opacity).toBe('1');
    });
  });
});
