import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    session: { user: { id: 'user-1' } },
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
  LeftColumn: ({
    onUploadSuccess,
    onAutoStartAnalysis,
  }: {
    onUploadSuccess: (image: {
      imageId: string;
      filePath: string;
      fileSize: number;
      fileFormat: string;
      width: number;
      height: number;
      url: string;
    }) => void;
    onAutoStartAnalysis: (image: {
      imageId: string;
      filePath: string;
      fileSize: number;
      fileFormat: string;
      width: number;
      height: number;
      url: string;
    }) => void;
  }) => {
    const image = {
      imageId: 'uploaded-image-1',
      filePath: 'images/test/uploaded.jpg',
      fileSize: 1024,
      fileFormat: 'JPEG',
      width: 800,
      height: 600,
      url: 'https://example.com/uploaded.jpg',
    };

    return (
      <button
        type="button"
        data-testid="left-column"
        onClick={() => {
          onUploadSuccess(image);
          onAutoStartAnalysis(image);
        }}
      >
        trigger upload
      </button>
    );
  },
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

      if (url.includes('/api/history/') && !url.includes('/reuse')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              analysisResultId: 456,
              templateSnapshot: {
                variableFormat: '请创作一张[沙发]图片。\n风格方向：现代简约。',
                jsonFormat: {
                  subject: '[沙发]',
                  style: '现代简约',
                  composition: '中心构图',
                  colors: '米白灰',
                  lighting: '自然侧光',
                  additional: '',
                },
              },
              analysisResult: null,
            },
          }),
        } as Response;
      }

      if (url.includes('/api/analysis')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { analysisId: 123, status: 'processing' },
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

  it('should prefill content from historyId query param by fetching history detail', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        historyId: '123',
      })
    );

    render(<AnalysisPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/history/123');
      const content = screen.getByTestId('right-template-content');
      expect(content.textContent).toContain('请创作一张[沙发]图片。');
      expect(content.textContent).toContain('风格方向：现代简约。');
    });
  });

  it('should auto-start analysis after upload success', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(<AnalysisPage />);
    fireEvent.click(screen.getByTestId('left-column'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: 'uploaded-image-1',
          modelId: undefined,
        }),
      });
    });
  });
});
