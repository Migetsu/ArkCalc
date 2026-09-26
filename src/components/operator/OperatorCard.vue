<script setup lang="ts">
import { computed } from 'vue';
import type { OperatorSummary } from '@/types/game';
import { usePlannerStore } from '@/stores/planner';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import { Edit3, Trash2, Plus } from 'lucide-vue-next';

const props = defineProps<{
  operator: OperatorSummary;
}>();

const emit = defineEmits<{
  (e: 'edit', operator: OperatorSummary): void;
}>();

const planner = usePlannerStore();
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
</script>

<template>
  <div
    class="relative flex flex-col justify-between bg-ark-card/90 hover:bg-ark-card border rounded-xl overflow-hidden transition-all duration-200 shadow-md group"
    :class="[hasPlan ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-ark-border hover:border-slate-600']"
  >
    <!-- Top Bar with Class and Rarity -->
    <div class="p-3 pb-2 flex items-start gap-3">
      <!-- Avatar -->
      <div class="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-ark-border bg-slate-900 shadow">
        <img
          :src="getAvatarUrl(operator.id)"
          :alt="operator.name"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform"
          @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
        />
        <div class="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[10px] text-center font-mono text-slate-300 py-0.5">
          {{ operator.profession }}
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <h4 class="font-bold text-sm text-slate-100 truncate" :title="operator.name">
            {{ operator.name }}
          </h4>
          <span class="text-xs font-mono font-bold tracking-tighter" :class="rarityColor">
            {{ rarityStars }}
          </span>
        </div>

        <p class="text-xs text-slate-400 font-mono truncate">
          {{ operator.appellation || operator.id }}
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
              class="text-[10px] font-mono px-1 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold"
            >
              Mod: L{{ lvl }}
            </span>
          </template>
        </div>

        <div v-else class="mt-2 text-[11px] text-slate-500 italic">
          План не настроен
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="px-3 py-2 bg-slate-900/50 border-t border-ark-border/60 flex items-center justify-between gap-2">
      <template v-if="hasPlan">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/40 transition-colors"
          @click="handleEdit"
        >
          <Edit3 class="w-3.5 h-3.5" />
          Редактировать
        </button>
        <button
          type="button"
          class="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded border border-transparent hover:border-red-900/40 transition-colors"
          title="Удалить из плана"
          @click="handleRemove"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors"
          @click="handleEdit"
        >
          <Plus class="w-3.5 h-3.5 text-cyan-400" />
          Добавить в план
        </button>
      </template>
    </div>
  </div>
</template>
