import { Jasa, JasaFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';
import {
  getAllJasa,
  createJasa as repoCreate,
  updateJasa as repoUpdate,
  setJasaActive as repoSetActive,
  findJasaByKode,
} from '@/repositories/jasa.repository';

export class DuplicateKodeError extends Error {
  constructor(kode: string) {
    super(`Kode jasa "${kode}" sudah digunakan.`);
    this.name = 'DuplicateKodeError';
  }
}

export async function fetchAllJasa(): Promise<Jasa[]> {
  return getAllJasa();
}

export async function createJasaService(
  data: JasaFormData,
  uid: string,
): Promise<string> {
  const kodeNorm = normalizeKode(data.kode);
  const existing = await findJasaByKode(kodeNorm);
  if (existing) throw new DuplicateKodeError(data.kode.trim());
  return repoCreate(data, uid);
}

export async function updateJasaService(
  id: string,
  data: Partial<JasaFormData>,
  uid: string,
): Promise<void> {
  if (data.kode !== undefined) {
    const kodeNorm = normalizeKode(data.kode);
    const existing = await findJasaByKode(kodeNorm);
    if (existing && existing.id !== id) {
      throw new DuplicateKodeError(data.kode.trim());
    }
  }
  return repoUpdate(id, data, uid);
}

export async function setJasaActiveService(
  id: string,
  isActive: boolean,
  uid: string,
): Promise<void> {
  return repoSetActive(id, isActive, uid);
}
