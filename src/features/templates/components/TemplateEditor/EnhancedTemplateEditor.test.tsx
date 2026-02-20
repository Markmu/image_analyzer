/**
 * EnhancedTemplateEditor Component Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Task 8: Unit tests for EnhancedTemplateEditor component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { EnhancedTemplateEditor } from './EnhancedTemplateEditor';
import type { TemplateFieldKey } from '../../types/template';

// Mock MUI components
vi.mock('@mui/material', () => ({
  Box: vi.fn(({ children, sx, ...props }) => (
    <div style={sx as React.CSSProperties} {...props}>
      {children}
    </div>
  )),
  Paper: vi.fn(({ children, elevation, className, sx, ...props }) => (
    <div className={className} style={sx as React.CSSProperties} {...props}>
      {children}
    </div>
  )),
  Typography: vi.fn(({ children, variant, sx, ...props }) => (
    <p data-testid={`typography-${variant}`} style={sx as React.CSSProperties} {...props}>
      {children}
    </p>
  )),
  Button: vi.fn(({ children, onClick, disabled, startIcon, size, sx, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'button'}
      type="button"
    >
      {startIcon}
      {children}
    </button>
  )),
  Divider: vi.fn(({ orientation, flexItem }) => (
    <hr data-testid="divider" data-orientation={orientation} data-flex={flexItem} />
  )),
  useTheme: vi.fn(() => ({
    breakpoints: {
      up: vi.fn((breakpoint) => breakpoint === 'lg'),
      between: vi.fn(() => false),
    },
  })),
  useMediaQuery: vi.fn(() => true), // Default to desktop
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Edit: vi.fn(() => <span data-testid="edit-icon" />),
  Eye: vi.fn(() => <span data-testid="eye-icon" />),
  Undo: vi.fn(() => <span data-testid="undo-icon" />),
  Redo: vi.fn(() => <span data-testid="redo-icon" />),
  Save: vi.fn(() => <span data-testid="save-icon" />),
  ChevronDown: vi.fn(() => <span data-testid="chevron-down" />),
  ChevronUp: vi.fn(() => <span data-testid="chevron-up" />),
}));

// Mock child components
vi.mock('./FieldEditor', () => ({
  FieldEditor: vi.fn(({ config, value, onChange, onFocus, 'data-testid': testId }) => (
    <div data-testid={testId}>
      <label>{config.label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={config.placeholder}
      />
    </div>
  )),
}));

vi.mock('../TemplatePreview', () => ({
  FieldPreview: vi.fn(({ fields, expanded, 'data-testid': testId }) => (
    <div data-testid={testId}>
      <span>Preview: {JSON.stringify(fields)}</span>
      <span>Expanded: {expanded.toString()}</span>
    </div>
  )),
}));

vi.mock('../CopyButton', () => ({
  CopyButton: vi.fn(({ text, tooltipText, 'data-testid': testId }) => (
    <button data-testid={testId || 'copy-button'} title={tooltipText}>
      Copy
    </button>
  )),
}));

vi.mock('../ExportButton', () => ({
  ExportButton: vi.fn(({ template, tooltipText, 'data-testid': testId }) => (
    <button data-testid={testId || 'export-button'} title={tooltipText}>
      Export
    </button>
  )),
}));

vi.mock('@/features/generation/components/GenerateButton', () => ({
  GenerateButton: vi.fn(({ template, onGenerationComplete, 'data-testid': testId }) => (
    <button data-testid={testId || 'generate-button'} onClick={() => onGenerationComplete?.({} as any)}>
      Generate
    </button>
  )),
}));

vi.mock('@/features/generation/components/GenerationPreviewDialog', () => ({
  GenerationPreviewDialog: vi.fn(({ open, result, onClose, onRegenerate }) => (
    <div data-testid="generation-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={onClose}>Close</button>
      <button onClick={onRegenerate}>Regenerate</button>
    </div>
  )),
}));

// Mock Zustand store
const mockStore = {
  fields: {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  },
  history: [{ fields: {}, timestamp: Date.now() }],
  historyIndex: 0,
  isPreviewExpanded: true,
  activeField: null,
  updateField: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: vi.fn(() => false),
  canRedo: vi.fn(() => false),
  togglePreview: vi.fn(),
  setActiveField: vi.fn(),
  reset: vi.fn(),
};

vi.mock('../../stores', () => ({
  useTemplateEditorStore: vi.fn(() => mockStore),
}));

describe('EnhancedTemplateEditor Component', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store to default state
    Object.assign(mockStore, {
      fields: {
        subject: '',
        style: '',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      },
      history: [{ fields: {}, timestamp: Date.now() }],
      historyIndex: 0,
      isPreviewExpanded: true,
      activeField: null,
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
    });
  });

  describe('Rendering', () => {
    it('should render editor container', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByTestId('enhanced-template-editor')).toBeInTheDocument();
    });

    it('should render header with title', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByText('模版编辑器')).toBeInTheDocument();
    });

    it('should render all field editors', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByTestId('field-editor-subject')).toBeInTheDocument();
      expect(screen.getByTestId('field-editor-style')).toBeInTheDocument();
      expect(screen.getByTestId('field-editor-composition')).toBeInTheDocument();
      expect(screen.getByTestId('field-editor-colors')).toBeInTheDocument();
      expect(screen.getByTestId('field-editor-lighting')).toBeInTheDocument();
      expect(screen.getByTestId('field-editor-additional')).toBeInTheDocument();
    });

    it('should render undo and redo buttons', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByTestId('undo-button')).toBeInTheDocument();
      expect(screen.getByTestId('redo-button')).toBeInTheDocument();
    });

    it('should render copy and export buttons', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByTestId('copy-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('export-json')).toBeInTheDocument();
    });

    it('should not render save button by default', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
    });

    it('should render save button when showSaveButton is true', () => {
      render(<EnhancedTemplateEditor showSaveButton onSave={mockOnSave} />);

      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    it('should not render generate button by default', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.queryByTestId('generate-button')).not.toBeInTheDocument();
    });

    it('should render generate button when enableGeneration is true', () => {
      render(<EnhancedTemplateEditor enableGeneration />);

      expect(screen.getByTestId('generate-button')).toBeInTheDocument();
    });

    it('should render preview section', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByText('实时预览')).toBeInTheDocument();
      expect(screen.getByTestId('template-preview')).toBeInTheDocument();
    });

    it('should render history info on desktop', () => {
      render(<EnhancedTemplateEditor />);

      expect(screen.getByText('历史记录')).toBeInTheDocument();
    });
  });

  describe('Undo/Redo Buttons', () => {
    it('should disable undo button when cannot undo', () => {
      mockStore.canUndo = vi.fn(() => false);

      render(<EnhancedTemplateEditor />);

      const undoButton = screen.getByTestId('undo-button');
      expect(undoButton).toBeDisabled();
    });

    it('should enable undo button when can undo', () => {
      mockStore.canUndo = vi.fn(() => true);

      render(<EnhancedTemplateEditor />);

      const undoButton = screen.getByTestId('undo-button');
      expect(undoButton).not.toBeDisabled();
    });

    it('should disable redo button when cannot redo', () => {
      mockStore.canRedo = vi.fn(() => false);

      render(<EnhancedTemplateEditor />);

      const redoButton = screen.getByTestId('redo-button');
      expect(redoButton).toBeDisabled();
    });

    it('should enable redo button when can redo', () => {
      mockStore.canRedo = vi.fn(() => true);

      render(<EnhancedTemplateEditor />);

      const redoButton = screen.getByTestId('redo-button');
      expect(redoButton).not.toBeDisabled();
    });

    it('should call undo when undo button clicked', () => {
      mockStore.canUndo = vi.fn(() => true);

      render(<EnhancedTemplateEditor />);

      const undoButton = screen.getByTestId('undo-button');
      fireEvent.click(undoButton);

      expect(mockStore.undo).toHaveBeenCalled();
    });

    it('should call redo when redo button clicked', () => {
      mockStore.canRedo = vi.fn(() => true);

      render(<EnhancedTemplateEditor />);

      const redoButton = screen.getByTestId('redo-button');
      fireEvent.click(redoButton);

      expect(mockStore.redo).toHaveBeenCalled();
    });

    it('should disable undo/redo in read-only mode', () => {
      mockStore.canUndo = vi.fn(() => true);
      mockStore.canRedo = vi.fn(() => true);

      render(<EnhancedTemplateEditor readOnly />);

      const undoButton = screen.getByTestId('undo-button');
      const redoButton = screen.getByTestId('redo-button');

      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should call undo on Ctrl+Z', () => {
      render(<EnhancedTemplateEditor />);

      const editor = screen.getByTestId('enhanced-template-editor');
      fireEvent.keyDown(editor, {
        key: 'z',
        ctrlKey: true,
        shiftKey: false,
      });

      expect(mockStore.undo).toHaveBeenCalled();
    });

    it('should call undo on Cmd+Z (Mac)', () => {
      // Mock Mac platform
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');

      render(<EnhancedTemplateEditor />);

      const editor = screen.getByTestId('enhanced-template-editor');
      fireEvent.keyDown(editor, {
        key: 'z',
        metaKey: true,
        shiftKey: false,
      });

      expect(mockStore.undo).toHaveBeenCalled();
    });

    it('should call redo on Ctrl+Shift+Z', () => {
      render(<EnhancedTemplateEditor />);

      const editor = screen.getByTestId('enhanced-template-editor');
      fireEvent.keyDown(editor, {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
      });

      expect(mockStore.redo).toHaveBeenCalled();
    });

    it('should call redo on Ctrl+Y', () => {
      render(<EnhancedTemplateEditor />);

      const editor = screen.getByTestId('enhanced-template-editor');
      fireEvent.keyDown(editor, {
        key: 'y',
        ctrlKey: true,
        shiftKey: false,
      });

      expect(mockStore.redo).toHaveBeenCalled();
    });

    it('should call onSave on Ctrl+S when save button shown', () => {
      render(<EnhancedTemplateEditor showSaveButton onSave={mockOnSave} />);

      const editor = screen.getByTestId('enhanced-template-editor');
      fireEvent.keyDown(editor, {
        key: 's',
        ctrlKey: true,
      });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should not call onSave on Ctrl+S when save button hidden', () => {
      render(<EnhancedTemplateEditor showSaveButton={false} onSave={mockOnSave} />);

      const editor = screen.getByTestId('enhanced-template-editor');
      fireEvent.keyDown(editor, {
        key: 's',
        ctrlKey: true,
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Field Editing', () => {
    it('should call updateField when field value changes', () => {
      render(<EnhancedTemplateEditor />);

      const subjectInput = screen.getByPlaceholderText('例如：一位美丽的女性');
      fireEvent.change(subjectInput, { target: { value: 'new subject' } });

      expect(mockStore.updateField).toHaveBeenCalledWith('subject', 'new subject');
    });

    it('should not update field in read-only mode', () => {
      render(<EnhancedTemplateEditor readOnly />);

      const subjectInput = screen.getByPlaceholderText('例如：一位美丽的女性');
      fireEvent.change(subjectInput, { target: { value: 'new subject' } });

      expect(mockStore.updateField).not.toHaveBeenCalled();
    });

    it('should call setActiveField when field is focused', () => {
      render(<EnhancedTemplateEditor />);

      const subjectInput = screen.getByPlaceholderText('例如：一位美丽的女性');
      fireEvent.focus(subjectInput);

      expect(mockStore.setActiveField).toHaveBeenCalledWith('subject');
    });
  });

  describe('Preview Toggle', () => {
    it('should call togglePreview when toggle button clicked', () => {
      render(<EnhancedTemplateEditor />);

      const toggleButton = screen.getByTestId('toggle-preview');
      fireEvent.click(toggleButton);

      expect(mockStore.togglePreview).toHaveBeenCalled();
    });

    it('should show "收起" when expanded', () => {
      mockStore.isPreviewExpanded = true;

      render(<EnhancedTemplateEditor />);

      expect(screen.getByText('收起')).toBeInTheDocument();
    });

    it('should show "展开" when collapsed', () => {
      mockStore.isPreviewExpanded = false;

      render(<EnhancedTemplateEditor />);

      expect(screen.getByText('展开')).toBeInTheDocument();
    });
  });

  describe('Save Button', () => {
    it('should call onSave with current fields when save clicked', () => {
      mockStore.fields = {
        subject: 'test subject',
        style: 'test style',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      };

      render(<EnhancedTemplateEditor showSaveButton onSave={mockOnSave} />);

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(mockStore.fields);
    });

    it('should disable save button in read-only mode', () => {
      render(<EnhancedTemplateEditor showSaveButton onSave={mockOnSave} readOnly />);

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Initial Fields', () => {
    it('should call reset with initial fields on mount', () => {
      const initialFields = {
        subject: 'initial subject',
        style: 'initial style',
      };

      render(<EnhancedTemplateEditor initialFields={initialFields} />);

      expect(mockStore.reset).toHaveBeenCalledWith(initialFields);
    });

    it('should not call reset when no initial fields provided', () => {
      render(<EnhancedTemplateEditor />);

      expect(mockStore.reset).not.toHaveBeenCalled();
    });
  });

  describe('Generation Feature', () => {
    it('should show generation dialog when generation completes', async () => {
      render(<EnhancedTemplateEditor enableGeneration />);

      const generateButton = screen.getByTestId('generate-button');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByTestId('generation-dialog')).toBeVisible();
      });
    });
  });

  describe('Glassmorphism Styling', () => {
    it('should apply glass card class to container', () => {
      const { container } = render(<EnhancedTemplateEditor />);

      const glassCard = container.querySelector('.ia-glass-card');
      expect(glassCard).toBeInTheDocument();
    });

    it('should apply static glass card class', () => {
      const { container } = render(<EnhancedTemplateEditor />);

      const staticCard = container.querySelector('.ia-glass-card--static');
      expect(staticCard).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should use three-column layout on desktop', () => {
      // useMediaQuery returns true for desktop by default
      render(<EnhancedTemplateEditor />);

      // Check that history info is shown (desktop only feature)
      expect(screen.getByText('历史记录')).toBeInTheDocument();
    });
  });

  describe('Custom Test ID', () => {
    it('should use custom data-testid when provided', () => {
      render(<EnhancedTemplateEditor data-testid="custom-editor" />);

      expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
    });
  });

  describe('Read-Only Mode', () => {
    it('should disable all interactive elements in read-only mode', () => {
      mockStore.canUndo = vi.fn(() => true);
      mockStore.canRedo = vi.fn(() => true);

      render(<EnhancedTemplateEditor readOnly showSaveButton onSave={mockOnSave} />);

      expect(screen.getByTestId('undo-button')).toBeDisabled();
      expect(screen.getByTestId('redo-button')).toBeDisabled();
      expect(screen.getByTestId('save-button')).toBeDisabled();
    });
  });
});
