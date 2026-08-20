'use client';

import { useState, useEffect } from 'react';
import { getAllTransaksi } from '@/repositories/transaksi.repository';
import { getAllUangKeluar } from '@/repositories/uangKeluar.repository';
import { Transaksi } from '@/types/transaksi';
import { UangKeluar } from '@/types/uangKeluar';

export type DashboardPeriod = 'hari-ini' | 'bulan-ini' | 'tahun-ini';

export interface DashboardStats {
  uangMasuk: number;
  uangKeluar: number;
  laba: number;
  jumlahTransaksi: number;
}

// ─── Period helpers ───────────────────────────────────────────────────────────

function getPeriodRange(period: DashboardPeriod): { start: number; end: number } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  if (period === 'hari-ini') {
    return {
      start: new Date(y, m, d, 0, 0, 0, 0).getTime(),
      end:   new Date(y, m, d, 23, 59, 59, 999).getTime(),
    };
  }
  if (period === 'bulan-ini') {
    return {
      start: new Date(y, m, 1, 0, 0, 0, 0).getTime(),
      end:   new Date(y, m + 1, 0, 23, 59, 59, 999).getTime(),
    };
  }
  // tahun-ini
  return {
    start: new Date(y, 0, 1, 0, 0, 0, 0).getTime(),
    end:   new Date(y, 11, 31, 23, 59, 59, 999).getTime(),
  };
}

function calcStats(
  transaksiList: Transaksi[],
  uangKeluarList: UangKeluar[],
  period: DashboardPeriod,
): DashboardStats {
  const { start, end } = getPeriodRange(period);

  const inRange = (ts: number) => ts >= start && ts <= end;

  const postedTransaksi = transaksiList.filter(
    (t) => t.status === 'posted' && inRange(t.tanggalTransaksi),
  );
  const postedUangKeluar = uangKeluarList.filter(
    (u) => u.status === 'posted' && inRange(u.tanggalPengeluaran),
  );

  const uangMasuk = postedTransaksi.reduce((sum, t) => sum + t.total, 0);
  const uangKeluar = postedUangKeluar.reduce((sum, u) => sum + u.nominal, 0);

  return {
    uangMasuk,
    uangKeluar,
    laba: uangMasuk - uangKeluar,
    jumlahTransaksi: postedTransaksi.length,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseDashboardStatsResult {
  loading: boolean;
  error: string | null;
  period: DashboardPeriod;
  setPeriod: (p: DashboardPeriod) => void;
  stats: DashboardStats;
}

const EMPTY_STATS: DashboardStats = {
  uangMasuk: 0,
  uangKeluar: 0,
  laba: 0,
  jumlahTransaksi: 0,
};

export function useDashboardStats(): UseDashboardStatsResult {
  const [period, setPeriod] = useState<DashboardPeriod>('hari-ini');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [uangKeluarList, setUangKeluarList] = useState<UangKeluar[]>([]);

  // Fetch once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);
      try {
        const [trx, uk] = await Promise.all([
          getAllTransaksi(),
          getAllUangKeluar(),
        ]);
        if (cancelled) return;
        setTransaksiList(trx);
        setUangKeluarList(uk);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const stats = loading
    ? EMPTY_STATS
    : calcStats(transaksiList, uangKeluarList, period);

  return { loading, error, period, setPeriod, stats };
}
