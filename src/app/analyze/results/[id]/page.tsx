'use client';

import { useState } from 'react';
import {
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
      >
        <DialogTitle id="template-modal-title">保存模板</DialogTitle>
        <DialogContent data-testid="template-modal">
          <Box sx={{ color: '#475569', pt: 1 }}>
            模板保存能力正在完善中。当前版本可先通过分析页复制结果使用。
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateModal(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
