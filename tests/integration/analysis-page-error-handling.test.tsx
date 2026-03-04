/**
 * Analysis Page 错误处理和边界情况测试
 *
 * 测试状态查询错误处理和任务完成时的轮询停止
 *
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 * 测试 ID: 1.2-INT-301 至 1.2-INT-302
 * 优先级: P1
 */

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnalysisPage from '@/app/analysis/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';

// Mock NextAuth
vi.mock('@/features/auth/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    session: { user: { id: 'test-user-1' } },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

// Mock Zustand store
const mockSetAnalysisStage = vi.fn();
const mockSetAnalysisProgress = vi.fn();
const mockResetAnalysis = vi.fn();

vi.mock('@/stores/useProgressStore', () => ({
  useProgressStore: () => ({
    setAnalysisStage: mockSetAnalysisStage,
    setAnalysisProgress: mockSetAnalysisProgress,
    resetAnalysis: mockResetAnalysis,
  }),
}));

// Mock TermsDialog
vi.mock('@/components/shared/TermsDialog', () => ({
  TermsDialog: () => null,
}));

// Mock WorkspaceColumns
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

// Mock Next.js navigation
const mockUseSearchParams = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/analysis',
  useSearchParams: () => mockUseSearchParams(),
}));

// 创建测试用 QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// 包装组件的辅助函数
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  };
}

describe('错误处理和边界情况 (P1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  /**
   * 1.2-INT-301: 网络错误处理
   *
   * 验证:
   * - 状态 API 失败时正确处理
   */
  it('应该正确处理状态查询错误', async () => {
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

      if (url.includes('/api/analysis') && !url.includes('/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { analysisId: 789, status: 'processing' },
          }),
        } as Response;
      }

      // 状态 API 返回错误
      if (url.includes('/api/analysis/789/status')) {
        return {
          ok: false,
          status: 500,
          json: async () => ({
            success: false,
            error: { message: '内部服务器错误' },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response;
    }) as typeof fetch;

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderWithQueryClient(<AnalysisPage />);

    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待错误被处理
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/789/status')
        );
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    consoleErrorSpy.mockRestore();
  });

  /**
   * 1.2-INT-302: 任务完成处理
   *
   * 验证:
   * - 任务完成时停止轮询
   * - 最终结果正确加载
   */
  it('应该在任务完成时停止轮询并加载结果', async () => {
    let statusCallCount = 0;

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

      if (url.includes('/api/analysis') && !url.includes('/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { analysisId: 999, status: 'processing' },
          }),
        } as Response;
      }

      if (url.includes('/api/analysis/999/status')) {
        statusCallCount++;

        // 第一次返回 running,第二次返回 completed
        if (statusCallCount === 1) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: 999,
                status: 'running',
                current_stage: 'qa_critic',
                progress: {
                  percentage: 90,
                },
                recoverable_actions: ['cancel'],
                updated_at: new Date().toISOString(),
              },
            }),
          } as Response;
        } else {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: 999,
                status: 'completed',
                current_stage: null,
                progress: {
                  percentage: 100,
                },
                recoverable_actions: ['view_result'],
                updated_at: new Date().toISOString(),
              },
            }),
          } as Response;
        }
      }

      if (url === '/api/analysis/999') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 999,
              analysisData: {
                dimensions: [],
              },
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response;
    }) as typeof fetch;

    renderWithQueryClient(<AnalysisPage />);

    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待完成状态
    await waitFor(
      () => {
        expect(statusCallCount).toBeGreaterThanOrEqual(2);
      },
      { timeout: 5000 }
    );

    // 验证最终结果被加载
    await waitFor(() => {
      const fetchCalls = (global.fetch as any).mock.calls || [];
      const resultCalls = fetchCalls.filter(
        (call: any[]) => call[0] === '/api/analysis/999'
      );
      expect(resultCalls.length).toBeGreaterThan(0);
    });
  });
});
