<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  RECRUIT_TAG_DEFINITIONS,
  solveRecruitment,
  type ComboResult,
  type RecruitTagDefinition,
  type RecruitableOperator,
} from '@/services/recruitmentService';
import { useGameDataStore } from '@/stores/gamedata';
import type { OperatorSummary } from '@/types/game';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import { getOperatorLocalizationRu } from '@/data/translations/ruDatabase';
import OperatorDossierModal from '@/components/operator/OperatorDossierModal.vue';
import PlanEditorModal from '@/components/operator/PlanEditorModal.vue';
import {
  Radio,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  Info,
  Layers,
  Plus,
} from 'lucide-vue-next';

const gameData = useGameDataStore();

// Selected tags (max 5)
const selectedTags = ref<string[]>([]);

function toggleTag(tagId: string) {
  const idx = selectedTags.value.indexOf(tagId);
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1);
  } else {
    if (selectedTags.value.length < 5) {
      selectedTags.value.push(tagId);
    }
  }
}

function clearTags() {
  selectedTags.value = [];
}

function selectSingleHotTag(tagId: string) {
  selectedTags.value = [tagId];
}

// Categorized tag lists
const rarityTags = computed(() =>
  RECRUIT_TAG_DEFINITIONS.filter((t: RecruitTagDefinition) => t.category === 'rarity')
);
const positionTags = computed(() =>
  RECRUIT_TAG_DEFINITIONS.filter((t: RecruitTagDefinition) => t.category === 'position')
);
const classTags = computed(() =>
  RECRUIT_TAG_DEFINITIONS.filter((t: RecruitTagDefinition) => t.category === 'class')
);
const affixTags = computed(() =>
  RECRUIT_TAG_DEFINITIONS.filter((t: RecruitTagDefinition) => t.category === 'affix')
);

// Solve combinations
const allComboResults = computed<ComboResult[]>(() => {
  return solveRecruitment(selectedTags.value);
});

// Filter by guarantee level
type FilterTab = 'all' | '6star' | '5star' | '4star_plus' | 'robot' | 'normal';
const activeFilter = ref<FilterTab>('all');

const filteredComboResults = computed(() => {
  if (activeFilter.value === 'all') return allComboResults.value;
  return allComboResults.value.filter((r) => r.guaranteedType === activeFilter.value);
});

// Counts for filter pills
const counts = computed(() => {
  const res = allComboResults.value;
  return {
    all: res.length,
    '6star': res.filter((r) => r.guaranteedType === '6star').length,
    '5star': res.filter((r) => r.guaranteedType === '5star').length,
    '4star_plus': res.filter((r) => r.guaranteedType === '4star_plus').length,
    robot: res.filter((r) => r.guaranteedType === 'robot').length,
    normal: res.filter((r) => r.guaranteedType === 'normal').length,
  };
});

// Operator Dossier Modal
const selectedOperatorForDossier = ref<OperatorSummary | null>(null);
const isDossierOpen = ref(false);

function openDossierByCharId(charId: string) {
  const op = gameData.getOperator(charId);
  if (op) {
    selectedOperatorForDossier.value = op;
    isDossierOpen.value = true;
  }
}

function closeDossier() {
  isDossierOpen.value = false;
  selectedOperatorForDossier.value = null;
}

// Plan Editor Modal
const selectedOperatorForPlan = ref<OperatorSummary | null>(null);
const isPlanModalOpen = ref(false);

function openPlanModal(charId: string) {
  const op = gameData.getOperator(charId);
  if (op) {
    selectedOperatorForPlan.value = op;
    isPlanModalOpen.value = true;
  }
}

function closePlanModal() {
  isPlanModalOpen.value = false;
  selectedOperatorForPlan.value = null;
}

function handleDossierOpenPlan(op: OperatorSummary) {
  closeDossier();
  selectedOperatorForPlan.value = op;
  isPlanModalOpen.value = true;
}

// Name helper
function getDisplayName(op: RecruitableOperator): { ru: string; en: string } {
  const fullOp = gameData.getOperator(op.id);
  const ruDb = getOperatorLocalizationRu(op.id);
  const ru = ruDb?.nameRu || op.nameRu || fullOp?.name || op.nameEn;
  const en = fullOp?.appellation || op.nameEn;
  return { ru, en };
}

