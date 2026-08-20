// ─── Transaction Item Types ───────────────────────────────────────────────────
export type TransactionItemType = 'barang' | 'jasa' | 'paket';

export interface TransactionPackageComponent {
  type: 'barang' | 'jasa';
  refId: string;
  kodeSnapshot: string;
  namaSnapshot: string;
  qty: number;
  hargaSnapshot: number;
  satuanSnapshot?: string;
}

export interface TransactionItem {
  type: TransactionItemType;
  refId: string;
  kodeSnapshot: string;
  namaSnapshot: string;
  satuanSnapshot?: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
  paketKomponenSnapshot?: TransactionPackageComponent[];
}

// ─── Transaksi ────────────────────────────────────────────────────────────────
export type TransactionStatus = 'posted' | 'cancelled';
export type MetodePembayaran = 'cash' | 'transfer' | 'qris';

export interface Transaksi {
  id: string;
  nomorTransaksi: string;
  tanggalTransaksi: number; // Unix ms
  customerName?: string;
  catatan?: string;
  items: TransactionItem[];
  totalItem: number;
  subtotal: number;
  diskon: number;
  total: number;
  metodePembayaran: MetodePembayaran;
  jumlahBayar: number;
  kembalian: number;
  status: TransactionStatus;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
}

// ─── Form Data ────────────────────────────────────────────────────────────────
export type TransaksiFormData = {
  tanggalTransaksi: number;
  customerName: string;
  catatan: string;
  items: TransactionItem[];
  diskon: number;
  metodePembayaran: MetodePembayaran;
  jumlahBayar: number;
};

// ─── Stock Requirement (aggregated) ──────────────────────────────────────────
export interface StockRequirement {
  barangId: string;
  qty: number;
  kodeSnapshot: string;
  namaSnapshot: string;
  satuanSnapshot: string;
}
