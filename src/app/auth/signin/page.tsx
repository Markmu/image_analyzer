import { Box, Container, Typography } from '@mui/material';
import { Brain } from 'lucide-react';
import { SignInButton } from '@/features/auth/components/SignInButton';

export default function SignInPage() {
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
          <Brain size={40} style={{ color: 'var(--glass-text-primary)' }} aria-hidden="true" />
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ color: 'var(--glass-text-white-heavy)' }}>
            登录 Image Analyzer
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'var(--glass-text-gray-heavy)', mb: 4 }}>
          使用 Google 账户继续，开始图片风格分析与模板复用。
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <SignInButton />
        </Box>
      </Box>
    </Container>
  );
}
