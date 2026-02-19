'use client';

import { useState } from 'react';
import {
  Alert,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Chip,
  Box,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { useUserInfo } from '../../hooks/useUserInfo';
import { useAuth } from '../../hooks/useAuth';
import { CreditDisplay } from '@/features/credits/components/CreditDisplay';
import { DeleteAccountDialog } from '../DeleteAccountDialog';

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const open = Boolean(anchorEl);
  const { user, isLoading } = useUserInfo();
  const { signOut, isSigningOut } = useAuth();
  const isMobile = useMediaQuery('(max-width:767px)');
  const menuId = isMobile ? 'user-menu-mobile' : 'user-menu-desktop';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut();
  };

  const handleOpenDeleteDialog = () => {
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async (payload: { confirmation: string; reAuthToken: string }) => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responsePayload?.error?.message ?? '删除账户失败，请重试');
      }

      setDeleteDialogOpen(false);
      setDeleteSuccessOpen(true);
      handleClose();
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await signOut();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : '删除账户失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !user) {
    return null;
  }

  const menuBody = isMobile ? (
    <Menu
      id={menuId}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            minWidth: 200,
            mt: 1,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          },
        },
      }}
    >
      <MenuItem onClick={handleClose}>
        <Avatar src={user.image ?? undefined} alt={user.name} data-testid="user-menu-large-avatar" sx={{ width: 64, height: 64, mr: 2 }}>
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} data-testid="user-menu-name">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" data-testid="user-menu-email">
            {user.email}
          </Typography>
        </Box>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleOpenDeleteDialog} data-testid="user-menu-delete-account">
        <Typography color="error">删除账户</Typography>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleSignOut} disabled={isSigningOut} data-testid="user-menu-sign-out">
        <Typography color="text.primary">{isSigningOut ? '登出中...' : '登出'}</Typography>
      </MenuItem>
    </Menu>
  ) : (
    <Menu
      id={menuId}
      aria-labelledby="user-menu-button"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            minWidth: 280,
            mt: 1,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          },
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar src={user.image ?? undefined} alt={user.name} data-testid="user-menu-large-avatar" sx={{ width: 64, height: 64, mb: 1 }}>
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} data-testid="user-menu-name">
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" data-testid="user-menu-email">
          {user.email}
        </Typography>
      </Box>

      <Divider />

      <MenuItem disabled>
        <Box data-testid="user-menu-credit-balance">
          <CreditDisplay creditBalance={user.creditBalance} />
        </Box>
      </MenuItem>

      <MenuItem disabled>
        <Chip label={`${user.subscriptionTier} 等级`} size="small" color="default" data-testid="user-menu-subscription-tier" />
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleOpenDeleteDialog} data-testid="user-menu-delete-account">
        <Typography color="error">删除账户</Typography>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleSignOut} disabled={isSigningOut} data-testid="user-menu-sign-out">
        <Typography color="text.primary">{isSigningOut ? '登出中...' : '登出'}</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <Avatar
        src={user.image ?? undefined}
        alt={user.name}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        data-testid="user-menu-avatar"
        aria-label="用户菜单"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        sx={{
          width: 48,
          height: 48,
          cursor: 'pointer',
          '&:focus-visible': {
            outline: '2px solid #3B82F6',
            outlineOffset: 2,
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s ease',
          },
        }}
      >
        {user.name?.charAt(0).toUpperCase()}
      </Avatar>
      {menuBody}

      <DeleteAccountDialog
        open={deleteDialogOpen}
        isDeleting={isDeleting}
        userEmail={user.email}
        errorMessage={deleteError}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={deleteSuccessOpen}
        autoHideDuration={5000}
        onClose={() => setDeleteSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{
            width: '100%',
            bgcolor: 'var(--glass-text-gray-heavy)',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          账户已删除，感谢您使用我们的服务
        </Alert>
      </Snackbar>
    </>
  );
}
