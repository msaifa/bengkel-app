'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/lib/firebase/config';

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email atau password salah.';
      case 'auth/invalid-email':
        return 'Format email tidak valid.';
      case 'auth/user-disabled':
        return 'Akun ini telah dinonaktifkan.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Coba lagi nanti.';
      case 'auth/network-request-failed':
        return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      default:
        return 'Login gagal. Silakan coba lagi.';
    }
  }
  return 'Terjadi kesalahan yang tidak diketahui.';
}

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      console.error('[Login] error:', err);
      setError(getLoginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'var(--color-surface-soft)',
        }}
      >
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  if (user) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'var(--color-surface-soft)',
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          bgcolor: 'var(--color-canvas)',
          borderRadius: 'var(--rounded-lg)',
          p: { xs: 3, sm: 4 },
          boxShadow: '0 16px 48px rgba(0,0,0,0.10)',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{
              fontSize: 'var(--text-heading-lg-size)',
              fontWeight: 'var(--text-heading-lg-weight)',
              lineHeight: 'var(--text-heading-lg-lh)',
              color: 'var(--color-ink)',
              mb: 0.5,
            }}
          >
            Bengkel
          </Typography>
          <Typography
            sx={{
              fontSize: 'var(--text-body-md-size)',
              color: 'var(--color-mute)',
              lineHeight: 'var(--text-body-md-lh)',
            }}
          >
            Masuk ke aplikasi
          </Typography>
        </Box>

        {!isFirebaseConfigured && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 'var(--rounded-md)', fontSize: '0.875rem' }}
          >
            Konfigurasi Firebase belum lengkap. Pastikan file{' '}
            <strong>.env.local</strong> sudah diisi dengan benar.
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 'var(--rounded-md)', fontSize: '0.875rem' }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            autoComplete="email"
            autoFocus
            disabled={submitting || !isFirebaseConfigured}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            autoComplete="current-password"
            disabled={submitting || !isFirebaseConfigured}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting || !isFirebaseConfigured}
            sx={{
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-on-dark)',
              borderRadius: 'var(--rounded-md)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              py: 1.25,
              '&:hover': { bgcolor: 'var(--color-primary-pressed)' },
              '&:active': { bgcolor: 'var(--color-primary-pressed)' },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Masuk'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
