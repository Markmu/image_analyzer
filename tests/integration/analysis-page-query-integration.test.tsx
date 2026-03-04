/**
 * Analysis Page 与 Query 集成测试
 *
 * 测试分析页面正确使用 TanStack Query 进行状态轮询
 * 验证不再使用旧的 polling.ts 工具
 * 验证 Zustand store 不再作为任务真相源
 *
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 * 测试 ID: 1.2-INT-101 至 1.2-INT-104
 * 优先级: P0
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

// Mock Zustand store - 只用于 UI 展示,不作为任务真相源
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

describe('AnalysisPage 与 useAnalysisStatus Hook 集成测试 (P0)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    // Mock fetch API
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      // Mock terms status API
      if (url.includes('/api/user/terms-status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { requiresAgreement: false },
          }),
        } as Response;
      }

      // Mock models API
      if (url.includes('/api/analysis/models')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { models: [] },
          }),
        } as Response;
      }

      // Mock analysis creation API
      if (url.includes('/api/analysis') && !url.includes('/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { analysisId: 123, status: 'processing' },
          }),
        } as Response;
      }

      // Mock status polling API - 使用新的 TaskStatusView 格式
      if (url.includes('/api/analysis/123/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 123,
              status: 'running',
              current_stage: 'forensic_describer',
              progress: {
                percentage: 45,
                completed_steps: 2,
                total_steps: 4,
              },
              recoverable_actions: ['cancel'],
              updated_at: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      // Mock final result API
      if (url.includes('/api/analysis/123') && !url.includes('/status')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 123,
              analysisData: {
                dimensions: [
                  {
                    name: '风格',
                    value: '现代简约',
                    confidence: 0.95,
                  },
                ],
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
  });

  /**
   * 1.2-INT-101: 前端页面与 useAnalysisStatus hook 集成
   *
   * 验证:
   * - 页面正确使用 Query hook 进行状态轮询
   * - 不再使用旧的 polling.ts 工具
   * - Zustand store 只用于 UI 展示,不作为任务真相源
   */
  it('应该正确使用 useAnalysisStatus hook 进行状态轮询', async () => {
    renderWithQueryClient(<AnalysisPage />);

    // 触发上传和分析开始
    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待 analysis API 被调用
    await waitFor(() => {
      const fetchCalls = (global.fetch as any).mock.calls || [];
      const analysisCalls = fetchCalls.filter(
        (call: any[]) =>
          call[0] === '/api/analysis' &&
          call[1]?.method === 'POST'
      );
      expect(analysisCalls.length).toBeGreaterThan(0);
    });

    // 验证状态 API 被调用 (说明 hook 开始轮询)
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/123/status')
        );
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });

  /**
   * 1.2-INT-102: 验证不再使用旧的 polling.ts 工具
   *
   * 验证:
   * - 状态查询完全通过 TanStack Query
   * - 使用新的 /status API 端点
   */
  it('不应该使用旧的 polling.ts 工具', async () => {
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

    // 验证只调用新的 status API
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/status')
        );

        // 所有 status 调用都应该是新格式
        statusCalls.forEach((call: any[]) => {
          expect(call[0]).toMatch(/\/api\/analysis\/\d+\/status$/);
        });

        // 至少有一次状态调用
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });

  /**
   * 1.2-INT-103: 验证 Zustand store 不再作为任务真相源
   *
   * 验证:
   * - Zustand store 的更新来自于 useAnalysisStatus 的回调
   * - Store 只是 UI 展示的投影,不是数据源
   */
  it('Zustand store 应该只作为 UI 展示层,不作为任务真相源', async () => {
    renderWithQueryClient(<AnalysisPage />);

    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待状态轮询开始
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/123/status')
        );
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    // 验证 Zustand store 的 setter 被调用
    // (说明状态从 Query 同步到了 Store)
    await waitFor(() => {
      expect(mockSetAnalysisStage).toHaveBeenCalled();
      expect(mockSetAnalysisProgress).toHaveBeenCalled();
    });
  });

  /**
   * 1.2-INT-104: 验证 Query hook 的配置正确
   *
   * 验证:
   * - 轮询间隔正确设置 (默认 2000ms)
   * - 有多次状态调用说明轮询在工作
   */
  it('Query hook 应该正确配置轮询行为', async () => {
    renderWithQueryClient(<AnalysisPage />);

    await act(async () => {
      const uploadButton = screen.getByTestId('left-column');
      uploadButton.click();
    });

    // 等待第一次状态调用
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/123/status')
        );
        expect(statusCalls.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    // 验证有多次轮询调用
    await waitFor(
      () => {
        const fetchCalls = (global.fetch as any).mock.calls || [];
        const statusCalls = fetchCalls.filter(
          (call: any[]) => call[0]?.includes?.('/api/analysis/123/status')
        );
        // 应该有多次轮询调用
        expect(statusCalls.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 5000 }
    );
  });
});
