'use client';
import { Chip } from '@mui/material';
import { PembelianStatus } from '@/types/pembelian';

export default function PembelianStatusChip({ status }: { status: PembelianStatus }) {
  if (status === 'cancelled') {
    return <Chip label="Dibatalkan" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }} />;
  }
  return <Chip label="Diposting" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }} />;
}
