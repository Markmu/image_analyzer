/**
 * BatchUploader 组件基本测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BatchUploader } from '../BatchUploader';

// Mock axios for upload requests
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    CancelToken: {
      source: vi.fn(() => ({
        token: {} as unknown as import('axios').CancelToken,
        cancel: vi.fn(),
      })),
    },
    isCancel: vi.fn(() => false),
  },
}));

// Mock p-limit for concurrency control
vi.mock('p-limit', () => ({
  default: vi.fn((_concurrency: number) => {
    return (fn: () => Promise<any>) => fn();
  }),
}));

import axios from 'axios';

const mockAxiosPost = axios.post as any;

// Helper function to create mock files
function createMockFile(name: string, type: string, size: number = 1024 * 1024): File {
  const content = 'x'.repeat(size);
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('BatchUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正常渲染批量上传区域', () => {
      render(<BatchUploader />);
      expect(screen.getByTestId('batch-drop-zone')).toBeInTheDocument();
    });

    it('应该显示拖拽提示文字', () => {
      render(<BatchUploader />);
      expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument();
    });

    it('应该显示最大上传数量提示', () => {
      render(<BatchUploader />);
      expect(screen.getByText(/Max/i)).toBeInTheDocument();
    });
  });

  describe('回调属性测试', () => {
    it('应该接受onBatchUploadSuccess回调属性', () => {
      const onSuccess = vi.fn();
      render(<BatchUploader onBatchUploadSuccess={onSuccess} />);
      expect(screen.getByTestId('batch-drop-zone')).toBeInTheDocument();
    });

    it('应该接受onBatchUploadError回调属性', () => {
      const onError = vi.fn();
      render(<BatchUploader onBatchUploadError={onError} />);
      expect(screen.getByTestId('batch-drop-zone')).toBeInTheDocument();
    });

    it('应该接受onBatchUploadCancel回调属性', () => {
      const onCancel = vi.fn();
      render(<BatchUploader onBatchUploadCancel={onCancel} />);
      expect(screen.getByTestId('batch-drop-zone')).toBeInTheDocument();
    });

    it('应该接受onProgress回调属性', () => {
      const onProgress = vi.fn();
      render(<BatchUploader onProgress={onProgress} />);
      expect(screen.getByTestId('batch-drop-zone')).toBeInTheDocument();
    });
  });

  describe('组件状态', () => {
    it('应该正常渲染组件容器', () => {
      const { container } = render(<BatchUploader />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('应该包含上传输入框', () => {
      render(<BatchUploader />);
      expect(screen.getByTestId('batch-file-input')).toBeInTheDocument();
    });
  });
});
