import {
  ref, get, query, orderByChild, limitToLast,
} from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { StockMovement } from '@/types/pembelian';

const NODE = 'stockMovements';

function toMovement(id: string, d: Record<string, unknown>): StockMovement {
  return {
    id,
    barangId: d.barangId as string,
    movementType: d.movementType as StockMovement['movementType'],
    direction: d.direction as StockMovement['direction'],
    qty: d.qty as number,
    quantityBefore: d.quantityBefore as number,
    quantityAfter: d.quantityAfter as number,
    referenceType: 'pembelian',
    referenceId: d.referenceId as string,
    referenceNumber: d.referenceNumber as string,
    barangKodeSnapshot: d.barangKodeSnapshot as string,
    barangNamaSnapshot: d.barangNamaSnapshot as string,
    satuanSnapshot: d.satuanSnapshot as string,
    occurredAt: d.occurredAt as number,
    createdAt: d.createdAt as number,
    createdBy: d.createdBy as string,
  };
}

export async function getRecentMovements(limit = 100): Promise<StockMovement[]> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const q = query(ref(db, NODE), orderByChild('occurredAt'), limitToLast(limit));
  const snap = await get(q);
  if (!snap.exists()) return [];
  const result: StockMovement[] = [];
  snap.forEach((child) => {
    result.push(toMovement(child.key!, child.val() as Record<string, unknown>));
  });
  // Newest first
  return result.reverse();
}

/** Path helper for multi-path update */
export function stockMovementPath(id: string) {
  return `${NODE}/${id}`;
}
