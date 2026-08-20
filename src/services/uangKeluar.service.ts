import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { UangKeluar, UangKeluarFormData } from '@/types/uangKeluar';
import {
  getAllUangKeluar,
  getUangKeluarById,
  newUangKeluarRef,
  uangKeluarPath,
} from '@/repositories/uangKeluar.repository';

// ─── Custom errors ────────────────────────────────────────────────────────────
export class UangKeluarValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UangKeluarValidationError';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateNomorPengeluaran(id: string, tanggal: number): string {
  const d = new Date(tanggal);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const suffix = id.slice(-6).toUpperCase();
  return `UK-${yy}${mm}${dd}-${suffix}`;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
export async function fetchAllUangKeluar(): Promise<UangKeluar[]> {
  return getAllUangKeluar();
}

export async function fetchUangKeluarById(id: string): Promise<UangKeluar | null> {
  return getUangKeluarById(id);
}

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createUangKeluarService(
  data: UangKeluarFormData,
  uid: string,
): Promise<string> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');

  // Validate
  if (!data.tanggalPengeluaran) {
    throw new UangKeluarValidationError('Tanggal pengeluaran wajib diisi.');
  }
  if (!data.kategori || !data.kategori.trim()) {
    throw new UangKeluarValidationError('Kategori wajib dipilih.');
  }
  if (!data.nominal || data.nominal <= 0) {
    throw new UangKeluarValidationError('Nominal harus lebih dari 0.');
  }
  if (!data.metodePembayaran) {
    throw new UangKeluarValidationError('Metode pembayaran wajib dipilih.');
  }

  const now = Date.now();
  const newRef = newUangKeluarRef();
  const id = newRef.key!;
  const nomorPengeluaran = generateNomorPengeluaran(id, data.tanggalPengeluaran);

  const record: Omit<UangKeluar, 'id'> = {
    nomorPengeluaran,
    tanggalPengeluaran: data.tanggalPengeluaran,
    kategori: data.kategori.trim(),
    keterangan: data.keterangan.trim(),
    nominal: data.nominal,
    metodePembayaran: data.metodePembayaran,
    penerima: data.penerima?.trim() || undefined,
    nomorReferensi: data.nomorReferensi?.trim() || undefined,
    catatan: data.catatan?.trim() || undefined,
    status: 'posted',
    createdAt: now,
    createdBy: uid,
    updatedAt: now,
    updatedBy: uid,
  };

  // Remove undefined fields (RTDB doesn't store undefined)
  const clean = Object.fromEntries(
    Object.entries({ id, ...record }).filter(([, v]) => v !== undefined),
  );

  const updates: Record<string, unknown> = {};
  updates[uangKeluarPath(id)] = clean;
  await update(ref(db), updates);

  return id;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────
export async function cancelUangKeluarService(
  id: string,
  cancellationReason: string,
  uid: string,
): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');

  // Load latest record from RTDB (don't trust UI state)
  const record = await getUangKeluarById(id);
  if (!record) {
    throw new UangKeluarValidationError('Pengeluaran tidak ditemukan.');
  }
  if (record.status === 'cancelled') {
    throw new UangKeluarValidationError('Pengeluaran ini sudah dibatalkan sebelumnya.');
  }

  const reason = cancellationReason.trim();
  if (!reason) {
    throw new UangKeluarValidationError('Alasan pembatalan wajib diisi.');
  }

  const now = Date.now();
  const updates: Record<string, unknown> = {};
  updates[`${uangKeluarPath(id)}/status`] = 'cancelled';
  updates[`${uangKeluarPath(id)}/cancelledAt`] = now;
  updates[`${uangKeluarPath(id)}/cancelledBy`] = uid;
  updates[`${uangKeluarPath(id)}/cancellationReason`] = reason;
  updates[`${uangKeluarPath(id)}/updatedAt`] = now;
  updates[`${uangKeluarPath(id)}/updatedBy`] = uid;

  await update(ref(db), updates);
}
