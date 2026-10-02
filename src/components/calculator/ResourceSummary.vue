<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import ItemIcon from '@/components/common/ItemIcon.vue';
import CraftingTree from './CraftingTree.vue';
import FarmingGuideModal from './FarmingGuideModal.vue';
import {
  getRecommendedStage,
  calculatePlanSanityEstimate,
  calculateFarmingEstimate,
} from '@/services/penguinStatsService';
import {
  Coins,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle,
  TrendingDown,
  Hammer,
  Zap,
} from 'lucide-vue-next';

const planner = usePlannerStore();
const gameData = useGameDataStore();
const inventory = useInventoryStore();

const activeTab = ref<'direct' | 'farm' | 'craftingTree'>('direct');

const calc = computed(() => planner.calculationResult);

// LMD Stock, Needed, Deficit & Progress
const lmdStock = computed(() => inventory.getStock('4001') || 0);
const lmdTotalNeeded = computed(() => calc.value.totalLmd);
const lmdDeficit = computed(() => Math.max(0, lmdTotalNeeded.value - lmdStock.value));
const lmdProgress = computed(() => {
  if (lmdTotalNeeded.value <= 0) return 100;
  return Math.min(100, Math.round((lmdStock.value / lmdTotalNeeded.value) * 100));
});

// Battle records stock & EXP stats
const cardStockT4 = computed(() => inventory.getStock('2004') || 0);
const cardStockT3 = computed(() => inventory.getStock('2003') || 0);
const cardStockT2 = computed(() => inventory.getStock('2002') || 0);
const cardStockT1 = computed(() => inventory.getStock('2001') || 0);

const expStock = computed(() => {
  return (
    cardStockT4.value * 2000 +
    cardStockT3.value * 1000 +
    cardStockT2.value * 400 +
    cardStockT1.value * 200
  );
});
const expTotalNeeded = computed(() => calc.value.totalExp);
const expDeficit = computed(() => Math.max(0, expTotalNeeded.value - expStock.value));
const expProgress = computed(() => {
  if (expTotalNeeded.value <= 0) return 100;
  return Math.min(100, Math.round((expStock.value / expTotalNeeded.value) * 100));
});

// Battle records breakdown
const expStrategicRecords = computed(() => Math.ceil(expTotalNeeded.value / 2000));
const expTacticalRecords = computed(() => Math.ceil(expTotalNeeded.value / 1000));
const expDeficitT4 = computed(() => Math.ceil(expDeficit.value / 2000));
const expDeficitT3 = computed(() => Math.ceil(expDeficit.value / 1000));

// Deficit count stats
const totalDeficitItemsCount = computed(() => {
  let count = calc.value.directDeficit.filter((d) => d.deficit > 0).length;
  if (lmdDeficit.value > 0) count++;
  if (expDeficit.value > 0) count++;
  return count;
});

const totalItemsReadyCount = computed(() => {
  let count = calc.value.directDeficit.filter((d) => d.deficit === 0).length;
  if (lmdDeficit.value === 0 && lmdTotalNeeded.value > 0) count++;
  if (expDeficit.value === 0 && expTotalNeeded.value > 0) count++;
  return count;
});

// Plan-wide Sanity estimation via Penguin Stats (Materials, LMD, EXP)
const planSanityEstimate = computed(() => {
  const farmList = calc.value.farmRequirements.length > 0
    ? calc.value.farmRequirements
    : calc.value.directDeficit
        .filter((d) => d.deficit > 0)
        .map((d) => ({ itemId: d.itemId, count: d.deficit }));

  const matEstimate = calculatePlanSanityEstimate(farmList);

  // LMD Deficit Sanity (CE-6 gives ~10,000 LMD per 36 Sanity -> 0.0036 Sanity per 1 LMD)
  const lmdSanity = Math.round(lmdDeficit.value * 0.0036);
  const lmdRuns = Math.ceil(lmdDeficit.value / 10000);

  // EXP Deficit Sanity (LS-6 gives ~10,000 EXP per 36 Sanity -> 0.0036 Sanity per 1 EXP)
  const expSanity = Math.round(expDeficit.value * 0.0036);
  const expRuns = Math.ceil(expDeficit.value / 10000);

  const totalSanity = matEstimate.totalSanity + lmdSanity + expSanity;
  const totalRuns = matEstimate.totalRuns + lmdRuns + expRuns;
  const naturalDays = Math.round((totalSanity / 240) * 10) / 10;
  const opEquivalent = Math.ceil(totalSanity / 135);

  return {
    ...matEstimate,
    materialsSanity: matEstimate.totalSanity,
    lmdSanity,
    expSanity,
    lmdDeficit: lmdDeficit.value,
    expDeficit: expDeficit.value,
    lmdRuns,
    expRuns,
    totalSanity,
    totalRuns,
    naturalDays,
    opEquivalent,
  };
});

