'use client';

import { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, TextField, Typography,
} from '@mui/material';
import { UangKeluar } from '@/types/uangKeluar';
import { formatCurrency, formatDate } from '@/utils/format';
import UangKeluarStatusChip from './UangKeluarStatusChip';

interface Props {
  item: UangKeluar;
  onCancel: (reason: string) => Promise<void>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: '1px solid var(--color-hairline)' }}>
      <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)', minWidth: 160, flexShrink: 0 }}>{label}</Typography>
      <Box sx={{ flex: 1 }}>{typeof value === 'string'
        ? <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{value || '-'}</Typography>
        : value}
      </Box>
    </Box>
  );
}

const METODE_LABEL: Record<string, string> = {
  cash: 'Cash',
  transfer: 'Transfer',
  qris: 'QRIS',
};

export default function UangKeluarDetail({ item, onCancel }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    const trimmed = reason.trim();
    if (!trimmed) { setReasonError('Alasan pembatalan wajib diisi.'); return; }
    setCancelling(true);
    try {
      await onCancel(trimmed);
      setCancelOpen(false);
      setReason('');
      setReasonError('');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.125rem' }}>{item.nomorPengeluaran}</Typography>
        <UangKeluarStatusChip status={item.status} size="medium" />
      </Box>

      {/* Detail Card */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', px: 3, py: 1 }}>
        <Row label="Tanggal" value={formatDate(item.tanggalPengeluaran)} />
        <Row label="Kategori" value={item.kategori} />
        <Row label="Keterangan" value={item.keterangan} />
        <Row label="Nominal" value={
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(item.nominal)}</Typography>
        } />
        <Row label="Metode Pembayaran" value={METODE_LABEL[item.metodePembayaran] ?? item.metodePembayaran} />
        <Row label="Dibayarkan Kepada" value={item.penerima || '-'} />
        <Row label="Nomor Referensi / Nota" value={item.nomorReferensi || '-'} />
        <Row label="Catatan" value={item.catatan || '-'} />

        {/* Tombol batalkan di bawah card */}
        {item.status === 'posted' && (
          <Box sx={{ pt: 2, pb: 1 }}>
            <Button
              variant="contained"
              onClick={() => setCancelOpen(true)}
              fullWidth
              sx={{
                bgcolor: 'error.main',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 'var(--rounded-md)',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              Batalkan Pengeluaran
            </Button>
          </Box>
        )}
      </Box>

      {/* Cancellation info */}
      {item.status === 'cancelled' && (
        <Box sx={{ bgcolor: '#fdecea', border: '1px solid', borderColor: 'error.light', borderRadius: 'var(--rounded-md)', px: 3, py: 2, mt: 2 }}>
          <Typography sx={{ fontWeight: 700, color: 'error.main', mb: 1, fontSize: '0.875rem' }}>Informasi Pembatalan</Typography>
          <Typography sx={{ fontSize: '0.875rem', mb: 0.5 }}>
            <strong>Alasan:</strong> {item.cancellationReason}
          </Typography>
          {item.cancelledAt && (
            <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>
              Dibatalkan pada {formatDate(item.cancelledAt)}
            </Typography>
          )}
        </Box>
      )}

      {/* Audit info */}
      <Box sx={{ mt: 2, bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', px: 3, py: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', py: 1 }}>Informasi Pencatatan</Typography>
        <Divider />
        <Row label="Dibuat pada" value={formatDate(item.createdAt)} />
        <Row label="Diperbarui pada" value={formatDate(item.updatedAt)} />
      </Box>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelOpen}
        onClose={() => { if (!cancelling) { setCancelOpen(false); setReason(''); setReasonError(''); } }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-lg)' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Batalkan Pengeluaran?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)', mb: 2 }}>
            Pengeluaran <strong>{item.nomorPengeluaran}</strong> senilai <strong>{formatCurrency(item.nominal)}</strong> akan dibatalkan. Tindakan ini tidak dapat diurungkan.
          </Typography>
          <TextField
            label="Alasan Pembatalan *"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setReasonError(''); }}
            fullWidth
            multiline
            rows={2}
            placeholder="Salah nominal, duplikat pencatatan, ..."
            error={!!reasonError}
            helperText={reasonError}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setCancelOpen(false); setReason(''); setReasonError(''); }} disabled={cancelling} sx={{ color: 'var(--color-mute)', fontWeight: 600 }}>
            Kembali
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={cancelling}
            sx={{ fontWeight: 700 }}
          >
            {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
