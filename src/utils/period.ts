/**
 * Period filter utility — shared across TransaksiList, PembelianList, UangKeluarList.
 * Returns start/end Unix ms for each period option.
 */

export type PeriodKey = 'hari-ini' | 'minggu-ini' | 'bulan-ini' | 'bulan-lalu' | 'semua';

export interface PeriodOption {
  key: PeriodKey;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { key: 'hari-ini',   label: 'Hari Ini' },
  { key: 'minggu-ini', label: 'Minggu Ini' },
  { key: 'bulan-ini',  label: 'Bulan Ini' },
  { key: 'bulan-lalu', label: 'Bulan Lalu' },
  { key: 'semua',      label: 'Semua' },
];

export interface PeriodRange {
  start: number; // Unix ms, inclusive
  end: number;   // Unix ms, inclusive (end of day)
}

export function getPeriodRange(key: PeriodKey): PeriodRange | null {
  if (key === 'semua') return null;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  if (key === 'hari-ini') {
    const start = new Date(y, m, d, 0, 0, 0, 0).getTime();
    const end   = new Date(y, m, d, 23, 59, 59, 999).getTime();
    return { start, end };
  }

  if (key === 'minggu-ini') {
    const dow = now.getDay(); // 0=Sun
    const startDay = d - dow;
    const start = new Date(y, m, startDay, 0, 0, 0, 0).getTime();
    const end   = new Date(y, m, startDay + 6, 23, 59, 59, 999).getTime();
    return { start, end };
  }

  if (key === 'bulan-ini') {
    const start = new Date(y, m, 1, 0, 0, 0, 0).getTime();
    const end   = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }

  if (key === 'bulan-lalu') {
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0).getTime();
    const end   = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }

  return null;
}

export function isInPeriod(ts: number, range: PeriodRange | null): boolean {
  if (!range) return true;
  return ts >= range.start && ts <= range.end;
}
