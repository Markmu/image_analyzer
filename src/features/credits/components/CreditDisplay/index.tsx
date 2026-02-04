'use client';

/**
 * Credit Display Component
 *
 * Epic 1 - Story 1.2: 用户注册与 Credit 奖励
 *
 * Displays user's credit balance.
 * Features:
 * - Shows "30 credits" format
 * - Alternative format: "3 次使用剩余"
 * - Real-time updates from database
 */

import { Typography, Box } from '@mui/material';
import { useEffect, useState } from 'react';

export interface CreditDisplayProps {
  creditBalance?: number;
  showUsageFormat?: boolean;
  variant?: 'h6' | 'body1' | 'body2';
  color?: 'primary' | 'success' | 'textPrimary';
}

export function CreditDisplay({
  creditBalance = 0,
  showUsageFormat = false,
  variant = 'body1',
  color = 'success',
}: CreditDisplayProps) {
  const [balance, setBalance] = useState(creditBalance);

  useEffect(() => {
    setBalance(creditBalance);
  }, [creditBalance]);

  // Calculate usage count (1 usage = 10 credits)
  const usageCount = Math.floor(balance / 10);

  if (showUsageFormat) {
    return (
      <Box data-testid="credit-usage">
        <Typography variant={variant} color={color}>
          {usageCount} 次使用剩余
        </Typography>
      </Box>
    );
  }

  return (
    <Box data-testid="credit-balance">
      <Typography variant={variant} color={color}>
        {balance} credits
      </Typography>
    </Box>
  );
}
