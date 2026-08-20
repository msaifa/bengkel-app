'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Autocomplete, Box, Button, Chip, Collapse, Dialog, DialogContent, DialogTitle,
  Divider, Grid, IconButton, MenuItem, Paper, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Barang, Jasa, Paket } from '@/types/master';
import { TransactionItem, TransaksiFormData, MetodePembayaran } from '@/types/transaksi';

import { formatCurrency } from '@/utils/format';
import CurrencyInput from '@/components/common/CurrencyInput';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Props {
  barangList: Barang[];
  jasaList: Jasa[];
  paketList: Paket[];
  inventoryMap: Map<string, number>; // barangId → currentStock
  onSubmit: (data: TransaksiFormData) => Promise<void>;
}

type ItemPickerTab = 'barang' | 'jasa' | 'paket';

type SearchOption =
  | { kind: 'barang'; item: Barang }
  | { kind: 'jasa'; item: Jasa }
  | { kind: 'paket'; item: Paket };

let keyCounter = 0;
function newKey() { return ++keyCounter; }

type CartItem = TransactionItem & { _key: number };

export default function TransaksiForm({ barangList, jasaList, paketList, inventoryMap, onSubmit }: Props) {
  const router = useRouter();

  // Form state
  const [tanggal, setTanggal] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [customerName, setCustomerName] = useState('');
  const [catatan, setCatatan] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [diskon, setDiskon] = useState(0);
  const [metode, setMetode] = useState<MetodePembayaran>('cash');
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [jumlahBayarManual, setJumlahBayarManual] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoOpen, setInfoOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<ItemPickerTab>('barang');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Computed
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.subtotal, 0), [cart]);
  const total = Math.max(0, subtotal - diskon);
  // If user hasn't manually set jumlahBayar, auto-follow total
  const jumlahBayarEfektif = jumlahBayarManual ? jumlahBayar : total;
  const kembalian = metode === 'cash' ? Math.max(0, jumlahBayarEfektif - total) : 0;

  const activeBarang = useMemo(() => barangList.filter((b) => b.isActive), [barangList]);
  const activeJasa = useMemo(() => jasaList.filter((j) => j.isActive), [jasaList]);
  const activePaket = useMemo(() => paketList.filter((p) => p.isActive), [paketList]);

  const barangMap = useMemo(() => new Map(barangList.map((b) => [b.id, b])), [barangList]);
  const jasaMap = useMemo(() => new Map(jasaList.map((j) => [j.id, j])), [jasaList]);

  // Merged search options: active barang + jasa + paket
  const searchOptions = useMemo<SearchOption[]>(() => [
    ...activeBarang.map((item): SearchOption => ({ kind: 'barang', item })),
    ...activeJasa.map((item): SearchOption => ({ kind: 'jasa', item })),
    ...activePaket.map((item): SearchOption => ({ kind: 'paket', item })),
  ], [activeBarang, activeJasa, activePaket]);

  function handleSearchSelect(opt: SearchOption | null) {
    if (!opt) return;
    if (opt.kind === 'barang') addBarang(opt.item);
    else if (opt.kind === 'jasa') addJasa(opt.item);
    else addPaket(opt.item);
    // Reset Autocomplete by remounting it
    setSearchKey((k) => k + 1);
  }

  function updateCartItem(key: number, patch: Partial<CartItem>) {
    setCart((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, ...patch };
      updated.subtotal = updated.qty * updated.hargaSatuan;
      return updated;
    }));
  }

  function removeCartItem(key: number) {
    setCart((prev) => prev.filter((it) => it._key !== key));
  }

  function addBarang(b: Barang) {
    const existing = cart.find((it) => it.type === 'barang' && it.refId === b.id);
    if (existing) {
      updateCartItem(existing._key, { qty: existing.qty + 1, subtotal: (existing.qty + 1) * existing.hargaSatuan });
    } else {
      setCart((prev) => [...prev, {
        _key: newKey(), type: 'barang', refId: b.id,
        kodeSnapshot: b.kode, namaSnapshot: b.nama, satuanSnapshot: b.satuan,
        qty: 1, hargaSatuan: b.hargaJual, subtotal: b.hargaJual,
      }]);
    }
    setPickerOpen(false);
  }

  function addJasa(j: Jasa) {
    const existing = cart.find((it) => it.type === 'jasa' && it.refId === j.id);
    if (existing) {
      updateCartItem(existing._key, { qty: existing.qty + 1, subtotal: (existing.qty + 1) * existing.hargaSatuan });
    } else {
      setCart((prev) => [...prev, {
        _key: newKey(), type: 'jasa', refId: j.id,
        kodeSnapshot: j.kode, namaSnapshot: j.nama,
        qty: 1, hargaSatuan: j.harga, subtotal: j.harga,
      }]);
    }
    setPickerOpen(false);
  }

  function addPaket(p: Paket) {
    const existing = cart.find((it) => it.type === 'paket' && it.refId === p.id);
    if (existing) {
      updateCartItem(existing._key, { qty: existing.qty + 1, subtotal: (existing.qty + 1) * existing.hargaSatuan });
      setPickerOpen(false);
      return;
    }

    // Build komponen snapshot
    const paketKomponenSnapshot = p.komponen.map((k) => {
      if (k.type === 'barang') {
        const b = barangMap.get(k.refId);
        return {
          type: 'barang' as const,
          refId: k.refId,
          kodeSnapshot: b?.kode ?? k.refId,
          namaSnapshot: b?.nama ?? k.refId,
          qty: k.qty,
          hargaSnapshot: b?.hargaJual ?? 0,
          satuanSnapshot: b?.satuan,
        };
      } else {
        const j = jasaMap.get(k.refId);
        return {
          type: 'jasa' as const,
          refId: k.refId,
          kodeSnapshot: j?.kode ?? k.refId,
          namaSnapshot: j?.nama ?? k.refId,
          qty: k.qty,
          hargaSnapshot: j?.harga ?? 0,
        };
      }
    });

    setCart((prev) => [...prev, {
      _key: newKey(), type: 'paket', refId: p.id,
      kodeSnapshot: p.kode, namaSnapshot: p.nama,
      qty: 1, hargaSatuan: p.hargaPaket, subtotal: p.hargaPaket,
      paketKomponenSnapshot,
    }]);
    setPickerOpen(false);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!tanggal) e.tanggal = 'Tanggal wajib diisi.';
    if (cart.length === 0) e.cart = 'Tambahkan minimal 1 item.';
    if (diskon < 0) e.diskon = 'Diskon tidak boleh negatif.';
    if (diskon > subtotal) e.diskon = 'Diskon tidak boleh melebihi subtotal.';
    if (metode === 'cash' && jumlahBayarEfektif < total) e.jumlahBayar = 'Jumlah bayar kurang dari total.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const items: TransactionItem[] = cart.map(({ _key: _k, ...rest }) => rest);
      const data: TransaksiFormData = {
        tanggalTransaksi: new Date(tanggal).getTime(),
        customerName,
        catatan,
        items,
        diskon,
        metodePembayaran: metode,
        jumlahBayar: metode === 'cash' ? jumlahBayarEfektif : total,
      };
      await onSubmit(data);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  }

  const hasNoItems = activeBarang.length === 0 && activeJasa.length === 0 && activePaket.length === 0;

  if (hasNoItems) {
    return (
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 4, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>Belum ada item yang dapat dijual</Typography>
        <Typography sx={{ color: 'var(--color-mute)', mb: 2, fontSize: '0.875rem' }}>Tambahkan Master Barang, Jasa, atau Paket terlebih dahulu.</Typography>
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
        {/* Header row — always visible, clickable */}
        <Box
          onClick={() => setInfoOpen((v) => !v)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 1.75, cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'var(--color-surface)' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>Transaksi</Typography>
            {!infoOpen && (
              <Typography noWrap sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tanggal.split('-').reverse().join('/')}
                {customerName ? ` · ${customerName}` : ' · Umum'}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <IconButton size="small" sx={{ color: 'var(--color-mute)' }}>
              {infoOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            {cart.length > 0 && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setCart([]); }}
                sx={{ color: 'error.main' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Collapsible body */}
        <Collapse in={infoOpen}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Tanggal Transaksi *" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                  fullWidth error={!!errors.tanggal} helperText={errors.tanggal} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Nama Pelanggan" value={customerName} onChange={(e) => setCustomerName(e.target.value)} fullWidth placeholder="Opsional (kosong = Umum)" />
              </Grid>
              <Grid size={12}>
                <TextField label="Catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} fullWidth placeholder="Opsional" />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>

      {/* Cart */}
      <Box sx={{ bgcolor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', p: 3, mb: 2, minHeight: '50vh', display: 'flex', flexDirection: 'column' }}>
        {errors.cart && <Typography sx={{ color: 'error.main', fontSize: '0.8125rem', mb: 1 }}>{errors.cart}</Typography>}

        {/* Search bar + picker button */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Autocomplete<SearchOption>
            key={searchKey}
            options={searchOptions}
            onChange={(_, opt) => handleSearchSelect(opt)}
            getOptionLabel={(opt) => opt.item.nama}
            isOptionEqualToValue={(a, b) => a.kind === b.kind && a.item.id === b.item.id}
            groupBy={(opt) => opt.kind === 'barang' ? 'Barang' : opt.kind === 'jasa' ? 'Jasa' : 'Paket'}
            filterOptions={(opts, { inputValue }) => {
              const q = inputValue.toLowerCase().trim();
              if (!q) return opts;
              return opts.filter((o) =>
                o.item.nama.toLowerCase().includes(q) ||
                o.item.kode.toLowerCase().includes(q)
              );
            }}
            getOptionDisabled={(opt) => {
              if (opt.kind !== 'barang') return false;
              return (inventoryMap.get(opt.item.id) ?? 0) <= 0;
            }}
            fullWidth
            size="small"
            disableCloseOnSelect={false}
            noOptionsText="Item tidak ditemukan"
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Cari barang, jasa, atau paket..."
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
            renderOption={(props, opt) => {
              const { key, ...liProps } = props as React.LiHTMLAttributes<HTMLLIElement> & { key: React.Key };
              const isBarang = opt.kind === 'barang';
              const isJasa = opt.kind === 'jasa';
              const stok = isBarang ? (inventoryMap.get(opt.item.id) ?? 0) : null;
              const habis = isBarang && (stok ?? 0) <= 0;
              const harga = isBarang
                ? (opt.item as Barang).hargaJual
                : isJasa
                  ? (opt.item as Jasa).harga
                  : (opt.item as Paket).hargaPaket;
              return (
                <li key={key} {...liProps}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1, py: 0.25 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }} noWrap>
                        {opt.item.nama}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>
                          {opt.item.kode}
                        </Typography>
                        {isBarang && stok !== null && (
                          <Typography sx={{ fontSize: '0.7rem', color: habis ? 'error.main' : 'success.main', fontWeight: 600 }}>
                            · {habis ? 'Stok habis' : `Stok: ${stok} ${(opt.item as Barang).satuan}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0 }}>
                      {formatCurrency(harga)}
                    </Typography>
                  </Box>
                </li>
              );
            }}
          />
          <Tooltip title="Pilih dengan filter">
            <IconButton
              size="small"
              onClick={() => setPickerOpen(true)}
              sx={{ border: '1px solid var(--color-primary)', borderRadius: 'var(--rounded-md)', color: 'var(--color-primary)', flexShrink: 0, p: '7px' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {cart.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <ShoppingCartIcon sx={{ fontSize: 72, color: 'var(--color-hairline)', mb: 1.5 }} />
            <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>Belum ada item. Cari atau pilih item di atas.</Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            {cart.map((it, idx) => (
              <Box key={it._key}>
                {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{it.namaSnapshot}</Typography>
                      <Chip label={it.type === 'barang' ? 'Barang' : it.type === 'jasa' ? 'Jasa' : 'Paket'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 0.75 }}>{formatCurrency(it.hargaSatuan)}</Typography>
                    {it.type === 'barang' && (
                      <Typography sx={{ fontSize: '0.75rem', color: (inventoryMap.get(it.refId) ?? 0) <= 0 ? 'error.main' : 'var(--color-mute)', mb: 0.75 }}>
                        Stok: {inventoryMap.get(it.refId) ?? 0} {it.satuanSnapshot}
                      </Typography>
                    )}
                    {/* Qty controls + subtotal */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (it.qty > 1) updateCartItem(it._key, { qty: it.qty - 1 }); else removeCartItem(it._key); }}>
                          <RemoveCircleIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <TextField
                          value={it.qty}
                          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) updateCartItem(it._key, { qty: v }); }}
                          type="text"
                          inputMode="decimal"
                          size="small"
                          sx={{ width: 56 }}
                          slotProps={{ htmlInput: { min: 0.01, step: 'any', style: { textAlign: 'center', padding: '4px 6px', fontSize: '0.8125rem' } } }}
                        />
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); updateCartItem(it._key, { qty: it.qty + 1 }); }}>
                          <AddCircleIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                        {formatCurrency(it.subtotal)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => removeCartItem(it._key)} sx={{ color: 'error.main', mt: 0.25 }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Spacer so content isn't hidden behind fixed footer */}
      <Box sx={{ height: 80 }} />

      {/* ── Fixed footer bar ─────────────────────────────────────────────── */}
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
        {/* Payment detail panel — slides up from footer */}
        <Collapse in={payOpen}>
          <Box sx={{ px: 3, pt: 2.5, pb: 1, borderBottom: '1px solid var(--color-hairline)' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CurrencyInput
                  label="Diskon (Rp)"
                  value={diskon}
                  onChange={(v) => { setDiskon(v); setJumlahBayarManual(false); setErrors((e) => ({ ...e, diskon: '' })); }}
                  fullWidth
                  size="small"
                  error={!!errors.diskon}
                  helperText={errors.diskon}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Metode Pembayaran"
                  value={metode}
                  onChange={(e) => setMetode(e.target.value as MetodePembayaran)}
                  fullWidth select size="small"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                  <MenuItem value="qris">QRIS</MenuItem>
                </TextField>
              </Grid>
              {metode === 'cash' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CurrencyInput
                    label="Jumlah Bayar *"
                    value={jumlahBayarEfektif}
                    onChange={(v) => { setJumlahBayar(v); setJumlahBayarManual(v !== total); setErrors((e) => ({ ...e, jumlahBayar: '' })); }}
                    fullWidth
                    size="small"
                    error={!!errors.jumlahBayar}
                    helperText={errors.jumlahBayar}
                  />
                </Grid>
              )}
            </Grid>

            {/* Summary rows */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {subtotal !== total && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: '0.8125rem' }}>{formatCurrency(subtotal)}</Typography>
                </Box>
              )}
              {diskon > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Diskon</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'error.main' }}>- {formatCurrency(diskon)}</Typography>
                </Box>
              )}
              {metode === 'cash' && jumlahBayarEfektif > 0 && jumlahBayarEfektif >= total && total > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>Kembalian</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{formatCurrency(kembalian)}</Typography>
                </Box>
              )}
              {errors.jumlahBayar && metode === 'cash' && (
                <Typography sx={{ fontSize: '0.75rem', color: 'error.main' }}>{errors.jumlahBayar}</Typography>
              )}
            </Box>
          </Box>
        </Collapse>

        {/* Footer bar row */}
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
          {/* Left: total — clickable to toggle payment panel */}
          <Box
            onClick={() => setPayOpen((v) => !v)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', userSelect: 'none', borderRadius: 2, px: 1, py: 0.5, '&:hover': { bgcolor: 'var(--color-surface)' } }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', lineHeight: 1.2 }}>Total</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color: total > 0 ? 'inherit' : 'var(--color-mute)' }}>
                {formatCurrency(total)}
              </Typography>
              {metode !== 'cash' && (
                <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-mute)' }}>
                  {metode === 'transfer' ? 'Transfer' : 'QRIS'}
                </Typography>
              )}
              {metode === 'cash' && jumlahBayarEfektif >= total && total > 0 && (
                <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-mute)' }}>
                  Kembalian {formatCurrency(kembalian)}
                </Typography>
              )}
            </Box>
            {payOpen ? <ExpandMoreIcon sx={{ color: 'var(--color-mute)', fontSize: 18 }} /> : <ExpandLessIcon sx={{ color: 'var(--color-mute)', fontSize: 18 }} />}
          </Box>

          {/* Right: action buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              onClick={() => router.push('/transaksi')}
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
              Bayar
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Item Picker Dialog */}
      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-lg)' } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>Tambah Item</DialogTitle>
        <Tabs value={pickerTab} onChange={(_, v) => setPickerTab(v as ItemPickerTab)}
          sx={{ px: 3, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' }, '& .Mui-selected': { color: 'var(--color-primary)' }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label={`Barang (${activeBarang.length})`} value="barang" />
          <Tab label={`Jasa (${activeJasa.length})`} value="jasa" />
          <Tab label={`Paket (${activePaket.length})`} value="paket" />
        </Tabs>
        <DialogContent sx={{ pt: 1 }}>
          {pickerTab === 'barang' && (
            activeBarang.length === 0
              ? <Typography sx={{ color: 'var(--color-mute)', py: 2 }}>Tidak ada barang aktif.</Typography>
              : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {activeBarang.map((b) => {
                    const stok = inventoryMap.get(b.id) ?? 0;
                    const habis = stok <= 0;
                    return (
                      <Box key={b.id} onClick={() => !habis && addBarang(b)}
                        sx={{ p: 1.5, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', cursor: habis ? 'not-allowed' : 'pointer', opacity: habis ? 0.5 : 1, '&:hover': { bgcolor: habis ? undefined : 'var(--color-surface)' } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{b.nama}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>{b.kode}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(b.hargaJual)}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: habis ? 'error.main' : 'var(--color-mute)' }}>
                              {habis ? 'Stok Habis' : `Stok: ${stok} ${b.satuan}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
          )}
          {pickerTab === 'jasa' && (
            activeJasa.length === 0
              ? <Typography sx={{ color: 'var(--color-mute)', py: 2 }}>Tidak ada jasa aktif.</Typography>
              : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {activeJasa.map((j) => (
                    <Box key={j.id} onClick={() => addJasa(j)}
                      sx={{ p: 1.5, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', cursor: 'pointer', '&:hover': { bgcolor: 'var(--color-surface)' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{j.nama}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>{j.kode}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(j.harga)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
          )}
          {pickerTab === 'paket' && (
            activePaket.length === 0
              ? <Typography sx={{ color: 'var(--color-mute)', py: 2 }}>Tidak ada paket aktif.</Typography>
              : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {activePaket.map((p) => (
                    <Box key={p.id} onClick={() => addPaket(p)}
                      sx={{ p: 1.5, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', cursor: 'pointer', '&:hover': { bgcolor: 'var(--color-surface)' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.nama}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', fontFamily: 'monospace' }}>{p.kode}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(p.hargaPaket)}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)' }}>
                        {p.komponen.length} komponen
                      </Typography>
                    </Box>
                  ))}
                </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Selesaikan transaksi?"
        description={`Total: ${formatCurrency(total)}\nMetode: ${metode === 'cash' ? 'Cash' : metode === 'transfer' ? 'Transfer' : 'QRIS'}\n\nTransaksi yang sudah selesai tidak dapat diedit. Jika terjadi kesalahan, transaksi harus dibatalkan.`}
        confirmLabel={saving ? 'Memproses...' : 'Selesaikan Transaksi'}
        confirmColor="primary"
        loading={saving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
