/**
 * 版权同意组件
 *
 * Story 4-1: 内容审核功能
 * AC-1: 用户在上传图片前需确认拥有使用权利
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  FormControl,
  FormHelperText,
} from '@mui/material';

interface CopyrightConsentProps {
  /**
   * 是否已确认
   */
  checked: boolean;

  /**
   * 确认状态改变回调
   */
  onChange: (checked: boolean) => void;

  /**
   * 是否显示错误
   */
  showError?: boolean;
}

/**
 * 版权同意确认组件
 *
 * 用户必须确认拥有图片的使用权利才能上传
 */
export function CopyrightConsent({ checked, onChange, showError = false }: CopyrightConsentProps) {
  return (
    <FormControl error={showError && !checked} component="fieldset" sx={{ width: '100%' }}>
      <Box
        sx={{
          padding: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: showError && !checked ? '1px solid' : 'none',
          borderColor: showError && !checked ? 'error.main' : 'transparent',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.primary">
              我确认拥有此图片的使用权利，或已获得合法授权使用此图片。我理解上传未经授权的内容可能违反版权法。
            </Typography>
          }
        />
        <Box sx={{ marginTop: 1, paddingLeft: 4 }}>
          <Typography variant="caption" color="text.secondary">
            了解更多：
            <Link href="/copyright-policy" target="_blank" rel="noopener noreferrer">
              版权政策
            </Link>
            {' | '}
            <Link href="/terms-of-service" target="_blank" rel="noopener noreferrer">
              服务条款
            </Link>
          </Typography>
        </Box>
        {showError && !checked && (
          <FormHelperText error>请确认您拥有图片的使用权利</FormHelperText>
        )}
      </Box>
    </FormControl>
  );
}

/**
 * 带状态的版权同意包装器
 */
export function CopyrightConsentWrapper() {
  const [checked, setChecked] = useState(false);

  return <CopyrightConsent checked={checked} onChange={setChecked} />;
}
