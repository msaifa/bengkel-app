'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { UangKeluar } from '@/types/uangKeluar';
import { fetchUangKeluarById, cancelUangKeluarService, UangKeluarValidationError } from '@/services/uangKeluar.service';
import { useAuth } from '@/hooks/useAuth';
import UangKeluarDetail from '@/components/uang-keluar/UangKeluarDetail';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError, snackSuccess } from '@/components/common/AppSnackbar';

export default function UangKeluarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [item, setItem] = useState<UangKeluar | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchUangKeluarById(id);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data pengeluaran.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleCancel(reason: string) {
    if (!user) return;
    try {
      await cancelUangKeluarService(id, reason, user.uid);
      // Reload fresh data
      const updated = await fetchUangKeluarById(id);
      setItem(updated);
      setSnackbar(snackSuccess('Pengeluaran berhasil dibatalkan.'));
    } catch (err) {
      if (err instanceof UangKeluarValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal membatalkan pengeluaran. Silakan coba kembali.'));
      console.error(err);
      throw err;
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!item) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>Pengeluaran tidak ditemukan</Typography>
        <Button onClick={() => router.push('/uang-keluar')} startIcon={<ArrowBackIcon />}>
          Kembali ke Daftar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/uang-keluar')}
        sx={{ mb: 2, color: 'var(--color-mute)', fontWeight: 600 }}
      >
        Uang Keluar
      </Button>

      <UangKeluarDetail item={item} onCancel={handleCancel} />

      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />
    </Box>
  );
}
