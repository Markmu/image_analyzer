/**
 * AI 透明度标识组件
 *
 * Story 4-1: 内容审核功能
 * AC-5: 系统可以在 UI 上清晰标注 AI 驱动的分析
 */

'use client';

import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Bot, Info } from 'lucide-react';

interface AITransparencyBadgeProps {
  /**
   * 是否显示详细信息
   */
  showDetails?: boolean;

  /**
   * 自定义消息
   */
  message?: string;

  /**
   * 尺寸
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * AI 透明度标识徽章
 *
 * 用于标识 AI 生成的内容，符合 AI 透明度规范
 */
export function AITransparencyBadge({
  showDetails = false,
  message = 'AI 分析结果',
  size = 'medium',
}: AITransparencyBadgeProps) {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const textVariant = size === 'small' ? 'caption' : size === 'large' ? 'body1' : 'body2';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        padding: size === 'small' ? '2px 8px' : '4px 12px',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 2,
        fontSize: textVariant === 'caption' ? '0.75rem' : textVariant === 'body1' ? '1rem' : '0.875rem',
      }}
    >
      <Bot size={iconSize} aria-hidden="true" />
      <Typography variant={textVariant} sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
      {showDetails ? (
        <Tooltip title="此分析由 AI 模型生成，仅供参考" arrow>
          <IconButton
            aria-label="AI 透明度说明"
            size="small"
            sx={{
              padding: 0.5,
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Info size={16} aria-hidden="true" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}

/**
 * AI 免责声明组件
 */
export function AIDisclaimer() {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: 'info.light',
        borderRadius: 2,
        marginTop: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        <strong>AI 透明度声明：</strong>
        本分析结果由人工智能模型生成，仅供参考。AI 分析可能存在误差或偏差，不构成专业建议。
        如需准确信息，请咨询相关领域的专业人士。
      </Typography>
    </Box>
  );
}
