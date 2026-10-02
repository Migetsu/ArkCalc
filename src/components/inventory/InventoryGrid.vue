<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useLocaleStore } from '@/stores/locale';
import type { ItemSummary } from '@/types/game';
import ItemIcon from '@/components/common/ItemIcon.vue';
import QuantityInput from '@/components/common/QuantityInput.vue';
import { Search, Filter, AlertCircle, CheckCircle2, Trash2, X } from 'lucide-vue-next';
import { getLocalizedItemName, isCraftResource } from '@/data/materialTranslations';

const gameData = useGameDataStore();
const inventory = useInventoryStore();
const planner = usePlannerStore();
const locale = useLocaleStore();

const searchQuery = ref('');
const activeCategory = ref<string>('all');
const onlyNeeded = ref<boolean>(false);
const onlyDeficit = ref<boolean>(false);

const categories = computed(() => [
  { id: 'all', label: locale.t('common.all') || (locale.currentLang === 'ru' ? 'Все' : 'All') },
  { id: 't5', label: 'T5' },
  { id: 't4', label: 'T4' },
  { id: 't3', label: 'T3' },
  { id: 't2', label: 'T2' },
  { id: 't1', label: 'T1' },
  { id: 'chip', label: locale.currentLang === 'ru' ? 'Чипы' : 'Chips' },
  { id: 'book', label: locale.currentLang === 'ru' ? 'Книги навыков' : 'Skill Summaries' },
  { id: 'module', label: locale.currentLang === 'ru' ? 'Модули' : 'Modules' },
  { id: 'currency', label: 'LMD & EXP' },
]);

function isChip(item: ItemSummary): boolean {
  return (
    item.name.toLowerCase().includes('chip') ||
    item.name.toLowerCase().includes('чип') ||
    item.iconId.includes('MTL_ASC_') ||
    item.itemId.startsWith('32')
  );
}

function isBook(item: ItemSummary): boolean {
  return (
    item.name.toLowerCase().includes('skill summary') ||
    item.name.toLowerCase().includes('сводка навыков') ||
    item.iconId.includes('MTL_SKILL') ||
    item.itemId.startsWith('33')
  );
}

function isModuleMaterial(item: ItemSummary): boolean {
  return (
    item.itemId.startsWith('mod_') ||
    item.iconId.startsWith('mod_') ||
    item.name.toLowerCase().includes('module')
  );
}

function isCurrencyOrExp(item: ItemSummary): boolean {
  return (
    item.itemId === '4001' ||
    item.itemType === 'GOLD' ||
    item.itemType === 'CARD_EXP' ||
    item.iconId.includes('exp_card') ||
    item.itemId.startsWith('200')
  );
}

function getItemNeeded(itemId: string): number {
  if (itemId === '4001') return planner.calculationResult.totalLmd;
  if (itemId === '2004') return Math.ceil(planner.calculationResult.totalExp / 2000);
  if (itemId === '2003') return Math.ceil(planner.calculationResult.totalExp / 1000);
  if (itemId === '2002') return Math.ceil(planner.calculationResult.totalExp / 400);
  if (itemId === '2001') return Math.ceil(planner.calculationResult.totalExp / 200);
  return planner.calculationResult.rawMaterials[itemId] || 0;
}

function getItemDeficit(itemId: string): number {
  if (itemId === '4001') {
    return Math.max(0, planner.calculationResult.totalLmd - (inventory.getStock('4001') || 0));
  }
  if (['2001', '2002', '2003', '2004'].includes(itemId)) {
    const totalExpStock =
      (inventory.getStock('2004') || 0) * 2000 +
      (inventory.getStock('2003') || 0) * 1000 +
      (inventory.getStock('2002') || 0) * 400 +
      (inventory.getStock('2001') || 0) * 200;
    const expDeficit = Math.max(0, planner.calculationResult.totalExp - totalExpStock);
    if (itemId === '2004') return Math.ceil(expDeficit / 2000);
    if (itemId === '2003') return Math.ceil(expDeficit / 1000);
    if (itemId === '2002') return Math.ceil(expDeficit / 400);
    if (itemId === '2001') return Math.ceil(expDeficit / 200);
  }
  const needed = planner.calculationResult.rawMaterials[itemId] || 0;
  const stock = inventory.getStock(itemId);
  return Math.max(0, needed - stock);
}

