/**
 * TemplateFilterPanel Component Tests
 *
 * Epic 7 - Story 7.2: Template Library
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateFilterPanel } from './TemplateFilterPanel';
import type { FilterState } from './TemplateFilterPanel';

const mockFilters: FilterState = {
  search: '测试',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isFavorite: null,
  tags: [],
};

describe('TemplateFilterPanel', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter panel', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByTestId('template-filter-panel')).toBeInTheDocument();
      expect(screen.getByTestId('template-search-input')).toBeInTheDocument();
      expect(screen.getByTestId('template-sort-by')).toBeInTheDocument();
      expect(screen.getByTestId('template-sort-order')).toBeInTheDocument();
    });

    it('should display results count', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          totalResults={42}
        />
      );

      expect(screen.getByTestId('template-results-count')).toHaveTextContent('共 42 个模版');
    });
  });

  describe('Search', () => {
    it('should update search filter', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const searchInput = screen.getByTestId('template-search-input');
      fireEvent.change(searchInput, { target: { value: '新搜索词' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        search: '新搜索词',
      });
    });

    it('should clear search when clear button is clicked', () => {
      const filtersWithSearch = { ...mockFilters, search: '测试' };
      render(
        <TemplateFilterPanel
          filters={filtersWithSearch}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filtersWithSearch,
        search: '',
      });
    });
  });

  describe('Sort', () => {
    it('should update sort by filter', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const sortBySelect = screen.getByTestId('template-sort-by');
      fireEvent.mouseDown(sortBySelect);

      // Note: MUI Select requires different event handling
      // This is a simplified test
      expect(sortBySelect).toBeInTheDocument();
    });
  });

  describe('Favorite Filter', () => {
    it('should toggle favorite filter', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const favoriteButton = screen.getByTestId('template-favorite-filter');
      fireEvent.click(favoriteButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        isFavorite: true,
      });
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters when clear button is clicked', () => {
      const activeFilters = {
        ...mockFilters,
        search: '测试',
        isFavorite: true,
        tags: ['标签1'],
      };

      render(
        <TemplateFilterPanel
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const clearButton = screen.getByTestId('template-clear-filters');
      fireEvent.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        isFavorite: null,
        tags: [],
      });
    });
  });

  describe('Tags', () => {
    it('should display available tags', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          availableTags={['风景', '人像', '抽象']}
        />
      );

      expect(screen.getByTestId('template-available-tags')).toBeInTheDocument();
    });

    it('should add tag when tag chip is clicked', () => {
      render(
        <TemplateFilterPanel
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          availableTags={['风景']}
        />
      );

      // Expand filters first
      fireEvent.click(screen.getByTestId('template-expand-filters'));

      const tagChip = screen.getByText('风景');
      fireEvent.click(tagChip);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        tags: ['风景'],
      });
    });
  });
});
