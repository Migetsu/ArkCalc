<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import type { OperatorSummary, Profession } from '@/types/game';
import OperatorDossierModal from '@/components/operator/OperatorDossierModal.vue';
import PlanEditorModal from '@/components/operator/PlanEditorModal.vue';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import {
  normalizeSearchString,
  transliterateRuToEn,
  POPULAR_OPERATOR_RU_ALIASES,
  getArchetypeName,
  getProfessionName,
} from '@/data/materialTranslations';
import { Search, Filter, BookOpen, X, Swords, Shield, Heart } from 'lucide-vue-next';

const gameData = useGameDataStore();

const searchQuery = ref('');
const selectedRarity = ref<number | null>(null);
const selectedProfession = ref<Profession | null>(null);

const selectedOperatorForDossier = ref<OperatorSummary | null>(null);
const isDossierOpen = ref(false);

const selectedOperatorForPlan = ref<OperatorSummary | null>(null);
const isPlanModalOpen = ref(false);

const professions: { id: Profession; label: string }[] = [
  { id: 'PIONEER', label: 'Vanguard' },
  { id: 'WARRIOR', label: 'Guard' },
  { id: 'TANK', label: 'Defender' },
  { id: 'SNIPER', label: 'Sniper' },
  { id: 'CASTER', label: 'Caster' },
  { id: 'MEDIC', label: 'Medic' },
  { id: 'SUPPORT', label: 'Supporter' },
  { id: 'SPECIAL', label: 'Specialist' },
];

