/**
 * 内容审核错误反馈组件
 *
 * Story 4-1: 内容审核功能
 * AC-3: 审核失败时显示友好提示
 */

'use client';

import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
        backgroundColor: 'error.light',
        border: '1px solid',
        borderColor: 'error.main',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="error.main" gutterBottom sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>

          <Typography variant="body2" color="text.primary" paragraph>
            {suggestion}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {onRetry && (
              <Button variant="contained" color="primary" onClick={onRetry} size="small">
                重新上传
              </Button>
            )}

            <Link href={policyLink} passHref legacyBehavior>
              <Button component="a" variant="text" color="primary" size="small">
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
