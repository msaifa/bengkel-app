'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import CategoryIcon from '@mui/icons-material/Category';
import PaymentsIcon from '@mui/icons-material/Payments';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAuth } from '@/hooks/useAuth';
import { accountSecondaryNav } from '@/config/navigation';

// ─── Icon map for secondary nav items ────────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  '/master/barang': <InventoryIcon fontSize="small" />,
  '/master/jasa':   <BuildIcon fontSize="small" />,
  '/master/paket':  <CategoryIcon fontSize="small" />,
  '/uang-keluar':   <PaymentsIcon fontSize="small" />,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(displayName: string | null, email: string | null): string {
  if (displayName && displayName.trim()) {
    return displayName
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'P';
}

function getDisplayName(displayName: string | null, email: string | null): string {
  if (displayName && displayName.trim()) return displayName.trim();
  if (email) return email.split('@')[0];
  return 'Pengguna';
}

export default function AkunPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error('[AkunPage] logout error:', err);
    }
  }

  const initials = getInitials(user?.displayName ?? null, user?.email ?? null);
  const displayName = getDisplayName(user?.displayName ?? null, user?.email ?? null);

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Box className="page-header">
        <Typography component="h1" className="page-title">
          Akun
        </Typography>
        <Typography className="page-subtitle">
          Informasi akun dan pengaturan aplikasi.
        </Typography>
      </Box>

      {/* ── Account summary card ─────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-md)',
          p: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        {/* Avatar */}
        {user?.photoURL ? (
          <Avatar
            src={user.photoURL}
            alt={displayName}
            sx={{ width: 56, height: 56, flexShrink: 0 }}
          />
        ) : (
          <Avatar
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-on-dark)',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {initials}
          </Avatar>
        )}

        {/* User info */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-ink)',
              lineHeight: 1.3,
              mb: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'var(--color-mute)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5,
            }}
          >
            {user?.email ?? '—'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FiberManualRecordIcon
              sx={{ fontSize: 8, color: 'success.main' }}
            />
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)' }}>
              Login
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Secondary menu ───────────────────────────────────────────────── */}
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--color-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          mb: 1,
          px: 0.5,
        }}
      >
        Menu
      </Typography>

      <Box
        sx={{
          bgcolor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-md)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <List disablePadding>
          {accountSecondaryNav.map((item, index) => (
            <Box key={item.href}>
              {index > 0 && <Divider sx={{ borderColor: 'var(--color-hairline-soft)' }} />}
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  py: 1.75,
                  px: 2.5,
                  '&:hover': { bgcolor: 'var(--color-surface-card)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: 'var(--color-mute)',
                  }}
                >
                  {iconMap[item.href]}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'var(--color-ink)',
                      },
                    },
                  }}
                />
                <ChevronRightIcon
                  fontSize="small"
                  sx={{ color: 'var(--color-stone)', flexShrink: 0 }}
                />
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Box>

      {/* ── Logout ───────────────────────────────────────────────────────── */}
      <Button
        onClick={handleLogout}
        fullWidth
        startIcon={<LogoutIcon />}
        sx={{
          justifyContent: 'flex-start',
          py: 1.5,
          px: 2.5,
          borderRadius: 'var(--rounded-md)',
          bgcolor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          color: 'var(--color-error)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          '&:hover': {
            bgcolor: '#fff5f5',
            borderColor: 'var(--color-error)',
          },
        }}
      >
        Keluar dari Aplikasi
      </Button>
    </Box>
  );
}
