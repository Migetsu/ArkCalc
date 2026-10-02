<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import { useInventoryStore } from '@/stores/inventory';
import { ARKNIGHTS_EVENTS, type ArknightsEvent } from '@/data/eventsData';
import {
  convertResourcesToPulls,
  calculateGachaOdds,
  calculateIncomeForecast,
  simulateTenPull,
  type BannerType,
  type SimulatedPullItem,
} from '@/services/gachaCalculatorService';
import {
  Sparkles,
  Percent,
  Calendar,
  Flame,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Wallet,
  ShieldCheck,
  Target,
} from 'lucide-vue-next';

const locale = useLocaleStore();
const inventory = useInventoryStore();

// ─── Current Pull Currency Inputs ─────────────────────────────────────────
const orundum = ref<number>(18000);
const originiumPrime = ref<number>(35);
const singleTickets = ref<number>(5);
const tenTickets = ref<number>(1);
const currentPity = ref<number>(0);

// Auto-fill from inventory if available
function fillFromDepot() {
  const stockOrundum = inventory.getStock('4003');
  const stockOp = inventory.getStock('4002');
  const stockSingle = inventory.getStock('7001');
  const stockTen = inventory.getStock('7002');

  if (stockOrundum > 0) orundum.value = stockOrundum;
  if (stockOp > 0) originiumPrime.value = stockOp;
  if (stockSingle > 0) singleTickets.value = stockSingle;
  if (stockTen > 0) tenTickets.value = stockTen;
}

const convertedPulls = computed(() =>
  convertResourcesToPulls({
    orundum: orundum.value,
    originiumPrime: originiumPrime.value,
    singleTickets: singleTickets.value,
    tenTickets: tenTickets.value,
  }),
);

// ─── Modes Switcher ───────────────────────────────────────────────────────
type PlannerMode = 'target_banner' | 'odds_calculator' | 'simulator';
const activeMode = ref<PlannerMode>('target_banner');

// ─── Mode 1: Target Banner & Forecast ─────────────────────────────────────
const selectedEventId = ref<string>(
  ARKNIGHTS_EVENTS.find((e) => e.status === 'upcoming_global')?.id || ARKNIGHTS_EVENTS[0]?.id || '',
);

const selectedEvent = computed<ArknightsEvent>(() =>
  ARKNIGHTS_EVENTS.find((e) => e.id === selectedEventId.value) || ARKNIGHTS_EVENTS[0],
);

// Estimate weeks left until banner arrival
const weeksUntilEvent = computed(() => {
  const ev = selectedEvent.value;
  if (!ev) return 6;
  if (ev.globalStartDate) {
    const diffDays = Math.max(1, Math.round((new Date(ev.globalStartDate).getTime() - Date.now()) / (1000 * 3600 * 24)));
    return Math.max(1, Math.round(diffDays / 7));
  }
  return 8;
});

// Income Preset Profile
type IncomePreset = 'f2p' | 'monthly_card' | 'all_in';
const incomePreset = ref<IncomePreset>('monthly_card');

const hasMonthlyCard = computed(() => incomePreset.value === 'monthly_card' || incomePreset.value === 'all_in');
const buyGreenCertTickets = computed(() => incomePreset.value === 'all_in');
const opFromEvents = ref<number>(25);

const forecastResult = computed(() =>
  calculateIncomeForecast({
    weeks: weeksUntilEvent.value,
    hasMonthlyCard: hasMonthlyCard.value,
    clearAnnihilation: true,
    completeDailies: true,
    completeWeeklies: true,
    buyGreenCertTickets: buyGreenCertTickets.value,
    opFromEvents: opFromEvents.value,
  }),
);

// Target banner type detection
const detectedBannerType = computed<BannerType>(() => {
  const ev = selectedEvent.value;
  if (!ev) return 'limited';
  if (ev.headerTagEn.toLowerCase().includes('limited') || ev.headerTagEn.toLowerCase().includes('carnival') || ev.headerTagEn.toLowerCase().includes('celebration')) {
    return 'limited';
  }
  if (ev.sixStarOps.length === 1) {
    return 'standard_solo';
  }
  return 'standard_dual';
});

