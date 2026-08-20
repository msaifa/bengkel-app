'use client';
import { Chip } from '@mui/material';
import { TransactionStatus } from '@/types/transaksi';

export default function TransaksiStatusChip({ status }: { status: TransactionStatus }) {
  if (status === 'cancelled') {
    return <Chip label="Dibatalkan" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }} />;
  }
  return <Chip label="Selesai" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }} />;
}
