'use client';

import React from 'react';
import { Box, Paper, Typography, Button, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { CircleCheck } from 'lucide-react';

const GUIDE_DISMISSAL_KEY = 'image-upload-guide-dismissed';

export interface FirstTimeGuideProps {
  onDismiss?: () => void;
}

/**
 * Storage abstraction for testability
 */
const storage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
};

/**
 * First-Time Guide Component
 * Shows best practices and example images for first-time users
 */
export function FirstTimeGuide({ onDismiss }: FirstTimeGuideProps) {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Check if user has previously dismissed the guide
    const isDismissed = storage.getItem(GUIDE_DISMISSAL_KEY) === 'true';
    setDismissed(isDismissed);
  }, []);

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    storage.setItem(GUIDE_DISMISSAL_KEY, 'true');
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: '#f0fdf4',
        border: '1px solid #22C55E',
        borderRadius: '12px',
      }}
      data-testid="first-time-guide"
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#22C55E', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircleCheck size={20} aria-hidden="true" />
        最佳实践提示
      </Typography>
      <Typography variant="body2" paragraph sx={{ color: 'text.primary' }}>
        为了获得最好的分析效果,建议使用:
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#22C55E', mb: 1 }}>
          ✓ 推荐场景:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155' }}>
          <li>单个主体(人物、物体或产品)</li>
          <li>静态场景(非动作照片)</li>
          <li>清晰的风格特征(明显的光影、色彩、构图)</li>
        </ul>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#FBBF24', mb: 1 }}>
          ✗ 避免使用:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155' }}>
          <li>多个主体(&gt;5个)</li>
          <li>动态场景(运动照片)</li>
          <li>模糊或低分辨率图片</li>
        </ul>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #22C55E',
            }}
            data-testid="good-example"
          >
            <CardMedia
              component="div"
              sx={{
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#22C55E',
              }}
            >
              <Typography variant="caption">好的示例</Typography>
            </CardMedia>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#475569' }}>
                单主体、风格明显
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              backgroundColor: '#fef2f2',
              border: '1px solid #EF4444',
            }}
            data-testid="bad-example"
          >
            <CardMedia
              component="div"
              sx={{
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
              }}
            >
              <Typography variant="caption">不好的示例</Typography>
            </CardMedia>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#475569' }}>
                多主体、动态场景
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleDismiss}
          sx={{
            backgroundColor: '#22C55E',
            color: '#000',
            '&:hover': {
              backgroundColor: '#16A34A',
            },
          }}
          data-testid="dismiss-guide-btn"
        >
          知道了
        </Button>
      </Box>
    </Paper>
  );
}

export default FirstTimeGuide;
