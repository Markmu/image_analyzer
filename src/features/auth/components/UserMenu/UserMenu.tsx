'use client';

import { useState } from 'react';
import {
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Chip,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useUserInfo } from '../../hooks/useUserInfo';
import { CreditDisplay } from '@/features/credits/components/CreditDisplay';
import { SignOutButton } from '../SignOutButton';

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, isLoading } = useUserInfo();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:767px)');

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

  if (isLoading || !user) {
    return null;
  }

  if (isMobile) {
    // 移动端简化菜单 - 仅头像和登出按钮
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
          sx={{
            width: 48,
            height: 48,
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-2px)',
              transition: 'transform 0.2s ease',
            },
          }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                minWidth: 200,
                mt: 1,
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              },
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <Avatar
              src={user.image ?? undefined}
              alt={user.name}
              data-testid="user-menu-large-avatar"
              sx={{ width: 64, height: 64, mr: 2 }}
            >
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

          <MenuItem onClick={handleClose}>
            <SignOutButton />
          </MenuItem>
        </Menu>
      </>
    );
  }

  // 桌面端完整菜单
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
        sx={{
          width: 48,
          height: 48,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s ease',
          },
        }}
      >
        {user.name?.charAt(0).toUpperCase()}
      </Avatar>

      <Menu
        id="user-menu"
        aria-labelledby="user-menu-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 280,
              mt: 1,
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            },
          },
        }}
      >
        {/* 用户信息区域 */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar
            src={user.image ?? undefined}
            alt={user.name}
            data-testid="user-menu-large-avatar"
            sx={{ width: 64, height: 64, mb: 1 }}
          >
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

        {/* Credit 余额 - 使用 Story 1-2 的组件 */}
        <MenuItem disabled>
          <Box data-testid="user-menu-credit-balance">
            <CreditDisplay creditBalance={user.creditBalance} />
          </Box>
        </MenuItem>

        {/* 订阅状态 */}
        <MenuItem disabled>
          <Chip
            label={`${user.subscriptionTier} 等级`}
            size="small"
            color="default"
            data-testid="user-menu-subscription-tier"
          />
        </MenuItem>

        <Divider />

        {/* 登出按钮 - 使用 Story 1-3 的组件 */}
        <MenuItem onClick={handleClose} data-testid="user-menu-sign-out">
          <SignOutButton />
        </MenuItem>
      </Menu>
    </>
  );
}
