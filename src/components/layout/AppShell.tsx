'use client';

import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import MobileBottomNavigation, { BOTTOM_NAV_HEIGHT } from './MobileBottomNavigation';

const DRAWER_WIDTH = 248;

// Total bottom clearance on mobile:
// bottom nav height + floating margin (16px) + safe area + a little extra
const MOBILE_BOTTOM_CLEARANCE = BOTTOM_NAV_HEIGHT + 16 + 16;

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleDrawerToggle() {
    setMobileOpen((prev) => !prev);
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--color-surface-soft)' }}>
      <AppHeader drawerWidth={DRAWER_WIDTH} />

      {/* Sidebar — desktop only */}
      <AppSidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'var(--color-surface-soft)',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 },
          // Bottom padding on mobile so content is never hidden behind bottom nav
          pb: {
            xs: `calc(${MOBILE_BOTTOM_CLEARANCE}px + env(safe-area-inset-bottom, 0px))`,
            md: 4,
          },
        }}
      >
        {/* Spacer below fixed AppBar (64px) */}
        <Toolbar sx={{ minHeight: 64 }} />
        {children}
      </Box>

      {/* Mobile bottom navigation — hidden on desktop */}
      <MobileBottomNavigation />
    </Box>
  );
}
