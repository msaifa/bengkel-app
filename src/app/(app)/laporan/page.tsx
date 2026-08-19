import { Box, Typography } from '@mui/material';

export default function LaporanPage() {
  return (
    <Box>
      <Box className="page-header">
        <Typography component="h1" className="page-title">
          Laporan
        </Typography>
        <Typography className="page-subtitle">
          Lihat laporan keuangan dan operasional bengkel.
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
