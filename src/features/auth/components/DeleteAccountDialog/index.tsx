'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

interface DeleteAccountDialogProps {
  open: boolean;
  isDeleting: boolean;
  userEmail?: string;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (payload: { confirmation: string; reAuthToken: string }) => Promise<void> | void;
}

export function DeleteAccountDialog({
  open,
  isDeleting,
  userEmail,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const [reAuthToken, setReAuthToken] = useState('');

  const canConfirm = useMemo(
    () => confirmation.trim() === 'DELETE_MY_ACCOUNT' && reAuthToken.trim().length > 0 && !isDeleting,
    [confirmation, isDeleting, reAuthToken],
  );

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm({
      confirmation: confirmation.trim(),
      reAuthToken: reAuthToken.trim(),
    });
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmation('');
    setReAuthToken('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-account-dialog-title"
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: 'ia-glass-card ia-glass-card--heavy ia-glass-card--lg' }}
      data-testid="delete-account-dialog"
    >
      <DialogTitle id="delete-account-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span aria-hidden="true">!</span>
        删除账户
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>警告</AlertTitle>
          确定要删除账户吗？此操作不可撤销
        </Alert>

        <DialogContentText component="div">
          <Typography component="p">删除后将永久清除以下数据：</Typography>
          <ul>
            <li>所有图片将被删除</li>
            <li>所有分析记录将被删除</li>
            <li>所有模版将被删除</li>
            <li>Credit 余额将被清零</li>
          </ul>
        </DialogContentText>

        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
          请输入 <strong>DELETE_MY_ACCOUNT</strong> 以确认删除：
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE_MY_ACCOUNT"
          disabled={isDeleting}
          data-testid="delete-account-confirm-input"
        />

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          请输入当前登录邮箱以完成身份确认：
        </Typography>
        <TextField
          fullWidth
          size="small"
          type="email"
          value={reAuthToken}
          onChange={(e) => setReAuthToken(e.target.value)}
          placeholder={userEmail ?? 'your@email.com'}
          disabled={isDeleting}
          data-testid="delete-account-reauth-input"
        />

        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 2 }} data-testid="delete-account-error-message">
            {errorMessage}
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isDeleting}
          sx={{ color: 'text.primary' }}
          data-testid="delete-account-cancel-button"
        >
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={!canConfirm}
          startIcon={isDeleting ? <CircularProgress size={16} /> : null}
          data-testid="delete-account-confirm-button"
        >
          {isDeleting ? '删除中...' : '确定删除'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
