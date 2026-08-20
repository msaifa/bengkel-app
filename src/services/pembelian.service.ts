import { ref, update, push } from 'firebase/database';
import { db } from '@/lib/firebase/database';
import {
  Pembelian, PembelianFormData, PembelianItem,
} from '@/types/pembelian';
import {
  getAllPembelian,
  getPembelianById,
  newPembelianRef,
  pembelianPath,
} from '@/repositories/pembelian.repository';
import {
  getInventoryByBarangId,
  inventoryPath,
} from '@/repositories/inventory.repository';
import { stockMovementPath } from '@/repositories/stockMovement.repository';

// ─── Custom errors ────────────────────────────────────────────────────────────
export class PembelianValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PembelianValidationError';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateNomorPembelian(id: string, tanggal: number): string {
  const d = new Date(tanggal);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const suffix = id.slice(-6).toUpperCase();
  return `PB-${yy}${mm}${dd}-${suffix}`;
}

function calcSubtotal(items: PembelianFormData['items']): number {
  return items.reduce((sum, it) => sum + it.qty * it.hargaBeli, 0);
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
export async function fetchAllPembelian(): Promise<Pembelian[]> {
  return getAllPembelian();
}

export async function fetchPembelianById(id: string): Promise<Pembelian | null> {
  return getPembelianById(id);
}

// ─── Create Pembelian (atomic multi-path update) ──────────────────────────────
export async function createPembelianService(
  data: PembelianFormData,
  uid: string,
): Promise<string> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');

  // Validate items
  if (data.items.length === 0) {
    throw new PembelianValidationError('Pembelian harus memiliki minimal 1 item barang.');
  }
  for (const it of data.items) {
    if (!it.barangId) throw new PembelianValidationError('Pilih barang untuk setiap item.');
    if (it.qty <= 0) throw new PembelianValidationError(`Qty barang "${it.namaSnapshot}" harus lebih dari 0.`);
    if (it.hargaBeli < 0) throw new PembelianValidationError(`Harga beli barang "${it.namaSnapshot}" tidak valid.`);
  }

  // Check duplicate barangId in items
  const barangIds = data.items.map((it) => it.barangId);
  if (new Set(barangIds).size !== barangIds.length) {
    throw new PembelianValidationError('Terdapat barang yang sama dalam daftar item. Gabungkan menjadi satu item.');
  }

  const now = Date.now();
  const subtotal = calcSubtotal(data.items);

  // ── READ all inventory first ──────────────────────────────────────────────
  const inventoryMap = new Map<string, number>();
  for (const it of data.items) {
    const inv = await getInventoryByBarangId(it.barangId);
    inventoryMap.set(it.barangId, inv?.currentStock ?? 0);
  }

  // ── Generate pembelian ID ─────────────────────────────────────────────────
  const pembelianRef = newPembelianRef();
  const pembelianId = pembelianRef.key!;
  const nomorPembelian = generateNomorPembelian(pembelianId, data.tanggalPembelian);

  // ── Build items with subtotal ─────────────────────────────────────────────
  const items: PembelianItem[] = data.items.map((it) => ({
    barangId: it.barangId,
    kodeSnapshot: it.kodeSnapshot,
    namaSnapshot: it.namaSnapshot,
    satuanSnapshot: it.satuanSnapshot,
    qty: it.qty,
    hargaBeli: it.hargaBeli,
    subtotal: it.qty * it.hargaBeli,
  }));

  // ── Build multi-path update payload ──────────────────────────────────────
  const updates: Record<string, unknown> = {};

  // Pembelian document
  updates[pembelianPath(pembelianId)] = {
    nomorPembelian,
    tanggalPembelian: data.tanggalPembelian,
    supplierName: data.supplierName || null,
    nomorReferensi: data.nomorReferensi || null,
    catatan: data.catatan || null,
    items,
    totalItem: items.length,
    subtotal,
    total: subtotal,
    status: 'posted',
    createdAt: now,
    createdBy: uid,
    updatedAt: now,
    updatedBy: uid,
  };

  // Inventory + StockMovement per item
  for (const it of items) {
    const before = inventoryMap.get(it.barangId) ?? 0;
    const after = before + it.qty;

    // Update inventory
    updates[inventoryPath(it.barangId)] = {
      barangId: it.barangId,
      currentStock: after,
      updatedAt: now,
      lastMovementAt: now,
    };

    // Create stock movement
    const movRef = push(ref(db, 'stockMovements'));
    updates[stockMovementPath(movRef.key!)] = {
      barangId: it.barangId,
      movementType: 'PURCHASE',
      direction: 'IN',
      qty: it.qty,
      quantityBefore: before,
      quantityAfter: after,
      referenceType: 'pembelian',
      referenceId: pembelianId,
      referenceNumber: nomorPembelian,
      barangKodeSnapshot: it.kodeSnapshot,
      barangNamaSnapshot: it.namaSnapshot,
      satuanSnapshot: it.satuanSnapshot,
      occurredAt: now,
      createdAt: now,
      createdBy: uid,
    };
  }

  // ── Atomic write ──────────────────────────────────────────────────────────
  await update(ref(db), updates);
  return pembelianId;
}

