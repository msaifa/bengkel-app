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
import { Jasa } from '@/types/master';
import { formatCurrency } from '@/utils/format';
import StatusChip from '@/components/common/StatusChip';
import EmptyState from '@/components/common/EmptyState';

interface JasaListProps {
  items: Jasa[];
  loading: boolean;
  onEdit: (item: Jasa) => void;
  onToggleActive: (item: Jasa) => void;
  onAdd: () => void;
}

function ActionMenu({
  item,
  onEdit,
  onToggleActive,
}: {
  item: Jasa;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-md)', minWidth: 160 } } }}
      >
        <MenuItem onClick={() => { setAnchor(null); onEdit(); }} sx={{ fontSize: '0.9375rem' }}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => { setAnchor(null); onToggleActive(); }}
          sx={{ fontSize: '0.9375rem', color: item.isActive ? 'error.main' : 'success.main' }}
        >
          {item.isActive ? 'Nonaktifkan' : 'Aktifkan kembali'}
        </MenuItem>
      </Menu>
    </>
  );
}

function DesktopTable({ items, loading, onEdit, onToggleActive, onAdd }: JasaListProps) {
  if (loading) return <Box sx={{ p: 2 }}>{[...Array(4)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)}</Box>;
  if (items.length === 0) return <EmptyState title="Belum ada jasa" description="Tambahkan jasa pertama untuk mulai mengelola data jasa bengkel." actionLabel="Tambah Jasa" onAction={onAdd} />;
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-mute)', borderBottom: '1px solid var(--color-hairline)' } }}>
            <TableCell>Kode</TableCell>
            <TableCell>Nama</TableCell>
            <TableCell>Kategori</TableCell>
            <TableCell align="right">Harga</TableCell>
            <TableCell align="right">Estimasi</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'var(--color-surface-card)' }, '& td': { fontSize: '0.9rem', borderBottom: '1px solid var(--color-hairline-soft)' } }}>
              <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem !important' }}>{item.kode.toUpperCase()}</TableCell>
              <TableCell>{item.nama}</TableCell>
              <TableCell sx={{ color: 'var(--color-mute)' }}>{item.kategori || '—'}</TableCell>
              <TableCell align="right">{formatCurrency(item.harga)}</TableCell>
              <TableCell align="right" sx={{ color: 'var(--color-mute)' }}>
                {item.estimasiMenit ? `${item.estimasiMenit} mnt` : '—'}
              </TableCell>
              <TableCell><StatusChip isActive={item.isActive} /></TableCell>
              <TableCell align="center">
                <ActionMenu item={item} onEdit={() => onEdit(item)} onToggleActive={() => onToggleActive(item)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function MobileCards({ items, loading, onEdit, onToggleActive, onAdd }: JasaListProps) {
  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>{[...Array(3)].map((_, i) => <Skeleton key={i} height={100} sx={{ borderRadius: 'var(--rounded-md)' }} />)}</Box>;
  if (items.length === 0) return <EmptyState title="Belum ada jasa" description="Tambahkan jasa pertama untuk mulai mengelola data jasa bengkel." actionLabel="Tambah Jasa" onAction={onAdd} />;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((item) => (
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
                <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Harga</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink)' }}>{formatCurrency(item.harga)}</Typography>
              </Box>
              {item.estimasiMenit && (
                <Box>
                  <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimasi</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-body)' }}>{item.estimasiMenit} menit</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default function JasaList(props: JasaListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return isMobile ? <MobileCards {...props} /> : <DesktopTable {...props} />;
}
