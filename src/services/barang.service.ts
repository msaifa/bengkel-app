import { Barang, BarangFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';
import {
  getAllBarang,
  createBarang as repoCreate,
  updateBarang as repoUpdate,
  setBarangActive as repoSetActive,
  findBarangByKode,
} from '@/repositories/barang.repository';

export class DuplicateKodeError extends Error {
  constructor(kode: string) {
    super(`Kode barang "${kode}" sudah digunakan.`);
    this.name = 'DuplicateKodeError';
  }
}

export async function fetchAllBarang(): Promise<Barang[]> {
  return getAllBarang();
}

export async function createBarangService(
  data: BarangFormData,
  uid: string,
): Promise<string> {
  const kodeNorm = normalizeKode(data.kode);
  const existing = await findBarangByKode(kodeNorm);
  if (existing) throw new DuplicateKodeError(data.kode.trim());
  return repoCreate(data, uid);
}

export async function updateBarangService(
  id: string,
  data: Partial<BarangFormData>,
  uid: string,
): Promise<void> {
  if (data.kode !== undefined) {
    const kodeNorm = normalizeKode(data.kode);
    const existing = await findBarangByKode(kodeNorm);
    if (existing && existing.id !== id) {
      throw new DuplicateKodeError(data.kode.trim());
    }
  }
  return repoUpdate(id, data, uid);
}

export async function setBarangActiveService(
  id: string,
  isActive: boolean,
  uid: string,
): Promise<void> {
  return repoSetActive(id, isActive, uid);
}
