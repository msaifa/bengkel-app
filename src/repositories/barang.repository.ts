import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import { Barang, BarangFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';

const COLLECTION = 'barang';

function toBarang(snap: QueryDocumentSnapshot<DocumentData>): Barang {
  const d = snap.data();
  return {
    id: snap.id,
    kode: d.kode,
    kodeNormalized: d.kodeNormalized,
    nama: d.nama,
    kategori: d.kategori ?? '',
    satuan: d.satuan,
    hargaBeli: d.hargaBeli,
    hargaJual: d.hargaJual,
    stokMinimum: d.stokMinimum ?? 0,
    isActive: d.isActive ?? true,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    createdBy: d.createdBy,
    updatedBy: d.updatedBy,
  };
}

function getCollection() {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  return collection(db, COLLECTION);
}

export async function getAllBarang(): Promise<Barang[]> {
  const snap = await getDocs(getCollection());
  return snap.docs.map(toBarang);
}

export async function findBarangByKode(
  kodeNormalized: string,
): Promise<Barang | null> {
  const q = query(getCollection(), where('kodeNormalized', '==', kodeNormalized));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toBarang(snap.docs[0]);
}

export async function createBarang(
  data: BarangFormData,
  uid: string,
): Promise<string> {
  const col = getCollection();
  const ref = await addDoc(col, {
    ...data,
    kode: data.kode.trim(),
    kodeNormalized: normalizeKode(data.kode),
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
  });
  return ref.id;
}

export async function updateBarang(
  id: string,
  data: Partial<BarangFormData>,
  uid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  const ref = doc(db, COLLECTION, id);
  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  };
  if (data.kode !== undefined) {
    payload.kode = data.kode.trim();
    payload.kodeNormalized = normalizeKode(data.kode);
  }
  await updateDoc(ref, payload);
}

export async function setBarangActive(
  id: string,
  isActive: boolean,
  uid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore belum dikonfigurasi.');
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    isActive,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  });
}
