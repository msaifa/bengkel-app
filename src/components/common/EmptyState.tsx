'use client';

import { Box, Button, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <InboxIcon sx={{ fontSize: 48, color: 'var(--color-stone)', mb: 2 }} />
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--color-ink)',
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: 'var(--color-mute)',
          maxWidth: 320,
          lineHeight: 1.5,
          mb: actionLabel ? 3 : 0,
        }}
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            bgcolor: 'var(--color-primary)',
            color: 'var(--color-on-dark)',
            borderRadius: 'var(--rounded-md)',
            fontWeight: 700,
            '&:hover': { bgcolor: 'var(--color-primary-pressed)' },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
