/**
 * 历史记录卡片组件
 * Epic 7: Story 7.1 - 分析历史记录功能
 *
 * 显示单条历史记录，包括缩略图、模版摘要、时间、状态
 */

import { Card, CardMedia, CardContent, CardActions, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { History as HistoryIcon, Eye, Trash2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { HistoryRecord } from '../../types';

interface HistoryCardProps {
  record: HistoryRecord;
  onViewDetail: (id: number) => void;
  onReuse: (id: number) => void;
  onDelete: (id: number) => void;
}

function formatRelativeTimeSafe(value: unknown): string {
  if (value instanceof Date) {
    return isValid(value) ? formatDistanceToNow(value, { addSuffix: true, locale: zhCN }) : '时间未知';
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = parseISO(value);
    return isValid(parsed) ? formatDistanceToNow(parsed, { addSuffix: true, locale: zhCN }) : '时间未知';
  }
  return '时间未知';
}

export function HistoryCard({ record, onViewDetail, onReuse, onDelete }: HistoryCardProps) {
  const statusColor = record.status === 'success' ? 'success' : 'error';
  const statusLabel = record.status === 'success' ? '成功' : '失败';

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
      data-testid="history-card"
    >
      {/* 缩略图 */}
      <CardMedia
        component="div"
        sx={{
          height: 180,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: record.analysisResult?.imageUrl
            ? `url(${record.analysisResult.imageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="history-thumbnail"
      >
        {!record.analysisResult?.imageUrl && (
          <HistoryIcon size={48} className="text-gray-600 opacity-50" />
        )}
      </CardMedia>

      <CardContent sx={{ flexGrow: 1, padding: 2 }}>
        {/* 状态标签 */}
        <Box sx={{ mb: 1 }}>
          <Chip
            label={statusLabel}
            color={statusColor}
            size="small"
            data-testid="history-status"
          />
        </Box>

        {/* 模版摘要 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
            minHeight: 40,
          }}
          data-testid="history-summary"
        >
          {record.templateSnapshot?.variableFormat || '暂无模版内容'}
        </Typography>

        {/* 时间 */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          data-testid="history-time"
        >
          {formatRelativeTimeSafe(record.createdAt)}
        </Typography>
      </CardContent>

      {/* 操作按钮 */}
      <CardActions sx={{ justifyContent: 'flex-end', padding: 1, gap: 0.5 }}>
        <Tooltip title="查看详情">
          <IconButton
            size="small"
            onClick={() => onViewDetail(record.id)}
            data-testid="history-view-detail"
          >
            <Eye size={18} />
          </IconButton>
        </Tooltip>

        {record.status === 'success' && (
          <Tooltip title="重新使用">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onReuse(record.id)}
              data-testid="history-reuse"
            >
              <RefreshCw size={18} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="删除">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(record.id)}
            data-testid="history-delete"
          >
            <Trash2 size={18} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
