'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Pembelian } from '@/types/pembelian';
import { formatCurrency, formatDate } from '@/utils/format';
import PembelianStatusChip from './PembelianStatusChip';

interface Props {
  pembelian: Pembelian;
  onCancel: (reason: string) => Promise<void>;
}

export default function PembelianDetail({ pembelian, onCancel }: Props) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!reason.trim()) { setReasonError('Alasan pembatalan wajib diisi.'); return; }
    setCancelling(true);
    try {
      await onCancel(reason.trim());
      setCancelOpen(false);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Box>
      {/* Back */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/barang-masuk')}
        sx={{ mb: 2, color: 'var(--color-mute)', fontWeight: 600 }}>
        Kembali
      </Button>

      {/* Header */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.125rem' }}>{pembelian.nomorPembelian}</Typography>
            <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>{formatDate(pembelian.tanggalPembelian)}</Typography>
          </Box>
          <PembelianStatusChip status={pembelian.status} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Supplier / Toko</Typography>
            <Typography sx={{ fontSize: '0.9375rem' }}>{pembelian.supplierName || '—'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Nomor Nota / Faktur</Typography>
            <Typography sx={{ fontSize: '0.9375rem', fontFamily: 'monospace' }}>{pembelian.nomorReferensi || '—'}</Typography>
          </Box>
          {pembelian.catatan && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Catatan</Typography>
              <Typography sx={{ fontSize: '0.9375rem' }}>{pembelian.catatan}</Typography>
            </Box>
          )}
          {pembelian.status === 'cancelled' && (
            <>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Dibatalkan pada</Typography>
                <Typography sx={{ fontSize: '0.9375rem' }}>{pembelian.cancelledAt ? formatDate(pembelian.cancelledAt) : '—'}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Alasan Pembatalan</Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: 'error.main' }}>{pembelian.cancellationReason || '—'}</Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Items */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', p: 3, pb: 1.5 }}>Barang</Typography>

        {/* Desktop */}
        <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', bgcolor: 'var(--color-surface)', borderBottom: '1px solid var(--color-hairline)' } }}>
                <TableCell>Kode</TableCell>
                <TableCell>Nama Barang</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell>Satuan</TableCell>
                <TableCell align="right">Harga Beli</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pembelian.items.map((it, i) => (
                <TableRow key={i} sx={{ '& td': { fontSize: '0.875rem', borderBottom: '1px solid var(--color-hairline)' } }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{it.kodeSnapshot}</TableCell>
                  <TableCell>{it.namaSnapshot}</TableCell>
                  <TableCell align="right">{it.qty}</TableCell>
                  <TableCell>{it.satuanSnapshot}</TableCell>
                  <TableCell align="right">{formatCurrency(it.hargaBeli)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(it.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, pb: 2 }}>
          {pembelian.items.map((it, i) => (
            <Box key={i} sx={{ py: 1.5, borderBottom: i < pembelian.items.length - 1 ? '1px solid var(--color-hairline)' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-mute)' }}>{it.kodeSnapshot}</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(it.subtotal)}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 0.25 }}>{it.namaSnapshot}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>{it.qty} {it.satuanSnapshot} × {formatCurrency(it.hargaBeli)}</Typography>
            </Box>
          ))}
        </Box>

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: '1px solid var(--color-hairline)', bgcolor: 'var(--color-surface)' }}>
          <Typography sx={{ fontWeight: 600 }}>Total</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatCurrency(pembelian.total)}</Typography>
        </Box>
      </Box>

      {/* Cancel Action */}
      {pembelian.status === 'posted' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}
            sx={{ borderRadius: 'var(--rounded-md)', fontWeight: 600 }}>
            Batalkan Pembelian
          </Button>
        </Box>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onClose={cancelling ? undefined : () => setCancelOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-lg)' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Batalkan Pembelian?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9375rem', color: 'var(--color-body)', mb: 2 }}>
            Pembatalan akan mengurangi stok barang sesuai jumlah pembelian ini. Tindakan ini tidak dapat diurungkan.
          </Typography>
          <TextField label="Alasan Pembatalan *" value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(''); }}
            fullWidth multiline rows={2} error={!!reasonError} helperText={reasonError}
            placeholder="Salah input, nota dibatalkan, duplikat, ..." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling} sx={{ color: 'var(--color-mute)', borderRadius: 'var(--rounded-md)', fontWeight: 600 }}>Batal</Button>
          <Button onClick={handleCancel} disabled={cancelling} color="error" variant="contained" sx={{ borderRadius: 'var(--rounded-md)', fontWeight: 700 }}>
            {cancelling ? <CircularProgress size={18} color="inherit" /> : 'Batalkan Pembelian'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
