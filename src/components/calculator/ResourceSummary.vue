<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import ItemIcon from '@/components/common/ItemIcon.vue';
import CraftingTree from './CraftingTree.vue';
import {
  Coins,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle,
  TrendingDown,
  Hammer,
} from 'lucide-vue-next';

const planner = usePlannerStore();
const gameData = useGameDataStore();
const inventory = useInventoryStore();

const activeTab = ref<'direct' | 'farm' | 'craftingTree'>('direct');

const calc = computed(() => planner.calculationResult);

// Battle records breakdown for total EXP
const expStrategicRecords = computed(() => Math.ceil(calc.value.totalExp / 2000));
const expTacticalRecords = computed(() => Math.ceil(calc.value.totalExp / 1000));

// Deficit count stats
const totalDeficitItemsCount = computed(() => {
  return calc.value.directDeficit.filter((d) => d.deficit > 0).length;
});

const totalItemsReadyCount = computed(() => {
  return calc.value.directDeficit.filter((d) => d.deficit === 0).length;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Total LMD Card -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Coins class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Всего LMD</span>
          </div>
          <span class="text-xs font-mono font-medium text-slate-400">
            На складе: {{ (inventory.getStock('4001') || 0).toLocaleString() }}
          </span>
        </div>

        <div class="my-3">
          <div class="text-2xl font-black font-mono tracking-tight text-cyan-400">
            {{ calc.totalLmd.toLocaleString() }}
          </div>
          <!-- LMD breakdown -->
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>Уровни: <strong class="text-slate-200">{{ calc.totalLmdLevel.toLocaleString() }}</strong></span>
            <span>Элита: <strong class="text-slate-200">{{ calc.totalLmdEvolve.toLocaleString() }}</strong></span>
            <span>Крафт: <strong class="text-slate-200">{{ calc.totalLmdCraft.toLocaleString() }}</strong></span>
          </div>
        </div>

        <!-- Deficit indicator for LMD -->
        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center">
          <span class="text-slate-400">Дефицит LMD:</span>
          <span
            v-if="calc.totalLmd > (inventory.getStock('4001') || 0)"
            class="font-mono font-bold text-red-400"
          >
            -{{ (calc.totalLmd - (inventory.getStock('4001') || 0)).toLocaleString() }}
          </span>
          <span v-else class="font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5" /> В наличии
          </span>
        </div>
      </div>

      <!-- Total EXP Card -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
              <Sparkles class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Всего EXP</span>
          </div>
        </div>

        <div class="my-3">
          <div class="text-2xl font-black font-mono tracking-tight text-amber-400">
            {{ calc.totalExp.toLocaleString() }}
          </div>
          <!-- Battle records equivalent -->
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>Золотые книги (T4): <strong class="text-amber-300">{{ expStrategicRecords }} шт.</strong></span>
            <span>Синие книги (T3): <strong class="text-sky-300">{{ expTacticalRecords }} шт.</strong></span>
          </div>
        </div>

        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center text-slate-400">
          <span>На основе боевых записей</span>
          <span class="text-slate-200 font-mono text-[11px] font-semibold">2,000 EXP / T4</span>
        </div>
      </div>

      <!-- Materials Summary Card -->
      <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400">
              <Layers class="w-4 h-4" />
            </div>
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Материалы и дефицит</span>
          </div>
          <span class="text-xs font-mono text-slate-400">
            Видов: {{ calc.directDeficit.length }}
          </span>
        </div>

        <div class="my-3 flex items-baseline gap-3">
          <div class="text-2xl font-black font-mono tracking-tight text-red-400">
            {{ totalDeficitItemsCount }}
            <span class="text-xs font-normal text-slate-400 ml-1">в дефиците</span>
          </div>
          <div class="text-sm font-bold font-mono text-emerald-400">
            {{ totalItemsReadyCount }}
            <span class="text-xs font-normal text-slate-400 ml-0.5">готово</span>
          </div>
        </div>

        <div class="pt-2 border-t border-ark-border/60 text-xs flex justify-between items-center text-slate-400">
          <span>Оперативников в плане:</span>
          <span class="text-cyan-400 font-mono font-bold">{{ planner.planCount }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs for Calculator Views -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-ark-border pb-3">
      <div class="inline-flex bg-ark-card p-1 rounded-xl border border-ark-border text-xs font-semibold">
        <button
          type="button"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          :class="[activeTab === 'direct' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'direct'"
        >
          <TrendingDown class="w-4 h-4" />
          Прямой дефицит ({{ totalDeficitItemsCount }})
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          :class="[activeTab === 'farm' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'farm'"
        >
          <Layers class="w-4 h-4" />
          План фарма (с учетом крафта)
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          :class="[activeTab === 'craftingTree' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'craftingTree'"
        >
          <Hammer class="w-4 h-4" />
          Дерево крафта мастерской ({{ calc.craftingSteps.length }})
        </button>
      </div>

      <div class="text-xs text-slate-400 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
        Красный цвет: требуется получить/скрафтить
      </div>
    </div>

    <!-- TAB 1: DIRECT DEFICIT LIST -->
    <div v-if="activeTab === 'direct'" class="space-y-4">
      <div v-if="calc.directDeficit.length === 0" class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
        <CheckCircle class="w-12 h-12 mx-auto text-emerald-400 mb-2" />
        <h4 class="font-bold text-slate-200 text-base">Планы не настроены или все ресурсы собраны!</h4>
        <p class="text-xs mt-1">Добавьте оперативников во вкладке «Оперативники» для расчета необходимых ресурсов.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="item in calc.directDeficit"
          :key="item.itemId"
          class="bg-ark-card border rounded-xl p-3 flex items-center gap-3 transition-all shadow-sm"
          :class="[
            item.deficit > 0
              ? 'border-red-500/50 bg-red-950/15 shadow-red-950/20'
              : 'border-ark-border hover:border-slate-600',
          ]"
        >
          <ItemIcon
            :item-id="item.itemId"
            size="lg"
            :deficit="item.deficit > 0 ? item.deficit : undefined"
          />

          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs text-slate-200 truncate" :title="gameData.getItem(item.itemId)?.name || item.itemId">
              {{ gameData.getItem(item.itemId)?.name || item.itemId }}
            </h4>

            <div class="mt-1 space-y-0.5 text-[11px] font-mono">
              <div class="flex items-center justify-between text-slate-400">
                <span>Нужно:</span>
                <span class="font-semibold text-slate-200">{{ item.needed }}</span>
              </div>
              <div class="flex items-center justify-between text-slate-400">
                <span>Склад:</span>
                <span class="font-semibold text-slate-300">{{ item.stock }}</span>
              </div>
              <div
                class="flex items-center justify-between pt-0.5 border-t border-ark-border/60"
                :class="item.deficit > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'"
              >
                <span>Дефицит:</span>
                <span>{{ item.deficit > 0 ? `-${item.deficit}` : '0' }}</span>
              </div>
            </div>

            <!-- Craftable badge -->
            <div v-if="item.craftable" class="mt-1 text-[10px] text-cyan-400 flex items-center gap-1 font-sans">
              <Wrench class="w-3 h-3" /> Можно скрафтить
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: FARM REQUIREMENTS (RESOLVED WITH CRAFTING) -->
    <div v-else-if="activeTab === 'farm'" class="space-y-4">
      <div class="p-4 bg-slate-900/80 rounded-xl border border-ark-border text-xs text-slate-300 flex items-start gap-3">
        <Wrench class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong class="text-cyan-300">План фарма базовых компонентов:</strong>
          Калькулятор разложил сложные T4/T5 материалы на составляющие рецептов мастерской с учетом ваших складских запасов. Ниже показаны предметы, которые необходимо непосредственно получить на этапах.
        </div>
      </div>

      <div v-if="calc.farmRequirements.length === 0" class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
        <CheckCircle class="w-12 h-12 mx-auto text-emerald-400 mb-2" />
        <h4 class="font-bold text-slate-200 text-base">Фарм базовых компонентов не требуется!</h4>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="farm in calc.farmRequirements"
          :key="farm.itemId"
          class="bg-ark-card border border-red-500/40 bg-red-950/10 rounded-xl p-3 flex items-center gap-3 shadow-sm"
        >
          <ItemIcon
            :item-id="farm.itemId"
            size="lg"
            :count="farm.count"
          />

          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs text-slate-200 truncate" :title="gameData.getItem(farm.itemId)?.name || farm.itemId">
              {{ gameData.getItem(farm.itemId)?.name || farm.itemId }}
            </h4>
            <div class="mt-1 text-xs font-mono">
              <span class="text-slate-400">Фармить: </span>
              <strong class="text-red-400 text-sm font-bold">{{ farm.count }} шт.</strong>
            </div>
            <div class="text-[10px] text-slate-500 font-mono">
              Склад: {{ inventory.getStock(farm.itemId) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: CRAFTING TREE -->
    <div v-else-if="activeTab === 'craftingTree'">
      <CraftingTree />
    </div>
  </div>
</template>
