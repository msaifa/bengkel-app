import { ref, get, push } from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { Transaksi, TransactionItem, TransactionPackageComponent } from '@/types/transaksi';

const NODE = 'transaksi';

function toItem(raw: Record<string, unknown>): TransactionItem {
  const rawKomp = raw.paketKomponenSnapshot as Record<string, unknown> | null | undefined;
  const paketKomponenSnapshot: TransactionPackageComponent[] | undefined = rawKomp
    ? Object.values(rawKomp).map((k) => {
        const c = k as Record<string, unknown>;
        return {
          type: c.type as 'barang' | 'jasa',
          refId: c.refId as string,
          kodeSnapshot: c.kodeSnapshot as string,
          namaSnapshot: c.namaSnapshot as string,
          qty: c.qty as number,
          hargaSnapshot: c.hargaSnapshot as number,
          satuanSnapshot: c.satuanSnapshot as string | undefined,
        };
      })
    : undefined;

  return {
    type: raw.type as TransactionItem['type'],
    refId: raw.refId as string,
    kodeSnapshot: raw.kodeSnapshot as string,
    namaSnapshot: raw.namaSnapshot as string,
    satuanSnapshot: raw.satuanSnapshot as string | undefined,
    qty: raw.qty as number,
    hargaSatuan: raw.hargaSatuan as number,
    subtotal: raw.subtotal as number,
    paketKomponenSnapshot,
  };
}

function toTransaksi(id: string, d: Record<string, unknown>): Transaksi {
  const rawItems = d.items as Record<string, unknown> | null;
  const items: TransactionItem[] = rawItems
    ? Object.values(rawItems).map((it) => toItem(it as Record<string, unknown>))
    : [];

  return {
    id,
    nomorTransaksi: d.nomorTransaksi as string,
    tanggalTransaksi: d.tanggalTransaksi as number,
    customerName: d.customerName as string | undefined,
    catatan: d.catatan as string | undefined,
    items,
    totalItem: d.totalItem as number,
    subtotal: d.subtotal as number,
    diskon: d.diskon as number,
    total: d.total as number,
    metodePembayaran: d.metodePembayaran as Transaksi['metodePembayaran'],
    jumlahBayar: d.jumlahBayar as number,
    kembalian: d.kembalian as number,
    status: d.status as Transaksi['status'],
    createdAt: d.createdAt as number,
    createdBy: d.createdBy as string,
    updatedAt: d.updatedAt as number,
    updatedBy: d.updatedBy as string,
    cancelledAt: d.cancelledAt as number | undefined,
    cancelledBy: d.cancelledBy as string | undefined,
    cancellationReason: d.cancellationReason as string | undefined,
  };
}

export async function getAllTransaksi(): Promise<Transaksi[]> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const snap = await get(ref(db, NODE));
  if (!snap.exists()) return [];
  const result: Transaksi[] = [];
  snap.forEach((child) => {
    result.push(toTransaksi(child.key!, child.val() as Record<string, unknown>));
  });
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getTransaksiById(id: string): Promise<Transaksi | null> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const snap = await get(ref(db, `${NODE}/${id}`));
  if (!snap.exists()) return null;
  return toTransaksi(snap.key!, snap.val() as Record<string, unknown>);
}

export function newTransaksiRef() {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  return push(ref(db, NODE));
}

export function transaksiPath(id: string) {
  return `${NODE}/${id}`;
}
