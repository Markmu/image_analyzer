import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeleteAccountDialog } from '@/features/auth/components/DeleteAccountDialog';

describe('DeleteAccountDialog', () => {
  it('renders warning text', () => {
    render(
      <DeleteAccountDialog
        open
        isDeleting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('删除账户')).toBeInTheDocument();
    expect(screen.getByText('确定要删除账户吗？此操作不可撤销')).toBeInTheDocument();
  });

  it('disables confirm button when deleting', () => {
    render(
      <DeleteAccountDialog
        open
        isDeleting
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /删除中/i })).toBeDisabled();
  });
});
