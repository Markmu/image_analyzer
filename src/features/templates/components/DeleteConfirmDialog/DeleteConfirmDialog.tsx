/**
 * 删除确认对话框组件
 * Epic 7 - Story 7.2: Template Library
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  templateTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  templateTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'var(--glass-bg-dark-heavy)',
          border: '1px solid var(--glass-border-white-light)',
          borderRadius: 2,
        },
      }}
      data-testid="delete-confirm-dialog"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'var(--glass-text-white-heavy)',
          fontWeight: 600,
        }}
      >
        <AlertTriangle size={24} className="text-red-500" />
        确认删除模版
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: 'var(--glass-text-gray-medium)', mb: 1 }}>
          您确定要删除以下模版吗？
        </Typography>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 1,
            mt: 2,
          }}
          data-testid="delete-template-title"
        >
          <Typography
            sx={{
              color: 'var(--glass-text-white-heavy)',
              fontWeight: 600,
            }}
          >
            {templateTitle}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 2,
            color: 'var(--glass-text-gray-heavy)',
          }}
        >
          注意：此操作不可撤销，模版将被永久删除。
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onCancel}
          sx={{
            color: 'var(--glass-text-gray-medium)',
          }}
          data-testid="delete-cancel-button"
        >
          取消
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            backgroundColor: '#ef4444',
            '&:hover': {
              backgroundColor: '#dc2626',
            },
          }}
          data-testid="delete-confirm-button"
        >
          确认删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}
