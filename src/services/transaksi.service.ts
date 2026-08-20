import { ref, update, push } from 'firebase/database';
import { db } from '@/lib/firebase/database';
import {
  Transaksi, TransaksiFormData, TransactionItem,
  StockRequirement,
} from '@/types/transaksi';
import {
  getAllTransaksi,
  getTransaksiById,
  newTransaksiRef,
  transaksiPath,
} from '@/repositories/transaksi.repository';
import {
  getInventoryByBarangId,
  inventoryPath,
} from '@/repositories/inventory.repository';
import { stockMovementPath } from '@/repositories/stockMovement.repository';

// ─── Custom errors ────────────────────────────────────────────────────────────
export class TransaksiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransaksiValidationError';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateNomorTransaksi(id: string, tanggal: number): string {
  const d = new Date(tanggal);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const suffix = id.slice(-6).toUpperCase();
  return `TRX-${yy}${mm}${dd}-${suffix}`;
}

/**
 * Aggregate stock requirements from transaction items.
 * Handles: direct Barang + Barang inside Paket (with qty multiplier).
 * Jasa is ignored (no stock impact).
 */
export function aggregateStockRequirements(
  items: TransactionItem[],
): Map<string, StockRequirement> {
  const reqMap = new Map<string, StockRequirement>();

  function addReq(
    barangId: string,
    qty: number,
    kodeSnapshot: string,
    namaSnapshot: string,
    satuanSnapshot: string,
  ) {
    const existing = reqMap.get(barangId);
    if (existing) {
      existing.qty += qty;
    } else {
      reqMap.set(barangId, { barangId, qty, kodeSnapshot, namaSnapshot, satuanSnapshot });
    }
  }

  for (const item of items) {
    if (item.type === 'barang') {
      addReq(item.refId, item.qty, item.kodeSnapshot, item.namaSnapshot, item.satuanSnapshot ?? '');
    } else if (item.type === 'paket' && item.paketKomponenSnapshot) {
      for (const komp of item.paketKomponenSnapshot) {
        if (komp.type === 'barang') {
          // qty = paket qty × komponen qty
          addReq(
            komp.refId,
            item.qty * komp.qty,
            komp.kodeSnapshot,
            komp.namaSnapshot,
            komp.satuanSnapshot ?? '',
          );
        }
        // jasa komponen: skip
      }
    }
    // jasa item: skip
  }

  return reqMap;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
export async function fetchAllTransaksi(): Promise<Transaksi[]> {
  return getAllTransaksi();
}

export async function fetchTransaksiById(id: string): Promise<Transaksi | null> {
  return getTransaksiById(id);
}

// ─── Create Transaksi (atomic multi-path update) ──────────────────────────────
export async function createTransaksiService(
  data: TransaksiFormData,
  uid: string,
): Promise<string> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');

  // Basic validation
  if (data.items.length === 0) {
    throw new TransaksiValidationError('Transaksi harus memiliki minimal 1 item.');
  }
  for (const it of data.items) {
    if (it.qty <= 0) throw new TransaksiValidationError(`Qty "${it.namaSnapshot}" harus lebih dari 0.`);
  }

  const subtotal = data.items.reduce((s, it) => s + it.subtotal, 0);
  if (data.diskon < 0) throw new TransaksiValidationError('Diskon tidak boleh negatif.');
  if (data.diskon > subtotal) throw new TransaksiValidationError('Diskon tidak boleh melebihi subtotal.');
  const total = subtotal - data.diskon;

  // Payment validation
  if (data.metodePembayaran === 'cash' && data.jumlahBayar < total) {
    throw new TransaksiValidationError(`Jumlah bayar (${data.jumlahBayar}) kurang dari total (${total}).`);
  }

  const jumlahBayar = data.metodePembayaran === 'cash' ? data.jumlahBayar : total;
  const kembalian = data.metodePembayaran === 'cash' ? jumlahBayar - total : 0;

  // Aggregate stock requirements
  const stockReqs = aggregateStockRequirements(data.items);

  // READ all inventory first
  const inventoryMap = new Map<string, number>();
  for (const [barangId] of stockReqs) {
    const inv = await getInventoryByBarangId(barangId);
    inventoryMap.set(barangId, inv?.currentStock ?? 0);
  }

  // Client-side stock validation (authoritative check is in the write)
  for (const [barangId, req] of stockReqs) {
    const current = inventoryMap.get(barangId) ?? 0;
    if (current < req.qty) {
      throw new TransaksiValidationError(
        `Stok "${req.namaSnapshot}" tidak mencukupi.\nTersedia: ${current} ${req.satuanSnapshot}\nDibutuhkan: ${req.qty} ${req.satuanSnapshot}`,
      );
    }
  }

  const now = Date.now();
  const transaksiRef = newTransaksiRef();
  const transaksiId = transaksiRef.key!;
  const nomorTransaksi = generateNomorTransaksi(transaksiId, data.tanggalTransaksi);

  // Build multi-path update payload
  const updates: Record<string, unknown> = {};

  // Transaksi document
  updates[transaksiPath(transaksiId)] = {
    nomorTransaksi,
    tanggalTransaksi: data.tanggalTransaksi,
    customerName: data.customerName || null,
    catatan: data.catatan || null,
    items: data.items,
    totalItem: data.items.length,
    subtotal,
    diskon: data.diskon,
    total,
    metodePembayaran: data.metodePembayaran,
    jumlahBayar,
    kembalian,
    status: 'posted',
    createdAt: now,
    createdBy: uid,
    updatedAt: now,
    updatedBy: uid,
  };

  // Inventory + StockMovement per aggregated barang
  for (const [barangId, req] of stockReqs) {
    const before = inventoryMap.get(barangId) ?? 0;
    const after = before - req.qty;

    updates[inventoryPath(barangId)] = {
      barangId,
      currentStock: after,
      updatedAt: now,
      lastMovementAt: now,
    };

    const movRef = push(ref(db, 'stockMovements'));
    updates[stockMovementPath(movRef.key!)] = {
      barangId,
      movementType: 'SALE',
      direction: 'OUT',
      qty: req.qty,
      quantityBefore: before,
      quantityAfter: after,
      referenceType: 'transaksi',
      referenceId: transaksiId,
      referenceNumber: nomorTransaksi,
      barangKodeSnapshot: req.kodeSnapshot,
      barangNamaSnapshot: req.namaSnapshot,
      satuanSnapshot: req.satuanSnapshot,
      occurredAt: now,
      createdAt: now,
      createdBy: uid,
    };
  }

  await update(ref(db), updates);
  return transaksiId;
}

