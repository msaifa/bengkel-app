'use client';

import { useMemo, useState } from 'react';
import {
  Box, CircularProgress, InputAdornment, Paper, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { InventoryView, StockStatus } from '@/types/pembelian';
import EmptyState from '@/components/common/EmptyState';
import StokStatusChip from './StokStatusChip';
import { useRouter } from 'next/navigation';

interface Props {
  items: InventoryView[];
  loading: boolean;
}

type Filter = 'semua' | StockStatus;

export default function StokList({ items, loading }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('semua');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((it) => {
      const matchFilter = filter === 'semua' || it.status === filter;
      const matchSearch = !q ||
        it.kode.toLowerCase().includes(q) ||
        it.nama.toLowerCase().includes(q) ||
        it.kategori.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [items, search, filter]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <TextField placeholder="Cari kode, nama, kategori..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'var(--color-ash)' }} /></InputAdornment> } }}
            sx={{ mb: 1.5 }} />
        </Box>
        <Tabs value={filter} onChange={(_, v) => setFilter(v as Filter)}
          sx={{ px: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none' }, '& .Mui-selected': { color: 'var(--color-primary)' }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label="Semua" value="semua" />
          <Tab label="Aman" value="aman" />
          <Tab label="Menipis" value="menipis" />
          <Tab label="Habis" value="habis" />
        </Tabs>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
          <EmptyState
            title={items.length === 0 ? 'Belum ada barang' : 'Tidak ada hasil'}
            description={items.length === 0 ? 'Tambahkan Master Barang terlebih dahulu sebelum mengelola stok.' : 'Coba ubah kata kunci atau filter.'}
            actionLabel={items.length === 0 ? 'Ke Master Barang' : undefined}
            onAction={items.length === 0 ? () => router.push('/master/barang') : undefined}
          />
        </Box>
      ) : (
        <>
          {/* Desktop Table */}
          <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', bgcolor: 'var(--color-surface)', borderBottom: '1px solid var(--color-hairline)' } }}>
                  <TableCell>Kode</TableCell>
                  <TableCell>Barang</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Satuan</TableCell>
                  <TableCell align="right">Stok Saat Ini</TableCell>
                  <TableCell align="right">Stok Minimum</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((it) => (
                  <TableRow key={it.barangId} sx={{ '& td': { fontSize: '0.875rem', borderBottom: '1px solid var(--color-hairline)' } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{it.kode}</TableCell>
                    <TableCell>{it.nama}</TableCell>
                    <TableCell sx={{ color: 'var(--color-mute)' }}>{it.kategori || '—'}</TableCell>
                    <TableCell>{it.satuan}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: it.status === 'habis' ? 'error.main' : it.status === 'menipis' ? 'warning.main' : 'inherit' }}>
                      {it.currentStock}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'var(--color-mute)' }}>{it.stokMinimum}</TableCell>
                    <TableCell align="center"><StokStatusChip status={it.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((it) => (
              <Box key={it.barangId} sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-mute)' }}>{it.kode}</Typography>
                  <StokStatusChip status={it.status} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 1.5 }}>{it.nama}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Stok</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: it.status === 'habis' ? 'error.main' : it.status === 'menipis' ? 'warning.main' : 'inherit' }}>
                    {it.currentStock} {it.satuan}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Minimum</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>{it.stokMinimum} {it.satuan}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
