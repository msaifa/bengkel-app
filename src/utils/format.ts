/**
 * Format a number as Indonesian Rupiah currency.
 * Firestore stores raw numbers; this is display-only.
 *
 * @example formatCurrency(75000) → "Rp 75.000"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Compact currency for tight spaces (mobile cards).
 * @example compactCurrency(75000) → "Rp 75rb"
 * @example compactCurrency(1500000) → "Rp 1,5jt"
 */
export function compactCurrency(value: number): string {
  if (value >= 1_000_000) {
    const jt = value / 1_000_000;
    const formatted = jt % 1 === 0 ? jt.toString() : jt.toFixed(1);
    return `Rp ${formatted}jt`;
  }
  if (value >= 1_000) {
    const rb = value / 1_000;
    const formatted = rb % 1 === 0 ? rb.toString() : rb.toFixed(1);
    return `Rp ${formatted}rb`;
  }
  return `Rp ${value}`;
}

/**
 * Format Unix timestamp (ms) to Indonesian date string.
 * @example formatDate(1724025600000) → "19 Agustus 2026"
 */
export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(ts));
}

/**
 * Format Unix timestamp (ms) to short date.
 * @example formatDateShort(1724025600000) → "19/08/2026"
 */
export function formatDateShort(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(ts));
}
