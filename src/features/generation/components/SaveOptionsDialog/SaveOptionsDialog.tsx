/**
 * 保存选项对话框组件
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  TextField,
} from '@mui/material';
import { Download, Save, X } from 'lucide-react';
import { ImageFormat, ImageResolutionOption, ImageSaveOptions } from '../types/save';
import { SUPPORTED_FORMATS, RESOLUTION_OPTIONS, DEFAULT_QUALITY } from '../lib/save-constants';

interface SaveOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (options: ImageSaveOptions) => void;
  defaultFilename?: string;
}

export function SaveOptionsDialog({
  open,
  onClose,
  onSave,
  defaultFilename,
}: SaveOptionsDialogProps) {
  const [format, setFormat] = useState<ImageFormat>(ImageFormat.PNG);
  const [quality, setQuality] = useState<number>(DEFAULT_QUALITY);
  const [resolution, setResolution] = useState<ImageResolutionOption>('original');
  const [filename, setFilename] = useState(defaultFilename || '');

  const handleSave = () => {
    const options: ImageSaveOptions = {
      format,
      quality: format === ImageFormat.JPEG ? quality : undefined,
      resolution,
      filename: filename || undefined,
    };
    onSave(options);
    onClose();
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
            onChange={(e) => setFilename(e.target.value)}
            placeholder="image_20250220_143000"
            helperText="留空则使用默认名称"
          />
        </Box>
      </DialogContent>

      <DialogActions className="p-4 gap-2">
        <Button onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Download size={18} />}
          className="bg-blue-500 hover:bg-blue-600"
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
