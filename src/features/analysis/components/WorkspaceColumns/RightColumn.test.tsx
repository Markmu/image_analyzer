'use client';

import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { vi } from 'vitest';
import RightColumn from './RightColumn';

vi.mock('@/components/shared/EmptyState', () => ({
  default: () => <div data-testid="empty-state-mock" />,
}));

vi.mock('@/features/analysis/components/TemplateEditor', () => ({
  default: ({
    templateContent,
    renderedTemplate,
    variables,
    onVariableChange,
    onResetVariables,
  }: {
    templateContent: string;
    renderedTemplate: string;
    variables: Record<string, string>;
    onVariableChange: (key: string, value: string) => void;
    onResetVariables: () => void;
  }) => (
    <div data-testid="template-editor-mock">
      <div data-testid="preview">预览</div>
      <div data-testid="variables">
        {Object.keys(variables).map((key) => (
          <input key={key} data-testid={`variable-${key}`} aria-label={key} />
        ))}
      </div>
      <button data-testid="reset-button" onClick={onResetVariables}>
        重置所有变量
      </button>
    </div>
  ),
}));

vi.mock('@/features/analysis/components/TemplateGenerationSection', () => ({
  TemplateGenerationSection: () => <div data-testid="template-generation-section-mock" />,
}));

describe('RightColumn', () => {
  const baseProps: ComponentProps<typeof RightColumn> = {
    status: 'completed',
    analysisData: null,
    analysisResultId: 1,
    userId: 'user-1',
    templateContent: 'A [变量]',
    renderedTemplate: 'Rendered [变量]',
    copied: false,
    variables: { 变量: '值' },
    isMobileLayout: false,
    onCopyTemplate: vi.fn().mockResolvedValue(undefined),
    onSaveTemplate: vi.fn().mockResolvedValue(undefined),
    onVariableChange: vi.fn(),
    onResetVariables: vi.fn(),
  };

  it('renders template editor with preview and variable form', () => {
    render(<RightColumn {...baseProps} />);

    // 预览区域
    expect(screen.getByText('预览')).toBeInTheDocument();
    // 变量输入框
    expect(screen.getByLabelText('变量')).toBeInTheDocument();
    // 重置按钮
    expect(screen.getByText('重置所有变量')).toBeInTheDocument();
  });
});
