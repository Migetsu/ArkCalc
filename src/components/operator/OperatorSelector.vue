<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { useGameDataStore } from '@/stores/gamedata';
import { usePlannerStore } from '@/stores/planner';
import type { OperatorSummary, Profession } from '@/types/game';
import OperatorCard from './OperatorCard.vue';
import PlanEditorModal from './PlanEditorModal.vue';
import OperatorDossierModal from './OperatorDossierModal.vue';
import { Search, Filter, UserCheck, X } from 'lucide-vue-next';
import {
  normalizeSearchString,
  transliterateRuToEn,
  POPULAR_OPERATOR_RU_ALIASES,
} from '@/data/materialTranslations';

import { useLocaleStore } from '@/stores/locale';

const gameData = useGameDataStore();
const planner = usePlannerStore();
const locale = useLocaleStore();

const searchQuery = ref('');
const selectedRarity = ref<number | null>(null);
const selectedProfession = ref<Profession | null>(null);
const selectedPlanFilter = ref<'all' | 'planned' | 'unplanned'>('all');

const selectedOperatorForEdit = ref<OperatorSummary | null>(null);
const isModalOpen = ref(false);

const selectedOperatorForDossier = ref<OperatorSummary | null>(null);
const isDossierOpen = ref(false);

function openDossier(op: OperatorSummary) {
  selectedOperatorForDossier.value = op;
  isDossierOpen.value = true;
}

function closeDossier() {
  isDossierOpen.value = false;
  selectedOperatorForDossier.value = null;
}

const professions = computed<{ id: Profession; label: string }[]>(() => [
  { id: 'PIONEER', label: locale.t('class.pioneer') },
  { id: 'WARRIOR', label: locale.t('class.warrior') },
  { id: 'TANK', label: locale.t('class.tank') },
  { id: 'SNIPER', label: locale.t('class.sniper') },
  { id: 'CASTER', label: locale.t('class.caster') },
  { id: 'MEDIC', label: locale.t('class.medic') },
  { id: 'SUPPORT', label: locale.t('class.support') },
  { id: 'SPECIAL', label: locale.t('class.special') },
]);

const filteredOperators = computed(() => {
  let list = gameData.operatorList;

  // Search filter (English & Russian transliteration/aliases)
  const rawQ = searchQuery.value.trim();
  if (rawQ) {
    const qNorm = normalizeSearchString(rawQ);
    const qTranslit = normalizeSearchString(transliterateRuToEn(rawQ));

    list = list.filter((op) => {
      const nameNorm = normalizeSearchString(op.name);
      const appNorm = normalizeSearchString(op.appellation);
      const ruAliases = POPULAR_OPERATOR_RU_ALIASES[op.id] || [];

      return (
        nameNorm.includes(qNorm) ||
        nameNorm.includes(qTranslit) ||
        appNorm.includes(qNorm) ||
        appNorm.includes(qTranslit) ||
        ruAliases.some((alias) => {
          const aNorm = normalizeSearchString(alias);
          return aNorm.includes(qNorm) || aNorm.includes(qTranslit);
        })
      );
    });
  }

  // Rarity filter
  if (selectedRarity.value !== null) {
    if (selectedRarity.value === 1) {
      // 1-2 stars grouped
      list = list.filter((op) => op.rarity <= 2);
    } else {
      list = list.filter((op) => op.rarity === selectedRarity.value);
    }
  }

  // Profession filter
  if (selectedProfession.value !== null) {
    list = list.filter((op) => op.profession === selectedProfession.value);
  }

  // Plan status filter
  if (selectedPlanFilter.value === 'planned') {
    list = list.filter((op) => !!planner.plans[op.id]);
  } else if (selectedPlanFilter.value === 'unplanned') {
    list = list.filter((op) => !planner.plans[op.id]);
  }

  return list;
});

// Grid columns responsive calculation
const containerWidth = ref(1200);
const columnsCount = computed(() => {
  if (containerWidth.value < 640) return 1;
  if (containerWidth.value < 1024) return 2;
  if (containerWidth.value < 1440) return 3;
  return 4;
});

const scrollerContainerRef = ref<HTMLElement | null>(null);

function updateWidth() {
  if (scrollerContainerRef.value) {
    containerWidth.value = scrollerContainerRef.value.clientWidth;
  }
}

