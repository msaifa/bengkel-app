'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Chip, CircularProgress, Collapse, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Transaksi } from '@/types/transaksi';
import { formatCurrency, formatDate } from '@/utils/format';
import TransaksiStatusChip from './TransaksiStatusChip';

const METODE_LABEL: Record<string, string> = { cash: 'Cash', transfer: 'Transfer', qris: 'QRIS' };
const TYPE_LABEL: Record<string, string> = { barang: 'Barang', jasa: 'Jasa', paket: 'Paket' };

interface Props {
  transaksi: Transaksi;
  onCancel: (reason: string) => Promise<void>;
}

export default function TransaksiDetail({ transaksi, onCancel }: Props) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [expandedPaket, setExpandedPaket] = useState<Set<number>>(new Set());

  function togglePaket(idx: number) {
    setExpandedPaket((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  async function handleCancel() {
    if (!reason.trim()) { setReasonError('Alasan pembatalan wajib diisi.'); return; }
    setCancelling(true);
    try { await onCancel(reason.trim()); setCancelOpen(false); }
    finally { setCancelling(false); }
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/transaksi')}
        sx={{ mb: 2, color: 'var(--color-mute)', fontWeight: 600 }}>
        Kembali
      </Button>

      {/* Header */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.125rem' }}>{transaksi.nomorTransaksi}</Typography>
            <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>{formatDate(transaksi.tanggalTransaksi)}</Typography>
          </Box>
          <TransaksiStatusChip status={transaksi.status} />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Pelanggan</Typography>
            <Typography sx={{ fontSize: '0.9375rem' }}>{transaksi.customerName || 'Umum'}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Metode Pembayaran</Typography>
            <Typography sx={{ fontSize: '0.9375rem' }}>{METODE_LABEL[transaksi.metodePembayaran]}</Typography>
          </Box>
          {transaksi.catatan && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Catatan</Typography>
              <Typography sx={{ fontSize: '0.9375rem' }}>{transaksi.catatan}</Typography>
            </Box>
          )}
          {transaksi.status === 'cancelled' && (
            <>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Dibatalkan pada</Typography>
                <Typography sx={{ fontSize: '0.9375rem' }}>{transaksi.cancelledAt ? formatDate(transaksi.cancelledAt) : '—'}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 0.25 }}>Alasan Pembatalan</Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: 'error.main' }}>{transaksi.cancellationReason || '—'}</Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Items */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', p: 3, pb: 1.5 }}>Item Transaksi</Typography>

        {/* Desktop */}
        <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', bgcolor: 'var(--color-surface)', borderBottom: '1px solid var(--color-hairline)' } }}>
                <TableCell>Nama</TableCell>
                <TableCell>Tipe</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Harga</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transaksi.items.map((it, i) => (
                <>
                  <TableRow key={i} sx={{ '& td': { fontSize: '0.875rem', borderBottom: it.paketKomponenSnapshot && expandedPaket.has(i) ? 'none' : '1px solid var(--color-hairline)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{it.namaSnapshot}</Typography>
                        {it.paketKomponenSnapshot && (
                          <IconButton size="small" onClick={() => togglePaket(i)}>
                            {expandedPaket.has(i) ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={TYPE_LABEL[it.type]} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} /></TableCell>
                    <TableCell align="right">{it.qty}{it.satuanSnapshot ? ` ${it.satuanSnapshot}` : ''}</TableCell>
                    <TableCell align="right">{formatCurrency(it.hargaSatuan)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(it.subtotal)}</TableCell>
                  </TableRow>
                  {it.paketKomponenSnapshot && (
                    <TableRow key={`${i}-komp`}>
                      <TableCell colSpan={5} sx={{ p: 0, borderBottom: '1px solid var(--color-hairline)' }}>
                        <Collapse in={expandedPaket.has(i)}>
                          <Box sx={{ px: 3, py: 1.5, bgcolor: 'var(--color-surface)' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mb: 1 }}>Komponen Paket:</Typography>
                            {it.paketKomponenSnapshot.map((k, ki) => (
                              <Typography key={ki} sx={{ fontSize: '0.8125rem', color: 'var(--color-body)', mb: 0.25 }}>
                                {k.type === 'barang' ? '📦' : '🔧'} {k.namaSnapshot} × {k.qty}
                              </Typography>
                            ))}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, pb: 2 }}>
          {transaksi.items.map((it, i) => (
            <Box key={i} sx={{ py: 1.5, borderBottom: i < transaksi.items.length - 1 ? '1px solid var(--color-hairline)' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{it.namaSnapshot}</Typography>
                  {it.paketKomponenSnapshot && (
                    <IconButton size="small" onClick={() => togglePaket(i)}>
                      {expandedPaket.has(i) ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  )}
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(it.subtotal)}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>
                {it.qty}{it.satuanSnapshot ? ` ${it.satuanSnapshot}` : ''} × {formatCurrency(it.hargaSatuan)}
              </Typography>
              {it.paketKomponenSnapshot && (
                <Collapse in={expandedPaket.has(i)}>
                  <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid var(--color-hairline)' }}>
                    {it.paketKomponenSnapshot.map((k, ki) => (
                      <Typography key={ki} sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 0.25 }}>
                        {k.type === 'barang' ? '📦' : '🔧'} {k.namaSnapshot} × {k.qty}
                      </Typography>
                    ))}
                  </Box>
                </Collapse>
              )}
            </Box>
          ))}
        </Box>

        {/* Summary */}
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid var(--color-hairline)', bgcolor: 'var(--color-surface)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.9375rem' }}>Subtotal</Typography>
            <Typography sx={{ fontSize: '0.9375rem' }}>{formatCurrency(transaksi.subtotal)}</Typography>
          </Box>
          {transaksi.diskon > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.9375rem' }}>Diskon</Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: 'error.main' }}>- {formatCurrency(transaksi.diskon)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Total</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatCurrency(transaksi.total)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>Bayar ({METODE_LABEL[transaksi.metodePembayaran]})</Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>{formatCurrency(transaksi.jumlahBayar)}</Typography>
          </Box>
          {transaksi.kembalian > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>Kembalian</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(transaksi.kembalian)}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Cancel */}
      {transaksi.status === 'posted' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)} sx={{ borderRadius: 'var(--rounded-md)', fontWeight: 600 }}>
            Batalkan Transaksi
          </Button>
        </Box>
      )}

      <Dialog open={cancelOpen} onClose={cancelling ? undefined : () => setCancelOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-lg)' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Batalkan Transaksi?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9375rem', color: 'var(--color-body)', mb: 2 }}>
            Pembatalan akan mengembalikan stok barang. Tindakan ini tidak dapat diurungkan.
          </Typography>
          <TextField label="Alasan Pembatalan *" value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(''); }}
            fullWidth multiline rows={2} error={!!reasonError} helperText={reasonError}
            placeholder="Salah input, pelanggan batal, duplikat, ..." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling} sx={{ color: 'var(--color-mute)', borderRadius: 'var(--rounded-md)', fontWeight: 600 }}>Batal</Button>
          <Button onClick={handleCancel} disabled={cancelling} color="error" variant="contained" sx={{ borderRadius: 'var(--rounded-md)', fontWeight: 700 }}>
            {cancelling ? <CircularProgress size={18} color="inherit" /> : 'Batalkan Transaksi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
