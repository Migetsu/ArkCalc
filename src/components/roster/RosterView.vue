<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRosterStore } from '@/stores/roster';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import type { Profession, OperatorSummary } from '@/types/game';
import PlanEditorModal from '@/components/operator/PlanEditorModal.vue';
import OperatorDossierModal from '@/components/operator/OperatorDossierModal.vue';
import {
  getAvatarUrl,
  PLACEHOLDER_AVATAR,
} from '@/utils/imageUrl';
import {
  Search,
  Users,
  CheckCircle,
  Plus,
  Settings2,
  Trash2,
  SlidersHorizontal,
  UploadCloud,
  Sparkles,
} from 'lucide-vue-next';
import {
  normalizeSearchString,
  transliterateRuToEn,
  POPULAR_OPERATOR_RU_ALIASES,
} from '@/data/materialTranslations';

const emit = defineEmits<{
  (e: 'open-settings'): void;
}>();

const rosterStore = useRosterStore();
const plannerStore = usePlannerStore();
const gameData = useGameDataStore();

const searchQuery = ref('');
const selectedRarity = ref<number | null>(null);
const selectedProfession = ref<Profession | null>(null);
const selectedStatus = ref<'all' | 'unmaxed' | 'planned' | 'unplanned' | 'maxed'>('all');

// Modals
const selectedOpForEdit = ref<OperatorSummary | null>(null);
const isEditModalOpen = ref(false);

const selectedOpForDossier = ref<OperatorSummary | null>(null);
const isDossierOpen = ref(false);

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

interface EnrichedRosterItem {
  charId: string;
  elite: number;
  level: number;
  skills: number[];
  masteries: number[];
  modules: Record<string, number>;
  opData: OperatorSummary | undefined;
  isPlanned: boolean;
  isMaxed: boolean;
}

const enrichedList = computed<EnrichedRosterItem[]>(() => {
  return rosterStore.rosterList.map((ro) => {
    const op = gameData.getOperator(ro.charId);
    return {
      ...ro,
      opData: op,
      isPlanned: !!plannerStore.plans[ro.charId],
      isMaxed: rosterStore.isFullyMaxed(ro.charId),
    };
  });
});

const stats = computed(() => {
  const total = enrichedList.value.length;
  const planned = enrichedList.value.filter((i) => i.isPlanned).length;
  const maxed = enrichedList.value.filter((i) => i.isMaxed).length;
  const unmaxed = total - maxed;
  return { total, planned, maxed, unmaxed };
});

