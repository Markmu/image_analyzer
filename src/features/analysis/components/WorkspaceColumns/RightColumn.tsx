'use client';

import { Box, Button, Typography } from '@mui/material';
import { Check, Clipboard, SquarePen } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import TemplatePreview from '@/features/analysis/components/TemplatePreview';
import VariableReplacer from '@/features/analysis/components/VariableReplacer';
import type { AnalysisData } from '@/types/analysis';

type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error';

interface RightColumnProps {
  status: AnalysisStatus;
  analysisData: AnalysisData | null;
  templateContent: string;
  renderedTemplate: string;
  copied: boolean;
  variables: Record<string, string>;
  isMobileLayout: boolean;
  onCopyTemplate: () => Promise<void>;
  onVariableChange: (key: string, value: string) => void;
}

export default function RightColumn({
  status,
  analysisData,
  templateContent,
  renderedTemplate,
  copied,
  variables,
  isMobileLayout,
  onCopyTemplate,
  onVariableChange,
}: RightColumnProps) {
  if (status !== 'completed' || !analysisData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="workspace-right-column">
        <EmptyState
          title="等待分析完成"
          description="分析结果完成后，系统会在右侧自动生成可直接复用的模版内容。"
          icon={<SquarePen size={34} />}
          testId="right-column-empty"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="workspace-right-column">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box className="ia-glass-card ia-glass-card--static" sx={{ p: 2.5 }}>
          <Box className="ia-glass-card ia-glass-card--active" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => void onCopyTemplate()}
              startIcon={copied ? <Check size={18} /> : <Clipboard size={18} />}
              data-testid="copy-template-button"
              sx={{ bgcolor: 'var(--glass-text-primary)', color: 'var(--glass-text-white-heavy)', '&:hover': { bgcolor: 'var(--primary-active)' } }}
            >
              {copied ? '已复制！' : '一键复制'}
            </Button>
          </Box>
          <TemplatePreview content={renderedTemplate} />
        </Box>

        <CollapsibleSection title="变量替换" defaultExpanded storageKey="template-variables">
          {isMobileLayout ? (
            <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
              移动端已隐藏高级变量替换，桌面端可编辑变量并实时预览。
            </Typography>
          ) : (
            <VariableReplacer
              template={templateContent}
              values={variables}
              onValueChange={onVariableChange}
            />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="质量信息" defaultExpanded={false} storageKey="quality-meta">
          <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-medium)' }}>
            当前整体置信度：{(analysisData.overallConfidence * 100).toFixed(0)}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block', mt: 1 }}>
            结果将根据你的反馈持续优化。
          </Typography>
        </CollapsibleSection>
      </Box>
    </Box>
  );
}
