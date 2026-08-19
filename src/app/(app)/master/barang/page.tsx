'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Barang, BarangFormData } from '@/types/master';
import { fetchAllBarang, createBarangService, updateBarangService, setBarangActiveService, DuplicateKodeError } from '@/services/barang.service';
import { useAuth } from '@/hooks/useAuth';
import BarangForm from '@/components/master/barang/BarangForm';
import BarangList from '@/components/master/barang/BarangList';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackSuccess, snackError } from '@/components/common/AppSnackbar';

type StatusFilter = 'aktif' | 'nonaktif' | 'semua';

export default function MasterBarangPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('aktif');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Barang | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Barang | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const data = await fetchAllBarang();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data barang.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchStatus = statusFilter === 'semua' || (statusFilter === 'aktif' && item.isActive) || (statusFilter === 'nonaktif' && !item.isActive);
      const matchSearch = !q || item.kode.toLowerCase().includes(q) || item.nama.toLowerCase().includes(q) || item.kategori.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [items, search, statusFilter]);

  function openCreate() { setEditTarget(null); setFormOpen(true); }
  function openEdit(item: Barang) { setEditTarget(item); setFormOpen(true); }

  async function handleFormSubmit(data: BarangFormData) {
    if (!user) return;
    try {
      if (editTarget) {
        await updateBarangService(editTarget.id, data, user.uid);
        setSnackbar(snackSuccess('Barang berhasil diperbarui.'));
      } else {
        await createBarangService(data, user.uid);
        setSnackbar(snackSuccess('Barang berhasil ditambahkan.'));
      }
      setFormOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      if (err instanceof DuplicateKodeError) throw err;
      setSnackbar(snackError('Gagal menyimpan data. Silakan coba kembali.'));
      throw err;
    }
  }

  function openConfirm(item: Barang) { setConfirmTarget(item); setConfirmOpen(true); }

  async function handleConfirm() {
    if (!confirmTarget || !user) return;
    setConfirmLoading(true);
    try {
      await setBarangActiveService(confirmTarget.id, !confirmTarget.isActive, user.uid);
      setSnackbar(snackSuccess(`Barang berhasil ${confirmTarget.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`));
      setConfirmOpen(false);
      setRefreshKey((k) => k + 1);
    } catch { setSnackbar(snackError('Gagal mengubah status barang.')); }
    finally { setConfirmLoading(false); }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography component="h1" className="page-title">Master Barang</Typography>
          <Typography className="page-subtitle">Kelola barang yang digunakan dan dijual di bengkel.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-on-dark)', borderRadius: 'var(--rounded-md)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { bgcolor: 'var(--color-primary-pressed)' } }}>
          Tambah Barang
        </Button>
      </Box>

      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <TextField placeholder="Cari kode, nama, kategori..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'var(--color-ash)' }} /></InputAdornment> } }}
            sx={{ mb: 1.5 }} />
        </Box>
        <Tabs value={statusFilter} onChange={(_, v) => setStatusFilter(v as StatusFilter)}
          sx={{ px: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none' }, '& .Mui-selected': { color: 'var(--color-primary)' }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label="Aktif" value="aktif" />
          <Tab label="Nonaktif" value="nonaktif" />
          <Tab label="Semua" value="semua" />
        </Tabs>
      </Box>

      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', overflow: 'hidden' }}>
        <BarangList items={filtered} loading={loading} onEdit={openEdit} onToggleActive={openConfirm} onAdd={openCreate} />
      </Box>

      <BarangForm key={`${formOpen}-${editTarget?.id ?? 'new'}`} open={formOpen} editData={editTarget} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} />
      <ConfirmDialog open={confirmOpen}
        title={confirmTarget?.isActive ? 'Nonaktifkan Barang?' : 'Aktifkan Barang?'}
        description={confirmTarget?.isActive ? `Barang "${confirmTarget?.nama}" tidak akan muncul pada pilihan transaksi baru. Data lama tidak akan dihapus.` : `Barang "${confirmTarget?.nama}" akan aktif kembali dan dapat digunakan pada transaksi.`}
        confirmLabel={confirmTarget?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        confirmColor={confirmTarget?.isActive ? 'error' : 'primary'}
        loading={confirmLoading} onConfirm={handleConfirm} onCancel={() => setConfirmOpen(false)} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />
    </Box>
  );
}
