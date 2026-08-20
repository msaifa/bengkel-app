'use client';

import { Box, Chip } from '@mui/material';
import { PeriodKey, PERIOD_OPTIONS } from '@/utils/period';

interface Props {
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
}

export default function PeriodChips({ value, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      {PERIOD_OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <Chip
            key={opt.key}
            label={opt.label}
            size="small"
            onClick={() => onChange(opt.key)}
            sx={{
              fontWeight: active ? 700 : 500,
              fontSize: '0.75rem',
              bgcolor: active ? 'var(--color-primary)' : 'var(--color-surface-soft, #f6f6f3)',
              color: active ? '#fff' : 'var(--color-mute)',
              border: '1px solid',
              borderColor: active ? 'var(--color-primary)' : 'var(--color-hairline)',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: active ? 'var(--color-primary-pressed)' : 'var(--color-hairline)',
              },
            }}
          />
        );
      })}
    </Box>
  );
}
