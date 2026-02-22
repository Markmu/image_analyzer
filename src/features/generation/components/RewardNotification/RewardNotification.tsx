/**
 * 奖励通知组件
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Gift,
  X,
  Award,
  TrendingUp,
} from 'lucide-react';
import { ShareReward } from '../../types/rewards';

interface RewardNotificationProps {
  open: boolean;
  onClose: () => void;
  reward: ShareReward | null;
  totalPoints: number;
  level: string;
}

export function RewardNotification({
  open,
  onClose,
  reward,
  totalPoints,
  level,
}: RewardNotificationProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open && reward) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [open, reward]);

  if (!reward) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'ia-glass-card',
        sx: {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <Typography variant="h6" className="flex items-center gap-2">
          <Gift className="text-yellow-500" size={28} />
          恭喜获得奖励!
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent className="space-y-4">
        {/* 奖励金额动画 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          <Box
            sx={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#fbbf24',
              transform: showAnimation ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            +{reward.amount}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Award size={20} className="text-purple-500" />
            <Typography variant="body1" color="textSecondary">
              积分
            </Typography>
          </Box>
        </Box>

        {/* 奖励详情 */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {reward.isFirstTime ? '🎉 首次分享奖励!' : '每日分享奖励'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            分享到: {reward.source}
          </Typography>
        </Box>

        {/* 累计积分 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box>
            <Typography variant="body2" color="textSecondary">
              累计积分
            </Typography>
            <Typography variant="h6" color="primary">
              {totalPoints}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp size={20} className="text-green-500" />
            <Typography variant="body2" color="textSecondary">
              等级: {level}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="p-4">
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7c3aed, #db2777)',
            },
          }}
        >
          太棒了!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