// Farming Guide Modal state
const selectedFarmingItemId = ref<string | null>(null);
const selectedFarmingNeededCount = ref<number>(0);
const isFarmingGuideOpen = ref(false);

function openFarmingGuide(itemId: string, neededCount: number = 0) {
  selectedFarmingItemId.value = itemId;
  selectedFarmingNeededCount.value = neededCount;
  isFarmingGuideOpen.value = true;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total LMD Card -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Coins class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Всего LMD</span>
          </div>
          <span
            class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
            :class="lmdDeficit > 0 ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'"
          >
            {{ lmdProgress }}%
          </span>
        </div>

        <div class="my-3">
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-mono tracking-tight text-cyan-400">
              {{ lmdStock.toLocaleString() }}
            </span>
            <span class="text-xs font-mono text-slate-400">
              / {{ lmdTotalNeeded.toLocaleString() }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="lmdDeficit > 0 ? 'bg-cyan-400' : 'bg-emerald-400'"
              :style="{ width: `${lmdProgress}%` }"
            ></div>
          </div>

          <!-- LMD breakdown -->
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>Уровни: <strong class="text-slate-200">{{ calc.totalLmdLevel.toLocaleString() }}</strong></span>
            <span>Элита: <strong class="text-slate-200">{{ calc.totalLmdEvolve.toLocaleString() }}</strong></span>
            <span>Крафт: <strong class="text-slate-200">{{ calc.totalLmdCraft.toLocaleString() }}</strong></span>
          </div>
        </div>

        <!-- Deficit indicator for LMD -->
        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center">
          <span class="text-slate-400">Осталось накопить:</span>
          <span
            v-if="lmdDeficit > 0"
            class="font-mono font-bold text-red-400"
          >
            -{{ lmdDeficit.toLocaleString() }}
          </span>
          <span v-else class="font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5" /> В наличии
          </span>
        </div>
      </div>

      <!-- Total EXP Card -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
              <Sparkles class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Всего EXP</span>
          </div>
          <span
            class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
            :class="expDeficit > 0 ? 'bg-amber-950/80 text-amber-300 border-amber-800' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'"
          >
            {{ expProgress }}%
          </span>
        </div>

        <div class="my-3">
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-mono tracking-tight text-amber-400">
              {{ expStock.toLocaleString() }}
            </span>
            <span class="text-xs font-mono text-slate-400">
              / {{ expTotalNeeded.toLocaleString() }} (~{{ expStrategicRecords }} T4)
            </span>
          </div>

          <!-- Progress bar -->
          <div class="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="expDeficit > 0 ? 'bg-amber-400' : 'bg-emerald-400'"
              :style="{ width: `${expProgress}%` }"
            ></div>
          </div>

          <!-- Battle records breakdown -->
          <div class="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>T4: <strong class="text-amber-300">{{ cardStockT4 }} шт.</strong></span>
            <span>T3: <strong class="text-sky-300">{{ cardStockT3 }} шт.</strong></span>
            <span>T2: <strong class="text-emerald-300">{{ cardStockT2 }} шт.</strong></span>
            <span>T1: <strong class="text-slate-300">{{ cardStockT1 }} шт.</strong></span>
          </div>
        </div>

        <!-- Deficit indicator for EXP -->
        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center text-slate-400">
          <span>Осталось накопить:</span>
          <span
            v-if="expDeficit > 0"
            class="font-mono font-bold text-red-400"
          >
            -{{ expDeficit.toLocaleString() }} (~{{ expDeficitT4 }} T4)
          </span>
          <span v-else class="font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5" /> В наличии
          </span>
        </div>
      </div>

      <!-- Materials Summary Card -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400">
              <Layers class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Материалы</span>
          </div>
          <span class="text-xs font-mono text-slate-400">
            Видов: {{ calc.directDeficit.length }}
          </span>
        </div>

        <div class="my-3 flex items-baseline gap-3">
          <div class="text-2xl font-black font-mono tracking-tight text-red-400">
            {{ totalDeficitItemsCount }}
            <span class="text-xs font-normal text-slate-400 ml-1">в дефиците</span>
          </div>
          <div class="text-sm font-bold font-mono text-emerald-400">
            {{ totalItemsReadyCount }}
            <span class="text-xs font-normal text-slate-400 ml-0.5">готово</span>
          </div>
        </div>

        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center text-slate-400">
          <span>Оперативников в плане:</span>
          <span class="text-cyan-400 font-mono font-bold">{{ planner.planCount }}</span>
        </div>
      </div>

      <!-- Sanity Estimate Card (Penguin Stats) -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
              <Zap class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Оценка Sanity</span>
          </div>
          <span class="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            Penguin Stats
          </span>
        </div>

        <div class="my-3">
          <div class="text-2xl font-black font-mono tracking-tight text-amber-300">
            ~{{ planSanityEstimate.totalSanity.toLocaleString() }}
            <span class="text-sm font-bold text-amber-400/80">⚡</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>Ресурсы: <strong class="text-purple-300">~{{ planSanityEstimate.materialsSanity.toLocaleString() }}⚡</strong></span>
            <span v-if="planSanityEstimate.lmdSanity > 0">LMD: <strong class="text-cyan-300">~{{ planSanityEstimate.lmdSanity.toLocaleString() }}⚡</strong></span>
            <span v-if="planSanityEstimate.expSanity > 0">EXP: <strong class="text-amber-300">~{{ planSanityEstimate.expSanity.toLocaleString() }}⚡</strong></span>
          </div>
        </div>

        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center text-slate-400">
          <span>~{{ planSanityEstimate.totalRuns.toLocaleString() }} зах. &bull; ~{{ planSanityEstimate.naturalDays }} дн.</span>
          <span class="text-amber-400 font-mono font-bold">~{{ planSanityEstimate.opEquivalent }} OP</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs for Calculator Views -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-ark-border pb-3">
      <div class="inline-flex bg-ark-card p-1 rounded-xl border border-ark-border text-xs font-semibold overflow-x-auto custom-scrollbar max-w-full">
        <button
          type="button"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
          :class="[activeTab === 'direct' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'direct'"
        >
          <TrendingDown class="w-4 h-4" />
          <span>Дефицит ({{ totalDeficitItemsCount }})</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
          :class="[activeTab === 'farm' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'farm'"
        >
          <Layers class="w-4 h-4" />
          <span>План фарма карт</span>
          <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black uppercase">
            Топ
          </span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
          :class="[activeTab === 'craftingTree' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'craftingTree'"
        >
          <Hammer class="w-4 h-4" />
          <span>Дерево крафта ({{ calc.craftingSteps.length }})</span>
        </button>
      </div>

      <div class="text-xs text-slate-400 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
        Красный цвет: требуется получить/скрафтить
      </div>
    </div>

    <!-- TAB 1: DIRECT DEFICIT LIST -->
    <div v-if="activeTab === 'direct'" class="space-y-4">
      <!-- Helpful banner explaining craft vs direct deficit -->
      <div class="p-4 bg-slate-900/90 rounded-2xl border border-ark-border text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Wrench class="w-4 h-4" />
          </div>
          <div>
            <div class="font-bold text-slate-100 text-xs">Прямой дефицит и синтез в Мастерской</div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              Сложные ресурсы (T4, T5, двойные фишки) крафтятся в Мастерской из базовых материалов T3.
              Перейдите во вкладку <b>«План фарма»</b>, чтобы сразу увидеть готовый список лучших карт и число заходов!
            </div>
          </div>
        </div>
        <button
          type="button"
          class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0 transition-all shadow-md self-start sm:self-auto"
          @click="activeTab = 'farm'"
        >
          <span>План фарма карт</span>
          <span>&rarr;</span>
        </button>
      </div>

      <!-- PRIMARY CURRENCY & EXP SECTION -->
      <div v-if="lmdTotalNeeded > 0 || expTotalNeeded > 0 || lmdStock > 0 || expStock > 0" class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 class="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wide">
              Основные ресурсы (LMD и опыт)
            </h3>
          </div>
          <span class="text-xs text-slate-400 font-mono">
            Баланс склада и остаток по планам
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- LMD Detailed Card -->
          <div
            class="p-3.5 rounded-xl border bg-slate-900/60 flex flex-col justify-between gap-3"
            :class="lmdDeficit > 0 ? 'border-red-500/40 bg-red-950/10' : 'border-ark-border'"
          >
            <div class="flex items-start gap-3">
              <ItemIcon item-id="4001" size="lg" :deficit="lmdDeficit > 0 ? lmdDeficit : undefined" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-xs text-slate-100">LMD (Юани Лунмэня)</h4>
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
                    :class="lmdDeficit > 0 ? 'bg-red-950/80 text-red-300 border-red-800' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'"
                  >
                    {{ lmdProgress }}%
                  </span>
                </div>

                <div class="mt-2 space-y-1 text-xs font-mono">
                  <div class="flex items-center justify-between text-slate-400">
                    <span>Накоплено на складе:</span>
                    <span class="font-bold text-slate-200">{{ lmdStock.toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-400">
                    <span>Всего надо по плану:</span>
                    <span class="font-semibold text-cyan-300">{{ lmdTotalNeeded.toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-ark-border/60">
                    <span class="text-slate-400">Осталось накопить:</span>
                    <span v-if="lmdDeficit > 0" class="font-bold text-red-400">
                      -{{ lmdDeficit.toLocaleString() }} LMD
                    </span>
                    <span v-else class="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle class="w-3.5 h-3.5" /> В наличии
                    </span>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="lmdDeficit > 0 ? 'bg-cyan-400' : 'bg-emerald-400'"
                    :style="{ width: `${lmdProgress}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- EXP Cards Detailed Card -->
          <div
            class="p-3.5 rounded-xl border bg-slate-900/60 flex flex-col justify-between gap-3"
            :class="expDeficit > 0 ? 'border-red-500/40 bg-red-950/10' : 'border-ark-border'"
          >
            <div class="flex items-start gap-3">
              <ItemIcon item-id="2004" size="lg" :deficit="expDeficit > 0 ? expDeficit : undefined" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-xs text-slate-100">Боевые записи (EXP)</h4>
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
                    :class="expDeficit > 0 ? 'bg-amber-950/80 text-amber-300 border-amber-800' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'"
                  >
                    {{ expProgress }}%
                  </span>
                </div>

                <div class="mt-2 space-y-1 text-xs font-mono">
                  <div class="flex items-center justify-between text-slate-400">
                    <span>Накоплено на складе:</span>
                    <span class="font-bold text-slate-200">{{ expStock.toLocaleString() }} EXP</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-400">
                    <span>Всего надо по плану:</span>
                    <span class="font-semibold text-amber-300">
                      {{ expTotalNeeded.toLocaleString() }} EXP (~{{ expStrategicRecords }} шт. T4 / ~{{ expTacticalRecords }} шт. T3)
                    </span>
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-ark-border/60">
                    <span class="text-slate-400">Осталось накопить:</span>
                    <span v-if="expDeficit > 0" class="font-bold text-red-400">
                      -{{ expDeficit.toLocaleString() }} EXP (~{{ expDeficitT4 }} T4 / ~{{ expDeficitT3 }} T3)
                    </span>
                    <span v-else class="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle class="w-3.5 h-3.5" /> В наличии
                    </span>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="expDeficit > 0 ? 'bg-amber-400' : 'bg-emerald-400'"
                    :style="{ width: `${expProgress}%` }"
                  ></div>
                </div>

                <!-- Stocked cards badges -->
                <div class="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                    T4 (2k): {{ cardStockT4 }} шт.
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">
                    T3 (1k): {{ cardStockT3 }} шт.
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300">
                    T2 (400): {{ cardStockT2 }} шт.
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    T1 (200): {{ cardStockT1 }} шт.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Materials deficit section title -->
      <div v-if="calc.directDeficit.length > 0" class="flex items-center justify-between pt-2">
        <h3 class="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
          <span>Материалы улучшения ({{ calc.directDeficit.length }})</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono">
          Дефицит: {{ calc.directDeficit.filter(d => d.deficit > 0).length }} шт.
        </span>
      </div>

      <div v-if="calc.directDeficit.length === 0 && lmdDeficit === 0 && expDeficit === 0" class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
        <CheckCircle class="w-12 h-12 mx-auto text-emerald-400 mb-2" />
        <h4 class="font-bold text-slate-200 text-base">Планы не настроены или все ресурсы собраны!</h4>
        <p class="text-xs mt-1">Добавьте оперативников во вкладке «Оперативники» для расчета необходимых ресурсов.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="item in calc.directDeficit"
          :key="item.itemId"
          class="bg-ark-card border rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-all shadow-sm"
          :class="[
            item.deficit > 0
              ? 'border-red-500/50 bg-red-950/15 shadow-red-950/20'
              : 'border-ark-border hover:border-slate-600',
          ]"
        >
          <div class="flex items-center gap-3">
            <ItemIcon
              :item-id="item.itemId"
              size="lg"
              :deficit="item.deficit > 0 ? item.deficit : undefined"
            />

            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-200 truncate" :title="gameData.getItem(item.itemId)?.name || item.itemId">
                {{ gameData.getItem(item.itemId)?.name || item.itemId }}
              </h4>

              <div class="mt-1 space-y-0.5 text-[11px] font-mono">
                <div class="flex items-center justify-between text-slate-400">
                  <span>Нужно:</span>
                  <span class="font-semibold text-slate-200">{{ item.needed }}</span>
                </div>
                <div class="flex items-center justify-between text-slate-400">
                  <span>Склад:</span>
                  <span class="font-semibold text-slate-300">{{ item.stock }}</span>
                </div>
                <div
                  class="flex items-center justify-between pt-0.5 border-t border-ark-border/60"
                  :class="item.deficit > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'"
                >
                  <span>Дефицит:</span>
                  <span>{{ item.deficit > 0 ? `-${item.deficit}` : '0' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom badges: Craftable & Penguin Stats Stage -->
          <div class="space-y-1.5 pt-1 border-t border-slate-800/80">
            <!-- If craftable: Interactive button to view recipe & ingredients farming -->
            <button
              v-if="item.craftable"
              type="button"
              class="text-[10px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-800/60 rounded px-2.5 py-1.5 flex items-center justify-between transition-colors w-full"
              @click.stop="openFarmingGuide(item.itemId, item.deficit)"
            >
              <span class="flex items-center gap-1.5 font-sans font-medium">
                <Hammer class="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Крафт из T3 (Мастерская)</span>
              </span>
              <span class="text-amber-300 text-[10px] font-mono font-semibold">
                {{ getRecommendedStage(item.itemId)?.sanityPerItem ? `~${getRecommendedStage(item.itemId)?.sanityPerItem} ⚡` : 'Рецепт →' }}
              </span>
            </button>

            <!-- Direct Farm stage if farmable on map -->
            <button
              v-if="item.deficit > 0 && getRecommendedStage(item.itemId) && !getRecommendedStage(item.itemId)?.isCraft"
              type="button"
              class="text-[10px] font-mono font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/80 rounded px-2.5 py-1.5 flex items-center justify-between transition-colors w-full"
              @click.stop="openFarmingGuide(item.itemId, item.deficit)"
            >
              <span class="flex items-center gap-1.5">
                <Zap class="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Фарм: {{ getRecommendedStage(item.itemId)?.stageCode }}</span>
              </span>
              <span class="text-slate-300 text-[9px]">~{{ getRecommendedStage(item.itemId)?.sanityPerItem }} ⚡/шт</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: FARM REQUIREMENTS (RESOLVED WITH CRAFTING & STAGE RECOMMENDATIONS) -->
    <div v-else-if="activeTab === 'farm'" class="space-y-4">
      <div class="p-4 bg-slate-900/80 rounded-xl border border-ark-border text-xs text-slate-300 flex items-start gap-3">
        <Wrench class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong class="text-cyan-300">План фарма базовых компонентов и лучшие карты:</strong>
          Калькулятор разложил сложные материалы на составляющие и подобрал лучшие карты на основе данных <b>Penguin Statistics</b> с расчетом требуемых заходов и затрат Sanity.
        </div>
      </div>

      <!-- Currency & EXP Farming Stage Recommendations -->
      <div v-if="lmdDeficit > 0 || expDeficit > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- CE-6 Card -->
        <div v-if="lmdDeficit > 0" class="bg-ark-card border border-cyan-500/40 bg-cyan-950/15 rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3">
          <div class="flex items-start gap-3">
            <ItemIcon item-id="4001" size="lg" :count="lmdDeficit" />
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-200 truncate">LMD (Юани Лунмэня)</h4>
              <div class="mt-1 text-xs font-mono">
                <span class="text-slate-400">Дефицит: </span>
                <strong class="text-cyan-400 text-sm font-bold">{{ lmdDeficit.toLocaleString() }} LMD</strong>
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                Склад: {{ lmdStock.toLocaleString() }}
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded text-xs">
                CE-6
              </span>
              <span class="text-[11px] text-slate-300 font-mono">~{{ planSanityEstimate.lmdRuns }} заходов</span>
            </div>
            <span class="text-amber-300 font-mono font-bold text-xs">~{{ planSanityEstimate.lmdSanity }} ⚡</span>
          </div>
        </div>

        <!-- LS-6 Card -->
        <div v-if="expDeficit > 0" class="bg-ark-card border border-amber-500/40 bg-amber-950/15 rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3">
          <div class="flex items-start gap-3">
            <ItemIcon item-id="2004" size="lg" :count="expDeficit" />
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-200 truncate">Опыт оперативников (EXP)</h4>
              <div class="mt-1 text-xs font-mono">
                <span class="text-slate-400">Дефицит: </span>
                <strong class="text-amber-400 text-sm font-bold">{{ expDeficit.toLocaleString() }} EXP</strong>
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                ~{{ expDeficitT4 }} шт. T4 книг &bull; Склад: {{ expStock.toLocaleString() }} EXP
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded text-xs">
                LS-6
              </span>
              <span class="text-[11px] text-slate-300 font-mono">~{{ planSanityEstimate.expRuns }} заходов</span>
            </div>
            <span class="text-amber-300 font-mono font-bold text-xs">~{{ planSanityEstimate.expSanity }} ⚡</span>
          </div>
        </div>
      </div>

      <!-- Materials Section Title -->
      <div v-if="calc.farmRequirements.length > 0" class="flex items-center justify-between pt-1">
        <h3 class="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Базовые материалы к фарму ({{ calc.farmRequirements.length }})</span>
        </h3>
      </div>

      <div v-if="calc.farmRequirements.length === 0 && lmdDeficit === 0 && expDeficit === 0" class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
        <CheckCircle class="w-12 h-12 mx-auto text-emerald-400 mb-2" />
        <h4 class="font-bold text-slate-200 text-base">Фарм базовых компонентов не требуется!</h4>
      </div>

      <div v-else-if="calc.farmRequirements.length === 0" class="p-8 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
        <CheckCircle class="w-10 h-10 mx-auto text-emerald-400 mb-2" />
        <h4 class="font-bold text-slate-200 text-sm">Все материалы улучшения собраны!</h4>
        <p class="text-xs text-slate-400 mt-1">Осталось добрать только LMD или EXP (см. рекомендации CE-6 / LS-6 выше).</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="farm in calc.farmRequirements"
          :key="farm.itemId"
          class="bg-ark-card border border-red-500/40 bg-red-950/10 rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3"
        >
          <div class="flex items-start gap-3">
            <ItemIcon
              :item-id="farm.itemId"
              size="lg"
              :count="farm.count"
            />

            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-200 truncate" :title="gameData.getItem(farm.itemId)?.name || farm.itemId">
                {{ gameData.getItem(farm.itemId)?.name || farm.itemId }}
              </h4>
              <div class="mt-1 text-xs font-mono">
                <span class="text-slate-400">Фармить: </span>
                <strong class="text-red-400 text-sm font-bold">{{ farm.count }} шт.</strong>
              </div>
              <div class="text-[10px] text-slate-500 font-mono">
                Склад: {{ inventory.getStock(farm.itemId) }}
              </div>
            </div>
          </div>

          <!-- Recommended stage badge from Penguin Stats -->
          <div v-if="getRecommendedStage(farm.itemId)" class="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400">Лучшая карта:</span>
              <button
                type="button"
                class="font-mono font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors"
                @click="openFarmingGuide(farm.itemId, farm.count)"
                title="Нажмите для подробной статистики всех карт"
              >
                <span>{{ getRecommendedStage(farm.itemId)?.stageCode }}</span>
                <span class="text-[10px] text-slate-400">({{ getRecommendedStage(farm.itemId)?.apCost }}⚡)</span>
              </button>
            </div>

            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Оценка:</span>
              <span class="text-amber-300 font-medium">
                ~{{ calculateFarmingEstimate(farm.itemId, farm.count)?.runs }} заходов &bull;
                ~{{ calculateFarmingEstimate(farm.itemId, farm.count)?.totalSanity }} ⚡
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: CRAFTING TREE -->
    <div v-else-if="activeTab === 'craftingTree'">
      <CraftingTree />
    </div>

    <!-- Detailed Farming Guide Modal -->
    <FarmingGuideModal
      :is-open="isFarmingGuideOpen"
      :item-id="selectedFarmingItemId"
      :needed-count="selectedFarmingNeededCount"
      @close="isFarmingGuideOpen = false"
    />
  </div>
</template>
