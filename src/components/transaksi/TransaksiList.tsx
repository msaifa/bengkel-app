'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, CircularProgress, IconButton, InputAdornment,
  MenuItem, Paper, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { Transaksi } from '@/types/transaksi';
import { formatCurrency, formatDate } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState';
import DateRangeFilter, { DateRange, isInDateRange, todayString } from '@/components/common/DateRangeFilter';
import TransaksiStatusChip from './TransaksiStatusChip';

interface Props {
  items: Transaksi[];
  loading: boolean;
  onAdd: () => void;
  onCancel: (item: Transaksi) => void;
}

type Filter = 'semua' | 'posted' | 'cancelled';

const METODE_LABEL: Record<string, string> = { cash: 'Cash', transfer: 'Transfer', qris: 'QRIS' };

export default function TransaksiList({ items, loading, onAdd, onCancel }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('semua');
  const [dateRange, setDateRange] = useState<DateRange>({ start: todayString(), end: todayString() });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<Transaksi | null>(null);

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    const matchFilter = filter === 'semua' || it.status === filter;
    const matchPeriod = isInDateRange(it.tanggalTransaksi, dateRange);
    const matchSearch = !q ||
      it.nomorTransaksi.toLowerCase().includes(q) ||
      (it.customerName ?? '').toLowerCase().includes(q);
    return matchFilter && matchPeriod && matchSearch;
  });

  function openMenu(e: React.MouseEvent<HTMLElement>, item: Transaksi) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(item);
  }
  function closeMenu() { setMenuAnchor(null); setMenuTarget(null); }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField placeholder="Cari nomor transaksi, pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'var(--color-ash)' }} /></InputAdornment> } }} />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </Box>
        </Box>
        <Tabs value={filter} onChange={(_, v) => setFilter(v as Filter)}
          sx={{ px: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none' }, '& .Mui-selected': { color: 'var(--color-primary)' }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label="Semua" value="semua" />
          <Tab label="Selesai" value="posted" />
          <Tab label="Dibatalkan" value="cancelled" />
        </Tabs>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
          <EmptyState
            title={items.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil'}
            description={items.length === 0 ? 'Mulai transaksi pertama untuk mencatat penjualan barang dan jasa bengkel.' : 'Coba ubah kata kunci atau filter.'}
            actionLabel={items.length === 0 ? 'Transaksi Baru' : undefined}
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
                  <TableCell>No. Transaksi</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Pelanggan</TableCell>
                  <TableCell align="center">Jml Item</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Pembayaran</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((it) => (
                  <TableRow key={it.id} hover onClick={() => router.push(`/transaksi/${it.id}`)}
                    sx={{ cursor: 'pointer', '& td': { fontSize: '0.875rem', borderBottom: '1px solid var(--color-hairline)' } }}>
                    <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{it.nomorTransaksi}</TableCell>
                    <TableCell>{formatDate(it.tanggalTransaksi)}</TableCell>
                    <TableCell sx={{ color: it.customerName ? 'inherit' : 'var(--color-ash)' }}>{it.customerName || 'Umum'}</TableCell>
                    <TableCell align="center">{it.totalItem}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(it.total)}</TableCell>
                    <TableCell>{METODE_LABEL[it.metodePembayaran]}</TableCell>
                    <TableCell align="center"><TransaksiStatusChip status={it.status} /></TableCell>
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
              <Box key={it.id} onClick={() => router.push(`/transaksi/${it.id}`)}
                sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 2, cursor: 'pointer', '&:active': { opacity: 0.8 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'monospace' }}>{it.nomorTransaksi}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TransaksiStatusChip status={it.status} />
                    <IconButton size="small" onClick={(e) => openMenu(e, it)}><MoreVertIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 0.5 }}>{formatDate(it.tanggalTransaksi)}</Typography>
                <Typography sx={{ fontSize: '0.875rem', mb: 0.5 }}>Pelanggan: {it.customerName || 'Umum'}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 1 }}>{it.totalItem} item · {METODE_LABEL[it.metodePembayaran]}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(it.total)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-md)', minWidth: 160 } } }}>
        <MenuItem onClick={() => { router.push(`/transaksi/${menuTarget?.id}`); closeMenu(); }}>Lihat Detail</MenuItem>
        {menuTarget?.status === 'posted' && (
          <MenuItem onClick={() => { if (menuTarget) onCancel(menuTarget); closeMenu(); }} sx={{ color: 'error.main' }}>Batalkan</MenuItem>
        )}
      </Menu>
    </Box>
  );
}
