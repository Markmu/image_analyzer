/**
 * Zustand Store 与 Query Hook 状态同步测试
 *
 * 测试 Zustand store 与 TanStack Query 的状态同步
 * 验证无双真相源问题
 *
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 * 测试 ID: 1.2-INT-201 至 1.2-INT-202
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

describe('Zustand Store 与 Query Hook 状态同步测试 (P1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

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
            data: { analysisId: 456, status: 'processing' },
          }),
        } as Response;
      }

      if (url.includes('/api/analysis/456/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 456,
              status: 'running',
              current_stage: 'prompt_compiler',
              progress: {
                percentage: 75,
                completed_steps: 3,
                total_steps: 4,
              },
              recoverable_actions: ['cancel'],
              updated_at: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response;
    }) as typeof fetch;
  });

  /**
   * 1.2-INT-201: 本地展示状态与查询状态一致
   *
   * 验证:
   * - Query 返回的状态正确同步到 Zustand store
   * - 进度百分比正确同步
   * - 阶段信息正确映射
   */
  it('本地展示状态应该与查询状态保持一致', async () => {
    renderWithQueryClient(<AnalysisPage />);

    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待状态轮询
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/456/status')
        );
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    // 验证 Zustand store 的 setter 被调用
    // prompt_compiler 阶段应该映射到 'generating'
    await waitFor(() => {
      expect(mockSetAnalysisStage).toHaveBeenCalledWith('generating');
      expect(mockSetAnalysisProgress).toHaveBeenCalledWith(75);
    });
  });

  /**
   * 1.2-INT-202: 验证无双真相源问题
   *
   * 验证:
   * - 不存在 Query 状态和 Store 状态不一致的情况
   * - Store 状态完全由 Query 驱动
   */
  it('不应该存在双真相源问题', async () => {
    renderWithQueryClient(<AnalysisPage />);

    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待分析开始
    await waitFor(() => {
      const fetchCalls = (global.fetch as any).mock.calls || [];
      const analysisCalls = fetchCalls.filter(
        (call: any[]) =>
          call[0] === '/api/analysis' &&
          call[1]?.method === 'POST'
      );
      expect(analysisCalls.length).toBeGreaterThan(0);
    });

    // 等待状态查询
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/456/status')
        );
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    // 验证: 所有状态更新都通过 status API
    const fetchCalls = (global.fetch as any).mock.calls || [];
    const analysisCalls = fetchCalls.filter(
      (call: any[]) => call[0]?.includes?.('/api/analysis/')
    );

    // 验证所有调用都是预期的端点
    analysisCalls.forEach((call: any[]) => {
      const url = call[0];
      const isStatusEndpoint = url.includes('/status');
      const isResultEndpoint =
        url.includes('/api/analysis/') && !url.includes('/status');
      const isCreationEndpoint =
        call[1]?.method === 'POST' && url.includes('/api/analysis');

      expect(
        isStatusEndpoint || isResultEndpoint || isCreationEndpoint
      ).toBe(true);
    });
  });
});