// ─── Cancel Pembelian (atomic multi-path update) ──────────────────────────────
export async function cancelPembelianService(
  id: string,
  cancellationReason: string,
  uid: string,
): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');

  // READ pembelian
  const pembelian = await getPembelianById(id);
  if (!pembelian) throw new PembelianValidationError('Pembelian tidak ditemukan.');
  if (pembelian.status === 'cancelled') {
    throw new PembelianValidationError('Pembelian ini sudah dibatalkan sebelumnya.');
  }

  // READ all inventory
  const inventoryMap = new Map<string, number>();
  for (const it of pembelian.items) {
    const inv = await getInventoryByBarangId(it.barangId);
    inventoryMap.set(it.barangId, inv?.currentStock ?? 0);
  }

  // VALIDATE: check no negative stock
  for (const it of pembelian.items) {
    const current = inventoryMap.get(it.barangId) ?? 0;
    if (current < it.qty) {
      throw new PembelianValidationError(
        `Pembelian tidak dapat dibatalkan karena stok "${it.namaSnapshot}" saat ini hanya ${current} ${it.satuanSnapshot}, sedangkan pembatalan membutuhkan pengurangan ${it.qty} ${it.satuanSnapshot}.`,
      );
    }
  }

  const now = Date.now();
  const updates: Record<string, unknown> = {};

  // Update pembelian status
  updates[`${pembelianPath(id)}/status`] = 'cancelled';
  updates[`${pembelianPath(id)}/cancelledAt`] = now;
  updates[`${pembelianPath(id)}/cancelledBy`] = uid;
  updates[`${pembelianPath(id)}/cancellationReason`] = cancellationReason;
  updates[`${pembelianPath(id)}/updatedAt`] = now;
  updates[`${pembelianPath(id)}/updatedBy`] = uid;

  // Inventory + reversal movement per item
  for (const it of pembelian.items) {
    const before = inventoryMap.get(it.barangId) ?? 0;
    const after = before - it.qty;

    updates[inventoryPath(it.barangId)] = {
      barangId: it.barangId,
      currentStock: after,
      updatedAt: now,
      lastMovementAt: now,
    };

    const movRef = push(ref(db, 'stockMovements'));
    updates[stockMovementPath(movRef.key!)] = {
      barangId: it.barangId,
      movementType: 'PURCHASE_CANCEL',
      direction: 'OUT',
      qty: it.qty,
      quantityBefore: before,
      quantityAfter: after,
      referenceType: 'pembelian',
      referenceId: id,
      referenceNumber: pembelian.nomorPembelian,
      barangKodeSnapshot: it.kodeSnapshot,
      barangNamaSnapshot: it.namaSnapshot,
      satuanSnapshot: it.satuanSnapshot,
      occurredAt: now,
      createdAt: now,
      createdBy: uid,
    };
  }

  await update(ref(db), updates);
}
