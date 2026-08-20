'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Pembelian } from '@/types/pembelian';
import { fetchPembelianById, cancelPembelianService, PembelianValidationError } from '@/services/pembelian.service';
import { useAuth } from '@/hooks/useAuth';
import PembelianDetail from '@/components/pembelian/PembelianDetail';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackSuccess, snackError } from '@/components/common/AppSnackbar';

export default function PembelianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [pembelian, setPembelian] = useState<Pembelian | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>(
    searchParams.get('success') === '1'
      ? { open: true, message: 'Pembelian berhasil disimpan dan stok telah ditambahkan.', severity: 'success' }
      : SNACKBAR_CLOSED
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPembelianById(id);
        if (!cancelled) setPembelian(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data pembelian.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleCancel(reason: string) {
    if (!user || !pembelian) return;
    try {
      await cancelPembelianService(pembelian.id, reason, user.uid);
      setSnackbar(snackSuccess('Pembelian berhasil dibatalkan dan stok telah disesuaikan.'));
      // Reload
      const updated = await fetchPembelianById(id);
      setPembelian(updated);
    } catch (err) {
      if (err instanceof PembelianValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal membatalkan pembelian. Silakan coba kembali.'));
      console.error(err);
      throw err;
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!pembelian) return <Box sx={{ py: 4 }}><Typography sx={{ color: 'var(--color-mute)', textAlign: 'center' }}>Pembelian tidak ditemukan.</Typography></Box>;

  return (
    <Box>
      <PembelianDetail pembelian={pembelian} onCancel={handleCancel} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />
    </Box>
  );
}
