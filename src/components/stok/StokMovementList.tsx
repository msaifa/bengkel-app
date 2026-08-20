'use client';

import { Box, Chip, CircularProgress, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { StockMovement } from '@/types/pembelian';
import { formatDateShort } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState';
import NextLink from 'next/link';

interface Props {
  items: StockMovement[];
  loading: boolean;
}

export default function StokMovementList({ items, loading }: Props) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
        <EmptyState title="Belum ada riwayat" description="Riwayat pergerakan stok akan muncul setelah ada pembelian." />
      </Box>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', bgcolor: 'var(--color-surface)', borderBottom: '1px solid var(--color-hairline)' } }}>
              <TableCell>Tanggal</TableCell>
              <TableCell>Barang</TableCell>
              <TableCell>Tipe</TableCell>
              <TableCell align="center">Masuk</TableCell>
              <TableCell align="center">Keluar</TableCell>
              <TableCell align="center">Sebelum → Sesudah</TableCell>
              <TableCell>Referensi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((mv) => (
              <TableRow key={mv.id} sx={{ '& td': { fontSize: '0.875rem', borderBottom: '1px solid var(--color-hairline)' } }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateShort(mv.occurredAt)}</TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{mv.barangNamaSnapshot}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>{mv.barangKodeSnapshot}</Typography>
                </TableCell>
                <TableCell>
                  {mv.movementType === 'PURCHASE' && <Chip label="Pembelian" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }} />}
                  {mv.movementType === 'PURCHASE_CANCEL' && <Chip label="Batal Beli" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }} />}
                  {mv.movementType === 'SALE' && <Chip label="Penjualan" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }} />}
                  {mv.movementType === 'SALE_CANCEL' && <Chip label="Batal Jual" size="small" sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 600, fontSize: '0.75rem' }} />}
                </TableCell>
                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 600 }}>
                  {mv.direction === 'IN' ? `+${mv.qty}` : '—'}
                </TableCell>
                <TableCell align="center" sx={{ color: 'error.main', fontWeight: 600 }}>
                  {mv.direction === 'OUT' ? `-${mv.qty}` : '—'}
                </TableCell>
                <TableCell align="center" sx={{ color: 'var(--color-mute)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                  {mv.quantityBefore} → {mv.quantityAfter}
                </TableCell>
                <TableCell>
                  <Link component={NextLink} href={mv.referenceType === 'transaksi' ? `/transaksi/${mv.referenceId}` : `/barang-masuk/${mv.referenceId}`} sx={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                    {mv.referenceNumber}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Cards */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
        {items.map((mv) => (
          <Box key={mv.id} sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>{formatDateShort(mv.occurredAt)}</Typography>
              {mv.movementType === 'PURCHASE' && <Chip label="Pembelian" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }} />}
              {mv.movementType === 'PURCHASE_CANCEL' && <Chip label="Batal Beli" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }} />}
              {mv.movementType === 'SALE' && <Chip label="Penjualan" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }} />}
              {mv.movementType === 'SALE_CANCEL' && <Chip label="Batal Jual" size="small" sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontWeight: 600, fontSize: '0.75rem' }} />}
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 0.25 }}>{mv.barangNamaSnapshot}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace', mb: 1 }}>{mv.barangKodeSnapshot}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>
                {mv.direction === 'IN' ? 'Masuk' : 'Keluar'}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: mv.direction === 'IN' ? 'success.main' : 'error.main' }}>
                {mv.direction === 'IN' ? '+' : '-'}{mv.qty} {mv.satuanSnapshot}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Stok</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{mv.quantityBefore} → {mv.quantityAfter}</Typography>
            </Box>
            <Link component={NextLink} href={mv.referenceType === 'transaksi' ? `/transaksi/${mv.referenceId}` : `/barang-masuk/${mv.referenceId}`} sx={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--color-primary)' }}>
              {mv.referenceNumber}
            </Link>
          </Box>
        ))}
      </Box>
    </>
  );
}
