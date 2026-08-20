import { getAllInventory } from '@/repositories/inventory.repository';
import { getAllBarang } from '@/repositories/barang.repository';
import { getRecentMovements } from '@/repositories/stockMovement.repository';
import { InventoryView, StockMovement, StockStatus } from '@/types/pembelian';

export function deriveStockStatus(
  currentStock: number,
  stokMinimum: number,
): StockStatus {
  if (currentStock <= 0) return 'habis';
  if (stokMinimum > 0 && currentStock <= stokMinimum) return 'menipis';
  return 'aman';
}

export async function fetchInventoryView(): Promise<InventoryView[]> {
  const [barangList, inventoryList] = await Promise.all([
    getAllBarang(),
    getAllInventory(),
  ]);

  const invMap = new Map(inventoryList.map((inv) => [inv.barangId, inv.currentStock]));

  return barangList.map((b) => {
    const currentStock = invMap.get(b.id) ?? 0;
    return {
      barangId: b.id,
      kode: b.kode,
      nama: b.nama,
      kategori: b.kategori,
      satuan: b.satuan,
      stokMinimum: b.stokMinimum,
      isActive: b.isActive,
      currentStock,
      status: deriveStockStatus(currentStock, b.stokMinimum),
    };
  });
}

export async function fetchRecentMovements(limit = 100): Promise<StockMovement[]> {
  return getRecentMovements(limit);
}
