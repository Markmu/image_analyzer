'use client';

import { Box, Button, Typography, Stack } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';

interface FeedbackButtonsProps {
  onFeedback: (feedback: 'accurate' | 'inaccurate') => Promise<void>;
}

/**
 * 用户反馈按钮组件
 * 允许用户标记分析结果是否准确
 */
export function FeedbackButtons({ onFeedback }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (feedback: 'accurate' | 'inaccurate') => {
    setLoading(true);
    try {
      await onFeedback(feedback);
      setSubmitted(true);
    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box
        data-testid="feedback-thank-you"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          borderRadius: 1,
          bgcolor: 'success.main',
          color: 'success.contrastText',
        }}
      >
        <CheckCircleIcon />
        <Typography variant="body2" fontWeight="medium">
          感谢您的反馈！
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: '#475569' }}>
        这个分析结果准确吗？
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          data-testid="feedback-accurate"
          variant="outlined"
          startIcon={<ThumbUpIcon />}
          onClick={() => handleSubmit('accurate')}
          disabled={loading}
          fullWidth
        >
          准确
        </Button>
        <Button
          data-testid="feedback-inaccurate"
          variant="outlined"
          startIcon={<ThumbDownIcon />}
          onClick={() => handleSubmit('inaccurate')}
          disabled={loading}
          fullWidth
        >
          不准确
        </Button>
      </Stack>
    </Box>
  );
}
