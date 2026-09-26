<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import OperatorSelector from '@/components/operator/OperatorSelector.vue';
import InventoryGrid from '@/components/inventory/InventoryGrid.vue';
import ResourceSummary from '@/components/calculator/ResourceSummary.vue';
import SettingsModal from '@/components/common/SettingsModal.vue';
import {
  Users,
  Package,
  Calculator,
  Settings,
  Database,
  RefreshCw,
  AlertCircle,
} from 'lucide-vue-next';

const gameData = useGameDataStore();
const inventory = useInventoryStore();
const planner = usePlannerStore();

type TabType = 'operators' | 'inventory' | 'calculator';
const currentTab = ref<TabType>('operators');
const isSettingsOpen = ref<boolean>(false);

onMounted(async () => {
  // Load local IndexedDB stores in parallel with game data
  await Promise.all([
    inventory.loadInventory(),
    planner.loadPlans(),
    gameData.loadGameData(),
  ]);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ark-dark text-slate-100">
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 bg-ark-darker/95 backdrop-blur-md border-b border-ark-border shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-cyan-500/20 shadow-md">
            <svg class="w-5 h-5 text-slate-950 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <polygon points="12,2 22,20 2,20" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-black text-base sm:text-lg tracking-wider text-slate-100 uppercase">
                ARK<span class="text-cyan-400">-Calc</span>
              </h1>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                PWA
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono hidden sm:block">
              Arknights Offline Planner & Material Crafting Engine
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center gap-1 sm:gap-2">
          <!-- Operators Tab -->
          <button
            type="button"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative"
            :class="[
              currentTab === 'operators'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
            ]"
            @click="currentTab = 'operators'"
          >
            <Users class="w-4 h-4" />
            <span class="hidden md:inline">Оперативники</span>
            <span
              v-if="planner.planCount > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950"
            >
              {{ planner.planCount }}
            </span>
          </button>

          <!-- Inventory Tab -->
          <button
            type="button"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative"
            :class="[
              currentTab === 'inventory'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
            ]"
            @click="currentTab = 'inventory'"
          >
            <Package class="w-4 h-4" />
            <span class="hidden md:inline">Склад</span>
            <span
              v-if="Object.keys(inventory.stock).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700"
            >
              {{ Object.keys(inventory.stock).length }}
            </span>
          </button>

          <!-- Calculator Tab -->
          <button
            type="button"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative"
            :class="[
              currentTab === 'calculator'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
            ]"
            @click="currentTab = 'calculator'"
          >
            <Calculator class="w-4 h-4" />
            <span class="hidden md:inline">Калькулятор</span>
            <span
              v-if="planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse"
            >
              {{ planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length }}
            </span>
          </button>
        </nav>

        <!-- Right Action Button: Settings -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="p-2.5 rounded-xl bg-slate-900 border border-ark-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shadow-sm"
            title="Настройки, резервное копирование и синхронизация"
            @click="isSettingsOpen = true"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Loading Screen -->
      <div
        v-if="gameData.isLoading"
        class="h-[60vh] flex flex-col items-center justify-center text-center p-6"
      >
        <div class="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-lg">
          <RefreshCw class="w-8 h-8 animate-spin" />
        </div>
        <h2 class="text-lg font-bold text-slate-100">Инициализация игровых данных</h2>
        <p class="text-xs text-slate-400 font-mono mt-1 mb-4">{{ gameData.loadingStatus }}</p>

        <!-- Progress bar -->
        <div class="w-72 bg-slate-900 rounded-full h-2 overflow-hidden border border-ark-border">
          <div
            class="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
            :style="{ width: `${gameData.loadingProgress}%` }"
          ></div>
        </div>
        <span class="text-xs font-mono text-cyan-400 mt-2 font-bold">{{ gameData.loadingProgress }}%</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="gameData.error"
        class="max-w-md mx-auto my-16 p-6 bg-red-950/30 border border-red-500/40 rounded-2xl text-center space-y-4 shadow-lg"
      >
        <AlertCircle class="w-10 h-10 text-red-400 mx-auto" />
        <h3 class="font-bold text-red-200">Не удалось загрузить данные игры</h3>
        <p class="text-xs text-slate-400">{{ gameData.error }}</p>
        <button
          type="button"
          class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
          @click="gameData.loadGameData(true)"
        >
          Повторить попытку
        </button>
      </div>

      <!-- Active View -->
      <div v-else class="h-full">
        <OperatorSelector v-show="currentTab === 'operators'" />
        <InventoryGrid v-show="currentTab === 'inventory'" />
        <ResourceSummary v-show="currentTab === 'calculator'" />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-ark-darker border-t border-ark-border/80 py-4 px-4 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <Database class="w-3.5 h-3.5 text-cyan-500" />
          <span>Offline-First (IndexedDB) &bull; CDN Metadata</span>
        </div>
        <div>
          <span>ARK-Calc &bull; Arknights Planner & Material Engine</span>
        </div>
      </div>
    </footer>

    <!-- Settings Modal -->
    <SettingsModal
      :is-open="isSettingsOpen"
      @close="isSettingsOpen = false"
    />
  </div>
</template>
