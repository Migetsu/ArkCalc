<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import ItemIcon from '@/components/common/ItemIcon.vue';
import {
  getAllStagesForMaterial,
  getRecommendedStage,
  type StageDropRecommendation,
} from '@/services/penguinStatsService';
import { X, ExternalLink, Zap, AlertCircle, Hammer, ArrowLeft } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  itemId: string | null;
  neededCount?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const gameData = useGameDataStore();
const inventory = useInventoryStore();

const currentItemId = ref<string | null>(props.itemId);
const currentNeededCount = ref<number>(props.neededCount || 0);
const history = ref<string[]>([]);

watch(
  () => props.itemId,
  (newId) => {
    currentItemId.value = newId;
    currentNeededCount.value = props.neededCount || 0;
    history.value = [];
  }
);

watch(
  () => props.neededCount,
  (newCount) => {
    currentNeededCount.value = newCount || 0;
  }
);

const item = computed(() => {
  if (!currentItemId.value) return null;
  return gameData.getItem(currentItemId.value);
});

const recipe = computed(() => {
  if (!currentItemId.value) return null;
  return gameData.getRecipe(currentItemId.value);
});

const stages = computed<StageDropRecommendation[]>(() => {
  if (!currentItemId.value) return [];
  return getAllStagesForMaterial(currentItemId.value);
});

function calculateRuns(dropRate: number): number {
  if (!currentNeededCount.value || currentNeededCount.value <= 0) return 0;
  const rate = Math.max(0.01, dropRate / 100);
  return Math.ceil(currentNeededCount.value / rate);
}

function calculateTotalSanity(runs: number, apCost: number): number {
  return runs * apCost;
}

