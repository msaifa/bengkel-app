'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box, CircularProgress, Divider, Typography,
} from '@mui/material';
import DateRangeFilter, { DateRange, isInDateRange, todayString } from '@/components/common/DateRangeFilter';
import { getAllTransaksi } from '@/repositories/transaksi.repository';
import { getAllPembelian } from '@/repositories/pembelian.repository';
import { getAllUangKeluar } from '@/repositories/uangKeluar.repository';
import { Transaksi } from '@/types/transaksi';
import { Pembelian } from '@/types/pembelian';
import { UangKeluar } from '@/types/uangKeluar';
import { formatCurrency } from '@/utils/format';

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  valueColor?: string;
  dimmed?: boolean;
}

function Row({ label, value, indent = false, bold = false, valueColor, dimmed = false }: RowProps) {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
      pl: indent ? 3 : 0,
      opacity: dimmed ? 0.5 : 1,
    }}>
      <Typography sx={{
        fontSize: indent ? '0.8125rem' : '0.875rem',
        fontWeight: bold ? 700 : 500,
        color: dimmed ? 'var(--color-mute)' : 'text.primary',
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: indent ? '0.8125rem' : '0.875rem',
        fontWeight: bold ? 700 : 600,
        color: valueColor ?? 'text.primary',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatCurrency(value)}
      </Typography>
    </Box>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Typography sx={{
      fontSize: '0.6875rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: 'var(--color-mute)',
      pt: 1.5,
      pb: 0.5,
    }}>
      {label}
    </Typography>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LabaRugiTab() {
  const [loading, setLoading] = useState(true);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [pembelianList, setPembelianList] = useState<Pembelian[]>([]);
  const [uangKeluarList, setUangKeluarList] = useState<UangKeluar[]>([]);

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

  const calc = useMemo(() => {
    const inRange = (ts: number) => isInDateRange(ts, dateRange);

    // ── PENDAPATAN ──────────────────────────────────────────────────────────
    const postedTrx = transaksiList.filter(
      (t) => t.status === 'posted' && inRange(t.tanggalTransaksi),
    );

    // Pisah per tipe item
    let pendapatanJasa = 0;
    let pendapatanBarang = 0;

    for (const t of postedTrx) {
      for (const item of t.items) {
        if (item.type === 'jasa') {
          pendapatanJasa += item.subtotal;
        } else if (item.type === 'barang') {
          pendapatanBarang += item.subtotal;
        } else if (item.type === 'paket') {
          // Paket: split berdasarkan komponen snapshot
          if (item.paketKomponenSnapshot) {
            const totalKomp = item.paketKomponenSnapshot.reduce((s, k) => s + k.hargaSnapshot * k.qty, 0);
            for (const komp of item.paketKomponenSnapshot) {
              const porsi = totalKomp > 0
                ? (komp.hargaSnapshot * komp.qty / totalKomp) * item.subtotal
                : item.subtotal / item.paketKomponenSnapshot.length;
              if (komp.type === 'jasa') pendapatanJasa += porsi;
              else pendapatanBarang += porsi;
            }
          } else {
            // Fallback: masuk ke jasa
            pendapatanJasa += item.subtotal;
          }
        }
      }
    }

    // Diskon mengurangi pendapatan secara proporsional
    const totalDiskon = postedTrx.reduce((s, t) => s + t.diskon, 0);
    const totalPendapatanKotor = pendapatanJasa + pendapatanBarang;
    const totalPendapatan = totalPendapatanKotor - totalDiskon;

    // ── BEBAN ───────────────────────────────────────────────────────────────
    // HPP: dari pembelian barang (proxy biaya pengadaan)
    const hpp = pembelianList
      .filter((p) => p.status === 'posted' && inRange(p.tanggalPembelian))
      .reduce((s, p) => s + p.total, 0);

    // Beban operasional: dari uang keluar
    const bebanOperasional = uangKeluarList
      .filter((u) => u.status === 'posted' && inRange(u.tanggalPengeluaran))
      .reduce((s, u) => s + u.nominal, 0);

    const totalBeban = hpp + bebanOperasional;

    // ── LABA RUGI ───────────────────────────────────────────────────────────
    const labaKotor = totalPendapatan - hpp;
    const labaBersih = labaKotor - bebanOperasional;

    return {
      pendapatanJasa: Math.round(pendapatanJasa),
      pendapatanBarang: Math.round(pendapatanBarang),
      totalDiskon,
      totalPendapatan: Math.round(totalPendapatan),
      hpp,
      bebanOperasional,
      totalBeban,
      labaKotor: Math.round(labaKotor),
      labaBersih: Math.round(labaBersih),
    };
  }, [transaksiList, pembelianList, uangKeluarList, dateRange]);

  const isProfit = calc.labaBersih >= 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Period filter */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </Box>

      {/* Report card */}
      <Box sx={{
        bgcolor: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--rounded-md)',
        p: 2.5,
      }}>

        {/* ── PENDAPATAN ─────────────────────────────────────────────────── */}
        <SectionHeader label="Pendapatan" />
        <Row label="Penjualan Jasa"   value={calc.pendapatanJasa}   indent />
        <Row label="Penjualan Barang" value={calc.pendapatanBarang} indent />
        {calc.totalDiskon > 0 && (
          <Row label="Diskon" value={-calc.totalDiskon} indent valueColor="#ef4444" />
        )}
        <Divider sx={{ my: 0.5 }} />
        <Row label="Total Pendapatan" value={calc.totalPendapatan} bold valueColor="#3b82f6" />

        <Box sx={{ my: 1.5 }} />

        {/* ── BEBAN ──────────────────────────────────────────────────────── */}
        <SectionHeader label="Beban & Pengeluaran" />
        <Row label="HPP (Pembelian Barang)"  value={calc.hpp}              indent />
        <Row label="Beban Operasional"        value={calc.bebanOperasional} indent />
        <Divider sx={{ my: 0.5 }} />
        <Row label="Total Beban" value={calc.totalBeban} bold valueColor="#ef4444" />

        <Box sx={{ my: 1.5 }} />

        {/* ── LABA KOTOR ─────────────────────────────────────────────────── */}
        <Box sx={{
          bgcolor: 'rgba(0,0,0,0.03)',
          borderRadius: '10px',
          px: 1.5,
          mb: 1,
        }}>
          <Row label="Laba Kotor" value={calc.labaKotor} bold
            valueColor={calc.labaKotor >= 0 ? '#3b82f6' : '#ef4444'}
          />
        </Box>

        {/* ── LABA BERSIH ────────────────────────────────────────────────── */}
        <Box sx={{
          borderRadius: '12px',
          px: 1.5,
          py: 0.5,
          background: isProfit
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #1c0a0a 0%, #2d1010 100%)',
          border: `1px solid ${isProfit ? 'rgba(74,222,128,0.20)' : 'rgba(248,113,113,0.20)'}`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>
                Laba / Rugi Bersih
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.30)' }}>
                {isProfit ? '▲ Surplus' : '▼ Defisit'}
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: isProfit ? '#4ade80' : '#f87171',
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatCurrency(calc.labaBersih)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footnote */}
      <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)', mt: 1.5, lineHeight: 1.5 }}>
        * HPP dihitung dari total pembelian barang pada periode yang sama.
        Laba Bersih = Total Pendapatan − HPP − Beban Operasional.
      </Typography>
    </Box>
  );
}
