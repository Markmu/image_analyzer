/**
 * Confidence Explanation Component
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * Provides explanation for confidence scores
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CircleHelp,
  CircleCheck,
  TriangleAlert,
  CircleX,
  Info,
} from 'lucide-react';

interface ConfidenceExplanationProps {
  /** 显示方式 */
  variant?: 'tooltip' | 'dialog';
  /** 触发元素（用于 tooltip 模式） */
  children?: React.ReactNode;
}

/**
 * 置信度等级说明
 */
const CONFIDENCE_LEVELS = [
  {
    range: '80-100%',
    level: '高置信度',
    description: '分析结果非常可靠，可以放心使用',
    icon: <CircleCheck size={20} color="#22c55e" aria-hidden="true" />,
    color: 'success.main' as const,
  },
  {
    range: '60-79%',
    level: '中等置信度',
    description: '分析结果基本可靠，但建议复核',
    icon: <TriangleAlert size={20} color="#f59e0b" aria-hidden="true" />,
    color: 'warning.main' as const,
  },
  {
    range: '40-59%',
    level: '低置信度',
    description: '分析结果可能不准确，建议重新分析',
    icon: <CircleX size={20} color="#ef4444" aria-hidden="true" />,
    color: 'error.main' as const,
  },
  {
    range: '0-39%',
    level: '极低置信度',
    description: '分析结果不可靠，必须重新分析',
    icon: <CircleX size={20} color="#ef4444" aria-hidden="true" />,
    color: 'error.main' as const,
  },
];

/**
 * 置信度说明组件（对话框模式）
 */
function ConfidenceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Info size={20} color="#22c55e" aria-hidden="true" />
          <Typography variant="h6">置信度说明</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography paragraph>
          置信度分数表示 AI 对分析结果的确定程度。分数越高，结果越可靠。
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          置信度等级：
        </Typography>

        <List>
          {CONFIDENCE_LEVELS.map((item) => (
            <ListItem key={item.range} alignItems="flex-start">
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="bold">
                      {item.level}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({item.range})
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            影响置信度的因素：
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 图片清晰度和质量
            <br />
            • 图片内容的复杂度
            <br />
            • 使用的 AI 模型
            <br />
            • 分析维度的特征明显程度
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          如果置信度过低，系统会建议您重新分析。重新分析不会扣除额外 credit。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          知道了
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * 置信度说明组件
 */
export default function ConfidenceExplanation({
  variant = 'tooltip',
  children,
}: ConfidenceExplanationProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  if (variant === 'dialog') {
    return (
      <>
        <IconButton
          size="small"
          onClick={() => setDialogOpen(true)}
          aria-label="置信度说明"
        >
          <CircleHelp size={16} aria-hidden="true" />
        </IconButton>
        <ConfidenceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </>
    );
  }

  // Tooltip 模式
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="caption" fontWeight="bold">
            置信度说明
          </Typography>
          <Typography variant="caption" display="block">
            分数越高，结果越可靠
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            • 80-100%: 高置信度
          </Typography>
          <Typography variant="caption" display="block">
            • 60-79%: 中等置信度
          </Typography>
          <Typography variant="caption" display="block">
            • &lt;60%: 低置信度
          </Typography>
        </Box>
      }
      arrow
    >
      {children ? (
        <>{children}</>
      ) : (
        <IconButton size="small" aria-label="置信度说明">
          <CircleHelp size={16} aria-hidden="true" />
        </IconButton>
      )}
    </Tooltip>
  );
}
