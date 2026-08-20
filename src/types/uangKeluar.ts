// ─── Uang Keluar — Pengeluaran Operasional ───────────────────────────────────

export type UangKeluarStatus = 'posted' | 'cancelled';

export type MetodePembayaranPengeluaran = 'cash' | 'transfer' | 'qris';

export const KATEGORI_PENGELUARAN = [
  'Operasional',
  'Listrik',
  'Air',
  'Internet',
  'Sewa',
  'Gaji / Honor',
  'Konsumsi',
  'Transportasi',
  'Peralatan',
  'Maintenance',
  'Kebersihan',
  'Administrasi',
  'Lain-lain',
] as const;

export type KategoriPengeluaran = typeof KATEGORI_PENGELUARAN[number];

export interface UangKeluar {
  id: string;
  nomorPengeluaran: string;       // format: "UK-YYMMDD-XXXXXX"
  tanggalPengeluaran: number;     // Unix ms
  kategori: string;
  keterangan: string;
  nominal: number;                // Rupiah
  metodePembayaran: MetodePembayaranPengeluaran;
  penerima?: string;
  nomorReferensi?: string;
  catatan?: string;
  status: UangKeluarStatus;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface UangKeluarFormData {
  tanggalPengeluaran: number;
  kategori: string;
  keterangan: string;
  nominal: number;
  metodePembayaran: MetodePembayaranPengeluaran;
  penerima: string;
  nomorReferensi: string;
  catatan: string;
}
