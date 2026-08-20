'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Chip, Divider, IconButton, InputAdornment, MenuItem,
  Skeleton, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { UangKeluar, KATEGORI_PENGELUARAN } from '@/types/uangKeluar';
import { formatCurrency, formatDate } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState';
import UangKeluarStatusChip from './UangKeluarStatusChip';

interface Props {
  items: UangKeluar[];
  loading: boolean;
  onAdd: () => void;
}

type FilterStatus = 'semua' | 'posted' | 'cancelled';

export default function UangKeluarList({ items, loading, onAdd }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');
  const [filterKategori, setFilterKategori] = useState('semua');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((it) => {
      if (filterStatus !== 'semua' && it.status !== filterStatus) return false;
      if (filterKategori !== 'semua' && it.kategori !== filterKategori) return false;
      if (q) {
        return (
          it.nomorPengeluaran.toLowerCase().includes(q) ||
          it.kategori.toLowerCase().includes(q) ||
          it.keterangan.toLowerCase().includes(q) ||
          (it.penerima?.toLowerCase().includes(q) ?? false) ||
          (it.nomorReferensi?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [items, search, filterStatus, filterKategori]);

  const totalPosted = useMemo(
    () => filtered.filter((it) => it.status === 'posted').reduce((s, it) => s + it.nominal, 0),
    [filtered],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={100} />)}
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada pengeluaran"
        description="Catat pengeluaran operasional pertama bengkel."
        actionLabel="Tambah Pengeluaran"
        onAction={onAdd}
      />
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Cari nomor, kategori, keterangan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'var(--color-mute)' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          size="small"
          select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="semua">Semua Status</MenuItem>
          <MenuItem value="posted">Tercatat</MenuItem>
          <MenuItem value="cancelled">Dibatalkan</MenuItem>
        </TextField>
        <TextField
          size="small"
          select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="semua">Semua Kategori</MenuItem>
          {KATEGORI_PENGELUARAN.map((k) => (
            <MenuItem key={k} value={k}>{k}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Summary */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', px: 3, py: 1.5, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>
          Total Pengeluaran {filterStatus === 'semua' ? '(Tercatat)' : ''}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: totalPosted > 0 ? 'inherit' : 'var(--color-mute)' }}>
          {formatCurrency(totalPosted)}
        </Typography>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>Tidak ada data yang sesuai filter.</Typography>
        </Box>
      ) : (
        <>
          {/* Desktop Table */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'var(--color-surface-soft, #fbfbf9)' }}>
                  {['No. Pengeluaran', 'Tanggal', 'Kategori', 'Keterangan', 'Metode', 'Nominal', 'Status', ''].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', py: 1.25 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((it) => (
                  <TableRow
                    key={it.id}
                    hover
                    sx={{ cursor: 'pointer', opacity: it.status === 'cancelled' ? 0.6 : 1 }}
                    onClick={() => router.push(`/uang-keluar/${it.id}`)}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>{it.nomorPengeluaran}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{formatDate(it.tanggalPengeluaran)}</TableCell>
                    <TableCell>
                      <Chip label={it.kategori} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', maxWidth: 240 }}>
                      <Typography noWrap sx={{ fontSize: '0.8125rem' }}>{it.keterangan}</Typography>
                      {it.penerima && <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-mute)' }}>{it.penerima}</Typography>}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', textTransform: 'uppercase' }}>{it.metodePembayaran}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatCurrency(it.nominal)}</TableCell>
                    <TableCell><UangKeluarStatusChip status={it.status} /></TableCell>
                    <TableCell>
                      <Tooltip title="Lihat Detail">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); router.push(`/uang-keluar/${it.id}`); }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((it) => (
              <Box
                key={it.id}
                onClick={() => router.push(`/uang-keluar/${it.id}`)}
                sx={{
                  bgcolor: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  p: 2,
                  cursor: 'pointer',
                  opacity: it.status === 'cancelled' ? 0.65 : 1,
                  '&:hover': { bgcolor: 'var(--color-surface)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700 }}>{it.nomorPengeluaran}</Typography>
                  <UangKeluarStatusChip status={it.status} />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 1 }}>{formatDate(it.tanggalPengeluaran)}</Typography>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Chip label={it.kategori} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                </Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.25 }}>{it.keterangan}</Typography>
                {it.penerima && (
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.5 }}>{it.penerima}</Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', textTransform: 'uppercase' }}>{it.metodePembayaran}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(it.nominal)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