const filteredOperators = computed(() => {
  let list = gameData.operatorList;

  // Search filter
  const rawQ = searchQuery.value.trim();
  if (rawQ) {
    const qNorm = normalizeSearchString(rawQ);
    const qTranslit = normalizeSearchString(transliterateRuToEn(rawQ));

    list = list.filter((op) => {
      const nameNorm = normalizeSearchString(op.name);
      const appNorm = normalizeSearchString(op.appellation);
      const archEnNorm = normalizeSearchString(getArchetypeName(op.subProfessionId, 'en'));
      const archRuNorm = normalizeSearchString(getArchetypeName(op.subProfessionId, 'ru'));
      const ruAliases = POPULAR_OPERATOR_RU_ALIASES[op.id] || [];

      return (
        nameNorm.includes(qNorm) ||
        nameNorm.includes(qTranslit) ||
        appNorm.includes(qNorm) ||
        appNorm.includes(qTranslit) ||
        archEnNorm.includes(qNorm) ||
        archEnNorm.includes(qTranslit) ||
        archRuNorm.includes(qNorm) ||
        archRuNorm.includes(qTranslit) ||
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
      list = list.filter((op) => op.rarity <= 2);
    } else {
      list = list.filter((op) => op.rarity === selectedRarity.value);
    }
  }

  // Profession filter
  if (selectedProfession.value !== null) {
    list = list.filter((op) => op.profession === selectedProfession.value);
  }

  return list;
});

function openDossier(op: OperatorSummary) {
  selectedOperatorForDossier.value = op;
  isDossierOpen.value = true;
}

function closeDossier() {
  isDossierOpen.value = false;
  selectedOperatorForDossier.value = null;
}

function openPlanFromDossier(op: OperatorSummary) {
  closeDossier();
  selectedOperatorForPlan.value = op;
  isPlanModalOpen.value = true;
}

function closePlanModal() {
  isPlanModalOpen.value = false;
  selectedOperatorForPlan.value = null;
}

function clearFilters() {
  searchQuery.value = '';
  selectedRarity.value = null;
  selectedProfession.value = null;
}

function getRarityColor(rarity: number) {
  switch (rarity) {
    case 6:
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 5:
      return 'text-amber-200 bg-amber-300/10 border-amber-300/20';
    case 4:
      return 'text-purple-300 bg-purple-400/10 border-purple-400/20';
    case 3:
      return 'text-sky-300 bg-sky-400/10 border-sky-400/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Wiki Header & Filters Toolbar -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm space-y-3.5">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <BookOpen class="w-5 h-5 text-cyan-400" />
          <h2 class="font-extrabold text-slate-100 text-base">
            {{ gameData.itemLanguage === 'ru' ? 'База знаний • Досье оперативников' : 'Operator Archive & Dossier' }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <!-- Quick Language Switcher -->
          <div class="inline-flex bg-slate-900 p-0.5 rounded-lg border border-ark-border">
            <button
              type="button"
              class="px-2 py-0.5 rounded text-[11px] font-bold transition-all"
              :class="gameData.itemLanguage === 'ru' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
              @click="gameData.setItemLanguage('ru')"
            >
              RU
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded text-[11px] font-bold transition-all"
              :class="gameData.itemLanguage === 'en' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
              @click="gameData.setItemLanguage('en')"
            >
              EN
            </button>
          </div>

          <span class="text-xs font-mono text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-xl border border-ark-border">
            {{ gameData.itemLanguage === 'ru' ? 'Найдено' : 'Found' }}: {{ filteredOperators.length }} / {{ gameData.operatorList.length }}
          </span>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="gameData.itemLanguage === 'ru' ? 'Поиск по имени оперативника или названию архетипа...' : 'Search by operator name or archetype...'"
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

      <!-- Class Filters Row -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span class="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider flex-shrink-0">
          {{ gameData.itemLanguage === 'ru' ? 'Класс:' : 'Class:' }}
        </span>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all flex-shrink-0"
          :class="[
            selectedProfession === null
              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 shadow-sm'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
          ]"
          @click="selectedProfession = null"
        >
          {{ gameData.itemLanguage === 'ru' ? 'Все классы' : 'All Classes' }}
        </button>
        <button
          v-for="p in professions"
          :key="p.id"
          type="button"
          class="px-2.5 py-1 rounded-lg border font-medium transition-all flex-shrink-0"
          :class="[
            selectedProfession === p.id
              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 shadow-sm'
              : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:bg-slate-800',
          ]"
          @click="selectedProfession = selectedProfession === p.id ? null : p.id"
        >
          {{ getProfessionName(p.id, gameData.itemLanguage) }}
        </button>
      </div>

      <!-- Rarity Filters Row -->
      <div class="flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider flex-shrink-0">
            {{ gameData.itemLanguage === 'ru' ? 'Редкость:' : 'Rarity:' }}
          </span>
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
            {{ gameData.itemLanguage === 'ru' ? 'Все' : 'All' }}
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
          v-if="searchQuery || selectedRarity !== null || selectedProfession !== null"
          type="button"
          class="text-xs text-slate-400 hover:text-cyan-400 underline underline-offset-2 flex-shrink-0"
          @click="clearFilters"
        >
          {{ gameData.itemLanguage === 'ru' ? 'Сбросить фильтры' : 'Reset filters' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredOperators.length === 0"
      class="h-64 flex flex-col items-center justify-center text-center p-6 bg-ark-card rounded-2xl border border-ark-border"
    >
      <Filter class="w-10 h-10 text-slate-600 mb-2" />
      <p class="text-slate-400 text-sm font-medium">Оперативники по заданным критериям не найдены.</p>
      <button
        type="button"
        class="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold"
        @click="clearFilters"
      >
        Сбросить фильтры
      </button>
    </div>

    <!-- Operators Wiki Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5"
    >
      <div
        v-for="op in filteredOperators"
        :key="op.id"
        class="group bg-ark-card/90 hover:bg-ark-card border border-ark-border hover:border-cyan-500/50 rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-cyan-500/5 cursor-pointer flex flex-col justify-between space-y-3"
        @click="openDossier(op)"
      >
        <!-- Top Info Row -->
        <div class="flex items-start gap-3">
          <div class="w-14 h-14 rounded-xl overflow-hidden border border-ark-border bg-slate-900 flex-shrink-0 group-hover:border-cyan-500/50 transition-colors shadow">
            <img
              :src="getAvatarUrl(op.id)"
              :alt="op.name"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform"
              @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <h3 class="font-bold text-sm text-slate-100 truncate group-hover:text-cyan-300 transition-colors" :title="op.name">
                {{ op.name }}
              </h3>
              <span class="text-xs font-mono font-bold tracking-tighter" :class="getRarityColor(op.rarity)">
                {{ '★'.repeat(op.rarity) }}
              </span>
            </div>

            <p class="text-[11px] text-cyan-400 font-mono font-medium truncate">
              {{ getProfessionName(op.profession, gameData.itemLanguage) }} &bull; {{ getArchetypeName(op.subProfessionId, gameData.itemLanguage) }}
            </p>

            <div class="mt-1 flex flex-wrap gap-1 items-center">
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {{ op.position === 'MELEE' ? (gameData.itemLanguage === 'ru' ? 'Ближний' : 'Melee') : (gameData.itemLanguage === 'ru' ? 'Дальний' : 'Ranged') }}
              </span>
              <span
                v-if="op.modules && op.modules.length > 0"
                class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300"
              >
                {{ gameData.itemLanguage === 'ru' ? `Модули: ${op.modules.length}` : `Modules: ${op.modules.length}` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Combat Stats Preview -->
        <div class="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <div class="flex flex-col">
            <span class="text-slate-500 text-[9px] flex items-center justify-center gap-0.5">
              <Heart class="w-2.5 h-2.5 text-emerald-400" /> HP
            </span>
            <span class="font-bold text-slate-200">{{ op.attributes?.hp || '&mdash;' }}</span>
          </div>
          <div class="flex flex-col border-x border-slate-800/80">
            <span class="text-slate-500 text-[9px] flex items-center justify-center gap-0.5">
              <Swords class="w-2.5 h-2.5 text-red-400" /> ATK
            </span>
            <span class="font-bold text-slate-200">{{ op.attributes?.atk || '&mdash;' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-500 text-[9px] flex items-center justify-center gap-0.5">
              <Shield class="w-2.5 h-2.5 text-sky-400" /> DEF
            </span>
            <span class="font-bold text-slate-200">{{ op.attributes?.def || '&mdash;' }}</span>
          </div>
        </div>

        <!-- Footer / Action -->
        <div class="pt-1 flex items-center justify-between text-xs text-cyan-400 font-medium">
          <span class="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
            {{ gameData.itemLanguage === 'ru' ? 'Подробное досье →' : 'View Dossier →' }}
          </span>
          <BookOpen class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>

    <!-- Dossier Modal (Option A & B integrated) -->
    <OperatorDossierModal
      :operator="selectedOperatorForDossier"
      :is-open="isDossierOpen"
      @close="closeDossier"
      @open-plan="openPlanFromDossier"
    />

    <!-- Plan Editor Modal (if user clicks configure plan from wiki) -->
    <PlanEditorModal
      :operator="selectedOperatorForPlan"
      :is-open="isPlanModalOpen"
      @close="closePlanModal"
    />
  </div>
</template>
