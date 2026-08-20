# Application Schema — Bengkel App

> **⚠️ WAJIB DIBACA OLEH AGENT:**
> Dokumen ini adalah sumber kebenaran tunggal untuk struktur proyek dan database.
> **Setiap kali mengubah atau menambah struktur database (node RTDB, field, tipe data),
> wajib memperbarui dokumen ini sebelum mengakhiri sesi.**

---

## 1. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.3.1 (App Router, Turbopack) |
| Language | TypeScript |
| UI Library | Material UI v9.3.1 |
| Database | Firebase Realtime Database (RTDB) — client SDK only |
| Auth | Firebase Auth |
| Styling | MUI `sx` prop + CSS variables di `globals.css` |
| Font | Inter |

### MUI v9 Breaking Changes (penting!)
- `PaperProps` → `slotProps={{ paper: {...} }}`
- `inputProps` → `slotProps={{ htmlInput: {...} }}`
- `InputProps` → `slotProps={{ input: {...} }}`
- `AutocompleteRenderInputParams` tidak punya `InputProps`, gunakan `params.slotProps.input`
- `Grid` `alignItems` harus di dalam `sx={{}}`

---

## 2. Struktur Direktori

```
src/
├── app/
│   ├── (app)/                    # Route group — semua halaman authenticated
│   │   ├── layout.tsx            # Wraps AuthGuard + AppShell
│   │   ├── page.tsx              # Dashboard (/)
│   │   ├── akun/page.tsx         # Akun & navigasi ke master
│   │   ├── laporan/page.tsx      # Laporan (placeholder)
│   │   ├── uang-keluar/page.tsx  # Uang Keluar (placeholder)
│   │   ├── master/
│   │   │   ├── barang/page.tsx   # CRUD Barang
│   │   │   ├── jasa/page.tsx     # CRUD Jasa
│   │   │   └── paket/page.tsx    # CRUD Paket
│   │   ├── barang-masuk/
│   │   │   ├── page.tsx          # List Pembelian + tab Stok
│   │   │   ├── tambah/page.tsx   # Form buat Pembelian baru
│   │   │   └── [id]/page.tsx     # Detail + batalkan Pembelian
│   │   ├── stok/page.tsx         # Inventory view + riwayat pergerakan
│   │   └── transaksi/
│   │       ├── page.tsx          # List Transaksi Penjualan
│   │       ├── tambah/page.tsx   # Form buat Transaksi baru (full-screen, no shell)
│   │       └── [id]/page.tsx     # Detail + batalkan Transaksi
│   ├── login/page.tsx
│   ├── layout.tsx                # Root layout (MUI ThemeProvider, fonts)
│   └── providers.tsx
├── components/
│   ├── auth/AuthGuard.tsx
│   ├── common/
│   │   ├── AppSnackbar.tsx       # Snackbar global (SnackbarState, SNACKBAR_CLOSED, snackSuccess, snackError)
│   │   ├── ConfirmDialog.tsx     # Dialog konfirmasi reusable
│   │   ├── CurrencyInput.tsx     # TextField dengan thousand separator otomatis
│   │   ├── EmptyState.tsx
│   │   └── StatusChip.tsx
│   ├── layout/
│   │   ├── AppShell.tsx          # Layout utama — menyembunyikan header/sidebar di SHELL_HIDDEN_PATHS
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   └── MobileBottomNavigation.tsx  # Disembunyikan di HIDDEN_PATHS
│   ├── master/
│   │   ├── barang/{BarangForm, BarangList}.tsx
│   │   ├── jasa/{JasaForm, JasaList}.tsx
│   │   └── paket/{PaketForm, PaketList}.tsx
│   ├── pembelian/
│   │   ├── PembelianDetail.tsx
│   │   ├── PembelianForm.tsx
│   │   ├── PembelianList.tsx
│   │   └── PembelianStatusChip.tsx
│   ├── stok/
│   │   ├── StokList.tsx
│   │   ├── StokMovementList.tsx  # Handles PURCHASE/PURCHASE_CANCEL/SALE/SALE_CANCEL
│   │   └── StokStatusChip.tsx
│   └── transaksi/
│       ├── TransaksiDetail.tsx
│       ├── TransaksiForm.tsx     # Form transaksi — full-screen, fixed footer, collapsible info
│       ├── TransaksiList.tsx
│       └── TransaksiStatusChip.tsx
├── config/
│   └── navigation.ts             # mobilePrimaryNav, accountSecondaryNav, getBottomNavValue
├── contexts/AuthContext.tsx
├── hooks/useAuth.ts
├── lib/firebase/
│   ├── auth.ts
│   ├── config.ts                 # isFirebaseConfigured (7 env vars)
│   └── database.ts               # Singleton RTDB instance
├── repositories/                 # Akses langsung ke RTDB — CRUD primitif
│   ├── barang.repository.ts
│   ├── inventory.repository.ts
│   ├── jasa.repository.ts
│   ├── paket.repository.ts
│   ├── pembelian.repository.ts
│   ├── stockMovement.repository.ts
│   └── transaksi.repository.ts
├── services/                     # Business logic — validasi, kalkulasi, atomic write
│   ├── barang.service.ts
│   ├── inventory.service.ts      # fetchInventoryView(), fetchRecentMovements()
│   ├── jasa.service.ts
│   ├── paket.service.ts
│   ├── pembelian.service.ts      # createPembelianService, cancelPembelianService
│   └── transaksi.service.ts      # createTransaksiService, cancelTransaksiService, aggregateStockRequirements
├── theme/theme.ts
├── types/
│   ├── master.ts                 # Barang, Jasa, Paket, PaketKomponen, AuditFields
│   ├── pembelian.ts              # Pembelian, Inventory, StockMovement, InventoryView
│   └── transaksi.ts             # Transaksi, TransactionItem, TransaksiFormData, StockRequirement
└── utils/
    ├── format.ts                 # formatCurrency, compactCurrency, formatDate, formatDateShort
    ├── kode.ts                   # generateKode(prefix, existingCodes) → "B26081901"
    └── normalize.ts
```

