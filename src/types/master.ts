// ─── Audit fields shared by all master documents ─────────────────────────────
export interface AuditFields {
  createdAt: number; // Unix timestamp ms (from RTDB serverTimestamp)
  updatedAt: number; // Unix timestamp ms
  createdBy: string; // Firebase Auth UID
  updatedBy: string; // Firebase Auth UID
}

// ─── Barang ───────────────────────────────────────────────────────────────────
export interface Barang extends AuditFields {
  id: string;           // RTDB push key
  kode: string;         // e.g. "OLI-001"
  kodeNormalized: string; // lowercase for uniqueness check
  nama: string;
  kategori: string;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  stokMinimum: number;
  isActive: boolean;
}

export type BarangFormData = Omit<
  Barang,
  'id' | 'kodeNormalized' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

// ─── Jasa ─────────────────────────────────────────────────────────────────────
export interface Jasa extends AuditFields {
  id: string;
  kode: string;
  kodeNormalized: string;
  nama: string;
  kategori: string;
  harga: number;
  estimasiMenit: number | null;
  deskripsi: string;
  isActive: boolean;
}

export type JasaFormData = Omit<
  Jasa,
  'id' | 'kodeNormalized' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

// ─── Paket ────────────────────────────────────────────────────────────────────
export interface PaketKomponen {
  type: 'barang' | 'jasa';
  refId: string;  // Firestore document ID of Barang or Jasa
  qty: number;
}

export interface Paket extends AuditFields {
  id: string;
  kode: string;
  kodeNormalized: string;
  nama: string;
  deskripsi: string;
  komponen: PaketKomponen[];
  hargaPaket: number;
  isActive: boolean;
}

export type PaketFormData = Omit<
  Paket,
  'id' | 'kodeNormalized' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;