onMounted(() => {
  updateWidth();
  window.addEventListener('resize', updateWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

// Chunk into virtual rows for RecycleScroller
interface RowItem {
  id: string;
  items: OperatorSummary[];
}

const chunkedRows = computed<RowItem[]>(() => {
  const cols = columnsCount.value;
  const list = filteredOperators.value;
  const rows: RowItem[] = [];

  for (let i = 0; i < list.length; i += cols) {
    const chunk = list.slice(i, i + cols);
    rows.push({
      id: `row-${chunk[0]?.id || i}-${cols}`,
      items: chunk,
    });
  }

  return rows;
});

function openPlanEditor(op: OperatorSummary) {
  selectedOperatorForEdit.value = op;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedOperatorForEdit.value = null;
}

function clearFilters() {
  searchQuery.value = '';
  selectedRarity.value = null;
  selectedProfession.value = null;
  selectedPlanFilter.value = 'all';
}
</script>

<template>
  <div class="flex flex-col h-full space-y-4" ref="scrollerContainerRef">
    <!-- Filters and Search Toolbar -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm space-y-3.5">
      <!-- Search and Status row -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="locale.t('op.searchPlaceholder')"
            class="w-full bg-slate-900 border border-ark-border rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            @click="searchQuery = ''"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Plan filter toggle buttons -->
        <div class="inline-flex w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-ark-border text-xs font-medium">
          <button
            type="button"
            class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center"
            :class="[selectedPlanFilter === 'all' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200']"
            @click="selectedPlanFilter = 'all'"
          >
            {{ locale.t('op.filterAll') }} ({{ gameData.operatorList.length }})
          </button>
          <button
            type="button"
            class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
            :class="[selectedPlanFilter === 'planned' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200']"
            @click="selectedPlanFilter = 'planned'"
          >
            <UserCheck class="w-3.5 h-3.5" />
            {{ locale.t('op.filterPlanned') }} ({{ planner.planCount }})
          </button>
          <button
            type="button"
            class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center"
            :class="[selectedPlanFilter === 'unplanned' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200']"
            @click="selectedPlanFilter = 'unplanned'"
          >
            {{ locale.t('op.filterUnplanned') }}
          </button>
        </div>
      </div>

      <!-- Class Filters Row -->
      <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
        <span class="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider flex-shrink-0">{{ locale.t('op.class') }}:</span>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all flex-shrink-0"
          :class="[
            selectedProfession === null
              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
          ]"
          @click="selectedProfession = null"
        >
          {{ locale.t('op.anyClass') }}
        </button>
        <button
          v-for="p in professions"
          :key="p.id"
          type="button"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all flex-shrink-0"
          :class="[
            selectedProfession === p.id
              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
          ]"
          @click="selectedProfession = selectedProfession === p.id ? null : p.id"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- Rarity Filters Row -->
      <div class="flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider flex-shrink-0">{{ locale.t('op.rarity') }}:</span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg border font-medium transition-all flex-shrink-0"
            :class="[
              selectedRarity === null
                ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
            ]"
            @click="selectedRarity = null"
          >
            {{ locale.t('op.allRarity') }}
          </button>
          <button
            v-for="r in [6, 5, 4, 3, 1]"
            :key="r"
            type="button"
            class="px-2.5 py-1 rounded-lg border font-mono font-bold transition-all flex-shrink-0"
            :class="[
              selectedRarity === r
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
            ]"
            @click="selectedRarity = selectedRarity === r ? null : r"
          >
            {{ r === 1 ? '1-2★' : `${r}★` }}
          </button>
        </div>

        <button
          v-if="searchQuery || selectedRarity !== null || selectedProfession !== null || selectedPlanFilter !== 'all'"
          type="button"
          class="text-xs text-slate-400 hover:text-cyan-400 underline underline-offset-2 flex-shrink-0"
          @click="clearFilters"
        >
          {{ locale.t('op.resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Scroller Area -->
    <div class="flex-1 min-h-[450px]">
      <div v-if="filteredOperators.length === 0" class="h-64 flex flex-col items-center justify-center text-center p-6 bg-ark-card rounded-2xl border border-ark-border">
        <Filter class="w-10 h-10 text-slate-600 mb-2" />
        <p class="text-slate-400 text-sm font-medium">{{ locale.t('op.notFound') }}</p>
        <button
          type="button"
          class="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold"
          @click="clearFilters"
        >
          {{ locale.t('op.resetAllFilters') }}
        </button>
      </div>

      <DynamicScroller
        v-else
        class="h-[calc(100vh-310px)] min-h-[500px] overflow-y-auto pr-1"
        :items="chunkedRows"
        :min-item-size="140"
        key-field="id"
      >
        <template #default="{ item: row, index, active }">
          <DynamicScrollerItem
            :item="row"
            :active="active"
            :size-dependencies="[row.items, planner.plans]"
            :data-index="index"
            class="pb-3"
          >
            <div
              class="grid gap-3"
              :style="{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }"
            >
              <OperatorCard
                v-for="op in row.items"
                :key="op.id"
                :operator="op"
                @edit="openPlanEditor"
                @dossier="openDossier"
              />
            </div>
          </DynamicScrollerItem>
        </template>
        <template #after>
          <div class="h-8"></div>
        </template>
      </DynamicScroller>
    </div>

    <!-- Plan Editor Modal -->
    <PlanEditorModal
      :operator="selectedOperatorForEdit"
      :is-open="isModalOpen"
      @close="closeModal"
    />

    <!-- Operator Dossier Modal (Option A) -->
    <OperatorDossierModal
      :operator="selectedOperatorForDossier"
      :is-open="isDossierOpen"
      @close="closeDossier"
      @open-plan="openPlanEditor"
    />
  </div>
</template>

<style scoped>
.vue-recycle-scroller {
  scrollbar-gutter: stable;
}
</style>
