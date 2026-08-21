'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Fab, Tab, Tabs } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BalanceIcon from '@mui/icons-material/Balance';
import UangKeluarList from '@/components/uang-keluar/UangKeluarList';
import UangKeluarForm from '@/components/uang-keluar/UangKeluarForm';
import AppSnackbar, { SnackbarState, SNACKBAR_CLOSED, snackError, snackSuccess } from '@/components/common/AppSnackbar';
import JurnalTab from '@/components/keuangan/JurnalTab';
import LabaRugiTab from '@/components/keuangan/LabaRugiTab';
import { UangKeluar, UangKeluarFormData } from '@/types/uangKeluar';
import { fetchAllUangKeluar, createUangKeluarService, UangKeluarValidationError } from '@/services/uangKeluar.service';
import { useAuth } from '@/hooks/useAuth';
import AddIcon from '@mui/icons-material/Add';

// ─── Tab panel ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2.5 }}>
      {value === index && children}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KeuanganPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<UangKeluar[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(SNACKBAR_CLOSED);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cancelled) setLoadingItems(true);
      try {
        const data = await fetchAllUangKeluar();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setSnackbar(snackError('Gagal memuat data pengeluaran.'));
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-open form when navigated with ?tambah=1
  useEffect(() => {
    async function checkParam() {
      if (searchParams.get('tambah') === '1') {
        setFormOpen(true);
      }
    }
    checkParam();
  }, [searchParams]);

  async function handleSubmit(data: UangKeluarFormData) {
    if (!user) return;
    try {
      await createUangKeluarService(data, user.uid);
      const updated = await fetchAllUangKeluar();
      setItems(updated);
      setSnackbar(snackSuccess('Pengeluaran berhasil dicatat.'));
      setFormOpen(false);
    } catch (err) {
      if (err instanceof UangKeluarValidationError) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        throw err;
      }
      setSnackbar(snackError('Gagal menyimpan pengeluaran.'));
      throw err;
    }
  }

  return (
    <Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: '1px solid var(--color-hairline)',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 44,
            gap: 0.75,
          },
          '& .Mui-selected': { color: 'var(--color-primary)' },
          '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' },
        }}
      >
        <Tab icon={<PaymentsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Pengeluaran" />
        <Tab icon={<MenuBookIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Jurnal" />
        <Tab icon={<BalanceIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Laba Rugi" />
      </Tabs>

      {/* Tab 0: Pengeluaran */}
      <TabPanel value={tab} index={0}>
        <UangKeluarList items={items} loading={loadingItems} onAdd={() => setFormOpen(true)} />
      </TabPanel>

      {/* Tab 1: Jurnal */}
      <TabPanel value={tab} index={1}>
        <JurnalTab />
      </TabPanel>

      {/* Tab 2: Laba Rugi */}
      <TabPanel value={tab} index={2}>
        <LabaRugiTab />
      </TabPanel>

      {/* Form + Snackbar */}
      <UangKeluarForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <AppSnackbar state={snackbar} onClose={() => setSnackbar(SNACKBAR_CLOSED)} />

      {/* FAB — only on Pengeluaran tab */}
      {tab === 0 && (
        <Fab
          color="primary"
          aria-label="Tambah Pengeluaran"
          onClick={() => setFormOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 'calc(96px + env(safe-area-inset-bottom, 0px))', md: 24 },
            right: { xs: 16, md: 32 },
            bgcolor: 'var(--color-primary)',
            color: 'var(--color-on-dark)',
            '&:hover': { bgcolor: 'var(--color-primary-pressed)' },
            zIndex: 1100,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
