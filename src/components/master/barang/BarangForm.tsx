'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Barang, BarangFormData } from '@/types/master';
import CurrencyInput from '@/components/common/CurrencyInput';

const SATUAN_OPTIONS = ['pcs', 'botol', 'liter', 'set', 'unit', 'kg', 'meter', 'lembar'];

interface BarangFormProps {
  open: boolean;
  editData?: Barang | null;
  autoKode?: string;
  onClose: () => void;
  onSubmit: (data: BarangFormData) => Promise<void>;
}

const EMPTY: BarangFormData = {
  kode: '',
  nama: '',
  kategori: '',
  satuan: 'pcs',
  hargaBeli: 0,
  hargaJual: 0,
  stokMinimum: 0,
  isActive: true,
};

export default function BarangForm({ open, editData, autoKode, onClose, onSubmit }: BarangFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<BarangFormData>(() =>
    editData
      ? { kode: editData.kode, nama: editData.nama, kategori: editData.kategori, satuan: editData.satuan, hargaBeli: editData.hargaBeli, hargaJual: editData.hargaJual, stokMinimum: editData.stokMinimum, isActive: editData.isActive }
      : { ...EMPTY, kode: autoKode ?? '' },
  );
  const isAutoKode = !editData; // kode readonly saat mode tambah
  const [errors, setErrors] = useState<Partial<Record<keyof BarangFormData, string>>>({});
  const [saving, setSaving] = useState(false);



  function set<K extends keyof BarangFormData>(key: K, value: BarangFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof BarangFormData, string>> = {};
    if (!form.kode.trim()) e.kode = 'Kode wajib diisi.';
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi.';
    if (!form.satuan.trim()) e.satuan = 'Satuan wajib diisi.';
    if (isNaN(form.hargaBeli) || form.hargaBeli < 0) e.hargaBeli = 'Harga beli tidak valid.';
    if (isNaN(form.hargaJual) || form.hargaJual < 0) e.hargaJual = 'Harga jual tidak valid.';
    if (isNaN(form.stokMinimum) || form.stokMinimum < 0) e.stokMinimum = 'Stok minimum tidak valid.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  const title = editData ? 'Edit Barang' : 'Tambah Barang';

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 'var(--rounded-lg)' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{title}</DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Kode"
              value={form.kode}
              onChange={(e) => set('kode', e.target.value)}
              fullWidth
              error={!!errors.kode}
              helperText={errors.kode ?? (isAutoKode ? 'Terisi otomatis, bisa diubah' : undefined)}
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1 } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Satuan *"
              value={form.satuan}
              onChange={(e) => set('satuan', e.target.value)}
              fullWidth
              select
              error={!!errors.satuan}
              helperText={errors.satuan}
            >
              {SATUAN_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Nama Barang *"
              value={form.nama}
              onChange={(e) => set('nama', e.target.value)}
              fullWidth
              error={!!errors.nama}
              helperText={errors.nama}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Kategori"
              value={form.kategori}
              onChange={(e) => set('kategori', e.target.value)}
              fullWidth
              placeholder="Oli, Sparepart, Aksesoris, ..."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyInput
              label="Harga Beli *"
              value={form.hargaBeli}
              onChange={(v) => set('hargaBeli', v)}
              fullWidth
              error={!!errors.hargaBeli}
              helperText={errors.hargaBeli}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyInput
              label="Harga Jual *"
              value={form.hargaJual}
              onChange={(v) => set('hargaJual', v)}
              fullWidth
              error={!!errors.hargaJual}
              helperText={errors.hargaJual}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Stok Minimum"
              type="number"
              value={form.stokMinimum}
              onChange={(e) => set('stokMinimum', Number(e.target.value))}
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
              error={!!errors.stokMinimum}
              helperText={errors.stokMinimum ?? 'Threshold peringatan stok rendah'}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ color: 'var(--color-mute)', borderRadius: 'var(--rounded-md)', fontWeight: 600 }}
        >
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          variant="contained"
          sx={{
            bgcolor: 'var(--color-primary)',
            color: 'var(--color-on-dark)',
            borderRadius: 'var(--rounded-md)',
            fontWeight: 700,
            '&:hover': { bgcolor: 'var(--color-primary-pressed)' },
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