// Rarity style helpers
function getRarityBorder(rarity: number): string {
  switch (rarity) {
    case 6:
      return 'border-amber-500/70 shadow-amber-500/20';
    case 5:
      return 'border-purple-500/70 shadow-purple-500/20';
    case 4:
      return 'border-cyan-500/70 shadow-cyan-500/20';
    case 3:
      return 'border-slate-500/50 shadow-slate-500/10';
    case 2:
      return 'border-lime-500/50 shadow-lime-500/10';
    case 1:
      return 'border-emerald-500/70 shadow-emerald-500/20';
    default:
      return 'border-slate-700';
  }
}

function getRarityBadgeClass(rarity: number): string {
  switch (rarity) {
    case 6:
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    case 5:
      return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    case 4:
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
    case 3:
      return 'bg-slate-700/60 text-slate-300 border-slate-600';
    case 2:
      return 'bg-lime-950/60 text-lime-300 border-lime-800';
    case 1:
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
}

function getGuaranteeBadge(type: ComboResult['guaranteedType']) {
  switch (type) {
    case '6star':
      return {
        label: 'Гарантия 6★',
        class: 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/20',
        icon: '🌟',
      };
    case '5star':
      return {
        label: 'Гарантия 5★',
        class: 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-500/20',
        icon: '💎',
      };
    case '4star_plus':
      return {
        label: 'Гарантия 4★+',
        class: 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/20',
        icon: '🎯',
      };
    case 'robot':
      return {
        label: 'Робот 1★',
        class: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20',
        icon: '🤖',
      };
    default:
      return {
        label: 'Обычный (3★+)',
        class: 'bg-slate-800/80 border-slate-700 text-slate-400',
        icon: '⚪',
      };
  }
}

function getTagRu(tagId: string): string {
  const def = RECRUIT_TAG_DEFINITIONS.find((t: RecruitTagDefinition) => t.id === tagId);
  return def ? def.nameRu : tagId;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top Header Bar -->
    <div
      class="bg-ark-darker/90 border border-ark-border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
    >
      <div class="flex items-center gap-3.5">
        <div
          class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg flex-shrink-0"
        >
          <Radio class="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-wide">
              Калькулятор рекрутинга
            </h2>
            <span
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 uppercase"
            >
              Public Recruitment
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Выберите до 5 тегов из игры — алгоритм вычислит все гарантированные 4★, 5★ и 6★ комбинации
          </p>
        </div>
      </div>

      <!-- Controls: Pool badge, selected count, and reset button -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <!-- Pool Info Badge -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-ark-border text-xs font-semibold text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>База: 160 операторов</span>
        </div>

        <!-- Selected Tags Counter Badge -->
        <div
          class="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors"
          :class="[
            selectedTags.length === 5
              ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
              : selectedTags.length > 0
              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-500',
          ]"
        >
          Выбрано: {{ selectedTags.length }} / 5
        </div>

        <!-- Reset Button -->
        <button
          type="button"
          :disabled="selectedTags.length === 0"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
          :class="[
            selectedTags.length > 0
              ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/50 text-rose-300 cursor-pointer shadow-sm'
              : 'bg-slate-900/50 border-slate-800/80 text-slate-600 cursor-not-allowed',
          ]"
          @click="clearTags"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Сброс</span>
        </button>
      </div>
    </div>

    <!-- Tag Selection Matrix -->
    <div class="bg-ark-darker/70 border border-ark-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
      <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
        <span class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-cyan-400" />
          Сетка тегов рекрутинга
        </span>
        <span class="text-[11px] text-slate-500 normal-case font-normal hidden sm:inline">
          Нажмите на тег, чтобы добавить или исключить его
        </span>
      </div>

      <!-- Group 1: Qualification / Rarity -->
      <div class="space-y-1.5">
        <div class="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
          <span>👑</span>
          <span>Квалификация / Редкость</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="tag in rarityTags"
            :key="tag.id"
            type="button"
            :disabled="!selectedTags.includes(tag.id) && selectedTags.length >= 5"
            class="px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center relative overflow-hidden"
            :class="[
              selectedTags.includes(tag.id)
                ? 'bg-amber-500/25 border-amber-400 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50 font-bold'
                : selectedTags.length >= 5
                ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800 text-slate-500'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-500',
            ]"
            @click="toggleTag(tag.id)"
          >
            <div class="flex items-center justify-between w-full">
              <span class="text-xs sm:text-sm font-semibold truncate">{{ tag.nameRu }}</span>
              <CheckCircle2 v-if="selectedTags.includes(tag.id)" class="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            </div>
            <span class="text-[10px] text-slate-400 font-mono tracking-tight">{{ tag.nameEn }}</span>
          </button>
        </div>
      </div>

      <!-- Group 2: Position -->
      <div class="space-y-1.5 pt-1">
        <div class="text-[11px] font-bold text-rose-400/90 uppercase tracking-wider flex items-center gap-1.5">
          <span>🏹</span>
          <span>Позиция</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="tag in positionTags"
            :key="tag.id"
            type="button"
            :disabled="!selectedTags.includes(tag.id) && selectedTags.length >= 5"
            class="px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center relative overflow-hidden"
            :class="[
              selectedTags.includes(tag.id)
                ? 'bg-rose-500/25 border-rose-400 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-400/50 font-bold'
                : selectedTags.length >= 5
                ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800 text-slate-500'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-500',
            ]"
            @click="toggleTag(tag.id)"
          >
            <div class="flex items-center justify-between w-full">
              <span class="text-xs sm:text-sm font-semibold truncate">{{ tag.nameRu }}</span>
              <CheckCircle2 v-if="selectedTags.includes(tag.id)" class="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            </div>
            <span class="text-[10px] text-slate-400 font-mono tracking-tight">{{ tag.nameEn }}</span>
          </button>
        </div>
      </div>

      <!-- Group 3: Profession / Class -->
      <div class="space-y-1.5 pt-1">
        <div class="text-[11px] font-bold text-cyan-400/90 uppercase tracking-wider flex items-center gap-1.5">
          <span>🛡️</span>
          <span>Класс оперативника</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <button
            v-for="tag in classTags"
            :key="tag.id"
            type="button"
            :disabled="!selectedTags.includes(tag.id) && selectedTags.length >= 5"
            class="px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center relative overflow-hidden"
            :class="[
              selectedTags.includes(tag.id)
                ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50 font-bold'
                : selectedTags.length >= 5
                ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800 text-slate-500'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-500',
            ]"
            @click="toggleTag(tag.id)"
          >
            <div class="flex items-center justify-between w-full">
              <span class="text-xs font-semibold truncate">{{ tag.nameRu }}</span>
              <CheckCircle2 v-if="selectedTags.includes(tag.id)" class="w-3 h-3 text-cyan-400 flex-shrink-0" />
            </div>
            <span class="text-[9px] text-slate-400 font-mono tracking-tight truncate">{{ tag.nameEn }}</span>
          </button>
        </div>
      </div>

      <!-- Group 4: Affixes / Functions -->
      <div class="space-y-1.5 pt-1">
        <div class="text-[11px] font-bold text-teal-400/90 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡</span>
          <span>Особенности и тактические свойства</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            v-for="tag in affixTags"
            :key="tag.id"
            type="button"
            :disabled="!selectedTags.includes(tag.id) && selectedTags.length >= 5"
            class="px-2.5 py-2 rounded-xl text-left border transition-all flex flex-col justify-center relative overflow-hidden"
            :class="[
              selectedTags.includes(tag.id)
                ? 'bg-teal-500/25 border-teal-400 text-white shadow-md shadow-teal-500/20 ring-1 ring-teal-400/50 font-bold'
                : selectedTags.length >= 5
                ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-800 text-slate-500'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-500',
            ]"
            @click="toggleTag(tag.id)"
          >
            <div class="flex items-center justify-between w-full">
              <span class="text-xs font-semibold truncate">{{ tag.nameRu }}</span>
              <CheckCircle2 v-if="selectedTags.includes(tag.id)" class="w-3 h-3 text-teal-400 flex-shrink-0" />
            </div>
            <span class="text-[9px] text-slate-400 font-mono tracking-tight truncate">{{ tag.nameEn }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Rules Reminder Banner -->
    <div
      class="bg-gradient-to-r from-slate-900 via-ark-darker to-slate-900 border border-ark-border rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300"
    >
      <div class="flex items-center gap-2">
        <Clock class="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          <strong class="text-cyan-300">Правило 9:00:</strong> Всегда выставляйте таймер на
          <strong class="text-white">9 часов</strong> для гарантированных 4★, 5★ и 6★ (это полностью исключает выпадение 1★ и 2★).
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Info class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          <strong class="text-emerald-300">Для роботов:</strong> Если выбран тег «Робот», ставьте ровно
          <strong class="text-white">3:50</strong>!
        </span>
      </div>
    </div>

    <!-- Empty State / Hot Tags -->
    <div
      v-if="selectedTags.length === 0"
      class="bg-ark-darker/60 border border-ark-border rounded-2xl p-6 sm:p-8 text-center space-y-4"
    >
      <div class="w-14 h-14 mx-auto rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
        <Sparkles class="w-7 h-7" />
      </div>
      <div>
        <h3 class="text-base sm:text-lg font-bold text-slate-200">
          Выберите выпавшие теги в сетке выше
        </h3>
        <p class="text-xs text-slate-400 max-w-lg mx-auto mt-1">
          Калькулятор рассчитает все комбинации одиночных, парных и тройных тегов и мгновенно покажет гарантированные результаты.
        </p>
      </div>

      <!-- Hot Tags shortcuts -->
      <div class="pt-2 max-w-xl mx-auto space-y-2">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
          Теги, которые дают гарантию сами по себе:
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/50 text-purple-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="selectSingleHotTag('Crowd-Control')"
          >
            <span>💎 Контроль</span>
            <span class="text-[10px] text-purple-400 font-mono">(5★)</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="selectSingleHotTag('Debuff')"
          >
            <span>🎯 Ослабление</span>
            <span class="text-[10px] text-cyan-400 font-mono">(4★+)</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="selectSingleHotTag('Fast-Redeploy')"
          >
            <span>🎯 Быстрый откат</span>
            <span class="text-[10px] text-cyan-400 font-mono">(4★+)</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="selectSingleHotTag('Shift')"
          >
            <span>🎯 Смещение</span>
            <span class="text-[10px] text-cyan-400 font-mono">(4★+)</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="selectSingleHotTag('Nuker')"
          >
            <span>🎯 Взрывной урон</span>
            <span class="text-[10px] text-cyan-400 font-mono">(4★+)</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            @click="selectSingleHotTag('Robot')"
          >
            <span>🤖 Робот</span>
            <span class="text-[10px] text-emerald-400 font-mono">(1★)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-else class="space-y-4">
      <!-- Filter Tabs / Pills -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ark-border pb-3">
        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <!-- All -->
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
            :class="[
              activeFilter === 'all'
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200',
            ]"
            @click="activeFilter = 'all'"
          >
            <span>Все комбинации</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              {{ counts.all }}
            </span>
          </button>

          <!-- 6-star -->
          <button
            v-if="counts['6star'] > 0"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
            :class="[
              activeFilter === '6star'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-300',
            ]"
            @click="activeFilter = '6star'"
          >
            <span>🌟 Гарантия 6★</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
              {{ counts['6star'] }}
            </span>
          </button>

          <!-- 5-star -->
          <button
            v-if="counts['5star'] > 0"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
            :class="[
              activeFilter === '5star'
                ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-purple-300',
            ]"
            @click="activeFilter = '5star'"
          >
            <span>💎 Гарантия 5★</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
              {{ counts['5star'] }}
            </span>
          </button>

          <!-- 4-star+ -->
          <button
            v-if="counts['4star_plus'] > 0"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
            :class="[
              activeFilter === '4star_plus'
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-cyan-300',
            ]"
            @click="activeFilter = '4star_plus'"
          >
            <span>🎯 Гарантия 4★+</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              {{ counts['4star_plus'] }}
            </span>
          </button>

          <!-- Robot -->
          <button
            v-if="counts.robot > 0"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
            :class="[
              activeFilter === 'robot'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-emerald-300',
            ]"
            @click="activeFilter = 'robot'"
          >
            <span>🤖 Роботы (1★)</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              {{ counts.robot }}
            </span>
          </button>

          <!-- Normal -->
          <button
            v-if="counts.normal > 0"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
            :class="[
              activeFilter === 'normal'
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300',
            ]"
            @click="activeFilter = 'normal'"
          >
            <span>Обычные (3★+)</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
              {{ counts.normal }}
            </span>
          </button>
        </div>

        <div class="text-xs text-slate-400 font-mono">
          Найдено: <strong class="text-white">{{ filteredComboResults.length }}</strong> комбо
        </div>
      </div>

      <!-- Combo Cards List -->
      <div v-if="filteredComboResults.length === 0" class="p-8 text-center text-slate-500 text-xs">
        В этой категории нет комбинаций. Выберите другую категорию фильтра выше.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(comboRes, cIdx) in filteredComboResults"
          :key="cIdx"
          class="bg-ark-darker/90 border rounded-2xl p-4 sm:p-5 transition-all shadow-md relative overflow-hidden"
          :class="[
            comboRes.guaranteedType === '6star'
              ? 'border-amber-500/60 shadow-amber-500/10 bg-gradient-to-r from-amber-950/20 via-ark-darker to-ark-darker'
              : comboRes.guaranteedType === '5star'
              ? 'border-purple-500/60 shadow-purple-500/10 bg-gradient-to-r from-purple-950/20 via-ark-darker to-ark-darker'
              : comboRes.guaranteedType === '4star_plus'
              ? 'border-cyan-500/50 shadow-cyan-500/10 bg-gradient-to-r from-cyan-950/20 via-ark-darker to-ark-darker'
              : comboRes.guaranteedType === 'robot'
              ? 'border-emerald-500/50 shadow-emerald-500/10 bg-gradient-to-r from-emerald-950/20 via-ark-darker to-ark-darker'
              : 'border-ark-border/80',
          ]"
        >
          <!-- Combo Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
            <!-- Selected Tags Pill List -->
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                v-for="t in comboRes.combo"
                :key="t"
                class="px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 shadow-sm"
                :class="[
                  t === 'Top Operator'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : t === 'Senior Operator'
                    ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200',
                ]"
              >
                <span>{{ getTagRu(t) }}</span>
                <span class="text-[9px] text-slate-400 font-mono tracking-tight font-normal">({{ t }})</span>
              </span>
            </div>

            <!-- Guarantee Badge & Recommended Time -->
            <div class="flex items-center gap-2 self-start sm:self-auto">
              <!-- Guarantee Badge -->
              <span
                class="px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 font-mono"
                :class="getGuaranteeBadge(comboRes.guaranteedType).class"
              >
                <span>{{ getGuaranteeBadge(comboRes.guaranteedType).icon }}</span>
                <span>{{ getGuaranteeBadge(comboRes.guaranteedType).label }}</span>
              </span>

              <!-- Recommended Time -->
              <span
                class="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center gap-1"
                title="Рекомендуемый таймер найма"
              >
                <Clock class="w-3 h-3 text-cyan-400" />
                <span>{{ comboRes.recommendedTime }}</span>
              </span>
            </div>
          </div>

          <!-- Matching Operators Grid -->
          <div class="pt-3.5">
            <div class="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>Возможные операторы ({{ comboRes.operators.length }}):</span>
              <span class="text-[10px] text-slate-500">Нажмите на карточку для открытия досье</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              <div
                v-for="op in comboRes.operators"
                :key="op.id"
                class="group bg-slate-900/80 hover:bg-slate-800/90 border rounded-xl p-2 transition-all flex flex-col justify-between cursor-pointer relative shadow-sm"
                :class="getRarityBorder(op.rarity)"
                @click="openDossierByCharId(op.id)"
              >
                <!-- Operator Avatar & Rarity Badge -->
                <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-950 mb-1.5">
                  <img
                    :src="getAvatarUrl(op.id)"
                    :alt="op.nameEn"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
                  />
                  <!-- Rarity badge on avatar -->
                  <div
                    class="absolute top-1 right-1 px-1 py-0.2 rounded text-[10px] font-mono font-black border"
                    :class="getRarityBadgeClass(op.rarity)"
                  >
                    {{ op.rarity }}★
                  </div>

                  <!-- Quick Add to Plan Button -->
                  <button
                    type="button"
                    title="Добавить в план прокачки"
                    class="absolute bottom-1 right-1 w-6 h-6 rounded-md bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                    @click.stop="openPlanModal(op.id)"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Operator Name -->
                <div class="space-y-0.5">
                  <div class="text-xs font-bold text-slate-100 group-hover:text-cyan-300 truncate transition-colors">
                    {{ getDisplayName(op).ru }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono truncate">
                    {{ getDisplayName(op).en }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dossier Modal -->
    <OperatorDossierModal
      :operator="selectedOperatorForDossier"
      :is-open="isDossierOpen"
      @close="closeDossier"
      @open-plan="handleDossierOpenPlan"
    />

    <!-- Plan Editor Modal -->
    <PlanEditorModal
      :operator="selectedOperatorForPlan"
      :is-open="isPlanModalOpen"
      @close="closePlanModal"
    />
  </div>
</template>
