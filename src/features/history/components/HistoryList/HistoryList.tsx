/**
 * 历史记录列表组件
 * Epic 7: Story 1.1 - 分析历史记录功能
 *
 * 显示历史记录列表，支持分页
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Pagination,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { History as HistoryIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { HistoryCard } from '../HistoryCard';
import type { HistoryRecord } from '../../types';

interface HistoryListProps {
  userId: string;
}

export function HistoryList({ userId }: HistoryListProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  // 获取历史记录列表
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['history', userId, page],
    queryFn: async () => {
      const response = await fetch(`/api/history?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const result = await response.json();
      return result.data;
    },
  });

  // 处理查看详情
  const handleViewDetail = (id: number) => {
    router.push(`/history/${id}`);
  };

  // 处理重新使用
  const handleReuse = async (id: number) => {
    try {
      const response = await fetch(`/api/history/${id}/reuse`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reuse template');
      }
      await response.json();

      // 跳转后由分析页根据 historyId 拉取并回填历史分析内容
      router.push(`/analysis?historyId=${id}`);
    } catch (error) {
      console.error('Error reusing template:', error);
      // TODO: 显示错误提示
    }
  };

  // 处理删除
  const handleDeleteClick = (id: number) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      const response = await fetch(`/api/history/${recordToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete history record');
      }

      // 刷新列表
      refetch();
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error('Error deleting history record:', error);
      // TODO: 显示错误提示
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={400}
        data-testid="history-loading"
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'var(--glass-text-white-medium)' }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error">
          加载历史记录失败：{(error as Error).message}
        </Alert>
      </Box>
    );
  }

  // 空状态
  if (!data || data.records.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={400}
        data-testid="history-empty"
      >
        <HistoryIcon size={64} style={{ color: 'var(--glass-text-gray-light)' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'var(--glass-text-white-heavy)' }}>
          还没有分析历史记录
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--glass-text-white-medium)' }}>
          完成图片分析后，记录会自动保存到这里
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: 'var(--primary)',
            color: 'var(--glass-text-white-heavy)',
            '&:hover': {
              backgroundColor: 'var(--primary-hover)',
            },
          }}
          onClick={() => router.push('/analysis')}
        >
          开始分析
        </Button>
      </Box>
    );
  }

  // 显示列表
  return (
    <Box data-testid="history-list">
      <Grid container spacing={3}>
        {data.records.map((record: HistoryRecord) => (
          <Grid item xs={12} sm={6} md={4} key={record.id}>
            <HistoryCard
              record={record}
              onViewDetail={handleViewDetail}
              onReuse={handleReuse}
              onDelete={handleDeleteClick}
            />
          </Grid>
        ))}
      </Grid>

      {/* 分页 */}
      {data.total > data.limit && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(data.total / data.limit)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'var(--glass-text-white-medium)',
                borderColor: 'var(--glass-border)',
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: 'var(--glass-bg-active)',
                color: 'var(--glass-text-primary)',
              },
            }}
          />
        </Box>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这条历史记录吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'var(--glass-text-white-medium)' }}
          >
            取消
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: 'var(--error)',
              color: 'var(--glass-text-white-heavy)',
              '&:hover': {
                backgroundColor: 'var(--error)',
                opacity: 0.9,
              },
            }}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
