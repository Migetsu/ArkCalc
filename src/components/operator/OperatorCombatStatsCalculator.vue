<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { OperatorSummary, OperatorModule } from '@/types/game';
import { useLocaleStore } from '@/stores/locale';
import {
  calculateOperatorStats,
  type CalculatedOperatorStats,
} from '@/services/operatorStatsCalculator';
import {
  Zap,
  Sparkles,
  Shield,
  Swords,
  Clock,
  Coins,
  Flame,
  Award,
  TrendingUp,
  RotateCcw,
} from 'lucide-vue-next';

const props = defineProps<{
  operator: OperatorSummary;
}>();

const locale = useLocaleStore();

const maxElite = computed(() => Math.max(0, props.operator.phases.length - 1));

// Controller state
const selectedElite = ref<number>(maxElite.value);
const selectedLevel = ref<number>(props.operator.phases[selectedElite.value]?.maxLevel || 90);
const selectedTrust = ref<number>(100);
const selectedPotential = ref<number>(1);
const selectedModuleId = ref<string>('none');
const selectedModuleStage = ref<number>(3);

// Watch for operator changes to reset defaults to max
watch(
  () => props.operator.id,
  () => {
    selectedElite.value = maxElite.value;
    selectedLevel.value = props.operator.phases[selectedElite.value]?.maxLevel || 90;
    selectedTrust.value = 100;
    selectedPotential.value = 1;
    selectedModuleId.value = props.operator.modules?.[0]?.id || 'none';
    selectedModuleStage.value = 3;
  },
  { immediate: true }
);

// When elite changes, clamp level to the new phase maxLevel
watch(selectedElite, (newElite) => {
  const maxLvl = props.operator.phases[newElite]?.maxLevel || 50;
  if (selectedLevel.value > maxLvl) {
    selectedLevel.value = maxLvl;
  }
});

const currentMaxLevel = computed(() => {
  return props.operator.phases[selectedElite.value]?.maxLevel || 50;
});

const currentSelectedModule = computed<OperatorModule | null>(() => {
  if (selectedModuleId.value === 'none' || !props.operator.modules) return null;
  return props.operator.modules.find((m) => m.id === selectedModuleId.value) || null;
});

// Computed stats using calculator service
const stats = computed<CalculatedOperatorStats>(() => {
  return calculateOperatorStats({
    operator: props.operator,
    elite: selectedElite.value,
    level: selectedLevel.value,
    trust: selectedTrust.value,
    potential: selectedPotential.value,
    module: currentSelectedModule.value,
    moduleStage: selectedModuleStage.value,
  });
});

// Preset helper functions
function applyPresetMin() {
  selectedElite.value = 0;
  selectedLevel.value = 1;
  selectedTrust.value = 0;
  selectedPotential.value = 1;
  selectedModuleId.value = 'none';
}

function applyPresetStandardMax() {
  selectedElite.value = maxElite.value;
  selectedLevel.value = currentMaxLevel.value;
  selectedTrust.value = 100;
  selectedPotential.value = 1;
  selectedModuleId.value = 'none';
}

function applyPresetMaxedOut() {
  selectedElite.value = maxElite.value;
  selectedLevel.value = currentMaxLevel.value;
  selectedTrust.value = 100;
  selectedPotential.value = 6;
  if (props.operator.modules && props.operator.modules.length > 0) {
    selectedModuleId.value = props.operator.modules[0].id;
    selectedModuleStage.value = 3;
  }
}
</script>

