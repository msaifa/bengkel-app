import {
  ref, get, push,
} from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { Pembelian, PembelianItem } from '@/types/pembelian';

const NODE = 'pembelian';

function getRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return ref(db, NODE);
}

function toPembelian(id: string, d: Record<string, unknown>): Pembelian {
  // RTDB stores arrays as objects with numeric keys — convert items back to array
  const rawItems = d.items as Record<string, unknown> | null;
  const items: PembelianItem[] = rawItems
    ? Object.values(rawItems).map((it) => {
        const i = it as Record<string, unknown>;
        return {
          barangId: i.barangId as string,
          kodeSnapshot: i.kodeSnapshot as string,
          namaSnapshot: i.namaSnapshot as string,
          satuanSnapshot: i.satuanSnapshot as string,
          qty: i.qty as number,
          hargaBeli: i.hargaBeli as number,
          subtotal: i.subtotal as number,
        };
      })
    : [];

  return {
    id,
    nomorPembelian: d.nomorPembelian as string,
    tanggalPembelian: d.tanggalPembelian as number,
    supplierName: d.supplierName as string | undefined,
    nomorReferensi: d.nomorReferensi as string | undefined,
    catatan: d.catatan as string | undefined,
    items,
    totalItem: d.totalItem as number,
    subtotal: d.subtotal as number,
    total: d.total as number,
    status: d.status as 'posted' | 'cancelled',
    createdAt: d.createdAt as number,
    createdBy: d.createdBy as string,
    updatedAt: d.updatedAt as number,
    updatedBy: d.updatedBy as string,
    cancelledAt: d.cancelledAt as number | undefined,
    cancelledBy: d.cancelledBy as string | undefined,
    cancellationReason: d.cancellationReason as string | undefined,
  };
}

export async function getAllPembelian(): Promise<Pembelian[]> {
  const snap = await get(getRef());
  if (!snap.exists()) return [];
  const result: Pembelian[] = [];
  snap.forEach((child) => {
    result.push(toPembelian(child.key!, child.val() as Record<string, unknown>));
  });
  // Sort newest first
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPembelianById(id: string): Promise<Pembelian | null> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const snap = await get(ref(db, `${NODE}/${id}`));
  if (!snap.exists()) return null;
  return toPembelian(snap.key!, snap.val() as Record<string, unknown>);
}

/** Returns a new push ref key without writing data */
export function newPembelianRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return push(ref(db, NODE));
}

/** Write a full pembelian document (used inside multi-path update) */
export function pembelianPath(id: string) {
  return `${NODE}/${id}`;
}