function getTagBadgeClass(tag: string): string {
  switch (tag) {
    case 'Best Sanity':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    case 'Highest Rate':
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
    case 'Best Byproducts':
      return 'bg-amber-950/80 text-amber-300 border-amber-800';
    case 'Craft':
      return 'bg-purple-950/80 text-purple-300 border-purple-800';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

function navigateToIngredient(ingId: string, count: number) {
  if (currentItemId.value) {
    history.value.push(currentItemId.value);
  }
  currentItemId.value = ingId;
  currentNeededCount.value = count;
}

function goBack() {
  if (history.value.length > 0) {
    const prev = history.value.pop()!;
    currentItemId.value = prev;
  }
}
</script>

<template>
  <div
    v-if="isOpen && currentItemId && item"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="bg-ark-darker border border-ark-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
    >
      <!-- Header -->
      <div class="px-5 py-4 bg-ark-card border-b border-ark-border flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button
            v-if="history.length > 0"
            type="button"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Назад"
            @click="goBack"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <ItemIcon :item-id="currentItemId" size="lg" />
          <div class="min-w-0">
            <h3 class="font-extrabold text-sm sm:text-base text-slate-100 truncate">
              {{ item.name }}
            </h3>
            <p class="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Рекомендации по фарму и крафту</span>
              &bull;
              <span class="text-cyan-400 font-bold">Penguin Statistics</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Plan requirement highlight -->
      <div
        v-if="currentNeededCount > 0"
        class="px-5 py-2.5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border-b border-ark-border flex items-center justify-between text-xs"
      >
        <span class="text-slate-300">Требуется для вашего плана:</span>
        <div class="flex items-center gap-2">
          <span class="font-mono text-slate-400">Склад: {{ inventory.getStock(currentItemId) }}</span>
          <span class="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
            {{ currentNeededCount }} шт.
          </span>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-5 space-y-4 overflow-y-auto flex-1 text-xs">

        <!-- Workshop Crafting Recipe Section (if craftable) -->
        <div v-if="recipe" class="p-4 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Hammer class="w-4 h-4" />
              <span>Синтез в Мастерской (Крафт)</span>
            </div>
            <span class="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              Выход: {{ recipe.count || 1 }} шт.
            </span>
          </div>

          <p class="text-slate-300 leading-relaxed text-[11px]">
            Высокоуровневые материалы в Arknights создаются в Мастерской. Фармите базовые компоненты на лучших стадиях ниже:
          </p>

          <!-- Ingredients list -->
          <div class="space-y-2 pt-1">
            <div
              v-for="cost in recipe.costs"
              :key="cost.id"
              class="p-2.5 rounded-lg bg-ark-card border border-ark-border flex items-center justify-between gap-2 hover:border-cyan-500/40 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <ItemIcon :item-id="cost.id" size="sm" />
                <div class="min-w-0">
                  <div class="text-xs font-semibold text-slate-100 truncate">
                    {{ gameData.getItem(cost.id)?.name || cost.id }}
                  </div>
                  <div class="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>На 1 крафт: <strong class="text-slate-200">{{ cost.count }}</strong></span>
                    <span v-if="currentNeededCount > 0" class="text-amber-300">
                      Всего: <strong>{{ Math.ceil((cost.count * currentNeededCount) / (recipe.count || 1)) }} шт.</strong>
                    </span>
                    <span class="text-slate-500">(склад: {{ inventory.getStock(cost.id) }})</span>
                  </div>
                </div>
              </div>

              <!-- Recommendation badge for this ingredient -->
              <div class="flex-shrink-0 text-right">
                <div v-if="getRecommendedStage(cost.id)">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 hover:text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
                    title="Посмотреть статистику этой карты"
                    @click="navigateToIngredient(cost.id, Math.ceil((cost.count * (currentNeededCount || 1)) / (recipe.count || 1)))"
                  >
                    <span>Фарм: {{ getRecommendedStage(cost.id)?.stageCode }}</span>
                    <span class="text-[10px] text-amber-400">~{{ getRecommendedStage(cost.id)?.sanityPerItem }}⚡</span>
                  </button>
                </div>
                <div v-else-if="gameData.getRecipe(cost.id)">
                  <button
                    type="button"
                    class="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 text-[10px] font-semibold"
                    @click="navigateToIngredient(cost.id, Math.ceil((cost.count * (currentNeededCount || 1)) / (recipe.count || 1)))"
                  >
                    Крафт из T3
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct Stage Drops (if available) -->
        <div v-if="stages.filter(s => !s.isCraft).length > 0" class="space-y-3">
          <div class="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Zap class="w-4 h-4 text-amber-400" />
            <span>Прямой фарм на картах (Penguin Statistics):</span>
          </div>

          <div
            v-for="st in stages.filter(s => !s.isCraft)"
            :key="st.stageCode"
            class="p-3.5 bg-ark-card rounded-xl border border-ark-border hover:border-cyan-500/50 transition-all space-y-2.5 relative"
          >
            <!-- Stage Row & Tag -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-base font-black font-mono text-cyan-400 tracking-tight">
                  {{ st.stageCode }}
                </span>
                <span
                  class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                  :class="getTagBadgeClass(st.tag)"
                >
                  {{ st.tagRu || st.tag }}
                </span>
              </div>

              <!-- AP Cost Badge -->
              <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                <Zap class="w-3.5 h-3.5 text-amber-400" />
                {{ st.apCost }} Sanity / заход
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div class="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Шанс дропа</span>
                <span class="font-bold text-slate-200">{{ st.dropRate }}%</span>
              </div>

              <div class="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Затраты на 1 шт.</span>
                <span class="font-bold text-emerald-400">~{{ st.sanityPerItem }} ⚡</span>
              </div>

              <div v-if="currentNeededCount > 0" class="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Заходов для плана</span>
                <span class="font-bold text-cyan-300">~{{ calculateRuns(st.dropRate) }}</span>
              </div>

              <div v-if="currentNeededCount > 0" class="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Sanity для плана</span>
                <span class="font-bold text-amber-400">
                  ~{{ calculateTotalSanity(calculateRuns(st.dropRate), st.apCost) }} ⚡
                </span>
              </div>
            </div>

            <!-- Notes -->
            <p v-if="st.notes" class="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
              {{ st.notes }}
            </p>
          </div>
        </div>

        <!-- If no direct stages and no recipe -->
        <div v-else-if="!recipe" class="p-8 text-center text-slate-400 bg-ark-card rounded-xl border border-ark-border">
          <AlertCircle class="w-10 h-10 mx-auto text-amber-400 mb-2 opacity-80" />
          <p class="text-sm font-semibold text-slate-200">Прямой фарм на обычных картах отсутствует</p>
          <p class="text-xs mt-1 text-slate-400">
            Этот ресурс можно получить в магазине за сертификаты или в качестве наград за временные события.
          </p>
        </div>
      </div>

      <!-- Footer with External Link -->
      <div class="px-5 py-3 bg-ark-card border-t border-ark-border flex items-center justify-between text-xs">
        <a
          :href="`https://penguin-stats.io/result/item/${currentItemId}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
        >
          <span>Статистика на Penguin Stats</span>
          <ExternalLink class="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          @click="emit('close')"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
