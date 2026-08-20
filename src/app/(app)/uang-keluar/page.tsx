'use client';

import { useEffect, useState } from 'react';
import { Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { UangKeluar, UangKeluarFormData } from '@/types/uangKeluar';
import { fetchAllUangKeluar, createUangKeluarService, UangKeluarValidationError } from '@/services/uangKeluar.service';
import { useAuth } from '@/hooks/useAuth';
import UangKeluarList from '@/components/uang-keluar/UangKeluarList';
import UangKeluarForm from '@/components/uang-keluar/UangKeluarForm';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError, snackSuccess } from '@/components/common/AppSnackbar';

export default function UangKeluarPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<UangKeluar[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllUangKeluar();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data pengeluaran.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(data: UangKeluarFormData) {
    if (!user) return;
    try {
      await createUangKeluarService(data, user.uid);
      const updated = await fetchAllUangKeluar();
      setItems(updated);
      setSnackbar(snackSuccess('Pengeluaran berhasil dicatat.'));
      setFormOpen(false);
    } catch (err) {
      if (err instanceof UangKeluarValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal menyimpan pengeluaran. Silakan coba kembali.'));
      console.error(err);
      throw err;
    }
  }

  return (
    <Box>

      <UangKeluarList items={items} loading={loading} onAdd={() => setFormOpen(true)} />

      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />

      <UangKeluarForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />

      <Fab
        color="primary"
        aria-label="Tambah Pengeluaran"
        onClick={() => setFormOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(96px + env(safe-area-inset-bottom, 0px))', md: 24 },
          right: { xs: 16, md: 32 },
          bgcolor: 'var(--color-primary)',
          color: 'var(--color-on-dark)',
          '&:hover': { bgcolor: 'var(--color-primary-pressed)' },
          zIndex: 1100,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
