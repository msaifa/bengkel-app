import { Box, Typography } from '@mui/material';

export default function BarangMasukPage() {
  return (
    <Box>
      <Box className="page-header">
        <Typography component="h1" className="page-title">
          Barang Masuk
        </Typography>
        <Typography className="page-subtitle">
          Catat penerimaan barang ke gudang bengkel.
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
