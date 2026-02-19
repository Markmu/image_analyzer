/**
 * 内容审核错误反馈组件
 *
 * Story 4-1: 内容审核功能
 * AC-3: 审核失败时显示友好提示
 */

'use client';

import { Box, Typography, Button, Paper } from '@mui/material';
import { CircleAlert } from 'lucide-react';
import Link from 'next/link';

interface ModerationErrorProps {
  /**
   * 错误标题
   */
  title: string;

  /**
   * 修改建议
   */
  suggestion: string;

  /**
   * 内容政策链接
   */
  policyLink?: string;

  /**
   * 重试回调
   */
  onRetry?: () => void;
}

/**
 * 审核错误反馈组件
 *
 * 当上传的图片被审核拒绝时显示友好的错误信息
 */
export function ModerationError({
  title,
  suggestion,
  policyLink = '/content-policy',
  onRetry,
}: ModerationErrorProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        padding: 3,
        backgroundColor: 'var(--error-bg)',
        border: '1px solid var(--error)',
        borderRadius: 'var(--glass-radius)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <CircleAlert size={40} color="var(--error)" aria-hidden="true" />

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'var(--error)', fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>

          <Typography variant="body2" sx={{ color: 'var(--glass-text-white-heavy)', mb: 2 }}>
            {suggestion}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {onRetry && (
              <Button
                variant="contained"
                onClick={onRetry}
                size="small"
                sx={{
                  backgroundColor: 'var(--glass-text-primary)',
                  color: 'var(--glass-text-white-heavy)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-active)',
                  },
                }}
              >
                重新上传
              </Button>
            )}

            <Link href={policyLink} passHref legacyBehavior>
              <Button
                component="a"
                variant="text"
                size="small"
                sx={{
                  color: 'var(--glass-text-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--glass-bg-active)',
                  },
                }}
              >
                查看内容政策
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

/**
 * 审核错误通用消息类型
 */
export interface ModerationErrorMessage {
  code: string;
  title: string;
  suggestion: string;
}

/**
 * 根据 API 错误响应创建审核错误组件
 */
export function ModerationErrorFromResponse({
  error,
  onRetry,
}: {
  error: {
    code: string;
    message: string;
    details?: {
      reason?: string;
      suggestion?: string;
      policyLink?: string;
    };
  };
  onRetry?: () => void;
}) {
  return (
    <ModerationError
      title={error.message}
      suggestion={error.details?.suggestion || '请修改内容后重试'}
      policyLink={error.details?.policyLink}
      onRetry={onRetry}
    />
  );
}