const totalProjectedPulls = computed(() =>
  convertedPulls.value.totalPulls + forecastResult.value.totalPullsGained,
);

const projectedOddsResult = computed(() =>
  calculateGachaOdds(totalProjectedPulls.value, detectedBannerType.value, currentPity.value),
);

// ─── Mode 2: Manual Pulls Odds Calculator ──────────────────────────────────
const manualPullsSlider = ref<number>(100);
const manualBannerType = ref<BannerType>('limited');

const manualOddsResult = computed(() =>
  calculateGachaOdds(manualPullsSlider.value, manualBannerType.value, currentPity.value),
);

function setSliderToCurrentPulls() {
  manualPullsSlider.value = Math.max(1, Math.min(300, convertedPulls.value.totalPulls));
}

// ─── Mode 3: Pull Simulator ───────────────────────────────────────────────
const simPity = ref<number>(0);
const simTotalPulls = ref<number>(0);
const simSixStarCount = ref<number>(0);
const simRateUpCount = ref<number>(0);
const lastTenPull = ref<SimulatedPullItem[]>([]);

function doTenPull() {
  const targetName = selectedEvent.value?.sixStarOps?.[0]?.name || 'Target 6★';
  const res = simulateTenPull(detectedBannerType.value, simPity.value, targetName);
  simPity.value = res.finalPity;
  simTotalPulls.value += 10;
  lastTenPull.value = res.items;

  for (const item of res.items) {
    if (item.rarity === 6) {
      simSixStarCount.value++;
      if (item.isRateUp) simRateUpCount.value++;
    }
  }
}

function resetSim() {
  simPity.value = 0;
  simTotalPulls.value = 0;
  simSixStarCount.value = 0;
  simRateUpCount.value = 0;
  lastTenPull.value = [];
}

