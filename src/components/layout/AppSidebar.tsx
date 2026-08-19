'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import CategoryIcon from '@mui/icons-material/Category';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface NavChild {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <DashboardIcon fontSize="small" /> },
  {
    label: 'Master',
    icon: <StorefrontIcon fontSize="small" />,
    children: [
      { label: 'Barang', href: '/master/barang', icon: <InventoryIcon fontSize="small" /> },
      { label: 'Jasa',   href: '/master/jasa',   icon: <BuildIcon fontSize="small" /> },
      { label: 'Paket',  href: '/master/paket',  icon: <CategoryIcon fontSize="small" /> },
    ],
  },
  { label: 'Pembelian',  href: '/barang-masuk', icon: <MoveToInboxIcon fontSize="small" /> },
  { label: 'Transaksi',  href: '/transaksi',    icon: <ReceiptLongIcon fontSize="small" /> },
  { label: 'Uang Keluar', href: '/uang-keluar', icon: <PaymentsIcon fontSize="small" /> },
  { label: 'Laporan',    href: '/laporan',      icon: <AssessmentIcon fontSize="small" /> },
  { label: 'Akun',       href: '/akun',         icon: <AccountCircleIcon fontSize="small" /> },
];

interface AppSidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ drawerWidth, mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [masterOpen, setMasterOpen] = useState(pathname.startsWith('/master'));

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand header — aligns with AppBar height (64px) */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          px: 3,
          borderBottom: '1px solid var(--color-hairline)',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-ink)',
            letterSpacing: 0,
          }}
        >
          Bengkel App
        </Typography>
      </Box>

      {/* Nav list */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        <List disablePadding>
          {navItems.map((item) => {
            if (item.children) {
              return (
                <Box key={item.label}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => setMasterOpen((o) => !o)}
                      sx={{
                        mx: 1,
                        borderRadius: 'var(--rounded-md)',
                        color: masterOpen ? 'var(--color-ink)' : 'var(--color-mute)',
                        fontWeight: masterOpen ? 600 : 400,
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                      {masterOpen
                        ? <ExpandLessIcon fontSize="small" />
                        : <ExpandMoreIcon fontSize="small" />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={masterOpen} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {item.children.map((child) => (
                        <ListItem key={child.href} disablePadding>
                          <ListItemButton
                            component={Link}
                            href={child.href}
                            selected={isActive(child.href)}
                            onClick={onClose}
                            sx={{ pl: 5, mx: 1, borderRadius: 'var(--rounded-md)' }}
                          >
                            <ListItemIcon>{child.icon}</ListItemIcon>
                            <ListItemText primary={child.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href!}
                  selected={isActive(item.href!)}
                  onClick={onClose}
                  sx={{ mx: 1, borderRadius: 'var(--rounded-md)' }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            color: 'var(--color-stone)',
            letterSpacing: '0.04em',
          }}
        >
          © 2026 Bengkel App
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="navigasi aplikasi"
    >
      {/* Mobile — temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop — permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
