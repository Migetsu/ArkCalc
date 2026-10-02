<script setup lang="ts">
import { ref, computed } from 'vue';
import { ARKNIGHTS_EVENTS, type ArknightsEvent } from '@/data/eventsData';
import { useLocaleStore } from '@/stores/locale';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import EventDetailsModal from './EventDetailsModal.vue';
import {
  Calendar,
  ShoppingBag,
  Search,
  Flame,
  Radio,
} from 'lucide-vue-next';

const locale = useLocaleStore();

const searchQuery = ref<string>('');
const categoryFilter = ref<'all' | 'events' | 'banners'>('all');

// Modal state
const isModalOpen = ref<boolean>(false);
const selectedEvent = ref<ArknightsEvent | null>(null);

function openModal(e: ArknightsEvent) {
  selectedEvent.value = e;
  isModalOpen.value = true;
}

const filteredEvents = computed(() => {
  let list = ARKNIGHTS_EVENTS;

  if (categoryFilter.value === 'events') {
    list = list.filter((e) => e.shopItems.length > 0 || e.farmingStages.length > 0);
  } else if (categoryFilter.value === 'banners') {
    list = list.filter((e) => e.type === 'headhunting' && e.shopItems.length === 0);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((e) => {
      const nameEn = e.nameEn.toLowerCase();
      const nameRu = e.nameRu.toLowerCase();
      const nameCn = e.nameCn.toLowerCase();
      const ops6 = e.sixStarOps.map((o) => o.name.toLowerCase()).join(' ');
      const ops5 = e.fiveStarOps.map((o) => o.name.toLowerCase()).join(' ');
      return (
        nameEn.includes(q) ||
        nameRu.includes(q) ||
        nameCn.includes(q) ||
        ops6.includes(q) ||
        ops5.includes(q)
      );
    });
  }

  // Reverse order: oldest at top, newest/most recent at bottom
  return [...list].sort((a, b) => a.cnStartDate.localeCompare(b.cnStartDate));
});

function getHeaderTag(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.headerTagRu;
  return e.headerTagEn;
}

function getPrompt6(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.prompt6Ru || locale.t('events.defaultPrompt6');
  return e.prompt6En || locale.t('events.defaultPrompt6');
}

function getPrompt5(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.prompt5Ru || locale.t('events.defaultPrompt5');
  return e.prompt5En || locale.t('events.defaultPrompt5');
}

function isCombinedPrompt(e: ArknightsEvent): boolean {
  const p6 = (getPrompt6(e) || '').toLowerCase();
  const p5 = (getPrompt5(e) || '').toLowerCase();
  return !p5 || p5 === p6 || p6.includes('and 5★') || p6.includes('и 5★');
}

