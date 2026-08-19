'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Barang, Jasa, Paket } from '@/types/master';
import { formatCurrency } from '@/utils/format';
import StatusChip from '@/components/common/StatusChip';
import EmptyState from '@/components/common/EmptyState';

interface PaketListProps {
  items: Paket[];
  loading: boolean;
  barangList: Barang[];
  jasaList: Jasa[];
  onEdit: (item: Paket) => void;
  onToggleActive: (item: Paket) => void;
  onAdd: () => void;
}

function calcHargaNormal(
  paket: Paket,
  barangMap: Map<string, Barang>,
  jasaMap: Map<string, Jasa>,
): number {
  return paket.komponen.reduce((sum, k) => {
    if (k.type === 'barang') return sum + (barangMap.get(k.refId)?.hargaJual ?? 0) * k.qty;
    return sum + (jasaMap.get(k.refId)?.harga ?? 0) * k.qty;
  }, 0);
}

function ActionMenu({ item, onEdit, onToggleActive }: { item: Paket; onEdit: () => void; onToggleActive: () => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><MoreVertIcon fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-md)', minWidth: 160 } } }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(); }} sx={{ fontSize: '0.9375rem' }}>Edit</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onToggleActive(); }} sx={{ fontSize: '0.9375rem', color: item.isActive ? 'error.main' : 'success.main' }}>
          {item.isActive ? 'Nonaktifkan' : 'Aktifkan kembali'}
        </MenuItem>
      </Menu>
    </>
  );
}

function DesktopTable({ items, loading, barangList, jasaList, onEdit, onToggleActive, onAdd }: PaketListProps) {
  const barangMap = new Map(barangList.map((b) => [b.id, b]));
  const jasaMap = new Map(jasaList.map((j) => [j.id, j]));

  if (loading) return <Box sx={{ p: 2 }}>{[...Array(4)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)}</Box>;
  if (items.length === 0) return <EmptyState title="Belum ada paket" description="Tambahkan paket pertama untuk mulai mengelola data paket bengkel." actionLabel="Tambah Paket" onAction={onAdd} />;

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', borderBottom: '1px solid var(--color-hairline)' } }}>
            <TableCell>Kode</TableCell>
            <TableCell>Nama</TableCell>
            <TableCell align="center">Komponen</TableCell>
            <TableCell align="right">Harga Normal</TableCell>
            <TableCell align="right">Harga Paket</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const hargaNormal = calcHargaNormal(item, barangMap, jasaMap);
            return (
              <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'var(--color-surface-card)' }, '& td': { fontSize: '0.9rem', borderBottom: '1px solid var(--color-hairline-soft)' } }}>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem !important' }}>{item.kode.toUpperCase()}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell align="center" sx={{ color: 'var(--color-mute)' }}>{item.komponen.length}</TableCell>
                <TableCell align="right" sx={{ color: 'var(--color-mute)', textDecoration: 'line-through' }}>{formatCurrency(hargaNormal)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(item.hargaPaket)}</TableCell>
                <TableCell><StatusChip isActive={item.isActive} /></TableCell>
                <TableCell align="center">
                  <ActionMenu item={item} onEdit={() => onEdit(item)} onToggleActive={() => onToggleActive(item)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function MobileCards({ items, loading, barangList, jasaList, onEdit, onToggleActive, onAdd }: PaketListProps) {
  const barangMap = new Map(barangList.map((b) => [b.id, b]));
  const jasaMap = new Map(jasaList.map((j) => [j.id, j]));

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>{[...Array(3)].map((_, i) => <Skeleton key={i} height={120} sx={{ borderRadius: 'var(--rounded-md)' }} />)}</Box>;
  if (items.length === 0) return <EmptyState title="Belum ada paket" description="Tambahkan paket pertama untuk mulai mengelola data paket bengkel." actionLabel="Tambah Paket" onAction={onAdd} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((item) => {
        const hargaNormal = calcHargaNormal(item, barangMap, jasaMap);
        return (
          <Card key={item.id} sx={{ borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-hairline)', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--color-mute)', mb: 0.25 }}>{item.kode.toUpperCase()}</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-ink)' }}>{item.nama}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StatusChip isActive={item.isActive} />
                  <ActionMenu item={item} onEdit={() => onEdit(item)} onToggleActive={() => onToggleActive(item)} />
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Komponen</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-body)' }}>{item.komponen.length} item</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Normal</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-mute)', textDecoration: 'line-through' }}>{formatCurrency(hargaNormal)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Harga Paket</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)' }}>{formatCurrency(item.hargaPaket)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default function PaketList(props: PaketListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return isMobile ? <MobileCards {...props} /> : <DesktopTable {...props} />;
}
