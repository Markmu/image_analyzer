import { Box, Container, Paper, Typography } from '@mui/material';
import { SignInButton } from '@/features/auth/components/SignInButton';

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper
        elevation={1}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          登录 Image Analyzer
        </Typography>
        <Typography variant="body1" sx={{ color: '#475569', mb: 4 }}>
          使用 Google 账户继续，开始图片风格分析与模板复用。
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <SignInButton />
        </Box>
      </Paper>
    </Container>
  );
}
