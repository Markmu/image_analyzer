/**
 * Template Library Detail Component
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * 模版详情页组件，显示完整的模版信息和生成历史
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowLeft,
  Star,
  StarOff,
  Trash2,
  RefreshCw,
  Edit,
  Calendar,
  TrendingUp,
  Tag,
  FolderTree,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TemplateWithHistory } from '../../types/library';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

export function TemplateLibraryDetail() {
  const router = useRouter();
  const params = useParams();
  const templateId = parseInt(params.id as string);

  const [template, setTemplate] = useState<TemplateWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  });

  // 获取模版详情
  const fetchTemplateDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateId}`);

      if (!response.ok) {
        throw new Error('获取模版详情失败');
      }

      const result = await response.json();

      if (result.success) {
        const templateData = result.data?.template ?? result.data;
        if (!templateData) {
          throw new Error('模版数据格式错误');
        }
        setTemplate(templateData);
        setEditForm({
          title: templateData.title || '',
          description: templateData.description || '',
        });
      } else {
        throw new Error(result.error || '获取模版详情失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取模版详情失败');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId) {
      void fetchTemplateDetail();
    }
  }, [templateId, fetchTemplateDetail]);

  // 处理返回列表
  const handleBack = () => {
    router.push('/library');
  };

  // 处理重新生成
  const handleRegenerate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}/regenerate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('重新生成失败');
      }

      const result = await response.json();

      if (result.success) {
        router.push(`/analysis?templateId=${templateId}`);
      } else {
        throw new Error(result.error || '重新生成失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '重新生成失败');
    }
  };

  // 处理收藏切换
  const handleToggleFavorite = async () => {
    if (!template) return;

    try {
      const response = await fetch(`/api/templates/${templateId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('切换收藏状态失败');
      }

      const result = await response.json();

      if (result.success) {
        setTemplate({ ...template, isFavorite: !template.isFavorite });
      } else {
        throw new Error(result.error || '切换收藏状态失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换收藏状态失败');
    }
  };

  // 处理删除
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除模版失败');
      }

      const result = await response.json();

      if (result.success) {
        router.push('/library');
      } else {
        throw new Error(result.error || '删除模版失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除模版失败');
    }
  };

  // 处理编辑保存
  const handleEditSave = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('更新模版失败');
      }

      const result = await response.json();

      if (result.success) {
        setTemplate({
          ...template!,
          title: editForm.title,
          description: editForm.description,
        });
        setEditDialog(false);
      } else {
        throw new Error(result.error || '更新模版失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新模版失败');
    }
  };

  // 加载状态
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }} data-testid="template-detail">
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
            加载模版详情...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!template) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }} data-testid="template-detail">
        <Alert severity="error" data-testid="template-error">
          {error || '模版不存在'}
        </Alert>
      </Container>
    );
  }

  const previewImageUrl = template.templateSnapshot?.analysisData?.imageUrl;
  const glassCardSx = {
    background: 'var(--glass-bg-dark)',
    backgroundImage: 'none',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    boxShadow: 'var(--glass-shadow)',
  } as const;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="template-detail">
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

      {/* 返回按钮 */}
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={handleBack}
        sx={{ mb: 3, color: 'var(--glass-text-gray-medium)' }}
        data-testid="back-button"
      >
        返回模版库
      </Button>

      {/* 主要内容 */}
      <Grid container spacing={3}>
        {/* 左侧：预览图和基本信息 */}
        <Grid item xs={12} md={5}>
          {/* 预览图 */}
          <Card
            className="ia-glass-card ia-glass-card--static"
            sx={{
              ...glassCardSx,
              mb: 3,
              overflow: 'hidden',
            }}
            data-testid="template-preview-card"
          >
            {previewImageUrl ? (
              <CardMedia
                component="img"
                image={previewImageUrl}
                alt="模版预览图"
                sx={{
                  height: 300,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  height: 300,
                  backgroundColor: 'var(--glass-bg-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--glass-text-gray-medium)',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <CheckCircle size={48} opacity={0.5} />
                <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-medium)' }}>
                  暂无预览图
                </Typography>
              </Box>
            )}
          </Card>

          {/* 统计信息 */}
          <Card className="ia-glass-card ia-glass-card--static" sx={{ ...glassCardSx, p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'var(--glass-text-white-heavy)',
                fontWeight: 600,
              }}
            >
              统计信息
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* 使用次数 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
                data-testid="template-usage-count"
              >
                <TrendingUp size={20} style={{ color: 'var(--glass-text-primary)' }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--glass-text-gray-medium)' }}
                  >
                    使用次数
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 600 }}
                  >
                    {template.usageCount} 次
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'var(--glass-border-white-light)' }} />

              {/* 创建时间 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
                data-testid="template-created-at"
              >
                <Calendar size={20} style={{ color: 'var(--glass-text-accent)' }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--glass-text-gray-medium)' }}
                  >
                    创建时间
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'var(--glass-text-white-heavy)' }}
                  >
                    {formatDistanceToNow(new Date(template.createdAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'var(--glass-border-white-light)' }} />

              {/* 生成历史数 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
                data-testid="template-generations-count"
              >
                <CheckCircle size={20} style={{ color: 'var(--glass-text-primary)' }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--glass-text-gray-medium)' }}
                  >
                    生成历史
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 600 }}
                  >
                    {template.generations?.length || 0} 次
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* 右侧：详细信息 */}
        <Grid item xs={12} md={7}>
          {/* 标题和操作 */}
          <Card className="ia-glass-card ia-glass-card--static" sx={{ ...glassCardSx, p: 3, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'var(--glass-text-white-heavy)',
                    fontWeight: 600,
                    mb: 1,
                  }}
                  data-testid="template-title"
                >
                  {template.title || '未命名模版'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--glass-text-gray-medium)',
                    whiteSpace: 'pre-wrap',
                  }}
                  data-testid="template-description"
                >
                  {template.description || '暂无描述'}
                </Typography>
              </Box>

              {/* 收藏按钮 */}
              <IconButton
                onClick={handleToggleFavorite}
                sx={{ ml: 2, width: 44, height: 44 }}
                data-testid="toggle-favorite-button"
                aria-label={template.isFavorite ? '取消收藏模版' : '收藏模版'}
              >
                {template.isFavorite ? (
                  <Star size={24} className="text-yellow-500" fill="currentColor" />
                ) : (
                  <StarOff size={24} style={{ color: 'var(--glass-text-gray-medium)' }} />
                )}
              </IconButton>
            </Box>

            {/* 操作按钮 */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Edit size={18} />}
                onClick={() => setEditDialog(true)}
                data-testid="edit-button"
              >
                编辑
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshCw size={18} />}
                onClick={handleRegenerate}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  },
                }}
                data-testid="regenerate-button"
              >
                重新生成
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={18} />}
                onClick={() => setDeleteDialog(true)}
                data-testid="delete-button"
              >
                删除
              </Button>
            </Box>
          </Card>

          {/* 标签和分类 */}
          <Card className="ia-glass-card ia-glass-card--static" sx={{ ...glassCardSx, p: 3, mb: 3 }}>
            {/* 标签 */}
            {template.tags && template.tags.length > 0 && (
              <Box sx={{ mb: 2 }} data-testid="template-tags">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Tag size={18} style={{ color: 'var(--glass-text-primary)' }} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'var(--glass-text-white-heavy)',
                      fontWeight: 600,
                    }}
                  >
                    标签
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {template.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      sx={{
                        backgroundColor: 'var(--glass-bg-blue-medium)',
                        color: 'var(--glass-text-white-medium)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 分类 */}
            {template.categories && template.categories.length > 0 && (
              <Box data-testid="template-categories">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <FolderTree size={18} style={{ color: 'var(--glass-text-accent)' }} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'var(--glass-text-white-heavy)',
                      fontWeight: 600,
                    }}
                  >
                    分类
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {template.categories.map((category, index) => (
                    <Chip
                      key={index}
                      label={
                        category.child
                          ? `${category.parent} / ${category.child}`
                          : category.parent
                      }
                      variant="outlined"
                      sx={{
                        borderColor: 'var(--glass-border-active)',
                        color: 'var(--glass-text-primary)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Card>

          {/* 模版快照数据 */}
          <Card className="ia-glass-card ia-glass-card--static" sx={{ ...glassCardSx, p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'var(--glass-text-white-heavy)',
                fontWeight: 600,
              }}
            >
              模版数据
            </Typography>

            <Box
              sx={{
                backgroundColor: 'var(--glass-bg-dark-light)',
                p: 2,
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto',
                border: '1px solid var(--glass-border-white-light)',
              }}
              data-testid="template-snapshot"
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  color: 'var(--glass-text-gray-medium)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(template.templateSnapshot, null, 2)}
              </Typography>
            </Box>

            {/* 模型信息 */}
            {template.templateSnapshot.modelId && (
              <Box sx={{ mt: 2 }} data-testid="template-model">
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--glass-text-gray-heavy)' }}
                >
                  分析模型：{template.templateSnapshot.modelId}
                </Typography>
              </Box>
            )}
          </Card>

          {/* 生成历史 */}
          {template.generations && template.generations.length > 0 && (
            <Card className="ia-glass-card ia-glass-card--static" sx={{ ...glassCardSx, p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: 'var(--glass-text-white-heavy)',
                  fontWeight: 600,
                }}
              >
                生成历史
              </Typography>

              <Grid container spacing={2} data-testid="template-generations">
                {template.generations.map((generation) => (
                  <Grid item xs={6} sm={4} md={3} key={generation.id}>
                    <Card
                      className="ia-glass-card ia-glass-card--static"
                      sx={{
                        ...glassCardSx,
                        overflow: 'hidden',
                        transition: 'var(--glass-transition)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() =>
                          window.open(generation.imageUrl, '_blank', 'noopener,noreferrer')
                        }
                        aria-label={`查看生成历史图片 ${generation.id}`}
                        sx={{ minHeight: 44 }}
                      >
                        {generation.imageUrl ? (
                          <CardMedia
                            component="img"
                            image={generation.imageUrl}
                            alt={`生成历史图片 ${generation.id}`}
                            sx={{
                              height: 120,
                              objectFit: 'cover',
                              backgroundColor: 'var(--glass-bg-light)',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 120,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'var(--glass-bg-light)',
                              color: 'var(--glass-text-gray-medium)',
                            }}
                          >
                            <Typography variant="caption">暂无图片</Typography>
                          </Box>
                        )}
                        <Box sx={{ p: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: 'var(--glass-text-gray-medium)',
                              fontSize: '0.7rem',
                            }}
                          >
                            {formatDistanceToNow(new Date(generation.createdAt), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialog}
        templateTitle={template.title || '未命名模版'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
      />

      {/* 编辑对话框 */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        aria-labelledby="template-edit-dialog-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'ia-glass-card ia-glass-card--heavy ia-glass-card--lg ia-glass-card--static',
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backgroundImage: 'linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.94) 100%)',
            border: '1px solid var(--glass-border-white-heavy)',
            boxShadow: '0 14px 48px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          },
        }}
        data-testid="edit-dialog"
      >
        <DialogTitle
          id="template-edit-dialog-title"
          sx={{
            color: 'var(--glass-text-white-heavy)',
            fontWeight: 600,
          }}
        >
          编辑模版信息
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标题"
            fullWidth
            variant="outlined"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-input': {
                color: 'var(--glass-text-white-medium)',
              },
              '& .MuiInputLabel-root': {
                color: 'var(--glass-text-gray-medium)',
              },
            }}
            data-testid="edit-title-input"
          />

          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            sx={{
              '& .MuiOutlinedInput-input': {
                color: 'var(--glass-text-white-medium)',
              },
              '& .MuiInputLabel-root': {
                color: 'var(--glass-text-gray-medium)',
              },
            }}
            data-testid="edit-description-input"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setEditDialog(false)}
            sx={{ color: 'var(--glass-text-gray-medium)' }}
            data-testid="edit-cancel-button"
          >
            取消
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            data-testid="edit-save-button"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
