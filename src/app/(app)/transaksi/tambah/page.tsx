'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Barang, Jasa, Paket } from '@/types/master';
import { TransaksiFormData } from '@/types/transaksi';
import { fetchAllBarang } from '@/services/barang.service';
import { fetchAllJasa } from '@/services/jasa.service';
import { fetchAllPaket } from '@/services/paket.service';
import { fetchInventoryView } from '@/services/inventory.service';
import { createTransaksiService, TransaksiValidationError } from '@/services/transaksi.service';
import { useAuth } from '@/hooks/useAuth';
import TransaksiForm from '@/components/transaksi/TransaksiForm';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError, snackSuccess } from '@/components/common/AppSnackbar';

export default function TambahTransaksiPage() {
  const { user } = useAuth();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [jasaList, setJasaList] = useState<Jasa[]>([]);
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [barang, jasa, paket, invView] = await Promise.all([
          fetchAllBarang(), fetchAllJasa(), fetchAllPaket(), fetchInventoryView(),
        ]);
        if (!cancelled) {
          setBarangList(barang);
          setJasaList(jasa);
          setPaketList(paket);
          const map = new Map(invView.map((iv) => [iv.barangId, iv.currentStock]));
          setInventoryMap(map);
        }
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: TransaksiFormData) {
    if (!user) return;
    try {
      await createTransaksiService(data, user.uid);
      // Refresh inventory map setelah transaksi berhasil
      const invView = await fetchInventoryView();
      setInventoryMap(new Map(invView.map((iv) => [iv.barangId, iv.currentStock])));
      setSnackbar(snackSuccess('Transaksi berhasil disimpan!'));
      setFormKey((k) => k + 1);
    } catch (err) {
      if (err instanceof TransaksiValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal menyimpan transaksi. Silakan coba kembali.'));
      console.error(err);
      throw err;
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <TransaksiForm key={formKey} barangList={barangList} jasaList={jasaList} paketList={paketList} inventoryMap={inventoryMap} onSubmit={handleSubmit} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />
    </Box>
  );
}
