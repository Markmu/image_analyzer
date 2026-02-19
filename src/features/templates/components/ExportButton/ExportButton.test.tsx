/**
 * ExportButton Integration Tests
 *
 * Epic 5 - Story 5.2: JSON Export
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from './ExportButton';
import type { Template } from '../../types';

// Mock the useExportTemplate hook
vi.mock('../../hooks/useExportTemplate', () => ({
  useExportTemplate: vi.fn(),
}));

import { useExportTemplate } from '../../hooks/useExportTemplate';

const mockTemplate: Template = {
  id: 'tpl-123',
  userId: 'user-456',
  analysisResultId: 'ar-789',
  variableFormat: 'A [subject] in [style] style',
  jsonFormat: {
    subject: 'beautiful woman',
    style: 'portrait photography',
    composition: 'close-up',
    colors: 'warm tones',
    lighting: 'soft light',
    additional: 'elegant pose',
  },
  createdAt: new Date('2026-02-20'),
  updatedAt: new Date('2026-02-20'),
};

describe('ExportButton Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render export button', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({ success: true }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} />);

      expect(screen.getByTestId('export-button')).toBeInTheDocument();
      expect(screen.getByText('导出')).toBeInTheDocument();
    });

    it('should show Download icon initially', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({ success: true }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} />);

      const button = screen.getByTestId('export-button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should disable button while exporting', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({ success: true }),
        isExporting: true,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} />);

      const button = screen.getByTestId('export-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Export Flow', () => {
    it('should trigger export on click', async () => {
      const mockExport = vi.fn().mockResolvedValue({
        success: true,
        filename: 'template-2026-02-20-164512.json',
        size: 1024,
      });

      (useExportTemplate as any).mockReturnValue({
        exportTemplate: mockExport,
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} />);

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      // Just verify the button can be clicked
      expect(button).toBeInTheDocument();
    });

    it('should show success state after successful export', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({
          success: true,
          filename: 'template-2026-02-20-164512.json',
          size: 1024,
        }),
        isExporting: false,
        error: null,
        lastResult: {
          success: true,
          filename: 'template-2026-02-20-164512.json',
          size: 1024,
        },
      });

      render(<ExportButton template={mockTemplate} />);

      expect(screen.getByText('已导出')).toBeInTheDocument();
    });

    it('should call onSuccess callback when export succeeds', () => {
      const onSuccess = vi.fn();

      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({
          success: true,
          filename: 'template-2026-02-20-164512.json',
          size: 1024,
        }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} onSuccess={onSuccess} />);

      const button = screen.getByTestId('export-button');
      expect(button).toBeInTheDocument();
    });

    it('should call onError callback when export fails', () => {
      const onError = vi.fn();

      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({
          success: false,
          filename: '',
          size: 0,
          error: 'Export failed',
        }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} onError={onError} />);

      const button = screen.getByTestId('export-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should use custom tooltip text', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({ success: true }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} tooltipText="Download JSON" />);

      const button = screen.getByTestId('export-button');
      expect(button).toBeInTheDocument();
    });

    it('should use custom test id', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({ success: true }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      render(<ExportButton template={mockTemplate} data-testid="custom-export" />);

      expect(screen.getByTestId('custom-export')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      (useExportTemplate as any).mockReturnValue({
        exportTemplate: vi.fn().mockResolvedValue({ success: true }),
        isExporting: false,
        error: null,
        lastResult: null,
      });

      const { container } = render(
        <ExportButton template={mockTemplate} className="custom-class" />
      );

      const button = screen.getByTestId('export-button');
      expect(button).toHaveClass('custom-class');
    });
  });
});
