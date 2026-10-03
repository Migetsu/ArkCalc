<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import ItemIcon from '@/components/common/ItemIcon.vue';
import {
  optimizeFarmingPlan,
  type OptimizerOptions,
} from '@/services/farmingOptimizerService';
import {
  Sparkles,
  Sliders,
  Hammer,
  ArrowRight,
  ExternalLink,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-vue-next';

const props = defineProps<{
  requirements: { itemId: string; count: number }[];
}>();

const emit = defineEmits<{
  (e: 'openGuide', itemId: string, count: number): void;
}>();

const locale = useLocaleStore();

// Optimizer settings state
const mode = ref<'synergy' | 'isolated'>('synergy');
const maxChapter = ref<number>(99);
const prefer1_7 = ref<boolean>(true);
const isSettingsOpen = ref<boolean>(false);

// Local state for tracking completed stages by user
const completedStages = ref<Record<string, boolean>>({});

function toggleStageComplete(stageCode: string) {
  completedStages.value[stageCode] = !completedStages.value[stageCode];
}

const optimizationResult = computed(() => {
  const options: OptimizerOptions = {
    mode: mode.value,
    maxChapter: maxChapter.value,
    prefer1_7: prefer1_7.value,
  };
  return optimizeFarmingPlan(props.requirements, options);
});

function handleOpenGuide(itemId: string, count: number) {
  emit('openGuide', itemId, count);
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

        <!-- Settings Dropdown Toggle & Chapter Pill -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl border border-ark-border bg-slate-900/90 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 flex items-center gap-1.5 transition-all shadow-sm"
            @click="isSettingsOpen = !isSettingsOpen"
          >
            <Sliders class="w-3.5 h-3.5 text-cyan-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Параметры карт' : 'Stage Settings' }}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {{ maxChapter >= 99 ? (locale.currentLang === 'ru' ? 'Все главы' : 'All Ch.') : `Ch. ${maxChapter}` }}
            </span>
            <ChevronDown class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-180': isSettingsOpen }" />
          </button>
        </div>
      </div>

      <!-- Expandable Settings Panel -->
      <div v-if="isSettingsOpen" class="pt-3 border-t border-ark-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
        <!-- Max Chapter Filter -->
        <div class="space-y-1.5">
          <label class="font-bold text-slate-300 flex items-center gap-1.5">
            <span>{{ locale.currentLang === 'ru' ? 'Максимальная доступная глава:' : 'Maximum Available Chapter:' }}</span>
          </label>
          <select
            v-model="maxChapter"
            class="w-full bg-slate-900 border border-ark-border rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
          >
            <option :value="99">{{ locale.currentLang === 'ru' ? 'Все доступные главы (актуальный эндгейм 14+)' : 'All Chapters (Latest Endgame 14+)' }}</option>
            <option :value="14">{{ locale.currentLang === 'ru' ? 'До 14 главы включительно' : 'Up to Chapter 14' }}</option>
            <option :value="10">{{ locale.currentLang === 'ru' ? 'До 10 главы включительно' : 'Up to Chapter 10' }}</option>
            <option :value="7">{{ locale.currentLang === 'ru' ? 'До 7 главы (Середина сюжета)' : 'Up to Chapter 7 (Mid-game)' }}</option>
            <option :value="4">{{ locale.currentLang === 'ru' ? 'До 4 главы (Ранняя игра / Новичок)' : 'Up to Chapter 4 (Early game)' }}</option>
          </select>
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

    <!-- STAGE ROUTE CHECKLIST (Карточки маршрута) -->
    <div class="space-y-3">
      <div class="flex items-center justify-between pt-1">
        <h3 class="font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>
            {{ mode === 'synergy'
              ? (locale.currentLang === 'ru' ? 'Оптимальный маршрут фарма' : 'Optimized Farming Route')
              : (locale.currentLang === 'ru' ? 'Прямой маршрут фарма' : 'Direct Farming Route')
            }} ({{ optimizationResult.routes.length }})
          </span>
        </h3>
        <span class="text-xs text-slate-400 font-mono">
          {{ locale.currentLang === 'ru' ? 'Нажмите галочку, если стадия пройдена' : 'Check off stages as you complete them' }}
        </span>
      </div>

      <!-- Route Cards -->
      <div class="space-y-3">
        <div
          v-for="(route, idx) in optimizationResult.routes"
          :key="route.stageCode"
          class="bg-ark-card border rounded-2xl p-4 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          :class="[
            completedStages[route.stageCode]
              ? 'opacity-60 border-emerald-900/60 bg-emerald-950/10'
              : 'border-ark-border hover:border-slate-600 bg-ark-card',
          ]"
        >
          <!-- Left: Stage Code, Order & Tag -->
          <div class="flex items-center gap-3 min-w-[200px]">
            <button
              type="button"
              class="w-7 h-7 rounded-lg border flex items-center justify-center transition-all flex-shrink-0"
              :class="[
                completedStages[route.stageCode]
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-cyan-500 hover:text-cyan-400'
              ]"
              @click="toggleStageComplete(route.stageCode)"
              :title="locale.currentLang === 'ru' ? 'Отметить как завершенную' : 'Mark as complete'"
            >
              <Check v-if="completedStages[route.stageCode]" class="w-4 h-4 stroke-[3]" />
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
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
                  Ch. {{ route.chapter }}
                </span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5 font-medium">
                {{ locale.currentLang === 'ru' ? route.tagRu : route.tagEn }}
              </div>
            </div>
          </div>

          <!-- Middle: Primary Target & Synergy Byproducts -->
          <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-4 py-2 border-y sm:border-y-0 sm:border-x border-ark-border/60 sm:px-4">
            <!-- Primary Target -->
            <div class="flex items-center gap-2.5 flex-shrink-0">
              <ItemIcon :item-id="route.primaryDrop.itemId" size="md" />
              <div>
                <div class="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                  {{ locale.currentLang === 'ru' ? 'Основная цель:' : 'Primary Target:' }}
                </div>
                <div class="text-xs font-mono font-bold text-slate-200">
                  <span class="text-red-400 font-black">+{{ route.primaryDrop.targetCount }}</span>
                  <span class="text-slate-400 text-[10px] ml-1">({{ route.primaryDrop.dropRate }}%)</span>
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

          <!-- Right: Runs, Sanity, LMD & Action -->
          <div class="flex items-center justify-between md:justify-end gap-4 min-w-[210px] flex-shrink-0">
            <div class="text-right font-mono">
              <div class="text-xs font-bold text-amber-300">
                ~{{ route.totalSanity.toLocaleString() }} ⚡
              </div>
              <div class="text-[11px] text-slate-300">
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