const relevantItemList = computed(() => {
  const rawNeeded = planner.calculationResult.rawMaterials;
  const stockedIds = Object.keys(inventory.stock || {});
  const neededIds = Object.keys(rawNeeded);

  if (onlyNeeded.value || onlyDeficit.value) {
    const ids = new Set([...stockedIds, ...neededIds]);
    if (planner.calculationResult.totalLmd > 0) ids.add('4001');
    if (planner.calculationResult.totalExp > 0) {
      ids.add('2004');
      ids.add('2003');
    }
    return Array.from(ids)
      .filter((id) => isCraftResource(id))
      .map((id) => gameData.getItem(id))
      .filter((item): item is ItemSummary => !!item);
  }

  // When browsing all categories, show only pure upgrade/craft materials (no operator potentials)
  const allItems = Object.values(gameData.items).map((it) => gameData.getItem(it.itemId) || it);
  return allItems.filter((item) => isCraftResource(item.itemId));
});

const filteredItems = computed(() => {
  let list = relevantItemList.value;

  // Category filter
  if (activeCategory.value === 't5') {
    list = list.filter((i) => i.rarity === 5 && !isChip(i) && !isBook(i) && !isCurrencyOrExp(i));
  } else if (activeCategory.value === 't4') {
    list = list.filter((i) => i.rarity === 4 && !isChip(i) && !isBook(i) && !isCurrencyOrExp(i));
  } else if (activeCategory.value === 't3') {
    list = list.filter((i) => i.rarity === 3 && !isChip(i) && !isBook(i) && !isCurrencyOrExp(i));
  } else if (activeCategory.value === 't2') {
    list = list.filter((i) => i.rarity === 2 && !isChip(i) && !isBook(i) && !isCurrencyOrExp(i));
  } else if (activeCategory.value === 't1') {
    list = list.filter((i) => i.rarity === 1 && !isChip(i) && !isBook(i) && !isCurrencyOrExp(i));
  } else if (activeCategory.value === 'chip') {
    list = list.filter((i) => isChip(i));
  } else if (activeCategory.value === 'book') {
    list = list.filter((i) => isBook(i));
  } else if (activeCategory.value === 'module') {
    list = list.filter((i) => isModuleMaterial(i));
  } else if (activeCategory.value === 'currency') {
    list = list.filter((i) => isCurrencyOrExp(i));
  }

  // Only needed toggle
  if (onlyNeeded.value) {
    list = list.filter((i) => getItemNeeded(i.itemId) > 0);
  }

  // Only deficit toggle
  if (onlyDeficit.value) {
    list = list.filter((i) => getItemDeficit(i.itemId) > 0);
  }

  // Search filter: matches current localized name, RU, EN, or item ID
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((i) => {
      const name = i.name.toLowerCase();
      const id = i.itemId.toLowerCase();
      const ru = getLocalizedItemName(i.itemId, 'ru')?.toLowerCase() || '';
      const en = getLocalizedItemName(i.itemId, 'en')?.toLowerCase() || '';
      return name.includes(q) || id.includes(q) || ru.includes(q) || en.includes(q);
    });
  }

  // Sort by rarity descending, then sortId, then name
  return list.sort((a, b) => {
    if (b.rarity !== a.rarity) return b.rarity - a.rarity;
    if (a.sortId !== b.sortId) return a.sortId - b.sortId;
    return a.name.localeCompare(b.name);
  });
});

function handleStockChange(itemId: string, val: number) {
  inventory.setItemStock(itemId, val);
}

function handleFillNeeded() {
  const rawNeeded = planner.calculationResult.rawMaterials;
  const updates: Record<string, number> = {};
  for (const itemId in rawNeeded) {
    updates[itemId] = rawNeeded[itemId];
  }
  if (planner.calculationResult.totalLmd > 0) {
    updates['4001'] = planner.calculationResult.totalLmd;
  }
  if (planner.calculationResult.totalExp > 0) {
    updates['2004'] = Math.ceil(planner.calculationResult.totalExp / 2000);
  }
  inventory.bulkSetStock(updates);
}

