'use client';

import { Chip } from '@mui/material';

interface StatusChipProps {
  isActive: boolean;
}

export default function StatusChip({ isActive }: StatusChipProps) {
  return (
    <Chip
      label={isActive ? 'Aktif' : 'Nonaktif'}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.6875rem',
        borderRadius: '9999px',
        bgcolor: isActive ? 'rgba(16,60,37,0.10)' : 'rgba(0,0,0,0.07)',
        color: isActive ? 'var(--color-success-deep)' : 'var(--color-mute)',
        border: 'none',
      }}
    />
  );
}
