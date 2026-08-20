import {
  ref, get, push, update, query, orderByChild, equalTo,
} from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { Paket, PaketFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';

const NODE = 'paket';

function getRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return ref(db, NODE);
}

function toPaket(id: string, d: Record<string, unknown>): Paket {
  return {
    id,
    kode: d.kode as string,
    kodeNormalized: d.kodeNormalized as string,
    nama: d.nama as string,
    deskripsi: (d.deskripsi as string) ?? '',
    komponen: (d.komponen as Paket['komponen']) ?? [],
    hargaPaket: d.hargaPaket as number,
    isActive: (d.isActive as boolean) ?? true,
    createdAt: d.createdAt as number,
    updatedAt: d.updatedAt as number,
    createdBy: d.createdBy as string,
    updatedBy: d.updatedBy as string,
  };
}

export async function getAllPaket(): Promise<Paket[]> {
  const snap = await get(getRef());
  if (!snap.exists()) return [];
  const result: Paket[] = [];
  snap.forEach((child) => {
    result.push(toPaket(child.key!, child.val() as Record<string, unknown>));
  });
  return result;
}

export async function findPaketByKode(kodeNormalized: string): Promise<Paket | null> {
  const q = query(getRef(), orderByChild('kodeNormalized'), equalTo(kodeNormalized));
  const snap = await get(q);
  if (!snap.exists()) return null;
  let found: Paket | null = null;
  snap.forEach((child) => {
    found = toPaket(child.key!, child.val() as Record<string, unknown>);
  });
  return found;
}

export async function createPaket(data: PaketFormData, uid: string): Promise<string> {
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

export async function updatePaket(id: string, data: Partial<PaketFormData>, uid: string): Promise<void> {
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

export async function setPaketActive(id: string, isActive: boolean, uid: string): Promise<void> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const nodeRef = ref(db, `${NODE}/${id}`);
  await update(nodeRef, {
    isActive,
    updatedAt: Date.now(),
    updatedBy: uid,
  });
}
