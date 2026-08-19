'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Barang, Jasa, Paket, PaketFormData, PaketKomponen } from '@/types/master';
import { formatCurrency } from '@/utils/format';

interface PaketFormProps {
  open: boolean;
  editData?: Paket | null;
  barangList: Barang[];
  jasaList: Jasa[];
  onClose: () => void;
  onSubmit: (data: PaketFormData) => Promise<void>;
}

const EMPTY: PaketFormData = {
  kode: '',
  nama: '',
  deskripsi: '',
  komponen: [],
  hargaPaket: 0,
  isActive: true,
};

// ─── Calculate harga normal from komponen ────────────────────────────────────
function calcHargaNormal(
  komponen: PaketKomponen[],
  barangMap: Map<string, Barang>,
  jasaMap: Map<string, Jasa>,
): number {
  return komponen.reduce((sum, k) => {
    if (k.type === 'barang') {
      const b = barangMap.get(k.refId);
      return sum + (b ? b.hargaJual * k.qty : 0);
    } else {
      const j = jasaMap.get(k.refId);
      return sum + (j ? j.harga * k.qty : 0);
    }
  }, 0);
}

export default function PaketForm({
  open,
  editData,
  barangList,
  jasaList,
  onClose,
  onSubmit,
}: PaketFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<PaketFormData>(() =>
    editData
      ? { kode: editData.kode, nama: editData.nama, deskripsi: editData.deskripsi, komponen: editData.komponen.map((k) => ({ ...k })), hargaPaket: editData.hargaPaket, isActive: editData.isActive }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Maps for quick lookup
  const barangMap = new Map(barangList.map((b) => [b.id, b]));
  const jasaMap = new Map(jasaList.map((j) => [j.id, j]));

  // Active lists for new komponen selection
  const activeBarang = barangList.filter((b) => b.isActive);
  const activeJasa = jasaList.filter((j) => j.isActive);



  function setField<K extends keyof PaketFormData>(key: K, value: PaketFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }

  // ── Komponen management ───────────────────────────────────────────────────
  function addKomponen() {
    const firstBarang = activeBarang[0];
    if (!firstBarang) return;
    // Check duplicate
    const alreadyExists = form.komponen.some(
      (k) => k.type === 'barang' && k.refId === firstBarang.id,
    );
    if (alreadyExists) return;
    setForm((prev) => ({
      ...prev,
      komponen: [...prev.komponen, { type: 'barang', refId: firstBarang.id, qty: 1 }],
    }));
  }

  function updateKomponen(index: number, patch: Partial<PaketKomponen>) {
    setForm((prev) => {
      const komponen = prev.komponen.map((k, i) => (i === index ? { ...k, ...patch } : k));
      return { ...prev, komponen };
    });
    setErrors((prev) => { const e = { ...prev }; delete e[`komponen_${index}`]; return e; });
  }

  function removeKomponen(index: number) {
    setForm((prev) => ({
      ...prev,
      komponen: prev.komponen.filter((_, i) => i !== index),
    }));
  }

  function handleKomponenTypeChange(index: number, type: 'barang' | 'jasa') {
    const list = type === 'barang' ? activeBarang : activeJasa;
    if (list.length === 0) return;
    updateKomponen(index, { type, refId: list[0].id, qty: 1 });
  }

  function handleKomponenRefChange(index: number, refId: string) {
    const k = form.komponen[index];
    // Duplicate check
    const isDuplicate = form.komponen.some(
      (other, i) => i !== index && other.type === k.type && other.refId === refId,
    );
    if (isDuplicate) {
      setErrors((prev) => ({ ...prev, [`komponen_${index}`]: 'Item ini sudah ada dalam paket.' }));
      return;
    }
    updateKomponen(index, { refId });
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.kode.trim()) e.kode = 'Kode wajib diisi.';
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi.';
    if (form.komponen.length === 0) e.komponen = 'Paket harus memiliki minimal 1 komponen.';
    form.komponen.forEach((k, i) => {
      if (!k.refId) e[`komponen_${i}`] = 'Pilih item.';
      if (k.qty <= 0) e[`komponen_qty_${i}`] = 'Qty harus > 0.';
    });
    if (isNaN(form.hargaPaket) || form.hargaPaket < 0) e.hargaPaket = 'Harga paket tidak valid.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try { await onSubmit(form); }
    finally { setSaving(false); }
  }

  const hargaNormal = calcHargaNormal(form.komponen, barangMap, jasaMap);
  const penghematan = hargaNormal - form.hargaPaket;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 'var(--rounded-lg)' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
        {editData ? 'Edit Paket' : 'Tambah Paket'}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* Basic info */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Kode *"
              value={form.kode}
              onChange={(e) => setField('kode', e.target.value)}
              fullWidth
              error={!!errors.kode}
              helperText={errors.kode}
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Nama Paket *"
              value={form.nama}
              onChange={(e) => setField('nama', e.target.value)}
              fullWidth
              error={!!errors.nama}
              helperText={errors.nama}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Deskripsi"
              value={form.deskripsi}
              onChange={(e) => setField('deskripsi', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Deskripsi singkat paket (opsional)"
            />
          </Grid>

          {/* Komponen */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-ink)' }}>
                Komponen
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addKomponen}
                disabled={activeBarang.length === 0 && activeJasa.length === 0}
                sx={{ fontWeight: 600, color: 'var(--color-primary)', borderRadius: 'var(--rounded-md)' }}
              >
                Tambah Komponen
              </Button>
            </Box>

            {errors.komponen && (
              <Typography sx={{ fontSize: '0.8125rem', color: 'error.main', mb: 1 }}>
                {errors.komponen}
              </Typography>
            )}

            {form.komponen.length === 0 && (
              <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-md)' }}>
                <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>
                  Belum ada komponen. Klik &quot;Tambah Komponen&quot; untuk mulai.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {form.komponen.map((k, index) => {
                const isBarangInactive = k.type === 'barang' && barangMap.get(k.refId) && !barangMap.get(k.refId)!.isActive;
                const isJasaInactive = k.type === 'jasa' && jasaMap.get(k.refId) && !jasaMap.get(k.refId)!.isActive;
                const isInactive = isBarangInactive || isJasaInactive;

                const itemPrice =
                  k.type === 'barang'
                    ? (barangMap.get(k.refId)?.hargaJual ?? 0)
                    : (jasaMap.get(k.refId)?.harga ?? 0);

                // Build options: active items + current item if inactive
                const barangOptions = [
                  ...activeBarang,
                  ...(isBarangInactive && barangMap.get(k.refId) ? [barangMap.get(k.refId)!] : []),
                ];
                const jasaOptions = [
                  ...activeJasa,
                  ...(isJasaInactive && jasaMap.get(k.refId) ? [jasaMap.get(k.refId)!] : []),
                ];
                const options = k.type === 'barang' ? barangOptions : jasaOptions;

                return (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      border: `1px solid ${isInactive ? 'var(--color-hairline)' : 'var(--color-hairline)'}`,
                      borderRadius: 'var(--rounded-md)',
                      bgcolor: isInactive ? 'rgba(255,200,0,0.05)' : 'var(--color-surface-card)',
                    }}
                  >
                    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label="Jenis"
                          value={k.type}
                          onChange={(e) => handleKomponenTypeChange(index, e.target.value as 'barang' | 'jasa')}
                          select
                          fullWidth
                          size="small"
                        >
                          <MenuItem value="barang">Barang</MenuItem>
                          <MenuItem value="jasa">Jasa</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          label="Item"
                          value={k.refId}
                          onChange={(e) => handleKomponenRefChange(index, e.target.value)}
                          select
                          fullWidth
                          size="small"
                          error={!!errors[`komponen_${index}`]}
                          helperText={errors[`komponen_${index}`]}
                        >
                          {options.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                              {opt.nama}{!opt.isActive ? ' (Nonaktif)' : ''}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                          label="Qty"
                          type="number"
                          value={k.qty}
                          onChange={(e) => updateKomponen(index, { qty: Number(e.target.value) })}
                          fullWidth
                          size="small"
                          slotProps={{ htmlInput: { min: 1 } }}
                          error={!!errors[`komponen_qty_${index}`]}
                          helperText={errors[`komponen_qty_${index}`]}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {isInactive && (
                          <Tooltip title="Item ini sudah nonaktif">
                            <WarningAmberIcon fontSize="small" sx={{ color: 'warning.main' }} />
                          </Tooltip>
                        )}
                        <IconButton size="small" onClick={() => removeKomponen(index)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mt: 0.75 }}>
                      {formatCurrency(itemPrice)} × {k.qty} = {formatCurrency(itemPrice * k.qty)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Pricing summary */}
          {form.komponen.length > 0 && (
            <Grid size={12}>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>Harga Normal</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-body)' }}>
                    {formatCurrency(hargaNormal)}
                  </Typography>
                </Box>
                {penghematan > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>Penghematan</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'success.main' }}>
                      {formatCurrency(penghematan)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Harga Paket (Rp) *"
              type="number"
              value={form.hargaPaket}
              onChange={(e) => setField('hargaPaket', Number(e.target.value))}
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
              error={!!errors.hargaPaket}
              helperText={errors.hargaPaket ?? 'Harga yang ditawarkan kepada pelanggan'}
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
