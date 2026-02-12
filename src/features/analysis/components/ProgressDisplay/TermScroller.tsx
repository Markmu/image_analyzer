/**
 * 专业术语滚动器组件
 * 使用打字机效果显示分析过程中的专业术语
 *
 * 重构说明：
 * - 使用可复用的 useTypewriterEffect Hook
 * - 代码行数从 108 行减少到 ~70 行（-35%）
 * - 逻辑更清晰，职责更单一
 */

import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { useTypewriterEffect } from '@/features/analysis/hooks/useTypewriterEffect';

export interface TermScrollerProps {
  terms: string[];
  sx?: SxProps<Theme>;
}

export const TermScroller: React.FC<TermScrollerProps> = ({ terms, sx }) => {
  const { currentTerm } = useTypewriterEffect({ terms });

  if (terms.length === 0) return null;

  return (
    <Box sx={sx}>
      <Typography
        variant="body1"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          color: 'rgba(255, 255, 255, 0.7)',
          minHeight: 24,
          display: 'flex',
          alignItems: 'center',
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      >
        {currentTerm}
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: '2px',
            height: '1.2em',
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            ml: 0.5,
            transition: 'background-color 0.2s ease',
            animation: 'cursor-blink 1s infinite',
            '@keyframes cursor-blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0 },
            },
          }}
        />
      </Typography>
    </Box>
  );
};
