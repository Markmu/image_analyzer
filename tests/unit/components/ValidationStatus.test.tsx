/**
 * Unit Tests - ValidationStatus Component
 *
 * Testing validation status display component functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationStatus } from '@/features/analysis/components/ValidationStatus';
import type { ValidationResult } from '@/lib/utils/image-validation';

describe('ValidationStatus Component', () => {
  describe('Rendering', () => {
    it('should render null when result is null', () => {
      const { container } = render(<ValidationStatus result={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render success status when valid with no warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      render(<ValidationStatus result={result} />);

      expect(screen.getByTestId('validation-status')).toBeInTheDocument();
      expect(screen.getByText('图片验证通过')).toBeInTheDocument();
      expect(screen.getByText(/图片符合所有要求/)).toBeInTheDocument();
    });

    it('should render error status when validation fails', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'INVALID_FORMAT',
            message: '仅支持 JPEG、PNG、WebP 格式',
            details: { receivedFormat: 'image/gif' },
          },
        ],
        warnings: [],
      };

      render(<ValidationStatus result={result} />);

      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      expect(screen.getByText('图片验证失败')).toBeInTheDocument();
      expect(screen.getByText('仅支持 JPEG、PNG、WebP 格式')).toBeInTheDocument();
    });

    it('should render warning status when validation passes with warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '这张图片可能包含多个主体或复杂场景',
            suggestion: '建议使用单主体、风格明显的图片以获得更好的分析效果',
            confidence: 0.6,
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onContinueAnyway={vi.fn()}
          onChangeImage={vi.fn()}
        />
      );

      expect(screen.getByTestId('validation-warning')).toBeInTheDocument();
      expect(screen.getByText('这张图片可能不适合分析')).toBeInTheDocument();
      expect(screen.getByText(/多个主体/)).toBeInTheDocument();
    });

    it('should render multiple errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'INVALID_FORMAT',
            message: '格式不支持',
          },
          {
            code: 'FILE_TOO_LARGE',
            message: '文件过大',
          },
        ],
        warnings: [],
      };

      render(<ValidationStatus result={result} />);

      expect(screen.getByText('格式不支持')).toBeInTheDocument();
      expect(screen.getByText('文件过大')).toBeInTheDocument();
    });

    it('should render multiple warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
          {
            code: 'LOW_CONFIDENCE',
            message: '置信度低',
            suggestion: '建议重试',
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onContinueAnyway={vi.fn()}
          onChangeImage={vi.fn()}
        />
      );

      expect(screen.getByText('场景复杂')).toBeInTheDocument();
      expect(screen.getByText('置信度低')).toBeInTheDocument();
    });
  });

  describe('Error Details Display', () => {
    it('should display error details on desktop', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'FILE_TOO_LARGE',
            message: '文件过大',
            details: {
              fileSize: 15000000,
              maxSize: 10485760,
            },
          },
        ],
        warnings: [],
      };

      render(<ValidationStatus result={result} isMobile={false} />);

      expect(screen.getByTestId('error-details')).toBeInTheDocument();
      expect(screen.getByText(/fileSize/)).toBeInTheDocument();
      expect(screen.getByText(/15000000/)).toBeInTheDocument();
    });

    it('should hide error details behind button on mobile', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'FILE_TOO_LARGE',
            message: '文件过大',
            details: { fileSize: 15000000 },
          },
        ],
        warnings: [],
      };

      render(<ValidationStatus result={result} isMobile={true} />);

      expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-details-btn')).toBeInTheDocument();
    });

    it('should show error details when button clicked on mobile', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'FILE_TOO_LARGE',
            message: '文件过大',
            details: { fileSize: 15000000 },
          },
        ],
        warnings: [],
      };

      render(<ValidationStatus result={result} isMobile={true} />);

      const button = screen.getByTestId('view-details-btn');
      fireEvent.click(button);

      expect(screen.getByTestId('error-details')).toBeInTheDocument();
    });

    it('should hide error details when button clicked again', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'FILE_TOO_LARGE',
            message: '文件过大',
            details: { fileSize: 15000000 },
          },
        ],
        warnings: [],
      };

      render(<ValidationStatus result={result} isMobile={true} />);

      const button = screen.getByTestId('view-details-btn');
      fireEvent.click(button);
      fireEvent.click(button);

      expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
    });
  });

  describe('Warning Actions', () => {
    it('should call onContinueAnyway when continue button clicked', () => {
      const onContinueAnyway = vi.fn();
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onContinueAnyway={onContinueAnyway}
        />
      );

      const button = screen.getByTestId('continue-anyway-btn');
      fireEvent.click(button);

      expect(onContinueAnyway).toHaveBeenCalledTimes(1);
    });

    it('should call onChangeImage when change button clicked', () => {
      const onChangeImage = vi.fn();
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onChangeImage={onChangeImage}
        />
      );

      const button = screen.getByTestId('change-image-btn');
      fireEvent.click(button);

      expect(onChangeImage).toHaveBeenCalledTimes(1);
    });

    it('should not render continue button when onContinueAnyway not provided', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onChangeImage={vi.fn()}
        />
      );

      expect(screen.queryByTestId('continue-anyway-btn')).not.toBeInTheDocument();
    });

    it('should not render change button when onChangeImage not provided', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onContinueAnyway={vi.fn()}
        />
      );

      expect(screen.queryByTestId('change-image-btn')).not.toBeInTheDocument();
    });

    it('should display both action buttons on mobile', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
        ],
      };

      render(
        <ValidationStatus
          result={result}
          onContinueAnyway={vi.fn()}
          onChangeImage={vi.fn()}
          isMobile={true}
        />
      );

      expect(screen.getByTestId('continue-anyway-btn')).toBeInTheDocument();
      expect(screen.getByTestId('change-image-btn')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render correctly on mobile', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'COMPLEX_SCENE',
            message: '场景复杂',
            suggestion: '建议简化',
          },
        ],
      };

      const { container } = render(
        <ValidationStatus
          result={result}
          onContinueAnyway={vi.fn()}
          onChangeImage={vi.fn()}
          isMobile={true}
        />
      );

      expect(screen.getByTestId('validation-warning')).toBeInTheDocument();
      // Check that buttons are rendered with mobile styles
      const continueBtn = screen.getByTestId('continue-anyway-btn');
      const changeBtn = screen.getByTestId('change-image-btn');

      expect(continueBtn).toHaveStyle({ minWidth: '100%' });
      expect(changeBtn).toHaveStyle({ minWidth: '100%' });
    });
  });
});
