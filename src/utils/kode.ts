/**
 * Generate kode otomatis dengan format: {prefix}{YYMMDD}{urutan 2 digit}
 * Contoh: B26081901, J26081902, P26081901
 *
 * @param prefix  - 'B' | 'J' | 'P'
 * @param existingCodes - array kode yang sudah ada (case-insensitive)
 */
export function generateKode(prefix: string, existingCodes: string[]): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  const pattern = new RegExp(
    `^${prefix}${dateStr}(\\d{2})$`,
    'i',
  );

  // Collect all sequence numbers already used today
  const usedSeq = new Set<number>();
  for (const kode of existingCodes) {
    const match = kode.match(pattern);
    if (match) usedSeq.add(parseInt(match[1], 10));
  }

  // Find the next available sequence number
  let seq = 1;
  while (usedSeq.has(seq)) seq++;

  return `${prefix}${dateStr}${String(seq).padStart(2, '0')}`;
}
