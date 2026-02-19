/**
 * 服务条款对话框组件
 *
 * Story 4-1: 内容审核功能
 * AC-2: 用户在首次使用时需同意服务条款
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

interface TermsDialogProps {
  /**
   * 是否打开
   */
  open: boolean;

  /**
   * 同意回调
   */
  onAgree: () => Promise<void>;

  /**
   * 取消回调
   */
  onCancel: () => void;
}

/**
 * 服务条款对话框
 *
 * 首次使用时显示，包含 AI 使用透明度说明
 */
export function TermsDialog({ open, onAgree, onCancel }: TermsDialogProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAgree = async () => {
    if (!isChecked) return;

    setIsLoading(true);
    try {
      await onAgree();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setIsChecked(false);
      setIsLoading(false);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{ className: 'ia-glass-card ia-glass-card--heavy ia-glass-card--lg' }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          服务条款与 AI 使用声明
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            1. 服务说明
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            本服务使用人工智能（AI）技术对您上传的图片进行风格分析和美学评估。AI 分析结果仅供参考，
            不构成专业建议。
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            2. AI 透明度声明
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            我们承诺对 AI 的使用保持透明：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              所有分析结果均由 AI 模型生成，会明确标注“AI 分析结果”
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              AI 分析可能存在误差或偏差，不应用于关键决策
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              您的图片数据仅用于提供分析服务，不会用于训练 AI 模型（除非您明确同意）
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            3. 用户责任
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            您需要确保上传的图片：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              拥有合法的使用权利
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              不包含违法、暴力、色情等不当内容
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              不侵犯他人的隐私权或版权
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            4. 数据保留与删除
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            根据您的订阅等级，上传的图片将保留不同时间：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Free 用户：30 天
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Lite 用户：60 天
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Standard 用户：90 天
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            删除账户时，所有数据将立即清除。
          </Typography>
        </Box>

        <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 2 }}>
          <Typography variant="body2" color="text.primary">
            <strong>重要：</strong>
            继续使用本服务即表示您同意遵守以上条款。如果您不同意，请点击“取消”退出。
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 3 }}>
        <Box sx={{ width: '100%' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                我已阅读并同意服务条款和 AI 使用声明
              </Typography>
            }
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} sx={{ color: 'text.primary' }} disabled={isLoading}>
              取消
            </Button>
            <Button
              onClick={handleAgree}
              variant="contained"
              color="primary"
              disabled={!isChecked || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? '处理中...' : '同意并继续'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
