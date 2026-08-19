'use client';

import { Alert, Snackbar } from '@mui/material';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface AppSnackbarProps {
  state: SnackbarState;
  onClose: () => void;
}

export const SNACKBAR_CLOSED: SnackbarState = {
  open: false,
  message: '',
  severity: 'success',
};

export function snackSuccess(message: string): SnackbarState {
  return { open: true, message, severity: 'success' };
}

export function snackError(message: string): SnackbarState {
  return { open: true, message, severity: 'error' };
}

export default function AppSnackbar({ state, onClose }: AppSnackbarProps) {
  return (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={state.severity}
        variant="filled"
        sx={{ borderRadius: 'var(--rounded-md)', fontWeight: 500 }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
}
