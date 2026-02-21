/**
 * TemplateCard Component Tests
 *
 * Epic 7 - Story 7.2: Template Library
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCard } from './TemplateCard';
import type { SavedTemplate } from '../../types/library';

const mockTemplate: SavedTemplate = {
  id: 1,
  userId: 'user-123',
  analysisResultId: 456,
  title: '测试模版',
  description: '这是一个测试模版描述',
  templateSnapshot: {
    analysisData: {
      imageUrl: 'https://example.com/image.jpg',
    },
    confidenceScore: 0.95,
    modelId: 'qwen3.5-plus',
    createdAt: new Date('2026-02-20'),
  },
  isFavorite: false,
  usageCount: 10,
  tags: ['风景', '自然'],
  categories: [
    { parent: '摄影', child: '风景' },
  ],
  createdAt: new Date('2026-02-20'),
  updatedAt: new Date('2026-02-20'),
};

describe('TemplateCard', () => {
  const mockHandlers = {
    onViewDetail: vi.fn(),
    onRegenerate: vi.fn(),
    onDelete: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render template card with all information', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      expect(screen.getByTestId('template-card')).toBeInTheDocument();
      expect(screen.getByTestId('template-title')).toHaveTextContent('测试模版');
      expect(screen.getByTestId('template-description')).toHaveTextContent('这是一个测试模版描述');
    });

    it('should render favorite badge when template is favorite', () => {
      const favoriteTemplate = { ...mockTemplate, isFavorite: true };
      render(<TemplateCard template={favoriteTemplate} {...mockHandlers} />);

      expect(screen.getByTestId('favorite-badge')).toBeInTheDocument();
    });

    it('should render tags', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      expect(screen.getByTestId('template-tags')).toBeInTheDocument();
      expect(screen.getByText('风景')).toBeInTheDocument();
      expect(screen.getByText('自然')).toBeInTheDocument();
    });

    it('should render usage count', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      expect(screen.getByTestId('template-usage-count')).toBeInTheDocument();
      expect(screen.getByText('10 次使用')).toBeInTheDocument();
    });

    it('should render preview image when available', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      const preview = screen.getByTestId('template-preview');
      expect(preview).toHaveStyle({
        backgroundImage: 'url(https://example.com/image.jpg)',
      });
    });

    it('should render placeholder when no preview image', () => {
      const templateWithoutImage = {
        ...mockTemplate,
        templateSnapshot: {
          ...mockTemplate.templateSnapshot,
          analysisData: {},
        },
      };

      render(<TemplateCard template={templateWithoutImage} {...mockHandlers} />);

      expect(screen.getByText('暂无预览图')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onViewDetail when view button is clicked', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      fireEvent.click(screen.getByTestId('template-view-detail'));
      expect(mockHandlers.onViewDetail).toHaveBeenCalledWith(1);
    });

    it('should call onRegenerate when regenerate button is clicked', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      fireEvent.click(screen.getByTestId('template-regenerate'));
      expect(mockHandlers.onRegenerate).toHaveBeenCalledWith(1);
    });

    it('should call onToggleFavorite when favorite button is clicked', () => {
      render(<TemplateCard template={mockTemplate} {...mockHandlers} />);

      fireEvent.click(screen.getByTestId('template-toggle-favorite'));
      expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith(1);
    });

    it('should render favorite icon filled when template is favorite', () => {
      const favoriteTemplate = { ...mockTemplate, isFavorite: true };
      render(<TemplateCard template={favoriteTemplate} {...mockHandlers} />);

      const favoriteButton = screen.getByTestId('template-toggle-favorite');
      expect(favoriteButton.querySelector('[class*="text-yellow-500"]')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const templateWithoutTitle = { ...mockTemplate, title: null };
      render(<TemplateCard template={templateWithoutTitle} {...mockHandlers} />);

      expect(screen.getByTestId('template-title')).toHaveTextContent('未命名模版');
    });

    it('should handle empty description', () => {
      const templateWithoutDescription = { ...mockTemplate, description: null };
      render(<TemplateCard template={templateWithoutDescription} {...mockHandlers} />);

      expect(screen.getByTestId('template-description')).toHaveTextContent('暂无描述');
    });

    it('should handle more than 3 tags', () => {
      const templateWithManyTags = {
        ...mockTemplate,
        tags: ['标签1', '标签2', '标签3', '标签4', '标签5'],
      };
      render(<TemplateCard template={templateWithManyTags} {...mockHandlers} />);

      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });
});
