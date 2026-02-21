'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import { Sparkles } from 'lucide-react';

export default function AnalyzeResultPage() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom data-testid="results-header">
        风格分析结果
      </Typography>

      <Paper
        data-testid="style-result"
        elevation={1}
        sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Photorealistic
        </Typography>
        <Chip
          data-testid="confidence-badge"
          label="置信度 94%"
          color="success"
          variant="outlined"
        />
      </Paper>

      <Button
        data-testid="save-template-btn"
        onClick={() => setShowTemplateModal(true)}
        variant="contained"
        sx={{ minHeight: 44 }}
      >
        保存为模板
      </Button>

      <Dialog
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        aria-labelledby="template-modal-title"
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: 'ia-glass-card ia-glass-card--heavy ia-glass-card--lg ia-glass-card--static',
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backgroundImage: 'linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.94) 100%)',
            border: '1px solid var(--glass-border-white-heavy)',
            boxShadow: '0 14px 48px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            transition: 'var(--glass-transition)',
            '&:hover': {
              transform: 'none',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              backgroundImage: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.97) 100%)',
              borderColor: 'rgba(248, 250, 252, 0.32)',
              boxShadow: '0 18px 56px rgba(2, 6, 23, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            },
          },
        }}
      >
        <DialogTitle
          id="template-modal-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'var(--glass-text-white-heavy)',
            fontWeight: 700,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--glass-bg-blue-medium)',
              border: '1px solid var(--glass-border-active)',
            }}
          >
            <Sparkles size={16} color="var(--glass-text-primary)" />
          </Box>
          保存模板
        </DialogTitle>
        <DialogContent
          data-testid="template-modal"
          sx={{
            borderTop: '1px solid var(--glass-border-white-light)',
            pt: 2,
          }}
        >
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              border: '1px solid var(--glass-border)',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
            }}
          >
            <Typography sx={{ color: 'var(--glass-text-white-medium)', fontWeight: 600 }}>
              演示说明
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-medium)', mt: 0.5, display: 'block' }}>
              该弹窗展示“保存模板”的规范化结构：标题、说明区、操作区三段式布局。
            </Typography>
          </Box>
          <Alert
            severity="info"
            sx={{
              mt: 1.5,
              color: 'var(--glass-text-white-heavy)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
            }}
          >
            模板保存能力正在完善中。当前版本可先通过分析页右侧“保存模版”完成真实保存流程。
          </Alert>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid var(--glass-border-white-light)', p: 2.5 }}>
          <Button
            onClick={() => setShowTemplateModal(false)}
            sx={{ color: 'var(--glass-text-gray-medium)' }}
          >
            关闭
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowTemplateModal(false)}
            sx={{
              bgcolor: 'var(--glass-text-primary)',
              color: 'var(--glass-text-white-heavy)',
              '&:hover': { bgcolor: 'var(--primary-active)' },
            }}
          >
            我知道了
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