<template>
  <div class="bg-ark-card rounded-2xl border border-ark-border p-4 sm:p-5 space-y-4 shadow-sm">
    <!-- Header with Quick Presets -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ark-border/60">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 flex-shrink-0">
          <Zap class="w-4 h-4" />
        </div>
        <div>
          <h4 class="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
            <span>{{ locale.currentLang === 'ru' ? 'Калькулятор характеристик' : 'Combat Stats Calculator' }}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Live Interactive
            </span>
          </h4>
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500"
          @click="applyPresetMin"
          :title="locale.currentLang === 'ru' ? 'Сбросить на E0 Ур. 1' : 'Reset to E0 Lv. 1'"
        >
          {{ locale.currentLang === 'ru' ? 'Минимум (E0-1)' : 'Min (E0-1)' }}
        </button>

        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
          @click="applyPresetStandardMax"
          :title="locale.currentLang === 'ru' ? 'Макс. уровень, 100% доверие, без модулей' : 'Max Level, 100% Trust, No Module'"
        >
          {{ locale.currentLang === 'ru' ? 'Стандарт (E2 Max)' : 'Standard Max' }}
        </button>

        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1 shadow-sm"
          @click="applyPresetMaxedOut"
          :title="locale.currentLang === 'ru' ? 'E2 Max, 100% Доверие, Pot 6, Модуль 3 ур.' : 'E2 Max, 100% Trust, Pot 6, Module Stage 3'"
        >
          <Sparkles class="w-3 h-3 text-amber-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Максимум (Maxed)' : 'Maxed Out' }}</span>
        </button>
      </div>
    </div>

    <!-- STATS DASHBOARD DISPLAY GRID (8 CARDS) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <!-- 1. Max HP -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Здоровье (HP)' : 'Max HP' }}</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400">
            {{ stats.hp.toLocaleString() }}
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500 flex items-center gap-1 flex-wrap">
          <span>{{ stats.baseHp }}</span>
          <span v-if="stats.trustHp > 0" class="text-emerald-400">+{{ stats.trustHp }}</span>
          <span v-if="stats.modHp > 0" class="text-purple-400">+{{ stats.modHp }}</span>
          <span v-if="stats.potHp > 0" class="text-cyan-400">+{{ stats.potHp }}</span>
        </div>
      </div>

      <!-- 2. Attack (ATK) -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Атака (ATK)' : 'Attack (ATK)' }}</span>
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-red-400">
            {{ stats.atk.toLocaleString() }}
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500 flex items-center gap-1 flex-wrap">
          <span>{{ stats.baseAtk }}</span>
          <span v-if="stats.trustAtk > 0" class="text-red-400">+{{ stats.trustAtk }}</span>
          <span v-if="stats.modAtk > 0" class="text-purple-400">+{{ stats.modAtk }}</span>
          <span v-if="stats.potAtk > 0" class="text-cyan-400">+{{ stats.potAtk }}</span>
        </div>
      </div>

      <!-- 3. Defense (DEF) -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Защита (DEF)' : 'Defense (DEF)' }}</span>
          <span class="w-2 h-2 rounded-full bg-sky-400"></span>
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-sky-400">
            {{ stats.def.toLocaleString() }}
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500 flex items-center gap-1 flex-wrap">
          <span>{{ stats.baseDef }}</span>
          <span v-if="stats.trustDef > 0" class="text-sky-400">+{{ stats.trustDef }}</span>
          <span v-if="stats.modDef > 0" class="text-purple-400">+{{ stats.modDef }}</span>
          <span v-if="stats.potDef > 0" class="text-cyan-400">+{{ stats.potDef }}</span>
        </div>
      </div>

      <!-- 4. Resistance (RES) -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Сопротивление' : 'Resist (RES)' }}</span>
          <span class="w-2 h-2 rounded-full bg-purple-400"></span>
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-purple-400">
            {{ stats.res }}
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          <span>{{ stats.baseRes }}</span>
          <span v-if="stats.modRes > 0" class="text-purple-400"> +{{ stats.modRes }} (Mod)</span>
        </div>
      </div>

      <!-- 5. DP Cost -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Стоимость (DP)' : 'DP Cost' }}</span>
          <Coins class="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div class="my-1.5 flex items-baseline gap-2">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-400">
            {{ stats.cost }}
          </span>
          <span v-if="stats.potCost < 0" class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            {{ stats.potCost }} Pot
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          <span>{{ locale.currentLang === 'ru' ? 'База: ' : 'Base: ' }}{{ stats.baseCost }}</span>
        </div>
      </div>

      <!-- 6. Block Count -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Блокирование' : 'Block Count' }}</span>
          <Shield class="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-200">
            {{ stats.blockCnt }}
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          <span>{{ stats.baseBlockCnt }}</span>
          <span v-if="stats.modBlockCnt > 0" class="text-purple-400"> +{{ stats.modBlockCnt }} (Mod)</span>
        </div>
      </div>

      <!-- 7. Attack Interval & ASPD -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Интервал атаки' : 'Attack Time' }}</span>
          <Clock class="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-cyan-300">
            {{ stats.effectiveAttackInterval }}s
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          <span>ASPD: {{ stats.aspd }}</span>
        </div>
      </div>

      <!-- 8. Redeployment Time -->
      <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{{ locale.currentLang === 'ru' ? 'Возрождение' : 'Respawn Time' }}</span>
          <RotateCcw class="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div class="my-1.5 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-300">
            {{ stats.respawnTime }}s
          </span>
        </div>
        <div class="text-[10px] font-mono text-slate-500">
          <span>{{ stats.baseRespawnTime }}s</span>
          <span v-if="stats.potRespawnTime < 0" class="text-emerald-400"> {{ stats.potRespawnTime }}s</span>
        </div>
      </div>
    </div>

    <!-- Extra Metric Bar: Base DPS Estimation -->
    <div class="p-3 bg-slate-900/80 rounded-xl border border-ark-border/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div class="flex items-center gap-2">
        <Swords class="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span class="text-slate-300">
          {{ locale.currentLang === 'ru' ? 'Расчетный базовый DPS:' : 'Estimated Base DPS:' }}
        </span>
        <span class="text-sm font-black text-amber-300">~{{ stats.dps.toLocaleString() }} /s</span>
      </div>

      <div class="text-[11px] text-slate-400">
        <span>ATK {{ stats.atk }} &divide; {{ stats.effectiveAttackInterval }}s</span>
      </div>
    </div>

    <!-- INTERACTIVE SLIDERS & CONFIGURATION CONTROLS -->
    <div class="p-4 bg-slate-900/70 rounded-xl border border-ark-border space-y-4">
      <!-- 1. Elite Promotion Selector -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Award class="w-3.5 h-3.5 text-cyan-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Элита (Promotion):' : 'Elite Promotion:' }}</span>
        </label>

        <div class="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg transition-all"
            :class="[selectedElite === 0 ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
            @click="selectedElite = 0"
          >
            E0
          </button>
          <button
            v-if="maxElite >= 1"
            type="button"
            class="px-3.5 py-1.5 rounded-lg transition-all"
            :class="[selectedElite === 1 ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
            @click="selectedElite = 1"
          >
            E1
          </button>
          <button
            v-if="maxElite >= 2"
            type="button"
            class="px-3.5 py-1.5 rounded-lg transition-all"
            :class="[selectedElite === 2 ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-200']"
            @click="selectedElite = 2"
          >
            E2
          </button>
        </div>
      </div>

      <!-- 2. Level Slider Control -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="text-slate-300 font-bold flex items-center gap-1.5">
            <TrendingUp class="w-3.5 h-3.5 text-emerald-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Уровень оперативника:' : 'Operator Level:' }}</span>
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
              @click="selectedLevel = 1"
            >
              Lv. 1
            </button>
            <span class="text-sm font-black text-emerald-400">
              Lv. {{ selectedLevel }}
            </span>
            <span class="text-slate-500">/ {{ currentMaxLevel }}</span>
            <button
              type="button"
              class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
              @click="selectedLevel = currentMaxLevel"
            >
              Max
            </button>
          </div>
        </div>

        <input
          v-model.number="selectedLevel"
          type="range"
          min="1"
          :max="currentMaxLevel"
          step="1"
          class="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
        />
      </div>

      <!-- 3. Trust / Favor Slider Control -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="text-slate-300 font-bold flex items-center gap-1.5">
            <Flame class="w-3.5 h-3.5 text-amber-400" />
            <span>{{ locale.currentLang === 'ru' ? 'Доверие (Trust):' : 'Trust (Favor):' }}</span>
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
              @click="selectedTrust = 0"
            >
              0%
            </button>
            <span class="text-sm font-black text-amber-400">
              {{ selectedTrust }}%
            </span>
            <button
              type="button"
              class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
              @click="selectedTrust = 100"
            >
              100%
            </button>
          </div>
        </div>

        <input
          v-model.number="selectedTrust"
          type="range"
          min="0"
          max="100"
          step="5"
          class="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
        />
      </div>

      <!-- 4. Potential Selector (Pot 1..6) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        <label class="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Потенциал (Potential):' : 'Potential Rank:' }}</span>
        </label>

        <div class="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
          <button
            v-for="p in [1, 2, 3, 4, 5, 6]"
            :key="p"
            type="button"
            class="px-2.5 py-1 rounded-lg transition-all text-center"
            :class="[
              selectedPotential === p
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            ]"
            @click="selectedPotential = p"
            :title="`Potential ${p}`"
          >
            P{{ p }}
          </button>
        </div>
      </div>

      <!-- 5. Module Selector (If Operator has modules) -->
      <div
        v-if="operator.modules && operator.modules.length > 0"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80"
      >
        <label class="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Shield class="w-3.5 h-3.5 text-purple-400" />
          <span>{{ locale.currentLang === 'ru' ? 'Модуль (Module):' : 'Operator Module:' }}</span>
        </label>

        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            v-model="selectedModuleId"
            class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="none">{{ locale.currentLang === 'ru' ? 'Без модуля' : 'No Module' }}</option>
            <option
              v-for="mod in operator.modules"
              :key="mod.id"
              :value="mod.id"
            >
              {{ mod.formattedName || mod.name }}
            </option>
          </select>

          <!-- Module Stage (1, 2, 3) -->
          <div v-if="selectedModuleId !== 'none'" class="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono font-bold">
            <button
              v-for="st in [1, 2, 3]"
              :key="st"
              type="button"
              class="px-2 py-1 rounded transition-all"
              :class="[
                selectedModuleStage === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
              @click="selectedModuleStage = st"
            >
              St.{{ st }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
