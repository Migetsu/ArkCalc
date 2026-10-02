<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useRosterStore } from '@/stores/roster';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore, type AppLanguage } from '@/stores/locale';
import { usePwaStore } from '@/stores/pwa';
import OperatorSelector from '@/components/operator/OperatorSelector.vue';

// Lazy-loaded views & modals for optimal bundle splitting
const RosterView = defineAsyncComponent(() => import('@/components/roster/RosterView.vue'));
const WikiView = defineAsyncComponent(() => import('@/components/wiki/WikiView.vue'));
const RecruitmentView = defineAsyncComponent(() => import('@/components/recruitment/RecruitmentView.vue'));
const InventoryGrid = defineAsyncComponent(() => import('@/components/inventory/InventoryGrid.vue'));
const ResourceSummary = defineAsyncComponent(() => import('@/components/calculator/ResourceSummary.vue'));
const EventsView = defineAsyncComponent(() => import('@/components/events/EventsView.vue'));
const SettingsModal = defineAsyncComponent(() => import('@/components/common/SettingsModal.vue'));
const AuthModal = defineAsyncComponent(() => import('@/components/auth/AuthModal.vue'));
const GachaPlannerView = defineAsyncComponent(() => import('@/components/gacha/GachaPlannerView.vue'));

import { exportDatabaseToJson } from '@/services/syncService';
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
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
  Globe,
  Menu,
  Download,
  Sparkles,
} from 'lucide-vue-next';

const gameData = useGameDataStore();
const inventory = useInventoryStore();
const planner = usePlannerStore();
const roster = useRosterStore();
const auth = useAuthStore();
const locale = useLocaleStore();
const pwa = usePwaStore();

type TabType = 'operators' | 'roster' | 'inventory' | 'calculator' | 'events' | 'recruitment' | 'wiki' | 'gacha';
const currentTab = ref<TabType>('operators');
const isSettingsOpen = ref<boolean>(false);
const isAuthModalOpen = ref<boolean>(false);
const isDrawerOpen = ref<boolean>(false);

const isSecondaryTabActive = computed(() => ['events', 'roster', 'recruitment', 'wiki', 'gacha'].includes(currentTab.value));

