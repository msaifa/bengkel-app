import { ref, get, push } from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { UangKeluar, UangKeluarStatus, MetodePembayaranPengeluaran } from '@/types/uangKeluar';

const NODE = 'uangKeluar';

function getRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return ref(db, NODE);
}

function toUangKeluar(id: string, d: Record<string, unknown>): UangKeluar {
  return {
    id,
    nomorPengeluaran: d.nomorPengeluaran as string,
    tanggalPengeluaran: d.tanggalPengeluaran as number,
    kategori: d.kategori as string,
    keterangan: d.keterangan as string,
    nominal: d.nominal as number,
    metodePembayaran: d.metodePembayaran as MetodePembayaranPengeluaran,
    penerima: d.penerima as string | undefined,
    nomorReferensi: d.nomorReferensi as string | undefined,
    catatan: d.catatan as string | undefined,
    status: d.status as UangKeluarStatus,
    createdAt: d.createdAt as number,
    createdBy: d.createdBy as string,
    updatedAt: d.updatedAt as number,
    updatedBy: d.updatedBy as string,
    cancelledAt: d.cancelledAt as number | undefined,
    cancelledBy: d.cancelledBy as string | undefined,
    cancellationReason: d.cancellationReason as string | undefined,
  };
}

export async function getAllUangKeluar(): Promise<UangKeluar[]> {
  const snap = await get(getRef());
  if (!snap.exists()) return [];
  const result: UangKeluar[] = [];
  snap.forEach((child) => {
    result.push(toUangKeluar(child.key!, child.val() as Record<string, unknown>));
  });
  // Sort newest first by tanggalPengeluaran, then createdAt
  return result.sort((a, b) =>
    b.tanggalPengeluaran !== a.tanggalPengeluaran
      ? b.tanggalPengeluaran - a.tanggalPengeluaran
      : b.createdAt - a.createdAt,
  );
}

export async function getUangKeluarById(id: string): Promise<UangKeluar | null> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const snap = await get(ref(db, `${NODE}/${id}`));
  if (!snap.exists()) return null;
  return toUangKeluar(snap.key!, snap.val() as Record<string, unknown>);
}

/** Returns a new push ref without writing data */
export function newUangKeluarRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return push(ref(db, NODE));
}

export function uangKeluarPath(id: string) {
  return `${NODE}/${id}`;
}
