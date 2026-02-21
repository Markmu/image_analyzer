/**
 * 模版卡片组件
 * Epic 7 - Story 7.2: Template Library
 *
 * 显示单个模版卡片，包含预览图、标题、描述、标签、操作按钮
 */

'use client';

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Eye,
  Trash2,
  RefreshCw,
  Star,
  StarOff,
  MoreVertical,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { SavedTemplate } from '../../types/library';

interface TemplateCardProps {
  template: SavedTemplate;
  onViewDetail: (id: number) => void;
  onRegenerate: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export function TemplateCard({
  template,
  onViewDetail,
  onRegenerate,
  onDelete,
  onToggleFavorite,
}: TemplateCardProps) {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(template.id);
  };

  // 获取预览图URL（从快照数据中提取）
  const previewImageUrl = template.templateSnapshot.analysisData?.imageUrl;

  return (
    <Card
      className="ia-glass-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
      }}
      data-testid="template-card"
    >
      {/* 预览图 */}
      <CardMedia
        component="div"
        sx={{
          height: 180,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: previewImageUrl
            ? `url(${previewImageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
        data-testid="template-preview"
      >
        {!previewImageUrl && (
          <Box
            sx={{
              color: 'var(--glass-text-gray-medium)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Eye size={48} opacity={0.5} />
            <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-medium)' }}>
              暂无预览图
            </Typography>
          </Box>
        )}

        {/* 收藏标记 */}
        {template.isFavorite && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(234, 179, 8, 0.9)',
              borderRadius: '50%',
              padding: 0.5,
              data: {
                testid: 'favorite-badge',
              },
            }}
          >
            <Star size={16} fill="white" color="white" />
          </Box>
        )}
      </CardMedia>

      <CardContent sx={{ flexGrow: 1, padding: 2 }}>
        {/* 标题 */}
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: 'var(--glass-text-white-heavy)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          data-testid="template-title"
        >
          {template.title || '未命名模版'}
        </Typography>

        {/* 描述 */}
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
            minHeight: 40,
            color: 'var(--glass-text-gray-medium)',
          }}
          data-testid="template-description"
        >
          {template.description || '暂无描述'}
        </Typography>

        {/* 标签 */}
        {template.tags && template.tags.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              mb: 1.5,
            }}
            data-testid="template-tags"
          >
            {template.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: 'var(--glass-text-white-medium)',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            ))}
            {template.tags.length > 3 && (
              <Chip
                label={`+${template.tags.length - 3}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(148, 163, 184, 0.2)',
                  color: 'var(--glass-text-gray-medium)',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
          </Box>
        )}

        {/* 分类 */}
        {template.categories && template.categories.length > 0 && (
          <Box sx={{ mb: 1.5 }} data-testid="template-categories">
            {template.categories.map((category, index) => (
              <Chip
                key={index}
                label={category.child ? `${category.parent} / ${category.child}` : category.parent}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  color: 'var(--glass-text-blue-light)',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            ))}
          </Box>
        )}

        {/* 统计信息 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 'auto',
          }}
        >
          {/* 使用次数 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
            data-testid="template-usage-count"
          >
            <TrendingUp size={14} sx={{ color: 'var(--glass-text-gray-heavy)' }} />
            <Typography
              variant="caption"
              sx={{ color: 'var(--glass-text-gray-medium)' }}
            >
              {template.usageCount} 次使用
            </Typography>
          </Box>

          {/* 创建时间 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
            data-testid="template-created-at"
          >
            <Calendar size={14} sx={{ color: 'var(--glass-text-gray-heavy)' }} />
            <Typography
              variant="caption"
              sx={{ color: 'var(--glass-text-gray-medium)' }}
            >
              {formatDistanceToNow(new Date(template.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* 操作按钮 */}
      <CardActions sx={{ justifyContent: 'flex-end', padding: 1, gap: 0.5 }}>
        <Tooltip title={template.isFavorite ? '取消收藏' : '收藏'}>
          <IconButton
            size="small"
            onClick={() => onToggleFavorite(template.id)}
            data-testid="template-toggle-favorite"
          >
            {template.isFavorite ? (
              <Star size={18} className="text-yellow-500" fill="currentColor" />
            ) : (
              <StarOff size={18} sx={{ color: 'var(--glass-text-gray-medium)' }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="查看详情">
          <IconButton
            size="small"
            onClick={() => onViewDetail(template.id)}
            data-testid="template-view-detail"
          >
            <Eye size={18} sx={{ color: 'var(--glass-text-white-medium)' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="重新生成">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onRegenerate(template.id)}
            data-testid="template-regenerate"
          >
            <RefreshCw size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="更多操作">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            data-testid="template-more-menu"
          >
            <MoreVertical size={18} sx={{ color: 'var(--glass-text-gray-medium)' }} />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: 'var(--glass-bg-dark-heavy)',
              border: '1px solid var(--glass-border-white-light)',
              borderRadius: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => onViewDetail(template.id)}
            sx={{
              color: 'var(--glass-text-white-medium)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            查看详情
          </MenuItem>
          <MenuItem
            onClick={() => onRegenerate(template.id)}
            sx={{
              color: 'var(--glass-text-white-medium)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            重新生成
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: '#ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
            data-testid="template-delete-menu"
          >
            删除
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}