function handleClearStock() {
  if (confirm(locale.currentLang === 'ru' ? 'Вы уверены, что хотите полностью очистить склад?' : 'Are you sure you want to clear your entire depot inventory?')) {
    inventory.clearAll();
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm space-y-3.5">
      <!-- Search and quick actions -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="locale.t('depot.searchPlaceholder') || (locale.currentLang === 'ru' ? 'Поиск по названию предмета...' : 'Search items...')"
            class="w-full bg-slate-900 border border-ark-border rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            @click="searchQuery = ''"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            :title="locale.currentLang === 'ru' ? 'Заполнить склад требуемым количеством из планов' : 'Fill depot with required quantities from plans'"
            @click="handleFillNeeded"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-cyan-400" />
            {{ locale.currentLang === 'ru' ? 'Заполнить по планам' : 'Fill from Plans' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/60 transition-colors shadow-sm"
            :title="locale.currentLang === 'ru' ? 'Очистить все предметы на складе' : 'Clear all items in depot'"
            @click="handleClearStock"
          >
            <Trash2 class="w-3.5 h-3.5" />
            {{ locale.currentLang === 'ru' ? 'Очистить склад' : 'Clear Depot' }}
          </button>
        </div>
      </div>

      <!-- Categories tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="px-3 py-1.5 rounded-lg border font-medium transition-all flex-shrink-0"
          :class="[
            activeCategory === cat.id
              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 shadow-sm'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
          ]"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Quick filters: only needed, only deficit -->
      <div class="flex flex-wrap items-center gap-3 pt-1 text-xs">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="onlyNeeded"
            type="checkbox"
            class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/50"
          />
          <span class="text-slate-300 font-medium">{{ locale.currentLang === 'ru' ? 'Только нужные в планах' : 'Only needed in plans' }}</span>
        </label>

        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="onlyDeficit"
            type="checkbox"
            class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-red-500/50"
          />
          <span class="text-red-400 font-medium flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5 text-red-500" />
            {{ locale.currentLang === 'ru' ? 'Только в дефиците' : 'Only deficit' }}
          </span>
        </label>

        <span class="text-slate-500 ml-auto font-mono text-[11px]">
          {{ locale.currentLang === 'ru' ? `Показано: ${filteredItems.length} предметов` : `Showing: ${filteredItems.length} items` }}
        </span>
      </div>
    </div>

    <!-- Items Grid -->
    <div
      v-if="filteredItems.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
    >
      <div
        v-for="item in filteredItems"
        :key="item.itemId"
        class="bg-ark-card border rounded-xl p-3 flex flex-col justify-between transition-all shadow-sm"
        :class="[
          getItemDeficit(item.itemId) > 0
            ? 'border-red-500/40 bg-red-950/10'
            : 'border-ark-border hover:border-slate-600',
        ]"
      >
        <div class="flex items-start gap-3">
          <!-- Item Icon -->
          <ItemIcon
            :item-id="item.itemId"
            size="lg"
            :show-tooltip="false"
            class="flex-shrink-0"
          />

          <!-- Item Details -->
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs text-slate-100 truncate" :title="item.name">
              {{ item.name }}
            </h4>
            <div class="mt-1 space-y-0.5 text-[11px] font-mono">
              <!-- Needed row -->
              <div class="flex items-center justify-between text-slate-400">
                <span>{{ locale.currentLang === 'ru' ? 'Нужно:' : 'Needed:' }}</span>
                <span class="font-bold text-slate-200">
                  {{ getItemNeeded(item.itemId).toLocaleString() }}
                </span>
              </div>

              <!-- Deficit row -->
              <div
                v-if="getItemDeficit(item.itemId) > 0"
                class="flex items-center justify-between text-red-400 font-bold"
              >
                <span>{{ locale.currentLang === 'ru' ? 'Дефицит:' : 'Deficit:' }}</span>
                <span>
                  -{{ getItemDeficit(item.itemId).toLocaleString() }}
                </span>
              </div>
              <div v-else class="flex items-center justify-between text-emerald-400">
                <span>{{ locale.currentLang === 'ru' ? 'Дефицит:' : 'Deficit:' }}</span>
                <span class="text-[10px]">{{ locale.currentLang === 'ru' ? 'В достатке' : 'In stock' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Input -->
        <div class="mt-3 pt-2.5 border-t border-ark-border/60 flex items-center justify-between gap-2">
          <span class="text-[11px] text-slate-400 font-medium">{{ locale.currentLang === 'ru' ? 'На складе:' : 'In depot:' }}</span>
          <QuantityInput
            :model-value="inventory.getStock(item.itemId)"
            @change="(val) => handleStockChange(item.itemId, val)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400"
    >
      <Filter class="w-10 h-10 mx-auto text-slate-600 mb-2" />
      <p class="text-sm font-medium">{{ locale.currentLang === 'ru' ? 'Нет предметов, соответствующих критериям фильтрации.' : 'No items match the filter criteria.' }}</p>
    </div>
  </div>
</template>
