<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { useLocaleStore } from '@/stores/locale';
import { useAuthStore } from '@/stores/auth';
import type { OperatorSummary } from '@/types/game';
import {
  simulateRoadmapQueue,
  type RoadmapOperatorStep,
} from '@/services/plannerRoadmapService';
import ItemIcon from '@/components/common/ItemIcon.vue';
import PlanEditorModal from '@/components/operator/PlanEditorModal.vue';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Coins,
  Layers,
  Wrench,
  Trash2,
  Check,
  Flame,
  Cloud,
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'open-operators'): void;
}>();

const planner = usePlannerStore();
const gameData = useGameDataStore();
const inventory = useInventoryStore();
const locale = useLocaleStore();
const auth = useAuthStore();

const autoDeductMaterials = ref(true);
const completedMessage = ref<string | null>(null);

// Modal for editing an operator in the queue
const editingOperator = ref<OperatorSummary | null>(null);
const isEditModalOpen = ref(false);

const roadmapSimulation = computed(() => {
  if (!gameData.constants || planner.planCount === 0) {
    return {
      steps: [],
      fullyReadyCount: 0,
      partialCount: 0,
      waitingCount: 0,
      completedCount: 0,
      totalLmdRequired: 0,
      totalExpRequired: 0,
    };
  }

  return simulateRoadmapQueue(
    planner.orderedPlanList,
    gameData.operators,
    gameData.constants,
    inventory.stock,
  );
});

async function moveUp(charId: string) {
  await planner.movePlan(charId, 'up');
}

async function moveDown(charId: string) {
  await planner.movePlan(charId, 'down');
}

async function setTop(charId: string) {
  await planner.setPlanTop(charId);
}

function openEdit(op: OperatorSummary) {
  editingOperator.value = op;
  isEditModalOpen.value = true;
}

function closeEdit() {
  isEditModalOpen.value = false;
  editingOperator.value = null;
}

function remove(charId: string) {
  planner.removePlan(charId);
}

