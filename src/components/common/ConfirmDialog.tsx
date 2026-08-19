'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  confirmColor = 'error',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-lg)' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.0625rem', pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.9375rem', color: 'var(--color-body)' }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            color: 'var(--color-mute)',
            borderRadius: 'var(--rounded-md)',
            fontWeight: 600,
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          color={confirmColor}
          variant="contained"
          sx={{ borderRadius: 'var(--rounded-md)', fontWeight: 700 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
