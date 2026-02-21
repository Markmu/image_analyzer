/**
 * DeleteConfirmDialog Component Tests
 *
 * Epic 7 - Story 7.2: Template Library
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const mockHandlers = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      render(
        <DeleteConfirmDialog
          open={true}
          templateTitle="测试模版"
          {...mockHandlers}
        />
      );

      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('确认删除模版')).toBeInTheDocument();
      expect(screen.getByTestId('delete-template-title')).toHaveTextContent('测试模版');
    });

    it('should not render dialog when closed', () => {
      render(
        <DeleteConfirmDialog
          open={false}
          templateTitle="测试模版"
          {...mockHandlers}
        />
      );

      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <DeleteConfirmDialog
          open={true}
          templateTitle="测试模版"
          {...mockHandlers}
        />
      );

      fireEvent.click(screen.getByTestId('delete-confirm-button'));
      expect(mockHandlers.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <DeleteConfirmDialog
          open={true}
          templateTitle="测试模版"
          {...mockHandlers}
        />
      );

      fireEvent.click(screen.getByTestId('delete-cancel-button'));
      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