---

## 3. Arsitektur Data Flow

```
UI Component
    ↓ call
Service (business logic, validasi, atomic write)
    ↓ call
Repository (RTDB CRUD primitif)
    ↓ Firebase SDK
Firebase Realtime Database
```

**Pola atomic write:** Semua operasi yang menyentuh lebih dari satu node menggunakan
`update(ref(db), { [path1]: val1, [path2]: val2, ... })` — multi-path atomic update.
**Jangan gunakan** `runTransaction()` atau `serverTimestamp()` (menyebabkan hang).
**Selalu gunakan** `Date.now()` untuk timestamps.

---

## 4. Firebase Realtime Database — Struktur Node

### Root nodes

```
/
├── barang/
├── jasa/
├── paket/
├── pembelian/
├── transaksi/
├── inventory/
└── stockMovements/
```

---

### 4.1 `/barang/{pushKey}`

```typescript
{
  id: string;               // sama dengan pushKey
  kode: string;             // e.g. "OLI-001"
  kodeNormalized: string;   // lowercase, untuk uniqueness check (indexed)
  nama: string;
  kategori: string;
  satuan: string;           // e.g. "liter", "pcs", "botol"
  hargaBeli: number;        // Rupiah
  hargaJual: number;        // Rupiah
  stokMinimum: number;
  isActive: boolean;
  createdAt: number;        // Unix ms
  updatedAt: number;
  createdBy: string;        // Firebase Auth UID
  updatedBy: string;
}
```

**Index:** `.indexOn: ["kodeNormalized"]`

---

### 4.2 `/jasa/{pushKey}`

```typescript
{
  id: string;
  kode: string;
  kodeNormalized: string;   // indexed
  nama: string;
  kategori: string;
  harga: number;            // Rupiah
  estimasiMenit: number | null;
  deskripsi: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}
```

**Index:** `.indexOn: ["kodeNormalized"]`

---

### 4.3 `/paket/{pushKey}`

```typescript
{
  id: string;
  kode: string;
  kodeNormalized: string;   // indexed
  nama: string;
  deskripsi: string;
  hargaPaket: number;       // Rupiah
  isActive: boolean;
  komponen: {               // RTDB menyimpan array sebagai object {0: ..., 1: ...}
    [index: string]: {
      type: 'barang' | 'jasa';
      refId: string;        // pushKey dari /barang atau /jasa
      qty: number;
    }
  };
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}
```

**Index:** `.indexOn: ["kodeNormalized"]`

---

