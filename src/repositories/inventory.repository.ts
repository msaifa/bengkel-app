import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase/database';
import { Inventory } from '@/types/pembelian';

const NODE = 'inventory';

function toInventory(barangId: string, d: Record<string, unknown>): Inventory {
  return {
    barangId,
    currentStock: (d.currentStock as number) ?? 0,
    updatedAt: d.updatedAt as number,
    lastMovementAt: d.lastMovementAt as number,
  };
}

export async function getInventoryByBarangId(barangId: string): Promise<Inventory | null> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const snap = await get(ref(db, `${NODE}/${barangId}`));
  if (!snap.exists()) return null;
  return toInventory(barangId, snap.val() as Record<string, unknown>);
}

export async function getAllInventory(): Promise<Inventory[]> {
  if (!db) throw new Error('Realtime Database belum dikonfigurasi.');
  const snap = await get(ref(db, NODE));
  if (!snap.exists()) return [];
  const result: Inventory[] = [];
  snap.forEach((child) => {
    result.push(toInventory(child.key!, child.val() as Record<string, unknown>));
  });
  return result;
}

/** Path helpers for multi-path update */
export function inventoryPath(barangId: string) {
  return `inventory/${barangId}`;
}
