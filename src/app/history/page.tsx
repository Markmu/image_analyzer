/**
 * Image History Page
 *
 * Epic 6 - Story 6-3: Image Save
 * Display user's generated image history
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Image as ImageIcon,
  Trash2,
  X,
  Calendar,
  ImageIcon as ImageIconAlt,
} from 'lucide-react';
import {
  fetchImageHistory,
  deleteImageHistory,
} from '@/features/generation/lib/image-history-client';
import type { ImageHistoryRecord, ImageHistoryParams } from '@/features/generation/types/history';

export default function ImageHistoryPage() {
  const [records, setRecords] = useState<ImageHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ImageHistoryRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageHistoryRecord | null>(null);

  const limit = 20;

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ImageHistoryParams = { page, limit };
      const result = await fetchImageHistory(params);
      setRecords(result.records);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page]);

  const handleDelete = async (record: ImageHistoryRecord) => {
    setImageToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      await deleteImageHistory(imageToDelete.id);
      setRecords(records.filter((r) => r.id !== imageToDelete.id));
      setTotal(total - 1);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const totalPages = Math.ceil(total / limit);

  // 格式化日期为相对时间
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        className="ia-glass-card"
        sx={{
          p: 4,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <ImageIconAlt size={32} className="text-blue-400" />
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
              图片历史
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={14} />
              共 {total} 张生成的图片
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
        /* Empty State */
        <Box
          className="ia-glass-card"
          sx={{
            p: 8,
            textAlign: 'center',
          }}
        >
          <ImageIcon size={64} className="text-slate-600" style={{ opacity: 0.5, marginBottom: 16 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            暂无图片历史
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            生成的图片会显示在这里
          </Typography>
        </Box>
      ) : (
        <>
          {/* Image Grid */}
          <Grid container spacing={3}>
            {records.map((record) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={record.id}>
                <Card
                  className="ia-glass-card"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '100%', // 1:1 aspect ratio
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedImage(record)}
                  >
                    <CardMedia
                      component="img"
                      image={record.thumbnailUrl || record.imageUrl}
                      alt={record.generationRequest.prompt}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {record.generationRequest.prompt}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {record.width} × {record.height}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        •
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {record.format.toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                      {formatRelativeTime(new Date(record.createdAt))}
                    </Typography>
                  </CardContent>

                  {/* Delete Button */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        transform: 'scale(1.1)',
                      },
                    }}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record);
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                variant="outlined"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                sx={{
                  borderColor: 'rgba(34, 197, 94, 0.5)',
                  color: 'text.primary',
                  '&:hover:not(:disabled)': {
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  },
                  '&:disabled': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'text.secondary',
                  },
                }}
              >
                上一页
              </Button>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                第 {page} / {totalPages} 页
              </Typography>
              <Button
                variant="outlined"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                sx={{
                  borderColor: 'rgba(34, 197, 94, 0.5)',
                  color: 'text.primary',
                  '&:hover:not(:disabled)': {
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  },
                  '&:disabled': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'text.secondary',
                  },
                }}
              >
                下一页
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Image Detail Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'ia-glass-card',
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">图片详情</Typography>
            <IconButton onClick={() => setSelectedImage(null)} size="small">
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box>
              <Box
                component="img"
                src={selectedImage.imageUrl}
                alt={selectedImage.generationRequest.prompt}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  mb: 2,
                  maxHeight: '50vh',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Calendar size={16} className="text-slate-400" />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatRelativeTime(new Date(selectedImage.createdAt))}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>提示词:</strong> {selectedImage.generationRequest.prompt}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>尺寸:</strong> {selectedImage.width} × {selectedImage.height}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>格式:</strong> {selectedImage.format.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>模型:</strong> {selectedImage.generationRequest.provider} /{' '}
                {selectedImage.generationRequest.model}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedImage(null)}
            sx={{
              borderColor: 'rgba(34, 197, 94, 0.5)',
              color: 'text.primary',
            }}
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: 'ia-glass-card',
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        }}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这张图片吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              borderColor: 'rgba(34, 197, 94, 0.5)',
              color: 'text.primary',
            }}
          >
            取消
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            startIcon={<Trash2 size={18} />}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
