'use client';

import { useState } from 'react';
import {
  Box, IconButton, Popover, TextField, Typography, Button, Tooltip, Badge,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export interface DateRange {
  start: string; // 'YYYY-MM-DD' or ''
  end: string;   // 'YYYY-MM-DD' or ''
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function fmt(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function isInDateRange(ts: number, range: DateRange): boolean {
  if (!range.start && !range.end) return true;
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  if (range.start && dateStr < range.start) return false;
  if (range.end && dateStr > range.end) return false;
  return true;
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function monthStartString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<DateRange>(value);

  const isActive = !!(value.start || value.end);

  function open(e: React.MouseEvent<HTMLElement>) {
    setDraft(value);
    setAnchor(e.currentTarget);
  }
  function close() { setAnchor(null); }

  function apply() {
    // Swap if start > end
    let { start, end } = draft;
    if (start && end && start > end) { [start, end] = [end, start]; }
    onChange({ start, end });
    close();
  }

  function reset() {
    onChange({ start: '', end: '' });
    setDraft({ start: '', end: '' });
    close();
  }

  // Label shown on badge tooltip
  const label = value.start || value.end
    ? [value.start ? fmt(value.start) : '...', value.end ? fmt(value.end) : '...'].join(' – ')
    : '';

  return (
    <>
      <Tooltip title={isActive ? `Periode: ${label}` : 'Filter Periode'}>
        <IconButton
          size="small"
          onClick={open}
          sx={{
            border: '1px solid',
            borderColor: isActive ? 'var(--color-primary)' : 'var(--color-hairline)',
            borderRadius: 'var(--rounded-md)',
            color: isActive ? 'var(--color-primary)' : 'var(--color-mute)',
            p: '6px',
            flexShrink: 0,
          }}
        >
          <Badge
            variant="dot"
            invisible={!isActive}
            sx={{ '& .MuiBadge-dot': { bgcolor: 'var(--color-primary)', top: 2, right: 2 } }}
          >
            <CalendarMonthIcon sx={{ fontSize: 18 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 'var(--rounded-md)', mt: 0.5, p: 2, width: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5 }}>Filter Periode</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label="Tanggal Mulai"
            type="date"
            size="small"
            value={draft.start}
            onChange={(e) => setDraft((p) => ({ ...p, start: e.target.value }))}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Tanggal Akhir"
            type="date"
            size="small"
            value={draft.end}
            onChange={(e) => setDraft((p) => ({ ...p, end: e.target.value }))}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            onClick={reset}
            sx={{ color: 'var(--color-mute)', fontWeight: 600, flex: 1 }}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={apply}
            sx={{ bgcolor: 'var(--color-primary)', color: '#fff', fontWeight: 700, flex: 1, '&:hover': { bgcolor: 'var(--color-primary-pressed)' } }}
          >
            Terapkan
          </Button>
        </Box>
      </Popover>
    </>
  );
}
