// ─── Pembelian Item (snapshot barang saat transaksi) ─────────────────────────
export interface PembelianItem {
  barangId: string;
  kodeSnapshot: string;
  namaSnapshot: string;
  satuanSnapshot: string;
  qty: number;
  hargaBeli: number;
  subtotal: number;
}

// ─── Pembelian ────────────────────────────────────────────────────────────────
export type PembelianStatus = 'posted' | 'cancelled';

export interface Pembelian {
  id: string;
  nomorPembelian: string;
  tanggalPembelian: number; // Unix ms
  supplierName?: string;
  nomorReferensi?: string;
  catatan?: string;
  items: PembelianItem[];
  totalItem: number;
  subtotal: number;
  total: number;
  status: PembelianStatus;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
}

export type PembelianFormData = {
  tanggalPembelian: number;
  supplierName: string;
  nomorReferensi: string;
  catatan: string;
  items: PembelianItemFormData[];
};

export type PembelianItemFormData = {
  barangId: string;
  kodeSnapshot: string;
  namaSnapshot: string;
  satuanSnapshot: string;
  qty: number;
  hargaBeli: number;
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface Inventory {
  barangId: string;
  currentStock: number;
  updatedAt: number;
  lastMovementAt: number;
}

// ─── Stock Movement ───────────────────────────────────────────────────────────
export type MovementType = 'PURCHASE' | 'PURCHASE_CANCEL' | 'SALE' | 'SALE_CANCEL';
export type MovementDirection = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  barangId: string;
  movementType: MovementType;
  direction: MovementDirection;
  qty: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: 'pembelian' | 'transaksi';
  referenceId: string;
  referenceNumber: string;
  barangKodeSnapshot: string;
  barangNamaSnapshot: string;
  satuanSnapshot: string;
  occurredAt: number;
  createdAt: number;
  createdBy: string;
}

// ─── Merged view for Inventory page ──────────────────────────────────────────
export type StockStatus = 'aman' | 'menipis' | 'habis';

export interface InventoryView {
  barangId: string;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  stokMinimum: number;
  isActive: boolean;
  currentStock: number;
  status: StockStatus;
}
