<script setup lang="ts">
import { ref, computed } from 'vue';
import { ARKNIGHTS_EVENTS, type ArknightsEvent } from '@/data/eventsData';
import { useLocaleStore } from '@/stores/locale';
import ItemIcon from '@/components/common/ItemIcon.vue';
import {
  Calendar,
  Sparkles,
  Zap,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Search,
  Flame,
  Layers,
} from 'lucide-vue-next';

const locale = useLocaleStore();

const activeTab = ref<'cn' | 'global' | 'all'>('cn');
const typeFilter = ref<string>('all');
const searchQuery = ref<string>('');

// Track which events have their shop supplies factored into calculator
const appliedEvents = ref<Set<string>>(new Set(['act38side_lappland']));

function toggleEventInCalculator(eventId: string) {
  if (appliedEvents.value.has(eventId)) {
    appliedEvents.value.delete(eventId);
  } else {
    appliedEvents.value.add(eventId);
  }
}

const filteredEvents = computed(() => {
  let list = ARKNIGHTS_EVENTS;

  if (activeTab.value === 'cn') {
    list = list.filter((e) => e.status === 'cn_active' || e.status === 'upcoming_global');
  } else if (activeTab.value === 'global') {
    list = list.filter((e) => e.status === 'upcoming_global' || e.status === 'past_cn_6m');
  }

  if (typeFilter.value !== 'all') {
    list = list.filter((e) => e.type === typeFilter.value);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((e) => {
      const nameEn = e.nameEn.toLowerCase();
      const nameRu = e.nameRu.toLowerCase();
      const nameCn = e.nameCn.toLowerCase();
      const ops = e.featuredOperators.map((o) => o.name.toLowerCase()).join(' ');
      return nameEn.includes(q) || nameRu.includes(q) || nameCn.includes(q) || ops.includes(q);
    });
  }

  return list;
});

function getEventName(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.nameRu;
  if (locale.currentLang === 'cn') return e.nameCn;
  return e.nameEn;
}

function getEventSummary(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.summaryRu;
  if (locale.currentLang === 'cn') return e.summaryCn;
  return e.summaryEn;
}

