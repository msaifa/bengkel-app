import {
  ref, get, push, update, query, orderByChild, equalTo,
} from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { Barang, BarangFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';

const NODE = 'barang';

function getRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return ref(db, NODE);
}

function toBarang(id: string, d: Record<string, unknown>): Barang {
  return {
    id,
    kode: d.kode as string,
    kodeNormalized: d.kodeNormalized as string,
    nama: d.nama as string,
    kategori: (d.kategori as string) ?? '',
    satuan: d.satuan as string,
    hargaBeli: d.hargaBeli as number,
    hargaJual: d.hargaJual as number,
    stokMinimum: (d.stokMinimum as number) ?? 0,
    isActive: (d.isActive as boolean) ?? true,
    createdAt: d.createdAt as number,
    updatedAt: d.updatedAt as number,
    createdBy: d.createdBy as string,
    updatedBy: d.updatedBy as string,
  };
}

export async function getAllBarang(): Promise<Barang[]> {
  const snap = await get(getRef());
  if (!snap.exists()) return [];
  const result: Barang[] = [];
  snap.forEach((child) => {
    result.push(toBarang(child.key!, child.val() as Record<string, unknown>));
  });
  return result;
}

export async function findBarangByKode(kodeNormalized: string): Promise<Barang | null> {
  const q = query(getRef(), orderByChild('kodeNormalized'), equalTo(kodeNormalized));
  const snap = await get(q);
  if (!snap.exists()) return null;
  let found: Barang | null = null;
  snap.forEach((child) => {
    found = toBarang(child.key!, child.val() as Record<string, unknown>);
  });
  return found;
}

export async function createBarang(data: BarangFormData, uid: string): Promise<string> {
  const nodeRef = getRef();
  const newRef = push(nodeRef);
  await update(newRef, {
    ...data,
    kode: data.kode.trim(),
    kodeNormalized: normalizeKode(data.kode),
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: uid,
    updatedBy: uid,
  });
  return newRef.key!;
}

export async function updateBarang(id: string, data: Partial<BarangFormData>, uid: string): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const nodeRef = ref(db, `${NODE}/${id}`);
  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: Date.now(),
    updatedBy: uid,
  };
  if (data.kode !== undefined) {
    payload.kode = data.kode.trim();
    payload.kodeNormalized = normalizeKode(data.kode);
  }
  await update(nodeRef, payload);
}

export async function setBarangActive(id: string, isActive: boolean, uid: string): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const nodeRef = ref(db, `${NODE}/${id}`);
  await update(nodeRef, {
    isActive,
    updatedAt: Date.now(),
    updatedBy: uid,
  });
}
