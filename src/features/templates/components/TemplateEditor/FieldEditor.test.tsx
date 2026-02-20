/**
 * FieldEditor Component Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Task 8: Unit tests for FieldEditor component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldEditor } from './FieldEditor';
import type { FieldConfig } from '../../types/editor';

describe('FieldEditor Component', () => {
  const mockConfig: FieldConfig = {
    key: 'subject',
    label: '主体描述',
    placeholder: '例如：一位美丽的女性',
    required: true,
    maxLength: 200,
    suggestions: [
      '一位美丽的女性',
      '一个可爱的猫咪',
      '一座雄伟的山脉',
    ],
    validation: (value: string) => {
      if (!value.trim()) return '主体描述不能为空';
      if (value.length > 200) return '主体描述不能超过 200 个字符';
      return null;
    },
  };

  const mockOnChange = vi.fn();
  const mockOnFocus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render field label', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('主体描述')).toBeInTheDocument();
    });

    it('should render required indicator for required fields', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not render required indicator for optional fields', () => {
      const optionalConfig = { ...mockConfig, required: false };

      render(
        <FieldEditor
          config={optionalConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should render character counter', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value="test value"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText((content) => content.includes('10/200'))).toBeInTheDocument();
    });

    it('should render input with correct placeholder', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('例如：一位美丽的女性');
      expect(input).toBeInTheDocument();
    });

    it('should render suggestions toggle when suggestions exist', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('toggle-suggestions-subject')).toBeInTheDocument();
    });

    it('should not render suggestions toggle when no suggestions', () => {
      const noSuggestionsConfig = { ...mockConfig, suggestions: [] };

      render(
        <FieldEditor
          config={noSuggestionsConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByTestId('toggle-suggestions-subject')).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should call onChange when input value changes', async () => {
      const user = userEvent.setup();

      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'new value');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onFocus when input is focused', async () => {
      const user = userEvent.setup();

      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(mockOnFocus).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should show validation error for empty required field', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      // Error message appears multiple times (helperText + bottom error)
      const errorMessages = screen.getAllByText('主体描述不能为空');
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should not show validation error for valid value', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value="valid subject"
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText('主体描述不能为空')).not.toBeInTheDocument();
    });
  });

  describe('Suggestions Panel', () => {
    it('should toggle suggestions panel on button click', async () => {
      const user = userEvent.setup();

      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      const toggleButton = screen.getByTestId('toggle-suggestions-subject');

      // Suggestions start collapsed/expanded based on component default
      // Click to toggle
      await user.click(toggleButton);

      // Suggestions should be visible after toggle
      expect(screen.getByText('一位美丽的女性')).toBeInTheDocument();

      // Click again to toggle back
      await user.click(toggleButton);
    });

    it('should apply suggestion when clicked', async () => {
      const user = userEvent.setup();

      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      // Expand suggestions
      const toggleButton = screen.getByTestId('toggle-suggestions-subject');
      await user.click(toggleButton);

      // Click a suggestion
      const suggestion = screen.getByText('一位美丽的女性');
      await user.click(suggestion);

      expect(mockOnChange).toHaveBeenCalledWith('一位美丽的女性');
    });

    it('should render all suggestions', async () => {
      const user = userEvent.setup();

      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      // Expand suggestions
      const toggleButton = screen.getByTestId('toggle-suggestions-subject');
      await user.click(toggleButton);

      expect(screen.getByText('一位美丽的女性')).toBeInTheDocument();
      expect(screen.getByText('一个可爱的猫咪')).toBeInTheDocument();
      expect(screen.getByText('一座雄伟的山脉')).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('should have default data-testid based on field key', () => {
      const { container } = render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      const fieldContainer = container.querySelector('[data-testid="field-editor-subject"]');
      expect(fieldContainer).toBeInTheDocument();
    });

    it('should have correct data-testid on input', () => {
      render(
        <FieldEditor
          config={mockConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-subject')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suggestions array', () => {
      const emptySuggestionsConfig = { ...mockConfig, suggestions: [] };

      render(
        <FieldEditor
          config={emptySuggestionsConfig}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByTestId('toggle-suggestions-subject')).not.toBeInTheDocument();
    });

    it('should handle very long values', () => {
      const longValue = 'a'.repeat(200);

      render(
        <FieldEditor
          config={mockConfig}
          value={longValue}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(longValue);
    });
  });
});
