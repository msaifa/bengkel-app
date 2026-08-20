'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Autocomplete, Box, Button, Chip, Collapse, Dialog, DialogContent,
  DialogTitle, Divider, Grid, IconButton, InputAdornment, List,
  ListItemButton, ListItemText, Paper, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Barang } from '@/types/master';
import { PembelianFormData, PembelianItemFormData } from '@/types/pembelian';
import { formatCurrency } from '@/utils/format';
import CurrencyInput from '@/components/common/CurrencyInput';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Props {
  barangList: Barang[];
  onSubmit: (data: PembelianFormData) => Promise<void>;
}

type ItemForm = PembelianItemFormData & { _key: number };

let keyCounter = 0;
function newKey() { return ++keyCounter; }

export default function PembelianForm({ barangList, onSubmit }: Props) {
  const router = useRouter();
  const activeBarang = useMemo(() => barangList.filter((b) => b.isActive), [barangList]);
  const [tanggal, setTanggal] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [supplier, setSupplier] = useState('');
  const [nomorReferensi, setNomorReferensi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState<ItemForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty || 0) * (it.hargaBeli || 0), 0),
    [items],
  );

  const filteredPickerBarang = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim();
    if (!q) return activeBarang;
    return activeBarang.filter((b) =>
      b.nama.toLowerCase().includes(q) || b.kode.toLowerCase().includes(q)
    );
  }, [activeBarang, pickerSearch]);

  function setItem(key: number, patch: Partial<ItemForm>) {
    setItems((prev) => prev.map((it) => it._key === key ? { ...it, ...patch } : it));
  }

  function updateQty(key: number, delta: number) {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      return { ...it, qty: Math.max(1, it.qty + delta) };
    }));
  }

  function addBarang(b: Barang) {
    const existing = items.find((it) => it.barangId === b.id);
    if (existing) {
      updateQty(existing._key, 1);
    } else {
      setItems((prev) => [...prev, {
        _key: newKey(),
        barangId: b.id,
        kodeSnapshot: b.kode,
        namaSnapshot: b.nama,
        satuanSnapshot: b.satuan,
        qty: 1,
        hargaBeli: b.hargaBeli,
      }]);
    }
    setSearchKey((k) => k + 1);
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((it) => it._key !== key));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!tanggal) e.tanggal = 'Tanggal wajib diisi.';
    if (items.length === 0) e.items = 'Tambahkan minimal 1 barang.';
    items.forEach((it, i) => {
      if (!it.qty || it.qty <= 0) e[`item_${i}_qty`] = 'Qty harus > 0.';
      if (it.hargaBeli < 0) e[`item_${i}_harga`] = 'Harga tidak valid.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      const data: PembelianFormData = {
        tanggalPembelian: new Date(tanggal).getTime(),
        supplierName: supplier,
        nomorReferensi,
        catatan,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        items: items.map(({ _key: _k, ...rest }) => rest),
      };
      await onSubmit(data);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  }

  if (activeBarang.length === 0) {
    return (
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 4, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>Belum ada Barang aktif</Typography>
        <Typography sx={{ color: 'var(--color-mute)', mb: 2, fontSize: '0.875rem' }}>Tambahkan atau aktifkan Master Barang terlebih dahulu.</Typography>
        <Button variant="contained" onClick={() => router.push('/master/barang')}
          sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-on-dark)', borderRadius: 'var(--rounded-md)', fontWeight: 700, '&:hover': { bgcolor: 'var(--color-primary-pressed)' } }}>
          Ke Master Barang
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>

      {/* Info — collapsible */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', mb: 2, overflow: 'hidden' }}>
        <Box
          onClick={() => setInfoOpen((v) => !v)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 1.75, cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'var(--color-surface)' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>Pembelian</Typography>
            {!infoOpen && (
              <Typography noWrap sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tanggal.split('-').reverse().join('/')}
                {supplier ? ` · ${supplier}` : ''}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <IconButton size="small" sx={{ color: 'var(--color-mute)' }}>
              {infoOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            {items.length > 0 && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setItems([]); }} sx={{ color: 'error.main' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Collapse in={infoOpen}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Tanggal Pembelian *" type="date" value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  fullWidth error={!!errors.tanggal} helperText={errors.tanggal}
                  slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Supplier / Toko" value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  fullWidth placeholder="Sumber Motor, Toko Lancar Jaya, ..." />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Nomor Nota / Faktur" value={nomorReferensi}
                  onChange={(e) => setNomorReferensi(e.target.value)}
                  fullWidth placeholder="Opsional" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Catatan" value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  fullWidth placeholder="Opsional" />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>

      {/* Cart */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 3, mb: 2, minHeight: '50vh', display: 'flex', flexDirection: 'column' }}>
        {errors.items && <Typography sx={{ color: 'error.main', fontSize: '0.8125rem', mb: 1 }}>{errors.items}</Typography>}

        {/* Search bar */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Autocomplete<Barang>
            key={searchKey}
            options={activeBarang}
            onChange={(_, b) => { if (b) addBarang(b); }}
            getOptionLabel={(b) => b.nama}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            filterOptions={(opts, { inputValue }) => {
              const q = inputValue.toLowerCase().trim();
              if (!q) return opts;
              return opts.filter((o) =>
                o.nama.toLowerCase().includes(q) || o.kode.toLowerCase().includes(q)
              );
            }}
            fullWidth
            size="small"
            noOptionsText="Barang tidak ditemukan"
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Cari barang..."
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    startAdornment: (
                      <SearchIcon sx={{ color: 'var(--color-mute)', fontSize: 18, ml: 0.5, mr: 0.25, flexShrink: 0 }} />
                    ),
                  },
                }}
              />
            )}
            renderOption={(props, b) => {
              const { key, ...liProps } = props as React.LiHTMLAttributes<HTMLLIElement> & { key: React.Key };
              return (
                <li key={key} {...liProps}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1, py: 0.25 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }} noWrap>{b.nama}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>{b.kode} · {b.satuan}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0 }}>{formatCurrency(b.hargaBeli)}</Typography>
                  </Box>
                </li>
              );
            }}
          />
          <Tooltip title="Pilih dari daftar">
            <IconButton
              size="small"
              onClick={() => { setPickerSearch(''); setPickerOpen(true); }}
              sx={{ border: '1px solid var(--color-primary)', borderRadius: 'var(--rounded-md)', color: 'var(--color-primary)', flexShrink: 0, p: '7px' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {items.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <ShoppingCartIcon sx={{ fontSize: 72, color: 'var(--color-hairline)', mb: 1.5 }} />
            <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem', textAlign: 'center' }}>Belum ada barang. Cari di atas untuk menambahkan.</Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            {items.map((it, idx) => (
              <Box key={it._key}>
                {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                {/* Row: nama + chip | tombol hapus */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }} noWrap>{it.namaSnapshot}</Typography>
                    <Chip label="Barang" size="small" variant="outlined" sx={{ fontSize: '0.7rem', flexShrink: 0 }} />
                  </Box>
                  <IconButton size="small" onClick={() => removeItem(it._key)} sx={{ color: 'error.main', flexShrink: 0, ml: 0.5 }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {/* Kode */}
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace', mb: 1 }}>{it.kodeSnapshot}</Typography>
                {/* Row: harga beli | qty controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <CurrencyInput
                    label="Harga Beli"
                    value={it.hargaBeli}
                    onChange={(v) => setItem(it._key, { hargaBeli: v })}
                    size="small"
                    error={!!errors[`item_${idx}_harga`]}
                    helperText={errors[`item_${idx}_harga`]}
                    sx={{ width: 160 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (it.qty > 1) updateQty(it._key, -1); else removeItem(it._key); }}>
                      <RemoveCircleIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <TextField
                      value={it.qty}
                      onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v > 0) setItem(it._key, { qty: v }); }}
                      type="text"
                      inputMode="numeric"
                      size="small"
                      sx={{ width: 56 }}
                      slotProps={{ htmlInput: { min: 1, step: 1, style: { textAlign: 'center', padding: '4px 6px', fontSize: '0.8125rem' } } }}
                    />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); updateQty(it._key, 1); }}>
                      <AddCircleIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', ml: 0.25 }}>{it.satuanSnapshot}</Typography>
                  </Box>
                </Box>
                {/* Total per item */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', mr: 0.75 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                    {formatCurrency(it.qty * it.hargaBeli)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ height: 80 }} />

      {/* Fixed footer */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: '1px solid var(--color-hairline)',
          bgcolor: 'var(--color-canvas)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.25,
            pb: `calc(12px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          <Box sx={{ px: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', lineHeight: 1.2 }}>Total Pembelian</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color: subtotal > 0 ? 'inherit' : 'var(--color-mute)' }}>
              {formatCurrency(subtotal)}
            </Typography>
            {items.length > 0 && (
              <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-mute)' }}>{items.length} barang</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              onClick={() => router.push('/barang-masuk')}
              disabled={saving}
              sx={{ color: 'var(--color-mute)', borderRadius: 'var(--rounded-md)', fontWeight: 600, minWidth: 0, px: 1.5 }}
            >
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={() => { if (validate()) setConfirmOpen(true); }}
              disabled={saving}
              sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-on-dark)', borderRadius: 'var(--rounded-md)', fontWeight: 700, '&:hover': { bgcolor: 'var(--color-primary-pressed)' }, whiteSpace: 'nowrap' }}
            >
              Simpan
            </Button>
          </Box>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title="Simpan Pembelian?"
        description={`Pembelian ini akan langsung menambahkan stok ${items.length} barang. Setelah diposting, tidak dapat diedit secara langsung.`}
        confirmLabel={saving ? 'Menyimpan...' : 'Simpan & Tambah Stok'}
        confirmColor="primary"
        loading={saving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Picker Dialog */}
      <Dialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-lg)', m: 2 } } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1rem' }}>
          Pilih Barang
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important', px: 2, pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Cari nama atau kode..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            sx={{ mb: 1 }}
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
          {filteredPickerBarang.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>
                Barang tidak ditemukan
              </Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {filteredPickerBarang.map((b, idx) => (
                <Box key={b.id}>
                  {idx > 0 && <Divider />}
                  <ListItemButton
                    onClick={() => { addBarang(b); setPickerOpen(false); }}
                    sx={{ borderRadius: 'var(--rounded-md)', px: 1.5, py: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>
                          {b.nama}
                        </Typography>
                      }
                      secondary={
                        <Typography component="span" sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>
                          {b.kode} · {b.satuan}
                        </Typography>
                      }
                    />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', flexShrink: 0, ml: 1 }}>
                      {formatCurrency(b.hargaBeli)}
                    </Typography>
                  </ListItemButton>
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
