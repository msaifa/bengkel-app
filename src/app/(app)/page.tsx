'use client';

import { Box, Grid, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useDashboardStats, DashboardPeriod } from '@/hooks/useDashboardStats';
import { formatCurrency } from '@/utils/format';
import QuickTransaksi from '@/components/dashboard/QuickTransaksi';
import DashboardChart from '@/components/dashboard/DashboardChart';

// ─── Period labels ────────────────────────────────────────────────────────────
const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'hari-ini',  label: 'Hari Ini' },
  { value: 'bulan-ini', label: 'Bulan Ini' },
  { value: 'tahun-ini', label: 'Tahun Ini' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  blobColor: string;
  icon: React.ReactNode;
  valueColor?: string;
  loading?: boolean;
}

function StatCard({ label, value, subvalue, blobColor, icon, valueColor, loading }: StatCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--rounded-md)',
        p: 2.5,
        height: '100%',
      }}
    >
      {/* Decorative blob */}
      <Box
        sx={{
          position: 'absolute',
          width: 110,
          height: 110,
          top: -28,
          right: -28,
          background: `radial-gradient(circle, ${blobColor} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '10px',
          bgcolor: blobColor,
          mb: 1.5,
          color: 'text.secondary',
        }}
      >
        {icon}
      </Box>

      {/* Label */}
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-mute)',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      {/* Value */}
      {loading ? (
        <Skeleton width="70%" height={32} />
      ) : (
        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1.2,
            color: valueColor ?? 'text.primary',
            mb: subvalue ? 0.5 : 0,
          }}
        >
          {value}
        </Typography>
      )}

      {/* Sub-value */}
      {subvalue && (
        loading ? (
          <Skeleton width="50%" height={18} />
        ) : (
          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-mute)' }}>
            {subvalue}
          </Typography>
        )
      )}
    </Box>
  );
}

// ─── Period + Laba Card (dark hero card) ─────────────────────────────────────
interface PeriodCardProps {
  period: DashboardPeriod;
  setPeriod: (p: DashboardPeriod) => void;
  laba: number;
  loading: boolean;
}

function PeriodCard({ period, setPeriod, laba, loading }: PeriodCardProps) {
  const isPositive = laba >= 0;
  const labaColor = isPositive ? '#4ade80' : '#f87171';

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--rounded-md)',
        p: 3,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)',
        height: '100%',
        minHeight: 160,
      }}
    >
      {/* Decorative orb */}
      <Box
        sx={{
          position: 'absolute',
          width: 180,
          height: 180,
          top: -60,
          right: -60,
          background: 'radial-gradient(circle, rgba(99,149,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 120,
          height: 120,
          bottom: -40,
          left: -20,
          background: 'radial-gradient(circle, rgba(230,0,35,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Period toggle */}
      <ToggleButtonGroup
        value={period}
        exclusive
        onChange={(_, v) => { if (v) setPeriod(v as DashboardPeriod); }}
        size="small"
        sx={{
          mb: 2.5,
          bgcolor: 'rgba(255,255,255,0.07)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.10)',
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 0,
            px: 1.75,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'none',
            '&.Mui-selected': {
              bgcolor: 'rgba(255,255,255,0.14)',
              color: '#fff',
              fontWeight: 700,
            },
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.10)',
            },
          },
        }}
      >
        {PERIOD_OPTIONS.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Label */}
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.45)',
          mb: 0.75,
        }}
      >
        Laba
      </Typography>

      {/* Laba value */}
      {loading ? (
        <Skeleton
          width="60%"
          height={40}
          sx={{ bgcolor: 'rgba(255,255,255,0.10)', borderRadius: 1 }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 800,
            lineHeight: 1.1,
            color: labaColor,
            letterSpacing: '-0.02em',
          }}
        >
          {formatCurrency(laba)}
        </Typography>
      )}

      {/* Surplus / Defisit badge */}
      {!loading && (
        <Box
          sx={{
            display: 'inline-block',
            mt: 0.75,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: isPositive ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${isPositive ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.30)'}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: labaColor,
              letterSpacing: '0.04em',
            }}
          >
            {isPositive ? '▲ Surplus' : '▼ Defisit'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { loading, period, setPeriod, stats, chartData } = useDashboardStats();

  return (
    <Box>

      <Grid container spacing={2}>
        {/* Laba + Period card — full width on mobile, half on md+ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PeriodCard
            period={period}
            setPeriod={setPeriod}
            laba={stats.laba}
            loading={loading}
          />
        </Grid>

        {/* Uang Masuk */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Uang Masuk"
            value={formatCurrency(stats.uangMasuk)}
            subvalue={`${stats.jumlahTransaksi} transaksi`}
            blobColor="rgba(99,149,255,0.22)"
            icon={<TrendingUpIcon fontSize="small" />}
            valueColor="primary.main"
            loading={loading}
          />
        </Grid>

        {/* Uang Keluar */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Uang Keluar"
            value={formatCurrency(stats.uangKeluar)}
            blobColor="rgba(255,120,120,0.22)"
            icon={<TrendingDownIcon fontSize="small" />}
            valueColor="error.main"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Quick Transaksi */}
      <Box sx={{ mt: 3 }}>
        <QuickTransaksi />
      </Box>

      {/* Chart */}
      <Box sx={{ mt: 2 }}>
        <DashboardChart chartData={chartData} period={period} loading={loading} />
      </Box>
    </Box>
  );
}