function getStatusBadge(e: ArknightsEvent) {
  if (e.status === 'cn_active') {
    return {
      label: locale.t('events.activeNow'),
      classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-800 animate-pulse',
      isPulse: true,
    };
  }
  if (e.status === 'upcoming_global') {
    return {
      label: locale.t('events.comingSoon'),
      classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
      isPulse: false,
    };
  }
  return {
    label: locale.t('events.past6m'),
    classes: 'bg-slate-800 text-slate-400 border-slate-700',
    isPulse: false,
  };
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header banner -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Calendar class="w-4 h-4" />
            <span>{{ locale.t('events.title') }}</span>
          </div>
          <h2 class="text-xl md:text-2xl font-black text-slate-100 tracking-tight mt-1">
            {{ locale.t('events.subtitle') }}
          </h2>
          <p class="text-xs text-slate-400 mt-1 max-w-2xl">
            CN сервер опережает глобал (EN/JP/KR) примерно на 5–6 месяцев. Здесь вы можете видеть текущие события на CN, а также ивенты за последние полгода, которые скоро придут на глобал, с полным списком ресурсов из магазинов и лучшими картами для фарма!
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-slate-300">CN Разрыв: <strong>~5.5 месяцев</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation & Filters Toolbar -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Tabs -->
      <div class="inline-flex bg-slate-950 p-1 rounded-xl border border-ark-border text-xs font-semibold overflow-x-auto max-w-full">
        <button
          type="button"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
          :class="[activeTab === 'cn' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'cn'"
        >
          <Flame class="w-4 h-4 text-amber-400" />
          <span>{{ locale.t('events.tabCn') }}</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
          :class="[activeTab === 'global' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'global'"
        >
          <Clock class="w-4 h-4 text-cyan-400" />
          <span>{{ locale.t('events.tabGlobal') }}</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
          :class="[activeTab === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
          @click="activeTab = 'all'"
        >
          <Layers class="w-4 h-4" />
          <span>{{ locale.t('common.all') }} ({{ ARKNIGHTS_EVENTS.length }})</span>
        </button>
      </div>

      <!-- Search & Category Filters -->
      <div class="flex items-center gap-2 flex-1 md:max-w-xs">
        <div class="relative w-full">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="locale.t('common.search')"
            class="w-full bg-slate-900 border border-ark-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
          />
        </div>
      </div>
    </div>

    <!-- Events List Grid -->
    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="bg-ark-card border border-ark-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-all"
      >
        <!-- Top bar of Event Card -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-ark-border/60">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5"
              :class="getStatusBadge(event).classes"
            >
              <span v-if="getStatusBadge(event).isPulse" class="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              {{ getStatusBadge(event).label }}
            </span>

            <span class="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {{ event.type === 'celebration' ? 'Anniversary' : event.type === 'rerun' ? 'Rerun' : 'Side Story' }}
            </span>
          </div>

          <div class="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>CN: <strong class="text-slate-200">{{ event.cnStartDate }}</strong></span>
            <span v-if="event.globalEstimatedArrival" class="text-cyan-300">
              EN: <strong>{{ event.globalEstimatedArrival }}</strong>
            </span>
          </div>
        </div>

        <!-- Event Main Title & Description -->
        <div>
          <h3 class="text-lg md:text-xl font-black text-slate-100 tracking-tight">
            {{ getEventName(event) }}
          </h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            {{ getEventSummary(event) }}
          </p>
        </div>

        <!-- Featured Operators Section -->
        <div class="bg-slate-900/60 rounded-xl p-3 border border-ark-border/80">
          <div class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-amber-400" />
            <span>{{ locale.t('events.featuredOps') }}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="op in event.featuredOperators"
              :key="op.name"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-slate-950/80"
              :class="[
                op.role === 'limited'
                  ? 'border-amber-500/50 text-amber-300'
                  : op.role === 'welfare'
                  ? 'border-cyan-500/50 text-cyan-300'
                  : 'border-slate-700 text-slate-200'
              ]"
            >
              <div class="flex items-center gap-1 font-bold text-xs">
                <span>{{ op.name }}</span>
                <span class="text-[10px] text-amber-400">★{{ op.rarity }}</span>
              </div>
              <span
                class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-black"
                :class="[
                  op.role === 'limited'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : op.role === 'welfare'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                ]"
              >
                {{ op.role === 'limited' ? 'Limited' : op.role === 'welfare' ? 'Free Welfare' : 'Standard' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dual Column: Event Shop & Farming Stages -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Event Shop Supplies -->
          <div class="bg-slate-900/50 rounded-xl p-3.5 border border-ark-border/60 flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag class="w-3.5 h-3.5 text-cyan-400" />
                  <span>{{ locale.t('events.eventShop') }}</span>
                </div>
                <span class="text-[10px] font-mono text-slate-400">
                  {{ event.shopItems.length }} позиций
                </span>
              </div>

              <!-- Shop items preview -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div
                  v-for="item in event.shopItems.slice(0, 6)"
                  :key="item.itemId"
                  class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono"
                >
                  <ItemIcon :item-id="item.itemId" size="sm" :count="item.count" />
                  <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-bold text-slate-200 truncate">
                      {{ locale.currentLang === 'ru' ? item.nameRu : locale.currentLang === 'cn' ? item.nameCn : item.nameEn }}
                    </div>
                    <div class="text-[10px] text-cyan-400 font-bold">
                      x{{ item.count.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Apply to calculator toggle -->
            <button
              type="button"
              class="w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2"
              :class="[
                appliedEvents.has(event.id)
                  ? 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              ]"
              @click="toggleEventInCalculator(event.id)"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>
                {{ appliedEvents.has(event.id) ? locale.t('events.appliedToCalc') : locale.t('events.applyToCalc') }}
              </span>
            </button>
          </div>

          <!-- Farming Stages -->
          <div class="bg-slate-900/50 rounded-xl p-3.5 border border-ark-border/60">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap class="w-3.5 h-3.5 text-amber-400" />
                <span>{{ locale.t('events.farmingStages') }}</span>
              </div>
              <span class="text-[10px] font-mono text-amber-400 font-bold">
                Топ дроп-рейт
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="stg in event.farmingStages"
                :key="stg.stageCode"
                class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono"
              >
                <div class="flex items-center gap-2.5">
                  <span class="font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded text-xs">
                    {{ stg.stageCode }}
                  </span>
                  <ItemIcon :item-id="stg.itemId" size="sm" />
                  <span class="text-slate-200 font-medium">
                    {{ locale.currentLang === 'ru' ? stg.itemNameRu : stg.itemNameEn }}
                  </span>
                </div>

                <div class="flex items-center gap-3 text-right">
                  <div class="text-[11px] text-slate-400">
                    {{ locale.t('events.dropRate') }}: <strong class="text-emerald-400">{{ stg.dropRatePercent }}%</strong>
                  </div>
                  <div class="text-[11px] text-amber-400 font-bold">
                    ~{{ stg.sanityPerItem }}⚡
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
