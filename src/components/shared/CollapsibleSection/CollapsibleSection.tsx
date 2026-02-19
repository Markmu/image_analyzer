'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Box, Collapse, IconButton, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleSectionProps {
  title: string;
  defaultExpanded: boolean;
  children: ReactNode;
  onToggle?: (expanded: boolean) => void;
  storageKey?: string;
}

const STORAGE_PREFIX = 'workspace-collapsed-';

export default function CollapsibleSection({
  title,
  defaultExpanded,
  children,
  onToggle,
  storageKey,
}: CollapsibleSectionProps) {
  const resolvedStorageKey = useMemo(() => {
    if (!storageKey) return null;
    return `${STORAGE_PREFIX}${storageKey}`;
  }, [storageKey]);

  const [expanded, setExpanded] = useState(() => {
    if (!resolvedStorageKey || typeof window === 'undefined') {
      return defaultExpanded;
    }

    try {
      const savedValue = window.localStorage.getItem(resolvedStorageKey);
      if (savedValue === null) {
        return defaultExpanded;
      }
      return savedValue !== 'true';
    } catch {
      return defaultExpanded;
    }
  });

  const handleToggle = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    onToggle?.(nextExpanded);

    if (!resolvedStorageKey) return;

    try {
      window.localStorage.setItem(resolvedStorageKey, String(!nextExpanded));
    } catch {
      // Ignore localStorage write failures.
    }
  };

  return (
    <Box className="ia-glass-card ia-glass-card--static" sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--glass-text-white-medium)' }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={handleToggle}
          aria-label={expanded ? `收起${title}` : `展开${title}`}
          sx={{
            color: 'var(--glass-text-gray-medium)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 300ms ease',
          }}
        >
          <ChevronDown size={18} />
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout={300}>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}