const activeSecondaryTabInfo = computed(() => {
  switch (currentTab.value) {
    case 'events':
      return { id: 'events', label: locale.t('nav.events'), icon: Flame, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
    case 'roster':
      return { id: 'roster', label: locale.t('nav.roster'), icon: UserCheck, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' };
    case 'recruitment':
      return { id: 'recruitment', label: locale.t('nav.recruitment'), icon: Radio, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
    case 'wiki':
      return { id: 'wiki', label: locale.t('nav.wiki'), icon: BookOpen, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' };
    case 'gacha':
      return { id: 'gacha', label: locale.currentLang === 'ru' ? 'Крутки & Spark' : 'Gacha & Spark', icon: Sparkles, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
    default:
      return null;
  }
});

function selectTab(tab: TabType) {
  currentTab.value = tab;
  isDrawerOpen.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModalFromMenu(modal: 'settings' | 'auth') {
  isDrawerOpen.value = false;
  if (modal === 'settings') {
    isSettingsOpen.value = true;
  } else {
    isAuthModalOpen.value = true;
  }
}

async function handleQuickBackup() {
  try {
    await exportDatabaseToJson();
  } catch (err) {
    console.error('Failed to export backup:', err);
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isDrawerOpen.value) {
    isDrawerOpen.value = false;
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  // Load local IndexedDB stores in parallel with game data first
  await Promise.all([
    inventory.loadInventory(),
    planner.loadPlans(),
    roster.loadRoster(),
    gameData.loadGameData(),
  ]);

  // Initialize cloud auth listener and auto-pull cloud state if logged in
  await auth.initAuth();
});

watch(
  () => isDrawerOpen.value,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ark-dark text-slate-100 selection:bg-cyan-500 selection:text-slate-950 bg-tactical-grid relative overflow-x-hidden">
    <!-- Ambient Background Neon Gradients -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/[0.04] rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/[0.03] rounded-full blur-3xl"></div>
    </div>

    <!-- PWA Service Worker Update Alert Banner -->
    <div
      v-if="pwa.needRefresh"
      class="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-500/50 px-4 py-2 text-xs flex items-center justify-between gap-3 text-cyan-200 z-40 sticky top-0 shadow-lg backdrop-blur-md animate-fade-in"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <RefreshCw class="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
        <span class="font-medium truncate">
          {{ locale.currentLang === 'ru' ? 'Доступна новая версия ARK-Calc! Нажмите для мгновенного обновления.' : 'New ARK-Calc version available! Click to reload.' }}
        </span>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          class="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          @click="pwa.updateApp"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>{{ locale.currentLang === 'ru' ? 'Обновить' : 'Reload' }}</span>
        </button>
        <button
          type="button"
          class="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          :title="locale.currentLang === 'ru' ? 'Закрыть' : 'Dismiss'"
          @click="pwa.dismissRefresh"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Top Tactical Navigation Header -->
    <header class="sticky top-0 z-30 prts-glass border-b border-ark-border/80 shadow-lg">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-3 relative z-10">
        <!-- Brand Logo & PRTS Terminal Badge -->
        <div
          class="flex items-center gap-2.5 flex-shrink-0 cursor-pointer select-none group"
          @click="selectTab('operators')"
        >
          <div class="relative w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden shadow-cyan-500/20 shadow-md border border-cyan-500/40 flex-shrink-0 bg-slate-900 group-hover:border-cyan-400 transition-colors">
            <img src="/favicon.svg" alt="ARK-Calc" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none"></div>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h1 class="font-black text-sm sm:text-base md:text-lg tracking-wider text-slate-100 uppercase group-hover:text-white transition-colors">
                ARK<span class="text-cyan-400">-CALC</span>
              </h1>
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-700/80 text-cyan-300 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PRTS v4.2
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono hidden xl:block leading-none mt-0.5 tracking-tight">
              RHODES ISLAND LOGISTICS &amp; MATERIAL TERMINAL
            </p>
          </div>
        </div>

        <!-- Desktop Segmented Command Dock: 3 Core Tabs + Contextual Secondary Tab -->
        <nav class="hidden md:flex items-center bg-slate-950/80 border border-slate-800/90 p-1 rounded-2xl shadow-inner text-xs font-semibold gap-1">
          <!-- 1. Operators Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'operators'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('operators')"
          >
            <Users class="w-3.5 h-3.5" :class="currentTab === 'operators' ? 'text-cyan-400' : 'text-slate-400'" />
            <span>{{ locale.t('nav.operators') }}</span>
            <span
              v-if="planner.planCount > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-slate-950 leading-tight"
            >
              {{ planner.planCount }}
            </span>
          </button>

          <!-- 2. Calculator Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'calculator'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('calculator')"
          >
            <Calculator class="w-3.5 h-3.5" :class="currentTab === 'calculator' ? 'text-cyan-400' : 'text-slate-400'" />
            <span>{{ locale.t('nav.calculator') }}</span>
            <span
              v-if="planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse leading-tight"
              title="Deficit items"
            >
              {{ planner.calculationResult.directDeficit.filter(d => d.deficit > 0).length }}
            </span>
          </button>

          <!-- 3. Depot / Inventory Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'inventory'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('inventory')"
          >
            <Package class="w-3.5 h-3.5" :class="currentTab === 'inventory' ? 'text-cyan-400' : 'text-slate-400'" />
            <span>{{ locale.t('nav.inventory') }}</span>
            <span
              v-if="Object.keys(inventory.stock).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 leading-tight"
            >
              {{ Object.keys(inventory.stock).length }}
            </span>
          </button>

          <!-- Contextual Tab for Active Secondary View (Events, Roster, Recruitment, Wiki) -->
          <template v-if="activeSecondaryTabInfo">
            <div class="h-4 w-px bg-slate-800 mx-0.5"></div>
            <div
              class="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl font-bold border shadow-sm transition-all"
              :class="[activeSecondaryTabInfo.bg, activeSecondaryTabInfo.border, activeSecondaryTabInfo.color]"
            >
              <component :is="activeSecondaryTabInfo.icon" class="w-3.5 h-3.5" />
              <span>{{ activeSecondaryTabInfo.label }}</span>
              <button
                type="button"
                class="ml-1 p-0.5 rounded-md hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
                title="Return to Operators"
                @click.stop="selectTab('operators')"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </template>
        </nav>

        <!-- Right Action Cluster: Offline Pill, Cloud Pill & PRTS Menu Burger Button -->
        <div class="flex items-center gap-2">
          <!-- Offline Indicator -->
          <div
            v-if="!pwa.isOnline"
            class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-950/50 text-amber-300 text-xs font-mono font-bold animate-pulse shadow-sm"
            :title="locale.currentLang === 'ru' ? 'Оффлайн режим: все данные доступны из локального хранилища' : 'Offline mode: working from local cache'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span class="text-[10px] tracking-wider">OFFLINE</span>
          </div>

          <!-- Cloud Sync Status Pill -->
          <button
            type="button"
            class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95"
            :class="[
              auth.isAuthenticated
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40',
            ]"
            :title="auth.isAuthenticated ? (auth.isSyncing ? 'PRTS Cloud Syncing...' : 'PRTS Cloud: ' + auth.userEmail) : 'PRTS Cloud: Login'"
            @click="isAuthModalOpen = true"
          >
            <RefreshCw v-if="auth.isSyncing" class="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <Cloud v-else class="w-3.5 h-3.5" :class="auth.isAuthenticated ? 'text-emerald-400' : 'text-slate-400'" />
            <span class="font-mono text-[11px]">
              {{ auth.isSyncing ? 'Syncing' : (auth.isAuthenticated ? 'Cloud' : 'Login') }}
            </span>
            <span
              v-if="auth.isAuthenticated && !auth.isSyncing"
              class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
            ></span>
          </button>

          <!-- PRTS Terminal Burger Menu Button -->
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-sm active:scale-95 group relative"
            :class="[
              isDrawerOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:text-white hover:border-cyan-500/50 hover:bg-slate-900'
            ]"
            title="PRTS Navigation Hub & System"
            @click="isDrawerOpen = !isDrawerOpen"
          >
            <div class="relative flex items-center justify-center">
              <Menu class="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              <span
                v-if="roster.rosterCount > 0 || auth.isAuthenticated"
                class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse"
              ></span>
            </div>
            <span class="text-xs font-bold font-mono tracking-wider">MENU</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 relative z-10">
      <!-- Loading Screen -->
      <div
        v-if="gameData.isLoading"
        class="h-[60vh] flex flex-col items-center justify-center text-center p-6"
      >
        <div class="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-lg prts-glow">
          <RefreshCw class="w-8 h-8 animate-spin" />
        </div>
        <h2 class="text-lg font-bold text-slate-100">PRTS System Initializing</h2>
        <p class="text-xs text-slate-400 font-mono mt-1 mb-4">{{ gameData.loadingStatus }}</p>

        <!-- Progress bar -->
        <div class="w-72 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
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
        <h3 class="font-bold text-red-200">System Link Error</h3>
        <p class="text-xs text-slate-400">{{ gameData.error }}</p>
        <button
          type="button"
          class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
          @click="gameData.loadGameData(true)"
        >
          Retry Link
        </button>
      </div>

      <!-- Active Workspace View -->
      <div v-else class="h-full">
        <OperatorSelector v-show="currentTab === 'operators'" />
        <RosterView v-show="currentTab === 'roster'" @open-settings="isSettingsOpen = true" />
        <RecruitmentView v-show="currentTab === 'recruitment'" />
        <InventoryGrid v-show="currentTab === 'inventory'" />
        <ResourceSummary v-show="currentTab === 'calculator'" />
        <EventsView v-show="currentTab === 'events'" />
        <WikiView v-show="currentTab === 'wiki'" />
        <GachaPlannerView v-show="currentTab === 'gacha'" />
      </div>
    </main>

    <!-- Desktop PRTS Footer -->
    <footer class="hidden md:block bg-slate-950/90 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 relative z-10">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
        <div class="flex items-center gap-2">
          <Database class="w-3.5 h-3.5 text-cyan-500" />
          <span>PRTS Architecture &bull; Offline-First (IndexedDB) &bull; CDN Sync</span>
        </div>
        <div>
          <span>ARK-CALC &bull; Rhodes Island Materials &amp; Tactical Planner</span>
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Navigation Dock (4 slots: Operators, Calculator, Depot, Menu) -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 6px);"
    >
      <div class="grid grid-cols-4 h-14 items-center">
        <!-- 1: Operators -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'operators' && !isDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
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
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.operators') }}</span>
          <span
            v-if="currentTab === 'operators' && !isDrawerOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 2: Calculator -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'calculator' && !isDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
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
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.calculator') }}</span>
          <span
            v-if="currentTab === 'calculator' && !isDrawerOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 3: Depot (Inventory) -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'inventory' && !isDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
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
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.inventory') }}</span>
          <span
            v-if="currentTab === 'inventory' && !isDrawerOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 4: PRTS Hub Menu -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="isDrawerOpen || isSecondaryTabActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="isDrawerOpen = !isDrawerOpen"
        >
          <div class="relative">
            <Menu class="w-5 h-5" />
            <span
              v-if="roster.rosterCount > 0 || auth.isAuthenticated"
              class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse"
            ></span>
          </div>
          <span class="text-[10px] tracking-tight">MENU</span>
          <span
            v-if="isDrawerOpen || isSecondaryTabActive"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>
      </div>
    </nav>

    <!-- Universal PRTS Navigation & System Side Drawer (Desktop & Mobile) -->
    <Teleport to="body">
      <div
        class="fixed inset-0 z-50 overflow-hidden pointer-events-none flex justify-end"
        :class="{ 'pointer-events-auto': isDrawerOpen }"
      >
        <!-- Backdrop Transition -->
        <Transition
          enter-active-class="transition-opacity duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-250 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isDrawerOpen"
            class="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            @click="isDrawerOpen = false"
          ></div>
        </Transition>

        <!-- Aside Slide Transition -->
        <Transition
          enter-active-class="transition-transform duration-350 ease-out-expo will-change-transform"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-250 ease-in-expo will-change-transform"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="isDrawerOpen"
            class="relative w-full sm:w-[440px] md:w-[460px] h-full bg-slate-950/95 border-l border-cyan-500/30 shadow-2xl flex flex-col z-10 backdrop-blur-xl prts-glow overflow-hidden"
          >
          <!-- Drawer Header -->
          <div class="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
                <Layers class="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-sm text-slate-100 uppercase tracking-wider">
                    PRTS <span class="text-cyan-400">NAVIGATION HUB</span>
                  </h3>
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
                    TERMINAL
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 font-mono">Rhodes Island Logistics &amp; Archives</p>
              </div>
            </div>

            <button
              type="button"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 text-xs font-mono"
              @click="isDrawerOpen = false"
            >
              <span class="hidden sm:inline text-[10px] text-slate-500">[ESC]</span>
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Drawer Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
            <!-- Account & Cloud Banner -->
            <div class="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 relative overflow-hidden">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
                    :class="auth.isAuthenticated ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'"
                  >
                    <Cloud class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-slate-200 text-xs truncate">
                        {{ auth.isAuthenticated ? auth.userEmail : (locale.currentLang === 'ru' ? 'Облачная синхронизация' : 'Cloud Synchronization') }}
                      </span>
                      <span
                        v-if="auth.isAuthenticated"
                        class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"
                      ></span>
                    </div>
                    <p class="text-[11px] text-slate-400 truncate">
                      {{ auth.isAuthenticated ? (auth.isSyncing ? 'Sync in progress...' : 'Online & Linked') : (locale.currentLang === 'ru' ? 'Синхронизация между устройствами' : 'Sync plans & depot across devices') }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex-shrink-0 shadow-sm"
                  :class="auth.isAuthenticated ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500'"
                  @click="openModalFromMenu('auth')"
                >
                  {{ auth.isAuthenticated ? (locale.currentLang === 'ru' ? 'Аккаунт' : 'Account') : (locale.currentLang === 'ru' ? 'Войти' : 'Login') }}
                </button>
              </div>
            </div>

            <!-- Operations & Timelines Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between px-1">
                <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {{ locale.currentLang === 'ru' ? 'Операции и расписание' : 'Operations & Schedule' }}
                </span>
                <span class="text-[9px] font-mono text-cyan-400">GLOBAL &amp; CN</span>
              </div>

              <!-- Events & Timeline Card -->
              <button
                type="button"
                class="w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
                :class="currentTab === 'events' ? 'bg-amber-950/40 border-amber-500/50 shadow-md ring-1 ring-amber-500/30' : 'bg-slate-900/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'"
                @click="selectTab('events')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Flame class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>{{ locale.t('nav.events') }}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        BANNERS
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-1">
                      {{ locale.currentLang === 'ru' ? 'Будущие баннеры, фарм и магазины ивентов' : 'Upcoming banners, shop items & drop rates' }}
                    </p>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>

            <!-- Specialized Tactical Tools Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between px-1">
                <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {{ locale.currentLang === 'ru' ? 'Тактические инструменты' : 'Tactical Tools' }}
                </span>
                <span class="text-[9px] font-mono text-cyan-400">EXTENSIONS</span>
              </div>

              <!-- Tool 1: My Roster -->
              <button
                type="button"
                class="w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
                :class="currentTab === 'roster' ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'"
                @click="selectTab('roster')"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <UserCheck class="w-4.5 h-4.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>{{ locale.t('nav.roster') }}</span>
                      <span
                        v-if="roster.rosterCount > 0"
                        class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold"
                      >
                        {{ roster.rosterCount }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 truncate">{{ locale.t('nav.rosterDesc') }}</p>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <!-- Tool 2: Recruitment Solver -->
              <button
                type="button"
                class="w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
                :class="currentTab === 'recruitment' ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'"
                @click="selectTab('recruitment')"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Radio class="w-4.5 h-4.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>{{ locale.t('nav.recruitment') }}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        SOLVER
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 truncate">{{ locale.t('nav.recruitmentDesc') }}</p>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <!-- Tool 3: Wiki & Database -->
              <button
                type="button"
                class="w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
                :class="currentTab === 'wiki' ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/70 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900'"
                @click="selectTab('wiki')"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen class="w-4.5 h-4.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>{{ locale.t('nav.wiki') }}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold">
                        ARCHIVE
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 truncate">{{ locale.t('nav.wikiDesc') }}</p>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <!-- Tool 4: Gacha & Spark Calculator -->
              <button
                type="button"
                class="w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
                :class="currentTab === 'gacha' ? 'bg-amber-950/50 border-amber-500/50 shadow-md ring-1 ring-amber-500/30' : 'bg-slate-900/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'"
                @click="selectTab('gacha')"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles class="w-4.5 h-4.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>{{ locale.currentLang === 'ru' ? 'Крутки & Spark' : 'Gacha & Spark' }}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        PITY
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 truncate">
                      {{ locale.currentLang === 'ru' ? 'Калькулятор шансов, 300 Spark и симулятор' : 'Probability odds, 300 Spark & roll simulator' }}
                    </p>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>

            <!-- System & Configuration Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between px-1">
                <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {{ locale.currentLang === 'ru' ? 'Система и хранилище' : 'System & Storage' }}
                </span>
                <span class="text-[9px] font-mono text-slate-500">CONFIG</span>
              </div>

              <!-- Settings & Sync Button -->
              <button
                type="button"
                class="w-full p-3 rounded-2xl border bg-slate-900/70 border-slate-800 hover:border-slate-700 text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98] group"
                @click="openModalFromMenu('settings')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 group-hover:text-cyan-400 transition-colors">
                    <Settings class="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div class="font-bold text-xs text-slate-100">{{ locale.t('nav.settings') }}</div>
                    <p class="text-[11px] text-slate-400">
                      {{ locale.currentLang === 'ru' ? 'Yostar, ArkPRTS, Penguin Stats и сброс' : 'Yostar, ArkPRTS, Penguin Stats & Reset' }}
                    </p>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <!-- Language selector inside drawer -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <Globe class="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <div>
                    <div class="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>{{ locale.currentLang === 'ru' ? 'Язык интерфейса' : 'Interface Language' }}</span>
                      <span
                        v-if="auth.isAuthenticated"
                        class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80"
                        :title="locale.currentLang === 'ru' ? 'Синхронизируется с облаком Supabase' : 'Synchronized with Supabase Cloud'"
                      >
                        Cloud
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono">
                      {{ locale.currentLang === 'en' ? 'English (Default)' : 'Русский (RU)' }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl text-[10px] font-mono font-bold">
                  <button
                    v-for="lang in (['en', 'ru'] as AppLanguage[])"
                    :key="lang"
                    type="button"
                    class="px-2.5 py-1 rounded-lg transition-all uppercase"
                    :class="locale.currentLang === lang ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200 border border-transparent'"
                    @click="locale.setLanguage(lang)"
                  >
                    {{ lang }}
                  </button>
                </div>
              </div>

              <!-- Quick Backup Download -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <Download class="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <div>
                    <div class="font-bold text-xs text-slate-100">
                      {{ locale.currentLang === 'ru' ? 'Резервная копия' : 'Local Backup' }}
                    </div>
                    <div class="text-[11px] text-slate-400">ark_calc_backup.json</div>
                  </div>
                </div>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition-all active:scale-95"
                  @click="handleQuickBackup"
                >
                  {{ locale.currentLang === 'ru' ? 'Скачать' : 'Export' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Drawer Footer -->
          <div class="p-3.5 sm:p-4 bg-slate-900/70 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5" :class="pwa.isOnline ? 'text-cyan-400' : 'text-amber-400'" />
              <span>PRTS Terminal &bull; {{ pwa.isOnline ? 'ONLINE' : 'OFFLINE CACHE' }}</span>
            </div>
            <span class="text-slate-500 font-mono">PWA v4.2</span>
          </div>
        </aside>
      </Transition>
      </div>
    </Teleport>

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
