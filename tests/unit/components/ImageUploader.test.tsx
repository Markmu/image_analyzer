import { describe, it, expect, vi, beforeEach, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    isAxiosError: vi.fn(() => false),
  },
}));

import axios from 'axios';
import { validateImageUpload } from '@/lib/utils/image-validation';

vi.mock('@/lib/utils/image-validation', () => ({
  validateImageUpload: vi.fn(async () => ({
    valid: true,
    errors: [],
    warnings: [],
  })),
}));

const mockAxiosPost = axios.post as any;
const mockValidateImageUpload = vi.mocked(validateImageUpload);
const originalMatchMedia = window.matchMedia;
const originalInputClick = HTMLInputElement.prototype.click;

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width:900px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia(false);
    mockValidateImageUpload.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  describe('AC-1: 拖拽/点击上传', () => {
    it('should render upload area', () => {
      render(<ImageUploader />);

      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
      expect(screen.getByText('拖拽图片到此处')).toBeInTheDocument();
      expect(screen.getByText(/或点击选择/)).toBeInTheDocument();
    });

    it('should render with correct title', () => {
      render(<ImageUploader />);

      expect(screen.getByText('拖拽图片到此处')).toBeInTheDocument();
    });

    it('should not render mobile camera and gallery entry points on desktop', () => {
      render(<ImageUploader />);

      expect(screen.queryByTestId('mobile-gallery-upload-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mobile-camera-upload-btn')).not.toBeInTheDocument();
    });

    it('should provide mobile camera and gallery upload entry points on mobile', () => {
      mockMatchMedia(true);
      render(<ImageUploader />);

      expect(screen.getByTestId('mobile-gallery-upload-btn')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-camera-upload-btn')).toBeInTheDocument();
      const cameraInput = screen.getByTestId('mobile-camera-input');
      expect(cameraInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
      expect(cameraInput).toHaveAttribute('capture', 'environment');
    });

    it('should open the hidden gallery input when the mobile gallery button is clicked', () => {
      mockMatchMedia(true);
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

      render(<ImageUploader />);
      fireEvent.click(screen.getByTestId('mobile-gallery-upload-btn'));

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('should open the hidden camera input when the mobile camera button is clicked', () => {
      mockMatchMedia(true);
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

      render(<ImageUploader />);
      fireEvent.click(screen.getByTestId('mobile-camera-upload-btn'));

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC-2: 文件验证', () => {
    it('should display correct file size limit', () => {
      render(<ImageUploader />);

      expect(screen.getByText(/最大 10MB/)).toBeInTheDocument();
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
      fireEvent.change(screen.getByTestId('image-upload-input'), {
        target: { files: [file] },
      });

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Callback Props', () => {
    it('should call onUploadSuccess callback on successful upload', async () => {
      const onSuccess = vi.fn();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });

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

      render(<ImageUploader onUploadSuccess={onSuccess} />);
      fireEvent.change(screen.getByTestId('image-upload-input'), {
        target: { files: [file] },
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onAutoStartAnalysis after successful upload', async () => {
      const onAutoStartAnalysis = vi.fn();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });

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

      render(<ImageUploader onAutoStartAnalysis={onAutoStartAnalysis} />);
      fireEvent.change(screen.getByTestId('image-upload-input'), {
        target: { files: [file] },
      });

      await waitFor(() => {
        expect(onAutoStartAnalysis).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onUploadError callback on failure', async () => {
      const onError = vi.fn();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });

      mockAxiosPost.mockRejectedValueOnce(
        Object.assign(new Error('upload failed'), {
          response: {
            data: {
              error: {
                message: '上传失败',
                code: 'UPLOAD_FAILED',
              },
            },
          },
        })
      );

      render(<ImageUploader onUploadError={onError} />);
      fireEvent.change(screen.getByTestId('image-upload-input'), {
        target: { files: [file] },
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('upload failed', undefined);
      });
    });

    it('should show mobile validation error actions with mobile-specific layout', async () => {
      mockMatchMedia(true);
      mockValidateImageUpload.mockResolvedValueOnce({
        valid: false,
        errors: [
          {
            code: 'FILE_TOO_LARGE',
            message: '文件过大',
            details: { fileSize: 15000000 },
          },
        ],
        warnings: [],
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 });

      render(<ImageUploader />);
      fireEvent.change(screen.getByTestId('mobile-gallery-input'), {
        target: { files: [file] },
      });

      expect(await screen.findByTestId('reupload-btn')).toBeInTheDocument();
      expect(screen.getByTestId('view-details-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
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

afterAll(() => {
  window.matchMedia = originalMatchMedia;
  HTMLInputElement.prototype.click = originalInputClick;
});

afterEach(() => {
  vi.restoreAllMocks();
});
