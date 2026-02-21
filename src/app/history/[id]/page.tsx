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
  Grid,
  IconButton,
} from '@mui/material';
import { ArrowLeft, RefreshCw, Calendar, Copy, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function AnalysisHistoryDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const historyId = parseInt(params.id as string, 10);
  const [copied, setCopied] = useState(false);

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
      router.push(`/analyze?template=${encodeURIComponent(JSON.stringify(result.data.template))}`);
    } catch (error) {
      console.error('Error reusing template:', error);
      // TODO: 显示错误提示
    }
  };

  // 处制模版
  const handleCopyTemplate = async () => {
    if (!data) return;

    const templateText = data.templateSnapshot.variableFormat;
    try {
      await navigator.clipboard.writeText(templateText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying template:', error);
    }
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
        <Typography sx={{ mt: 2 }} color="text.secondary">
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="history-detail-page">
      {/* 返回按钮 */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.back()}
          sx={{
            borderColor: 'rgba(34, 197, 94, 0.5)',
            color: '#F8FAFC',
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
            sx={{ mb: 0.5, fontWeight: 600, color: '#F8FAFC' }}
          >
            分析历史详情
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={data.status === 'success' ? '成功' : '失败'}
              color={data.status === 'success' ? 'success' : 'error'}
              size="small"
            />
            <Typography
              variant="body2"
              sx={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Calendar size={14} />
              {formatDistanceToNow(new Date(data.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </Typography>
          </Box>
        </Box>

        {data.status === 'success' && (
          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} />}
            onClick={handleReuse}
          >
            重新使用模版
          </Button>
        )}
      </Box>

      {/* 模版内容 */}
      <Grid container spacing={3}>
        {/* 变量模版 */}
        <Grid item xs={12} md={6}>
          <Card className="ia-glass-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
                  变量模版
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopyTemplate}
                  sx={{ color: copied ? '#22C55E' : '#94A3B8' }}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </IconButton>
              </Box>
              <Typography
                sx={{
                  color: '#CBD5E1',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 1,
                }}
              >
                {data.templateSnapshot.variableFormat}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* JSON 模版 */}
        <Grid item xs={12} md={6}>
          <Card className="ia-glass-card" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#F8FAFC' }}>
                JSON 格式
              </Typography>
              <Typography
                component="pre"
                sx={{
                  color: '#CBD5E1',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 1,
                  m: 0,
                }}
              >
                {JSON.stringify(data.templateSnapshot.jsonFormat, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
