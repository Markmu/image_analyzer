/**
 * 保存选项对话框组件
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Download, Save, X } from 'lucide-react';
import { ImageFormat, ImageResolutionOption, ImageSaveOptions } from '../types/save';
import { SUPPORTED_FORMATS, RESOLUTION_OPTIONS, DEFAULT_QUALITY } from '../lib/save-constants';

interface SaveOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (options: ImageSaveOptions) => void;
  defaultFilename?: string;
  // 可选：保存到历史记录的回调
  onSaveToHistory?: (options: ImageSaveOptions) => void;
}

export function SaveOptionsDialog({
  open,
  onClose,
  onSave,
  defaultFilename,
  onSaveToHistory,
}: SaveOptionsDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [format, setFormat] = useState<ImageFormat>(ImageFormat.PNG);
  const [quality, setQuality] = useState<number>(DEFAULT_QUALITY);
  const [resolution, setResolution] = useState<ImageResolutionOption>('original');
  const [filename, setFilename] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 当对话框打开且 defaultFilename 变化时，重置文件名
  useEffect(() => {
    if (open && defaultFilename) {
      setFilename(defaultFilename);
    }
  }, [open, defaultFilename]);

  // 对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSaveError(null);
      setRetryCount(0);
    }
  }, [open]);

  // 过滤文件名：只允许字母、数字、中文、下划线和连字符
  const handleFilenameChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '');
    setFilename(sanitized);
  };

  const handleSave = async () => {
    setSaveError(null);
    const options: ImageSaveOptions = {
      format,
      quality: format === ImageFormat.JPEG ? quality : undefined,
      resolution,
      filename: filename || undefined,
    };

    try {
      await onSave(options);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
      }
    }
  };

  const handleSaveToHistory = async () => {
    if (!onSaveToHistory) return;

    setSaveError(null);
    const options: ImageSaveOptions = {
      format,
      quality: format === ImageFormat.JPEG ? quality : undefined,
      resolution,
      filename: filename || undefined,
    };

    try {
      await onSaveToHistory(options);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存到历史记录失败');
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
      }
    }
  };

  // 移动端适配样式
  const paperProps = useMemo(() => ({
    className: 'ia-glass-card',
    sx: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      // 移动端全屏显示，从底部弹出
      ...(isMobile && {
        position: 'fixed',
        bottom: 0,
        margin: 0,
        borderRadius: '16px 16px 0 0',
        maxWidth: '100%',
        width: '100%',
      }),
    },
  }), [isMobile]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={paperProps}
    >
      <DialogTitle className="flex items-center justify-between">
        <Typography variant="h6" className="flex items-center gap-2">
          <Save className="text-blue-500" size={24} />
          保存选项
        </Typography>
        <Button onClick={onClose} size="small">
          <X size={20} />
        </Button>
      </DialogTitle>

      <DialogContent className="space-y-6">
        {/* 格式选择 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            格式
          </Typography>
          <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as ImageFormat)}>
            {SUPPORTED_FORMATS.map((fmt) => (
              <FormControlLabel
                key={fmt.value}
                value={fmt.value}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2">{fmt.label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {fmt.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </Box>

        {/* 质量选择 (仅 JPEG) */}
        {format === ImageFormat.JPEG && (
          <Box>
            <Typography variant="subtitle2" className="mb-3 text-gray-700">
              质量: {quality}%
            </Typography>
            <Slider
              value={quality}
              onChange={(_, value) => setQuality(value as number)}
              min={70}
              max={100}
              step={5}
              valueLabelDisplay="auto"
              sx={{
                background: 'linear-gradient(to right, #ef4444, #22c55e)',
                height: 8,
                borderRadius: 4,
                '& .MuiSlider-thumb': {
                  borderRadius: '50%',
                },
              }}
            />
          </Box>
        )}

        {/* 分辨率选择 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            分辨率
          </Typography>
          <RadioGroup value={resolution} onChange={(e) => setResolution(e.target.value as ImageResolutionOption)}>
            {RESOLUTION_OPTIONS.map((res) => (
              <FormControlLabel
                key={res.value}
                value={res.value}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2">{res.label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {res.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </Box>

        {/* 文件名 */}
        <Box>
          <Typography variant="subtitle2" className="mb-3 text-gray-700">
            文件名(可选)
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={filename}
            onChange={(e) => handleFilenameChange(e.target.value)}
            placeholder="image_20250220_143000"
            helperText="留空则使用默认名称，只允许字母、数字、中文、下划线和连字符"
            inputProps={{ maxLength: 100 }}
          />
        </Box>

        {/* 错误提示 */}
        {saveError && (
          <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
            {saveError}
            {retryCount < 3 && (
              <Button
                size="small"
                onClick={() => {
                  setSaveError(null);
                  handleSave();
                }}
                sx={{ ml: 1 }}
              >
                重试 ({retryCount}/3)
              </Button>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions className="p-4 gap-2 flex-wrap">
        {onSaveToHistory && (
          <Button
            onClick={handleSaveToHistory}
            variant="outlined"
            startIcon={<Save size={18} />}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            保存到历史
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Download size={18} />}
          className="bg-blue-500 hover:bg-blue-600"
        >
          下载
        </Button>
      </DialogActions>
    </Dialog>
  );
}
