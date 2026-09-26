import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db, type UserInventory } from '@/services/db';

export const useInventoryStore = defineStore('inventory', () => {
  const stock = ref<Record<string, number>>({});
  const isLoaded = ref<boolean>(false);

  async function loadInventory() {
    try {
      const records = await db.inventory.toArray();
      const newStock: Record<string, number> = {};
      for (const item of records) {
        if (item.amount > 0) {
          newStock[item.itemId] = item.amount;
        }
      }
      stock.value = newStock;
      isLoaded.value = true;
    } catch (err) {
      console.error('Failed to load inventory from Dexie:', err);
    }
  }

  async function setItemStock(itemId: string, amount: number) {
    const validAmount = Math.max(0, Math.floor(amount || 0));
    if (validAmount === 0) {
      delete stock.value[itemId];
      await db.inventory.delete(itemId);
    } else {
      stock.value[itemId] = validAmount;
      await db.inventory.put({ itemId, amount: validAmount });
    }
  }

  function getStock(itemId: string): number {
    return stock.value[itemId] || 0;
  }

  async function bulkSetStock(items: Record<string, number>) {
    const entries: UserInventory[] = [];
    const deleteIds: string[] = [];

    for (const id in items) {
      const amt = Math.max(0, Math.floor(items[id] || 0));
      if (amt === 0) {
        delete stock.value[id];
        deleteIds.push(id);
      } else {
        stock.value[id] = amt;
        entries.push({ itemId: id, amount: amt });
      }
    }

    await db.transaction('rw', db.inventory, async () => {
      if (deleteIds.length > 0) {
        await db.inventory.bulkDelete(deleteIds);
      }
      if (entries.length > 0) {
        await db.inventory.bulkPut(entries);
      }
    });
  }

  async function clearAll() {
    stock.value = {};
    await db.inventory.clear();
  }

  return {
    stock,
    isLoaded,
    loadInventory,
    setItemStock,
    getStock,
    bulkSetStock,
    clearAll,
  };
});
