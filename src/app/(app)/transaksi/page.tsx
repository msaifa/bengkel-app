'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Transaksi } from '@/types/transaksi';
import { fetchAllTransaksi } from '@/services/transaksi.service';
import TransaksiList from '@/components/transaksi/TransaksiList';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError } from '@/components/common/AppSnackbar';

export default function TransaksiPage() {
  const router = useRouter();
  const [items, setItems] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllTransaksi();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data transaksi.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box>
      <TransaksiList items={items} loading={loading}
        onAdd={() => router.push('/transaksi/tambah')}
        onCancel={(item) => router.push(`/transaksi/${item.id}`)} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />

      {/* FAB — di atas bottom navigation bar */}
      <Fab
        color="primary"
        aria-label="Transaksi Baru"
        onClick={() => router.push('/transaksi/tambah')}
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
