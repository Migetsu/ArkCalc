<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import { ARKNIGHTS_EVENTS } from '@/data/eventsData';
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
  Coins,
  Percent,
  Calendar,
  Flame,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  TrendingUp,
} from 'lucide-vue-next';

const locale = useLocaleStore();

type Tab = 'odds' | 'forecast' | 'simulator';
const activeTab = ref<Tab>('odds');

// ─── Resource Inputs ──────────────────────────────────────────────────────
const orundum = ref<number>(18000);
const originiumPrime = ref<number>(35);
const singleTickets = ref<number>(5);
const tenTickets = ref<number>(1);
const bannerType = ref<BannerType>('limited');
const currentPity = ref<number>(0);

const convertedPulls = computed(() =>
  convertResourcesToPulls({
    orundum: orundum.value,
    originiumPrime: originiumPrime.value,
    singleTickets: singleTickets.value,
    tenTickets: tenTickets.value,
  }),
);

const oddsResult = computed(() =>
  calculateGachaOdds(convertedPulls.value.totalPulls, bannerType.value, currentPity.value),
);

// ─── Tab 2: Forecast state ────────────────────────────────────────────────
const selectedEventId = ref<string>(
  ARKNIGHTS_EVENTS.find((e) => e.status === 'upcoming_global')?.id || ARKNIGHTS_EVENTS[0]?.id || '',
);

const selectedEvent = computed(() =>
  ARKNIGHTS_EVENTS.find((e) => e.id === selectedEventId.value) || ARKNIGHTS_EVENTS[0],
);

// Calculate weeks until event based on estimated arrival
const weeksUntilEvent = computed(() => {
  const ev = selectedEvent.value;
  if (!ev) return 6;
  if (ev.globalStartDate) {
    const diffDays = Math.max(1, Math.round((new Date(ev.globalStartDate).getTime() - Date.now()) / (1000 * 3600 * 24)));
    return Math.max(1, Math.round(diffDays / 7));
  }
  // Default estimate based on type
  return 8;
});

const hasMonthlyCard = ref<boolean>(true);
const clearAnnihilation = ref<boolean>(true);
const completeDailies = ref<boolean>(true);
const completeWeeklies = ref<boolean>(true);
const buyGreenCertTickets = ref<boolean>(true);
const opFromEvents = ref<number>(25);

const forecastResult = computed(() =>
  calculateIncomeForecast({
    weeks: weeksUntilEvent.value,
    hasMonthlyCard: hasMonthlyCard.value,
    clearAnnihilation: clearAnnihilation.value,
    completeDailies: completeDailies.value,
    completeWeeklies: completeWeeklies.value,
    buyGreenCertTickets: buyGreenCertTickets.value,
    opFromEvents: opFromEvents.value,
  }),
);

const totalFuturePulls = computed(() =>
  convertedPulls.value.totalPulls + forecastResult.value.totalPullsGained,
);

const futureOddsResult = computed(() =>
  calculateGachaOdds(totalFuturePulls.value, bannerType.value, currentPity.value),
);

// ─── Tab 3: Simulator State ───────────────────────────────────────────────
const simPity = ref<number>(0);
const simTotalPulls = ref<number>(0);
const simSixStarCount = ref<number>(0);
const simRateUpCount = ref<number>(0);
const lastTenPull = ref<SimulatedPullItem[]>([]);
const pullHistory = ref<SimulatedPullItem[][]>([]);