// ─── Rules / FAQ Accordion ────────────────────────────────────────────────
const isFaqOpen = ref<boolean>(false);
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Top Header: Clear & Friendly PRTS Terminal -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-sm">
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wider">
                {{ locale.currentLang === 'ru' ? 'Планировщик баннеров и круток' : 'Headhunting & Spark Planner' }}
              </h2>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                PITY &amp; SPARK
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              {{
                locale.currentLang === 'ru'
                  ? 'Узнайте точный шанс выбить оператора, успеете ли накопить к баннеру и хватит ли на 300 Spark (гарант).'
                  : 'Calculate your exact odds, see how many pulls you will save by banner arrival, and track 300 Spark guarantee.'
              }}
            </p>
          </div>
        </div>

        <!-- 3 Primary Mode Switchers -->
        <div class="inline-flex bg-slate-900 p-1 rounded-xl border border-ark-border text-xs font-semibold self-start md:self-auto flex-wrap sm:flex-nowrap gap-1">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
            :class="activeMode === 'target_banner' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'"
            @click="activeMode = 'target_banner'"
          >
            <Target class="w-4 h-4" />
            <span>{{ locale.currentLang === 'ru' ? 'Хватит ли на баннер?' : 'Will I get the operator?' }}</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
            :class="activeMode === 'odds_calculator' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'"
            @click="activeMode = 'odds_calculator'"
          >
            <Percent class="w-4 h-4" />
            <span>{{ locale.currentLang === 'ru' ? 'Шансы от круток' : 'Odds by Pull Count' }}</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
            :class="activeMode === 'simulator' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'"
            @click="activeMode = 'simulator'"
          >
            <Flame class="w-4 h-4" />
            <span>{{ locale.currentLang === 'ru' ? 'Симулятор удачи' : 'Roll Simulator' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── STEP 1: YOUR SAVINGS PANEL (Ultra-Clear Currency Inputs) ─── -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <!-- Title & Grand Total Pill -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ark-border/80">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">1</span>
            <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wide">
              {{ locale.currentLang === 'ru' ? 'Сколько у вас ресурсов прямо сейчас?' : 'Your Current Pull Resources' }}
            </h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5 ml-8">
            {{
              locale.currentLang === 'ru'
                ? 'Введите ваши накопления валюты (или заполните со склада). Система автоматически пересчитает всё в крутки.'
                : 'Enter your currencies below. The system automatically converts everything into total pulls.'
            }}
          </p>
        </div>

        <!-- Grand Total Pulls Banner -->
        <div class="flex items-center gap-3 self-end sm:self-auto bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/50 px-4 py-2 rounded-2xl shadow-sm">
          <div>
            <div class="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              {{ locale.currentLang === 'ru' ? 'Итого у вас:' : 'Your Total Pulls:' }}
            </div>
            <div class="text-2xl font-black font-mono text-white leading-none mt-0.5">
              {{ convertedPulls.totalPulls }}
              <span class="text-xs font-normal text-cyan-300 font-sans ml-1">
                {{ locale.currentLang === 'ru' ? 'круток' : 'pulls' }}
              </span>
            </div>
          </div>
          <div class="h-8 w-px bg-cyan-800/60 hidden sm:block"></div>
          <div class="text-[11px] font-mono text-slate-400 hidden sm:block">
            <div>~{{ (convertedPulls.totalPulls * 600).toLocaleString() }} Orundum</div>
            <div>~{{ Math.round((convertedPulls.totalPulls * 600) / 180) }} OP</div>
          </div>
        </div>
      </div>

      <!-- 4 Currency Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- 1. Orundum -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-400"></span>
              Orundum (Орундум)
            </span>
            <span class="text-[11px] font-mono text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              = {{ convertedPulls.orundumPulls }} кр.
            </span>
          </div>
          <div class="relative">
            <input
              v-model.number="orundum"
              type="number"
              min="0"
              step="600"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-red-500"
            />
          </div>
          <div class="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span class="text-slate-500">Быстро:</span>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="orundum += 600">+1 кр. (600)</button>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="orundum += 6000">+10 кр.</button>
          </div>
        </div>

        <!-- 2. Originium Prime (OP) -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Orig. Prime (OP)
            </span>
            <span class="text-[11px] font-mono text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              = {{ convertedPulls.opPulls }} кр.
            </span>
          </div>
          <div class="relative">
            <input
              v-model.number="originiumPrime"
              type="number"
              min="0"
              step="1"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div class="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span class="text-slate-500">Быстро:</span>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="originiumPrime += 10">+10 OP</button>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="originiumPrime += 50">+50 OP</button>
          </div>
        </div>

        <!-- 3. Single Headhunting Tickets -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              Билеты (1x)
            </span>
            <span class="text-[11px] font-mono text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              = {{ singleTickets }} кр.
            </span>
          </div>
          <div class="relative">
            <input
              v-model.number="singleTickets"
              type="number"
              min="0"
              step="1"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div class="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span class="text-slate-500">Быстро:</span>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="singleTickets += 1">+1</button>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="singleTickets += 5">+5</button>
          </div>
        </div>

        <!-- 4. 10x Headhunting Tickets -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-purple-400"></span>
              Билеты (10x)
            </span>
            <span class="text-[11px] font-mono text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
              = {{ tenTickets * 10 }} кр.
            </span>
          </div>
          <div class="relative">
            <input
              v-model.number="tenTickets"
              type="number"
              min="0"
              step="1"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div class="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span class="text-slate-500">Быстро:</span>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="tenTickets += 1">+1 (10 кр.)</button>
            <button type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200" @click="tenTickets += 2">+2 (20 кр.)</button>
          </div>
        </div>
      </div>

      <!-- Quick Fill from Depot button & Current Pity Counter -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 transition-all flex items-center gap-2 self-start"
          @click="fillFromDepot"
        >
          <Wallet class="w-3.5 h-3.5 text-cyan-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Заполнить из моего Склада' : 'Load from My Depot' }}</span>
        </button>

        <!-- Current Pity Slider -->
        <div class="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-ark-border">
          <span class="text-slate-400 text-xs">
            {{ locale.currentLang === 'ru' ? 'Круток без 6★ (Pity):' : 'Current Pity:' }}
          </span>
          <span class="font-mono font-bold text-cyan-400 text-sm min-w-[20px]">{{ currentPity }}</span>
          <input
            v-model.number="currentPity"
            type="range"
            min="0"
            max="70"
            step="1"
            class="w-24 sm:w-32 accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>
    </div>

    <!-- ─── MODE 1: WILL I GET THE OPERATOR? (Banner Planner & Forecast) ─── -->
    <div v-if="activeMode === 'target_banner'" class="space-y-6">
      <!-- Step 2: Banner Selection -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-ark-border/80">
          <span class="w-6 h-6 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">2</span>
          <div>
            <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wide">
              {{ locale.currentLang === 'ru' ? 'На кого копим? Выберите целевой баннер:' : 'Select Target Banner:' }}
            </h3>
            <p class="text-xs text-slate-400">
              {{ locale.currentLang === 'ru' ? 'Нажмите на интересующий вас будущий баннер из расписания Global:' : 'Pick an upcoming banner to calculate savings and odds:' }}
            </p>
          </div>
        </div>

        <!-- Banner Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="ev in ARKNIGHTS_EVENTS.slice(0, 6)"
            :key="ev.id"
            type="button"
            class="p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all relative overflow-hidden"
            :class="[
              selectedEventId === ev.id
                ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700',
            ]"
            @click="selectedEventId = ev.id"
          >
            <!-- Poster Thumbnail -->
            <img
              :src="ev.bannerPosterUrl"
              :alt="ev.nameEn"
              class="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
              @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
            />
            <div class="min-w-0 flex-1">
              <div class="font-bold text-xs text-slate-100 truncate">
                {{ locale.currentLang === 'ru' ? ev.nameRu : ev.nameEn }}
              </div>
              <div class="text-[11px] text-amber-300 font-semibold truncate mt-0.5">
                ★ {{ ev.sixStarOps.map((o) => o.name).join(', ') }}
              </div>
              <div class="text-[10px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                <Calendar class="w-3 h-3" />
                <span>{{ ev.globalEstimatedArrival || 'Скоро' }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Step 3: Income Preset Profile -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-ark-border/80">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">3</span>
            <div>
              <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wide">
                {{ locale.currentLang === 'ru' ? 'Ваш профиль накоплений' : 'Income Savings Profile' }}
              </h3>
              <p class="text-xs text-slate-400">
                {{ locale.currentLang === 'ru' ? 'Выберите, как вы копите ресурсы каждую неделю:' : 'Choose your weekly income rate:' }}
              </p>
            </div>
          </div>
          <span class="text-xs font-mono text-cyan-300 font-bold bg-cyan-950 px-2.5 py-1 rounded-xl border border-cyan-800">
            ~{{ weeksUntilEvent }} {{ locale.currentLang === 'ru' ? 'недель до баннера' : 'weeks left' }}
          </span>
        </div>

        <!-- 3 Simple Presets -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Preset 1: F2P -->
          <button
            type="button"
            class="p-3.5 rounded-xl border text-left space-y-1.5 transition-all"
            :class="incomePreset === 'f2p' ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
            @click="incomePreset = 'f2p'"
          >
            <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
              <span>🆓 F2P (Без доната)</span>
            </div>
            <p class="text-[11px] leading-relaxed">
              Аннигиляция (1,800) + Ежедневки и еженедельки (1,200). <strong>~5 круток/нед.</strong>
            </p>
          </button>

          <!-- Preset 2: Monthly Card -->
          <button
            type="button"
            class="p-3.5 rounded-xl border text-left space-y-1.5 transition-all"
            :class="incomePreset === 'monthly_card' ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
            @click="incomePreset = 'monthly_card'"
          >
            <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
              <span>💳 Месячная карта (Monthly Card)</span>
            </div>
            <p class="text-[11px] leading-relaxed">
              F2P + 200 Орундума в день + 6 OP в месяц. <strong>~8.5 круток/нед.</strong>
            </p>
          </button>

          <!-- Preset 3: All In -->
          <button
            type="button"
            class="p-3.5 rounded-xl border text-left space-y-1.5 transition-all"
            :class="incomePreset === 'all_in' ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
            @click="incomePreset = 'all_in'"
          >
            <div class="font-bold text-xs text-slate-100 flex items-center gap-2">
              <span>👑 Максимум (С магазином)</span>
            </div>
            <p class="text-[11px] leading-relaxed">
              Monthly Card + выкуп билетов в магазине зелёных сертификатов. <strong>~9.5 круток/нед.</strong>
            </p>
          </button>
        </div>
      </div>

      <!-- ─── THE BIG CLEAR VERDICT CARD ─── -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border-2 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5"
        :class="[
          totalProjectedPulls >= projectedOddsResult.sparkTarget
            ? 'border-emerald-500/80 shadow-emerald-950/40'
            : projectedOddsResult.probAtLeastOne >= 80
              ? 'border-cyan-500/80 shadow-cyan-950/40'
              : projectedOddsResult.probAtLeastOne >= 50
                ? 'border-amber-500/80 shadow-amber-950/40'
                : 'border-rose-500/80 shadow-rose-950/40'
        ]"
      >
        <!-- Top Status Bar: Clear Russian Verdict -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
              {{ locale.currentLang === 'ru' ? 'Результат прогноза на момент старта баннера:' : 'Projected Verdict at Banner Arrival:' }}
            </span>

            <!-- Large Verdict Text -->
            <div class="flex items-center gap-2.5 mt-1">
              <CheckCircle2 v-if="totalProjectedPulls >= projectedOddsResult.sparkTarget" class="w-7 h-7 text-emerald-400 flex-shrink-0" />
              <CheckCircle2 v-else-if="projectedOddsResult.probAtLeastOne >= 80" class="w-7 h-7 text-cyan-400 flex-shrink-0" />
              <AlertCircle v-else-if="projectedOddsResult.probAtLeastOne >= 50" class="w-7 h-7 text-amber-400 flex-shrink-0" />
              <AlertCircle v-else class="w-7 h-7 text-rose-400 flex-shrink-0" />

              <h4 class="text-xl sm:text-2xl font-black text-slate-100">
                {{
                  totalProjectedPulls >= projectedOddsResult.sparkTarget
                    ? (locale.currentLang === 'ru' ? '100% Гарант! Вы точно заберёте оператора!' : '100% Spark Guarantee Ready!')
                    : projectedOddsResult.probAtLeastOne >= 80
                      ? (locale.currentLang === 'ru' ? `Отличные шансы (${projectedOddsResult.probAtLeastOne}%)! Скорее всего выбьете!` : `High Chance (${projectedOddsResult.probAtLeastOne}%)! You will likely pull!`)
                      : projectedOddsResult.probAtLeastOne >= 50
                        ? (locale.currentLang === 'ru' ? `Шанс ${projectedOddsResult.probAtLeastOne}%. Есть риск скама.` : `Moderate Chance (${projectedOddsResult.probAtLeastOne}%). Risk of missing.`)
                        : (locale.currentLang === 'ru' ? `Шанс всего ${projectedOddsResult.probAtLeastOne}%. Высокий риск не выбить.` : `Low Chance (${projectedOddsResult.probAtLeastOne}%). High risk of missing.`)
                }}
              </h4>
            </div>
          </div>

          <!-- Total Pulls Number Badge -->
          <div class="bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-2xl text-right flex-shrink-0">
            <div class="text-[10px] font-mono text-slate-400 uppercase">
              {{ locale.currentLang === 'ru' ? 'Всего будет круток:' : 'Total Projected Pulls:' }}
            </div>
            <div class="text-3xl font-black font-mono text-cyan-300">
              {{ totalProjectedPulls }}
            </div>
            <div class="text-[10px] text-slate-500 font-mono">
              ({{ convertedPulls.totalPulls }} сейчас + {{ forecastResult.totalPullsGained }} накопите)
            </div>
          </div>
        </div>

        <!-- 300 Spark Progress Bar -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-300 font-bold flex items-center gap-1.5">
              <ShieldCheck class="w-4 h-4 text-amber-400" />
              <span>{{ locale.currentLang === 'ru' ? 'Прогресс до 100% гаранта (Spark):' : 'Spark Guarantee Progress:' }}</span>
            </span>
            <span class="text-amber-400 font-bold">
              {{ totalProjectedPulls }} / {{ projectedOddsResult.sparkTarget }}
              ({{ Math.min(100, Math.round((totalProjectedPulls / projectedOddsResult.sparkTarget) * 100)) }}%)
            </span>
          </div>

          <div class="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="totalProjectedPulls >= projectedOddsResult.sparkTarget ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'"
              :style="{ width: `${Math.min(100, (totalProjectedPulls / projectedOddsResult.sparkTarget) * 100)}%` }"
            ></div>
          </div>

          <div class="flex justify-between text-[11px] text-slate-400">
            <span v-if="totalProjectedPulls >= projectedOddsResult.sparkTarget" class="text-emerald-400 font-semibold">
              ✓ Полный запас на 300 круток обеспечен!
            </span>
            <span v-else class="text-amber-300 font-semibold">
              До 100% гаранта не хватает {{ Math.max(0, projectedOddsResult.sparkTarget - totalProjectedPulls) }} круток.
            </span>
            <span class="text-slate-500 font-mono">
              Шанс получить ≥1 копию: <strong class="text-white">{{ projectedOddsResult.probAtLeastOne }}%</strong>
            </span>
          </div>
        </div>

        <!-- Breakdown Numbers Table -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-slate-400 block text-[10px]">Шанс на 1 копию:</span>
            <span class="text-base font-bold text-emerald-400">{{ projectedOddsResult.probAtLeastOne }}%</span>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-slate-400 block text-[10px]">Шанс на Потенциал 2:</span>
            <span class="text-base font-bold text-purple-300">{{ projectedOddsResult.probAtLeastTwo }}%</span>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-slate-400 block text-[10px]">Ожидаемо любых 6★:</span>
            <span class="text-base font-bold text-amber-300">~{{ projectedOddsResult.expectedSixStars }} шт.</span>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span class="text-slate-400 block text-[10px]">Ожидаемо целевых:</span>
            <span class="text-base font-bold text-cyan-300">~{{ projectedOddsResult.expectedRateUps }} шт.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── MODE 2: MANUAL PULLS ODDS CALCULATOR ─── -->
    <div v-else-if="activeMode === 'odds_calculator'" class="space-y-6">
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-5">
        <div>
          <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wide">
            {{ locale.currentLang === 'ru' ? 'Калькулятор шансов: двигайте ползунок круток' : 'Interactive Pulls Probability Calculator' }}
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            {{
              locale.currentLang === 'ru'
                ? 'Задайте любое число круток и выберите формат баннера — калькулятор покажет точную математическую вероятность.'
                : 'Adjust the slider to see how your chances change with every pull.'
            }}
          </p>
        </div>

        <!-- Slider and Fast Presets -->
        <div class="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-300 font-semibold">
              {{ locale.currentLang === 'ru' ? 'Сколько круток вы планируете сделать:' : 'Planned Pull Count:' }}
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700"
                @click="setSliderToCurrentPulls"
              >
                Мои крутки ({{ convertedPulls.totalPulls }})
              </button>
              <span class="text-2xl font-black font-mono text-cyan-400">{{ manualPullsSlider }}</span>
              <span class="text-xs text-slate-400 font-mono">круток</span>
            </div>
          </div>

          <input
            v-model.number="manualPullsSlider"
            type="range"
            min="1"
            max="300"
            step="1"
            class="w-full accent-cyan-500 cursor-pointer"
          />

          <!-- Quick buttons -->
          <div class="flex flex-wrap gap-1.5 text-xs font-mono">
            <button
              v-for="p in [30, 50, 75, 100, 150, 200, 300]"
              :key="p"
              type="button"
              class="px-2.5 py-1 rounded-lg border text-slate-300 transition-colors"
              :class="manualPullsSlider === p ? 'bg-cyan-600 text-white border-cyan-400 font-bold' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'"
              @click="manualPullsSlider = p"
            >
              {{ p }} кр.
            </button>
          </div>
        </div>

        <!-- Banner Format Toggle -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-400">
            {{ locale.currentLang === 'ru' ? 'Формат баннера:' : 'Banner Type:' }}
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              class="p-2.5 rounded-xl border text-xs font-bold text-center transition-all"
              :class="manualBannerType === 'limited' ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
              @click="manualBannerType = 'limited'"
            >
              🌟 Лимитный (300 Spark, 70% рейт-ап)
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl border text-xs font-bold text-center transition-all"
              :class="manualBannerType === 'standard_solo' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
              @click="manualBannerType = 'standard_solo'"
            >
              🎯 Обычный Соло (150 гарант, 50% рейт-ап)
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl border text-xs font-bold text-center transition-all"
              :class="manualBannerType === 'standard_dual' ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
              @click="manualBannerType = 'standard_dual'"
            >
              ⚖️ Двойной баннер 50/50 (два оператора)
            </button>
          </div>
        </div>

        <!-- Odds Results Display -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Probability 1+ -->
          <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="text-xs text-slate-400 font-semibold">Шанс получить ≥1 копию:</div>
            <div
              class="text-3xl font-black font-mono"
              :class="manualOddsResult.probAtLeastOne >= 80 ? 'text-emerald-400' : manualOddsResult.probAtLeastOne >= 50 ? 'text-amber-400' : 'text-rose-400'"
            >
              {{ manualOddsResult.probAtLeastOne }}%
            </div>
            <div class="text-[11px] text-slate-500">
              Вероятность выбить целевого оператора
            </div>
          </div>

          <!-- Probability 2+ -->
          <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="text-xs text-slate-400 font-semibold">Шанс на Потенциал 2 (≥2):</div>
            <div class="text-3xl font-black font-mono text-purple-300">
              {{ manualOddsResult.probAtLeastTwo }}%
            </div>
            <div class="text-[11px] text-slate-500">
              Вероятность выбить повторку для баффа
            </div>
          </div>

          <!-- Expected 6 Stars -->
          <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="text-xs text-slate-400 font-semibold">Ожидаемо любых 6★:</div>
            <div class="text-3xl font-black font-mono text-amber-300">
              ~{{ manualOddsResult.expectedSixStars }}
            </div>
            <div class="text-[11px] text-slate-500">
              В среднем 1 шестёрка каждые ~34.6 крутки
            </div>
          </div>
        </div>

        <!-- Milestones Bar -->
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div class="text-xs font-bold text-slate-300">
            📌 Сколько круток нужно для уверенности:
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span class="text-slate-400 block text-[10px]">50% (как монетка):</span>
              <strong class="text-amber-400 text-sm">{{ manualOddsResult.pullsToFiftyPercent }} кр.</strong>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span class="text-slate-400 block text-[10px]">75% (хороший шанс):</span>
              <strong class="text-cyan-400 text-sm">{{ manualOddsResult.pullsToSeventyFivePercent }} кр.</strong>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span class="text-slate-400 block text-[10px]">90% (почти наверняка):</span>
              <strong class="text-purple-300 text-sm">{{ manualOddsResult.pullsToNinetyPercent }} кр.</strong>
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-emerald-800/80">
              <span class="text-slate-400 block text-[10px]">100% (Spark):</span>
              <strong class="text-emerald-400 text-sm">{{ manualOddsResult.sparkTarget }} кр.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── MODE 3: ROLL SIMULATOR ─── -->
    <div v-else-if="activeMode === 'simulator'" class="space-y-6">
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wide">
              {{ locale.currentLang === 'ru' ? 'Симулятор круток (Проверьте свою удачу)' : '10-Pull Roll Simulator' }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ locale.currentLang === 'ru' ? 'Попробуйте сделать 10-пулы с реальной математикой и Soft Pity Arknights!' : 'Test your gacha luck with authentic Arknights rates & pity!' }}
            </p>
          </div>

          <!-- Stats Pill -->
          <div class="flex items-center gap-3 font-mono text-xs">
            <span class="text-slate-400">Pity: <strong class="text-cyan-400">{{ simPity }} / 99</strong></span>
            <span class="text-slate-400">Всего 6★: <strong class="text-amber-400">{{ simSixStarCount }}</strong></span>
            <span class="text-slate-400">Целевых: <strong class="text-emerald-400">{{ simRateUpCount }}</strong></span>
            <button
              type="button"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Сброс"
              @click="resetSim"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Big Roll Button -->
        <div class="flex justify-center py-4">
          <button
            type="button"
            class="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2.5"
            @click="doTenPull"
          >
            <Sparkles class="w-5 h-5 text-slate-950" />
            <span>{{ locale.currentLang === 'ru' ? 'Крутить 10 раз!' : 'Pull 10x!' }}</span>
          </button>
        </div>

        <!-- 10 Pull Results Grid -->
        <div v-if="lastTenPull.length > 0" class="space-y-3 pt-3 border-t border-ark-border/60">
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div
              v-for="(item, idx) in lastTenPull"
              :key="idx"
              class="p-3 rounded-xl border text-center space-y-1 transition-all"
              :class="[
                item.rarity === 6
                  ? 'bg-amber-950/80 border-amber-400 shadow-lg shadow-amber-500/30 scale-105 ring-1 ring-amber-400'
                  : item.rarity === 5
                    ? 'bg-yellow-950/60 border-yellow-600 text-yellow-300'
                    : item.rarity === 4
                      ? 'bg-purple-950/40 border-purple-800 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400',
              ]"
            >
              <div class="font-black text-xs font-mono" :class="item.rarity === 6 ? 'text-amber-300' : ''">
                {{ '★'.repeat(item.rarity) }}
              </div>
              <div class="font-bold text-xs truncate" :class="item.rarity === 6 ? 'text-white' : ''">
                {{ item.name }}
              </div>
              <div v-if="item.isRateUp" class="text-[9px] font-mono font-bold text-emerald-400 uppercase">
                Рейт-ап!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── ACCORDION: HOW GACHA WORKS IN ARKNIGHTS (Clear Tutorial) ─── -->
    <div class="bg-ark-card border border-ark-border rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        class="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
        @click="isFaqOpen = !isFaqOpen"
      >
        <div class="flex items-center gap-2">
          <HelpCircle class="w-4 h-4 text-cyan-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Как устроен гарант в Arknights простыми словами?' : 'How does Arknights Gacha Pity Work?' }}</span>
        </div>
        <component :is="isFaqOpen ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-400" />
      </button>

      <div v-if="isFaqOpen" class="p-4 pt-0 border-t border-ark-border/60 text-xs text-slate-300 space-y-3 leading-relaxed">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div class="font-bold text-cyan-400">1. Базовый шанс и Soft Pity</div>
            <p class="text-slate-400 text-[11px]">
              Базовый шанс выбить 6★ составляет <strong>2.0%</strong>. Если за 50 круток 6★ не выпал, начиная с 51-й крутки шанс увеличивается на <strong>+2.0%</strong> за каждую последующую (51-я = 4%, 52-я = 6%, ..., 99-я = 100%). В среднем 6★ падает каждые <strong>34-35 круток</strong>.
            </p>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div class="font-bold text-amber-400">2. Лимитные баннеры и 300 Spark</div>
            <p class="text-slate-400 text-[11px]">
              На лимитках (Carnival/Celebration) шанс на рейт-ап составляет <strong>70%</strong> от выпавших 6★. За каждую крутку вы получаете 1 сертификат. Накопив <strong>300 сертификатов</strong>, вы гарантированно забираете оператора из магазина.
            </p>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div class="font-bold text-purple-400">3. Одиночные баннеры (150 Guarantee)</div>
            <p class="text-slate-400 text-[11px]">
              На новых соло-баннерах действует жесткий потолок: если за <strong>150 круток</strong> целевой оператор не выпал, на 150-й крутке он гарантированно выдается игроку.
            </p>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div class="font-bold text-emerald-400">4. Конвертация валют</div>
            <p class="text-slate-400 text-[11px]">
              <strong>1 крутка = 600 Орундума</strong>.<br />
              <strong>1 Originium Prime (OP) = 180 Орундума</strong> (3.33 OP за 1 крутку).<br />
              Одиночные и 10x билеты эквивалентны 1 и 10 круткам соответственно.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
