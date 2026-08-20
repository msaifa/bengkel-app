'use client';

import { useState, useEffect } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllBarang } from '@/repositories/barang.repository';
import { getAllInventory } from '@/repositories/inventory.repository';
import { Barang } from '@/types/master';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StokWarning {
  barang: Barang;
  currentStock: number;
  isHabis: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useStokAlert() {
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<StokWarning[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) setLoading(true);
      try {
        const [allBarang, allInventory] = await Promise.all([
          getAllBarang(),
          getAllInventory(),
        ]);
        if (cancelled) return;

        const inventoryMap = new Map(allInventory.map((inv) => [inv.barangId, inv.currentStock]));

        const result: StokWarning[] = allBarang
          .filter((b) => b.isActive && b.stokMinimum > 0)
          .map((b) => ({
            barang: b,
            currentStock: inventoryMap.get(b.id) ?? 0,
            isHabis: (inventoryMap.get(b.id) ?? 0) === 0,
          }))
          .filter((w) => w.currentStock <= w.barang.stokMinimum)
          .sort((a, b) => a.currentStock - b.currentStock);

        if (!cancelled) setWarnings(result);
      } catch {
        // silent — non-critical widget
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { loading, warnings };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StokAlert() {
  const { loading, warnings } = useStokAlert();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        p: 2.5,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.14)',
      }}
    >
      {/* Decorative orbs */}
      <Box sx={{
        position: 'absolute', width: 160, height: 160,
        top: -60, right: -40,
        background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 100, height: 100,
        bottom: -30, left: -20,
        background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: loading || warnings.length > 0 ? 2 : 0 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: 'rgba(251,191,36,0.12)',
          color: '#fbbf24',
          flexShrink: 0,
        }}>
          <InventoryIcon sx={{ fontSize: 17 }} />
        </Box>
        <Typography sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'rgba(255,255,255,0.55)',
        }}>
          Peringatan Stok
        </Typography>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              height={36}
              sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '8px', transform: 'none' }}
            />
          ))}
        </Box>
      )}

      {/* All safe */}
      {!loading && warnings.length === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 22, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ade80', lineHeight: 1.3 }}>
              Semua stok dalam kondisi aman
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', mt: 0.25 }}>
              Tidak ada barang yang perlu direstok saat ini.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Warning list */}
      {!loading && warnings.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {warnings.map((w) => (
            <Box
              key={w.barang.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: '10px',
                bgcolor: w.isHabis
                  ? 'rgba(239,68,68,0.10)'
                  : 'rgba(251,191,36,0.08)',
                border: `1px solid ${w.isHabis ? 'rgba(239,68,68,0.20)' : 'rgba(251,191,36,0.15)'}`,
              }}
            >
              {/* Icon + name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <WarningAmberIcon sx={{
                  fontSize: 16,
                  color: w.isHabis ? '#f87171' : '#fbbf24',
                  flexShrink: 0,
                }} />
                <Typography sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {w.barang.nama}
                </Typography>
              </Box>

              {/* Stock badge */}
              <Box sx={{
                flexShrink: 0,
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: w.isHabis ? 'rgba(239,68,68,0.18)' : 'rgba(251,191,36,0.14)',
              }}>
                <Typography sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: w.isHabis ? '#f87171' : '#fbbf24',
                  whiteSpace: 'nowrap',
                }}>
                  {w.isHabis
                    ? 'Habis'
                    : `${w.currentStock} / ${w.barang.stokMinimum} ${w.barang.satuan}`}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
