'use client';

import { useState, useEffect, useRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

type CurrencyInputProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
  value: number;
  onChange: (value: number) => void;
  /** Prefix yang ditampilkan, default 'Rp ' */
  prefix?: string;
};

/**
 * TextField dengan thousand separator otomatis.
 * Menyimpan nilai sebagai number murni, menampilkan dengan format "1.500.000".
 */
export default function CurrencyInput({
  value,
  onChange,
  prefix = 'Rp ',
  ...rest
}: CurrencyInputProps) {
  const [raw, setRaw] = useState('');
  const skipEffect = useRef(false);

  // Format number → "1.500.000"
  function format(n: number): string {
    if (isNaN(n) || n === 0) return '';
    return n.toLocaleString('id-ID');
  }

  // Parse "1.500.000" → 1500000
  function parse(s: string): number {
    const digits = s.replace(/\./g, '').replace(/[^0-9]/g, '');
    return digits === '' ? 0 : parseInt(digits, 10);
  }

  // Sync external value → display (only when not actively typing)
  useEffect(() => {
    if (skipEffect.current) { skipEffect.current = false; return; }
    setRaw(format(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    // Allow only digits and dots
    const cleaned = input.replace(/[^0-9.]/g, '').replace(/\./g, '');
    const num = cleaned === '' ? 0 : parseInt(cleaned, 10);
    const formatted = num === 0 ? '' : num.toLocaleString('id-ID');
    skipEffect.current = true;
    setRaw(formatted);
    onChange(num);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    // Show plain digits on focus for easier editing
    const digits = raw.replace(/\./g, '');
    setRaw(digits);
    // Select all text so user can immediately overwrite
    requestAnimationFrame(() => e.target.select());
  }

  function handleBlur() {
    // Re-format on blur
    const num = parse(raw);
    setRaw(format(num));
    onChange(num);
  }

  return (
    <TextField
      {...rest}
      type="text"
      inputMode="numeric"
      value={raw}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      slotProps={{
        input: {
          startAdornment: (
            <span style={{ color: 'var(--color-ash)', marginRight: 2, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              {prefix}
            </span>
          ),
        },
        htmlInput: {
          style: { textAlign: 'right' },
        },
      }}
    />
  );
}
