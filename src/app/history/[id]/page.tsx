/**
 * 分析历史详情页面
 * Epic 7: Story 7.1 - 分析历史记录功能
 *
 * 显示单条历史记录的完整详情，包括分析结果和模版
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import { ArrowLeft, RefreshCw, Calendar, Copy, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const EMPTY_TEMPLATE_SNAPSHOT = {
  variableFormat: '',
  jsonFormat: {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  },
} as const;

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

function normalizeTemplateSnapshot(value: unknown) {
  if (!value || typeof value !== 'object') {
    return EMPTY_TEMPLATE_SNAPSHOT;
  }

  const snapshot = value as {
    variableFormat?: unknown;
    jsonFormat?: Record<string, unknown>;
  };
  const jsonFormat = snapshot.jsonFormat ?? {};

  return {
    variableFormat: typeof snapshot.variableFormat === 'string' ? snapshot.variableFormat : '',
    jsonFormat: {
      subject: typeof jsonFormat.subject === 'string' ? jsonFormat.subject : '',
      style: typeof jsonFormat.style === 'string' ? jsonFormat.style : '',
      composition: typeof jsonFormat.composition === 'string' ? jsonFormat.composition : '',
      colors: typeof jsonFormat.colors === 'string' ? jsonFormat.colors : '',
      lighting: typeof jsonFormat.lighting === 'string' ? jsonFormat.lighting : '',
      additional: typeof jsonFormat.additional === 'string' ? jsonFormat.additional : '',
    },
  };
}

export default function AnalysisHistoryDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const historyId = parseInt(params.id as string, 10);
  const [copiedTarget, setCopiedTarget] = useState<'variable' | 'json' | null>(null);

  // 获取历史记录详情
  const { data, isLoading, error } = useQuery({
    queryKey: ['history', historyId],
    queryFn: async () => {
      const response = await fetch(`/api/history/${historyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch history detail');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: status === 'authenticated' && !isNaN(historyId),
  });

  // 检查用户身份
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // 处理重新使用
  const handleReuse = async () => {
    try {
      const response = await fetch(`/api/history/${historyId}/reuse`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reuse template');
      }
      const result = await response.json();

      // 导航到分析页面并传递模版数据
      router.push(`/analysis?template=${encodeURIComponent(JSON.stringify(result.data.template))}`);
    } catch (error) {
      console.error('Error reusing template:', error);
      // TODO: 显示错误提示
    }
  };

  const handleCopyText = async (text: string, target: 'variable' | 'json') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget((prev) => (prev === target ? null : prev)), 2000);
    } catch (error) {
      console.error('Error copying template:', error);
    }
  };

  // 复制变量模版
  const handleCopyTemplate = async () => {
    if (!data) return;
    const templateText = normalizeTemplateSnapshot(data.templateSnapshot).variableFormat;
    await handleCopyText(templateText, 'variable');
  };

  // 复制 JSON 模版
  const handleCopyJson = async () => {
    if (!data) return;
    const jsonText = JSON.stringify(normalizeTemplateSnapshot(data.templateSnapshot).jsonFormat, null, 2);
    await handleCopyText(jsonText, 'json');
  };

  // 加载中状态
  if (status === 'loading' || isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'var(--glass-text-white-medium)' }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  // 未登录状态
  if (!session) {
    return null;
  }

  // 错误状态
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  // 未找到记录
  if (!data) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">未找到该历史记录</Alert>
      </Container>
    );
  }

  const templateSnapshot = normalizeTemplateSnapshot(data.templateSnapshot);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="history-detail-page">
      {/* 返回按钮 */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.back()}
          sx={{
            borderColor: 'var(--glass-border-active)',
            color: 'var(--glass-text-white-heavy)',
          }}
        >
          返回列表
        </Button>
      </Box>

      {/* 页面标题 */}
      <Box
        className="ia-glass-card"
        sx={{
          p: 4,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ mb: 0.5, fontWeight: 600, color: 'var(--glass-text-white-heavy)' }}
          >
            分析历史详情
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={data.status === 'success' ? '成功' : '失败'}
              size="small"
              sx={{
                backgroundColor: data.status === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
                color: data.status === 'success' ? 'var(--success)' : 'var(--error)',
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: 'var(--glass-text-white-medium)', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Calendar size={14} />
              {formatRelativeTimeSafe(data.createdAt)}
            </Typography>
          </Box>
        </Box>

        {data.status === 'success' && (
          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} />}
            onClick={handleReuse}
            sx={{
              backgroundColor: 'var(--primary)',
              color: 'var(--glass-text-white-heavy)',
              '&:hover': {
                backgroundColor: 'var(--primary-hover)',
              },
            }}
          >
            重新使用模版
          </Button>
        )}
      </Box>

      {/* 模版内容 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 变量模版 */}
        <Box>
          <Card
            className="ia-glass-card"
            sx={{
              height: '100%',
              backgroundColor: 'var(--glass-bg-dark)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: 'var(--glass-text-white-heavy)' }}>
                  变量模版
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopyTemplate}
                  sx={{ color: copiedTarget === 'variable' ? 'var(--icon-success)' : 'var(--icon-secondary)' }}
                >
                  {copiedTarget === 'variable' ? <CheckCircle size={18} /> : <Copy size={18} />}
                </IconButton>
              </Box>
              <Typography
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  p: 2,
                  backgroundColor: 'var(--glass-bg-dark-heavy)',
                  borderRadius: 1,
                }}
              >
                {templateSnapshot.variableFormat || '暂无模版内容'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* JSON 模版 */}
        <Box>
          <Card
            className="ia-glass-card"
            sx={{
              height: '100%',
              backgroundColor: 'var(--glass-bg-dark)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: 'var(--glass-text-white-heavy)' }}>
                  JSON 格式
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopyJson}
                  sx={{ color: copiedTarget === 'json' ? 'var(--icon-success)' : 'var(--icon-secondary)' }}
                >
                  {copiedTarget === 'json' ? <CheckCircle size={18} /> : <Copy size={18} />}
                </IconButton>
              </Box>
              <Typography
                component="pre"
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  p: 2,
                  backgroundColor: 'var(--glass-bg-dark-heavy)',
                  borderRadius: 1,
                  m: 0,
                }}
              >
                {JSON.stringify(templateSnapshot.jsonFormat, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
