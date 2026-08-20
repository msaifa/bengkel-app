'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { Barang } from '@/types/master';
import { PembelianFormData } from '@/types/pembelian';
import { fetchAllBarang } from '@/services/barang.service';
import { createPembelianService, PembelianValidationError } from '@/services/pembelian.service';
import { useAuth } from '@/hooks/useAuth';
import PembelianForm from '@/components/pembelian/PembelianForm';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError } from '@/components/common/AppSnackbar';

export default function TambahPembelianPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAllBarang();
        if (!cancelled) setBarangList(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data barang.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(data: PembelianFormData) {
    if (!user) return;
    try {
      const id = await createPembelianService(data, user.uid);
      router.push(`/barang-masuk/${id}?success=1`);
    } catch (err) {
      if (err instanceof PembelianValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal menyimpan pembelian. Silakan coba kembali.'));
      console.error(err);
      throw err;
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <PembelianForm barangList={barangList} onSubmit={handleSubmit} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />
    </Box>
  );
}
