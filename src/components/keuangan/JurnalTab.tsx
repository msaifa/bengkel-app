'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Chip, CircularProgress, Divider, InputAdornment,
  TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DateRangeFilter, { DateRange, isInDateRange, todayString } from '@/components/common/DateRangeFilter';
import { getAllTransaksi } from '@/repositories/transaksi.repository';
import { getAllPembelian } from '@/repositories/pembelian.repository';
import { getAllUangKeluar } from '@/repositories/uangKeluar.repository';
import { Transaksi } from '@/types/transaksi';
import { Pembelian } from '@/types/pembelian';
import { UangKeluar } from '@/types/uangKeluar';
import { formatCurrency } from '@/utils/format';

// ─── Unified journal entry ────────────────────────────────────────────────────

type JurnalType = 'penjualan' | 'pembelian' | 'pengeluaran';

interface JurnalEntry {
  id: string;
  type: JurnalType;
  tanggal: number;
  nomor: string;
  keterangan: string;
  debet: number;   // kas masuk / beban
  kredit: number;  // kas keluar / pendapatan
  status: string;
}

function buildEntries(
  transaksiList: Transaksi[],
  pembelianList: Pembelian[],
  uangKeluarList: UangKeluar[],
): JurnalEntry[] {
  const entries: JurnalEntry[] = [];

  for (const t of transaksiList) {
    entries.push({
      id: t.id,
      type: 'penjualan',
      tanggal: t.tanggalTransaksi,
      nomor: t.nomorTransaksi,
      keterangan: t.customerName ? `Penjualan - ${t.customerName}` : 'Penjualan',
      debet: t.status === 'posted' ? t.total : 0,
      kredit: 0,
      status: t.status,
    });
  }

  for (const p of pembelianList) {
    entries.push({
      id: p.id,
      type: 'pembelian',
      tanggal: p.tanggalPembelian,
      nomor: p.nomorPembelian,
      keterangan: p.supplierName ? `Pembelian - ${p.supplierName}` : 'Pembelian Barang',
      debet: 0,
      kredit: p.status === 'posted' ? p.total : 0,
      status: p.status,
    });
  }

  for (const u of uangKeluarList) {
    entries.push({
      id: u.id,
      type: 'pengeluaran',
      tanggal: u.tanggalPengeluaran,
      nomor: u.nomorPengeluaran,
      keterangan: u.keterangan ? `${u.kategori} - ${u.keterangan}` : u.kategori,
      debet: 0,
      kredit: u.status === 'posted' ? u.nominal : 0,
      status: u.status,
    });
  }

  return entries.sort((a, b) => b.tanggal - a.tanggal);
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: JurnalType }) {
  const config = {
    penjualan:   { label: 'Penjualan',   color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', icon: <TrendingUpIcon sx={{ fontSize: 12 }} /> },
    pembelian:   { label: 'Pembelian',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: <ShoppingCartIcon sx={{ fontSize: 12 }} /> },
    pengeluaran: { label: 'Pengeluaran', color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: <TrendingDownIcon sx={{ fontSize: 12 }} /> },
  }[type];

  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1, py: 0.25, borderRadius: '6px',
      bgcolor: config.bg, color: config.color,
      fontSize: '0.6875rem', fontWeight: 600,
    }}>
      {config.icon}
      {config.label}
    </Box>
  );
}

// ─── Format date ──────────────────────────────────────────────────────────────

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JurnalTab() {
  const [loading, setLoading] = useState(true);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [pembelianList, setPembelianList] = useState<Pembelian[]>([]);
  const [uangKeluarList, setUangKeluarList] = useState<UangKeluar[]>([]);
  const [search, setSearch] = useState('');
  const today = todayString();
  const [dateRange, setDateRange] = useState<DateRange>({ start: today, end: today });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cancelled) setLoading(true);
      try {
        const [trx, pmb, uk] = await Promise.all([
          getAllTransaksi(),
          getAllPembelian(),
          getAllUangKeluar(),
        ]);
        if (cancelled) return;
        setTransaksiList(trx);
        setPembelianList(pmb);
        setUangKeluarList(uk);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const allEntries = useMemo(
    () => buildEntries(transaksiList, pembelianList, uangKeluarList),
    [transaksiList, pembelianList, uangKeluarList],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEntries.filter((e) => {
      if (!isInDateRange(e.tanggal, dateRange)) return false;
      if (q && !e.nomor.toLowerCase().includes(q) && !e.keterangan.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allEntries, search, dateRange]);

  const totalDebet  = filtered.reduce((s, e) => s + e.debet, 0);
  const totalKredit = filtered.reduce((s, e) => s + e.kredit, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search + filter row */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Cari nomor / keterangan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'var(--color-mute)' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </Box>

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={`Masuk: ${formatCurrency(totalDebet)}`}
          sx={{ bgcolor: 'rgba(59,130,246,0.10)', color: '#3b82f6', fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          size="small"
          label={`Keluar: ${formatCurrency(totalKredit)}`}
          sx={{ bgcolor: 'rgba(239,68,68,0.10)', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          size="small"
          label={`${filtered.length} entri`}
          sx={{ bgcolor: 'var(--color-canvas)', color: 'var(--color-mute)', fontWeight: 600, fontSize: '0.75rem' }}
        />
      </Box>

      {/* Entries */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ color: 'var(--color-mute)', fontSize: '0.875rem' }}>
            Tidak ada entri jurnal untuk periode ini.
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          bgcolor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-md)',
          overflow: 'hidden',
        }}>
          {filtered.map((entry, idx) => (
            <Box key={`${entry.type}-${entry.id}`}>
              {idx > 0 && <Divider />}
              <Box sx={{ px: 2, py: 1.5 }}>
                {/* Top row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                      {entry.nomor}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.keterangan}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    {entry.debet > 0 && (
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#3b82f6' }}>
                        +{formatCurrency(entry.debet)}
                      </Typography>
                    )}
                    {entry.kredit > 0 && (
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#ef4444' }}>
                        -{formatCurrency(entry.kredit)}
                      </Typography>
                    )}
                    {entry.debet === 0 && entry.kredit === 0 && (
                      <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>—</Typography>
                    )}
                  </Box>
                </Box>
                {/* Bottom row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TypeBadge type={entry.type} />
                  <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)' }}>
                    {fmtDate(entry.tanggal)}
                  </Typography>
                  {entry.status === 'cancelled' && (
                    <Chip size="small" label="Dibatalkan" sx={{ height: 18, fontSize: '0.625rem', bgcolor: 'rgba(239,68,68,0.10)', color: '#ef4444' }} />
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
