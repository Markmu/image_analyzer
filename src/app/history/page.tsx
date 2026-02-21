/**
 * 分析历史记录页面
 * Epic 7: Story 7.1 - 分析历史记录功能
 *
 * 显示用户的分析历史记录（最近 10 次，FIFO 自动清理）
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { History as HistoryIcon, Calendar } from 'lucide-react';
import { HistoryList } from '@/features/history/components';

export default function AnalysisHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // 检查用户身份
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // 加载中状态
  if (status === 'loading') {
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="history-page">
      {/* 页面标题 */}
      <Box
        className="ia-glass-card"
        sx={{
          p: 4,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <HistoryIcon size={32} className="text-blue-400" />
        <Box>
          <Typography
            variant="h4"
            sx={{ mb: 0.5, fontWeight: 600, color: '#F8FAFC' }}
          >
            分析历史
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Calendar size={14} />
            最近的 10 次分析记录（自动保存）
          </Typography>
        </Box>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 历史记录列表 */}
      <HistoryList userId={session.user.id} />
    </Container>
  );
}
