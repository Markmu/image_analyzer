/**
 * 模版列表过滤面板组件
 * Epic 7 - Story 7.2: Template Library
 *
 * 提供搜索、过滤、排序功能
 */

'use client';

import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  IconButton,
  Button,
  Collapse,
  Typography,
} from '@mui/material';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

export interface FilterState {
  search: string;
  sortBy: 'createdAt' | 'usageCount' | 'title';
  sortOrder: 'asc' | 'desc';
  isFavorite: boolean | null;
  tags: string[];
}

interface TemplateFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags?: string[];
  totalResults?: number;
  embedded?: boolean;
}

export function TemplateFilterPanel({
  filters,
  onFiltersChange,
  availableTags = [],
  totalResults,
  embedded = false,
}: TemplateFilterPanelProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const handleSortChange = (field: 'sortBy' | 'sortOrder', value: any) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleFavoriteToggle = () => {
    onFiltersChange({
      ...filters,
      isFavorite: filters.isFavorite === null ? true : filters.isFavorite === true ? false : null,
    });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      onFiltersChange({ ...filters, tags: [...filters.tags, tag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isFavorite: null,
      tags: [],
    });
    setTagInput('');
  };

  const hasActiveFilters =
    filters.search ||
    filters.isFavorite !== null ||
    filters.tags.length > 0 ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc';

  return (
    <Box
      className={embedded ? undefined : 'ia-glass-card'}
      sx={{
        p: embedded ? 0 : 3,
        mb: embedded ? 0 : 3,
      }}
      data-testid="template-filter-panel"
    >
      {/* 搜索栏 */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* 搜索框 */}
        <TextField
          placeholder="搜索模版标题、描述..."
          value={filters.search}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1,
            minWidth: 250,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: 'var(--glass-text-white-medium)',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} sx={{ color: 'var(--glass-text-gray-medium)' }} />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  edge="end"
                >
                  <X size={16} sx={{ color: 'var(--glass-text-gray-medium)' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          data-testid="template-search-input"
        />

        {/* 排序选择 */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={filters.sortBy}
            onChange={(e) => handleSortChange('sortBy', e.target.value)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--glass-text-white-medium)',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--glass-border-white-light)',
              },
            }}
            data-testid="template-sort-by"
          >
            <MenuItem value="createdAt">最新</MenuItem>
            <MenuItem value="usageCount">最常用</MenuItem>
            <MenuItem value="title">标题</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={filters.sortOrder}
            onChange={(e) => handleSortChange('sortOrder', e.target.value)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--glass-text-white-medium)',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--glass-border-white-light)',
              },
            }}
            data-testid="template-sort-order"
          >
            <MenuItem value="desc">降序</MenuItem>
            <MenuItem value="asc">升序</MenuItem>
          </Select>
        </FormControl>

        {/* 收藏过滤 */}
        <Button
          variant={filters.isFavorite === true ? 'contained' : 'outlined'}
          size="small"
          onClick={handleFavoriteToggle}
          startIcon={<Filter size={16} />}
          sx={{
            borderColor:
              filters.isFavorite === null
                ? 'var(--glass-border-white-light)'
                : filters.isFavorite === true
                ? '#fbbf24'
                : 'var(--glass-border-white-light)',
            color:
              filters.isFavorite === true
                ? '#fbbf24'
                : 'var(--glass-text-white-medium)',
          }}
          data-testid="template-favorite-filter"
        >
          {filters.isFavorite === true ? '已收藏' : filters.isFavorite === false ? '未收藏' : '收藏'}
        </Button>

        {/* 展开过滤选项 */}
        <Button
          variant="text"
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          sx={{ color: 'var(--glass-text-gray-medium)' }}
          data-testid="template-expand-filters"
        >
          {expanded ? '收起' : '更多过滤'}
        </Button>

        {/* 清除过滤 */}
        {hasActiveFilters && (
          <Button
            variant="text"
            size="small"
            onClick={handleClearFilters}
            startIcon={<RotateCcw size={16} />}
            sx={{ color: 'var(--glass-text-blue-light)' }}
            data-testid="template-clear-filters"
          >
            清除
          </Button>
        )}

        {/* 结果计数 */}
        {totalResults !== undefined && (
          <Typography
            variant="body2"
            sx={{
              ml: 'auto',
              color: 'var(--glass-text-gray-medium)',
            }}
            data-testid="template-results-count"
          >
            共 {totalResults} 个模版
          </Typography>
        )}
      </Box>

      {/* 扩展过滤选项 */}
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid var(--glass-border-white-light)',
          }}
        >
          {/* 标签过滤 */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                color: 'var(--glass-text-white-medium)',
                fontWeight: 600,
              }}
            >
              标签过滤
            </Typography>

            {/* 已选标签 */}
            {filters.tags.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  mb: 1,
                }}
                data-testid="template-selected-tags"
              >
                {filters.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: 'var(--glass-text-white-medium)',
                    }}
                  />
                ))}
              </Box>
            )}

            {/* 可用标签 */}
            {availableTags.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                }}
                data-testid="template-available-tags"
              >
                {availableTags
                  .filter((tag) => !filters.tags.includes(tag))
                  .slice(0, 10)
                  .map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      onClick={() => handleAddTag(tag)}
                      sx={{
                        borderColor: 'var(--glass-border-white-light)',
                        color: 'var(--glass-text-gray-medium)',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                        },
                      }}
                    />
                  ))}
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