function doTenPull() {
  const targetName = selectedEvent.value?.sixStarOps?.[0]?.name || 'Target 6★';
  const res = simulateTenPull(bannerType.value, simPity.value, targetName);
  simPity.value = res.finalPity;
  simTotalPulls.value += 10;
  lastTenPull.value = res.items;
  pullHistory.value.unshift(res.items);

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
  pullHistory.value = [];
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top Header Banner -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-sm">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-black text-slate-100 uppercase tracking-wider">
                  {{ locale.currentLang === 'ru' ? 'Калькулятор круток и Spark' : 'Headhunting & Spark Calculator' }}
                </h2>
                <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                  GACHA ENGINE
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                {{
                  locale.currentLang === 'ru'
                    ? 'Точный расчет вероятностей с учетом мягкого гаранта (Soft Pity после 50 круток), Spark 300 и прогноза накоплений'
                    : 'Accurate probability simulation with Soft Pity (after 50 pulls), 300 Spark system & income forecasting'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="inline-flex bg-slate-900 p-1 rounded-xl border border-ark-border text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
            :class="activeTab === 'odds' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'odds'"
          >
            <Percent class="w-3.5 h-3.5" />
            <span>{{ locale.currentLang === 'ru' ? 'Шансы & Spark' : 'Odds & Spark' }}</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
            :class="activeTab === 'forecast' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'forecast'"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>{{ locale.currentLang === 'ru' ? 'Прогноз к баннеру' : 'Banner Forecast' }}</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
            :class="activeTab === 'simulator' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'simulator'"
          >
            <Flame class="w-3.5 h-3.5" />
            <span>{{ locale.currentLang === 'ru' ? 'Симулятор круток' : 'Pull Simulator' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Currency & Savings Input Panel (Shared by Tabs) -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Coins class="w-4 h-4 text-amber-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Текущие ресурсы на крутки' : 'Current Pull Resources' }}</span>
        </span>
        <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-800">
          = {{ convertedPulls.totalPulls }} {{ locale.currentLang === 'ru' ? 'круток' : 'pulls' }}
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- Orundum Input -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold text-red-400">Orundum (Орундум)</span>
            <span class="font-mono text-[10px]">~{{ convertedPulls.orundumPulls }} p.</span>
          </div>
          <input
            v-model.number="orundum"
            type="number"
            min="0"
            step="100"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-red-500"
          />
          <div class="flex gap-1 text-[10px] font-mono">
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="orundum += 600">+600</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="orundum += 6000">+6k</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="orundum += 30000">+30k</button>
          </div>
        </div>

        <!-- OP Input -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold text-amber-400">Orig. Prime (OP)</span>
            <span class="font-mono text-[10px]">~{{ convertedPulls.opPulls }} p.</span>
          </div>
          <input
            v-model.number="originiumPrime"
            type="number"
            min="0"
            step="1"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <div class="flex gap-1 text-[10px] font-mono">
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="originiumPrime += 10">+10</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="originiumPrime += 50">+50</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="originiumPrime += 100">+100</button>
          </div>
        </div>

        <!-- 1x Tickets -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold text-cyan-400">Single Tickets (1x)</span>
            <span class="font-mono text-[10px]">{{ singleTickets }} p.</span>
          </div>
          <input
            v-model.number="singleTickets"
            type="number"
            min="0"
            step="1"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <div class="flex gap-1 text-[10px] font-mono">
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="singleTickets += 1">+1</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="singleTickets += 5">+5</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="singleTickets += 10">+10</button>
          </div>
        </div>

        <!-- 10x Tickets -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold text-purple-400">10-Pull Tickets</span>
            <span class="font-mono text-[10px]">{{ tenTickets * 10 }} p.</span>
          </div>
          <input
            v-model.number="tenTickets"
            type="number"
            min="0"
            step="1"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-purple-500"
          />
          <div class="flex gap-1 text-[10px] font-mono">
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="tenTickets += 1">+1 (10p)</button>
            <button type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" @click="tenTickets += 2">+2 (20p)</button>
          </div>
        </div>
      </div>

      <!-- Banner Type & Current Pity Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-ark-border/60">
        <!-- Banner Selector -->
        <div>
          <label class="text-xs text-slate-400 font-semibold mb-1.5 block">
            {{ locale.currentLang === 'ru' ? 'Тип целевого баннера' : 'Target Banner Format' }}:
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              class="p-2 rounded-xl border text-xs font-bold text-center transition-all"
              :class="bannerType === 'limited' ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
              @click="bannerType = 'limited'"
            >
              🌟 {{ locale.currentLang === 'ru' ? 'Лимитка (300 Spark)' : 'Limited (300)' }}
            </button>
            <button
              type="button"
              class="p-2 rounded-xl border text-xs font-bold text-center transition-all"
              :class="bannerType === 'standard_solo' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
              @click="bannerType = 'standard_solo'"
            >
              🎯 {{ locale.currentLang === 'ru' ? 'Соло (150 Gar.)' : 'Solo (150 Gar.)' }}
            </button>
            <button
              type="button"
              class="p-2 rounded-xl border text-xs font-bold text-center transition-all"
              :class="bannerType === 'standard_dual' ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
              @click="bannerType = 'standard_dual'"
            >
              ⚖️ {{ locale.currentLang === 'ru' ? 'Дуал 50/50' : 'Dual 50/50' }}
            </button>
          </div>
        </div>

        <!-- Current Pity Slider -->
        <div>
          <div class="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
            <span>{{ locale.currentLang === 'ru' ? 'Текущий накопленный Pity (круток без 6★)' : 'Current Pity Counter' }}:</span>
            <span class="font-mono text-cyan-400 font-bold text-sm">{{ currentPity }} / 99</span>
          </div>
          <input
            v-model.number="currentPity"
            type="range"
            min="0"
            max="80"
            step="1"
            class="w-full accent-cyan-500 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0 (базовый 2%)</span>
            <span class="text-amber-400">50 (начало soft pity +2%/крутка)</span>
            <span>80</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── TAB 1: ODDS & SPARK ─── -->
    <div v-if="activeTab === 'odds'" class="space-y-6">
      <!-- Big Odds Results Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Chance to get >= 1 copy -->
        <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {{ locale.currentLang === 'ru' ? 'Шанс получить (≥1)' : 'Chance to get (≥1)' }}
            </span>
            <Percent class="w-4 h-4 text-cyan-400" />
          </div>

          <div class="my-3">
            <div
              class="text-3xl font-black font-mono tracking-tight"
              :class="[
                oddsResult.probAtLeastOne >= 80
                  ? 'text-emerald-400'
                  : oddsResult.probAtLeastOne >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400',
              ]"
            >
              {{ oddsResult.probAtLeastOne }}%
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              {{
                oddsResult.probAtLeastOne >= 80
                  ? (locale.currentLang === 'ru' ? 'Очень высокая вероятность успеха!' : 'High chance of success!')
                  : oddsResult.probAtLeastOne >= 50
                    ? (locale.currentLang === 'ru' ? 'Хороший шанс, но возможен скам' : 'Good odds, but risk remains')
                    : (locale.currentLang === 'ru' ? 'Рискованно, круток маловато' : 'High risk, low pulls count')
              }}
            </p>
          </div>

          <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between font-mono text-slate-400">
            <span>{{ locale.currentLang === 'ru' ? 'Потенциал 2 (≥2):' : 'Potential 2 (≥2):' }}</span>
            <strong class="text-purple-300">{{ oddsResult.probAtLeastTwo }}%</strong>
          </div>
        </div>

        <!-- Spark Progress Bar Card -->
        <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {{ locale.currentLang === 'ru' ? 'Прогресс Spark (Гарант)' : 'Spark Guarantee Progress' }}
            </span>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
              {{ oddsResult.sparkTarget }} SPARK
            </span>
          </div>

          <div class="my-3">
            <div class="flex items-baseline gap-1.5 font-mono">
              <span class="text-2xl font-black text-amber-400">{{ oddsResult.pulls }}</span>
              <span class="text-xs text-slate-400">/ {{ oddsResult.sparkTarget }}</span>
            </div>

            <!-- Progress bar -->
            <div class="mt-2 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="oddsResult.pulls >= oddsResult.sparkTarget ? 'bg-emerald-400' : 'bg-amber-400'"
                :style="{ width: `${oddsResult.sparkProgress}%` }"
              ></div>
            </div>
          </div>

          <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between font-mono text-slate-400">
            <span>{{ locale.currentLang === 'ru' ? 'До гаранта осталось:' : 'Left for spark:' }}</span>
            <strong :class="oddsResult.pulls >= oddsResult.sparkTarget ? 'text-emerald-400' : 'text-amber-300'">
              {{ Math.max(0, oddsResult.sparkTarget - oddsResult.pulls) }} {{ locale.currentLang === 'ru' ? 'кр.' : 'pulls' }}
            </strong>
          </div>
        </div>

        <!-- Expected 6★ Operators Card -->
        <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {{ locale.currentLang === 'ru' ? 'Ожидаемо 6★ всего' : 'Expected Total 6★' }}
            </span>
            <Sparkles class="w-4 h-4 text-amber-400" />
          </div>

          <div class="my-3">
            <div class="text-2xl font-black font-mono text-amber-300">
              ~{{ oddsResult.expectedSixStars }}
              <span class="text-xs font-normal text-slate-400 ml-1">операторов</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              {{ locale.currentLang === 'ru' ? 'Среднее число 6★ с учетом Soft Pity' : 'Average 6★ count based on Soft Pity' }}
            </p>
          </div>

          <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between font-mono text-slate-400">
            <span>{{ locale.currentLang === 'ru' ? 'Из них целевого:' : 'Of which target:' }}</span>
            <strong class="text-cyan-300">~{{ oddsResult.expectedRateUps }}</strong>
          </div>
        </div>

        <!-- Equivalent OP / Orundum Value -->
        <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {{ locale.currentLang === 'ru' ? 'Стоимость в OP' : 'Equivalent Value' }}
            </span>
            <TrendingUp class="w-4 h-4 text-purple-400" />
          </div>

          <div class="my-3">
            <div class="text-2xl font-black font-mono text-purple-300">
              ~{{ Math.round((oddsResult.pulls * 600) / 180) }} OP
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              {{ locale.currentLang === 'ru' ? 'Или' : 'Or' }} ~{{ (oddsResult.pulls * 600).toLocaleString() }} Orundum
            </p>
          </div>

          <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between font-mono text-slate-400">
            <span>{{ locale.currentLang === 'ru' ? 'Круток на 6★ в среднем:' : 'Avg pulls per 6★:' }}</span>
            <strong class="text-slate-200">~34.6</strong>
          </div>
        </div>
      </div>

      <!-- Probability Milestone Benchmarks Table -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-3">
        <h4 class="font-bold text-sm text-slate-100 flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-cyan-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Пороги круток для нужного шанса (Бенчмарк)' : 'Pulls Required by Confidence Level' }}</span>
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
            <div class="text-[11px] font-bold text-amber-400">50% Шанс (Медиана)</div>
            <div class="text-lg font-mono font-black text-slate-100">{{ oddsResult.pullsToFiftyPercent }} <span class="text-xs text-slate-400">круток</span></div>
            <div class="text-[10px] text-slate-500">{{ locale.currentLang === 'ru' ? 'Обычная удача игрока' : 'Median player luck' }}</div>
          </div>

          <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
            <div class="text-[11px] font-bold text-cyan-400">75% Шанс (Надёжно)</div>
            <div class="text-lg font-mono font-black text-slate-100">{{ oddsResult.pullsToSeventyFivePercent }} <span class="text-xs text-slate-400">круток</span></div>
            <div class="text-[10px] text-slate-500">{{ locale.currentLang === 'ru' ? 'Успех в 3 из 4 случаев' : 'Success in 3 out of 4 runs' }}</div>
          </div>

          <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
            <div class="text-[11px] font-bold text-purple-400">90% Шанс (Уверенно)</div>
            <div class="text-lg font-mono font-black text-slate-100">{{ oddsResult.pullsToNinetyPercent }} <span class="text-xs text-slate-400">круток</span></div>
            <div class="text-[10px] text-slate-500">{{ locale.currentLang === 'ru' ? 'Минимальный риск скама' : 'Very safe pull amount' }}</div>
          </div>

          <div class="bg-slate-900/90 border border-emerald-800/80 bg-emerald-950/20 p-3 rounded-xl space-y-1">
            <div class="text-[11px] font-bold text-emerald-400">100% Spark (Гарант)</div>
            <div class="text-lg font-mono font-black text-emerald-300">{{ oddsResult.sparkTarget }} <span class="text-xs text-emerald-500">круток</span></div>
            <div class="text-[10px] text-emerald-400/80">{{ locale.currentLang === 'ru' ? 'Покупка в магазине сертификатов' : 'Guaranteed shop purchase' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── TAB 2: FORECAST ─── -->
    <div v-else-if="activeTab === 'forecast'" class="space-y-6">
      <!-- Target Banner Event Selector -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 class="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Calendar class="w-4 h-4 text-cyan-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Выберите целевой ивент / баннер' : 'Select Target Event / Banner' }}</span>
          </h4>
          <span class="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-800">
            {{ weeksUntilEvent }} {{ locale.currentLang === 'ru' ? 'недель (~' + (weeksUntilEvent * 7) + ' дн.)' : 'weeks left' }}
          </span>
        </div>

        <!-- Banner Picker Dropdown / Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="ev in ARKNIGHTS_EVENTS.slice(0, 6)"
            :key="ev.id"
            type="button"
            class="p-3 rounded-2xl border text-left flex items-center gap-3 transition-all relative overflow-hidden"
            :class="selectedEventId === ev.id ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40' : 'bg-slate-900 border-slate-800 hover:border-slate-700'"
            @click="selectedEventId = ev.id"
          >
            <!-- Poster Thumbnail -->
            <img
              :src="ev.bannerPosterUrl"
              :alt="ev.nameEn"
              class="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
              @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
            />
            <div class="min-w-0">
              <div class="font-bold text-xs text-slate-100 truncate">
                {{ locale.currentLang === 'ru' ? ev.nameRu : ev.nameEn }}
              </div>
              <div class="text-[10px] text-slate-400 truncate mt-0.5">
                {{ ev.sixStarOps.map((o) => o.name).join(', ') }}
              </div>
              <div class="text-[9px] font-mono text-cyan-400 font-bold mt-1">
                {{ ev.globalEstimatedArrival || ev.headerTagEn }}
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Income Sources Configuration -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-4">
        <h4 class="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Coins class="w-4 h-4 text-amber-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Источники регулярного дохода' : 'Income Sources Configuration' }}</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <!-- Monthly card -->
          <label class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 cursor-pointer">
            <input v-model="hasMonthlyCard" type="checkbox" class="rounded text-cyan-500 bg-slate-800 border-slate-700" />
            <div>
              <div class="font-bold text-slate-200">Monthly Card (+200/day + 6 OP)</div>
              <div class="text-[10px] text-slate-400">+{{ forecastResult.monthlyCardOrundum.toLocaleString() }} Orundum</div>
            </div>
          </label>

          <!-- Annihilation -->
          <label class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 cursor-pointer">
            <input v-model="clearAnnihilation" type="checkbox" class="rounded text-cyan-500 bg-slate-800 border-slate-700" />
            <div>
              <div class="font-bold text-slate-200">Annihilation (1,800/wk)</div>
              <div class="text-[10px] text-slate-400">+{{ forecastResult.annihilationOrundum.toLocaleString() }} Orundum</div>
            </div>
          </label>

          <!-- Dailies & Weeklies -->
          <label class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 cursor-pointer">
            <input v-model="completeDailies" type="checkbox" class="rounded text-cyan-500 bg-slate-800 border-slate-700" />
            <div>
              <div class="font-bold text-slate-200">Dailies & Weeklies (1,200/wk)</div>
              <div class="text-[10px] text-slate-400">+{{ (forecastResult.dailiesOrundum + forecastResult.weekliesOrundum).toLocaleString() }} Orundum</div>
            </div>
          </label>

          <!-- Green Cert Shop -->
          <label class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 cursor-pointer">
            <input v-model="buyGreenCertTickets" type="checkbox" class="rounded text-cyan-500 bg-slate-800 border-slate-700" />
            <div>
              <div class="font-bold text-slate-200">Green Cert Shop Tickets</div>
              <div class="text-[10px] text-slate-400">+{{ forecastResult.certTickets }} tickets</div>
            </div>
          </label>

          <!-- Event OP Rewards -->
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div class="font-bold text-slate-200 flex justify-between">
              <span>Event OP Rewards</span>
              <span class="font-mono text-amber-400 font-bold">+{{ opFromEvents }} OP</span>
            </div>
            <input v-model.number="opFromEvents" type="range" min="0" max="60" step="5" class="w-full accent-amber-500" />
          </div>
        </div>
      </div>

      <!-- Forecast Grand Totals -->
      <div class="bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-ark-card border border-cyan-500/40 rounded-2xl p-5 shadow-lg space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              {{ locale.currentLang === 'ru' ? 'Итоговый прогноз к началу баннера' : 'Projected Pulls at Banner Arrival' }}
            </span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-3xl font-black font-mono text-cyan-300">{{ totalFuturePulls }}</span>
              <span class="text-xs font-mono text-slate-400">
                ({{ convertedPulls.totalPulls }} сейчас + {{ forecastResult.totalPullsGained }} накопится)
              </span>
            </div>
          </div>

          <!-- Spark Readiness Verdict -->
          <div
            class="px-4 py-2 rounded-xl text-xs font-bold font-mono border flex items-center gap-2"
            :class="totalFuturePulls >= futureOddsResult.sparkTarget ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-amber-950/80 border-amber-500 text-amber-300'"
          >
            <CheckCircle2 v-if="totalFuturePulls >= futureOddsResult.sparkTarget" class="w-4 h-4 text-emerald-400" />
            <AlertCircle v-else class="w-4 h-4 text-amber-400" />
            <span>
              {{
                totalFuturePulls >= futureOddsResult.sparkTarget
                  ? (locale.currentLang === 'ru' ? '100% Гарант Spark будет готов!' : '100% Spark Guarantee Ready!')
                  : `${Math.max(0, futureOddsResult.sparkTarget - totalFuturePulls)} ${locale.currentLang === 'ru' ? 'круток не хватает до 300' : 'pulls short of 300'}`
              }}
            </span>
          </div>
        </div>

        <!-- Projected Odds -->
        <div class="pt-3 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <span class="text-slate-400 block">{{ locale.currentLang === 'ru' ? 'Шанс на баннере:' : 'Projected success rate:' }}</span>
            <strong class="text-emerald-400 text-lg">{{ futureOddsResult.probAtLeastOne }}%</strong>
          </div>
          <div>
            <span class="text-slate-400 block">{{ locale.currentLang === 'ru' ? 'Ожидаемо 6★ всего:' : 'Expected total 6★:' }}</span>
            <strong class="text-amber-300 text-lg">~{{ futureOddsResult.expectedSixStars }}</strong>
          </div>
          <div>
            <span class="text-slate-400 block">{{ locale.currentLang === 'ru' ? 'Целевых копий:' : 'Expected target copies:' }}</span>
            <strong class="text-cyan-300 text-lg">~{{ futureOddsResult.expectedRateUps }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── TAB 3: PULL SIMULATOR ─── -->
    <div v-else-if="activeTab === 'simulator'" class="space-y-6">
      <div class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Flame class="w-4 h-4 text-amber-400" />
              <span>{{ locale.currentLang === 'ru' ? 'Симулятор удачи (10-Pull Simulator)' : '10-Pull Roll Simulator' }}</span>
            </h4>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ locale.currentLang === 'ru' ? 'Проверьте свою удачу с настоящими шансами и Soft Pity Arknights!' : 'Test your gacha luck with authentic Arknights pity & drop rates!' }}
            </p>
          </div>

          <!-- Stats Pill -->
          <div class="flex items-center gap-3 font-mono text-xs">
            <span class="text-slate-400">Pity: <strong class="text-cyan-400">{{ simPity }} / 99</strong></span>
            <span class="text-slate-400">6★: <strong class="text-amber-400">{{ simSixStarCount }}</strong></span>
            <span class="text-slate-400">Target: <strong class="text-emerald-400">{{ simRateUpCount }}</strong></span>
            <button
              type="button"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              :title="locale.currentLang === 'ru' ? 'Сбросить симуляцию' : 'Reset simulation'"
              @click="resetSim"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-center py-2">
          <button
            type="button"
            class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2.5"
            @click="doTenPull"
          >
            <Sparkles class="w-4 h-4 text-slate-950" />
            <span>{{ locale.currentLang === 'ru' ? 'Сделать 10 круток!' : 'Roll 10-Pull!' }}</span>
          </button>
        </div>

        <!-- 10 Pull Visual Results Grid -->
        <div v-if="lastTenPull.length > 0" class="space-y-3 pt-3 border-t border-ark-border/60">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            {{ locale.currentLang === 'ru' ? 'Результат последнего пула' : 'Latest 10-Pull Result' }}:
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div
              v-for="(item, idx) in lastTenPull"
              :key="idx"
              class="p-3 rounded-xl border text-center space-y-1 transition-all"
              :class="[
                item.rarity === 6
                  ? 'bg-amber-950/80 border-amber-400 shadow-md shadow-amber-500/30 scale-105 ring-1 ring-amber-400'
                  : item.rarity === 5
                    ? 'bg-yellow-950/60 border-yellow-600 text-yellow-300'
                    : item.rarity === 4
                      ? 'bg-purple-950/40 border-purple-800 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400',
              ]"
            >
              <div
                class="font-black text-xs font-mono"
                :class="item.rarity === 6 ? 'text-amber-300' : ''"
              >
                {{ '★'.repeat(item.rarity) }}
              </div>
              <div class="font-bold text-xs truncate" :class="item.rarity === 6 ? 'text-white' : ''">
                {{ item.name }}
              </div>
              <div v-if="item.isRateUp" class="text-[9px] font-mono font-bold text-emerald-400">
                RATE-UP!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
