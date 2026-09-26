<script setup lang="ts">
import { computed } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import ItemIcon from '@/components/common/ItemIcon.vue';
import { Hammer, Coins, ArrowRight, CheckCircle2 } from 'lucide-vue-next';

const planner = usePlannerStore();
const gameData = useGameDataStore();

const calc = computed(() => planner.calculationResult);
const craftingSteps = computed(() => calc.value.craftingSteps);
</script>

<template>
  <div class="space-y-4">
    <!-- Header banner -->
    <div class="p-4 bg-ark-card rounded-2xl border border-ark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
          <Hammer class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-sm text-slate-100">Рецепты мастерской (Workshop)</h3>
          <p class="text-xs text-slate-400">
            Разложение дефицитных материалов и расчет затрат LMD на производство
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-ark-border">
        <Coins class="w-4 h-4 text-cyan-400" />
        <span class="text-xs text-slate-400">LMD на крафт:</span>
        <span class="text-sm font-mono font-bold text-cyan-300">
          {{ calc.totalLmdCraft.toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- Crafting Steps List -->
    <div v-if="craftingSteps.length === 0" class="p-12 text-center bg-ark-card rounded-2xl border border-ark-border text-slate-400">
      <CheckCircle2 class="w-12 h-12 mx-auto text-emerald-400 mb-2" />
      <h4 class="font-bold text-slate-200 text-base">Крафт в мастерской не требуется!</h4>
      <p class="text-xs mt-1">Все необходимые высокоуровневые материалы уже есть на складе либо не запланированы.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="step in craftingSteps"
        :key="step.itemId"
        class="bg-ark-card border border-ark-border rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors"
      >
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <!-- Crafted Target Item -->
          <div class="flex items-center gap-3 min-w-[220px]">
            <ItemIcon :item-id="step.itemId" size="lg" :count="step.countToCraft" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-100">
                  {{ gameData.getItem(step.itemId)?.name || step.itemId }}
                </span>
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  {{ step.countToCraft }} шт.
                </span>
              </div>
              <div class="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-1">
                <Coins class="w-3 h-3 text-cyan-400" />
                <span>{{ step.goldCost.toLocaleString() }} LMD</span>
              </div>
            </div>
          </div>

          <!-- Arrow separator -->
          <div class="hidden md:flex items-center text-slate-600">
            <ArrowRight class="w-5 h-5" />
          </div>

          <!-- Ingredients List -->
          <div class="flex-1 w-full md:w-auto">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ингредиенты рецепта:
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div
                v-for="ing in step.ingredients"
                :key="ing.itemId"
                class="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <ItemIcon :item-id="ing.itemId" size="sm" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-medium text-slate-200 truncate">
                    {{ gameData.getItem(ing.itemId)?.name || ing.itemId }}
                  </div>
                  <div class="text-[10px] font-mono flex items-center gap-2 mt-0.5">
                    <span class="text-slate-400">Нужно: {{ ing.totalNeeded }}</span>
                    <span v-if="ing.usedFromStock > 0" class="text-emerald-400">
                      Склад: {{ ing.usedFromStock }}
                    </span>
                    <span v-if="ing.missingToCraftOrFarm > 0" class="text-red-400 font-bold">
                      Дефицит: -{{ ing.missingToCraftOrFarm }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
