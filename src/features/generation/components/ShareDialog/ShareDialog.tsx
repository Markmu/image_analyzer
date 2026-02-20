/**
 * 分享对话框组件
 */

import { useState } from 'react';
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
} from 'lucide-react';
import { SocialPlatform, ShareOptions } from '../types/social-share';
import { SOCIAL_PLATFORMS, DEFAULT_HASHTAGS } from '../lib/platform-configs';
import { shareToSocialPlatform, generateShareText, nativeShare, supportsWebShareAPI } from '../lib/social-share';

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

  const handlePlatformSelect = async (platform: SocialPlatform) => {
    // 移动端优先使用原生分享
    if (supportsWebShareAPI() && /Mobile|Android|iPhone/i.test(navigator.userAgent)) {
      const result = await nativeShare({
        platform,
        imageUrl,
        text: shareText,
        title: 'AI 生成的图片',
      });

      if (result.success) {
        onClose();
        return;
      }
    }

    // 桌面端或原生分享不支持,使用平台特定分享
    if (platform === SocialPlatform.WECHAT) {
      // 微信需要二维码,显示二维码对话框
      setSelectedPlatform(platform);
    } else {
      const result = await shareToSocialPlatform({
        platform,
        imageUrl,
        text: shareText,
        hashtags: DEFAULT_HASHTAGS,
      });

      if (result.success) {
        onClose();
      }
    }
  };

  const handleCopyLink = async () => {
    const result = await shareToSocialPlatform({
      platform: SocialPlatform.LINK,
      imageUrl,
      text: shareText,
    });

    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent className="space-y-6">
        {/* 平台选择 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            选择平台
          </Typography>
          <Grid container spacing={2}>
            {Object.values(SOCIAL_PLATFORMS).map((platform) => (
              <Grid item xs={3} key={platform.id}>
                <Button
                  fullWidth
                  onClick={() => handlePlatformSelect(platform.id)}
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
          startIcon={copied ? <Copy size={18} /> : <Link size={18} />}
        >
          {copied ? '已复制' : '复制链接'}
        </Button>
        <Button onClick={onClose} variant="outlined">
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
}
