import {
  ref, get, push, update, query, orderByChild, equalTo,
} from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { Jasa, JasaFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';

const NODE = 'jasa';

function getRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return ref(db, NODE);
}

function toJasa(id: string, d: Record<string, unknown>): Jasa {
  return {
    id,
    kode: d.kode as string,
    kodeNormalized: d.kodeNormalized as string,
    nama: d.nama as string,
    kategori: (d.kategori as string) ?? '',
    harga: d.harga as number,
    estimasiMenit: (d.estimasiMenit as number | null) ?? null,
    deskripsi: (d.deskripsi as string) ?? '',
    isActive: (d.isActive as boolean) ?? true,
    createdAt: d.createdAt as number,
    updatedAt: d.updatedAt as number,
    createdBy: d.createdBy as string,
    updatedBy: d.updatedBy as string,
  };
}

export async function getAllJasa(): Promise<Jasa[]> {
  const snap = await get(getRef());
  if (!snap.exists()) return [];
  const result: Jasa[] = [];
  snap.forEach((child) => {
    result.push(toJasa(child.key!, child.val() as Record<string, unknown>));
  });
  return result;
}

export async function findJasaByKode(kodeNormalized: string): Promise<Jasa | null> {
  const q = query(getRef(), orderByChild('kodeNormalized'), equalTo(kodeNormalized));
  const snap = await get(q);
  if (!snap.exists()) return null;
  let found: Jasa | null = null;
  snap.forEach((child) => {
    found = toJasa(child.key!, child.val() as Record<string, unknown>);
  });
  return found;
}

export async function createJasa(data: JasaFormData, uid: string): Promise<string> {
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

export async function updateJasa(id: string, data: Partial<JasaFormData>, uid: string): Promise<void> {
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

export async function setJasaActive(id: string, isActive: boolean, uid: string): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const nodeRef = ref(db, `${NODE}/${id}`);
  await update(nodeRef, {
    isActive,
    updatedAt: Date.now(),
    updatedBy: uid,
  });
}
