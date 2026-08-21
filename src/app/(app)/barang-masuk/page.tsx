'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Fab, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import { Pembelian, InventoryView, StockMovement } from '@/types/pembelian';
import { fetchAllPembelian } from '@/services/pembelian.service';
import { fetchInventoryView, fetchRecentMovements } from '@/services/inventory.service';
import PembelianList from '@/components/pembelian/PembelianList';
import StokList from '@/components/stok/StokList';
import StokMovementList from '@/components/stok/StokMovementList';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError } from '@/components/common/AppSnackbar';

type ActiveTab = 'pembelian' | 'stok' | 'riwayat';

export default function BarangMasukPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveTab | null) ?? 'pembelian';

  const [tab, setTab] = useState<ActiveTab>(initialTab);
  const [pembelianItems, setPembelianItems] = useState<Pembelian[]>([]);
  const [stokItems, setStokItems] = useState<InventoryView[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingPembelian, setLoadingPembelian] = useState(true);
  const [loadingStok, setLoadingStok] = useState(false);
  const [loadingMovement, setLoadingMovement] = useState(false);
  const [stokLoaded, setStokLoaded] = useState(false);
  const [movementLoaded, setMovementLoaded] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  // Load pembelian on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingPembelian(true);
      try {
        const data = await fetchAllPembelian();
        if (!cancelled) setPembelianItems(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data pembelian.'));
      } finally {
        if (!cancelled) setLoadingPembelian(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Load stok lazily
  useEffect(() => {
    if (tab !== 'stok' || stokLoaded) return;
    let cancelled = false;
    async function load() {
      setLoadingStok(true);
      try {
        const data = await fetchInventoryView();
        if (!cancelled) { setStokItems(data); setStokLoaded(true); }
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data stok.'));
      } finally {
        if (!cancelled) setLoadingStok(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tab, stokLoaded]);

  // Load riwayat lazily
  useEffect(() => {
    if (tab !== 'riwayat' || movementLoaded) return;
    let cancelled = false;
    async function load() {
      setLoadingMovement(true);
      try {
        const data = await fetchRecentMovements(100);
        if (!cancelled) { setMovements(data); setMovementLoaded(true); }
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat riwayat pergerakan.'));
      } finally {
        if (!cancelled) setLoadingMovement(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tab, movementLoaded]);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as ActiveTab)}
        sx={{ mb: 3, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', gap: 0.75 }, '& .Mui-selected': { color: 'var(--color-primary)' }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}
      >
        <Tab icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Pembelian" value="pembelian" />
        <Tab icon={<InventoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Stok Saat Ini" value="stok" />
        <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Riwayat" value="riwayat" />
      </Tabs>

      {tab === 'pembelian' && (
        <PembelianList
          items={pembelianItems}
          loading={loadingPembelian}
          onAdd={() => router.push('/barang-masuk/tambah')}
          onCancel={(item) => router.push(`/barang-masuk/${item.id}`)}
        />
      )}
      {tab === 'stok' && <StokList items={stokItems} loading={loadingStok} />}
      {tab === 'riwayat' && <StokMovementList items={movements} loading={loadingMovement} />}

      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />

      {/* FAB — hanya tampil di tab Pembelian */}
      {tab === 'pembelian' && (
        <Fab
          color="primary"
          aria-label="Tambah Pembelian"
          onClick={() => router.push('/barang-masuk/tambah')}
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
      )}
    </Box>
  );
}
