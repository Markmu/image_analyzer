/**
 * Template Library Detail Component
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * 模版详情页组件，显示完整的模版信息和生成历史
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
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
  Collapse,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowLeft,
  Star,
  StarOff,
  Trash2,
  Edit,
  Tag,
  FolderTree,
  CheckCircle,
  Sparkles,
  ChevronDown,
  Ban,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TemplateWithHistory } from '../../types/library';
import type { Template } from '../../types/template';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { TemplateSummaryDisplay } from '../TemplateSummaryDisplay';
import { TemplateEditor } from '../TemplateEditor/TemplateEditor';
import { templateSnapshotToTemplate } from '../../lib/template-snapshot-converter';
import { useEditorStateMachine, type EditorEvent } from '../../lib/use-editor-state-machine';
import { GLASS_CARD_SX, GLASS_TEXT_COLORS, GLASS_BORDER_COLORS } from '../../styles';

export function TemplateLibraryDetail() {
  const router = useRouter();
  const params = useParams();
  const templateId = parseInt(params.id as string);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [template, setTemplate] = useState<TemplateWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  });

  // State machine for editor state management
  const {
    state: editorState,
    transition: editorTransition,
    isEditorExpanded,
    isGenerating,
    isError: isEditorError,
    error: editorError,
    isSuccess: isGenerationSuccess,
  } = useEditorStateMachine();

  // Generation status message
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);

  // Editable template data
  const [editableTemplate, setEditableTemplate] = useState<Template | null>(null);

  // Backup template before editing (for cancel/restore)
  const [templateBeforeEdit, setTemplateBeforeEdit] = useState<Template | null>(null);

  // More menu state
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const moreMenuOpen = Boolean(moreMenuAnchor);

  // Constants for API calls
  const API_TIMEOUT = 30000; // 30 seconds
  const MAX_RETRIES = 1;
  const REFRESH_DELAY_MS = 5000; // 5 seconds - wait for webhook to process

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

        // Convert template snapshot to editable Template format
        const converted = templateSnapshotToTemplate(
          templateData,
          String(templateId)
        );
        setEditableTemplate(converted);
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

  // Handle generate image with timeout and retry logic
  const handleGenerateImage = useCallback(async () => {
    if (isGenerating || !template) return;

    editorTransition({ type: 'START_GENERATE' });
    setGenerationStatus('正在生成图片...');
    setError(null);

    const attemptGenerate = async (attempt: number): Promise<boolean> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      try {
        const response = await fetch(`/api/templates/${templateId}/regenerate`, {
          method: 'POST',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('请先登录');
          } else if (response.status === 404) {
            throw new Error('模板不存在');
          } else if (response.status === 429) {
            throw new Error('生成次数已达上限');
          } else if (response.status >= 500 && attempt < MAX_RETRIES) {
            // Server error - retry
            console.warn(`Server error, retrying... (attempt ${attempt + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return attemptGenerate(attempt + 1);
          } else {
            throw new Error('生成图片失败');
          }
        }

        const result = await response.json();

        if (result.success) {
          setGenerationStatus('图片生成已开始，请稍候...');
          // Refresh after delay to allow webhook to process
          setTimeout(() => {
            void fetchTemplateDetail();
            setGenerationStatus(null);
            editorTransition({ type: 'GENERATE_SUCCESS' });
          }, REFRESH_DELAY_MS);
          return true;
        } else {
          throw new Error(result.error || '生成图片失败');
        }
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('请求超时，请稍后重试');
        }

        // Retry on network errors
        if (err instanceof TypeError && attempt < MAX_RETRIES) {
          console.warn(`Network error, retrying... (attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptGenerate(attempt + 1);
        }

        throw err;
      }
    };

    try {
      await attemptGenerate(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图片失败';
      setError(errorMessage);
      setGenerationStatus(null);
      editorTransition({ type: 'GENERATE_ERROR', error: errorMessage });
    }
  }, [templateId, isGenerating, template, fetchTemplateDetail, editorTransition]);

  // Handle toggle editor (backup current template before opening)
  const handleToggleEditor = useCallback(() => {
    // Backup current template before editing
    if (editableTemplate) {
      setTemplateBeforeEdit({ ...editableTemplate });
    }
    editorTransition({ type: 'OPEN_EDITOR' });
  }, [editableTemplate, editorTransition]);

  // Handle confirm edit (save changes and collapse editor)
  const handleConfirmEdit = useCallback(() => {
    // Changes are already saved in editableTemplate state via TemplateEditor onChange
    // Just collapse the editor and update summary
    editorTransition({ type: 'CONFIRM_EDIT' });
  }, [editorTransition]);

  // Handle cancel edit (discard and collapse editor)
  const handleCancelEdit = useCallback(() => {
    // Restore original template data from backup
    if (templateBeforeEdit) {
      setEditableTemplate(templateBeforeEdit);
      setTemplateBeforeEdit(null);
    }
    editorTransition({ type: 'CANCEL_EDIT' });
  }, [templateBeforeEdit, editorTransition]);

  // Handle template change from editor
  const handleTemplateChange = useCallback((updatedTemplate: Template) => {
    setEditableTemplate(updatedTemplate);
  }, []);

  // Handle more menu
  const handleMoreMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  }, []);

  const handleMoreMenuClose = useCallback(() => {
    setMoreMenuAnchor(null);
  }, []);

  const handleEditClick = useCallback(() => {
    handleMoreMenuClose();
    setEditDialog(true);
  }, [handleMoreMenuClose]);

  const handleDeleteClick = useCallback(() => {
    handleMoreMenuClose();
    setDeleteDialog(true);
  }, [handleMoreMenuClose]);

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

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }} data-testid="template-detail">
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
      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
        {/* 顶部：标题卡片 + 预览图（同一行） */}
        <Grid item xs={12} sx={{ width: '100%', pl: '0 !important', pt: '0 !important' }}>
          <Card
            className="ia-glass-card ia-glass-card--static"
            sx={{
              ...GLASS_CARD_SX,
              p: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'stretch',
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: { xs: '100%', md: 'fit-content' },
                  maxWidth: { xs: '100%', md: 'clamp(240px, 28vw, 360px)' },
                  flexShrink: 0,
                  alignSelf: { xs: 'stretch', md: 'flex-start' },
                }}
                data-testid="template-preview-card"
              >
                {previewImageUrl ? (
                  <Box
                    sx={{
                      width: { xs: '100%', md: 'fit-content' },
                      minHeight: { xs: 180, sm: 200, md: 180 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'center', md: 'flex-end' },
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundColor: 'var(--glass-bg-light)',
                      p: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={previewImageUrl}
                      alt="模版预览图"
                      sx={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: { xs: '100%', md: 'clamp(240px, 28vw, 360px)' },
                        maxHeight: { xs: 140, sm: 160, md: 180 },
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      minHeight: { xs: 180, sm: 200, md: 180 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      backgroundColor: 'var(--glass-bg-light)',
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
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: { md: 180 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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

                  <IconButton
                    onClick={handleToggleFavorite}
                    sx={{ ml: 2, width: 44, height: 44, flexShrink: 0 }}
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

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 1.5, md: 1.5 },
                    mt: 'auto',
                    flexShrink: 0,
                    alignItems: { xs: 'stretch', md: 'center' },
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth={isMobile}
                    disabled={isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={18} /> : <Sparkles size={18} />}
                    onClick={handleGenerateImage}
                    data-testid="generate-image-button"
                    sx={{
                      minWidth: { xs: '100%', md: 120 },
                      order: { xs: 1, md: 1 },
                    }}
                  >
                    {isGenerating ? '生成中...' : '生成图片'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth={isMobile}
                    disabled={isGenerating}
                    startIcon={<ChevronDown size={18} />}
                    onClick={handleToggleEditor}
                    data-testid="advanced-edit-button"
                    sx={{
                      minWidth: { xs: '100%', md: 120 },
                      order: { xs: 2, md: 2 },
                    }}
                  >
                    高级编辑
                  </Button>
                  <Box sx={{ ml: { md: 'auto' }, order: { xs: 3, md: 3 } }}>
                    <IconButton
                      size="small"
                      onClick={handleMoreMenuOpen}
                      disabled={isGenerating}
                      data-testid="more-menu-button"
                      sx={{ width: 36, height: 36 }}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                    <Menu
                      anchorEl={moreMenuAnchor}
                      open={moreMenuOpen}
                      onClose={handleMoreMenuClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      data-testid="more-menu"
                    >
                      <MenuItem
                        onClick={handleEditClick}
                        disabled={isGenerating}
                        data-testid="edit-menu-item"
                      >
                        <Edit size={16} style={{ marginRight: 8 }} />
                        编辑信息
                      </MenuItem>
                      <MenuItem
                        onClick={handleDeleteClick}
                        disabled={isGenerating}
                        sx={{ color: 'error.main' }}
                        data-testid="delete-menu-item"
                      >
                        <Trash2 size={16} style={{ marginRight: 8 }} />
                        删除模板
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Generation Status Alert */}
        {generationStatus && (
          <Grid item xs={12} sx={{ width: '100%', pl: '0 !important' }}>
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              data-testid="generation-status"
              icon={<CircularProgress size={20} />}
            >
              {generationStatus}
            </Alert>
          </Grid>
        )}

        {/* Generation Success Alert */}
        {isGenerationSuccess && !generationStatus && (
          <Grid item xs={12} sx={{ width: '100%', pl: '0 !important' }}>
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              data-testid="generation-success"
              onClose={() => editorTransition({ type: 'OPEN_EDITOR' })}
            >
              图片生成已开始！新图片将自动出现在生成历史中。
            </Alert>
          </Grid>
        )}

        {/* Core Parameters Summary */}
        <Grid item xs={12} sx={{ width: '100%', pl: '0 !important' }}>
          <Collapse in={!isEditorExpanded} timeout={300} unmountOnExit>
            <TemplateSummaryDisplay
              jsonFormat={editableTemplate?.jsonFormat || null}
              data-testid="template-summary-display"
            />
          </Collapse>
        </Grid>

        {/* Advanced Editor (Collapsible) */}
        <Grid item xs={12} sx={{ width: '100%', pl: '0 !important' }}>
          <Collapse in={isEditorExpanded} timeout={300} unmountOnExit>
            <Card
              className="ia-glass-card ia-glass-card--static"
              sx={{
                ...GLASS_CARD_SX,
                p: 0,
                overflow: 'visible',
              }}
              data-testid="advanced-editor"
            >
              {editableTemplate ? (
                <>
                  <TemplateEditor
                    template={editableTemplate}
                    onChange={handleTemplateChange}
                    showSaveButton={false}
                    showOptimizeButton={false}
                    readOnly={false}
                    data-testid="template-editor-in-detail"
                  />
                  <Box
                    sx={{
                      px: 3,
                      pb: 3,
                      pt: 0,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ justifyContent: 'flex-end' }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        disabled={isGenerating}
                        data-testid="cancel-edit-button"
                      >
                        取消
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleConfirmEdit}
                        disabled={isGenerating}
                        color="primary"
                        data-testid="confirm-edit-button"
                      >
                        确认修改
                      </Button>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--glass-text-gray-medium)',
                    }}
                  >
                    加载编辑器...
                  </Typography>
                </Box>
              )}
            </Card>
          </Collapse>
        </Grid>

        {/* 详情内容 */}
        <Grid item xs={12} sx={{ width: '100%', pl: '0 !important' }}>
          {/* 标签和分类 */}
          {((template.tags && template.tags.length > 0) ||
            (template.categories && template.categories.length > 0)) && (
            <Card className="ia-glass-card ia-glass-card--static" sx={{ ...GLASS_CARD_SX, p: 3, mb: 3 }}>
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
          )}

          {/* 生成历史 */}
          {template.generations && template.generations.length > 0 && (
            <Card className="ia-glass-card ia-glass-card--static" sx={{ ...GLASS_CARD_SX, p: 3 }}>
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
                        ...GLASS_CARD_SX,
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