const filteredRoster = computed(() => {
  let list = enrichedList.value;

  // Search filter
  const rawQ = searchQuery.value.trim();
  if (rawQ) {
    const qNorm = normalizeSearchString(rawQ);
    const qTranslit = normalizeSearchString(transliterateRuToEn(rawQ));

    list = list.filter((item) => {
      const op = item.opData;
      if (!op) return item.charId.includes(qNorm);

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
      list = list.filter((i) => (i.opData?.rarity ?? 0) <= 2);
    } else {
      list = list.filter((i) => (i.opData?.rarity ?? 0) === selectedRarity.value);
    }
  }

  // Profession filter
  if (selectedProfession.value !== null) {
    list = list.filter((i) => i.opData?.profession === selectedProfession.value);
  }

  // Status filter
  if (selectedStatus.value === 'unmaxed') {
    list = list.filter((i) => !i.isMaxed);
  } else if (selectedStatus.value === 'planned') {
    list = list.filter((i) => i.isPlanned);
  } else if (selectedStatus.value === 'unplanned') {
    list = list.filter((i) => !i.isPlanned);
  } else if (selectedStatus.value === 'maxed') {
    list = list.filter((i) => i.isMaxed);
  }

  // Sort: by rarity descending, then level descending
  return list.sort((a, b) => {
    const rA = a.opData?.rarity ?? 0;
    const rB = b.opData?.rarity ?? 0;
    if (rB !== rA) return rB - rA;
    if (b.elite !== a.elite) return b.elite - a.elite;
    return b.level - a.level;
  });
});

const batchPreset = ref<'comfort' | 'full'>('comfort');

async function handleAddSingleToPlan(charId: string) {
  await rosterStore.addOperatorToPlan(charId, batchPreset.value);
}

async function handleRemoveFromPlan(charId: string) {
  await plannerStore.removePlan(charId);
}

function openEditModal(op: OperatorSummary) {
  selectedOpForEdit.value = op;
  isEditModalOpen.value = true;
}

function openDossier(op: OperatorSummary) {
  selectedOpForDossier.value = op;
  isDossierOpen.value = true;
}

async function handleAddAllUnmaxed6Star() {
  const unmaxed6 = enrichedList.value
    .filter((i) => (i.opData?.rarity === 6) && !i.isPlanned)
    .map((i) => i.charId);

  if (unmaxed6.length === 0) {
    alert('Все 6★ оперативники уже добавлены в план или прокачаны до максимума!');
    return;
  }

  const presetLabel = batchPreset.value === 'comfort' ? '«Комфорт: E2 Lv60 M3»' : '«Полный максимум: E2 Lv90 M9»';
  if (confirm(`Добавить ${unmaxed6.length} шт. 6★ оперативников в план с целью ${presetLabel}?`)) {
    await rosterStore.addBatchToPlan(unmaxed6, batchPreset.value);
  }
}

async function handleAddFilteredToPlan() {
  const toAdd = filteredRoster.value
    .filter((i) => !i.isPlanned)
    .map((i) => i.charId);

  if (toAdd.length === 0) {
    alert('Нет новых оперативников для добавления среди отфильтрованных.');
    return;
  }

  const presetLabel = batchPreset.value === 'comfort' ? '«Комфорт: E2 Lv60 M3»' : '«Полный максимум: E2 Lv90 M9»';
  if (confirm(`Добавить ${toAdd.length} выбранных оперативников в план с целью ${presetLabel}?`)) {
    await rosterStore.addBatchToPlan(toAdd, batchPreset.value);
  }
}

function getRarityBadgeBorder(rarity?: number): string {
  switch (rarity) {
    case 6: return 'border-amber-500/70 shadow-amber-950/30';
    case 5: return 'border-amber-400/50 shadow-amber-950/20';
    case 4: return 'border-purple-400/50 shadow-purple-950/20';
    case 3: return 'border-sky-400/50 shadow-sky-950/20';
    default: return 'border-slate-700 shadow-slate-950/20';
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Top Header Banner & Stats -->
    <div class="p-5 bg-ark-card border border-ark-border rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Users class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
              <span>Мой ростер</span>
              <span class="text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                {{ stats.total }} оперативников
              </span>
            </h2>
            <p class="text-xs text-slate-400">
              Персонажи с вашего игрового аккаунта (ArkPRTS). Добавляйте их в план прокачки в 1 клик с расчетом ресурсов до полного максимума!
            </p>
          </div>
        </div>
      </div>

      <!-- Quick batch actions -->
      <div v-if="stats.total > 0" class="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
        <!-- Target Preset Switcher -->
        <div class="inline-flex bg-slate-900 border border-ark-border rounded-xl p-0.5 text-xs font-semibold">
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            :class="batchPreset === 'comfort' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="batchPreset = 'comfort'"
            title="Цель: E2 Lv60 M3 Mod1 (оптимально для большинства)"
          >
            <span>Комфорт (E2-60)</span>
          </button>
          <button
            type="button"
            class="px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            :class="batchPreset === 'full' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="batchPreset = 'full'"
            title="Цель: E2 Lv90 M9 Mod3 (абсолютный максимум)"
          >
            <span>Фулл (E2-90)</span>
          </button>
        </div>

        <button
          type="button"
          class="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          @click="handleAddAllUnmaxed6Star"
        >
          <Sparkles class="w-4 h-4 text-amber-400" />
          <span>Все 6★ в план</span>
        </button>

        <button
          v-if="filteredRoster.filter(i => !i.isPlanned).length > 0"
          type="button"
          class="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          @click="handleAddFilteredToPlan"
        >
          <Plus class="w-4 h-4" />
          <span>Добавить отфильтрованных ({{ filteredRoster.filter(i => !i.isPlanned).length }})</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="stats.total === 0"
      class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border space-y-4 max-w-xl mx-auto my-8 shadow-lg"
    >
      <div class="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto">
        <UploadCloud class="w-8 h-8" />
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-200">Ростер вашего аккаунта пуст</h3>
        <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
          Импортируйте сырые данные (Full Raw Data) из перехватчика <b>ArkPRTS</b> в Настройках. Ваши персонажи и склад сохранятся офлайн, и вы сможете планировать их прокачку!
        </p>
      </div>
      <div>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
          @click="emit('open-settings')"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span>Открыть настройки импорта</span>
        </button>
      </div>
    </div>

    <!-- Main Content when Roster is loaded -->
    <div v-else class="space-y-4">
      <!-- Search & Filters Bar -->
      <div class="p-4 bg-ark-card border border-ark-border rounded-2xl space-y-3 shadow-sm">
        <!-- Search row -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по имени или позывному (SilverAsh, Серебряный пепел, Eyja, Эйя...)"
            class="w-full pl-10 pr-4 py-2 bg-slate-900 border border-ark-border rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <!-- Filter chips row -->
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Status buttons -->
          <div class="inline-flex bg-slate-900 p-1 rounded-xl border border-ark-border text-[11px] font-semibold">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="selectedStatus === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              @click="selectedStatus = 'all'"
            >
              Все ({{ stats.total }})
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="selectedStatus === 'unmaxed' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              @click="selectedStatus = 'unmaxed'"
            >
              Не докачаны ({{ stats.unmaxed }})
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="selectedStatus === 'planned' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              @click="selectedStatus = 'planned'"
            >
              В плане ({{ stats.planned }})
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="selectedStatus === 'unplanned' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              @click="selectedStatus = 'unplanned'"
            >
              Не в плане ({{ stats.total - stats.planned }})
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="selectedStatus === 'maxed' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              @click="selectedStatus = 'maxed'"
            >
              Фулл ({{ stats.maxed }})
            </button>
          </div>

          <!-- Rarity buttons -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              :class="selectedRarity === null ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'"
              @click="selectedRarity = null"
            >
              Все ★
            </button>
            <button
              v-for="r in [6, 5, 4, 3, 1]"
              :key="r"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
              :class="selectedRarity === r ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 border border-ark-border text-slate-300 hover:text-white'"
              @click="selectedRarity = selectedRarity === r ? null : r"
            >
              {{ r === 1 ? '1-2★' : `${r}★` }}
            </button>
          </div>
        </div>

        <!-- Class filter row -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-ark-border/60 text-xs">
          <span class="text-slate-500 text-[11px] mr-1">Класс:</span>
          <button
            type="button"
            class="px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors"
            :class="selectedProfession === null ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'"
            @click="selectedProfession = null"
          >
            Все
          </button>
          <button
            v-for="p in professions"
            :key="p.id"
            type="button"
            class="px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors"
            :class="selectedProfession === p.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 border border-ark-border text-slate-400 hover:text-slate-200'"
            @click="selectedProfession = selectedProfession === p.id ? null : p.id"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Roster Grid -->
      <div v-if="filteredRoster.length === 0" class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
        <Users class="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <h4 class="font-bold text-slate-200 text-sm">Оперативники не найдены</h4>
        <p class="text-xs mt-1 text-slate-400">Попробуйте изменить параметры поиска или фильтры статуса/редкости.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <div
          v-for="item in filteredRoster"
          :key="item.charId"
          class="bg-ark-card border rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all shadow-sm relative group overflow-hidden"
          :class="[
            item.isPlanned
              ? 'border-cyan-500/60 bg-cyan-950/15 shadow-cyan-950/30'
              : 'border-ark-border hover:border-slate-600',
          ]"
        >
          <!-- Top Row: Avatar & Basic Info -->
          <div class="flex items-start gap-3">
            <!-- Avatar -->
            <div
              class="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-slate-900 relative shadow-md"
              :class="getRarityBadgeBorder(item.opData?.rarity)"
            >
              <img
                :src="item.opData ? getAvatarUrl(item.opData.id) : PLACEHOLDER_AVATAR"
                :alt="item.opData?.name || item.charId"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <!-- Elite level badge overlay -->
              <div class="absolute bottom-0 left-0 right-0 bg-slate-950/90 text-center py-0.2 text-[9px] font-mono font-bold text-amber-400">
                E{{ item.elite }} L{{ item.level }}
              </div>
            </div>

            <!-- Name & Profession -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4
                  class="font-extrabold text-xs text-slate-100 truncate cursor-pointer hover:text-cyan-400 transition-colors"
                  :title="item.opData?.name || item.charId"
                  @click="item.opData && openDossier(item.opData)"
                >
                  {{ item.opData?.name || item.charId }}
                </h4>
                <span class="text-[10px] font-bold text-amber-400 font-mono">
                  {{ '★'.repeat(item.opData?.rarity || 6) }}
                </span>
              </div>

              <div class="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                <span>{{ item.opData?.profession || 'Оперативник' }}</span>
                &bull;
                <span v-if="item.isMaxed" class="text-emerald-400 font-semibold">Фулл</span>
                <span v-else class="text-amber-400">Требует кача</span>
              </div>

              <!-- Skills & Masteries summary -->
              <div class="mt-1 flex items-center gap-1 flex-wrap text-[10px] font-mono">
                <span
                  v-if="item.masteries && item.masteries.some(m => m > 0)"
                  class="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold"
                >
                  {{ item.masteries.map((m, idx) => m > 0 ? `S${idx+1}M${m}` : null).filter(Boolean).join(' ') }}
                </span>
                <span
                  v-if="item.modules && Object.keys(item.modules).length > 0"
                  class="px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold"
                >
                  Модули: {{ Object.values(item.modules).join(', ') }} ур.
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <!-- If NOT in plan: Fast 1-click button to add as FULL UPGRADE -->
            <template v-if="!item.isPlanned">
              <button
                type="button"
                class="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                :title="batchPreset === 'comfort' ? 'Добавить в план с целью: Комфорт (E2 Lv60 M3)' : 'Добавить в план с целью: Фулл (E2 Lv90 M9)'"
                @click="handleAddSingleToPlan(item.charId)"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>{{ batchPreset === 'comfort' ? 'В план (E2-60)' : 'В план (Фулл)' }}</span>
              </button>

              <button
                v-if="item.opData"
                type="button"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Настроить цель вручную"
                @click="openEditModal(item.opData)"
              >
                <Settings2 class="w-3.5 h-3.5" />
              </button>
            </template>

            <!-- If ALREADY in plan -->
            <template v-else>
              <span class="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle class="w-3.5 h-3.5 text-cyan-400" />
                <span>В плане</span>
              </span>

              <div class="flex items-center gap-1.5">
                <button
                  v-if="item.opData"
                  type="button"
                  class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
                  title="Изменить цель прокачки"
                  @click="openEditModal(item.opData)"
                >
                  Цель
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 transition-colors"
                  title="Убрать из плана"
                  @click="handleRemoveFromPlan(item.charId)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PlanEditorModal
      :operator="selectedOpForEdit"
      :is-open="isEditModalOpen"
      @close="isEditModalOpen = false; selectedOpForEdit = null"
    />

    <OperatorDossierModal
      :operator="selectedOpForDossier"
      :is-open="isDossierOpen"
      @close="isDossierOpen = false; selectedOpForDossier = null"
    />
  </div>
</template>
