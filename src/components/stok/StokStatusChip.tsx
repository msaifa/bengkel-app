'use client';
import { Chip } from '@mui/material';
import { StockStatus } from '@/types/pembelian';

export default function StokStatusChip({ status }: { status: StockStatus }) {
  if (status === 'habis') return <Chip label="Habis" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }} />;
  if (status === 'menipis') return <Chip label="Menipis" size="small" sx={{ bgcolor: '#fffbeb', color: '#d97706', fontWeight: 600, fontSize: '0.75rem' }} />;
  return <Chip label="Aman" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }} />;
}
