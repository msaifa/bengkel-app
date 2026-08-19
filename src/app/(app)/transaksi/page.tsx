import { Box, Typography } from '@mui/material';

export default function TransaksiPage() {
  return (
    <Box>
      <Box className="page-header">
        <Typography component="h1" className="page-title">
          Transaksi
        </Typography>
        <Typography className="page-subtitle">
          Kelola transaksi servis dan penjualan bengkel.
        </Typography>
      </Box>

      <Box className="section-card">
        <Typography className="placeholder-text">
          Fitur akan dibuat pada tahap berikutnya.
        </Typography>
      </Box>
    </Box>
  );
}
