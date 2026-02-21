import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnalysisPage from './page';

const mockUseSearchParams = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/analysis',
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock('@/features/auth/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
  }),
}));

vi.mock('@/stores/useProgressStore', () => ({
  useProgressStore: () => ({
    setAnalysisStage: vi.fn(),
    setAnalysisProgress: vi.fn(),
    resetAnalysis: vi.fn(),
  }),
}));

vi.mock('@/components/shared/TermsDialog', () => ({
  TermsDialog: () => null,
}));

vi.mock('@/features/analysis/components/WorkspaceColumns', () => ({
  LeftColumn: () => <div data-testid="left-column" />,
  MiddleColumn: () => <div data-testid="middle-column" />,
  RightColumn: ({ templateContent }: { templateContent: string }) => (
    <div data-testid="right-template-content">{templateContent}</div>
  ),
}));

describe('AnalysisPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/user/terms-status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { requiresAgreement: false },
          }),
        } as Response;
      }

      if (url.includes('/api/analysis/models')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { models: [] },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response;
    }) as typeof fetch;
  });

  it('should prefill template content from history reuse query param', async () => {
    const templateSnapshot = {
      variableFormat: '',
      jsonFormat: {
        subject: '[人物]',
        style: '极简',
        composition: '留白构图',
        colors: '低饱和',
        lighting: '柔光',
        additional: '[无文字]',
      },
    };

    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        template: JSON.stringify(templateSnapshot),
      })
    );

    render(<AnalysisPage />);

    await waitFor(() => {
      const content = screen.getByTestId('right-template-content');
      expect(content.textContent).toContain('请创作一张[人物]图片。');
      expect(content.textContent).toContain('风格方向：极简。');
    });
  });

  it('should keep template content empty when template query is invalid json', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        template: '{invalid-json}',
      })
    );

    render(<AnalysisPage />);

    await waitFor(() => {
      expect(screen.getByTestId('right-template-content').textContent).toBe('');
    });

    consoleErrorSpy.mockRestore();
  });
});
