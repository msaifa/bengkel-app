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
import { Jasa, JasaFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';

const COLLECTION = 'jasa';

function toJasa(snap: QueryDocumentSnapshot<DocumentData>): Jasa {
  const d = snap.data();
  return {
    id: snap.id,
    kode: d.kode,
    kodeNormalized: d.kodeNormalized,
    nama: d.nama,
    kategori: d.kategori ?? '',
    harga: d.harga,
    estimasiMenit: d.estimasiMenit ?? null,
    deskripsi: d.deskripsi ?? '',
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

export async function getAllJasa(): Promise<Jasa[]> {
  const snap = await getDocs(getCollection());
  return snap.docs.map(toJasa);
}

export async function findJasaByKode(
  kodeNormalized: string,
): Promise<Jasa | null> {
  const q = query(getCollection(), where('kodeNormalized', '==', kodeNormalized));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toJasa(snap.docs[0]);
}

export async function createJasa(
  data: JasaFormData,
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

export async function updateJasa(
  id: string,
  data: Partial<JasaFormData>,
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

export async function setJasaActive(
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
