/**
 * Normalize a kode string for uniqueness checks.
 * Trims whitespace and converts to lowercase.
 *
 * @example normalizeKode("  OLI-001  ") → "oli-001"
 */
export function normalizeKode(kode: string): string {
  return kode.trim().toLowerCase();
}
