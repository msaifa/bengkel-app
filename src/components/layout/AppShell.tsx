'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Toolbar } from '@mui/material';
import MobileBottomNavigation, { BOTTOM_NAV_HEIGHT } from './MobileBottomNavigation';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const DRAWER_WIDTH = 248;

// Total bottom clearance on mobile:
// bottom nav height + floating margin (16px) + safe area + a little extra
const MOBILE_BOTTOM_CLEARANCE = BOTTOM_NAV_HEIGHT + 16 + 16;

// Routes where AppHeader, AppSidebar, and bottom nav are all hidden
const SHELL_HIDDEN_PATHS = ['/transaksi/tambah', '/barang-masuk/tambah'];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const hideShell = SHELL_HIDDEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  function handleDrawerToggle() {
    setMobileOpen((prev) => !prev);
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--color-surface-soft)' }}>
      {!hideShell && <AppHeader drawerWidth={DRAWER_WIDTH} />}

      {/* Sidebar — desktop only */}
      {!hideShell && (
        <AppSidebar
          drawerWidth={DRAWER_WIDTH}
          mobileOpen={mobileOpen}
          onClose={handleDrawerToggle}
        />
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: hideShell ? '100%' : { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'var(--color-surface-soft)',
          px: hideShell ? 0 : { xs: 2, sm: 3, md: 4 },
          py: hideShell ? 0 : { xs: 2, sm: 3, md: 4 },
          // Bottom padding on mobile so content is never hidden behind bottom nav
          pb: hideShell
            ? 0
            : {
                xs: `calc(${MOBILE_BOTTOM_CLEARANCE}px + env(safe-area-inset-bottom, 0px))`,
                md: 4,
              },
        }}
      >
        {/* Spacer below fixed AppBar (64px) — only when header is visible */}
        {!hideShell && <Toolbar sx={{ minHeight: 64 }} />}
        {children}
      </Box>

      {/* Mobile bottom navigation — hidden on desktop */}
      <MobileBottomNavigation />
    </Box>
  );
}
