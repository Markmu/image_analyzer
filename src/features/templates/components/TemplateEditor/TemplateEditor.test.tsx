/**
 * TemplateEditor Component Tests
 *
 * Epic 5 - Story 5.1: Template Generation
 * Task 7.2: 测试模版编辑组件交互
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateEditor } from './TemplateEditor';
import type { Template } from '../../types';

// Mock the hooks
vi.mock('../../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: vi.fn(() => ({
    copy: vi.fn(),
    isSuccess: false,
    isCopying: false,
  })),
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: vi.fn(() => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  })),
}));

vi.mock('../../lib/optimize-prompt', () => ({
  optimizePrompt: vi.fn(),
  buildFullPrompt: vi.fn(),
}));

vi.mock('../../lib/optimization-constants', () => ({
  loadOptimizationPreferences: vi.fn(() => ({
    mode: 'quick',
    target: 'quality',
    intensity: 'medium',
    language: 'zh',
  })),
  DEFAULT_OPTIMIZATION_PREFERENCES: {
    mode: 'quick',
    target: 'quality',
    intensity: 'medium',
    language: 'zh',
  },
}));

// Mock child components
vi.mock('../TemplatePreview', () => ({
  TemplatePreview: vi.fn(() => <div data-testid="template-preview">Preview</div>),
}));

vi.mock('../CopyButton', () => ({
  CopyButton: vi.fn(({ text, 'data-testid': testId }) => (
    <button data-testid={testId || 'copy-button'}>Copy</button>
  )),
}));

vi.mock('../ExportButton', () => ({
  ExportButton: vi.fn(({ 'data-testid': testId }) => (
    <button data-testid={testId || 'export-button'}>Export</button>
  )),
}));

vi.mock('../OptimizeButton', () => ({
  OptimizeButton: vi.fn(({ 'data-testid': testId, disabled, loading, onClick }) => (
    <button data-testid={testId || 'optimize-button'} disabled={disabled || loading} onClick={onClick}>
      Optimize
    </button>
  )),
}));

vi.mock('../OptimizeButton/OptimizationOptionsPanel', () => ({
  OptimizationOptionsPanel: vi.fn(({ onConfirm, loading }) => (
    <div>
      <button onClick={onConfirm} disabled={loading}>Confirm</button>
    </div>
  )),
}));

vi.mock('../OptimizationPreviewDialog', () => ({
  OptimizationPreviewDialog: vi.fn(({ onAccept, onReject, open }) =>
    open ? (
      <div data-testid="optimization-preview">
        <button onClick={onAccept}>Accept</button>
        <button onClick={onReject}>Reject</button>
      </div>
    ) : null
  ),
}));

describe('TemplateEditor Component', () => {
  const mockTemplate: Template = {
    id: 'template-1',
    userId: 'user-1',
    analysisResultId: 'analysis-1',
    variableFormat: '主体: [风景画]\n风格: [印象派]',
    jsonFormat: {
      subject: '风景画',
      style: '印象派',
      composition: '三分法',
      colors: '暖色调',
      lighting: '自然光',
      additional: '细节丰富',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render template editor with default props', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByTestId('template-editor')).toBeInTheDocument();
      expect(screen.getByText('模版编辑器')).toBeInTheDocument();
    });

    it('should render tabs for different views', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByText('变量格式')).toBeInTheDocument();
      expect(screen.getByText('JSON 字段')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
    });

    it('should render copy buttons', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByTestId('copy-variable-template')).toBeInTheDocument();
      expect(screen.getByTestId('copy-json-template')).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByTestId('export-template')).toBeInTheDocument();
    });

    it('should render optimize button by default', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByTestId('optimize-template')).toBeInTheDocument();
    });

    it('should not render save button by default', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.queryByTestId('save-template')).not.toBeInTheDocument();
    });

    it('should render save button when showSaveButton is true', () => {
      render(
        <TemplateEditor
          template={mockTemplate}
          showSaveButton
          onSave={vi.fn()}
        />
      );

      expect(screen.getByTestId('save-template')).toBeInTheDocument();
    });
  });

  describe('Variable Format Tab', () => {
    it('should display variable format textarea', () => {
      render(<TemplateEditor template={mockTemplate} />);

      const textarea = screen.getByLabelText('变量格式模版');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(mockTemplate.variableFormat);
    });

    it('should update variable format on change', () => {
      render(<TemplateEditor template={mockTemplate} onChange={mockOnChange} />);

      const textarea = screen.getByLabelText('变量格式模版');
      const newValue = '主体: [山脉]\n风格: [写实]';

      fireEvent.change(textarea, { target: { value: newValue } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variableFormat: newValue,
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should display help text for variable format', () => {
      render(<TemplateEditor template={mockTemplate} />);

      expect(
        screen.getByText('使用 [变量名] 标记可替换部分，例如: [主体描述]、[风格描述]')
      ).toBeInTheDocument();
    });

    it('should disable textarea in read-only mode', () => {
      render(<TemplateEditor template={mockTemplate} readOnly />);

      const textarea = screen.getByLabelText('变量格式模版');
      expect(textarea).toBeDisabled();
    });
  });

  describe('JSON Fields Tab', () => {
    it('should display all JSON fields', async () => {
      render(<TemplateEditor template={mockTemplate} />);

      // Click on JSON fields tab
      fireEvent.click(screen.getByText('JSON 字段'));

      await waitFor(() => {
        expect(screen.getByLabelText('Subject')).toBeInTheDocument();
        expect(screen.getByLabelText('Style')).toBeInTheDocument();
        expect(screen.getByLabelText('Composition')).toBeInTheDocument();
        expect(screen.getByLabelText('Colors')).toBeInTheDocument();
        expect(screen.getByLabelText('Lighting')).toBeInTheDocument();
        expect(screen.getByLabelText('Additional')).toBeInTheDocument();
      });
    });

    it('should update JSON field on change', async () => {
      render(<TemplateEditor template={mockTemplate} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('JSON 字段'));

      await waitFor(() => {
        const subjectField = screen.getByLabelText('Subject');
        fireEvent.change(subjectField, { target: { value: '山脉' } });

        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            jsonFormat: expect.objectContaining({
              subject: '山脉',
            }),
          })
        );
      });
    });

    it('should disable fields in read-only mode', async () => {
      render(<TemplateEditor template={mockTemplate} readOnly />);

      fireEvent.click(screen.getByText('JSON 字段'));

      await waitFor(() => {
        const subjectField = screen.getByLabelText('Subject');
        expect(subjectField).toBeDisabled();
      });
    });
  });

  describe('Preview Tab', () => {
    it('should display preview tab content', async () => {
      render(<TemplateEditor template={mockTemplate} />);

      fireEvent.click(screen.getByText('预览'));

      await waitFor(() => {
        expect(screen.getByTestId('template-preview')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      render(<TemplateEditor template={mockTemplate} />);

      // Default: variable format tab
      expect(screen.getByLabelText('变量格式模版')).toBeInTheDocument();

      // Switch to JSON fields tab
      fireEvent.click(screen.getByText('JSON 字段'));
      await waitFor(() => {
        expect(screen.getByLabelText('Subject')).toBeInTheDocument();
      });

      // Switch to preview tab
      fireEvent.click(screen.getByText('预览'));
      await waitFor(() => {
        expect(screen.getByTestId('template-preview')).toBeInTheDocument();
      });

      // Switch back to variable format tab
      fireEvent.click(screen.getByText('变量格式'));
      await waitFor(() => {
        expect(screen.getByLabelText('变量格式模版')).toBeInTheDocument();
      });
    });
  });

  describe('Glassmorphism Styling', () => {
    it('should apply glass card class', () => {
      const { container } = render(<TemplateEditor template={mockTemplate} />);

      const editor = container.querySelector('.ia-glass-card');
      expect(editor).toBeInTheDocument();
    });

    it('should apply static glass card class', () => {
      const { container } = render(<TemplateEditor template={mockTemplate} />);

      const editor = container.querySelector('.ia-glass-card--static');
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Optimize Button', () => {
    it('should be enabled when template has content', () => {
      render(<TemplateEditor template={mockTemplate} />);

      const optimizeButton = screen.getByTestId('optimize-template');
      expect(optimizeButton).not.toBeDisabled();
    });

    it('should be disabled when template is empty', () => {
      const emptyTemplate: Template = {
        ...mockTemplate,
        jsonFormat: {
          subject: '',
          style: '',
          composition: '',
          colors: '',
          lighting: '',
          additional: '',
        },
      };

      render(<TemplateEditor template={emptyTemplate} />);

      const optimizeButton = screen.getByTestId('optimize-template');
      expect(optimizeButton).toBeDisabled();
    });

    it('should be disabled in read-only mode', () => {
      render(<TemplateEditor template={mockTemplate} readOnly />);

      const optimizeButton = screen.getByTestId('optimize-template');
      expect(optimizeButton).toBeDisabled();
    });

    it('should not render when showOptimizeButton is false', () => {
      render(
        <TemplateEditor
          template={mockTemplate}
          showOptimizeButton={false}
        />
      );

      expect(screen.queryByTestId('optimize-template')).not.toBeInTheDocument();
    });
  });

  describe('Save Button', () => {
    it('should call onSave when save button is clicked', () => {
      const mockOnSave = vi.fn();
      render(
        <TemplateEditor
          template={mockTemplate}
          showSaveButton
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByTestId('save-template');
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(mockTemplate);
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      // Set mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByTestId('template-editor')).toBeInTheDocument();
    });

    it('should render on desktop viewport', () => {
      // Set desktop viewport
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      render(<TemplateEditor template={mockTemplate} />);

      expect(screen.getByTestId('template-editor')).toBeInTheDocument();
    });
  });
});
