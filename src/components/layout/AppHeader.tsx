'use client';

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Tooltip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  drawerWidth: number;
}

export default function AppHeader({ drawerWidth }: AppHeaderProps) {
  const { logout, user } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error('[AppHeader] logout error:', err);
    }
  }

  return (
    <AppBar
      position="fixed"
      // AppBar overrides in theme: canvas bg, ink text, hairline border-bottom
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
        {/* Brand wordmark */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-ink)',
            letterSpacing: 0,
          }}
        >
          Bengkel
        </Typography>

        {/* User info + logout */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: 'var(--color-mute)',
                fontSize: '0.8125rem',
              }}
            >
              {user.email}
            </Typography>
            <Tooltip title="Keluar">
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                size="small"
                sx={{
                  color: 'var(--color-mute)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'var(--color-surface-card)',
                    color: 'var(--color-ink)',
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Keluar</Box>
              </Button>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