### 4.4 `/pembelian/{pushKey}`

```typescript
{
  id: string;
  nomorPembelian: string;   // format: "PBL-YYMMDD-XXXXXX"
  tanggalPembelian: number; // Unix ms
  supplierName?: string;
  nomorReferensi?: string;
  catatan?: string;
  totalItem: number;
  subtotal: number;
  total: number;
  status: 'posted' | 'cancelled';
  items: {                  // array disimpan sebagai object
    [index: string]: {
      barangId: string;
      kodeSnapshot: string;
      namaSnapshot: string;
      satuanSnapshot: string;
      qty: number;
      hargaBeli: number;
      subtotal: number;
    }
  };
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
}
```

---

### 4.5 `/transaksi/{pushKey}`

```typescript
{
  id: string;
  nomorTransaksi: string;   // format: "TRX-YYMMDD-XXXXXX"
  tanggalTransaksi: number; // Unix ms
  customerName?: string;    // kosong = "Umum"
  catatan?: string;
  totalItem: number;
  subtotal: number;
  diskon: number;
  total: number;
  metodePembayaran: 'cash' | 'transfer' | 'qris';
  jumlahBayar: number;
  kembalian: number;
  status: 'posted' | 'cancelled';
  items: {                  // array disimpan sebagai object
    [index: string]: {
      type: 'barang' | 'jasa' | 'paket';
      refId: string;
      kodeSnapshot: string;
      namaSnapshot: string;
      satuanSnapshot?: string;
      qty: number;
      hargaSatuan: number;
      subtotal: number;
      paketKomponenSnapshot?: {   // hanya ada jika type === 'paket'
        [index: string]: {
          type: 'barang' | 'jasa';
          refId: string;
          kodeSnapshot: string;
          namaSnapshot: string;
          qty: number;
          hargaSnapshot: number;
          satuanSnapshot?: string;
        }
      };
    }
  };
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
  cancelledAt?: number;
  cancelledBy?: string;
  cancellationReason?: string;
}
```

---

### 4.6 `/inventory/{barangId}`

Keyed by `barangId` (bukan pushKey) — satu record per barang.

```typescript
{
  barangId: string;
  currentStock: number;     // stok saat ini
  updatedAt: number;
  lastMovementAt: number;
}
```

---

### 4.7 `/stockMovements/{pushKey}`

```typescript
{
  id: string;
  barangId: string;
  movementType: 'PURCHASE' | 'PURCHASE_CANCEL' | 'SALE' | 'SALE_CANCEL';
  direction: 'IN' | 'OUT';
  qty: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: 'pembelian' | 'transaksi';
  referenceId: string;      // pushKey dari /pembelian atau /transaksi
  referenceNumber: string;  // nomorPembelian atau nomorTransaksi
  barangKodeSnapshot: string;
  barangNamaSnapshot: string;
  satuanSnapshot: string;
  occurredAt: number;       // Unix ms
  createdAt: number;
  createdBy: string;
}
```

**Index:** `.indexOn: ["occurredAt", "barangId"]`

---

## 5. Nomor Dokumen

| Dokumen | Format | Contoh |
|---|---|---|
| Pembelian | `PBL-YYMMDD-XXXXXX` | `PBL-260820-AB12CD` |
| Transaksi | `TRX-YYMMDD-XXXXXX` | `TRX-260820-XY98ZW` |
| Kode Barang | `{PREFIX}YYMMDDNN` | `OLI26082001` |
| Kode Jasa | `{PREFIX}YYMMDDNN` | `SVC26082001` |
| Kode Paket | `{PREFIX}YYMMDDNN` | `PKT26082001` |

`XXXXXX` = 6 karakter terakhir dari RTDB push key (uppercase).

---

## 6. Atomic Write Pattern

Semua operasi yang menyentuh lebih dari satu node RTDB menggunakan multi-path update:

```typescript
const updates: Record<string, unknown> = {};
updates[`transaksi/${id}`] = transaksiData;
updates[`inventory/${barangId}`] = inventoryData;
updates[`stockMovements/${movId}`] = movementData;
await update(ref(db), updates);  // atomic
```

