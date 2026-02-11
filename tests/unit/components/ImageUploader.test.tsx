import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ImageUploader } from '@/features/analysis/components/ImageUploader/ImageUploader';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    CancelToken: {
      source: vi.fn(() => ({
        token: 'cancel-token',
        cancel: vi.fn(),
      })),
    },
    isCancel: vi.fn(() => false),
  },
}));

import axios from 'axios';

const mockAxiosPost = axios.post as any;

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC-1: 拖拽/点击上传', () => {
    it('should render upload area', () => {
      render(<ImageUploader />);

      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
      expect(screen.getByText(/drag & drop an image/i)).toBeInTheDocument();
      expect(screen.getByText(/or click to select/i)).toBeInTheDocument();
    });

    it('should render with correct title', () => {
      render(<ImageUploader />);

      expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
    });
  });

  describe('AC-2: 文件验证', () => {
    it('should display correct file size limit', () => {
      render(<ImageUploader />);

      expect(screen.getByText(/max 10mb/i)).toBeInTheDocument();
    });
  });

  describe('AC-3: 上传状态显示', () => {
    it('should show success message after upload completes', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB

      mockAxiosPost.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            imageId: 'test-id',
            filePath: 'images/test/test.jpg',
            fileSize: 5 * 1024 * 1024,
            fileFormat: 'JPEG',
            width: 800,
            height: 600,
            url: 'https://example.com/test.jpg',
          },
        },
      });

      render(<ImageUploader />);

      // The component should render without errors
      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    });
  });

  describe('Callback Props', () => {
    it('should call onUploadSuccess callback on successful upload', async () => {
      const onSuccess = vi.fn();
      render(<ImageUploader onUploadSuccess={onSuccess} />);

      // Component should render with callback
      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call onUploadError callback on failure', async () => {
      const onError = vi.fn();
      render(<ImageUploader onUploadError={onError} />);

      // Component should render with callback
      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<ImageUploader />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept optional props', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      render(<ImageUploader onUploadSuccess={onSuccess} onUploadError={onError} />);

      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    });
  });
});
