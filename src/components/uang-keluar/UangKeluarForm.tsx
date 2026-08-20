'use client';

import { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, TextField, useMediaQuery, useTheme,
} from '@mui/material';
import { UangKeluarFormData, MetodePembayaranPengeluaran, KATEGORI_PENGELUARAN } from '@/types/uangKeluar';
import CurrencyInput from '@/components/common/CurrencyInput';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UangKeluarFormData) => Promise<void>;
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function UangKeluarForm({ open, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [tanggal, setTanggal] = useState(todayString);
  const [kategori, setKategori] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState(0);
  const [metode, setMetode] = useState<MetodePembayaranPengeluaran>('cash');
  const [penerima, setPenerima] = useState('');
  const [nomorReferensi, setNomorReferensi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setTanggal(todayString());
    setKategori('');
    setKeterangan('');
    setNominal(0);
    setMetode('cash');
    setPenerima('');
    setNomorReferensi('');
    setCatatan('');
    setErrors({});
  }

  function handleClose() {
    if (saving) return;
    resetForm();
    onClose();
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!tanggal) e.tanggal = 'Tanggal wajib diisi.';
    if (!kategori) e.kategori = 'Kategori wajib dipilih.';
    if (!nominal || nominal <= 0) e.nominal = 'Nominal harus lebih dari 0.';
    if (!metode) e.metode = 'Metode pembayaran wajib dipilih.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        tanggalPengeluaran: new Date(tanggal).getTime(),
        kategori,
        keterangan: keterangan.trim(),
        nominal,
        metodePembayaran: metode,
        penerima: penerima.trim(),
        nomorReferensi: nomorReferensi.trim(),
        catatan: catatan.trim(),
      });
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 'var(--rounded-lg)' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.0625rem', pb: 1 }}>
        Tambah Pengeluaran
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important' }}>
        <Grid container spacing={2}>
          {/* Tanggal */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Tanggal Pengeluaran *"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              fullWidth
              error={!!errors.tanggal}
              helperText={errors.tanggal}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Kategori */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Kategori *"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              fullWidth
              select
              error={!!errors.kategori}
              helperText={errors.kategori}
            >
              {KATEGORI_PENGELUARAN.map((k) => (
                <MenuItem key={k} value={k}>{k}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Keterangan */}
          <Grid size={12}>
            <TextField
              label="Keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              fullWidth
              placeholder="Bayar listrik bulan Agustus (opsional)"
              error={!!errors.keterangan}
              helperText={errors.keterangan}
            />
          </Grid>

          {/* Nominal */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyInput
              label="Nominal *"
              value={nominal}
              onChange={(v) => setNominal(v)}
              fullWidth
              error={!!errors.nominal}
              helperText={errors.nominal}
            />
          </Grid>

          {/* Metode */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Metode Pembayaran *"
              value={metode}
              onChange={(e) => setMetode(e.target.value as MetodePembayaranPengeluaran)}
              fullWidth
              select
              error={!!errors.metode}
              helperText={errors.metode}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="qris">QRIS</MenuItem>
            </TextField>
          </Grid>

          {/* Penerima */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Dibayarkan Kepada"
              value={penerima}
              onChange={(e) => setPenerima(e.target.value)}
              fullWidth
              placeholder="PLN, Pak Budi, ... (opsional)"
            />
          </Grid>

          {/* Nomor Referensi */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Nomor Referensi / Nota"
              value={nomorReferensi}
              onChange={(e) => setNomorReferensi(e.target.value)}
              fullWidth
              placeholder="Opsional"
            />
          </Grid>

          {/* Catatan */}
          <Grid size={12}>
            <TextField
              label="Catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Opsional"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={saving} sx={{ color: 'var(--color-mute)', fontWeight: 600 }}>
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-on-dark)', fontWeight: 700, '&:hover': { bgcolor: 'var(--color-primary-pressed)' } }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