function handleAvatarError(e: Event) {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = PLACEHOLDER_AVATAR;
  }
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
            {{ locale.currentLang === 'ru' ? 'CN сервер опережает Global (EN/JP/KR) примерно на 5.5 месяцев. Просматривайте активные CN баннеры, предстоящие Global события и хронологию с наградами магазина и оптимальными картами для фарма.' : 'CN server runs ~5.5 months ahead of Global (EN/JP/KR). Preview active CN banners, upcoming Global events, and retrospective timelines with full shop rewards and optimal stage farming rates.' }}
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-slate-300">CN Gap: <strong class="text-white">~5.5 months</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation & Filters Toolbar -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Category Tabs (All / Events with Shops / Headhunting Banners) -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          :class="categoryFilter === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'"
          @click="categoryFilter = 'all'"
        >
          <Flame class="w-3.5 h-3.5 text-amber-300" />
          <span>{{ locale.currentLang === 'ru' ? 'Все' : 'All' }}</span>
          <span class="bg-slate-950/60 font-mono text-[10px] px-1.5 py-0.2 rounded">
            {{ ARKNIGHTS_EVENTS.length }}
          </span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          :class="categoryFilter === 'events' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'"
          @click="categoryFilter = 'events'"
        >
          <ShoppingBag class="w-3.5 h-3.5 text-cyan-300" />
          <span>{{ locale.currentLang === 'ru' ? 'Ивенты с магазином' : 'Events & Shops' }}</span>
          <span class="bg-slate-950/60 font-mono text-[10px] px-1.5 py-0.2 rounded">
            {{ ARKNIGHTS_EVENTS.filter(e => e.shopItems.length > 0).length }}
          </span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          :class="categoryFilter === 'banners' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'"
          @click="categoryFilter = 'banners'"
        >
          <Radio class="w-3.5 h-3.5 text-amber-300" />
          <span>{{ locale.currentLang === 'ru' ? 'Баннеры хедхантинга' : 'Headhunting Banners' }}</span>
          <span class="bg-slate-950/60 font-mono text-[10px] px-1.5 py-0.2 rounded">
            {{ ARKNIGHTS_EVENTS.filter(e => e.type === 'headhunting' && e.shopItems.length === 0).length }}
          </span>
        </button>
      </div>

      <!-- Search Filter -->
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

    <!-- Compact Events & Banners Table (Directly Matching Screenshot Reference) -->
    <div class="border border-slate-800 bg-slate-950/95 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-800">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="hover:bg-slate-900/50 transition-colors"
      >
        <div class="flex flex-col md:flex-row items-stretch">
          <!-- Left Column: Cyan Tag Bar + Banner Art + Date + Shop Pill -->
          <div class="w-full md:w-[350px] lg:w-[390px] xl:w-[410px] flex-shrink-0 md:border-r border-b md:border-b-0 border-slate-800 flex flex-col justify-between p-2 sm:p-2.5 bg-slate-950/80">
            <div>
              <!-- Bright Cyan Header Bar -->
              <div class="bg-[#00c0fa] text-slate-950 font-bold text-xs sm:text-[13px] py-1 px-2.5 text-center tracking-tight leading-snug">
                {{ getHeaderTag(event) }}
              </div>

              <!-- Banner Poster Image -->
              <div
                class="relative aspect-[3.25/1] w-full bg-slate-900 overflow-hidden cursor-pointer group/poster"
                title="Click to view details, shop & farming stages"
                @click="openModal(event)"
              >
                <img
                  :src="event.bannerPosterUrl"
                  :alt="event.nameEn"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover/poster:opacity-90 transition-opacity"
                />
              </div>

              <!-- Compact CN Date Line -->
              <div class="text-center pt-1.5 pb-0.5 px-1 text-xs font-mono font-bold text-slate-100 flex flex-wrap items-center justify-center gap-x-2">
                <span>
                  CN date: <span class="text-white font-extrabold">{{ event.cnStartDate }} – {{ event.cnEndDate }}</span>
                </span>
                <span v-if="event.globalEstimatedArrival" class="text-[11px] text-cyan-300 font-normal">
                  (Global: {{ event.globalEstimatedArrival }})
                </span>
              </div>

              <!-- Compact Shop Items / Farm Stages Pill (if event has shop items) -->
              <div
                v-if="event.shopItems.length > 0 || event.farmingStages.length > 0"
                class="pt-1 flex items-center justify-center gap-1.5"
              >
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 hover:bg-cyan-900/80 transition-colors shadow-sm"
                  @click="openModal(event)"
                >
                  <ShoppingBag class="w-3 h-3 text-cyan-400" />
                  <span>{{ locale.currentLang === 'ru' ? `Магазин: ${event.shopItems.length}` : `Shop: ${event.shopItems.length}` }}</span>
                  <span v-if="event.farmingStages.length > 0">&bull; {{ locale.currentLang === 'ru' ? `Фарм: ${event.farmingStages.length}` : `Farm: ${event.farmingStages.length}` }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Operator Avatars & Prompts Matching Screenshot -->
          <div class="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center space-y-2.5 text-center">
            <!-- Mode A: Combined Prompt (e.g. Joint Operation: "Only the following 6★ and 5★ Operators...") -->
            <template v-if="isCombinedPrompt(event)">
              <p class="text-xs sm:text-[13px] font-medium text-slate-200 leading-tight">
                {{ getPrompt6(event) }}
              </p>
              
              <!-- Row 1: 6★ Operators -->
              <div v-if="event.sixStarOps.length > 0" class="flex flex-wrap items-center justify-center gap-2">
                <div
                  v-for="op in event.sixStarOps"
                  :key="op.charId"
                  class="relative w-11 h-11 sm:w-12 sm:h-12 md:w-[48px] md:h-[48px] flex-shrink-0 bg-slate-900 overflow-hidden border-b-4 border-amber-400 shadow cursor-pointer group/op hover:scale-105 transition-transform"
                  :title="op.name"
                  @click="openModal(event)"
                >
                  <img
                    :src="op.avatarUrl || getAvatarUrl(op.charId)"
                    :alt="op.name"
                    loading="lazy"
                    class="w-full h-full object-cover"
                    @error="handleAvatarError"
                  />
                  <div class="absolute inset-x-0 bottom-0 bg-slate-950/85 text-[8px] text-amber-300 text-center font-bold truncate opacity-0 group-hover/op:opacity-100 transition-opacity px-0.5">
                    {{ op.name }}
                  </div>
                </div>
              </div>

              <!-- Row 2: 5★ Operators -->
              <div v-if="event.fiveStarOps.length > 0" class="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                <div
                  v-for="op in event.fiveStarOps"
                  :key="op.charId"
                  class="relative w-11 h-11 sm:w-12 sm:h-12 md:w-[48px] md:h-[48px] flex-shrink-0 bg-slate-900 overflow-hidden border-b-4 border-yellow-200/90 shadow cursor-pointer group/op hover:scale-105 transition-transform"
                  :title="op.name"
                  @click="openModal(event)"
                >
                  <img
                    :src="op.avatarUrl || getAvatarUrl(op.charId)"
                    :alt="op.name"
                    loading="lazy"
                    class="w-full h-full object-cover"
                    @error="handleAvatarError"
                  />
                  <div class="absolute inset-x-0 bottom-0 bg-slate-950/85 text-[8px] text-amber-200 text-center font-bold truncate opacity-0 group-hover/op:opacity-100 transition-opacity px-0.5">
                    {{ op.name }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Mode B: Distinct 6★ and 5★ Prompts (e.g. Orienteering #8) -->
            <template v-else>
              <!-- 6★ Section -->
              <div v-if="event.sixStarOps.length > 0" class="space-y-1.5">
                <p class="text-xs sm:text-[13px] font-medium text-slate-200 leading-tight">
                  {{ getPrompt6(event) }}
                </p>
                <div class="flex flex-wrap items-center justify-center gap-2">
                  <div
                    v-for="op in event.sixStarOps"
                    :key="op.charId"
                    class="relative w-11 h-11 sm:w-12 sm:h-12 md:w-[48px] md:h-[48px] flex-shrink-0 bg-slate-900 overflow-hidden border-b-4 border-amber-400 shadow cursor-pointer group/op hover:scale-105 transition-transform"
                    :title="op.name"
                    @click="openModal(event)"
                  >
                    <img
                      :src="op.avatarUrl || getAvatarUrl(op.charId)"
                      :alt="op.name"
                      loading="lazy"
                      class="w-full h-full object-cover"
                      @error="handleAvatarError"
                    />
                    <div class="absolute inset-x-0 bottom-0 bg-slate-950/85 text-[8px] text-amber-300 text-center font-bold truncate opacity-0 group-hover/op:opacity-100 transition-opacity px-0.5">
                      {{ op.name }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5★ Section -->
              <div v-if="event.fiveStarOps.length > 0" class="space-y-1.5 pt-1">
                <p class="text-xs sm:text-[13px] font-medium text-slate-200 leading-tight">
                  {{ getPrompt5(event) }}
                </p>
                <div class="flex flex-wrap items-center justify-center gap-2">
                  <div
                    v-for="op in event.fiveStarOps"
                    :key="op.charId"
                    class="relative w-11 h-11 sm:w-12 sm:h-12 md:w-[48px] md:h-[48px] flex-shrink-0 bg-slate-900 overflow-hidden border-b-4 border-yellow-200/90 shadow cursor-pointer group/op hover:scale-105 transition-transform"
                    :title="op.name"
                    @click="openModal(event)"
                  >
                    <img
                      :src="op.avatarUrl || getAvatarUrl(op.charId)"
                      :alt="op.name"
                      loading="lazy"
                      class="w-full h-full object-cover"
                      @error="handleAvatarError"
                    />
                    <div class="absolute inset-x-0 bottom-0 bg-slate-950/85 text-[8px] text-amber-200 text-center font-bold truncate opacity-0 group-hover/op:opacity-100 transition-opacity px-0.5">
                      {{ op.name }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Results State -->
    <div
      v-if="filteredEvents.length === 0"
      class="bg-ark-card border border-ark-border rounded-xl p-8 text-center text-slate-400 text-xs"
    >
      {{ locale.currentLang === 'ru' ? 'События или баннеры по вашему запросу не найдены.' : 'No events or banners match your search filter.' }}
    </div>

    <!-- Event Details Modal (Shop Supplies & Farm Stages) -->
    <EventDetailsModal
      :event="selectedEvent"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>
