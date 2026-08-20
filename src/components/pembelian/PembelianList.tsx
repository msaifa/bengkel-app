'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, CircularProgress, IconButton, InputAdornment,
  MenuItem, Paper, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import Menu from '@mui/material/Menu';
import { Pembelian } from '@/types/pembelian';
import { formatCurrency, formatDate } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState';
import DateRangeFilter, { DateRange, isInDateRange, monthStartString, todayString } from '@/components/common/DateRangeFilter';
import PembelianStatusChip from './PembelianStatusChip';

interface Props {
  items: Pembelian[];
  loading: boolean;
  onAdd: () => void;
  onCancel: (item: Pembelian) => void;
}

type Filter = 'semua' | 'posted' | 'cancelled';

export default function PembelianList({ items, loading, onAdd, onCancel }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('semua');
  const [dateRange, setDateRange] = useState<DateRange>({ start: monthStartString(), end: todayString() });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<Pembelian | null>(null);

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    const matchFilter = filter === 'semua' || it.status === filter;
    const matchPeriod = isInDateRange(it.tanggalPembelian, dateRange);
    const matchSearch = !q ||
      it.nomorPembelian.toLowerCase().includes(q) ||
      (it.supplierName ?? '').toLowerCase().includes(q) ||
      (it.nomorReferensi ?? '').toLowerCase().includes(q);
    return matchFilter && matchPeriod && matchSearch;
  });

  function openMenu(e: React.MouseEvent<HTMLElement>, item: Pembelian) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(item);
  }
  function closeMenu() { setMenuAnchor(null); setMenuTarget(null); }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {/* Search + Filter */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              placeholder="Cari nomor, supplier, nota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small" fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'var(--color-ash)' }} /></InputAdornment> } }}
            />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </Box>
        </Box>
        <Tabs value={filter} onChange={(_, v) => setFilter(v as Filter)}
          sx={{ px: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none' }, '& .Mui-selected': { color: 'var(--color-primary)' }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label="Semua" value="semua" />
          <Tab label="Diposting" value="posted" />
          <Tab label="Dibatalkan" value="cancelled" />
        </Tabs>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
          <EmptyState
            title={items.length === 0 ? 'Belum ada pembelian' : 'Tidak ada hasil'}
            description={items.length === 0 ? 'Catat pembelian pertama untuk menambahkan stok barang.' : 'Coba ubah kata kunci atau filter.'}
            actionLabel={items.length === 0 ? 'Tambah Pembelian' : undefined}
            onAction={items.length === 0 ? onAdd : undefined}
          />
        </Box>
      ) : (
        <>
          {/* Desktop Table */}
          <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', bgcolor: 'var(--color-surface)', borderBottom: '1px solid var(--color-hairline)' } }}>
                  <TableCell>No. Pembelian</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell align="center">Jml Item</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((it) => (
                  <TableRow key={it.id} hover onClick={() => router.push(`/barang-masuk/${it.id}`)}
                    sx={{ cursor: 'pointer', '& td': { fontSize: '0.875rem', borderBottom: '1px solid var(--color-hairline)' } }}>
                    <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{it.nomorPembelian}</TableCell>
                    <TableCell>{formatDate(it.tanggalPembelian)}</TableCell>
                    <TableCell sx={{ color: it.supplierName ? 'inherit' : 'var(--color-ash)' }}>{it.supplierName || '—'}</TableCell>
                    <TableCell align="center">{it.totalItem}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(it.total)}</TableCell>
                    <TableCell align="center"><PembelianStatusChip status={it.status} /></TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => openMenu(e, it)}><MoreVertIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((it) => (
              <Box key={it.id} onClick={() => router.push(`/barang-masuk/${it.id}`)}
                sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 2, cursor: 'pointer', '&:active': { opacity: 0.8 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'monospace' }}>{it.nomorPembelian}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PembelianStatusChip status={it.status} />
                    <IconButton size="small" onClick={(e) => openMenu(e, it)}><MoreVertIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 0.5 }}>{formatDate(it.tanggalPembelian)}</Typography>
                {it.supplierName && <Typography sx={{ fontSize: '0.875rem', mb: 0.5 }}>{it.supplierName}</Typography>}
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 1 }}>{it.totalItem} item</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(it.total)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-md)', minWidth: 160 } } }}>
        <MenuItem onClick={() => { router.push(`/barang-masuk/${menuTarget?.id}`); closeMenu(); }}>Lihat Detail</MenuItem>
        {menuTarget?.status === 'posted' && (
          <MenuItem onClick={() => { if (menuTarget) onCancel(menuTarget); closeMenu(); }} sx={{ color: 'error.main' }}>Batalkan</MenuItem>
        )}
      </Menu>
    </Box>
  );
}
