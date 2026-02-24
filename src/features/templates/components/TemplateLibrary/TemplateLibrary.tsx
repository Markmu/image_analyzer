/**
 * Template Library Component
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * 模版库主组件，包含过滤、列表、分页功能
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  LayoutGrid,
  List,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TemplateCard } from '../TemplateCard';
import { TemplateFilterPanel, FilterState } from '../TemplateFilterPanel';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import type { SavedTemplate } from '../../types/library';
import { TEMPLATE_CONSTANTS } from '../../types/library';

interface TemplateLibraryProps {
  userId: string;
}

export function TemplateLibrary({ userId }: TemplateLibraryProps) {
  const router = useRouter();
  const glassCardSx = {
    background: 'var(--glass-bg-dark)',
    backgroundImage: 'none',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    boxShadow: 'var(--glass-shadow)',
  } as const;
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    templateId: number | null;
    templateTitle: string;
  }>({
    open: false,
    templateId: null,
    templateTitle: '',
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isFavorite: null,
    tags: [],
  });

  // 获取模版列表
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: TEMPLATE_CONSTANTS.DEFAULT_PAGE_SIZE.toString(),
      });

      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      if (filters.isFavorite !== null) {
        params.append('isFavorite', filters.isFavorite.toString());
      }
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const response = await fetch(`/api/templates?${params.toString()}`);

      if (!response.ok) {
        throw new Error('获取模版列表失败');
      }

      const result = await response.json();

      if (result.success) {
        setTemplates(result.data.templates);
        setTotal(result.data.total);
      } else {
        throw new Error(result.error || '获取模版列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取模版列表失败');
    } finally {
      setLoading(false);
    }
  }, [userId, page, filters]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 处理查看详情
  const handleViewDetail = (templateId: number) => {
    router.push(`/library/${templateId}`);
  };

  // 处理删除
  const handleDeleteClick = (templateId: number, templateTitle: string) => {
    setDeleteDialog({
      open: true,
      templateId,
      templateTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.templateId) return;

    try {
      const response = await fetch(`/api/templates/${deleteDialog.templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除模版失败');
      }

      const result = await response.json();

      if (result.success) {
        // 关闭对话框并刷新列表
        setDeleteDialog({
          open: false,
          templateId: null,
          templateTitle: '',
        });
        fetchTemplates();
      } else {
        throw new Error(result.error || '删除模版失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除模版失败');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      templateId: null,
      templateTitle: '',
    });
  };

  // 处理收藏切换
  const handleToggleFavorite = async (templateId: number) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('切换收藏状态失败');
      }

      const result = await response.json();

      if (result.success) {
        // 更新本地状态
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === templateId
              ? { ...template, isFavorite: !template.isFavorite }
              : template
          )
        );
      } else {
        throw new Error(result.error || '切换收藏状态失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换收藏状态失败');
    }
  };

  // 处理分页变化
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // 处理过滤变化
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // 重置到第一页
  };

  // 加载状态
  if (loading && templates.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }} data-testid="template-library">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          gap={2}
        >
          <CircularProgress />
          <Typography sx={{ color: 'var(--glass-text-gray-medium)' }}>
            加载模版库...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="template-library">
      {/* 页面标题 */}
      <Box
        className="ia-glass-card ia-glass-card--static"
        sx={{
          ...glassCardSx,
          p: 4,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ mb: 0.5, fontWeight: 600, color: 'var(--glass-text-white-heavy)' }}
            >
              模版库
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--glass-text-gray-medium)' }}
            >
              管理和重复使用您保存的模版
            </Typography>
          </Box>

          {/* 视图切换 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'flex-start' },
            }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, mode) => mode && setViewMode(mode)}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiToggleButton-root': {
                  color: 'var(--glass-text-gray-medium)',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: 'var(--glass-text-blue-light)',
                  },
                },
              }}
              data-testid="view-mode-toggle"
            >
              <ToggleButton value="grid" aria-label="网格视图">
                <LayoutGrid size={18} />
              </ToggleButton>
              <ToggleButton value="list" aria-label="列表视图">
                <List size={18} />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* 创建新模版按钮 */}
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => router.push('/analysis')}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                },
              }}
              data-testid="create-template-button"
            >
              创建新模版
            </Button>
          </Box>
        </Box>

        <TemplateFilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalResults={total}
          embedded
        />
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
          data-testid="template-error"
        >
          {error}
        </Alert>
      )}

      {/* 模版列表 */}
      {templates.length === 0 ? (
        <Box
          className="ia-glass-card ia-glass-card--lg"
          sx={{
            p: 8,
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            gap: 2,
          }}
          data-testid="empty-templates"
        >
          <Typography
            variant="h6"
            sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 600 }}
          >
            {hasActiveFilters(filters) ? '没有找到匹配的模版' : '模版库为空'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'var(--glass-text-gray-medium)', maxWidth: 400 }}
          >
            {hasActiveFilters(filters)
              ? '尝试调整过滤条件或清除过滤以查看更多模版'
              : '开始分析图片并将模版保存到库中，它们将显示在这里'}
          </Typography>
          {!hasActiveFilters(filters) && (
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => router.push('/analysis')}
              sx={{ mt: 2 }}
            >
              创建第一个模版
            </Button>
          )}
        </Box>
      ) : (
        <>
          {/* 网格视图 */}
          {viewMode === 'grid' ? (
            <Grid container spacing={3} data-testid="templates-grid">
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                  <TemplateCard
                    template={template}
                    onViewDetail={handleViewDetail}
                    onDelete={(id) =>
                      handleDeleteClick(id, template.title || '未命名模版')
                    }
                    onToggleFavorite={handleToggleFavorite}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            /* 列表视图 */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
              data-testid="templates-list"
            >
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onViewDetail={handleViewDetail}
                  onDelete={(id) =>
                    handleDeleteClick(id, template.title || '未命名模版')
                  }
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </Box>
          )}

          {/* 分页 */}
          {total > TEMPLATE_CONSTANTS.DEFAULT_PAGE_SIZE && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
                mb: 2,
              }}
              data-testid="template-pagination"
            >
              <Pagination
                count={Math.ceil(total / TEMPLATE_CONSTANTS.DEFAULT_PAGE_SIZE)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'var(--glass-text-white-medium)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      color: 'var(--glass-text-white-heavy)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        templateTitle={deleteDialog.templateTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  );
}

// 辅助函数：检查是否有活动过滤
function hasActiveFilters(filters: FilterState): boolean {
  return !!(
    filters.search ||
    filters.isFavorite !== null ||
    filters.tags.length > 0
  );
}
