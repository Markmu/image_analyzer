/**
 * 分享对话框组件
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Share2,
  X,
  Twitter,
  MessageCircle,
  Radio,
  BookOpen,
  Link,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { SocialPlatform, ShareOptions, PlatformConfig } from '../../types/social-share';
import { SOCIAL_PLATFORMS, DEFAULT_HASHTAGS } from '../../lib/platform-configs';
import { shareToSocialPlatform, generateShareText, nativeShare, supportsWebShareAPI } from '../../lib/social-share';
import { RewardNotification } from '../RewardNotification';
import { useRewardsStore } from '../../stores/rewards.store';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  templateName?: string;
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  [SocialPlatform.TWITTER]: <Twitter size={32} />,
  [SocialPlatform.WECHAT]: <MessageCircle size={32} />,
  [SocialPlatform.WEIBO]: <Radio size={32} />,
  [SocialPlatform.XIAOHONGSHU]: <BookOpen size={32} />,
  [SocialPlatform.LINK]: <Link size={32} />,
};

export function ShareDialog({
  open,
  onClose,
  imageUrl,
  templateName,
}: ShareDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [shareText, setShareText] = useState(generateShareText(templateName));
  const [copied, setCopied] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewardsStore = useRewardsStore();

  // 重置状态当对话框打开时
  useEffect(() => {
    if (open) {
      setShareText(generateShareText(templateName));
      setError(null);
      setLoading(false);
    }
  }, [open, templateName]);

  const handlePlatformSelect = async (platform: SocialPlatform) => {
    setLoading(true);
    setError(null);

    try {
      // 移动端优先使用原生分享
      if (supportsWebShareAPI() && /Mobile|Android|iPhone/i.test(navigator.userAgent)) {
        const result = await nativeShare({
          platform,
          imageUrl,
          text: shareText,
          title: 'AI 生成的图片',
        });

        if (result.success) {
          // 触发奖励检查
          const shareResult = await shareToSocialPlatform({
            platform,
            imageUrl,
            text: shareText,
            title: 'AI 生成的图片',
          }, imageUrl);

          if (shareResult.reward) {
            setLastReward(shareResult.reward);
            setRewardOpen(true);
          }

          onClose();
          return;
        } else {
          // 原生分享失败，回退到平台特定分享
          setError(result.error || '原生分享失败，将使用其他方式分享');
        }
      }

      // 桌面端或原生分享不支持/失败，使用平台特定分享
      const shareResult = await shareToSocialPlatform({
        platform,
        imageUrl,
        text: shareText,
        hashtags: DEFAULT_HASHTAGS,
      }, imageUrl);

      if (shareResult.success) {
        // 显示奖励通知
        if (shareResult.reward) {
          setLastReward(shareResult.reward);
          setRewardOpen(true);
        }
        // 微信分享需要特殊提示
        if (platform === SocialPlatform.WECHAT) {
          setError('链接已复制，请打开微信粘贴分享');
          setTimeout(() => {
            if (shareResult.reward) {
              setLastReward(shareResult.reward);
              setRewardOpen(true);
            }
            onClose();
          }, 2000);
        } else {
          onClose();
        }
      } else {
        // 显示错误信息
        setError(shareResult.error || '分享失败，请重试');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分享失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await shareToSocialPlatform({
        platform: SocialPlatform.LINK,
        imageUrl,
        text: shareText,
      });

      if (result.success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError(result.error || '复制链接失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制链接失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'ia-glass-card',
        sx: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <Typography variant="h6" className="flex items-center gap-2">
          <Share2 className="text-blue-500" size={24} />
          分享到社交媒体
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent className="space-y-6">
        {/* 错误提示 */}
        {error && (
          <Alert
            severity="error"
            icon={<AlertCircle size={20} />}
            onClose={() => setError(null)}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                重试
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* 平台选择 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            选择平台
          </Typography>
          <Grid container spacing={2}>
            {(Object.values(SOCIAL_PLATFORMS) as PlatformConfig[]).map((platform) => (
              <Grid item xs={3} key={platform.id}>
                <Button
                  fullWidth
                  onClick={() => handlePlatformSelect(platform.id)}
                  disabled={loading}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    height: '100px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: `${platform.color}20`,
                    },
                  }}
                >
                  <Box sx={{ color: platform.color }}>
                    {PLATFORM_ICONS[platform.id]}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {platform.name}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 分享文案 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            分享文案(可编辑)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            placeholder="输入你想说的话..."
            helperText={`标签: ${DEFAULT_HASHTAGS.join(' ')}`}
            disabled={loading}
          />
        </Box>

        {/* 图片预览 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            图片预览
          </Typography>
          <Box
            component="img"
            src={imageUrl}
            alt="Preview"
            sx={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions className="p-4 gap-2">
        <Button
          onClick={handleCopyLink}
          variant="outlined"
          startIcon={loading ? <CircularProgress size={18} /> : copied ? <Copy size={18} /> : <Link size={18} />}
          disabled={loading}
        >
          {copied ? '已复制' : '复制链接'}
        </Button>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          取消
        </Button>
      </DialogActions>

      <RewardNotification
        open={rewardOpen}
        onClose={() => setRewardOpen(false)}
        reward={lastReward}
        totalPoints={rewardsStore.totalPoints}
        level={rewardsStore.level}
      />
    </Dialog>
  );
}
