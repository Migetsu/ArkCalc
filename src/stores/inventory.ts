import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db, type UserInventory } from '@/services/db';
import { useAuthStore } from '@/stores/auth';

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
    const nextStock = { ...stock.value };
    if (validAmount === 0) {
      delete nextStock[itemId];
      stock.value = nextStock;
      await db.inventory.delete(itemId);
    } else {
      nextStock[itemId] = validAmount;
      stock.value = nextStock;
      await db.inventory.put({ itemId, amount: validAmount });
    }
    useAuthStore().triggerAutoSync();
  }

  function getStock(itemId: string): number {
    return stock.value[itemId] || 0;
  }

  async function bulkSetStock(items: Record<string, number>) {
    const entries: UserInventory[] = [];
    const deleteIds: string[] = [];
    const nextStock = { ...stock.value };

    for (const id in items) {
      const amt = Math.max(0, Math.floor(items[id] || 0));
      if (amt === 0) {
        delete nextStock[id];
        deleteIds.push(id);
      } else {
        nextStock[id] = amt;
        entries.push({ itemId: id, amount: amt });
      }
    }
    stock.value = nextStock;

    await db.transaction('rw', db.inventory, async () => {
      if (deleteIds.length > 0) {
        await db.inventory.bulkDelete(deleteIds);
      }
      if (entries.length > 0) {
        await db.inventory.bulkPut(entries);
      }
    });
    useAuthStore().triggerAutoSync();
  }

  async function replaceAllStock(items: Record<string, number>) {
    const entries: UserInventory[] = [];
    const newStock: Record<string, number> = {};

    for (const id in items) {
      const amt = Math.max(0, Math.floor(items[id] || 0));
      if (amt > 0) {
        newStock[id] = amt;
        entries.push({ itemId: id, amount: amt });
      }
    }
    stock.value = newStock;

    await db.transaction('rw', db.inventory, async () => {
      await db.inventory.clear();
      if (entries.length > 0) {
        await db.inventory.bulkPut(entries);
      }
    });
  }

  async function clearAll() {
    stock.value = {};
    await db.inventory.clear();
    useAuthStore().triggerAutoSync();
  }

  return {
    stock,
    isLoaded,
    loadInventory,
    setItemStock,
    getStock,
    bulkSetStock,
    replaceAllStock,
    clearAll,
  };
});
