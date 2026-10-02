<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useRosterStore } from '@/stores/roster';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore, type AppLanguage } from '@/stores/locale';
import OperatorSelector from '@/components/operator/OperatorSelector.vue';
import RosterView from '@/components/roster/RosterView.vue';
import WikiView from '@/components/wiki/WikiView.vue';
import RecruitmentView from '@/components/recruitment/RecruitmentView.vue';
import InventoryGrid from '@/components/inventory/InventoryGrid.vue';
import ResourceSummary from '@/components/calculator/ResourceSummary.vue';
import EventsView from '@/components/events/EventsView.vue';
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
  ChevronDown,
  ShieldCheck,
  Flame,
  Globe,
} from 'lucide-vue-next';

const gameData = useGameDataStore();
const inventory = useInventoryStore();
const planner = usePlannerStore();
const roster = useRosterStore();
const auth = useAuthStore();
const locale = useLocaleStore();

type TabType = 'operators' | 'roster' | 'inventory' | 'calculator' | 'events' | 'recruitment' | 'wiki';
const currentTab = ref<TabType>('operators');
const isSettingsOpen = ref<boolean>(false);
const isAuthModalOpen = ref<boolean>(false);
const isMobileMenuOpen = ref<boolean>(false);
const isToolsDropdownOpen = ref<boolean>(false);

const isToolsTabActive = computed(() => ['roster', 'recruitment', 'wiki'].includes(currentTab.value));

const activeToolLabel = computed(() => {
  if (currentTab.value === 'roster') return locale.t('nav.roster');
  if (currentTab.value === 'recruitment') return locale.t('nav.recruitment');
  if (currentTab.value === 'wiki') return locale.t('nav.wiki');
  return locale.t('nav.tools');
});

