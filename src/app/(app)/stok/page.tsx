'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function StokPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/barang-masuk?tab=stok');
  }, [router]);
  return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
}
