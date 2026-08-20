'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Transaksi } from '@/types/transaksi';
import { fetchTransaksiById, cancelTransaksiService, TransaksiValidationError } from '@/services/transaksi.service';
import { useAuth } from '@/hooks/useAuth';
import TransaksiDetail from '@/components/transaksi/TransaksiDetail';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackSuccess, snackError } from '@/components/common/AppSnackbar';

export default function TransaksiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>(
    searchParams.get('success') === '1'
      ? { open: true, message: 'Transaksi berhasil diselesaikan.', severity: 'success' }
      : SNACKBAR_CLOSED
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTransaksiById(id);
        if (!cancelled) setTransaksi(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data transaksi.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleCancel(reason: string) {
    if (!user || !transaksi) return;
    try {
      await cancelTransaksiService(transaksi.id, reason, user.uid);
      setSnackbar(snackSuccess('Transaksi berhasil dibatalkan dan stok telah dikembalikan.'));
      const updated = await fetchTransaksiById(id);
      setTransaksi(updated);
    } catch (err) {
      if (err instanceof TransaksiValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal membatalkan transaksi. Silakan coba kembali.'));
      console.error(err);
      throw err;
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!transaksi) return <Box sx={{ py: 4 }}><Typography sx={{ color: 'var(--color-mute)', textAlign: 'center' }}>Transaksi tidak ditemukan.</Typography></Box>;

  return (
    <Box>
      <TransaksiDetail transaksi={transaksi} onCancel={handleCancel} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />
    </Box>
  );
}
