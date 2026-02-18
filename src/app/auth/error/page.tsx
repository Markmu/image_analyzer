import Link from 'next/link';
import { Box, Button, Container, Paper, Typography } from '@mui/material';

export default function AuthErrorPage() {
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
          登录失败
        </Typography>
        <Typography variant="body1" sx={{ color: '#475569', mb: 4 }}>
          认证流程未完成。你可以重新发起登录，或返回首页继续浏览。
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Link href="/auth/signin">
            <Button variant="contained" sx={{ minHeight: 44 }}>
              重新登录
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outlined" sx={{ minHeight: 44 }}>
              返回首页
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
