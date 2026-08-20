/**
 * Centralized navigation configuration.
 *
 * Single source of truth for all route labels and paths.
 * Used by: AppSidebar (desktop), MobileBottomNavigation (mobile), AkunPage.
 *
 * IMPORTANT: Route paths must match the actual Next.js app directory structure.
 * Do NOT rename routes here — only labels may differ between desktop/mobile.
 */

// ─── Mobile Primary Navigation (Bottom Nav — exactly 5 items) ────────────────
export interface MobileNavItem {
  label: string;
  href: string;
  /** Icon component name from @mui/icons-material */
  iconName: string;
}

export const mobilePrimaryNav = [
  { label: 'Dashboard',    href: '/' },
  { label: 'Pembelian',    href: '/barang-masuk' },
  { label: 'Transaksi',    href: '/transaksi' },
  { label: 'Pengeluaran',  href: '/uang-keluar' },
  { label: 'Akun',         href: '/akun' },
] as const;

// ─── Account / Secondary Navigation ─────────────────────────────────────────
// Routes that are NOT in the bottom nav but accessible via /akun page.
// When user is on any of these routes, the "Akun" bottom nav item stays active.
export const accountSecondaryNav = [
  { label: 'Master Barang', href: '/master/barang' },
  { label: 'Master Jasa',   href: '/master/jasa' },
  { label: 'Master Paket',  href: '/master/paket' },
] as const;

// ─── Routes that keep "Akun" active in bottom nav ───────────────────────────
// Includes /akun itself plus all secondary nav routes (and their children).
export const akunActiveRoutes = [
  '/akun',
  '/master',      // prefix — covers /master/barang, /master/jasa, /master/paket
] as const;

/**
 * Returns true when the given pathname should highlight the "Akun" tab.
 */
export function isAkunActive(pathname: string): boolean {
  return akunActiveRoutes.some((prefix) =>
    prefix === '/akun'
      ? pathname === '/akun' || pathname.startsWith('/akun/')
      : pathname.startsWith(prefix),
  );
}

/**
 * Returns the index (0-4) of the active bottom nav item for a given pathname.
 * Returns -1 if no match (should not happen in normal usage).
 */
export function getBottomNavValue(pathname: string): number {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/barang-masuk') || pathname.startsWith('/stok')) return 1;
  if (pathname.startsWith('/transaksi')) return 2;
  if (pathname.startsWith('/uang-keluar')) return 3;
  if (isAkunActive(pathname)) return 4;
  return -1;
}
