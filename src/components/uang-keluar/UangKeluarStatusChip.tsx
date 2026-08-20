'use client';

import { Chip } from '@mui/material';
import { UangKeluarStatus } from '@/types/uangKeluar';

interface Props {
  status: UangKeluarStatus;
  size?: 'small' | 'medium';
}

export default function UangKeluarStatusChip({ status, size = 'small' }: Props) {
  if (status === 'cancelled') {
    return (
      <Chip
        label="Dibatalkan"
        size={size}
        sx={{
          bgcolor: '#fdecea',
          color: 'error.main',
          fontWeight: 700,
          fontSize: size === 'small' ? '0.7rem' : '0.8125rem',
          border: '1px solid',
          borderColor: 'error.light',
        }}
      />
    );
  }
  return (
    <Chip
      label="Tercatat"
      size={size}
      sx={{
        bgcolor: 'var(--color-success-pale, #c7f0da)',
        color: 'success.main',
        fontWeight: 700,
        fontSize: size === 'small' ? '0.7rem' : '0.8125rem',
        border: '1px solid',
        borderColor: 'success.light',
      }}
    />
  );
}
