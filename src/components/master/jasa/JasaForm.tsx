'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Jasa, JasaFormData } from '@/types/master';
import CurrencyInput from '@/components/common/CurrencyInput';

interface JasaFormProps {
  open: boolean;
  editData?: Jasa | null;
  autoKode?: string;
  onClose: () => void;
  onSubmit: (data: JasaFormData) => Promise<void>;
}

const EMPTY: JasaFormData = {
  kode: '',
  nama: '',
  kategori: '',
  harga: 0,
  estimasiMenit: null,
  deskripsi: '',
  isActive: true,
};

export default function JasaForm({ open, editData, autoKode, onClose, onSubmit }: JasaFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<JasaFormData>(() =>
    editData
      ? { kode: editData.kode, nama: editData.nama, kategori: editData.kategori, harga: editData.harga, estimasiMenit: editData.estimasiMenit, deskripsi: editData.deskripsi, isActive: editData.isActive }
      : { ...EMPTY, kode: autoKode ?? '' },
  );
  const isAutoKode = !editData;
  const [errors, setErrors] = useState<Partial<Record<keyof JasaFormData, string>>>({});
  const [saving, setSaving] = useState(false);



  function set<K extends keyof JasaFormData>(key: K, value: JasaFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof JasaFormData, string>> = {};
    if (!form.kode.trim()) e.kode = 'Kode wajib diisi.';
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi.';
    if (isNaN(form.harga) || form.harga < 0) e.harga = 'Harga tidak valid.';
    if (
      form.estimasiMenit !== null &&
      (isNaN(form.estimasiMenit) || form.estimasiMenit < 0)
    ) {
      e.estimasiMenit = 'Estimasi tidak valid.';
    }
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

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 'var(--rounded-lg)' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
        {editData ? 'Edit Jasa' : 'Tambah Jasa'}
      </DialogTitle>

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
            <CurrencyInput
              label="Harga *"
              value={form.harga}
              onChange={(v) => set('harga', v)}
              fullWidth
              error={!!errors.harga}
              helperText={errors.harga}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Nama Jasa *"
              value={form.nama}
              onChange={(e) => set('nama', e.target.value)}
              fullWidth
              error={!!errors.nama}
              helperText={errors.nama}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Kategori"
              value={form.kategori}
              onChange={(e) => set('kategori', e.target.value)}
              fullWidth
              placeholder="Servis, Instalasi, Perawatan, ..."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Estimasi (menit)"
              type="number"
              value={form.estimasiMenit ?? ''}
              onChange={(e) =>
                set('estimasiMenit', e.target.value === '' ? null : Number(e.target.value))
              }
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
              error={!!errors.estimasiMenit}
              helperText={errors.estimasiMenit ?? 'Opsional'}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Deskripsi"
              value={form.deskripsi}
              onChange={(e) => set('deskripsi', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Deskripsi singkat jasa (opsional)"
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
