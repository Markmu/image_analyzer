'use client';

import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { vi } from 'vitest';
import RightColumn from './RightColumn';

vi.mock('@/components/shared/EmptyState', () => ({
  default: () => <div data-testid="empty-state-mock" />,
}));

vi.mock('@/features/analysis/components/UnifiedTemplateEditor', () => ({
  UnifiedTemplateEditor: ({
    templateContent,
  }: {
    templateContent: string;
  }) => (
    <div data-testid="unified-template-editor-mock">
      <div data-testid="template-content">{templateContent}</div>
    </div>
  ),
}));

describe('RightColumn', () => {
  const baseProps: ComponentProps<typeof RightColumn> = {
    status: 'completed',
    analysisData: null,
    analysisResultId: 1,
    userId: 'user-1',
    templateContent: 'A [变量]',
    isMobileLayout: false,
    onSaveTemplate: vi.fn().mockResolvedValue(undefined),
  };

  it('renders unified template editor', () => {
    render(<RightColumn {...baseProps} />);

    // Unified template editor
    expect(screen.getByTestId('unified-template-editor-mock')).toBeInTheDocument();
    // Template content
    expect(screen.getByTestId('template-content')).toHaveTextContent('A [变量]');
  });

  it('shows empty state when no template content', () => {
    render(<RightColumn {...baseProps} templateContent="" />);

    expect(screen.getByTestId('empty-state-mock')).toBeInTheDocument();
  });

  it('renders save template button', () => {
    render(<RightColumn {...baseProps} />);

    expect(screen.getByText('保存到模版库')).toBeInTheDocument();
  });
});
