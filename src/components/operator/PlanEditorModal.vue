<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { OperatorSummary } from '@/types/game';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { calculateOperatorPlanCosts } from '@/services/calculatorEngine';
import type { OperatorTargetPlan } from '@/services/db';
import ItemIcon from '@/components/common/ItemIcon.vue';
import {
  getAvatarUrl,
  getSkillIconUrl,
  getEquipIconUrl,
  getEquipTypeIconUrl,
  PLACEHOLDER_AVATAR,
  PLACEHOLDER_EQUIP_ICON,
} from '@/utils/imageUrl';
import { X, Sparkles, Check, Trash2, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{
  operator: OperatorSummary | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const planner = usePlannerStore();
const gameData = useGameDataStore();

const localPlan = ref<OperatorTargetPlan>({
  charId: '',
  current: {
    elite: 0,
    level: 1,
    skills: [1],
    masteries: [0],
    modules: {},
  },
  target: {
    elite: 0,
    level: 1,
    skills: [1],
    masteries: [0],
    modules: {},
  },
});

watch(
  () => props.operator,
  (op) => {
    if (!op) return;
    const existing = planner.plans[op.id];
    const maxElite = Math.max(0, op.phases.length - 1);
    const initialSkillCount = op.skills.length || 1;

    if (existing) {
      localPlan.value = JSON.parse(JSON.stringify(existing));
    } else {
      localPlan.value = {
        charId: op.id,
        current: {
          elite: 0,
          level: 1,
          skills: [1],
          masteries: new Array(initialSkillCount).fill(0),
          modules: {},
        },
        target: {
          elite: maxElite,
          level: op.maxLevels[maxElite] || 50,
          skills: [7],
          masteries: new Array(initialSkillCount).fill(0),
          modules: {},
        },
      };
    }
  },
  { immediate: true }
);

const maxElite = computed(() => {
  return props.operator ? Math.max(0, props.operator.phases.length - 1) : 0;
});

const curMaxLevel = computed(() => {
  if (!props.operator) return 50;
  return props.operator.maxLevels[localPlan.value.current.elite] || 50;
});

const tarMaxLevel = computed(() => {
  if (!props.operator) return 50;
  return props.operator.maxLevels[localPlan.value.target.elite] || 50;
});

// Watch current elite change to clamp current level
watch(
  () => localPlan.value.current.elite,
  (newE) => {
    const maxL = props.operator?.maxLevels[newE] || 50;
    if (localPlan.value.current.level > maxL) {
      localPlan.value.current.level = maxL;
    }
    // Target elite cannot be less than current elite
    if (localPlan.value.target.elite < newE) {
      localPlan.value.target.elite = newE;
    }
  }
);

// Watch target elite change to clamp target level
watch(
  () => localPlan.value.target.elite,
  (newE) => {
    const maxL = props.operator?.maxLevels[newE] || 50;
    if (localPlan.value.target.level > maxL) {
      localPlan.value.target.level = maxL;
    }
  }
);

// Clamp target level if target elite == current elite and target level < current level
watch(
  () => [localPlan.value.target.level, localPlan.value.current.level, localPlan.value.target.elite, localPlan.value.current.elite],
  () => {
    if (localPlan.value.target.elite === localPlan.value.current.elite) {
      if (localPlan.value.target.level < localPlan.value.current.level) {
        localPlan.value.target.level = localPlan.value.current.level;
      }
    }
  }
);

// Realtime plan calculation preview
const planPreview = computed(() => {
  if (!props.operator || !gameData.constants) {
    return { exp: 0, lmdLevel: 0, lmdEvolve: 0, materials: {} };
  }
  return calculateOperatorPlanCosts(props.operator, localPlan.value, gameData.constants);
});

const previewMaterialList = computed(() => {
  const mats = planPreview.value.materials;
  return Object.entries(mats)
    .map(([itemId, count]) => ({ itemId, count }))
    .sort((a, b) => {
      const rA = gameData.getItem(a.itemId)?.rarity || 0;
      const rB = gameData.getItem(b.itemId)?.rarity || 0;
      return rB - rA;
    });
});

// Presets
function applyPresetMax() {
  if (!props.operator) return;
  const mE = maxElite.value;
  localPlan.value.target.elite = mE;
  localPlan.value.target.level = props.operator.maxLevels[mE] || 90;
  localPlan.value.target.skills = [7];
  if (props.operator.skills.length > 0) {
    localPlan.value.target.masteries = new Array(props.operator.skills.length).fill(3);
  }
  for (const mod of props.operator.modules) {
    localPlan.value.target.modules[mod.id] = 3;
  }
}

function applyPresetE2L60() {
  if (!props.operator) return;
  const mE = Math.min(2, maxElite.value);
  localPlan.value.target.elite = mE;
  const maxL = props.operator.maxLevels[mE] || 60;
  localPlan.value.target.level = Math.min(60, maxL);
  localPlan.value.target.skills = [7];
  if (props.operator.skills.length > 0) {
    // S3 on M3, others on M0/M1
    const mArr = new Array(props.operator.skills.length).fill(0);
    if (mArr.length >= 3) mArr[2] = 3;
    else if (mArr.length >= 2) mArr[1] = 3;
    localPlan.value.target.masteries = mArr;
  }
}

function applyPresetReset() {
  if (!props.operator) return;
  localPlan.value.target = JSON.parse(JSON.stringify(localPlan.value.current));
}

async function handleSave() {
  if (!props.operator) return;
  const planData: OperatorTargetPlan = JSON.parse(JSON.stringify(localPlan.value));
  planData.charId = props.operator.id;
  await planner.savePlan(planData);
  emit('close');
}

async function handleDelete() {
  if (!props.operator) return;
  const id = props.operator.id;
  await planner.removePlan(id);
  emit('close');
}
</script>

<template>
  <div
    v-if="isOpen && operator"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="bg-ark-darker border border-ark-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 bg-ark-card border-b border-ark-border flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg overflow-hidden border border-ark-border bg-slate-900 flex-shrink-0">
            <img
              :src="getAvatarUrl(operator.id)"
              :alt="operator.name"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-lg text-slate-100">{{ operator.name }}</h3>
              <span class="text-amber-400 font-mono text-sm tracking-widest font-bold">
                {{ '★'.repeat(operator.rarity) }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono">
              {{ operator.profession }} &bull; {{ operator.appellation }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Presets bar -->
      <div class="px-5 py-2.5 bg-slate-900/60 border-b border-ark-border flex flex-wrap items-center gap-2 text-xs">
        <span class="text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" /> Пресеты:
        </span>
        <button
          type="button"
          class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-medium"
          @click="applyPresetMax"
        >
          Max (E{{ maxElite }} L{{ operator.maxLevels[maxElite] || 90 }})
        </button>
        <button
          v-if="maxElite >= 2"
          type="button"
          class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-medium"
          @click="applyPresetE2L60"
        >
          E2 Lvl 60 (M3)
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
          @click="applyPresetReset"
        >
          Сбросить к текущему
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-5 space-y-6 overflow-y-auto flex-1">
        <!-- Elite and Level Section: Current -> Target -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- CURRENT STATE -->
          <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-4">
            <div class="flex items-center justify-between border-b border-ark-border/60 pb-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Текущее состояние</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                E{{ localPlan.current.elite }} Lvl {{ localPlan.current.level }}
              </span>
            </div>

            <!-- Current Elite -->
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Элита (Promotion)</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="e in maxElite + 1"
                  :key="e - 1"
                  type="button"
                  class="py-1.5 rounded-lg font-mono font-bold text-sm border transition-all"
                  :class="[
                    localPlan.current.elite === e - 1
                      ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700',
                  ]"
                  @click="localPlan.current.elite = e - 1"
                >
                  E{{ e - 1 }}
                </button>
              </div>
            </div>

            <!-- Current Level -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-medium text-slate-400">Уровень</label>
                <span class="text-xs font-mono font-bold text-slate-200">
                  {{ localPlan.current.level }} / {{ curMaxLevel }}
                </span>
              </div>
              <input
                type="range"
                min="1"
                :max="curMaxLevel"
                v-model.number="localPlan.current.level"
                class="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <!-- Current Common Skill (1-7) -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-medium text-slate-400">Базовый навык (1-7)</label>
                <span class="text-xs font-mono font-bold text-slate-200">
                  Уровень {{ localPlan.current.skills[0] || 1 }}
                </span>
              </div>
              <div class="flex gap-1">
                <button
                  v-for="s in 7"
                  :key="s"
                  type="button"
                  class="flex-1 py-1 rounded text-xs font-mono font-bold border transition-all"
                  :class="[
                    (localPlan.current.skills[0] || 1) === s
                      ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700',
                  ]"
                  @click="localPlan.current.skills = [s]"
                >
                  {{ s }}
                </button>
              </div>
            </div>
          </div>

          <!-- TARGET STATE -->
          <div class="p-4 bg-ark-card rounded-xl border border-cyan-500/30 space-y-4 shadow-sm">
            <div class="flex items-center justify-between border-b border-ark-border/60 pb-2">
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                Целевое состояние <ArrowRight class="w-3.5 h-3.5" />
              </span>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-700 text-cyan-300">
                E{{ localPlan.target.elite }} Lvl {{ localPlan.target.level }}
              </span>
            </div>

            <!-- Target Elite -->
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Целевая элита</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="e in maxElite + 1"
                  :key="e - 1"
                  type="button"
                  class="py-1.5 rounded-lg font-mono font-bold text-sm border transition-all"
                  :disabled="e - 1 < localPlan.current.elite"
                  :class="[
                    localPlan.target.elite === e - 1
                      ? 'bg-cyan-500 border-cyan-400 text-white shadow-md'
                      : e - 1 < localPlan.current.elite
                      ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700',
                  ]"
                  @click="localPlan.target.elite = e - 1"
                >
                  E{{ e - 1 }}
                </button>
              </div>
            </div>

            <!-- Target Level -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-medium text-slate-400">Целевой уровень</label>
                <span class="text-xs font-mono font-bold text-cyan-300">
                  {{ localPlan.target.level }} / {{ tarMaxLevel }}
                </span>
              </div>
              <input
                type="range"
                :min="localPlan.target.elite === localPlan.current.elite ? localPlan.current.level : 1"
                :max="tarMaxLevel"
                v-model.number="localPlan.target.level"
                class="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <!-- Target Common Skill (1-7) -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-medium text-slate-400">Целевой навык (1-7)</label>
                <span class="text-xs font-mono font-bold text-cyan-300">
                  Уровень {{ localPlan.target.skills[0] || 1 }}
                </span>
              </div>
              <div class="flex gap-1">
                <button
                  v-for="s in 7"
                  :key="s"
                  type="button"
                  class="flex-1 py-1 rounded text-xs font-mono font-bold border transition-all"
                  :disabled="s < (localPlan.current.skills[0] || 1)"
                  :class="[
                    (localPlan.target.skills[0] || 1) === s
                      ? 'bg-cyan-500 border-cyan-400 text-white shadow-sm'
                      : s < (localPlan.current.skills[0] || 1)
                      ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700',
                  ]"
                  @click="localPlan.target.skills = [s]"
                >
                  {{ s }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Masteries Section (M1 -> M3) -->
        <div v-if="operator.skills && operator.skills.length > 0" class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-4">
          <div class="flex items-center justify-between border-b border-ark-border/60 pb-2">
            <div>
              <h4 class="text-xs font-bold text-purple-300 uppercase tracking-wider">Мастерство навыков (Masteries M1 - M3)</h4>
              <p class="text-[11px] text-slate-400">Требуется Элита 2 и уровень навыка 7</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(skill, idx) in operator.skills"
              :key="skill.skillId"
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-9 h-9 rounded bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img
                    :src="getSkillIconUrl(skill.iconId || skill.skillId)"
                    :alt="skill.skillId"
                    class="w-full h-full object-contain"
                  />
                </div>
                <div class="truncate">
                  <span class="text-xs font-bold text-slate-200">Навык {{ idx + 1 }}</span>
                  <p class="text-[10px] text-slate-400 font-mono truncate">{{ skill.skillId }}</p>
                </div>
              </div>

              <!-- Mastery buttons M0, M1, M2, M3 -->
              <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <button
                  v-for="m in 4"
                  :key="m - 1"
                  type="button"
                  class="px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all"
                  :class="[
                    (localPlan.target.masteries[idx] || 0) === m - 1
                      ? m - 1 === 0
                        ? 'bg-slate-700 border-slate-600 text-slate-200'
                        : 'bg-purple-600 border-purple-400 text-white shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700',
                  ]"
                  @click="localPlan.target.masteries[idx] = m - 1"
                >
                  {{ m - 1 === 0 ? 'M0' : `M${m - 1}` }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modules Section (Stage 1 -> 3) -->
        <div v-if="operator.modules && operator.modules.length > 0" class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-4">
          <div class="flex items-center justify-between border-b border-ark-border/60 pb-2">
            <div>
              <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">Модули снаряжения (Modules 1 - 3)</h4>
              <p class="text-[11px] text-slate-400">Требуется Элита 2 и блоки данных</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="mod in operator.modules"
              :key="mod.id"
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Module Icon with Type Badge Overlay -->
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700/80 p-1 overflow-hidden flex items-center justify-center shadow-inner">
                    <img
                      :src="getEquipIconUrl(mod.uniEquipIcon || mod.id)"
                      :alt="mod.name"
                      class="w-full h-full object-contain"
                      loading="lazy"
                      @error="(e: Event) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.triedFallback && mod.typeIcon) {
                          target.dataset.triedFallback = 'true';
                          target.src = getEquipTypeIconUrl(mod.typeIcon);
                        } else {
                          target.src = PLACEHOLDER_EQUIP_ICON;
                        }
                      }"
                    />
                  </div>
                  <!-- Module Type Badge (X/Y/D) on Icon -->
                  <span
                    v-if="mod.typeName2"
                    class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[10px] font-black font-mono shadow-md border leading-tight uppercase"
                    :class="[
                      mod.typeName2.toUpperCase() === 'X'
                        ? 'bg-sky-500 text-slate-950 border-sky-300'
                        : mod.typeName2.toUpperCase() === 'Y'
                        ? 'bg-amber-400 text-slate-950 border-amber-200'
                        : mod.typeName2.toUpperCase() === 'D'
                        ? 'bg-rose-500 text-white border-rose-300'
                        : 'bg-indigo-500 text-white border-indigo-300'
                    ]"
                  >
                    {{ mod.typeName2 }}
                  </span>
                </div>

                <div class="min-w-0">
                  <!-- Readable Title: "Модуль X (WDM)" -->
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-xs sm:text-sm font-bold text-slate-100">
                      {{ (gameData.itemLanguage === 'ru' ? 'Модуль ' : 'Module ') + (mod.typeName2 || '') + (mod.typeName1 ? ` (${mod.typeName1})` : '') }}
                    </span>
                    <span class="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {{ mod.typeName1 }}
                    </span>
                  </div>
                  <!-- Subtitle: Original equipment name -->
                  <span class="text-[11px] text-slate-400 block truncate mt-0.5" :title="mod.name">
                    {{ mod.name }}
                  </span>
                </div>
              </div>

              <!-- Module Stage buttons 0, 1, 2, 3 -->
              <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <button
                  v-for="st in 4"
                  :key="st - 1"
                  type="button"
                  class="px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all"
                  :class="[
                    (localPlan.target.modules[mod.id] || 0) === st - 1
                      ? st - 1 === 0
                        ? 'bg-slate-700 border-slate-600 text-slate-200'
                        : 'bg-amber-600 border-amber-400 text-white shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700',
                  ]"
                  @click="localPlan.target.modules[mod.id] = st - 1"
                >
                  {{ st - 1 === 0 ? 'Выкл' : `Lvl ${st - 1}` }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Cost Preview -->
        <div class="p-4 bg-slate-900/80 rounded-xl border border-ark-border space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Предпросмотр затрат на этого оперативника:
          </h4>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-2.5 rounded-lg bg-ark-card border border-ark-border flex flex-col">
              <span class="text-[11px] text-slate-400 font-medium">Требуется EXP</span>
              <span class="text-sm font-mono font-bold text-amber-400 mt-0.5">
                {{ planPreview.exp.toLocaleString() }}
              </span>
            </div>

            <div class="p-2.5 rounded-lg bg-ark-card border border-ark-border flex flex-col">
              <span class="text-[11px] text-slate-400 font-medium">LMD (Прокачка)</span>
              <span class="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                {{ planPreview.lmdLevel.toLocaleString() }}
              </span>
            </div>

            <div class="p-2.5 rounded-lg bg-ark-card border border-ark-border flex flex-col col-span-2 sm:col-span-1">
              <span class="text-[11px] text-slate-400 font-medium">LMD (Возвышение)</span>
              <span class="text-sm font-mono font-bold text-cyan-300 mt-0.5">
                {{ planPreview.lmdEvolve.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Materials list preview -->
          <div v-if="previewMaterialList.length > 0">
            <span class="block text-[11px] text-slate-400 mb-2 font-medium">Материалы:</span>
            <div class="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/50 rounded-lg border border-slate-800">
              <ItemIcon
                v-for="m in previewMaterialList"
                :key="m.itemId"
                :item-id="m.itemId"
                :count="m.count"
                size="md"
              />
            </div>
          </div>
          <div v-else class="text-xs text-slate-500 italic">
            Материалы не требуются (уровни совпадают).
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-4 bg-ark-card border-t border-ark-border flex items-center justify-between gap-3">
        <div>
          <button
            v-if="planner.plans[operator.id]"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/60 transition-colors"
            @click="handleDelete"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Удалить план
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            @click="emit('close')"
          >
            Отмена
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all active:scale-95"
            @click="handleSave"
          >
            <Check class="w-4 h-4 stroke-[3]" />
            Сохранить план
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