async function markStepDone(step: RoadmapOperatorStep) {
  await planner.completePlanStep(step.charId, autoDeductMaterials.value);
  const name = step.operator.name;
  completedMessage.value = locale.currentLang === 'ru'
    ? `Цель для ${name} выполнена! ${autoDeductMaterials.value ? 'Ресурсы списаны со склада.' : ''}`
    : `Target for ${name} completed! ${autoDeductMaterials.value ? 'Materials deducted from depot.' : ''}`;
  setTimeout(() => {
    completedMessage.value = null;
  }, 4000);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Notification Toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="-translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-4 opacity-0"
    >
      <div
        v-if="completedMessage"
        class="p-3.5 bg-emerald-950/90 border border-emerald-500/80 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg"
      >
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{{ completedMessage }}</span>
        </div>
        <button
          type="button"
          class="text-emerald-400 hover:text-white font-mono text-xs px-2 py-0.5"
          @click="completedMessage = null"
        >
          ✕
        </button>
      </div>
    </Transition>

    <!-- Top KPI Dashboard of the Roadmap -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ark-border/80">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Sparkles class="w-4 h-4" />
            </div>
            <h3 class="font-black text-sm sm:text-base text-slate-100 uppercase tracking-wider">
              {{ locale.currentLang === 'ru' ? 'Дорожная карта прокачки' : 'Promotion Roadmap & Queue' }}
            </h3>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
              {{ planner.planCount }} {{ locale.currentLang === 'ru' ? 'в очереди' : 'in queue' }}
            </span>
            <span
              v-if="auth.isAuthenticated"
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 flex items-center gap-1"
              :title="locale.currentLang === 'ru' ? 'Порядок и приоритеты сохраняются в вашем облачном аккаунте' : 'Priority order is saved in your cloud account'"
            >
              <Cloud class="w-3 h-3 text-cyan-400" />
              <span>{{ locale.currentLang === 'ru' ? 'Облако' : 'Cloud' }}</span>
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {{
              locale.currentLang === 'ru'
                ? 'Ресурсы со склада резервируются по очереди приоритета. Расставьте операторов в нужном порядке!'
                : 'Depot stock is allocated sequentially by priority. Reorder operators to prioritize your favorites!'
            }}
          </p>
        </div>

        <!-- Auto deduct toggle -->
        <label class="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none bg-slate-900/80 px-3 py-2 rounded-xl border border-ark-border">
          <input
            v-model="autoDeductMaterials"
            type="checkbox"
            class="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/40"
          />
          <span>{{ locale.currentLang === 'ru' ? 'Списывать ресурсы при выполнении' : 'Deduct materials on completion' }}</span>
        </label>
      </div>

      <!-- 4 Readiness Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- Ready Card -->
        <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/80 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black font-mono text-emerald-300 leading-none">
              {{ roadmapSimulation.fullyReadyCount }}
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              {{ locale.currentLang === 'ru' ? 'Готовы к апу' : 'Ready now' }}
            </div>
          </div>
        </div>

        <!-- Partial Card -->
        <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-700/80 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Flame class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black font-mono text-amber-300 leading-none">
              {{ roadmapSimulation.partialCount }}
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              {{ locale.currentLang === 'ru' ? 'Частично готовы' : 'Partially ready' }}
            </div>
          </div>
        </div>

        <!-- Waiting Card -->
        <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black font-mono text-slate-200 leading-none">
              {{ roadmapSimulation.waitingCount }}
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              {{ locale.currentLang === 'ru' ? 'Ждут фарма' : 'Need farming' }}
            </div>
          </div>
        </div>

        <!-- Completed Card -->
        <div class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-900/60 border border-cyan-700/80 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black font-mono text-cyan-300 leading-none">
              {{ roadmapSimulation.completedCount }}
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              {{ locale.currentLang === 'ru' ? 'Завершено' : 'Completed' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="roadmapSimulation.steps.length === 0"
      class="bg-ark-card border border-ark-border rounded-2xl p-10 text-center space-y-4"
    >
      <div class="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto">
        <Layers class="w-8 h-8" />
      </div>
      <div>
        <h4 class="text-base font-bold text-slate-100">
          {{ locale.currentLang === 'ru' ? 'В дорожной карте пока нет операторов' : 'No operators in roadmap yet' }}
        </h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
          {{
            locale.currentLang === 'ru'
              ? 'Добавьте операторов в план в разделе «Операторы», чтобы выстроить порядок приоритета и отслеживать готовность!'
              : 'Add operators to your plan in the Operators tab to build your queue and track promotion readiness!'
          }}
        </p>
      </div>
      <button
        type="button"
        class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        @click="emit('open-operators')"
      >
        <span>{{ locale.currentLang === 'ru' ? 'Перейти к операторам' : 'Go to Operators' }}</span>
        <span>&rarr;</span>
      </button>
    </div>

    <!-- Step-by-Step Operator Queue Cards -->
    <div v-else class="space-y-3">
      <div
        v-for="(step, index) in roadmapSimulation.steps"
        :key="step.charId"
        class="bg-ark-card border rounded-2xl p-4 sm:p-5 shadow-sm transition-all relative overflow-hidden"
        :class="[
          step.status === 'ready'
            ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/20 to-ark-card'
            : step.status === 'partial'
              ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/15 to-ark-card'
              : step.status === 'completed'
                ? 'border-cyan-500/40 bg-slate-900/40 opacity-75'
                : 'border-ark-border',
        ]"
      >
        <!-- Top Row: Rank & Name & Priority Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ark-border/60">
          <!-- Left: Rank & Avatar & Info -->
          <div class="flex items-center gap-3">
            <!-- Rank Pill -->
            <div
              class="w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center flex-shrink-0 border shadow-inner"
              :class="[
                index === 0
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-amber-500/30'
                  : index === 1
                    ? 'bg-slate-300 text-slate-950 border-slate-200'
                    : index === 2
                      ? 'bg-amber-800 text-amber-100 border-amber-700'
                      : 'bg-slate-900 text-slate-400 border-slate-800',
              ]"
            >
              #{{ step.priorityRank }}
            </div>

            <!-- Avatar -->
            <div class="relative w-12 h-12 rounded-xl overflow-hidden border border-ark-border flex-shrink-0 bg-slate-900">
              <img
                :src="getAvatarUrl(step.charId)"
                :alt="step.operator.name"
                class="w-full h-full object-cover"
                @error="(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER_AVATAR)"
              />
              <span
                class="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl text-[9px] font-bold font-mono"
                :class="step.operator.rarity === 6 ? 'bg-amber-500 text-slate-950' : 'bg-purple-600 text-white'"
              >
                ★{{ step.operator.rarity }}
              </span>
            </div>

            <!-- Name and Current vs Target Level -->
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-100">{{ step.operator.name }}</span>
                <span class="text-[10px] text-slate-400 font-mono">({{ step.operator.appellation }})</span>
              </div>
              <!-- Target Summary -->
              <div class="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>E{{ step.plan.current.elite }} Lv.{{ step.plan.current.level }}</span>
                <span class="text-cyan-400">&rarr;</span>
                <span class="text-cyan-300 font-bold">E{{ step.plan.target.elite }} Lv.{{ step.plan.target.level }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Status Badge & Reorder Buttons -->
          <div class="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <!-- Readiness Status Badge -->
            <div
              class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono border flex items-center gap-1.5"
              :class="[
                step.status === 'ready'
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-sm shadow-emerald-950'
                  : step.status === 'partial'
                    ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
                    : step.status === 'completed'
                      ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400',
              ]"
            >
              <CheckCircle2 v-if="step.status === 'ready'" class="w-3.5 h-3.5 text-emerald-400" />
              <Flame v-else-if="step.status === 'partial'" class="w-3.5 h-3.5 text-amber-400" />
              <Sparkles v-else-if="step.status === 'completed'" class="w-3.5 h-3.5 text-cyan-400" />
              <Layers v-else class="w-3.5 h-3.5 text-slate-500" />

              <span>
                {{
                  step.status === 'ready'
                    ? (locale.currentLang === 'ru' ? '100% Готов к апу!' : '100% Ready!')
                    : step.status === 'completed'
                      ? (locale.currentLang === 'ru' ? 'Завершено' : 'Completed')
                      : `${step.readinessPercentage}% ${locale.currentLang === 'ru' ? 'готовности' : 'ready'}`
                }}
              </span>
            </div>

            <!-- Priority Reorder Buttons -->
            <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-ark-border">
              <button
                type="button"
                class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="index === 0"
                :title="locale.currentLang === 'ru' ? 'В начало очереди (Топ приоритет)' : 'Move to top'"
                @click="setTop(step.charId)"
              >
                <ArrowUpToLine class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="index === 0"
                :title="locale.currentLang === 'ru' ? 'Поднять выше' : 'Move up'"
                @click="moveUp(step.charId)"
              >
                <ArrowUp class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="index === roadmapSimulation.steps.length - 1"
                :title="locale.currentLang === 'ru' ? 'Опустить ниже' : 'Move down'"
                @click="moveDown(step.charId)"
              >
                <ArrowDown class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Middle: Progress Bar & Milestones -->
        <div class="py-3 space-y-3">
          <!-- Readiness Progress Bar -->
          <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="[
                step.status === 'ready'
                  ? 'bg-emerald-400'
                  : step.status === 'partial'
                    ? 'bg-amber-400'
                    : step.status === 'completed'
                      ? 'bg-cyan-400'
                      : 'bg-slate-600',
              ]"
              :style="{ width: `${step.readinessPercentage}%` }"
            ></div>
          </div>

          <!-- Milestones Chips -->
          <div v-if="step.milestones.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="(m, mIdx) in step.milestones"
              :key="mIdx"
              class="text-[10px] font-mono px-2 py-0.5 rounded-lg border flex items-center gap-1.5"
              :class="[
                m.type === 'elite'
                  ? 'bg-purple-950/60 border-purple-800/80 text-purple-300'
                  : m.type === 'skill'
                    ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                    : m.type === 'module'
                      ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300',
              ]"
            >
              <span class="font-bold">{{ m.title }}:</span>
              <span>{{ m.detail }}</span>
            </span>
          </div>

          <!-- Missing Materials Chips (if any) -->
          <div v-if="step.missingItems.length > 0" class="space-y-1.5">
            <div class="text-[11px] text-red-400 font-semibold flex items-center gap-1.5">
              <AlertCircle class="w-3.5 h-3.5" />
              <span>
                {{
                  locale.currentLang === 'ru'
                    ? `Не хватает со склада: ${step.missingItems.length} видов материалов`
                    : `Missing from depot: ${step.missingItems.length} material types`
                }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="item in step.missingItems"
                :key="item.itemId"
                class="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-red-900/60"
              >
                <ItemIcon :item-id="item.itemId" size="sm" />
                <div class="font-mono text-xs">
                  <span class="text-red-400 font-bold">-{{ item.missing }}</span>
                  <span class="text-[10px] text-slate-500"> / {{ item.needed }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- LMD Status -->
          <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <div class="flex items-center gap-1.5">
              <Coins class="w-3.5 h-3.5 text-cyan-400" />
              <span>LMD: <strong class="text-slate-200">{{ step.totalLmdNeeded.toLocaleString() }}</strong></span>
              <span v-if="step.lmdMissing > 0" class="text-red-400 font-bold">(-{{ step.lmdMissing.toLocaleString() }})</span>
              <span v-else class="text-emerald-400 font-bold">✓ {{ locale.currentLang === 'ru' ? 'Хватает' : 'Covered' }}</span>
            </div>

            <div v-if="step.totalExpNeeded > 0">
              EXP: <strong class="text-amber-300">{{ step.totalExpNeeded.toLocaleString() }}</strong>
            </div>
          </div>
        </div>

        <!-- Bottom Actions Row -->
        <div class="pt-3 border-t border-ark-border/60 flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
              @click="openEdit(step.operator)"
            >
              <Wrench class="w-3.5 h-3.5 text-cyan-400" />
              <span>{{ locale.currentLang === 'ru' ? 'Изменить план' : 'Edit Plan' }}</span>
            </button>
            <button
              type="button"
              class="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-all"
              :title="locale.currentLang === 'ru' ? 'Удалить из плана' : 'Remove from plan'"
              @click="remove(step.charId)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Complete Step Button -->
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            :class="[
              step.status === 'ready'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 active:scale-95'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700',
            ]"
            @click="markStepDone(step)"
          >
            <Check class="w-4 h-4" />
            <span>
              {{
                step.status === 'ready'
                  ? (locale.currentLang === 'ru' ? 'Отметить выполненным (Апнуть)' : 'Mark Completed (Promote)')
                  : (locale.currentLang === 'ru' ? 'Принудительно завершить' : 'Force Complete')
              }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Plan Modal -->
    <PlanEditorModal
      v-if="isEditModalOpen && editingOperator"
      :operator="editingOperator"
      :is-open="isEditModalOpen"
      @close="closeEdit"
    />
  </div>
</template>
