<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useRosterStore } from '@/stores/roster';
import { useAuthStore } from '@/stores/auth';
import OperatorSelector from '@/components/operator/OperatorSelector.vue';
import RosterView from '@/components/roster/RosterView.vue';
import WikiView from '@/components/wiki/WikiView.vue';
import RecruitmentView from '@/components/recruitment/RecruitmentView.vue';
import InventoryGrid from '@/components/inventory/InventoryGrid.vue';
import ResourceSummary from '@/components/calculator/ResourceSummary.vue';
import SettingsModal from '@/components/common/SettingsModal.vue';
import AuthModal from '@/components/auth/AuthModal.vue';
import {
  Users,
  UserCheck,
  BookOpen,
  Package,
  Calculator,
  Settings,
  Database,
  RefreshCw,
  AlertCircle,
  Radio,
  Cloud,
  LayoutGrid,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-vue-next';

const gameData = useGameDataStore();
const inventory = useInventoryStore();
const planner = usePlannerStore();
const roster = useRosterStore();
const auth = useAuthStore();

type TabType = 'operators' | 'roster' | 'inventory' | 'calculator' | 'recruitment' | 'wiki';
const currentTab = ref<TabType>('operators');
const isSettingsOpen = ref<boolean>(false);
const isAuthModalOpen = ref<boolean>(false);
const isMobileMenuOpen = ref<boolean>(false);

function selectTab(tab: TabType) {
  currentTab.value = tab;
  isMobileMenuOpen.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModalFromMenu(modal: 'settings' | 'auth') {
  isMobileMenuOpen.value = false;
  if (modal === 'settings') {
    isSettingsOpen.value = true;
  } else {
    isAuthModalOpen.value = true;
  }
}

onMounted(async () => {
  // Initialize cloud auth listener
  auth.initAuth();

  // Load local IndexedDB stores in parallel with game data
  await Promise.all([
    inventory.loadInventory(),
    planner.loadPlans(),
    roster.loadRoster(),
    gameData.loadGameData(),
  ]);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ark-dark text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-30 bg-ark-darker/95 backdrop-blur-md border-b border-ark-border/80 shadow-lg">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
        <!-- Logo -->
        <div class="flex items-center gap-2.5 flex-shrink-0 cursor-pointer select-none" @click="selectTab('operators')">
          <div class="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden shadow-cyan-500/20 shadow-md border border-cyan-500/30 flex-shrink-0 bg-slate-900">
            <img src="/favicon.svg" alt="ARK-Calc" class="w-full h-full object-cover" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h1 class="font-black text-sm sm:text-base md:text-lg tracking-wider text-slate-100 uppercase">
                ARK<span class="text-cyan-400">-CALC</span>
              </h1>
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                PWA
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono hidden xl:block leading-none mt-0.5">
              Arknights Offline Planner & Material Engine
            </p>
          </div>
        </div>

        <!-- Desktop Segmented Navigation Capsule (Hidden on mobile) -->
        <nav class="hidden md:flex items-center bg-slate-900/90 border border-slate-700/60 p-1 rounded-2xl shadow-inner text-xs font-semibold gap-0.5">
          <!-- Operators Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'operators'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('operators')"
          >
            <Users class="w-3.5 h-3.5" />
            <span>Оперативники</span>
            <span
              v-if="planner.planCount > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-slate-950 leading-tight"
            >
              {{ planner.planCount }}
            </span>
          </button>

          <!-- Calculator Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'calculator'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('calculator')"
          >
            <Calculator class="w-3.5 h-3.5" />
            <span>Калькулятор</span>
            <span
              v-if="planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse leading-tight"
              title="Ресурсов в дефиците"
            >
              {{ planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length }}
            </span>
          </button>

          <!-- Inventory Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'inventory'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('inventory')"
          >
            <Package class="w-3.5 h-3.5" />
            <span>Склад</span>
            <span
              v-if="Object.keys(inventory.stock).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 leading-tight"
            >
              {{ Object.keys(inventory.stock).length }}
            </span>
          </button>

          <!-- Roster Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'roster'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('roster')"
          >
            <UserCheck class="w-3.5 h-3.5 text-emerald-400" />
            <span>Ростер</span>
            <span
              v-if="roster.rosterCount > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 leading-tight"
            >
              {{ roster.rosterCount }}
            </span>
          </button>

          <!-- Divider -->
          <div class="h-4 w-px bg-slate-700/80 mx-1"></div>

          <!-- Recruitment Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'recruitment'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('recruitment')"
          >
            <Radio class="w-3.5 h-3.5 text-amber-400" />
            <span>Рекрутинг</span>
          </button>

          <!-- Wiki Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'wiki'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('wiki')"
          >
            <BookOpen class="w-3.5 h-3.5" />
            <span>Вики</span>
          </button>
        </nav>

        <!-- Right Action Buttons: Cloud Sync & Settings -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Cloud Sync Pill Button -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95"
            :class="[
              auth.isAuthenticated
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40',
            ]"
            :title="auth.isAuthenticated ? 'Синхронизировано: ' + auth.userEmail : 'Войти в облачный аккаунт'"
            @click="isAuthModalOpen = true"
          >
            <Cloud class="w-4 h-4 text-cyan-400" />
            <span class="hidden sm:inline font-mono">
              {{ auth.isAuthenticated ? 'Облако' : 'Войти' }}
            </span>
            <span
              v-if="auth.isAuthenticated"
              class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              title="Облако подключено"
            ></span>
          </button>

          <!-- Settings Button -->
          <button
            type="button"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shadow-sm active:scale-95"
            title="Настройки, резервное копирование и синхронизация"
            @click="isSettingsOpen = true"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8">
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
        <RosterView v-show="currentTab === 'roster'" @open-settings="isSettingsOpen = true" />
        <RecruitmentView v-show="currentTab === 'recruitment'" />
        <InventoryGrid v-show="currentTab === 'inventory'" />
        <ResourceSummary v-show="currentTab === 'calculator'" />
        <WikiView v-show="currentTab === 'wiki'" />
      </div>
    </main>

    <!-- Desktop Footer -->
    <footer class="hidden md:block bg-ark-darker border-t border-ark-border/80 py-4 px-4 text-center text-xs text-slate-500">
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

    <!-- Mobile Bottom Navigation Bar (Fixed for phones & small screens) -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 6px);"
    >
      <div class="grid grid-cols-5 h-14 items-center">
        <!-- 1: Планы (Оперативники) -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'operators' && !isMobileMenuOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="selectTab('operators')"
        >
          <div class="relative">
            <Users class="w-5 h-5" />
            <span
              v-if="planner.planCount > 0"
              class="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-cyan-400 text-slate-950 leading-tight"
            >
              {{ planner.planCount }}
            </span>
          </div>
          <span class="text-[10px] tracking-tight">Планы</span>
          <span
            v-if="currentTab === 'operators' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 2: Калькулятор -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'calculator' && !isMobileMenuOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="selectTab('calculator')"
        >
          <div class="relative">
            <Calculator class="w-5 h-5" />
            <span
              v-if="planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length > 0"
              class="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-rose-600 text-white leading-tight animate-pulse"
            >
              {{ planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length }}
            </span>
          </div>
          <span class="text-[10px] tracking-tight">Расчет</span>
          <span
            v-if="currentTab === 'calculator' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 3: Склад -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'inventory' && !isMobileMenuOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="selectTab('inventory')"
        >
          <div class="relative">
            <Package class="w-5 h-5" />
            <span
              v-if="Object.keys(inventory.stock).length > 0"
              class="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 leading-tight"
            >
              {{ Object.keys(inventory.stock).length }}
            </span>
          </div>
          <span class="text-[10px] tracking-tight">Склад</span>
          <span
            v-if="currentTab === 'inventory' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 4: Рекрутинг -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'recruitment' && !isMobileMenuOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="selectTab('recruitment')"
        >
          <div class="relative">
            <Radio class="w-5 h-5" />
          </div>
          <span class="text-[10px] tracking-tight">Рекрут</span>
          <span
            v-if="currentTab === 'recruitment' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          ></span>
        </button>

        <!-- 5: Меню (Drawer) -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="isMobileMenuOpen || currentTab === 'roster' || currentTab === 'wiki' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <div class="relative">
            <LayoutGrid class="w-5 h-5" />
            <span
              v-if="roster.rosterCount > 0"
              class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"
            ></span>
          </div>
          <span class="text-[10px] tracking-tight">Меню</span>
          <span
            v-if="isMobileMenuOpen || currentTab === 'roster' || currentTab === 'wiki'"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu Drawer / Bottom Sheet -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
      @click.self="isMobileMenuOpen = false"
    >
      <div
        class="bg-ark-darker border-t border-slate-800 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-8"
      >
        <!-- Sheet Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Layers class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-slate-100 text-sm">Панель терминала</h3>
              <p class="text-[10px] text-slate-400 font-mono">Дополнительные разделы и утилиты</p>
            </div>
          </div>
          <button
            type="button"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            @click="isMobileMenuOpen = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Quick Navigation Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- 1. Мой ростер -->
          <button
            type="button"
            class="p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
            :class="currentTab === 'roster' ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'"
            @click="selectTab('roster')"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <UserCheck class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-slate-100">Мой ростер</div>
                <div class="text-[11px] text-slate-400">
                  {{ roster.rosterCount > 0 ? `${roster.rosterCount} операторов из ArkPRTS` : 'Импортируйте свой аккаунт' }}
                </div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 2. Вики & Справочник -->
          <button
            type="button"
            class="p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
            :class="currentTab === 'wiki' ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'"
            @click="selectTab('wiki')"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-700/60 flex items-center justify-center text-blue-400 flex-shrink-0">
                <BookOpen class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-slate-100">База данных & Вики</div>
                <div class="text-[11px] text-slate-400">Оперативники, ресурсы, модули</div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 3. Облачный аккаунт -->
          <button
            type="button"
            class="p-3.5 rounded-2xl border bg-slate-900/80 border-slate-800 hover:border-slate-700 text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
            @click="openModalFromMenu('auth')"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-700/60 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Cloud class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <div class="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  <span>Облачный аккаунт</span>
                  <span
                    v-if="auth.isAuthenticated"
                    class="w-2 h-2 rounded-full bg-emerald-400"
                  ></span>
                </div>
                <div class="text-[11px] text-slate-400 truncate">
                  {{ auth.isAuthenticated ? auth.userEmail : 'Синхронизация между устройствами' }}
                </div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 4. Настройки & Импорт -->
          <button
            type="button"
            class="p-3.5 rounded-2xl border bg-slate-900/80 border-slate-800 hover:border-slate-700 text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
            @click="openModalFromMenu('settings')"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                <Settings class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-slate-100">Настройки & Импорт</div>
                <div class="text-[11px] text-slate-400">Вставка ArkPRTS, язык, сброс</div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>
        </div>

        <!-- System status info -->
        <div class="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-cyan-400" />
            <span>PRTS v1.0 &bull; Local-First</span>
          </div>
          <span class="text-slate-500">База CN &bull; EN/RU имена</span>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      :is-open="isSettingsOpen"
      @close="isSettingsOpen = false"
    />

    <!-- Cloud Auth & Sync Modal -->
    <AuthModal
      :is-open="isAuthModalOpen"
      @close="isAuthModalOpen = false"
    />
  </div>
</template>
