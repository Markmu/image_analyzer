'use client';

import { Box, Chip, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { ImageIcon } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { ImageUploader } from '@/features/analysis/components/ImageUploader';
import ImagePreview from '@/features/analysis/components/ImagePreview';
import type { ImageData } from '@/features/analysis/components/ImageUploader/types';

export interface AnalysisModelOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  isDefault: boolean;
  enabled: boolean;
  requiresTier: 'free' | 'lite' | 'standard';
  isLocked: boolean;
}

interface LeftColumnProps {
  imageData: ImageData | null;
  models: AnalysisModelOption[];
  modelsLoading: boolean;
  selectedModelId: string;
  selectedModelDescription?: string;
  onModelChange: (modelId: string) => void;
  onUploadSuccess: (imageData: ImageData) => void;
  onUploadError: (error: string, errorCode?: string) => void;
  onAutoStartAnalysis: (imageData: ImageData) => void;
}

export default function LeftColumn({
  imageData,
  models,
  modelsLoading,
  selectedModelId,
  selectedModelDescription,
  onModelChange,
  onUploadSuccess,
  onUploadError,
  onAutoStartAnalysis,
}: LeftColumnProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box className="ia-glass-card" sx={{ p: 2 }}>
        <ImageUploader
          onUploadSuccess={onUploadSuccess}
          onUploadError={onUploadError}
          onAutoStartAnalysis={onAutoStartAnalysis}
        />
      </Box>

      {imageData ? (
        <ImagePreview imageData={imageData} />
      ) : (
        <EmptyState
          title="等待参考图"
          description="拖拽或选择图片后，左侧会持续保留预览，方便你与分析结果对照。"
          icon={<ImageIcon size={34} />}
          testId="left-column-empty"
        />
      )}

      <Box className="ia-glass-card" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f8fafc', mb: 1, fontWeight: 700 }}>
          分析模型
        </Typography>
        <FormControl fullWidth size="small" disabled={modelsLoading || models.length === 0}>
          <InputLabel id="analysis-model-select-label">分析模型</InputLabel>
          <Select
            labelId="analysis-model-select-label"
            label="分析模型"
            value={selectedModelId}
            onChange={(event) => onModelChange(event.target.value)}
            data-testid="analysis-model-select"
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id} disabled={model.isLocked}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {model.name}
                  </Typography>
                  {model.isDefault && <Chip size="small" label="默认" />}
                  {model.isLocked && <Chip size="small" color="warning" label={`需 ${model.requiresTier}`} />}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedModelDescription && (
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block' }}>
            {selectedModelDescription}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
