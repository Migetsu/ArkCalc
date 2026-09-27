<script setup lang="ts">
import { ref, computed } from 'vue';
import type { OperatorSummary } from '@/types/game';
import { useGameDataStore } from '@/stores/gamedata';
import { Target, ChevronUp } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    operator: OperatorSummary;
    compact?: boolean;
    initialElite?: number;
  }>(),
  {
    compact: false,
    initialElite: 0,
  }
);

const gameData = useGameDataStore();

const availablePhases = computed(() => {
  return props.operator.phases.map((phase, idx) => ({
    elite: idx,
    label: `E${idx}`,
    rangeId: phase.rangeId,
  }));
});

const selectedElite = ref<number>(
  Math.min(props.initialElite, Math.max(0, props.operator.phases.length - 1))
);

const currentRangeId = computed(() => {
  const phase = props.operator.phases[selectedElite.value];
  return phase?.rangeId || props.operator.phases[0]?.rangeId || '';
});

const currentRangeInfo = computed(() => {
  if (!currentRangeId.value) return null;
  return gameData.getRange(currentRangeId.value) || null;
});

// Detect if range expands between phases
const hasRangeGrowth = computed(() => {
  if (props.operator.phases.length <= 1) return false;
  const firstRange = props.operator.phases[0]?.rangeId;
  return props.operator.phases.some((p) => p.rangeId && p.rangeId !== firstRange);
});

// Grid calculations
const gridMatrix = computed(() => {
  const grids = currentRangeInfo.value?.grids || [];
  const set = new Set<string>();
  grids.forEach((g) => set.add(`${g.row},${g.col}`));

  const allRows = grids.map((g) => g.row).concat([0]);
  const allCols = grids.map((g) => g.col).concat([0]);

  const minRow = Math.min(...allRows);
  const maxRow = Math.max(...allRows);
  const minCol = Math.min(...allCols);
  const maxCol = Math.max(...allCols);

  const colsWide = maxRow - minRow + 1;
  const rowsHigh = maxCol - minCol + 1;

  const cells = [];
  for (let c = maxCol; c >= minCol; c--) {
    for (let r = minRow; r <= maxRow; r++) {
      const isOperator = r === 0 && c === 0;
      const inRange = set.has(`${r},${c}`);
      cells.push({
        key: `${r},${c}`,
        row: r,
        col: c,
        isOperator,
        inRange,
      });
    }
  }

  return {
    colsWide,
    rowsHigh,
    cells,
    tilesCount: grids.length,
  };
});
</script>

<template>
  <div class="p-4 bg-ark-card rounded-2xl border border-ark-border space-y-3">
    <!-- Header: Title, Elite Switcher, Stats -->
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
        <Target class="w-4 h-4 text-cyan-400" />
        {{ gameData.itemLanguage === 'ru' ? 'Дальность атаки (Range)' : 'Attack Range' }}
      </h4>

      <!-- Elite Phase Switcher (E0, E1, E2) -->
      <div v-if="availablePhases.length > 1" class="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-ark-border">
        <button
          v-for="p in availablePhases"
          :key="p.elite"
          type="button"
          class="px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all"
          :class="[
            selectedElite === p.elite
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200',
          ]"
          @click="selectedElite = p.elite"
        >
          {{ p.label }}
        </button>
      </div>

      <span class="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
        {{ gridMatrix.tilesCount }} {{ gameData.itemLanguage === 'ru' ? 'клеток' : 'tiles' }}
      </span>
    </div>

    <!-- Range Grid Visualizer -->
    <div class="flex flex-col items-center justify-center p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 min-h-[110px]">
      <div
        v-if="gridMatrix.cells.length > 0"
        class="inline-grid gap-1 p-2 rounded-lg bg-slate-900/40 border border-slate-800/40"
        :style="{
          gridTemplateColumns: `repeat(${gridMatrix.colsWide}, minmax(0, 1fr))`,
        }"
      >
        <div
          v-for="cell in gridMatrix.cells"
          :key="cell.key"
          class="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-all duration-150 relative text-[10px]"
          :class="[
            cell.isOperator
              ? 'bg-amber-400/25 border-2 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 z-10'
              : cell.inRange
              ? 'bg-cyan-500/25 border border-cyan-400/70 shadow-sm shadow-cyan-500/10'
              : 'border border-slate-800/30 bg-slate-900/20 opacity-30',
          ]"
          :title="cell.isOperator ? (gameData.itemLanguage === 'ru' ? 'Позиция оперативника' : 'Operator Position') : (cell.inRange ? (gameData.itemLanguage === 'ru' ? 'Клетка атаки' : 'Attack Tile') : '')"
        >
          <!-- Operator Indicator -->
          <template v-if="cell.isOperator">
            <ChevronUp class="w-4 h-4 stroke-[3] text-amber-300 drop-shadow" />
          </template>
          <!-- Attackable tile dot -->
          <template v-else-if="cell.inRange">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400/80"></span>
          </template>
        </div>
      </div>

      <div v-else class="text-xs text-slate-500 italic py-2">
        {{ gameData.itemLanguage === 'ru' ? 'Радиус атаки недоступен' : 'Range data not available' }}
      </div>

      <!-- Legend & Info -->
      <div class="mt-2.5 flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-wrap justify-center">
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded bg-amber-400/30 border border-amber-400 inline-block"></span>
          {{ gameData.itemLanguage === 'ru' ? 'Оперативник (Лицом вверх)' : 'Operator (Facing Up)' }}
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400 inline-block"></span>
          {{ gameData.itemLanguage === 'ru' ? 'Зона поражения' : 'Attack Zone' }}
        </span>
        <span v-if="hasRangeGrowth" class="text-cyan-300/80">
          {{ gameData.itemLanguage === 'ru' ? '✦ Зона расширяется с повышением элиты' : '✦ Range expands with promotion' }}
        </span>
      </div>
    </div>
  </div>
</template>
