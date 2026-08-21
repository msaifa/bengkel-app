'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';
import { getBottomNavValue } from '@/config/navigation';

// ─── Nav items — exactly 5 ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/',             icon: <HomeIcon /> },
  { label: 'Pembelian',  href: '/barang-masuk', icon: <ShoppingCartIcon /> },
  { label: 'Transaksi',  href: '/transaksi',    icon: <ReceiptLongIcon /> },
  { label: 'Keuangan',   href: '/keuangan',     icon: <PaymentsIcon /> },
  { label: 'Akun',       href: '/akun',         icon: <PersonIcon /> },
] as const;

// Height of the floating bar itself (px) — used for bottom padding in AppShell
export const BOTTOM_NAV_HEIGHT = 64;
// Floating margin from screen edges (px)
const FLOAT_MARGIN_X = 16;
const FLOAT_MARGIN_BOTTOM = 16;

// Routes where the bottom nav should be hidden (form/detail pages)
const HIDDEN_PATHS = ['/transaksi/tambah', '/barang-masuk/tambah'];

export default function MobileBottomNavigation() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Hide on form pages
  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return null;
  }

  const activeIndex = getBottomNavValue(pathname);

  function handleChange(_: React.SyntheticEvent, newValue: number) {
    router.push(NAV_ITEMS[newValue].href);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        // Only visible on mobile
        display: { xs: 'block', md: 'none' },

        // Floating position — centered horizontally with side margins
        position: 'fixed',
        bottom: `calc(${FLOAT_MARGIN_BOTTOM}px + env(safe-area-inset-bottom, 0px))`,
        // Center with auto margins; width accounts for side margins
        left: 0,
        right: 0,
        mx: `${FLOAT_MARGIN_X}px`,
        width: `calc(100% - ${FLOAT_MARGIN_X * 2}px)`,
        // Cap width on wider screens (tablet landscape)
        maxWidth: 560,
        // When maxWidth kicks in, keep it centered
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: theme.zIndex.appBar,

        // Glass UI
        borderRadius: '22px',
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.background.paper, 0.82),
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.35)}`,
        boxShadow: `0 8px 32px ${alpha('#000', 0.10)}, 0 2px 8px ${alpha('#000', 0.06)}`,
      }}
    >
      <BottomNavigation
        value={activeIndex}
        onChange={handleChange}
        showLabels
        sx={{
          height: BOTTOM_NAV_HEIGHT,
          bgcolor: 'transparent',
          // Active item indicator
          '& .MuiBottomNavigationAction-root': {
            color: 'var(--color-mute)',
            minWidth: 0,
            px: 0.5,
            py: 0.75,
            gap: 0.25,
            transition: 'color 180ms ease',
            // Label always visible, small font
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.6875rem',
              fontWeight: 500,
              opacity: 1,
              '&.Mui-selected': {
                fontSize: '0.6875rem',
                fontWeight: 700,
              },
            },
          },
          '& .MuiBottomNavigationAction-root.Mui-selected': {
            color: 'var(--color-primary)',
          },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
