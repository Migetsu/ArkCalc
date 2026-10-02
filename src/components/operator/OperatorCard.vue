<script setup lang="ts">
import { computed } from 'vue';
import type { OperatorSummary } from '@/types/game';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { useLocaleStore } from '@/stores/locale';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import { Edit3, Trash2, Plus, BookOpen } from 'lucide-vue-next';

const props = defineProps<{
  operator: OperatorSummary;
}>();

const emit = defineEmits<{
  (e: 'edit', operator: OperatorSummary): void;
  (e: 'dossier', operator: OperatorSummary): void;
}>();

const planner = usePlannerStore();
const gameData = useGameDataStore();
const locale = useLocaleStore();
const plan = computed(() => planner.plans[props.operator.id]);
const hasPlan = computed(() => !!plan.value);

const rarityStars = computed(() => '★'.repeat(props.operator.rarity));

const rarityColor = computed(() => {
  switch (props.operator.rarity) {
    case 6:
      return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    case 5:
      return 'text-amber-200 border-amber-300/30 bg-amber-300/10';
    case 4:
      return 'text-purple-300 border-purple-400/30 bg-purple-400/10';
    case 3:
      return 'text-sky-300 border-sky-400/30 bg-sky-400/10';
    default:
      return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  }
});

function handleEdit() {
  emit('edit', props.operator);
}

function handleRemove() {
  planner.removePlan(props.operator.id);
}

function getModuleInfo(modId: string) {
  const mod = props.operator.modules?.find((m) => m.id === modId);
  const prefix = gameData.itemLanguage === 'ru' ? 'Модуль' : 'Module';
  const typePart = mod?.typeName2 || '';
  const archPart = mod?.typeName1 ? ` (${mod.typeName1})` : '';
  const lvlPrefix = gameData.itemLanguage === 'ru' ? 'Ур.' : 'Lvl';
  return {
    type: mod?.typeName2 || 'Mod',
    archetype: mod?.typeName1 || '',
    name: mod?.name || '',
    lvlPrefix,
    fullName: `${prefix} ${typePart}${archPart}`,
  };
}
</script>

<template>
  <div
    class="relative flex flex-col justify-between h-full bg-ark-card/90 hover:bg-ark-card border rounded-xl overflow-hidden transition-all duration-200 shadow-md group"
    :class="[hasPlan ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-ark-border hover:border-slate-600']"
  >
    <!-- Top Bar with Class and Rarity -->
    <div class="p-3 pb-2 flex items-start gap-3">
      <!-- Avatar -->
      <div
        class="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-ark-border bg-slate-900 shadow cursor-pointer group/avatar"
        title="Нажмите, чтобы открыть досье оперативника"
        @click="emit('dossier', operator)"
      >
        <img
          :src="getAvatarUrl(operator.id)"
          :alt="operator.name"
          loading="lazy"
          class="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
          @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
        />
        <div class="absolute inset-0 bg-cyan-950/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
          <BookOpen class="w-4 h-4 text-cyan-300 drop-shadow" />
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <h4
            class="font-bold text-sm text-slate-100 truncate cursor-pointer hover:text-cyan-300 transition-colors"
            :title="operator.name"
            @click="emit('dossier', operator)"
          >
            {{ operator.name }}
          </h4>
          <span class="text-xs font-mono font-bold tracking-tighter" :class="rarityColor">
            {{ rarityStars }}
          </span>
        </div>

        <p class="text-[11px] text-slate-400 font-mono truncate">
          {{ operator.profession }}
        </p>

        <!-- Plan Status Badge -->
        <div v-if="hasPlan" class="mt-1 flex flex-wrap gap-1 items-center">
          <span class="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            E{{ plan.current.elite }} L{{ plan.current.level }} &rarr; <strong class="text-cyan-400 ml-1">E{{ plan.target.elite }} L{{ plan.target.level }}</strong>
          </span>

          <!-- Masteries Badge -->
          <template v-if="plan.target.masteries.some(m => m > 0)">
            <span
              v-for="(m, idx) in plan.target.masteries"
              :key="idx"
              v-show="m > 0"
              class="text-[10px] font-mono px-1 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 font-semibold"
            >
              S{{ idx + 1 }}: M{{ m }}
            </span>
          </template>

          <!-- Modules Badge -->
          <template v-if="Object.values(plan.target.modules).some(lvl => lvl > 0)">
            <span
              v-for="(lvl, modId) in plan.target.modules"
              :key="modId"
              v-show="lvl > 0"
              :title="`${getModuleInfo(String(modId)).fullName}${getModuleInfo(String(modId)).name ? ` (${getModuleInfo(String(modId)).name})` : ''}: ${getModuleInfo(String(modId)).lvlPrefix} ${lvl}`"
              class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border inline-flex items-center gap-1 shadow-sm"
              :class="[
                getModuleInfo(String(modId)).type.toUpperCase() === 'X'
                  ? 'bg-sky-950/90 text-sky-300 border-sky-600/70'
                  : getModuleInfo(String(modId)).type.toUpperCase() === 'Y'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-600/70'
                  : getModuleInfo(String(modId)).type.toUpperCase() === 'D'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-600/70'
                  : 'bg-indigo-950/90 text-indigo-300 border-indigo-600/70'
              ]"
            >
              <span>{{ getModuleInfo(String(modId)).type }}:</span>
              <span>L{{ lvl }}</span>
            </span>
          </template>
        </div>

        <div v-else class="mt-2 text-[11px] text-slate-500 italic">
          {{ locale.t('op.filterUnplanned') }}
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="px-3 py-2 bg-slate-900/50 border-t border-ark-border/60 flex items-center justify-between gap-1.5 mt-auto">
      <button
        type="button"
        class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-md border border-transparent hover:border-cyan-800/60 transition-colors"
        :title="locale.t('op.dossier')"
        @click="emit('dossier', operator)"
      >
        <BookOpen class="w-3.5 h-3.5" />
      </button>

      <template v-if="hasPlan">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/40 transition-colors"
          @click="handleEdit"
        >
          <Edit3 class="w-3.5 h-3.5" />
          {{ locale.t('common.edit') }}
        </button>
        <button
          type="button"
          class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-md border border-transparent hover:border-red-900/40 transition-colors"
          :title="locale.t('plan.deletePlan')"
          @click="handleRemove"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors"
          @click="handleEdit"
        >
          <Plus class="w-3.5 h-3.5 text-cyan-400" />
          {{ locale.t('op.addPlan') }}
        </button>
      </template>
    </div>
  </div>
</template>