**Operasi yang menggunakan atomic write:**
- `createPembelianService` → tulis `/pembelian`, `/inventory`, `/stockMovements` (per item)
- `cancelPembelianService` → update `/pembelian`, `/inventory`, `/stockMovements` (reversal)
- `createTransaksiService` → tulis `/transaksi`, `/inventory`, `/stockMovements` (per barang)
- `cancelTransaksiService` → update `/transaksi`, `/inventory`, `/stockMovements` (reversal)

---

## 7. Navigasi

### Bottom Navigation (mobile, 5 item)
| Index | Label | Route |
|---|---|---|
| 0 | Dashboard | `/` |
| 1 | Pembelian | `/barang-masuk` |
| 2 | Transaksi | `/transaksi` |
| 3 | Report | `/laporan` |
| 4 | Akun | `/akun` |

### Halaman tanpa Shell (AppHeader + Sidebar + BottomNav disembunyikan)
```typescript
const SHELL_HIDDEN_PATHS = ['/transaksi/tambah', '/barang-masuk/tambah'];
```

### Akun Secondary Nav (accessible via /akun)
- Master Barang → `/master/barang`
- Master Jasa → `/master/jasa`
- Master Paket → `/master/paket`
- Uang Keluar → `/uang-keluar`

---

## 8. Environment Variables

File: `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://crud-firebase-3dcf6-default-rtdb.firebaseio.com
```

---

## 9. Design System

| Token CSS | Nilai |
|---|---|
| `--color-primary` | `#e60023` (merah aksen) |
| `--color-primary-pressed` | Lebih gelap dari primary |
| `--color-canvas` | Putih/cream (card background) |
| `--color-surface` | Surface lebih terang |
| `--color-surface-soft` | Background halaman |
| `--color-ink` | Teks utama |
| `--color-mute` | Teks sekunder/placeholder |
| `--color-hairline` | Border tipis |
| `--color-on-dark` | Teks di atas background gelap |
| `--rounded-md` | `16px` |
| `--rounded-lg` | `32px` |

---

## 10. Fitur yang Diimplementasikan

| Modul | Status | Catatan |
|---|---|---|
| Auth (login/logout) | ✅ | Firebase Auth |
| Master Barang | ✅ | CRUD, auto-kode, toggle aktif |
| Master Jasa | ✅ | CRUD, auto-kode, toggle aktif |
| Master Paket | ✅ | CRUD, komponen barang+jasa, auto-kode |
| Pembelian (Barang Masuk) | ✅ | Create, detail, cancel + stock reversal |
| Stok / Inventory | ✅ | View stok saat ini + riwayat pergerakan |
| Transaksi Penjualan | ✅ | Create (cart+search+payment), detail, cancel + stock reversal |
| Dashboard | 🔲 | Placeholder |
| Laporan | 🔲 | Placeholder (dilarang diimplementasi) |
| Uang Keluar | 🔲 | Placeholder (dilarang diimplementasi) |
| Master Supplier | 🔲 | Tidak diimplementasi |
| Master Customer | 🔲 | Tidak diimplementasi |
| Invoice PDF | 🔲 | Tidak diimplementasi |

---

## 11. Catatan Penting untuk Agent

1. **Timestamps:** Selalu gunakan `Date.now()`. Jangan gunakan `serverTimestamp()` dari firebase/database — menyebabkan hang saat digunakan dengan `update()`.

2. **Array di RTDB:** RTDB menyimpan array JavaScript sebagai object `{0: ..., 1: ...}`. Saat membaca, gunakan `Object.values(raw)` untuk mengkonversi kembali ke array.

3. **Kode unik:** Cek duplikasi menggunakan `kodeNormalized` (lowercase) dengan `orderByChild('kodeNormalized').equalTo(...)`.

4. **Stock aggregation untuk Paket:** Saat menghitung kebutuhan stok, barang di dalam paket dikalikan `paketQty × komponenQty`. Jasa tidak mempengaruhi stok.

5. **Cancel transaksi:** Gunakan snapshot item dari dokumen transaksi yang tersimpan (bukan data master saat ini) untuk menghitung reversal stok.

6. **ESLint rule `react-hooks/set-state-in-effect`:** Jangan panggil `setState` langsung di dalam `useEffect`. Gunakan derived value atau pattern lain.

7. **MUI Autocomplete reset:** Gunakan `key={counter}` dan increment counter setelah pilih — cara paling bersih untuk reset field tanpa konflik controlled/uncontrolled.
