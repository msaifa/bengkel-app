import { Paket, PaketFormData } from '@/types/master';
import { normalizeKode } from '@/utils/normalize';
import {
  getAllPaket,
  createPaket as repoCreate,
  updatePaket as repoUpdate,
  setPaketActive as repoSetActive,
  findPaketByKode,
} from '@/repositories/paket.repository';

export class DuplicateKodeError extends Error {
  constructor(kode: string) {
    super(`Kode paket "${kode}" sudah digunakan.`);
    this.name = 'DuplicateKodeError';
  }
}

export class PaketValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaketValidationError';
  }
}

export async function fetchAllPaket(): Promise<Paket[]> {
  return getAllPaket();
}

export async function createPaketService(
  data: PaketFormData,
  uid: string,
): Promise<string> {
  if (data.komponen.length === 0) {
    throw new PaketValidationError('Paket harus memiliki minimal 1 komponen.');
  }
  const kodeNorm = normalizeKode(data.kode);
  const existing = await findPaketByKode(kodeNorm);
  if (existing) throw new DuplicateKodeError(data.kode.trim());
  return repoCreate(data, uid);
}

export async function updatePaketService(
  id: string,
  data: Partial<PaketFormData>,
  uid: string,
): Promise<void> {
  if (data.komponen !== undefined && data.komponen.length === 0) {
    throw new PaketValidationError('Paket harus memiliki minimal 1 komponen.');
  }
  if (data.kode !== undefined) {
    const kodeNorm = normalizeKode(data.kode);
    const existing = await findPaketByKode(kodeNorm);
    if (existing && existing.id !== id) {
      throw new DuplicateKodeError(data.kode.trim());
    }
  }
  return repoUpdate(id, data, uid);
}

export async function setPaketActiveService(
  id: string,
  isActive: boolean,
  uid: string,
): Promise<void> {
  return repoSetActive(id, isActive, uid);
}
