'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartPoint, DashboardPeriod } from '@/hooks/useDashboardStats';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}rb`;
  return String(value);
}

function chartSubtitle(period: DashboardPeriod): string {
  if (period === 'hari-ini')  return '7 hari terakhir';
  if (period === 'bulan-ini') return '30 hari terakhir';
  return '6 bulan terakhir';
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

  const nameMap: Record<string, string> = {
    masuk: 'Uang Masuk',
    keluar: 'Uang Keluar',
    laba: 'Laba',
  };

  return (
    <Box
      sx={{
        bgcolor: '#1e293b',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '10px',
        p: 1.5,
        boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
        minWidth: 160,
      }}
    >
      <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)', mb: 0.75, fontWeight: 600 }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Box key={entry.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.60)' }}>
              {nameMap[entry.name] ?? entry.name}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
            {fmt(entry.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DashboardChartProps {
  chartData: ChartPoint[];
  period: DashboardPeriod;
  loading: boolean;
}

export default function DashboardChart({ chartData, period, loading }: DashboardChartProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        p: 2.5,
        pb: 1.5,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.14)',
      }}
    >
      {/* Decorative orbs */}
      <Box sx={{
        position: 'absolute', width: 200, height: 200,
        top: -80, right: -60,
        background: 'radial-gradient(circle, rgba(99,149,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 120, height: 120,
        bottom: -40, left: -20,
        background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'rgba(255,255,255,0.55)',
        }}>
          Grafik Keuangan
        </Typography>
        <Typography sx={{
          fontSize: '0.6875rem',
          color: 'rgba(255,255,255,0.30)',
          mt: 0.25,
        }}>
          {chartSubtitle(period)}
        </Typography>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {[
          { key: 'masuk',  label: 'Uang Masuk',  color: '#60a5fa' },
          { key: 'keluar', label: 'Uang Keluar', color: '#f87171' },
          { key: 'laba',   label: 'Laba',         color: '#4ade80' },
        ].map((item) => (
          <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
            <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chart */}
      {loading ? (
        <Skeleton
          height={200}
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '8px', transform: 'none' }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f87171" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradLaba" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={period === 'bulan-ini' ? 4 : 0}
            />

            <YAxis
              tickFormatter={formatRupiah}
              tick={{ fill: 'rgba(255,255,255,0.30)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1 }} />

            {/* Hidden legend — we render our own above */}
            <Legend wrapperStyle={{ display: 'none' }} />

            <Area
              type="monotone"
              dataKey="masuk"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#gradMasuk)"
              dot={false}
              activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="keluar"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#gradKeluar)"
              dot={false}
              activeDot={{ r: 4, fill: '#f87171', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="laba"
              stroke="#4ade80"
              strokeWidth={2}
              fill="url(#gradLaba)"
              dot={false}
              activeDot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