function selectTab(tab: TabType) {
  currentTab.value = tab;
  isToolsDropdownOpen.value = false;
  isMobileMenuOpen.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleToolsDropdown() {
  isToolsDropdownOpen.value = !isToolsDropdownOpen.value;
}

function openModalFromMenu(modal: 'settings' | 'auth') {
  isMobileMenuOpen.value = false;
  if (modal === 'settings') {
    isSettingsOpen.value = true;
  } else {
    isAuthModalOpen.value = true;
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (target && !target.closest('#tools-dropdown-container')) {
    isToolsDropdownOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ark-dark text-slate-100 selection:bg-cyan-500 selection:text-slate-950 bg-tactical-grid relative">
    <!-- Ambient Background Neon Gradients -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/[0.04] rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/[0.03] rounded-full blur-3xl"></div>
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

        <!-- Desktop Segmented Command Dock (Streamlined to 4 core tabs + Archive Dropdown) -->
        <nav class="hidden md:flex items-center bg-slate-950/80 border border-slate-800/90 p-1 rounded-2xl shadow-inner text-xs font-semibold gap-0.5">
          <!-- 1. Operators Tab -->
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
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
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

          <!-- 3. Events & Schedule Tab -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative"
            :class="[
              currentTab === 'events'
                ? 'bg-gradient-to-r from-amber-500/25 to-cyan-500/20 text-amber-300 border border-amber-400/50 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
            ]"
            @click="selectTab('events')"
          >
            <Flame class="w-3.5 h-3.5 text-amber-400" />
            <span>{{ locale.t('nav.events') }}</span>
          </button>

          <!-- 4. Inventory / Depot Tab -->
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
            <Package class="w-3.5 h-3.5" :class="currentTab === 'inventory' ? 'text-cyan-400' : 'text-slate-400'" />
            <span>{{ locale.t('nav.inventory') }}</span>
            <span
              v-if="Object.keys(inventory.stock).length > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 leading-tight"
            >
              {{ Object.keys(inventory.stock).length }}
            </span>
          </button>

          <!-- Divider -->
          <div class="h-4 w-px bg-slate-800 mx-1"></div>

          <!-- 5. Archive & Tools Dropdown Menu -->
          <div id="tools-dropdown-container" class="relative">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative select-none"
              :class="[
                isToolsTabActive || isToolsDropdownOpen
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
              ]"
              @click.stop="toggleToolsDropdown"
            >
              <Layers class="w-3.5 h-3.5" :class="isToolsTabActive ? 'text-cyan-300' : 'text-slate-400'" />
              <span>{{ isToolsTabActive ? activeToolLabel : locale.t('nav.tools') }}</span>
              <ChevronDown
                class="w-3 h-3 transition-transform duration-200"
                :class="{ 'rotate-180 text-cyan-300': isToolsDropdownOpen }"
              />
              <span
                v-if="!isToolsTabActive && roster.rosterCount > 0"
                class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                title="Roster active"
              ></span>
            </button>

            <!-- Floating Glassmorphic Dropdown Popover -->
            <div
              v-if="isToolsDropdownOpen"
              class="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 prts-glow"
            >
              <div class="px-2.5 py-1.5 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Rhodes Island Tools</span>
                <span class="text-[9px] font-mono text-slate-500">PRTS // EXT</span>
              </div>

              <!-- Option 1: Roster -->
              <button
                type="button"
                class="w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all"
                :class="currentTab === 'roster' ? 'bg-cyan-950/60 border border-cyan-500/40 text-slate-100 shadow-sm' : 'hover:bg-slate-900 border border-transparent text-slate-300 hover:text-white'"
                @click="selectTab('roster')"
              >
                <div class="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <UserCheck class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold">{{ locale.t('nav.roster') }}</span>
                    <span
                      v-if="roster.rosterCount > 0"
                      class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold"
                    >
                      {{ roster.rosterCount }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 truncate">{{ locale.t('nav.rosterDesc') }}</p>
                </div>
              </button>

              <!-- Option 2: Recruitment Solver -->
              <button
                type="button"
                class="w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all"
                :class="currentTab === 'recruitment' ? 'bg-cyan-950/60 border border-cyan-500/40 text-slate-100 shadow-sm' : 'hover:bg-slate-900 border border-transparent text-slate-300 hover:text-white'"
                @click="selectTab('recruitment')"
              >
                <div class="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Radio class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold">{{ locale.t('nav.recruitment') }}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                      TAGS
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 truncate">{{ locale.t('nav.recruitmentDesc') }}</p>
                </div>
              </button>

              <!-- Option 3: Wiki & Operator Archive -->
              <button
                type="button"
                class="w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all"
                :class="currentTab === 'wiki' ? 'bg-cyan-950/60 border border-cyan-500/40 text-slate-100 shadow-sm' : 'hover:bg-slate-900 border border-transparent text-slate-300 hover:text-white'"
                @click="selectTab('wiki')"
              >
                <div class="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <BookOpen class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold">{{ locale.t('nav.wiki') }}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold">
                      DATABASE
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 truncate">{{ locale.t('nav.wikiDesc') }}</p>
                </div>
              </button>
            </div>
          </div>
        </nav>

        <!-- Right Action Capsule: Quick Language Switcher, Cloud Sync & Settings -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Desktop Language Quick Selector -->
          <div class="hidden lg:flex items-center bg-slate-950/90 border border-slate-800 p-0.5 rounded-xl text-[10px] font-mono font-bold shadow-inner">
            <button
              v-for="lang in (['en', 'ru'] as AppLanguage[])"
              :key="lang"
              type="button"
              class="px-2.5 py-1 rounded-lg transition-all uppercase"
              :class="locale.currentLang === lang ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200 border border-transparent'"
              @click="locale.setLanguage(lang)"
            >
              {{ lang }}
            </button>
          </div>

          <!-- Cloud Sync Status Pill -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-95"
            :class="[
              auth.isAuthenticated
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40',
            ]"
            :title="auth.isAuthenticated ? (auth.isSyncing ? 'PRTS Cloud Syncing...' : 'PRTS Cloud: ' + auth.userEmail) : 'PRTS Cloud: Login'"
            @click="isAuthModalOpen = true"
          >
            <RefreshCw v-if="auth.isSyncing" class="w-4 h-4 text-cyan-400 animate-spin" />
            <Cloud v-else class="w-4 h-4" :class="auth.isAuthenticated ? 'text-emerald-400' : 'text-cyan-400'" />
            <span class="hidden sm:inline font-mono">
              {{ auth.isSyncing ? 'Syncing...' : (auth.isAuthenticated ? 'Cloud' : 'Login') }}
            </span>
            <span
              v-if="auth.isAuthenticated && !auth.isSyncing"
              class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              title="Cloud Connected"
            ></span>
          </button>

          <!-- Settings Button -->
          <button
            type="button"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shadow-sm active:scale-95"
            title="Settings & Backup"
            @click="isSettingsOpen = true"
          >
            <Settings class="w-4 h-4" />
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

    <!-- Mobile Bottom Navigation Dock (5 slots: Operators, Calculator, Events, Depot, Menu) -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 6px);"
    >
      <div class="grid grid-cols-5 h-14 items-center">
        <!-- 1: Operators -->
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
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.operators') }}</span>
          <span
            v-if="currentTab === 'operators' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 2: Calculator -->
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
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.calculator') }}</span>
          <span
            v-if="currentTab === 'calculator' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 3: Events -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="currentTab === 'events' && !isMobileMenuOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="selectTab('events')"
        >
          <div class="relative">
            <Flame class="w-5 h-5" />
          </div>
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.events') }}</span>
          <span
            v-if="currentTab === 'events' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          ></span>
        </button>

        <!-- 4: Depot (Inventory) -->
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
          <span class="text-[10px] tracking-tight">{{ locale.t('nav.inventory') }}</span>
          <span
            v-if="currentTab === 'inventory' && !isMobileMenuOpen"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>

        <!-- 5: Menu (Drawer) -->
        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 py-1 relative transition-colors h-full"
          :class="isMobileMenuOpen || isToolsTabActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <div class="relative">
            <LayoutGrid class="w-5 h-5" />
            <span
              v-if="roster.rosterCount > 0"
              class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"
            ></span>
          </div>
          <span class="text-[10px] tracking-tight">Menu</span>
          <span
            v-if="isMobileMenuOpen || isToolsTabActive"
            class="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          ></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Drawer / Bottom Sheet -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
      @click.self="isMobileMenuOpen = false"
    >
      <div
        class="bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-8 prts-glow"
      >
        <!-- Sheet Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Layers class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-slate-100 text-sm">PRTS Navigation Hub</h3>
              <p class="text-[10px] text-slate-400 font-mono">Tools, Archives &amp; Configuration</p>
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

        <!-- Quick Language Switcher for Mobile -->
        <div class="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
          <div class="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Globe class="w-4 h-4 text-cyan-400" />
            <span>Language</span>
          </div>
          <div class="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[10px] font-mono font-bold">
            <button
              v-for="lang in (['en', 'ru'] as AppLanguage[])"
              :key="lang"
              type="button"
              class="px-3 py-1 rounded transition-all uppercase"
              :class="locale.currentLang === lang ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'"
              @click="locale.setLanguage(lang)"
            >
              {{ lang }}
            </button>
          </div>
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
                <div class="font-bold text-xs text-slate-100">{{ locale.t('nav.roster') }}</div>
                <div class="text-[11px] text-slate-400 truncate">
                  {{ roster.rosterCount > 0 ? `${roster.rosterCount} operators registered` : locale.t('nav.rosterDesc') }}
                </div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 2. Recruitment Solver -->
          <button
            type="button"
            class="p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
            :class="currentTab === 'recruitment' ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'"
            @click="selectTab('recruitment')"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-700/60 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Radio class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-xs text-slate-100">{{ locale.t('nav.recruitment') }}</div>
                <div class="text-[11px] text-slate-400 truncate">{{ locale.t('nav.recruitmentDesc') }}</div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 3. Вики & Справочник -->
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
                <div class="font-bold text-xs text-slate-100">{{ locale.t('nav.wiki') }}</div>
                <div class="text-[11px] text-slate-400 truncate">{{ locale.t('nav.wikiDesc') }}</div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 4. Облачный аккаунт -->
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
                  <span>{{ locale.t('nav.cloudSync') }}</span>
                  <span
                    v-if="auth.isAuthenticated"
                    class="w-2 h-2 rounded-full bg-emerald-400"
                  ></span>
                </div>
                <div class="text-[11px] text-slate-400 truncate">
                  {{ auth.isAuthenticated ? auth.userEmail : 'Sync across your devices' }}
                </div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>

          <!-- 5. Настройки & Импорт -->
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
                <div class="font-bold text-xs text-slate-100">{{ locale.t('nav.settings') }}</div>
                <div class="text-[11px] text-slate-400 truncate">Sync, backup, language &amp; storage</div>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500 flex-shrink-0" />
          </button>
        </div>

        <!-- System status info -->
        <div class="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-cyan-400" />
            <span>PRTS Terminal &bull; Local-First</span>
          </div>
          <span class="text-slate-500">Live CDN Sync</span>
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
