<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import { useInventoryStore } from '@/stores/inventory';
import ItemIcon from '@/components/common/ItemIcon.vue';
import {
  optimizeFarmingPlan,
  getAvailableStagesForItem,
  type OptimizerOptions,
  type OptimizedStageRoute,
} from '@/services/farmingOptimizerService';
import {
  Sparkles,
  Hammer,
  ArrowRight,
  ExternalLink,
  Layers,
  ChevronDown,
  Check,
  Minus,
  RotateCcw,
  AlertTriangle,
  PackageCheck,
  Globe,
} from 'lucide-vue-next';

const props = defineProps<{
  requirements: { itemId: string; count: number }[];
}>();

const emit = defineEmits<{
  (e: 'openGuide', itemId: string, count: number): void;
}>();

const locale = useLocaleStore();
const inventory = useInventoryStore();

// Optimizer settings state
const mode = ref<'synergy' | 'isolated'>('synergy');
// Default to 15 (Global / US Server story cap)
const maxChapter = ref<number>(15);
const prefer1_7 = ref<boolean>(true);
const isSettingsOpen = ref<boolean>(false);

// LocalStorage persistence for completed stage runs
const RUNS_STORAGE_KEY = 'ark_farming_route_runs_v2';
function loadSavedRuns(): Record<string, number> {
  try {
    const raw = localStorage.getItem(RUNS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveRunsToStorage(data: Record<string, number>) {
  try {
    localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const stageRunsDone = ref<Record<string, number>>(loadSavedRuns());

function getRouteKey(route: OptimizedStageRoute, index?: number): string {
  return `${route.stageCode}_${route.primaryDrop?.itemId || index || '0'}`;
}

function getRunsDone(routeKey: string): number {
  if (stageRunsDone.value[routeKey] !== undefined) {
    return stageRunsDone.value[routeKey];
  }
  // Backwards compatibility if key was stored as stageCode
  const stageCode = routeKey.split('_')[0];
  if (stageCode && stageRunsDone.value[stageCode] !== undefined) {
    return stageRunsDone.value[stageCode];
  }
  return 0;
}

function adjustRuns(routeKey: string, delta: number) {
  const current = getRunsDone(routeKey);
  const next = Math.max(0, current + delta);
  stageRunsDone.value = { ...stageRunsDone.value, [routeKey]: next };
  saveRunsToStorage(stageRunsDone.value);
}

function setRunsDirect(routeKey: string, val: number) {
  const next = Math.max(0, Math.floor(val || 0));
  stageRunsDone.value = { ...stageRunsDone.value, [routeKey]: next };
  saveRunsToStorage(stageRunsDone.value);
}

function toggleStageComplete(routeKey: string, totalNeeded: number) {
  const current = getRunsDone(routeKey);
  if (current >= totalNeeded) {
    stageRunsDone.value = { ...stageRunsDone.value, [routeKey]: 0 };
  } else {
    stageRunsDone.value = { ...stageRunsDone.value, [routeKey]: totalNeeded };
  }
  saveRunsToStorage(stageRunsDone.value);
}

function resetAllRuns() {
  stageRunsDone.value = {};
  saveRunsToStorage({});
}

const optimizationResult = computed(() => {
  const options: OptimizerOptions = {
    mode: mode.value,
    maxChapter: maxChapter.value,
    prefer1_7: prefer1_7.value,
  };
  return optimizeFarmingPlan(props.requirements, options);
});

// Check if any requirements cannot be farmed on story stages within the chosen maxChapter (e.g. Ch 17 items on Global)
const unfarmableStoryItems = computed(() => {
  return props.requirements.filter((req) => {
    if (!req.itemId || req.count <= 0) return false;
    const stages = getAvailableStagesForItem(req.itemId, { maxChapter: maxChapter.value });
    return stages.length === 0;
  });
});

// Total progress across all recommended routes
const totalPlannedRuns = computed(() => optimizationResult.value.totalRuns);
const totalCompletedRuns = computed(() => {
  let done = 0;
  for (let i = 0; i < optimizationResult.value.routes.length; i++) {
    const r = optimizationResult.value.routes[i];
    done += Math.min(r.recommendedRuns, getRunsDone(getRouteKey(r, i)));
  }
  return done;
});

const totalRemainingSanity = computed(() => {
  let remainingSanity = 0;
  for (let i = 0; i < optimizationResult.value.routes.length; i++) {
    const r = optimizationResult.value.routes[i];
    const leftRuns = Math.max(0, r.recommendedRuns - getRunsDone(getRouteKey(r, i)));
    remainingSanity += leftRuns * r.apCost;
  }
  return remainingSanity;
});

const overallProgressPercent = computed(() => {
  if (totalPlannedRuns.value <= 0) return 0;
  return Math.min(100, Math.round((totalCompletedRuns.value / totalPlannedRuns.value) * 100));
});

// Category filtering: all, story materials, chips & supplies
const activeFilter = ref<'all' | 'story' | 'chip'>('all');

const storyRoutesCount = computed(() => {
  return optimizationResult.value.routes.filter(
    (r) => r.stageType !== 'chip' && r.stageType !== 'supply' && r.chapter > 0
  ).length;
});

const chipRoutesCount = computed(() => {
  return optimizationResult.value.routes.filter(
    (r) => r.stageType === 'chip' || r.stageType === 'supply' || r.chapter === 0
  ).length;
});

const filteredRoutes = computed(() => {
  if (activeFilter.value === 'story') {
    return optimizationResult.value.routes.filter(
      (r) => r.stageType !== 'chip' && r.stageType !== 'supply' && r.chapter > 0
    );
  }
  if (activeFilter.value === 'chip') {
    return optimizationResult.value.routes.filter(
      (r) => r.stageType === 'chip' || r.stageType === 'supply' || r.chapter === 0
    );
  }
  return optimizationResult.value.routes;
});

function handleOpenGuide(itemId: string, count: number) {
  emit('openGuide', itemId, count);
}

function getDepotDescription(itemId: string): string {
  const stock = inventory.getStock(itemId);
  if (itemId === '30013') {
    const cubes = inventory.getStock('30012');
    const rocks = inventory.getStock('30011');
    const craftableT3 = Math.floor(cubes / 5) + Math.floor(rocks / 15);
    return `${stock} T3 (+${cubes} T2 камней ≈ ${craftableT3} T3)`;
  }
  if (itemId === '32001') {
    const certs = inventory.getStock('4006');
    if (certs > 0) {
      const craftable = Math.floor(certs / 90);
      return `${stock} шт. (${certs} серт. ≈ +${craftable} шт.)`;
    }
  }
  return `${stock} шт.`;
}

function getEstimatedGatheredText(stageCode: string, runsDone: number, dropRate: number): string {
  if (stageCode === '1-7') {
    const t3 = Math.floor(runsDone / 4);
    const t2 = Math.floor(runsDone * 1.25);
    return `~${t3} T3 (~${t2} T2 камней)`;
  }
  if (stageCode === 'AP-5') {
    const certs = Math.floor(runsDone * 21.5);
    const catalysts = Math.floor(certs / 90);
    return `~${catalysts} шт. (~${certs} серт.)`;
  }
  const count = Math.floor(runsDone * (dropRate / 100));
  return `~${count} шт.`;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header Control Bar: Mode Toggle & Settings -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Mode Switcher -->
        <div class="flex items-center gap-2">
          <div class="inline-flex bg-slate-900 p-1 rounded-xl border border-ark-border text-xs font-semibold">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              :class="[
                mode === 'synergy'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200',
              ]"
              @click="mode = 'synergy'"
            >
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>{{ locale.currentLang === 'ru' ? 'Мульти-фарм (Синергия)' : 'Synergy Multi-Farm' }}</span>
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                {{ locale.currentLang === 'ru' ? 'ТОП' : 'BEST' }}
              </span>
            </button>

            <button
              type="button"
              class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              :class="[
                mode === 'isolated'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200',
              ]"
              @click="mode = 'isolated'"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>{{ locale.currentLang === 'ru' ? 'Раздельный фарм' : 'Isolated Farm' }}</span>
            </button>
          </div>
        </div>

        <!-- Settings Dropdown Toggle & Server/Chapter Pill -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl border border-ark-border bg-slate-900/90 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 flex items-center gap-1.5 transition-all shadow-sm"
            @click="isSettingsOpen = !isSettingsOpen"
          >
            <Globe class="w-3.5 h-3.5 text-cyan-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Сервер и Главы' : 'Server & Chapters' }}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
              {{ maxChapter <= 15 ? 'Global (Ch. 15)' : `CN (Ch. ${maxChapter})` }}
            </span>
            <ChevronDown class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-180': isSettingsOpen }" />
          </button>
        </div>
      </div>

      <!-- Expandable Settings Panel -->
      <div v-if="isSettingsOpen" class="pt-3 border-t border-ark-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
        <!-- Server / Max Chapter Filter -->
        <div class="space-y-1.5">
          <label class="font-bold text-slate-300 flex items-center gap-1.5">
            <Globe class="w-3.5 h-3.5 text-cyan-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Сервер игры / Доступные главы:' : 'Game Server / Available Chapters:' }}</span>
          </label>
          <select
            v-model="maxChapter"
            class="w-full bg-slate-900 border border-ark-border rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
          >
            <option :value="15">
              {{ locale.currentLang === 'ru' ? '★ Global / US (Глава 15 — Официальный актуальный релиз)' : '★ Global / US (Chapter 15 — Current Official Release)' }}
            </option>
            <option :value="14">
              {{ locale.currentLang === 'ru' ? 'Global — До 14 главы включительно' : 'Global — Up to Chapter 14' }}
            </option>
            <option :value="10">
              {{ locale.currentLang === 'ru' ? 'Global — До 10 главы включительно' : 'Global — Up to Chapter 10' }}
            </option>
            <option :value="7">
              {{ locale.currentLang === 'ru' ? 'Global — До 7 главы (Середина сюжета)' : 'Global — Up to Chapter 7 (Mid-game)' }}
            </option>
            <option :value="4">
              {{ locale.currentLang === 'ru' ? 'Global — До 4 главы (Ранняя игра / Новичок)' : 'Global — Up to Chapter 4 (Early game)' }}
            </option>
            <option :value="17">
              {{ locale.currentLang === 'ru' ? 'CN Server (Китай — Главы 16-17)' : 'CN Server (China — Chapters 16-17)' }}
            </option>
          </select>
          <p class="text-[10px] text-slate-400">
            {{ locale.currentLang === 'ru'
              ? 'На Global сервере последняя глава — 15. Главы 16 и 17 доступны только на китайском (CN) сервере.'
              : 'On Global server, the latest available chapter is 15. Chapters 16 & 17 are only on the Chinese (CN) server.'
            }}
          </p>
        </div>

        <!-- 1-7 Preference Toggle -->
        <div class="space-y-1.5">
          <label class="font-bold text-slate-300 flex items-center gap-1.5">
            <span>{{ locale.currentLang === 'ru' ? 'Стадия 1-7 для орирока:' : 'Stage 1-7 for Orirock:' }}</span>
          </label>
          <label class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-ark-border cursor-pointer select-none">
            <input
              v-model="prefer1_7"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
            />
            <span class="text-slate-300 text-[11px] leading-snug">
              {{ locale.currentLang === 'ru' ? 'Использовать легендарную 1-7 (максимум орирока за Sanity)' : 'Use legendary 1-7 (maximum rock per Sanity)' }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- HERO SAVINGS BANNER (Only in Synergy Mode with active savings) -->
    <div
      v-if="mode === 'synergy' && optimizationResult.savings && optimizationResult.savings.sanitySaved > 0"
      class="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
    >
      <div class="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-900/70 border border-emerald-500/80 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-md">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm sm:text-base text-slate-100 font-sans">
                {{ locale.currentLang === 'ru' ? 'Выгода мульти-фарма с побочными дропами:' : 'Multi-Farm Byproduct Synergy Savings:' }}
              </h3>
              <span class="text-xs font-mono font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-600">
                -{{ optimizationResult.savings.percentageSaved }}% Sanity!
              </span>
            </div>
            <p class="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {{ locale.currentLang === 'ru'
                ? `Побочные дропы T2 материалов автоматически покрывают часть вашего плана прокачки. Вы экономите ${optimizationResult.savings.sanitySaved.toLocaleString()}⚡ Sanity (~${optimizationResult.savings.runsSaved} заходов, ~${optimizationResult.savings.daysSaved} дн.)!`
                : `Byproduct T2 drops automatically cover parts of your planned materials. You save ${optimizationResult.savings.sanitySaved.toLocaleString()}⚡ Sanity (~${optimizationResult.savings.runsSaved} runs, ~${optimizationResult.savings.daysSaved} days)!`
              }}
            </p>
          </div>
        </div>

        <!-- Stat Pills -->
        <div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-shrink-0">
          <div class="bg-slate-900/90 border border-ark-border rounded-xl px-3 py-2 text-center">
            <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{{ locale.currentLang === 'ru' ? 'Расход Sanity' : 'Total Sanity' }}</div>
            <div class="text-sm font-black font-mono text-emerald-300">~{{ optimizationResult.totalSanity.toLocaleString() }}⚡</div>
          </div>
          <div class="bg-slate-900/90 border border-ark-border rounded-xl px-3 py-2 text-center">
            <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{{ locale.currentLang === 'ru' ? 'Заходов' : 'Runs' }}</div>
            <div class="text-sm font-black font-mono text-cyan-300">~{{ optimizationResult.totalRuns.toLocaleString() }}</div>
          </div>
          <div class="bg-slate-900/90 border border-ark-border rounded-xl px-3 py-2 text-center">
            <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{{ locale.currentLang === 'ru' ? 'Попутный LMD' : 'Bonus LMD' }}</div>
            <div class="text-sm font-black font-mono text-amber-300">+{{ Math.round(optimizationResult.totalLmdGained / 1000) }}k</div>
          </div>
        </div>
      </div>
    </div>

    <!-- GLOBAL SERVER NOTICE FOR UNRELEASED CHAPTER ITEMS -->
    <div
      v-if="unfarmableStoryItems.length > 0"
      class="bg-amber-950/30 border border-amber-600/50 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3 shadow-sm"
    >
      <AlertTriangle class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div class="space-y-1">
        <strong class="font-bold text-amber-300 block">
          {{ locale.currentLang === 'ru'
            ? 'Предметы из невышедших глав (Главы 16-17):'
            : 'Materials from unreleased story chapters (Chapters 16-17):'
          }}
        </strong>
        <p class="text-slate-300 leading-relaxed">
          {{ locale.currentLang === 'ru'
            ? 'На Global сервере актуальный сюжет доступен только до 15 главы. Следующие предметы нельзя фармить на сюжетных картах Global, их можно получить только через крафт в Мастерской или награды событий:'
            : 'On Global server, story stages are only available up to Chapter 15. The following items cannot be farmed directly in Global story maps and should be obtained via Workshop crafting or event stores:'
          }}
        </p>
        <div class="flex items-center gap-2 pt-1 flex-wrap">
          <div
            v-for="unf in unfarmableStoryItems"
            :key="unf.itemId"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-700/60 font-mono text-xs text-amber-300"
          >
            <ItemIcon :item-id="unf.itemId" size="sm" :count="unf.count" />
            <span>&times;{{ unf.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- STAGE ROUTE PROGRESS OVERVIEW BAR -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex-1 min-w-0 space-y-1.5">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="text-slate-300 font-bold flex items-center gap-2">
            <PackageCheck class="w-4 h-4 text-cyan-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Общий прогресс фарма:' : 'Overall Farming Progress:' }}</span>
          </span>
          <span class="text-cyan-300 font-bold">
            {{ totalCompletedRuns }} / {{ totalPlannedRuns }} {{ locale.currentLang === 'ru' ? 'заходов' : 'runs' }} ({{ overallProgressPercent }}%)
          </span>
        </div>
        <!-- Overall Progress Track -->
        <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
            :style="{ width: `${overallProgressPercent}%` }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>
            {{ locale.currentLang === 'ru' ? 'Осталось Sanity:' : 'Remaining Sanity:' }}
            <strong class="text-amber-300 font-bold">~{{ totalRemainingSanity.toLocaleString() }} ⚡</strong>
          </span>
          <span v-if="totalPlannedRuns > totalCompletedRuns">
            {{ locale.currentLang === 'ru' ? 'Осталось заходов:' : 'Remaining runs:' }}
            <strong class="text-cyan-300 font-bold">~{{ (totalPlannedRuns - totalCompletedRuns).toLocaleString() }}</strong>
          </span>
          <span v-else class="text-emerald-400 font-bold">
            {{ locale.currentLang === 'ru' ? '✓ Все заходы выполнены!' : '✓ All runs completed!' }}
          </span>
        </div>
      </div>

      <!-- Reset Progress Button -->
      <button
        v-if="totalCompletedRuns > 0"
        type="button"
        class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-500/60 text-slate-400 hover:text-red-300 text-xs font-medium flex items-center gap-1.5 transition-all flex-shrink-0"
        @click="resetAllRuns"
        :title="locale.currentLang === 'ru' ? 'Сбросить все отмеченные заходы' : 'Reset all completed runs'"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>{{ locale.currentLang === 'ru' ? 'Сбросить прогресс' : 'Reset Progress' }}</span>
      </button>
    </div>

    <!-- STAGE ROUTE CHECKLIST (Карточки маршрута) -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <h3 class="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>
            {{ mode === 'synergy'
              ? (locale.currentLang === 'ru' ? 'Оптимальный маршрут фарма' : 'Optimized Farming Route')
              : (locale.currentLang === 'ru' ? 'Прямой маршрут фарма' : 'Direct Farming Route')
            }} ({{ optimizationResult.routes.length }})
          </span>
        </h3>

        <!-- Filter tabs: All, Story, Chips & Supplies -->
        <div v-if="chipRoutesCount > 0" class="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-ark-border/80 text-xs font-semibold">
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="activeFilter === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeFilter = 'all'"
          >
            {{ locale.currentLang === 'ru' ? 'Все' : 'All' }} ({{ optimizationResult.routes.length }})
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="activeFilter === 'story' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeFilter = 'story'"
          >
            {{ locale.currentLang === 'ru' ? 'Сюжет' : 'Story' }} ({{ storyRoutesCount }})
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg transition-all"
            :class="activeFilter === 'chip' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeFilter = 'chip'"
          >
            {{ locale.currentLang === 'ru' ? 'Фишки' : 'Chips' }} ({{ chipRoutesCount }})
          </button>
        </div>

        <span v-else class="text-xs text-slate-400 font-mono">
          {{ locale.currentLang === 'ru' ? 'Отмечайте заходы по мере прохождения' : 'Track runs as you complete them' }}
        </span>
      </div>

      <!-- Route Cards -->
      <div class="space-y-3">
        <div
          v-for="(route, idx) in filteredRoutes"
          :key="getRouteKey(route, idx)"
          class="bg-ark-card border rounded-2xl p-4 transition-all shadow-sm space-y-3.5"
          :class="[
            getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns
              ? 'border-emerald-700/60 bg-emerald-950/15'
              : 'border-ark-border hover:border-slate-600 bg-ark-card',
          ]"
        >
          <!-- Top Row: Stage Info, Target, Byproducts & Metrics -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <!-- Left: Stage Order, Code, Cost & Chapter -->
            <div class="flex items-center gap-3 min-w-[200px]">
              <button
                type="button"
                class="w-8 h-8 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm"
                :class="[
                  getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-900/50'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-300'
                ]"
                @click="toggleStageComplete(getRouteKey(route, idx), route.recommendedRuns)"
                :title="getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns
                  ? (locale.currentLang === 'ru' ? 'Снять отметку о завершении' : 'Unmark completed')
                  : (locale.currentLang === 'ru' ? 'Отметить стадию как завершенную (100%)' : 'Mark stage complete (100%)')
                "
              >
                <Check v-if="getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns" class="w-4 h-4 stroke-[3]" />
                <span v-else class="text-xs font-mono font-bold">{{ idx + 1 }}</span>
              </button>

              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-base font-black text-cyan-300">
                    {{ route.stageCode }}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                    {{ route.apCost }} ⚡
                  </span>
                  <span v-if="route.chapter > 0" class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
                    Ch. {{ route.chapter }}
                  </span>
                  <span v-else-if="route.stageType === 'chip'" class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700 text-purple-300 font-bold">
                    {{ locale.currentLang === 'ru' ? 'Рейд фишек' : 'Chip Raid' }}
                  </span>
                  <span v-else class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 font-bold">
                    {{ locale.currentLang === 'ru' ? 'Припасы' : 'Supplies' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-[11px] text-slate-400 font-medium">
                    {{ locale.currentLang === 'ru' ? route.tagRu : route.tagEn }}
                  </span>
                  <span
                    v-if="route.openDaysRu"
                    class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                    :class="[
                      route.isOpenToday
                        ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300'
                        : 'bg-slate-900 border border-slate-700 text-slate-400'
                    ]"
                  >
                    {{ route.isOpenToday ? (locale.currentLang === 'ru' ? '🟢 Открыто сегодня' : '🟢 Open Today') : (locale.currentLang === 'ru' ? `⏳ ${route.openDaysRu}` : `⏳ ${route.openDaysEn}`) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Middle: Primary Target with Depot Stock & Synergy Byproducts -->
            <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-4 py-2 border-y sm:border-y-0 sm:border-x border-ark-border/60 sm:px-4">
              <!-- Primary Target -->
              <div class="flex items-center gap-2.5 flex-shrink-0">
                <ItemIcon :item-id="route.primaryDrop.itemId" size="md" />
                <div>
                  <div class="text-[10px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                    {{ locale.currentLang === 'ru' ? 'Основная цель:' : 'Primary Target:' }}
                  </div>
                  <div class="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <span class="text-red-400 font-black">+{{ route.primaryDrop.targetCount }}</span>
                    <span class="text-slate-400 text-[10px]">({{ route.primaryDrop.dropRate }}%)</span>
                  </div>
                  <div class="text-[10px] text-emerald-400 font-mono mt-0.5" :title="locale.currentLang === 'ru' ? 'Текущий запас на складе (учитывается калькулятором)' : 'Current depot stock (calculated)'">
                    {{ locale.currentLang === 'ru' ? 'Склад:' : 'Depot:' }} {{ getDepotDescription(route.primaryDrop.itemId) }}
                  </div>
                </div>
              </div>

              <!-- Synergy Byproducts (If Any) -->
              <div v-if="route.synergyByproducts.length > 0" class="flex-1 min-w-0">
                <div class="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Sparkles class="w-3 h-3 text-amber-400" />
                  <span>{{ locale.currentLang === 'ru' ? 'Побочные дропы для плана:' : 'Byproducts for Plan:' }}</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <div
                    v-for="byp in route.synergyByproducts"
                    :key="byp.itemId"
                    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border text-[11px] font-mono"
                    :class="byp.isNeededInPlan ? 'border-emerald-600/80 text-emerald-300 bg-emerald-950/30' : 'border-slate-800 text-slate-400'"
                    :title="byp.isNeededInPlan ? (locale.currentLang === 'ru' ? 'Покрывает дефицит в вашем плане!' : 'Covers deficit in your plan!') : undefined"
                  >
                    <ItemIcon :item-id="byp.itemId" size="sm" />
                    <span class="font-bold">~{{ byp.count }}</span>
                    <span v-if="byp.convertedT3Count && byp.convertedT3Count > 0" class="text-[10px] text-amber-300 font-semibold">
                      (&rarr;{{ byp.convertedT3Count }} T3)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Planned Totals & Action Button -->
            <div class="flex items-center justify-between md:justify-end gap-3 min-w-[190px] flex-shrink-0">
              <div class="text-right font-mono">
                <div class="text-xs font-bold text-amber-300">
                  ~{{ route.totalSanity.toLocaleString() }} ⚡
                </div>
                <div class="text-[11px] text-slate-300 font-semibold">
                  ~{{ route.recommendedRuns.toLocaleString() }} {{ locale.currentLang === 'ru' ? 'заходов' : 'runs' }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium">
                  +{{ route.lmdGained.toLocaleString() }} LMD
                </div>
              </div>

              <!-- Stage Guide Button -->
              <button
                type="button"
                class="p-2 rounded-xl bg-slate-900 border border-ark-border hover:border-cyan-500 hover:text-cyan-300 text-slate-400 transition-all shadow-sm"
                @click="handleOpenGuide(route.primaryDrop.itemId, route.primaryDrop.targetCount)"
                :title="locale.currentLang === 'ru' ? 'Подробная статистика карты' : 'Detailed stage statistics'"
              >
                <ExternalLink class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Bottom Row: Interactive Run Tracking & Progress Bar -->
          <div class="pt-3 border-t border-ark-border/60 bg-slate-950/40 -mx-4 -mb-4 p-3.5 rounded-b-2xl space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <!-- Stepper Controls & Direct Input -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-semibold text-slate-300 mr-1 flex items-center gap-1">
                  <span>{{ locale.currentLang === 'ru' ? 'Заходов сделано:' : 'Runs completed:' }}</span>
                </span>

                <button
                  type="button"
                  class="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="getRunsDone(getRouteKey(route, idx)) <= 0"
                  @click="adjustRuns(getRouteKey(route, idx), -1)"
                  title="-1"
                >
                  <Minus class="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min="0"
                  :max="route.recommendedRuns * 3"
                  :value="getRunsDone(getRouteKey(route, idx))"
                  @input="(e: Event) => setRunsDirect(getRouteKey(route, idx), Number((e.target as HTMLInputElement).value))"
                  class="w-16 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg py-1 px-2 text-center text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                />

                <button
                  type="button"
                  class="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/80 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold transition-all"
                  @click="adjustRuns(getRouteKey(route, idx), 1)"
                  title="+1"
                >
                  +1
                </button>
                <button
                  type="button"
                  class="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/80 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold transition-all"
                  @click="adjustRuns(getRouteKey(route, idx), 5)"
                  title="+5"
                >
                  +5
                </button>
                <button
                  type="button"
                  class="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/80 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold transition-all"
                  @click="adjustRuns(getRouteKey(route, idx), 10)"
                  title="+10"
                >
                  +10
                </button>

                <!-- 100% Complete Button -->
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ml-1"
                  :class="[
                    getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns
                      ? 'bg-emerald-900/60 border border-emerald-600 text-emerald-300'
                      : 'bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-300'
                  ]"
                  @click="toggleStageComplete(getRouteKey(route, idx), route.recommendedRuns)"
                >
                  <Check class="w-3 h-3 stroke-[3]" />
                  <span>{{ getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns ? (locale.currentLang === 'ru' ? 'Готово' : 'Done') : (locale.currentLang === 'ru' ? 'Завершить' : 'Finish') }}</span>
                </button>
              </div>

              <!-- Remaining Runs & Sanity -->
              <div class="text-right text-xs font-mono">
                <div v-if="getRunsDone(getRouteKey(route, idx)) < route.recommendedRuns" class="text-slate-300">
                  <span>{{ locale.currentLang === 'ru' ? 'Осталось:' : 'Remaining:' }} </span>
                  <strong class="text-cyan-300 font-bold">~{{ route.recommendedRuns - getRunsDone(getRouteKey(route, idx)) }} {{ locale.currentLang === 'ru' ? 'заходов' : 'runs' }}</strong>
                  <span class="text-amber-300 ml-1.5 font-bold">(~{{ (route.recommendedRuns - getRunsDone(getRouteKey(route, idx))) * route.apCost }}⚡)</span>
                </div>
                <div v-else class="text-emerald-400 font-bold flex items-center sm:justify-end gap-1">
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                  <span>{{ locale.currentLang === 'ru' ? 'План по стадии выполнен!' : 'Stage completed!' }}</span>
                </div>
              </div>
            </div>

            <!-- Stage Progress Bar Track -->
            <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                class="h-full transition-all duration-300 rounded-full"
                :class="[
                  getRunsDone(getRouteKey(route, idx)) >= route.recommendedRuns
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                ]"
                :style="{
                  width: `${Math.min(100, Math.round((getRunsDone(getRouteKey(route, idx)) / Math.max(1, route.recommendedRuns)) * 100))}%`
                }"
              ></div>
            </div>

            <!-- Progress Details & Gathered Counter -->
            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>
                {{ locale.currentLang === 'ru' ? 'Прогресс:' : 'Progress:' }}
                <strong class="text-slate-200">
                  {{ Math.min(100, Math.round((getRunsDone(getRouteKey(route, idx)) / Math.max(1, route.recommendedRuns)) * 100)) }}%
                </strong>
                ({{ getRunsDone(getRouteKey(route, idx)) }} / {{ route.recommendedRuns }})
              </span>

              <span v-if="getRunsDone(getRouteKey(route, idx)) > 0" class="text-emerald-400">
                {{ locale.currentLang === 'ru' ? 'Добыто за заходы:' : 'Gathered from runs:' }}
                <strong class="text-emerald-300">{{ getEstimatedGatheredText(route.stageCode, getRunsDone(getRouteKey(route, idx)), route.primaryDrop.dropRate) }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WORKSHOP SYNTHESIS SUGGESTIONS (Синтез побочных дропов в Мастерской) -->
    <div
      v-if="mode === 'synergy' && optimizationResult.workshopCrafts.length > 0"
      class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm space-y-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-300">
            <Hammer class="w-4 h-4" />
          </div>
          <div>
            <h4 class="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
              <span>{{ locale.currentLang === 'ru' ? 'Синтез побочных дропов в Мастерской' : 'Workshop Synthesis of Byproducts' }}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                {{ optimizationResult.workshopCrafts.length }} {{ locale.currentLang === 'ru' ? 'рецептов' : 'recipes' }}
              </span>
            </h4>
            <p class="text-[11px] text-slate-400">
              {{ locale.currentLang === 'ru'
                ? 'Объедините выпавшие побочные T2 ресурсы после фарма, чтобы покрыть нехватку T3 материалов в плане прокачки:'
                : 'Combine dropped T2 byproducts after farming to cover the T3 deficits in your upgrade plan:'
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        <div
          v-for="craft in optimizationResult.workshopCrafts"
          :key="craft.t2ItemId"
          class="p-2.5 rounded-xl bg-slate-900/80 border border-ark-border flex items-center justify-between text-xs font-mono shadow-sm"
        >
          <div class="flex items-center gap-2">
            <ItemIcon :item-id="craft.t2ItemId" size="sm" :count="craft.t2Count" />
            <span class="text-slate-400 font-bold">&times;{{ craft.t2Count }}</span>
          </div>

          <div class="flex items-center gap-1.5 text-purple-400 font-bold">
            <ArrowRight class="w-3.5 h-3.5" />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">+{{ craft.t3Produced }}</span>
            <ItemIcon :item-id="craft.t3ItemId" size="sm" :count="craft.t3Produced" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
