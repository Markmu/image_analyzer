import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Box
        className="ia-glass-card ia-glass-card--static"
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <AlertCircle size={40} color="#EF4444" aria-hidden="true" />
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ color: 'var(--glass-text-white-heavy)' }}>
            登录失败
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'var(--glass-text-gray-heavy)', mb: 4 }}>
          认证流程未完成。你可以重新发起登录，或返回首页继续浏览。
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Link href="/auth/signin">
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              sx={{
                minHeight: 44,
                bgcolor: 'var(--color-cta)',
                color: 'var(--glass-text-white-heavy)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'var(--primary-active)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              重新登录
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outlined"
              startIcon={<Home size={18} />}
              sx={{
                minHeight: 44,
                borderColor: 'rgba(59, 130, 246, 0.3)',
                color: 'var(--glass-text-primary)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#3B82F6',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              返回首页
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
