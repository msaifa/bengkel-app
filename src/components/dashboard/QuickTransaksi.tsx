'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import AirIcon from '@mui/icons-material/Air';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import { getAllJasa } from '@/repositories/jasa.repository';
import { createTransaksiService } from '@/services/transaksi.service';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/format';
import { Jasa } from '@/types/master';
import { TransactionItem } from '@/types/transaksi';
import StokAlert from '@/components/dashboard/StokAlert';

// ─── Quick item definition ────────────────────────────────────────────────────

interface QuickItem {
  id: string;
  label: string;
  /** Substring to match against Jasa.nama (case-insensitive) */
  jasaKeyword: string;
  qty: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const QUICK_ITEMS: QuickItem[] = [
  {
    id: 'angin-1',
    label: 'Isi Angin 1x',
    jasaKeyword: 'isi angin',
    qty: 1,
    icon: <AirIcon />,
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.10)',
  },
  {
    id: 'angin-2',
    label: 'Isi Angin 2x',
    jasaKeyword: 'isi angin',
    qty: 2,
    icon: <AirIcon />,
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.10)',
  },
  {
    id: 'tambal-1',
    label: 'Tambal Bocor',
    jasaKeyword: 'tambal ban bocor',
    qty: 1,
    icon: <BuildCircleIcon />,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.10)',
  },
  {
    id: 'tambal-2',
    label: 'Tambal Tubles',
    jasaKeyword: 'tambal ban tubles',
    qty: 1,
    icon: <BuildCircleIcon />,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.10)',
  },
];

// ─── Quick Card ───────────────────────────────────────────────────────────────

interface QuickCardProps {
  item: QuickItem;
  onClick: () => void;
}

function QuickCard({ item, onClick }: QuickCardProps) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        p: 1.5,
        bgcolor: 'var(--color-canvas)',
        border: `1.5px solid ${item.color}22`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        outline: 'none',
        fontFamily: 'inherit',
        boxShadow: `0 2px 8px ${item.color}14`,
        '&:hover': {
          borderColor: `${item.color}66`,
          bgcolor: item.bgColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 18px ${item.color}22`,
        },
        '&:active': {
          transform: 'translateY(0)',
          opacity: 0.82,
        },
      }}
    >
      {/* Icon circle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: item.bgColor,
          color: item.color,
          fontSize: 20,
          mb: 0.25,
        }}
      >
        {item.icon}
      </Box>

      {/* Label */}
      <Typography
        sx={{
          fontSize: '0.625rem',
          fontWeight: 500,
          color: 'var(--color-mute)',
          textAlign: 'center',
          lineHeight: 1.35,
          letterSpacing: '0.01em',
        }}
      >
        {item.label}
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuickTransaksi() {
  const router = useRouter();
  const { user } = useAuth();

  const [pending, setPending] = useState<QuickItem | null>(null);
  const [jasa, setJasa] = useState<Jasa | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  async function handleQuickClick(item: QuickItem) {
    if (!user) return;
    setPending(item);
    setLoading(true);

    try {
      const allJasa = await getAllJasa();
      const found = allJasa.find(
        (j) => j.isActive && j.nama.toLowerCase().includes(item.jasaKeyword.toLowerCase()),
      ) ?? null;
      setJasa(found);
      setDialogOpen(true);
    } catch {
      setSnackbar({ open: true, message: 'Gagal memuat data jasa.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setDialogOpen(false);
    setPending(null);
    setJasa(null);
  }

  async function handleConfirm() {
    if (!pending || !jasa || !user) return;
    setLoading(true);

    try {
      const item: TransactionItem = {
        type: 'jasa',
        refId: jasa.id,
        kodeSnapshot: jasa.kode,
        namaSnapshot: jasa.nama,
        qty: pending.qty,
        hargaSatuan: jasa.harga,
        subtotal: jasa.harga * pending.qty,
      };

      await createTransaksiService(
        {
          tanggalTransaksi: Date.now(),
          customerName: '',
          catatan: '',
          items: [item],
          diskon: 0,
          metodePembayaran: 'cash',
          jumlahBayar: jasa.harga * pending.qty,
        },
        user.uid,
      );

      setSnackbar({
        open: true,
        message: `Transaksi "${pending.label}" berhasil disimpan!`,
        severity: 'success',
      });
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Gagal menyimpan transaksi.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const total = jasa && pending ? jasa.harga * pending.qty : 0;

  return (
    <>
      {/* ── Section label ─────────────────────────────────────────────────── */}
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-mute)',
          mb: 1.25,
        }}
      >
        Transaksi Cepat
      </Typography>

      {/* ── Quick cards — 4 equal columns ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 2,
          width: '100%',
        }}
      >
        {QUICK_ITEMS.map((item) => (
          <QuickCard
            key={item.id}
            item={item}
            onClick={() => handleQuickClick(item)}
          />
        ))}
      </Box>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => router.push('/transaksi/tambah')}
          sx={{
            bgcolor: '#2d6a4f',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 600,
            borderRadius: '12px',
            py: 1.1,
            textTransform: 'none',
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px rgba(45,106,79,0.25)',
            '&:hover': {
              bgcolor: '#245a42',
              boxShadow: '0 4px 14px rgba(45,106,79,0.32)',
            },
            '&:active': { bgcolor: '#1e4d38' },
          }}
        >
          Transaksi
        </Button>

        <Button
          fullWidth
          variant="contained"
          startIcon={<PaymentsIcon />}
          onClick={() => router.push('/keuangan?tambah=1')}
          sx={{
            bgcolor: '#7f1d1d',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 600,
            borderRadius: '12px',
            py: 1.1,
            textTransform: 'none',
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px rgba(127,29,29,0.25)',
            '&:hover': {
              bgcolor: '#6b1a1a',
              boxShadow: '0 4px 14px rgba(127,29,29,0.32)',
            },
            '&:active': { bgcolor: '#5a1616' },
          }}
        >
          Pengeluaran
        </Button>
      </Box>

      {/* ── Stok alert ────────────────────────────────────────────────────── */}
      <Box sx={{ mt: 2 }}>
        <StokAlert />
      </Box>

      {/* ── Confirm dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--rounded-md)',
              bgcolor: 'var(--color-canvas)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Konfirmasi Transaksi Cepat
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {loading && !jasa ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : jasa && pending ? (
            <Box>
              <Typography sx={{ color: 'var(--color-mute)', mb: 2, fontSize: '0.875rem' }}>
                Transaksi berikut akan langsung disimpan dengan metode pembayaran <strong>Cash</strong>.
              </Typography>

              <Box
                sx={{
                  bgcolor: 'var(--color-surface, rgba(0,0,0,0.03))',
                  borderRadius: '12px',
                  p: 2,
                  border: '1px solid var(--color-hairline)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>Jasa</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{jasa.nama}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>Qty</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{pending.qty}x</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)' }}>Harga Satuan</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(jasa.harga)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.0625rem' }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ color: 'error.main', mb: 1.5, fontSize: '0.875rem' }}>
                Jasa <strong>&ldquo;{pending?.jasaKeyword}&rdquo;</strong> tidak ditemukan di master data.
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-mute)' }}>
                Tambahkan jasa tersebut di menu <strong>Master Jasa</strong> terlebih dahulu, atau buat transaksi manual.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Batal
          </Button>

          {jasa ? (
            <Button
              onClick={handleConfirm}
              disabled={loading}
              variant="contained"
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' },
                minWidth: 100,
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Simpan'}
            </Button>
          ) : (
            <Button
              onClick={() => { handleClose(); router.push('/transaksi/tambah'); }}
              variant="contained"
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Buat Manual
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
