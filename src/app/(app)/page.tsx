'use client';

import { Box, Grid, Typography } from '@mui/material';

// ─── data-card-minimal ────────────────────────────────────────────────────────
// Design spec: Title (caption-md, uppercase, muted) / Value (heading-md) /
// Sub-value (caption-sm, muted). Decorative radial gradient blob in corner.
// No icons, no progress bars — text only.
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subvalue: string;
  /** Blob color as rgba string, e.g. 'rgba(163,217,177,0.30)' */
  blobColor: string;
}

function StatCard({ label, value, subvalue, blobColor }: StatCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--rounded-md)',
        p: 3,
      }}
    >
      {/* Decorative blob */}
      <Box
        className="blob"
        sx={{
          width: 120,
          height: 120,
          top: -30,
          right: -30,
          background: `radial-gradient(circle, ${blobColor} 0%, transparent 70%)`,
        }}
      />

      {/* Card content sits above blob */}
      <Box className="card-content-above-blob">
        <Typography className="stat-label">{label}</Typography>
        <Typography className="stat-value">{value}</Typography>
        <Typography className="stat-subvalue">{subvalue}</Typography>
      </Box>
    </Box>
  );
}

const statCards: StatCardProps[] = [
  {
    label: 'Transaksi Hari Ini',
    value: '0 transaksi',
    subvalue: 'Belum ada data',
    blobColor: 'rgba(99,149,255,0.28)',
  },
  {
    label: 'Pendapatan Hari Ini',
    value: 'Rp 0',
    subvalue: 'Belum ada data',
    blobColor: 'rgba(163,217,177,0.30)',
  },
  {
    label: 'Pengeluaran Hari Ini',
    value: 'Rp 0',
    subvalue: 'Belum ada data',
    blobColor: 'rgba(255,120,120,0.22)',
  },
  {
    label: 'Barang Masuk Hari Ini',
    value: '0 barang',
    subvalue: 'Belum ada data',
    blobColor: 'rgba(255,195,90,0.28)',
  },
];

export default function DashboardPage() {
  return (
    <Box>
      {/* Page header */}
      <Box className="page-header">
        <Typography component="h1" className="page-title">
          Dashboard
        </Typography>
        <Typography className="page-subtitle">
          Ringkasan aktivitas bengkel hari ini.
        </Typography>
      </Box>

      {/* Quick Stats Grid — 1fr 1fr on mobile, 4-up on desktop */}
      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