// ─── Cancel Transaksi (atomic multi-path update) ──────────────────────────────
export async function cancelTransaksiService(
  id: string,
  cancellationReason: string,
  uid: string,
): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');

  const transaksi = await getTransaksiById(id);
  if (!transaksi) throw new TransaksiValidationError('Transaksi tidak ditemukan.');
  if (transaksi.status === 'cancelled') {
    throw new TransaksiValidationError('Transaksi ini sudah dibatalkan sebelumnya.');
  }

  // Use snapshot to derive stock reversal — NOT current master
  const stockReqs = aggregateStockRequirements(transaksi.items);

  // READ all inventory
  const inventoryMap = new Map<string, number>();
  for (const [barangId] of stockReqs) {
    const inv = await getInventoryByBarangId(barangId);
    inventoryMap.set(barangId, inv?.currentStock ?? 0);
  }

  const now = Date.now();
  const updates: Record<string, unknown> = {};

  // Update transaksi status
  updates[`${transaksiPath(id)}/status`] = 'cancelled';
  updates[`${transaksiPath(id)}/cancelledAt`] = now;
  updates[`${transaksiPath(id)}/cancelledBy`] = uid;
  updates[`${transaksiPath(id)}/cancellationReason`] = cancellationReason;
  updates[`${transaksiPath(id)}/updatedAt`] = now;
  updates[`${transaksiPath(id)}/updatedBy`] = uid;

  // Reversal: stock IN per aggregated barang
  for (const [barangId, req] of stockReqs) {
    const before = inventoryMap.get(barangId) ?? 0;
    const after = before + req.qty;

    updates[inventoryPath(barangId)] = {
      barangId,
      currentStock: after,
      updatedAt: now,
      lastMovementAt: now,
    };

    const movRef = push(ref(db, 'stockMovements'));
    updates[stockMovementPath(movRef.key!)] = {
      barangId,
      movementType: 'SALE_CANCEL',
      direction: 'IN',
      qty: req.qty,
      quantityBefore: before,
      quantityAfter: after,
      referenceType: 'transaksi',
      referenceId: id,
      referenceNumber: transaksi.nomorTransaksi,
      barangKodeSnapshot: req.kodeSnapshot,
      barangNamaSnapshot: req.namaSnapshot,
      satuanSnapshot: req.satuanSnapshot,
      occurredAt: now,
      createdAt: now,
      createdBy: uid,
    };
  }

  await update(ref(db), updates);
}
