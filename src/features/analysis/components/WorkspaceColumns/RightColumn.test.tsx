'use client';

import { render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { vi } from 'vitest';
import RightColumn from './RightColumn';

const collapsibleSectionSpy = vi.fn();

vi.mock('@/components/shared/EmptyState', () => ({
  default: () => <div data-testid="empty-state-mock" />,
}));

vi.mock('@/components/shared/CollapsibleSection', () => ({
  CollapsibleSection: (props: {
    title: string;
    defaultExpanded: boolean;
    storageKey?: string;
    children: ReactNode;
  }) => {
    collapsibleSectionSpy(props);
    return (
      <section data-testid="collapsible-section-mock">
        <div>{props.title}</div>
        <div>{props.defaultExpanded ? 'expanded' : 'collapsed'}</div>
        <div>{props.storageKey ?? 'no-storage-key'}</div>
        {props.children}
      </section>
    );
  },
}));

vi.mock('@/features/analysis/components/VariableReplacer', () => ({
  default: () => <div data-testid="variable-replacer-mock" />,
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
  };

  beforeEach(() => {
    collapsibleSectionSpy.mockClear();
  });

  it('renders custom content section as default expanded without localStorage persistence', () => {
    render(<RightColumn {...baseProps} />);

    expect(screen.getByText('自定义内容')).toBeInTheDocument();
    expect(screen.getByText('expanded')).toBeInTheDocument();
    expect(screen.getByText('no-storage-key')).toBeInTheDocument();

    expect(collapsibleSectionSpy).toHaveBeenCalledTimes(1);
    expect(collapsibleSectionSpy.mock.calls[0]?.[0]).toMatchObject({
      title: '自定义内容',
      defaultExpanded: true,
    });
    expect(collapsibleSectionSpy.mock.calls[0]?.[0]).not.toHaveProperty('storageKey');
  });

  it('hides template preview label in the right column while rendering preview content', () => {
    render(<RightColumn {...baseProps} />);

    expect(screen.getByText((text) => text.includes('Rendered'))).toBeInTheDocument();
    expect(screen.getByText('[变量]')).toBeInTheDocument();
    expect(screen.queryByText('可编辑模版预览')).not.toBeInTheDocument();
  });
});
